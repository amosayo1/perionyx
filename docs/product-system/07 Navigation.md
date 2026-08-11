# 07 — Navigation

**Product System · Document 07 of 20**
**Authority: Navigation is the information architecture and wayfinding specification for the Perionyx product. It derives from the Vision (00), Philosophy (01), and Product Principles (02), and is binding on all routes, rails, search, and wayfinding surfaces.**
**Sources: The four-product research program — Stripe S3 (layout, sidebar, structure), Linear S3 (keyboard-forward navigation), Ramp S5 (objects not workflows), Coupa S3 (cross-module navigation and the CFO problem); the EDL; the app-shell and nav configuration.**

---

## 1. The Navigation Philosophy

Navigation in Perionyx is the answer to one question per moment: **"Where do I go to make my next decision?"** It is not a map of the product's data model; it is a map of the user's job.

The philosophy, from the research program:

- **Stripe:** navigation reflects user jobs, not database entities (PP-021). Module order encodes frequency and risk (PP-022). Environment boundaries are permanent (PP-026). Settings are a last resort (PP-027).
- **Linear:** the sidebar is *structure*, not chrome; the header is *context*, not chrome; keyboard is the primary input; navigation never reloads (PP-034, PP-247).
- **Ramp:** navigation is by objects, not workflows; the command surface (search) dissolves navigation (PP-024).
- **Coupa:** the CFO problem — too many modules, role-switching tax — is the warning; Perionyx answers it with role-shaped rails and the Decision Workspace (PP-025).

The synthesis: **the rail is role-shaped; the command palette is universal; the header is contextual; the environment is labeled; the page never reloads.** Navigation is a momentum instrument, and momentum is the craft layer (Document 01).

## 2. The Primitives

Navigation has five primitives, in priority order:

1. **The Command Palette** — the universal, keyboard-openable way to find any object, action, or screen (Cmd+K). Dissolves the information architecture (PP-024, PP-260).
2. **The Role-Shaped Rail** — the persistent left navigation, defaulted by role, personalized by pins/recents (PP-025, PP-036).
3. **The Contextual Header** — the current object/screen's identity, question, and primary action (PP-032).
4. **In-View Navigation** — highlight/peek before open; the list→peek→open→edit rhythm (PP-031).
5. **The Breadcrumb Exit** — the path back from deep work (PP-028).

Each primitive has a job; none duplicates another. The rail says *where you are in the job structure*; the header says *what you are doing*; the palette says *find anything*; the peek says *preview before committing*; the breadcrumb says *how you got here*.

## 3. The Rail

**Structure:** the rail is a vertical list of destinations grouped by job, ordered by frequency and risk (PP-022):

1. **Requires Me** — the decision queue: approvals, exceptions, work queue (PP-049). The operator's surface, first.
2. **Decision surfaces** — dashboards and workspaces: cash position, spend, close.
3. **Domains** — AP, treasury, suppliers, contracts, GL.
4. **Intelligence** — Decision Intelligence, forecasts, insights.
5. **Governance** — policies, audit, permissions.
6. **Administration** — configuration, settings (pinned to the bottom, last resort, PP-027).

**Role shaping (PP-025):** the default rail is shaped by the user's role:
- A **Treasurer** sees cash position, forecasts, FX, payments near the top.
- An **AP Manager** sees the work queue, invoices, suppliers, exceptions near the top.
- A **Controller** sees approvals, reconciliation, close, audit near the top.
- A **CFO** sees liquidity, spend, approvals-above-threshold, risk near the top.
- An **Auditor** sees audit, exports, decisions, policy history near the top.

Pins and recents ride on top of the role defaults (PP-036); the shared IA stays canonical. Role shaping prevents the Coupa CFO problem at the root (PP-025).

**The rail never scrolls into a menu maze.** If a role's rail needs more than ~8 primary destinations, the overflow goes into the command palette, not a nested accordion.

## 4. The Command Palette

The Command Palette is the universal search-and-act surface (Cmd+K from anywhere, PP-260). It searches, in one index: vendors, invoices, payments, journals, exceptions, balances, decisions, policies, and screens (PP-256).

Its rules:

- **Grouped type-ahead results** by object type, with fuzzy match highlighting and exact-ID jump (PP-257, PP-258).
- **Preview on selection** — peek the object before opening (PP-261).
- **Tenant-scoped** — the index is a tenant partition; isolation is absolute (PP-263).
- **Actions in the palette** — the palette can perform safe actions (approve, navigate, create) where the action is reversible or lightweight; money actions never execute from the palette without their confirmation surface (PP-008).
- **Recent searches persist**; empty states teach syntax (PP-259).
- **The palette is the shortcut school** — it surfaces the canonical shortcuts it maps to (PP-272, Linear S10.3).

The Command Palette is the answer to "where is X?" — the user never needs to know which section holds the answer (PP-024).

## 5. The Header

The header carries the current screen's **context, question, and primary action** (PP-032). It is not a second navigation rail.

- **Left:** breadcrumb path (PP-028) + the screen's declared question ("Do we have liquidity for 7 days?").
- **Center/right:** the primary action (approve, create, release) — singular, visible (PP-093).
- **Persistent:** environment/data-mode label (demo/live/test) always visible, never a subtle toggle (PP-026).

The header budget is small. Chrome is minimal (Stripe S3, Linear S3.4); the decision gets the space.

## 6. In-View Navigation

The list→detail rhythm is the operator's daily motion (Linear S5.4, PP-031):

- **Highlight** — arrow keys / j/k move a selection highlight without opening.
- **Peek** — space bar (or Enter once) opens a preview panel with the object's decision essentials (PP-240).
- **Open** — Enter (or click) opens the full detail.
- **Edit** — the detail edits in place where appropriate (PP-074).

In-view navigation is what makes the Work Queue fast (PP-005): triage is highlight → peek → decide, without leaving the queue.

## 7. Environment and Mode Boundaries

**Demo/live/test and data-mode are permanent labeled boundaries** (PP-026, PP-167):

- A persistent, always-visible slot (top-left, next to the logo) carries "Demo Data · Seeded · not persisted" or the live-mode marker.
- The boundary is structural at the data layer (PP-167), mirrored by the UI marker.
- Markers propagate into exports, printouts, and screenshots (PP-039, PP-158).

A user can never mistake demo for live; a CFO can never sign off on test data.

## 8. Cross-Module Objects and the Spine

Navigation reflects the lifecycle spine (PP-001): every object knows its place in the lifecycle and its next stage (PP-120). The rail's domains are stages of the spine, and the Work Queue is the operator's view of the entire spine (PP-005).

Cross-module objects are one object (PP-037): a vendor reached from Treasury is the same vendor reached from AP, with the same identity and shared trust state. Navigation never creates object duplications.

## 9. Navigation Rules (Condensed)

1. The rail is role-shaped; pins are personal; the IA is canonical (PP-025, PP-036).
2. The command palette is universal and keyboard-openable from anywhere (PP-260).
3. Module order encodes frequency and risk; configuration is last (PP-022, PP-027).
4. The header is context + question + one primary action (PP-032).
5. Every destination is ≤2 clicks from anywhere (PP-023).
6. In-view: highlight → peek → open → edit (PP-031).
7. Breadcrumbs are the exit path from deep work (PP-028).
8. Environment and data-mode are permanent labeled boundaries (PP-026).
9. Navigation never reloads (PP-034).
10. The lifecycle spine and shared objects are reflected, never duplicated (PP-120, PP-037).

## 10. Navigation Anti-Patterns

Navigation anti-patterns are cataloged in Document 19. The critical ones, stated here:

- **The nested accordion** — hides decisions behind structure (rejected: the palette handles overflow).
- **Entity-named rails** — "ProcurementAPInvoice" as a destination (rejected: PP-021).
- **Pins as the fix for growth** — pins personalize; they never substitute for role shaping (PP-025).
- **Settings-first administration** — governance buried so deep it is ignored (rejected: PP-205, Enterprise §6).
- **Modal navigation stacks** — dialog over dialog over drawer (rejected: PP-035).
- **Full-page reloads** — any navigation that reloads the page is a defect (PP-247).

---

*Next: `08 Dashboard.md` — the dashboard and KPI surface specification.*
