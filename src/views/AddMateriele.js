import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button, CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import MaterieleDataService from '../services/materiele.service';
import MaterielFormFields, { fromMaterielForm, toMaterielForm } from '../components/materiel/MaterielFormFields';
import { validateMateriel } from '../components/materiel/materielUtils';
import { useAuth0 } from '../auth';

/**
 * "Ajouter du matériel" form (in the equipment page's popup, or alone on /AddMateriele).
 *
 * Order matters: the photo is uploaded first and the item is created with the URL the server
 * returns (the old form guessed the file name and created the item in parallel, so a failed or
 * slow upload left a broken image). The popup only closes once the item really exists.
 *
 * Props (all optional):
 *  - onCreated(item): called after a successful save (the popup closes and the list reloads)
 *  - onCancel():      "Annuler"
 *  - existing:        current catalog, to refuse a reference that's already used
 */
function AddMateriele({ onCreated, onCancel, existing = [] }) {
  const { getAccessTokenSilently } = useAuth0();
  const history = useHistory();
  const [form, setForm] = useState(() => toMaterielForm());
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validateMateriel(form, existing);
  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // Standalone page (no popup around it): go back to the list
  const done = (item) => (onCreated ? onCreated(item) : history.push('/ListMateriele'));
  const cancel = () => (onCancel ? onCancel() : history.push('/ListMateriele'));

  const submit = async () => {
    setShowErrors(true);
    if (Object.keys(errors).length > 0 || saving) return;
    setSaving(true);

    const token = await getAccessTokenSilently();
    let url_pic = null; // no photo -> no URL (the old form stored a broken "/img/materiels/_date." path)
    try {
      if (form.image) {
        const formData = new FormData();
        formData.append('file', form.image);
        const { data } = await MaterieleDataService.uploadImgMat(formData, token);
        if (!data || !data.url) throw new Error("L'API n'a pas renvoyé l'URL de l'image (redémarrer le serveur API ?)");
        url_pic = data.url;
      }
      const { data: created } = await MaterieleDataService.create({ ...fromMaterielForm(form), url_pic }, token);
      done(created);
    } catch (error) {
      console.error('Could not create material', error);
      // The item wasn't created: don't leave the uploaded photo orphaned on disk
      if (url_pic) MaterieleDataService.deleteImgMat({ url_pic }, token).catch(() => {});
      alert("Le matériel n'a pas pu être ajouté. Réessayez.");
      setSaving(false);
    }
  };

  return (
    <Form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <MaterielFormFields form={form} onChange={updateField} errors={showErrors ? errors : {}} showPurchaseDate autoFocus />

      <div className="materiel-dialog-footer">
        <Button onClick={cancel} disabled={saving}>Annuler</Button>
        <Button type="submit" color="primary" variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </Button>
      </div>
    </Form>
  );
}

export default AddMateriele;
