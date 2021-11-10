import React, {useState, useEffect} from 'react'
import {Form, Row, Col, Container, ListGroup} from 'react-bootstrap'
import ListMaterieleReservation from "./ListMaterieleReservation";
import DatePickerReserv from "./DatePickerReserv";
import {useAuth0} from "@auth0/auth0-react"
import ReservationDataService from "../services/reservation.service"
import MaterielDataService from "../services/materiele.service"
import { useHistory } from 'react-router';
import {Stepper, Step, StepLabel, Button, Box} from '@material-ui/core'

const AddReservation = (props) => {

    const {allReservations} = props;
    const {user} = useAuth0();
    const {sub, email} = user;
    const history = useHistory();
    const [step, setStep] = useState(0);
    const [reservationName, setReservationName] = useState("");
    const [lieu, setLieu] = useState("");
    const [from, setStartDate] = useState();
    const [to, setEndDate] = useState();
    const [materiel, setMateriel] = useState([]);
    const [creatorId, setCreatorId] = useState("");
    const [creatorEmail, setCreatorEmail] = useState("");
    const [materielReserve, setMaterielReserve] = useState([]);
    const [extMateriel, setExtMateriel] = useState([]);
    const [totalSum, setTotatSum] = useState(0);
    const [totalSumWithDays, setTotalSumWithDays] = useState(0);
    const [visitedStep2, setVisitedStep2] = useState(false);
    const [allMateriele, setAllMateriele] = useState([]);
    const [daysReservation, setDaysReservation] = useState(0)
    const [validated, setValidated] = useState(false);
    const steps = ['Sélectionner les détails de la réservation', 'Sélectionner des matériels', 'Récapitulatif d\'évènement'];
    
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

    const setData = async (id) => {
        let response = await MaterielDataService.get(id);
        return response.data;
    }

    const fetchLabel = async () => {
        let total = 0;
        setExtMateriel([]);
        
        materiel.map(async (element, index) =>{
            let matos = await setData(element.id_materiel)
            
            element.label = matos.label;
            setExtMateriel(oldArray => [...oldArray, element])
            console.log("DATES ", from.setHours(0,0,0,0), to)
            
            total += matos.tarifLoc * element.quantite;
            setTotatSum(total);
        })

        var difference_in_time = to.setHours(0,0,0,0) - from.setHours(0,0,0,0);
        var difference_in_days = (difference_in_time / (1000 * 3600 * 24)) + 1;
        let sumWithDays =  totalSum * difference_in_days;

        setTotalSumWithDays(sumWithDays);
        setDaysReservation(difference_in_days);
    }
    
    useEffect(() => {
        //console.log("Step 1 data ", reservationName, lieu, from, to, materiel, creatorId, creatorEmail)
        
        if(step === 0){
            setVisitedStep2(false);
            setMateriel([]);
        }else if(step === 1){
            getReservedMaterials();
        }else if(step === 2){
            fetchLabel();
            setVisitedStep2(true);
            console.log(totalSumWithDays)
        }

    }, [step])

    useEffect(() => {
        setCreatorId(sub);
        setCreatorEmail(email);
    }, [user]) 

    const getReservedMaterials = () => {
        const findByDate = allReservations.filter(item => new Date(item.date_end) >= from);

        let reservedMaterialList = [];

        Object.keys(findByDate).map((id) => {

            JSON.parse(findByDate[id].materiel).forEach(element => {
            
              const temp = reservedMaterialList.find(item => item.id_materiel === element.id_materiel)
              
              if (temp != undefined) { 
                temp.quantite += element.quantite
              } else {

                reservedMaterialList.push({
                    id_materiel: element.id_materiel,
                    quantite: element.quantite
                })
              }              
            });         
        })

        setMaterielReserve(reservedMaterialList)
    };

    const submitStep = () => {
        
        let data = {
            titre: reservationName,
            lieu: lieu,
            date_start: from.toUTCString(),
            date_end: to.toUTCString(),
            createur: creatorId,
            beneficiaire: creatorEmail,
            materiel: materiel
        };
          
        ReservationDataService.create(data)
            .then(() => {
                console.log("Created new reservation successfully!");
                history.push("/Reservation")
                setVisitedStep2(false);
            })
            .catch((e) => {
                console.log(e);
                alert(e)
            });
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
                disabled={step === 0}
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
                            <ListGroup.Item>{`DU : ${from.toUTCString()}, AU: ${to.toUTCString()}`}</ListGroup.Item>
                        </ListGroup>
                    </Row>
                    <Row className="mb-3">
                        <h5>Matériel</h5>
                        <ListGroup variant="flush">
                            {extMateriel.map(item =>{
                                return(
                                    <ListGroup.Item key={item.id_materiel}>{`${item.quantite} x ${item.label}`}</ListGroup.Item>
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
                        <Button onClick={submitStep}>
                            Réservation
                        </Button>
                    </Row>
                </Container>       
                        
            )}
        </div>
    )
}

export default AddReservation