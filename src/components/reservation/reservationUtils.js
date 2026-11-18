// Pure helpers for the reservation calendar: no React, no side effects, easy to test.
const common = require('../../common');

export const STATUS_COLORS = {
  approved: '#2e7d32',
  pending: '#ef6c00',
};

/** One material line of a reservation, as the calendar and the PDF use it. */
const toMaterielLine = (line) => ({
  ...line.getMateriel,
  quantite: line.quantite,
});

/**
 * API reservation -> Syncfusion event.
 * Builds new objects: the API data is never mutated.
 */
export const toSchedulerEvent = (reservation, readOnly) => ({
  Id: reservation.id,
  Subject: reservation.titre,
  StartTime: new Date(reservation.date_start),
  EndTime: new Date(reservation.date_end),
  IsAllDay: false,
  IsReadonly: readOnly,
  lieu: reservation.lieu,
  beneficiaire: reservation.beneficiaire,
  createur: reservation.createur,
  createurEmail: reservation.createurEmail,
  isApproved: reservation.isApproved,
  materiel: (reservation.getReservation || []).map(toMaterielLine),
});

/**
 * Applies the changes made in the "Modifier la liste" dialog to a material list.
 * `changes` holds deltas: { id, label, tarifLoc, quantite: +n | -n }.
 * Returns a new list; lines that drop to 0 are removed.
 */
export const applyMaterielChanges = (materiels, changes) => {
  const byId = new Map(materiels.map((m) => [m.id, { ...m }]));

  changes.forEach((change) => {
    const existing = byId.get(change.id);
    if (existing) {
      existing.quantite += change.quantite;
    } else {
      byId.set(change.id, { ...change });
    }
  });

  return [...byId.values()].filter((m) => m.quantite > 0);
};

/** Price summary used by the quick-info popup and the PDF quote. */
export const reservationTotals = (event) => {
  const days = Number(common.calcDays(event.StartTime, event.EndTime));
  const perDay = common.calcTotalPrice(event.materiel);
  return { days, perDay, total: perDay * days };
};

/**
 * Syncfusion event (after editing) -> API update payload.
 * `materiel` is only sent when the list was changed; an empty list leaves the materials untouched.
 */
export const toUpdatePayload = (event, changedMateriels) => ({
  id: event.Id,
  titre: event.Subject,
  date_start: event.StartTime,
  date_end: event.EndTime,
  lieu: event.lieu,
  beneficiaire: event.beneficiaire,
  isApproved: event.isApproved,
  materiel: changedMateriels || [],
});
