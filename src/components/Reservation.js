import React, { useEffect, useState } from "react";
import ReservationDataService from "../services/reservation.service"
import AddReservation from "./AddReservation";
import { FaRegEnvelope, FaRegCalendarAlt, FaToolbox } from 'react-icons/fa'
import { ListGroup } from "react-bootstrap";
import { convertDateToFr, calcDays } from "./common";

import {
    ScheduleComponent, Day, Week, WorkWeek, Agenda as Agenda, Month, TimelineMonth, Inject,
    ViewsDirective, ViewDirective
  } from '@syncfusion/ej2-react-schedule';
  import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

function Reservation() {

    const [allReservations, setAllReservervations] = useState([]);
    const [toggle, setToggle] = useState(false);

    function toggleReservation() {
        setToggle(true);
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
    }, []);

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
                IsAllDay: false,
                materiel:  item.materiel,
                beneficiaire: item.beneficiaire,
                createur: item.createur,
                lieu: item.lieu
            })
        })

        return reservation;
    }

    const content = (props) => {        
        return (
            <div>
                {
                    <div className="e-date-time">
                        <div><FaRegCalendarAlt size={14}/></div>
                        <div className="e-date-time-wrapper e-text-ellipsis" style={{paddingLeft: 15}}>
                            du {convertDateToFr(props.StartTime)} au {convertDateToFr(props.EndTime)} ({calcDays(props.StartTime, props.EndTime)} jours)
                        </div>                
                    </div>
                }
                {
                    <div className="e-date-time">
                        <div><FaRegEnvelope size={14}/></div>
                        <div className="e-date-time-wrapper e-text-ellipsis" style={{paddingLeft: 15}}>
                            {props.beneficiaire}
                        </div>                
                    </div>
                }
                {
                    <div className="e-date-time">
                        <div><FaToolbox size={14}/></div>
                        <div className="e-date-time-wrapper e-text-ellipsis" style={{paddingLeft: 15}}>
                                <p>Matériel</p>
                                <ListGroup variant="flush">
                                    {JSON.parse(props.materiel).map(item =>{
                                        return(
                                            <ListGroup.Item key={item.id_materiel}>{`${item.quantite} x ${item.label}`}</ListGroup.Item>
                                        ) 
                                    })}
                                </ListGroup>
                        </div>                
                    </div>
                }
            </div>
        );
    }
    return (
        <div>
            {toggle && <AddReservation allReservations={allReservations} />}
            {!toggle && 
            <div>
                <ButtonComponent id='add' title='Add' onClick={toggleReservation}>Ajouter une Réservation</ButtonComponent>
                <ScheduleComponent width='100%' height='550px' currentView='TimelineMonth'
                selectedDate={new Date(2021, 10, 1)} eventSettings={ { dataSource: agendaItems() } } quickInfoTemplates={{content : content}}>
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
