# 13 — Accessibility

**Product System · Document 13 of 20**
**Authority: Accessibility is the inclusion, WCAG, and assistive-technology specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Accessibility domain), and the EDL Accessibility System, and is binding on all surfaces.**
**Sources: The four-product research program — Stripe S16 (accessibility by default), Linear S13 (keyboard-first inclusion), Ramp S14.2 (density and readability), Coupa S13 (enterprise accessibility); the EDL; Phase 8B.9 remediation; the Accessibility Guide (docs/platform/A11Y).**

---

## 1. The Accessibility Doctrine

**Accessibility is a release gate, not a review item** (PP-113, PP-114). A Perionyx feature ships only when it meets WCAG 2.1 AA. Accessibility is not a checklist bolted on after design — it is designed in from the first sketch (PP-113). For auditors, the finance user with a screen reader is not a special case; she is the verification standard (PP-115).

The research synthesis:
- **Stripe** ships accessible by default: color is never the sole carrier, focus is never lost (Stripe S16).
- **Linear** is keyboard-first by architecture, proving keyboard accessibility is not a compromise (PP-116).
- **Ramp** proves density and readability coexist: text contrast, generous targets, no tiny-only patterns (PP-235).
- **Coupa** proves enterprise accessibility: exports, tables, and forms readable by assistive technology (PP-118).

## 2. The WCAG 2.1 AA Baseline

Every surface meets WCAG 2.1 AA, with finance-specific emphasis:

- **Color** — never the sole carrier of meaning; status, currency, and risk are text-plus-color (PP-125, PP-072). Contrast ratios meet AA (4.5:1 text, 3:1 large/UI) across the EDL palette.
- **Keyboard** — every action reachable by keyboard (PP-116); full focus visibility (PP-114).
- **Labels** — every field and icon is programmatically labeled (PP-084, Phase 8B.9); no orphaned labels.
- **Landmarks** — skip-link, labeled navigation, single heading hierarchy (PP-114, Phase 8B.9).
- **Focus management** — modals/dialogs trap and return focus (PP-115); the focus ring is never removed.
- **Touch targets** — ≥44px on mobile (PP-117, Phase 8B.8).
- **Reduced motion** — motion yields to `prefers-reduced-motion` (PP-124, PP-234).

## 3. Finance-Specific Accessibility

The finance surface demands more than the baseline:

- **Auditor verification** — screen-reader-readable exports (PP-118, PP-277): exports and reports include headers, structure, and metadata.
- **Charts** — text alternatives and data tables for every chart (PP-236): a chart is never the only representation.
- **Error states** — announced to assistive technology, never only color (PP-141).
- **Timing** — no auto-expiring decisions without warning; audits never time out silently (PP-115).
- **Tables** — proper table semantics: headers, scope, summaries; the reconciliation instrument is readable (PP-118).

## 4. Verification

Accessibility is verified, not assumed (PP-113, PP-119):

- Automated scans in CI for new and changed surfaces.
- Manual keyboard passes for every workflow.
- Screen-reader verification (NVDA/VoiceOver) for high-traffic finance surfaces.
- Contrast checks against the EDL palette in the design gate.

A feature without a passing accessibility check does not ship (PP-113).

## 5. Accessibility Rules (Condensed)

1. Accessibility is a release gate, not a review item (PP-113).
2. WCAG 2.1 AA is the floor for every surface (PP-114).
3. Color is never the sole carrier; text-plus-color always (PP-125).
4. Keyboard reaches every action; focus is never lost (PP-116).
5. Labels are programmatic; no orphaned labels (PP-084).
6. Touch targets ≥44px on mobile (PP-117).
7. Reduced motion is honored (PP-124).
8. Charts carry text alternatives and data tables (PP-236).
9. Exports are screen-reader readable (PP-118).
10. Accessible is verified in CI and by hand (PP-113, PP-119).

## 6. Accessibility Anti-Patterns

- **The color-only status** — meaning conveyed by color alone (rejected: PP-125).
- **The focus trap without exit** — a dialog that traps focus with no escape (rejected: PP-115).
- **The unlabeled icon** — icon-only buttons with no `aria-label` (rejected: Phase 8B.9).
- **The decorative chart** — chart with no text alternative (rejected: PP-236).
- **The contrast gamble** — low-contrast gold on charcoal (rejected: PP-125, EDL AA check).
- **The inaccessible export** — a CSV that loses structure for screen readers (rejected: PP-118, PP-277).

---

*Next: `14 Motion.md` — the motion and animation specification.*
