import React from 'react';
import { Button, MenuItem, Select, TextField } from '@material-ui/core';
import { normalize } from './materielUtils';

/**
 * Dropdown used to edit a column in a material-table row (category, location, degree).
 * A legacy value that isn't in the list (e.g. lowercase "image") is kept as an extra option,
 * so editing another field never silently changes it.
 */
export function SelectEditor({ value, onChange, options }) {
  const known = options.some((o) => normalize(o.value) === normalize(value));
  const allOptions = known || value === undefined || value === null || value === ''
    ? options
    : [{ value, label: String(value) }, ...options];
  const current = allOptions.find((o) => normalize(o.value) === normalize(value));

  return (
    <Select value={current ? current.value : ''} onChange={(e) => onChange(e.target.value)} style={{ minWidth: 110 }}>
      {allOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </Select>
  );
}

/**
 * Name + reference in one cell (the "Nom" column shows the reference under the name).
 * Uses material-table's rowData/onRowDataChange to edit both fields of the row.
 */
export function NameRefEditor({ rowData, onRowDataChange }) {
  const change = (field) => (e) => onRowDataChange({ ...rowData, [field]: e.target.value });
  return (
    <div style={{ minWidth: 180 }}>
      <TextField fullWidth size="small" label="Nom" value={rowData.label || ''} onChange={change('label')} />
      <TextField fullWidth size="small" label="Référence" value={rowData.ref || ''} onChange={change('ref')} style={{ marginTop: 6 }} />
    </div>
  );
}

/** Image picker for the edit row: stores the chosen File as the cell value and shows its name. */
export function ImageEditor({ value, onChange }) {
  const inputId = 'materiel-image-input';
  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onChange(e.target.files[0])}
      />
      <label htmlFor={inputId}>
        <Button variant="outlined" size="small" color="primary" component="span">
          {value instanceof File ? 'Changer' : 'Image…'}
        </Button>
      </label>
      {value instanceof File && <div className="small text-muted text-truncate" style={{ maxWidth: 120 }}>{value.name}</div>}
    </div>
  );
}
