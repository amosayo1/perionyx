# Design Principles

**Phase 22.0B — 8 Governing Principles**

Every visual decision in Perionyx must comply with these principles. They are not aspirational. They are enforced.

---

## 1. Clarity Above All

Every screen answers **one question**. No visual noise. No decorative elements that do not serve comprehension.

- A CFO scanning a cash position dashboard sees **the number first**, everything else second
- A treasurer reviewing payment batches sees **status at a glance**, not buried in tooltips
- An auditor reviewing an audit trail sees **chronological integrity**, not aesthetic flourish

**Rule**: If a visual element does not help a user understand data, complete a task, or navigate confidently — remove it.

## 2. Confidence Through Honesty

Every data point has a source. Every state has an explanation. Every cached value is labeled.

- Stale data is **marked stale**, not silently served
- A destructive action **asks for confirmation**, not a second click
- A balance that is cached **says "cached"**, not implied as live

**Rule**: Never let the user guess. Label uncertainty. Confirm destruction. Attribute sources.

## 3. Speed Is Respect

CFOs do not wait. Treasurers do not wait. Auditors do not wait.

- Metric values render **first**, charts second
- Tables load with **progressive disclosure** — rows appear, not loading spinners
- Navigation transitions are **under 300ms**

**Rule**: Perceived performance is as important as actual performance. Show content, then refine.

## 4. Restraint Is Beauty

Beauty is achieved through restraint, not decoration.

- Generous whitespace communicates confidence
- Consistent rhythm creates predictability
- Purposeful color — gold means something, never decorative

**Rule**: The fewer visual elements on screen, the more important each one becomes. Use whitespace as a design tool.

## 5. Dark-First

The primary experience is dark. Light is an accessibility accommodation, not the default.

- Backgrounds are `#0a0a0f` (base) → `#111118` (raised) → `#1a1a24` (elevated)
- Text is `#f7f6f2` (primary) → `#a1a1aa` (secondary) → `#71717a` (tertiary)
- Gold accent (`#d4af37`) is used sparingly — active states, key metrics, primary actions

**Rule**: Dark mode is the only mode. Accessibility contrast ratios are maintained on dark backgrounds.

## 6. Consistency Is Trust

Same action, same appearance. Same data type, same formatting. Same state, same color.

- All monetary values use `formatDecimalCurrency()` with `Intl.NumberFormat`
- All dates use relative formatting ("3m ago") or ISO-8601
- All status indicators use the same color vocabulary: green/yellow/red/blue/gold

**Rule**: If a user learns a pattern once, it works everywhere. No exceptions.

## 7. Token-Driven, Never Hardcoded

Every color, spacing, radius, shadow, and animation comes from EDL tokens.

```typescript
// ✅ Correct
<div style={{ background: SURFACES.raised, padding: LAYOUT.cardPadding }}>

// ❌ Wrong
<div style={{ background: "#111118", padding: "20px" }}>
```

**Rule**: Hardcoded values are bugs. EDL tokens are the only acceptable source of visual truth.

## 8. Enterprise Density

Enterprise users need information density. White space is generous but never wasteful.

- Tables: 25–200 rows visible without scrolling
- Cards: key metrics visible at a glance, details on hover/tap
- Navigation: 80+ items accessible without hunting

**Rule**: Dense ≠ cluttered. Every pixel carries meaning. Empty space is intentional.
