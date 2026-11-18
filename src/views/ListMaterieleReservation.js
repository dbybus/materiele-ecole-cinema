import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialTable from 'material-table';
import { Container } from 'react-bootstrap';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ModalImage from 'react-modal-image';
import MaterieleDataService from '../services/materiele.service';
import Loading from '../components/loading';
import MaterielPickerCards from '../components/MaterielPickerCards';
import FilterSelect from '../components/materiel/FilterSelect';
import { tableIcons, localizationFr, chfCurrencySetting } from '../components/table/materialTableConfig';
import {
  ALL, addToSelection, buildPickerRows, labelFor, matchesFilters, removeFromSelection,
} from '../components/materiel/materielUtils';
import { CATEGORIES, LIEUX } from '../constants/materiel';
import { useAuth0 } from '../auth';
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';
import useFitPageSize from '../hooks/useFitPageSize';

const common = require('../common');

/** − qty + control used in the table's first column. */
function QuantityStepper({ row, onAdd, onRemove }) {
  return (
    <div className="picker-stepper" style={{ display: 'inline-flex' }}>
      <IconButton size="small" onClick={() => onRemove(row)} disabled={row.tempMateriel === 0} aria-label="Retirer">
        <RemoveIcon fontSize="small" />
      </IconButton>
      <span className="picker-qty">{row.tempMateriel}</span>
      <IconButton size="small" color="primary" onClick={() => onAdd(row)} disabled={row.quantiteDisp === 0}
        aria-label="Ajouter" title={row.quantiteDisp === 0 ? 'Plus disponible pour ces dates' : 'Ajouter'}>
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

/**
 * Step 2 of the reservation wizard: choose equipment and quantities.
 *
 * Props (owned by AddReservation):
 *  - materiel / setMateriel:   the selection [{ id, ref, label, tarifLoc, quantite }]
 *  - materielReserve:          quantities already reserved by others on the chosen dates [{ id, quantite }]
 *  - allMateriele / setAllMateriele: catalog cache, so going back and forth between steps doesn't refetch
 *  - bottomGap: space to keep free under the table (e.g. for a sticky action bar)
 */
function ListMaterieleReservation({ materiel, setMateriel, materielReserve, allMateriele, setAllMateriele, bottomGap = 24 }) {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const { getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(allMateriele.length === 0);
  const [filters, setFilters] = useState({ categorie: ALL, lieu: ALL });

  // ---------- Data ----------

  const loadCatalog = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const { data } = await MaterieleDataService.getAll(token);
      setAllMateriele(data);
    } catch (error) {
      console.error('Could not load materials', error);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, setAllMateriele]);

  // Fetch once; the cached catalog is reused when coming back to this step
  useEffect(() => {
    if (allMateriele.length === 0) loadCatalog();
  }, [allMateriele.length, loadCatalog]);

  // Availability, selected count and line total are derived, never stored on the rows
  const rows = useMemo(
    () => buildPickerRows(allMateriele, materielReserve, materiel).filter((m) => matchesFilters(m, filters)),
    [allMateriele, materielReserve, materiel, filters]
  );

  // ---------- Selection ----------

  const addOne = (row) => {
    if (row.quantiteDisp > 0) setMateriel((selection) => addToSelection(selection, row));
  };
  const removeOne = (row) => setMateriel((selection) => removeFromSelection(selection, row.id));

  const selectedCount = materiel.reduce((sum, line) => sum + line.quantite, 0);
  const perDay = common.calcTotalPrice(materiel);

  // ---------- Table setup ----------

  const { containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage } =
    useFitPageSize({ data: rows, fallbackRowHeight: 64, bottomGap });

  const filterControls = {
    categorie: (
      <FilterSelect value={filters.categorie} options={CATEGORIES} allLabel="Toutes catégories"
        onChange={(categorie) => setFilters((f) => ({ ...f, categorie }))} />
    ),
    lieu: (
      <FilterSelect value={filters.lieu} options={LIEUX} allLabel="Tous les lieux"
        onChange={(lieu) => setFilters((f) => ({ ...f, lieu }))} />
    ),
  };

  if (loading) {
    return <Container className="d-flex justify-content-center align-items-center"><Loading /></Container>;
  }

  // Phones: card list with a +/- stepper instead of a wide table
  if (isMobile) {
    return (
      <MaterielPickerCards
        title="Liste du matériel"
        items={rows}
        selection={materiel}
        showSummary={false} // the wizard's action bar already shows the selection total
        onAdd={addOne}
        onRemove={removeOne}
        filters={<>{filterControls.categorie}{filterControls.lieu}</>}
      />
    );
  }

  const nameWidth = isCompact ? 160 : 220;
  const columns = [
    {
      title: 'Quantité', field: 'tempMateriel', width: 150, sorting: false, searchable: false,
      render: (row) => <QuantityStepper row={row} onAdd={addOne} onRemove={removeOne} />,
    },
    { title: 'Nom', field: 'label', cellStyle: { minWidth: nameWidth }, headerStyle: { minWidth: nameWidth } },
    {
      title: 'Image', field: 'url_pic', width: 90, sorting: false, searchable: false,
      render: (row) => row.url_pic
        ? <ModalImage className="mat-thumb mat-thumb--sm" small={row.url_pic} large={row.url_pic} alt={row.label} />
        : null,
    },
    { title: 'Catégorie', field: 'categorie', width: 130, render: (row) => labelFor(CATEGORIES, row.categorie) },
    {
      title: 'Disponible', field: 'quantiteDisp', type: 'numeric', width: 110,
      cellStyle: (value) => ({ color: value === 0 ? '#c62828' : undefined, fontWeight: value === 0 ? 600 : undefined }),
    },
    { title: 'Stock', field: 'Qtotale', type: 'numeric', width: 90, hidden: isCompact },
    { title: 'Tarif / jour', field: 'tarifLoc', type: 'currency', currencySetting: chfCurrencySetting, width: 120 },
    { title: 'Lieu', field: 'lieu', width: 110, hidden: isCompact, render: (row) => labelFor(LIEUX, row.lieu) },
    { title: 'Total / jour', field: 'prixTotal', type: 'currency', currencySetting: chfCurrencySetting, width: 120 },
  ];

  const title = selectedCount > 0
    ? `Liste du matériel — ${selectedCount} article${selectedCount > 1 ? 's' : ''}, ${common.formatCHF(perDay)}/jour`
    : 'Liste du matériel';

  return (
    <Container className="table-view" ref={containerRef}>
      <MaterialTable
        title={title}
        tableRef={tableRef}
        icons={tableIcons}
        localization={localizationFr}
        columns={columns}
        data={rows}
        onChangeRowsPerPage={onChangeRowsPerPage}
        actions={[
          { icon: () => filterControls.categorie, tooltip: 'Filtrer par catégorie', isFreeAction: true },
          { icon: () => filterControls.lieu, tooltip: 'Filtrer par lieu', isFreeAction: true },
        ]}
        options={{
          padding: 'dense',
          pageSize,
          pageSizeOptions,
          emptyRowsWhenPaging: false,
          // Selected lines stand out; the others keep the zebra striping
          rowStyle: (row, index) => (row.tempMateriel > 0
            ? { background: '#f4f5fd' }
            : index % 2 === 0 ? { background: '#f5f5f5' } : null),
        }}
      />
    </Container>
  );
}

export default ListMaterieleReservation;
