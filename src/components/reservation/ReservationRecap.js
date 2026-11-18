import React from 'react';
import EventNoteIcon from '@material-ui/icons/EventNote';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RoomIcon from '@material-ui/icons/Room';

const common = require('../../common');

/** One-line reminder of what is being booked, shown at the top of steps 2 and 3. */
export default function ReservationRecap({ details, days }) {
  return (
    <div className="wizard-recap" aria-label="Récapitulatif de la réservation">
      <span><EventNoteIcon /> <b>{details.titre}</b></span>
      <span>
        <DateRangeIcon />
        {common.convertDateToFrShort(details.from)} → {common.convertDateToFrShort(details.to)} · {days} jour{days > 1 ? 's' : ''}
      </span>
      <span><RoomIcon /> {details.lieu}</span>
    </div>
  );
}
