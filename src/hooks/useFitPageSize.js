import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Computes how many material-table rows fit in the window without scrolling the page,
 * and applies it to the table (material-table only reads options.pageSize on mount,
 * so later changes go through its onChangeRowsPerPage handler via tableRef).
 *
 * It measures, rather than guesses:
 *  - where the table body starts (toolbar/header height varies with screen width),
 *  - the real height of the rendered rows (thumbnails, wrapped names),
 *  - the pagination bar height.
 *
 * Recomputed when the data changes and when the window is resized. Once the user picks
 * a page size from the dropdown, their choice wins and auto-fit stops.
 *
 * @param {object} opts
 * @param {Array}  opts.data            table rows (triggers a re-measure when it changes)
 * @param {number} opts.fallbackRowHeight row height to assume before any row is rendered
 * @param {number} opts.min             never show fewer rows than this
 * @param {number} opts.bottomGap       space to keep under the table (px)
 * @returns {{ containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage }}
 */
export default function useFitPageSize({ data, fallbackRowHeight = 72, min = 3, bottomGap = 24, extraOptions = [20, 50] } = {}) {
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const userChoseRef = useRef(false);

  // First guess before anything is rendered: window height minus navbar, toolbar, header and pagination
  const [pageSize, setPageSize] = useState(() =>
    Math.max(min, Math.floor((window.innerHeight - 300) / fallbackRowHeight))
  );
  const pageSizeRef = useRef(pageSize);
  pageSizeRef.current = pageSize;

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || userChoseRef.current) return;

    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    // Data rows only: skip full-width rows ("no records" message, detail panels).
    // Use with options.emptyRowsWhenPaging = false so there are no blank filler rows either.
    const rows = [...tbody.querySelectorAll(':scope > tr')].filter(tr => !tr.querySelector(':scope > td[colspan]'));
    const heights = rows.map(tr => tr.getBoundingClientRect().height).filter(h => h > 0);
    // Average row height: rows with a 2-line name are taller (≈82px vs 61px). A page with more tall rows
    // than average overflows by a few px at most, which bottomGap absorbs.
    const rowHeight = heights.length ? heights.reduce((a, b) => a + b, 0) / heights.length : fallbackRowHeight;

    // Everything below the rows: horizontal scrollbar, pagination (may wrap on 2 lines on phones), card padding
    const bodyRect = tbody.getBoundingClientRect();
    const below = rows.length
      ? Math.max(0, container.getBoundingClientRect().bottom - bodyRect.bottom)
      : 72;

    const bodyTop = bodyRect.top + window.scrollY;
    const available = window.innerHeight - bodyTop - below - bottomGap;

    const fitted = Math.max(min, Math.floor(available / rowHeight));
    setPageSize(prev => (prev === fitted ? prev : fitted));
  }, [fallbackRowHeight, min, bottomGap]);

  // Re-measure after the data renders
  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [data, measure]);

  // Re-measure on window resize and when images inside the table finish loading
  // (an image without a fixed size changes the row height after the first measure). Debounced.
  useEffect(() => {
    let timer;
    const schedule = () => { clearTimeout(timer); timer = setTimeout(measure, 150); };
    const onLoad = (e) => { if (e.target.tagName === 'IMG') schedule(); };
    const container = containerRef.current;
    window.addEventListener('resize', schedule);
    container && container.addEventListener('load', onLoad, true); // 'load' doesn't bubble: use capture
    return () => {
      window.removeEventListener('resize', schedule);
      container && container.removeEventListener('load', onLoad, true);
      clearTimeout(timer);
    };
  }, [measure]);

  // Push the computed size into the mounted table
  useEffect(() => {
    const table = tableRef.current;
    if (!table || !table.onChangeRowsPerPage || table.state?.pageSize === pageSize) return;
    table.onChangeRowsPerPage({ target: { value: pageSize } });
  }, [pageSize]);

  // material-table calls this (asynchronously) after any page-size change, including ours.
  // A value different from the fitted one can only come from the dropdown: stop auto-fitting.
  const onChangeRowsPerPage = useCallback((size) => {
    if (size !== pageSizeRef.current) userChoseRef.current = true;
  }, []);

  // The current size must be one of the dropdown options (MUI warns otherwise)
  const pageSizeOptions = [...new Set([pageSize, ...extraOptions])].sort((a, b) => a - b);

  return { containerRef, tableRef, pageSize, pageSizeOptions, onChangeRowsPerPage };
}
