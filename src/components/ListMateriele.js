import React, { useEffect, useState, forwardRef, Ima } from 'react'
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
import AddMateriele from './AddMateriele';
import ModalPopup from './ModalPopup';
import {useAuth0} from "@auth0/auth0-react"


function ListMateriele() {
  //const [user, loading, error] = useAuthState(auth);
  const [allMateriele, setAllMateriele] = useState([])
  const [openPopup, setOpenPopup] = useState(false)
  //const [token, setToken] = useState('')
  const {user, getAccessTokenSilently} = useAuth0()
  const { uid, name, picture, email } = user;
  const role = user['https://example-api/roles'];
  console.log("Here ",role[0], name)

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
    if(openPopup === false){
      getAllMateriele();
    }
  },[openPopup])

  return (
    <Container>
      <MaterialTable 
        icons={tableIcons}
        options = {{
          rowStyle: (data, index) => index%2 == 0 ? {background:"#f5f5f5"} : null 
        }}
        columns={[
          { title: 'Nom', field: 'label' },
          { title: 'Reference', field: 'ref' },
          { title: 'Image', field: 'image', render: item => <img src={item.url_pic} alt="" border="3" height="200" width="200" />},
          { title: 'Quantite', field: 'Qtotale'},
          { title: 'Category', field: 'categorie'},
          { title: 'Tarif', field: 'tarifLoc'},
          { title: 'Valeur', field: 'valRemp'},
          { title: 'Lieu', field: 'lieu'},
          { title: 'Degré', field: 'degre'},
        ]}
        data={allMateriele}
        
        actions={[
          {
            icon: () => <AddBox style={{color: 'blue'}}/>,
            tooltip: 'Ajoute nouveau materiel',
            isFreeAction: true,
            hidden: role[0] !== 'admin',
            onClick: () => {
              setOpenPopup(true)
              console.log("Clicked")
            }
          }
        ]}
        editable={{
          isEditHidden: rowData => role[0] !== 'admin',
          isDeleteHidden: rowData => role[0] !== 'admin',
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataUpdate = [...allMateriele];
                const index = oldData.tableData.id;
                MaterieleDataService.update(dataUpdate[index].id, newData);

                dataUpdate[index] = newData;
                setAllMateriele([...dataUpdate]);

                resolve();
              }, 1000)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...allMateriele];
                const index = oldData.tableData.id;

                //Delete material from db
                MaterieleDataService.delete(dataDelete[index].id);

                let data ={
                  url_pic: dataDelete[index].url_pic
                }

                MaterieleDataService.deleteImgMat(data);

                dataDelete.splice(index, 1);
                setAllMateriele([...dataDelete]);

                resolve();
              }, 1000)
            }),
        }}
      title="Liste des matériaux"
      />

      <ModalPopup title="Ajoute nouveau materiel"  openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AddMateriele setOpenPopup={setOpenPopup} method="post" enctype="multipart/form-data" />
      </ModalPopup>
    </Container>
    
  )
}

export default ListMateriele
