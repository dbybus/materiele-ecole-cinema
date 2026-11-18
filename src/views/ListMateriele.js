import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialTable from 'material-table';
import { Container } from 'react-bootstrap';
import AddBox from '@material-ui/icons/AddBox';
import ModalImage from 'react-modal-image';
import MaterieleDataService from '../services/materiele.service';
import AddMateriele from './AddMateriele';
import ModalPopup from '../components/ModalPopup';
import { tableIcons, localizationFr, chfCurrencySetting } from '../components/table/materialTableConfig';
import { ImageEditor, SelectEditor } from '../components/materiel/MaterielEditors';
import FilterSelect from '../components/materiel/FilterSelect';
import { ALL, labelFor, matchesFilters, toMaterielPayload } from '../components/materiel/materielUtils';
import { CATEGORIES, DEGRES, LIEUX } from '../constants/materiel';
import { useAuth0 } from '../auth';
import { hasAnyRole, ROLE } from '../auth/roles';
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';
import useFitPageSize from '../hooks/useFitPageSize';

const localization = {
  ...localizationFr,
  body: {
    ...localizationFr.body,
    editRow: {
      ...localizationFr.body.editRow,
      // Deleting cascades in the database: say so before it happens
      deleteText: 'Supprimer ce matériel ? Il sera aussi retiré de toutes les réservations.',
    },
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

  const visibleMateriels = useMemo(
    () => materiels.filter((m) => matchesFilters(m, filters)),
    [materiels, filters]
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

  // ---------- Table setup ----------

  // Rows per page = as many as fit in the window, so the table + pagination never scroll the page
  const { containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage } =
    useFitPageSize({ data: visibleMateriels, fallbackRowHeight: isMobile ? 64 : 72 });

  const nameWidth = isCompact ? 160 : 220;
  const columns = [
    // Only "Nom" has no fixed width, so material-table gives it all the remaining space
    { title: 'Nom', field: 'label', cellStyle: { minWidth: nameWidth }, headerStyle: { minWidth: nameWidth } },
    { title: 'Référence', field: 'ref', hidden: isMobile, width: 130 },
    {
      title: 'Image', field: 'image', width: 100, sorting: false, searchable: false,
      render: (row) => row.url_pic
        ? <ModalImage className="mat-thumb mat-thumb--sm" small={row.url_pic} large={row.url_pic} alt={row.label} />
        : null,
      editComponent: (props) => <ImageEditor value={props.value} onChange={props.onChange} />,
    },
    { title: 'Quantité', field: 'Qtotale', type: 'numeric', width: 100 },
    {
      title: 'Catégorie', field: 'categorie', hidden: isMobile, width: 130,
      render: (row) => labelFor(CATEGORIES, row.categorie),
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={CATEGORIES} />,
    },
    { title: 'Tarif', field: 'tarifLoc', hidden: isMobile, width: 110, type: 'currency', currencySetting: chfCurrencySetting },
    { title: 'Valeur', field: 'valRemp', hidden: isCompact, width: 120, type: 'currency', currencySetting: chfCurrencySetting },
    {
      title: 'Lieu', field: 'lieu', width: 110,
      render: (row) => labelFor(LIEUX, row.lieu),
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={LIEUX} />,
    },
    {
      title: 'Degré', field: 'degre', hidden: isCompact, width: 130, cellStyle: { whiteSpace: 'nowrap' },
      render: (row) => labelFor(DEGRES, row.degre) ?? 'Aucun',
      editComponent: (props) => <SelectEditor value={props.value} onChange={props.onChange} options={DEGRES} />,
    },
  ];

  const toolbarActions = [
    {
      icon: () => <FilterSelect value={filters.categorie} options={CATEGORIES} allLabel="Toutes catégories"
        onChange={(categorie) => setFilters((f) => ({ ...f, categorie }))} />,
      tooltip: 'Filtrer par catégorie',
      isFreeAction: true,
    },
    {
      icon: () => <FilterSelect value={filters.lieu} options={LIEUX} allLabel="Tous les lieux"
        onChange={(lieu) => setFilters((f) => ({ ...f, lieu }))} />,
      tooltip: 'Filtrer par lieu',
      isFreeAction: true,
    },
    {
      icon: () => <AddBox color="primary" />,
      tooltip: 'Ajouter nouveau matériel',
      isFreeAction: true,
      hidden: !isAdmin,
      onClick: () => setShowAddPopup(true),
    },
  ];

  // ---------- Render ----------

  return (
    <Container className="table-view" ref={containerRef}>
      <MaterialTable
        title="Liste du matériel"
        tableRef={tableRef}
        icons={tableIcons}
        localization={localization}
        columns={columns}
        data={visibleMateriels}
        actions={toolbarActions}
        onChangeRowsPerPage={onChangeRowsPerPage}
        options={{
          padding: 'dense',
          rowStyle: (row, index) => (index % 2 === 0 ? { background: '#f5f5f5' } : null),
          pageSize,
          pageSizeOptions,
          // Don't pad the last page with blank rows (they made the table as tall as a full page)
          emptyRowsWhenPaging: false,
        }}
        editable={isAdmin ? { onRowUpdate: updateMateriel, onRowDelete: deleteMateriel } : undefined}
      />

      <ModalPopup title="Ajouter nouveau matériel" openPopup={showAddPopup} setOpenPopup={setShowAddPopup}>
        <AddMateriele setOpenPopup={setShowAddPopup} />
      </ModalPopup>
    </Container>
  );
}

export default ListMateriele;
