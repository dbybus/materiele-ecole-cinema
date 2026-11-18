import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Button, CircularProgress } from '@material-ui/core';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneratePdf from '../GeneratePdf';

const common = require('../../common');

function Section({ title, children }) {
  return (
    <section className="mb-4">
      <h5>{title}</h5>
      <ListGroup variant="flush">{children}</ListGroup>
    </section>
  );
}

/**
 * Step 3 of the wizard: recap, PDF quote and confirmation.
 * `totals` = { days, perDay, total } from totalsFor().
 */
export default function ReservationSummary({ details, materiel, creatorEmail, totals, submitting, onSubmit }) {
  const { days, perDay, total } = totals;

  return (
    <div className="mx-auto" style={{ maxWidth: 720 }}>
      <Section title="Informations">
        <ListGroup.Item>Titre : <b>{details.titre}</b></ListGroup.Item>
        <ListGroup.Item>Créateur de la réservation : <b>{creatorEmail}</b></ListGroup.Item>
        <ListGroup.Item>Lieu : <b>{details.lieu}</b></ListGroup.Item>
        <ListGroup.Item>Bénéficiaire : <b>{details.beneficiaire}</b></ListGroup.Item>
        <ListGroup.Item>
          Du <b>{common.convertDateToFr(details.from)}</b> au <b>{common.convertDateToFr(details.to)}</b> ({days} jours)
        </ListGroup.Item>
      </Section>

      <Section title="Matériel">
        {materiel.map((item) => (
          <ListGroup.Item key={item.id} className="d-flex justify-content-between">
            <span>{item.quantite} × {item.label}</span>
            <span className="text-muted">{common.formatCHF(item.quantite * item.tarifLoc)}/jour</span>
          </ListGroup.Item>
        ))}
      </Section>

      <Section title="Totaux">
        <ListGroup.Item>Par jour : <b>{common.formatCHF(perDay)}</b></ListGroup.Item>
        <ListGroup.Item>Total pour <b>{days}</b> jours : <b>{common.formatCHF(total)}</b></ListGroup.Item>
      </Section>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <PDFDownloadLink
          document={
            <GeneratePdf
              reservationName={details.titre}
              lieu={details.lieu}
              from={details.from}
              to={details.to}
              quantiteMateriel={materiel}
              totalSum={perDay}
              daysReservation={days}
              totalSumWithDays={total}
              creatorEmail={creatorEmail}
              beneficiaire={details.beneficiaire}
            />
          }
          fileName="devis-reservation.pdf"
        >
          {({ loading }) => (loading ? 'Chargement du devis...' : 'Télécharger le devis (PDF)')}
        </PDFDownloadLink>

        <Button color="primary" variant="contained" onClick={onSubmit} disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
          {submitting ? 'Enregistrement…' : 'Confirmer la réservation'}
        </Button>
      </div>
    </div>
  );
}
