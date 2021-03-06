import React, { useEffect, useState, forwardRef } from 'react'
import ReservationDataService from "../services/reservation.service";
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
import { ListGroup } from "react-bootstrap";
import { FcApproval, FcDisclaimer } from "react-icons/fc";
import { useAuth0 } from '@auth0/auth0-react';

const common = require('../common');

function ListMesReservations() {
  const [myReservations, setMyReservations] = useState([]);
  const { user, getAccessTokenSilently } = useAuth0();

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

  const getAllReservations = async () => {
    if(user){
      getAccessTokenSilently().then(token => {
        ReservationDataService.getAll(token)
        .then(response => {
            setMyReservations(response.data.filter(item => item.beneficiaire === user.email));
        })
        .catch((e) => {
          console.log(e);
        });
      })  
    }
  };
 
  useEffect(() =>{
    getAllReservations();

    console.log(myReservations)
  },[])

  const productList = (rowData) => {
    const renderedMateriels = rowData.getReservation.map(item => {
      return <ListGroup.Item key={item.id}>{item.quantite} x {item.getMateriel.label}</ListGroup.Item>
    })

    return <ListGroup variant="flush">{renderedMateriels}</ListGroup>
  }

  return (
    
    <Container>
      <MaterialTable 
        icons={tableIcons}
        options = {{
          rowStyle: (rowData) => rowData.isApproved ? {background:"green"} : {background:"orange"},
          paging: false,
          sorting: true
        }}
        columns={[
          { title: 'Titre', field: 'titre', editable: 'never' },
          { title: 'Lieu', field: 'lieu', editable: 'never', hidden: true},
          { title: 'B??n??ficiaire', field: 'beneficiaire', editable: 'never'},
          { title: 'Date debut', field: 'date_start', render: rowData => (
            <div>
              {common.convertDateToFr(rowData.date_start)}
            </div>
          ),},
          { title: 'Date fin', field: 'date_end', render: rowData => (
            <div>
              {common.convertDateToFr(rowData.date_end)}
            </div>
          ),},
          { title: '??tat de la r??servation', field: 'isApproved', editable: 'never', defaultSort: 'asc', render: rowData => (
            <div>
              {!rowData.isApproved ? 'En attente' : 'Valid??'}
            </div>
          ),}
        ]}
        data={myReservations}
        title="Mes r??servations"
        detailPanel={ rowData => {
            return <div>{productList(rowData)}</div>
          } 
        }
      />
    </Container>
  )
}

export default ListMesReservations
