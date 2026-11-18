// Single source for the equipment option lists (filters, table editors, forms).
// `value` is what's stored in the database, `label` what users see.

export const CATEGORIES = [
  { value: 'Image', label: 'Image' },
  { value: 'Lumiere', label: 'Lumière' },
  { value: 'Son', label: 'Son' },
  { value: 'Moniteur', label: 'Moniteur' },
  { value: 'Trepieds', label: 'Trépieds' },
  { value: 'Machinerie', label: 'Machinerie' },
  { value: 'Autres', label: 'Autres' },
];

export const LIEUX = [
  { value: 'Geneve', label: 'Genève' },
  { value: 'Lausanne', label: 'Lausanne' },
];

export const DEGRES = [
  { value: 0, label: 'Réal. 1ère' },
  { value: 1, label: 'Réal. 2em' },
  { value: 2, label: 'Journalisme' },
];
