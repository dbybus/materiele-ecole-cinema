import React, { useEffect, useState, useRef, createRef, forwardRef, createElement } from "react";
import ReservationDataService from "../services/reservation.service"
import AddReservation from "./AddReservation";
import { FaRegEnvelope, FaRegCalendarAlt, FaToolbox, FaRegFilePdf } from 'react-icons/fa'
import { ListGroup } from "react-bootstrap";
import { convertDateToFr, calcDays, calcTotalPrice } from "../common";
import {DateTimePickerComponent} from '@syncfusion/ej2-react-calendars'
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneratePdf from "./GeneratePdf";
import {
    ScheduleComponent, Agenda as Agenda, Month, TimelineMonth, Inject,
    ViewsDirective, ViewDirective
  } from '@syncfusion/ej2-react-schedule';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { L10n } from '@syncfusion/ej2-base';
import { useAuth0 } from '@auth0/auth0-react'
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
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import ListMaterieleReservationModify from "./ListMaterieleReservationModify";

function Reservation() {
    const [approvedReservations, setApprovedReservervations] = useState([]);
    const [toggle, setToggle] = useState(false);
    const { user } = useAuth0();
    const matos = useRef([]);
    const defaultDialog = useRef(null);
    const materielRef = useRef([]);

    function toggleReservation() {
        setToggle(true);
    }

    const getAllReservations = async () => {
        const reserv = await ReservationDataService.getAll();

        setApprovedReservervations(user['https://example-api/role'].find(element => element === 'Admin') !== undefined 
                                || user['https://example-api/role'].find(element => element === 'Prof') !== undefined 
                                ? reserv.data : reserv.data.filter(item => item.isApproved));
    };

    useEffect(() => {
        if(user){
            getAllReservations();
        }
    }, [user]);

    const agendaItems = () => {
        var reservation = [];  
        var isReadOnly = true;
            
        if(user['https://example-api/role'].find(element => element === 'Admin')  !== undefined || user['https://example-api/role'].find(element => element === 'Prof') !== undefined){
            isReadOnly = false;
        }

        approvedReservations.map(item => {
            var materiels = [];

            item.getReservation.forEach((element) => {
                element.getMateriel.quantite = element.quantite;
                materiels.push(element.getMateriel);
            })   
            
            reservation.push({
                Id: item.id,
                Subject: item.titre,
                StartTime: new Date(item.date_start),
                EndTime : new Date(item.date_end),
                IsAllDay: false,
                materiel: materiels,
                beneficiaire: item.beneficiaire,
                createur: item.createur,
                lieu: item.lieu,
                IsReadonly : isReadOnly,
                isApproved: item.isApproved,
            })
        })

        return reservation;
    }

    const content = (props) => {    
        console.log(props)
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
                                    {({ blob, url, loading, error }) => (loading ? 'Chargement du devis...' : 'Téléchargez votre devis')}
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
        console.log("POPUP open ", props)
        let isCell = props.target.classList.contains('e-work-cells') || props.target.classList.contains('e-header-cells');
        
        if (props.type === "QuickInfo" && isCell) { 
            props.cancel = true; 
        }
        
        if (props.data.Id === undefined && props.type == 'Editor') //to prevent the editor on cells 
        { 
            props.cancel = true;        
        } 

        if (props.data.Id !== undefined && props.type == 'Editor') //to prevent the editor on cells 
        { 
            const table = document.getElementById("custom-event-editor"); 
                   
            //setMaterielReserve(props.data.materiel); 
            props.data.materiel && props.data.materiel.map((item, index) => {
                    // Create an <input> element, set its type and name attributes
                    //matos.push(item);
                    var tr = document.createElement("tr");
                    tr.className = "materiel_tr"
                    var tdLabel = document.createElement("td");
                    
                    if(index === 0){
                        var text = document.createTextNode("Matériel");
                        tdLabel.className = "e-textlabel"
                        tdLabel.appendChild(text);
                    }

                    var tdMateriel = document.createElement("td");
                    tdMateriel.style.colspan = 10; 
                   
                    var input = document.createElement("input");
                    input.type = "text";
                    input.name = item.label;
                    input.value = item.quantite + " x " +item.label + " = " + item.tarifLoc;
                    input.className = "e-field e-input";
                    input.disabled = true;
 
                    tdMateriel.appendChild(input)
                    tr.appendChild(tdLabel);
                    tr.appendChild(tdMateriel);
                    table.appendChild(tr)
            })

            var tr = document.createElement("tr");
            tr.className = "materiel_tr"
            var td = document.createElement("td");
            var button = document.createElement("button");
            button.innerHTML = "Modifier la liste";
            button.type = "button";
            button.className = "e-control e-btn";
            button.onclick = function()
            {
                defaultDialog.current.show()
                //materielRef.current = [];
            }

            td.appendChild(button);
            tr.appendChild(document.createElement("td"));
            tr.appendChild(td);
            table.appendChild(tr)
        }
    }

    const popupClose = (props) => {
        if(props.data === null){
            materielRef.current = [];
            matos.current = [];
        }
        
    }

    const actionComplete = (props) => {
       console.log("updated materiel ", matos.current)
        if(props.requestType === "eventChanged"){
            let data = {
                id: props.data[0].Id,
                titre: props.data[0].Subject,
                date_start: props.data[0].StartTime,
                date_end: props.data[0].EndTime,
                lieu: props.data[0].lieu,
                beneficiaire: props.data[0].beneficiaire,
                isApproved: props.data[0].isApproved,
                materiel: matos.current
            }

            ReservationDataService.update(props.data[0].Id, data).then(() =>
            {
                console.log("Reservation succesfully updated");                
            }).catch(error => {
                console.log(error)
            });
            window.location.reload();
        }else if(props.requestType === "eventRemoved"){
            ReservationDataService.delete(props.data[0].Id).then(() =>
            {
                console.log("Reservation succesfully deleted");
            }).catch(error => {
                console.log(error)
            });
        }

       materielRef.current = [];
       matos.current = [];
    }

    const contentDialog = (props) => {
        console.log(props)
        return (
            <div className="dialogContent" id="dialogContent1">
                {props.materiel && <ListMaterieleReservationModify key={new Date().getTime()} id="TableID" materielRef={materielRef} allReservations={approvedReservations} reservation={props} />} 
            </div>
        );
    }
    function removeElementsByClass(className){
        var elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }
    const editorTemplate = (props) =>{
        
        
        const buttons = [{
            buttonModel: {
                content: 'OK',
                cssClass: 'e-flat',
                isPrimary: true,
            },
            'click': () => {
                console.log(props)
                var materiels = []

                props.materiel && props.materiel.map((item, index) => {

                    const find = materiels.find(mat => mat.id === item.id);

                    if(find !== undefined){
                        find.quantite += item.quantite;
                    }else{
                        materiels.push(item);
                    }
                })

                materielRef.current && materielRef.current.map((item, index) => {

                    const find = materiels.find(mat => mat.id === item.id);

                    if(find !== undefined){
                        find.quantite += item.quantite;
                    }else{
                        materiels.push(item);
                    }
                })

                const table = document.getElementById("custom-event-editor");

                removeElementsByClass("materiel_tr")

                materiels && materiels.map((item, index) => {
                    // Create an <input> element, set its type and name attributes
                    if(item.quantite !==0){
                        var tr = document.createElement("tr");
                        tr.className = "materiel_tr"
                        var tdLabel = document.createElement("td");
                        
                        if(index === 0){
                            var text = document.createTextNode("Matériel");
                            tdLabel.className = "e-textlabel"
                            tdLabel.appendChild(text);
                        }

                        var tdMateriel = document.createElement("td");
                        tdMateriel.style.colspan = 10; 
                    
                        var input = document.createElement("input");
                        input.type = "text";
                        input.name = item.label;
                        input.value = item.quantite + " x " +item.label + " = " + item.tarifLoc;
                        input.className = "e-field e-input";
                        input.disabled = true;

                        tdMateriel.appendChild(input)
                        tr.appendChild(tdLabel);
                        tr.appendChild(tdMateriel);
                        table.appendChild(tr)
                    }
                })
            
                var tr = document.createElement("tr");
                tr.className = "materiel_tr"
                var td = document.createElement("td");
                var button = document.createElement("button");
                button.innerHTML = "Modifier la liste";
                button.type = "button";
                button.className = "e-control e-btn";
                button.onclick = function()
                {
                    defaultDialog.current.show();
                }

                td.appendChild(button);
                tr.appendChild(document.createElement("td"));
                tr.appendChild(td);
                table.appendChild(tr);

                defaultDialog.current.hide();

                matos.current = [...materiels];
            }
        },
        /* {
            buttonModel: {
                content: 'Cancel',
                cssClass: 'e-flat'
            },
            'click': () => {
                console.log(props)
                console.log(defaultDialog.current)
                props.materiel.splice(0, materielRef.current.length)
                materielRef.current.splice(0, materielRef.current.length)

                allMaterieleRef.current.splice(0,  allMaterieleRef.current.length);
                
                defaultDialog.current.hide();
                canceledRef.current = true;
                console.log(canceledRef)
            }
        } */];
        
        return (
            <div>
                <table className="custom-event-editor" id="custom-event-editor" style={{ width: '100%', cellpadding: '5' }}>
                    <tbody>
                        <tr>
                            <td className="e-textlabel">Titre</td><td style={{ colspan: '4' }}>
                                <input id="Subject" className="e-field e-input" type="text" name="Subject" style={{ width: '100%' }} />
                            </td>
                        </tr>
                        <tr>
                            <td className="e-textlabel">Beneficiaire</td><td style={{ colspan: '4' }}>
                                <input id="beneficiaire" className="e-field e-input" type="text" name="beneficiaire" style={{ width: '100%' }} />
                            </td>
                        </tr>
                        <tr>
                            <td className="e-textlabel">Lieu</td><td style={{ colspan: '4' }}>
                                <input id="lieu" className="e-field e-input" type="text" name="lieu" style={{ width: '100%' }} />
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
                        <tr>
                            <td className="e-textlabel">Valider</td><td style={{ colspan: '4' }}>
                                <input id="isApproved" name="isApproved" className="e-field e-control" type="checkbox"/>
                            </td>
                        </tr>
                    </tbody> 
                </table>
                <DialogComponent key={new Date().getTime()} allowDragging={true} buttons={buttons} modal={true} showCloseIcon={true} width='80%' height='auto' visible={false} ref={defaultDialog} closeOnEscape={true} content={() => contentDialog(props)} /> 
            </div>
        );
    }

    const eventRender = (props) => {
        if(props.data.isApproved){
            props.element.style.backgroundColor = 'green'
        }else{
            props.element.style.backgroundColor = 'orange'
        }
    }

    return (
        <div>
            {toggle && <AddReservation allReservations={approvedReservations} />}
            {!toggle && 
            <div>
                <ButtonComponent id='add' title='Add' onClick={toggleReservation}>Ajouter une Réservation</ButtonComponent>
                <ScheduleComponent width='100%' height='550px' currentView='TimelineMonth'
                    selectedDate={Date.now()} quickInfoTemplates={{content : content}} eventSettings={{ dataSource: agendaItems()}} actionComplete={actionComplete}
                    popupClose={popupClose} editorTemplate={editorTemplate} popupOpen={onPopupOpen} eventRendered={eventRender}
                >
                    <ViewsDirective>
                        <ViewDirective option='Month' />
                        <ViewDirective option='TimelineMonth' />
                        <ViewDirective option='Agenda' />
                    </ViewsDirective>
                    <Inject services={[Agenda, TimelineMonth,  Month]} />
                </ScheduleComponent>
            </div>
            
            }
        </div>
    )
}

export default Reservation
