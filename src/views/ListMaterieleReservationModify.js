import React, { useEffect, useState, forwardRef } from 'react'
import MaterieleDataService from "../services/materiele.service";
import MaterialTable from 'material-table'
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import {Container} from 'react-bootstrap'
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import Loading from '../components/loading';
import { useAuth0 } from '../auth';
import ModalImage from "react-modal-image";
import MaterielPickerCards from '../components/MaterielPickerCards';

const common = require('../common');

function ListMaterieleReservationModify(props) {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();

  const { getAccessTokenSilently } = useAuth0();
  const { reservation, allReservations, materielRef} = props;
  const [allMateriels, setAllMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [filterLieu, setFilterLieu] = useState("all");

  const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };
  
  const getAllMateriele = async () => {
    
      const findByDate = allReservations.filter(item => common.dateRangeOverlaps(reservation.StartTime, reservation.EndTime, new Date(item.date_start), new Date(item.date_end)));
      console.log(reservation);
      var reservedMaterialList = [];

      findByDate.map((reserv, index) => {
        reserv.getReservation.map(mat => {
          const temp = reservedMaterialList.find(item => item.id === mat.getMateriel.id);

          if (temp !== undefined) {
              temp.quantite += mat.quantite;
              if(findByDate[(index-1).toString()] !== undefined){
                  //If current date doesnt overlap next reservation 
                  if(!common.dateRangeOverlaps(findByDate[index-1].date_start, findByDate[index-1].date_end, findByDate[index].date_start, findByDate[index].date_end)){
                      temp.quantite -= mat.quantite;
                  }  
              }
            } else {
                reservedMaterialList.push({
                    id: mat.getMateriel.id,
                    quantite: mat.quantite
                })
            }

            console.log(reservedMaterialList)
        })   
      })

      getAccessTokenSilently().then(async token => {
        const response = await MaterieleDataService.getAll(token);
        let newArray = [...response.data];

        newArray.map((element, index) => {  
          //Add temporary attribute quantite disponible
          newArray[index].quantiteDisp = element.Qtotale;
          newArray[index].tempMateriel = 0;
          newArray[index].prixTotal = 0;

          //Verify if material is reserved and which quantity 
          const materielTemp = reservedMaterialList.find(item => item.id === element.id);
        
          if (materielTemp != undefined) {

            newArray[index].quantiteDisp = element.Qtotale - materielTemp.quantite;
            
            const filterReserv = reservation.materiel.find(item => item.id === materielTemp.id);

            if(filterReserv !== undefined){
              newArray[index].tempMateriel = materielTemp.quantite;
            }
          }
        })

        setAllMateriels(filterCategorie === 'all' && filterLieu === 'all'? newArray : newArray.filter(item => (item.categorie === filterCategorie && filterLieu === 'all') 
        || (item.lieu === filterLieu &&  filterCategorie === 'all') 
        || (item.categorie === filterCategorie && item.lieu === filterLieu)));
      })
  };

  useEffect(() =>{
    getAllMateriele().finally(() => {
      setLoading(false);
    });

  },[loading])

  // Add one unit (used by the table and the mobile cards). Changes are collected in materielRef.
  const addOne = (row) => {
    const dataUpdate = [...allMateriels];
    const index = dataUpdate.findIndex(item => item.id === row.id);
    if (index === -1 || dataUpdate[index].quantiteDisp === 0) return;

    dataUpdate[index].quantiteDisp -= 1;
    dataUpdate[index].tempMateriel += 1;
    dataUpdate[index].prixTotal += dataUpdate[index].tarifLoc;
    setAllMateriels(dataUpdate);

    const matos = materielRef.current.find(element => element.id === row.id);
    if (matos !== undefined) {
      matos.quantite += 1;
    } else {
      materielRef.current.push({
        id: row.id,
        label: row.label,
        quantite: 1,
        tarifLoc: row.tarifLoc
      });
    }
  };

  // Remove one unit. A negative quantite in materielRef means "remove from the existing reservation".
  const removeOne = (row) => {
    const dataUpdate = [...allMateriels];
    const index = dataUpdate.findIndex(item => item.id === row.id);
    if (index === -1 || dataUpdate[index].tempMateriel === 0) return;

    dataUpdate[index].quantiteDisp += 1;
    dataUpdate[index].tempMateriel -= 1;
    dataUpdate[index].prixTotal -= dataUpdate[index].tarifLoc;
    setAllMateriels(dataUpdate);

    const temp = materielRef.current.find(item => item.id === row.id);
    if (temp !== undefined) {
      temp.quantite -= 1;
      if (temp.quantite === 0) {
        materielRef.current = materielRef.current.filter(item => item.id !== row.id);
      }
    } else {
      materielRef.current.push({
        id: row.id,
        label: row.label,
        quantite: -1,
        tarifLoc: row.tarifLoc
      });
    }
  };

  if (loading) {
    return <Container className="d-flex justify-content-center align-items-center"><Loading /></Container>;
  }

  // Phones: card list with a +/- stepper instead of a wide table
  if (isMobile) {
    return (
      <MaterielPickerCards
        title="Liste du matériel"
        items={allMateriels}
        onAdd={addOne}
        onRemove={removeOne}
      />
    );
  }

  return (
    <Container className="table-view">
      <MaterialTable 
        id="TableID"
        icons={tableIcons}
        options = {{
          rowStyle: (index) => index%2 == 0 ? {background:"#f5f5f5"} : null,
          pageSize:20,
          pageSizeOptions:[20,40, 60]  
        }}
        columns={[
          { title: 'Nom', field: 'label', cellStyle: { minWidth: 160 }, headerStyle: { minWidth: 160 }, editable: 'never' },
          { title: 'Image', field: 'image', render: item => <ModalImage className="mat-thumb" small={item.url_pic} large={item.url_pic} alt={item.label} />, editable: 'never'},
          { title: 'Category', field: 'categorie', editable: 'never'},
          { title: 'Disponible', field: 'quantiteDisp', type: 'numeric'},
          { title: 'Quantite', field: 'Qtotale', hidden: isCompact, type: 'numeric'},
          { title: 'Tarif', field: 'tarifLoc', editable: 'never', type: 'currency', currencySetting:{ locale: 'fr-CH',currencyCode:'CHF', minimumFractionDigits:0, maximumFractionDigits:2}},
          { title: 'Lieu', field: 'lieu', hidden: isCompact, editable: 'never'},
          { title: 'Total', field: 'prixTotal', editable: 'never', type: 'currency', currencySetting:{ locale: 'fr-CH',currencyCode:'CHF', minimumFractionDigits:0, maximumFractionDigits:2}}
        ]}
        data={allMateriels}
        actions={[
          rowData => ({
            icon: () => <AddBox style={{color: rowData.quantiteDisp != 0 ? 'blue' : 'red'}}/>,
            tooltip: rowData.quantiteDisp === 0 ? 'Quantite disponible 0' : 'Ajouter matériel à la reservation',
            disabled: rowData.quantiteDisp === 0,
            onClick: () => addOne(rowData)
          }),
          rowData => ({
            icon: () => <span><h5>{rowData.tempMateriel}</h5></span>,
            disabled: true,
          }),
          rowData => ({
            icon: () => <IndeterminateCheckBoxIcon style={{color: rowData.tempMateriel != 0 ? 'blue' : 'red'}}/>,
            disabled: rowData.tempMateriel !== 0 ? false : true,
            tooltip: rowData.tempMateriel !== 0 ? ' Retirer matériel de la réservation' : 'Quantité maximale déjà réservée',
            onClick: () => removeOne(rowData)
          })
        ]}
      title="Liste du matériél"
      />
    </Container>
  )
}

export default ListMaterieleReservationModify
