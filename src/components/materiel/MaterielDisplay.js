import React from 'react';
import ModalImage from 'react-modal-image';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import { CATEGORIES, CATEGORY_COLORS } from '../../constants/materiel';
import { labelFor, normalize } from './materielUtils';
import { iconForCategory } from './categoryIcons';

// Small presentational pieces shared by the equipment table and the phone cards.

const colorsFor = (categorie) => {
  const key = Object.keys(CATEGORY_COLORS).find((k) => normalize(k) === normalize(categorie));
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.Autres;
};

/** Coloured category label with its icon ("🎥 Image", "💡 Lumière"…). */
export function CategoryChip({ categorie }) {
  if (!categorie) return null;
  const { bg, fg } = colorsFor(categorie);
  const Icon = iconForCategory(categorie);
  return (
    <span className="cat-chip" style={{ background: bg, color: fg }}>
      <Icon className="cat-chip-icon" aria-hidden="true" />
      {labelFor(CATEGORIES, categorie)}
    </span>
  );
}

/**
 * Thumbnail (click to enlarge). Without a photo: the category icon on the category colour,
 * so rows keep the same height and the item is still recognisable at a glance.
 */
export function MaterielThumb({ materiel, size = 'sm' }) {
  if (materiel.url_pic) {
    return <ModalImage className={`mat-thumb mat-thumb--${size}`} small={materiel.url_pic} large={materiel.url_pic} alt={materiel.label} />;
  }
  if (!materiel.categorie) {
    return (
      <div className={`mat-thumb-empty mat-thumb-empty--${size}`} title="Pas de photo">
        <ImageOutlinedIcon fontSize="small" />
      </div>
    );
  }
  const { bg, fg } = colorsFor(materiel.categorie);
  const Icon = iconForCategory(materiel.categorie);
  return (
    <div className={`mat-thumb-empty mat-thumb-empty--${size}`} style={{ background: bg, color: fg }}
      title={`Pas de photo (${labelFor(CATEGORIES, materiel.categorie)})`}>
      <Icon />
    </div>
  );
}

/** Stock: the number, or a red "Épuisé" badge at 0. */
export function StockBadge({ quantite }) {
  if (Number(quantite) > 0) return <span className="stock-count">{quantite}</span>;
  return <span className="stock-badge-out">Épuisé</span>;
}

/** Name in bold with the reference underneath. */
export function NameWithRef({ materiel }) {
  return (
    <div>
      <div className="mat-name">{materiel.label}</div>
      {materiel.ref && <div className="mat-ref">{materiel.ref}</div>}
    </div>
  );
}
