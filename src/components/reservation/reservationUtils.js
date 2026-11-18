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

/** Number of days, price per day and total for a period and a material list. */
export const totalsFor = (start, end, materiel) => {
  const days = Number(common.calcDays(start, end));
  const perDay = common.calcTotalPrice(materiel);
  return { days, perDay, total: perDay * days };
};

/** Price summary used by the quick-info popup and the PDF quote. */
export const reservationTotals = (event) => totalsFor(event.StartTime, event.EndTime, event.materiel);

// ---------- New reservation (wizard) ----------

// Equipment is picked up at 14:00 on the first day and returned at 13:00 on the last day,
// so a reservation ending on a day doesn't clash with one starting that same day.
export const PICKUP_HOUR = 14;
export const RETURN_HOUR = 13;

/** Dates chosen in the calendar -> actual period (new Date objects: the picked dates are never mutated). */
export const toReservationPeriod = (from, to) => {
  const start = new Date(from);
  start.setHours(PICKUP_HOUR, 0, 0, 0);
  const end = new Date(to);
  end.setHours(RETURN_HOUR, 0, 0, 0);
  return { start, end };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Step 1 validation. Returns { field: message } for every invalid field (empty object = valid). */
export const validateDetails = ({ titre, beneficiaire, lieu, from, to }) => {
  const errors = {};
  if (!titre.trim()) errors.titre = "Indiquez le nom de l'évènement.";
  if (!EMAIL_PATTERN.test(beneficiaire.trim())) errors.beneficiaire = 'Indiquez une adresse email valide.';
  if (!lieu.trim()) errors.lieu = 'Indiquez le lieu.';
  if (!from || !to) errors.period = 'Choisissez le premier et le dernier jour.';
  return errors;
};

/**
 * Quantity of each material already taken by other reservations during [start, end):
 * the PEAK number used at the same time, not the sum of every overlapping reservation.
 * (Two separate bookings of 2 cameras inside the period only block 2 cameras, not 4.)
 * Usage only goes up when a reservation starts, so the peak is at `start` or at one of those starts.
 * Returns [{ id, quantite }] as ListMaterieleReservation expects.
 */
export const peakReservedQuantities = (reservations, start, end) => {
  const periods = reservations
    .map((r) => ({ start: new Date(r.date_start), end: new Date(r.date_end), lines: r.getReservation || [] }))
    .filter((r) => r.start < end && start < r.end);

  const checkpoints = [start, ...periods.map((r) => r.start).filter((t) => t > start && t < end)];
  const peak = new Map();

  checkpoints.forEach((t) => {
    const inUse = new Map();
    periods
      .filter((r) => r.start <= t && t < r.end)
      .forEach((r) => r.lines.forEach((line) => {
        const id = line.getMateriel ? line.getMateriel.id : line.materielId;
        inUse.set(id, (inUse.get(id) || 0) + line.quantite);
      }));
    inUse.forEach((quantite, id) => peak.set(id, Math.max(peak.get(id) || 0, quantite)));
  });

  return [...peak.entries()].map(([id, quantite]) => ({ id, quantite }));
};

// ---------- Cross-component refresh ----------

// Fired after a reservation is created, approved, refused, changed or deleted, so components that
// show counts (the navbar badges) can reload. Listen with window.addEventListener(RESERVATIONS_CHANGED, …).
export const RESERVATIONS_CHANGED = 'reservations:changed';
export const notifyReservationsChanged = () => window.dispatchEvent(new Event(RESERVATIONS_CHANGED));

// ---------- Validation of pending reservations ----------

/**
 * API reservation -> update payload that only approves it.
 * `materiel: []` tells the API to leave the equipment lines untouched
 * (sending the raw row made the API crash on `req.body.materiel.forEach`).
 */
export const approvalPayload = (reservation) => ({
  id: reservation.id,
  titre: reservation.titre,
  lieu: reservation.lieu,
  beneficiaire: reservation.beneficiaire,
  date_start: reservation.date_start,
  date_end: reservation.date_end,
  isApproved: true,
  materiel: [],
});

/**
 * What approving `reservation` would overbook, given the reservations ALREADY APPROVED.
 * Uses the stock (`Qtotale`) the API sends with each line.
 * Returns [{ id, label, requested, available }] (empty = no conflict).
 */
export const approvalConflicts = (reservation, allReservations) => {
  const start = new Date(reservation.date_start);
  const end = new Date(reservation.date_end);
  const approvedOthers = allReservations.filter((r) => r.isApproved && r.id !== reservation.id);
  const taken = new Map(peakReservedQuantities(approvedOthers, start, end).map((l) => [l.id, l.quantite]));

  return (reservation.getReservation || [])
    .map((line) => {
      const m = line.getMateriel || {};
      const available = Math.max(0, (m.Qtotale || 0) - (taken.get(m.id) || 0));
      return { id: m.id, label: m.label, requested: line.quantite, available };
    })
    .filter((c) => c.requested > c.available);
};

// ---------- "Mes réservations" ----------

const sameEmail = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Reservations that concern the user: they are the beneficiary OR they created it
 * (a teacher booking for a student sees it too). Emails compared case-insensitively.
 */
export const isMine = (reservation, user) =>
  sameEmail(reservation.beneficiaire, user.email) ||
  sameEmail(reservation.createurEmail, user.email) ||
  (!!user.sub && reservation.createur === user.sub);

/** 'current' (equipment out now), 'upcoming' or 'past'. */
export const timelineOf = (reservation, now = new Date()) => {
  if (new Date(reservation.date_end) < now) return 'past';
  if (new Date(reservation.date_start) <= now) return 'current';
  return 'upcoming';
};

/** API reservation lines -> [{ id, label, quantite, tarifLoc, ... }] (the shape totals and the PDF use). */
export const materielOf = (reservation) => (reservation.getReservation || []).map(toMaterielLine);

/** Number of days until the reservation starts (negative = already started). */
export const daysUntil = (date, now = new Date()) => {
  const day = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  return Math.round((day(date) - day(now)) / 86400000);
};

/** Wizard state -> API create payload. */
export const toCreatePayload = ({ details, materiel, user, autoApprove }) => {
  const { start, end } = toReservationPeriod(details.from, details.to);
  return {
    titre: details.titre.trim(),
    lieu: details.lieu.trim(),
    beneficiaire: details.beneficiaire.trim(),
    date_start: start,
    date_end: end,
    createur: user.sub,
    creatorEmail: user.email, // the API reads `creatorEmail` and stores it as `createurEmail`
    materiel,
    isApproved: autoApprove,
  };
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
