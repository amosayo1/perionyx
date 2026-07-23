# Product Decision Log

**Phase:** 8E.2
**Status:** Active registry
**Last Updated:** July 8, 2026

---

## Purpose

Every major product decision must be recorded with the customer evidence that informed it. This log ensures that product decisions are auditable, evidence-backed, and traceable to specific customer needs.

---

## Decision Schema

| Field | Description |
|---|---|
| ID | `DEC-{YYYYMMDD}-{NNN}` |
| Date | ISO 8601 |
| Decision | The decision made |
| Category | Product / Design / Engineering / Process |
| Options Considered | Alternatives evaluated |
| Rationale | Why this option was chosen |
| Customer Evidence | Interview IDs, Pain Point IDs, or Feature Request IDs |
| Rejected Alternatives | Options explicitly rejected with reason |
| Impacted Roadmap Items | RoadmapItemID(s) |
| Decided By | Decision-maker name |
| Revisitable | Yes / No — can this decision be revisited with new evidence? |
| Status | Active / Superseded / Reverted |

---

## Decision Registry

| ID | Date | Decision | Category | Rationale | Evidence | Status |
|---|---|---|---|---|---|---|
| | *(no entries yet)* | | | | | |

---

## Evidence Mapping

Every decision below demonstrates the expected format for linking customer evidence to product decisions.

### Example: Executive Timeline

```
Decision: Build Executive Timeline component for dashboard
Date: 2025-11-15
Category: Product
Options Considered:
  1. Timeline component with filters
  2. Timeline embedded in dashboard
  3. Standalone timeline page + mini version in dashboard
Chosen: Option 3 (standalone + embedded mini)
Rationale:
  - CFOs need at-a-glance view without navigation
  - Controllers need full timeline with filters for audit trail
  - Mini version in dashboard provides preview, standalone provides depth
Customer Evidence:
  - Interview I-20251015-001: CFO requested "one place to see all financial events"
  - Interview I-20251022-002: Controller needed "filterable timeline for audit prep"
  - Pain Point EXR-001: "No consolidated view of financial events across domains"
  - Feature Request FR-20251020-001: "Executive Timeline"
Rejected Alternatives:
  - Option 1 rejected because it adds navigation friction for frequent users
  - Option 2 rejected because dashboard real estate limits depth
Impacted Roadmap Items:
  - Phase 8B.8: Executive Mobile Experience (timeline in mobile)
  - Phase 8D: Dashboard zone 3 (Timeline Preview)
Decided By: Product Director
Revisitable: Yes (if users bypass the timeline or request deeper integration)
Status: Active
```

### Example: Mobile Dashboard Empty States

```
Decision: Replace MOCK_* data with contextual empty states
Date: 2026-07-08
Category: Design
Options Considered:
  1. Keep MOCK_* constants (status quo)
  2. Remove mock data, show empty state with icon + message
  3. Remove mock data, show loading skeleton indefinitely
Chosen: Option 2
Rationale:
  - MOCK_* constants caused false confidence during demos and testing
  - Empty states communicate product intent without fabricating data
  - Each empty state is contextual (icon matches domain, message explains what will appear)
Customer Evidence:
  - No direct customer request — internal certification finding
  - Certificate finding: "Mock data still ships in production components"
Impacted Roadmap Items:
  - Phase 8D.11: Enterprise Certification Remediation
Decided By: Engineering Lead
Revisitable: No (permanent change)
Status: Active
```

### Example: cnRTL Sequential Replacement Bug Fix

```
Decision: Rewrite cnRTL with two-phase deterministic transformation
Date: 2026-07-08
Category: Engineering
Options Considered:
  1. Sequential replacement with longer keys to avoid collisions
  2. Two-phase LTR→TEMP→RTL with collision-free markers
  3. Regex-based single-pass replacement
Chosen: Option 2
Rationale:
  - Option 1 still had edge cases with nested class strings
  - Option 3 was complex for space-x- expansion (one-to-many mapping)
  - Option 2 provides deterministic output, simple to reason about, and passed 28/28 tests
Customer Evidence:
  - No direct customer request — internal certification finding
  - Certificate finding: "cnRTL sequential replacement bug: pl- becomes pr- twice"
  - RTL support is a prerequisite for Arabic localization (strategic market)
Impacted Roadmap Items:
  - Phase 8D.11: Enterprise Certification Remediation
  - Phase 7E: Arabic RTL Phase 1-4
Decided By: Engineering Lead
Revisitable: No (permanent fix)
Status: Active
```

---

## Adding a Decision

1. Assign next ID: `DEC-{YYYYMMDD}-{NNN}`
2. Cite at least one source of customer evidence (Interview ID, Pain Point ID, or Feature Request ID)
3. Document alternatives considered and their rejection rationale
4. Link to impacted roadmap items
5. Set status to `Active`

---

## Decision Review Cadence

Every quarter, the product team reviews:

- **Superseded decisions** — new evidence may overturn old decisions
- **Revisitable decisions** — check if new evidence justifies revisiting
- **Un-backed decisions** — decisions with T3 or no evidence should be prioritized for customer validation
