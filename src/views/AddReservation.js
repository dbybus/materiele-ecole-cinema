import React, {useState, useEffect} from 'react'
import {Form, Row, Col, Container, ListGroup} from 'react-bootstrap'
import ListMaterieleReservation from "./ListMaterieleReservation";
import DatePickerReserv from "../components/DatePickerReserv";
import {useAuth0} from "@auth0/auth0-react"
import ReservationDataService from "../services/reservation.service"
import { useHistory } from 'react-router';
import {Stepper, Step, StepLabel, Button, Box} from '@material-ui/core'
import { convertDateToFr, calcDays, calcTotalPrice, dateRangeOverlaps } from '../common';
import GeneratePdf from "../components/GeneratePdf"
import { PDFDownloadLink } from '@react-pdf/renderer';

const AddReservation = (props) => {

    const {allReservations} = props;
    const {user, getAccessTokenSilently} = useAuth0();
    const {sub, email} = user;
    const history = useHistory();
    const [step, setStep] = useState(0);
    const [reservationName, setReservationName] = useState("");
    const [lieu, setLieu] = useState("");
    const [from, setStartDate] = useState(null);
    const [to, setEndDate] = useState(null);
    const [materiel, setMateriel] = useState([]);
    const [creatorId, setCreatorId] = useState("");
    const [creatorEmail, setCreatorEmail] = useState("");
    const [materielReserve, setMaterielReserve] = useState([]);
    const [totalSum, setTotatSum] = useState(0);
    const [totalSumWithDays, setTotalSumWithDays] = useState(0);
    const [visitedStep2, setVisitedStep2] = useState(false);
    const [allMateriele, setAllMateriele] = useState([]);
    const [daysReservation, setDaysReservation] = useState(0)
    const [validated, setValidated] = useState(false);
    const steps = ['Sélectionner les détails de la réservation', 'Sélectionner des matériels', 'Récapitulatif d\'évènement'];
    const roleAdmin = user['https://example-api/role'].find(element => element === 'Admin');
    const roleProf = user['https://example-api/role'].find(element => element === 'Prof');
    
    const nextStep = (event) =>{

        if(reservationName === '' || lieu === '' || from === null || to === null){
            event.preventDefault();
            event.stopPropagation();
        }else{
            setStep(step + 1);
        }

        setValidated(true);
    }

    const previousStep = () => {
        setStep(step - 1);
    }
    
    useEffect(() => {
        //console.log("Step 1 data ", reservationName, lieu, from, to, materiel, creatorId, creatorEmail)
        if(step === -1){
            history.push('/Reservation');
        }else if(step === 0){
            setVisitedStep2(false);
            setMateriel([]);
        }else if(step === 1){
            getReservedMaterials();
        }else if(step === 2){
            var difference_in_days = calcDays(from, to);
            var total = calcTotalPrice(materiel);  
            setTotatSum(total);
            setTotalSumWithDays( total * difference_in_days);
            setDaysReservation(difference_in_days);
            setVisitedStep2(true);
        }
    }, [step])

    useEffect(() => {
        setCreatorId(sub);
        setCreatorEmail(email);
        return () => {
            setCreatorId([]);
            setCreatorEmail([]);
          };
    }, [user]); 
    
    const getReservedMaterials = () => {
        const findByDate = allReservations.filter(item => dateRangeOverlaps(from.setHours(14, 0, 0 ,0), to.setHours(13, 0, 0 ,0), new Date(item.date_start), new Date(item.date_end)));
        let reservedMaterialList = [];

        Object.keys(findByDate).map((id) => {
            findByDate[id].getReservation.forEach((element, index) => {
                const materiel = element.getMateriel;

                const temp = reservedMaterialList.find(item => item.id === materiel.id);

                if (temp !== undefined) {
                    temp.quantite += element.quantite;

                    if(findByDate[(+id-1).toString()] !== undefined){
                        //If current date doesnt overlap next reservation 
                        if(!dateRangeOverlaps(findByDate[(+id-1).toString()].date_start, findByDate[(+id-1).toString()].date_end, findByDate[id].date_start, findByDate[id].date_end)){
                            temp.quantite -= element.quantite;
                        }  
                    }
                } else {
                    reservedMaterialList.push({
                        id: materiel.id,
                        quantite: element.quantite
                    })
                }       
            });
        })

        console.log("LIST SENT TO COMPONENT ", reservedMaterialList);
        setMaterielReserve(reservedMaterialList);
    };

    const submitStep = () => {

        let data = {
            titre: reservationName,
            lieu: lieu,
            date_start: from.setHours(14, 0, 0 ,0),
            date_end: to.setHours(13, 0, 0 ,0),
            createur: creatorId,
            beneficiaire: creatorEmail,
            materiel: materiel,
            isApproved: false
        };
        
        //Automatically set approve true if role is Admin or Prof
        if(roleAdmin !== undefined || roleProf !== undefined){
            data.isApproved = true;
        }

        getAccessTokenSilently().then(token => {
            ReservationDataService.create(data, token)
            .then(() => {
                console.log("Created new reservation successfully!");
                history.push("/Reservation")
                setVisitedStep2(false);
            })
            .catch((e) => {
                console.log(e);
                alert(e)
            });
        })
        
    }
    return (
        <div>
            <Stepper activeStep={step}>
                {steps.map((label, index) => {
                    return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                color="inherit"
                onClick={previousStep}
                sx={{ mr: 1 }}
                >
                Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />           
                <Button onClick={nextStep} disabled={step === 2 || (step === 1 && materiel.length === 0)}>
                Next
                </Button>
            </Box>
            {step === 0 && 
               <Container className="d-flex justify-content-center align-items-center">
                    <Form noValidate validated={validated}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="11" controlId="validationCustom01">
                                <Form.Label>Nom</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={reservationName}
                                    onChange={(e) => setReservationName(e.target.value)}
                                    placeholder="Nom"
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="11" controlId="validationCustom02">
                                <Form.Label>Lieu</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={lieu}
                                    onChange={(e) => setLieu(e.target.value)}
                                    placeholder="Lieu"
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group controlId="validationReservation03">
                                <Form.Label>Select period</Form.Label>
                                <DatePickerReserv from={from} setStartDate={setStartDate} to={to}  setEndDate={setEndDate}/>
                            </Form.Group>
                        </Row> 
                    </Form>
                    </Container>
            }
            {step === 1 && (
                <ListMaterieleReservation materiel={materiel} setMateriel={setMateriel} materielReserve={materielReserve} visitedStep2={visitedStep2} allMateriele={allMateriele} setAllMateriele={setAllMateriele} />
            )}
            {step === 2 && (
                //loading ? <Loading /> : 
                <Container style ={{width: '50%'}}>
                    <Row className="mb-3">
                        <h5>Informations :</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>Titre: <b>{reservationName}</b></ListGroup.Item>
                            <ListGroup.Item>Lieu: <b>{lieu}</b></ListGroup.Item>
                            <ListGroup.Item>Bénéficiaire: <b>{creatorEmail}</b></ListGroup.Item>
                            <ListGroup.Item>{`DU : ${convertDateToFr(from)}, AU: ${convertDateToFr(to)}`}</ListGroup.Item>
                        </ListGroup>
                    </Row>
                    <Row className="mb-3">
                        <h5>Matériel</h5>
                        <ListGroup variant="flush">
                            {materiel.map(item =>{
                                console.log(item)
                                return(
                                    <ListGroup.Item key={item.id}>{`${item.quantite} x ${item.label}`}</ListGroup.Item>
                                ) 
                            })}
                        </ListGroup>
                    </Row>
                    <Row className="mb-3">
                        <h5>Totaux</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>Total: <b>{totalSum} -.CHF</b></ListGroup.Item>
                            <ListGroup.Item>Total pour <b>{daysReservation}</b> jours: <b>{totalSumWithDays} -.CHF</b></ListGroup.Item>
                        </ListGroup>
                    </Row>
                    <Row className="mb-3">
                        <PDFDownloadLink  document= {<GeneratePdf reservationName={reservationName} lieu={lieu} from={from} to={to} 
                            quantiteMateriel={materiel} totalSum={totalSum} daysReservation={daysReservation} totalSumWithDays={totalSumWithDays}
                            creatorEmail={creatorEmail} />} 
                            fileName="fee_acceptance.pdf">
                            {({ blob, url, loading, error }) => (loading ? 'Chargement du document...' : 'Téléchargez votre devis')}
                        </PDFDownloadLink>
                    </Row>
                    <Row className="mb-3">
                        <Button color="primary" variant="contained" onClick={submitStep}>
                                Réservation
                        </Button>
                    </Row>
                </Container>       
                        
            )}
        </div>
    )
}

export default AddReservation;