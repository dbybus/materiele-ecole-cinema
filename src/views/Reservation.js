import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ScheduleComponent, Agenda, Month, TimelineMonth, Inject, ViewsDirective, ViewDirective
} from '@syncfusion/ej2-react-schedule';
import { L10n } from '@syncfusion/ej2-base';
import { Button, Snackbar } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Alert } from 'react-bootstrap';
import ReservationDataService from '../services/reservation.service';
import AddReservation from './AddReservation';
import ReservationQuickInfo from '../components/reservation/ReservationQuickInfo';
import ReservationEditor from '../components/reservation/ReservationEditor';
import MyReservationsPanel from '../components/reservation/MyReservationsPanel';
import {
    STATUS_COLORS, isMine, notifyReservationsChanged, toSchedulerEvent, toUpdatePayload,
} from '../components/reservation/reservationUtils';
import { useAuth0 } from '../auth';
import { canManageReservations } from '../auth/roles';
import useIsMobile, { useIsCompact } from '../hooks/useIsMobile';

L10n.load({
    'en-US': {
        schedule: {
            saveButton: 'Enregistrer',
            cancelButton: 'Fermer',
            deleteButton: 'Supprimer',
            editEvent: 'Modifier la réservation',
        },
    },
});

const VIEWS = [Agenda, TimelineMonth, Month];

function Reservation() {
    const { user, getAccessTokenSilently } = useAuth0();
    const isMobile = useIsMobile();
    const location = useLocation();
    const canManage = canManageReservations(user);

    const isCompact = useIsCompact();
    const [allReservations, setAllReservations] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    // Fixed at mount: a new Date on every render would jump the calendar back to today after each refresh
    const [initialDate] = useState(() => new Date());
    // Full material list chosen in the editor's "Modifier la liste" dialog (null = not changed)
    const changedMaterielsRef = useRef(null);
    const scheduleRef = useRef(null);
    const highlightRef = useRef(null); // id of the event to pulse after a jump from the panel

    // ---------- Data ----------

    const loadReservations = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently();
            const { data } = await ReservationDataService.getAll(token);
            setAllReservations(data);
        } catch (error) {
            console.error('Could not load reservations', error);
        }
    }, [getAccessTokenSilently]);

    // The user's own reservations, whatever their status (for the panel and the calendar marker)
    const myReservations = useMemo(
        () => (user ? allReservations.filter((r) => isMine(r, user)) : []),
        [allReservations, user]
    );
    const myIds = useMemo(() => new Set(myReservations.map((r) => r.id)), [myReservations]);

    // Admins and teachers see everything. Students see approved reservations AND their own requests
    // (before, a student's pending request vanished from the calendar as soon as it was created).
    const reservations = useMemo(
        () => (canManage ? allReservations : allReservations.filter((r) => r.isApproved || myIds.has(r.id))),
        [allReservations, canManage, myIds]
    );

    // Load on arrival, and again on every navigation: AddReservation navigates to /Reservation when it's
    // done or cancelled. That's this same page, so it doesn't remount; close the form and refresh instead.
    // Other pages can open the wizard directly with history.push('/Reservation', { openWizard: true }).
    useEffect(() => {
        setShowAddForm(!!(location.state && location.state.openWizard));
        if (user) loadReservations();
    }, [user, location.key, loadReservations]);

    // Message passed by AddReservation after a successful save (history.push(path, { flash }))
    const [flash, setFlash] = useState(null);
    useEffect(() => {
        if (location.state && location.state.flash) setFlash(location.state.flash);
    }, [location.key, location.state]);

    const events = useMemo(
        () => reservations.map((r) => toSchedulerEvent(r, !canManage)),
        [reservations, canManage]
    );

    const updateReservation = async (event) => {
        try {
            const token = await getAccessTokenSilently();
            await ReservationDataService.update(event.Id, toUpdatePayload(event, changedMaterielsRef.current), token);
        } catch (error) {
            console.error('Could not update reservation', error);
            alert("La réservation n'a pas pu être enregistrée.");
        } finally {
            changedMaterielsRef.current = null;
            loadReservations(); // reload after the request finished (the old code reloaded the page mid-request)
            notifyReservationsChanged(); // the navbar badges recount (approval may have changed)
        }
    };

    const deleteReservation = async (event) => {
        try {
            const token = await getAccessTokenSilently();
            await ReservationDataService.delete(event.Id, token);
        } catch (error) {
            console.error('Could not delete reservation', error);
            alert("La réservation n'a pas pu être supprimée.");
        } finally {
            loadReservations();
            notifyReservationsChanged();
        }
    };

    // ---------- Scheduler callbacks ----------

    const onPopupOpen = (args) => {
        const isExistingEvent = args.data && args.data.Id !== undefined;

        // Clicking an empty cell must not open the quick "new event" popup or the editor:
        // reservations are created with the "Ajouter une Réservation" wizard.
        if (args.type === 'QuickInfo' && args.target &&
            (args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells'))) {
            args.cancel = true;
        }
        if (args.type === 'Editor' && !isExistingEvent) {
            args.cancel = true;
        }
        if (args.type === 'Editor') {
            changedMaterielsRef.current = null;
        }
        // Note: nothing is deleted here. The old code deleted as soon as the confirmation
        // dialog *opened*, so "Cancel" still deleted. Deletion now happens in onActionComplete.
    };

    const onActionComplete = (args) => {
        const event = args.data && args.data[0];
        if (!event) return;

        if (args.requestType === 'eventChanged') updateReservation(event);
        if (args.requestType === 'eventRemoved') deleteReservation(event);
    };

    const onEventRendered = (args) => {
        args.element.style.backgroundColor = args.data.isApproved ? STATUS_COLORS.approved : STATUS_COLORS.pending;
        // Own reservations get a marker; the one picked in the panel pulses once
        if (myIds.has(args.data.Id)) args.element.classList.add('event-mine');
        if (highlightRef.current === args.data.Id) args.element.classList.add('event-highlight');
    };

    // Panel -> calendar: show the reservation's dates and make the event pulse
    const showInCalendar = (reservation) => {
        const schedule = scheduleRef.current;
        if (!schedule) return;
        highlightRef.current = reservation.id;
        schedule.selectedDate = new Date(reservation.date_start);
        schedule.dataBind();
        schedule.refreshEvents();
        setTimeout(() => {
            const el = document.querySelector(`.e-appointment[data-id="Appointment_${reservation.id}"]`);
            if (el) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
            highlightRef.current = null; // the next refresh renders it normally again
        }, 300);
    };

    // Stable objects so the scheduler doesn't re-process its options on every render
    const eventSettings = useMemo(() => ({ dataSource: events }), [events]);
    const quickInfoTemplates = useMemo(() => ({
        content: (props) => (props.elementType === 'event' ? <ReservationQuickInfo event={props} /> : null),
    }), []);
    const editorTemplate = (props) => (
        <ReservationEditor
            key={props.Id}
            event={props}
            allReservations={reservations}
            onMaterielsChange={(list) => { changedMaterielsRef.current = list; }}
        />
    );

    // ---------- Render ----------

    if (showAddForm) {
        return <AddReservation allReservations={reservations} />;
    }

    // Fill the window under the header (and under the panel row on narrower screens), never too small
    const calendarHeight = isMobile
        ? 'max(420px, calc(100vh - 330px))'
        : isCompact ? 'max(440px, calc(100vh - 360px))' : 'max(480px, calc(100vh - 215px))';

    return (
        <div>
            <header className="page-header">
                <div>
                    <h1 className="page-title">Réservations</h1>
                    {!isMobile && (
                        <p className="page-subtitle">
                            <span className="legend-dot legend-dot--ok" /> Validée
                            <span className="legend-dot legend-dot--pending ms-3" /> En attente
                            <span className="legend-mine ms-3" /> Mes réservations
                        </p>
                    )}
                </div>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setShowAddForm(true)}>
                    {isMobile ? 'Réserver' : 'Nouvelle réservation'}
                </Button>
            </header>

            <div className="landing">
                <MyReservationsPanel reservations={myReservations} onSelect={showInCalendar} onNew={() => setShowAddForm(true)} />

                <div className="landing-calendar">
                    {/* key forces a clean re-mount when switching between phone and desktop layouts */}
                    <ScheduleComponent
                        ref={scheduleRef}
                        key={isMobile ? 'mobile' : 'desktop'}
                        width="100%"
                        height={calendarHeight}
                        currentView={isMobile ? 'Agenda' : 'TimelineMonth'}
                        enableAdaptiveUI={isMobile}
                        selectedDate={initialDate}
                        eventSettings={eventSettings}
                        quickInfoTemplates={quickInfoTemplates}
                        editorTemplate={editorTemplate}
                        popupOpen={onPopupOpen}
                        actionComplete={onActionComplete}
                        eventRendered={onEventRendered}
                    >
                        <ViewsDirective>
                            <ViewDirective option="Month" />
                            <ViewDirective option="TimelineMonth" />
                            <ViewDirective option="Agenda" />
                        </ViewsDirective>
                        <Inject services={VIEWS} />
                    </ScheduleComponent>
                </div>
            </div>

            <Snackbar open={!!flash} autoHideDuration={5000} onClose={() => setFlash(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert variant="success" className="mb-0 shadow" onClose={() => setFlash(null)} dismissible>
                    {flash}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Reservation;
