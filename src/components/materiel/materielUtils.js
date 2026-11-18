// Pure helpers for the equipment list: no React, no side effects, easy to test.

export const ALL = 'all';

/** "Lumière" / "lumiere" / "LUMIERE " -> "lumiere": compare values regardless of case and accents. */
export const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

/**
 * Category / location filter. Case- and accent-insensitive, because the database contains
 * both "Image" (from the add form) and "image" (older data).
 */
export const matchesFilters = (materiel, { categorie, lieu }) =>
  (categorie === ALL || normalize(materiel.categorie) === normalize(categorie)) &&
  (lieu === ALL || normalize(materiel.lieu) === normalize(lieu));

// ---------- Reservation picker ----------
// The selection is a list of { id, ref, label, tarifLoc, quantite } (the shape AddReservation,
// the summary and the PDF use). Everything else is derived from it, never stored on the rows.

const quantitiesById = (lines) =>
  (lines || []).reduce((map, line) => map.set(line.id, (map.get(line.id) || 0) + line.quantite), new Map());

/**
 * Catalog + quantities already reserved by others on those dates + current selection
 * -> rows for the picker: { ...materiel, quantiteDisp, tempMateriel, prixTotal }.
 * Pure: recomputed on every change, so filtering can never desync or reset the counters.
 */
export const buildPickerRows = (catalog, reservedByOthers, selection) => {
  const reserved = quantitiesById(reservedByOthers);
  const selected = quantitiesById(selection);
  return catalog.map((m) => {
    const tempMateriel = selected.get(m.id) || 0;
    return {
      ...m,
      tempMateriel,
      quantiteDisp: Math.max(0, m.Qtotale - (reserved.get(m.id) || 0) - tempMateriel),
      prixTotal: tempMateriel * m.tarifLoc,
    };
  });
};

/** Selection with one more unit of `materiel` (new array, new objects). */
export const addToSelection = (selection, materiel) =>
  selection.some((line) => line.id === materiel.id)
    ? selection.map((line) => (line.id === materiel.id ? { ...line, quantite: line.quantite + 1 } : line))
    : [...selection, { id: materiel.id, ref: materiel.ref, label: materiel.label, tarifLoc: materiel.tarifLoc, quantite: 1 }];

/** Selection with one unit less of `materielId`; the line disappears at 0. */
export const removeFromSelection = (selection, materielId) =>
  selection
    .map((line) => (line.id === materielId ? { ...line, quantite: line.quantite - 1 } : line))
    .filter((line) => line.quantite > 0);

/** Label for a stored value ("Lumiere" -> "Lumière"), falling back to the raw value. */
export const labelFor = (options, value) => {
  const option = options.find((o) => normalize(o.value) === normalize(value));
  return option ? option.label : value;
};

/**
 * Add / edit form validation. Returns { field: message } (empty object = valid).
 * `existing` = current catalog, used to refuse a reference already taken by another item.
 */
export const validateMateriel = (form, existing = [], currentId = null) => {
  const errors = {};
  const isNumber = (v) => v !== '' && v !== null && !Number.isNaN(Number(v));

  if (!String(form.label || '').trim()) errors.label = 'Le nom est obligatoire.';
  if (!isNumber(form.Qtotale) || Number(form.Qtotale) < 0 || !Number.isInteger(Number(form.Qtotale))) {
    errors.Qtotale = 'Nombre entier, 0 ou plus.';
  }
  if (!isNumber(form.tarifLoc) || Number(form.tarifLoc) < 0) errors.tarifLoc = 'Montant de 0 ou plus.';
  if (form.valRemp !== '' && (!isNumber(form.valRemp) || Number(form.valRemp) < 0)) errors.valRemp = 'Montant de 0 ou plus.';

  const ref = normalize(form.ref);
  if (ref && existing.some((m) => m.id !== currentId && normalize(m.ref) === ref)) {
    errors.ref = 'Cette référence est déjà utilisée.';
  }
  return errors;
};

// Fields the API accepts for an update (material-table adds tableData, and the edit row may hold a File)
const EDITABLE_FIELDS = ['label', 'ref', 'categorie', 'Qtotale', 'tarifLoc', 'valRemp', 'degre', 'lieu', 'url_pic'];

/** Edited table row -> API update payload. */
export const toMaterielPayload = (row) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (row[field] !== undefined) payload[field] = row[field];
    return payload;
  }, {});
