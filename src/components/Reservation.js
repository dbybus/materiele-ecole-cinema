import React, { useEffect, useState } from "react";
import ReservationDataService from "../services/reservation.service"
import AddReservation from "./AddReservation";
import { FaRegEnvelope, FaRegCalendarAlt, FaToolbox, FaRegFilePdf } from 'react-icons/fa'
import { ListGroup } from "react-bootstrap";
import { convertDateToFr, calcDays, calcTotalPrice } from "./common";
import {DateTimePickerComponent} from '@syncfusion/ej2-react-calendars'
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneratePdf from "./GeneratePdf";

import {
    ScheduleComponent, Day, Week, WorkWeek, Agenda as Agenda, Month, TimelineMonth, Inject,
    ViewsDirective, ViewDirective
  } from '@syncfusion/ej2-react-schedule';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { extend, L10n } from '@syncfusion/ej2-base';

L10n.load({
    'en-US': {
        'schedule': {
            'saveButton': 'Enregistrer',
            'cancelButton': 'Fermer',
            'deleteButton': 'Supprimer',
            'editEvent': 'Modifier la réservation',
        },
    }
});

function Reservation() {

    const [allReservations, setAllReservervations] = useState([]);
    const [toggle, setToggle] = useState(false);

    function toggleReservation() {
        setToggle(true);
    }

    const getAllReservations = async () => {
        ReservationDataService.getAll()
        .then(response => {
            console.log(response.data)
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
        var reservation = [];  
       
        
        allReservations.map(item => {
            let start_date = new Date(item.date_start);
            let end_date = new Date(item.date_end);
            var materiels = [];
            console.log(item)
            
            item.getReservation.forEach((element, index) => {
                var materiel = element.getMateriel;
                //console.log(item.getReservation[index].getMateriel.id)

                var find = materiels.find(mat => mat.id === materiel.id);

                if(find !== undefined){
                    find.quantite += 1;
                }else{
                    materiel.quantite = 1;
                    materiels.push(materiel)
                }
            })
            
            console.log("MATOS ", materiels)
            
            reservation.push({
                Id: item.id,
                Subject: item.titre,
                StartTime: new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate()),
                EndTime : new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate()),
                IsAllDay: false,
                materiel:  materiels,
                beneficiaire: item.beneficiaire,
                createur: item.createur,
                lieu: item.lieu
            })
        })

        return reservation;
    }

    const content = (props) => {    
        //console.log(props)
        if(props.elementType === 'event'){
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
                                <div><FaToolbox  size={14}/></div>
                                <div className="e-date-time-wrapper e-text-ellipsis" style={{paddingLeft: 15}}>
                                        <p>Matériel</p>
                                        <ListGroup variant="flush">
                                            {props.materiel.map(item =>{
                                                return(
                                                    <ListGroup.Item key={item.id}>{`${item.quantite} x ${item.label} = ${item.tarifLoc} -.CHF`}</ListGroup.Item>
                                                ) 
                                            })}
                                        </ListGroup>
                                </div>                
                            </div>
                        }
                        {
                            <div className="e-date-time">
                                <div><FaRegFilePdf size={14}/></div>
                                <div className="e-date-time-wrapper e-text-ellipsis" style={{paddingLeft: 15}}>
                                        <p>Devis</p>
                                        <PDFDownloadLink  document= {<GeneratePdf reservationName={props.Subject} lieu={props.lieu} from={props.StartTime} to={props.EndTime} 
                                            quantiteMateriel={props.materiel} totalSum={calcTotalPrice(props.materiel)} daysReservation={calcDays(props.StartTime, props.EndTime)} totalSumWithDays={calcTotalPrice(props.materiel)*calcDays(props.StartTime, props.EndTime)}
                                            creatorEmail={props.beneficiaire} />} 
                                            fileName="fee_acceptance.pdf">
                                            {({ blob, url, loading, error }) => (loading ? 'Chargement du document...' : 'Téléchargez votre devis')}
                                        </PDFDownloadLink>
                                </div>                
                            </div>
                        }
                    </div>                                                                      
               
            );
        }else{
            return null;
        }
        
    }

    const onPopupOpen = (props) =>{ 
        //console.log("onPopupOpen ", props)
        let isCell = props.target.classList.contains('e-work-cells') || props.target.classList.contains('e-header-cells');

        if (props.type === "QuickInfo" && isCell) { 
            props.cancel = true; 
        }
        
        if (props.data.Id === undefined && props.type == 'Editor') //to prevent the editor on cells 
        { 
            props.cancel = true; 
        } 
    }

    const actionComplete = (props) => {
        console.log(props)
        
        if(props.requestType === "eventChanged"){
            let data = {
                id: props.data[0].Id,
                titre: props.data[0].Subject,
                date_start: props.data[0].StartTime,
                date_end: props.data[0].EndTime,
                lieu: props.data[0].lieu,
                beneficiaire: props.data[0].beneficiaire
            }

            ReservationDataService.update(props.data[0].Id, data).then(() =>
            {
                console.log("Reservation succesfully updated");
            }).catch(error => {
                console.log(error)
            });
        }else if(props.requestType === "eventRemoved"){
            ReservationDataService.delete(props.data[0].Id).then(() =>
            {
                console.log("Reservation succesfully deleted");
            }).catch(error => {
                console.log(error)
            });
        }
    }

    const editorTemplate = (props) =>{
        return (
            <table className="custom-event-editor" style={{ width: '100%', cellpadding: '5' }}>
                <tbody>
                    <tr>
                        <td className="e-textlabel">Titre</td><td style={{ colspan: '4' }}>
                            <input id="Subject" className="e-field e-input" type="text" name="Subject" style={{ width: '100%' }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="e-textlabel">Status</td><td style={{ colspan: '4' }}>
                            <input id="beneficiaire" className="e-field e-input" type="text" name="beneficiaire" style={{ width: '100%' }} />
                        </td>
                    </tr>
                    <tr>
                        <td className="e-textlabel">From</td><td style={{ colspan: '4' }}>
                            <DateTimePickerComponent id="StartTime" format='dd/MM/yy hh:mm a' data-name="StartTime" value={new Date(props.startTime || props.StartTime)} className="e-field"></DateTimePickerComponent>
                        </td>
                    </tr>
                    <tr>
                        <td className="e-textlabel">To</td><td style={{ colspan: '4' }}>
                            <DateTimePickerComponent id="EndTime" format='dd/MM/yy hh:mm a' data-name="EndTime" value={new Date(props.endTime || props.EndTime)} className="e-field"></DateTimePickerComponent>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    return (
        <div>
            {toggle && <AddReservation allReservations={allReservations} />}
            {!toggle && 
            <div>
                <ButtonComponent id='add' title='Add' onClick={toggleReservation}>Ajouter une Réservation</ButtonComponent>
                <ScheduleComponent width='100%' height='550px' currentView='TimelineMonth'
                    selectedDate={new Date(2021, 10, 1)} quickInfoTemplates={{content : content}} eventSettings={{ dataSource: agendaItems()}} actionComplete={actionComplete}
                    editorTemplate={editorTemplate} popupOpen={onPopupOpen}
                >
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
