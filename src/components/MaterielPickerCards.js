import React, { useMemo, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';
import ModalImage from 'react-modal-image';
import { labelFor } from './materiel/materielUtils';
import { CategoryChip } from './materiel/MaterielDisplay';
import { LIEUX } from '../constants/materiel';

const PAGE_SIZE = 20;

const chf = (value) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 2 }).format(value || 0);

/**
 * Mobile replacement for the material-table used to pick equipment for a reservation.
 *
 * Props:
 *  - items:    the same rows the table shows ({ id, label, url_pic, categorie, lieu, quantiteDisp, tempMateriel, tarifLoc, prixTotal })
 *  - onAdd / onRemove: called with the row, same handlers the table actions use
 *  - filters:  optional extra controls (category / location selects) rendered under the search box
 *  - title:    list heading
 *  - selection: optional full selection [{ quantite, tarifLoc }] for the summary bar. Pass it when `items`
 *              is filtered, otherwise selected items hidden by a filter would be missing from the total.
 */
export default function MaterielPickerCards({ items, onAdd, onRemove, filters, title, selection, showSummary = true }) {
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.label, item.ref, item.categorie, item.lieu].some((v) => v && String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  const summaryLines = selection
    ? selection.map((line) => ({ quantite: line.quantite, tarifLoc: line.tarifLoc }))
    : items.map((item) => ({ quantite: item.tempMateriel > 0 ? item.tempMateriel : 0, tarifLoc: item.tarifLoc }));
  const selectedCount = summaryLines.reduce((sum, line) => sum + line.quantite, 0);
  const selectedTotal = summaryLines.reduce((sum, line) => sum + line.quantite * line.tarifLoc, 0);

  return (
    <div className="picker">
      <div className="picker-header">
        <h6 className="mb-2">{title}</h6>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Rechercher"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {filters && <div className="picker-filters">{filters}</div>}
      </div>

      {filtered.length === 0 && <p className="text-muted text-center py-4 mb-0">Aucun matériel trouvé</p>}

      <ul className="picker-list">
        {filtered.slice(0, visible).map((item) => {
          const qty = item.tempMateriel || 0;
          const soldOut = item.quantiteDisp <= 0;
          return (
            <li key={item.id} className={`picker-card${qty > 0 ? ' is-selected' : ''}`}>
              <div className="picker-thumb">
                {item.url_pic
                  ? <ModalImage className="picker-img" small={item.url_pic} large={item.url_pic} alt={item.label} />
                  : <div className="picker-img picker-img--empty" />}
              </div>

              <div className="picker-body">
                <div className="picker-title">{item.label}</div>
                <div className="picker-meta d-flex flex-wrap align-items-center gap-1 my-1">
                  <CategoryChip categorie={item.categorie} />
                  <span>{labelFor(LIEUX, item.lieu)}</span>
                </div>
                <div className="picker-meta">
                  <span className={soldOut ? 'text-danger' : 'text-success'}>
                    {soldOut ? 'Indisponible' : `${item.quantiteDisp} dispo.`}
                  </span>
                  {' · '}{chf(item.tarifLoc)}/jour
                </div>
              </div>

              <div className="picker-stepper" aria-label={`Quantité ${item.label}`}>
                <IconButton size="small" onClick={() => onRemove(item)} disabled={qty === 0} aria-label="Retirer">
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <span className="picker-qty">{qty}</span>
                <IconButton size="small" color="primary" onClick={() => onAdd(item)} disabled={soldOut} aria-label="Ajouter">
                  <AddIcon fontSize="small" />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>

      {visible < filtered.length && (
        <button type="button" className="btn btn-outline-secondary w-100 mb-3" onClick={() => setVisible(visible + PAGE_SIZE)}>
          Afficher plus ({filtered.length - visible} restants)
        </button>
      )}

      {showSummary && selectedCount > 0 && (
        <div className="picker-summary">
          <span><b>{selectedCount}</b> article{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}</span>
          <span><b>{chf(selectedTotal)}</b>/jour</span>
        </div>
      )}
    </div>
  );
}
