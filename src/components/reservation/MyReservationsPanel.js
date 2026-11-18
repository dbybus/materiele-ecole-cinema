import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EventNoteIcon from '@material-ui/icons/EventNote';
import { StartsIn } from './PendingReservationParts';
import { timelineOf } from './reservationUtils';

const common = require('../../common');
const MAX_ITEMS = 5;

/**
 * "Mes réservations" summary on the landing page (next to the calendar on wide screens,
 * above it as a scrollable row on smaller ones). Shows current and upcoming reservations, soonest first.
 *  - reservations: the user's reservations (any status)
 *  - onSelect(reservation): jump to it in the calendar
 *  - onNew(): open the reservation wizard
 */
export default function MyReservationsPanel({ reservations, onSelect, onNew }) {
  const now = new Date();
  const upcoming = reservations
    .filter((r) => timelineOf(r, now) !== 'past')
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  const pending = upcoming.filter((r) => !r.isApproved).length;

  return (
    <aside className="my-panel" aria-label="Mes réservations">
      <div className="my-panel-header">
        <h2 className="my-panel-title"><EventNoteIcon fontSize="small" /> Mes réservations</h2>
        {upcoming.length > 0 && (
          <span className="my-panel-count">
            {upcoming.length}{pending > 0 && <> · <span className="text-warning-dark">{pending} en attente</span></>}
          </span>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div className="my-panel-empty">
          <p className="mb-2">Aucune réservation en cours ou à venir.</p>
          <Button size="small" variant="outlined" color="primary" startIcon={<AddIcon />} onClick={onNew}>
            Réserver du matériel
          </Button>
        </div>
      ) : (
        <ul className="my-panel-list">
          {upcoming.slice(0, MAX_ITEMS).map((r) => {
            const current = timelineOf(r, now) === 'current';
            return (
              <li key={r.id}>
                <button type="button" className={`my-panel-item my-panel-item--${r.isApproved ? 'ok' : 'pending'}`}
                  onClick={() => onSelect(r)} title="Afficher dans le calendrier">
                  <span className="my-panel-item-title">{r.titre}</span>
                  <span className="my-panel-item-dates">
                    {common.convertDateToFrShort(r.date_start)} → {common.convertDateToFrShort(r.date_end)}
                  </span>
                  <span className="my-panel-item-status">
                    <span className={`status-dot status-dot--${r.isApproved ? 'ok' : 'pending'}`} />
                    {r.isApproved ? 'Validée' : 'En attente'}
                    <span className="ms-auto">
                      {current ? <span className="now-chip">En cours</span> : <StartsIn date={r.date_start} />}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/ListMesReservations" className="my-panel-link">
        {upcoming.length > MAX_ITEMS ? `Voir les ${upcoming.length} réservations` : 'Voir toutes mes réservations'} →
      </Link>
    </aside>
  );
}
