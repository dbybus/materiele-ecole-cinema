import React from 'react';
import { Form } from 'react-bootstrap';
import DatePickerReserv from '../DatePickerReserv';

/** Text field with its label and error message (errors are only shown once the user tried to continue). */
function TextField({ id, label, type = 'text', value, onChange, placeholder, error, showErrors }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        isInvalid={showErrors && !!error}
      />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}

/**
 * Step 1 of the wizard: event name, beneficiary, place and period.
 * Fully controlled: `details` + `onChange(field, value)`; `errors` comes from validateDetails().
 */
export default function ReservationDetailsForm({ details, onChange, errors, showErrors }) {
  return (
    <Form noValidate className="mx-auto w-100" style={{ maxWidth: 720 }} onSubmit={(e) => e.preventDefault()}>
      <TextField id="reservation-titre" label="Évènement" placeholder="Nom de l'évènement"
        value={details.titre} onChange={(v) => onChange('titre', v)} error={errors.titre} showErrors={showErrors} />
      <TextField id="reservation-beneficiaire" label="Bénéficiaire" type="email" placeholder="email@exemple.ch"
        value={details.beneficiaire} onChange={(v) => onChange('beneficiaire', v)} error={errors.beneficiaire} showErrors={showErrors} />
      <TextField id="reservation-lieu" label="Lieu" placeholder="Lieu du tournage"
        value={details.lieu} onChange={(v) => onChange('lieu', v)} error={errors.lieu} showErrors={showErrors} />

      <Form.Group className="mb-3">
        <Form.Label>Période</Form.Label>
        <DatePickerReserv
          from={details.from}
          to={details.to}
          setStartDate={(d) => onChange('from', d)}
          setEndDate={(d) => onChange('to', d)}
        />
      </Form.Group>
    </Form>
  );
}
