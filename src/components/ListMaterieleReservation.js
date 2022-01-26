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
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import Loading from './loading';
import {Select, MenuItem} from '@material-ui/core'

function ListMaterieleReservation(props) {

  const { materiel, setMateriel, materielReserve, visitedStep2, allMateriele, setAllMateriele} = props;
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
  
  //console.log("Materiel encore reserve", materielReserve)
  const getAllMateriele = async () => {
    
      const response = await MaterieleDataService.getAll();
      let newArray = [...response.data];
      
      newArray.map((element, index) => {  
        //Add temporary attribute quantite disponible
        newArray[index].quantiteDisp = element.Qtotale;
        newArray[index].tempMateriel = 0;
        newArray[index].prixTotal = 0;

        //Verify if material is reserved and which quantity 
        const materielTemp = materielReserve.find(item => item.id === element.id);
        
        if (materielTemp != undefined) {
          newArray[index].quantiteDisp = element.Qtotale - materielTemp.quantite;
        }
      })
      //console.log("MATOS RESERVE ", materielReserve)
      //setAllMateriele(filterCategorie=== 'all' ? newArray : newArray.filter(item => item.categorie === filterCategorie))
      setAllMateriele(filterCategorie === 'all' && filterLieu === 'all'? newArray : newArray.filter(item => (item.categorie === filterCategorie && filterLieu === 'all') || (item.lieu === filterLieu &&  filterCategorie === 'all') || (item.categorie === filterCategorie && item.lieu === filterLieu)));
  };

  useEffect(() =>{
    //console.log("LIST MATERIAL VISITED STEP 2 ",visitedStep2)

    if(!visitedStep2){
      getAllMateriele().finally(() => {
        setLoading(false);
      });
    }else{
      setLoading(false);
    }

  },[loading, filterCategorie, filterLieu])

  return (
    loading ? <Container className="d-flex justify-content-center align-items-center"><Loading /></Container> :  
    <Container>
    <MaterialTable 
      icons={tableIcons}
      options = {{
        rowStyle: (index) => index%2 == 0 ? {background:"#f5f5f5"} : null 
      }}
      columns={[
        { title: 'Nom', field: 'label', editable: 'never' },
        { title: 'Image', field: 'image', render: item => <img src={item.url_pic} alt="" border="3" height="200" width="200" />, editable: 'never'},
        { title: 'Category', field: 'categorie', editable: 'never'},
        { title: 'Disponible', field: 'quantiteDisp', type: 'numeric'},
        { title: 'Quantite', field: 'Qtotale', type: 'numeric'},
        { title: 'Tarif', field: 'tarifLoc', editable: 'never', type: 'currency', currencySetting:{ locale: 'fr-CH',currencyCode:'CHF', minimumFractionDigits:0, maximumFractionDigits:2}},
        { title: 'Lieu', field: 'lieu', editable: 'never'},
        { title: 'Total', field: 'prixTotal', editable: 'never', type: 'currency', currencySetting:{ locale: 'fr-CH',currencyCode:'CHF', minimumFractionDigits:0, maximumFractionDigits:2}}
      ]}
      data={allMateriele}
      actions={[
        {
          icon: () => <Select
          style={{width:100}}
          value={filterCategorie}
          onChange={(e)=>setFilterCategorie(e.target.value)}
        >
          <MenuItem value={"all"}><em>All</em></MenuItem>
          <MenuItem value={"image"}>Image</MenuItem>
          <MenuItem value={"lumiere"}>Lumière</MenuItem>
          <MenuItem value={"son"}>Son</MenuItem>
          <MenuItem value={"moniteur"}>Moniteur</MenuItem>
          <MenuItem value={"trepieds"}>Trepieds</MenuItem>
          <MenuItem value={"machinerie"}>Machinerie</MenuItem>
          <MenuItem value={"autres"}>Autres</MenuItem>
        </Select>,
          tooltip: 'Choisir la catégorie',
          isFreeAction: true,
        },
        {
          icon: () => <Select
          style={{width:100}}
          value={filterLieu}
          onChange={(e)=>setFilterLieu(e.target.value)}
        >
          <MenuItem value={"all"}><em>All</em></MenuItem>
          <MenuItem value={"Geneve"}>Genève</MenuItem>
          <MenuItem value={"Lausanne"}>Lausanne</MenuItem>
        </Select>,
          tooltip: 'Choisir l\'emplacement',
          isFreeAction: true,
        },
        rowData => ({
          icon: () => <AddBox style={{color: rowData.quantiteDisp != 0 ? 'blue' : 'red'}}/>,
          tooltip: rowData.quantiteDisp === 0 ? 'Quantite disponible 0' : 'Ajouter matériel à la reservation',
          disabled: rowData.quantiteDisp === 0,
          onClick: (event, rowData) =>{
            const dataUpdate = [...allMateriele];
            const index = rowData.tableData.id;
            
            console.log("Added item ", dataUpdate[index])
            
            if(dataUpdate[index].quantiteDisp !== 0){
              dataUpdate[index].quantiteDisp -=1;
              dataUpdate[index].tempMateriel +=1;
              dataUpdate[index].prixTotal += dataUpdate[index].tarifLoc;
              setAllMateriele([...dataUpdate]);

              const temp = materiel.find(item => item.id === rowData.id);
              if(temp !== undefined){
                temp.quantite += 1; 
              }else{
                setMateriel(oldArray => [...oldArray, {
                  id: rowData.id,
                  quantite: 1,
                  label: rowData.label,
                  tarifLoc: rowData.tarifLoc
                }])
              }
            }           
          } 
        }),
        rowData => ({
          icon: () => <span><h5>{rowData.tempMateriel}</h5></span>,
          disabled: true,
        }),
        rowData => ({
          icon: () => <IndeterminateCheckBoxIcon style={{color: rowData.tempMateriel != 0 ? 'blue' : 'red'}}/>,
          disabled: rowData.tempMateriel !== 0 ? false : true,
          tooltip: rowData.tempMateriel !== 0 ? ' Retirer matériel de la réservation' : 'Quantité maximale déjà réservée',
          onClick : () => {
            const dataUpdate = [...allMateriele];
            const index = rowData.tableData.id;

            if(dataUpdate[index].tempMateriel !== 0){
              dataUpdate[index].quantiteDisp += 1;

              dataUpdate[index].tempMateriel -= 1;
              dataUpdate[index].prixTotal -= dataUpdate[index].tarifLoc;
              setAllMateriele([...dataUpdate]);

              const temp = materiel.find(item => item.id === rowData.id)
              
              if (temp != undefined) {
                temp.quantite -= 1
                if(temp.quantite === 0){
                  //If quantity is 0 remove the objec from json string
                  materiel.forEach((element, index, object) => {
                    if(element.quantite === 0){
                      object.splice(index, 1);
                    }
                  })
                  console.log("Si quantite 0 l'objet efface", materiel)
                }
              }
            }
          }
        })
      ]}
    title="Liste du matériél"
    />
  </Container>
   
    
  )
}

export default ListMaterieleReservation
