import React, {useState, useEffect} from 'react'
import {Form, Button, Row, Col, Container} from 'react-bootstrap'
import ListMaterieleReservation from "./ListMaterieleReservation";
import DatePickerReserv from "./DatePickerReserv";
import {useAuth0} from "@auth0/auth0-react"
import ReservationDataService from "../services/reservation.service"


const AddReservation = (props) => {
    const {allReservations} = props;
    const {user} = useAuth0();
    const {sub, email} = user;
    const [step, setStep] = useState(1);
    const [reservationName, setReservationName] = useState("");
    const [lieu, setLieu] = useState("");
    const [from, setStartDate] = useState(new Date());
    const [to, setEndDate] = useState(new Date());
    const [meteriel, setMateriel] = useState([]);
    const [creatorId, setCreatorId] = useState("");
    const [creatorEmail, setCreatorEmail] = useState("");
    const [materielReserve, setMaterielReserve] = useState([]);
    
    const nextStep = () =>{
        setStep(step + 1);
    }

    const previousStep = () => {
        setStep(step - 1);
    }
  
    //To be removed after test
    useEffect(() => {
        console.log("Step 1 data ", reservationName, lieu, from, to, meteriel, creatorId, creatorEmail)
        if(step === 2){
            getReservedMaterials();
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
              
              if (temp != undefined) { // This is just for understanding. `undefined` inside `if` will give false. So you can use `if(!temp)`
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
            materiel: meteriel
        };
          
        ReservationDataService.create(data)
            .then(() => {
                console.log("Created new reservation successfully!");
                
            })
            .catch((e) => {
                console.log(e);
                alert(e)
            });
    }
    return (
        <div>
            {step !== 3 && <Button onClick={nextStep}>Go Next</Button>}
            {step !== 1 && <Button onClick={previousStep}>Go Back</Button>}
            {step === 3 && (
                <Button type="submit" onClick={submitStep}>
                Submit
                </Button>
                
            )}
            {step === 1 && 
                <Container>
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
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
                            <Form.Group as={Col} md="6">
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
                            <Form.Group >
                                <Form.Label>Select period</Form.Label>
                                <DatePickerReserv from={from} setStartDate={setStartDate} to={to}  setEndDate={setEndDate}/>
                            </Form.Group>
                        </Row> 
                    </Form>
                </Container>
            }
            {step === 2 && (
                <ListMaterieleReservation materiel={meteriel} setMateriel={setMateriel} materielReserve={materielReserve}/>
            )}
            {step === 3 && (
                <div>
                <div className="row align-items-center profile-header">
                  <div className="col-md-2 mb-3">
                    <h1>Récapitulatif de l'évènement</h1>
                  </div>
                </div>
                <div className="row">
                  <pre className="col-12 text-light bg-dark p-4">
                    <p>{reservationName}</p>
                  </pre>
                </div>
                <div className="row">
                  <pre className="col-12 text-light bg-dark p-4">
                    <p>{lieu}</p>
                  </pre>
                </div>
                <div className="row">
                  <pre className="col-12 text-light bg-dark p-4">
                    <p>{from.toUTCString()}</p>
                  </pre>
                  <pre className="col-12 text-light bg-dark p-4">
                    <p>{to.toUTCString()}</p>
                  </pre>
                </div>
              </div>
            )}
        {/* {page === 3 && (
        <OnboardingThree data={data.settings} update={updateData} />
        )}
        {page === 4 && <OnboardingFour />} */}
    </div>

    )
}

export default AddReservation