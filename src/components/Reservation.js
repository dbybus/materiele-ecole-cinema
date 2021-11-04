import React, { useEffect, useState } from "react";
import {Container, Button} from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import ReservationDataService from "../services/reservation.service"
import AddReservation from "./AddReservation";

import {
    ScheduleComponent, Day, Week, WorkWeek, Agenda as Agenda, Month, TimelineMonth, Inject,
    ViewsDirective, ViewDirective
  } from '@syncfusion/ej2-react-schedule';


function Reservation() {
    const [allReservations, setAllReservervations] = useState([])
    const [toggle, setToggle] = useState(false)
    const history = useHistory();
    
    function routeChange() {
        setToggle(true);
        //history.push("/AddReservation");
    }
    const getAllReservations = async () => {
        ReservationDataService.getAll()
        .then(response => {
            setAllReservervations(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    };

    useEffect(() => {
        getAllReservations();
    }, [])

    const agendaItems = () => {
        var reservation = []  
        
        allReservations.map(item => {
            let start_date = new Date(item.date_start);
            let end_date = new Date(item.date_end);
            reservation.push({
                Id: item.id,
                Subject: item.titre,
                StartTime: new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate()),
                EndTime : new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate()),
                IsAllDay: false
            })
        })
        return reservation;
    }

    return (
        
        <div>
            {toggle && <AddReservation allReservations={allReservations}/>}
            {!toggle && <div>
                <Button onClick={routeChange}>Ajouter une Réservation</Button>
                <ScheduleComponent width='100%' height='550px' currentView='TimelineMonth'
                selectedDate={new Date(2021, 10, 1)} eventSettings={ { dataSource: agendaItems() } }>
                    <ViewsDirective>
                        <ViewDirective option='Day' />
                        <ViewDirective option='Week' />
                        <ViewDirective option='WorkWeek' />
                        <ViewDirective option='Month' />
                        <ViewDirective option='TimelineMonth' />
                        <ViewDirective option='Agenda' />
                    </ViewsDirective>
                    <Inject services={[Day, Week, WorkWeek, Agenda, TimelineMonth,  Month]} />
                </ScheduleComponent>
            </div>
            }
        </div>
    )
}

export default Reservation
