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
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';
import { ListGroup } from "react-bootstrap";
import { FcApproval, FcDisclaimer } from "react-icons/fc";
import { useAuth0 } from '../auth';

const common = require('../common');

function ListMesReservations() {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const [myReservations, setMyReservations] = useState([]);

  // Long date on wide screens, short one ("24 nov. 2026") below 1200px; never wraps
  const formatDate = (date) => isCompact ? common.convertDateToFrShort(date) : common.convertDateToFr(date);
  const dateStyle = { whiteSpace: 'nowrap' };
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

    return <ListGroup variant="flush" className="detail-panel">{renderedMateriels}</ListGroup>
  }

  return (
    
    <Container className="table-view">
      <MaterialTable 
        icons={tableIcons}
        options = {{
          padding: isMobile ? 'dense' : 'default',
          // Coloured accent on the left instead of a full green/orange row (dark text on green was unreadable)
          rowStyle: (rowData) => ({ borderLeft: `4px solid ${rowData.isApproved ? '#2e7d32' : '#ef6c00'}` }),
          paging: false,
          sorting: true
        }}
        columns={[
          { title: 'Titre', field: 'titre', editable: 'never', cellStyle: { minWidth: 180 } },
          { title: 'Lieu', field: 'lieu', editable: 'never', hidden: true},
          // Always the logged-in user here, so it's the first column to go on narrower screens
          { title: 'Bénéficiaire', field: 'beneficiaire', hidden: isCompact, editable: 'never'},
          { title: 'Date début', field: 'date_start', cellStyle: dateStyle, render: rowData => formatDate(rowData.date_start) },
          { title: 'Date fin', field: 'date_end', cellStyle: dateStyle, render: rowData => formatDate(rowData.date_end) },
          { title: isMobile ? 'État' : 'État de la réservation', field: 'isApproved', editable: 'never', defaultSort: 'asc', render: rowData => (
            <span className={`status-chip ${rowData.isApproved ? 'status-chip--ok' : 'status-chip--pending'}`}>
              {!rowData.isApproved ? 'En attente' : 'Validé'}
            </span>
          ),}
        ]}
        data={myReservations}
        title="Mes réservations"
        detailPanel={ rowData => {
            return productList(rowData)
          } 
        }
      />
    </Container>
  )
}

export default ListMesReservations
