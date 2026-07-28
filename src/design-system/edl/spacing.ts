/**
 * Phase 22.0B — EDL Canonical Spacing Tokens
 *
 * Single 4px base unit. Every margin, padding, gap, and offset
 * in Perionyx derives from this scale.
 */

// ── Base Scale (4px unit) ────────────────────────────────────────────────────

export const SPACE = {
  0: "0px",
  px: "1px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
} as const;

// ── Semantic Spacing ─────────────────────────────────────────────────────────
// Named tokens for consistent usage across the application

export const LAYOUT = {
  // Page-level
  pagePadding: SPACE[6],          // 24px — page horizontal padding
  pagePaddingMobile: SPACE[4],    // 16px — mobile page padding
  sectionGap: SPACE[8],           // 32px — between major sections
  sectionGapMobile: SPACE[6],     // 24px — mobile section gap

  // Container
  containerMax: "1280px",         // max-width for content containers
  containerNarrow: "768px",       // max-width for narrow content (docs, articles)
  containerWide: "1440px",        // max-width for wide content (dashboards)

  // Card
  cardPadding: SPACE[5],          // 20px — standard card padding
  cardPaddingCompact: SPACE[4],   // 16px — compact card padding
  cardPaddingLoose: SPACE[6],     // 24px — spacious card padding
  cardGap: SPACE[4],              // 16px — gap between cards
  cardGapSmall: SPACE[3],         // 12px — gap between compact cards

  // Section
  sectionPadding: SPACE[5],       // 20px — section internal padding
  sectionHeaderGap: SPACE[3],     // 12px — gap between header and content

  // Form
  formGap: SPACE[4],              // 16px — between form fields
  formGapSmall: SPACE[3],         // 12px — between compact form fields
  formFieldGap: SPACE[1.5],       // 6px — between label and input

  // Table
  tableCellPadding: SPACE[3],     // 12px — table cell padding
  tableCellPaddingCompact: SPACE[2], // 8px — compact table cell
  tableRowGap: SPACE[0],          // 0px — table rows are flush

  // Navigation
  navItemGap: SPACE[1],           // 4px — between nav items
  navItemPadding: SPACE[2],       // 8px — nav item padding
  sidebarWidth: "280px",          // sidebar width
  sidebarWidthCollapsed: "64px",  // collapsed sidebar width
  topbarHeight: "56px",           // topbar height

  // Dialog/Modal
  dialogPadding: SPACE[6],        // 24px — dialog content padding
  dialogGap: SPACE[4],            // 16px — dialog action gap

  // Inline
  inlineGap: SPACE[2],            // 8px — between inline elements
  inlineGapSmall: SPACE[1],       // 4px — tight inline gap
  iconGap: SPACE[2],              // 8px — between icon and text
  iconGapSmall: SPACE[1.5],       // 6px — tight icon gap
} as const;

// ── Tailwind Class Mapping ───────────────────────────────────────────────────

export const SPACING_CLASSES = {
  page: "p-6",
  pageMobile: "p-4",
  section: "space-y-8",
  card: "p-5",
  cardCompact: "p-4",
  cardLoose: "p-6",
  inline: "gap-2",
  inlineSmall: "gap-1",
  form: "space-y-4",
  formSmall: "space-y-3",
  table: "p-3",
} as const;
