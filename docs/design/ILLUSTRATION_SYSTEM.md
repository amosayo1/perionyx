# Illustration System

**Phase 22.0B — Visual Documentation**

---

## Philosophy

Perionyx uses **diagrams and data visualizations** as its illustration language. No stock photography. No cartoon illustrations. No decorative artwork.

## Diagram Style

| Attribute | Value |
|---|---|
| Stroke | Lucide icon stroke (1.5px) |
| Colors | EDL color tokens only |
| Background | Transparent or `SURFACES.raised` |
| Style | Minimal, technical, monoline |
| Labels | `TEXT.secondary`, `xs` size |

## Diagram Types

| Type | Usage |
|---|---|
| Flow diagrams | Workflow visualization, approval chains |
| Architecture diagrams | System documentation |
| ER diagrams | Data model documentation |
| Process diagrams | AP workflow, procurement flow |
| Comparison tables | Feature comparisons |

## Data Visualization

Charts use `CHARTS` tokens:
- Primary series: gold (`#d4af37`)
- Grid lines: `CHARTS.grid` (`rgba(255,255,255,0.04)`)
- Axis lines: `CHARTS.axis` (`rgba(255,255,255,0.15)`)
- Tooltip: `CHARTS.tooltip` (floating surface)

## Empty States

Empty states use a muted icon + text pattern:
- Icon: `ICON_SIZE.xl` (48px), `ICON_COLOR.muted`
- Title: `h3`, `TEXT.primary`
- Description: `body`, `TEXT.secondary`
- Action: primary button

## Rules

1. **No stock images** — ever
2. **No cartoon illustrations** — enterprise dignity
3. **Diagrams use EDL tokens** — colors, fonts, spacing
4. **Data visualizations are the illustrations** — charts, graphs, metrics
5. **Empty states are informative** — explain what's missing and how to fix it
