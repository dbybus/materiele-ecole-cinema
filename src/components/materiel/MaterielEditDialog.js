import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Button, CircularProgress } from '@material-ui/core';
import ModalPopup from '../ModalPopup';
import MaterielFormFields, { fromMaterielForm, toMaterielForm } from './MaterielFormFields';
import { validateMateriel } from './materielUtils';

/**
 * Edit form for one item, used on phones (inline table editing doesn't work well there).
 * `onSave(newData)` must reject on failure: the dialog then stays open.
 * `existing` = catalog, to refuse a reference already used by another item.
 */
export default function MaterielEditDialog({ materiel, existing = [], onClose, onSave }) {
  const [form, setForm] = useState(() => toMaterielForm(materiel || {}));
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { if (materiel) { setForm(toMaterielForm(materiel)); setShowErrors(false); } }, [materiel]);

  const errors = materiel ? validateMateriel(form, existing, materiel.id) : {};

  const save = async () => {
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await onSave({ ...materiel, ...fromMaterielForm(form), image: form.image });
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
          <MaterielFormFields form={form} onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
            errors={showErrors ? errors : {}} current={materiel} />
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
