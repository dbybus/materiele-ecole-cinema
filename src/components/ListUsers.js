import React, { useEffect, useState, forwardRef } from 'react';
import UserDataService from "../services/user.service";
import MaterialTable from 'material-table';
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
import {Container} from 'react-bootstrap';
import {useAuth0} from "@auth0/auth0-react"
import TokenDataService from "../services/token.service"


function ListUsers() {
  //const [user, loading, error] = useAuthState(auth);
  const [allUsers, setAllUsers] = useState([])
  const {user, isAuthenticated} = useAuth0()
  const { uid, name } = user;
  const roleAdmin = user['https://example-api/role'].find(element => element === 'Admin');

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

  const getAllUsers = async () => {
    /* if(isAuthenticated && roleAdmin !== undefined){
      TokenDataService.getApiAccessToken().then(response => {
        console.log(response)
        UserDataService.getAll()
          .then(response => {
            
            setAllUsers(response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      });
    } */
    
  };

  useEffect(() =>{

      getAllUsers();

  },[])

  return (
    <Container>
      <MaterialTable 
        icons={tableIcons}
        
        columns={[
          { title: 'Nom', field: 'name' },
          { title: 'Email', field: 'email' },
 
        ]}
        data={allUsers}
        
        actions={[
          {
            icon: () => <AddBox style={{color: 'blue'}}/>,
            tooltip: 'Ajoute nouveau materiel',
            isFreeAction: true,
            hidden: roleAdmin === undefined,
            onClick: () => {
              setOpenPopup(true)
              console.log("Clicked")
            }
          }
        ]}
        editable={{
          isEditHidden: rowData => roleAdmin === undefined,
          isDeleteHidden: rowData => roleAdmin === undefined,
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataUpdate = [...allUsers];
                const index = oldData.tableData.id;
                MaterieleDataService.update(dataUpdate[index].id, newData);

                dataUpdate[index] = newData;
                setAllUsers([...dataUpdate]);

                resolve();
              }, 1000)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...allUsers];
                const index = oldData.tableData.id;

                //Delete material from db
                MaterieleDataService.delete(dataDelete[index].id);

                let data ={
                  url_pic: dataDelete[index].url_pic
                }

                MaterieleDataService.deleteImgMat(data);

                dataDelete.splice(index, 1);
                setAllUsers([...dataDelete]);

                resolve();
              }, 1000)
            }),
        }}
      title="Liste des matériaux"
      />
    </Container>
    
  )
}

export default ListUsers