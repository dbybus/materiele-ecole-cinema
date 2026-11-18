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

// Chip colours per category (background / text), chosen for readable contrast
export const CATEGORY_COLORS = {
  Image: { bg: '#e8eaf6', fg: '#283593' },
  Lumiere: { bg: '#fff8e1', fg: '#8d6e00' },
  Son: { bg: '#e0f2f1', fg: '#00695c' },
  Moniteur: { bg: '#f3e5f5', fg: '#6a1b9a' },
  Trepieds: { bg: '#efebe9', fg: '#4e342e' },
  Machinerie: { bg: '#fbe9e7', fg: '#bf360c' },
  Autres: { bg: '#eceff1', fg: '#455a64' },
};

export const LIEUX = [
  { value: 'Geneve', label: 'Genève' },
  { value: 'Lausanne', label: 'Lausanne' },
];

export const DEGRES = [
  { value: 0, label: 'Réal. 1ère' },
  { value: 1, label: 'Réal. 2em' },
  { value: 2, label: 'Journalisme' },
];
