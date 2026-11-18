import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Button, CircularProgress } from '@material-ui/core';
import ModalPopup from '../ModalPopup';
import { ImageEditor } from './MaterielEditors';
import { MaterielThumb } from './MaterielDisplay';
import { CATEGORIES, DEGRES, LIEUX } from '../../constants/materiel';
import { normalize } from './materielUtils';

// Value as stored -> value of the matching option (so legacy "image" selects "Image")
const optionValue = (options, value) => {
  const option = options.find((o) => normalize(o.value) === normalize(value));
  return option ? option.value : value ?? '';
};

const toForm = (m) => ({
  label: m.label || '',
  ref: m.ref || '',
  Qtotale: m.Qtotale ?? 0,
  categorie: optionValue(CATEGORIES, m.categorie),
  tarifLoc: m.tarifLoc ?? 0,
  valRemp: m.valRemp ?? 0,
  lieu: optionValue(LIEUX, m.lieu),
  degre: m.degre ?? 0,
  image: null,
});

function SelectField({ label, value, onChange, options }) {
  return (
    <Form.Group className="col-6 mb-3">
      <Form.Label className="wizard-label">{label}</Form.Label>
      <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
        {!options.some((o) => String(o.value) === String(value)) && <option value={value}>{String(value)}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Form.Select>
    </Form.Group>
  );
}

function NumberField({ label, value, onChange, suffix }) {
  return (
    <Form.Group className="col-6 col-sm-4 mb-3">
      <Form.Label className="wizard-label">{label}{suffix && <span className="text-muted fw-normal"> ({suffix})</span>}</Form.Label>
      <Form.Control type="number" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value)} />
    </Form.Group>
  );
}

/**
 * Edit form for one item, used on phones (inline table editing doesn't work well there).
 * `onSave(newData)` must reject on failure: the dialog then stays open.
 */
export default function MaterielEditDialog({ materiel, onClose, onSave }) {
  const [form, setForm] = useState(() => toForm(materiel || {}));
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { if (materiel) { setForm(toForm(materiel)); setShowErrors(false); } }, [materiel]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const nameMissing = !form.label.trim();

  const save = async () => {
    setShowErrors(true);
    if (nameMissing) return;
    setSaving(true);
    try {
      await onSave({
        ...materiel,
        ...form,
        label: form.label.trim(),
        ref: form.ref.trim(),
        Qtotale: Number(form.Qtotale),
        tarifLoc: Number(form.tarifLoc),
        valRemp: Number(form.valRemp),
        degre: Number(form.degre),
      });
      onClose();
    } catch (e) {
      // onSave already told the user; keep the dialog open so nothing typed is lost
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPopup title="Modifier le matériel" openPopup={!!materiel} setOpenPopup={(open) => !open && !saving && onClose()}>
      {materiel && (
        <Form noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <MaterielThumb materiel={materiel} size="md" />
            <ImageEditor value={form.image} onChange={set('image')} />
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="wizard-label">Nom</Form.Label>
            <Form.Control value={form.label} onChange={(e) => set('label')(e.target.value)} isInvalid={showErrors && nameMissing} />
            <Form.Control.Feedback type="invalid">Le nom est obligatoire.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="wizard-label">Référence</Form.Label>
            <Form.Control value={form.ref} onChange={(e) => set('ref')(e.target.value)} />
          </Form.Group>

          <div className="row">
            <NumberField label="Quantité" value={form.Qtotale} onChange={set('Qtotale')} />
            <NumberField label="Tarif" suffix="CHF/jour" value={form.tarifLoc} onChange={set('tarifLoc')} />
            <NumberField label="Valeur" suffix="CHF" value={form.valRemp} onChange={set('valRemp')} />
            <SelectField label="Catégorie" value={form.categorie} onChange={set('categorie')} options={CATEGORIES} />
            <SelectField label="Lieu" value={form.lieu} onChange={set('lieu')} options={LIEUX} />
            <SelectField label="Degré" value={form.degre} onChange={set('degre')} options={DEGRES} />
          </div>

          <div className="materiel-dialog-footer">
            <Button onClick={onClose} disabled={saving}>Annuler</Button>
            <Button type="submit" color="primary" variant="contained" disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      )}
    </ModalPopup>
  );
}
