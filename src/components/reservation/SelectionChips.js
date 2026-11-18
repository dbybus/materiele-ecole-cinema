import React from 'react';
import { Chip } from '@material-ui/core';

/**
 * The current selection as removable chips ("2 × Canon ✕"), above the equipment table.
 * Always shows every selected item, even those hidden by a category/location filter.
 */
export default function SelectionChips({ materiel, onRemoveItem }) {
  if (materiel.length === 0) {
    return <p className="text-muted small mb-3">Aucun matériel sélectionné pour l'instant. Utilisez + pour ajouter des articles.</p>;
  }
  return (
    <div className="wizard-selection" aria-label="Matériel sélectionné">
      <span className="small text-muted me-1">Sélection :</span>
      {materiel.map((line) => (
        <Chip
          key={line.id}
          size="small"
          color="primary"
          variant="outlined"
          label={`${line.quantite} × ${line.label}`}
          onDelete={() => onRemoveItem(line.id)}
        />
      ))}
    </div>
  );
}
