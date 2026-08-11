# 02 — The Perionyx Product Principles

**Product System · Document 02 of 20**
**Authority: Principles operationalize the Vision (00) and Philosophy (01). They are binding on every surface, workflow, and module.**
**Sources: The four-product research program — Stripe review (80 principles, P01–P80), Linear review (135 principles across 12 domains), Ramp review (125 principles, P-001–P-125), Coupa review (156 principles, with 160 decisions and 200 requirements) — synthesized and reconciled into one canonical set.**

---

## 0. How to Read This Document

This is the canonical principle set for Perionyx product work. It supersedes the principle sets in the individual research reports; where a research report's principle conflicts with this set, this set wins, and the conflict resolution is stated inline.

**Principle format.** Every principle carries eight fields:

1. **Title** — the imperative.
2. **Description** — one or two sentences stating the rule.
3. **Reason** — why the rule exists (the failure it prevents, the value it creates).
4. **Examples** — concrete Perionyx manifestations.
5. **Implementation guidance** — how to realize it in code, data, or interface.
6. **Priority** — P0 (release-blocking), P1 (this year), P2 (next year), or P3 (long-horizon).
7. **Affected modules** — the Perionyx modules most affected.
8. **Research source(s)** — the report(s) that established or reinforced the rule.

**Domains.** Principles are grouped into eighteen domains (A–R). A principle may appear in one domain only; cross-domain references are explicit.

**Priority semantics.** P0 principles are non-negotiable release gates (they recur in Document 20 as non-negotiables). P1 principles are required for platform completeness. P2 and P3 principles are adoption-sequenced but remain binding when a relevant surface is built.

---

## A. Vision, Mission & Product Stance (PP-001 … PP-020)

### PP-001 — One platform, one spine.
**Description:** Perionyx is one financial operating system with a complete lifecycle spine (requisition-to-reconciliation, position-to-decision); modules are stages of the spine, not independent products.
**Reason:** Coupa's dominance is lifecycle ownership; fragmentation destroys the audit-trail argument and the intelligence compound.
**Examples:** The Work Queue spans all modules; every object knows its place in the lifecycle.
**Implementation guidance:** Model the spine explicitly (state machines, stage registry); never ship a module without a defined place on the spine.
**Priority:** P0.
**Affected modules:** All (WorkflowEngine, AP, Treasury, GL, Governance).
**Source(s):** Coupa S2/S3/S4; Ramp S3 (the flywheel); Linear S4.

### PP-002 — Confidence first, momentum second.
**Description:** Trust is the precondition; velocity is the experience. Where the two conflict, confidence wins; where they can coexist, both are mandatory.
**Reason:** Fast-but-opaque software produces fast errors; trustworthy-but-slow software produces reconstruction work.
**Examples:** Provenance on every number (confidence) + keyboard-native queues (momentum).
**Implementation guidance:** Evaluate every feature against both "does it build trust?" and "does it speed decisions?"; reject features that do neither.
**Priority:** P0.
**Affected modules:** All.
**Source(s):** Stripe S2; Linear S19 (positioning); Ramp S13.

### PP-003 — The screen answers one question.
**Description:** Every screen declares and answers a single financial question; information without an action is decoration.
**Reason:** One-decision-per-screen minimizes cognitive load and keeps the platform decision-first.
**Examples:** "Do we have liquidity for 7 days?", "Which exceptions need me today?"
**Implementation guidance:** Enforce a one-question statement in every screen header; audit screens that lack an action.
**Priority:** P0.
**Affected modules:** All pages.
**Source(s):** Stripe P11; Linear S5 (operator loop).

### PP-004 — Evidence beats assertion.
**Description:** Nothing is presented as fact without provenance; every recommendation, number, and status is traceable, labeled-as-estimate, or withheld.
**Reason:** Trust in finance is manufactured by provenance and destroyed by the unexplained.
**Examples:** InsightPanel sourceUrl/sourceLabel/confidence; forecast evidence links.
**Implementation guidance:** Make provenance a first-class renderable object; gate release on traceability.
**Priority:** P0.
**Affected modules:** Governance, Intelligence, InsightPanel, AI.
**Source(s):** Stripe P32–P33; Ramp S13.3/S13.5.

### PP-005 — The review queue is a decision queue, not a log.
**Description:** High-volume review surfaces (approvals, exceptions, "requires me") are designed as queues to be triaged and acted on, not lists to be read.
**Reason:** Linear's inbox/operator loop is the model for AP triage; a passive log fails Controllers.
**Examples:** Approve/reject inline; snooze-with-reason; j/k navigation; decision categories.
**Implementation guidance:** Treat the Work Queue as the primary operator surface; add read-state, urgency, and bulk action.
**Priority:** P0.
**Affected modules:** WorkQueue, ApprovalMatrix, ExceptionService.
**Source(s):** Linear S13.4/S5.6; Ramp P-067; Coupa S8.

### PP-006 — Humans decide; the platform does everything else.
**Description:** Human attention is reserved for critical judgment calls; capture, matching, coding, reconciliation prep, and evidence preparation are automated.
**Reason:** Ramp's premise — humans should make fewer but more critical judgment calls — is the productivity core of finance AI.
**Examples:** Auto-coding, 3-way match preparation, evidence assembly, anomaly surfacing.
**Implementation guidance:** Automate every step that does not require judgment; surface only the judgment step.
**Priority:** P0.
**Affected modules:** AP, Intelligence, AgentFramework, AI.
**Source(s):** Ramp S2.7/S13; Coupa S8 (touchless AP).

### PP-007 — AI never decides.
**Description:** AI explains the past and prepares decisions; the decision authority is always human, and AI-influenced decisions are visibly marked.
**Reason:** The Perionyx AI Behaviour Guide is constitutional; an AI that decides destroys auditability and trust.
**Examples:** Evidence packages, recommendation categories, human approval gates.
**Implementation guidance:** DecisionEngine outputs recommendations, never authorizations; approval authority never routes through AI.
**Priority:** P0.
**Affected modules:** AgentFramework, DecisionEngine, AI, Approvals.
**Source(s):** Ramp S13.3 #1; EPS AI Behaviour Guide; Coupa S11.7.

### PP-008 — Money is the boundary.
**Description:** The trust layer governs money; the craft layer governs views. Optimism is for views; money is server-confirmed, idempotent, and reconciled.
**Reason:** Linear's "optimism for views; certainty for money" is the safest single rule in financial software.
**Examples:** Pending states render honestly; payments are idempotent; views render locally-first.
**Implementation guidance:** Enforce the boundary in rendering contracts and API design (idempotency keys, confirmation flows).
**Priority:** P0.
**Affected modules:** All money-moving surfaces, API, Reconciliation.
**Source(s):** Linear S17.14 #1; Stripe P43; Ramp S13.3 #1.

### PP-009 — Opinionated defaults; earned configuration.
**Description:** Ship one really good way with opinionated defaults; open configuration only when legitimate variance demands it, and make configuration versioned, audited, and reversible.
**Reason:** Linear's opinionation manufactures velocity; Coupa's config-depth manufactures power at the cost of the CFO problem.
**Examples:** Template-first workflow builders; smart defaults; advanced badges.
**Implementation guidance:** Defaults resolve previous input > org > role > sensible; config surfaces state default/effect/audit.
**Priority:** P0.
**Affected modules:** EnterpriseForm, WorkflowEngine, ApprovalMatrix, Setup.
**Source(s):** Linear S2.3; Coupa S2.3; Ramp P-004; Stripe P07.

### PP-010 — Reveal by decision-need.
**Description:** Core information is always visible; optional is labeled; advanced is collapsed; expert is hidden until summoned. The user never fights for basics nor drowns in depth.
**Reason:** Cognitive load is the enemy of judgment; the EPS review flagged a 320-point Invoice Detail as a risk.
**Examples:** Progressive forms, core-view-first screens, density preference.
**Implementation guidance:** Layer detail views (summary → properties → evidence/timeline); enforce a cognitive-load budget per screen.
**Priority:** P0.
**Affected modules:** EnterpriseForm, Detail pages, Dashboard.
**Source(s):** Stripe P12/P18; Linear S17.14 #9; Ramp P-093; Phase 27.1R.

### PP-011 — Tenant sovereignty is absolute.
**Description:** Each tenant's data and intelligence are sovereign; no cross-tenant learning, no community intelligence, no peer data in benchmarks.
**Reason:** This is the constitutional difference from Coupa's moat and the trust asset of the modern era.
**Examples:** Self-referential benchmarking; per-tenant models; provable isolation.
**Implementation guidance:** Enforce isolation at the query layer via RuntimeContext; never persist cross-tenant aggregates.
**Priority:** P0.
**Affected modules:** RuntimeContext, Intelligence, All data layers.
**Source(s):** Coupa S7.6; Ramp P-050; Platform Constitution Law 11.

### PP-012 — Calibrate uncertainty.
**Description:** Distinguish knowing from estimating; express uncertainty in decision categories, bands, horizons, and labels — never fabricated scalar confidence.
**Reason:** Ramp proved LLM confidence scores are unverifiable; a 72% number the platform cannot defend destroys credibility.
**Examples:** Approve/Reject/Needs-review; forecast bands; "estimated, basis X, horizon Y".
**Implementation guidance:** Decision categories for AI; ranges with evidence for forecasts; labels for staleness.
**Priority:** P0.
**Affected modules:** DecisionEngine, Forecasts, Dashboard, AI.
**Source(s):** Ramp S13.4/S13.3 #4; Stripe P17; Coupa S11.

### PP-013 — Stale is labeled, never hidden.
**Description:** Cached, persisted, or aged data is always visibly labeled with its age and mode; data presented as live when it is not is a credibility failure.
**Reason:** Stripe's freshness/stale labeling and Perionyx's DataFreshnessIndicator are the same doctrine; stale-presented-as-live is the CFO's nightmare.
**Examples:** DataFreshnessIndicator, demo/live boundaries, sync indicators.
**Implementation guidance:** Default-on freshness across all read surfaces; render mode boundaries permanently.
**Priority:** P0.
**Affected modules:** Dashboard, EnterpriseTable, DataFreshnessIndicator, All surfaces.
**Source(s):** Stripe P36/S10.3; Linear S9 (sync indicator); Ramp P-008.

### PP-014 — Every status has an explanation.
**Description:** Status is rendered as label + meaning + next action, never as a bare color or a bare word.
**Reason:** "What happened + what to do next" eliminates the anxiety of the unknown (Stripe P29).
**Examples:** Status → explanation → action microcopy template; exception reasons.
**Implementation guidance:** Standardize the status microcopy template across financial states.
**Priority:** P0.
**Affected modules:** EnterpriseTable StatusCell, WorkQueue, Notifications.
**Source(s):** Stripe P29/P26; Ramp P-009.

### PP-015 — Destructive is buried; irreversible is elevated.
**Description:** Destructive actions are hidden from proximity to primaries; irreversible actions demand elevated confirmation and recovery paths.
**Reason:** Accidental money damage is the worst failure mode; Stripe P37/P38 and Ramp P-097 converge.
**Examples:** Overflow menus for refund/void/delete; typed/double-signature for irreversible.
**Implementation guidance:** Tiered confirmation (light → typed → dual-signature) by amount/irreversibility; SoD for destructive ops.
**Priority:** P0.
**Affected modules:** EnterpriseForm, AP, Treasury, IAM, Governance.
**Source(s):** Stripe P37–P39; Ramp P-097; Coupa S12.

### PP-016 — Immutability after finalize.
**Description:** Financial objects are immutable once finalized; corrections flow through designed release valves (void, credit note, amend), never silent edits.
**Reason:** Unbroken audit trails are the Auditor's requirement; Coupa and Stripe both model correction-as-flow.
**Examples:** Void invoices, credit notes, amendment workflows.
**Implementation guidance:** Enforce state machines where final states lock fields; route corrections through sanctioned operations.
**Priority:** P0.
**Affected modules:** AP, GL, Audit, WorkflowEngine.
**Source(s):** Stripe P41; Coupa S8.6; EPS state machines.

### PP-017 — The audit trail is the UX.
**Description:** The append-only, tamper-evident event timeline is a first-class, filterable, exportable surface — the primary trust instrument, not an administrative appendix.
**Reason:** Auditors need chronological integrity; Ramp's "the audit trail is the UX for trust" and Coupa's audit maturity converge.
**Examples:** Timeline on every financial object; audit log page; screen-reader-usable exports.
**Implementation guidance:** Every aggregate renders its event timeline; audit records are append-only and exportable.
**Priority:** P0.
**Affected modules:** Governance, APAuditRecord, All financial objects.
**Source(s):** Ramp P-033/P-102; Stripe P35; Coupa S12.2.

### PP-018 — Evidence packages are exportable artifacts.
**Description:** Every decision's evidence (sources, reasoning, citations, alternatives, outcome) is exportable as a single auditable artifact.
**Reason:** Decisions must survive the platform — for auditors, regulators, and board reviews.
**Examples:** Decision export with evidence chain; screen-reader-friendly formats.
**Implementation guidance:** Model the decision artifact in DecisionEngine; export with full provenance.
**Priority:** P0.
**Affected modules:** DecisionEngine, EvidenceEngine, Governance, export.
**Source(s):** Ramp S13.5; Stripe P32; Coupa S7.

### PP-019 — Data quality by construction.
**Description:** Bad data is prevented at entry (format, validation, reference integrity), not scrubbed after; reference data is immutable or change-requires-approval.
**Reason:** Bad money never reaches the ledger (Stripe P61); vendor bank-detail mutation is a critical risk (Phase 27.1R).
**Examples:** AmountInput binding financial-precision helpers; dual-approval for bank changes.
**Implementation guidance:** Enforce validation at input, cross-field at section, business-rule at submit; lock reference data.
**Priority:** P0.
**Affected modules:** EnterpriseForm, AP, VendorService, Financial precision.
**Source(s):** Stripe P61–P64; Coupa S10.4; Phase 27.1R.

### PP-020 — Idempotency for money commands.
**Description:** Every money-moving command is idempotent and optimistic-concurrency-safe; double-submit cannot double-move money.
**Reason:** Stripe P65 and Ramp P-058 both treat idempotency as a payment-safety floor.
**Examples:** x-idempotency-key middleware; version fields on aggregate roots.
**Implementation guidance:** Wire idempotency keys to all payment/proposal endpoints; version-concurrency on money aggregates.
**Priority:** P0.
**Affected modules:** AP PaymentService, API middleware, UnitOfWork.
**Source(s):** Stripe P65; Ramp P-058; Coupa S8.8.

---

## B. Information Architecture & Navigation (PP-021 … PP-040)

### PP-021 — Navigation reflects user jobs, not database entities.
**Description:** Rail and menu labels name the user's job ("Approvals", "Exceptions", "Work Queue"), never the schema ("ProcurementAPInvoice").
**Reason:** Users translate intent to destination fastest when labels match mental models (Stripe P01).
**Examples:** Job-based rail; canonical object names.
**Implementation guidance:** Label by job; alias schema names out of the UI.
**Priority:** P0.
**Affected modules:** Nav config, all pages.
**Source(s):** Stripe P01; Linear S3; Ramp S5.

### PP-022 — Module order encodes frequency and risk.
**Description:** High-frequency and high-risk surfaces sit at the top of the rail; configuration is pinned to the bottom.
**Reason:** Position memory beats searching (Stripe P02).
**Examples:** Cash position, approvals, work queue top the rail; settings bottom.
**Implementation guidance:** Order the rail by usage analytics and risk tiering.
**Priority:** P0.
**Affected modules:** Nav config, AppShell.
**Source(s):** Stripe P02; Linear S3.3.

### PP-023 — Every destination is ≤2 clicks from anywhere.
**Description:** The top CFO/Treasurer/Controller journeys never exceed two clicks; a click-budget audit is a release gate.
**Reason:** Navigation cost multiplies with financial frequency (Stripe P03).
**Examples:** Quick-jump command palette; persistent primary surfaces.
**Implementation guidance:** Enforce a click-budget audit on the top 20 journeys.
**Priority:** P1.
**Affected modules:** Nav, CommandPalette, all pages.
**Source(s):** Stripe P03; Linear S3.

### PP-024 — Global search dissolves IA.
**Description:** One search spans vendors, invoices, payments, journals, exceptions, and balances, with grouped type-ahead results and exact-ID jump.
**Reason:** Users shouldn't know which section holds the answer (Stripe P04; Linear S4.9).
**Examples:** Command palette over all objects; fuzzy highlight; exact-ID jump.
**Implementation guidance:** Build one index over financial objects; rank by relevance + recency.
**Priority:** P0.
**Affected modules:** CommandPalette, Search, All modules.
**Source(s):** Stripe P04; Linear S4.9/S10; Ramp S5.4.

### PP-025 — The rail scales by role, not by pinning.
**Description:** Default navigation is role-shaped (Treasurer ≠ AP Manager); pins and recents are a personal layer on top.
**Reason:** Pins were Stripe's band-aid for growth; role-shaping prevents the problem (Stripe P05).
**Examples:** Role-aware default rail; personal pins layer.
**Implementation guidance:** Model role-based default rails; overlay personalization.
**Priority:** P1.
**Affected modules:** Nav config, IAM.
**Source(s):** Stripe P05; Linear S4.7 (favorites).

### PP-026 — Environment and data-mode are permanent labeled boundaries.
**Description:** Demo/live/test modes and data freshness states occupy an always-visible slot; never a subtle toggle.
**Reason:** The highest-stakes state must be unmissable (Stripe P06/P42).
**Examples:** "Demo Data · Seeded · not persisted" footer badge; live-mode markers.
**Implementation guidance:** Render mode boundaries at the data layer and the chrome layer.
**Priority:** P0.
**Affected modules:** AppShell, DataFreshnessIndicator, All surfaces.
**Source(s):** Stripe P06/P42; Ramp P-008.

### PP-027 — Settings are a last resort, tiered by scope.
**Description:** Configuration is tiered (company/domain/personal), permission-shaped, and reachable last, not first.
**Reason:** Burying configuration reduces accidental breakage (Stripe P07).
**Examples:** IAM/security/audit (company) vs AP/treasury/GL (domain) vs density/views (personal).
**Implementation guidance:** Tier settings by scope; enforce permission shaping.
**Priority:** P1.
**Affected modules:** Settings, IAM, EnterpriseForm.
**Source(s):** Stripe P07; Linear S13.3 (governance in interface, not settings).

### PP-028 — Breadcrumbs are the exit path from deep work.
**Description:** Every detail and app page carries breadcrumbs; detail pages are never dead ends.
**Reason:** Detail pages must not become dead ends (Stripe P08/P60).
**Examples:** Breadcrumbs on all detail pages; row-click → detail → breadcrumb back.
**Implementation guidance:** Render breadcrumbs by default; audit raw table pages (WF-012).
**Priority:** P1.
**Affected modules:** All detail pages, EnterpriseTable.
**Source(s):** Stripe P08/P60; Linear S7.

### PP-029 — Deep analysis escapes cleanly to export/SQL.
**Description:** UI handles 80% of analysis; power users get CSV/XLS export on every table and analyst-gated SQL capability.
**Reason:** UI handles 80%, power tools handle the tail (Stripe P10; Coupa S13 extensibility).
**Examples:** Export everywhere; analyst-role SQL surface.
**Implementation guidance:** Export as a first-class feature; gate SQL behind a role.
**Priority:** P1.
**Affected modules:** EnterpriseTable export, Analyst surfaces.
**Source(s):** Stripe P10; Coupa S13; Ramp P-088.

### PP-030 — Views are projections; they never change work.
**Description:** Saved views, filters, and grouping are presentation projections over the same data; they never mutate the underlying work.
**Reason:** Linear's "views are projections; they never change work" prevents per-view divergence.
**Examples:** Saved views on queues; filter presets; density as projection.
**Implementation guidance:** Separate view-state from domain-state; persist projections as metadata.
**Priority:** P1.
**Affected modules:** EnterpriseTable, WorkQueue, saved views.
**Source(s):** Linear S4.6/S17.14 #5; Stripe P59.

### PP-031 — In-view navigation highlights, it never opens.
**Description:** Lists support preview/highlight (peek) before full open; the read/act split is explicit.
**Reason:** Peek beats open for review; open beats peek for work (Linear S17.14 #4).
**Examples:** Space-bar peek on queues; row highlight with j/k; full open for work.
**Implementation guidance:** Build the list→peek→open→edit rhythm.
**Priority:** P1.
**Affected modules:** WorkQueue, EnterpriseTable, detail views.
**Source(s):** Linear S5.4/S8.4; Stripe P60.

### PP-032 — The header is context, not chrome.
**Description:** The header carries the current object/screen context and its primary action — never redundant navigation.
**Reason:** Linear's "header: context, not chrome" keeps the chrome minimal.
**Examples:** Screen question in header; primary CTA in header.
**Implementation guidance:** Budget header real estate; render context + one primary action.
**Priority:** P1.
**Affected modules:** AppShell, page headers.
**Source(s):** Linear S3.4; Stripe S3.

### PP-033 — Shortcuts are discoverable and consistent.
**Description:** A discoverable shortcut vocabulary (command palette, ?, j/k, Cmd+S) exists everywhere, with a single registry.
**Reason:** Linear's shortcut school and Stripe's palette both teach mastery (Linear S10.3).
**Examples:** Keyboard shortcuts dialog; financial context shortcuts (approve/next).
**Implementation guidance:** Extend useKeyboardShortcuts; document a canonical vocabulary.
**Priority:** P1.
**Affected modules:** CommandPalette, AppShell, WorkQueue.
**Source(s):** Linear S10; Stripe P80; Ramp P-098.

### PP-034 — Navigation never reloads.
**Description:** Navigation between surfaces is client-side and instant; the page never fully reloads.
**Reason:** Linear's "the page never reloads" is the perceived-performance floor.
**Examples:** Client routing; component-local loading.
**Implementation guidance:** Keep navigation client-side; skeleton within destinations.
**Priority:** P1.
**Affected modules:** AppShell, routing, DataTable.
**Source(s):** Linear S3.8/S9; Stripe P77.

### PP-035 — One elevated layer at a time.
**Description:** Dialog over content; never modal-over-drawer; elevation signals one layering step.
**Reason:** Deep stacks confuse state (Stripe P72).
**Examples:** ConfirmDialog as single elevated layer.
**Implementation guidance:** Enforce elevation discipline in component contracts.
**Priority:** P1.
**Affected modules:** EDL, AnimatedDialog, ConfirmDialog.
**Source(s):** Stripe P72; Linear S8.

### PP-036 — Recents and pins personalize a shared surface.
**Description:** Personal recents/pins ride on top of role defaults; the shared IA stays canonical.
**Reason:** Individual rails inside a consistent IA (Stripe P09).
**Examples:** Recents in rail; pinned views.
**Implementation guidance:** Overlay personalization; never fork the canonical IA.
**Priority:** P2.
**Affected modules:** Nav, AppShell.
**Source(s):** Stripe P09; Linear S4.7.

### PP-037 — Cross-module objects are one object.
**Description:** A vendor, invoice, or fund referenced in multiple modules is the same canonical object with one identity.
**Reason:** Ramp's shared counterparty graph (the Vendor object) prevents duplication and drift.
**Examples:** Vendor trust state shared across AP and Treasury.
**Implementation guidance:** Model shared aggregates canonically; modules reference, never duplicate.
**Priority:** P0.
**Affected modules:** VendorService, AP, Treasury, GL.
**Source(s):** Ramp S5.5/P-020/P-066; Coupa S5.

### PP-038 — The fund/entity is a universal container.
**Description:** Entities, funds, and cost centers are first-class containers that scope money, approvals, and views.
**Reason:** Ramp's Fund as universal container scales multi-entity finance cleanly.
**Examples:** Per-entity approval thresholds; entity-scoped dashboards.
**Implementation guidance:** Scope every money object by entity container; per-entity routing.
**Priority:** P1.
**Affected modules:** Treasury, AP, RuntimeContext, ApprovalMatrix.
**Source(s):** Ramp S5.3/P-110/P-116; Coupa S3.

### PP-039 — Environment markers carry through every surface.
**Description:** Test/demo/live and data-mode markers propagate into exports, printouts, and screenshots.
**Reason:** Test data escaping into audit artifacts is a compliance disaster.
**Examples:** Watermarks on demo exports.
**Implementation guidance:** Propagate mode into export/print pipelines.
**Priority:** P1.
**Affected modules:** export, Governance, AppShell.
**Source(s):** Stripe P06/P42.

### PP-040 — Empty navigation states teach.
**Description:** A module with nothing to show explains what it is, why it is empty, and how to populate it.
**Reason:** The empty moment is an onboarding opportunity (Stripe P31; Linear S3.7).
**Examples:** "Import your first vendor file" empty states.
**Implementation guidance:** Template empty states with a concrete next action.
**Priority:** P1.
**Affected modules:** All list surfaces.
**Source(s):** Stripe P31; Linear S3.7/S6.6; Ramp P-117.

---

## C. Decision Surfaces, KPIs & Dashboards (PP-041 … PP-060)

### PP-041 — 4–6 KPIs above the fold.
**Description:** The fold holds only behavior-changing information; a KPI budget is enforced per dashboard.
**Reason:** The fold holds only what changes a decision (Stripe P12).
**Examples:** Executive dashboard: cash position, liquidity, pending approvals, critical alerts, workflow health.
**Implementation guidance:** Enforce a KPI budget; overflow into drill-down.
**Priority:** P0.
**Affected modules:** Dashboard, Executive analytics.
**Source(s):** Stripe P12; Linear S6; Ramp P-087.

### PP-042 — Every KPI carries same-period comparison.
**Description:** Metric values render beside their previous-period delta; "is this good?" is answered in place.
**Reason:** A number without comparison invites doubt (Stripe P13; Phase 20.1).
**Examples:** Previous-period delta on all five executive KPIs.
**Implementation guidance:** Render value + delta + timestamp by default.
**Priority:** P0.
**Affected modules:** Dashboard, MetricCard, Executive analytics.
**Source(s):** Stripe P13; Ramp P-087; Phase 20.1.

### PP-043 — Metric value renders before its chart.
**Description:** Render order is metrics → charts → tables, independently fallible.
**Reason:** Numbers answer the question; charts add context (Stripe P15; Ramp P-007).
**Examples:** KPI numbers instant; charts stream after.
**Implementation guidance:** Enforce render-order contract.
**Priority:** P0.
**Affected modules:** Dashboard, Enterprise analytics.
**Source(s):** Stripe P15; Ramp P-007.

### PP-044 — Every KPI shows source and timestamp.
**Description:** Provenance (source, timestamp, freshness) renders with every metric.
**Reason:** A number without provenance invites doubt (Stripe P14).
**Examples:** DataFreshnessIndicator on all KPIs.
**Implementation guidance:** Make source/freshness default-on.
**Priority:** P0.
**Affected modules:** Dashboard, DataFreshnessIndicator.
**Source(s):** Stripe P14; Ramp P-009.

### PP-045 — Charts answer "what is it made of?" with interactive legends.
**Description:** Distribution charts carry legend-as-filter; composition is a glance, not a click.
**Reason:** Distribution is a glance, not a click (Stripe P16).
**Examples:** Status-stack charts with legend toggle.
**Implementation guidance:** Standardize legend-as-filter on stacked charts.
**Priority:** P1.
**Affected modules:** Enterprise analytics, Dashboard.
**Source(s):** Stripe P16; Ramp P-085 (drill-down to work items).

### PP-046 — Forecasts label confidence, horizon, and evidence.
**Description:** Every forecast renders as a band (min/expected/max) with horizon and evidence links.
**Reason:** A single-point forecast pretends to know the future (Stripe P17).
**Examples:** Treasury forecast bands; liquidity confidence.
**Implementation guidance:** Forecast model emits range + basis + evidence.
**Priority:** P0.
**Affected modules:** Treasury, Forecasts, Intelligence.
**Source(s):** Stripe P17; Ramp P-075; Coupa S7.5.

### PP-047 — Below-the-fold content is previews with doors.
**Description:** Home modules are summary cards with a "View all" door, never walls of data.
**Reason:** "6 of 25 failed" teaches and routes (Stripe P18).
**Examples:** Exception summary card → exception queue.
**Implementation guidance:** Template preview-card + door pattern.
**Priority:** P1.
**Affected modules:** Dashboard, WorkQueue.
**Source(s):** Stripe P18.

### PP-048 — Omit what doesn't change a decision.
**Description:** Every dashboard element passes the "does this change a decision?" gate.
**Reason:** Clutter hides the one thing that matters (Stripe P19).
**Examples:** Dashboards without decorative filler.
**Implementation guidance:** Review gate on dashboard content.
**Priority:** P1.
**Affected modules:** Dashboard, all pages.
**Source(s):** Stripe P19; Ramp P-006.

### PP-049 — Actionable items are triaged by "needs me".
**Description:** Escalation tiers (requires-me vs informative) with deep links replace passive feed aggregation.
**Reason:** Passive bells fail Controllers (Stripe P20; Linear S13.4).
**Examples:** "Requires me" queue; role-aware escalation.
**Implementation guidance:** Model requires-me tiers; deep-link every item.
**Priority:** P0.
**Affected modules:** WorkQueue, Notifications, AppShell.
**Source(s):** Stripe P20; Linear S13.4.

### PP-050 — Every chart drills down to work items.
**Description:** Charts are doors: click a segment/bucket → the underlying work-item list with filters applied.
**Reason:** Analytics drill-down is the "show me the source" of charts (Ramp P-085).
**Examples:** Exception-bucket chart → exception queue filtered.
**Implementation guidance:** Bind chart segments to filtered lists.
**Priority:** P1.
**Affected modules:** Enterprise analytics, WorkQueue.
**Source(s):** Ramp P-085; Coupa S7.4.

### PP-051 — One dashboard per persona, not per data set.
**Description:** Dashboards are persona-shaped (CFO, Treasurer, Controller, AP Manager, Auditor) and each answers one question.
**Reason:** Dashboards organized by data set scatter decisions; persona organization concentrates them.
**Examples:** CFO liquidity dashboard; AP manager exception dashboard.
**Implementation guidance:** Model persona dashboards; share metric components.
**Priority:** P1.
**Affected modules:** Dashboard, role shaping.
**Source(s):** Stripe S1.3; Linear S4.1; Coupa S7.2.

### PP-052 — Budgets vs actuals span all spend types.
**Description:** One budget-vs-actual view spans AP, cards, payroll, and procurement.
**Reason:** Budget health is a cross-domain judgment (Ramp P-082).
**Examples:** Variance bars across spend types.
**Implementation guidance:** Unify budget lines across domains.
**Priority:** P1.
**Affected modules:** Dashboard, Budget, Intelligence.
**Source(s):** Ramp P-082; Coupa S7.5.

### PP-053 — Policy health is a standing dashboard.
**Description:** Violations, review bottlenecks, and policy drift render as a persistent governance surface.
**Reason:** The compliance dashboard is the feedback UI of policy (Ramp S13.11).
**Examples:** Policy violations, bottleneck, spend-pattern panels.
**Implementation guidance:** Render policy health from governance metrics.
**Priority:** P1.
**Affected modules:** Governance, Dashboard, WorkQueue.
**Source(s):** Ramp S13.11/P-083; Coupa S12.

### PP-054 — Behavioral risk is surfaced as drift, not surprise.
**Description:** Anomaly and behavioral risk render as trends/drift with early signals, not post-hoc surprises.
**Reason:** Drift surfaces trust; surprise destroys it (Ramp P-089).
**Examples:** Vendor concentration trend; exception-rate drift.
**Implementation guidance:** Trend-based risk panels over threshold alerts.
**Priority:** P1.
**Affected modules:** Intelligence, Risk, Dashboard.
**Source(s):** Ramp P-089/S13.12.

### PP-055 — The dashboard is a decision surface, not a poster.
**Description:** Every dashboard element is actionable; posters (static infographics) are not shipped.
**Reason:** A screen without an action is decoration (PP-003).
**Examples:** Metric → drill-down → decision → audit.
**Implementation guidance:** Dashboard review gate: each element must have an action.
**Priority:** P0.
**Affected modules:** Dashboard.
**Source(s):** Stripe P11; Ramp P-090.

### PP-056 — Export parity with the screen.
**Description:** Anything shown on a screen can be exported with equal provenance and formatting.
**Reason:** Reconciliation happens off-platform; exports must be trustworthy (Stripe P58; Ramp P-088).
**Examples:** CSV/XLS with metadata; scheduled reports.
**Implementation guidance:** Export respects filters/sorts/columns; embeds metadata.
**Priority:** P1.
**Affected modules:** EnterpriseTable export, Reporting.
**Source(s):** Stripe P58; Ramp P-088; Coupa S10.

### PP-057 — The metric card is the signature pattern.
**Description:** The financial metric card (value + label + delta + source + drill-down) is the canonical KPI object.
**Reason:** Stripe's metric card with drill-down is the trust instrument of dashboards.
**Examples:** Executive KPI cards; treasury position cards.
**Implementation guidance:** Build one MetricCard contract; reuse everywhere.
**Priority:** P0.
**Affected modules:** MetricCard, Dashboard, Treasury.
**Source(s):** Stripe S4.2; Linear S19.6; Ramp P-007.

### PP-058 — Rendering is independently fallible.
**Description:** Metric, chart, and table regions fail and load independently; one failure never blanks the screen.
**Reason:** A failed chart must not hide the number (Stripe P15).
**Examples:** Component-local loading and error.
**Implementation guidance:** Isolate render units with local skeletons/errors.
**Priority:** P1.
**Affected modules:** Dashboard, analytics, DataTable.
**Source(s):** Stripe P15/P77; Linear S9.6.

### PP-059 — The KPI language is universal.
**Description:** High/medium/low, up/down, and status vocabulary is consistent and documented everywhere.
**Reason:** Mixed language ("probably", "likely", "maybe") destroys calibration (Stripe P14/P26).
**Examples:** ConfidenceBadge standard levels; status labels.
**Implementation guidance:** Centralize the vocabulary in EDL/components.
**Priority:** P1.
**Affected modules:** ConfidenceBadge, StatusCell, Dashboard.
**Source(s):** Stripe P14/P26; Ramp S13.4.

### PP-060 — Dashboards state their data mode.
**Description:** Dashboard headers show whether values are live, cached, persisted, or demo — and their age.
**Reason:** Stale-presented-as-live is a credibility failure (PP-013).
**Examples:** Freshness badge on every dashboard.
**Implementation guidance:** Default-on DataFreshnessIndicator.
**Priority:** P0.
**Affected modules:** Dashboard, DataFreshnessIndicator.
**Source(s):** Stripe P36; Ramp P-008.

---

## D. Tables & Data (PP-061 … PP-080)

### PP-061 — Tables are reconciliation instruments, not lists.
**Description:** Tables are designed for comparison, scanning, and export — the audit instrument.
**Reason:** Finance users scan, compare, and export (Stripe P53).
**Examples:** EnterpriseTable as the audit instrument.
**Implementation guidance:** Design for comparison first; treat table defaults as audit-ready.
**Priority:** P0.
**Affected modules:** EnterpriseTable, Ledger, WorkQueue.
**Source(s):** Stripe P53; Coupa S10.2.

### PP-062 — Money is right-aligned; labels are left-aligned.
**Description:** Alignment rules are enforced in table component defaults.
**Reason:** Vertical comparison is the financial read (Stripe P22).
**Examples:** Currency cells right-aligned; tabular figures.
**Implementation guidance:** Enforce alignment in CellConfig defaults.
**Priority:** P0.
**Affected modules:** EnterpriseTable, cell formatters.
**Source(s):** Stripe P22/P21.

### PP-063 — Money uses tabular figures everywhere.
**Description:** All money cells use tabular numerals so columns align and reconcile by eye.
**Reason:** Aligned columns reconcile by eye (Stripe P21).
**Examples:** Inter tabular-nums on money; JetBrains Mono for IDs.
**Implementation guidance:** Enable tabular figures in typography tokens.
**Priority:** P0.
**Affected modules:** EDL typography, EnterpriseTable.
**Source(s):** Stripe P21.

### PP-064 — Human presentation and machine identity never mix.
**Description:** IDs/codes/raw values render in mono; human sums render in the human font.
**Reason:** IDs are raw material, not reading (Stripe P24).
**Examples:** Invoice numbers in mono; amounts in Inter.
**Implementation guidance:** Typographic contract for identity vs value.
**Priority:** P0.
**Affected modules:** EDL, EnterpriseTable.
**Source(s):** Stripe P24; Linear S11.4.

### PP-065 — Filters map to real questions, with presets.
**Description:** Filter presets ("This month", "Needs my approval", "Exceptions") are one click; filters answer questions, not schemas.
**Reason:** Recurring filters are one click (Stripe P54).
**Examples:** Preset filter bars on AP tables.
**Implementation guidance:** Ship question-based presets per table.
**Priority:** P1.
**Affected modules:** EnterpriseTable, WorkQueue.
**Source(s):** Stripe P54; Coupa S10.3.

### PP-066 — Filters execute against the server at scale.
**Description:** Server-side filtering on large datasets; client filtering only for bounded reference data.
**Reason:** Client slicing lies at scale (Stripe P55).
**Examples:** Async/server filters on ledger and AP tables.
**Implementation guidance:** Filter pipeline server-first; pagination server-side.
**Priority:** P1.
**Affected modules:** EnterpriseTable, API.
**Source(s):** Stripe P55.

### PP-067 — Sticky headers and frozen identity columns.
**Description:** Wide tables freeze identity and money columns and keep headers pinned.
**Reason:** Scanning must never lose context (Stripe P56).
**Examples:** Frozen name/amount columns on ledger.
**Implementation guidance:** Enable sticky/frozen in table defaults.
**Priority:** P1.
**Affected modules:** EnterpriseTable.
**Source(s):** Stripe P56.

### PP-068 — Single-column sort by default; multi-sort as power.
**Description:** Default is single-column sort; multi-sort exists behind a power toggle with priority labels.
**Reason:** Direction clarity for the mainstream; power for experts (Stripe P57).
**Examples:** Multi-sort toggle on EnterpriseTable.
**Implementation guidance:** Keep multi-sort behind a power toggle.
**Priority:** P1.
**Affected modules:** EnterpriseTable, use-multi-sort.
**Source(s):** Stripe P57; Coupa S10.2.

### PP-069 — Row density is a preference, never a guess.
**Description:** Density (comfortable/compact/ultra-compact) persists per user across tables.
**Reason:** Density consistency reduces re-learning (Stripe P59).
**Examples:** Persisted density in saved views.
**Implementation guidance:** Persist density with user preferences.
**Priority:** P1.
**Affected modules:** EnterpriseTable, saved views.
**Source(s):** Stripe P59; Ramp P-096.

### PP-070 — Every row opens its detail; every detail returns.
**Description:** Row click → detail; detail carries breadcrumb back; no dead-end tables.
**Reason:** Tables are doors (Stripe P60).
**Examples:** Row-click navigation on all tables.
**Implementation guidance:** Audit tables without detail navigation (WF-012).
**Priority:** P1.
**Affected modules:** EnterpriseTable, detail pages.
**Source(s):** Stripe P60; Linear S5.4.

### PP-071 — Bulk power appears on selection.
**Description:** Action bars (batch approve/export/flag) appear when rows are selected.
**Reason:** On-demand action bars reduce clutter and teach actionability (Stripe P52).
**Examples:** Selection-aware bulk bar on queues.
**Implementation guidance:** Show bulk actions on selection only.
**Priority:** P1.
**Affected modules:** EnterpriseTable, WorkQueue.
**Source(s):** Stripe P52; Linear S5.5.

### PP-072 — Status is dot + label + color.
**Description:** Status cells render icon + text + color; color is never the sole carrier.
**Reason:** Color-blind and screen-reader users need the label (Stripe P26).
**Examples:** StatusCell with icon + label.
**Implementation guidance:** StatusCell contract mandates label.
**Priority:** P0.
**Affected modules:** EnterpriseTable, StatusCell.
**Source(s):** Stripe P26.

### PP-073 — Export is a first-class feature with scheduling.
**Description:** CSV/XLS everywhere, with metadata, plus scheduled report delivery.
**Reason:** Reconciliation happens off-platform (Stripe P58).
**Examples:** Scheduled close-pack reports.
**Implementation guidance:** Export contract; schedule engine for reports.
**Priority:** P1.
**Affected modules:** export, Reporting, Queue.
**Source(s):** Stripe P58; Coupa S10.2.

### PP-074 — Inline editing is for views and reference data only.
**Description:** Inline edit applies to view state and low-risk reference data; money documents edit in context with validation.
**Reason:** Optimism belongs in views; money requires confirmed edits (PP-008).
**Examples:** Inline note/edit on reference fields; form-based money edits.
**Implementation guidance:** Restrict inline editing by field risk class.
**Priority:** P1.
**Affected modules:** inline-edit, EnterpriseTable, EnterpriseForm.
**Source(s):** Stripe P43; Linear S7.2.

### PP-075 — Pagination is honest about scale.
**Description:** Pagination/paging controls communicate total counts and scale truthfully; virtualization where warranted.
**Reason:** Users must trust the completeness of what they see.
**Examples:** Ellipsis paging with counts; virtualized large tables.
**Implementation guidance:** Virtualize large results; show accurate totals.
**Priority:** P2.
**Affected modules:** EnterpriseTable, DataTable.
**Source(s):** Stripe S5.5; Linear S6.

### PP-076 — Table search highlights and remembers.
**Description:** Search results highlight matches and remember recent searches.
**Reason:** Highlighting confirms the match; recents speed re-finding (Stripe S5.7).
**Examples:** `<mark>` highlighting; recent-searches dropdown.
**Implementation guidance:** Search UX contract on tables.
**Priority:** P2.
**Affected modules:** table-search, EnterpriseTable.
**Source(s):** Stripe S5.7.

### PP-077 — Cell formatting is config-driven, not ad hoc.
**Description:** Currency/date/status/number/trend/tag formatting routes through a CellConfig registry.
**Reason:** One formatting source prevents drift and enables export parity (PP-056).
**Examples:** CurrencyCell, DateCell, StatusCell, TrendCell.
**Implementation guidance:** CellConfig-driven rendering everywhere.
**Priority:** P1.
**Affected modules:** cell-formatters, EnterpriseTable.
**Source(s):** Stripe P53; Coupa S10.2.

### PP-078 — Empty tables teach.
**Description:** An empty table shows a concrete next action and explains why it is empty.
**Reason:** The empty moment is an onboarding opportunity (PP-040).
**Examples:** "Import your first invoice file" empty state.
**Implementation guidance:** Empty-state template with action.
**Priority:** P1.
**Affected modules:** EnterpriseTable, WorkQueue.
**Source(s):** Stripe P31; Linear S6.6.

### PP-079 — Multi-entity columns are explicit.
**Description:** When multiple entities appear in one table, an entity column scopes context explicitly.
**Reason:** Cross-entity ambiguity is a treasury hazard.
**Examples:** Entity column on consolidated views.
**Implementation guidance:** Scope columns by entity where mixed.
**Priority:** P1.
**Affected modules:** EnterpriseTable, Treasury.
**Source(s):** Ramp P-110; Coupa S3.

### PP-080 — Tables never lie about totals.
**Description:** Grand totals, subtotals, and filtered totals are labeled with their basis (all rows / filtered rows).
**Reason:** An unlabeled total misleads reconciliation (Stripe P25).
**Examples:** "Filtered 23 of 340" totals annotation.
**Implementation guidance:** Total basis labeling in table footer.
**Priority:** P0.
**Affected modules:** EnterpriseTable.
**Source(s):** Stripe P25.

---

## E. Forms & Input (PP-081 … PP-100)

### PP-081 — Financial input enforces format at entry.
**Description:** Money inputs bind locale, decimals, range, and precision at entry; bad money never reaches the ledger.
**Reason:** Bad money never reaches the ledger (Stripe P61).
**Examples:** AmountInput binding financial-precision helpers.
**Implementation guidance:** AmountInput component; precision validation.
**Priority:** P0.
**Affected modules:** EnterpriseForm, financial-precision.
**Source(s):** Stripe P61; Coupa S10.4.

### PP-082 — Validate inline on blur.
**Description:** Field-level validation on blur; cross-field at section; business-rule at submit.
**Reason:** Feedback lands where the mistake is (Stripe P62).
**Examples:** EnterpriseField error-on-blur.
**Implementation guidance:** Validation contract per field/section/form.
**Priority:** P0.
**Affected modules:** EnterpriseForm, EnterpriseField.
**Source(s):** Stripe P62; Coupa S10.4.

### PP-083 — Labels always visible, top-aligned, optional marked.
**Description:** Dense financial forms keep stable labels; required is default, "Optional" is explicit.
**Reason:** Dense financial forms need stable labels (Stripe P63).
**Examples:** EnterpriseField defaults.
**Implementation guidance:** Label contract in EnterpriseField.
**Priority:** P0.
**Affected modules:** EnterpriseForm, EnterpriseField.
**Source(s):** Stripe P63.

### PP-084 — Smart defaults resolve by hierarchy.
**Description:** Defaults resolve previous input > org > role > sensible.
**Reason:** Fewer keystrokes = faster, less error (Ramp P-094).
**Examples:** Auto-coded GL accounts; suggested payment terms.
**Implementation guidance:** Default-resolution engine in EnterpriseForm.
**Priority:** P0.
**Affected modules:** EnterpriseForm, GLIntegration.
**Source(s):** Ramp P-094; Coupa S8.6.

### PP-085 — Progressive forms: core visible, optional labeled, advanced collapsed.
**Description:** Field organization follows Progressive-Depth; expert fields are hidden until summoned.
**Reason:** Cognitive load is the enemy of judgment (PP-010).
**Examples:** Collapsed advanced sections with badges.
**Implementation guidance:** Progressive-disclosure contract.
**Priority:** P0.
**Affected modules:** EnterpriseForm, EnterpriseSection.
**Source(s):** Ramp P-093; Stripe P78.

### PP-086 — Errors explain how to fix, not just what broke.
**Description:** Error messages state the problem and the correction.
**Reason:** Human-readable, actionable errors (Stripe P30; Ramp P-095).
**Examples:** "Amount exceeds vendor credit limit — reduce to X or request limit increase."
**Implementation guidance:** Error-template standard; QA gate on vague errors.
**Priority:** P0.
**Affected modules:** EnterpriseForm, ValidationSummary.
**Source(s):** Stripe P30; Ramp P-095; Coupa S10.4.

### PP-087 — Save flow is draft → validate → finalise, never silent-fail.
**Description:** Work is draft-saved; state is always visible (saving/saved/failed/unsaved).
**Reason:** The user must always know the state of their work (Stripe P40/P66).
**Examples:** AutoSaveIndicator states.
**Implementation guidance:** Auto-save contract; visible state.
**Priority:** P0.
**Affected modules:** EnterpriseForm, AutoSaveIndicator.
**Source(s):** Stripe P40/P66.

### PP-088 — Submission is idempotent and visibly pending.
**Description:** Submit is idempotent; pending state renders until confirmed.
**Reason:** Double-submit must not double-move money (PP-020).
**Examples:** Idempotency-key middleware on money forms.
**Implementation guidance:** Idempotent submit + pending state.
**Priority:** P0.
**Affected modules:** EnterpriseForm, API.
**Source(s):** Stripe P65; Ramp P-058.

### PP-089 — Keyboard completes the form.
**Description:** Full Tab/Enter/Escape traversal on all enterprise forms; no field is mouse-only.
**Reason:** Finance data entry is high-volume (Stripe P67).
**Examples:** Tab-traversable forms; Enter submits; Escape cancels.
**Implementation guidance:** Keyboard contract in EnterpriseForm.
**Priority:** P1.
**Affected modules:** EnterpriseForm.
**Source(s):** Stripe P67; Linear S10.

### PP-090 — Reference data changes require approval.
**Description:** Vendor bank details and other critical reference data change only through approved, audited workflows.
**Reason:** Vendor bank-change fraud is the critical missing rule (Phase 27.1R).
**Examples:** Dual-approval for bank-detail changes.
**Implementation guidance:** Reference-data mutation workflows with approval.
**Priority:** P0.
**Affected modules:** VendorService, Approvals, Audit.
**Source(s):** Stripe P64; Phase 27.1R.

### PP-091 — Confirmation scales with irreversibility.
**Description:** Light confirmation for routine; typed for significant; dual-signature for irreversible/high-value.
**Reason:** Friction is the safety (Stripe P38).
**Examples:** Typed "PAY" for batch release; dual-signature for > threshold.
**Implementation guidance:** Tiered confirmation contract.
**Priority:** P0.
**Affected modules:** EnterpriseForm, Approvals, IAM.
**Source(s):** Stripe P38; Ramp P-097.

### PP-092 — Consequence previews before commit.
**Description:** Every irreversible action previews what will change (resulting balances, approval chain, downstream state).
**Reason:** Informed consent beats post-hoc regret (Stripe P39).
**Examples:** Pro forma consequences in ConfirmDialog.
**Implementation guidance:** Consequence-preview contract.
**Priority:** P1.
**Affected modules:** ConfirmDialog, Approvals, Payments.
**Source(s):** Stripe P39; Ramp P-097.

### PP-093 — The primary action is singular and visible.
**Description:** One primary CTA per screen; everything else secondary or overflow.
**Reason:** One clear next step per screen (Stripe P45).
**Examples:** Approve/reject inline; single primary button.
**Implementation guidance:** Primary-action discipline.
**Priority:** P0.
**Affected modules:** EnterpriseForm, WorkQueue.
**Source(s):** Stripe P45; Linear S5.

### PP-094 — Actions attach to the object they mutate.
**Description:** Approve/pay/reject live on the object's detail, not global toolbars.
**Reason:** Scoped actions prevent stray mutation (Stripe P46).
**Examples:** Invoice-level actions on invoice detail.
**Implementation guidance:** Object-scoped action placement.
**Priority:** P0.
**Affected modules:** Detail pages, WorkQueue.
**Source(s):** Stripe P46; Linear S7.

### PP-095 — Multi-step forms recover from interruption.
**Description:** Wizards and multi-step forms persist progress and resume where left off.
**Reason:** Finance work is fragmented by approvals (Stripe P50).
**Examples:** Draft resume; continue-where-left-off.
**Implementation guidance:** Persistence contract on multi-step forms.
**Priority:** P1.
**Affected modules:** EnterpriseWizard, EnterpriseForm.
**Source(s):** Stripe P50; Linear S5.9.

### PP-096 — Branching points are explicit choices.
**Description:** Payment method, approval path, and collection decisions surface as explicit choices, never hidden defaults.
**Reason:** Users should own financial decisions (Stripe P48).
**Examples:** Payment-method selector on proposals.
**Implementation guidance:** Explicit-choice surfaces for decisions.
**Priority:** P1.
**Affected modules:** EnterpriseForm, Payments, ApprovalMatrix.
**Source(s):** Stripe P48.

### PP-097 — Forms minimize context switching.
**Description:** Drawers and split panels keep evidence in view during actions.
**Reason:** Context loss is the cost of navigation (Stripe P49).
**Examples:** Evidence drawer beside approval form.
**Implementation guidance:** Context-preserving layouts.
**Priority:** P1.
**Affected modules:** EnterpriseForm, Drawer, Detail pages.
**Source(s):** Stripe P49; Linear S7.7.

### PP-098 — Duplicate detection is built in.
**Description:** Duplicate invoice/expense detection runs at intake and surfaces on the object with evidence.
**Reason:** Duplicate payment is a top financial-control failure (Phase 21 gaps).
**Examples:** Duplicate alert on invoice detail.
**Implementation guidance:** Duplicate-detection service wired at intake.
**Priority:** P0.
**Affected modules:** AP, InvoiceService, WorkQueue.
**Source(s):** Coupa S8.5; Stripe S14.4.

### PP-099 — Field help is contextual and instant.
**Description:** Help/hint renders in context (example, best-practice, regulatory, tip) without navigation.
**Reason:** Finance forms carry jargon and regulation (FieldHelp).
**Examples:** FieldHint variants.
**Implementation guidance:** Help contracts on EnterpriseField.
**Priority:** P1.
**Affected modules:** EnterpriseForm, FieldHelp.
**Source(s):** Coupa S10.4; Stripe S6.

### PP-100 — Forms remember the human.
**Description:** Form state, drafts, and preferences persist per user across sessions and devices.
**Reason:** Lost work is lost trust; persisted work is momentum.
**Examples:** Draft recovery after session timeout.
**Implementation guidance:** Persistence + recovery contract.
**Priority:** P1.
**Affected modules:** EnterpriseForm, preferences.
**Source(s):** Stripe P50; Linear S5.9.

---

## F. Workflows & Lifecycle (PP-101 … PP-120)

### PP-101 — Find the object → see the facts → act.
**Description:** The canonical workflow shape for all financial work; detail pages do the trust work.
**Reason:** One decision path keeps the surface coherent (Stripe P47).
**Examples:** 10-stage AP reference workflow follows this shape.
**Implementation guidance:** Enforce the shape on all stage surfaces.
**Priority:** P0.
**Affected modules:** AP, WorkflowEngine, all stages.
**Source(s):** Stripe P47; Linear S5.3.

### PP-102 — Workflows are graphs, persisted and versioned.
**Description:** Workflows are authored as graphs and stored as the only truth; versioned and audited.
**Reason:** Ramp's engine stores the graph; config not code (Ramp S6/P-011).
**Examples:** WorkflowEngine graph persistence.
**Implementation guidance:** Author → compile → graph → execute.
**Priority:** P0.
**Affected modules:** WorkflowEngine, AutomationStudio.
**Source(s):** Ramp S6/P-011/P-012; Coupa S13.5.

### PP-103 — Execution is simple; complexity lives in authored config.
**Description:** The execution engine stays simple, fast, idempotent; branch complexity lives in workflow config.
**Reason:** Simple engine, complex config is the scalable shape (Ramp P-014).
**Examples:** ConditionEvaluator + operator registry.
**Implementation guidance:** Keep execution primitives minimal.
**Priority:** P0.
**Affected modules:** WorkflowEngine, ConditionEvaluator.
**Source(s):** Ramp P-014/S6.

### PP-104 — Every workflow has at least one terminal action.
**Description:** No workflow ends in a void; every path terminates in a decision/state change.
**Reason:** Incomplete workflows strand work (Ramp P-015).
**Examples:** Exception workflows always route to resolution.
**Implementation guidance:** Graph validation requires terminal states.
**Priority:** P0.
**Affected modules:** WorkflowEngine, EnterpriseForm.
**Source(s):** Ramp P-015.

### PP-105 — Approval routing is a pure resolver; execution is separate.
**Description:** WHAT to do (resolver) is separated from HOW to do it (executor).
**Reason:** Separation keeps rules testable and execution auditable (Architecture Decision 4).
**Examples:** ApprovalMatrixEvaluator vs ApprovalStepExecutor.
**Implementation guidance:** Keep resolver pure; executor transactional.
**Priority:** P0.
**Affected modules:** ApprovalMatrixEvaluator, ApprovalStepExecutor.
**Source(s):** Ramp P-021; Coupa S6.

### PP-106 — Escalation, delegation, and groups are structural nodes.
**Description:** Escalation, delegation, and groups are first-class workflow nodes, not afterthoughts.
**Reason:** Ramp and Coupa both make approval branching structural (Ramp P-022; Coupa S6.4).
**Examples:** Four-type delegation; escalation chains.
**Implementation guidance:** Model as nodes in the workflow graph.
**Priority:** P0.
**Affected modules:** ApprovalMatrixEvaluator, WorkflowEngine.
**Source(s):** Ramp P-022; Coupa S6.4.

### PP-107 — SKIPPED never equals APPROVED.
**Description:** Skipped approval levels do not count as approvals; cascade logic treats skip distinctly.
**Reason:** The AP workflow test found SKIPPED-as-approved broke multi-level chains.
**Examples:** Multi-level chain cascade fix.
**Implementation guidance:** allApproved excludes SKIPPED.
**Priority:** P0.
**Affected modules:** ApprovalService, ApprovalMatrixEvaluator.
**Source(s):** Phase 21A.4 bug fix; Coupa S6.3.

### PP-108 — Policy-before-spend.
**Description:** Controls (policy, limits, blocks) exist before the first transaction; silent prevention beats post-hoc detection.
**Reason:** Prevention is cheaper and safer than detection (Ramp P-025/P-026; Coupa S4.3).
**Examples:** Card limits, vendor blocklists, budget checks at intake.
**Implementation guidance:** Enforce policy at the moment of creation.
**Priority:** P0.
**Affected modules:** Governance, Treasury, AP, WorkflowEngine.
**Source(s):** Ramp P-025/P-026; Coupa S4.3.

### PP-109 — Exceptions are first-class work items.
**Description:** Exceptions are work items with owners, reasons, and resolutions — never error states.
**Reason:** The exception queue is the primary AP working view (Ramp P-028/P-067).
**Examples:** Exception queue with resolution actions.
**Implementation guidance:** Model exceptions as queue items with lifecycle.
**Priority:** P0.
**Affected modules:** WorkQueue, ExceptionService, AP.
**Source(s):** Ramp P-028/P-067; Coupa S8.5.

### PP-110 — Capture at the moment of purchase.
**Description:** Receipts and purchase evidence are captured at the point of purchase by default.
**Reason:** Ramp's zero-friction capture is the intake standard (Ramp P-054).
**Examples:** Receipt capture at transaction time.
**Implementation guidance:** Capture pipeline at intake.
**Priority:** P1.
**Affected modules:** AP, Document Platform.
**Source(s):** Ramp P-054/S9.2; Coupa S8.2.

### PP-111 — Any channel, one pipeline.
**Description:** Invoices arrive through any channel (email, portal, API, upload) and meet one pipeline.
**Reason:** Channel diversity must not fragment the workflow (Ramp P-055).
**Examples:** Unified invoice intake.
**Implementation guidance:** Single intake pipeline, many sources.
**Priority:** P0.
**Affected modules:** AP, InvoiceService.
**Source(s):** Ramp P-055; Coupa S8.2.

### PP-112 — Matching is visible, tolerance-configurable, exception-first.
**Description:** Two/three-way matching renders visibly, tolerances configure, and mismatches route to exceptions, not silent passes.
**Reason:** Coupa's configurable tolerance and Ramp's exception-first matching converge (Coupa S8.3; Ramp P-056).
**Examples:** Match-tolerance settings; mismatch to exception queue.
**Implementation guidance:** Wire InvoiceMatchingService to UI and queue.
**Priority:** P0.
**Affected modules:** AP, InvoiceMatchingService, WorkQueue.
**Source(s):** Coupa S8.3; Ramp P-056.

### PP-113 — Payments are batch proposal → named runs → review → release.
**Description:** Payment execution flows through proposal, named batch, review, and release gates.
**Reason:** Batch control is the payment-safety pattern (Ramp P-057; Coupa S8.8).
**Examples:** Payment proposals; named batches; release approval.
**Implementation guidance:** PaymentService batch model.
**Priority:** P0.
**Affected modules:** AP PaymentService, Treasury.
**Source(s):** Ramp P-057; Coupa S8.8.

### PP-114 — Debit/credit approval precedes treasury movement.
**Description:** GL debit/credit approval gates any treasury money movement.
**Reason:** Money moves only after accounting intent is approved (Ramp P-064).
**Examples:** Journal-approval before transfer.
**Implementation guidance:** Approval gate in transfer pipeline.
**Priority:** P0.
**Affected modules:** Treasury, GL, Approvals.
**Source(s):** Ramp P-064.

### PP-115 — Target-balance automation with audited moves.
**Description:** Automated target-balance sweeps are audited and confirmation-thresholded.
**Reason:** Treasury automation must remain transparent (Ramp P-076).
**Examples:** Sweep rules with confirmation thresholds.
**Implementation guidance:** Automation audit + thresholds.
**Priority:** P1.
**Affected modules:** Treasury, Governance.
**Source(s):** Ramp P-076; Coupa S8.8.

### PP-116 — Continuous close is the default state.
**Description:** Books approach continuous close; close-cycle is a checklist, not a crisis.
**Reason:** Ramp's continuous close and Coupa's close discipline converge (Ramp P-081; Coupa S7.5).
**Examples:** Close checklist; scope vs actuals.
**Implementation guidance:** Continuous-sync GL pipeline; close view.
**Priority:** P1.
**Affected modules:** GLIntegration, Treasury, Close.
**Source(s):** Ramp P-081; Coupa S8.6.

### PP-117 — Test-before-enforce for workflows.
**Description:** Dry-run mode exists for any workflow before enforcement.
**Reason:** New rules must be testable against history (Ramp P-018).
**Examples:** Dry-run policy simulations.
**Implementation guidance:** Dry-run execution mode.
**Priority:** P1.
**Affected modules:** AutomationStudio, Governance.
**Source(s):** Ramp P-018.

### PP-118 — Templates before builders.
**Description:** Templates exist for common financial routes before custom builders.
**Reason:** The common path must be the easy path (Ramp P-019).
**Examples:** Approval-chain templates.
**Implementation guidance:** Template-first workflow surfaces.
**Priority:** P1.
**Affected modules:** AutomationStudio, ApprovalMatrix.
**Source(s):** Ramp P-019; Coupa S6.

### PP-119 — Workflow changes are audited, diffed, reversible.
**Description:** Workflow/config changes are audited, diff-visible, and reversible.
**Reason:** A wrong rule change can move money (Ramp P-017).
**Examples:** Workflow diff history.
**Implementation guidance:** Versioning + diff + revert.
**Priority:** P0.
**Affected modules:** Governance, WorkflowEngine.
**Source(s):** Ramp P-017; Coupa S13.5.

### PP-120 — The lifecycle spine never dead-ends.
**Description:** Every final state routes to the next surface; no stage terminates the journey.
**Reason:** Lifecycle completeness is the integrity and momentum argument (PP-005/PP-008).
**Examples:** Approved → payment-ready → scheduled → released → reconciled → closed.
**Implementation guidance:** Next-stage routing on every state.
**Priority:** P0.
**Affected modules:** All lifecycle stages.
**Source(s):** Coupa S3.1; Stripe S7; Ramp S3.

---

## G. Financial Communication & Precision (PP-121 … PP-140)

### PP-121 — Money is always the hero.
**Description:** Financial values render prominently, tabular, source-labeled; never secondary to decoration.
**Reason:** Money is the product (Stripe S19.6; Linear S19.6).
**Examples:** Metric card hero values.
**Implementation guidance:** Money hierarchy in layout tokens.
**Priority:** P0.
**Affected modules:** EDL, MetricCard, Dashboard.
**Source(s):** Stripe S2/S19; Linear S19.

### PP-122 — Currency is locale-correct, decimal-safe, consistent.
**Description:** All currency routes through one formatting module with locale, decimals, and precision.
**Reason:** Formatting inconsistency reads as data unreliability (Stripe P25; Phase 19).
**Examples:** financial-precision helpers.
**Implementation guidance:** Single formatting module; ban ad hoc formatting.
**Priority:** P0.
**Affected modules:** financial-precision, All money surfaces.
**Source(s):** Stripe P25; Ramp P-111; Phase 19.

### PP-123 — Decimal(38,12) precision at rest.
**Description:** Monetary values persist as exact decimals; floats never hold money in a committed path.
**Reason:** Financial precision is non-negotiable (Phase 19; Ramp P-111).
**Examples:** All AP money fields Decimal(38,12).
**Implementation guidance:** Prisma schema + validation bans float money.
**Priority:** P0.
**Affected modules:** Prisma schema, AP, Treasury, GL.
**Source(s):** Ramp P-111; Coupa S8; Phase 21A.1.

### PP-124 — Banker's rounding everywhere.
**Description:** All rounding uses financialRound (banker's rounding); residual handling on allocations.
**Reason:** Rounding drift corrupts reconciliations (Phase 19.1).
**Examples:** GL allocation residuals to last line.
**Implementation guidance:** financial-precision helpers only.
**Priority:** P0.
**Affected modules:** financial-precision, GL, Tax, Allocations.
**Source(s):** Phase 19.1; Coupa S8.6.

### PP-125 — Status is explicit, never color alone.
**Description:** Status renders as dot + label + explanation; color supplements.
**Reason:** Color-blind and screen-reader users need labels (PP-072).
**Examples:** StatusCell standard.
**Implementation guidance:** StatusCell contract.
**Priority:** P0.
**Affected modules:** StatusCell, EnterpriseTable.
**Source(s):** Stripe P26; Ramp P-090.

### PP-126 — Numbers are the nouns; captions are the verbs.
**Description:** KPI = value + label + delta + source in fixed visual order.
**Reason:** The numeral is the subject, the caption its meaning (Stripe P23).
**Examples:** MetricCard order.
**Implementation guidance:** Fixed order contract.
**Priority:** P0.
**Affected modules:** MetricCard, Dashboard.
**Source(s):** Stripe P23.

### PP-127 — Annotate consequences on numbers.
**Description:** Microcopy under money explains inclusions/exclusions ("amount includes fees").
**Reason:** Assumptions destroy trust in finance (Stripe P28).
**Examples:** Fee-inclusive labels.
**Implementation guidance:** Annotation contract on money values.
**Priority:** P1.
**Affected modules:** MetricCard, EnterpriseForm, Tables.
**Source(s):** Stripe P28.

### PP-128 — Totals state their basis.
**Description:** Totals/subtotals label whether they cover all or filtered rows and which currency.
**Reason:** An unlabeled total misleads (PP-080).
**Examples:** "Filtered 23 of 340" footers.
**Implementation guidance:** Total-basis labeling.
**Priority:** P0.
**Affected modules:** EnterpriseTable.
**Source(s):** Stripe P25.

### PP-129 — Negative money is explicit.
**Description:** Negative values render with sign and/or parentheses, consistently, never color-only.
**Reason:** Negative-sign ambiguity corrupts cash reads.
**Examples:** (123.45) convention.
**Implementation guidance:** CurrencyCell negative convention.
**Priority:** P1.
**Affected modules:** cell-formatters, EnterpriseTable.
**Source(s):** Stripe P21/P22.

### PP-130 — Precision tiers are documented.
**Description:** Money precision (2/4/12 decimals) follows the documented precision-tier policy.
**Reason:** Mixed precision corrupts aggregates (Phase 21A.1).
**Examples:** Tier policy on Decimal fields.
**Implementation guidance:** Precision-tier documentation + enforcement.
**Priority:** P1.
**Affected modules:** Prisma schema, financial-precision.
**Source(s):** Coupa S8; Phase 21A.1.

### PP-131 — FX is explicit and sourced.
**Description:** Any currency conversion shows rate, rate date, and source; multi-currency is never implicit.
**Reason:** FX ambiguity is a treasury hazard.
**Examples:** Rate-annotated conversions.
**Implementation guidance:** CurrencyService with rate provenance.
**Priority:** P0.
**Affected modules:** CurrencyService, Treasury, FX.
**Source(s):** Ramp P-111; Coupa S12.

### PP-132 — Every financial object has a lifecycle label.
**Description:** Objects render their stage (received/matched/approved/scheduled/released/reconciled) visibly.
**Reason:** Status-at-a-glance is the Treasurer's requirement.
**Examples:** Stage badges on invoice rows.
**Implementation guidance:** Stage-label contract on all money objects.
**Priority:** P0.
**Affected modules:** AP, Treasury, EnterpriseTable.
**Source(s):** Coupa S4.6; Stripe S12.

### PP-133 — Financial IDs are copyable and mono.
**Description:** IDs, references, and codes are mono, selectable, and copyable.
**Reason:** Cross-system lookup is a daily finance task.
**Examples:** Mono ID cells with copy.
**Implementation guidance:** ID typography + copy contract.
**Priority:** P2.
**Affected modules:** EnterpriseTable, detail pages.
**Source(s):** Stripe P24; Linear S11.4.

### PP-134 — Units and denominators are explicit.
**Description:** Percentages, rates, counts, and amounts label their unit and basis.
**Reason:** Basis confusion ("X of what?") undermines decisions.
**Examples:** "Approval rate: 92% of invoices ≥ $10K".
**Implementation guidance:** Unit-label contract.
**Priority:** P1.
**Affected modules:** Metrics, EnterpriseTable.
**Source(s):** Stripe P28.

### PP-135 — Money compares on the same basis.
**Description:** Period comparisons label their basis (same-period, currency-adjusted) to prevent false deltas.
**Reason:** Unadjusted comparisons mislead.
**Examples:** Currency-adjusted deltas labeled.
**Implementation guidance:** Comparison-basis labeling.
**Priority:** P1.
**Affected modules:** Dashboard, MetricCard.
**Source(s):** Stripe P13; Phase 20.1.

### PP-136 — Large numbers abbreviate, then expand.
**Description:** Compact display (e.g., $12.4M) expands to full precision on demand.
**Reason:** CFOs scan compact; reconcile precise.
**Examples:** formatDecimalCompact + expand.
**Implementation guidance:** Abbreviation with expand.
**Priority:** P2.
**Affected modules:** financial-precision, MetricCard.
**Source(s):** Stripe P23.

### PP-137 — Money is never stored as percentages of itself.
**Description:** Monetary values are stored as amounts; percentages derive at render with explicit basis.
**Reason:** Stored percentages drift when bases change.
**Examples:** Allocations recompute from amounts.
**Implementation guidance:** Amount-first modeling.
**Priority:** P1.
**Affected modules:** Allocation, Tax, financial-precision.
**Source(s):** Phase 19; Coupa S8.6.

### PP-138 — The ledger is authoritative for money truth.
**Description:** Ledger/posting is the source of truth for settled money; operational views reconcile to it.
**Reason:** Reconcilable truth requires one authoritative layer.
**Examples:** Views reconcile to GL posts.
**Implementation guidance:** Ledger-authority architecture.
**Priority:** P0.
**Affected modules:** GL, Treasury, AP, Reconciliation.
**Source(s):** Coupa S8.6; Phase 20.0.

### PP-139 — Estimates and actuals never merge silently.
**Description:** Forecast/estimate vs actual render as distinct, labeled series; never a blended number.
**Reason:** Merged numbers hide basis (PP-046).
**Examples:** Forecast bands separate from actuals.
**Implementation guidance:** Series separation + labeling.
**Priority:** P0.
**Affected modules:** Forecasts, Dashboard, Treasury.
**Source(s):** Stripe P17; Coupa S7.5.

### PP-140 — Financial clarity beats decoration, always.
**Description:** Any visual choice that reduces legibility of money is rejected regardless of aesthetics.
**Reason:** Clarity, speed, and confidence come first (Engineering Constitution).
**Examples:** No decorative overlays on money.
**Implementation guidance:** Money-legibility review gate.
**Priority:** P0.
**Affected modules:** All money surfaces, EDL.
**Source(s):** Engineering Constitution; Stripe S2.

---

## H. Trust, Microcopy & Status (PP-141 … PP-160)

### PP-141 — Status messages answer what-happened + what-to-do-next.
**Description:** Every status message follows the template: outcome + reason + next action.
**Reason:** Specificity eliminates the anxiety of the unknown (Stripe P29).
**Examples:** Exception status with resolution path.
**Implementation guidance:** Status microcopy template.
**Priority:** P0.
**Affected modules:** All surfaces, WorkQueue.
**Source(s):** Stripe P29.

### PP-142 — Vague errors are a defect.
**Description:** "Something went wrong" is unacceptable in money software; QA rejects placeholder errors.
**Reason:** Vague errors destroy confidence (Stripe P30).
**Examples:** Actionable error messages.
**Implementation guidance:** Lint/QA gate on vague error strings.
**Priority:** P0.
**Affected modules:** All routes, EnterpriseForm.
**Source(s):** Stripe P30.

### PP-143 — Specificity scales with consequence.
**Description:** The more money involved, the more precise the language (amounts, dates, parties).
**Reason:** High-value confirmations need exact facts (Stripe P34).
**Examples:** Exact amounts in dual-signature dialogs.
**Implementation guidance:** Consequence-scaled microcopy.
**Priority:** P0.
**Affected modules:** ConfirmDialog, Payments, Approvals.
**Source(s):** Stripe P34.

### PP-144 — Empty states teach, never apologize.
**Description:** Empty states show what the surface is, why it is empty, and the next action.
**Reason:** The empty moment is an onboarding opportunity (PP-040).
**Examples:** "Import your first invoice file".
**Implementation guidance:** Empty-state template.
**Priority:** P1.
**Affected modules:** All list surfaces.
**Source(s):** Stripe P31; Linear S6.6.

### PP-145 — Trust is stated, not implied.
**Description:** Where the platform guarantees (idempotency, tamper-evidence, isolation), it says so in the interface.
**Reason:** A guarantee the user cannot see is a marketing claim (Ramp S13.3).
**Examples:** "Tenant-isolated intelligence" badge; audit-integrity labels.
**Implementation guidance:** Render guarantees where they matter.
**Priority:** P1.
**Affected modules:** Governance, AI, Dashboard.
**Source(s):** Ramp S13.3; Coupa S12.

### PP-146 — Confidence is a designed visual, not a footnote.
**Description:** Confidence renders as a badge/band with universal language, on every recommendation.
**Reason:** Explainability is a first-class visual (Stripe P33).
**Examples:** ConfidenceBadge high/medium/low.
**Implementation guidance:** Confidence visual contract.
**Priority:** P0.
**Affected modules:** ConfidenceBadge, AI, InsightPanel.
**Source(s):** Stripe P33; Ramp S13.4.

### PP-147 — "Unsure" is a designed state.
**Description:** AI uncertainty renders as "needs review" with reason and fallback — never as error.
**Reason:** Unsure doesn't look like an error state (Ramp S13.3 #4).
**Examples:** Needs-review category with escalation path.
**Implementation guidance:** Decision-category contract.
**Priority:** P0.
**Affected modules:** DecisionEngine, WorkQueue, AI.
**Source(s):** Ramp S13.3/S13.4.

### PP-148 — Every recommendation has a "why not this" path.
**Description:** Recommendations show alternatives and their consequences, not just the favored option.
**Reason:** A CFO overrides recommendations and needs both sides (Stripe S14.4).
**Examples:** Alternatives panel on recommendations.
**Implementation guidance:** Alternatives in decision artifact.
**Priority:** P0.
**Affected modules:** DecisionEngine, Decision Workspace.
**Source(s):** Stripe S14.4.

### PP-149 — Recommendations live on the object they mutate.
**Description:** Alerts/recommendations render on the relevant object detail, not an insights graveyard.
**Reason:** Proximity to the object is proximity to the decision (Stripe S14.4).
**Examples:** Duplicate alert on invoice detail.
**Implementation guidance:** Object-scoped recommendation placement.
**Priority:** P0.
**Affected modules:** Detail pages, WorkQueue, AI.
**Source(s):** Stripe S14.4; Ramp P-090.

### PP-150 — Accept/reject is cheap; consequences are previewed.
**Description:** Acting on a recommendation is one action; committing previews resulting state.
**Reason:** Informed consent beats post-hoc regret (PP-092).
**Examples:** Pro forma approval chain before commit.
**Implementation guidance:** Consequence-preview on decisions.
**Priority:** P1.
**Affected modules:** DecisionEngine, ConfirmDialog.
**Source(s):** Stripe S14.4.

### PP-151 — Chronology is rendered, not stored only.
**Description:** The event timeline is visible on every financial object, with filters.
**Reason:** Chronological integrity is the Auditor's requirement (Stripe P35).
**Examples:** Append-only timeline on invoice.
**Implementation guidance:** Timeline component on all aggregates.
**Priority:** P0.
**Affected modules:** Audit, Detail pages, AP.
**Source(s):** Stripe P35; Ramp P-033.

### PP-152 — Freshness is shown at the moment of use.
**Description:** Age/freshness renders on data where the user reads it, not just in a settings screen.
**Reason:** Freshness must be where doubt occurs (PP-013).
**Examples:** Freshness badge beside KPI values.
**Implementation guidance:** Default-on freshness.
**Priority:** P0.
**Affected modules:** DataFreshnessIndicator, All read surfaces.
**Source(s):** Stripe P36; Ramp P-008.

### PP-153 — Success is stated with its consequence.
**Description:** Success messages state what changed and what happens next.
**Reason:** "Saved" without "and now it routes to X" is half-information.
**Examples:** "Approved — invoice moves to payment scheduling."
**Implementation guidance:** Success-consequence template.
**Priority:** P1.
**Affected modules:** WorkQueue, EnterpriseForm.
**Source(s):** Stripe P29.

### PP-154 — Undo exists where reversal is safe.
**Description:** UI/view reversals have undo; money/data reversals have confirmation + recovery paths.
**Reason:** The undo/confirm split is the reversal strategy (Stripe P44).
**Examples:** UndoProvider for UI; void/credit for money.
**Implementation guidance:** Reversal-strategy classification.
**Priority:** P1.
**Affected modules:** UndoProvider, EnterpriseForm, AP.
**Source(s):** Stripe P44; Linear S8.8.

### PP-155 — Time is labeled in the user's context.
**Description:** Timestamps render relative-to-absolute with the user's timezone and clear labeling.
**Reason:** Financial time is deadline-sensitive.
**Examples:** "3m ago · 2026-08-02 09:41 UTC".
**Implementation guidance:** DateCell contract.
**Priority:** P2.
**Affected modules:** DateCell, EnterpriseTable.
**Source(s):** Stripe P23.

### PP-156 — Language is plain, never marketing.
**Description:** Product copy states facts plainly; no hype, no jargon, no vendor-speak.
**Reason:** Plainness is a trust signal (Microcopy Guide).
**Examples:** Factual empty states and confirmations.
**Implementation guidance:** Copywriting standard.
**Priority:** P1.
**Affected modules:** All copy.
**Source(s):** Stripe S2.7; Coupa S10.

### PP-157 — Error recovery is shown, not hidden.
**Description:** When something fails, the user sees what to do next, including retry and support paths.
**Reason:** Recovery is part of the status message (PP-141).
**Examples:** Retry buttons with context.
**Implementation guidance:** Recovery-path template.
**Priority:** P1.
**Affected modules:** All error surfaces.
**Source(s):** Stripe P29; Coupa S10.4.

### PP-158 — Data-mode warnings travel with the data.
**Description:** Demo/test mode markers appear wherever that data could be mistaken for live.
**Reason:** Test data in audit artifacts is a compliance disaster (PP-039).
**Examples:** Watermarked demo exports.
**Implementation guidance:** Mode propagation.
**Priority:** P1.
**Affected modules:** export, AppShell.
**Source(s):** Stripe P06/P42.

### PP-159 — The platform never hides a known problem.
**Description:** Known staleness, failed syncs, and degraded states render as warnings, never silently.
**Reason:** Hidden degradation is betrayal (Ramp S13.3).
**Examples:** Sync-failure banner.
**Implementation guidance:** Health-state rendering.
**Priority:** P0.
**Affected modules:** ConnectionStatus, Dashboard, AppShell.
**Source(s):** Ramp S13.3; Stripe S10.3.

### PP-160 — Trust artifacts are screen-reader-usable.
**Description:** Evidence packages, audit trails, and decisions export in screen-reader-usable formats.
**Reason:** Auditors need accessible exports (Ramp P-109).
**Examples:** Accessible decision exports.
**Implementation guidance:** Export accessibility contract.
**Priority:** P1.
**Affected modules:** Governance, export, DecisionEngine.
**Source(s):** Ramp P-109; Engineering Constitution.

---

## I. Mistakes, Safety & Irreversibility (PP-161 … PP-175)

### PP-161 — Proximity equals risk.
**Description:** Destructive actions are buried in overflow menus, away from primary actions.
**Reason:** Accidental money damage is the worst failure mode (Stripe P37).
**Examples:** Refund/void/delete in overflow.
**Implementation guidance:** Destructive-action placement contract.
**Priority:** P0.
**Affected modules:** EnterpriseForm, Detail pages, WorkQueue.
**Source(s):** Stripe P37.

### PP-162 — Confirmation tiers by irreversibility.
**Description:** light → typed → dual-signature by amount and irreversibility.
**Reason:** Friction is the safety (PP-091).
**Examples:** Typed PAY for batch release.
**Implementation guidance:** Tiered confirmation contract.
**Priority:** P0.
**Affected modules:** Approvals, Payments, IAM.
**Source(s):** Stripe P38; Ramp P-097.

### PP-163 — Dual-signature above threshold.
**Description:** Payments/releases above configured thresholds require two independent approvals (SoD).
**Reason:** Threshold authority tiers are constitutional (AP Permission Matrix).
**Examples:** $250K tier requires treasury + controller.
**Implementation guidance:** Threshold tiers in ApprovalMatrix.
**Priority:** P0.
**Affected modules:** ApprovalMatrix, Treasury, AP.
**Source(s):** Coupa S12.3; AP Permission Matrix.

### PP-164 — SoD at the API layer.
**Description:** Separation of duties is enforced at the endpoint, not just modeled in data.
**Reason:** An enforced SoD is stronger than a modeled one (Ramp P-103).
**Examples:** Initiator ≠ approver ≠ releaser enforced in routes.
**Implementation guidance:** Enforce SoD checks in handlers.
**Priority:** P0.
**Affected modules:** IAM, AP, Treasury, API.
**Source(s):** Ramp P-103; Coupa S12.3.

### PP-165 — Draft-by-default for financial objects.
**Description:** Builders auto-save drafts; losing half-built work is worse than storing drafts.
**Reason:** Drafts prevent loss and enable review (Stripe P40).
**Examples:** Auto-saved invoice drafts.
**Implementation guidance:** Auto-save on money builders.
**Priority:** P0.
**Affected modules:** EnterpriseForm, AP, Treasury.
**Source(s):** Stripe P40.

### PP-166 — Destructive ops need recovery paths or elevation.
**Description:** Any destructive operation documents its recovery path or demands elevated confirmation.
**Reason:** Recovery is a constitutional requirement (Ramp P-106).
**Examples:** Void-with-recovery; elevated delete.
**Implementation guidance:** Recovery classification on destructive ops.
**Priority:** P0.
**Affected modules:** IAM, AP, Governance.
**Source(s):** Ramp P-106; Security Review #6.

### PP-167 — Environment boundaries are structural.
**Description:** Demo/live/test separation is enforced at the data layer, mirrored by permanent UI markers.
**Reason:** Test data in live ops is catastrophic (Stripe P42).
**Examples:** Separate demo tables/sync.
**Implementation guidance:** Data-layer environment separation.
**Priority:** P0.
**Affected modules:** Infrastructure, AppShell, Data layer.
**Source(s):** Stripe P42.

### PP-168 — Money is pessimistic; views are optimistic.
**Description:** Money state renders pending until confirmed; view state renders optimistically.
**Reason:** The boundary doctrine (PP-008).
**Examples:** Pending payment chips; instant view filters.
**Implementation guidance:** Rendering contract per data class.
**Priority:** P0.
**Affected modules:** All money surfaces, EnterpriseTable.
**Source(s):** Stripe P43; Linear S17.14 #1.

### PP-169 — Idempotency keys for all mutations.
**Description:** Mutating endpoints accept and honor idempotency keys.
**Reason:** Retries and double-submits must be safe (PP-020).
**Examples:** x-idempotency-key on AP/Payments.
**Implementation guidance:** Middleware + persistence.
**Priority:** P0.
**Affected modules:** API, AP, Payments.
**Source(s):** Stripe P65; Ramp P-058.

### PP-170 — Optimistic concurrency on money aggregates.
**Description:** Money aggregates carry version fields; stale writes are rejected.
**Reason:** Concurrent edits must not silently overwrite.
**Examples:** version Int on 12 AP aggregate roots.
**Implementation guidance:** Version checks in repositories.
**Priority:** P0.
**Affected modules:** AP repositories, UnitOfWork.
**Source(s):** Ramp P-058; Phase 21A.1.

### PP-171 — Fail-closed on money uncertainty.
**Description:** When money state is uncertain (sync failure, timeout), the platform fails closed and labels, never assumes success.
**Reason:** Fail-open on money is dangerous (Security review).
**Examples:** Pending-until-confirmed renders.
**Implementation guidance:** Fail-closed contracts on money reads/writes.
**Priority:** P0.
**Affected modules:** All money paths, API.
**Source(s):** Security Phase 17.1; Stripe P43.

### PP-172 — Rate-limit auth and mutation endpoints.
**Description:** Authentication and financial mutation endpoints are rate-limited.
**Reason:** Brute force and abuse are stopped at the edge (Security Review #9).
**Examples:** rateLimit in proxy/handlers.
**Implementation guidance:** rateLimit everywhere mutations happen.
**Priority:** P0.
**Affected modules:** proxy, API, IAM.
**Source(s):** Ramp P-052; Security Review #9.

### PP-173 — All destructive actions are audited.
**Description:** Deletes, voids, refunds, and rotations call recordAudit.
**Reason:** Every security/finance-affecting action has an audit record (Security Review #4).
**Examples:** Void audit entries.
**Implementation guidance:** recordAudit on all destructive paths.
**Priority:** P0.
**Affected modules:** Governance, AP, Treasury.
**Source(s):** Security Review #4; Coupa S12.2.

### PP-174 — Recovery paths are documented and drill-tested.
**Description:** Destructive/recovery flows are documented and exercised in drills.
**Reason:** A recovery path that has never run is a story (Recovery platform).
**Examples:** Restore drills.
**Implementation guidance:** Recovery drill schedule.
**Priority:** P1.
**Affected modules:** Recovery, Governance.
**Source(s):** Security Review #6; Recovery docs.

### PP-175 — Reversibility is classified at design time.
**Description:** Every action is classified reversible/confirmable/irreversible at design, driving its UI.
**Reason:** Classification upfront prevents retrofits (Stripe P44).
**Examples:** Action-risk registry.
**Implementation guidance:** Action-classification registry.
**Priority:** P1.
**Affected modules:** EnterpriseForm, Approvals, IAM.
**Source(s):** Stripe P44; Ramp P-097.

---

## J. AI, Intelligence & Evidence (PP-176 … PP-195)

### PP-176 — AI explains the past; humans decide the future.
**Description:** AI produces explanations, evidence, and prepared decisions; humans retain decision authority.
**Reason:** The constitutional AI line (PP-007).
**Examples:** Evidence packages; recommendation categories.
**Implementation guidance:** DecisionEngine boundary.
**Priority:** P0.
**Affected modules:** AI, DecisionEngine, AgentFramework.
**Source(s):** Ramp P-048; EPS AI Behaviour Guide; Coupa S11.7.

### PP-177 — Decision categories, not confidence scores.
**Description:** AI outputs Approve / Reject / Needs review with evidence, never fabricated scalar confidence.
**Reason:** Scalar confidence is unverifiable and always ~70–80% (Ramp S13.4).
**Examples:** Decision category badges.
**Implementation guidance:** DecisionEngine output contract.
**Priority:** P0.
**Affected modules:** DecisionEngine, WorkQueue, AI.
**Source(s):** Ramp S13.4.

### PP-178 — Constrained scope defeats hallucination.
**Description:** Agents are bound to typed tasks (matching, coding, flagging) with typed outputs.
**Reason:** Task design, not prompt tuning, is the anti-hallucination strategy (Ramp S13.3 #2).
**Examples:** Matching agents; coding agents.
**Implementation guidance:** Typed agent task contracts.
**Priority:** P0.
**Affected modules:** AgentFramework, AI.
**Source(s):** Ramp S13.3 #2.

### PP-179 — Every decision ships reasoning with citations.
**Description:** AI decisions render reasoning bullets plus citations to governing rules.
**Reason:** Reasoning alone can hallucinate; citations ground it (Ramp S13.5).
**Examples:** Policy-cited decision cards.
**Implementation guidance:** Evidence rendering as citations.
**Priority:** P0.
**Affected modules:** EvidenceEngine, DecisionEngine, AI.
**Source(s):** Ramp S13.5; Stripe P32.

### PP-180 — Autonomy is a slider, not a switch.
**Description:** Agent authority is configurable per workflow with deterministic guardrails (dollar limits, blocklists).
**Reason:** Agent authority is a product configuration, not an engineering constant (Ramp S13.7).
**Examples:** Autonomy slider in agent config.
**Implementation guidance:** AgentConfiguration authority model.
**Priority:** P0.
**Affected modules:** AgentFramework, AgentConfiguration.
**Source(s):** Ramp S13.7/P-039.

### PP-181 — Trust grows through staged promotion.
**Description:** Agent capability promotes suggestions → subsets → autonomy, each step validated.
**Reason:** The trust curve matches customer comfort (Ramp S13.8).
**Examples:** Agent onboarding stages.
**Implementation guidance:** Staged-promotion mechanism.
**Priority:** P1.
**Affected modules:** AgentFramework, AgentConfiguration.
**Source(s):** Ramp S13.8/P-040.

### PP-182 — Evals are the new unit tests.
**Description:** Golden datasets gate agent behavior in CI; edge cases become eval cases.
**Reason:** Agents need measured correctness, not vibes (Ramp S13.9).
**Examples:** Golden eval suite in CI.
**Implementation guidance:** AgentGovernance + testing framework.
**Priority:** P0.
**Affected modules:** testing, AgentGovernance.
**Source(s):** Ramp S13.9/P-042.

### PP-183 — Ground truth comes from reviewed datasets, not lenient users.
**Description:** Agent evals use reviewed golden datasets; user acceptance rate is not ground truth.
**Reason:** Lenient finance teams bias "correct" toward "approved" (Ramp S13.9).
**Examples:** Expert-reviewed golden datasets.
**Implementation guidance:** Golden-data governance.
**Priority:** P1.
**Affected modules:** AgentGovernance, testing.
**Source(s):** Ramp S13.9.

### PP-184 — Agent context is assembled from trusted sources only.
**Description:** Agent context pulls from approved sources; never from raw/untrusted input.
**Reason:** Trusted context is the precondition for trusted output (Ramp P-045).
**Examples:** ContextEngine source registry.
**Implementation guidance:** Trusted-source assembly.
**Priority:** P0.
**Affected modules:** AgentContextEngine, AgentFramework.
**Source(s):** Ramp P-045.

### PP-185 — Every AI-influenced decision is marked.
**Description:** AI involvement renders visibly on the decision surface.
**Reason:** Locatability is the trust device (Ramp S13.1).
**Examples:** AI-influenced badge.
**Implementation guidance:** AI-marking contract.
**Priority:** P1.
**Affected modules:** EDL, DecisionEngine, AI.
**Source(s):** Ramp S13.1/P-049.

### PP-186 — Policy is a tenant-editable, versioned object agents consume.
**Description:** Policies live as versioned objects; agents read them; humans refine them.
**Reason:** The policy editor is the human feedback loop (Ramp S13.6).
**Examples:** Living policy with version history.
**Implementation guidance:** PolicyRegistry as agent input.
**Priority:** P1.
**Affected modules:** PolicyRegistry, AgentFramework, Governance.
**Source(s):** Ramp S13.6/P-041/P-024.

### PP-187 — Confidence thresholds are per-capability.
**Description:** AI activation thresholds are per-capability and documented, never universal.
**Reason:** One universal threshold is wrong for every capability (Ramp P-051).
**Examples:** Per-capability thresholds in config.
**Implementation guidance:** Capability-threshold registry.
**Priority:** P1.
**Affected modules:** AgentConfiguration, AI.
**Source(s):** Ramp P-051.

### PP-188 — AI outputs carry data-classification tags.
**Description:** AI outputs are classified (Public/Internal/Confidential/Restricted) like all data.
**Reason:** Classification governs handling (Ramp P-053).
**Examples:** Tagged AI outputs.
**Implementation guidance:** Classification integration.
**Priority:** P1.
**Affected modules:** Foundation Classification, AI.
**Source(s):** Ramp P-053; Platform Constitution Law 13.

### PP-189 — No cross-tenant learning, ever.
**Description:** AI never learns from one tenant to serve another; isolation is absolute.
**Reason:** Tenant sovereignty (PP-011).
**Examples:** Per-tenant models.
**Implementation guidance:** Isolation at query + training layers.
**Priority:** P0.
**Affected modules:** AI, RuntimeContext, Intelligence.
**Source(s):** Ramp P-050; Coupa S7.6.

### PP-190 — Human overrides are data, not noise.
**Description:** Human override of AI recommendations is captured and learned from (per tenant).
**Reason:** Overrides teach where the model errs (Ramp P-047).
**Examples:** Override analytics per tenant.
**Implementation guidance:** Override capture.
**Priority:** P1.
**Affected modules:** AgentMemory, DecisionEngine.
**Source(s):** Ramp P-047.

### PP-191 — Anomaly detection is real-time and evidence-bearing.
**Description:** Fraud/anomaly detection runs in real-time over the stream and flags with evidence.
**Reason:** Detection must be timely and defensible (Ramp S13.12).
**Examples:** Pre-creation fraud flags.
**Implementation guidance:** Real-time anomaly pipeline.
**Priority:** P1.
**Affected modules:** DecisionEngine, AP, Intelligence.
**Source(s):** Ramp S13.12.

### PP-192 — Every agent decision is logged for labeled learning.
**Description:** Agent decisions and outcomes are logged for per-tenant learning and evals.
**Reason:** Logging enables improvement and audit (Ramp P-044).
**Examples:** Decision logs with outcomes.
**Implementation guidance:** Decision-logging pipeline.
**Priority:** P1.
**Affected modules:** AgentMemory, Governance.
**Source(s):** Ramp P-044.

### PP-193 — Intelligence is a layer, not a product.
**Description:** Intelligence capabilities span all surfaces; they are locatable but not siloed.
**Reason:** The AI layer, not the AI product (Ramp S13.1).
**Examples:** AI in matching, coding, flagging, forecasting.
**Implementation guidance:** Shared intelligence services.
**Priority:** P1.
**Affected modules:** Intelligence, AI, all domains.
**Source(s):** Ramp S13.1.

### PP-194 — AI is benchmarked with measured evidence.
**Description:** AI claims (accuracy, time saved) are published only from measured evals, per tenant.
**Reason:** Marketing must not exceed evidence (PP-XX / Ramp S13.10).
**Examples:** Measured-only claims.
**Implementation guidance:** Claim-traceability standard.
**Priority:** P1.
**Affected modules:** Marketing, AgentGovernance.
**Source(s):** Ramp S13.10; Product Constitution.

### PP-195 — The Decision Workspace is the AI decision surface.
**Description:** Recommendations, evidence, reasoning, confidence, alternatives, and audit render as one workspace.
**Reason:** Decision Intelligence is the differentiator (Document 06).
**Examples:** Decision Workspace with all artifacts.
**Implementation guidance:** Document 06 contract.
**Priority:** P0.
**Affected modules:** DecisionEngine, Decision Workspace, EvidenceEngine.
**Source(s):** Stripe S14.4; Ramp P-090; EPS AI Behaviour Guide.

---

## K. Enterprise, Governance & Tenant Isolation (PP-196 … PP-210)

### PP-196 — RBAC + ABAC with granular permissions.
**Description:** Access is role-based plus attribute-based, with granular permissions in the registry.
**Reason:** The IAM model is constitutional (Security/Identity phases).
**Examples:** GranularPermission registry.
**Implementation guidance:** Permission checks at endpoints.
**Priority:** P0.
**Affected modules:** IAM, all APIs.
**Source(s):** Coupa S12.4; Security Review.

### PP-197 — New automations require new permissions.
**Description:** Any new action that mutates or exposes data registers a GranularPermission.
**Reason:** Permission creep is a privilege-escalation risk (Security Review #2).
**Examples:** Approval-agent permission.
**Implementation guidance:** PermissionRegistry gate.
**Priority:** P0.
**Affected modules:** IAM, PermissionRegistry.
**Source(s):** Ramp P-104; Security Review #2.

### PP-198 — Tenant isolation is enforced at the query layer.
**Description:** Every query is tenant-scoped by the runtime context; cross-tenant access is structurally blocked.
**Reason:** Isolation is absolute (Platform Constitution Law 11).
**Examples:** RuntimeContext tenant scoping.
**Implementation guidance:** RuntimeContext in all data access.
**Priority:** P0.
**Affected modules:** RuntimeContext, all data layers.
**Source(s):** Ramp P-050; Platform Constitution Law 11.

### PP-199 — Config changes that affect money elevate.
**Description:** Configuration changes affecting money require elevated permissions and audit.
**Reason:** A bad config change moves money (Ramp P-105).
**Examples:** Approval for rate/tolerance changes.
**Implementation guidance:** Elevation rules on config.
**Priority:** P0.
**Affected modules:** Governance, EnterpriseForm, IAM.
**Source(s):** Ramp P-105; Security Review.

### PP-200 — Audit log is a first-class page.
**Description:** The audit log is filterable, exportable, and a designed surface.
**Reason:** Audit is a product surface, not an appendix (PP-017).
**Examples:** Audit log page with filters.
**Implementation guidance:** Audit page on EnterpriseTable.
**Priority:** P0.
**Affected modules:** Governance, EnterpriseTable.
**Source(s):** Ramp P-102; Coupa S12.2.

### PP-201 — Every financial decision is append-only and tamper-evident.
**Description:** Decision and money records are append-only with integrity checks.
**Reason:** Tamper-evidence is the Auditor's trust floor (Ramp P-101).
**Examples:** Append-only audit records.
**Implementation guidance:** Append-only storage + integrity.
**Priority:** P0.
**Affected modules:** Governance, Audit, AP.
**Source(s):** Ramp P-101; Coupa S12.2.

### PP-202 — Readiness includes AI-trust dimensions.
**Description:** Readiness checks include agent-governance and AI-trust health.
**Reason:** A platform with unsafe agents is not ready (Ramp P-108).
**Examples:** Readiness check for agent config.
**Implementation guidance:** Readiness extension.
**Priority:** P1.
**Affected modules:** EnterpriseReadinessService, AgentFramework.
**Source(s):** Ramp P-108.

### PP-203 — Evidence artifacts export screen-reader-usable.
**Description:** All audit and evidence exports are accessible.
**Reason:** Auditors need accessible exports (PP-160).
**Examples:** Accessible exports.
**Implementation guidance:** Export accessibility.
**Priority:** P1.
**Affected modules:** Governance, export.
**Source(s):** Ramp P-109.

### PP-204 — Multi-entity scoping before global UI.
**Description:** Every money object is entity-scoped before any global/consolidated surface ships.
**Reason:** Global views without entity scoping are hazardous (Ramp P-110).
**Examples:** Entity column + scoping.
**Implementation guidance:** Entity scope in models.
**Priority:** P0.
**Affected modules:** RuntimeContext, Treasury, AP.
**Source(s):** Ramp P-110.

### PP-205 — Governance lives in the interface.
**Description:** Where practical, governance (limits, policies, delegation) is adjusted in context, not buried in settings.
**Reason:** Interface-embedded governance is used; buried settings are ignored (Linear S13.3).
**Examples:** In-queue policy tweaks.
**Implementation guidance:** Contextual governance surfaces.
**Priority:** P1.
**Affected modules:** WorkQueue, Governance, ApprovalMatrix.
**Source(s):** Linear S13.3.

### PP-206 — Onboarding ends in day-zero automation.
**Description:** Setup concludes with working automation, not blank screens.
**Reason:** Day-zero value is the retention lever (Ramp P-117).
**Examples:** Onboarding wizard → seeded policy + agents.
**Implementation guidance:** Onboarding → automation wiring.
**Priority:** P1.
**Affected modules:** Onboarding, AgentFramework.
**Source(s):** Ramp P-117; Coupa S10.7.

### PP-207 — Customer evidence sets roadmap priority.
**Description:** Roadmap priority comes from customer evidence, not opinions.
**Reason:** Evidence-based product evolution is constitutional (Ramp P-125).
**Examples:** Brain + CRM evidence.
**Implementation guidance:** Evidence → roadmap loop.
**Priority:** P0.
**Affected modules:** Brain, CRM, Roadmap.
**Source(s):** Ramp P-125; Product Constitution.

### PP-208 — Pricing never gates controls or auditability.
**Description:** Security, controls, and auditability are never paywalled.
**Reason:** Gating safety is a constitutional failure (Ramp P-124).
**Examples:** Audit features on all tiers.
**Implementation guidance:** Tier policy review.
**Priority:** P1.
**Affected modules:** Platform, Governance.
**Source(s):** Ramp P-124.

### PP-209 — RTL readiness ships with new surfaces.
**Description:** New workflow surfaces ship RTL-ready.
**Reason:** Global markets require RTL from day one (Ramp P-114).
**Examples:** RTL-aware layouts.
**Implementation guidance:** RTL checklist per surface.
**Priority:** P2.
**Affected modules:** i18n, EDL, all surfaces.
**Source(s):** Ramp P-114.

### PP-210 — Statutory forms are capability contracts.
**Description:** Tax forms and statutory details are jurisdiction-configurable capabilities, not hardcoded features.
**Reason:** Jurisdiction variance is legitimate variance (Ramp P-113).
**Examples:** CapabilityRegistry tax modules.
**Implementation guidance:** Capability contract model.
**Priority:** P1.
**Affected modules:** CapabilityRegistry, Tax.
**Source(s):** Ramp P-113/P-063.

---

## L. Accessibility & Inclusion (PP-211 … PP-225)

### PP-211 — Accessibility is a release gate.
**Description:** WCAG 2.1 AA compliance is a release gate, not a backlog item.
**Reason:** Inaccessible surfaces exclude auditors and professionals (Ramp P-099).
**Examples:** QA gate on accessibility.
**Implementation guidance:** Automated + manual a11y checks.
**Priority:** P0.
**Affected modules:** EDL, QA, all surfaces.
**Source(s):** Ramp P-099; Linear S12.

### PP-212 — The keyboard completes the product.
**Description:** All primary workflows are keyboard-completable.
**Reason:** Keyboard = speed and accessibility (Stripe P67; Linear S10).
**Examples:** Tab/Enter/Escape everywhere; queue j/k.
**Implementation guidance:** Keyboard contract.
**Priority:** P0.
**Affected modules:** EnterpriseForm, WorkQueue, AppShell.
**Source(s):** Stripe P67; Linear S10.

### PP-213 — Focus is visible and ordered.
**Description:** Focus indicators and order are designed, not inherited.
**Reason:** Keyboard users depend on focus visibility (Stripe S11).
**Examples:** Focus ring tokens.
**Implementation guidance:** Focus contract in EDL.
**Priority:** P0.
**Affected modules:** EDL, all components.
**Source(s):** Stripe S11.3; Linear S12.

### PP-214 — Contrast is provable.
**Description:** Color pairs meet AA contrast, verified by token-level automation.
**Reason:** Contrast is the accessibility floor (Stripe S11.5).
**Examples:** Token-level contrast checks.
**Implementation guidance:** Contrast automation.
**Priority:** P0.
**Affected modules:** EDL, design-governance.
**Source(s):** Stripe S11.5; Ramp P-099.

### PP-215 — Color is never the sole carrier.
**Description:** Status, trends, and states always pair color with text/icon.
**Reason:** Color-blind users need non-color signals (PP-072).
**Examples:** StatusCell icon+label.
**Implementation guidance:** Non-color-signal contract.
**Priority:** P0.
**Affected modules:** StatusCell, charts, EDL.
**Source(s):** Stripe P26; Linear S12.

### PP-216 — Motion respects reduced-motion.
**Description:** Motion is reduced-motion-aware; animation never delays decision-making.
**Reason:** Vestibular users and speed both require restraint (Ramp P-100).
**Examples:** MotionProvider reduced-motion.
**Implementation guidance:** Reduced-motion contract.
**Priority:** P0.
**Affected modules:** Motion, EDL.
**Source(s):** Ramp P-100; Linear S11.

### PP-217 — Screen-reader parity for exports.
**Description:** Every export/artifact has a screen-reader-usable equivalent.
**Reason:** Auditors need accessible artifacts (PP-160).
**Examples:** Accessible decision exports.
**Implementation guidance:** Export accessibility.
**Priority:** P1.
**Affected modules:** export, Governance.
**Source(s):** Ramp P-109.

### PP-218 — Landmarks are labeled.
**Description:** Regions (sidebar, topbar, main, dialogs) carry accessible names.
**Reason:** Screen-reader navigation depends on landmarks (a11y phase).
**Examples:** aria-labels on shell regions.
**Implementation guidance:** Landmark contract.
**Priority:** P1.
**Affected modules:** AppShell, components.
**Source(s):** Phase 8B.9; Linear S12.

### PP-219 — Icon-only controls are labeled.
**Description:** Every icon-only button carries an accessible name.
**Reason:** Icon-only controls are invisible to screen readers without labels.
**Examples:** aria-label on all icon buttons.
**Implementation guidance:** aria-label lint gate.
**Priority:** P1.
**Affected modules:** All components.
**Source(s):** Phase 8B.9; Stripe S11.4.

### PP-220 — Dialogs trap and restore focus.
**Description:** Dialogs trap focus, restore on close, and dismiss on Escape.
**Reason:** Dialog accessibility is a baseline (Stripe S11.4).
**Examples:** AnimatedDialog focus trap.
**Implementation guidance:** Dialog a11y contract.
**Priority:** P1.
**Affected modules:** AnimatedDialog, ConfirmDialog.
**Source(s):** Stripe S11.4; Phase 8B.9.

### PP-221 — Skip navigation exists.
**Description:** A skip-to-content link is present and focus-revealed.
**Reason:** Keyboard users skip repeated chrome (WCAG 2.4.1).
**Examples:** Skip link in AppShell.
**Implementation guidance:** Skip-link contract.
**Priority:** P1.
**Affected modules:** AppShell.
**Source(s):** Phase 8B.9.

### PP-222 — Touch targets are adequate.
**Description:** Interactive targets meet minimum touch size (44px) on mobile.
**Reason:** Mobile executives need reliable targets.
**Examples:** touch-target utility.
**Implementation guidance:** Touch-target contract.
**Priority:** P1.
**Affected modules:** Mobile components, EDL.
**Source(s):** Phase 8B.8; Linear S11.

### PP-223 — Text scales without breaking.
**Description:** Layouts survive 200% zoom and font scaling.
**Reason:** Zoom resilience is an accessibility baseline.
**Examples:** Fluid layouts.
**Implementation guidance:** Zoom test in QA.
**Priority:** P1.
**Affected modules:** EDL, all layouts.
**Source(s):** Linear S12; Coupa S10.7.

### PP-224 — Forms announce validation.
**Description:** Validation errors announce via aria-live and associate with fields.
**Reason:** Form feedback must reach assistive tech (Stripe S11.4).
**Examples:** aria-invalid + describedby.
**Implementation guidance:** Form a11y contract.
**Priority:** P0.
**Affected modules:** EnterpriseForm, EnterpriseField.
**Source(s):** Stripe S11.4; Phase 8B.6.

### PP-225 — Accessibility is measured, not assumed.
**Description:** Accessibility is verified with automated scans plus manual passes, tracked over time.
**Reason:** Measured accessibility prevents regression (Ramp P-099).
**Examples:** Scan suite in CI.
**Implementation guidance:** a11y scan + gate.
**Priority:** P1.
**Affected modules:** QA, CI.
**Source(s):** Ramp P-099; Linear S12.

---

## M. Motion, Visual Design & EDL (PP-226 … PP-240)

### PP-226 — Restraint is the beauty standard.
**Description:** Generous whitespace, consistent rhythm, purposeful color; one accent (gold), everything else neutral.
**Reason:** Beauty through restraint (Engineering Constitution; EDL).
**Examples:** EDL token surfaces.
**Implementation guidance:** EDL token usage enforced.
**Priority:** P0.
**Affected modules:** EDL, all surfaces.
**Source(s):** Stripe P68–P69; Linear S11; Coupa S10.

### PP-227 — Whitespace, not borders, separates.
**Description:** Sections separate by spacing; hairlines only at close range.
**Reason:** Calm surfaces signal control (Stripe P68).
**Examples:** EDL spacing discipline.
**Implementation guidance:** Spacing-first layout.
**Priority:** P1.
**Affected modules:** EDL, layouts.
**Source(s):** Stripe P68.

### PP-228 — One accent; everything else neutral.
**Description:** Gold is the single accent; status colors carry state only.
**Reason:** Accent is impactful only when rare (Stripe P69).
**Examples:** Gold active states.
**Implementation guidance:** Accent token governance.
**Priority:** P0.
**Affected modules:** EDL.
**Source(s):** Stripe P69; Linear S11.3.

### PP-229 — Ink is never pure black.
**Description:** Text uses charcoal/off-white tokens, never pure black.
**Reason:** Pure black reads harsh and cheap (Stripe P70).
**Examples:** #0a0a0f surfaces.
**Implementation guidance:** Ink token enforcement.
**Priority:** P1.
**Affected modules:** EDL.
**Source(s):** Stripe P70.

### PP-230 — Typography does the emotional work.
**Description:** Inter + JetBrains Mono, tabular figures, disciplined weight/scale.
**Reason:** Type quality proves product quality (Stripe P71).
**Examples:** EDL typography scale.
**Implementation guidance:** Typography token discipline.
**Priority:** P1.
**Affected modules:** EDL.
**Source(s):** Stripe P71; Linear S11.4.

### PP-231 — Elevation signals one layer at a time.
**Description:** One elevated layer over content; never modal-over-drawer.
**Reason:** Deep stacks confuse state (PP-035).
**Examples:** Single-layer dialogs.
**Implementation guidance:** Elevation discipline.
**Priority:** P1.
**Affected modules:** EDL, dialogs.
**Source(s):** Stripe P72.

### PP-232 — Motion is fast, short, never required.
**Description:** Motion signals responsiveness; reduced-motion respected; animation never delays decisions.
**Reason:** Motion is signaling, not narrative (Stripe P73).
**Examples:** EDL motion tokens.
**Implementation guidance:** Motion token enforcement.
**Priority:** P1.
**Affected modules:** Motion, EDL.
**Source(s):** Stripe P73; Ramp P-100.

### PP-233 — Icons label state and action, not decoration.
**Description:** Icons are semantic; decorative icons are not shipped.
**Reason:** An icon that doesn't mean something is noise (Stripe P74).
**Examples:** Lucide semantic icons.
**Implementation guidance:** Icon semantics contract.
**Priority:** P1.
**Affected modules:** EDL, components.
**Source(s):** Stripe P74.

### PP-234 — Dark-first is a token set, not a theme.
**Description:** Dark-first charcoal + gold is the canonical token set; all surfaces derive from it.
**Reason:** Provable contrast in every surface (Stripe P75).
**Examples:** EDL-generated surfaces.
**Implementation guidance:** Token-driven theming.
**Priority:** P1.
**Affected modules:** EDL.
**Source(s):** Stripe P75; Linear S11.3.

### PP-235 — Density is a mode, not a compromise.
**Description:** Comfortable/compact/ultra-compact densities are designed modes; auditors get ultra-compact.
**Reason:** Dense is not degraded (Ramp P-096).
**Examples:** Density presets.
**Implementation guidance:** Density mode system.
**Priority:** P1.
**Affected modules:** EnterpriseTable, EDL.
**Source(s):** Ramp P-096; Coupa S10.2.

### PP-236 — Charts are bespoke and accessible.
**Description:** Charts render as accessible SVG with text alternatives; no chart library dependency.
**Reason:** Charts must be legible and screen-reader-addressable.
**Examples:** Custom SVG charts.
**Implementation guidance:** Chart accessibility contract.
**Priority:** P1.
**Affected modules:** Analytics, EDL.
**Source(s):** Stripe S8.7; Coupa S10.

### PP-237 — Saturation is earned.
**Description:** Saturation/color is reserved for meaning; text hierarchy uses opacity and weight.
**Reason:** Linear's "saturation for meaning" keeps density calm.
**Examples:** Status colors only for state.
**Implementation guidance:** Saturation governance.
**Priority:** P1.
**Affected modules:** EDL.
**Source(s):** Linear S11; Stripe S8.5.

### PP-238 — The design system is one canon.
**Description:** One EDL canon (tokens, components) governs all surfaces; no parallel component libraries.
**Reason:** Parallel systems cause drift (EDL audit).
**Examples:** EDL as single source.
**Implementation guidance:** Enforce EDL imports.
**Priority:** P0.
**Affected modules:** EDL, all components.
**Source(s):** EDL phase; Coupa S10.6.

### PP-239 — Empty and edge states are designed.
**Description:** Empty, sparse, and error states are designed surfaces, not afterthoughts.
**Reason:** Edge states are where trust is won or lost.
**Examples:** Designed empty states.
**Implementation guidance:** Edge-state templates.
**Priority:** P1.
**Affected modules:** All surfaces.
**Source(s):** Linear S3.7/S6.6; Stripe P31.

### PP-240 — The signature pattern is the metric card + the peek.
**Description:** The financial metric card (with drill-down) and the exception peek (with keyboard walk) are Perionyx's signature patterns.
**Reason:** They combine Stripe's trust object with Linear's velocity object (Linear S19.6).
**Examples:** Executive KPI card; queue Peek.
**Implementation guidance:** Perfect both signature patterns.
**Priority:** P1.
**Affected modules:** MetricCard, WorkQueue.
**Source(s):** Linear S19.6; Stripe S4.2.

---

## N. Performance & Speed (PP-241 … PP-255)

### PP-241 — CFOs don't wait.
**Description:** Metric values render first; charts second; interactive latency targets are enforced.
**Reason:** Perceived speed is a product value (Engineering Constitution; Stripe S10).
**Examples:** Metrics-first render order.
**Implementation guidance:** Latency budgets per surface.
**Priority:** P0.
**Affected modules:** Dashboard, all surfaces.
**Source(s):** Stripe P15; Linear S9; Ramp P-007.

### PP-242 — Skeletons preview structure.
**Description:** Skeletons hint structure before content; spinners are the last resort.
**Reason:** No reflow, structure hinted (Stripe P76).
**Examples:** Skeleton presets.
**Implementation guidance:** Skeleton-first loading.
**Priority:** P1.
**Affected modules:** Loading components.
**Source(s):** Stripe P76; Linear S9.6.

### PP-243 — Loading lives inside components.
**Description:** Component-local loading keeps navigation alive.
**Reason:** Perceived speed is interactivity, not paint (Stripe P77).
**Examples:** Detail-tab loading.
**Implementation guidance:** Component-local loading contract.
**Priority:** P1.
**Affected modules:** All surfaces.
**Source(s):** Stripe P77; Linear S9.

### PP-244 — Views are local-first; money is server-confirmed.
**Description:** View rendering is local-first/optimistic; money truth comes from the server.
**Reason:** The boundary doctrine applied to performance (PP-008).
**Examples:** Local view filters; confirmed money.
**Implementation guidance:** Hybrid rendering contract.
**Priority:** P0.
**Affected modules:** EnterpriseTable, money surfaces.
**Source(s):** Linear S9/S17.14 #1.

### PP-245 — Acknowledge within 100ms.
**Description:** Interactions acknowledge within 100ms; first paint shows something useful.
**Reason:** Instant acknowledgment is the perceived-performance floor (Linear S17.14 #3).
**Examples:** Optimistic ack on actions.
**Implementation guidance:** 100ms acknowledgment contract.
**Priority:** P1.
**Affected modules:** All interactions.
**Source(s):** Linear S17.14 #3.

### PP-246 — Cache headers and stale-while-revalidate.
**Description:** Read endpoints use tiered cache headers with stale-while-revalidate.
**Reason:** Fresh-but-fast reads serve CFOs (Stripe S10.3).
**Examples:** 15–120s tiered TTLs.
**Implementation guidance:** cacheHeaders on read routes.
**Priority:** P1.
**Affected modules:** API, Dashboard.
**Source(s):** Stripe S10.3; Phase 8A.4.

### PP-247 — The page never reloads.
**Description:** Navigation and view changes are client-side; full reloads are defects.
**Reason:** Reloads destroy momentum (Linear S3.8).
**Examples:** Client routing.
**Implementation guidance:** Client-side nav contract.
**Priority:** P1.
**Affected modules:** AppShell, routing.
**Source(s):** Linear S3.8.

### PP-248 — Virtualize large datasets.
**Description:** Large tables virtualize rows and cells; only visible rows render.
**Reason:** Scale must not degrade interactivity (Linear S9).
**Examples:** Virtualized ledger rows.
**Implementation guidance:** Virtualization for large tables.
**Priority:** P1.
**Affected modules:** EnterpriseTable, DataTable.
**Source(s):** Linear S9.4.

### PP-249 — Server-side filtering and pagination at scale.
**Description:** Large dataset queries filter and page server-side.
**Reason:** Client slicing lies at scale (PP-066).
**Examples:** Async filters.
**Implementation guidance:** Server-side pipelines.
**Priority:** P1.
**Affected modules:** EnterpriseTable, API.
**Source(s):** Stripe P55.

### PP-250 — Rendering discipline: minimal re-render.
**Description:** Cell/component re-renders are minimized; rendering is a designed concern.
**Reason:** Rendering cost is the interaction cost (Linear S9.4).
**Examples:** Memoized filtered data.
**Implementation guidance:** Render-budget discipline.
**Priority:** P1.
**Affected modules:** EnterpriseTable, analytics.
**Source(s):** Linear S9.4.

### PP-251 — Measured performance budgets.
**Description:** Performance budgets (LCP, CLS, INP, TTI) are measured in CI and enforced.
**Reason:** Unmeasured performance regresses silently.
**Examples:** Lighthouse ≥95 targets.
**Implementation guidance:** Performance CI gate.
**Priority:** P1.
**Affected modules:** CI, QA.
**Source(s):** Phase 8B.8; Linear S9.

### PP-252 — Startup is fast and meaningful.
**Description:** App startup prioritizes the shell + first decision surface; the rest streams.
**Reason:** Startup latency is first-impression latency (Linear S9.5).
**Examples:** Shell-first load.
**Implementation guidance:** Startup budget.
**Priority:** P1.
**Affected modules:** AppShell.
**Source(s):** Linear S9.5.

### PP-253 — Deterministic financial actions.
**Description:** Money actions are deterministic and idempotent regardless of timing/retries.
**Reason:** Determinism is the financial-integrity performance (Phase 19).
**Examples:** Idempotent payment commands.
**Implementation guidance:** Deterministic contracts.
**Priority:** P0.
**Affected modules:** Payments, AP, Reconciliation.
**Source(s):** Phase 19; Ramp P-058.

### PP-254 — Optimistic for views; pessimistic for money.
**Description:** View state updates optimistically; money state waits for confirmation.
**Reason:** PP-008 rendered as a performance rule.
**Examples:** Instant filters; pending money.
**Implementation guidance:** Rendering contract.
**Priority:** P0.
**Affected modules:** All surfaces.
**Source(s):** Linear S17.14 #1; Stripe P43.

### PP-255 — Progress is honest about uncertainty.
**Description:** Loading/progress renders truthfully; unknown waits are labeled as unknown.
**Reason:** False progress is a trust violation.
**Examples:** Indeterminate states labeled.
**Implementation guidance:** Progress honesty.
**Priority:** P1.
**Affected modules:** Loading components.
**Source(s):** Linear S9.6; Stripe S10.

---

## O. Search & Discovery (PP-256 … PP-265)

### PP-256 — One search over all financial objects.
**Description:** A single command palette searches vendors, invoices, payments, journals, exceptions, and balances.
**Reason:** Global search dissolves IA (PP-024).
**Examples:** Command palette grouped results.
**Implementation guidance:** Unified index.
**Priority:** P1.
**Affected modules:** CommandPalette, Search.
**Source(s):** Stripe P04; Linear S4.9.

### PP-257 — Fuzzy highlight, exact-ID jump.
**Description:** Results highlight matches; exact IDs jump straight to the record.
**Reason:** ID lookup is the finance shortcut (Linear S10).
**Examples:** ID-jump in palette.
**Implementation guidance:** ID-aware search.
**Priority:** P1.
**Affected modules:** CommandPalette.
**Source(s):** Linear S10.2; Ramp S5.4.

### PP-258 — Search is object-scoped.
**Description:** Search results are scoped by object type with deep links.
**Reason:** Scoped results reduce ambiguity (Ramp P-091).
**Examples:** Grouped type-ahead.
**Implementation guidance:** Type-scoped index.
**Priority:** P2.
**Affected modules:** CommandPalette.
**Source(s):** Ramp P-091.

### PP-259 — Search remembers and teaches.
**Description:** Recent searches persist; empty search states teach syntax.
**Reason:** Recency speeds re-finding (Stripe S5.7).
**Examples:** Recent-searches dropdown.
**Implementation guidance:** Search history.
**Priority:** P2.
**Affected modules:** table-search, CommandPalette.
**Source(s):** Stripe S5.7.

### PP-260 — Keyboard search everywhere.
**Description:** Cmd+K opens global search from anywhere.
**Reason:** The palette is the shortcut school (Linear S10.3).
**Examples:** Cmd+K globally.
**Implementation guidance:** Global palette binding.
**Priority:** P1.
**Affected modules:** CommandPalette, AppShell.
**Source(s):** Linear S10.3.

### PP-261 — Search results are previewable.
**Description:** Results preview (peek) before opening.
**Reason:** Peek beats open for review (PP-031).
**Examples:** Result peek in palette.
**Implementation guidance:** Peek in search.
**Priority:** P2.
**Affected modules:** CommandPalette.
**Source(s):** Linear S8.4.

### PP-262 — Filter and search share a grammar.
**Description:** Filters, search, and saved views use one consistent query grammar.
**Reason:** One grammar prevents relearning.
**Examples:** Shared query builder.
**Implementation guidance:** Unified query model.
**Priority:** P2.
**Affected modules:** EnterpriseTable, Search.
**Source(s):** Coupa S10.3.

### PP-263 — Search is tenant-scoped.
**Description:** Search indexes only the tenant's data; isolation is absolute in search.
**Reason:** Cross-tenant search is a leak (PP-011).
**Examples:** Tenant-scoped index.
**Implementation guidance:** Index isolation.
**Priority:** P0.
**Affected modules:** Search, RuntimeContext.
**Source(s):** Platform Constitution Law 11.

### PP-264 — Power search escapes to SQL.
**Description:** Analyst-grade search/query escapes to an audited SQL surface.
**Reason:** UI handles 80%; power tools handle the tail (PP-029).
**Examples:** Analyst SQL role.
**Implementation guidance:** Gated SQL surface.
**Priority:** P2.
**Affected modules:** Analyst surfaces, Governance.
**Source(s):** Stripe P10.

### PP-265 — Search ranks by relevance and recency.
**Description:** Results rank by relevance weighted with recency and role context.
**Reason:** Ranking is the discovery experience.
**Examples:** Role-weighted ranking.
**Implementation guidance:** Ranking model.
**Priority:** P2.
**Affected modules:** CommandPalette.
**Source(s):** Linear S4.9.

---

## P. Empty States, Onboarding & Education (PP-266 … PP-275)

### PP-266 — Onboarding ends in value, not screens.
**Description:** Setup finishes with working automation and seeded policy, not blank dashboards.
**Reason:** Day-zero value is retention (PP-206).
**Examples:** Wizard → day-zero automation.
**Implementation guidance:** Onboarding outcome contract.
**Priority:** P1.
**Affected modules:** Onboarding, Setup.
**Source(s):** Ramp P-117; Coupa S10.7.

### PP-267 — Policy ingestion is a wizard step.
**Description:** Upload → rules → decisions is a guided onboarding step.
**Reason:** Policy ingestion de-risks adoption (Ramp P-118).
**Examples:** Policy upload wizard.
**Implementation guidance:** Policy ingestion flow.
**Priority:** P1.
**Affected modules:** Onboarding, PolicyRegistry.
**Source(s):** Ramp P-118.

### PP-268 — Education at the moment of friction.
**Description:** Inline help/hint teaches where the user is stuck.
**Reason:** Instant education at friction beats documentation (Ramp P-027).
**Examples:** Contextual hints.
**Implementation guidance:** Friction-point education.
**Priority:** P1.
**Affected modules:** EnterpriseForm, Notifications.
**Source(s):** Ramp P-027.

### PP-269 — Templates teach by example.
**Description:** Templates demonstrate correct structure before blank builders.
**Reason:** Examples teach faster than instructions.
**Examples:** Workflow/approval templates.
**Implementation guidance:** Template-first surfaces.
**Priority:** P1.
**Affected modules:** AutomationStudio, ApprovalMatrix.
**Source(s):** Ramp P-019; Coupa S10.7.

### PP-270 — Empty states are doors, not walls.
**Description:** Every empty state offers a concrete next action.
**Reason:** PP-040/PP-144.
**Examples:** "Import your first vendor file."
**Implementation guidance:** Empty-state action contract.
**Priority:** P1.
**Affected modules:** All list surfaces.
**Source(s):** Stripe P31; Linear S6.6.

### PP-271 — First-run is role-aware.
**Description:** Onboarding and defaults shape to the user's role.
**Reason:** Role-shaped onboarding is faster than generic.
**Examples:** Role-aware setup paths.
**Implementation guidance:** Role shaping in onboarding.
**Priority:** P2.
**Affected modules:** Onboarding, IAM.
**Source(s):** Stripe P05; Ramp S5.

### PP-272 — The platform teaches its shortcuts.
**Description:** `?` reveals the shortcut vocabulary; palettes teach mastery.
**Reason:** Discoverable power (Stripe P80; Linear S10.3).
**Examples:** Keyboard shortcuts dialog.
**Implementation guidance:** Shortcut education.
**Priority:** P2.
**Affected modules:** CommandPalette, AppShell.
**Source(s):** Stripe P80; Linear S10.3.

### PP-273 — Learning is progressive, never a manual.
**Description:** Education ships in-context, progressively; no reliance on a manual.
**Reason:** In-context learning beats documentation (Ramp P-027).
**Examples:** Contextual guidance.
**Implementation guidance:** Progressive education.
**Priority:** P2.
**Affected modules:** All surfaces.
**Source(s):** Ramp P-027; Linear S2.4.

### PP-274 — Benchmarking is self-referential.
**Description:** Performance benchmarks compare a tenant to their own history and declared cohorts, never anonymous peers.
**Reason:** Tenant sovereignty (PP-011).
**Examples:** Self-comparison charts.
**Implementation guidance:** Self-referential benchmark.
**Priority:** P0.
**Affected modules:** Intelligence, Dashboard.
**Source(s):** Ramp P-121; Coupa S7.6.

### PP-275 — Day-zero automation is visible.
**Description:** The user sees what automation is active on day zero and what it will do.
**Reason:** Visible automation builds confidence (Ramp P-117).
**Examples:** Active-agent summary post-setup.
**Implementation guidance:** Setup outcome summary.
**Priority:** P1.
**Affected modules:** Onboarding, AgentFramework.
**Source(s):** Ramp P-117.

---

## Q. Export, Reporting & Audit Artifacts (PP-276 … PP-285)

### PP-276 — Every screen exports with parity.
**Description:** Anything shown exports with equal provenance, formatting, and filters.
**Reason:** PP-056.
**Examples:** CSV/XLS with metadata.
**Implementation guidance:** Export contract.
**Priority:** P1.
**Affected modules:** EnterpriseTable, Reporting.
**Source(s):** Stripe P58; Ramp P-088.

### PP-277 — Exports carry metadata.
**Description:** Exports embed generation timestamp, basis, filters, and mode.
**Reason:** An export without metadata is untrustworthy (PP-056).
**Examples:** Metadata header in CSV/XLS.
**Implementation guidance:** Metadata embedding.
**Priority:** P1.
**Affected modules:** export, Governance.
**Source(s):** Ramp P-088.

### PP-278 — Reports are scheduled and delivered.
**Description:** Recurring reports schedule and deliver through the queue.
**Reason:** Reconciliation happens off-platform on cadence (Stripe P58).
**Examples:** Scheduled close packs.
**Implementation guidance:** Report scheduling.
**Priority:** P2.
**Affected modules:** Reporting, Queue.
**Source(s):** Stripe P58.

### PP-279 — Audit exports are first-class.
**Description:** Audit logs export filterable, complete, screen-reader-usable.
**Reason:** Auditors need complete artifacts (PP-203).
**Examples:** Audit export.
**Implementation guidance:** Audit export contract.
**Priority:** P1.
**Affected modules:** Governance, export.
**Source(s):** Ramp P-109.

### PP-280 — Decision artifacts are exportable.
**Description:** Decisions export as a full evidence package.
**Reason:** Decisions must survive the platform (PP-018).
**Examples:** Decision export.
**Implementation guidance:** Decision artifact export.
**Priority:** P1.
**Affected modules:** DecisionEngine, Governance.
**Source(s):** Ramp S13.5; Stripe S14.4.

### PP-281 — Reports drill to source.
**Description:** Every report figure drills to underlying work items.
**Reason:** Drill-down is the trust reflex (PP-050).
**Examples:** Report → filtered queue.
**Implementation guidance:** Drill binding.
**Priority:** P1.
**Affected modules:** Reporting, WorkQueue.
**Source(s):** Ramp P-085.

### PP-282 — Export respects accessibility.
**Description:** Exports have accessible alternatives; raw exports are plain-readable.
**Reason:** PP-217.
**Examples:** Screen-reader-friendly exports.
**Implementation guidance:** Export accessibility.
**Priority:** P1.
**Affected modules:** export.
**Source(s):** Ramp P-109.

### PP-283 — Print-friendly close packs.
**Description:** Close and audit workflows print/pack cleanly for sign-off.
**Reason:** Physical/board review remains a finance ritual.
**Examples:** Print close pack.
**Implementation guidance:** Print layout.
**Priority:** P2.
**Affected modules:** Reporting, Close.
**Source(s):** Coupa S7.4.

### PP-284 — Export is traceable.
**Description:** Who exported what, when, and from which filters is audited.
**Reason:** Data-export governance is compliance (GDPR).
**Examples:** Export audit log.
**Implementation guidance:** Export audit.
**Priority:** P2.
**Affected modules:** Governance, export.
**Source(s):** Security Review; Compliance docs.

### PP-285 — Reports are versioned and diffable.
**Description:** Report definitions version and diff.
**Reason:** A changed report is a changed conclusion.
**Examples:** Report definition history.
**Implementation guidance:** Report versioning.
**Priority:** P2.
**Affected modules:** Reporting, Governance.
**Source(s):** Coupa S13.5.

---

## R. Global, Scale & Evolution (PP-286 … PP-300)

### PP-286 — Currency correctness is a platform primitive.
**Description:** Currency handling is centralized, Decimal-based, and locale-correct.
**Reason:** Currency drift is a global risk (Ramp P-111).
**Examples:** CurrencyService canonical.
**Implementation guidance:** Single currency layer.
**Priority:** P0.
**Affected modules:** CurrencyService, financial-precision.
**Source(s):** Ramp P-111; Phase 19.

### PP-287 — Local rails plug in as provider drivers.
**Description:** Local payment/banking rails are provider drivers with consistent control semantics.
**Reason:** Provider replacement is constitutional (Ramp P-112).
**Examples:** Payment provider drivers.
**Implementation guidance:** Provider driver model.
**Priority:** P1.
**Affected modules:** Payments Platform, provider drivers.
**Source(s):** Ramp P-112; Platform Constitution.

### PP-288 — Providers are replaceable and observable.
**Description:** Every external dependency is replaceable, observable, and contract-tested.
**Reason:** Provider lock-in is an existential risk (Platform Constitution Law 4/5).
**Examples:** Contract-tested drivers.
**Implementation guidance:** Provider certification.
**Priority:** P0.
**Affected modules:** All platforms.
**Source(s):** Platform Constitution; Ramp S6.

### PP-289 — The platform is measured, not marketing.
**Description:** Claims are measured and traceable; no unverified numbers.
**Reason:** Marketing must not exceed evidence (PP-194).
**Examples:** Measured-only claims.
**Implementation guidance:** Claim traceability.
**Priority:** P1.
**Affected modules:** Marketing, Product.
**Source(s):** Ramp S13.10.

### PP-290 — Release cadence is evidence-driven.
**Description:** Releases ship when measured quality gates pass, on a predictable cadence.
**Reason:** Predictable cadence builds customer trust (Ramp S4.3).
**Examples:** Monthly public release notes.
**Implementation guidance:** Release governance.
**Priority:** P1.
**Affected modules:** Release process.
**Source(s):** Ramp P-120/S4.3.

### PP-291 — Extension is capability-contract-first.
**Description:** Platform extension (apps, partners) ships behind capability contracts, not private APIs.
**Reason:** The developer platform is constitutional (Ramp P-123; Coupa S13).
**Examples:** CapabilityRegistry contracts.
**Implementation guidance:** Contract-first extension.
**Priority:** P1.
**Affected modules:** CapabilityRegistry, Developer Platform.
**Source(s):** Ramp P-123; Coupa S13.3.

### PP-292 — Sandbox tenants for partners.
**Description:** Partner/developer programs ship with sandbox tenants.
**Reason:** Sandboxes de-risk adoption (Ramp P-123).
**Examples:** Partner sandboxes.
**Implementation guidance:** Sandbox provisioning.
**Priority:** P2.
**Affected modules:** Developer Platform.
**Source(s):** Ramp P-123.

### PP-293 — Accounting-firm mode.
**Description:** Advisor mode serves accounting firms, not just controllers.
**Reason:** Firm-mode expands the market (Ramp P-122).
**Examples:** Firm-scoped views.
**Implementation guidance:** Advisor role.
**Priority:** P2.
**Affected modules:** Reconciliation, IAM.
**Source(s):** Ramp P-122.

### PP-294 — Evolution is documented and backward-compatible.
**Description:** Product changes document their rationale and preserve compatibility or migrate explicitly.
**Reason:** Trust in evolution is earned through documentation (Brain lessons).
**Examples:** Evolution timeline entries.
**Implementation guidance:** Change documentation.
**Priority:** P1.
**Affected modules:** Docs, Release.
**Source(s):** Brain evolution timeline; Ramp S4.3.

### PP-295 — The Product System is the reference.
**Description:** All product work cites the Product System before implementation.
**Reason:** Doctrine precedes implementation (Product Constitution).
**Examples:** Design docs cite principle IDs.
**Implementation guidance:** Principle-citation standard.
**Priority:** P0.
**Affected modules:** Product process.
**Source(s):** Product Constitution.

### PP-296 — Design debt is intentional and scheduled.
**Description:** Design debt is acknowledged, tracked, and scheduled for repayment.
**Reason:** Intentional debt beats accidental debt (Linear S2.5/P10).
**Examples:** Design-debt register.
**Implementation guidance:** Debt tracking.
**Priority:** P2.
**Affected modules:** Product process.
**Source(s):** Linear S2.5/P10.

### PP-297 — Reset is scheduled, not emergent.
**Description:** Periodic design resets are planned; they are never reactions to chaos.
**Reason:** Scheduled resets preserve coherence (Linear S11.7).
**Examples:** EDL version resets.
**Implementation guidance:** Reset governance.
**Priority:** P2.
**Affected modules:** EDL, Product.
**Source(s):** Linear S11.7.

### PP-298 — Evidence outlives the campaign.
**Description:** Research evidence persists in the Brain and outlives any feature campaign.
**Reason:** Knowledge compounds (Brain lessons).
**Examples:** Brain-archived evidence.
**Implementation guidance:** Evidence archival.
**Priority:** P1.
**Affected modules:** Brain, CRM.
**Source(s):** Brain; Ramp P-125.

### PP-299 — Competitors inform, never dictate.
**Description:** Research informs doctrine; competitors never dictate roadmap.
**Reason:** Reaction to competitors fragments identity.
**Examples:** Doctrine-first decisions.
**Implementation guidance:** Doctrine gate.
**Priority:** P1.
**Affected modules:** Product process.
**Source(s):** Product Constitution; four-product program.

### PP-300 — The platform compounds.
**Description:** Each module/surface feeds the shared spine; value compounds across the lifecycle.
**Reason:** Compounding is the platform's economic and integrity model (Ramp S3).
**Examples:** Work Queue spans modules; intelligence spans lifecycle.
**Implementation guidance:** Spine-first integration.
**Priority:** P0.
**Affected modules:** All.
**Source(s):** Ramp S3; Coupa S3.

---

## Appendix A — Principle Inventory Summary

| Domain | Range | Count |
|---|---|---|
| A. Vision, Mission & Product Stance | PP-001–PP-020 | 20 |
| B. Information Architecture & Navigation | PP-021–PP-040 | 20 |
| C. Decision Surfaces, KPIs & Dashboards | PP-041–PP-060 | 20 |
| D. Tables & Data | PP-061–PP-080 | 20 |
| E. Forms & Input | PP-081–PP-100 | 20 |
| F. Workflows & Lifecycle | PP-101–PP-120 | 20 |
| G. Financial Communication & Precision | PP-121–PP-140 | 20 |
| H. Trust, Microcopy & Status | PP-141–PP-160 | 20 |
| I. Mistakes, Safety & Irreversibility | PP-161–PP-175 | 15 |
| J. AI, Intelligence & Evidence | PP-176–PP-195 | 20 |
| K. Enterprise, Governance & Tenant Isolation | PP-196–PP-210 | 15 |
| L. Accessibility & Inclusion | PP-211–PP-225 | 15 |
| M. Motion, Visual Design & EDL | PP-226–PP-240 | 15 |
| N. Performance & Speed | PP-241–PP-255 | 15 |
| O. Search & Discovery | PP-256–PP-265 | 10 |
| P. Empty States, Onboarding & Education | PP-266–PP-275 | 10 |
| Q. Export, Reporting & Audit Artifacts | PP-276–PP-285 | 10 |
| R. Global, Scale & Evolution | PP-286–PP-300 | 15 |
| **Total** | | **300** |

## Appendix B — Source Principle Mappings

The 300 canonical principles synthesize and supersede the four research sets:

- **Stripe 80 (P01–P80):** absorbed into A, B, C, D, E, G, H, I, M, N, O, P, Q. Stripe-only emphasis: provenance/freshness (PP-013, PP-152), money alignment/typography (PP-062–064), consequence previews (PP-092), idempotency (PP-020, PP-088).
- **Linear 135 (12 domains):** absorbed into B, C, F, J, N, M, L, R. Linear-only emphasis: views-as-projections (PP-030), peek (PP-031), keyboard-first (PP-212), 100ms ack (PP-245), page-never-reloads (PP-247), intentional design debt (PP-296).
- **Ramp 125 (P-001–P-125):** absorbed into A, C, F, J, K, N, P, Q. Ramp-only emphasis: decision categories (PP-177), autonomy slider (PP-180), evals-as-unit-tests (PP-182), policy-as-versioned-object (PP-186), day-zero automation (PP-206, PP-266).
- **Coupa 156 (with 160 D / 198 O / 200 RW):** absorbed into A, B, D, F, G, I, K. Coupa-only emphasis: lifecycle spine (PP-001, PP-120), supplier-as-center-of-gravity (PP-037), config tolerance (PP-112), SoD-native (PP-164), continuous close (PP-116).

**Conflict resolution note:** Where the reports conflict (e.g., Coupa's community intelligence vs Ramp's tenant isolation; Coupa's config-depth vs Linear's opinionation; Stripe's guided onboarding vs Linear's learn-by-using), the canonical position is stated in the principle and elaborated in Documents 01 (Philosophy), 03–05 (domains), and 19 (Anti-patterns). The Product Constitution (Document 20) encodes the resolved positions as non-negotiables.

---

*Next: `03 Enterprise Principles.md` — the enterprise-operating principles that scope the platform's behavior at company scale.*
