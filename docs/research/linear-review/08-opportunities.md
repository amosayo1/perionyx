# Section 16 — Opportunities for Perionyx

## 16.1 How to Read This Section

This section converts the Linear research into concrete Perionyx opportunities. Each opportunity is rated for **impact** (H/M/L), **effort** (H/M/L), and **foundation readiness** (what already exists to build on). The sequencing guidance is in Section 18 (Roadmap); this section is the catalog.

## 16.2 Opportunity Group A: The Operator Loop (Highest Impact)

**A-1. Peek preview across financial lists.** Build the space-bar quicklook (Section 8.4) for the exception queue, approval queue, and ledger rows: highlight a row, peek the invoice snapshot / approval context / reconciliation state, walk with `j`/`k`, act without opening.
- Impact: H (converts queue review from ~10s/record to ~2s/record). Effort: M. Foundation: EnterpriseTable inline-edit, H-01 canonical work queue.

**A-2. Highlight-then-act list model (`j`/`k`/`x`/`space`/`enter`).** The row navigation + selection vocabulary on every EnterpriseTable screen.
- Impact: H. Effort: M. Foundation: EnterpriseTable + keyboard hooks; needs row-highlight state.

**A-3. In-place approval actions.** Approve/reject/delegate/escalate from the queue row or detail sidebar (status track), not a form.
- Impact: H. Effort: M. Foundation: 21A approval services, ApprovalPreview, mobile ApprovalQuickView.

**A-4. Approval status track on the record.** Render the invoice's approval chain as a sequential visible track (Received → Matched → Approved → Scheduled → Paid → Reconciled) — the Linear status-track pattern (Section 7.3).
- Impact: H. Effort: L-M. Foundation: 21A state machines; ApprovalAnalytics donut.

**A-5. Split view (list + detail) for approval/exception triage.** Walk the queue with the detail pane following the highlight (Section 7.7).
- Impact: H. Effort: M. Foundation: EnterpriseTable + detail components.

## 16.3 Opportunity Group B: Command and Keyboard (High Impact)

**B-1. CommandPalette as shortcut school.** Show every command's shortcut beside it; add contextual ranking by screen; add fuzzy matching (Section 10.3).
- Impact: H. Effort: L. Foundation: existing CommandPalette.

**B-2. Finance jump vocabulary (`g`/`o` destinations).** `g a` approvals, `g e` exceptions, `g l` ledger, `o i` invoices, `o p` payments — a two-tier mnemonic system (Section 10.2).
- Impact: M-H. Effort: L. Foundation: shell navigation.

**B-3. Queue-keyboard actions.** Single-key approve/reject/delegate in list context (never in form fields — the contextual-zone discipline, Section 10.5).
- Impact: M. Effort: L. Foundation: approval services.

**B-4. Universal `esc` + focus restoration audit.** Every dialog/peek returns focus to its opener; `esc` closes everywhere.
- Impact: M. Effort: L. Foundation: existing focus traps (8B.9).

**B-5. Extend undo to all mutations (with audit).** UndoProvider covers form edits; extend to list/detail actions with an audit trail (Section 8.8).
- Impact: M. Effort: M. Foundation: UndoProvider.

## 16.4 Opportunity Group C: The Review Surface (High Impact)

**C-1. "Requires me" queue (finance Inbox).** Auto-subscribed approvals/exceptions/mentions, act-in-place, snooze-with-reason, urgency-tiered digests (Section 13.4).
- Impact: H. Effort: M-H. Foundation: NotificationCenter, approval services, Notifications service.

**C-2. Triage discipline for exceptions.** Every exception gets a decision (assign/resolve/snooze/reject/archive), rendered as a decision queue (Section 5.8).
- Impact: H. Effort: M. Foundation: 21A exception services + state machines.

**C-3. Snooze with a reason.** Defer approvals/exceptions until a related event, with the reason in the audit trail.
- Impact: M. Effort: M. Foundation: audit + notifications.

**C-4. Close-cycle view (Linear's cycle + burndown).** Month-end/quarter-end close as a time-boxed view with scope vs actuals and health (Section 5.7).
- Impact: H. Effort: H. Foundation: approval matrix + reconciliation + GovernanceService.

## 16.5 Opportunity Group D: Views and State (Medium-High Impact)

**D-1. Saved views over the work queue and ledger.** Save/filter/sort/group states as named, shareable, subscribable views — projections, never copies (Section 4.6).
- Impact: M-H. Effort: M. Foundation: H-01 canonical filters, table toolbar.

**D-2. Filter chips with live result counts.** Additive/removable chips on the ledger and queue, with the "what's left" count live (Section 6.4).
- Impact: M. Effort: L. Foundation: EnterpriseTable filters.

**D-3. Global sync/freshness indicator in chrome.** The DataFreshnessIndicator promoted to a permanent, global chrome element with sync/offline states (Section 8.9).
- Impact: M. Effort: L. Foundation: DataFreshnessIndicator.

**D-4. Empty states as invitations.** Convert "no data" screens to actionable empty states (create/clear-filters/see-how) (Section 3.7).
- Impact: L-M. Effort: L. Foundation: many screens to touch.

**D-5. Per-user density persistence.** Compact/comfortable preference remembered per user across views.
- Impact: L-M. Effort: L. Foundation: EnterpriseTable density.

## 16.6 Opportunity Group E: Detail and Records (Medium Impact)

**E-1. Invoice Detail restructure (three zones).** Content / state / history separation (Section 7.1) — directly addresses the 27.1R cognitive-load finding (~320 data points).
- Impact: H. Effort: M-H. Foundation: 21A domain model + evidence collection.

**E-2. Audit timeline as scannable surface.** Per-event-type icons, actor attribution, chronological, filterable (Section 7.5).
- Impact: M. Effort: M. Foundation: append-only audit records.

**E-3. Unset fields as affordances.** Blank GL code / category render as "+ Add" affordances, not voids.
- Impact: M. Effort: L. Foundation: EnterpriseField.

**E-4. Relations with visible blockage.** PO/GRN/evidence blockage visible on the invoice (blocked-by read, live status chips).
- Impact: M. Effort: M. Foundation: 21A relations + evidence model.

**E-5. Cross-department comment threads on records.** `@`-mention coordination on the invoice/exception, embedded in the audit timeline.
- Impact: M. Effort: M. Foundation: notifications + audit.

## 16.7 Opportunity Group F: Architecture (Medium-High Impact, Longer Horizon)

**F-1. Local-first views layer.** Representational state (dashboards, filters, views, navigation) renders from a local cache; background sync reconciles; freshness labeled (Section 9.3). **Money mutations remain server-confirmed.**
- Impact: H. Effort: H. Foundation: cache layer (7E.3), stale-while-revalidate.

**F-2. Cell-level re-render.** Change a status badge without re-rendering the row (Section 9.4).
- Impact: M. Effort: M. Foundation: React components; needs render-granularity work.

**F-3. Warm-start from last-known-good.** First paint from cached state; background auth check; stale-but-labeled beats spinner (Section 9.5).
- Impact: M. Effort: M. Foundation: persistence + cache layers.

**F-4. WebSocket delta broadcast for financial views.** Live multi-operator updates on queues/ledger with permission checks.
- Impact: M. Effort: H. Foundation: PgBoss + runtime context.

**F-5. Keyboard-first as the architecture standard.** New screens designed keyboard-first by default (Section 10.9).
- Impact: M (long-term compounding). Effort: L per-screen (design standard).

## 16.8 Opportunity Group G: Governance and Opinionation (Medium Impact)

**G-1. Render governance as interface state.** Approval matrix, SoD, and exception policy visible on the record and queue, not just in settings (Section 13.3).
- Impact: M-H. Effort: M. Foundation: approval matrix + IAM.

**G-2. Opinionated approval defaults.** Ship the safe default approval chain; expose configuration only where legitimate variability exists (Section 2.3).
- Impact: M. Effort: L. Foundation: approval matrix evaluator.

**G-3. Restrict safety-semantics configuration.** SoD, audit, reconciliation invariants are not configurable into unsafeness.
- Impact: M. Effort: L (policy + validation). Foundation: IAM + validators.

**G-4. Business-unit workflows.** Per-entity statuses, exception policies, and approval matrices (Section 4.3).
- Impact: M. Effort: M. Foundation: approval matrix (per-company).

**G-5. Scheduled design/UX resets as a funded program.** The Linear "design debt is intentional" model (Section 2.5).
- Impact: M (sustaining). Effort: L (governance). Foundation: EDL.

## 16.9 Opportunity Group H: Micro-Interaction Polish (Low-Medium Impact, Cheap)

**H-1. The micro-interaction catalog (Section 14) as a build list.** Pick the 30 highest-value interactions (hover-reveal checkboxes, selection commitment, filter-chip pop, toast-undo, status-track step, empty-state illustrations) and implement across EnterpriseTable + forms + dashboard.
- Impact: M (perception compounds). Effort: L-M per item. Foundation: EDL motion tokens + MotionProvider.

**H-2. Skeleton rows layout-accurate everywhere.** Replace block skeletons with row-accurate ones on all data screens.
- Impact: L-M. Effort: L. Foundation: LoadingSkeleton.

**H-3. Press feedback within 60ms.** Interactive elements acknowledge presses immediately.
- Impact: L-M. Effort: L. Foundation: AnimatedButton.

**H-4. Distance-scaled durations enforced.** 80/120/200/280ms discipline via EDL tokens.
- Impact: L. Effort: L. Foundation: EDL motion tokens.

**H-5. Confetti-rare delight.** A once-only, earned celebration for completing a close cycle.
- Impact: L (brand feel). Effort: L. Foundation: motion system.

## 16.10 Opportunity Impact Matrix

| Group | Opportunities | Priority |
|---|---|---|
| A — Operator Loop | Peek, highlight-act, in-place approvals, status track, split triage | P0 (build first) |
| B — Command & Keyboard | Palette school, jump vocabulary, queue keys, esc/undo | P0 |
| C — Review Surface | Requires-me queue, triage discipline, snooze-reason, close-cycle | P1 |
| D — Views & State | Saved views, filter chips, global freshness, empty states, density | P1 |
| E — Detail & Records | Invoice three-zone, audit timeline, affordances, blockage, threads | P1-P2 |
| F — Architecture | Local-first views, cell re-render, warm start, deltas, keyboard standard | P2 (long horizon) |
| G — Governance | Governance-as-interface, opinionated defaults, business-unit workflows | P1-P2 |
| H — Micro-polish | Catalog build list, skeletons, press feedback, durations | P2 (cheap wins) |

## 16.11 The One-Sentence Opportunity Statement

**Perionyx's fastest path to "the Linear of finance" is the operator loop: keyboard-first lists, peek-while-acting, in-place approvals, a "requires me" review surface, and visible governance — all over the existing 21A domain layer and EDL design system.**
