# 10 — Forms

**Product System · Document 10 of 20**
**Authority: Forms is the data-entry and validation specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Forms domain), and Finance Principles (04), and is binding on all forms, wizards, data-entry surfaces, and validation behavior.**
**Sources: The four-product research program — Stripe S8 (validation and input refinement), Linear S7 (keyboard-first input), Ramp S12 (smart defaults), Coupa S8 (enterprise entry forms); the EnterpriseForm system (Phase 8B.6); the EDL.**

---

## 1. The Form Doctrine

**A Perionyx form is the moment of record.** It is where a number enters the financial system — the moment the ledger gains a new fact. Therefore the form obeys finance law first: it is precise, validated against business rules, reversibly recorded, and never silent about what it did (PP-081, F-01).

The research synthesis:
- **Stripe** proves validation is refinement, not gatekeeping: validate on blur, guide the correction, explain how to fix (Stripe S8, PP-085).
- **Linear** proves keyboard-first entry: Tab/Enter navigation, shortcuts, and never-lost work (Linear S7).
- **Ramp** proves smart defaults: previous input → org defaults → role defaults → sensible defaults (PP-087).
- **Coupa** proves enterprise forms handle long, multi-party documents with progressive disclosure (PP-088).

## 2. The Field Contract

Every field obeys the EnterpriseField contract (PP-084):

1. **Label** — visible, associated via `htmlFor`/`id`.
2. **Input** — typed, formatted, mask where sensible.
3. **Help** — contextual, present on focus.
4. **Hint** — inline, styled (example / best-practice / regulatory / tip).
5. **Error** — inline, specific, explains *how to fix* (PP-085, PP-141).

Fields carry state: idle → valid / invalid / warning / validating (async). Invalid renders with `aria-invalid` and `aria-describedby` (PP-084). Errors never silently clear (PP-209).

## 3. Validation

**Validation is progressive and layered** (PP-085):

- **Inline on blur** — immediate for local rules (format, range).
- **Cross-field** — relationships across fields, validated together.
- **Async** — duplicate checks, uniqueness, live balance checks.
- **Business-rule** — approval thresholds, SoD, budget caps (PP-162).
- **Server-truth on submit** — the server re-validates everything; client validation is convenience, never authority (PP-210).

Errors are human-readable and explain the fix (PP-141): "Amount exceeds the approval threshold of $50,000 for this role — request higher authority or split the invoice." Every validation is a teaching moment.

## 4. Smart Defaults

**Defaulting is opinionated and chain-resolved** (PP-087):

> Previous input → org defaults → role defaults → sensible defaults.

Defaults reduce keystrokes and embed policy; they are always visible and always overridable (PP-083). A default is a suggestion, never an invisible decision (PP-211). Money defaults are validated like entered values (PP-212).

## 5. Progressive Disclosure

**Core first, advanced later, expert hidden** (PP-088, PP-082):

- **Core fields** — always visible.
- **Optional fields** — labeled "Optional".
- **Advanced sections** — collapsed with badge.
- **Expert settings** — behind a toggle.

The form reveals in layers, matching operator depth (PP-083). Progressive disclosure is a density strategy, never a hide-the-fields trick (PP-237).

## 6. Autosave and Unsaved Work

**Work is never lost** (PP-089, Linear S7.7):

- **Autosave** — debounced (2s), with explicit status: saving / saved / failed / unsaved (PP-213).
- **Unsaved-changes guard** — beforeunload + inline save/discard dialog (PP-089).
- **Draft persistence** — interrupted work resumes (PP-014, PP-213).

Autosave status is visible, never a background mystery (PP-213).

## 7. Keyboard Entry

**Forms are keyboard-first** (PP-090, Linear S7):

- Tab / Shift+Tab navigate; Enter advances; Escape cancels.
- Shortcuts documented and discoverable (Cmd+?; PP-034).
- Date fields accept typed ranges and natural language ("last friday").
- SmartSelect: searchable, grouped, keyboard navigable (PP-091).

## 8. Wizards

**Wizards sequence a decision, not a data dump** (PP-092):

- Step indicator with progress; steps are reviewable and revisit-able.
- Each step is one coherent unit — a decision, not a screen of form fields (PP-081).
- Review step before submit: valid / invalid / warning field status with edit-navigation (PP-093).
- Wizards save partial state and resume (PP-089, PP-014).

## 9. Submit and Confirm

**Submission is explicit, confirmed, and audited** (PP-163, PP-164):

- Destructive and money actions use the ConfirmDialog, never `window.confirm` (PP-163, PP-164).
- Submission is idempotent — retry never double-posts (F-05).
- Every submit records its actor, time, and payload in the audit trail (PP-161, PP-165).

## 10. Form Rules (Condensed)

1. The form is the moment of record; finance law applies first (PP-081).
2. Every field carries label, help, hint, error — and errors explain how to fix (PP-084, PP-085).
3. Validation is layered: blur → cross-field → async → business-rule → server-truth (PP-085).
4. Defaults resolve by chain and are always visible and overridable (PP-087).
5. Progressive disclosure: core, optional, advanced, expert (PP-088).
6. Work is never lost: autosave with visible status, guards, drafts (PP-089).
7. Forms are keyboard-first (PP-090).
8. Wizards sequence decisions and save state (PP-092).
9. Submission is explicit, confirmed, and audited (PP-163).
10. Client validation is convenience; server is truth (PP-210).

## 11. Form Anti-Patterns

- **The gatekeeper form** — errors without fix guidance (rejected: PP-085).
- **The invisible default** — a filled value the user can't see or change (rejected: PP-211).
- **The data dump wizard** — a wizard that just sequences all fields (rejected: PP-092).
- **The losing form** — refresh or navigate wipes entry (rejected: PP-089).
- **The double-post** — retry creates a duplicate financial record (rejected: F-05).
- **The orphaning label** — visual-only labels with no programmatic association (rejected: PP-084, Phase 8B.9).

---

*Next: `11 Workflows.md` — the workflow and process specification.*
