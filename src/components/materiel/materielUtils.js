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

/** Label for a stored value ("Lumiere" -> "Lumière"), falling back to the raw value. */
export const labelFor = (options, value) => {
  const option = options.find((o) => normalize(o.value) === normalize(value));
  return option ? option.label : value;
};

// Fields the API accepts for an update (material-table adds tableData, and the edit row may hold a File)
const EDITABLE_FIELDS = ['label', 'ref', 'categorie', 'Qtotale', 'tarifLoc', 'valRemp', 'degre', 'lieu', 'url_pic'];

/** Edited table row -> API update payload. */
export const toMaterielPayload = (row) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (row[field] !== undefined) payload[field] = row[field];
    return payload;
  }, {});
