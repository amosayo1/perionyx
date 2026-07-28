# Spacing System

**Phase 22.0B — 4px Base Unit**

---

## Base Scale

Every spacing value in Perionyx derives from a 4px base unit.

| Token | Value | Pixels |
|---|---|---|
| `SPACE[0]` | 0 | 0 |
| `SPACE[px]` | 1px | 1 |
| `SPACE[0.5]` | 2px | 2 |
| `SPACE[1]` | 4px | 4 |
| `SPACE[1.5]` | 6px | 6 |
| `SPACE[2]` | 8px | 8 |
| `SPACE[2.5]` | 10px | 10 |
| `SPACE[3]` | 12px | 12 |
| `SPACE[3.5]` | 14px | 14 |
| `SPACE[4]` | 16px | 16 |
| `SPACE[5]` | 20px | 20 |
| `SPACE[6]` | 24px | 24 |
| `SPACE[7]` | 28px | 28 |
| `SPACE[8]` | 32px | 32 |
| `SPACE[9]` | 36px | 36 |
| `SPACE[10]` | 40px | 40 |
| `SPACE[11]` | 44px | 44 |
| `SPACE[12]` | 48px | 48 |
| `SPACE[14]` | 56px | 56 |
| `SPACE[16]` | 64px | 64 |
| `SPACE[20]` | 80px | 80 |
| `SPACE[24]` | 96px | 96 |

## Semantic Spacing

| Token | Value | Usage |
|---|---|---|
| `LAYOUT.pagePadding` | 24px | Page horizontal padding |
| `LAYOUT.pagePaddingMobile` | 16px | Mobile page padding |
| `LAYOUT.sectionGap` | 32px | Between major sections |
| `LAYOUT.sectionGapMobile` | 24px | Mobile section gap |
| `LAYOUT.cardPadding` | 20px | Standard card padding |
| `LAYOUT.cardPaddingCompact` | 16px | Compact card padding |
| `LAYOUT.cardPaddingLoose` | 24px | Spacious card padding |
| `LAYOUT.cardGap` | 16px | Between cards |
| `LAYOUT.cardGapSmall` | 12px | Between compact cards |
| `LAYOUT.formGap` | 16px | Between form fields |
| `LAYOUT.formGapSmall` | 12px | Between compact fields |
| `LAYOUT.formFieldGap` | 6px | Between label and input |
| `LAYOUT.tableCellPadding` | 12px | Table cell padding |
| `LAYOUT.tableCellPaddingCompact` | 8px | Compact table cell |
| `LAYOUT.inlineGap` | 8px | Between inline elements |
| `LAYOUT.inlineGapSmall` | 4px | Tight inline gap |
| `LAYOUT.iconGap` | 8px | Between icon and text |
| `LAYOUT.iconGapSmall` | 6px | Tight icon gap |
| `LAYOUT.dialogPadding` | 24px | Dialog content padding |
| `LAYOUT.dialogGap` | 16px | Dialog action gap |

## Layout Constants

| Token | Value | Usage |
|---|---|---|
| `LAYOUT.containerMax` | 1280px | Content container max-width |
| `LAYOUT.containerNarrow` | 768px | Narrow content (docs, articles) |
| `LAYOUT.containerWide` | 1440px | Wide content (dashboards) |
| `LAYOUT.sidebarWidth` | 280px | Sidebar width |
| `LAYOUT.sidebarWidthCollapsed` | 64px | Collapsed sidebar |
| `LAYOUT.topbarHeight` | 56px | Topbar height |

## Usage Rules

1. **Always use tokens** — no hardcoded pixel values
2. **Spacing must be on-grid** — values from the 4px scale only
3. **Semantic tokens for layout** — `LAYOUT.cardPadding`, not `SPACE[5]`
4. **Base tokens for gaps** — `SPACE[4]` for inline gaps, `SPACE[8]` for section gaps
