import React, { useRef, useState } from 'react';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import ListMaterieleReservationModify from '../../views/ListMaterieleReservationModify';
import ModalPopup from '../ModalPopup';
import { applyMaterielChanges } from './reservationUtils';

const common = require('../../common');

const DATE_FORMAT = 'dd/MM/yy HH:mm';

/** Label + field row. Syncfusion reads every element with class "e-field" (by name) when saving. */
function Field({ label, children }) {
  return (
    <tr>
      <td className="e-textlabel">{label}</td>
      <td>{children}</td>
    </tr>
  );
}

/**
 * Body of Syncfusion's "edit reservation" popup (used as the scheduler's editorTemplate).
 *
 * Props:
 *  - event:            the Syncfusion event being edited
 *  - allReservations:  every reservation (used to compute what's still available)
 *  - onMaterielsChange(list): called with the full new material list after "OK" in the dialog
 */
export default function ReservationEditor({ event, allReservations, onMaterielsChange }) {
  // Deltas collected by ListMaterieleReservationModify while the dialog is open ({ id, quantite: ±n, ... })
  const changesRef = useRef([]);
  const [materiels, setMateriels] = useState(event.materiel || []);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => {
    changesRef.current = [];
    setDialogOpen(true);
  };

  const closeDialog = () => {
    changesRef.current = [];
    setDialogOpen(false);
  };

  const confirmDialog = () => {
    const next = applyMaterielChanges(materiels, changesRef.current);
    setMateriels(next);
    onMaterielsChange(next);
    closeDialog();
  };

  return (
    <div>
      <table className="custom-event-editor" style={{ width: '100%' }}>
        <tbody>
          <Field label="Titre">
            <input id="Subject" name="Subject" className="e-field e-input" type="text" style={{ width: '100%' }} />
          </Field>
          <Field label="Bénéficiaire">
            <input id="beneficiaire" name="beneficiaire" className="e-field e-input" type="email" style={{ width: '100%' }} />
          </Field>
          <Field label="Lieu">
            <input id="lieu" name="lieu" className="e-field e-input" type="text" style={{ width: '100%' }} />
          </Field>
          <Field label="Début">
            <DateTimePickerComponent id="StartTime" data-name="StartTime" className="e-field" format={DATE_FORMAT}
              value={new Date(event.startTime || event.StartTime)} />
          </Field>
          <Field label="Fin">
            <DateTimePickerComponent id="EndTime" data-name="EndTime" className="e-field" format={DATE_FORMAT}
              value={new Date(event.endTime || event.EndTime)} />
          </Field>
          <Field label="Validée">
            <input id="isApproved" name="isApproved" className="e-field e-control" type="checkbox" />
          </Field>
          <Field label="Matériel">
            {/* Display only (no "e-field"): the material list is sent separately through onMaterielsChange */}
            <ul className="list-unstyled mb-2">
              {materiels.map((item) => (
                <li key={item.id}>
                  {item.quantite} × {item.label} — {common.formatCHF(item.quantite * item.tarifLoc)}/jour
                </li>
              ))}
              {materiels.length === 0 && <li className="text-muted">Aucun matériel</li>}
            </ul>
            <button type="button" className="e-control e-btn" onClick={openDialog}>Modifier la liste</button>
          </Field>
        </tbody>
      </table>

      {/* MUI dialog (React portal): stays centered in the window, scrolls its content, full screen on phones.
          A Syncfusion dialog targeted at <body> is moved outside React's root, so its onClick handlers never fire. */}
      <ModalPopup title="Modifier le matériel" openPopup={dialogOpen} setOpenPopup={(open) => (open ? openDialog() : closeDialog())}>
        {/* Mounted only while open, so it always starts from the current list */}
        {dialogOpen && (
          <>
            <ListMaterieleReservationModify
              materielRef={changesRef}
              allReservations={allReservations}
              reservation={{ ...event, materiel: materiels }}
            />
            {/* Sticky so OK stays visible while scrolling a long list */}
            <div className="materiel-dialog-footer">
              <button type="button" className="e-control e-btn e-flat" onClick={closeDialog}>Annuler</button>
              <button type="button" className="e-control e-btn e-primary" onClick={confirmDialog}>OK</button>
            </div>
          </>
        )}
      </ModalPopup>
    </div>
  );
}
