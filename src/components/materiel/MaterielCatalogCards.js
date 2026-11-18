import React, { useMemo, useState } from 'react';
import { IconButton, InputAdornment, Menu, MenuItem, TextField } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import { CategoryChip, MaterielThumb } from './MaterielDisplay';
import { LIEUX } from '../../constants/materiel';
import { labelFor, normalize } from './materielUtils';

const common = require('../../common');
const PAGE_SIZE = 15;

/**
 * Phone version of the equipment list: one card per item.
 * Admins get a ⋮ menu with Modifier / Supprimer (`onEdit(item)`, `onDelete(item)`).
 */
export default function MaterielCatalogCards({ items, isAdmin, onEdit, onDelete, header }) {
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [menu, setMenu] = useState(null); // { anchor, item }

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return items;
    return items.filter((m) => [m.label, m.ref, m.categorie, m.lieu].some((v) => normalize(v).includes(q)));
  }, [items, search]);

  const closeMenu = () => setMenu(null);

  return (
    <div className="picker">
      <div className="picker-header">
        <TextField
          fullWidth size="small" variant="outlined" placeholder="Rechercher un article"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {header}
      </div>

      {filtered.length === 0 && <p className="text-muted text-center py-4 mb-0">Aucun matériel trouvé</p>}

      <ul className="picker-list">
        {filtered.slice(0, visible).map((m) => (
          <li key={m.id} className="picker-card">
            <div className="picker-thumb"><MaterielThumb materiel={m} size="md" /></div>
            <div className="picker-body">
              <div className="picker-title">{m.label}</div>
              {m.ref && <div className="picker-meta">{m.ref}</div>}
              <div className="d-flex flex-wrap align-items-center gap-1 mt-1">
                <CategoryChip categorie={m.categorie} />
                <span className="picker-meta">{labelFor(LIEUX, m.lieu)}</span>
              </div>
              <div className="picker-meta mt-1">
                {Number(m.Qtotale) > 0
                  ? <span className="text-success">{m.Qtotale} en stock</span>
                  : <span className="text-danger fw-bold">Épuisé</span>}
                {' · '}{common.formatCHF(m.tarifLoc)}/jour
              </div>
            </div>
            {isAdmin && (
              <IconButton size="small" aria-label={`Actions pour ${m.label}`} onClick={(e) => setMenu({ anchor: e.currentTarget, item: m })}>
                <MoreVertIcon />
              </IconButton>
            )}
          </li>
        ))}
      </ul>

      {visible < filtered.length && (
        <button type="button" className="btn btn-outline-secondary w-100 mb-3" onClick={() => setVisible(visible + PAGE_SIZE)}>
          Afficher plus ({filtered.length - visible} restants)
        </button>
      )}

      <Menu anchorEl={menu && menu.anchor} open={!!menu} onClose={closeMenu} keepMounted={false}>
        <MenuItem onClick={() => { onEdit(menu.item); closeMenu(); }}>Modifier</MenuItem>
        <MenuItem className="text-danger" onClick={() => { onDelete(menu.item); closeMenu(); }}>Supprimer</MenuItem>
      </Menu>
    </div>
  );
}
