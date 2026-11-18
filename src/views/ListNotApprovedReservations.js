import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialTable from 'material-table';
import { Container, Alert } from 'react-bootstrap';
import { Snackbar } from '@material-ui/core';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ReservationDataService from '../services/reservation.service';
import { tableIcons, localizationFr } from '../components/table/materialTableConfig';
import { approvalConflicts, approvalPayload, notifyReservationsChanged } from '../components/reservation/reservationUtils';
import {
  ConflictStatus, DecisionButtons, PeriodText, RequestedMateriel, StartsIn,
} from '../components/reservation/PendingReservationParts';
import { useAuth0 } from '../auth';
import useIsMobile from '../hooks/useIsMobile';
import useFitPageSize from '../hooks/useFitPageSize';

const common = require('../common');

const itemCount = (r) => (r.getReservation || []).reduce((sum, line) => sum + line.quantite, 0);

/** Shown when nothing is waiting. */
function EmptyState() {
  return (
    <div className="empty-state">
      <DoneAllIcon className="empty-state-icon" />
      <h2>Aucune réservation en attente</h2>
      <p className="text-muted mb-0">Toutes les demandes ont été traitées.</p>
    </div>
  );
}

/** Extra information shown when a table row is expanded. */
function RowDetails({ reservation, conflicts }) {
  return (
    <div className="pending-details">
      <div>
        <h3 className="pending-details-title">Matériel demandé</h3>
        <RequestedMateriel reservation={reservation} conflicts={conflicts} />
      </div>
      <dl className="pending-details-meta">
        <dt>Lieu</dt><dd>{reservation.lieu}</dd>
        <dt>Demandée par</dt><dd>{reservation.createurEmail || '—'}</dd>
        <dt>Demandée le</dt><dd>{reservation.createdAt ? common.convertDateToFr(reservation.createdAt) : '—'}</dd>
      </dl>
    </div>
  );
}

/**
 * Admins / teachers: reservations waiting for approval, soonest first.
 * Each request shows whether approving it would overbook equipment already promised to approved reservations.
 */
function ListNotApprovedReservations() {
  const isMobile = useIsMobile();
  const { getAccessTokenSilently } = useAuth0();

  const [reservations, setReservations] = useState([]); // all of them: approved ones are needed for the stock check
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState({});                 // { [id]: 'approve' | 'refuse' }
  const [flash, setFlash] = useState(null);

  const loadReservations = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const { data } = await ReservationDataService.getAll(token);
      setReservations(data);
    } catch (error) {
      console.error('Could not load reservations', error);
    } finally {
      setLoaded(true);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const pending = useMemo(
    () => reservations
      .filter((r) => !r.isApproved)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start)),
    [reservations]
  );
  const conflictsById = useMemo(
    () => new Map(pending.map((r) => [r.id, approvalConflicts(r, reservations)])),
    [pending, reservations]
  );
  const conflictCount = pending.filter((r) => conflictsById.get(r.id).length > 0).length;

  // ---------- Decisions ----------

  const decide = async (reservation, kind) => {
    const conflicts = conflictsById.get(reservation.id) || [];
    const question = kind === 'approve'
      ? conflicts.length > 0 &&
        `« ${reservation.titre} » dépasse le stock disponible :\n${conflicts.map((c) => `• ${c.label} : ${c.requested} demandé(s), ${c.available} disponible(s)`).join('\n')}\n\nValider quand même ?`
      : `Refuser « ${reservation.titre} » ?\n\nLa demande sera supprimée ; ${reservation.beneficiaire} devra en faire une nouvelle.`;
    if (question && !window.confirm(question)) return;

    setBusy((b) => ({ ...b, [reservation.id]: kind }));
    try {
      const token = await getAccessTokenSilently();
      if (kind === 'approve') {
        await ReservationDataService.update(reservation.id, approvalPayload(reservation), token);
        setFlash({ variant: 'success', text: `« ${reservation.titre} » validée.` });
      } else {
        await ReservationDataService.delete(reservation.id, token);
        setFlash({ variant: 'secondary', text: `« ${reservation.titre} » refusée.` });
      }
      await loadReservations();
      notifyReservationsChanged(); // the navbar badges recount
    } catch (error) {
      console.error('Decision failed', error);
      setFlash({ variant: 'danger', text: "L'action n'a pas pu être enregistrée. Réessayez." });
    } finally {
      setBusy((b) => { const next = { ...b }; delete next[reservation.id]; return next; });
    }
  };

  // ---------- Table ----------

  const { containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage } =
    useFitPageSize({ data: pending, fallbackRowHeight: 80 });

  const columns = [
    {
      title: 'Réservation', field: 'titre', cellStyle: { minWidth: 200 },
      render: (r) => <><div className="mat-name">{r.titre}</div><div className="small text-muted">{r.lieu}</div></>,
    },
    { title: 'Bénéficiaire', field: 'beneficiaire', cellStyle: { overflowWrap: 'anywhere', minWidth: 210 } },
    {
      title: 'Période', field: 'date_start', defaultSort: 'asc', width: 210,
      render: (r) => <><PeriodText reservation={r} /><div><StartsIn date={r.date_start} /></div></>,
    },
    {
      title: 'Matériel', field: 'getReservation', sorting: false, searchable: false, width: 200,
      render: (r) => <><div>{itemCount(r)} article{itemCount(r) > 1 ? 's' : ''}</div><ConflictStatus conflicts={conflictsById.get(r.id) || []} /></>,
    },
    {
      title: '', field: 'id', sorting: false, searchable: false, width: 230,
      render: (r) => <DecisionButtons busy={busy[r.id]} onApprove={() => decide(r, 'approve')} onRefuse={() => decide(r, 'refuse')} />,
    },
  ];

  // ---------- Render ----------

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Réservations à valider</h1>
          <p className="page-subtitle">
            {pending.length} en attente
            {conflictCount > 0 && <> · <span className="text-danger">{conflictCount} avec conflit de stock</span></>}
          </p>
        </div>
      </header>

      {loaded && pending.length === 0 ? (
        <EmptyState />
      ) : isMobile ? (
        <ul className="picker-list">
          {pending.map((r) => {
            const conflicts = conflictsById.get(r.id) || [];
            return (
              <li key={r.id} className={`pending-card${conflicts.length ? ' has-conflict' : ''}`}>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="mat-name">{r.titre}</div>
                    <div className="small text-muted">{r.lieu} · {r.beneficiaire}</div>
                  </div>
                  <StartsIn date={r.date_start} />
                </div>
                <div className="small my-2"><PeriodText reservation={r} /></div>
                <RequestedMateriel reservation={r} conflicts={conflicts} />
                <div className="d-flex justify-content-between align-items-center mt-2 gap-2 flex-wrap">
                  <ConflictStatus conflicts={conflicts} />
                  <DecisionButtons busy={busy[r.id]} onApprove={() => decide(r, 'approve')} onRefuse={() => decide(r, 'refuse')} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Container className="table-view pending-table" ref={containerRef}>
          <MaterialTable
            title=""
            tableRef={tableRef}
            icons={tableIcons}
            localization={localizationFr}
            columns={columns}
            data={pending}
            onChangeRowsPerPage={onChangeRowsPerPage}
            detailPanel={[{
              tooltip: 'Détails',
              render: (r) => <RowDetails reservation={r} conflicts={conflictsById.get(r.id) || []} />,
            }]}
            options={{
              showTitle: false,
              searchFieldAlignment: 'left',
              searchFieldStyle: { minWidth: 280 },
              pageSize,
              pageSizeOptions,
              emptyRowsWhenPaging: false,
              // Requests that would overbook get an orange accent
              rowStyle: (r) => ((conflictsById.get(r.id) || []).length > 0 ? { borderLeft: '4px solid #ef6c00' } : { borderLeft: '4px solid transparent' }),
            }}
          />
        </Container>
      )}

      <Snackbar open={!!flash} autoHideDuration={5000} onClose={() => setFlash(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert variant={flash ? flash.variant : 'success'} className="mb-0 shadow" dismissible onClose={() => setFlash(null)}>
          {flash && flash.text}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ListNotApprovedReservations;
