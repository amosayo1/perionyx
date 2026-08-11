# Section 3 — Navigation

## 3.1 The Navigation Philosophy: Keyboard-Forward, Chrome-Minimal

Linear's navigation is built on an inverted assumption: **the keyboard is the primary navigation surface; the sidebar and click-targets are the secondary, discoverable surface.** This inverts most enterprise software, where navigation is mouse-first and keyboard is an accessibility afterthought.

Three observable consequences:

1. **The chrome is small.** The sidebar is narrow, the header is thin, and toolbars appear in context. Navigation *chrome* (the parts of the screen that exist only to move you around) occupies maybe 15% of the viewport — the rest is content.
2. **The command palette is the destination.** `Cmd+K` is not a menu; it is a *navigation system*. Every object, view, command, and recently-visited page is reachable in 1-3 keystrokes from anywhere.
3. **Navigation teaches itself.** Every command in the palette displays its keyboard shortcut. Hover states and context menus expose actions; the keyboard versions are one breath away. Discoverability and power are the same feature.

## 3.2 The Navigation Primitives

Linear's navigation model decomposes into six primitives:

| Primitive | Trigger | Purpose |
|---|---|---|
| **Workspace switcher** | Top-left dropdown | Switch between workspaces (the "tenant" level) |
| **Sidebar** | Persistent left rail | Structure: Favorites, Your Teams, Exploring (unjoined teams) |
| **Command menu** | `Cmd+K` | Global action + search + creation surface |
| **Navigation shortcuts** | `g <key>` ("go to") | Jump to fixed destinations: `g i` Inbox, `g m` My Issues, `g v` Views, `g a` All Issues, `g c` Cycles |
| **Open shortcuts** | `o <key>` ("open") | Open collections: `o i` issues, `o c` cycles, `o p` projects, `o f` favorites, `o u` users, `o t` teams, `o v` views, `o d` documents |
| **Command menu dot** | `.` (period) | Drop-in command menu without moving the hands from the home row |

The `g`/`o` shortcut pattern is worth dwelling on: it is a **two-tier mnemonic system**. `g` + letter = "go to destination"; `o` + letter = "open collection". The letters are mnemonic (i=issues, m=my issues, v=views, a=all, c=cycles, p=projects, f=favorites, u=users, t=teams, d=documents). A user who learns ten letters knows twenty destinations. This is the *cheapest* navigation vocabulary in professional software, and it is the model Perionyx should copy for its own global navigation.

## 3.3 The Sidebar: Structure, Not Navigation

Linear's sidebar is deliberately shallow. It does not attempt to expose every team, project, and view at once (Jira's fatal sprawl). Instead:

- **Favorites** (top): user-curated shortcuts to issues, views, projects, teams, and documents. The only user-mandated section. `o f` opens it.
- **Your Teams** (middle): teams the user belongs to, each expandable to show that team's issues/projects/cycles/views.
- **Exploring** (bottom): unjoined teams, dimmed and separated — visibility without noise.

Sidebar items support: drag-and-drop reordering, collapse to icon-only, badges (unread Inbox counts, issue counts on boards), and right-click context menus. The sidebar collapses to a slim rail (icons only) when width is constrained — the collapsed rail keeps the full set of *destinations* reachable, proving that "collapse" should reduce chrome, not capability.

## 3.4 The Header: Context, Not Chrome

The header in Linear is nearly invisible. It holds the workspace switcher (top-left), the current view's title, and contextual actions that appear only when they apply (Create, Share, Filter, Sort, Display). Crucially, most of what other products put in the header — search, create, settings — Linear routes through the keyboard and command menu. The header is a *confirmation of where you are*, not a *toolbox for what you can do*.

This is the design lesson to absorb: **the header's job is to answer "where am I?", not "what can I do?"** The answer to "what can I do" lives in the command menu and the keyboard, where it is always one keystroke away regardless of screen.

## 3.5 In-View Navigation: Highlight, Not Open

Within any list, Linear's navigation model is the **highlight-then-act** pattern:

- `↑` / `↓` or `j` / `k` move a *highlight* through rows (no page open, no click).
- `space` **Peek**s the highlighted row without navigating (Section 8).
- `enter` opens the highlighted row in the detail pane/route.
- `x` converts highlight into *selection* (multi-select mode, Section 5).
- `shift` + arrows / `shift` + click extend selection ranges.
- `cmd+a` selects all filtered rows; `esc` clears.

The brilliant part is that highlight and selection are **different states with different visual language** — a highlight is a subtle row tint (you're "standing on" a row); a selection is a checkbox + accent border (you've "committed" to rows). Because the two are distinct, Linear can offer both instant single-row navigation and deliberate multi-row operations without ambiguity. Section 5 covers the selection model in depth; the navigation-relevant point is that **every row in a Linear list is keyboard-navigable and keyboard-actionable without ever opening it.**

## 3.6 Breadcrumbs Are Absent — by Design

Linear has no breadcrumbs. The navigation model (keyboard + sidebar + command menu) makes breadcrumbs redundant, and Linear correctly recognizes that breadcrumbs are chrome. Users always know where they are because the view title is prominent and the keyboard destination is memorized. Perionyx should treat its own breadcrumbs (which the AGENTS.md notes were animated in 8B.7) as *transitional* — useful today, redundant once the command palette becomes the primary navigation surface.

## 3.7 Navigation States and Empty Handling

Linear handles "nothing here" states as navigation opportunities, not dead ends:

- **Empty lists** render a large, friendly call-to-action (Create your first issue; set up your first cycle).
- **Filtered-to-zero** renders "No results match your filters" with a one-click clear-filters action — never a dead-end blank.
- **Search with no hits** shows typo tolerance and recent-searches fallbacks.
- **The command palette always has *something* to offer** — recent items, then ranked suggestions, then "create new".

Perionyx's equivalent gaps (no matching invoices, no pending approvals, cleared exception queue) are currently mostly blank screens or plain "no data" text; Linear's pattern — empty state as an actionable invitation — is a direct, cheap win.

## 3.8 Navigation Performance: The Page Never Reloads

Linear is a single-page application with client-side routing and no full-page reloads. Combined with the local-first data layer, this produces the "never a flash" experience. Navigation is state transition, not page fetch. The command palette opens in ~120ms; view switches render from the local store in well under 100ms.

The architectural lesson for Perionyx is the *combination*: client-side routing (no reload) + local data (no fetch) + composited motion (no jank). Each alone improves perceived speed; together they are the difference between "app" and "webpage."

## 3.9 Translation to Perionyx

| Linear Navigation Element | Perionyx Equivalent | Recommended Action |
|---|---|---|
| Command menu (`Cmd+K`) with shortcut-labeled commands | Existing CommandPalette (pre-existing, verified in Phase 20.1) | Ensure every global action is in it; display shortcuts beside commands |
| `g`/`o` mnemonic destination shortcuts | Global destinations (dashboard, treasury, approvals, ledger) | Design a two-tier mnemonic jump system (`g a` = approvals, etc.) |
| Sidebar with Favorites / Teams / Exploring | Existing shell sidebar (nav-config) | Add Favorites as a user-curated top section; dim, don't hide, less-used sections |
| Highlight-then-act lists | Ledger, transactions, audit tables | Enable `j`/`k` row highlight + `space` peek + `x` select on all EnterpriseTable screens |
| Empty states as invitations | "No data" screens across AP | Convert to actionable empty states (create / clear filters / see how) |
| Workspace switcher (tenant level) | Multi-company switcher | Keep the top-left tenant switcher; make it keyboard-reachable |
| No full-page reloads | App shell SPA | Preserve client-side routing; never navigate via hard reload |

## 3.10 Navigation Design Rules (Condensed)

1. The keyboard is the primary navigation surface; the mouse is secondary.
2. Chrome is a tax — minimize it (sidebar ~15% of viewport, thin header).
3. The command palette is a navigation system, not a menu.
4. Two-tier mnemonic shortcuts (`g x` / `o x`) give a large vocabulary at trivial learning cost.
5. Highlight and selection are distinct states with distinct visuals.
6. Empty states are invitations, not dead ends.
7. Collapse reduces chrome, never capability.
8. The header answers "where am I", not "what can I do".
9. Navigation must never reload the page.
10. Every list row is keyboard-navigable and keyboard-actionable.

---

# Section 4 — Information Architecture

## 4.1 The Single-Primitive Architecture

Linear's information architecture is built on a radical simplification: **almost everything is an issue.** Not a task, a ticket, a story, an epic, a defect, a backlog item, a work item — an *issue*, with a consistent shape, set of fields, and behavior wherever it appears.

This is the deepest architectural idea in the product, and the one most worth stealing:

- **One object → one mental model.** Users never re-learn what an "issue" is depending on where they see it.
- **One set of operations.** Create, edit, comment, assign, status, priority, labels, estimate, dates — the same verbs apply everywhere.
- **Everything hangs off it.** Projects, cycles, initiatives, views, inbox, search, keyboard shortcuts — all reference the same primitive.
- **Cross-cutting behavior is therefore free.** Because every tracked thing is an issue, search, automation, and reporting work uniformly. There is no "issue search" vs "task search" vs "bug search."

Compare Perionyx: financial workflows have many primitives (invoice, approval, payment, exception, credit note, reconciliation). The correct lesson is **not** to collapse finance into one object (that would be absurd) but to apply Linear's discipline at the *workflow* level: within the AP workflow, the **invoice is the central primitive** — exactly as Phase 21A.0's domain architecture decided ("Invoice as central aggregate"). Linear is the commercial existence proof that a single-primitive IA produces dramatically simpler navigation, search, and mental models. Perionyx's 21A architecture already chose this; Linear validates it.

## 4.2 The Object Model Hierarchy

Linear's hierarchy, from top to bottom:

```
Workspace (tenant)
 └─ Teams (organization unit; own workflows, statuses, cycles, triage, labels, templates)
     └─ Issues (the primitive)
         ├─ Projects (group issues toward an outcome)
         │   └─ Milestones (checkpoints inside a project)
         ├─ Cycles (time-boxed batches of issues)
         ├─ Initiatives (program-level theme spanning projects)
         ├─ Labels (cross-cutting taxonomy)
         └─ Views (saved/custom ways of looking at issues)
             ├─ Board / List / Timeline / Split / Fullscreen
             ├─ Filters + grouping + ordering + display
             └─ Shareable (public/shared views)
```

Key structural decisions worth naming:

- **Teams own workflows.** Statuses, cycle cadence, triage on/off, templates, automations are *team-level* — the unit of workflow is the team, not the individual and not the workspace.
- **Projects group; initiatives span.** Projects are outcome-shaped groups of issues; initiatives are program-level themes that collect projects. The separation keeps the "project" object small and the "program" object explicit.
- **Milestones live inside projects** (sub-structure), not as a parallel object — mirroring the "child entity" classification Perionyx's AP domain architecture uses for similar reasons.
- **Labels are cross-cutting taxonomy** — orthogonal to project/cycle structure, used for filtering, search, and grouping.
- **Views don't change work.** A saved view is a *way of looking*, not a *copy of the work*. This is the crucial conceptual separation: **the data model and the presentation model are decoupled.** One set of underlying issues can be rendered as board, timeline, list, or filter without duplication.

## 4.3 Teams: The Workflow Unit

Linear's team concept is the unit of governance and workflow. Each team defines:

- **Workflow statuses** (start → in progress → review → done; the canonical starter set, fully customizable *at team level*).
- **Cycle cadence** (2 weeks default; per-team configurable).
- **Triage on/off** (whether new issues land in the team's triage queue).
- **Issue templates** (per-team, for consistent issue shapes).
- **Recurring issues** (scheduled tasks like "retro", "release notes").
- **Automations** (auto-assign, auto-label, auto-archive).
- **Own views** (the team's Issues/Projects/Cycles sections in the sidebar).

The design intent: **workflow governance belongs to the smallest coherent unit that owns the work.** This is precisely the pattern Perionyx's approval matrix and exception queues need — governance at the business-unit/team level, not globally uniform, not individually chaotic.

## 4.4 Triage: The Intake Discipline

Triage is Linear's answer to unstructured intake. When a team enables triage:

- New issues land in a **Triage queue**, unassigned and un-prioritized.
- The team's triage workflow decides: assign / convert to project / snooze / archive / trash.
- Nothing enters the "active" stream without a deliberate decision.

Triage is *optional per team* (small teams may skip it) but *enforced where enabled*. It is the single most important anti-sprawl device in the product — the direct counterpart to Perionyx's **exception queue** (Phase 27.0A) and to a finance team's intake of invoices, adjustment requests, and exception items. A finance operator's "triage" is: does this invoice match? does this exception have an owner? is this approval within threshold? Perionyx's exception queue should adopt triage's discipline: *every inbound exception gets a decision, not just a location.*

## 4.5 Cycles: Time as Structure

Cycles are Linear's time-boxing primitive — the calendar's answer to the board's "someday" drift:

- Default two-week cycles; teams set their own cadence.
- Cycle view shows each issue's **scope at cycle start** vs **actuals at cycle end** (the burndown).
- Cycle breaks down into **key milestones** (plan, midpoint, end).
- Issues can be pulled in/out mid-cycle, with the change visible in history.

The deep design point: **cycles convert time into a filterable, sortable, reportable dimension.** "What did we do this cycle?" is answerable in one screen. For Perionyx, the translation is the **finance close cycle** (month-end / quarter-end) and the **approval SLA**: time-boxing transforms "when will this be done?" from a shrug into a view.

## 4.6 Views: The Presentation Layer

Linear's views are the second pillar of its IA (after the single primitive):

- **Board** (Kanban columns by status), **List** (table), **Timeline** (Gantt-style), **Split** (list + detail side-by-side), **Fullscreen** (detail-only).
- Every view is *filterable* (assignee, label, project, cycle, estimate, dates, custom), *groupable* (by status, assignee, priority, label, project, cycle), *orderable* (manual, priority, status, last updated, etc.), and *display-configurable* (compact rows, density, hidden columns).
- Views are **saveable** (with sharing, favoriting, and sidebar placement) and **subscription-able** (subscribe to a view's changes).
- Views **never mutate data** — they are projections.

The "views don't change work" rule is the conceptual keystone: **separation of presentation from state.** Perionyx's dashboards and saved filters should be projections over one underlying truth — not materialized copies that can diverge (the "data staleness" problem Phase 20.x already flagged). When Perionyx ships "saved views" for the ledger or exception queue, the Linear rule applies verbatim.

## 4.7 Favorites: User-Curated Top of the World

Favorites are the only user-mandated structure in Linear's sidebar: a user's pinned issues, views, projects, teams, and documents. They sit above "Your Teams," are reorderable by drag, and are reachable via `o f`. Starring (from any view's header) adds to favorites with one click; unstarring removes.

The design lesson: **let users declare their own hierarchy at the top of the world, and keep the rest of the hierarchy product-declared.** Users do not want to build their entire IA; they want to pin the six things they visit daily. Perionyx's sidebar should adopt the same pattern — product-declared structure below, user-pinned favorites above.

## 4.8 Documents: The Second Object

Linear's Documents (2024) introduced a second object — the document — for specs, decision records, and long-form knowledge. Documents are: hierarchical (nested documents), embeddable (issues embed in documents; documents embed in issues), linkable (issues and documents cross-reference), and searchable. Critically, **documents did not disrupt the issue-centric IA** — they hang off the same teams, favorites, views, and command palette.

The lesson for Perionyx: a knowledge object (the "Decision Intelligence" briefs, the Brain's content) can coexist with the operational object model *if* it uses the same navigation, search, and favoriting systems. The second object must inherit the first object's infrastructure, or it becomes a second product.

## 4.9 The Search Layer Over Everything

Search in Linear is a *vertical*, not a feature: `/` opens workspace search across issues (title, description, comments, exact IDs like `LIN-123`), projects, cycles, documents, and users. `Cmd+F` searches within the current view. `o i` opens recent issues. Search results are keyboard-navigable; `@`-mentions in search create filter chips; recent searches persist.

IA-relevant point: **search is the escape hatch for everything the hierarchy can't reach.** Because the IA is so clean, search can be simple — there is no "advanced search builder" as a separate mode; the filter bar is the advanced search. Perionyx should ensure global search covers every financial object uniformly (invoices, approvals, exceptions, payments, audit records) — Linear proves a single index over a well-modeled domain is more powerful than per-module search UIs.

## 4.10 IA Comparison: Linear vs Jira (the Anti-Pattern)

The most instructive contrast in the category: Jira is what Linear refuses to be.

| Dimension | Jira | Linear |
|---|---|---|
| Primitives | Issue types multiply (task, story, bug, epic, sub-task, custom types) | One primitive: issue |
| Workflow | Global workflow schemes, per-project; configuration-heavy | Per-team statuses; triage on/off; little ceremony |
| Navigation | Project → board → backlog → query → screen chaos | Keyboard, command menu, shallow sidebar |
| Flexibility | Extremely configurable (and extremely misconfigurable) | Opinionated; configuration where it matters only |
| Speed | Historically slow at scale (server-rendered, heavy queries) | Local-first, instant |
| Mental model | "What is this issue type and which board is it on?" | "It's an issue; where do I put it?" |

The enterprise objection to Linear is "Jira is configurable." Linear's answer is "configurability is why Jira is a chaos factory." Perionyx occupies a middle ground by regulation (approval thresholds *must* be configurable, audit *must* exist), but the Jira warning applies: **every configurable option is a potential misconfiguration.** Perionyx should configure the things that must vary, and hard-code the things that must not.

## 4.11 Translation to Perionyx

| Linear IA Element | Perionyx Equivalent | Recommended Action |
|---|---|---|
| Single primitive (issue) | Invoice as central AP primitive (21A.0 decision) | Validate: search, navigation, and reports should reference one object model |
| Teams own workflows | Business units / legal entities | Per-entity statuses, approval matrices, exception policies |
| Triage queue | Exception queue | Every inbound exception gets a decision; nothing silently accumulates |
| Cycles | Close cycles / approval SLAs | Time-box finance workflows; render as time dimension |
| Views don't change work | Dashboards, saved filters | Projections over one truth; never materialized copies |
| Favorites | User-pinned sidebar section | Product-declared structure below, user-pinned above |
| Documents as second object | Decision Intelligence briefs / Brain content | Second object inherits first object's navigation and search |
| Search over everything | Global financial search | One index over all financial objects |
| Configurable-anti-Jira | Approval matrices | Configure what must vary; hard-code what must not |

## 4.12 IA Design Rules (Condensed)

1. Minimize the number of primitives; make the central primitive's behavior uniform everywhere.
2. Present objects as a small, legible hierarchy (workspace → team → object → grouping).
3. Separate data model from presentation model: views are projections, never copies.
4. Give workflow governance to the smallest unit that owns the work.
5. Give every inbound item a decision (triage discipline).
6. Use time as a first-class filterable dimension (cycles, SLAs, close cadence).
7. Let users pin their own favorites; keep the rest product-declared.
8. Any second object type must inherit the first's navigation, search, and favoriting.
9. Search is the escape hatch for the hierarchy; make it global and uniform.
10. Restrict configurability where misconfiguration creates risk.
