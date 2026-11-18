import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ScheduleComponent, Agenda, Month, TimelineMonth, Inject, ViewsDirective, ViewDirective
} from '@syncfusion/ej2-react-schedule';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { L10n } from '@syncfusion/ej2-base';
import ReservationDataService from '../services/reservation.service';
import AddReservation from './AddReservation';
import ReservationQuickInfo from '../components/reservation/ReservationQuickInfo';
import ReservationEditor from '../components/reservation/ReservationEditor';
import { STATUS_COLORS, toSchedulerEvent, toUpdatePayload } from '../components/reservation/reservationUtils';
import { useAuth0 } from '../auth';
import { canManageReservations } from '../auth/roles';
import useIsMobile from '../hooks/useIsMobile';

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

    const [reservations, setReservations] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    // Fixed at mount: a new Date on every render would jump the calendar back to today after each refresh
    const [initialDate] = useState(() => new Date());
    // Full material list chosen in the editor's "Modifier la liste" dialog (null = not changed)
    const changedMaterielsRef = useRef(null);

    // ---------- Data ----------

    const loadReservations = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently();
            const { data } = await ReservationDataService.getAll(token);
            // Students only see approved reservations; admins and teachers see everything
            setReservations(canManage ? data : data.filter((r) => r.isApproved));
        } catch (error) {
            console.error('Could not load reservations', error);
        }
    }, [getAccessTokenSilently, canManage]);

    // Load on arrival, and again on every navigation: AddReservation navigates to /Reservation when it's
    // done or cancelled. That's this same page, so it doesn't remount; close the form and refresh instead.
    useEffect(() => {
        setShowAddForm(false);
        if (user) loadReservations();
    }, [user, location.key, loadReservations]);

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

    return (
        <div>
            <ButtonComponent cssClass="e-primary add-reservation-btn" onClick={() => setShowAddForm(true)}>
                Ajouter une Réservation
            </ButtonComponent>

            {/* key forces a clean re-mount when switching between phone and desktop layouts */}
            <ScheduleComponent
                key={isMobile ? 'mobile' : 'desktop'}
                width="100%"
                // Fill the window below the navbar and button, but never shrink below a usable size
                height={isMobile ? 'calc(100vh - 200px)' : 'max(480px, calc(100vh - 190px))'}
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
    );
}

export default Reservation;
