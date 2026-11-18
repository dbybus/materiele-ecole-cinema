import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import ReservationDataService from '../services/reservation.service';
import MyReservationCard from '../components/reservation/MyReservationCard';
import { isMine, timelineOf, RESERVATIONS_CHANGED } from '../components/reservation/reservationUtils';
import { useAuth0 } from '../auth';

const byStart = (a, b) => new Date(a.date_start) - new Date(b.date_start);

/** A titled group of cards ("En cours et à venir", "Passées"). */
function Section({ title, reservations, userEmail, emptyText }) {
  return (
    <section className="mb-4">
      <h2 className="section-title">{title} <span className="text-muted fw-normal">({reservations.length})</span></h2>
      {reservations.length === 0
        ? <p className="text-muted small">{emptyText}</p>
        : (
          <div className="my-res-grid">
            {reservations.map((r) => <MyReservationCard key={r.id} reservation={r} userEmail={userEmail} />)}
          </div>
        )}
    </section>
  );
}

/**
 * The logged-in user's reservations: the ones they're the beneficiary of AND the ones they created
 * for someone else. Upcoming first (soonest on top), past ones below (most recent on top).
 */
function ListMesReservations() {
  const { user, getAccessTokenSilently } = useAuth0();
  const history = useHistory();
  const [reservations, setReservations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const loadReservations = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getAccessTokenSilently();
      const { data } = await ReservationDataService.getAll(token);
      setReservations(data.filter((r) => isMine(r, user)));
    } catch (error) {
      console.error('Could not load reservations', error);
    } finally {
      setLoaded(true);
    }
  }, [user, getAccessTokenSilently]);

  useEffect(() => {
    loadReservations();
    // Stay in sync when a reservation changes elsewhere (e.g. approved in another view)
    window.addEventListener(RESERVATIONS_CHANGED, loadReservations);
    return () => window.removeEventListener(RESERVATIONS_CHANGED, loadReservations);
  }, [loadReservations]);

  const { active, past } = useMemo(() => {
    const now = new Date();
    return {
      active: reservations.filter((r) => timelineOf(r, now) !== 'past').sort(byStart),
      past: reservations.filter((r) => timelineOf(r, now) === 'past').sort((a, b) => byStart(b, a)),
    };
  }, [reservations]);
  const pendingCount = active.filter((r) => !r.isApproved).length;

  const newReservation = () => history.push('/Reservation', { openWizard: true });

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Mes réservations</h1>
          <p className="page-subtitle">
            {active.length} en cours ou à venir
            {pendingCount > 0 && <> · <span className="text-warning-dark">{pendingCount} en attente de validation</span></>}
          </p>
        </div>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={newReservation}>
          Nouvelle réservation
        </Button>
      </header>

      {loaded && reservations.length === 0 ? (
        <div className="empty-state">
          <EventAvailableIcon className="empty-state-icon" style={{ color: '#3f51b5' }} />
          <h2>Aucune réservation pour l'instant</h2>
          <p className="text-muted">Vos demandes de matériel apparaîtront ici, avec leur statut et leur devis.</p>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={newReservation}>
            Faire une réservation
          </Button>
        </div>
      ) : (
        <>
          <Section title="En cours et à venir" reservations={active} userEmail={user && user.email}
            emptyText="Aucune réservation en cours ou à venir." />

          {past.length > 0 && (
            showPast
              ? <Section title="Passées" reservations={past} userEmail={user && user.email} emptyText="" />
              : (
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowPast(true)}>
                  Afficher les réservations passées ({past.length})
                </button>
              )
          )}
        </>
      )}
    </div>
  );
}

export default ListMesReservations;
