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

function ListNotApprovedReservations() {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const [noApprovedReservervations, setNoApprovedReservervations] = useState([]);

  // Long date on wide screens, short one ("24 nov. 2026") below 1200px; never wraps
  const formatDate = (date) => isCompact ? common.convertDateToFrShort(date) : common.convertDateToFr(date);
  const dateStyle = { whiteSpace: 'nowrap' };
  const {getAccessTokenSilently} = useAuth0();
  const [token, setToken] = useState();

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
    getAccessTokenSilently().then(token => {
      setToken(token);
      ReservationDataService.getAll(token)
      .then(response => {
          console.log(response.data)
          setNoApprovedReservervations(response.data.filter(item => !item.isApproved));
      })
      .catch((e) => {
        console.log(e);
      });
    })
    
  };
 
  useEffect(() =>{
    getAllReservations();
  },[])

  // Uses the reserved quantity of each line (the previous version counted every line as 1)
  const ProductList = (rowData) => {
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
          // material-table passes (rowData, index): the old version used rowData as the index, so rows were never striped
          rowStyle: (rowData, index) => index % 2 === 0 ? {background:"#f5f5f5"} : null,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50]
        }}

        columns={[
          { title: 'Titre', field: 'titre', editable: 'never', cellStyle: { minWidth: 160 } },
          { title: 'Lieu', field: 'lieu', hidden: isCompact, editable: 'never'},
          // Long email addresses wrap instead of stretching the whole table
          { title: 'Bénéficiaire', field: 'beneficiaire', editable: 'never', cellStyle: { wordBreak: 'break-word', minWidth: 140 } },
          { title: 'Date début', field: 'date_start', cellStyle: dateStyle, render: rowData => formatDate(rowData.date_start) },
          { title: 'Date fin', field: 'date_end', cellStyle: dateStyle, render: rowData => formatDate(rowData.date_end) },
        ]}
        data={noApprovedReservervations}
        title="Valider des reservation"
        actions={[
          (rowData) => ({
            icon: () => <FcApproval />,
            tooltip: 'Accepter',
            onClick: () => {
              const dataDelete = [...noApprovedReservervations];
              const index = rowData.tableData.id;
              rowData.isApproved = true;
              ReservationDataService.update(rowData.id, rowData, token);
              dataDelete.splice(index, 1);
              setNoApprovedReservervations([...dataDelete]);
            }
          }),
          (rowData) => ({
            icon: () => <FcDisclaimer />,
            tooltip: 'Refuser',
            onClick: () => {
              const dataDelete = [...noApprovedReservervations];
              const index = rowData.tableData.id;
              ReservationDataService.delete(rowData.id, token);
              dataDelete.splice(index, 1);
              setNoApprovedReservervations([...dataDelete]);
            }
          })
        ]}
        detailPanel={ rowData => {
            return ProductList(rowData)
          } 
        }
      />
    </Container>
   
    
  )
}

export default ListNotApprovedReservations
