import React, { useMemo, useState } from 'react';
import ListMaterieleReservation from './ListMaterieleReservation';
import { peakReservedQuantities } from '../components/reservation/reservationUtils';

/**
 * Equipment picker for an EXISTING reservation (the calendar's "Modifier la liste" dialog).
 *
 * Same picker as step 2 of the wizard; the difference is how availability is computed:
 * the edited reservation is left out of "already reserved", because its own equipment is
 * the selection being edited (otherwise it would block itself).
 *
 * Props:
 *  - reservation:      the Syncfusion event being edited ({ Id, StartTime, EndTime, ... })
 *  - allReservations:  every reservation from the API
 *  - selection / onSelectionChange: the draft material list [{ id, ref, label, tarifLoc, quantite }]
 *  - bottomGap:        space to keep under the table (the dialog's footer)
 */
export default function ListMaterieleReservationModify({ reservation, allReservations, selection, onSelectionChange, bottomGap }) {
  // Catalog cache for as long as the dialog is open
  const [catalog, setCatalog] = useState([]);

  const reservedByOthers = useMemo(
    () => peakReservedQuantities(
      (allReservations || []).filter((r) => r.id !== reservation.Id),
      new Date(reservation.StartTime),
      new Date(reservation.EndTime)
    ),
    [allReservations, reservation.Id, reservation.StartTime, reservation.EndTime]
  );

  return (
    <ListMaterieleReservation
      materiel={selection}
      setMateriel={onSelectionChange}
      materielReserve={reservedByOthers}
      allMateriele={catalog}
      setAllMateriele={setCatalog}
      bottomGap={bottomGap}
      compact // the dialog is narrower than the window
      showTotalInTitle={false} // the dialog footer shows the total
    />
  );
}
