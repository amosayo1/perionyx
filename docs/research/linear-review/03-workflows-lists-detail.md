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
