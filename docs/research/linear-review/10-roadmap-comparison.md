# Section 18 — Roadmap (100+ Item Action Plan)

## 18.1 How to Read This Section

This is the actionable plan: a ranked, phased sequence of the opportunities from Section 16, mapped to waves. Each item cites its opportunity ID (A-1, B-2, etc.), its principle (P-#), and its rough effort. The waves are ordered by impact-per-effort and by dependency (foundations first). Every item is something Perionyx can build on existing infrastructure — no item requires a net-new platform before it starts.

**Wave 0 — Foundations (no new features; the standard).**
**Wave 1 — The Operator Loop (P0, 6-8 weeks).**
**Wave 2 — The Review Surface (P1, 6-8 weeks).**
**Wave 3 — Views, Records, and Governance (P1-P2, 6-10 weeks).**
**Wave 4 — Architecture (P2, long horizon, overlaps).**
**Wave 5 — Micro-Interaction Polish (P2, 2-4 weeks, parallel anywhere).**

## 18.2 Wave 0 — Foundations (the standard before features)

| # | Item | Source | Effort |
|---|---|---|---|
| 1 | Adopt the top-10 principles (17.14) as a UX review checklist | P-* | L |
| 2 | Define keyboard/click zones per screen type (list/detail/form/dialog) | 10.5 | L |
| 3 | Add "optimism for views, certainty for money" to the constitution's UI guidance | 9.3 | L |
| 4 | Adopt the 60/100/200/280ms duration discipline via EDL tokens | 8.1 | L |
| 5 | Require keyboard-first design in the component review checklist | 10.9 | L |

## 18.3 Wave 1 — The Operator Loop (P0, 6-8 weeks)

| # | Item | Opportunity | Principle | Effort |
|---|---|---|---|---|
| 6 | Row highlight model (`j`/`k`, enter, x, esc) on EnterpriseTable | A-2 | 44,45 | M |
| 7 | Peek preview (space) for exception queue rows | A-1 | 80,81 | M |
| 8 | Peek preview for approval queue rows | A-1 | 80,81 | M |
| 9 | Peek preview for ledger rows | A-1 | 80,81 | M |
| 10 | In-place approve/reject/delegate on queue rows | A-3 | 48,67 | M |
| 11 | Approval status track on the invoice record | A-4 | 68 | L-M |
| 12 | Split view (list + detail) for approval triage | A-5 | 74 | M |
| 13 | CommandPalette shows shortcuts beside commands | B-1 | 41 | L |
| 14 | CommandPalette contextual ranking + fuzzy match | B-1 | 39,40 | L |
| 15 | Finance jump vocabulary (`g`/`o` destinations) | B-2 | 42 | L |
| 16 | Queue-keyboard actions (single keys in list context) | B-3 | 39 | L |
| 17 | Universal `esc` + focus restoration audit | B-4 | 48 | L |
| 18 | Undo extended to list/detail mutations (audited) | B-5 | 85 | M |
| 19 | Checkbox-reveal-on-hover + selection count + floating action bar | 5.5 | 57,58 | M |
| 20 | Bulk financial actions (batch-approve, batch-assign) via the bar | A-3 | 59 | M |

## 18.4 Wave 2 — The Review Surface (P1, 6-8 weeks)

| # | Item | Opportunity | Principle | Effort |
|---|---|---|---|---|
| 21 | "Requires me" queue (finance Inbox): auto-subscribed approvals/exceptions/mentions | C-1 | 93,94 | M-H |
| 22 | Act-in-place from the requires-me queue | C-1 | 93 | M |
| 23 | Snooze-with-reason on approvals/exceptions (audited) | C-3 | 95 | M |
| 24 | Urgency-tiered digests (critical immediate, routine digest) | C-1 | 96 | M |
| 25 | Deep-link handoff from digest to the actionable record | C-1 | 98 | L |
| 26 | Triage discipline: every exception gets a decision | C-2 | 30 | M |
| 27 | Exception decision queue UI (assign/resolve/snooze/reject/archive) | C-2 | 30,93 | M |
| 28 | Grouped notifications by object (invoice/exception) | C-1 | 97 | M |
| 29 | Read-state explicit (unread dots, mark-all-read) | C-1 | 103,101 | L |
| 30 | Empty "nothing requires you" state, calm | C-1 | 99 | L |

## 18.5 Wave 3 — Views, Records, Governance (P1-P2, 6-10 weeks)

| # | Item | Opportunity | Principle | Effort |
|---|---|---|---|---|
| 31 | Saved views over the work queue and ledger (save/share/favorite/subscribe) | D-1 | 29,61 | M |
| 32 | Filter chips with live result counts | D-2 | 60 | L |
| 33 | Global freshness/sync indicator in chrome | D-3 | 23 | L |
| 34 | Empty states as invitations (create/clear/see-how) | D-4 | 38,64 | L |
| 35 | Per-user density persistence | D-5 | 63 | L |
| 36 | Invoice Detail three-zone restructure (content/state/history) | E-1 | 66 | M-H |
| 37 | State sidebar as editable controls (status track, match status, exception flags) | E-2 | 67 | M |
| 38 | Audit timeline as scannable surface (per-type icons, actors) | E-2 | 71 | M |
| 39 | Unset fields as affordances ("+ Add GL code") | E-3 | 69 | L |
| 40 | Relations with visible blockage (PO/GRN/evidence) | E-4 | 70 | M |
| 41 | Cross-department comment threads on records | E-5 | 72 | M |
| 42 | Governance-as-interface: approval matrix visible on the record | G-1 | 125 | M |
| 43 | Opinionated approval defaults (safe default shipped) | G-2 | 6,7 | L |
| 44 | Restrict safety-semantics configuration (SoD/audit/reconciliation invariants) | G-3 | 6,7 | L |
| 45 | Business-unit workflows (per-entity statuses, exception policies, matrices) | G-4 | 28 | M |
| 46 | Close-cycle view with scope vs actuals and health | C-4 | 31 | H |
| 47 | Recurring items (recurring reconciliations, close checklists) | 15.12 | 31 | M |
| 48 | Automation affordances (auto-assign exceptions, auto-flag high-value) | 15.12 | 27 | M |
| 49 | Template library per business unit (invoice/exception intake) | 15.12 | 36 | L |
| 50 | Schedule the EDL/UX reset as a funded recurring program | G-5 | 8 | L (governance) |

## 18.6 Wave 4 — Architecture (P2, long horizon, overlaps Waves 1-3)

| # | Item | Opportunity | Principle | Effort |
|---|---|---|---|---|
| 51 | Local-first views layer (representational state from cache; background sync) | F-1 | 11,12 | H |
| 52 | Cell-level re-render (badge flips without row re-render) | F-2 | 16 | M |
| 53 | Warm-start from last-known-good (render cached, verify auth after) | F-3 | 14,21 | M |
| 54 | WebSocket delta broadcast for financial views (permission-checked) | F-4 | 11 | H |
| 55 | Service-worker precache of the app shell | F-5 | 22 | M |
| 56 | Keyboard-first as the architecture standard for new screens | F-5 | 39 | L (standard) |

## 18.7 Wave 5 — Micro-Interaction Polish (P2, 2-4 weeks, parallel)

| # | Item | Source | Effort |
|---|---|---|---|
| 57 | Hover-reveal checkbox + selection commitment on all lists | 14.3 | L |
| 58 | Filter-chip pop/remove micro-motion | 14.8 | L |
| 59 | Toast-undo reverse animation | 14.11 | L |
| 60 | Status-track step-forward motion | 14.6 | L |
| 61 | Layout-accurate skeleton rows everywhere | H-2 | L |
| 62 | 60ms press feedback on all interactive elements | H-3 | L |
| 63 | Empty-state illustrations, brand-consistent | 14.12 | L |
| 64 | Cycle/close completion celebration (once, earned) | H-5 | L |
| 65 | Priority/urgency pulse on first set | 14.3 | L |
| 66 | Avatar assign pop + hover identity | 14.3 | L |
| 67 | Activity event-type icon animation | 14.6 | L |
| 68 | Grouped-notification expand | 14.7 | L |
| 69 | Snooze re-surface pulse | 14.7 | L |
| 70 | Drag pre-commit targets (board/queue reorder) | 14.3 | M |

## 18.8 Wave 6 — The Linear-Native Long Game (P3, 4-8 weeks after Waves 1-3)

| # | Item | Source | Effort |
|---|---|---|---|
| 71 | Peek on command palette results | 8.4 | L |
| 72 | Rapid invoice capture mode (stacked creates with context inheritance) | 5.2 | M |
| 73 | Issue-like templates for exceptions and adjustments | 15.12 | L |
| 74 | View subscriptions (watch an aging report or exception filter) | 4.6 | M |
| 75 | `@`-mention filters built from search | 6.4 | L |
| 76 | Exact-ID global jump (type an invoice ID anywhere) | 6.2 | L |
| 77 | Triage "decision queue" badge counts on the shell | 5.8 | L |
| 78 | Duplicate detection rendered as a visible relation | 15.12 | M |
| 79 | Blocked-by propagation onto the queue (visible blockage) | 7.4 | M |
| 80 | Offline-tolerant read cache for financial views (reads only) | 15.14 | H |
| 81 | Per-entity dashboard projections (views over one truth) | 4.6 | M |
| 82 | Export/view parity: every view exports CSV/XLS with the same filters | 15.14 | M |
| 83 | Initiative health (on-track/at-risk/off-track) for close programs | 15.12 | M |
| 84 | Keyboard help (`?`) as a complete, searchable reference | 10.2 | L |
| 85 | Slide-out mobile queue review (Peek pattern on mobile) | 8.4 | M |
| 86 | Natural-language snooze ("after the statement arrives") | 14.7 | M |
| 87 | Comment threads embedded in the audit timeline | 7.5 | M |
| 88 | Multi-workspace/tenant switcher keyboard-reachable | 3.2 | L |
| 89 | Shared views with read-only share links | 4.6 | M |
| 90 | Activity-filter by actor/event type on records | 7.5 | L |
| 91 | In-context progressive hints for new features | 14.12 | L |
| 92 | Search ranking by recency + relevance in financial search | 15.14 | M |
| 93 | Global command palette "act on selection" scoping | 5.5 | M |
| 94 | Board/timeline transformations of the work queue | 4.6 | M |
| 95 | Recurring issue reminders (recurring reconciliations) | 15.12 | M |
| 96 | Automated exception triage suggestions (AI-assisted decision queue) | 15.12 | H |
| 97 | In-flight mutation states on money actions ("Confirming with bank…") | 9.3 | M |
| 98 | Bulk archive with retention policy (audit-safe) | 15.13 | M |
| 99 | View-diff: compare saved views across time (the finance "version diff") | 4.6 | M |
| 100 | Per-operator density + keyboard preference roaming | 10.9 | M |
| 101 | The requires-me queue as the shell's default home | 13.4 | L |
| 102 | Audit-timeline exports screen-reader-friendly | 12.5 | L |
| 103 | A "where did I leave off" recovery surface on return | 5.9 | M |
| 104 | The operator-loop benchmark: clear 50 exceptions in <5 minutes | A-* | — |
| 105 | The speed benchmark: warm open of ledger <200ms (P90) | 9.6 | — |

## 18.9 Verification Gates

- **Wave 1 exit**: queue review at ≤2s/record via Peek + keyboard; approvals actable in place; palette shows shortcuts; `esc` returns focus everywhere.
- **Wave 2 exit**: requires-me queue live with snooze-reason and tiered digests; exceptions get decisions; notification read-state explicit.
- **Wave 3 exit**: saved views over queue/ledger; invoice detail in three zones; audit timeline scannable; approval matrix visible on records.
- **Wave 4 exit**: representational screens render from local cache; cell-level re-render; warm-start shows last-known-good.
- **Wave 5 exit**: micro-interaction catalog partially shipped; no decorative motion; reduced-motion respected.
- **Overall exit**: 135 principles adopted as the design review checklist; operator loop demonstrable in a 2-minute demo.

## 18.10 The Roadmap's Shape

The roadmap is deliberately **interface-first**: Waves 1-3 ship on existing infrastructure (EnterpriseTable, 21A services, notifications, EDL) and produce visible operator value within ~20 weeks. Wave 4 (architecture) runs alongside, because the highest-ROI architecture move (local-first views for representational state) is safe and independent of money mutations. Nothing in the roadmap requires Linear's exact tech stack — the patterns transfer, the boundaries (optimism-for-views / certainty-for-money) protect financial integrity.

---

# Section 19 — Stripe vs Linear: The Complete Comparison

## 19.1 Why Compare the Two

Perionyx's design research program has now studied the two most influential product-design references in modern software: **Stripe** (financial trust and calm) and **Linear** (engineering speed and interaction craft). They are complementary extremes. This section produces the synthesis: what each proves, where they conflict, and how Perionyx should choose between them per domain.

## 19.2 The Head-to-Head

| Dimension | Stripe Dashboard | Linear | Perionyx Synthesis |
|---|---|---|---|
| **Primary emotion** | Confidence ("your money is safe") | Momentum ("you are moving fast") | Both: confidence first, then momentum |
| **Target user** | CFO, finance operator, platform owner | Developer, PM, product team | Finance operator (controller/treasurer/CFO) |
| **Core primitive** | The transaction / the dashboard metric | The issue | The invoice (AP) / the approval (workflow) |
| **Density approach** | Generous whitespace, calm, restrained | Dense, aligned, saturated-only-for-meaning | Dense financial tables, calm chrome |
| **Palette** | Light-first, near-white surfaces, restrained color | Dark-first brand, muted neutrals, earned saturation | Dark-first (EDL `#0a0a0f`), gold accent |
| **Typography** | Custom "Stripe" sans + mono for amounts | Inter + JetBrains Mono | Inter + JetBrains Mono (already EDL) |
| **Number treatment** | The hero: large, tabular, contextual | Compact; estimates/IDs in mono | Money is always the hero, tabular, source-labeled |
| **Speed model** | Server-rendered calm; cache headers; stale-while-revalidate | Local-first optimistic; batched sync; instant | Views local-first; money server-confirmed |
| **Trust mechanism** | Source, freshness labels, audit trails, statuses | Sync indicator, undo, consistency | Both, plus append-only audit (Perionyx's own) |
| **Input model** | Mouse + keyboard; keyboard secondary | Keyboard-first; mouse discoverable | Keyboard-first for queues; mouse+form for entry |
| **Guidance model** | Guided setup, onboarding, readiness | Thin onboarding; learn-by-using | Perionyx keeps guided onboarding (finance needs it) |
| **Opinionation** | Strong but polite; config where needed | Strong and explicit; refuses where chaotic | Strong for safety; configurable for legitimate variance |
| **Evidence process** | Product-led, data-aware | Taste-led, no A/B | Evidence-driven (Perionyx constitution) |
| **Emotional register** | Calm authority | Quiet intensity | Calm authority with quiet intensity |
| **Signature pattern** | The dashboard metric card with drill-down | The list-detail Peek with keyboard walk | The financial metric card AND the exception Peek |
| **Weakness it proves** | Can feel slow/complex at high density | Can feel terse/cold; thin onboarding | Marry the two: dense + calm + guided |

## 19.3 Where They Agree (the shared canon)

Where Stripe and Linear converge, Perionyx treats the convergence as settled doctrine:

1. **Clarity over decoration.** Both are restrained; neither uses gratuitous visual effects. → EDL restraint confirmed.
2. **Numbers must be legible and scannable.** Stripe's amounts are the hero; Linear's IDs are tabular mono. → Money columns: tabular figures, source labels.
3. **Speed is a first-class design value.** Stripe: cache headers, fast dashboards. Linear: local-first. → Perionyx's "CFOs don't wait" is validated by both.
4. **State must be honest.** Stripe: freshness/stale labels. Linear: sync indicator. → Perionyx's DataFreshnessIndicator doctrine confirmed by both.
5. **The chrome is minimal.** Both keep navigation chrome small. → EDL chrome budget.
6. **One accent, used rarely.** Stripe's purple; Linear's indigo. → Perionyx's gold.
7. **Empty states are invitations.** Both convert voids into actions.
8. **Undo/confirmation for destructive actions.** Both treat destruction as exceptional.
9. **Progressive disclosure of complexity.** Both reveal power only as needed.
10. **Consistency of primitives.** Stripe's consistent objects; Linear's single primitive.

## 19.4 Where They Conflict (the synthesis decisions)

| Conflict | Stripe's answer | Linear's answer | Perionyx decision |
|---|---|---|---|
| Dark vs light first | Light (calm, familiar, "bank") | Dark (brand, night, "builder") | **Dark-first** (EDL): finance professionals work at night and at speed; dark density reads better |
| Server-rendered vs local-first | Server with cache headers | Local-first optimistic | **Hybrid**: views local-first; money server-confirmed (the boundary is the money) |
| Guided vs learn-by-using | Guided (setup, readiness) | Thin (learn by using) | **Guided**: finance onboarding is compliance-critical; keep the wizard |
| Keyboard primary vs secondary | Keyboard secondary | Keyboard primary | **Keyboard-first for queues/decisions; form-first for entry** (zone discipline) |
| Evidence vs taste | Data-informed | Taste-based | **Evidence-driven with taste discipline**: evidence sets direction, taste sets craft |
| Whitespace generosity | Generous, calm | Dense, efficient | **Dense where operational (lists/queues), generous where deliberative (detail/approval)** |
| Status communication | Badges, statuses, labels | Icons + color, legend-free | **Icons + color + explicit labels** (auditors need labels) |
| Reports vs operator flow | Reporting-rich | Operator-first | **Operator flow first, reports second** (Linear's stance; Perionyx keeps reports accessible) |

## 19.5 The Perionyx Positioning Statement

**Perionyx is the Linear of finance: the interaction velocity and density craft of Linear, fused with the financial trust, freshness, and audit clarity of Stripe — and the constitutional restraint of EDL.**

Where Stripe says "your money is safe" and Linear says "you are moving fast," Perionyx says **"your money is safe, and you are moving fast."** The two statements are not in tension — they are sequential: confidence is the precondition, momentum is the experience. Perionyx's design work should therefore:

1. **Borrow Stripe's trust layer** (freshness, sources, audit, calm authority) for everything financial.
2. **Borrow Linear's craft layer** (keyboard, peek, density, local-first views, micro-motion) for everything operational.
3. **Apply the boundary rigorously**: the trust layer governs money; the craft layer governs views. Never the reverse.

## 19.6 The One-Page Synthesis

| Perionyx Screen | Trust Layer (from Stripe) | Craft Layer (from Linear) |
|---|---|---|
| **Dashboard** | Metric cards with source + freshness + drill-down | Metrics render first; command palette; keyboard nav |
| **Approval queue** | Approval matrix visible; audit; server-confirmed actions | Peek, `j`/`k`, in-place approve, floating action bar |
| **Exception queue** | Triage with decisions; audit trail; explainability | Decision queue UI, snooze-with-reason, split view |
| **Ledger** | Tabular money, source, freshness, export parity | Virtualized rows, cell re-render, highlight/select, saved views |
| **Invoice detail** | Three zones; provenance; append-only timeline | Status track, editable state sidebar, relations with blockage |
| **Requires-me (Inbox)** | Approvals auto-routed; audited deferrals | Decision queue, snooze, urgency digests, read-state |
| **Close-cycle view** | Close checklist; scope vs actuals; audit | Cycle burndown, initiative health, once-only celebration |
| **Search** | One global index over financial objects | Fuzzy highlight, exact-ID jump, keyboard results |

## 19.7 The Research Program Verdict

After two products, the program has its shape:

- **Stripe taught Perionyx what to be** (calm, confident, trust-first) and gave the financial operator's control surface as the benchmark.
- **Linear taught Perionyx how to feel** (fast, dense, keyboard-native, opinionated) and gave the interaction craft standard as the benchmark.
- **The synthesis is the product**: Perionyx is the enterprise financial operating system that a CFO trusts like a bank and operates like a power tool.

The next product in the research program should test a different axis — a data-heavy analytical surface (e.g., a trading terminal, an observability platform, or a BI tool) to complete the trio: **trust (Stripe), velocity (Linear), and insight (next).**
