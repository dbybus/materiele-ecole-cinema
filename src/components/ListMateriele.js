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

function ListMateriele() {
    const [allMateriele, setAllMateriele] = useState([])

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

            console.log("Get all materials successfully!");
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
            { title: 'Nom', field: 'label' },
            { title: 'Reference', field: 'ref' },
            { title: 'Image', field: 'img', render: item => <img src={'/img/'+item.label+'.jpg'} alt="" border="3" height="200" width="200" />},
            { title: 'Quantite', field: 'Qtotale'},
            { title: 'Category', field: 'categorie'},
            { title: 'Tarif', field: 'tarifLoc'},
            { title: 'Valeur', field: 'valRemp'},
            { title: 'Lieu', field: 'lieu'},
            { title: 'Degré', field: 'lieu'},
          ]}
          data={allMateriele}
         
          title="Liste des matériaux"
        />
      </Container>
    )
}

export default ListMateriele
