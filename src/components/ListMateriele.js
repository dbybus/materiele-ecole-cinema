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
import {Select, MenuItem} from '@material-ui/core'
import {enumToDegree, setImagePath} from './common'
import {Button} from '@material-ui/core'

function ListMateriele() {
  const [allMateriele, setAllMateriele] = useState([])
  const [openPopup, setOpenPopup] = useState(false)
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [filterLieu, setFilterLieu] = useState("all");
  //const [token, setToken] = useState('')
  const {user, getAccessTokenSilently} = useAuth0()
  const { uid, name, picture, email } = user;
  console.log(user)
  const roleAdmin = user['https://example-api/role'].find(element => element === 'Admin');
  console.log("Here ",roleAdmin, name)

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
      console.log(response)
      setAllMateriele(filterCategorie === 'all' && filterLieu === 'all'? response.data: response.data.filter(item => (item.categorie === filterCategorie && filterLieu === 'all') || (item.lieu === filterLieu &&  filterCategorie === 'all') || (item.categorie === filterCategorie && item.lieu === filterLieu)));
    })
    .catch((e) => {
      console.log(e);
    });
  };

  useEffect(() =>{
    if(openPopup === false){
      getAllMateriele();
    }
  },[openPopup, filterCategorie, filterLieu])

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
          { title: 'Image', field: 'image', render: item => <img src={item.url_pic} alt="" border="3" height="200" width="200" />,
            editComponent: (props) => {
              //console.log(props);
              return (
                <div>
                  <input
                  type="file"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  onChange={(e) => {
                  // console.log(e.target.files[0])
                    props.rowData.url_pic = "/img/materiels/"+ setImagePath(e.target.files[0].name);
                    props.onChange(e.target.files[0])
                  }}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" color="primary"component="span">
                    Upload
                  </Button>
                </label>
                </div>
                
              );
            },
          },
          { title: 'Quantite', field: 'Qtotale'},
          { title: 'Category', field: 'categorie'},
          { title: 'Tarif', field: 'tarifLoc'},
          { title: 'Valeur', field: 'valRemp'},
          { title: 'Lieu', field: 'lieu'},
          { title: 'Degré', field: 'degre', render: rowData => enumToDegree(rowData.degre)},
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
          {
            icon: () => <AddBox style={{color: 'blue'}}/>,
            tooltip: 'Ajouter nouveau matériel',
            isFreeAction: true,
            hidden: roleAdmin === undefined,
            onClick: () => {
              setOpenPopup(true)
              console.log("Clicked")
            }
          }
        ]}
         
        editable={{
          isEditHidden: () =>  roleAdmin === undefined,
          isDeleteHidden: () => roleAdmin === undefined,
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                console.log(newData, oldData)
                const dataUpdate = [...allMateriele];
                const index = oldData.tableData.id;
                MaterieleDataService.update(dataUpdate[index].id, newData).then(() => {
                  
                  if(newData.image){
                    const formData = new FormData();
                    formData.append('file', newData.image);
                    
                    MaterieleDataService.uploadImgMat(formData).then(()=>{
                      
                      console.log("New image was uploaded succesfully")
                      
                      if(oldData.url_pic !== ''){
                        let data ={
                          url_pic: oldData.url_pic
                        }
        
                        MaterieleDataService.deleteImgMat(data).then(() => console.log('Old image was removed '));
                      }
                      
                    });
                  }
                }).catch(error => console.log(error));

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
      title="Liste du matériél"
      />

      <ModalPopup title="Ajouter nouveau matériel"  openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AddMateriele setOpenPopup={setOpenPopup} method="post" enctype="multipart/form-data" />
      </ModalPopup>
    </Container>
    
  )
}

export default ListMateriele
