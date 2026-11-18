import React from 'react';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import useIsMobile from '../hooks/useIsMobile';

const common = require('../common');

// A reservation can span at most this many days after the first one (11 days in total)
export const MAX_EXTRA_DAYS = 10;

// French labels for react-day-picker (it has no built-in locales)
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEKDAYS_LONG = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const WEEKDAYS_SHORT = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

const startOfDay = (date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };

/**
 * Range picker for the reservation period.
 * 1st click: first day. 2nd click: last day (up to MAX_EXTRA_DAYS later; an earlier day restarts).
 * Clicking again once both are set starts a new range. Past days can't be chosen.
 */
export default function DatePickerReserv({ from, setStartDate, to, setEndDate }) {
  const isMobile = useIsMobile();
  const today = startOfDay(new Date());
  const maxEnd = from ? addDays(from, MAX_EXTRA_DAYS) : null;

  const startRange = (day) => { setStartDate(day); setEndDate(null); };

  const handleDayClick = (day, modifiers = {}) => {
    if (modifiers.disabled) return; // react-day-picker v7 still calls onDayClick for disabled days
    if (!from || to || day < startOfDay(from)) {
      startRange(day);
    } else {
      setEndDate(day);
    }
  };

  const reset = () => { setStartDate(null); setEndDate(null); };

  // While choosing the last day, only the allowed window stays clickable
  const disabledDays = from && !to ? [{ before: today }, { after: maxEnd }] : [{ before: today }];

  let message;
  if (!from) message = 'Choisissez le premier jour.';
  else if (!to) message = `Choisissez le dernier jour (au plus tard le ${common.convertDateToFr(maxEnd)}).`;
  else message = `Du ${common.convertDateToFr(from)} au ${common.convertDateToFr(to)}`;

  return (
    <div className="RangeExample">
      <p className={from && to ? 'mb-1' : 'mb-1 text-danger'}>
        {message}{' '}
        {from && (
          <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={reset}>Effacer</button>
        )}
      </p>
      <DayPicker
        className="Selectable"
        numberOfMonths={isMobile ? 1 : 2}
        fromMonth={today}
        locale="fr"
        months={MONTHS}
        weekdaysLong={WEEKDAYS_LONG}
        weekdaysShort={WEEKDAYS_SHORT}
        firstDayOfWeek={1}
        labels={{ nextMonth: 'Mois suivant', previousMonth: 'Mois précédent' }}
        selectedDays={[from, { from, to }]}
        modifiers={{ start: from, end: to }}
        onDayClick={handleDayClick}
        disabledDays={disabledDays}
      />
    </div>
  );
}
