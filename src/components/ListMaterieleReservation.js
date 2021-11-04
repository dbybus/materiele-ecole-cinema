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
import {useAuth0} from "@auth0/auth0-react"


function ListMaterieleReservation(props) {
  const { materiel, setMateriel, materielReserve } = props;
  //const [user, loading, error] = useAuthState(auth);
  const [allMateriele, setAllMateriele] = useState([]);
  //const [token, setToken] = useState('')
  const {user, getAccessTokenSilently} = useAuth0()
  const { uid, name, picture, email } = user;
  console.log(materielReserve)
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
    MaterieleDataService.getAll()
    .then(response => {
      
      setAllMateriele(response.data);
    })
    .catch((e) => {
      console.log(e);
    });
  };

  useEffect(() =>{
      getAllMateriele();
  },[])

  return (
    <Container>
      <MaterialTable 
        icons={tableIcons}
        
        columns={[
          { title: 'Nom', field: 'label', editable: 'never' },
          { title: 'Image', field: 'image', render: item => <img src={item.url_pic} alt="" border="3" height="200" width="200" />, editable: 'never'},
          { title: 'Category', field: 'categorie', editable: 'never'},
          { title: 'Quantite', field: 'Qtotale', type: 'numeric'},
          { title: 'Tarif', field: 'tarifLoc', editable: 'never'},
          { title: 'Lieu', field: 'lieu', editable: 'never'},
          { title: 'Total', field: 'total', editable: 'never'}
        ]}
        data={allMateriele}
        actions={[
          {
            icon: () => <AddBox style={{color: 'blue'}}/>,
            tooltip: 'Ajoute materiel au reservation',
            onClick: (event, rowData) =>{
              const matos = materielReserve.find(item => item.id_materiel === rowData.id);
              
              if (matos != undefined) { // This is just for understanding. `undefined` inside `if` will give false. So you can use `if(!temp)`
                if(matos.quantite >= rowData.Qtotale){
                  alert("Qantite maximum deja reserve")
                }
              }

              const temp = materiel.find(item => item.id_materiel === rowData.id)
              if (temp != undefined) { // This is just for understanding. `undefined` inside `if` will give false. So you can use `if(!temp)`
                temp.quantite+= 1
              } else {
                setMateriel(oldArray => [...oldArray, {
                  id_materiel: rowData.id,
                  quantite: 1
                }])
              }
            } 
          }
        ]}
       
        /* cellEditable={{
          onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
            return new Promise((resolve, reject) => {
              console.log('newValue: ' + newValue);
              setTimeout(resolve, 1000);
            });
          }
        }} */
      title="Liste des matériaux"
      />
    </Container>
    
  )
}

export default ListMaterieleReservation
