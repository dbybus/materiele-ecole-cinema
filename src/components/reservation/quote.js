import React from 'react';
import { pdf } from '@react-pdf/renderer';
import GeneratePdf from '../GeneratePdf';

/**
 * Builds the PDF quote and downloads it. Only called on click: rendering a
 * <PDFDownloadLink> builds the whole PDF as soon as it appears, even if nobody downloads it.
 *
 * @param {object} q { titre, beneficiaire, lieu, from, to, materiel, totals: { days, perDay, total }, creatorEmail, fileName }
 */
export async function downloadQuote({ titre, beneficiaire, lieu, from, to, materiel, totals, creatorEmail, fileName }) {
  const blob = await pdf(
    <GeneratePdf
      reservationName={titre}
      beneficiaire={beneficiaire}
      lieu={lieu}
      from={from}
      to={to}
      quantiteMateriel={materiel}
      totalSum={totals.perDay}
      daysReservation={totals.days}
      totalSumWithDays={totals.total}
      creatorEmail={creatorEmail}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
