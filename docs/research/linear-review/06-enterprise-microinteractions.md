# Section 13 — Enterprise UX Translation

## 13.1 The Framing Problem

Linear is not an enterprise product in the compliance sense — no audit trails for financial movements, no SOC 2 narrative for cash operations, no approval matrices for spend. But Linear *is* enterprise software in the operational sense: it is used by some of the world's largest and most demanding product organizations, at multi-thousand-employee scale, on workspaces with hundreds of thousands of issues. Its enterprise credibility comes from **speed at scale, reliability, and workflow discipline** — not from compliance features.

The enterprise lessons Perionyx should extract are therefore *operational*, not regulatory:

1. **Scale is a UX feature.** Linear's 4,000-issue workspaces prove that performance at data volume is a design property, not a footnote. Perionyx's ledger, at millions of entries, demands the same standard.
2. **Reliability is trust.** The sync engine's conflict resolution and the always-visible sync indicator answer the operator's unspoken question — "is my work saved?" — before it is asked.
3. **Workflow discipline is governance.** Triage, cycles, and team-level workflows are *governance mechanisms* expressed in UX, not in settings. Perionyx's approval matrices and exception queues are the financial equivalents and should be equally visible and enforced.

## 13.2 The Enterprise/Consumer Divide (and Linear's Resolution)

Enterprise software typically fails in one of two directions: **feature sprawl** (Jira — everything configurable, nothing fast) or **consumer shallowness** (tools that feel good but can't carry real work). Linear resolves the divide by refusing both:

- **Against sprawl**: opinionation (one really good way), the single primitive, team-scoped workflows, shallow sidebar. The product *limits* what you can configure to keep the default sane.
- **Against shallowness**: the product carries genuinely heavy workloads — millions of issues, deep nesting, complex filter combinations, real-time multi-user collaboration, API/graph/github integrations. The simplicity is a *surface* over a deep system, not a thin product.

The lesson for Perionyx is the shape, not the features: **enterprise confidence = opinionated defaults + deep capability behind them + honest state.** A CFO does not need fifty dashboard widgets; she needs the five right ones rendered from real data with visible provenance.

## 13.3 Governance by Interface, Not by Settings

The most transferable enterprise insight: Linear enforces governance *in the workflow surface*, not in an admin panel.

| Governance Area | Jira (admin-panel model) | Linear (interface model) | Perionyx Application |
|---|---|---|---|
| Workflow definition | Global workflow schemes in admin | Team-level statuses, visible as the status track | Approval matrix as a visible track on the invoice |
| Intake discipline | Rules engine, often misconfigured | Triage queue, enforced per team | Exception queue = decision queue |
| Backlog health | Boards accumulate; Jira encourages | Focused backlog doctrine, pruning | Exception/aging reports as a doctrine, not a feature |
| Time discipline | Sprint plugins | Cycles as first-class views with burndown | Close-cycle views with scope vs actuals |
| Notifications | Deep, per-user config (and chaos) | Opinionated Inbox + snooze | Requires-me queue, non-configurable into incompleteness |

The pattern: **governance that lives in the interface is visible, enforced, and trusted; governance that lives in settings is hidden, ignorable, and drifts.** Perionyx should render its approval matrix, segregation-of-duties, and exception policies *as visible interface states* (on the record, in the queue) rather than as background rules.

## 13.4 The Inbox → "Requires Me" for Finance

Linear's Inbox model is the enterprise notification pattern Perionyx needs, translated to finance:

- **Auto-subscription**: you receive what you created/are assigned/are mentioned in. Perionyx translation: *you receive approvals routed to you, exceptions you own, and mentions in records you touched.*
- **Decision queue, not log**: every Inbox item is actionable in place (peek, act, snooze). Perionyx translation: *the approval queue acts, it does not merely list.*
- **Snooze with a reason**: deferral is explicit and resurfaces. Perionyx translation: *defer an approval until the supporting document arrives; defer an exception until the bank confirms — with the reason attached for audit.*
- **Urgency-tiered digests**: immediate for critical, digest for routine. Perionyx translation: *threshold-crossing alerts are immediate; routine approval roundups are a digest.*

This is the single most productizable enterprise idea in the Linear review for Perionyx's "requires me" surface.

## 13.5 The Operator Loop: Linear as the Model for AP Triage

Mapping Linear's core loop to Perionyx's AP workflow (from Phase 27.0A's 10 stages):

| Linear Construct | AP Equivalent | Interaction Model to Copy |
|---|---|---|
| Issue | Invoice | One primitive; consistent shape everywhere |
| List | Work queue (H-01 canonical) | Highlight → peek → act (Section 8.4) |
| Status track | Approval/matching state | Sequential visible track, click to advance |
| Triage queue | Exception queue | Decision queue with per-item resolution |
| Inbox | Approvals requiring me | Review → read → snooze → act |
| Peek | Invoice preview | Space-bar quicklook with evidence |
| Command palette | Global financial actions | Approve/reject/delegate from anywhere |
| Custom views | Saved queries (aging, blocked, high-value) | Projections over one truth |
| Cycles | Close cycles, approval SLAs | Time-boxed views with burndown |
| Comments | Cross-department notes | Chronological, attributed, embedded evidence |
| Activity timeline | Audit trail | Scannable event taxonomy (Section 7.5) |
| Labels | GL codes, categories, entities | Cross-cutting taxonomy for filtering |
| Relations | PO/GRN/approval/payment links | Parent/blocked-by with visible propagation |
| Assignee | Approval owner / exception owner | Avatar + name, hover for identity |
| Estimate | Invoice amount | The money as the "estimate" column |
| Priority | Risk severity / urgency | Icon-coded, legend-free |

## 13.6 What Must NOT Transfer (the Rejection List)

1. **Optimistic money mutations** — rejected outright (Section 9.3). Approvals and payments commit server-side with audit and idempotency.
2. **The no-A/B/no-PM product process** — rejected for Perionyx's market (Section 2.3/2.4). Finance is evidence-driven.
3. **The non-customizable-everything stance** — modified: Perionyx must configure approval thresholds, currency, GL structure; it should *not* configure safety semantics (SoD, audit, reconciliation invariants) into unsafeness.
4. **The thin onboarding** — rejected. Finance onboarding is compliance-critical; Perionyx's setup wizard and readiness program are correct and must stay.
5. **In-memory stores** — rejected (already known debt). Linear's local-first is a *client* cache over server truth; Perionyx's in-memory module stores have no server truth yet. The Phase 26.x direction (persist before optimize) stands.
6. **Color-only status differentiation** — rejected (Perionyx mandates icon + color, Section 12).

## 13.7 The Enterprise UX Scorecard

Scoring Linear as a *reference for enterprise UX* (not as an enterprise product):

| Enterprise Dimension | Linear | Perionyx Target | Gap to Close |
|---|---|---|---|
| Performance at scale | A+ | A+ (constitution: CFOs don't wait) | Local-first views layer |
| Reliability/state honesty | A (sync indicator) | A (DataFreshnessIndicator) | Global chrome indicator |
| Workflow discipline | A (triage/cycles/teams) | B (rules exist; visibility partial) | Render governance as interface |
| Governance by interface | A | C (approval matrix is a config, not a track) | Visible status tracks on records |
| Configurability discipline | A (opinionated) | B- (sprawl risk in enterprise settings) | Restrict safety-semantics config |
| Onboarding | C (thin) | A (wizard + readiness) | Keep; do not Linear-ize |
| Auditable decision trail | B (activity timeline) | A (append-only audit) | Port timeline *UX* onto audit |
| Compliance posture | D (not relevant) | A (SOC2/PCI/GDPR work) | Keep Perionyx's posture |
| **Composite** | **B+** | **A-** | Borrow operational craft; keep regulatory craft |

## 13.8 Enterprise UX Rules (Condensed)

1. Scale is a UX feature: performance at data volume is designed, not patched.
2. Reliability is trust: answer "is it saved?" before it's asked.
3. Governance lives in the interface, not in settings.
4. The review queue is a decision queue, not a log.
5. Snooze/deferral is explicit, with a reason for accountability.
6. The operator loop is highlight → peek → act; the mouse is optional.
7. Opinionated defaults + deep capability behind them = enterprise confidence.
8. Reject what the domain forbids (optimistic money, thin onboarding, unsafe configurability).
9. Every number has a source; every state has an explanation (Perionyx constitution).
10. Port Linear's operational craft; keep Perionyx's regulatory craft.

---

# Section 14 — Micro-Interactions Catalog (100+)

## 14.1 The Micro-Interaction Standard

Linear's micro-interaction design follows the motion system described in the Phase 8B.7 sibling research: **durations scale with distance (80ms color → 280ms modal), easing is tuned per interaction type, and only GPU-composited properties animate (transform/opacity).** The catalog below documents 100+ observed micro-interactions, grouped by domain, each with its interaction purpose and the Perionyx translation.

## 14.2 Command Palette Micro-Interactions (10)

1. **Palette open** — 120ms scale+fade from the trigger; the palette "grows" from the top of the viewport, anchoring identity.
2. **Query typing** — results re-rank live (debounced ~80ms), with the selected row following the query; no flash of the old list.
3. **Result highlight** — 60-100ms background tint shift; the highlight *moves* with the arrow keys, never blinks.
4. **Result open** — 150-200ms: palette fades, target view transitions in (never a page reload).
5. **Empty query** — palette shows recent items + suggested actions (the "always something useful" rule).
6. **No-match** — inline "no results" with typo-tolerant suggestions; `esc` clears and reopens at root.
7. **Shortcut labels** — hover on any command dims the shortcut; the label is always visible (the teacher pattern).
8. **Fuzzy highlight** — matching letters in results render with an accent underline/highlight, showing *why* the result matched.
9. **Create from palette** — typing `c` from the palette transfers focus to the creation popover (zero-gap flow).
10. **Palette close** — 100ms fade; focus returns to the prior element (focus restoration discipline).

**Perionyx translation:** CommandPalette should adopt open/query/highlight/open micro-states, fuzzy-match highlighting, shortcut labels, and focus restoration.

## 14.3 List Row Micro-Interactions (14)

11. **Row highlight** — 60ms tint shift on `j`/`k`; the highlight is a *tracking* state, never a flash.
12. **Row hover** — 80ms: row background lifts one step; checkbox zone appears; overflow actions fade in.
13. **Checkbox reveal** — 80ms fade on hover/focus; the checkbox *occupies no layout space* until revealed (density preserved).
14. **Selection** — 100ms: accent border + background, count appears in floating bar (the commitment read).
15. **Range selection** — rows fill progressively with a wave-like tint as the range extends.
16. **Deselect** — 60ms: accent bleeds out; count updates in the floating bar.
17. **Inline status change** — the chip's icon and color swap in 120ms; a subtle "pop" (scale 1.05→1.0) marks the state change.
18. **Priority set** — icon animates in (up/down arrows slide); urgent uses a *red pulse* on first set (importance encoding).
19. **Assignee set** — avatar pops in with a 100ms scale; the empty-slot affordance disappears.
20. **Due-date overdue flip** — the date text transitions to red with a 200ms color shift (warn-once, not constant alarm).
21. **Label chip add** — chip slides in with a 120ms stagger as labels accumulate.
22. **Row drag pick-up** — 100ms scale-up + shadow; the row "lifts" from the list.
23. **Row drag drop** — momentum-aware settle (fast drags travel further, slow drags settle locally) with a target-line highlight before commit.
24. **Manual reorder** (`alt+shift+arrows`) — rows slide in sequence; the gap animates before the row moves (preview-then-commit).

**Perionyx translation:** EnterpriseTable rows should adopt reveal-on-hover affordances (checkbox, actions), selection "commitment" states, and inline chip/status micro-motion — all GPU-composited.

## 14.4 Peek Micro-Interactions (8)

25. **Peek open** — 200ms slide-in from the right edge; the list content shifts (slight width reduction), never overlays silently.
26. **Peek walk** (`j`/`k`) — 120ms: the preview content cross-fades; the list highlight tracks in sync.
27. **Peek hold** — space held keeps it open; release closes (the "hover intent" made explicit).
28. **Peek toggle** — space tap latches it open/closed.
29. **Peek promote** — `enter`/shift+enter expands the preview to full detail with a 200ms scale/translate; the preview "becomes" the page.
30. **Peek close** — 150ms slide-out; the list never loses scroll position or highlight.
31. **Peek property edit** — fields in the preview are inline-editable; the property chip animates on commit.
32. **Peek on empty row** — nothing opens; a quiet "no row" flash (~60ms) signals the boundary.

**Perionyx translation:** the highest-value micro-interaction package in this catalog — build Peek for the exception/approval/ledger lists (Section 8.4).

## 14.5 Creation Micro-Interactions (10)

33. **Create popover open** (`c`) — 150ms scale from the trigger point; focus lands in the title field (zero-tab focus).
34. **Title typing** — live validation (required/too-long) inline; the Create button enables exactly when valid.
35. **Field shortcuts** — typing `s`/`p`/`a` in the popover focuses the corresponding field with a 60ms indicator flash.
36. **Type-ahead pickers** — avatar/label/project suggestions filter as you type; the top suggestion is pre-highlighted.
37. **Rapid creation** — after `enter`, a *new* popover opens pre-cleared with the same context (the stack-creator).
38. **Create from list** — inline creation at the list's end (an editable empty row); the row appears and takes focus.
39. **Create + open** — `cmd+enter` creates and opens detail in one gesture.
40. **Create cancel** — `esc` closes; any typed content is preserved if reopened (no data loss).
41. **Context inheritance** — the popover pre-fills from the current view (team/project/cycle); fields that are pre-filled don't flash (they're just there).
42. **Duplicate create** — an issue created as a duplicate opens the parent and links it (relation micro-state).

**Perionyx translation:** invoice/exception intake should be a context-inheriting rapid-entry popover, not a thirty-field form page.

## 14.6 Detail View Micro-Interactions (12)

43. **Detail open** — 200ms route transition; the detail "expands" from the list row's position (spatial continuity).
44. **Title inline edit** — click → input replaces text in place; `enter` commits, `esc` reverts; 60ms focus ring.
45. **Description focus** — the composer expands from one line to full editor with a 200ms height animation (progressive disclosure of the editor).
46. **Status track click** — the clicked status button fills and the prior empties; a 120ms "step forward" motion.
47. **Priority buttons** — hover previews the icon; click commits; urgent pulses red once.
48. **Avatar assign** — picker pops 150ms; selection swaps the avatar with a 100ms scale.
49. **Labels picker** — chips filter as you type; selected chips animate to the issue's label zone (transfer animation).
50. **Date popover** — calendar opens 150ms; a selected date highlights; the chip updates with a pop.
51. **Comment submit** — `cmd+enter`; the comment slides in 150ms, the composer resets, focus stays (continuity).
52. **Comment reaction** — emoji pops in with a 100ms scale; the count updates.
53. **Activity event expand** — collapsed timeline rows expand with a 150ms height animation; per-type icons animate in.
54. **Relation block status** — a "blocked by" relation renders the blocking issue's status chip live; unblocking fades the red tint (the dependency read, updated live).

**Perionyx translation:** invoice detail's state sidebar should be a status track + inline-editable controls with micro-state feedback; the audit timeline should use per-event-type icon animation.

## 14.7 Inbox Micro-Interactions (10)

55. **Inbox row arrive** — new activity slides in at top with a 200ms enter; an unread dot pulses once.
56. **Unread/read flip** — `u` toggles the dot with a 150ms fade; the row dims when read.
57. **Snooze set** (`h`) — the snooze picker pops; selection animates the row to the snoozed section with a 150ms slide.
58. **Snooze re-surface** — at the snooze time, the row returns to the top with a gentle pulse (the reminder, not a nag).
59. **Mark all read** (`alt+u`) — dots fade in a wave from top to bottom (~200ms stagger).
60. **Inbox peek** — the row peeks without leaving the queue (Section 8.4 pattern).
61. **Inbox act** — status/assign actions run from the row; the row updates live, stays in queue until read (no jump-scrolling).
62. **Digest email** — urgency-tiered; the email links deep to the item (the cross-channel handoff).
63. **Grouped notifications** — same-issue events group; the group expands with a 150ms height animation.
64. **Empty inbox** — a calm, complete state ("You're all caught up") — an emotional micro-state, not a dead end.

**Perionyx translation:** the "requires me" approval queue with read/snooze/act and urgency-tiered digests (Section 13.4).

## 14.8 Filtering, Searching, and Views Micro-Interactions (12)

65. **Filter chip add** — chip pops in with a 100ms scale at the filter bar.
66. **Filter chip remove** — chip scales out; results update with a 150ms fade (no jump).
67. **Filter results count** — the count animates as filters change (the "what's left" read).
68. **Filter bar focus** — `cmd+f` focuses it with a ring; typing filters live.
69. **Search-as-you-type** — results re-rank with a 120ms cross-fade; recent searches appear under the caret.
70. **Search highlight** — matches render with accent highlight in results and in the opened record (the "why did this match" read).
71. **Exact ID search** — typing `LIN-123` jumps straight to the record (the power shortcut).
72. **View save** — `alt+v` captures the current filters/sort as a named view; a toast confirms with undo.
73. **View switch** — list/board/timeline/split/fullscreen transforms with a 200ms cross-fade; the same underlying set (projection, not reload).
74. **Grouping toggle** — group headers slide with counts; rows re-stagger into groups (~150ms stagger).
75. **Density toggle** — rows reflow with a 200ms height animation (compact ↔ comfortable).
76. **Column toggle** — columns slide out/in with a 150ms width animation; no layout jank.

**Perionyx translation:** saved-views layer over the work queue/ledger with filter chips, live counts, and projection switching (Section 4.6).

## 14.9 Board/Timeline/Split Micro-Interactions (8)

77. **Column drag** — column headers drag; the board re-flows the target gap before drop (pre-commit).
78. **Card move (board)** — the card lifts (shadow + scale), the target column highlights, the drop settles with momentum.
79. **Card archive sweep** — archiving a card animates a sweep/fade (the "gone" read, non-destructive).
80. **Timeline bar drag** — date bars stretch with live date feedback (the date read while dragging).
81. **Timeline dependency line** — blocked bars render a connecting line; unblocking fades it (the dependency read).
82. **Split walk** — detail pane updates with the highlight at 120ms cross-fade (Section 7.7).
83. **Split expand** — dragging the divider resizes both panes with a 60ms snap-lock at thirds.
84. **Fullscreen toggle** — the detail expands to full viewport with a 200ms scale; focus moves to the content.

## 14.10 Sidebar & Navigation Micro-Interactions (10)

85. **Sidebar collapse** — 200ms: the rail compresses to icons; destinations remain reachable (capability preserved).
86. **Favorite star** — star fills with a 120ms pop; the item appears at the top of Favorites (the "pinned" read).
87. **Sidebar drag reorder** — items swap with a 150ms slide; drop commits with a settle.
88. **Badge updates** — unread counts increment with a 200ms bounce (the "attention" read, once).
89. **Section collapse** — team sections collapse with a 200ms height animation; counts persist.
90. **Workspace switcher** — opens 150ms; workspace names + search filter; switching transitions the whole shell (200ms cross-fade).
91. **Breadcrumb-free navigation** — view title transitions on navigation with a 120ms fade/slide (the "where am I" read).
92. **Cmd+K from anywhere** — the palette opens over any state; the prior state is preserved on close (never loses place).
93. **Go-to shortcut** (`g i`, etc.) — destination view transitions with a 150ms slide; the sidebar's active state tracks.
94. **`?` help overlay** — opens 200ms with search focus; grouped shortcut reference (the "learn me" surface).

## 14.11 Feedback, State, and Error Micro-Interactions (10)

95. **Toast arrive** — 200ms slide-in from the bottom; auto-dismiss after ~3-5s with a fade; stacks with layout animation.
96. **Toast undo** — the undo button appears immediately beside the message; clicking reverts with a 150ms reverse animation.
97. **Skeleton rows** — shimmer sweep on layout-accurate skeletons (~1s loop); rows replace skeletons without layout shift.
98. **Sync status** — the connection dot transitions (synced green / syncing amber pulse / offline red) with a 200ms cross-fade; never modal.
99. **Inline error** — field error text slides in 150ms under the field with an icon; the field border tints (never a red screen).
100. **Retry affordance** — failed operations render a "Retry" inline with the error; retrying shows a spinner-in-place.
101. **Button in-flight** — "Syncing…" replaces the button label with a 100ms state swap; the button disables honestly.
102. **Modal open/close** — modals open 280ms (the slowest deliberate transition), close 200ms; backdrop blurs; focus traps; `esc` closes.
103. **Confirmation dialog** — destructive actions render a confirm with the destructive verb colored; cancel returns focus.
104. **The 60ms press** — every interactive element shows an active state within 60ms of press (the "acknowledged" threshold).

## 14.12 Delight and Signature Micro-Interactions (6)

105. **Empty state illustrations** — new-team/empty-project states use a small, brand-consistent illustration with a 300ms fade-in (delight on an empty screen).
106. **The confetti moment** — completing a cycle/winning state renders a subtle, once-only celebratory burst (rare, earned, never repeated).
107. **Keyboard hint flash** — pressing a shortcut shows a brief hint of the command name at first use ("Peek — hold space") (the tutor).
108. **First-use progressive hints** — new features surface a small, dismissible callout anchored to the actual control (in-context, not a modal).
109. **Drag-across urgency** — dragging an issue over an urgent label zone pulses the target red (the "danger zone" read).
110. **The settle** — every drop, toggle, and commit ends with a ~100ms ease-out settle that makes the interface feel mechanical-precise (the "engineered" feel).

## 14.13 Micro-Interaction Governance

The catalog is governed by three rules that prevent it from becoming noise:

1. **Motion must be earned.** A micro-interaction must communicate a state change, a cause-and-effect, or a boundary. Decorative motion is rejected.
2. **Durations scale with distance.** Color 80ms, inline 120ms, standard 200ms, modals 280ms. Nothing is slow by accident.
3. **Everything is GPU-composited and reduced-motion-aware.** Only transform/opacity animate; `prefers-reduced-motion` collapses the catalog to instant state changes.

These rules map 1:1 onto Perionyx's EDL motion tokens (Phase 22.0B: durations, easings, reduced-motion) and the MotionProvider (Phase 8B.7). The catalog above is the *specification* of what the tokens should express; Perionyx's motion system already has the vocabulary — this catalog provides the sentences.
