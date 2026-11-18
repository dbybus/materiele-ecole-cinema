import React, { useEffect, useRef, useState } from 'react';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import ListMaterieleReservationModify from '../../views/ListMaterieleReservationModify';
import ModalPopup from '../ModalPopup';

const common = require('../../common');

const DATE_FORMAT = 'dd/MM/yy HH:mm';

// MUI dialogs, menus and snackbars use z-index 1300-1400.
const BELOW_MUI = 1200;

/**
 * Syncfusion gives its editor a z-index above the highest one on the page when it opens: if a MUI
 * snackbar (1400) is showing at that moment, the editor gets 1401 and our MUI "Modifier le matériel"
 * dialog (1300) opens BEHIND it. While our dialog is open, put the editor (and its dark overlay)
 * below the MUI layer. Raising our dialog instead would hide its own dropdown menus (also 1300).
 * Returns a function that restores the original values.
 */
function lowerSchedulerEditor() {
  const dialog = document.querySelector('.e-schedule-dialog.e-popup-open');
  const container = dialog && dialog.closest('.e-dlg-container');
  const overlay = container && container.querySelector('.e-dlg-overlay');
  const elements = [[container, BELOW_MUI], [dialog, BELOW_MUI], [overlay, BELOW_MUI - 1]].filter(([el]) => el);
  const previous = elements.map(([el]) => el.style.zIndex);
  elements.forEach(([el, z]) => { el.style.zIndex = String(z); });
  return () => elements.forEach(([el], i) => { el.style.zIndex = previous[i]; });
}

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
  const [materiels, setMateriels] = useState(event.materiel || []);
  // Working copy edited in the dialog: "OK" applies it, "Annuler" throws it away
  const [draft, setDraft] = useState(null);
  const dialogOpen = draft !== null;
  const restoreEditorRef = useRef(null);

  const openDialog = () => {
    restoreEditorRef.current = lowerSchedulerEditor(); // so "Modifier le matériel" is always on top
    setDraft(materiels);
  };
  const closeDialog = () => {
    if (restoreEditorRef.current) restoreEditorRef.current();
    restoreEditorRef.current = null;
    setDraft(null);
  };

  // If the editor closes while our dialog is still open, don't leave its z-index lowered
  useEffect(() => () => { if (restoreEditorRef.current) restoreEditorRef.current(); }, []);

  const confirmDialog = () => {
    setMateriels(draft);
    onMaterielsChange(draft);
    closeDialog();
  };

  const draftCount = (draft || []).reduce((sum, line) => sum + line.quantite, 0);

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
      <ModalPopup title="Modifier le matériel" maxWidth="lg" openPopup={dialogOpen} setOpenPopup={(open) => (open ? openDialog() : closeDialog())}>
        {/* Mounted only while open, so it always starts from the current list (the draft) */}
        {dialogOpen && (
          <>
            <ListMaterieleReservationModify
              reservation={event}
              allReservations={allReservations}
              selection={draft}
              onSelectionChange={setDraft}
              bottomGap={120} // dialog footer + the dialog's bottom margin
            />
            {/* Sticky so OK stays visible while scrolling a long list; shows the draft's total */}
            <div className="materiel-dialog-footer">
              <span className="me-auto small text-muted align-self-center">
                {draftCount > 0
                  ? <><b className="text-body">{draftCount} article{draftCount > 1 ? 's' : ''}</b> · {common.formatCHF(common.calcTotalPrice(draft))}/jour</>
                  : 'Aucun matériel sélectionné'}
              </span>
              <button type="button" className="e-control e-btn e-flat" onClick={closeDialog}>Annuler</button>
              <button type="button" className="e-control e-btn e-primary" onClick={confirmDialog}>OK</button>
            </div>
          </>
        )}
      </ModalPopup>
    </div>
  );
}
