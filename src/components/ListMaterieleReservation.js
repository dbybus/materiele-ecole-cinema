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
  const [allMateriele, setAllMateriele] = useState([]);
  const [asyncCall, setAsyncCall] = useState(false);

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
  
  //console.log("Materiel encore reserve", materielReserve)
  const getAllMateriele = async () => {
    
    const response = await MaterieleDataService.getAll();
    
    response.data.forEach(element => {  
      //Add temporary attribute quantite disponible
      element.quantiteDisp = element.Qtotale;
      //Verify if material is reserved and which quantity 
      const materielTemp = materielReserve.find(item => item.id_materiel=== element.id);
      
      if (materielTemp != undefined) { 
        //console.log("Materiel Reserve", materielTemp)
        
        //Reduce rezerved quantity from total amount 
        element.quantiteDisp = element.Qtotale - materielTemp.quantite;
      }

      //useEffect trigger after async call 
      setAsyncCall(true)       
    })

    setAllMateriele(response.data);
  };

  useEffect(() =>{
      getAllMateriele();
      console.log("Materiel ",allMateriele)
  },[asyncCall])

  return (
    <Container>
      <MaterialTable 
        icons={tableIcons}
        columns={[
          { title: 'Nom', field: 'label', editable: 'never' },
          { title: 'Image', field: 'image', render: item => <img src={item.url_pic} alt="" border="3" height="200" width="200" />, editable: 'never'},
          { title: 'Category', field: 'categorie', editable: 'never'},
          { title: 'Quantite Disponible', field: 'quantiteDisp'},
          { title: 'Quantite Totale', field: 'Qtotale'},
          { title: 'Tarif', field: 'tarifLoc', editable: 'never'},
          { title: 'Lieu', field: 'lieu', editable: 'never'},
          { title: 'Total', field: 'total', editable: 'never'}
        ]}
        data={allMateriele}
        actions={[
          rowData => ({
            icon: () => <AddBox style={{color: rowData.quantiteDisp != 0 ? 'blue' : 'red'}}/>,
            tooltip: rowData.quantiteDisp === 0 ? 'Quantite disponible 0' :'Ajoute materiel au reservation',
            disabled: rowData.quantiteDisp === 0,
            onClick: (event, rowData) =>{
              const dataUpdate = [...allMateriele];
              const index = rowData.tableData.id;
              
              console.log("Clicked item ", dataUpdate[index])
              
              if(dataUpdate[index].quantiteDisp === 0){
                alert("Qantite maximum deja reserve")
              }else{
                //update quantite disponible 
                dataUpdate[index].quantiteDisp -=1;
                setAllMateriele([...dataUpdate]);

                //Count how many new reserved material 
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
          })
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
