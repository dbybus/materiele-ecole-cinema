import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialTable from 'material-table';
import { Container } from 'react-bootstrap';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import MaterieleDataService from '../services/materiele.service';
import AddMateriele from './AddMateriele';
import ModalPopup from '../components/ModalPopup';
import { tableIcons, localizationFr, chfCurrencySetting } from '../components/table/materialTableConfig';
import { ImageEditor, NameRefEditor, SelectEditor } from '../components/materiel/MaterielEditors';
import { CategoryChip, MaterielThumb, NameWithRef, StockBadge } from '../components/materiel/MaterielDisplay';
import CategoryFilterChips from '../components/materiel/CategoryFilterChips';
import MaterielCatalogCards from '../components/materiel/MaterielCatalogCards';
import MaterielEditDialog from '../components/materiel/MaterielEditDialog';
import FilterSelect from '../components/materiel/FilterSelect';
import { ALL, labelFor, matchesFilters, normalize, toMaterielPayload } from '../components/materiel/materielUtils';
import { CATEGORIES, DEGRES, LIEUX } from '../constants/materiel';
import { useAuth0 } from '../auth';
import { hasAnyRole, ROLE } from '../auth/roles';
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';
import useFitPageSize from '../hooks/useFitPageSize';

// Deleting cascades in the database: say so before it happens
const DELETE_WARNING = 'Supprimer ce matériel ? Il sera aussi retiré de toutes les réservations.';

const localization = {
  ...localizationFr,
  body: {
    ...localizationFr.body,
    editRow: { ...localizationFr.body.editRow, deleteText: DELETE_WARNING },
  },
};

function ListMateriele() {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const { user, getAccessTokenSilently } = useAuth0();
  const isAdmin = hasAnyRole(user, ROLE.ADMIN);

  const [materiels, setMateriels] = useState([]);
  const [filters, setFilters] = useState({ categorie: ALL, lieu: ALL });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editing, setEditing] = useState(null); // item open in the phone edit dialog

  // ---------- Data ----------

  const loadMateriels = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const { data } = await MaterieleDataService.getAll(token);
      setMateriels(data);
    } catch (error) {
      console.error('Could not load materials', error);
    }
  }, [getAccessTokenSilently]);

  // Load on arrival and every time the "add" popup closes. Filtering is done locally (no refetch per filter).
  useEffect(() => {
    if (!showAddPopup) loadMateriels();
  }, [showAddPopup, loadMateriels]);

  // Location filter only: the category chips count from this list
  const materielsInLieu = useMemo(
    () => materiels.filter((m) => matchesFilters(m, { categorie: ALL, lieu: filters.lieu })),
    [materiels, filters.lieu]
  );
  const visibleMateriels = useMemo(
    () => materielsInLieu.filter((m) => matchesFilters(m, { categorie: filters.categorie, lieu: ALL })),
    [materielsInLieu, filters.categorie]
  );

  /**
   * Saves an edited row. Order matters: upload the new image first, then save the row with the
   * URL the server returned, and only then delete the old image. Rejecting keeps the row in edit mode.
   */
  const updateMateriel = async (newData, oldData) => {
    const token = await getAccessTokenSilently();
    const newImage = newData.image instanceof File ? newData.image : null;
    let url_pic = oldData.url_pic;

    try {
      if (newImage) {
        const formData = new FormData();
        formData.append('file', newImage);
        const { data } = await MaterieleDataService.uploadImgMat(formData, token);
        // Needs the API version that returns the saved file's URL (restart the API after updating it)
        if (!data || !data.url) throw new Error("L'API n'a pas renvoyé l'URL de l'image (redémarrer le serveur API ?)");
        url_pic = data.url;
      }
      await MaterieleDataService.update(oldData.id, { ...toMaterielPayload(newData), url_pic }, token);
    } catch (error) {
      console.error('Could not update material', error);
      // The row wasn't saved: don't leave the freshly uploaded image orphaned on disk
      if (newImage && url_pic !== oldData.url_pic) {
        MaterieleDataService.deleteImgMat({ url_pic }, token).catch(() => {});
      }
      alert("Le matériel n'a pas pu être enregistré.");
      throw error;
    }

    if (newImage && oldData.url_pic) {
      // Best effort: a leftover old file is harmless
      MaterieleDataService.deleteImgMat({ url_pic: oldData.url_pic }, token).catch(() => {});
    }
    await loadMateriels();
  };

  const deleteMateriel = async (oldData) => {
    const token = await getAccessTokenSilently();
    try {
      await MaterieleDataService.delete(oldData.id, token);
    } catch (error) {
      console.error('Could not delete material', error);
      alert("Le matériel n'a pas pu être supprimé.");
      throw error;
    }
    // Only once the row is gone: remove its image too (best effort)
    if (oldData.url_pic) {
      MaterieleDataService.deleteImgMat({ url_pic: oldData.url_pic }, token).catch(() => {});
    }
    await loadMateriels();
  };

  // Phones: the ⋮ menu's "Supprimer" (the table has its own inline confirmation)
  const confirmDelete = (materiel) => {
    if (window.confirm(`${materiel.label}\n\n${DELETE_WARNING}`)) deleteMateriel(materiel).catch(() => {});
  };

  // ---------- Table setup ----------

  // Rows per page = as many as fit in the window, so the table + pagination never scroll the page
  const { containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage } =
    useFitPageSize({ data: visibleMateriels, fallbackRowHeight: 64 });

  const nameWidth = isCompact ? 180 : 240;
  const columns = [
    {
      title: '', field: 'image', width: 72, sorting: false, searchable: false,
      render: (row) => <MaterielThumb materiel={row} />,
      editComponent: (props) => <ImageEditor value={props.value} onChange={props.onChange} />,
    },
    // Only "Nom" has no fixed width, so material-table gives it all the remaining space.
    // Shows the reference underneath; `ref` stays searchable through customFilterAndSearch.
    {
      title: 'Nom', field: 'label', cellStyle: { minWidth: nameWidth }, headerStyle: { minWidth: nameWidth },
      render: (row) => <NameWithRef materiel={row} />,
      editComponent: (props) => <NameRefEditor rowData={props.rowData} onRowDataChange={props.onRowDataChange} />,
      customFilterAndSearch: (term, row) => [row.label, row.ref].some((v) => normalize(v).includes(normalize(term))),
    },
    {
      title: 'Catégorie', field: 'categorie', width: 140,
      render: (row) => <CategoryChip categorie={row.categorie} />,
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={CATEGORIES} />,
    },
    {
      title: 'Stock', field: 'Qtotale', type: 'numeric', width: 100,
      render: (row) => <StockBadge quantite={row.Qtotale} />,
    },
    { title: 'Tarif / jour', field: 'tarifLoc', width: 120, type: 'currency', currencySetting: chfCurrencySetting },
    { title: 'Valeur', field: 'valRemp', hidden: isCompact, width: 120, type: 'currency', currencySetting: chfCurrencySetting },
    {
      title: 'Lieu', field: 'lieu', width: 110,
      render: (row) => labelFor(LIEUX, row.lieu),
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={LIEUX} />,
    },
    {
      title: 'Degré', field: 'degre', hidden: isCompact, width: 130, cellStyle: { whiteSpace: 'nowrap' },
      render: (row) => <span className="text-muted">{labelFor(DEGRES, row.degre) ?? 'Aucun'}</span>,
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={DEGRES} />,
    },
  ];

  // Filters shared by the table and the phone cards
  const lieuFilter = (
    <FilterSelect value={filters.lieu} options={LIEUX} allLabel="Tous les lieux"
      onChange={(lieu) => setFilters((f) => ({ ...f, lieu }))} />
  );
  const categoryChips = (
    <CategoryFilterChips materiels={materielsInLieu} value={filters.categorie}
      onChange={(categorie) => setFilters((f) => ({ ...f, categorie }))} />
  );

  // ---------- Render ----------

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Matériel</h1>
          <p className="page-subtitle">
            {visibleMateriels.length === materiels.length
              ? `${materiels.length} article${materiels.length > 1 ? 's' : ''}`
              : `${visibleMateriels.length} sur ${materiels.length} articles`}
          </p>
        </div>
        {isAdmin && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setShowAddPopup(true)}>
            {isMobile ? 'Ajouter' : 'Ajouter du matériel'}
          </Button>
        )}
      </header>

      {isMobile ? (
        <MaterielCatalogCards
          items={visibleMateriels}
          isAdmin={isAdmin}
          onEdit={setEditing}
          onDelete={confirmDelete}
          header={<div className="mt-2">{categoryChips}<div className="picker-filters">{lieuFilter}</div></div>}
        />
      ) : (
        <>
          {categoryChips}
          <Container className="table-view materiel-table" ref={containerRef}>
            <MaterialTable
              title=""
              tableRef={tableRef}
              icons={tableIcons}
              localization={localization}
              columns={columns}
              data={visibleMateriels}
              actions={[{ icon: () => lieuFilter, tooltip: 'Filtrer par lieu', isFreeAction: true }]}
              onChangeRowsPerPage={onChangeRowsPerPage}
              options={{
                padding: 'dense',
                showTitle: false,
                searchFieldAlignment: 'left',
                searchFieldStyle: { minWidth: 280 },
                pageSize,
                pageSizeOptions,
                // Don't pad the last page with blank rows (they made the table as tall as a full page)
                emptyRowsWhenPaging: false,
                actionsColumnIndex: -1, // edit / delete at the end of the row
              }}
              editable={isAdmin ? { onRowUpdate: updateMateriel, onRowDelete: deleteMateriel } : undefined}
            />
          </Container>
        </>
      )}

      <ModalPopup title="Ajouter du matériel" openPopup={showAddPopup} setOpenPopup={setShowAddPopup}>
        {/* Closes only once the item exists; closing the popup reloads the list */}
        <AddMateriele existing={materiels} onCreated={() => setShowAddPopup(false)} onCancel={() => setShowAddPopup(false)} />
      </ModalPopup>

      <MaterielEditDialog
        materiel={editing}
        existing={materiels}
        onClose={() => setEditing(null)}
        onSave={(newData) => updateMateriel(newData, editing)}
      />
    </div>
  );
}

export default ListMateriele;
