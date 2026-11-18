import React, { useMemo } from 'react';
import { Chip } from '@material-ui/core';
import { CATEGORIES } from '../../constants/materiel';
import { ALL, normalize } from './materielUtils';
import { iconForCategory } from './categoryIcons';

/**
 * Quick category filter: "Toutes (8) · Image (1) · Son (2) …".
 * Counts are computed from `materiels` (already filtered by location/search, but not by category).
 * Categories with no items are hidden, except the selected one.
 */
export default function CategoryFilterChips({ materiels, value, onChange }) {
  const counts = useMemo(() => {
    const map = new Map();
    materiels.forEach((m) => map.set(normalize(m.categorie), (map.get(normalize(m.categorie)) || 0) + 1));
    return map;
  }, [materiels]);

  const options = CATEGORIES.filter((c) => counts.get(normalize(c.value)) || value === c.value);

  return (
    <div className="category-chips" role="group" aria-label="Filtrer par catégorie">
      <Chip
        label={`Toutes (${materiels.length})`}
        color={value === ALL ? 'primary' : 'default'}
        variant={value === ALL ? 'default' : 'outlined'}
        onClick={() => onChange(ALL)}
        clickable
      />
      {options.map((c) => {
        const Icon = iconForCategory(c.value);
        return (
        <Chip
          key={c.value}
          icon={<Icon fontSize="small" />}
          label={`${c.label} (${counts.get(normalize(c.value)) || 0})`}
          color={value === c.value ? 'primary' : 'default'}
          variant={value === c.value ? 'default' : 'outlined'}
          onClick={() => onChange(value === c.value ? ALL : c.value)}
          clickable
        />
        );
      })}
    </div>
  );
}
