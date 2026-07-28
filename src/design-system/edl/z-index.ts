/**
 * Phase 22.0B — EDL Canonical Z-Index Tokens
 *
 * Predictable stacking. No arbitrary z-index values anywhere.
 */

export const Z = {
  /** Default — no stacking context */
  base: 0,
  /** Content that sits above base */
  content: 1,
  /** Raised content within a card */
  raised: 10,
  /** Sticky headers */
  sticky: 100,
  /** Dropdowns, popovers */
  dropdown: 200,
  /** Sticky nav */
  nav: 300,
  /** Sidebar */
  sidebar: 400,
  /** Modal backdrop */
  overlay: 500,
  /** Modal content */
  modal: 600,
  /** Popover (above modals) */
  popover: 700,
  /** Tooltip */
  tooltip: 800,
  /** Toast / notification */
  toast: 900,
  /** Maximum — skip links, dev tools */
  max: 9999,
} as const;
