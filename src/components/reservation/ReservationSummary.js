import React from 'react';
import { Button } from '@material-ui/core';
import { Alert } from 'react-bootstrap';
import ReceiptIcon from '@material-ui/icons/Receipt';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import EventNoteIcon from '@material-ui/icons/EventNote';
import PersonIcon from '@material-ui/icons/Person';
import RoomIcon from '@material-ui/icons/Room';
import DateRangeIcon from '@material-ui/icons/DateRange';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneratePdf from '../GeneratePdf';
import { PICKUP_HOUR, RETURN_HOUR } from './reservationUtils';

const common = require('../../common');

function Detail({ icon: Icon, label, children }) {
  return (
    <div>
      <Icon fontSize="small" />
      <div>
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

/**
 * Step 3 of the wizard: what will be booked, what it costs, and the PDF quote.
 * Confirmation itself is in the wizard's action bar.
 *  - totals = { days, perDay, total } from totalsFor()
 *  - autoApproved: true for admins/teachers (approved directly), false = sent for validation
 */
export default function ReservationSummary({ details, materiel, creatorEmail, totals, autoApproved }) {
  const { days, perDay, total } = totals;

  return (
    <div className="row g-3">
      <div className="col-lg-7">
        <section className="wizard-card">
          <h2 className="wizard-card-title"><ReceiptIcon /> Matériel et coût</h2>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Article</th>
                <th className="num">Qté</th>
                <th className="num d-none d-sm-table-cell">Prix / jour</th>
                <th className="num">Total / jour</th>
              </tr>
            </thead>
            <tbody>
              {materiel.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td className="num">{item.quantite}</td>
                  <td className="num d-none d-sm-table-cell text-muted">{common.formatCHF(item.tarifLoc)}</td>
                  <td className="num">{common.formatCHF(item.quantite * item.tarifLoc)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between text-muted small pt-3">
            <span>{common.formatCHF(perDay)} par jour × {days} jour{days > 1 ? 's' : ''}</span>
          </div>
          <div className="summary-total">
            <span className="fw-bold">Total</span>
            <span className="summary-total-amount">{common.formatCHF(total)}</span>
          </div>
        </section>
      </div>

      <div className="col-lg-5">
        <section className="wizard-card d-flex flex-column">
          <h2 className="wizard-card-title"><InfoOutlinedIcon /> Détails</h2>
          <dl className="details-list">
            <Detail icon={EventNoteIcon} label="Évènement">{details.titre}</Detail>
            <Detail icon={DateRangeIcon} label="Période">
              du {common.convertDateToFr(details.from)} ({PICKUP_HOUR}h)<br />
              au {common.convertDateToFr(details.to)} ({RETURN_HOUR}h)
            </Detail>
            <Detail icon={RoomIcon} label="Lieu">{details.lieu}</Detail>
            <Detail icon={PersonIcon} label="Bénéficiaire">{details.beneficiaire}</Detail>
            <Detail icon={AccountCircleIcon} label="Créée par">{creatorEmail}</Detail>
          </dl>

          <Alert variant={autoApproved ? 'success' : 'info'} className="small mt-3 mb-3">
            {autoApproved
              ? 'Votre rôle permet de valider directement : la réservation sera confirmée immédiatement.'
              : 'La réservation sera envoyée pour validation. Vous la retrouverez dans « Mes réservations ».'}
          </Alert>

          <div className="mt-auto">
            <PDFDownloadLink
              style={{ textDecoration: 'none' }}
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
              {({ loading }) => (
                // component="span": the surrounding <a> handles the download (no <button> inside a link)
                <Button component="span" variant="outlined" color="primary" fullWidth startIcon={<PictureAsPdfIcon />} disabled={loading}>
                  {loading ? 'Préparation du devis…' : 'Télécharger le devis (PDF)'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </section>
      </div>
    </div>
  );
}
