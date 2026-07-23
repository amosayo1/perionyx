export const spacing = {
  0: "0px",
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

  // Semantic spacing
  page: {
    padding: "24px",
    maxWidth: "1440px",
    gutter: "24px",
  },

  card: {
    padding: "20px",
    gap: "16px",
    compactPadding: "12px",
  },

  section: {
    gap: "24px",
    padding: "32px",
  },

  panel: {
    padding: "16px",
    gap: "12px",
  },

  form: {
    gap: "20px",
    fieldGap: "16px",
    labelGap: "6px",
    inputPadding: "10px 12px",
  },

  table: {
    cellPadding: "12px 16px",
    compactCellPadding: "8px 12px",
    rowGap: "0px",
  },

  navigation: {
    itemPadding: "8px 12px",
    sectionGap: "4px",
    groupGap: "16px",
    iconRight: "12px",
  },

  dialog: {
    padding: "24px",
    maxWidth: "480px",
  },
} as const;

export type SpacingToken = typeof spacing;
