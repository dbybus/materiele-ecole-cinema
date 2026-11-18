import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RoomIcon from '@material-ui/icons/Room';
import PersonIcon from '@material-ui/icons/Person';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { StartsIn } from './PendingReservationParts';
import { reservationTotals, timelineOf } from './reservationUtils';
import { downloadQuote } from './quote';

const common = require('../../common');

const hour = (date) => `${new Date(date).getHours()}h`;

/** Icon + small label + value. */
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="qi-row">
      <Icon className="qi-row-icon" fontSize="small" />
      <div className="qi-row-body">
        <div className="qi-row-label">{label}</div>
        <div className="qi-row-value">{children}</div>
      </div>
    </div>
  );
}

/**
 * Body of the popup shown when clicking a reservation in the calendar.
 * `event` is the Syncfusion event built by toSchedulerEvent()
 * (Syncfusion's own header above it shows the title and the edit / delete buttons).
 */
export default function ReservationQuickInfo({ event }) {
  const [downloading, setDownloading] = useState(false);
  const totals = reservationTotals(event);
  const { days, perDay, total } = totals;
  const timeline = timelineOf({ date_start: event.StartTime, date_end: event.EndTime });
  const createdBySomeoneElse = event.createurEmail &&
    event.createurEmail.toLowerCase() !== (event.beneficiaire || '').toLowerCase();

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadQuote({
        titre: event.Subject,
        beneficiaire: event.beneficiaire,
        lieu: event.lieu,
        from: event.StartTime,
        to: event.EndTime,
        materiel: event.materiel,
        totals,
        creatorEmail: event.createurEmail,
        fileName: `devis-${event.Id}.pdf`,
      });
    } catch (error) {
      console.error('Could not build the quote', error);
      alert("Le devis n'a pas pu être généré.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="qi">
      <div className="qi-status">
        {event.isApproved
          ? <span className="status-chip status-chip--ok">Validée</span>
          : <span className="status-chip status-chip--pending">En attente de validation</span>}
        {timeline === 'current' && <span className="now-chip">En cours</span>}
        {timeline === 'upcoming' && <StartsIn date={event.StartTime} />}
        {timeline === 'past' && <span className="starts-in">Terminée</span>}
      </div>

      <InfoRow icon={DateRangeIcon} label={`Période · ${days} jour${days > 1 ? 's' : ''}`}>
        {common.convertDateToFrShort(event.StartTime)} à {hour(event.StartTime)}
        <span className="text-muted"> → </span>
        {common.convertDateToFrShort(event.EndTime)} à {hour(event.EndTime)}
      </InfoRow>
      <InfoRow icon={RoomIcon} label="Lieu">{event.lieu || '—'}</InfoRow>
      <InfoRow icon={PersonIcon} label="Bénéficiaire">{event.beneficiaire}</InfoRow>
      {createdBySomeoneElse && <InfoRow icon={AccountCircleIcon} label="Créée par">{event.createurEmail}</InfoRow>}

      <table className="qi-items">
        <tbody>
          {event.materiel.map((item) => (
            <tr key={item.id}>
              <td className="qi-qty">{item.quantite}×</td>
              <td>{item.label}</td>
              <td className="qi-price">{common.formatCHF(item.quantite * item.tarifLoc)}</td>
            </tr>
          ))}
          {event.materiel.length === 0 && <tr><td colSpan={3} className="text-muted">Aucun matériel</td></tr>}
        </tbody>
      </table>

      <div className="qi-total">
        <span className="text-muted small">{common.formatCHF(perDay)} / jour × {days}</span>
        <span className="qi-total-amount">{common.formatCHF(total)}</span>
      </div>

      <Button fullWidth size="small" variant="outlined" color="primary" onClick={onDownload} disabled={downloading}
        startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}>
        {downloading ? 'Préparation du devis…' : 'Télécharger le devis'}
      </Button>
    </div>
  );
}
