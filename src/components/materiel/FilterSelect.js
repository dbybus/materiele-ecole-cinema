import React from 'react';
import { MenuItem, Select } from '@material-ui/core';
import { ALL } from './materielUtils';

/** Category / location filter dropdown ("all" + the given options). Used by the equipment tables. */
export default function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} style={{ minWidth: 130 }}>
      <MenuItem value={ALL}><em>{allLabel}</em></MenuItem>
      {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </Select>
  );
}
