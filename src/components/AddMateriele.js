import React, {useState} from 'react'
import {Form, Button, Row, Col, Container} from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import MaterieleDataService from "../services/materiele.service";
/* import { DatePicker } from 'react-bootstrap-date-picker' */

const AddMateriele = () => {
    const [validated, setValidated] = useState(false);
    const [label, setLabel] = useState("");
    const [ref, setRef] = useState("");
    const [panne, setPanne] = useState(""); //Ajouter plus tard dans view
    const [sousCateg, setSousCateg] = useState(""); //Ajouter plus tard dans view
    const [image, setImage] = useState(""); //Gerrer les photo plus tard
    const [Qtotale, setQtotale] = useState("");
    const [categorie, setCategorie] = useState("");
    const [tarifLoc, setTarifLoc] = useState("");
    const [valRemp, setValRemp] = useState("");
    const [dateAchat, setDateAchat] = useState(new Date());
    const [ownerExt, setOwnerExt] = useState(""); //Ajouter plus tard dans view
    const [remarque, setRemarque] = useState(""); //Ajouter plus tard dans view
    const [degre, setDegre] = useState("");
    const [lieu, setLieu] = useState("");

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
            label: label,
            ref: ref,
            categorie: categorie,
            Qtotale: Qtotale,
            tarifLoc: tarifLoc,
            valRemp: valRemp,
            lieu: lieu,
            degre: degre,
            dateAchat: dateAchat,
          };
          
          MaterieleDataService.create(data)
          .then(() => {
            console.log("Created new user successfully!");
          })
          .catch((e) => {
            console.log(e);
            alert(e)
          });
    }

    return (
        <Container>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} md="6" controlId="validationCustom01">
                        <Form.Label>Nom</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Nom"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="6" controlId="validationCustom02">
                        <Form.Label>Reference</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
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
                    
                    <Form.Group as={Col} md="6" controlId="validationCustom04">
                        <Form.Label>Quantite</Form.Label>
                        <Form.Control type="text" placeholder="Quantite" value={Qtotale} onChange={(e) => setQtotale(e.target.value)} required />
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
                    <Form.Group as={Col} md="4" controlId="validationCustom05" >
                        <Form.Label>Tarif</Form.Label>
                        <Form.Control type="text" placeholder="Tarif" value={tarifLoc} onChange={(e) => setTarifLoc(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4" controlId="validationCustom05">
                        <Form.Label>Valeur</Form.Label>
                        <Form.Control type="text" placeholder="Valeur" value={valRemp} onChange={(e) => setValRemp(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} md="4" controlId="validationCustom05">
                        <Form.Label>Lieu</Form.Label>
                        <Form.Control type="text" placeholder="Lieu" required value={lieu} onChange={(e) => setLieu(e.target.value)}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid zip.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4" controlId="validationCustom03">
                        <Form.Label>Dégre</Form.Label>
                        <Form.Select className="me-sm-2" id="inlineFormCustomSelect" value={degre} onChange={(e) => setDegre(e.target.value)}>
                            <option value="0">Choose...</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} md="4" controlId="validationCustom03">
                        <Form.Label>Acheté</Form.Label>
                        <DatePicker selected={dateAchat} onChange={(date) => setDateAchat(date)} className="form-control"/>
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