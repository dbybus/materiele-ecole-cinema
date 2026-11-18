import React from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { daysUntil } from './reservationUtils';

const common = require('../../common');

// Presentational pieces for the "Réservations à valider" page (desktop table and phone cards).

/** "Commence dans 3 jours" / "Commence demain" / "Date dépassée" (red when urgent or past). */
export function StartsIn({ date }) {
  const d = daysUntil(date);
  if (d < 0) return <span className="starts-in starts-in--late">Date dépassée</span>;
  if (d === 0) return <span className="starts-in starts-in--soon">Commence aujourd'hui</span>;
  if (d === 1) return <span className="starts-in starts-in--soon">Commence demain</span>;
  return <span className={`starts-in${d <= 3 ? ' starts-in--soon' : ''}`}>Dans {d} jours</span>;
}

/** Overbooking warning, or a green "available" check. */
export function ConflictStatus({ conflicts }) {
  if (conflicts.length === 0) {
    return <span className="avail-chip avail-chip--ok"><CheckCircleIcon fontSize="inherit" /> Matériel disponible</span>;
  }
  return (
    <span className="avail-chip avail-chip--conflict" title={conflicts.map((c) => `${c.label} : ${c.requested} demandé(s), ${c.available} disponible(s)`).join('\n')}>
      <WarningIcon fontSize="inherit" /> {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} de stock
    </span>
  );
}

/** "Du 20 nov. au 23 nov. 2026 · 4 jours" */
export function PeriodText({ reservation }) {
  const days = Number(common.calcDays(new Date(reservation.date_start), new Date(reservation.date_end)));
  return (
    <span className="text-nowrap">
      {common.convertDateToFrShort(reservation.date_start)} → {common.convertDateToFrShort(reservation.date_end)}
      <span className="text-muted"> · {days} j</span>
    </span>
  );
}

/** Requested equipment, with each line that would overbook highlighted. */
export function RequestedMateriel({ reservation, conflicts }) {
  const conflictById = new Map(conflicts.map((c) => [c.id, c]));
  const lines = reservation.getReservation || [];
  if (lines.length === 0) return <p className="text-muted small mb-0">Aucun matériel.</p>;
  return (
    <ul className="requested-list">
      {lines.map((line) => {
        const m = line.getMateriel || {};
        const conflict = conflictById.get(m.id);
        return (
          <li key={line.id} className={conflict ? 'is-conflict' : ''}>
            <span><b>{line.quantite} ×</b> {m.label}</span>
            {conflict
              ? <span className="small">{conflict.available === 0 ? 'Plus disponible' : `Seulement ${conflict.available} disponible${conflict.available > 1 ? 's' : ''}`}</span>
              : <span className="small text-muted">{common.formatCHF(line.quantite * (m.tarifLoc || 0))}/jour</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Valider / Refuser buttons (disabled while a request for this row is running). */
export function DecisionButtons({ busy, onApprove, onRefuse, size = 'small' }) {
  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button size={size} variant="outlined" className="btn-refuse" onClick={onRefuse} disabled={!!busy}
        startIcon={busy === 'refuse' ? <CircularProgress size={14} color="inherit" /> : <CloseIcon />}>
        Refuser
      </Button>
      <Button size={size} variant="contained" color="primary" onClick={onApprove} disabled={!!busy}
        startIcon={busy === 'approve' ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}>
        Valider
      </Button>
    </div>
  );
}
