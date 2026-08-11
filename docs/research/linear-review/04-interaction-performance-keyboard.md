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
