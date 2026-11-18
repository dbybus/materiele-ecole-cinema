import React from 'react';
import { FaUserAlt, FaRegCalendarAlt, FaToolbox, FaRegFilePdf } from 'react-icons/fa';
import { ListGroup } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneratePdf from '../GeneratePdf';
import { reservationTotals } from './reservationUtils';

const common = require('../../common');

/** One icon + content line, styled like Syncfusion's own quick-info rows. */
function InfoRow({ icon: Icon, children }) {
  return (
    <div className="e-date-time">
      <div><Icon size={14} /></div>
      <div className="e-date-time-wrapper" style={{ paddingLeft: 15 }}>{children}</div>
    </div>
  );
}

/**
 * Body of the popup shown when clicking a reservation in the calendar.
 * `event` is the Syncfusion event built by toSchedulerEvent().
 */
export default function ReservationQuickInfo({ event }) {
  const { days, perDay, total } = reservationTotals(event);

  return (
    <div>
      <InfoRow icon={FaRegCalendarAlt}>
        du {common.convertDateToFr(event.StartTime)} au {common.convertDateToFr(event.EndTime)} ({days} jours)
      </InfoRow>

      <InfoRow icon={FaUserAlt}>{event.beneficiaire}</InfoRow>

      <InfoRow icon={FaToolbox}>
        <p className="mb-1">Matériel</p>
        <ListGroup variant="flush">
          {event.materiel.map((item) => (
            <ListGroup.Item key={item.id} className="px-0 py-1">
              {item.quantite} × {item.label} — {common.formatCHF(item.quantite * item.tarifLoc)}/jour
            </ListGroup.Item>
          ))}
        </ListGroup>
        <p className="mt-1 mb-0">
          <b>Total : {common.formatCHF(total)}</b> ({common.formatCHF(perDay)}/jour × {days} jours)
        </p>
      </InfoRow>

      <InfoRow icon={FaRegFilePdf}>
        <PDFDownloadLink
          document={
            <GeneratePdf
              reservationName={event.Subject}
              beneficiaire={event.beneficiaire}
              lieu={event.lieu}
              from={event.StartTime}
              to={event.EndTime}
              quantiteMateriel={event.materiel}
              totalSum={perDay}
              daysReservation={days}
              totalSumWithDays={total}
              creatorEmail={event.createurEmail}
            />
          }
          fileName={`devis-${event.Id}.pdf`}
        >
          {({ loading }) => (loading ? 'Chargement du devis...' : 'Téléchargez votre devis')}
        </PDFDownloadLink>
      </InfoRow>
    </div>
  );
}
