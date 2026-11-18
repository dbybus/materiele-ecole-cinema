import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, CircularProgress } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import CheckIcon from '@material-ui/icons/Check';
import ListMaterieleReservation from './ListMaterieleReservation';
import ReservationDetailsForm from '../components/reservation/ReservationDetailsForm';
import ReservationSummary from '../components/reservation/ReservationSummary';
import ReservationRecap from '../components/reservation/ReservationRecap';
import SelectionChips from '../components/reservation/SelectionChips';
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

// Space kept free under the equipment table for the sticky action bar
const ACTION_BAR_HEIGHT = 96;

const common = require('../common');

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
    // Admins and teachers' reservations are approved directly (UI only: the API must enforce this too)
    const autoApprove = canManageReservations(user);

    // ---------- Save ----------

    const submit = async () => {
        if (submitting) return; // no double reservation on double click
        setSubmitting(true);
        try {
            const token = await getAccessTokenSilently();
            const payload = toCreatePayload({ details, materiel, user, autoApprove });
            await ReservationDataService.create(payload, token);
            // The calendar shows this message once it's back
            history.push('/Reservation', {
                flash: autoApprove ? 'Réservation enregistrée et confirmée.' : 'Réservation envoyée pour validation.',
            });
        } catch (error) {
            console.error('Could not create reservation', error);
            alert("La réservation n'a pas pu être enregistrée. Réessayez.");
            setSubmitting(false);
        }
    };

    // ---------- Render ----------

    // Live recap shown in the middle of the action bar
    const actionInfo = () => {
        const items = materiel.reduce((sum, line) => sum + line.quantite, 0);
        if (step === STEP.DETAILS) {
            return isPeriodChosen
                ? <><b>{totals.days} jour{totals.days > 1 ? 's' : ''}</b>{!isMobile && <> · {common.convertDateToFrShort(details.from)} → {common.convertDateToFrShort(details.to)}</>}</>
                : <span className="text-muted">Choisissez une période</span>;
        }
        if (step === STEP.MATERIEL) {
            return items > 0
                ? <><b>{items} article{items > 1 ? 's' : ''}</b> · {common.formatCHF(totals.perDay)}/jour</>
                : <span className="text-muted">Ajoutez au moins un article</span>;
        }
        return <>Total <b>{common.formatCHF(totals.total)}</b></>;
    };

    return (
        <div className="wizard">
            <header className="wizard-header">
                <h1 className="wizard-title">Nouvelle réservation</h1>
                {!isMobile && <p className="wizard-subtitle">Réservez du matériel en trois étapes.</p>}
                <Stepper activeStep={step} alternativeLabel>
                    {(isMobile ? STEP_LABELS.short : STEP_LABELS.long).map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

            </header>

            {step === STEP.DETAILS && (
                <ReservationDetailsForm details={details} onChange={updateDetail} errors={errors}
                    showErrors={showErrors} userEmail={user.email} />
            )}

            {step === STEP.MATERIEL && (
                <>
                    <ReservationRecap details={details} days={totals.days} />
                    <SelectionChips materiel={materiel}
                        onRemoveItem={(id) => setMateriel((selection) => selection.filter((line) => line.id !== id))} />
                    <ListMaterieleReservation
                        materiel={materiel}
                        setMateriel={setMateriel}
                        materielReserve={reservedByOthers}
                        allMateriele={catalog}
                        setAllMateriele={setCatalog}
                        bottomGap={ACTION_BAR_HEIGHT}
                    />
                </>
            )}

            {step === STEP.SUMMARY && (
                <>
                    <ReservationRecap details={details} days={totals.days} />
                    <ReservationSummary
                        details={details}
                        materiel={materiel}
                        creatorEmail={user.email}
                        totals={totals}
                        autoApproved={autoApprove}
                    />
                </>
            )}

            {/* Sticky action bar: always reachable, with a live recap in the middle */}
            <div className="wizard-actions">
                <Button color="inherit" variant="outlined" onClick={goBack} disabled={submitting}
                    startIcon={step === STEP.DETAILS ? null : <ArrowBackIcon />}>
                    {step === STEP.DETAILS ? 'Annuler' : 'Retour'}
                </Button>
                <div className="wizard-actions-info">{actionInfo()}</div>
                {step === STEP.SUMMARY ? (
                    <Button color="primary" variant="contained" onClick={submit} disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}>
                        {submitting ? 'Enregistrement…' : isMobile ? 'Confirmer' : 'Confirmer la réservation'}
                    </Button>
                ) : (
                    <Button color="primary" variant="contained" onClick={goNext} disabled={!canGoNext}
                        endIcon={<ArrowForwardIcon />}>
                        Suivant
                    </Button>
                )}
            </div>
        </div>
    );
}

export default AddReservation;
