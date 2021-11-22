import React, { useState } from 'react';
import Helmet from 'react-helmet';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

export default function DatePickerReserv(props) {
  const {from, setStartDate, to, setEndDate} = props;
  /* const [from, setStartDate] = useState(null);
  const [to, setEndDate] = useState(null);
 */
  function handleDayClick(day) {   
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((day - from) / oneDay));
    const range = DateUtils.addDayToRange(day, undefined);
    
    if(diffDays <= 10){
      const range = DateUtils.addDayToRange(day, {from: from, to: to});
      setStartDate(range.from);
      setEndDate(range.to)
    }
    else {
      setStartDate(range.from);
      setEndDate(range.to)
    }
    
  }

  function handleResetClick() {
    setStartDate(null);
    setEndDate(null)
  }

  const modifiers = { start: from, end: to };
  
  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  return (
    <div className="RangeExample">
      <p style={{color: !from || !to ? 'red' : null}}>
        {!from && !to && 'Please select the first day.'}
        {from && !to && 'Please select the last day.'}
        {from &&
          to &&
          `Selected from ${from.toLocaleDateString()} to
              ${to.toLocaleDateString()}`}{' '}
        {from && to && (
          <button className="link" onClick={handleResetClick}>
            Reset
          </button>
        )}
      </p>
      <DayPicker
        className="Selectable"
        numberOfMonths={2}
        selectedDays={[from, { from, to }]}
        modifiers={modifiers}
        onDayClick={handleDayClick}
        disabledDays={{ before: from , after: addDays(from, 10)}}
      />
      <Helmet>
        <style>{`
          .Selectable .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
              background-color: #f0f8ff !important;
              color: #4a90e2;
          }
          .Selectable .DayPicker-Day {
              border-radius: 0 !important;
          }
          .Selectable .DayPicker-Day--start {
              border-top-left-radius: 50% !important;
              border-bottom-left-radius: 50% !important;
          }
          .Selectable .DayPicker-Day--end {
              border-top-right-radius: 50% !important;
              border-bottom-right-radius: 50% !important;
          }
        `}</style>
      </Helmet>
    </div>
  );
  
}