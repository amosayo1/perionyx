# Perionyx Product Design Research — Product 2: Linear

## Document Purpose

This document is the second installment of the Perionyx Product Design Research program. The program's mandate: reverse-engineer the world's best software products, extract the decisions behind their excellence, and translate those decisions into principles Perionyx can adopt, adapt, or deliberately reject.

The first installment (`docs/research/stripe-dashboard-review/stripe-design-review.md`) examined Stripe's Dashboard — the financial operator's control surface. This installment examines **Linear** — the product development tool that has become the reference standard for speed, focus, and opinionated software design.

Why Linear for an enterprise financial operating system? At first glance, a task tracker for software teams has nothing in common with a CFO dashboard. That instinct is wrong, and understanding why is the entire point of this review. Linear has solved problems Perionyx must solve:

1. **Perceived speed at enterprise scale.** Linear loads a 4,000-issue workspace in under 200ms on warm start and renders any keystroke against that workspace without jank. Finance operators will not wait for a chart; they will not wait for a ledger. Linear shows what is physically possible when performance is a design decision, not an afterthought.

2. **Information density without overwhelm.** Linear crams an astonishing amount of state onto a single screen — assignee, status, priority, cycle, labels, estimate, timestamps — without feeling busy. Stripe showed Perionyx how to be calm. Linear shows how to be dense *and* calm. Financial workflows are the densest in software; Linear's density discipline is directly transferable.

3. **Keyboard-first professional flow.** CFOs and Treasurers live on the keyboard. Linear proves that a power-user input model does not have to alienate casual users — the shortcuts are discoverable, contextual, and progressively disclosed. Every Perionyx workflow (approvals, reconciliations, exception queues) has a keyboard path waiting to be built.

4. **Optimistic, local-first architecture.** Linear's sync engine applies mutations to a local IndexedDB before the server confirms, then reconciles deltas over WebSocket. The UI never waits. The critical lesson for Perionyx: optimistic UI is safe when the state is *representational* (task moved, view scrolled) but must be rejected for *money* mutations. The principle, not the mechanism, is what transfers.

5. **Opinionated software.** Linear refuses to be all things. Its philosophy — "simple first, then powerful" and "the tool works for you, not the other way around" — is a direct challenge to enterprise software's feature-bloat default. Perionyx's constitution (Clarity, Confidence, Speed, Beauty, Trust) already points this direction; Linear is the strongest commercial proof that opinionated restraint wins.

The verdict that will structure this document: **Linear is the benchmark for engineering speed and interaction craft; Stripe is the benchmark for financial trust and regulatory calm.** Perionyx should aim to be "the Linear of finance" — combining Linear's velocity and density craft with Stripe's trust and confidence systems.

---

# Section 1 — Executive Summary

## 1.1 The Product in One Paragraph

Linear is a purpose-built project and issue tracking tool for product development organizations. It is designed around a single primitive — the **issue** — organized into teams, projects, and cycles, and rendered through keyboard-first, local-first software that makes the act of tracking work feel as fast as thought. It launched in 2019 from Karri Saarinen (ex-Airbnb design lead) and Nan Guo (ex-Google), positioned against Jira's enterprise sprawl. By 2024-2025 it reached a reported ~$500M ARR and near-4-digit team headcount at scale customers, becoming the default tool for the world's most productive software teams. Its influence now extends beyond task tracking: Linear has become a *design culture*, cited as the visual and interaction benchmark for a generation of developer and internal tools.

## 1.2 Why Linear Is Worth Reverse-Engineering

| Dimension | Linear's Achievement | Why It Matters to Perionyx |
|---|---|---|
| Perceived performance | Warm start ~50% less code loaded for a 4,000-issue workspace; <100ms transitions; local-first rendering | CFO-grade latency expectations; "metrics render first" principle |
| Interaction craft | Keyboard-first command model, Peek previews, optimistic UI, selection model | Professional finance users work fast and stay in flow |
| Information density | High-density lists with color discipline; muted palette, saturated only for meaning | Financial tables are the densest UI in software |
| Opinionation | One really good way per action; refuses configurability where it creates chaos | Constitutional principle: clarity over choice-paralysis |
| Architecture | Local IndexedDB + MobX + batched sync + WebSocket deltas | Proves perceived speed is an architecture decision |
| Product process | No PMs, no A/B tests, taste-based decisions, single roadmap | Counterpoint to Perionyx's evidence-driven process — worth interrogating |
| Growth model | Category-creation: "Linear-style" is now a design genre | Perionyx's own design system aims to be genre-defining |

## 1.3 The Central Thesis of This Review

**Linear wins because it treats speed as an architectural value, density as a design value, and opinionation as a product value — and it makes all three legible to users.**

Every layer of the product reinforces this:

- **Architecture**: The sync engine inverts the client-server relationship. The browser database is the database the UI reads; the server is a synchronization and broadcast layer. The consequence is that every interaction *feels* instant because most interactions never wait for the network.
- **Design**: The interface is a masterclass in quiet density. A muted neutral palette carries structure; full saturation is reserved for status, priority, and interaction. The redesign program (2023-2025) was less about new features than about *removing visual noise* — aligned labels, consistent icons, honest hierarchy.
- **Product**: Linear has a point of view. It does not let you customize the Inbox. It pushes you toward cycles. It hides complexity until you need it. The tool works for you — you do not configure it into shape.

The corollary for Perionyx: **Perionyx's "enterprise" instinct — more options, more settings, more escape hatches — is precisely what Linear avoids, and what makes Linear beloved.** The right lesson is not "add enterprise config" but "make the core workflow so fast and so legible that configuration becomes unnecessary."

## 1.4 Scorecard: Linear on Perionyx's Design Principles

Perionyx's constitutional principles are Clarity, Confidence, Speed, Beauty, Trust. Evaluating Linear honestly against them — without forcing the fit:

| Principle | Linear's Grade | Evidence | Perionyx Translation |
|---|---|---|---|
| **Clarity** | A | One primitive (issue), one mental model, muted palette, aligned columns | The single-primitive lesson applies to financial objects (the invoice is Linear's issue) |
| **Confidence** | B- | Optimistic UI is confident *because* it is instant, but there is no "freshness/staleness" labeling; no source-verification for numbers | Perionyx must keep its freshness indicators; confidence is *architectural* here, *explicit* in Perionyx |
| **Speed** | A+ | The best-in-class example of perceived speed in modern software | The benchmark. Adopt the architecture-level approach |
| **Beauty** | A | Restraint, rhythm, one accent, Inter typography, GPU-composited motion | Confirms Perionyx's dark-first, restraint-first visual identity |
| **Trust** | B+ | Opinionation earns trust through consistency; redesigns preserve mental models | Perionyx's trust comes from audit trails, not consistency — complementary, not competing |

**Overall: 8.9/10** — Linear is the strongest reference yet for interaction craft, and the clearest proof that enterprise-grade software can feel consumer-fast.

## 1.5 What Perionyx Should Steal (Preview)

The fifty-six design decisions cataloged in Section 15 and the 100+ principles in Section 17 are the full answer. The executive preview:

**Adopt immediately (architecture):**
- Local-first optimistic rendering for *representational* state (filters, views, navigation, dashboards) — not for money.
- Batched mutation flushing with WebSocket deltas (the sync engine pattern).
- Command palette with context-aware, shortcut-labeled commands (`Cmd+K` as the global action surface).
- GPU-composited motion only; sub-100ms cause-and-effect transitions.

**Adopt immediately (design):**
- Muted default palette with saturation reserved for meaning (status, priority, alerts).
- Density discipline: align columns, consistent icons, one accent.
- Progressive disclosure of complexity: simple first, then powerful.

**Adapt for finance:**
- Peek preview (Space) becomes the invoice/approval/exception preview.
- Inbox + snooze becomes the "requires my attention" queue with deferral.
- Keyboard-first becomes a *complement* to existing command palette, not a replacement (finance users need both).
- Triage becomes the exception queue.

**Reject deliberately:**
- No A/B testing / taste-based-only decision-making at the product level (Perionyx's evidence-driven process stays).
- Optimistic UI for monetary mutations (reject outright — money must wait for the server).
- The "no guided onboarding" stance (finance operators need guided flows for compliance-critical setup).

## 1.6 The 10 Highest-Value Extractions

Ranked by expected impact on Perionyx:

1. **The sync engine inversion** — UI reads local, server synchronizes. Applies to Perionyx's dashboard/views layer.
2. **Opinionation as a feature** — one really good way per action; refuse to configure where chaos results.
3. **The selection model** — highlight vs select, bulk actions appearing *in context* at the bottom edge.
4. **Command menu with shortcut disclosure** — every command shows its shortcut, teaching power users invisibly.
5. **Peek preview** — Space-bar Quicklook for list items; navigate J/K without opening; opens the full record on demand.
6. **The muted-dense palette** — structure in neutrals, meaning in saturation.
7. **Batched local mutations** — collect, flush, reconcile. Applies to Perionyx form auto-save and filters.
8. **Cycles as a forcing function** — time-boxed work units. Translates to finance close cycles and approval SLAs.
9. **Inbox with snooze + digest urgency tiers** — the "requires-me" surface.
10. **The redesign-as-debt-payment model** — schedule design resets; pay design debt in concentrated sweeps.

---

# Section 2 — Product Philosophy

## 2.1 The Origin: "Bring Back the Magic of Software"

Linear's origin story is unusually legible for a product this successful. Karri Saarinen's stated mission for Linear is to "bring back the magic of software" — the sense, from the early web and early computing, that software could feel *effortless and delightful* rather than like a chore. The product was built explicitly against the dominant experience of work software: slow, bureaucratic, configurable into a mess, and full of process friction.

This philosophy has three operational consequences that Perionyx can observe in every screen:

1. **Software should work for you, not the other way around.** Users should not have to design their own workflows in the tool. The tool should come with a point of view. ("Flexible software creates chaos.")

2. **The individual's productivity is more important than the team's reports.** Linear explicitly states that keeping individual contributors productive is a higher-order goal than producing perfect status reports for managers. This is a radical inversion of the enterprise-software default, where reporting needs tend to shape the tool.

3. **Process is a cost, not a value.** "No one wants to waste time nitpicking the nuances of a process." Linear minimizes process ceremony wherever it can and makes the process that remains invisible and fast.

For Perionyx, these are provocative but valuable priors. A financial operating system cannot reduce process the way a task tracker can — finance *is* process, by regulation and by necessity. But the philosophy transfers at the level of *attitude*: the process exists to serve the decision, not the other way around; the tool should make the correct financial action the path of least resistance; and the operator's time is worth more than the report's completeness.

## 2.2 The Linear Method: Simple First, Then Powerful

Linear's public methodology (linear.app/method) is unusual: a software company publishing its operating doctrine. The "Linear Method" is a set of practices for running product development:

- **Simple first, then powerful.** Start every feature from the simplest possible version; add power only where users actually hit the ceiling. Complexity is earned, not presumed.
- **Cycles over continuous drift.** Work is organized into time-boxed cycles (default two weeks). Scope is set at the start; the cycle is the forcing function; whatever ships within the cycle defines success.
- **Focused backlogs.** Backlogs should be "short and focused" — a long backlog is a graveyard of abandoned intentions. Linear's model of triage and pruning treats the backlog as a living thing.
- **Brevity.** Write short specs. A spec is a decision, not an essay. (Linear's own product enforces this: its documents feature, specs, and issue descriptions all reward compression.)
- **The tool works for you.** Configure the tool to fit the work, not the work to fit the tool — but crucially, Linear supplies the configuration so you don't have to.

The Perionyx translation: **"simple first, then powerful" is the direct antidote to Phase 27.1R's finding that the Invoice Detail screen carries ~320 data points of cognitive load.** Linear's methodology would strip the invoice detail screen to the seven decisions that matter, and reveal the remaining fields through progressive disclosure.

## 2.3 Opinionation: One Really Good Way

Linear's most distinctive product stance is its willingness to *refuse* flexibility. Notable examples:

- **The Inbox is not customizable.** You cannot choose what appears in the notification Inbox. Linear decides (based on what you create, are assigned, or are mentioned in). The team's rationale: "flexible software creates chaos" — if every user configures their own notifications, nothing is ever acted upon consistently.
- **Triage is a team decision, not an individual one.** Teams adopt or reject triage as a unit; the workflow is enforced at the team level.
- **The backlog is a discipline.** Linear pushes teams toward pruning, not accumulating.
- **Cycles are the default rhythm.** Not "agile boards" — cycles. Linear believes in the method and ships it as the default.
- **Snoozing has rules.** You can snooze until a time or date; Linear decides when to re-surface it. You cannot invent arbitrary snooze semantics.

The design intent is consistent: **restricting user choice is a user service when the choices being removed are the ones that create disorder.** The corollary in enterprise software: a CFO does not want an approval matrix that can be misconfigured into unsafeness. Perionyx should adopt the same posture for financial *safety* settings (approval thresholds, segregation of duties, reconciliation rules) — restrict configuration where misconfiguration creates risk; expose configuration only where legitimate variability exists.

## 2.4 The Product Process That Produced It

Lenny's Podcast interview with Karri Saarinen (2025) revealed an unusually honest product process:

- **No PMs.** Linear has a single product team. Designers and engineers own their work end-to-end. The "PM" function is distributed.
- **No A/B tests.** Linear does not run A/B tests. Decisions are made by taste, by direct use, and by customer conversations.
- **Feature flags everywhere.** New features ship behind flags, often in weeks-long trials before the team commits.
- **Taste-based decision-making.** Karri's stated view: "most product decisions are taste decisions, and taste can be developed." The tool itself is the testing ground — Linear employees use Linear to build Linear, eating their own dog food at full intensity.
- **Single roadmap.** One roadmap, no market-research segmentation, no per-segment feature lists.
- **Paid work trials.** Linear's hiring process includes paid work trials — which double as product research, since candidates use (and critique) the actual product.

This is a deliberate counter-model to Perionyx's documented evidence-driven process (customer discovery, validation, EPS). The honest synthesis for Perionyx: **Linear's model works when the product is single-category, single-persona (product teams), and the builders are themselves the users.** It fails when the users are not the builders. Finance is the latter case — Perionyx's operators are CFOs, not software engineers. Perionyx's evidence-driven process is correct *for its market*; what it can adopt from Linear is the *speed* of decision and the *taste discipline* within a decision once evidence has set the direction.

## 2.5 Product Debt Is Intentional Borrowing

Linear is remarkably public about its debt. Two admissions stand out:

1. **Settings debt.** Linear acknowledges its settings/configuration surfaces accumulated debt — the 2023-2024 redesign explicitly paid this down, consolidating and aligning settings, labels, and icons across the product.
2. **Design debt generally.** Karri's essay "A design reset" argues that design debt is *inevitable and healthy* when a product ships continuously: every fast-moving product accrues visual and structural debt, and the correct response is periodic, concentrated "design resets" (2-3 year cadence), executed with CEO backing and a concept-first approach, rather than death-by-a-thousand-increments.

The Perionyx relevance is direct: Phase 22.0B (EDL) and Phase 26.x (Foundation) already embody the "design reset" pattern for the codebase. Linear's framework legitimizes and sharpens this: **a design reset is not a sign of failure; it is the scheduled amortization of product growth.** Perionyx should schedule EDL/UX resets as a recurring, funded program, not as an occasional fire drill.

## 2.6 "The Magic" Is a Design Decision, Not a Feature

The deepest philosophical layer: Linear treats speed and delight as *constitutive* of the product, not additive. Karri's framing — "magic" — is engineered through specific, named practices:

- **Cause-and-effect immediacy**: UI reactions complete within 100ms (the perceptual threshold for "cause and effect"); anything slower must communicate progress honestly.
- **Motion with purpose**: transitions are GPU-composited, duration scales with distance (80ms for color, 120ms for dropdowns, 200ms standard, 280ms for modals), and easing is tuned per interaction type.
- **No full-page reloads**: navigation state is client-side; the page never flashes.
- **Optimistic rendering**: mutations apply locally, then reconcile with the server.
- **The 60ms press**: active states respond within 60ms so every press feels acknowledged.

For Perionyx, the transfer is architectural: **"magic" is the name for the feeling users get when the interface never makes them wait, never makes them wonder, and never makes them doubt.** Perionyx's own constitutional promise — "CFOs don't wait" — is the same goal, and Linear is the existence proof that it can be delivered at enterprise data volumes.

## 2.7 Philosophy Scorecard: Adopt / Adapt / Reject

| Philosophy Element | Verdict | Perionyx Application |
|---|---|---|
| "The tool works for you" | **Adopt** | Ship opinionated default workflows (invoice → match → approve → pay) |
| Simple first, then powerful | **Adopt** | Reduce Invoice Detail cognitive load; progressive disclosure |
| Individual productivity over reports | **Adopt** | Prioritize operator flow over executive reporting in core screens |
| Cycles as forcing function | **Adopt** | Finance close cycles; approval SLAs; reconciliation cadences |
| No PMs / no A/B tests | **Reject** | Perionyx's evidence-driven process is correct for finance |
| Customizable-everything | **Reject** | Restrict configuration where misconfiguration = financial risk |
| Settings/design debt paid in resets | **Adopt** | Fund EDL/UX resets as scheduled programs |
| Optimistic UI for all mutations | **Reject (for money)** | Optimistic for representational state; server-confirmed for money |

## 2.8 The One-Sentence Philosophy

**Linear's philosophy is that software should be so fast, so focused, and so opinionated that using it feels like thinking — and that the product team's job is to make those decisions, not to hand them to the user.**

Perionyx's version of the sentence: *the platform should be so fast, so clear, and so trust-worthy that making a financial decision feels like thinking — and the engineering team's job is to make those decisions safe, not to hand the risk to the operator.*
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
# Section 5 — Workflows

## 5.1 Workflow Design Philosophy

Linear's workflows are built around a consistent thesis: **a workflow is a series of low-friction state transitions, each costing as close to zero cognitive effort as possible.** The product invests heavily in the *space between* explicit actions — selection, focus, defaults, keyboard continuity — so that the user's attention stays on the work, not the tool.

The core workflow patterns Linear has perfected:

1. **Create → Configure → Place** (issue creation: type a title, set fields via keys, place it in a team/project/cycle).
2. **Find → Act** (search or command menu → perform action on the found item).
3. **Highlight → Preview → Open → Edit** (the list-detail rhythm).
4. **Select → Bulk-act** (multi-select → batch operations in a floating action bar).
5. **Inbox → Review → Triage** (notification review, read/snooze/act).
6. **Cycle → Plan → Execute → Review** (time-boxed delivery).

Each is examined below, with the Perionyx translation alongside.

## 5.2 The Create Workflow (Create → Configure → Place)

Creating an issue is Linear's most polished micro-workflow, and it is designed to be *uninterruptible*:

- Press `c` from anywhere → a small creation popover opens, focus lands in the title field.
- Type the title. Tab or arrow down to secondary fields.
- **Inline field entry**: while the popover is open, type `s` to set status, `p` to set priority, and other single-key field shortcuts. The keys are letters, not modified combos — no pinky gymnastics.
- Assignees and labels are type-ahead searchable (start typing a name, pick from suggestions).
- **Context inheritance**: if created inside a team view, the team is pre-filled; inside a project view, the project is pre-filled; inside a cycle, the cycle is pre-filled. Creation *inherits context* rather than asking.
- `Enter` creates; the popover closes; **a new popover immediately opens** for the next issue if the user keeps typing. This "rapid creation mode" lets an operator create a stack of issues in seconds.
- `Esc` cancels. `Cmd+Enter` (or Tab past the fields) creates and opens the detail view.

The Perionyx translation: **invoice intake is the create workflow.** A vendor invoice should be creatable from anywhere, with context inheritance (from the vendor page → vendor pre-filled; from an exception → related invoice pre-filled), type-ahead for vendor/PO/GL code, single-key field entry for date/amount/currency, and a rapid-entry mode for batch invoice capture. The current "create invoice" flow — navigate to a form, fill thirty fields, submit, wait — is Linear's anti-pattern: a thirty-field form is not a creation flow, it is an import job.

## 5.3 The Find → Act Workflow

The command menu (`Cmd+K`) plus search (`/`) plus keyboard navigation creates a universal "find and act" loop:

1. `Cmd+K` → type 2-3 characters → the palette ranks by recency and relevance.
2. Arrow down → `Enter` → **or** type a command directly (`s` for status, `i` for issue creation, etc.).
3. The palette is *context-aware*: open in an issue, it offers issue-scoped commands first; open in a view, it offers view commands.

The palette's design rules (from the public docs):

- Commands are **grouped by function** (Navigation, Actions, Issue actions, etc.).
- Each command shows its **keyboard shortcut** beside it — the palette is simultaneously a tool and a *tutorial*.
- The **most relevant commands rank first** based on the current screen and selection.
- Commands support **fuzzy matching** (typing `st` matches "set status", "start", "stop").
- The palette includes **object navigation** (issues, projects, cycles, teams, users, labels, favorites, documents) — "open LIN-123", "go to #Mobile project".

Perionyx's existing CommandPalette (verified pre-existing in Phase 20.1) should be extended to Linear's specification: context-aware ranking, shortcut labels beside commands, object navigation across financial objects, and fuzzy matching. The "palette as tutorial" trick — showing the shortcut next to the command — is the cheapest power-user training mechanism in software, and Perionyx's AP workflows (approve, reject, delegate, escalate) are perfect palette actions.

## 5.4 The List → Detail Rhythm (Highlight → Preview → Open → Edit)

The dominant everyday workflow in Linear is the list-detail rhythm:

1. **Highlight** a row (`j`/`k` or arrows) — a subtle tint, no commit.
2. **Peek** it (`space`) — a quick-look preview opens beside the list, showing the full issue summary without leaving the list (Section 8).
3. **Navigate previews** — while peeking, `j`/`k` moves to the next/previous issue's preview (the preview "follows" the highlight).
4. **Open** (`enter`) — the full detail route/pane opens.
5. **Edit inline** — in the detail view, most fields are editable in place (status cycle buttons, priority chips, labels, assignees); `e` opens the full editor.
6. **Return** — `esc` collapses back; the list's scroll position and highlight are preserved (state continuity).

The Perionyx translation is direct and high-value: **the exception queue and approval queue should be a list-detail rhythm.** Highlight an exception (`j`/`k`), peek the invoice snapshot (`space`), approve/reject without leaving the list (single-key actions), open the full record only when investigation is required. This converts the most time-critical finance workflow — clearing exceptions and approvals — from "open each record, look, decide, close, next" (5-10 seconds of chrome per record) to "look, decide, next" (~1 second per record).

## 5.5 The Selection Model (Select → Bulk-act)

Linear's selection model is a masterclass in *disambiguation*:

- **Highlight** is a temporary "you are here" state (row tint, no checkbox).
- **Selection** is a commitment (checkbox + accent border + count in a floating action bar).
- `x` toggles selection on the highlighted row; `shift`+arrows / `shift`+click extends a range; `cmd+a` selects all filtered rows; `esc` deselects.
- When ≥1 rows are selected, a **floating action bar** appears at the bottom edge (inverted-contrast, never overlapping content): status, priority, assign, move to project/cycle, labels, archive, delete.
- The floating bar is **contextual** — actions shown depend on selection type (issues vs projects vs documents).
- Right-click a selection for the full context menu; `cmd+k` with a selection shows selection-scoped commands.

Design rules extracted: selection state must be *visually unambiguous* (accent border + count); bulk actions must appear *at the point of action* (bottom edge, thumb/keyboard reachable); and bulk operations must never destroy data silently (archiving and deletion confirm, and are recoverable).

Perionyx translation: **bulk financial actions** — batch-approve within threshold, batch-assign exceptions, batch-categorize ledger entries, batch-reconcile confirmations. The floating action bar pattern is exactly right for finance: it keeps the operator's eyes on the list while acting on many rows, and its confirm-on-destructive rule maps to Perionyx's "destructive = confirm" constitution.

## 5.6 The Inbox Workflow (Review → Read → Snooze → Act)

Linear's Inbox is the notification system as a workflow (Section 10 details it; here it is the workflow shape):

- New activity on issues you created, are assigned, or are mentioned in → auto-subscribed → appears in Inbox.
- `j`/`k` navigate; `u` toggles read/unread; `alt+u` marks all read; `h` snoozes (time or natural language: "2d", "after Friday").
- Actions are taken **from the Inbox row itself** (peek, open, update status, assign) — the Inbox is a queue, not a log.
- Email digests arrive by urgency (immediate for high-urgency, digest for the rest).
- The Inbox is deliberately not customizable — Linear decides what belongs.

Perionyx translation: **the "Requires My Attention" surface.** Approvals, exceptions, reconciliation breaks, and threshold breaches should flow into a single review queue with peek-and-act (approve/reject/delegate/snooze), urgency-tiered digests, and — critically for finance — **snooze with a reason** (defer an approval until a related document arrives; defer an exception until the bank confirms). The anti-customization stance transfers as: *the approval queue should not be configurable into incompleteness* — everything requiring the operator's decision is in it.

## 5.7 The Cycle Workflow (Plan → Execute → Review)

Linear's cycle workflow gives the two-week work rhythm an interface:

- **Cycle planning** at cycle start: pick issues into the cycle; the cycle's scope baseline is captured.
- **Execution**: issues move through team statuses; the cycle view shows remaining vs completed.
- **The burndown**: cycle view renders scope vs actuals — the plan's honesty, visualized.
- **Cycle review** at end: what completed, what slipped, what pulled in.

The interface enforces the method gently: nothing *requires* a cycle, but every team view makes the cycle state visible. The Perionyx translation: **the finance close cycle.** Month-end close has exactly this shape — a time-boxed set of steps (bank reconciliation, GL postings, accruals, variance review, approvals) with a baseline and a burndown. Rendering the close as a Linear-style cycle (scope, actuals, health, blockers) would give controllers the single best control surface for close management, and it maps 1:1 onto the existing approval matrix + reconciliation infrastructure.

## 5.8 The Triage Workflow (Intake → Decision)

Described in IA (4.4), triage deserves a workflow treatment because it is the *intake decision* loop:

- New issues → triage queue (unassigned, un-prioritized).
- Reviewer per-item decision: assign (to a person), convert (to a project/cycle), snooze, archive, trash.
- The triage screen shows **a queue of decisions, not a pile of work** — each row is "what should happen to this?"

The Perionyx translation: the **exception queue is triage.** Every exception (match failure, duplicate, missing PO, blocked invoice) should have a decision path: assign (owner), resolve (fix the match), snooze (waiting on vendor), reject (send back), or archive (acknowledged). Perionyx's 21A exception workflow already has the command semantics; what Linear adds is the *interface posture* — a decision queue, not a list.

## 5.9 Workflow State Continuity

One of Linear's least-visible but most valuable workflow properties is **state continuity across the workflow loop**:

- Returning from detail preserves the list's scroll position and highlight.
- Filters, grouping, and display settings persist per view (and per user for the workspace).
- The last-used view per team is remembered.
- Selection survives navigation within the same session where sensible (with clear visual "you have N selected" state).
- Undo (`cmd+z`) reverses the last action everywhere — including after navigation.

Perionyx's existing undo system (UndoProvider, 8s toast, Phase 20.1) is the right substrate; Linear's lesson is that undo should be *universal* (every mutation, not just form edits) and should survive navigation. For finance, undo-with-audit-trail is the ultimate confidence feature: the operator never fears a wrong click because the system logs and can reverse it.

## 5.10 Workflow Design Rules (Condensed)

1. Creation inherits context; never make the user re-enter what the screen already knows.
2. Support rapid entry (stacked creates); batch work is a first-class flow.
3. The command palette is a workflow surface, not a menu.
4. Keep the list-detail rhythm: highlight → peek → open → edit → return, with state preserved.
5. Selection is unambiguous; bulk actions appear at the point of action.
6. Destructive bulk operations confirm and are recoverable.
7. The review queue is a decision queue, not a log.
8. Snooze/deferral is a first-class action, with a reason where accountability matters.
9. Time-boxed units (cycles, close windows) get their own views with scope vs actuals.
10. Every state transition costs near-zero cognitive effort; chrome between actions is the enemy.

---

# Section 6 — Lists

## 6.1 The List as the Primary Surface

Linear is, at heart, a list product. Every view — board, timeline, split — is a *transformation* of the underlying list. The list design therefore carries the product's entire ergonomics. Its defining properties:

- **High density**: rows are ~32-40px tall in compact mode, packed with fields (identifier, title, status, assignee, priority, labels, cycle, estimate, dates).
- **Structural columns, not data walls**: columns (assignee, labels, dates) are rendered as compact chips and avatars, not verbose text.
- **Column alignment**: identical fields align vertically across all rows — the eye learns a "field highway" and can scan vertically.
- **Muted hierarchy**: primary text (title) is near-full opacity; metadata is 40-60% opacity; icons are small and quiet.

## 6.2 The Row Anatomy

A canonical Linear row, left to right:

```
[checkbox zone] [ID] [Title + comment count/attachments] [labels] [cycle chip] [estimate] [status chip] [priority icon] [assignee avatar] [due date]
```

Design notes per zone:

- **Checkbox zone**: invisible until hover or keyboard focus; `x` or click toggles. The checkbox appears *on demand* to preserve density — the affordance exists without the visual noise.
- **Identifier**: the `LIN-123` code — short, monospaced, quiet. Searchable, speakable, referenceable. Perionyx's equivalents (`INV-2026-0042`) should be as prominent and copyable.
- **Title**: the only full-opacity text; truncates with ellipsis; wraps in split view when enabled. Comment and attachment counts appear as quiet icon+count.
- **Metadata chips**: labels as tinted chips, cycle as a small pill, estimate as a number. Chips are *deselected by default* (gray) so color always means something.
- **Status chip**: the status is colored — the *only* saturated element in a calm row, plus a small icon (backlog ◉, in-progress ▶, etc.).
- **Priority**: icon only (Urgent double-red, High ↑, Medium →, Low ↓, No priority muted) — a *legend-free* encoding system (icons are self-evident).
- **Assignee**: avatar (initials, color-coded by user); hover shows name; unassigned shows an empty slot affordance.
- **Due date**: compact date, red when overdue, inline editable via date popover.

## 6.3 List Modes and Density

Linear offers explicit density control:

- **Compact vs Comfortable**: compact squeezes rows to ~32px, hiding secondary chips behind hover; comfortable expands to ~44px with all chips visible.
- **Hide columns**: columns are toggleable (priority, labels, cycle, etc.).
- **Row height** scales with content when the list is in "wrap" mode (title wraps to 2 lines) — critical for long financial descriptions.
- **List vs Board vs Timeline vs Split vs Fullscreen** are the presentation layer over the same filtered set (4.6).

The Perionyx connection is direct: EnterpriseTable already has ultra-compact density (Phase 8B.4). Linear validates the direction and adds the *hover-reveal* discipline — compact rows should reveal their secondary data on hover rather than showing everything always. Perionyx's cell formatters (CurrencyCell, DateCell, StatusCell, TagsCell) already do the chip-and-badge work; the Linear lesson is about *restraint*: fewer always-on chips, more hover-reveal, and a legend-free icon vocabulary.

## 6.4 List Operations

- **Sort**: by priority, status, assignee, labels, cycle, estimate, dates, last updated, manual.
- **Filter**: via the filter bar — assignees, labels, projects, cycles, estimates, dates, priority, status, custom fields. Filter chips are additive and removable; `cmd+f` searches within.
- **Group**: by status, assignee, priority, labels, project, cycle — group headers render as sticky, condensed rows with counts.
- **Manual ordering**: drag-and-drop (with a satisfying "pick up / drop" animation) or `alt+shift+arrows` to move selected rows.
- **Bulk operations**: via selection (5.5).

The design intent is that *no list is a dead end*: whatever the user's mental query, it is expressible as a filter or sort on the same list. Perionyx's AP work queue (H-01 canonical filters) already has this shape; Linear adds the *saved view* layer on top (save any filtered/sorted state as a named view, share it, favorite it).

## 6.5 List State Persistence

- The **last filter/sort/group** applied to a view persists for the user.
- **Saved views** (custom, shareable) exist at workspace, team, and personal scope.
- Scrolling, highlight, and selection survive round-trips to the detail view.
- **Virtualization**: Linear renders only visible rows (windowing) — a 4,000-issue list scrolls at 60fps because only ~40 rows exist in the DOM.

The virtualization lesson matters to Perionyx's ledger: the EnterpriseTable already virtualizes (Phase 8B.4 notes), and Linear confirms that at financial data volumes, windowing is not optional — it is the performance floor.

## 6.6 Empty and Edge States

- **No results**: "No issues match your filters" + one-click clear.
- **Empty team/project/cycle**: illustrated empty state with a primary create action.
- **Loading**: skeleton rows (not spinners) that match final row anatomy — the skeleton *is* the layout, so nothing jumps when data arrives.
- **Error**: compact inline banner with retry.

Linear's skeleton discipline is worth naming explicitly: skeletons are *layout-accurate*, meaning perceived load is instant (the user sees the shape of the data immediately). Perionyx's LoadingSkeleton (8B.7) follows the same principle; the Linear standard is to make skeletons row-accurate, not just block-accurate.

## 6.7 List Design Rules (Condensed)

1. Lists are the primary surface; boards/timelines are transformations of the list.
2. Density is a feature: compact rows, hover-reveal for secondary data.
3. Alignment is sacred: identical fields align vertically; the eye scans columns.
4. Saturation is reserved for meaning (status, priority, alerts).
5. Icons encode meaning without legends where possible.
6. Every list state is expressible as filter/sort/group on the same set.
7. Save, share, and favorite list states as views.
8. Lists virtualize; only visible rows exist in the DOM.
9. Skeletons match the final layout row-for-row.
10. Empty states offer one-click recovery and a primary action.

---

# Section 7 — Detail Views

## 7.1 The Detail View's Job

Linear's detail view (the issue page) answers one question at a time and keeps every answer *actionable*. It is split into three logical zones:

1. **The content zone** — title, description, comments (the "what").
2. **The properties sidebar** — status, priority, assignee, cycle, labels, estimates, dates, parent/children, related issues (the "state").
3. **The activity timeline** — events in chronological order: created, moved, commented, linked (the "history").

The architecture lesson: content, state, and history are *separated into zones* rather than interleaved. Perionyx's Invoice Detail (flagged at ~320 data points in Phase 27.1R) should adopt exactly this three-zone structure: what (document + line items + evidence), state (approval status, match status, exception flags), and history (the audit timeline the controller needs).

## 7.2 Editing In Place

Almost everything in the detail view is editable in place:

- Title: click to edit inline.
- Description: rich-text editor; `e` opens full editor; `/` commands inside the editor (slash commands for mentions, images, embeds, code, lists).
- Properties: each sidebar field is a control (status = cycle buttons; priority = icon buttons; assignee = avatar picker; dates = calendar popovers; labels = chip picker).
- Comments: inline composer with `@` mentions, `cmd+enter` submit, editing and reactions.

The editing model is **modal-free**: no "save" buttons per field; edits commit on blur/enter, and everything is undoable. The Perionyx translation for the Invoice Detail: the state sidebar (match status, approval status, exception flags) should be *editable controls*, not read-only badges — a controller resolves an exception by acting on the field, not by opening a different form.

## 7.3 The Properties Sidebar as State Machine

The sidebar is where Linear's status model lives: statuses are a team-defined *workflow*, rendered as sequential buttons (Backlog → Todo → In Progress → In Review → Done) with the team's exact set. The design decisions:

- **Sequential statuses, not a dropdown**: the workflow is visible as a track; one click moves the issue forward. Users see *where it is* and *where it can go*.
- **Priority as icons** (legend-free encoding).
- **Cycle and dates as time structure** (what's committed, when).
- **Labels as cross-cutting taxonomy** (filterable everywhere).

For Perionyx's approval flows, the status track pattern is a direct upgrade: **render the invoice's approval chain as a visible track** (Received → Matched → Approved → Scheduled → Paid → Reconciled) where the operator sees the whole path and the current position — the "approval path donut" already built in Phase 8B.5's ApprovalAnalytics is the analytics version; Linear shows the *operational* version on the record itself.

## 7.4 Relations: Parent, Children, Related

Issues relate to other issues:

- **Parent/child**: subtasks and epics (a parent issue can have children; boards can nest by parent).
- **Related issues**: a linked list with direction (blocks / is blocked by / relates to).
- **Duplicates**: marking an issue as a duplicate links it and closes the copy.

For Perionyx's Invoice Detail, the relations zone is where **evidence and provenance live**: the PO, the GRN, the receiving documents, the approval chain, the payment, the reconciliation record. Phase 27.0A's "AI context building" and 21A's evidence model already define these relations; the Linear lesson is to render them as first-class linked records in the detail view (with status propagation visible — "this invoice is blocked by missing GRN").

## 7.5 Activity Timeline as Audit Trail

Every mutation to an issue records an activity event: `Created by X`, `Status changed to In Progress by X`, `Assigned to Y by Z`, comments, links, archive. The timeline is:

- **Chronological** (oldest → newest), never editable, always attributed.
- **Rendered with icons per event type** (status, assignment, comment, link) so history is scannable.
- **Filterable** (by actor, by event type) in large histories.

This is, structurally, the audit trail Perionyx already has (tamper-evident chains, Phase 16/17). Linear's contribution is the *interface* pattern: the audit timeline rendered as a first-class scannable surface with per-event-type icons and actor attribution. Perionyx's audit-log pages should adopt Linear's event taxonomy visual language — icon per event type, actor, timestamp — because controllers and auditors *scan* history; they do not read it.

## 7.6 The Empty and Sparse Detail States

- **New issue**: pre-filled from creation context (team, project, cycle, assignee); a guided "add a description" hint when empty.
- **Sparse fields**: fields that are unset render as quiet, clickable placeholders ("+ Add assignee", "No priority") — every empty field is an affordance, not a void.
- **Long descriptions**: collapsible sections; `/` slash commands for structure.

Perionyx's sparse-state lesson: **an unset field is an invitation to set it.** The invoice detail's empty fields (GL code unassigned, category unset) should render as actionable affordances, not as blank space — because a blank field on a financial record reads as "incomplete" and invites investigation.

## 7.7 The Split View: Detail Beside Context

Linear's Split view shows the list and detail side by side — the detail updates as the highlight moves (`j`/`k`), so the user can "walk" the list while reading each record. This is the highest-density detail interaction in the product and the direct predecessor of Peek (Section 8).

For Perionyx's exception and approval queues, Split is the ideal operational view: list of exceptions on the left, the selected exception's full context on the right, keyboard-walk through the queue. This is the "approval triage" screen Perionyx should build.

## 7.8 Detail View Design Rules (Condensed)

1. Separate content, state, and history into zones.
2. Make every state field an editable control, not a read-only badge.
3. Render workflows as sequential status tracks, not dropdowns.
4. Relate records explicitly (parent/child/related/blocked-by) with visible propagation.
5. Render activity as a scannable, attributed, chronological timeline with per-type icons.
6. Every unset field is an affordance ("+ Add").
7. Support list+detail split for operational review.
8. Preserve list state when returning from detail.
9. Modal-free editing: commit on blur/enter; everything undoable.
10. Keep the detail view focused: one question per screen zone.
# Section 8 — Interaction Design

## 8.1 The Interaction Philosophy

Linear's interaction design is governed by one measurable standard: **the interface must never make the user wait, and every input must be acknowledged within the perceptual threshold of causality (100ms).** Every interaction pattern below is a consequence of that standard.

Three named thresholds structure the entire interaction system (from the motion analysis and Karri's design talks):

- **60ms** — press feedback: an active state must render within 60ms so the press feels acknowledged.
- **100ms** — cause-and-effect: reactions to input complete within 100ms; slower work must communicate progress explicitly.
- **200ms** — the standard transition budget; modals may take up to 280ms (they are the slowest deliberate transition in the product).

## 8.2 The Interaction Primitives

Linear's interaction vocabulary is small, consistent, and learnable:

| Primitive | Example | Design Purpose |
|---|---|---|
| **Inline edit** | Click a title, field, or chip → edit in place | No mode switches; commit on blur/enter |
| **Popover** | Property pickers, date pickers, filters | Contextual control without leaving the row |
| **Peek** | Space-bar Quicklook preview | Fast context without navigation (8.4) |
| **Highlight** | Row tint on keyboard focus | "You are here" — no commitment |
| **Selection** | Checkbox + accent border + floating action bar | Committed multi-row operations |
| **Drag-and-drop** | Reorder rows, columns, sidebar items | Direct manipulation with momentum-aware animation |
| **Context menu** | Right-click on any object | Full action surface, discoverable |
| **Command palette** | `Cmd+K` | Universal action + navigation + creation surface |
| **Toast** | Undo confirmation, transient feedback | Non-modal confirmation of outcomes |
| **Modal** | Issue deletion confirm, settings dialogs | Rare, deliberate, focus-required operations |

The pattern to note: **the product minimizes the number of distinct interaction "modes"** — there is no "edit mode", no "organize mode", no "admin mode" bolted onto the UI. Everything is editable in place; everything is reachable without leaving context.

## 8.3 Inline Edit and the Modal-Free Principle

Linear's modal-free editing is the strongest interaction stance in the product:

- Click any field → the control appears *in place* (status → button track; assignee → avatar picker; title → input).
- Commit on blur or `enter`; `esc` reverts.
- Every edit is undoable (`cmd+z`).
- There is almost no "Save" button in the product for single-field edits; Save is reserved for long-form editors (documents, full issue editor).

The Perionyx relevance is acute: the AP workflow's exception resolution, approval decisions, and reconciliation marking are *single-field mutations* that Perionyx currently wraps in forms and dialogs. Linear's modal-free rule would make "resolve exception," "mark matched," and "approve" into in-place actions on the list row or detail sidebar — a direct speed win for the operator.

## 8.4 Peek: The Space-Bar Quicklook

Peek is Linear's signature interaction, and it deserves the deepest treatment in this section:

- Press `space` (hold or toggle) on a highlighted row → a **preview panel** slides in beside the list, showing the full issue: description, properties, comments, activity.
- The preview is **non-navigating** — you remain in the list; the scroll position and highlight are untouched.
- While the preview is open, `j`/`k` **move the preview to the next/previous row** — you can walk the entire list through previews.
- `enter` or `esc` closes to the list; `shift+enter` (or similar) promotes the peek to the full detail view.
- Peek is **dismissible and tolerant** — `esc` or `space` toggles; it never blocks; it is the "hover intent" made explicit and keyboard-first.
- Peek also works in the command palette (peek a command's docs) and on project rows (peek the project graph).

Why Peek is genius for enterprise software:

1. **It eliminates the "open/close every record" tax.** The dominant cost in list review is not the work — it is the navigation. Peek removes navigation from the loop.
2. **It is modal without being a modal.** It covers the list, but the list remains the reference frame; context is never lost.
3. **It is keyboard-native.** Built for the power user, usable by everyone (the hold-to-peek is natural even with a mouse).
4. **It scales the list to operational review.** For a finance operator clearing 50 exceptions, Peek converts a 10-minute chore into a 2-minute flow.

**Perionyx must build Peek.** The exception queue, approval queue, reconciliation breaks, and ledger rows all want it: `space` on a highlighted row → preview the invoice snapshot / approval context / reconciliation state → `j`/`k` to walk → act (approve/reject) without opening. The EnterpriseTable's existing inline-edit (Phase 8B.4) and the mobile ApprovalQuickView are the foundations; Peek is the desktop expression.

## 8.5 The Floating Action Bar

When rows are selected (Section 5.5), a **floating action bar** appears anchored at the bottom edge. Properties:

- Inverted contrast (light-on-dark in the light theme; elevated in dark) so it reads as "the action surface."
- Contextual actions based on selection type and content (status, priority, assign, cycle, project, labels, archive, delete).
- Count display ("3 selected") plus the keyboard path to act on them.
- Never overlaps content; the list is *slightly* reduced in height (content shifts, not hides).

The floating-bar pattern is Perionyx's bulk-action target: batch-approve, batch-assign, batch-categorize should live in a floating surface that appears exactly when the user commits to a selection — never before, never after.

## 8.6 Drag-and-Drop with Momentum

Linear's drag-and-drop is unusually physical:

- Rows "pick up" with a scale-up and shadow; the drop target highlights; the row "settles" with a small elastic settle.
- Dragging speed influences drop animation (momentum — fast drags land with more travel, slow drags settle locally).
- Drop zones (board columns, list positions, sidebar items) highlight precisely before commit.

The design intent is *direct manipulation that communicates*: the user always knows what will happen before it happens, and the animation makes the state change legible. For Perionyx's board/queue reordering and approval drag-flows, the lesson is the *pre-commit affordance*: show the target before the user releases.

## 8.7 Context Menus and Right-Click

Right-clicking anywhere in Linear opens a context menu scoped to the object under the cursor — rows, columns, sidebar items, the board background, the command palette itself. Rules:

- The menu always shows the **relevant actions for the exact object** (row → issue actions; column → column actions; background → view actions).
- Keyboard shortcuts are **displayed in the menu** (the learnability trick again).
- The menu supports keyboard navigation (arrows + enter) once open.

For Perionyx: every list row and every record should expose a full action surface on right-click, with shortcuts labeled. Finance operators live in these menus (approve, reject, delegate, escalate, link, audit).

## 8.8 Toasts and Undo

- Mutations confirm via a brief toast (bottom-center or bottom-right), typically with an **Undo** action.
- Toasts are transient (~3-5s), non-modal, and stack with animation.
- Destructive actions (archive, delete) require confirmation; the toast offers the recovery path.

Perionyx already has UndoProvider with 8s toasts (Phase 20.1) — the Linear refinement is that undo must attach to *every* mutation and the toast must offer the undo *in place* (the user never searches for recovery).

## 8.9 Progression and Loading Honesty

When the interface *cannot* be instant (large exports, file uploads, initial sync), Linear communicates progress honestly:

- Skeleton rows during load (layout-accurate).
- Inline progress states on buttons ("Syncing…", "Uploading 45%").
- The **sync status indicator** (top-left) shows connection state — offline, syncing, synced — so the user always knows whether the local state is trusted.
- Errors are inline, actionable, and retryable — never a dead-end dialog.

Perionyx's DataFreshnessIndicator (Phase 20.1) is the same concept; Linear's addition is the *global* connection/sync status in the chrome — always visible, never ambiguous. For finance, "is what I'm seeing current?" is a trust question; a permanent, honest sync indicator is the answer.

## 8.10 Interaction Design Rules (Condensed)

1. Never make the user wait; acknowledge every input within 100ms.
2. Minimize interaction modes: edit in place, commit on blur/enter, undo everything.
3. Build Peek: preview in context, walk with `j`/`k`, promote to full view on demand.
4. Floating action bars appear exactly when selection commits.
5. Drag-and-drop communicates pre-commit targets and momentum.
6. Context menus are scoped, keyboard-labeled, keyboard-navigable.
7. Toasts carry the undo; destructive actions confirm and offer recovery.
8. Skeletons are layout-accurate; progress is honest; errors are inline + retryable.
9. Show sync/connection state globally and permanently.
10. Every interaction is reachable by mouse and keyboard with equal speed.

---

# Section 9 — Performance

## 9.1 Performance as a Design Decision

Linear's most-cited property — and the reason developers evangelize it — is speed. The critical framing: **Linear treats performance as a design decision with architecture behind it, not an optimization task.** Karri and the engineering team have been public about the architecture that makes the perception of speed real:

- **Cold start**: service worker precaches the app shell (~1,200 hashed assets in recent versions); the load is a parallel batch, not a waterfall.
- **Warm start**: the app loads from the service-worker cache and IndexedDB; a 4,000-issue workspace starts with ~50% less code loaded than the cold path.
- **Steady state**: mutations are applied locally and reconciled; rendering is reactive (MobX) and diffed (precise per-property updates); navigation is client-side.

The measurable outcomes: sub-200ms warm start at enterprise data volumes, sub-100ms transitions, 60fps scrolling on virtualized lists, and — the headline — **no perceived waiting at all** for routine operations.

## 9.2 The Architecture That Makes It Possible

The technical teardown (performance.dev "How is Linear so fast?" and the engineering team's sync-engine talk) documents a coherent stack:

**The client as the database:**
- The UI reads from a local **IndexedDB** database that mirrors the workspace's relevant data.
- An in-memory **MobX observable object pool** holds hydrated records; components subscribe to specific properties.
- Reads never hit the network in the common path — the browser database is the database the UI reads.

**The mutation pipeline (optimistic, batched):**
1. User mutates (e.g., `issue.title = x; issue.save()`).
2. The change applies **locally and synchronously** — the UI re-renders instantly.
3. The mutation is enqueued in a **mutation queue** (with the entity, change, and a local timestamp).
4. The queue **flushes in batches** (debounced ~100-300ms) to the server as a compact sync payload.
5. The server applies changes, assigns canonical timestamps, and **broadcasts deltas** to all connected clients via **WebSocket**.
6. Other clients apply the deltas; the originator receives confirmation and can detect **conflicts** (rare, since collaboration is on distinct fields) which reconcile via total ordering (`lastSyncId`).

**The result: the UI never waits for the network in the common path.** Network latency is absorbed by local-first application + batched reconciliation. The "save" that users perceive as instant is real: the local state *is* the source of truth for rendering; the server is the source of truth for *consistency*.

## 9.3 What Perionyx Should and Should Not Copy

This is the most important architectural judgment in the review, and it must be precise:

**Copy the pattern for representational state.** Perionyx's dashboards, filters, views, ledger navigation, and form state are representational: rendering them from a local cache while syncing in the background is safe and massively improves perceived speed. The existing cache layer (Phase 7E.3) and stale-while-revalidate pattern already gesture here; Linear proves the endpoint: a full local store + batched sync + delta broadcast.

**Reject the pattern for money.** A monetary mutation — approving a payment, posting a GL entry, executing a transfer — must NEVER render optimistically against an unconfirmed server state. Perionyx's constitution (Trust, Confidence) and its financial integrity work (Phase 19.x) require server-confirmed commit, idempotency keys, and audit recording *before* the UI shows success. The correct hybrid:

- **Representational layers** (what the operator sees and navigates): optimistic, local-first, batched.
- **Financial mutations** (what the operator commits): server-confirmed, idempotent, audited, with honest in-flight states ("Saving…", "Confirming with bank…").

The principle is one sentence: **optimism for views, certainty for money.**

## 9.4 The Rendering Discipline

Beyond architecture, Linear's rendering discipline:

- **Windowing**: only visible rows render (virtualized lists; 4,000 issues, ~40 DOM rows).
- **Per-property reactivity**: MobX subscriptions are field-level; changing a priority re-renders the affected cell, not the row, not the list.
- **GPU-composited animation**: only transform/opacity animate; no layout thrash.
- **No full-page reloads**; navigation is a state transition.
- **Batch DOM writes** in mutation flushes (avoid jank from many small writes).

The Perionyx translation is already partially true (virtualized-table, React 19, server components). The gap is *per-property reactivity*: Perionyx's tables should re-render cells, not rows, when a field changes (e.g., a status badge flipping from "Pending" to "Approved" should not re-render the entire row). This is a measurable performance and smoothness win for the ledger at scale.

## 9.5 Startup Strategy

- **Cold load**: minimal critical-path HTML/CSS/JS; the app shell renders instantly (skeleton); the rest loads as a parallel batch from the service worker.
- **Warm load**: service worker serves cached shell; IndexedDB hydrates data; authentication is checked *in the background* (the famous "do we have anything to show you?" pattern — Linear renders the workspace from local data before confirming the session, because showing stale-but-local data instantly beats showing a spinner).
- **Data hydration**: critical views render from local cache first; fresh deltas apply as they arrive; the sync indicator reflects the gap.

The Perionyx lesson: **the first render should come from local, cached, last-known-good state — then reconcile.** The DataFreshnessIndicator already tells the operator when state is stale; the startup experience should *render the stale state instantly* and let freshness be the honest label, rather than blocking on a fetch. (For money screens — balances, cash positions — the freshness label must be prominent; for views/navigation, instant local render is pure win.)

## 9.6 Perceived-Performance Checklist (the Linear Standard)

A condensed checklist Perionyx should hold every screen to:

1. Warm open of a data-heavy screen renders from local cache in <200ms.
2. Every input acknowledges within 100ms.
3. Navigation is client-side; no full-page reload.
4. Lists virtualize; rows are the unit of re-render only where necessary.
5. Animations are GPU-composited (transform/opacity only).
6. Skeletons are layout-accurate (no layout shift when data arrives).
7. Sync/connection state is visible; staleness is labeled.
8. Money mutations are server-confirmed; only views are optimistic.
9. Background sync batches; the UI never blocks on the network.
10. The "first paint shows something useful" rule — never a blank screen with a spinner.

## 9.7 Performance Rules (Condensed)

1. Performance is an architecture decision, not an optimization task.
2. Reads come from local state; writes reconcile in batches; the network is a sync channel.
3. Optimism for views; server-confirmed certainty for money.
4. Render only visible rows; re-render only affected cells.
5. Animate only transform/opacity on the GPU.
6. First paint always shows something useful (last-known-good beats a spinner).
7. Startup checks auth in the background, not on the critical path.
8. Label staleness honestly; never imply freshness you don't have.
9. Batch DOM writes; avoid jank from micro-updates.
10. Measure the perceptual thresholds (60/100/200ms), not just the technical ones.

---

# Section 10 — Keyboard-First Design

## 10.1 The Keyboard-First Thesis

Linear's keyboard model is not an accessibility add-on or a power-user mode — it is **the primary input model, designed first**, with the mouse as the discoverable fallback. The evidence: every function in the product is keyboard-reachable; most are keyboard-*faster*; the mouse never enables a capability the keyboard lacks. This inversion is what makes Linear's density possible — a screen that needs no visible toolbar space for every action can afford to be calm.

The Perionyx precedent: the CommandPalette (Cmd+K) already exists and the shell registered keyboard shortcuts in Phase 8B.9. Linear's model is the full expression of the same direction, and it is the single most transferable UX pattern in the review for finance professionals — who live on the keyboard.

## 10.2 The Shortcut Vocabulary

The complete vocabulary organizes into tiers:

**Global (everywhere):**
```
?            Help / shortcut reference (a full command reference overlay)
Cmd+K        Command palette
Cmd+/        Shortcut list overlay
/            Workspace search
Cmd+F        Find in current view
c            Create issue
Cmd+Enter    Confirm/submit in dialogs
Cmd+Z / Cmd+Shift+Z   Undo / Redo
```

**Navigation:**
```
g i          Go to Inbox
g m          Go to My Issues
g v          Go to Views
g a          Go to All Issues
g c          Go to Cycles
o i          Open issues (recent)
o c          Open cycles
o p          Open projects
o f          Open favorites
o u          Open users
o t          Open teams
o v          Open views
o d          Open documents
.            Command menu (drop-in, home-row)
```

**List navigation:**
```
j / k        Move highlight down/up (also ↑/↓)
space        Peek highlighted row
enter        Open highlighted row
x            Toggle selection on highlighted row
shift+↑/↓    Extend selection range
cmd+A        Select all filtered rows
esc          Clear selection / close
```

**Issue actions (in detail or on selection):**
```
s            Set status (then a letter for the status)
p            Set priority (u/h/l)
a            Assign (then type name)
l            Set labels
t            Move to team
e            Open full editor
h            Snooze (Inbox)
u            Mark read/unread (Inbox)
alt+u        Mark all read
shift+enter  Submit comment
```

The design genius is in the *mnemonics and tiering*: single letters for actions (`c`, `s`, `p`, `e`), two-letter `g`/`o` destinations, and modifiers for safety (`cmd+z` undo, `esc` cancel). Learning cost is trivial; the payoff compounds because every shortcut is *revealed* by the interface (palette shows them; context menus show them; the `?` overlay lists them).

## 10.3 The Command Palette as Shortcut School

The palette is simultaneously the tool and the teacher:

- Every command lists its shortcut.
- Fuzzy matching accepts partial input.
- Contextual ranking surfaces the most relevant commands first.
- The palette is reachable from anywhere (global `Cmd+K`) — including from within other dialogs.

The pedagogical effect is silent: **users adopt shortcuts at the speed they see them.** Perionyx's CommandPalette should render every command's shortcut label (it already has the commands; the labels are the missing teacher).

## 10.4 Keyboard Reachability as a Design Standard

Linear holds every screen to the standard: **everything reachable, everything labeled, nothing hidden behind a mouse-only path.** The concrete standards:

- Every list row is keyboard-navigable (highlight model).
- Every row action is keyboard-available (single keys + palette + context menu).
- Dialogs and modals are keyboard-closable (`esc`), keyboard-submittable (`cmd+enter`), and focus-trapped.
- The `?` overlay is a complete reference, searchable, and keyboard-navigable.
- No keyboard shortcut conflicts with typing (shortcuts are contextual — disabled in text fields — or require modifiers).

## 10.5 Contextual Shortcut Discipline

The subtle mastery is in *when* shortcuts are active:

- In a text field, plain letters type; shortcuts require modifiers (`cmd+k` still works; `s`/`p` do not).
- In a list, single letters are actions (because nothing is being typed).
- In a dialog, `cmd+enter` submits; `esc` cancels; arrows navigate options.
- The palette's typing context is the query, not the app.

This contextual discipline is what makes keyboard-first safe: **single-key shortcuts only exist where typing doesn't.** Perionyx's AP forms (invoice entry, exception resolution) must define these zones explicitly — form fields vs. list rows vs. dialogs — so that "a" means "assign" on a list row but types "a" in a description field.

## 10.6 The Accessibility Argument (Keyboard ≠ Disability Feature)

Linear's keyboard model is genuinely accessible — the entire product is operable by keyboard alone — but its *origin* is not the accessibility checklist; it is the belief that keyboard speed is a *productivity* feature for everyone. The consequence is the best of both worlds: an accessibility win that was designed as a power-user win. Perionyx should treat its keyboard model the same way: **build keyboard-first as a speed feature for CFOs and controllers; accessibility compliance follows as a byproduct of a design where nothing requires a mouse.**

## 10.7 Translation to Perionyx

| Linear Shortcut Model | Perionyx Translation | Recommendation |
|---|---|---|
| `?` help overlay | Existing KeyboardShortcutsDialog (8B.9) | Keep; make it searchable and grouped |
| `Cmd+K` palette with shortcuts shown | Existing CommandPalette | Add shortcut labels; add contextual ranking |
| `g`/`o` mnemonic destinations | Global finance destinations | Design `g a` (approvals), `g e` (exceptions), `g l` (ledger), `o i` (invoices) |
| `j`/`k` highlight + `space` peek + `x` select | EnterpriseTable lists | The single highest-value keyboard adoption for the ledger/queue screens |
| Single-key actions (`s`, `p`, `a`) | Approval actions | `y` approve, `n` reject, `d` delegate, `e` escalate (in list context only) |
| `esc` everywhere | Universal close/cancel | Audit every dialog for `esc` + focus return |
| Contextual shortcut zones | Form vs list vs dialog zones | Define per-zone shortcut maps; never collide with typing |
| `cmd+z` universal undo | Existing UndoProvider | Extend undo to all mutations, with audit trail |

## 10.8 The Finance-Keyboard Case

Why keyboard-first is *especially* right for finance, not just software:

- **Controllers and treasurers process queues**: approval lists, exception lists, reconciliation breaks. The list-detail rhythm (highlight → peek → act) is their daily motion.
- **Speed = capacity**: a batch of 40 pending approvals cleared at 2 seconds each vs 10 seconds each is 5 minutes vs 33 minutes per day. For a finance team of four, that's hours per week.
- **Keyboard = focus**: no mouse chase means the eye never leaves the data; fewer errors, faster decisions.
- **Audit-friendly**: keyboard actions are discrete, scriptable, and observable — they map to clean audit events.

## 10.9 Keyboard Design Rules (Condensed)

1. The keyboard is the primary input model; the mouse is the discoverable fallback.
2. Everything is keyboard-reachable; nothing requires a mouse.
3. Shortcuts are mnemonic and tiered (single-letter actions, `g`/`o` destinations, modifier safety).
4. The palette is the shortcut school: every command shows its shortcut.
5. Contextual shortcut zones prevent typing conflicts.
6. `esc` is universal; dialogs are focus-trapped and `cmd+enter`-submittable.
7. The `?` overlay is a complete, searchable reference.
8. Design keyboard-first as a speed feature; accessibility follows as a byproduct.
9. Undo (`cmd+z`) is universal and survives navigation.
10. Every list row is navigable, peekable, selectable, and actionable from the keyboard.
# Section 11 — Visual Design

## 11.1 The Visual Thesis: Calm Density

Linear's visual identity is best summarized as **calm density** — the maximal information per pixel consistent with zero perceived clutter. It achieves this through four discipline-based pillars:

1. **Neutrality of chrome** — structure and controls live in muted neutrals; the eye is never competing with chrome for attention.
2. **Saturation as meaning** — the palette is nearly monochrome by default; color is *earned* by status, priority, and interactivity.
3. **Alignment as rhythm** — dense grids, aligned columns, consistent iconography, and a 4px spacing base create a rhythm that reads as "engineered."
4. **Typography as hierarchy** — Inter Display for headlines, Inter for body, JetBrains Mono for identifiers and codes — a two-typeface system that stays out of the way.

## 11.2 The Palette

Linear's palette discipline is the most copied design system in developer tools, and its rules are straightforward:

- **The neutral core**: surfaces in near-black (dark theme: `#08090A`-family backgrounds, `#161719` cards) and near-white (light theme), with borders at ~10-15% white/black.
- **Text hierarchy via opacity, not color**: primary text ~90%, secondary ~60%, tertiary ~40%. The same hex, different opacities — this is the "text/icons at 40-60% opacity" discipline noted in the motion analysis.
- **The accent**: a single brand accent (Linear's indigo/violet) used for interactivity, selection, links, and focus. It appears *rarely*, which makes it *meaningful*.
- **Status colors**: a fixed semantic set for statuses (gray backlog, blue in-progress, purple review, green done) and priority (red urgent, orange high, amber medium, gray low). These are the *only* saturated elements in a calm row.
- **User colors**: avatar hues are assigned per user, stable across the workspace (identity via color).

The transferable rules for Perionyx (already convergent with EDL's `#0a0a0f` / gold `#d4af37` system):

- Text hierarchy by opacity, not by color (fewer hues, cleaner screen).
- Saturation reserved for meaning (EDL's status palette is already this).
- One accent, used rarely (Perionyx's gold for currency/active states — the same doctrine).
- Semantic status colors, never decorative color.

## 11.3 Dark-First as Brand

Linear's dark mode is not a "theme" — it is the *default brand*, and the light mode is the adaptation. The design rationale (shared by Karri in talks):

- **The audience** (developers, power users, night workers) lives in dark environments; dark is the native habitat.
- **The density** reads better in dark — muted surfaces recede, saturated meaning pops.
- **The mood** ("for builders") is part of the brand; dark signals "serious tool," not "consumer toy."
- **The light mode exists** and is fully designed, but the product's identity is dark-first.

Perionyx's EDL is already dark-first (`#0a0a0f`, charcoal surfaces ~95%) — a deliberate alignment with the same logic. The Linear lesson sharpens the stance: **dark-first is a brand statement about who the product is for (professionals working at night and at speed), not a cosmetic preference.**

## 11.4 Typography

Linear's type system:

- **Inter Display** for large headings and the logo (geometric, tight, confident).
- **Inter** for body and UI (humanist, readable at small sizes, neutral).
- **JetBrains Mono** for identifiers (`LIN-123`), estimates, and code — the "machine voice" that signals structured data.
- **Scale**: compact UI sizes (12-14px body in dense lists), generous headings (24-32px display), tight line-height on headings, looser on body.
- **Numeric alignment**: tabular figures where numbers must scan vertically (estimates, counts) — a discipline Perionyx's monetary tables should adopt rigorously.

The Perionyx alignment is nearly identical (Inter + JetBrains Mono from Phase 22.0B). The Linear addition: **tabular numerals as a design rule for any column where numbers must be compared vertically** — a finance-critical detail (ledger amounts, currency columns) that improves scannability measurably.

## 11.5 Iconography

- **Line icons, 1-1.5px strokes**, consistent optical size — never filled, never decorative.
- **Semantic icons per object type** (issue, project, cycle, document) used consistently everywhere the object appears.
- **Priority encoded iconographically** (urgent = red double-caret, high = up arrow, medium = right arrow, low = down arrow, none = muted dot) — a legend-free vocabulary.
- **Status icons** (backlog = circle, in-progress = play, review = eye, done = check) reinforce the status chips.

The rules for Perionyx: line icons with consistent stroke, object-type icons used uniformly (invoice, approval, exception, payment), and *encoding-by-icon* where a legend would add noise. Lucide (already in use) matches this style family.

## 11.6 Spacing, Density, and the 4px Grid

- **4px base grid**; 8px for vertical rhythm in forms; 12-16px for card padding; 24px for section gaps.
- **Compact density as the default** for lists (rows ~32px); comfortable mode for readability-sensitive views.
- **Chrome budget**: sidebar ~240px, header ~48px, floating bars overlay content rather than steal layout.
- **Whitespace as structure**: Linear is dense *because* its whitespace is disciplined — consistent gutters, aligned columns, no orphaned padding.

The Perionyx EDL 4px spacing base already matches. The Linear-specific rule worth adopting: **density modes are a first-class product feature** (compact/comfortable toggles per view), not a developer preference.

## 11.7 The 2023-2024 Design Reset

Linear's public redesign ("A design reset," Karri's essay + release notes) is a rare, documented case study in *paying design debt*:

- **The diagnosis**: six years of incremental shipping had accumulated inconsistent labels, misaligned icons, uneven hierarchy, and settings sprawl. The product was still good — but the *craft* was eroding.
- **The method**: a **concept-first** redesign (a small team, a tight direction statement, not a feature-by-feature re-skin); **feature flags** for staged rollout; **stress tests** (the team pushed real, large workspaces through the redesign before commit); **CEO backing** (a top-down mandate that made the reset a priority, not a side project).
- **The results**: aligned labels (every status/label/icon system re-normalized), honest hierarchy (one level of visual emphasis per screen), reduced noise (fewer saturated elements, clearer focus), settings consolidation (fewer, clearer settings screens).
- **The lesson Karri articulated**: design debt is *inevitable* in a fast-shipping product; the answer is scheduled resets every 2-3 years, executed with senior backing — not constant micro-polish.

Perionyx's Phase 22.0B/22.0B.1 EDL migration was precisely this reset (token migration across ~470 files, canonical colors). The Linear model adds the *scheduling* and *funding* discipline: **the reset is a line item on the roadmap, with an owner and a budget, recurring.**

## 11.8 The 2025 Mobile Redesign (Liquid Glass, the SDF Lesson)

Linear's 2025 iOS redesign (documented in their engineering blog) is instructive for one specific technical decision:

- **The brief**: recreate Apple's "Liquid Glass" material within the app's own design language.
- **The engineering**: rendered glass with **signed distance fields (SDF)** rather than naive blur layers — because blur is expensive (thousands of GPU passes) and visually inconsistent; SDF gives a cheap, uniform, adjustable "frost."
- **The discipline**: when a trendy material would compromise clarity (constant refraction, moving highlights), **Linear refused the refraction** — choosing clarity over the trend. "Variable blur at scroll edges" was used instead of full-surface glass.

The transferable lesson is not the SDF technique — it is the *refusal pattern*: **when a visual trend conflicts with clarity (Perionyx's #1 principle), the trend loses, even when it is the platform's own aesthetic.** Perionyx's EDL should have (and per its design principles already has) this same refusal authority.

## 11.9 Visual Design Rules (Condensed)

1. Calm density: maximum information per pixel, zero perceived clutter.
2. Chrome is neutral; saturation is meaning.
3. Text hierarchy via opacity, not hue.
4. One accent, used rarely, always meaningful.
5. Dark-first is brand, not theme.
6. Two typefaces + one mono; tabular figures for number columns.
7. Line icons, consistent stroke, semantic and legend-free.
8. 4px grid; density modes are a product feature.
9. Alignment is rhythm: aligned columns, consistent gutters, no orphans.
10. Pay design debt in scheduled, funded, concept-first resets.
11. Refuse visual trends that compromise clarity — even platform trends.

---

# Section 12 — Accessibility

## 12.1 The Accessibility Posture

Linear's accessibility is a *consequence of its design philosophy* rather than a bolt-on compliance program — and it is stronger for it. The keyboard-first model (Section 10) means the product is operable without a mouse by construction. The density discipline means contrast and hierarchy are *designed*, not audited into place. The result is a product that scores well on keyboard operability and offers a genuine "Increase Contrast" adaptivity option — while remaining honest that some premium interactions (multi-select drag, certain gestures) are mouse/touch-forward.

## 12.2 What Linear Gets Right

1. **Full keyboard operability.** Every function is keyboard-reachable: navigation, lists, forms, dialogs, palettes, context menus. The keyboard model is not a skinned tab-index trail; it is the product's primary input design.
2. **Focus management.** Focus follows the highlight model in lists; dialogs trap focus, restore focus to the opener on close, and close on `esc`; the palette manages focus explicitly.
3. **Visible focus states.** The focus ring / highlight is a first-class visual state (the row highlight, the palette's selection), not a default outline.
4. **Contrast by design.** Muted-but-legible neutral scales, semantic colors chosen for differentiation, and a high-contrast adaptivity mode.
5. **Reduced motion.** The motion system (Section 8B.7's sibling in Perionyx) respects reduced-motion preferences; the GPU-composited, distance-scaled transitions degrade gracefully.
6. **ARIA/labels.** Icon-only controls carry accessible labels (avatar menus, chip toggles, icon buttons).
7. **Screen-reader structure.** Lists, landmarks, and status changes are exposed; the palette announces appropriately.
8. **Honest gaps.** Linear does not overclaim: some drag-and-drop and touch-gesture interactions are enhancement-only with keyboard equivalents provided.

## 12.3 What Linear Gets Wrong / Leaves for Others

The honest critical assessment:

1. **Onboarding for accessibility users is absent** — the product's famously thin onboarding assumes keyboard-competent, sighted, neurotypical users.
2. **Density vs. readability tension**: compact mode is genuinely dense; low-vision users must discover and switch density modes (which persist per user — a partial win).
3. **Color is still a meaning carrier** — status and priority rely on color + icon (the icons save it from being color-only), but differentiation of some statuses (gray backlog vs. gray no-priority) is subtle.
4. **No formal public WCAG statement** (as of this review); accessibility is engineering-derived, not certified-documented.

The Perionyx counter-position is deliberate and correct: Perionyx *mandates* WCAG 2.1 AA (Phase 8B.6/8B.9, constitution), runs audits (Phase 8B.9), and treats accessibility as a compliance requirement, not an engineering byproduct. The synthesis: **Perionyx should keep its WCAG-certification posture while borrowing Linear's *architectural* accessibility** — the keyboard-first model, the focus discipline, the contrast-by-design palette — so that compliance is a byproduct of architecture, not a remediation layer.

## 12.4 The Accessibility = Productivity Equation

The most important accessibility insight from Linear is reframed as a Perionyx principle:

**Accessibility is not a separate quality bar; it is the same design as speed and focus.** Keyboard-first is simultaneously:
- A speed feature for power users (Section 10.8).
- A motor-accessibility feature (no mouse required).
- A focus feature (the eye stays on data).
- An audit feature (keyboard actions are discrete, observable events).

Perionyx's finance audience compounds this: controllers with RSI, operators working in low-light war rooms, auditors using screen readers on exports — the same keyboard model serves all of them. The design goal is not "pass WCAG" (that is the floor) but **"no Perionyx capability requires a capability the operator doesn't have."**

## 12.5 Accessibility Rules (Condensed)

1. Accessibility is a byproduct of keyboard-first architecture, not a remediation layer.
2. Every capability is reachable by keyboard alone; mouse is never required.
3. Focus follows the highlight model; dialogs trap, restore, and `esc`-close.
4. Visible focus is a designed state, not a default outline.
5. Contrast is by design: muted scales chosen for legibility, semantic colors differentiated.
6. Reduced motion is respected at the system level.
7. Icon-only controls carry accessible labels.
8. Status/priority encode meaning in icon + color, never color alone.
9. Density modes persist per user; accessibility users can claim comfortable mode.
10. WCAG 2.1 AA remains Perionyx's certified floor; architecture raises the ceiling.

## 12.6 The Perionyx Accessibility Commitment (Refined by Linear)

Building on Phase 8B.6/8B.9 (EnterpriseField aria wiring, skip-nav, keyboard-shortcuts dialog, focus traps), the Linear-informed refinements:

1. **Add `j`/`k`/`space`/`x` list model** to EnterpriseTable screens — the single largest accessibility + speed win available (row highlight, peek, selection, all keyboard-native).
2. **Make the CommandPalette the shortcut school** — show shortcuts beside commands; audit palette commands for context-awareness.
3. **Tabular numerals for money columns** — vertical scannability for screen readers *and* sighted users.
4. **Persist density preference per user** — remembered across sessions.
5. **Global sync/freshness indicator in chrome** — accessibility-relevant (state is labeled, not implied).
6. **Keyboard-first as a documented product principle** — not a backlog item; the architecture standard for new screens.
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
