# Section 15 — Design Decisions Catalog (75+)

## 15.1 How to Read This Catalog

Each decision records: the **decision** (what Linear did), the **rationale** (why), and the **Perionyx verdict** — **Adopt** (do the same), **Adapt** (translate with changes), or **Reject** (deliberately do otherwise). The catalog is grouped by domain. It is the reference annex for the sections above; the executive summary (Section 1.5) is its digest.

## 15.2 Philosophy & Product Stance (1-12)

1. **One primitive (the issue).** Adopt — Perionyx's central primitive is the invoice in AP (validated by 21A.0).
2. **Opinionated defaults; restricted configurability.** Adapt — restrict where misconfiguration is risky (approval thresholds, safety semantics); configure where legitimate variability exists.
3. **Simple first, then powerful.** Adopt — progressive disclosure; reveal fields by decision-need, not availability.
4. **Individual productivity over reports.** Adopt — operator flow outranks reporting completeness in core screens.
5. **"The tool works for you."** Adopt — ship opinionated workflows; never ask the operator to design their own.
6. **Process is a cost, not a value.** Adapt — finance *is* process; the cost-minimization attitude transfers, the removal of process does not.
7. **No PMs, no A/B tests.** Reject — Perionyx's evidence-driven process is correct for finance (Section 2.4).
8. **Feature flags for staged rollout.** Adopt — flags + trials already Perionyx practice; keep it.
9. **Paid work trials as hiring.** Reject (out of scope) — unrelated to Perionyx's product.
10. **Design debt is intentional borrowing.** Adopt — scheduled resets (Section 2.5).
11. **Dark-first as brand.** Adopt — already Perionyx EDL; formalize as brand statement.
12. **Refuse trends that compromise clarity.** Adopt — the SDF/Liquid Glass refusal (Section 11.8); applies to any trend.

## 15.3 Architecture & Performance (13-22)

13. **Local-first: browser DB as the UI's database.** Adapt — for representational state only (Section 9.3).
14. **Optimistic mutation pipeline (apply local → batch → sync → reconcile).** Adapt — reject for money; adopt for views/filters/forms.
15. **WebSocket delta broadcast for collaboration.** Adopt — multi-operator financial views want live deltas (with permission checks).
16. **Batched mutation flushing (debounced).** Adopt — forms auto-save (EnterpriseForm already debounces 2s — align with sync-batch model).
17. **Service-worker precache of app shell.** Adopt — startup discipline; first paint from last-known-good.
18. **Warm-start from cache + background auth check.** Adapt — render local state instantly; verify session in background; keep freshness labels prominent for money.
19. **Windowing/virtualization for lists.** Adopt — already in EnterpriseTable; make it the standard for all high-volume lists.
20. **Per-property reactivity (re-render the cell, not the row).** Adopt — measurable smoothness win for the ledger.
21. **GPU-composited motion (transform/opacity only).** Adopt — already EDL motion rule; enforce.
22. **No full-page reloads; client-side routing.** Adopt — already app-shell practice; never regress.

## 15.4 Information Architecture (23-34)

23. **Shallow hierarchy: workspace → team → object.** Adopt — Perionyx: tenant → business unit → financial object.
24. **Teams own workflows (statuses, triage, cycles).** Adapt — business units own approval matrices and exception policies.
25. **Triage queue as intake discipline.** Adopt — the exception queue is triage (Section 5.8).
26. **Cycles as time-boxed units.** Adapt — finance close cycles and approval SLAs (Section 5.7).
27. **Views are projections; they never change work.** Adopt — dashboards and saved views over one truth; no materialized divergence.
28. **Projects group; initiatives span.** Adapt — projects → engagements/initiatives; programs → portfolios.
29. **Milestones inside projects (child, not parallel).** Adopt — mirrors Perionyx's child-entity classification.
30. **Labels as cross-cutting taxonomy.** Adopt — GL codes, categories, entities as labels.
31. **Favorites as the only user-mandated structure.** Adopt — product-declared below, user-pinned above.
32. **Second object (Documents) inherits the first's infrastructure.** Adopt — Decision Intelligence content inherits search/nav/favorites.
33. **Search as the escape hatch over everything.** Adopt — one global index over all financial objects.
34. **Anti-Jira: refuse global workflow schemes.** Adopt — governance at the business-unit level, not a global config blob.

## 15.5 Navigation (35-44)

35. **Keyboard as primary navigation.** Adopt — the model, not just shortcuts (Section 10).
36. **`g`/`o` two-tier mnemonic destinations.** Adopt — design Perionyx's jump vocabulary.
37. **Command palette as navigation system.** Adopt — extend existing CommandPalette (context-aware, shortcut-labeled).
38. **Chrome minimization (sidebar ~15%, thin header).** Adopt — already EDL direction; hold the line.
39. **Highlight-then-act list navigation (`j`/`k`, enter, space).** Adopt — highest-value adoption in the catalog.
40. **No breadcrumbs; the view title + palette replace them.** Adapt — keep current breadcrumbs; let palette adoption retire them.
41. **Sidebar collapse preserves capability.** Adopt — collapse reduces chrome, never capability.
42. **Workspace (tenant) switcher top-left.** Adopt — Perionyx multi-company switcher, keyboard-reachable.
43. **Empty states as invitations.** Adopt — convert "no data" screens (Section 3.7).
44. **`?` as a complete, searchable shortcut reference.** Adopt — upgrade KeyboardShortcutsDialog.

## 15.6 Lists & Tables (45-56)

45. **Dense rows with hover-reveal of secondary data.** Adopt — EnterpriseTable compact mode + reveal-on-hover.
46. **Alignment is sacred (field highways).** Adopt — column alignment as a first-class design property.
47. **Legend-free icon encoding (priority arrows, status icons).** Adopt — reduce legend dependencies.
48. **Saturation reserved for meaning.** Adopt — already EDL doctrine.
49. **Tabular numerals for number columns.** Adopt — money columns must scan vertically.
50. **Checkbox zone revealed on demand.** Adopt — preserves density; selection affordance still discoverable.
51. **Selection = accent border + floating action bar.** Adopt — bulk financial actions (Section 5.5).
52. **Filter chips additive/removable; results count live.** Adopt — work-queue/ledger filters.
53. **Saved views (save, share, favorite, subscribe).** Adopt — the view layer over H-01 canonical filters.
54. **Grouping with sticky group headers + counts.** Adopt — ledger grouping by status/entity/currency.
55. **Density modes (compact/comfortable) as a product feature.** Adopt — persist per user.
56. **Column toggle without layout jank.** Adopt — width-animated column hide.

## 15.7 Detail Views (57-66)

57. **Three zones: content / state / history.** Adopt — Invoice Detail restructure (Section 7.1).
58. **Every state field is an editable control.** Adopt — exception resolution as in-place actions.
59. **Status track (sequential buttons), not dropdown.** Adopt — approval chain rendered as a track.
60. **Relations with visible blockage (blocked-by).** Adopt — PO/GRN/evidence blockage visible on the invoice.
61. **Activity timeline as scannable audit trail.** Adopt — per-event-type icons + actor attribution (Section 7.5).
62. **Unset fields as affordances ("+ Add").** Adopt — blanks read as actionable, not incomplete.
63. **Modal-free editing (commit on blur/enter, undo).** Adopt — already EnterpriseForm direction; extend to list/detail.
64. **Split view (list + detail, keyboard walk).** Adopt — the approval-triage screen (Section 7.7).
65. **Commentary with `@` mentions and embedded evidence.** Adopt — cross-department notes on financial records.
66. **Long-form editor via slash commands.** Adapt — document editor; keep EnterpriseField standard elsewhere.

## 15.8 Interaction & Motion (67-82)

67. **60ms press feedback.** Adopt — every press acknowledges.
68. **100ms cause-and-effect threshold.** Adopt — the perceptual standard.
69. **Distance-scaled durations (80/120/200/280ms).** Adopt — already EDL motion tokens; enforce the scale.
70. **Peek (space) as quicklook with keyboard walk.** Adopt — build for exception/approval/ledger lists (Section 8.4).
71. **Floating action bar on selection.** Adopt — bulk actions at the point of action.
72. **Drag-and-drop with pre-commit target + momentum.** Adopt — communicate before commit.
73. **Context menus scoped, shortcut-labeled, keyboard-navigable.** Adopt — every row's full action surface on right-click.
74. **Toasts carry undo; destructive confirms.** Adopt — extend UndoProvider to all mutations.
75. **Skeleton rows layout-accurate.** Adopt — already LoadingSkeleton; hold the standard.
76. **Inline errors + retry in place.** Adopt — never a dead-end dialog.
77. **Sync/connection state permanently visible.** Adopt — global freshness/sync indicator (Section 8.9).
78. **Snooze/deferral as a first-class action.** Adopt — with reason attached for audit.
79. **Rapid creation mode (stacked creates).** Adopt — batch invoice capture (Section 5.2).
80. **Context inheritance on create.** Adopt — never re-ask what the screen knows.
81. **Reduced-motion collapses all motion to instant states.** Adopt — already MotionProvider; enforce.
82. **Earned motion only (decorative motion rejected).** Adopt — the motion governance rule.

## 15.9 Inbox, Notifications & Communication (83-92)

83. **Auto-subscription (create/assign/mention).** Adopt — "requires me" determination.
84. **Inbox as a decision queue, not a log.** Adopt — act from the row (approve/reject/delegate).
85. **Inbox deliberately non-customizable.** Adapt — never configurable into incompleteness; legitimate per-role overrides allowed.
86. **Urgency-tiered email digests.** Adopt — critical immediate, routine digest.
87. **Snooze with natural-language time ("2d").** Adopt — plus reason field for finance.
88. **Mark-all-read with staggered wave.** Adopt — small detail, real polish.
89. **Grouped notifications by object.** Adopt — group by invoice/exception.
90. **Reminder re-surface with gentle pulse.** Adopt — the "waiting" state is explicit.
91. **Deep-link handoff across channels (email→app).** Adopt — every digest link lands on the actionable record.
92. **Empty state is calm, not empty.** Adopt — "nothing requires you" is a designed state.

## 15.10 Search (93-99)

93. **Workspace search over all objects (`/`).** Adopt — one global financial search.
94. **In-view find (`cmd+f`).** Adopt — find-in-filtered-set.
95. **Exact-ID search jumps directly.** Adopt — `INV-2026-0042` opens the record.
96. **Fuzzy match with highlight of matched letters.** Adopt — the "why did this match" read.
97. **Recent searches persisted.** Adopt — table-search already has recent; standardize.
98. **`@`-mentions in search create filter chips.** Adopt — filter-by-reference.
99. **Search results keyboard-navigable.** Adopt — arrows + enter throughout.

## 15.11 Visual Design (100-111)

100. **Text hierarchy by opacity, not hue.** Adopt — fewer hues, cleaner screen.
101. **Neutral chrome; saturated meaning.** Adopt — already EDL.
102. **One accent used rarely.** Adopt — gold for currency/active states (already).
103. **Semantic status colors + icons.** Adopt — icon + color, never color alone.
104. **Inter + JetBrains Mono.** Adopt — already EDL typography.
105. **Tabular figures.** Adopt — money columns (Section 11.4).
106. **4px grid.** Adopt — already EDL spacing.
107. **Line icons, consistent stroke.** Adopt — Lucide matches (already).
108. **Avatar identity via color (per user, stable).** Adopt — operator identity across the workspace.
109. **Calm density as the default.** Adopt — dense but never busy.
110. **Skeletons match final layout.** Adopt — no layout shift.
111. **Empty-state illustrations, brand-consistent.** Adopt — small delight surfaces.

## 15.12 Team, Collaboration & Workflow Mechanics (112-123)

112. **Per-team statuses (workflow at the unit level).** Adapt — per-business-unit approval matrices.
113. **Recurring issues (scheduled tasks).** Adopt — recurring reconciliations, close checklists.
114. **Automations (auto-assign/auto-label/auto-archive).** Adapt — auto-assign exceptions, auto-flag high-value, auto-archive reconciled.
115. **Issue templates per team.** Adopt — invoice/exception intake templates.
116. **Comments as coordination on the record.** Adopt — cross-department resolution threads.
117. **Assignments with hover identity.** Adopt — owner avatars with hover names.
118. **Parent/child hierarchy with board nesting.** Adapt — invoice → line items / sub-approvals.
119. **Duplicate detection as a relation.** Adopt — Perionyx already has duplicate detection (21C); render as visible relation.
120. **Cycle burndown (scope vs actuals).** Adopt — close-cycle health (Section 5.7).
121. **Initiative health (on-track/at-risk/off-track).** Adopt — program health for close initiatives.
122. **Views subscription (watch a filter).** Adopt — subscribe to an aging report or exception filter.
123. **Keyboard-actable everything.** Adopt — the standard (Section 10).

## 15.13 Settings, Governance & Administration (124-130)

124. **Settings debt consolidated in resets.** Adopt — scheduled EDL/UX resets.
125. **Triage enforced at the team level.** Adopt — exception triage as a unit policy.
126. **Deletion requires confirm + recovery.** Adopt — already Perionyx constitution.
127. **Archiving as non-destructive default.** Adopt — archive beats delete where defensible.
128. **Auto-archive with retention.** Adapt — data retention policies govern; archive is compliant, not automatic.
129. **Administrative surface is thin.** Adapt — Perionyx legitimately needs richer admin (permissions, audit, IAM); keep it thin per domain.
130. **Governance by interface, not settings.** Adopt — render rules as visible states (Section 13.3).

## 15.14 Enterprise & Scale (131-138)

131. **Scale is a UX feature.** Adopt — performance at data volume is designed.
132. **Reliability = visible sync state.** Adopt — trust through honest state.
133. **Multi-user live collaboration.** Adopt — WebSocket deltas with permission checks.
134. **Offline-tolerant reads.** Adapt — offline reads of cached data with freshness labels; never offline writes of money.
135. **Search over huge sets is windowed and ranked.** Adopt — relevance + recency ranking.
136. **API/export affordances (graph, github, csv).** Adopt — Perionyx already has exports; keep them complete.
137. **SSO/SCIM enterprise readiness.** Adopt — Perionyx identity platform direction.
138. **Enterprise scale doesn't mean enterprise chaos.** Adopt — the anti-Jira stance at every scale.

## 15.15 Summary Statistics

| Verdict | Count | Notes |
|---|---|---|
| **Adopt** | 101 | Copy the pattern as-is |
| **Adapt** | 27 | Translate with domain changes |
| **Reject** | 5 | Optimistic money, no-A/B process, thin onboarding, color-only status, admin-thin |
| **Total** | 133 | (Sections 15.2-15.14; some duplicate-struck) |

The executive digest (Section 1.5) remains the guide for sequencing; the full catalog is the reference for implementation detail.
