# Typography System

**Phase 22.0B — Type Scale & Font Stack**

---

## Font Families

| Token | Font | Fallback | Usage |
|---|---|---|---|
| `FONT_FAMILY.sans` | Inter | system-ui, sans-serif | All UI text |
| `FONT_FAMILY.mono` | JetBrains Mono | SF Mono, Monaco, monospace | Code, financial numbers |
| `FONT_FAMILY.arabic` | Noto Kufi Arabic | Inter, sans-serif | Arabic locale (RTL) |

Both Inter and JetBrains Mono are loaded via `next/font/google` for optimal performance.

## Type Scale

| Token | Size | Line Height | Tracking | Weight | Usage |
|---|---|---|---|---|---|
| `display` | 48px | 56px | -0.02em | 700 | Hero section titles |
| `hero` | 36px | 44px | -0.02em | 700 | Page hero |
| `h1` | 30px | 36px | -0.015em | 600 | Section title |
| `h2` | 24px | 32px | -0.01em | 600 | Card title |
| `h3` | 20px | 28px | -0.005em | 600 | Subsection |
| `h4` | 18px | 28px | 0em | 500 | Minor heading |
| `body` | 16px | 24px | 0em | 400 | Body text |
| `bodyMedium` | 16px | 24px | 0em | 500 | Emphasized body |
| `sm` | 14px | 20px | 0em | 400 | Secondary text |
| `smMedium` | 14px | 20px | 0em | 500 | Emphasized secondary |
| `xs` | 12px | 16px | 0.01em | 400 | Caption, label |
| `xsMedium` | 12px | 16px | 0.01em | 500 | Emphasized caption |
| `micro` | 11px | 14px | 0.02em | 500 | Micro text, badges |

## Financial Typography

| Token | Size | Font | Weight | Usage |
|---|---|---|---|---|
| `financial` | 20px | JetBrains Mono | 600 | Metric values (cards) |
| `financialLg` | 32px | JetBrains Mono | 700 | Hero metrics (dashboard) |
| `financialSm` | 14px | JetBrains Mono | 500 | Inline numbers (tables) |

Financial numbers use **tabular figures** (`font-variant-numeric: tabular-nums`) for column alignment.

## Table Typography

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Header | 12px | 600 | 0.02em |
| Cell | 14px | 400 | 0em |
| Cell (number) | 14px | 500 | 0em (JetBrains Mono) |

## Usage Rules

1. **Inter everywhere** — no other sans-serif fonts in the UI
2. **JetBrains Mono for numbers** — financial values, timestamps in tables
3. **Never use font-size below 11px** — readability threshold
4. **Heading hierarchy is enforced** — h1 → h2 → h3 → h4, no skipping
5. **Font weights are limited** — 400, 500, 600, 700 only
