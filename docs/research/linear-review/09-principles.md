# Section 17 — Design Principles (100+)

## 17.1 How to Read This Section

The principles below are the distilled, Perionyx-actionable statements extracted from the Linear research. They are grouped by domain. Each is written as an imperative Perionyx principle (a rule to follow), with the Linear evidence in one line. They are the complement to Section 15's decisions: decisions are *specific choices*; principles are the *standing rules* that make future choices unnecessary. Perionyx's own EDL principles (Phase 22.0B) and constitution remain supreme; this section extends them with the Linear-derived canon.

## 17.2 Philosophy (1-10)

1. **Speed is the product, not a feature.** Linear: performance is architecture. Perionyx: CFOs don't wait.
2. **The tool works for you, not the other way around.** Linear: opinionated defaults. Perionyx: ship the safe workflow; don't make the operator design it.
3. **Simple first, then powerful.** Linear: complexity is earned. Perionyx: reveal fields by decision-need, not availability.
4. **Individual productivity outranks reporting completeness.** Linear: the operator's flow beats the manager's report. Perionyx: core screens serve the decision-maker's flow.
5. **Process is a cost, not a value.** Linear: minimize ceremony. Perionyx: reduce process friction; never reduce process integrity.
6. **Restricting choice is a user service when the choice creates disorder.** Linear: the Inbox is not customizable. Perionyx: safety semantics are not configurable into unsafeness.
7. **Opinionation earns trust through consistency.** Linear: one really good way, everywhere. Perionyx: the approval chain looks the same everywhere it appears.
8. **Design debt is intentional borrowing; schedule the payment.** Linear: 2-3 year resets. Perionyx: EDL/UX resets are funded line items.
9. **The product team's job is to make decisions, not hand them to the user.** Linear: taste-based, opinionated. Perionyx: the safe default is the default.
10. **The builders eat the dog food at full intensity.** Linear: employees use the product to build the product. Perionyx: operators' real workflows should run on the platform daily.

## 17.3 Architecture & Performance (11-25)

11. **The UI reads local; the server synchronizes.** Linear: IndexedDB as the UI's database. Perionyx: representational state from cache, reconciled in background.
12. **Optimism for views; certainty for money.** Linear: optimistic mutations. Perionyx: money commits server-side, idempotent, audited.
13. **Never make the user wait; acknowledge within 100ms.** Linear: the cause-and-effect threshold.
14. **First paint always shows something useful.** Linear: last-known-good beats a spinner. Perionyx: render cached state instantly, label freshness.
15. **Rendering is the performance bottleneck; window and diff.** Linear: 40 DOM rows for 4,000 issues; per-property reactivity. Perionyx: virtualize every high-volume list.
16. **Re-render the cell, not the row.** Linear: per-property observables.
17. **Animate only transform/opacity on the GPU.** Linear: composited motion. Perionyx: EDL motion rule.
18. **The page never reloads.** Linear: client-side routing. Perionyx: state transition, not page fetch.
19. **Batch the writes.** Linear: debounced mutation flush. Perionyx: sync-batch form auto-save.
20. **State is honest or labeled.** Linear: the sync indicator. Perionyx: freshness indicators everywhere data can be stale.
21. **Auth runs in the background, not on the critical path.** Linear: warm-start session check. Perionyx: render first, verify after (for representational screens).
22. **Precache the shell.** Linear: service-worker app-shell precache.
23. **Connectivity is a first-class UI state.** Linear: synced/syncing/offline. Perionyx: the operator always knows if what she sees is current.
24. **Measure perceptual thresholds, not just technical ones.** Linear: 60/100/200ms. Perionyx: the standard, not the optimization report.
25. **Scale is a UX feature.** Linear: 4,000-issue workspaces stay instant. Perionyx: the ledger stays instant at millions of rows.

## 17.4 Information Architecture (26-38)

26. **Minimize primitives; make the central one uniform everywhere.** Linear: the issue. Perionyx: the invoice in AP.
27. **Keep the hierarchy shallow.** Linear: workspace → team → object. Perionyx: tenant → business unit → financial object.
28. **Workflow governance belongs to the smallest unit that owns the work.** Linear: teams own statuses/triage/cycles. Perionyx: business units own approval matrices.
29. **Views are projections; they never change work.** Linear: views don't mutate data. Perionyx: dashboards over one truth.
30. **Give every inbound item a decision.** Linear: triage. Perionyx: the exception queue is a decision queue.
31. **Use time as a first-class dimension.** Linear: cycles, dates, SLAs. Perionyx: close cycles, approval SLAs, aging.
32. **Let users pin their favorites; keep the rest product-declared.** Linear: Favorites above Your Teams. Perionyx: user-pinned above, product-declared below.
33. **The second object inherits the first's infrastructure.** Linear: Documents inherit issues' nav/search. Perionyx: Decision Intelligence content inherits financial search.
34. **Search is the escape hatch; make it global and uniform.** Linear: `/` over everything.
35. **Refuse global config blobs.** Linear: anti-Jira. Perionyx: governance at the unit level.
36. **Structure taxonomies cross-cutting, not nested.** Linear: labels. Perionyx: GL codes, entities as labels.
37. **Milestones nest inside their parent.** Linear: milestones in projects. Perionyx: sub-structures nest in aggregates.
38. **Empty structures are invitations, not dead ends.** Linear: empty states with a primary action.

## 17.5 Navigation (39-50)

39. **The keyboard is the primary navigation surface.** Linear: the whole product is keyboard-first.
40. **The command palette is a navigation system, not a menu.** Linear: `Cmd+K` reaches everything.
41. **Show the shortcut beside the command; the palette teaches.** Linear: the palette is the tutorial.
42. **Two-tier mnemonics give a large vocabulary cheaply.** Linear: `g`/`o` + letter.
43. **Chrome is a tax; minimize it.** Linear: ~15% chrome. Perionyx: EDL restraint.
44. **Highlight, don't open.** Linear: `j`/`k` row navigation. Perionyx: the list stays the reference frame.
45. **Highlight and selection are distinct states with distinct visuals.** Linear: tint vs checkbox + border.
46. **Collapse reduces chrome, never capability.** Linear: icon rail keeps destinations.
47. **The header answers "where am I", not "what can I do".** Linear: thin header, palette for actions.
48. **`esc` is universal; every overlay closes and restores focus.** Linear: dialog discipline.
49. **Navigation never reloads; state is preserved on return.** Linear: scroll + highlight survive.
50. **The tenant switcher is top-level and keyboard-reachable.** Linear: workspace switcher.

## 17.6 Lists & Tables (51-65)

51. **Lists are the primary surface; boards are transformations.** Linear: the list is the truth.
52. **Density is a feature; reveal secondary data on hover.** Linear: compact rows, hover-reveal.
53. **Alignment is sacred; the eye scans columns.** Linear: field highways.
54. **Saturation is reserved for meaning.** Linear: muted palette, earned color.
55. **Encode meaning in icons that need no legend.** Linear: priority arrows, status icons.
56. **Tabular figures for number columns.** Linear: estimates align. Perionyx: money aligns.
57. **The checkbox zone is revealed on demand.** Linear: density preserved.
58. **Selection shows a count and a floating action bar.** Linear: commitment + point-of-action.
59. **Bulk actions appear exactly when selection commits — never before, never after.** Linear: the floating bar.
60. **Filter chips are additive, removable, and counted live.** Linear: the "what's left" read.
61. **Every list state is a saveable view.** Linear: save/share/favorite/subscribe.
62. **Group headers are sticky and counted.** Linear: grouping without losing orientation.
63. **Density modes are a product feature, persisted per user.** Linear: compact/comfortable.
64. **Empty results offer one-click recovery.** Linear: "No results" + clear filters.
65. **Skeletons match the final layout row-for-row.** Linear: no layout shift.

## 17.7 Detail Views (66-76)

66. **Separate content, state, and history into zones.** Linear: the three-zone issue page.
67. **Every state field is an editable control.** Linear: status track, chips, pickers.
68. **Render workflows as sequential tracks, not dropdowns.** Linear: status buttons.
69. **Every unset field is an affordance.** Linear: "+ Add" everywhere.
70. **Relations are visible and their blockage propagates.** Linear: blocked-by chips live.
71. **History is a scannable, attributed, chronological timeline.** Linear: per-type icons, actors.
72. **Comments coordinate on the record.** Linear: mentions, embedded evidence.
73. **Modal-free editing: commit on blur/enter; undo everything.** Linear: no save buttons.
74. **Support list+detail split for operational review.** Linear: Split view.
75. **Preserve list state when returning from detail.** Linear: scroll + highlight.
76. **The detail view answers one question per zone.** Linear: focus discipline.

## 17.8 Interaction & Motion (77-92)

77. **Every input is acknowledged within 60ms.** Linear: press feedback.
78. **Reactions complete within 100ms; slower work says so.** Linear: the cause-and-effect threshold.
79. **Durations scale with distance.** Linear: 80/120/200/280ms.
80. **Peek is the preview pattern: context-preserving, keyboard-walkable.** Linear: the space-bar quicklook.
81. **Peek beats open for review; open beats peek for work.** Linear: peek to decide, open to investigate.
82. **Direct manipulation communicates before commit.** Linear: pre-commit targets.
83. **Drag carries momentum that matches intent.** Linear: fast/slow drops.
84. **Context menus are scoped, labeled, keyboard-navigable.** Linear: right-click anywhere.
85. **Toasts carry the undo; destructive actions confirm.** Linear: undoable everything.
86. **Errors are inline, actionable, retryable.** Linear: never a dead-end dialog.
87. **Progress is honest and in-place.** Linear: in-flight buttons.
88. **Motion must be earned; decorative motion is rejected.** Linear: the governance rule.
89. **Reduced motion collapses all motion to instant states.** Linear: accessibility by design.
90. **Every interaction is reachable by mouse and keyboard with equal speed.** Linear: no mouse-only capability.
91. **Creation inherits context.** Linear: pre-filled from the view. Perionyx: pre-filled from the vendor/PO/entity.
92. **Rapid entry is a first-class flow.** Linear: stacked creates. Perionyx: batch capture.

## 17.9 Communication & Review (93-105)

93. **The review queue is a decision queue, not a log.** Linear: Inbox acts. Perionyx: approvals act.
94. **Auto-subscribe on create/assign/mention.** Linear: the Inbox rule. Perionyx: the requires-me rule.
95. **Snooze/deferral is explicit and resurfaces.** Linear: snooze with time. Perionyx: with a reason, for audit.
96. **Digests are urgency-tiered.** Linear: immediate vs digest. Perionyx: critical alerts immediate.
97. **Notifications group by object.** Linear: grouped by issue. Perionyx: grouped by invoice/exception.
98. **Digest links deep-land on the actionable record.** Linear: cross-channel handoff.
99. **The empty state is calm, not empty.** Linear: "You're all caught up." Perionyx: "Nothing requires you."
100. **Reminders pulse gently; they do not nag.** Linear: re-surface with a pulse.
101. **Mark-all-read is a designed gesture.** Linear: staggered wave.
102. **Cross-channel continuity: email, desktop, mobile, Slack.** Linear: channels share state. Perionyx: approvals follow the operator.
103. **Read state is explicit, not implied.** Linear: unread dots.
104. **Deferral is a decision, not an avoidance.** Linear: snooze lands on the plan. Perionyx: the audit records the deferral and its reason.
105. **The notification surface is the workflow's conscience.** Linear: Inbox is the work. Perionyx: the requires-me queue is the work.

## 17.10 Search (106-112)

106. **One global search over all objects.** Linear: `/`.
107. **Exact IDs jump directly.** Linear: `LIN-123`. Perionyx: `INV-2026-0042`.
108. **Search matches are highlighted and explained.** Linear: fuzzy highlight.
109. **Recent searches persist.** Linear: recent query memory.
110. **Find-in-view complements search.** Linear: `Cmd+F`.
111. **Search results are keyboard-navigable.** Linear: arrows + enter.
112. **Mentions in search build filters.** Linear: `@` chips.

## 17.11 Visual Design (113-124)

113. **Text hierarchy by opacity, not hue.** Linear: 90/60/40%.
114. **Neutral chrome; meaning in saturation.** Linear: the palette rule.
115. **One accent, used rarely.** Linear: indigo. Perionyx: gold.
116. **Dark-first is a brand statement.** Linear: for builders. Perionyx: for finance professionals.
117. **Two typefaces + one mono; tabular for numbers.** Linear: Inter + JetBrains Mono. Perionyx: EDL standard.
118. **Icons are line, consistent-stroke, semantic.** Linear: Lucide family. Perionyx: same.
119. **Avatar identity via stable per-user color.** Linear: workspace identity.
120. **Calm density is the default.** Linear: dense but never busy.
121. **Whitespace is structure, not emptiness.** Linear: 4px grid, consistent gutters.
122. **The layout is engineered, not decorated.** Linear: alignment as rhythm.
123. **Empty states carry brand-consistent illustration.** Linear: small delight.
124. **Celebration is rare, earned, once.** Linear: cycle completion. Perionyx: close completion.

## 17.12 Enterprise & Governance (125-135)

125. **Governance lives in the interface, not settings.** Linear: status tracks, triage. Perionyx: approval matrix as a visible track.
126. **Reliability is trust; show state honestly.** Linear: sync indicator. Perionyx: freshness + audit.
127. **Opinionated defaults + deep capability = enterprise confidence.** Linear: the resolution of the sprawl/shallow divide.
128. **Scale doesn't mean chaos.** Linear: anti-Jira at every size. Perionyx: same at ledger scale.
129. **Deletion is confirmed and recoverable; archiving is the default.** Linear: archive over delete. Perionyx: audit-safe archive.
130. **The administrative surface is thin where the workflow is opinionated.** Linear: settings consolidation. Perionyx: keep admin thin per domain.
131. **Enterprise onboarding is a compliance path.** Linear: thin onboarding rejected. Perionyx: wizard + readiness correct.
132. **Compliance is certified, not implied.** Linear: not relevant. Perionyx: WCAG/SOC2/PCI/GDPR documented.
133. **Accessibility is a byproduct of architecture, and the floor is certified.** Linear: keyboard-first. Perionyx: WCAG 2.1 AA.
134. **Every number has a source; every state has an explanation.** Perionyx constitution — Linear confirms the standard by lacking it.
135. **The platform's process is evidence-driven; its taste is disciplined.** Linear: taste. Perionyx: evidence + taste.

## 17.13 Principle Count

Total principles: **135** across 12 domains (Philosophy 10, Architecture & Performance 15, IA 13, Navigation 12, Lists & Tables 15, Detail 11, Interaction & Motion 16, Communication & Review 13, Search 7, Visual 12, Enterprise & Governance 11).

## 17.14 The Top 10 Principles (the ones to internalize)

1. **Optimism for views; certainty for money.**
2. **The keyboard is the primary input model; the mouse is the discoverable fallback.**
3. **Never make the user wait; acknowledge within 100ms; first paint shows something useful.**
4. **Peek beats open for review; open beats peek for work.**
5. **Views are projections; they never change work.**
6. **The review queue is a decision queue, not a log.**
7. **Governance lives in the interface, not settings.**
8. **Saturation is reserved for meaning; text hierarchy by opacity.**
9. **Simple first, then powerful; reveal by decision-need.**
10. **Design debt is intentional; schedule the reset.**
