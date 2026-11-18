import useMediaQuery from '@material-ui/core/useMediaQuery';

// Matches Bootstrap's "md" breakpoint: true on phones and small tablets (< 768px).
// Use it for layout decisions CSS alone can't make (calendar view, table columns, dialog size).
export default function useIsMobile() {
  return useMediaQuery('(max-width: 767.98px)', { noSsr: true });
}

// Matches below Bootstrap's "xl" breakpoint (< 1200px): phones, tablets and small laptops.
// Use it to drop secondary table columns that don't fit on narrower desktop screens.
export function useIsCompact() {
  return useMediaQuery('(max-width: 1199.98px)', { noSsr: true });
}
