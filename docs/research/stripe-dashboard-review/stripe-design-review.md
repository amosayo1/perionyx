# The Perionyx Design Bible — Product 1: Stripe Dashboard

**Enterprise Design Review & Reverse Engineering**

Program: Perionyx Product & Design Research
Product under study: Stripe Dashboard (dashboard.stripe.com) — web, mobile app, Stripe Apps patterns
Version note: Reviewed July 2026 against current Stripe documentation, public design-system references, and independent UX breakdowns. Where the internal Stripe system (Sail) is private, we state confidence levels and reason from observable surface behaviour.
Purpose: Not to copy Stripe. To understand *why* each decision exists, and to decide whether Perionyx should **adopt**, **modify**, or **reject** it.

---

# SECTION 1 — Executive Summary

## 1.1 What Stripe Dashboard optimizes for

Stripe Dashboard optimizes for **decision speed under financial uncertainty**. Every screen answers one question: *"What needs my attention, and what is the fastest correct action?"* It is a control surface for money in motion — not a reporting warehouse, not an admin console, and deliberately not a place to think hard about data. Deep analysis is pushed to exports, Sigma (SQL), and the API.

Three observable proof points of this objective:

1. **The home screen shows ~5 metrics, not 20.** Gross volume, net volume, new customers, successful payments — each with a same-period comparison. A "comprehensiveness-first" dashboard would show every metric Stripe computes. Stripe shows the metrics that change behaviour.
2. **Navigation is labelled by jobs, not by the data model.** "Payments", "Customers", "Disputes" — not "ChargeEvents", "CustomerObjects", "DisputeRecords". The labels match how the user thinks, not how the system stores.
3. **Every status message answers "what happened" and "what do I do next."** "Respond by [specific date]." "Your payout is held because your account requires additional verification." Specificity is the anxiety-killer in financial UX.

## 1.2 Why it became one of the best enterprise dashboards

Stripe earned its position by being *the* reference for **financial-grade calm**. The dominant conventions of its competitors (heavy dashboards, dense tables, ambiguous status colours, vague errors) read as stressful. Stripe inverted that: generous whitespace, one accent colour, monochrome numbers, tabular figures, and microcopy that explains consequences.

It is also a **platform whose dashboard is a wedge, not a product**. The Dashboard exists to make the API approachable ("View and manage all your Stripe data... everything from bank transfers to HTTP request logs at your fingertips") and to move money-handling confidence into the hands of non-developers. That positioning — infrastructure that behaves like a product — is why finance teams, operators, and founders all use the same surface.

Three compounding strengths:

- **Information hierarchy**: above-the-fold always earns its place. What is shown is shown at the scale of its consequence.
- **Microcopy discipline**: no "Something went wrong." Ever.
- **Visual restraint**: whitespace and typography carry the professionalism; colour is reserved for status. When red appears, it means something.

## 1.3 Who it is designed for

- **Founders / operators** — "how is the business doing?" Home screen, notifications, quick refunds.
- **Finance & accounting teams** — reconciliation, payouts, fees, reports, Revenue Recognition.
- **Developers** — test/live mode, Workbench, API logs, Sigma, webhook debugging.
- **Support / ops staff** — disputes, Radar fraud review, blocked/allow-listed cards.

This is the crucial finding for Perionyx: **Stripe serves multiple personas with one surface by leading with the smallest common set of questions and layering depth.** The developer gets the `~` Workbench; the founder gets the five metrics; the accountant gets scheduled CSV exports. Nobody is shown everything.

## 1.4 Biggest strengths

1. **Decision-speed information architecture** — the home screen and section pages answer the question the user came with, in seconds.
2. **Job-based navigation** — minimal mental translation between intent and destination.
3. **Financial microcopy** — every state explains cause and next action; this is the highest-leverage financial-trust device in the industry.
4. **Status semantics** — a narrow, disciplined palette where colour means state, not decoration.
5. **Empty states that teach** — "Make your first test payment" is an instruction, not an apology.
6. **Test/live mode as a first-class concept** — a persistent, global, colour-coded environment boundary that prevents catastrophic mistakes.
7. **Tables tuned for reconciliation** — sticky columns, async filters, presets, export; built for people who scan and compare rather than read.
8. **Progressive disclosure everywhere** — from home widgets to drawer apps; complexity is one intentional click away, never forced.

## 1.5 Biggest weaknesses

1. **Navigation scales poorly.** With Connect, Radar, Billing, Tax, Atlas, Issuing, and Terminal enabled, the sidebar becomes a long list that violates the job-based simplicity it was built on. Stripe shipped "pins + recent" (2023) as a band-aid for this. Perionyx must design the sidebar to scale from day one.
2. **Deep analysis is a dead end in the Dashboard.** You can export CSV or write SQL in Sigma, but you cannot compose a custom view with a calculated column in the UI. For CFO-level "what if" work, users leave.
3. **Notifications are passive.** The bell aggregates activity, but there is no "this needs you now" triage tier. A treasurer or controller wants escalation semantics Stripe does not provide.
4. **Customization is shallow.** Home widgets can be added/removed/reordered, but there is no saved-view model, no role-based default per persona, no sharing of views across a team. Every team member configures the same surface separately.
5. **No undo culture.** Refunds can be issued but not undone; the mitigation is confirmation dialogs and typed input. For enterprise financial operations, reversible-until-commit patterns matter.
6. **Chart interactivity is thin.** Sparklines are direction indicators; the main charts don't support cross-filtering between metrics or "click a bar → see the underlying list." Perionyx's analytics drill-down vision is ahead of Stripe here.

**Perionyx verdict:** Adopt the *philosophy* wholesale; adopt specific *patterns* selectively; reject or modify where Stripe's platform-vs-product tension shows (navigation growth, shallow customization, passive notifications).

---

# SECTION 2 — Product Philosophy

## 2.1 The core belief: confidence through clarity

Stripe's design philosophy can be compressed into one sentence: **"Financial professionals act confidently when the interface tells them exactly what is true, what it means, and what to do about it — and never makes them guess."** Everything in the Dashboard is a consequence of that sentence.

## 2.2 Why so much whitespace?

- Whitespace is the cheapest readability investment. Dense financial UI makes users *slower and more anxious* — exactly the two states that cause mis-clicks on money actions.
- Whitespace encodes hierarchy without borders. Related groups breathe together; sections separate by gap, not by rules. This is why Stripe surfaces feel calm rather than "boxy."
- Whitespace signals **confidence in the system**. A product that trusts its own data doesn't need to wallpaper the screen with charts. Crowded = defensive; sparse = assured.
- It also reflects the audience: finance professionals read a small number of numbers carefully. The eye needs a clear path to each one.

## 2.3 Why so few colours?

- **Colour is a state language, not a decoration language.** Green = succeeded, red = failed/attention, yellow/amber = pending. When everything is coloured, nothing is coloured. Stripe keeps a near-monochrome base so that a single red element is unmistakable.
- One accent (the brand indigo `#635bff`/`#533afd`) carries all "interactive/selected/primary-action" weight. The eye always knows where to land.
- Financial audiences read colour as *meaning*. A multi-colour dashboard teaches users to ignore colour. Stripe preserves its authority.
- Numbers are rendered in a neutral ink with **tabular figures** so columns align; money is signalled by typography, not tint.

## 2.4 Why minimal decoration?

- Decoration is cognitive noise with zero information value. Stripe's surfaces use hairlines (`#e6ebf1`), low-opacity shadows, and a single 4px radius. The restraint reads as *institutional* — the product behaves like a bank but looks like software, which is the exact trust profile a payment processor needs.
- Every decorative element Stripe *does* use (the gradient mesh on marketing, the animated micro-interactions) is purposeful and rare, which is what makes it memorable.
- For a money-moving product, the cost of decoration is not just polish — it is *suspicion*. Sparse says "we have nothing to hide."

## 2.5 Why typography first?

- Type is the only element that must carry *all* the information. Stripe invests in a proprietary face (Söhne, weights 300/400) because type quality is the product's proof of quality.
- Light weights (300) at large sizes for numbers and headlines create an *editorial* feel — the Dashboard reads like a financial broadsheet, not a spreadsheet. Serenity at scale.
- **Tabular figures** (`tnum`) are the quiet financial signature: every monetary column aligns. This is not cosmetic; aligned digits are measurably faster and safer to scan for reconciliation.
- Monospace (Söhne Mono) is reserved for code, IDs, and raw values — a consistent "raw material" dialect that separates human-readable presentation from machine identity.

## 2.6 Why are actions where they are?

- **Primary actions are always top-right or in-page top-right** — the universal action location. "Create invoice", "Send", "Export". The user's eye learns a single anchor for "what can I do here."
- **Destructive/risky actions are buried.** Refunds, voiding invoices, and key rotation live in overflow menus ("⋯") and detail pages, not next to primary actions. Risk is inversely proportional to proximity to the primary button.
- **Contextual actions attach to the object they mutate.** Row-level menus, detail-page action bars. Actions never float disconnected from their subject.
- **The question-mark key** (`?`) summons a keyboard-shortcut palette — power actions live a keystroke away, not a menu deep.

## 2.7 The philosophy in one table

| Question | Stripe's answer | Perionyx adaptation |
|---|---|---|
| What does the user need? | The fastest correct decision | Same — CFOs/Treasurers/Controllers act under ambiguity |
| How do we build trust? | Specific microcopy + audit-grade clarity | Same, plus tamper-evident trails and source-linked evidence |
| How do we show data? | Few numbers, high contrast, aligned, compared | Same, plus always-dated and source-labelled |
| What is colour for? | State and one accent, nothing else | Same — gold accent, status-only semantics |
| How do we scale? | Progressive disclosure, layered depth | Same, plus role-based defaults |
| How do we prevent mistakes? | Confirmation, typed input, environment modes | Same, plus dual-approval and undo-to-revert patterns |

**Perionyx verdict: adopt the philosophy in full.** It is already substantially aligned with the Perionyx Engineering Constitution (Clarity, Confidence, Speed, Beauty, Trust) and the EDL. The remainder of this document translates the philosophy into concrete, Perionyx-specific decisions.

---

# SECTION 3 — Navigation

## 3.1 The layout

Stripe Dashboard navigation, top to bottom (as of 2026):

1. **Top bar**: mode toggle (Test/Live), account switcher, global search, notifications bell, account menu.
2. **Left sidebar, "core" section**: Home, Balances, Transactions (Payments), Customers, Product catalog.
3. **Shortcuts section**: pinned + recently visited pages (user-controlled, 2023 redesign).
4. **Products section**: Payments, Billing, Connect, Radar, Reporting, Tax, Issuing, etc. — *appears based on enabled products*.
5. **Bottom of sidebar**: settings (three tiers — Personal, Account, Product).
6. **Mobile app**: bottom tab bar (balance/payments/notifications + search) with Face/Touch ID lock.

## 3.2 Why a left sidebar?

- **Consistency of the money surface.** Financial operators sit in a handful of destinations for long sessions; a persistent rail keeps every destination one click away and never hides the environment (test/live) or the account context.
- **Vertical space is the scarce asset.** Stripe's tables, forms, and charts need the full horizontal viewport. A top nav would steal vertical space from exactly the surfaces that matter most.
- **Scannability.** A vertical list is read by position ("third from top"), which becomes muscle memory faster than horizontal menus.
- **Enterprise precedent.** Bloomberg, Stripe, Linear, and most financial workhorses use a left rail. Users arriving from finance tools already know the pattern. Perionyx's sidebar is the same choice — correct and shared.

## 3.3 Why this module order?

The order is **frequency-of-use descending, risk-isolated, jobs-first**:

1. **Home** — the default landing; one click from anything.
2. **Balances** — the "where is my money right now" question; it is the top financial-state query.
3. **Transactions/Payments** — the most common operational job (find a payment, check its status).
4. **Customers** — relationship context for every transaction.
5. **Product catalog** — the reference data everything else hangs off.

Then the Shortcuts rail (personal), then Products (capability groups, only when enabled), then Settings pinned to the bottom as an escape hatch rather than a destination.

Key insight: **order encodes priority and permission.** Products are grouped so that enabling/disabling a product adds or removes a *group*, not a scattered item. Settings at the bottom is a deliberate downgrade — settings are where users go to change things that should rarely change, and burying them reduces configuration anxiety and accidental breakage.

## 3.4 Why settings at the bottom?

- Settings are a **destination of last resort**. If your navigation makes settings prominent, you are admitting the primary surface fails to handle its cases.
- Bottom placement is standard reading-scan territory for "utilities," separating them from the working surface.
- Stripe splits settings into **Personal / Account / Product** — a role-aware hierarchy. The user is never shown product settings for products they haven't enabled.

**Perionyx modification:** Our settings surface must additionally separate *company-level configuration* (identity, security, audit, permissions) from *domain configuration* (AP, treasury, GL) and *personal preferences* (density, saved views). This mirrors the Stripe tiering but must be enforced by the IAM permission model, not just grouped visually.

## 3.5 Why search placement?

Global search sits **top-left, above the fold, always visible**. It is *global across object types* — customers, invoices, payouts, products — so the user never has to know which section holds the answer. Stripe's docs are explicit: type-ahead searchability is a headline feature.

Why this solves a real problem: in most enterprise financial products, search requires you to *first choose the right section* ("is this a Transaction or an Account?"). That two-step translation is the exact friction Stripe removes. For Perionyx, whose operators search across vendors, invoices, payments, journals, and exceptions, **global cross-entity search is a non-negotiable adoption**.

The command palette (Cmd+K) is the power-user extension of this same idea, and Perionyx already has one — Stripe's approach validates keeping it global, not per-section.

## 3.6 Why notifications there?

The bell is **top-right, near the account menu**, pairing "things that happened" with "who you are / what you can do."

- Top-right is the conventional attention zone in web apps; users learn it instantly.
- Placing it opposite the mode toggle (top-left) creates a clean diagonal: environment/context on the left, events/identity on the right.
- The bell is *passive* — it aggregates. Stripe's weakness is that it does not triage by severity or role. A Controller and a Developer receive the same bell.

**Perionyx modification:** notifications must be **role-aware and triaged** (requires-me vs. informative), with escalation semantics for approvals and exceptions, and must be deep-linkable into the exact object they reference. This is a deliberate improvement over Stripe.

## 3.7 Why the account menu there?

The account menu (profile, account, API keys, sign out) sits at the **bottom-right of the top bar** — the opposite corner from the sidebar because it is the least-used navigational element. Its isolation from the working surface prevents accidental account switches, and the test/live toggle (top-left) keeps the *highest-stakes environment decision* at the maximum distance from accidental clicks while remaining permanently visible.

## 3.8 What problems does the structure solve?

1. **Reduces navigation cost** — every destination ≤ 2 clicks from anywhere.
2. **Encodes risk** — environment (test/live) is permanent and colour-coded; destructive actions are buried.
3. **Scales by grouping** — products add whole groups, not scattered items.
4. **Adapts to the individual** — pins + recents give each user a personal rail inside a shared surface.

## 3.9 Would another layout be worse?

- **Top-tab navigation**: worse for 10+ destinations; steals vertical space from tables; no room for grouping. Rejected.
- **Single search-as-nav (everything via Cmd+K)**: worse for discoverability and for finance teams that navigate by position memory. Rejected as the *only* mechanism; valid as an accelerator.
- **Mega-menu / flyout**: worse — requires hover, hides state, and breaks on touch; adds a pointer dependency to navigation. Rejected.
- **Tab-less content-addressable (no persistent rail)**: worse for multi-object workflows that require revisiting sections; financial work is not a linear funnel. Rejected.

**Verdict: adopt the left-rail model (already Perionyx's choice), modify for scale.** Perionyx must additionally: (a) keep the rail to a small core of working destinations and group domain modules; (b) make the rail role-aware (a Treasurer does not see AP exception tooling by default); (c) support pins/recents like Stripe's Shortcuts; and (d) move the *environment/data-mode indicator* to the permanent top-left position — the Perionyx "Demo Data · Seeded" badge must be as unmissable as Stripe's Test Mode.
# Part 2 — Dashboard, Tables, Forms

---

# SECTION 4 — Dashboard

## 4.1 The home page, area by area

Stripe's Home ("Your overview") is the most studied dashboard surface in fintech. Its anatomy, top to bottom:

1. **Notification strip** (conditional) — important alerts: unresolved disputes, identity verification, payout holds. These appear *above* the metrics because they are the "what needs me now" items. They are direct-response items, not informational cards.
2. **Metric row** (~5 KPIs) — gross volume, net volume, new customers, successful payments, and (contextually) failure count. Each renders: big number (tabular figures, high contrast), **previous-period comparison in smaller text**, and a **monochrome sparkline** showing direction.
3. **Chart block** — a single primary trend chart for the selected period with a legend that doubles as a mini-KPI list, and a stacked element showing distribution (e.g. payment status mix).
4. **Below-the-fold modules** — recent activity, high-value customers, failed payments to action. Each module is a *preview* ("6 of 25 failed") with a "View all" link into the full page.
5. **Widget controls** — "Add" / "Edit" allow adding, reordering, or removing widgets. This is the extent of customization.

## 4.2 What the KPI row is doing

The five metrics share one DNA: **each is a behaviour trigger, not an observation.**

- Gross volume → "are we growing?"
- Net volume → "are we keeping it after fees/refunds?"
- New customers → "is the funnel working?"
- Successful payments → "is the pipe healthy?"
- Failures → "is something wrong *right now*?"

The **same-period comparison** is the critical device: it answers "is this good or bad?" in place, without navigating to analytics. Independent research on dashboard UIs (LogRocket's cross-product study, Lazarev Agency's comparison-context data) consistently shows contextual comparisons reduce support queries and misinterpretation. The comparison is always present, always the same period type as the selected filter, and always smaller than the primary number — secondary in emphasis, primary in meaning.

## 4.3 Cards, charts, tables

- **KPI cards**: no borders fighting for attention; whitespace separation; a single trend indicator in status colour (or monochrome). Not "widgets" in the ornamental sense — they are numerals with a caption.
- **Charts**: one primary chart, not a grid. The legend is interactive and doubles as a filter/KPI list. The stacked-bar/pie distribution answers "what is this made of?" in one glance. Zero baselines keep spikes honest.
- **Tables** (recent activity): dense but calm; status-colour dots; every row clickable to its detail; "View all" to the full section.

## 4.4 What is intentionally omitted — and why

This is where Stripe teaches the most:

1. **No configurable chart grid.** An opinionated home beats a customizable one for 90% of users; configurability is offered as *widget add/remove*, not as a blank canvas.
2. **No vanity metrics.** No "API requests", no "uptime", no "team logins". If it doesn't change behaviour, it doesn't earn the fold.
3. **No raw API logs on Home.** Developer telemetry lives in Workbench, one keystroke (`~`) away.
4. **No forecasting.** Stripe does not pretend to predict the future on the home page; it shows *what is true now* and *what changed*. (This is a deliberate rejection of a common fintech temptation — and a place where Perionyx's AI cash-forecasting roadmap diverges by design.)
5. **No "everything about your account."** No pending settings, no compliance noise, no bank details. The home page is not a status board for the account; it is a status board for the business.

**The rule:** *a dashboard omits what does not drive a decision. Anything that merely "looks interesting" is clutter, and clutter is what causes a finance user to miss the one thing that mattered.*

## 4.5 Dashboard verdict for Perionyx

| Element | Stripe | Perionyx recommendation |
|---|---|---|
| Alert strip above metrics | Adopt | Escalate: triage by role/severity, deep-link to object |
| 5-KPI row with comparison | Adopt | Use 4–6 KPIs; always show previous period + source + timestamp |
| Monochrome sparklines | Adopt | Use EDL chart tokens; gold for primary, status colours only for state |
| Single primary chart | Adopt | Add drill-down (click bar → underlying list) — beyond Stripe |
| Recent activity previews | Adopt | Add "requires me" triage and evidence links |
| Widget add/edit | Adopt | Add saved views + role-based defaults — beyond Stripe |
| No forecasting | Modify | Perionyx forecasts by design, but must label it "forecast" with confidence and horizon |
| Omit vanity metrics | Adopt | Enforce via a "does this change a decision?" review gate |

---

# SECTION 5 — Tables

## 5.1 Why Stripe's tables are the hidden crown jewel

Stripe's DataTable pattern (publicly referenced via Stripe Apps) is described by independent design-system analysis as "Tableau-class data tables tuned for financial reconciliation, with sticky columns, async filters, and exportable views." That is the right framing: **the table is a reconciliation instrument, not a list.** People use it to find one row among thousands, compare two rows, and export the whole filtered set to CSV.

## 5.2 Columns

- **Columns are chosen by the job, not by the schema.** Payments table: amount, currency, payment method, customer, status, risk. No charge ID by default (IDs are secondary, monospace, and available in detail). Filters map to real questions: by date, customer, status, amount, metadata.
- **Money columns right-align with tabular figures** so totals can be compared vertically. Amount + fees + net are grouped so the reader can mentally sum.
- **Status is a compact dot + label** — state at a glance without reading text.
- **Density is disciplined.** Default density is comfortable; the pattern supports denser rows for power users without breaking hierarchy.

## 5.3 Spacing and density

Row height is tall enough to prevent cross-row mis-reading (a real risk in financial tables) but tight enough to show ~20-25 rows per viewport. The trick: *enough vertical rhythm that the eye never doubts which row a value belongs to*. Stripe uses hairlines, generous column padding, and alignment over zebra striping — zebra striping is visually noisy at financial density and is intentionally absent.

## 5.4 Sorting, filtering, pagination

- **Async filters**: filters execute against the server (they are real queries), not client-side slicing — the table is honest at scale.
- **Filter presets** cover the recurring questions ("this month", "failed", "pending"), reducing repeated filter construction.
- **Pagination** is list-style (not 25/page clumps) with count, because finance users page through a bounded result set; CSV export is the escape hatch for anything bigger.
- **Sorting** is single-column with clear direction; multi-column sort is deliberately rare (it is a Sigma/expert behaviour, not a mainstream one).

## 5.5 Bulk actions and selection

Row selection is checkbox-based; bulk actions (export, block cards, mark reviewed) appear only when selection exists — **action surfaces that appear on demand reduce clutter and teach that the list is actionable.** Bulk never coexists with the primary Create button; they alternate by state.

## 5.6 Sticky headers and sticky columns

- **Sticky headers** keep column names visible while scanning — non-negotiable in financial tables.
- **Sticky/frozen columns** keep identity columns (name, ID, amount) pinned while the view scrolls horizontally — a reference behaviour for wide reconciliation tables. Stripe Apps guidance documents frozen-column tables for exactly this.

## 5.7 Search

Global search finds the *object*; in-table search/filter narrows the *list*. The distinction matters: in-table search is scoped (columns, present data), global search is cross-entity type-ahead. Stripe never conflates the two.

## 5.8 Context menus

Row overflow menus ("⋯") hold row-scoped actions (duplicate, refund, block, notes). This keeps the primary action column clean while every row is still fully actionable. Menus open on the row's right edge — the cursor stays near the row it operates on.

## 5.9 Table verdict for Perionyx

Perionyx's EnterpriseTable already implements most of this: multi-sort, cell formatters, inline editing, CSV/XLS export, density modes, sticky pinning. **Adopt the remaining Stripe lessons:**

1. Async/real filters instead of client-only slicing when the dataset is server-backed.
2. Filter presets for recurring financial questions.
3. Status as dot+label, colour semantics from EDL tokens only.
4. "Action surface on selection" pattern (bulk bar appears only when rows are selected).
5. Identity columns frozen on wide tables.
6. Right-aligned money columns with tabular figures (JetBrains Mono tabular) — verify Perionyx's `CurrencyCell` aligns decimals.
7. Row overflow menu for row-scoped actions; keep primary columns clean.

---

# SECTION 6 — Forms

## 6.1 The money-moving form as first-class engineering

Stripe's publicly-documented system is most distinctive in its forms. The design-system review names the three reference patterns: **AmountInput** (currency-aware input with locale formatting and decimal-place enforcement), **DataTable**, and **ConfirmDialog** (irreversible-action confirmation with typed confirmation, delay, and consequence preview). Note that two of the three are *form/action* components: Stripe treats form correctness as the product's safety rail.

## 6.2 Field grouping

Forms group by **task, not by schema** — "Customer", "Payment", "Billing details" as semantic sections, with progressive disclosure for advanced fields (optional, collapsible, or behind a toggle). Groups carry one caption that tells the user what the section is *for*. This mirrors Perionyx's EnterpriseSection pattern (collapsible, error-badge, advanced badge) — Stripe validates the approach.

## 6.3 Validation

- **Inline validation on blur** — not on submit, not on every keystroke. The field confirms or corrects when the user leaves it.
- **Format enforcement at input time** — AmountInput prevents invalid decimal places, currency-symbol confusion, and locale-mismatched separators *before* the user can type them.
- **Cross-field validation** — e.g. tax-rate immutability: "Once created, the percentage, country, and state cannot be changed." Stripe prevents mutation instead of explaining it, because in financial systems *mutability of reference data is itself a hazard*.
- **Business-rule validation in the workflow** — invoice creation validates against the whole context (customer, tax, status), not just the current field.

## 6.4 Labels and required fields

- Labels are **always visible** (no placeholder-as-label anti-pattern), top-aligned above the field — the fastest-to-scan arrangement for dense financial forms.
- Required/optional are signalled quietly (optional is the unusual state, so it is marked, not required).
- Helper text explains *consequences*, not mechanics: e.g. "Charging immediately will invoice the customer's card on file."

## 6.5 Errors

- Errors are **inline, near the field**, with a human explanation of how to fix — never a bare "invalid."
- Form-level validation summarizes errors in one place (Perionyx's ValidationSummary is the exact same device).
- **Error states assume payments can fail.** Stripe's empty-and-error-state catalog is described as "among the most thorough in fintech — every flow assumes payments can fail." Every failure path is designed, not discovered.

## 6.6 Save flow

- **Draft-by-default.** "Whenever you exit the invoice editor, Stripe saves a draft." Nothing is lost, nothing is final until the user says so. This is the single most important financial-form pattern: *the cost of losing a half-built invoice exceeds the cost of storing drafts*.
- **Idempotent submission.** The API/business layer treats submit as idempotent — double-click cannot double-charge. This is a backend guarantee with a UI consequence (the button disables and shows progress).
- **Immutable-after-finalize.** Once an invoice is finalized/sent, edits are *not allowed*; the fix is "duplicate → correct → send → void the wrong one." Immutability is a *safety feature* that reduces audit ambiguity. The workflow patterns around it (duplicate, void, change status) are the release valves.

## 6.7 Keyboard support

- Full Tab/Shift+Tab traversal, Enter to submit, Escape to cancel/dismiss.
- The `?` shortcut list makes discoverability of keyboard paths explicit.
- Money entry is optimized for number row + decimal key; no mouse dependency for data entry.

## 6.8 Form verdict for Perionyx

Perionyx's EnterpriseForm system (auto-save, UnsavedChangesGuard, inline validation on blur, ValidationSummary, progressive disclosure) already exceeds Stripe's *form shell*. The gaps to close are Stripe's *financial field* semantics:

1. **AmountInput with locale + decimal enforcement** (Perionyx has financial-precision helpers; bind them into the input component).
2. **Draft-by-default for invoice/proposal/transfer builders** — never lose a half-built financial object.
3. **Immutability-after-finalize** with explicit release valves (duplicate, void, amend) — matches Perionyx's append-only audit philosophy.
4. **Confirmation with consequence preview** for irreversible actions — typed confirmation, delay, and a "what will change" preview. Perionyx's ConfirmDialog should adopt the *consequence preview*, not just a warning.
5. **Reference-data immutability** (tax rates, counterparties, bank details) with change-requires-approval, per the Phase 27.1R critical rule.
# Part 3 — Workflows, Visual Design, Interaction Design

---

# SECTION 7 — Workflows

Five representative workflows, mapped step-by-step, with the reasoning behind each structure.

## 7.1 Create a payment / invoice (collect from customer)

Journey (Dashboard invoice editor):

1. Go to **Invoices** → **Create Invoice**.
2. Pick customer (type-ahead from global search-backed selector).
3. Add line items (product/price selector or free-form). Amount is enforced by AmountInput.
4. Add tax, discounts, terms as needed (progressive disclosure).
5. Choose **delivery method** — this is the pivotal decision, presented as explicit choices:
   - Automatically charge a payment method on file
   - Provide a payment link
   - Email invoice with link
   - Email invoice PDF only
6. **Send / Save draft.** Exiting at any point auto-saves a draft.

Why structured this way: the invoice editor is one long task broken into *one decision per section*, with the delivery method as the explicit branching point. Draft-by-default means the "risk" of starting a task is zero. The path from intent to money-in is: choose recipient → describe value → choose collection mechanism → send. There is no "save settings" ceremony because there are no settings — only decisions.

Improvement opportunity: Stripe's invoice builder is still a single linear form; a split-panel live preview (what the customer will see) would reduce "how does this look?" uncertainty without changing the flow.

## 7.2 Refund a payment

Journey:

1. From Payments list, find the payment (filter by status/date, or search).
2. Click into the **payment detail** (single click on row).
3. Detail page shows amount, fees, net payout, customer, payment method, risk level, timeline.
4. Click **Refund** → choose full or partial, choose reason, confirm.
5. Confirmation dialog with consequence context; result reflected in status and timeline.

Why structured this way: refund is a *money-moving* action, so it is (a) attached to its object (never global), (b) not on the list page's primary action, (c) explicitly partial-or-full, (d) confirmed. The detail page does the trust work first — showing fees and net before the user decides — so the decision is made with complete information in view. This is the "evidence beside the action" principle.

Improvement opportunity: a "refund preview" showing the resulting balance effect before commit; and undo-to-revert for refunds that are still settle-able.

## 7.3 Search a customer

Journey:

1. **Global search** (top-left) — type-ahead across customers, payments, invoices, payouts, products.
2. Results grouped by type; click the customer.
3. Customer detail: profile + tabs for subscriptions, payments, payment methods, invoices, quotes, notes.

Why structured this way: the user should not need to know whether the data lives in "Transactions" or "Accounts" — global search dissolves the information-architecture question entirely. Type-ahead turns "find" into "type 3 letters." The customer detail is a *hub* (all money relationships radiate from one identity), which is the correct mental model for finance teams.

Improvement opportunity: Perionyx should extend this into *cross-entity* search where a vendor is a hub across invoices, payments, exceptions, and reconciliation — exactly the AP Manager's mental model.

## 7.4 Review an invoice (payments receivable side)

Journey:

1. Invoices list → filter by status (draft/open/paid/void).
2. Click invoice → detail: amount, customer, line items, tax, status, payment attempts, timeline, receipts.
3. Actions in the overflow/detail bar: Send, Duplicate, Void, Change Status, Send receipt.
4. On payment: receipt generated; itemized; downloadable.

Why structured this way: the review surface separates *facts* (amounts, status, timeline) from *actions* (send, void, duplicate). The timeline provides the audit trail of every state change — the same "chronological integrity" Perionyx's Auditors require. The deliberate absence of *editing* a sent invoice (you duplicate, correct, void) is what keeps the audit trail unbroken.

## 7.5 Export a report (finance/accounting workflow)

Journey:

1. **Reporting** → choose prebuilt report (balance summary, balance change from activity, payout reconciliation, fees, tax).
2. Optionally filter/add custom columns.
3. Download CSV (PDF/Excel for Revenue Recognition reports) — or **schedule** daily/weekly/monthly email delivery.
4. Reconciliation: "every deposit is tagged with a transfer report detailing the exact transactions and fees it contains."

Why structured this way: the Dashboard treats export as a *product*, not a feature. Prebuilt reports encode the reconciliation questions accountants actually ask; scheduling removes the manual ritual; the transfer-report tagging makes bank reconciliation a comparison, not a hunt. The Reports API and Sigma exist for anything the prebuilt set can't express — **the UI handles 80% of questions with zero training; the power tool handles the tail.**

Improvement opportunity (adopt for Perionyx): export must be **schedule-able and reconcile-able** — the Perionyx audit/export system already supports CSV/XLS; add scheduled delivery and "this export answers this question" labelling.

## 7.6 Cross-workflow synthesis

All five workflows share a DNA:

- **Find the object first** (search or list → filter → detail).
- **See complete facts and consequences before acting** (detail page does the trust work).
- **Act with the object in context** (actions attach to objects).
- **Confirm only when irreversible or money-moving.**
- **Everything recoverable** (drafts, duplicates, void) **except the deliberately immutable** (sent invoices, created tax rates).

That is the complete enterprise-workflow formula. Perionyx's Phase 27.1 workflow state machines and EPS are built on the same formula; the mapping is direct.

---

# SECTION 8 — Visual Design

## 8.1 Typography

- **Single variable family, Söhne (Klim), weights 300/400** across product and marketing. One family = one voice; no font-pairing tax.
- **Display tier is thin (300) and large** (26–56px) with negative tracking — editorial, calm, financial-broadsheet.
- **Body 15–16px / 400**, comfortable line-height.
- **Tabular figures (`tnum`) on every money/number cell** — aligned digits, the "quiet financial signature."
- **Mono reserved for raw material** — IDs, code, API values — creating a dialect: human-readable vs machine-identity.

Perionyx mapping: Inter + JetBrains Mono already covers the *dialect* split. The gap is **tabular numerals**: JetBrains Mono is tabular by nature, but Inter is not; Perionyx money columns and KPI numerals must enable `font-variant-numeric: tabular-nums` so columns align and reconciles scan. This is a tiny CSS change with large trust value.

## 8.2 Spacing

- **4px base scale** (4/8/12/16/24/32/48/64) — identical to Perionyx EDL spacing. Adopt as-is (already adopted).
- Whitespace, not borders, separates sections. Hairlines (`#e6ebf1`) separate rows and cards at close range only.

## 8.3 Grid

- **Content column constrained** (~1200px max) centered; sidebars and drawers use the same grid rhythm. The eye always knows where content ends.
- Two-column layouts are the standard detail pattern: **primary column (the object)** + **secondary column (details, metadata, related)**. This is codified in Stripe's OverviewPage/DetailPage app components and is the correct enterprise detail-page anatomy.

## 8.4 Cards and elevation

- Cards are **flat, separated by whitespace and hairlines**, not heavy shadows. Elevation is reserved for layered elements (menus, dialogs, drawers).
- Shadows are **low-opacity and cool-tinted** (blue-ish, ~25% max on marketing mockups; far subtler in-app), signalling depth without pretend-3D.
- **One elevated layer at a time** — modal over drawer over content is avoided; the stack stays shallow.

## 8.5 Colour

- **Base**: near-white `#ffffff` / `#f6f9fc` surfaces; deep navy `#0a2540` / `#061b31` ink (never pure black).
- **One accent** (`#635bff` product / `#533afd` marketing) for interactive and selected states.
- **Status semantics**: success `#24b47e`, error `#cd3d64`, pending amber — used as *dots and small text*, not giant banners.
- **Slate `#425466`** for secondary text.
- Contrast: core ink-on-white exceeds **AAA** (17:1 for headings); small text meets AA. Colour is never the sole carrier of meaning (shape/weight/text accompany colour).

## 8.6 Icons and illustration

- **Iconography is thin-stroke, consistent, semantic** — Lucide-style geometric line icons, never filled doodles. (Perionyx EDL already specifies Lucide; adopt Stripe's *consistency discipline*.)
- Illustration on marketing only; **product surfaces are icon-free of decoration**. If it doesn't label a state or an action, it doesn't exist in the Dashboard.

## 8.7 Charts

- Monochrome-first; one accent line; status colour only when a series *is* a state (e.g. failures).
- Zero baselines, honest axes, no 3D, no gradients-on-charts.
- Legends that double as filters/KPI lists.
- Tabular figures in chart labels too.

## 8.8 Component density

- Default density is **comfortable**; a denser table mode exists for power users. Never both at once on screen; density is a preference, not a per-page guess.
- Buttons: one primary per view, one accent colour, tight 4px radius.

## 8.9 Dark mode / light mode

- **First-class theming via design tokens** — the 2022–24 rebuild made components fully themable, enabling dark mode, "darker mode" for developer tools, and Stripe's own Embedded Components (brand-token injection into the merchant's own app).
- Dark mode quality was treated as an accessibility problem, not a cosmetic one: **colour tokens were auto-generated from a WCAG contrast algorithm** to guarantee AA in every theme. The result was measurable — new accessibility-driven SaaS partnerships worth $10M+ within months.
- Theming is *token-first*: surfaces, text, borders, status, elevation are all semantic tokens; the dark theme is a token remap, not a redesign.

Perionyx mapping: Perionyx EDL is token-first and dark-first (charcoal `#0a0a0f`, gold `#d4af37`). **Adopt Stripe's contrast-algorithm generation for token sets** so any future theme (light mode, high-contrast mode) is provably AA without hand-tuning — this is Principle-level infrastructure, and it is missing today.

## 8.10 Accessibility baseline

- WCAG 2.1 AA as the floor; AAA for core ink. Focus-visible rings are explicit (`rgba(99,91,255,0.1) 0 0 0 3px`). Reduced motion respected. Screen-reader support for charts via data tables/alt summaries. This is the product *and* a sales asset (procurement accessibility requirements).

---

# SECTION 9 — Interaction Design

## 9.1 Hover and focus

- Hover: gentle surface tint + cursor change; row hover reveals row actions; buttons darken/accent-shift. No scale/transform theatrics on money surfaces.
- Focus: **explicit, high-contrast focus-visible rings**; focus never invisible. The keyboard path is a first-class citizen, so focus states are designed, not inherited.
- Hover reveals *more capability* (row actions, drill links) — a progressive-disclosure interaction.

## 9.2 Loading and skeletons

- Skeletons preview the final layout (metric cards, table rows) — **skeletons beat spinners** because they hint at structure and prevent reflow.
- The Stripe Apps guidance is explicit: place the loading state *inside* the tab/component so navigation remains interactive while content loads.
- Empty-vs-loading is distinguished: empty is a designed teaching state; loading is a structural preview.

## 9.3 Transitions and animations

- **Fast, short, deterministic** — 100–200ms, ease-in-out; "no spring physics" in the financial surface. Motion signals *responsiveness*, never narrative.
- Animations respect reduced-motion; nothing essential is conveyed by motion alone.
- New data appears with a subtle fade/pulse (live transaction feed), not a re-render flash.

## 9.4 Drawers and dialogs

- **Drawer (right panel)** for secondary/contextual work — keeps the user in the object's context; the drawer is Stripe Apps' default extension surface.
- **Modal dialogs** for confirmations and focused tasks; modal-over-content only, never modal-over-drawer (shallow stack).
- **Full-page apps** for the deep-work surfaces, with breadcrumbs providing the path back.
- Drawer/dialog both preserve the underlying context — dismissing returns you exactly where you were (context-preserving navigation is even a documented routing requirement for Stripe Apps).

## 9.5 Split panels

- Detail pages use the primary/secondary split; secondary carries *metadata and related objects*, never the primary task.
- Split panels are fixed, not collapsible-by-default; collapsing is a user preference.

## 9.6 Toast, undo, confirmation

- **Toasts** for non-blocking confirmations ("Payment refunded") with a short life; they never block, never require a click.
- **Undo is rare** in Stripe's money paths (refund/void are confirm-not-undo), but **draft auto-save is the true undo**: you can always recover from where you were.
- **Confirmation is consequence-rich**: the ConfirmDialog pattern (typed confirmation, delay, consequence preview) applies to irreversible actions. *The more irreversible, the more friction — friction is the safety.*
- Perionyx mapping: the UndoProvider (global undo, 8s toast) exceeds Stripe for *UI-level* changes; financial mutations must still use consequence-confirmation, exactly as Perionyx's confirm dialog does today.

## 9.7 Context menus

- Row overflow menus; menus open near the cursor; keyboard-accessible (arrow-key navigation); Escape closes. Context actions are always scoped to the row.

## 9.8 Keyboard shortcuts

- **`?`** — help/shortcut palette (discoverability).
- **`~`** — open/minimize Workbench from anywhere (the power-user escape hatch).
- Shell: full command-line keybindings (tab-complete, Ctrl+W/K, history) — a real REPL inside the dashboard.
- Test/live and account switching are mouse-or-keyboard, but the *mode* is always visible so a keyboard shortcut never silently changes environment.
- Perionyx mapping: Perionyx has `?` for KeyboardShortcutsDialog and Cmd+N/F/S — adopt the `?` palette and add a **mode/context toggle** shortcut pair so environment (demo/live, test/live) is keyboard-switchable but always labelled.
# Part 4 — Performance, Accessibility, Enterprise UX

---

# SECTION 10 — Performance

## 10.1 What "fast" means for Stripe

For a financial dashboard, performance is a **trust property**, not just a polish metric. A slow surface reads as "the data is unreliable." Stripe's approach: make the *first view* instant, make *interaction* feel immediate, and make *deep work* (exports, Sigma, big reports) honest about its cost.

## 10.2 Loading strategy — progressive, layered

- **Metrics first, charts second, tables third.** The KPI row renders before the chart because the KPI answers the question; the chart provides context; the table provides detail. Each layer is independently loaded and independently fallible — a slow chart never delays the numbers.
- **Skeletons, not spinners** — structure is previewed, so the layout doesn't jump when data lands.
- **Loading inside components, not around them** — Stripe Apps guidance is explicit: keep navigation/tabs interactive while a tab's content loads.

## 10.3 Caching and staleness honesty

- Financial data is cached, but **staleness is labelled**: reports document data lags (e.g. Revenue Recognition "up to a 4-hour lag"). The user is told the horizon of truth, so a cached number is never mistaken for a live one.
- Live surfaces (balances, payment status) poll/refresh; reference surfaces (metadata) cache long. The cache policy is *per information type*, not global.
- Perionyx mapping: this validates the DataFreshnessIndicator and the tiered-TTL cache strategy already in Perionyx. **Adopt the labelling discipline universally**: every cached number shows its age or refresh policy.

## 10.4 Optimistic updates

- **Low-risk UI state updates optimistically** (filter changes, view toggles, note additions) — the screen responds before the server confirms, with a reconcile-on-failure.
- **Money mutations never update optimistically** — a refund shows a pending state and reconciles from the server's authoritative timeline. Stripe reserves optimism for *cosmetic* state and pessimism for *financial* state. This is the single most important performance-trust boundary in the product.

## 10.5 Streaming and progressive disclosure

- Tables stream pages; lists show counts and incremental loads; global search streams grouped results as you type.
- **Progressive disclosure is also a performance strategy**: don't render what the user hasn't asked for. Detail pages lazy-load tabs; charts render on visibility; the home page is the only "render everything above the fold" surface.
- Lazy loading is per-component, so a heavy widget never blocks the page.

## 10.6 What Perionyx should adopt

1. **Render-order contract**: metrics → charts → tables, independently fallible.
2. **Optimism only for non-financial state**; pessimism + pending states for money mutations.
3. **Per-type caching with labelled staleness** (already partially present via DataFreshnessIndicator — make it universal).
4. **Component-local loading** (already the EnterpriseTable skeleton pattern — extend to all detail pages).
5. **Virtualized/streamed tables** for the large AP/ledger datasets (EnterpriseTable virtualized rows already exist; extend to async pagination).

---

# SECTION 11 — Accessibility

## 11.1 The accessibility investment was strategic, not cosmetic

The 2022–24 dashboard rebuild treated accessibility as a **revenue and compliance asset**: auto-generated WCAG-contrast token sets, a global accessibility policy, and screen-reader/testing infrastructure. Within three months of the accessibility policy, Stripe closed over $10M in new SaaS partnerships with accessibility-requiring customers. Accessibility was a *procurement* win. Perionyx's Auditors and enterprise procurement loops are the same audience.

## 11.2 Keyboard

- **Everything is keyboard-reachable**: navigation, tables, forms, menus, drawers, dialogs. Full traversal, no mouse traps.
- **Shortcut palette** (`?`) makes keyboard power discoverable.
- **Focus order matches visual order**; dialogs trap focus and restore it on close (Perionyx's AnimatedDialog already does this).

## 11.3 Focus order and focus visibility

- Focus-visible rings are explicit and high-contrast — never `outline: none` with no replacement.
- Focus moves sensibly through split panels (primary content before secondary metadata).
- Return of focus after dialog dismissal returns the user to the triggering control.

## 11.4 ARIA

- Status badges are announced with their semantic meaning, not just colour ("Payment failed" — text accompanies colour).
- Tables expose proper row/column headers; action rows expose their labels to screen readers.
- Drawers/dialogs use dialog roles, labelled regions, and aria-modal semantics.
- Charts have textual summaries or data-table equivalents — **a chart is never the only representation of its data**.

## 11.5 Contrast and colour usage

- **AAA core ink** (17:1), **AA small text**, token-generated across all themes.
- **Colour is never the sole carrier**: status = dot + label; trends = arrow + number + colour.
- This directly matches Perionyx EDL accessibility rules — adopt Stripe's *token auto-generation* to keep every future theme provably compliant.

## 11.6 Screen readers and reduced motion

- Screen-reader flows are designed per workflow (money actions announced with full consequence text).
- Reduced-motion disables transform animations; nothing depends on motion (Perionyx MotionProvider already enforces this via `enabled`).
- Empty/error states are announced with *instruction*, not apology.

## 11.7 Perionyx action list

1. Verify every status representation has text alongside colour (EnterpriseTable StatusCell already does — extend to KPI trend indicators).
2. Auto-generate EDL contrast tokens for any future theme (adopt Stripe's algorithm approach).
3. Treat accessibility as a procurement asset: publish an accessibility conformance statement for the demo/enterprise decks.
4. Add chart-data equivalents (hidden tables) for every analytics chart.

---

# SECTION 12 — Enterprise UX

## 12.1 Why do enterprise users like Stripe?

Because Stripe **treats the user's attention as the scarce resource and the user's money as the sacred one.** Enterprise finance users are not thrilled by Stripe's aesthetics; they are loyal because the product *doesn't make them anxious*:

- It tells them exactly what happened and what to do next.
- It never loses their work (drafts).
- It never lets them destroy the audit trail (immutability + duplicate/void).
- It shows the environment (test/live) permanently.
- It aligns numbers so they can reconcile by eye.

## 12.2 How Stripe reduces cognitive load

1. **One decision per screen.** Sections segment a long task into decisions; the delivery method is its own choice; the primary action is singular.
2. **Progressive disclosure.** Details are one intentional click away; the fold contains only behaviour-changing information.
3. **Global search dissolves IA.** Users never map intent → data model.
4. **Comparisons in place.** Previous-period context rides beside every KPI, removing "is this good?" trips to analytics.
5. **Pattern memory.** One sidebar, one action location, one status language — learning transfers across the whole product.
6. **Previews everywhere.** "6 of 25 failed" previews, high-value-customer rows, recent-activity modules — every below-the-fold module is a summary with a door.

## 12.3 How Stripe prevents mistakes

1. **Proximity = risk.** Destructive actions are buried; primary actions are singular.
2. **Confirmations scale with irreversibility.** Refund confirms; deleting API keys requires reveal; tax rates are immutable-by-design.
3. **Draft-by-default.** Nothing is lost, nothing is prematurely final.
4. **Immutability after finalize.** The audit trail is structurally unbreakable; corrections go through duplicate/void/amend.
5. **Environment mode.** Test/live is a global, labelled, colour-coded boundary. The most catastrophic mistake (mixing test data into live operations) is structurally prevented by a top-level switch.
6. **Friction as safety.** The more money moves, the more explicit the confirmation. (Perionyx extends this to dual-signature approval — a *stronger* control for enterprise AP/treasury.)

## 12.4 How Stripe builds trust

- **Specific microcopy.** Ambiguity is the enemy; specificity is the trust mechanism.
- **Complete facts before action.** The detail page shows fees, net, timeline, and risk *before* the Refund button.
- **Audit-grade trails.** Every object carries a timeline of events; nothing is silently modified.
- **Consistent status semantics.** A user who learned "amber = pending" anywhere trusts it everywhere.
- **Visual calm.** A calm interface reads as a controlled process.

## 12.5 How Stripe communicates financial information

- **Align, compare, annotate.** Tabular figures align; same-period comparisons contextualize; microcopy annotates ("amount includes fees").
- **Numbers are the nouns; labels are the verbs.** The KPI is a numeral; its caption explains the numeral's meaning; its comparison explains its quality.
- **Money is never decorative.** Currency formatting is locale-correct, decimal-safe, and consistent; formatting itself is a trust signal.
- **Separate presentation from identity.** Human-readable money via tabular type; machine identity (IDs, raw values) via mono — the two dialects never mix.

## 12.6 Enterprise-UX verdict for Perionyx

Stripe's enterprise-UX model is **80% transferable** to Perionyx. The remaining 20% is where Perionyx must *exceed* Stripe, driven by the Perionyx personas:

| Capability | Stripe | Perionyx must do better because… |
|---|---|---|
| Attention triage | Passive bell | Controller needs "requires me" escalation, not a feed |
| Evidence | Detail pages show facts | Auditor needs every number to link to its source |
| Reversibility | Drafts + duplicate/void | Add undo-to-revert for UI state + recovery paths for data |
| Approval | Payment confirmation only | AP requires dual-signature, matrix-based approval chains |
| Role shaping | One surface, manual pins | Role-based default views per persona (CFO vs Treasurer vs Auditor) |
| Explainability | Status microcopy | AI recommendations must show confidence + evidence + rationale |
| Exploration | CSV/Sigma escape | In-app drill-down from chart → detail (Perionyx analytics vision) |
# Part 5 — Section 13: Design Decisions Catalog

For each decision: what Stripe decided, why, the benefit, the tradeoff, and the Perionyx verdict (**Adopt / Modify / No**). 56 decisions.

| # | Decision | Why Stripe made it | Benefit | Tradeoff | Verdict |
|---|---|---|---|---|---|
| 1 | Home shows ~5 KPIs, not all metrics | Behaviour triggers only | Fast, calm, decisive | Power users want more | **Adopt** |
| 2 | Every KPI carries same-period comparison | "Is this good?" answered in place | Fewer interpretation errors | Vertical space cost | **Adopt** |
| 3 | Monochrome KPI numerals + single trend colour | Colour = state, not decoration | Colour retains meaning | Less "lively" | **Adopt** |
| 4 | Tabular figures on all money | Columns align for reconciliation | Safe vertical scanning | Font-feature discipline | **Adopt** |
| 5 | Job-based nav labels ("Payments", "Disputes") | Zero intent→model translation | Fast navigation | Less precise labels | **Adopt** |
| 6 | Left sidebar, core sections top | Position memory + vertical space | One-click everywhere | Consumes 240px | **Adopt** |
| 7 | Settings at bottom, 3-tier (Personal/Account/Product) | Settings are last resort | Less config anxiety | Discoverability | **Modify** (add permission-aware shaping) |
| 8 | Global cross-entity search top-left | Don't make users know the section | Fast find | Search ranking complexity | **Adopt** |
| 9 | Pins + recents ("Shortcuts") rail | Personal rail in a shared surface | Scales with power | Manual upkeep | **Adopt** |
| 10 | Products grouped, appear when enabled | Scale by groups not items | Clean at large scale | Long rail anyway | **Adopt** + role-aware |
| 11 | Test/Live mode toggle top-left, colour-coded | Environment is the highest-stakes state | Prevents catastrophic mistakes | Banner fatigue | **Adopt** |
| 12 | Mobile bottom tab bar + biometric lock | Money on the go, secure | Reach + safety | Constrained surface | **Adopt** |
| 13 | Opinionated home (widget add/remove, not blank canvas) | Most users want guidance | Better than configurable | Less personal | **Modify** (add saved views) |
| 14 | Alert strip above metrics | "Needs me now" first | Attention priority | Noise if untriaged | **Modify** (role triage) |
| 15 | One primary chart, legend = filter | Cohesion + interactive legend | Fewer charts, more signal | No multi-chart grid | **Modify** (add drill-down) |
| 16 | No forecasting on home | Show truth, not prediction | Credibility | No foresight | **Modify** (forecast with confidence+horizon labels) |
| 17 | Omit vanity metrics by policy | Only decision-driving data | Clear home | "Where's X?" | **Adopt** |
| 18 | Below-the-fold preview modules ("6 of 25 failed") | Summaries with doors | Progressively deep | Previews can tease | **Adopt** |
| 19 | Table filters are async/server-side | Honest at scale | Real queries | Latency | **Adopt** |
| 20 | Filter presets for recurring questions | Recurring work in one click | Speed | Preset maintenance | **Adopt** |
| 21 | Status as dot + label, not banner | State at a glance | Scannability | Less prominent | **Adopt** |
| 22 | No zebra striping; hairlines + alignment | Financial density clarity | Clean | Visual monotony | **Adopt** |
| 23 | Sticky headers + frozen identity columns | Scanning without losing context | Faster reconciliation | Layout complexity | **Adopt** |
| 24 | Bulk action bar appears on selection | Action surfaces on demand | Clutter-free | Discoverability | **Adopt** |
| 25 | Row overflow menus for row actions | Clean primary columns | Tidy | Hidden affordance | **Adopt** |
| 26 | Single-column sort by default | Mainstream behaviour, clear direction | Simplicity | Power limitation | **Adopt** (Perionyx multi-sort is bonus) |
| 27 | CSV export as first-class feature | Reconciliation happens in Excel | Real work done | Off-platform | **Adopt** (add XLS + scheduling) |
| 28 | Scheduled report email (daily/weekly/monthly) | Remove the manual ritual | Habit automation | Stale-by-email risk | **Adopt** |
| 29 | Reports prebuilt for accounting questions | Encode the questions, not the schema | Zero-training value | Rigid set | **Adopt** |
| 30 | Sigma (SQL) as the power tool | UI for 80%, SQL for the tail | Full coverage | Expert-only | **Adopt** (Phase-gated) |
| 31 | Draft-by-default on invoice editor | Never lose half-built work | Zero risk to start | Draft clutter | **Adopt** |
| 32 | Immutability after invoice finalized | Unbreakable audit trail | Trust | Inflexibility | **Adopt** |
| 33 | Duplicate → correct → send → void flow | Release valve for immutable objects | Correctable + auditable | Multi-step | **Adopt** |
| 34 | Delivery method as explicit choice | Branching point surfaced | User controls collection | Decision fatigue (low) | **Adopt** |
| 35 | AmountInput with locale + decimal enforcement | Prevent bad money at input | Data integrity at entry | Field complexity | **Adopt** |
| 36 | Inline validation on blur | Confirm at the right moment | Not naggy | Slight delay | **Adopt** |
| 37 | Reference-data immutability (tax rates) | Mutability of reference data is a hazard | Structural safety | Rigidity | **Adopt** + change-requires-approval |
| 38 | Confirmation scales with irreversibility | Friction is the safety | Mistake prevention | Friction | **Adopt** |
| 39 | Typed confirmation + consequence preview | ConfirmDialog pattern | Real consent | Slower | **Adopt** |
| 40 | Detail page does trust work before action | Complete facts before decision | Informed actions | More clicks | **Adopt** |
| 41 | Object timeline/audit trail on every detail | Chronological integrity | Auditability | Render cost | **Adopt** |
| 42 | Actions attach to objects, never global | Scoped, safe mutation | No stray actions | Longer paths | **Adopt** |
| 43 | Optimism for cosmetic state only | Money is pessimistic | Feels fast + stays safe | Inconsistency of feel | **Adopt** |
| 44 | Skeletons over spinners | Structure previewed | No reflow/jump | Skeleton fidelity work | **Adopt** |
| 45 | Component-local loading | Nav stays interactive | Perceived speed | Coordination | **Adopt** |
| 46 | Staleness labelled (4-hour lag, etc.) | Honest truth horizon | Trust | Ugly caveats | **Adopt** |
| 47 | One accent colour, 4px radius, hairline surfaces | Institutional restraint | Identity + calm | "Boring" risk | **Adopt** (EDL already) |
| 48 | Light 300-weight display type, editorial | Broadsheet feel | Premium calm | Legibility at low weight | **Modify** (Perionyx: bold-for-importance, gold accents) |
| 49 | Token-first theming + contrast algorithm | Provable AA in every theme | Compliance + sales | Token infra cost | **Adopt** |
| 50 | Dark mode as accessibility, not cosmetic | Developer + accessibility demand | Inclusive + premium | Dual-theme QA | **Adopt** |
| 51 | Focus-visible rings, never outline:none | Keyboard as first class | Accessibility | Visual noise | **Adopt** |
| 52 | `?` shortcut palette | Discoverable power | Keyboard mastery | Rarely used by novices | **Adopt** |
| 53 | `~` Workbench REPL inside dashboard | Developer escape hatch | Power | Surface complexity | **Modify** (Perionyx: keep Cmd+K; defer REPL) |
| 54 | Drawer for contextual work, shallow modal stack | Context preserved | Fewer lost states | Stack management | **Adopt** |
| 55 | Two-column detail (primary + secondary) | Facts left, metadata right | Standard anatomy | Fixed mental model | **Adopt** |
| 56 | Empty states teach ("Make your first test payment") | Onboarding at the gap moment | Activation | Edge-case design work | **Adopt** |

## 13.1 Verdict distribution

- **Adopt: 43** — Stripe's core patterns map directly to Perionyx's personas and constitution.
- **Modify: 11** — adaptations where Perionyx's enterprise finance context (approvals, auditors, roles, explainability) requires more than Stripe provides.
- **No: 2** — thin-weight display type (modify instead) and in-dashboard REPL (defer; modify). No outright rejections: every decision was made for reasons that transfer to financial-operations software.

## 13.2 The five highest-leverage adoptions for Perionyx

1. **Same-period comparison on every KPI** (decision 2) — turns metric reading into decision making; near-zero cost, high trust value.
2. **Specific financial microcopy: what happened + what to do next** (the unifying rule of decisions 3, 14, 21, 28, 40, 46) — the strongest trust device in the industry.
3. **Draft-by-default + immutability-after-finalize** (31–33) — aligns exactly with Perionyx append-only audit and Phase 27.1 invariants.
4. **Environment/context as a permanent labelled boundary** (11, 46) — Perionyx's "Demo Data · Seeded" and any future live mode must be as unmissable as Test Mode.
5. **Staleness labelling** (46) — universal age/refresh annotation; Perionyx DataFreshnessIndicator becomes the default, not an exception.

## 13.3 The three decisions Perionyx should challenge

- **16 (no forecasting on home):** Stripe's rejection is right for a *processor* (no ledger context). Perionyx is a *planning platform* for treasury and AP — forecast is core value, provided it is always confidence-labelled and horizon-honest. **Modify** is correct.
- **9/10 (nav scale via pins + groups):** Pins were a band-aid for a growing product list. Perionyx must shape the rail by role from the start; do not rely on pinning to fix IA. **Adopt + role-aware** is correct.
- **34 (delivery method as explicit choice):** In AP, the analogous branching is *payment method + approval path*. Surface it the same way — an explicit choice, not buried defaults. Adopted with renamed semantics.
# Part 6 — Section 14: Perionyx Opportunities

## 14.0 Method

If Stripe's philosophy (decision speed, specific microcopy, status discipline, evidence beside action, drafts-and-immutability) were applied to four Perionyx domains — Accounts Payable, Treasury, Reconciliation, Decision Intelligence — what would they build? Reasoning is grounded strictly in decisions already catalogued in Section 13, not speculation.

---

## 14.1 Accounts Payable

Stripe-philosophy AP would be built around **one question per screen** and **one irreversible action protected by consequence-rich confirmation**.

- **The AP home would lead with "what needs my attention," not "how much do we owe."** A "Requires me" strip — invoices pending approval in *my* approval level, exceptions assigned to *me*, payments awaiting my signature — replaces a passive totals board. Each item is a preview ("3 of 12 approvals") with a door into the exact queue. This is decision 14 + the Perionyx WorkQueue domain, combined.
- **The invoice detail page is the trust surface.** Stripe's payment detail shows fees, net, timeline, risk *before* the refund button. Perionyx's invoice detail must show: matched evidence (PO, GRN, three-way status), duplicate-detection result, tolerance outcome, approval path with current level, and the full audit timeline — *before* any approve/pay action. Evidence beside action (decision 40, 41).
- **Draft-by-default on invoice entry** (decision 31): exiting the entry form saves a draft; nothing is lost; nothing is final until explicitly submitted. Combined with three-way match status shown live during entry.
- **Immutability + duplicate/void release valves** (32–33): once posted, invoices are immutable; corrections flow through credit notes and void — matching Perionyx's append-only `ProcurementAPAuditRecord`.
- **Payment method as an explicit choice, not a default** (decision 34 adapted): each payment proposal surfaces currency, method, and approval-tier consequence as an explicit branching point, like Stripe's delivery-method choice.
- **Confirmation scales with money** (38–39): single-signature limits confirm lightly; dual-signature, threshold-triggered, and >$250K approvals demand typed confirmation + consequence preview. Friction is the safety.

**Net:** Stripe-philosophy AP is the Phase 27.1 reference workflow with Stripe's *attention-first* home and *evidence-first* detail page layered on top.

---

## 14.2 Treasury

Stripe-philosophy treasury would treat **environment and staleness as the first-class citizens** (decisions 11, 46).

- **A permanent data-mode + as-of boundary** above every balance: "Balances as of 14:32 · live" or "cached · 5 min ago". A Treasurer never guesses whether a number is current — the same trust device as Test/Live mode, applied to data freshness. Perionyx's DataFreshnessIndicator becomes the permanent top strip.
- **One primary question per treasury screen**: "Do we have liquidity for the next 7 days?" The cash-position screen answers it with a single forecast chart + available/pending/reserved balance breakdown — then doors into the detail. No chart grid (decision 15).
- **Comparisons in place** (decision 2): every balance and forecast shows prior-day/prior-period delta beside the number, so "is this good?" never triggers a navigation.
- **Forecast is honest** (decision 16 modified): forecast ranges with confidence bands and horizon labels, never a single point pretending to be truth. AI-driven forecasting is a Perionyx differentiator — but only if it labels uncertainty.
- **Fund transfers are the refund workflow**: attach to the source balance, show complete consequences (fees, timing, approval tier) before the button, confirm at irreversibility scale, and record a timeline on the movement (decisions 40–42).
- **Risk and FX exceptions are triaged like disputes** (decision 14): a "needs me now" strip for counterparty-risk limits, FX exposure warnings, and restricted-cash breaches — with direct-response actions, not passive cards.

---

## 14.3 Reconciliation

Stripe built the canonical reconciliation tool *by accident*: transfer reports that tag every deposit with its exact transactions and fees turned reconciliation into a comparison instead of a hunt (Section 7.5). Perionyx should do it on purpose.

- **Reconciliation as a comparison instrument**: two aligned columns (ledger vs bank/statement) with tabular figures, matched pairs visually paired, differences highlighted — the DataTable pattern with alignment doing the reasoning (decisions 4, 22–23).
- **Prebuilt reconciliation reports encoding the real questions**: uncleared items, missing deposits, fee mismatches, duplicate payments — the prebuilt-report logic (decision 29) applied to the recon domain.
- **Scheduled recon runs with email delivery** (decision 28): daily/weekly recon summaries replace the manual "did anything break?" ritual.
- **Every unmatched difference is a task with a next action**: the microcopy rule — each variance tells you what happened and what to do ("Bank fee of $12.00 not in ledger — categorize as fee or investigate") — instead of a bare "difference detected."
- **Staleness is structural**: recon shows its cutoff date everywhere; nothing is reconciled "forever," only "as of a date."

---

## 14.4 Decision Intelligence

Stripe's philosophy would make recommendations **evidence-first and consequence-transparent** — the direct application of microcopy discipline (S2.7) and detail-page trust work (40–41).

- **Every recommendation is a claim with a source.** "Recommended: move $400K to reserve on Friday — cash forecast shows weekend payroll outflow" carries its evidence chain (forecast range, confidence, horizon) beside the recommendation. This is the Perionyx AI Behaviour Guide's "AI explains, never decides" made concrete.
- **Confidence is a first-class visual, not a footnote**: a confidence badge/band on every recommendation, with the universal status language (decision 3) — high/medium/low confidence, never "probably."
- **Recommendations live on the object they mutate**: a duplicate-invoice alert appears on the invoice detail, not in a separate "insights" graveyard (decision 42).
- **Accept/reject is cheap; consequences are previewed**: accepting a recommendation previews the resulting state (pro forma approval chain, resulting balances) before commit — the ConfirmDialog consequence preview (decision 39) applied to decisions, not just money.
- **No recommendation without a "why not this" path**: Stripe shows outcomes; Perionyx's DI must show alternatives and their consequences, because a CFO overrides recommendations and needs the reasoning for both sides.

**Net for the four domains:** Stripe's philosophy, applied to Perionyx, yields a product that is *attention-first, evidence-first, honest-about-staleness, and irreversible-only-with-consequence*. Every one of the moves above maps to an existing Perionyx module (WorkQueue, DataFreshnessIndicator, EnterpriseTable, AI Behaviour Guide, append-only audit) — the opportunities are *compositional*, not greenfield.
# Part 7 — Section 15: Perionyx Design Principles

80 principles extracted from the Stripe study, adapted to Perionyx personas (CFO, Treasurer, Controller, Finance Manager, Auditor) and the Engineering Constitution. Each: **Description · Reason · Example · Perionyx implementation.**

## A. Information Architecture & Navigation (10)

**P01 — Navigation reflects user jobs, not database entities.**
Reason: users translate intent → destination fastest when labels match mental models. Example: "Payments", not "ChargeEvents". Perionyx: label rail items by job ("Approvals", "Exceptions", "Work Queue") not schema ("ProcurementAPInvoice").

**P02 — Module order encodes frequency and risk.**
Reason: position memory beats searching. Example: Balances sits above Transactions. Perionyx: cash position, approvals, and work queue top the rail; configuration pinned to the bottom.

**P03 — Every destination is ≤2 clicks from anywhere.**
Reason: navigation cost multiplies with financial frequency. Perionyx: enforce a click-budget audit on the top 20 CFO/Treasurer journeys.

**P04 — Global cross-entity search dissolves IA.**
Reason: users shouldn't know which section holds the answer. Perionyx: one search across vendors, invoices, payments, journals, exceptions, balances — with grouped type-ahead results.

**P05 — The rail scales by role, not by pinning.**
Reason: pins were Stripe's band-aid for growth; role-shaping prevents the problem. Perionyx: role-aware default rail (Treasurer ≠ AP Manager), with pins as a personal layer on top.

**P06 — Environment and data-mode are permanent labelled boundaries.**
Reason: the highest-stakes state must be unmissable. Example: Stripe's colour-coded Test/Live toggle. Perionyx: "Demo Data · Seeded · not persisted" and any future live mode occupy the same top-left, always-visible slot.

**P07 — Settings are a last resort, tiered by scope.**
Reason: burying configuration reduces accidental breakage. Perionyx: company (IAM/security/audit) vs domain (AP/treasury/GL) vs personal (density/saved views), permission-shaped.

**P08 — Breadcrumbs are the exit path from deep work.**
Reason: detail pages must not become dead ends. Perionyx: every detail and app page carries breadcrumbs (mirroring Stripe Apps DetailPage).

**P09 — Shortcuts (pins + recents) personalise a shared surface.**
Reason: individual rails inside a consistent IA. Perionyx: add recents/pins to the sidebar; keep them secondary to role defaults.

**P10 — Deep analysis escapes cleanly to export/SQL.**
Reason: UI handles 80%, power tools handle the tail. Perionyx: CSV/XLS export on every table; SQL/sigma-style capability gated behind an analyst role.

## B. Decision Support & KPIs (10)

**P11 — A screen answers one question.**
Reason: one decision per screen minimises cognitive load. Perionyx: each dashboard/workspace states its question in the header ("Do we have liquidity for 7 days?").

**P12 — 4–6 KPIs above the fold; everything else one click away.**
Reason: the fold holds only behaviour-changing information. Perionyx: enforce a KPI budget on every Perionyx dashboard page.

**P13 — Every KPI carries same-period comparison.**
Reason: "is this good?" answered in place. Perionyx: previous-period delta beside every metric value, per Phase 20.1 dashboard improvements.

**P14 — Every KPI shows source and timestamp.**
Reason: a number without provenance invites doubt. Perionyx: DataFreshnessIndicator + source link on all five executive KPIs (already shipped; make universal).

**P15 — Metric value renders before its chart.**
Reason: numbers answer the question; charts add context. Perionyx: render-order contract — metrics → charts → tables, independently fallible.

**P16 — Charts answer "what is it made of?" with interactive legends.**
Reason: distribution is a glance, not a click. Perionyx: stacked status/distribution charts with legend-as-filter on executive dashboards.

**P17 — Forecasts label confidence, horizon, and evidence.**
Reason: a single-point forecast pretends to know the future. Perionyx: confidence bands + horizon + evidence links on every treasury/DI forecast (AI Behaviour Guide).

**P18 — Below-the-fold content is previews with doors, not walls of data.**
Reason: "6 of 25 failed" teaches and routes. Perionyx: every home module is a summary card with a View-all door.

**P19 — Omit what doesn't change a decision.**
Reason: clutter hides the one thing that matters. Perionyx: add a "does this change a decision?" gate to dashboard review (Constitution Clarity test).

**P20 — Actionable items are triaged by "needs me", not aggregated in a feed.**
Reason: passive bells fail Controllers. Perionyx: role-aware escalation tiers (requires-me vs informative) with deep links.

## C. Financial Communication (8)

**P21 — Money uses tabular figures everywhere.**
Reason: aligned columns reconcile by eye. Perionyx: enable `tabular-nums` on Inter for all money cells (JetBrains Mono already tabular).

**P22 — Money is right-aligned; labels are left-aligned.**
Reason: vertical comparison is the financial read. Perionyx: enforce alignment rules in table component defaults.

**P23 — Numbers are the nouns; captions are the verbs.**
Reason: the numeral is the subject, the caption its meaning. Perionyx: KPI = value + label + delta + source, in fixed visual order.

**P24 — Human-readable presentation and machine identity never mix.**
Reason: IDs are raw material, not reading. Perionyx: mono type for IDs/codes/raw values; Inter for all human sums.

**P25 — Currency is locale-correct, decimal-safe, and consistent.**
Reason: formatting inconsistency reads as data unreliability. Perionyx: route all currency through one formatting module (Phase 19 financial-precision helpers).

**P26 — Status is dot + label, colour is never the sole carrier.**
Reason: colour-blind and screen-reader users need the label. Perionyx: StatusCell/trend components pair colour with text always.

**P27 — Colour means state, never decoration.**
Reason: when everything is coloured, nothing is. Perionyx: gold = primary accent/active; green/red/amber = success/error/pending only; enforce via EDL tokens.

**P28 — Annotate consequences on every number ("amount includes fees").**
Reason: assumptions destroy trust in finance. Perionyx: microcopy under money values explains inclusions/exclusions.

## D. Trust & Microcopy (8)

**P29 — Every status message answers: what happened + what to do next.**
Reason: specificity eliminates the anxiety of the unknown. Perionyx: standard "status → explanation → action" microcopy template on all financial states.

**P30 — Vague errors are a defect, not a style choice.**
Reason: "Something went wrong" in money software is unacceptable. Perionyx: lint/QA gate rejects placeholder error strings in AP/treasury/GL routes.

**P31 — Empty states teach, they never apologise.**
Reason: the empty moment is an onboarding opportunity. Perionyx: every empty AP/treasury screen shows a concrete next action ("Import your first vendor file").

**P32 — Evidence appears beside every recommendation.**
Reason: trust is built by provenance. Perionyx: insight/recommendation components carry sourceUrl/sourceLabel/confidence (InsightPanel already does).

**P33 — Explainability is a first-class visual, not a footnote.**
Reason: a CFO overrides recommendations; both-sides reasoning is required. Perionyx: confidence badge + rationale + alternatives on every DI recommendation.

**P34 — Specificity scales with financial consequence.**
Reason: the more money involved, the more precise the language. Perionyx: high-value workflows use exact amounts, dates, and party names in confirmations.

**P35 — State changes are narrated by the timeline, not by memory.**
Reason: chronological integrity is the Auditor's requirement. Perionyx: every financial object renders an append-only event timeline (Phase 21A audit model).

**P36 — Age and freshness are labelled on cached data.**
Reason: stale numbers presented as live are a credibility failure. Perionyx: DataFreshnessIndicator default-on across all read surfaces.

## E. Mistakes & Safety (8)

**P37 — Proximity equals risk: destructive actions are buried.**
Reason: accidental money damage is the worst failure mode. Perionyx: refund/void/delete/rotate actions in overflow menus, never beside primaries.

**P38 — Confirmation scales with irreversibility.**
Reason: friction is the safety. Perionyx: tiered confirmation (light → typed → dual-signature) by amount/irreversibility.

**P39 — Every irreversible action previews consequences.**
Reason: informed consent beats post-hoc regret. Perionyx: ConfirmDialog shows "what will change" before commit (upgrade Phase 8B.9 ConfirmDialog).

**P40 — Draft-by-default for financial objects.**
Reason: losing half-built work is worse than storing drafts. Perionyx: invoice/proposal/transfer builders auto-save (EnterpriseForm auto-save extended).

**P41 — Immutability after finalize, with explicit release valves.**
Reason: unbreakable audit trails; correctable via duplicate/void/amend. Perionyx: post/approve/pay finalises objects; corrections flow through credit notes and voids.

**P42 — Environment boundaries are structural, not advisory.**
Reason: test data in live operations is catastrophic. Perionyx: demo/live separation enforced at the data layer, mirrored by a permanent UI boundary.

**P43 — Optimism is for cosmetic state only; money is pessimistic.**
Reason: financial state must reconcile from the authoritative source. Perionyx: UI toggles/notes optimistic; refunds/payments/approvals show pending and reconcile.

**P44 — Undo exists where reversal is safe; confirmation where it isn't.**
Reason: the undo/confirm split is the reversal strategy. Perionyx: global UndoProvider for UI state; consequence confirmation + recovery paths for data.

## F. Workflows & Actions (8)

**P45 — Primary financial actions are always visible, always singular.**
Reason: one clear next step per screen. Perionyx: one primary CTA per page; everything else secondary or overflow.

**P46 — Actions attach to the object they mutate.**
Reason: scoped actions prevent stray mutation. Perionyx: approve/pay/reject live on the invoice/proposal detail, not global toolbars.

**P47 — Find the object → see the facts → act.**
Reason: the canonical workflow shape; detail pages do the trust work. Perionyx: enforce this flow for the 10 Phase 27.1 AP stages.

**P48 — Branching points are explicit choices, not hidden defaults.**
Reason: users should own collection/payment/approval decisions. Perionyx: payment method and approval path surface as choices on proposals (mirroring delivery method).

**P49 — Every workflow minimises context switching.**
Reason: context loss is the cost of navigation. Perionyx: drawers and split panels keep evidence in view during actions.

**P50 — Workflows recover from interruption.**
Reason: finance work is fragmented by approvals. Perionyx: drafts, resume-pointers, and "continue where you left off" on multi-step forms.

**P51 — Confirmation dialogs are consequence-rich, not generic.**
Reason: "Are you sure?" teaches nothing. Perionyx: dialogs state the object, the effect, and the alternative.

**P52 — Bulk power appears on selection.**
Reason: on-demand action bars reduce clutter and teach actionability. Perionyx: batch approve/export/flag bars appear only when rows are selected.

## G. Tables & Data (8)

**P53 — Tables are reconciliation instruments, not lists.**
Reason: finance users scan, compare, and export. Perionyx: treat EnterpriseTable as the audit instrument; design for comparison first.

**P54 — Filters map to real questions, with presets.**
Reason: recurring filters are one click. Perionyx: "This month", "Needs my approval", "Exceptions" presets across AP tables.

**P55 — Filters execute against the server at scale.**
Reason: client slicing lies at scale. Perionyx: async/server filters on large datasets; client filters only for bounded reference data.

**P56 — Sticky headers and frozen identity columns.**
Reason: scanning must never lose context. Perionyx: enable frozen name/amount columns on wide ledger/AP tables.

**P57 — Single-column sort by default; multi-sort as power.**
Reason: direction clarity for the mainstream; power for experts. Perionyx: keep multi-sort behind a power toggle (already exists).

**P58 — Export is a first-class feature with scheduling.**
Reason: reconciliation happens off-platform. Perionyx: CSV/XLS everywhere + scheduled report delivery.

**P59 — Row density is a preference, never a per-page guess.**
Reason: density consistency reduces re-learning. Perionyx: density setting persists per user across tables.

**P60 — Every row opens its detail; every detail returns via breadcrumb.**
Reason: tables are doors. Perionyx: default row click → detail with breadcrumb (audit the raw table pages — WF-012 debt).

## H. Forms & Input (7)

**P61 — Financial input enforces format at entry.**
Reason: bad money never reaches the ledger. Perionyx: AmountInput component binding financial-precision helpers (locale, decimals, range).

**P62 — Validate inline on blur; confirm with the field in context.**
Reason: feedback lands where the mistake is. Perionyx: EnterpriseField error-on-blur + cross-field validation at section level.

**P63 — Labels always visible, top-aligned, optional marked not required.**
Reason: dense financial forms need stable labels. Perionyx: EnterpriseField defaults (already correct).

**P64 — Reference data is immutable or change-requires-approval.**
Reason: mutability of reference data is a hazard. Perionyx: vendor bank-detail changes require dual approval (Phase 27.1R critical rule).

**P65 — Submission is idempotent and visibly pending.**
Reason: double-submit must not double-move money. Perionyx: idempotency keys wired to payment/proposal endpoints (Phase 21A.3 middleware).

**P66 — Save flow is draft → validate → finalise, never silent-fail.**
Reason: the user must always know the state of their work. Perionyx: AutoSaveIndicator states (saving/saved/failed/unsaved) everywhere.

**P67 — Keyboard completes the form.**
Reason: finance data entry is high-volume. Perionyx: full Tab/Enter/Escape traversal on all enterprise forms.

## I. Visual Design & Motion (8)

**P68 — Whitespace, not borders, separates sections.**
Reason: calm surfaces signal control. Perionyx: EDL spacing discipline; hairline borders only at close range.

**P69 — One accent; everything else neutral.**
Reason: accent is impactful only when rare. Perionyx: gold is the single accent; status colours carry state only.

**P70 — Ink is never pure black.**
Reason: pure black reads harsh and cheap. Perionyx: EDL charcoal/off-white text tokens (already enforced).

**P71 — Typography does the emotional work.**
Reason: type quality is the proof of product quality. Perionyx: Inter + JetBrains Mono dialect; tabular numerals; weight/scale discipline.

**P72 — Elevation signals layering, one layer at a time.**
Reason: deep stacks confuse state. Perionyx: one elevated layer (dialog over content), never modal-over-drawer.

**P73 — Motion is fast, short, and never required.**
Reason: motion signals responsiveness, not narrative. Perionyx: EDL motion tokens, reduced-motion respected (MotionProvider).

**P74 — Icons label state and action, not decoration.**
Reason: an icon that doesn't mean something is noise. Perionyx: Lucide semantic icons per EDL iconography guide.

**P75 — Dark-first charcoal + gold is a token set, not a theme.**
Reason: provable contrast in every surface. Perionyx: EDL tokens generate all surfaces; verify AA per token pair automatically.

## J. Interaction & Performance (8)

**P76 — Skeletons preview structure; spinners are the last resort.**
Reason: no reflow, structure hinted. Perionyx: skeleton presets on all loading surfaces (already built).

**P77 — Loading lives inside components; navigation stays alive.**
Reason: perceived speed is interactivity, not paint. Perionyx: component-local loading on detail tabs.

**P78 — Hover reveals more capability.**
Reason: progressive disclosure through hover. Perionyx: row-hover reveals row actions and drill links.

**P79 — Drawers preserve context; full pages do deep work.**
Reason: secondary work shouldn't lose the object. Perionyx: contextual drawer for approvals/notes; full pages for analysis.

**P80 — Power users get a discoverable keyboard palette.**
Reason: `?` teaches mastery. Perionyx: extend the existing keyboard-shortcuts dialog; add financial context shortcuts (approve/next/approve-all in queue).

---

## 15.1 Principle provenance

- 36 principles trace directly to observable Stripe decisions in Section 13.
- 22 principles extend Stripe patterns to Perionyx's enterprise context (approvals, evidence, roles, audit).
- 22 principles are shared with the existing Perionyx constitution/EDL and are restated here as *validated* rather than *new*.

Every principle above is implementation-ready: each maps to a module, component, or token set that exists in the Perionyx codebase today.
# Part 8 — Section 16: Perionyx Action Plan

100 ranked improvements, mapped to existing Perionyx modules. Effort and impact are person-week estimates and qualitative ratings for planning only. Priority: **Critical → High → Medium → Low**.

## 16.1 Critical (15)

| # | Improvement | Effort | Impact | Maps to |
|---|---|---|---|---|
| 1 | Universal staleness/freshness labelling on all read surfaces (make DataFreshnessIndicator the default, not an exception) | 1–2w | Very High | DataFreshnessIndicator, executive KPIs, treasury, AP |
| 2 | Financial microcopy standard: every status/error answers "what happened + what to do next"; reject vague strings | 2–3w | Very High | AP states, treasury alerts, workflow exceptions, WorkQueue |
| 3 | Same-period comparison on every KPI across all dashboards | 1–2w | Very High | ExecutiveKpiCard, VarianceCard, all dashboards |
| 4 | Tabular numerals (`font-variant-numeric`) on all money cells and KPI values | 1w | High | EnterpriseTable CurrencyCell, KPI components, EDL typography |
| 5 | "Requires me" triaged work queue — role-aware escalation, deep links, preview-with-door | 3–4w | Very High | WorkQueue module, todays-work, dashboard composition |
| 6 | Role-aware sidebar defaults (CFO/Treasurer/Controller/AP Manager/Auditor see their rail first) | 2–3w | Very High | nav-config, app-shell, IAM permissions |
| 7 | Draft-by-default on invoice/proposal/transfer builders (EnterpriseForm auto-save extended to money objects) | 2–3w | Very High | EnterpriseForm, invoice/proposal/transfer forms |
| 8 | Immutability-after-finalize with duplicate/void/amend release valves in AP UI | 3–4w | Very High | AP services, credit-service, audit trail |
| 9 | Consequence-preview confirmation dialogs (object, effect, alternative, typed for high value) | 2–3w | High | ConfirmDialog, approval thresholds |
| 10 | Global cross-entity search (vendors, invoices, payments, journals, exceptions, balances) | 4–6w | Very High | CommandPalette, search modules, AP services |
| 11 | Evidence links + confidence on every recommendation by default | 1–2w | High | InsightPanel, AI Behaviour Guide, Decision Intelligence |
| 12 | Confidence badges on all AI recommendations (high/medium/low + rationale + alternatives) | 1–2w | High | ConfidenceBadge, AI platform, DI |
| 13 | One primary action per page — enforce via component audit | 1w | Medium | PageContainer, EnterprisePageHeader |
| 14 | Money input format enforcement at entry (AmountInput binding financial-precision helpers) | 2w | High | financial-precision, EnterpriseField, AP forms |
| 15 | Empty states teach next action across all modules (no bare "no data") | 2w | Medium | EmptyState components, onboarding, AP, treasury |

## 16.2 High (25)

| # | Improvement | Effort | Impact | Maps to |
|---|---|---|---|---|
| 16 | Filter presets on all AP/tables ("This month", "Needs my approval", "Exceptions") | 1–2w | High | EnterpriseTable, WorkQueue filters |
| 17 | Server-side/async filters on large datasets (ledger, audit, AP invoices) | 3–4w | High | EnterpriseTable, AP APIs |
| 18 | Frozen/sticky identity columns on wide tables | 1w | Medium | EnterpriseTable pinning |
| 19 | Scheduled export/report delivery (daily/weekly/monthly email) | 2w | Medium | export-utils, reporting, queue jobs |
| 20 | Optimistic/pessimistic split: cosmetic UI optimistic; money mutations pending-and-reconcile | 2w | High | UndoProvider, AP payment flow, treasury transfers |
| 21 | Environment boundary: demo/live enforced structurally + permanent labelled top-left indicator | 2w | High | app-shell, data-mode badge, IAM |
| 22 | Extend keyboard palette with financial shortcuts (approve/next/approve-all, approve item in queue) | 1–2w | Medium | useKeyboardShortcuts, WorkQueue, approvals |
| 23 | Object event timeline on all financial details (append-only narration) | 3–4w | High | AP audit model, detail pages |
| 24 | Reference-data immutability with change-requires-approval (vendor bank details, tax rates, counterparties) | 2–3w | High | vendor-service, approval matrix |
| 25 | Idempotent submission wired to all money-mutation endpoints | 1–2w | High | idempotency middleware, AP APIs |
| 26 | Bulk action bar on selection (batch approve/export/flag) | 2w | Medium | EnterpriseTable, WorkQueue, AP |
| 27 | Drawer-based contextual actions (approve with evidence in view; notes; exceptions) | 3–4w | Medium | AnimatedDrawer, detail pages |
| 28 | Workflow resume pointers ("continue where you left off") on multi-step forms | 1–2w | Medium | EnterpriseWizard, drafts |
| 29 | Row-click → detail + breadcrumb everywhere (clear WF-012 raw-table pages) | 3–5w | High | EnterpriseTable adoption, 19 pages |
| 30 | One accent discipline audit — remove non-gold accent sprawl outside status | 1w | Medium | EDL tokens, EDL lint rules |
| 31 | Per-page question statement in headers ("Do we have 7-day liquidity?") | 1w | Low | EnterprisePageHeader |
| 32 | KPI budget enforcement (4–6 max) on dashboard pages | 1w | Medium | dashboard components |
| 33 | Status colour paired with text everywhere (audit trends/badges) | 1w | Medium | StatusCell, KPI trends |
| 34 | Chart accessibility: hidden data tables for every chart | 2w | Medium | analytics components |
| 35 | Contrast-token auto-generation for all future themes (WCAG algorithm) | 2–3w | Medium | EDL, token tooling |
| 36 | Skeleton-first loading on all detail tabs (component-local, nav stays alive) | 2w | Medium | LoadingSkeleton, detail pages |
| 37 | Currency formatting routed through single module (kill 19 formatCurrency variants) | 2–3w | High | financial-formatting, Phase 19 consolidation |
| 38 | Export XLS parity + UTF-8 CSV verified across all export surfaces | 1w | Medium | export-utils |
| 39 | Vendor-as-hub detail page (invoices, payments, exceptions, recon radiate from one profile) | 3–4w | High | vendor detail, AP |
| 40 | Approval path visualisation on invoice/proposal detail (current level, path, thresholds) | 2–3w | High | ApprovalPreview, ApprovalMatrix |

## 16.3 Medium (30)

| # | Improvement | Effort | Impact | Maps to |
|---|---|---|---|---|
| 41 | Density preference persists per user across tables | 1w | Low | EnterpriseTable, settings |
| 42 | Multi-sort behind power toggle; single-sort default | 1w | Low | use-multi-sort |
| 43 | Saved views per role (query + columns + density + filters) | 3–4w | High | EnterpriseTable, views |
| 44 | Chart drill-down: click bar/segment → underlying instance list | 4–6w | High | analytics, drill-down vision |
| 45 | Legend-as-filter on distribution charts | 1–2w | Medium | chart components |
| 46 | Recents + pins in sidebar (Stripe Shortcuts equivalent) | 1w | Low | app-shell, nav-config |
| 47 | Notifications triage tiers (requires-me vs informative) + role shaping | 2–3w | High | NotificationCenter |
| 48 | Report presets encoding accounting questions (balance change, fee, reconciliation) | 2w | Medium | reporting, AP/treasury |
| 49 | Reconcile-by-comparison view (ledger vs statement aligned, diffs highlighted) | 3–4w | High | reconciliation domain |
| 50 | Uncleared-items task list with next-action microcopy | 2w | Medium | reconciliation, WorkQueue |
| 51 | Per-invoice AI coding suggestion with evidence + confidence | 2–3w | Medium | AI platform, invoice service |
| 52 | Duplicate-detection surfaced on invoice detail with match evidence | 2w | Medium | duplicate detection, detail page |
| 53 | Pro-forma approval preview before submitting high-value payments | 2w | Medium | payment proposal, ApprovalPreview |
| 54 | Transfer/payment consequence preview (fees, timing, approval tier) before confirm | 2w | Medium | treasury transfer, payment flow |
| 55 | "Why not this?" alternatives view on DI recommendations | 2–3w | Medium | Decision Intelligence |
| 56 | Chart annotations: source + as-of stamp on every chart | 1w | Low | ChartCard |
| 57 | Mobile parity: approve-from-phone with evidence view | 3–4w | Medium | mobile approvals, QuickActionBar |
| 58 | Mobile bottom-nav approval count badge | 1w | Low | mobile nav |
| 59 | Push notifications for requires-me items with deep links | 2–3w | Medium | notification delivery job |
| 60 | Biometric lock on mobile dashboard | 1w | Low | mobile app |
| 61 | Test-mode/sandbox toggle for AP workflows (safe trial) | 3–4w | Medium | sandbox pattern, AP |
| 62 | Onboarding checklist tied to real first actions ("import vendors", "first invoice") | 2w | Medium | onboarding wizard |
| 63 | Empty-state next-action catalogue across modules | 1–2w | Low | EmptyState components |
| 64 | Confirm-dialog library upgrade: consequence preview + typed for high value | 2w | Medium | ConfirmDialog |
| 65 | "What changed" timeline on shared views (team activity) | 2w | Low | audit trail, activity |
| 66 | Export naming conventions encode the question ("balances-change-2026-07.csv") | 1w | Low | export-utils |
| 67 | Sidebar collapse + focus mode for deep work | 1w | Low | app-shell |
| 68 | In-page "learn this table" hover guides on first use | 1w | Low | FieldHelp pattern |
| 69 | Role-based default dashboards (CFO vs Treasurer vs AP Manager) | 3–4w | High | dashboard composition |
| 70 | Waterfall/variance drill from budget to journal entries | 3–4w | Medium | VarianceCard, GL |

## 16.4 Low (30)

| # | Improvement | Effort | Impact | Maps to |
|---|---|---|---|---|
| 71 | Toast undo for UI-level changes (already present) — extend to filter/view changes | 1w | Low | UndoProvider |
| 72 | Search results grouped by type with preview snippets | 1w | Low | CommandPalette, search |
| 73 | Keyboard-only table navigation (arrow rows, Enter opens) | 1–2w | Medium | EnterpriseTable |
| 74 | Screen-reader flow tests for approve/pay/reject | 1w | Low | a11y tests |
| 75 | Accessibility conformance statement for procurement | 1w | Low | docs/compliance |
| 76 | Reduced-motion audit of remaining animated components | 1w | Low | MotionProvider |
| 77 | Focus-order audit on split panels and drawers | 1w | Low | drawer, split panel |
| 78 | Animated metric entrance respecting reduced motion | 1w | Low | AnimatedMetric |
| 79 | Chart colour-consistency audit against EDL status tokens | 1w | Low | chart tokens |
| 80 | Preview modules on home with "6 of 25" style partial summaries | 1–2w | Medium | dashboard home |
| 81 | Scheduled recon digest email | 1w | Low | queue jobs, recon |
| 82 | Per-queue SLA labels surfaced in WorkQueue (canonical `toWorkQueueSlaLabel` usage) | 1w | Low | WorkQueue, H-01 |
| 83 | Approved/overdue reports as one-click presets | 1w | Low | reporting |
| 84 | Exception detail with full evidence chain (matched docs, tolerance result) | 2w | Medium | exception service, detail |
| 85 | AI risk-scoring on invoices with confidence band (not a single number) | 2–3w | Medium | AI platform, AP |
| 86 | Bulk upload/import for vendors and invoices with validation preview | 3–4w | Medium | import, validators |
| 87 | Inline editing with optimistic save only on reference fields | 1w | Low | inline-edit |
| 88 | Table column presets per role (Auditor sees timestamps first) | 2w | Low | EnterpriseTable, views |
| 89 | Currency conversion display toggle with source + rate shown | 1–2w | Low | currency service |
| 90 | Golden-path "first hour" tour for each persona | 2w | Medium | onboarding |
| 91 | Peer-benchmark context on treasury metrics (labelled as benchmark, with source) | 1–2w | Low | metrics, evidence |
| 92 | Bookmarkable deep links for every filtered view | 1w | Low | EnterpriseTable, URL state |
| 93 | Copy-object pattern (duplicate invoice/proposal/transfer) everywhere | 1w | Low | AP services |
| 94 | "Explain this number" affordance on KPIs (opens source trail) | 1–2w | Medium | KPI components, audit |
| 95 | High-value threshold badges with gold accent on rows > $25K | 1w | Low | WorkQueue, tables |
| 96 | Grouping control on tables (by vendor, by status, by due date) | 2w | Medium | EnterpriseTable |
| 97 | Collapsible secondary panel on detail pages | 1w | Low | detail pages |
| 98 | Keyboard shortcut cheat-sheet card embedded in queues | 1w | Low | shortcuts dialog |
| 99 | Shareable view links with permissions for cross-team review | 2w | Low | views, IAM |
| 100 | Design-decision log (this document) becomes a living reference in docs/design | 1w | Low | docs/research |

## 16.5 Sequencing recommendation

- **Wave 1 (Critical, ~6–8 weeks):** items 1–8, 10–11, 14 — the trust and attention foundation. Everything here is compositional over existing modules (WorkQueue, EnterpriseForm, DataFreshnessIndicator, AP services).
- **Wave 2 (High, ~8–10 weeks):** items 16–29, 38–40 — workflow depth and table/reconciliation power.
- **Wave 3 (Medium + Low, ongoing):** items 41–100 in priority order, as domain phases (21B/21C/21D) land.

**Acceptance rule for every item:** it must pass the Perionyx Security Review checklist (AGENTS.md) and the Constitution Clarity test ("does this change a decision?"). Items that fail the clarity test are demoted to Low regardless of engineering appeal.
