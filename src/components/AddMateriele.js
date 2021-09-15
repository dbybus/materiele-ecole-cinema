import React, {useState} from 'react'
import {Form, Button, Row, Col, Container} from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import MaterieleDataService from "../services/materiele.service";
/* import { DatePicker } from 'react-bootstrap-date-picker' */

const AddMateriele = () => {
    const [validated, setValidated] = useState(false);
    const [nom, setNom] = useState("");
    const [reference, setReference] = useState("");
    const [image, setImage] = useState("");
    const [quantite, setQuantite] = useState("");
    const [categorie, setCategorie] = useState("");
    const [tarif, setTarif] = useState("");
    const [valeur, setValeur] = useState("");
    const [lieu, setLieu] = useState("");
    const [faculte, setFaculte] = useState("");
    const [achete, setAchete] = useState(new Date());

    const handleSubmit = (event) => {
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        else
        {
            addNew();
        }

        setValidated(true);
        
    };

    const addNew = () =>{
        let data = {
            name: nom,
            reference: reference,
            image: image,
            quantite: quantite,
            categorie: categorie,
            tarif: tarif,
            valeur: valeur,
            lieu: lieu,
            faculte: faculte,
            achete: achete
          };
    
          MaterieleDataService.create(data)
          .then(() => {
            console.log("Created new user successfully!");
          })
          .catch((e) => {
            console.log(e);
          });
    }
    return (
        <Container>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} md="4" controlId="validationCustom01">
                        <Form.Label>Nom</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder="First name"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4" controlId="validationCustom02">
                        <Form.Label>Reference</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Reference"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} md="6" controlId="validationCustom03">
                        <Form.Label>File</Form.Label>
                        <Form.Control
                            type="file"
                            required
                            name="file"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            /* isInvalid={!!errors.file} */
                        />
                        {/* <Form.Control.Feedback type="invalid" tooltip>
                        {errors.file}
                        </Form.Control.Feedback> */}
                    </Form.Group>
                    
                    <Form.Group as={Col} md="2" controlId="validationCustom04">
                        <Form.Label>Quantite</Form.Label>
                        <Form.Control type="text" placeholder="Quantite" value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid state.
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} md="4" controlId="validationCustom03">
                        <Form.Label>Categorie</Form.Label>
                        <Form.Select className="me-sm-2" id="inlineFormCustomSelect" value={categorie} onChange={(e) => setCategorie(e.target.value)} >
                            <option value="0">Choose...</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} md="2" controlId="validationCustom05" >
                        <Form.Label>Tarif</Form.Label>
                        <Form.Control type="text" placeholder="Tarif" value={tarif} onChange={(e) => setTarif(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="2" controlId="validationCustom05">
                        <Form.Label>Valeur</Form.Label>
                        <Form.Control type="text" placeholder="Valeur" value={valeur} onChange={(e) => setValeur(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} md="3" controlId="validationCustom05">
                        <Form.Label>Lieu</Form.Label>
                        <Form.Control type="text" placeholder="Lieu" required value={lieu} onChange={(e) => setLieu(e.target.value)}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="3" controlId="validationCustom03">
                        <Form.Label>Faculte</Form.Label>
                        <Form.Select className="me-sm-2" id="inlineFormCustomSelect" value={faculte} onChange={(e) => setFaculte(e.target.value)}>
                            <option value="0">Choose...</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} md="2" controlId="validationCustom03">
                        <Form.Label>Acheté</Form.Label>
                        <DatePicker selected={achete} onChange={(date) => setAchete(date)} className="form-control"/>
                    </Form.Group>
                    
                </Row>
                <Row className="mb-3">
                    <Form.Group >
                        <Button type="submit">Submit form</Button>
                    </Form.Group>
                </Row> 
            </Form>
        </Container>
    )
}

export default AddMateriele