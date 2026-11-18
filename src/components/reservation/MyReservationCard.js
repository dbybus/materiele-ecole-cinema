import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import RoomIcon from '@material-ui/icons/Room';
import PersonIcon from '@material-ui/icons/Person';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { StartsIn } from './PendingReservationParts';
import { materielOf, timelineOf, totalsFor } from './reservationUtils';
import { downloadQuote } from './quote';

const common = require('../../common');

function StatusChip({ reservation }) {
  return reservation.isApproved
    ? <span className="status-chip status-chip--ok">Validée</span>
    : <span className="status-chip status-chip--pending">En attente de validation</span>;
}

/**
 * One reservation of the logged-in user: status, period, place, who it's for, cost,
 * the equipment (expandable) and the PDF quote.
 */
export default function MyReservationCard({ reservation, userEmail }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const materiel = materielOf(reservation);
  const totals = totalsFor(new Date(reservation.date_start), new Date(reservation.date_end), materiel);
  const items = materiel.reduce((sum, m) => sum + m.quantite, 0);
  const timeline = timelineOf(reservation);
  const forSomeoneElse = reservation.beneficiaire && reservation.beneficiaire.toLowerCase() !== (userEmail || '').toLowerCase();

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadQuote({
        titre: reservation.titre,
        beneficiaire: reservation.beneficiaire,
        lieu: reservation.lieu,
        from: new Date(reservation.date_start),
        to: new Date(reservation.date_end),
        materiel,
        totals,
        creatorEmail: reservation.createurEmail,
        fileName: `devis-${reservation.id}.pdf`,
      });
    } catch (error) {
      console.error('Could not build the quote', error);
      alert("Le devis n'a pas pu être généré.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className={`my-res-card my-res-card--${reservation.isApproved ? 'ok' : 'pending'}${timeline === 'past' ? ' is-past' : ''}`}>
      <header className="d-flex justify-content-between align-items-start gap-2 mb-1">
        <h2 className="my-res-title">{reservation.titre}</h2>
        <StatusChip reservation={reservation} />
      </header>

      <div className="my-res-period">
        {common.convertDateToFrShort(reservation.date_start)} → {common.convertDateToFrShort(reservation.date_end)}
        <span className="text-muted"> · {totals.days} jour{totals.days > 1 ? 's' : ''}</span>
        {' '}
        {timeline === 'current' && <span className="now-chip">En cours</span>}
        {timeline === 'upcoming' && <StartsIn date={reservation.date_start} />}
      </div>

      <div className="my-res-meta">
        <span><RoomIcon fontSize="inherit" /> {reservation.lieu}</span>
        {forSomeoneElse && <span><PersonIcon fontSize="inherit" /> Pour {reservation.beneficiaire}</span>}
      </div>

      <footer className="my-res-footer">
        <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => setOpen(!open)} aria-expanded={open}>
          {items} article{items > 1 ? 's' : ''} · <b>{common.formatCHF(totals.total)}</b>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </button>
        <Button size="small" variant="outlined" color="primary" onClick={onDownload} disabled={downloading}
          startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}>
          Devis
        </Button>
      </footer>

      {open && (
        <ul className="requested-list mt-2">
          {materiel.map((m) => (
            <li key={m.id}>
              <span><b>{m.quantite} ×</b> {m.label}</span>
              <span className="small text-muted">{common.formatCHF(m.quantite * m.tarifLoc)}/jour</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
