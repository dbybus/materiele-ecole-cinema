import React, { useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Button } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { MaterielThumb } from './MaterielDisplay';
import { CATEGORIES, DEGRES, LIEUX } from '../../constants/materiel';
import { normalize } from './materielUtils';

// Shared fields of the "Ajouter" and "Modifier" equipment forms, so both look and validate the same.

// Value as stored -> value of the matching option (so legacy "image" selects "Image")
const optionValue = (options, value, fallback) => {
  const option = options.find((o) => normalize(o.value) === normalize(value));
  return option ? option.value : value ?? fallback;
};

/** Item from the API (or nothing, for a new one) -> form state. Numbers stay strings while typing. */
export const toMaterielForm = (m = {}) => ({
  label: m.label || '',
  ref: m.ref || '',
  Qtotale: m.Qtotale ?? 1,
  categorie: optionValue(CATEGORIES, m.categorie, 'Autres'),
  tarifLoc: m.tarifLoc ?? 0,
  valRemp: m.valRemp ?? '',
  lieu: optionValue(LIEUX, m.lieu, 'Geneve'),
  degre: m.degre ?? 0,
  dateAchat: '',          // yyyy-mm-dd, optional
  image: null,            // File chosen in the form
});

/** Form state -> values for the API (trimmed strings, real numbers). */
export const fromMaterielForm = (form) => ({
  label: form.label.trim(),
  ref: form.ref.trim(),
  Qtotale: Number(form.Qtotale),
  categorie: form.categorie,
  tarifLoc: Number(form.tarifLoc),
  valRemp: form.valRemp === '' ? 0 : Number(form.valRemp),
  lieu: form.lieu,
  degre: Number(form.degre),
  ...(form.dateAchat ? { dateAchat: form.dateAchat } : {}),
});

function Field({ label, hint, error, className = 'mb-3', children }) {
  return (
    <Form.Group className={className}>
      <Form.Label className="wizard-label">{label}{hint && <span className="text-muted fw-normal"> ({hint})</span>}</Form.Label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
      {!options.some((o) => String(o.value) === String(value)) && <option value={value}>{String(value)}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Form.Select>
  );
}

/** Photo: the chosen file's preview, else the current photo (or category placeholder). */
function PhotoField({ file, current, onChange }) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      {preview
        ? <img src={preview} alt="Aperçu" className="mat-thumb mat-thumb--md" />
        : <MaterielThumb materiel={current} size="md" />}
      <div>
        <input id="materiel-form-photo" type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && onChange(e.target.files[0])} />
        <label htmlFor="materiel-form-photo" className="mb-0">
          <Button component="span" size="small" variant="outlined" color="primary" startIcon={<PhotoCameraIcon />}>
            {file || current.url_pic ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
        </label>
        {file && <div className="small text-muted text-truncate mt-1" style={{ maxWidth: 220 }}>{file.name}</div>}
      </div>
    </div>
  );
}

/**
 * The fields themselves. Controlled: `form` + `onChange(field, value)`.
 * `errors` from validateMateriel(); `current` = the item being edited (for its photo), `{}` for a new one.
 */
export default function MaterielFormFields({ form, onChange, errors = {}, current = {}, showPurchaseDate = false, autoFocus = false }) {
  const set = (field) => (value) => onChange(field, value);
  const invalid = (field) => !!errors[field];

  return (
    <>
      <PhotoField file={form.image} current={{ ...current, categorie: form.categorie }} onChange={set('image')} />

      <Field label="Nom" error={errors.label}>
        <Form.Control value={form.label} onChange={(e) => set('label')(e.target.value)} isInvalid={invalid('label')}
          placeholder="ex. Canon 5D Mark III avec 24-105mm" autoFocus={autoFocus} />
      </Field>

      <Field label="Référence" hint="facultatif" error={errors.ref}>
        <Form.Control value={form.ref} onChange={(e) => set('ref')(e.target.value)} isInvalid={invalid('ref')} placeholder="ex. CAM-012" />
      </Field>

      <div className="row">
        <Field className="col-4 mb-3" label="Quantité" error={errors.Qtotale}>
          <Form.Control type="number" min="0" step="1" value={form.Qtotale} isInvalid={invalid('Qtotale')}
            onChange={(e) => set('Qtotale')(e.target.value)} />
        </Field>
        <Field className="col-4 mb-3" label="Tarif" hint="CHF/jour" error={errors.tarifLoc}>
          <Form.Control type="number" min="0" step="any" value={form.tarifLoc} isInvalid={invalid('tarifLoc')}
            onChange={(e) => set('tarifLoc')(e.target.value)} />
        </Field>
        <Field className="col-4 mb-3" label="Valeur" hint="CHF" error={errors.valRemp}>
          <Form.Control type="number" min="0" step="any" value={form.valRemp} isInvalid={invalid('valRemp')}
            onChange={(e) => set('valRemp')(e.target.value)} placeholder="—" />
        </Field>

        <Field className="col-6 col-md-4 mb-3" label="Catégorie">
          <SelectInput value={form.categorie} onChange={set('categorie')} options={CATEGORIES} />
        </Field>
        <Field className="col-6 col-md-4 mb-3" label="Lieu">
          <SelectInput value={form.lieu} onChange={set('lieu')} options={LIEUX} />
        </Field>
        <Field className="col-6 col-md-4 mb-3" label="Degré">
          <SelectInput value={form.degre} onChange={set('degre')} options={DEGRES} />
        </Field>

        {showPurchaseDate && (
          <Field className="col-6 col-md-4 mb-3" label="Acheté le" hint="facultatif">
            <Form.Control type="date" value={form.dateAchat} max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('dateAchat')(e.target.value)} />
          </Field>
        )}
      </div>
    </>
  );
}
