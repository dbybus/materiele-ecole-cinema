import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Box } from '@material-ui/core';
import ListMaterieleReservation from './ListMaterieleReservation';
import ReservationDetailsForm from '../components/reservation/ReservationDetailsForm';
import ReservationSummary from '../components/reservation/ReservationSummary';
import {
    peakReservedQuantities, toCreatePayload, toReservationPeriod, totalsFor, validateDetails,
} from '../components/reservation/reservationUtils';
import ReservationDataService from '../services/reservation.service';
import { useAuth0 } from '../auth';
import { canManageReservations } from '../auth/roles';
import useIsMobile from '../hooks/useIsMobile';

const STEP = { DETAILS: 0, MATERIEL: 1, SUMMARY: 2 };

const STEP_LABELS = {
    short: ['Détails', 'Matériel', 'Récapitulatif'],
    long: ['Sélectionner les détails de la réservation', 'Sélectionner des matériels', "Récapitulatif d'évènement"],
};

const EMPTY_DETAILS = { titre: '', beneficiaire: '', lieu: '', from: null, to: null };

const periodKey = ({ from, to }) => `${from ? from.getTime() : ''}-${to ? to.getTime() : ''}`;

/**
 * New reservation wizard: details -> equipment -> summary.
 * `allReservations` is passed by the calendar page; when opened directly on /AddReservation it's loaded here.
 * Leaving (cancel or after saving) navigates to /Reservation, which closes the wizard.
 */
function AddReservation({ allReservations }) {
    const { user, getAccessTokenSilently } = useAuth0();
    const history = useHistory();
    const isMobile = useIsMobile();

    const [step, setStep] = useState(STEP.DETAILS);
    const [details, setDetails] = useState(EMPTY_DETAILS);
    const [showErrors, setShowErrors] = useState(false);
    const [materiel, setMateriel] = useState([]);       // selection [{ id, ref, label, tarifLoc, quantite }]
    const [catalog, setCatalog] = useState([]);         // equipment list cache, shared with step 2
    const [loadedReservations, setLoadedReservations] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    // Period the current selection was made for: the selection is only reset if the dates change
    const selectionPeriodRef = useRef(null);

    // Opened directly on /AddReservation (no calendar page around it): load the reservations ourselves
    useEffect(() => {
        if (allReservations) return;
        (async () => {
            try {
                const token = await getAccessTokenSilently();
                const { data } = await ReservationDataService.getAll(token);
                setLoadedReservations(data);
            } catch (error) {
                console.error('Could not load reservations', error);
                setLoadedReservations([]);
            }
        })();
    }, [allReservations, getAccessTokenSilently]);

    const reservations = allReservations || loadedReservations || [];
    const errors = useMemo(() => validateDetails(details), [details]);
    const isPeriodChosen = details.from && details.to;
    const period = isPeriodChosen ? toReservationPeriod(details.from, details.to) : null;

    // What other reservations already use during the chosen period (peak simultaneous use)
    const reservedByOthers = useMemo(() => {
        if (!details.from || !details.to) return [];
        const { start, end } = toReservationPeriod(details.from, details.to);
        return peakReservedQuantities(reservations, start, end);
    }, [reservations, details.from, details.to]);
    const totals = period ? totalsFor(period.start, period.end, materiel) : { days: 0, perDay: 0, total: 0 };

    // ---------- Navigation ----------

    const updateDetail = (field, value) => setDetails((d) => ({ ...d, [field]: value }));

    const goNext = () => {
        if (step === STEP.DETAILS) {
            setShowErrors(true);
            if (Object.keys(errors).length > 0) return;
            // New dates mean different availability: start the selection over
            if (selectionPeriodRef.current !== periodKey(details)) {
                setMateriel([]);
                selectionPeriodRef.current = periodKey(details);
            }
        }
        setStep((s) => Math.min(s + 1, STEP.SUMMARY));
    };

    const goBack = () => {
        if (step === STEP.DETAILS) {
            history.push('/Reservation'); // leave the wizard
        } else {
            setStep((s) => s - 1);
        }
    };

    const canGoNext = step === STEP.DETAILS || (step === STEP.MATERIEL && materiel.length > 0);

    // ---------- Save ----------

    const submit = async () => {
        if (submitting) return; // no double reservation on double click
        setSubmitting(true);
        try {
            const token = await getAccessTokenSilently();
            // Admins and teachers' reservations are approved directly (UI only: the API must enforce this too)
            const payload = toCreatePayload({ details, materiel, user, autoApprove: canManageReservations(user) });
            await ReservationDataService.create(payload, token);
            history.push('/Reservation');
        } catch (error) {
            console.error('Could not create reservation', error);
            alert("La réservation n'a pas pu être enregistrée. Réessayez.");
            setSubmitting(false);
        }
    };

    // ---------- Render ----------

    return (
        <div>
            <Stepper activeStep={step} alternativeLabel style={{ padding: isMobile ? '16px 0' : 24 }}>
                {(isMobile ? STEP_LABELS.short : STEP_LABELS.long).map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            <Box display="flex" pt={1} pb={2}>
                <Button color="inherit" variant="outlined" onClick={goBack} disabled={submitting}>
                    {step === STEP.DETAILS ? 'Annuler' : 'Retour'}
                </Button>
                <Box flex="1 1 auto" />
                {step !== STEP.SUMMARY && (
                    <Button color="primary" variant="contained" onClick={goNext} disabled={!canGoNext}>
                        Suivant
                    </Button>
                )}
            </Box>

            {step === STEP.DETAILS && (
                <ReservationDetailsForm details={details} onChange={updateDetail} errors={errors} showErrors={showErrors} />
            )}

            {step === STEP.MATERIEL && (
                <ListMaterieleReservation
                    materiel={materiel}
                    setMateriel={setMateriel}
                    materielReserve={reservedByOthers}
                    allMateriele={catalog}
                    setAllMateriele={setCatalog}
                />
            )}

            {step === STEP.SUMMARY && (
                <ReservationSummary
                    details={details}
                    materiel={materiel}
                    creatorEmail={user.email}
                    totals={totals}
                    submitting={submitting}
                    onSubmit={submit}
                />
            )}
        </div>
    );
}

export default AddReservation;
