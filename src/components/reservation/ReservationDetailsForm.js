import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import EventNoteIcon from '@material-ui/icons/EventNote';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DatePickerReserv from '../DatePickerReserv';
import { PICKUP_HOUR, RETURN_HOUR, totalsFor, toReservationPeriod } from './reservationUtils';

const common = require('../../common');

/** Label + control + error message (errors only appear once the user tried to continue). */
function Field({ id, label, hint, error, showErrors, children }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="wizard-label">{label}</Form.Label>
      {children}
      {showErrors && error
        ? <div className="invalid-feedback d-block">{error}</div>
        : hint && <Form.Text muted>{hint}</Form.Text>}
    </Form.Group>
  );
}

/** "Retrait / Retour / Durée" recap once both dates are chosen. */
function PeriodSummary({ from, to }) {
  const { start, end } = toReservationPeriod(from, to);
  const { days } = totalsFor(start, end, []);
  return (
    <dl className="period-summary mb-0">
      <div><dt>Retrait</dt><dd>{common.convertDateToFr(start)} à {PICKUP_HOUR}h</dd></div>
      <div><dt>Retour</dt><dd>{common.convertDateToFr(end)} à {RETURN_HOUR}h</dd></div>
      <div><dt>Durée</dt><dd>{days} jour{days > 1 ? 's' : ''}</dd></div>
    </dl>
  );
}

/**
 * Step 1 of the wizard: event, beneficiary, place (left) and period (right).
 * Fully controlled: `details` + `onChange(field, value)`; `errors` comes from validateDetails().
 */
export default function ReservationDetailsForm({ details, onChange, errors, showErrors, userEmail }) {
  const invalid = (field) => showErrors && !!errors[field];

  return (
    <Form noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="row g-3">
        <div className="col-lg-5">
          <section className="wizard-card">
            <h2 className="wizard-card-title"><EventNoteIcon /> Informations</h2>

            <Field id="reservation-titre" label="Évènement" error={errors.titre} showErrors={showErrors}
              hint="Le nom du tournage ou du projet.">
              <Form.Control value={details.titre} placeholder="Nom de l'évènement" isInvalid={invalid('titre')}
                onChange={(e) => onChange('titre', e.target.value)} autoFocus />
            </Field>

            <Field id="reservation-beneficiaire" label="Bénéficiaire" error={errors.beneficiaire} showErrors={showErrors}
              hint="La personne qui vient chercher le matériel.">
              <InputGroup hasValidation>
                <Form.Control type="email" value={details.beneficiaire} placeholder="email@exemple.ch"
                  isInvalid={invalid('beneficiaire')} onChange={(e) => onChange('beneficiaire', e.target.value)} />
                {userEmail && details.beneficiaire !== userEmail && (
                  <Button variant="outline-secondary" onClick={() => onChange('beneficiaire', userEmail)}>
                    C'est moi
                  </Button>
                )}
              </InputGroup>
            </Field>

            <Field id="reservation-lieu" label="Lieu" error={errors.lieu} showErrors={showErrors}>
              <Form.Control value={details.lieu} placeholder="Lieu du tournage" isInvalid={invalid('lieu')}
                onChange={(e) => onChange('lieu', e.target.value)} />
            </Field>
          </section>
        </div>

        <div className="col-lg-7">
          <section className={`wizard-card${invalid('period') ? ' border-danger' : ''}`}>
            <h2 className="wizard-card-title"><DateRangeIcon /> Période</h2>
            <DatePickerReserv
              from={details.from}
              to={details.to}
              setStartDate={(d) => onChange('from', d)}
              setEndDate={(d) => onChange('to', d)}
            />
            {details.from && details.to && <PeriodSummary from={details.from} to={details.to} />}
          </section>
        </div>
      </div>
    </Form>
  );
}
