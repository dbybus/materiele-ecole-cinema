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
import { calcQuantiteReserve, convertDateToFr } from "./common";
import { ListGroup } from "react-bootstrap";
import { FcApproval, FcDisclaimer } from "react-icons/fc";

function ListNotApprovedReservations() {
  const [noApprovedReservervations, setNoApprovedReservervations] = useState();

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
    ReservationDataService.getAll()
    .then(response => {
        console.log(response.data)
        setNoApprovedReservervations(response.data.filter(item => !item.isApproved));
    })
    .catch((e) => {
      console.log(e);
    });
  };
 
  useEffect(() =>{
    getAllReservations();
  },[])

  const ProductList = (rowData) => {
    var materiels = []
    
    rowData.getReservation.map(item => {
      calcQuantiteReserve(item.getMateriel, materiels)
    })

    const renderedMateriels = materiels.map(item => {
      return <ListGroup.Item key={item.id}>{item.quantite} x {item.label}</ListGroup.Item>
    })

    return <ListGroup variant="flush">{renderedMateriels}</ListGroup>
  }

  return (
    
    <Container>
      <MaterialTable 
        icons={tableIcons}
        options = {{
          rowStyle: (index) => index%2 == 0 ? {background:"#f5f5f5"} : null 
        }}
        
        columns={[
          { title: 'Titre', field: 'titre', editable: 'never' },
          { title: 'Lieu', field: 'lieu', editable: 'never'},
          { title: 'Beneficiaire', field: 'beneficiaire', editable: 'never'},
          { title: 'Date debut', field: 'date_start', render: rowData => (
            <div>
              {convertDateToFr(rowData)}
            </div>
          ),},
          { title: 'Date fin', field: 'date_end', render: rowData => (
            <div>
              {convertDateToFr(rowData)}
            </div>
          ),},
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
              ReservationDataService.update(rowData.id, rowData);
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
              ReservationDataService.delete(rowData.id);
              dataDelete.splice(index, 1);
              setNoApprovedReservervations([...dataDelete]);
            }
          })
        ]}
        detailPanel={ rowData => {
            return <div>{ProductList(rowData)},{}</div>
          } 
        }
      />
    </Container>
   
    
  )
}

export default ListNotApprovedReservations
