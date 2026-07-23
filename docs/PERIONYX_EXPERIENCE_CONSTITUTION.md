# Perionyx — Experience Constitution

**Version 1.0**
**Last Updated: July 2026**
**Status: Ratified**

---

## Preamble

This document is the permanent philosophy governing every user experience decision in Perionyx. It sits alongside the Governance Constitution, Product Constitution, and Autonomous Finance Workforce Constitution as a foundational authority.

Every interface, every interaction, every animation, every empty state, every error message, every dashboard, and every navigation decision must be consistent with this document.

When experience decisions conflict with this constitution, this document prevails over all implementation-level design guidance.

This is not a design system document. This is not a component library specification. This is the *thinking* behind every pixel — the permanent answer to why Perionyx looks, feels, and behaves the way it does.

---

## Section 1 — Experience Philosophy

### What Perionyx Should Feel Like

Perionyx should feel like sitting across from a trusted financial advisor who has already done the work. Not a tool that demands your attention. Not a dashboard that screams for your focus. A calm, prepared, evidence-backed partner that has already analyzed the data and is presenting conclusions with the patience and precision that enterprise finance demands.

#### Calm

Finance professionals operate under sustained cognitive load. Markets move. Deadlines approach. Boards ask questions. Auditors request evidence. The interface must be the one place where everything is organised, nothing is frantic, and information appears in the order that reasoning requires — not in the order that a designer found convenient.

Calm is not sleepy. Calm is the quiet confidence of knowing that the numbers are right, the evidence is available, and the next action is clear.

#### Trustworthy

Every number on screen has a source. Every recommendation has evidence. Every status indicator reflects reality. The interface never overstates confidence, never hides uncertainty, and never presents derived data as fact without attribution. Trust is built through relentless honesty — showing the user exactly what the system knows, what it doesn't know, and where the boundaries are.

#### Deliberate

Nothing in Perionyx happens by accident. Every animation serves a purpose. Every layout choice reflects a priority. Every colour communicates a meaning. The interface is designed with the same deliberateness that a CFO applies to a capital allocation decision — with clear reasoning, explicit tradeoffs, and documented intent.

#### Executive

Perionyx is built for people who make decisions with consequences. The interface treats its users as professionals — not as consumers, not as patients, not as students. It does not explain what a balance sheet is. It does not ask if the user is sure they want to see cash flow. It respects the user's expertise while providing the evidence to support their judgment.

#### Professional

The interface carries itself with the same gravitas as the financial operations it supports. It is not playful. It is not trendy. It does not chase design fashions. It uses the visual language of serious financial infrastructure — the same language used by Bloomberg, Reuters, and the terminals that run global capital markets.

#### Evidence-Driven

Every screen in Perionyx answers a question. Every question has evidence. Every evidence trail leads to a source record. The interface never asks the user to trust a number without showing where it came from. This is not optional — it is the fundamental contract between the system and the professional using it.

#### Focused

Perionyx does one thing at a time. It does not try to show everything on every screen. It guides attention to what matters now, provides easy access to what mattered before, and makes what will matter next always reachable. Focus is not the absence of information — it is the presence of the right information at the right time.

#### Predictable

After using Perionyx for a week, a user should be able to predict how any new screen will behave. Buttons will be where buttons are. Tables will sort the way tables sort. Navigation will follow the same logic it has always followed. Predictability is the foundation of speed — and speed is what finance professionals need.

#### Explainable

When Perionyx recommends an action, it explains why. When it highlights a risk, it shows the evidence. When it surfaces an insight, it discloses its methodology. The interface is never a black box. The user should always be able to answer the question: "How did the system arrive at this conclusion?"

#### Not Stressful

The interface must never create anxiety. Loading spinners without context create anxiety. Unclear error messages create anxiety. Ambiguous statuses create anxiety. Missing data without explanation creates anxiety. Every design decision must be evaluated against one question: does this reduce stress or increase it?

#### Not Flashy

Animations exist to communicate state changes, not to impress. Transitions exist to maintain spatial orientation, not to decorate. Colour exists to distinguish meaning, not to attract attention. The interface is invisible when it works well — the user sees their data, not the design.

#### Not Playful

Finance is not a game. The interface does not congratulate the user for completing tasks. It does not use emojis. It does not use casual language. It does not try to be charming. It tries to be useful.

#### Not Social Media

Perionyx does not infinite-scroll. It does not autoplay content. It does not use engagement metrics to determine what to show. It does not personalise based on click patterns. It presents financial truth in the order that financial reasoning requires.

---

## Section 2 — Product Identity

### What Perionyx Is Not

Perionyx is not another ERP. ERPs are horizontal suites that try to do everything — manufacturing, HR, procurement, CRM, and finance. Perionyx does finance. Only finance. Deeply.

Perionyx is not another dashboard. Dashboards display metrics. Perionyx drives actions. A dashboard shows you a number. Perionyx shows you the number, explains why it changed, recommends what to do, and lets you do it — all in one flow.

Perionyx is not another admin template. Admin templates are starting points for building applications. Perionyx is the application. It ships with 338 data models, 67 modules, and the complete operational infrastructure for enterprise financial management.

Perionyx is not another AI wrapper. AI wrappers call an LLM and format the response. Perionyx uses AI as one input among many — alongside deterministic financial engines, policy rules, approval workflows, and audit trails. AI does not run the system. The system runs; AI informs it.

Perionyx is not another accounting package. Accounting packages record transactions and produce reports. Perionyx does that — and also manages treasury, enforces governance, orchestrates workflows, detects risk, reconciles exceptions, runs approvals, and coordinates autonomous finance specialists. It is an operating system, not a ledger.

### What Perionyx Is

Perionyx is the operating system for enterprise financial operations.

It is the single platform where a CFO, a Treasury team, a Controller, an Audit department, a Compliance function, and an FP&A team all work — on the same data, under the same governance, through the same workflows, with the same audit trail.

It is infrastructure. Like an operating system, it is boring when it works well. Like an operating system, it is catastrophic when it fails. Like an operating system, it must be trusted absolutely by the people who depend on it.

The experience of using Perionyx should feel like using a well-designed operating system: predictable, responsive, stable, and invisible when it is doing its job.

---

## Section 3 — Enterprise Finance Psychology

### How Finance Professionals Think

Every design decision in Perionyx must be grounded in an understanding of how its users think, what they fear, what they need, and how they process information under pressure.

#### Controllers

Controllers are responsible for the accuracy of financial reporting. They carry the weight of legal liability — financial statements bear their professional signature. They think in reconciliations, in matching, in completeness checks. They are trained to find errors that others miss.

**Stress source:** The fear of missing something material. A misclassified transaction. An unrecorded liability. An unreconciled balance.

**Design implication:** The interface must make completeness visible. Every reconciliation status, every unmatched transaction, every pending journal must be surfaced — not buried. The controller should never have to wonder whether something was missed.

#### Treasurers

Treasurers manage the company's cash, liquidity, and financial risk. They think in positions, flows, maturities, and counterparties. They operate under time pressure — markets move, payments are due, credit facilities expire.

**Stress source:** Cash visibility. Not knowing exactly where money is, how much is available, and what will happen in the next 30, 60, 90 days.

**Design implication:** The interface must make cash position immediately visible. No more than two clicks from any screen to the current cash position. Every number must have a timestamp. Every forecast must disclose its assumptions.

#### CFOs

CFOs make strategic financial decisions. They think in terms of capital allocation, risk-adjusted returns, stakeholder communication, and long-term value creation. They operate under board pressure, analyst scrutiny, and regulatory oversight.

**Stress source:** Lack of trustworthy information. Having to make decisions based on data they cannot verify in the time available.

**Design implication:** The interface must provide executive summaries that are trustworthy, complete, and auditable. Every executive insight must cite its source. Every recommendation must disclose its confidence. The CFO should never have to ask: "Where did this number come from?"

#### Auditors

Auditors verify that financial controls work as intended. They think in evidence, in testing, in materiality thresholds, and in control design. They are professionally obligated to be sceptical.

**Stress source:** Incomplete audit trails. Missing documentation. Controls that cannot be tested because their evidence is not accessible.

**Design implication:** The interface must make audit evidence trivially accessible. Every financial transaction must be traceable to its source, its approval, its posting, and its reconciliation. The audit trail must be complete, immutable, and exportable.

#### Tax Managers

Tax managers manage the company's tax obligations across jurisdictions. They think in deadlines, in jurisdiction-specific rules, in deferred tax, and in transfer pricing. They operate under hard regulatory deadlines with severe penalties for missed filings.

**Stress source:** Deadline management across multiple jurisdictions. The fear of missing a filing deadline or miscalculating a tax position.

**Design implication:** The interface must make deadlines visible, prominent, and time-sensitive. Every tax obligation must show its due date, its status, and the evidence supporting the position.

#### Board Secretaries

Board secretaries manage board governance — meeting preparation, minute taking, resolution tracking, and governance compliance. They think in governance cycles, in fiduciary obligations, and in regulatory compliance.

**Stress source:** Governance gaps. Missing board packs. Incomplete resolution records. Unclear delegation of authority.

**Design implication:** The interface must make governance status complete and current. Every board pack, every resolution, every delegation must be tracked with deadlines and completeness indicators.

#### Compliance Officers

Compliance officers ensure the company adheres to laws, regulations, and internal policies. They think in risk frameworks, in violation detection, in policy testing, and in regulatory interpretation.

**Stress source:** The unknown violation. The regulation that changed without notice. The policy that was written but never enforced.

**Design implication:** The interface must make compliance status visible in real time. Every policy, every regulation, every violation must be tracked with severity, evidence, and remediation status.

#### FP&A

Financial planning and analysis professionals build budgets, forecasts, and variance analyses. They think in scenarios, in trends, in assumptions, and in model integrity. They operate under monthly close pressure and board reporting deadlines.

**Stress source:** Stale forecasts. Variances without explanation. Models that break when assumptions change.

**Design implication:** The interface must make variance immediately visible. Every forecast must show its assumptions. Every variance must explain its drivers. The interface must never present a number without its context.

---

## Section 4 — Workspace Philosophy

### Workspaces, Not Pages

Perionyx is organised around workspaces — coherent environments where a specific role accomplishes a specific mission. A workspace is not a collection of pages. It is a complete operational context: the right data, the right actions, the right navigation, and the right information hierarchy — all in one place.

The user should never have to think about which page to visit. They should think about which workspace they are in, and the workspace should present everything they need.

#### Executive Workspace

**Mission:** Provide the CFO and executive team with strategic financial visibility, decision support, and governance oversight.

**Primary questions:**
- What is the company's financial position right now?
- What has changed since yesterday / last week / last month?
- Where are the risks?
- What decisions require my attention?
- Can I trust these numbers?

**Primary actions:**
- Review executive briefings
- Approve or escalate decisions
- Drill into anomalies
- Review AI insights and recommendations
- Monitor key metrics

**Information hierarchy:**
1. Executive summary (current state)
2. Alerts and actions requiring attention
3. Trend analysis and comparisons
4. Evidence and drill-down

**Expected emotional state:** Calm confidence. The executive should feel informed and in control — not overwhelmed.

**Navigation principles:**
- Lead with the summary, not the detail
- Every metric links to its source
- Alerts surface at the top, sorted by urgency
- One-click drill-down from summary to evidence

#### Controller Workspace

**Mission:** Ensure the accuracy, completeness, and timeliness of financial reporting.

**Primary questions:**
- Is the close on track?
- Are there unreconciled items?
- Are there unreviewed journals?
- What is the health of our accounting processes?
- What will the auditor ask about?

**Primary actions:**
- Monitor close progress
- Review and approve journals
- Investigate reconciliation exceptions
- Assess statement readiness
- Track remediation items

**Information hierarchy:**
1. Close status and timeline
2. Exceptions requiring attention
3. Reconciliation status
4. Journal review queue
5. Health metrics and trends

**Expected emotional state:** Control. The controller should feel that everything is tracked, nothing is falling through the cracks, and any issue can be traced to its source.

**Navigation principles:**
- Status-at-a-glance on every item
- Colour-coded urgency (red/amber/green — never decorative)
- Inline evidence for every flagged item
- One-click access from status to investigation

#### Treasury Workspace

**Mission:** Manage cash, liquidity, and financial risk with precision and confidence.

**Primary questions:**
- How much cash do we have right now?
- Where is it?
- What is our liquidity position?
- What are our FX exposures?
- What payments are due?
- What will our position be in 7, 30, 90 days?

**Primary actions:**
- Monitor cash positions
- Execute transfers
- Review and manage bank accounts
- Analyse FX exposure
- Review funding requirements
- Approve treasury operations

**Information hierarchy:**
1. Current cash position (real-time)
2. Upcoming obligations and inflows
3. Forecast and projections
4. Risk alerts and exposures
5. Bank account details

**Expected emotional state:** Precision. The treasurer should feel that every dollar is accounted for, every exposure is measured, and every obligation is tracked.

**Navigation principles:**
- Cash position is always visible — no matter where the user is in the workspace
- Every number has a source and a timestamp
- Transfers and payments are two clicks maximum from the position screen
- Risk alerts are impossible to miss

#### Audit Workspace

**Mission:** Provide auditors with complete, immutable, and accessible evidence for financial verification.

**Primary questions:**
- Is the audit trail complete?
- Can every financial statement line be traced to supporting evidence?
- Are controls operating effectively?
- What findings need remediation?
- What is the status of open audit items?

**Primary actions:**
- Review audit trails
- Test controls
- Track findings and remediation
- Export evidence packages
- Assess control effectiveness

**Information hierarchy:**
1. Audit trail completeness
2. Control status and test results
3. Open findings and remediation
4. Evidence packages
5. Compliance status

**Expected emotional state:** Assurance. The auditor should feel that evidence is complete, accessible, and verifiable — that nothing has been hidden or omitted.

**Navigation principles:**
- Every financial figure links to its audit trail
- Evidence is one click from any data point
- Completeness indicators are prominent
- Export functionality is always available

#### Compliance Workspace

**Mission:** Monitor regulatory compliance, policy adherence, and violation management.

**Primary questions:**
- Are we compliant with all applicable regulations?
- Are there policy violations?
- What deadlines are approaching?
- What is our compliance score?
- What needs remediation?

**Primary actions:**
- Monitor compliance dashboards
- Review violations
- Track regulatory deadlines
- Manage policy exceptions
- Generate compliance reports

**Information hierarchy:**
1. Compliance status and score
2. Active violations and risks
3. Upcoming deadlines
4. Policy status
5. Remediation tracking

**Expected emotional state:** Vigilance. The compliance officer should feel that nothing is slipping through — that every obligation is tracked and every violation is visible.

**Navigation principles:**
- Compliance score is always visible
- Violations are sorted by severity
- Deadlines are time-sensitive and prominent
- Every violation links to evidence and remediation

#### FP&A Workspace

**Mission:** Provide accurate forecasting, variance analysis, and scenario planning for financial decision-making.

**Primary questions:**
- Are we on track against budget?
- What are the key variances?
- What do our forecasts project?
- What scenarios should we plan for?
- What assumptions drive our models?

**Primary actions:**
- Analyse variances
- Update forecasts
- Build scenarios
- Prepare board reporting
- Track KPIs

**Information hierarchy:**
1. Budget vs actual summary
2. Key variances with explanations
3. Forecast projections
4. Scenario comparisons
5. Assumptions and methodology

**Expected emotional state:** Clarity. The FP&A professional should feel that the numbers tell a clear story — that every variance has an explanation and every forecast has transparent assumptions.

**Navigation principles:**
- Variance is immediately visible
- Every number links to its assumption
- Comparisons are always available (actual vs budget, this month vs last)
- Scenario comparison is side-by-side

#### Tax Workspace

**Mission:** Manage tax obligations, deadlines, and positions across all jurisdictions.

**Primary questions:**
- What tax filings are due?
- What is our estimated tax position?
- Are there upcoming deadlines?
- What jurisdictions are we liable in?
- What positions require review?

**Primary actions:**
- Track filing deadlines
- Review tax estimates
- Manage jurisdiction obligations
- Prepare tax provisions
- Track tax payments

**Information hierarchy:**
1. Upcoming deadlines (time-sorted)
2. Tax position summary by jurisdiction
3. Filing status
4. Payment tracking
5. Position analysis

**Expected emotional state:** Preparedness. The tax manager should feel that no deadline will be missed and every position is documented.

**Navigation principles:**
- Deadlines are the primary navigation element
- Every jurisdiction has a clear status
- Time-sensitivity is visually prominent
- Evidence for every position is accessible

#### Board Workspace

**Mission:** Support board governance with complete board packs, resolution tracking, and governance compliance.

**Primary questions:**
- Is the next board meeting prepared for?
- Are all board packs complete?
- What resolutions need action?
- Is our governance framework current?
- What needs board approval?

**Primary actions:**
- Prepare board packs
- Track resolutions
- Manage governance compliance
- Coordinate board communications
- Maintain delegation records

**Information hierarchy:**
1. Next meeting status and completeness
2. Open resolutions requiring action
3. Governance compliance status
4. Board pack documents
5. Delegation and authority records

**Expected emotional state:** Readiness. The board secretary should feel that every governance obligation is tracked and every board meeting is fully prepared for.

**Navigation principles:**
- Meeting-centric navigation (next meeting is always prominent)
- Completeness indicators on every board pack item
- Resolution status is actionable
- Governance compliance is at-a-glance

---

## Section 5 — Dashboard Philosophy

### Dashboards Answer Questions, Not Display Widgets

A dashboard that displays 30 KPIs is not a dashboard. It is a wall of numbers. A dashboard that answers the right question in the right order, with evidence and actionability, is a tool for decision-making.

Every dashboard in Perionyx must answer six questions — in this order:

#### 1. What Changed?

The user's first question is always: "What is different from what I expected?" Not "here are 40 metrics." The dashboard must surface changes — variances, anomalies, movements, thresholds breached — before presenting static state.

**Principle:** Change before state. Always.

#### 2. Why?

Every change must have an explanation. Not just "cash decreased by $2.3M." But "cash decreased by $2.3M due to a $3.1M vendor payment partially offset by a $0.8M receivable collection." The explanation must be traceable to the underlying transactions.

**Principle:** Every change has a why. If the system cannot explain why, it should say so.

#### 3. Does It Matter?

Not every change matters. A $500 variance in a $50M budget does not require attention. A $500K variance in a $5M budget does. The dashboard must distinguish between noise and signal — between cosmetic fluctuation and material deviation.

**Principle:** Materiality is not optional. Every dashboard must have a materiality threshold.

#### 4. What Should I Do?

A dashboard that shows a problem without suggesting an action is incomplete. Every alert, every variance, every anomaly should be accompanied by a recommended action — even if the action is "investigate further" or "monitor."

**Principle:** Every problem comes with a recommended solution, even if the solution is "look into this."

#### 5. Can I Trust This?

Every number must have a source. Every source must have a timestamp. Every derived metric must disclose its methodology. The user must never have to wonder whether the data is current, complete, or correct.

**Principle:** Data without attribution is not data. It is noise.

#### 6. Where Is the Evidence?

Every conclusion must be traceable to source records. Every recommendation must cite its evidence. Every risk assessment must link to the transactions, policies, or controls that support it.

**Principle:** Evidence is one click away. Always.

### Dashboard Design Rules

- **No widget exists without a question it answers.** If you cannot articulate the question, remove the widget.
- **Every dashboard has a narrative.** The widgets are not random. They tell a story — from "what changed" to "what should I do."
- **Materiality drives layout.** The most material information is at the top. Supporting detail is below. Background context is collapsible.
- **Time is always visible.** Every dashboard shows when its data was last refreshed. Stale data is worse than no data — because stale data is misleading.
- **No dashboard shows more than 7 primary metrics.** Human working memory cannot process more. Additional metrics belong in drill-down views.

---

## Section 6 — Information Architecture

### Hierarchy

Perionyx's information architecture follows the natural hierarchy of financial decision-making:

1. **Workspaces** — the top-level organisational unit (Executive, Treasury, Controller, etc.)
2. **Sections** — major functional areas within a workspace (Cash Position, Forecasts, Risk)
3. **Views** — specific presentations of data within a section (Table, Chart, Detail)
4. **Records** — individual entities (Transaction, Journal, Bank Account, Policy)
5. **Evidence** — supporting data for any record (Source documents, Audit trail, Approvals)

The hierarchy is always visible through navigation breadcrumbs, sidebar state, and page headers.

### Grouping

Information is grouped by **decision context**, not by data source. A treasurer does not think "show me Plaid data" or "show me QuickBooks data." They think "show me my cash position." The interface groups by the question being answered, not by the system that produced the data.

### Navigation Depth

No user action should require more than **three clicks** from any starting point to any destination within their workspace. Cross-workspace navigation may require more, but intra-workspace navigation must be fast.

The command palette (Cmd+K) provides **one-step** access to any page, any action, and any record in the system.

### Cross-Navigation

Every data point should link to its related context. A transaction in a reconciliation view should link to the journal entry. The journal entry should link to the approval record. The approval record should link to the approval policy. Cross-navigation is not optional — it is the mechanism that makes auditability tangible.

### Search Philosophy

Search in Perionyx is **command-driven**, not content-driven. The command palette is the primary search interface. It finds pages, actions, records, and navigation targets. It does not search document content — that is a different capability.

Global search (if implemented) is a secondary interface for finding records across the platform. It must support:
- Transaction IDs
- Amounts
- Counterparty names
- Date ranges
- Status filters

### Global Navigation

The sidebar is the global navigation. It is:
- **Always visible** (collapsible on mobile)
- **Workspace-scoped** — shows only the sections relevant to the current workspace
- **Role-aware** — sections that the user cannot access are hidden, not greyed out
- **Workflow-ordered** — sections are ordered by the sequence of financial operations, not alphabetically

### Context Navigation

Context navigation appears within a workspace:
- **Breadcrumbs** — always visible, always accurate, always clickable
- **Section tabs** — for switching between related views within a section
- **Action buttons** — for the primary action on any screen
- **Back navigation** — always available, always returns to the previous context

### Progressive Disclosure

Information is revealed in layers:

1. **Summary** — the answer to the primary question, immediately visible
2. **Detail** — supporting data, one click away
3. **Evidence** — source records and audit trail, two clicks away
4. **Methodology** — how the system arrived at this conclusion, always available via "Why?" or "How?" links

The user should never be overwhelmed by detail they did not ask for. But the detail should always be there when they need it.

### Information Density

Enterprise users need dense information displays. But density must not become clutter. Every pixel serves a purpose. Every element is justified. The density guidelines are:

- **Tables:** 8-12 columns maximum. Additional columns via horizontal scroll or column picker.
- **Cards:** 3-5 metrics per card. Multiple cards per screen.
- **Charts:** One insight per chart. Multiple charts in a dashboard.
- **Forms:** Core fields always visible. Advanced fields in collapsible sections.

### Scrolling Principles

- **Vertical scroll** is the primary mode. Content flows downward.
- **Horizontal scroll** is acceptable in tables (with sticky first column) but not in layouts.
- **Infinite scroll** is prohibited. All lists use pagination.
- **Sticky headers** are required for tables and long forms — the user should always know what column they are looking at.

---

## Section 7 — Design Language

### Typography

- **Headings:** System font, bold, 16-24px. No decorative fonts.
- **Body:** System font, regular, 14px. Optimised for screen reading.
- **Data:** Monospace or tabular-lining numerals for all financial figures. Numbers must align in columns.
- **Labels:** System font, medium weight, 12-14px. Uppercase for section headers.
- **Maximum 2 font weights** in any single view. Typography creates hierarchy through size, not weight variety.

### Spacing

Spacing follows a 4px grid:
- 4px — tight (inline elements, icon padding)
- 8px — compact (table cell padding, form field gaps)
- 12px — standard (card padding, section gaps)
- 16px — comfortable (page margins, major section separation)
- 24px — spacious (page-level separation)
- 32px — maximum (hero sections only)

### Grid

- **12-column grid** for page layouts
- **4-column grid** for mobile
- **Consistent gutters** — 16px on desktop, 12px on tablet, 8px on mobile
- **Content max-width** — 1440px for data-dense views, 1200px for forms

### Cards

Cards group related information. Every card has:
- A title that states the question it answers
- Content that answers the question
- A footer with source attribution and timestamp
- No decorative borders or shadows beyond elevation

### Buttons

- **Primary:** One per view. The most important action.
- **Secondary:** Supporting actions. Maximum 2-3 per view.
- **Danger:** Destructive actions. Always requires confirmation.
- **Ghost:** Navigation and low-emphasis actions.
- **Disabled state:** Clearly visible. No hidden interactivity.

### Forms

- **Labels above inputs** — not placeholder text
- **Inline validation** — on blur, not on every keystroke
- **Error messages** — below the input, explaining what to fix
- **Help text** — below the input, explaining what is expected
- **Sections** — collapsible for advanced options
- **Progressive disclosure** — core fields always visible, optional fields labeled as such

### Tables

Tables are the primary data display in Perionyx. Every table must:
- Have sticky headers
- Support column sorting (click header)
- Support row selection for bulk actions
- Show empty state with helpful message
- Handle loading with skeleton rows
- Show total/summary row at the bottom when applicable
- Never truncate without an indication (ellipsis + tooltip)

### Charts

Charts are used sparingly — only when a visual representation communicates faster than a table. Every chart must:
- Have a title that states the insight
- Have axis labels and units
- Have a legend when multiple series exist
- Have a source attribution
- Have alt text for accessibility
- Never use 3D effects
- Never use more than 5 colours in a single chart

### Colours

The colour palette is functional, not decorative:

| Colour | Usage |
|--------|-------|
| Charcoal surfaces | Backgrounds, cards, sidebars, headers (~95%) |
| White/off-white text | Typography on dark surfaces (~4%) |
| Gold accent | Currency, active states, key metrics, logo (~1%) |
| Green | Positive values, success states, gains |
| Red | Negative values, error states, losses, critical alerts |
| Amber | Warning states, pending, attention needed |
| Blue | Informational, links, interactive elements |
| Grey | Disabled, inactive, secondary information |

Colour is never the only way to communicate meaning. Every colour-coded element must also have a text label, icon, or pattern.

### Elevation

Elevation indicates layering and importance:
- **Level 0:** Base surface (background)
- **Level 1:** Cards, panels (subtle shadow)
- **Level 2:** Dropdowns, popovers (moderate shadow)
- **Level 3:** Dialogs, modals (strong shadow)
- **Level 4:** Toasts, notifications (strongest shadow)

### Icons

Icons supplement text, never replace it. Every icon must:
- Have an `aria-label` when interactive
- Be accompanied by text in navigation
- Use a consistent icon set (no mixing icon libraries)
- Be 16px or 20px in most contexts

### Motion

Motion communicates state changes. It is never decorative. Every animation must:
- Complete within 200-400ms
- Use ease-in-out curves
- Be disabled when `prefers-reduced-motion` is active
- Serve a clear purpose (enter, exit, expand, collapse, transition)

### Loading

Every data-fetching operation must show a loading state:
- **Skeleton loaders** for content areas (preferred)
- **Spinner** for buttons and inline operations
- **Progress bar** for operations with known duration
- **Never** show a blank screen while loading

### Empty States

Every empty state must:
- Explain why the list is empty
- Suggest the next action
- Provide a link to that action
- Never show just "No data found"

### Errors

Every error must:
- State what happened
- Explain why it happened (when possible)
- Suggest what to do next
- Provide a way to retry or contact support
- Never show raw error codes to users

### Success

Success states are brief:
- A toast notification for quick actions
- A redirect to the created/updated entity for form submissions
- A status change indicator for in-place updates
- Never a full-page success screen (the user has work to do)

---

## Section 8 — Interaction Philosophy

### Clicks

Every critical action should be achievable in **1-3 clicks**. The command palette reduces most navigation to **1 action** (Cmd+K → type → Enter).

The click count is not a target to minimise at all costs. Sometimes 4 clicks with clear context are better than 2 clicks with lost context. The goal is **cognitive efficiency**, not click minimisation.

### Shortcuts

The command palette (Cmd+K) is the primary keyboard interface. It provides:
- Page navigation
- Action execution
- Record search
- Quick filters

Additional shortcuts:
- Cmd+S — Save current form
- Cmd+Z — Undo last action (where supported)
- Cmd+Shift+Z — Redo
- Escape — Close dialog / cancel action
- Tab / Shift+Tab — Navigate between fields
- Enter — Confirm action / submit form
- Arrow keys — Navigate lists and tables

### Keyboard Support

Every interactive element must be keyboard-accessible:
- Buttons, links, inputs, selects, checkboxes, radio buttons
- Table rows (arrow keys)
- Dialog focus trap
- Tab order follows visual order
- Focus indicator is always visible

### Bulk Actions

Tables that support selection must provide:
- Select all / deselect all
- Bulk delete (with confirmation)
- Bulk status change
- Bulk export
- Selected count display

### Undo

Destructive actions (delete, archive, reject) must offer undo where the domain allows. The undo window is 10 seconds. After that, the action is permanent.

### Confirmation

Destructive actions require confirmation. The confirmation dialog must:
- State exactly what will happen
- Use the entity name (not "this item")
- Require an explicit confirmation action (not just a click)
- Be dismissible with Escape

### Dangerous Actions

Dangerous actions (delete, deactivate, override) must:
- Use red styling
- Require confirmation
- State the consequences
- Record the actor, timestamp, and reason in the audit log
- Be irreversible only when the domain requires it

### Approvals

Approval actions must:
- Show the full approval context (requester, amount, reason, evidence)
- Provide Approve, Reject, and Delegate options
- Require a comment for rejections
- Record the decision with timestamp and justification
- Never auto-approve

### Workflow Transitions

Workflow state changes must:
- Show the current state clearly
- Show the available transitions
- Explain what each transition means
- Record the transition with actor and timestamp
- Never skip required steps

### Context Menus

Context menus provide secondary actions on any entity. Every context menu must:
- Appear on right-click or "..." button
- Include only actions relevant to the current entity
- Group related actions
- Show keyboard shortcuts where available
- Be dismissible with Escape

### Drawers

Drawers are used for:
- Detail views that do not require a full page
- Quick edit forms
- Evidence panels
- Comparison views

Drawers must:
- Slide in from the right
- Have a clear title and close button
- Not block the primary content entirely
- Be dismissible with Escape

### Dialogs

Dialogs are used for:
- Confirmation of destructive actions
- Multi-step forms
- Focused data entry
- Full-screen detail views

Dialogs must:
- Have a clear title
- Trap focus
- Be dismissible with Escape
- Have a visible close button
- Not scroll indefinitely (if content is long, use a drawer or page instead)

---

## Section 9 — Accessibility

### Standard

Perionyx targets **WCAG 2.2 AA** compliance. This is not aspirational. It is a requirement.

### Principles

1. **Every interactive element is keyboard-accessible.** No mouse required for any operation.
2. **Every image has alt text.** Decorative images use `alt=""`.
3. **Every form has labels.** Placeholder text is not a label.
4. **Every colour-coded element has a text alternative.** Colour is never the only way to convey meaning.
5. **Every page has a skip navigation link.** Users can bypass repeated navigation.
6. **Focus is always visible.** Focus indicators are never removed.
7. **Error messages are associated with their inputs.** `aria-describedby` connects errors to fields.
8. **Dynamic content is announced.** `role="alert"` or `aria-live` regions notify screen readers of changes.
9. **Tables have headers.** `<th>` elements with `scope` attributes.
10. **Headings are hierarchical.** No skipped heading levels.

### Reduced Motion

Perionyx respects `prefers-reduced-motion`. When active:
- All animations are disabled
- Transitions are instant
- Skeleton loaders are replaced with static placeholders

### Touch Targets

All interactive elements have a minimum touch target of 44x44px on mobile.

### Contrast

Text must meet a minimum contrast ratio of 4.5:1 against its background. Large text (18px+) requires 3:1.

---

## Section 10 — Performance Experience

### Perceived Performance

Users do not measure performance in milliseconds. They measure it in confidence — "is the system working?" The interface must always communicate that the system is responsive, even when operations take time.

### Streaming

Long-running operations (reports, forecasts, AI analysis) should stream results as they become available, not wait for completion. The user should see partial results progressively.

### Loading

Every loading state must communicate:
- What is loading
- How long it is expected to take
- Whether the user can continue working

Skeleton loaders are the default for content loading. Spinners are for button-level operations. Progress bars are for operations with known duration.

### Caching

Data that changes infrequently (user profile, company settings, role definitions) should be cached client-side. Data that changes frequently (cash positions, transaction lists, reconciliation status) should always fetch fresh.

### Feedback

Every user action must produce immediate feedback:
- Button click → loading state → result
- Form submit → validation → success/error
- Action → confirmation toast
- Never leave the user wondering "did that work?"

### Long-Running Jobs

Operations that take more than 5 seconds must:
- Show a progress indicator
- Allow the user to continue working
- Notify the user when complete
- Never block the interface

### Background Tasks

Background tasks (sync, import, export, AI analysis) must:
- Show status in a persistent indicator
- Allow the user to check progress
- Notify on completion or failure
- Never require the user to refresh

### Notifications

Notifications are the communication channel for background events. Every notification must:
- State what happened
- Link to the relevant entity
- Be dismissible
- Be grouped by type
- Never be blocking

---

## Section 11 — Enterprise Trust

### How UX Increases Trust

Trust in an enterprise financial platform is not built through branding or marketing. It is built through thousands of small interactions that consistently demonstrate honesty, completeness, and reliability.

#### Evidence-First

Every number on screen should make the user think: "I can verify this." The interface should make verification trivially easy — one click from any number to its source record.

#### Explainability

When the system recommends an action, the user should think: "I understand why." Not "the system told me to." The interface must always disclose its reasoning.

#### Audit Visibility

The user should never wonder: "Is this being tracked?" Every action, every decision, every change should feel recorded — because it is. The interface should make audit records visible, not hidden.

#### Deterministic Recommendations

AI recommendations should feel trustworthy — not magical. Every recommendation should have a clear basis in data, a confidence level, and a traceable evidence chain. The user should think: "I can see why this makes sense."

#### Approval Visibility

The user should never wonder: "Who approved this?" Every approval should be visible, attributed, and timestamped. The interface should make the approval chain tangible.

#### Financial Confidence

The user should feel: "The numbers are right." This is achieved through reconciliation status indicators, data freshness timestamps, source attribution, and completeness checks. The interface should never present uncertain data as certain.

#### Human Authority

The user should feel: "I am in control." The system recommends, alerts, and organises. The human decides, approves, and commits. The interface should always make clear what requires human action and what the system handles automatically.

---

## Section 12 — Design Principles

These are the immutable design principles of Perionyx. Every design decision must be consistent with every applicable principle. When principles conflict, the higher-numbered principle yields to the lower-numbered one.

1. **Data before decoration.** The content is the design. Every visual element must justify its existence by serving the data.

2. **Every pixel serves a decision.** If an element does not help the user make a decision, remove it.

3. **Reduce cognitive load before adding capability.** A simpler interface that does the right things is better than a complex interface that does all things.

4. **Evidence before recommendation.** Show the data first. Then the insight. Then the recommendation. The user must be able to follow the reasoning.

5. **One action, one expectation.** Every button, every link, every interaction must have a clear, predictable outcome. No surprises.

6. **Users should never wonder what happened.** Every action produces feedback. Every state change is visible. Every result is communicated.

7. **The interface should disappear behind the work.** When the user is focused on a financial task, they should see the task — not the interface.

8. **Consistency creates confidence.** If a table sorts one way in Treasury, it sorts the same way in Controller. If a button is primary in one view, it is primary in every view.

9. **Every recommendation must be traceable.** No recommendation without evidence. No evidence without source. No source without access.

10. **Navigation should reflect finance workflows, not application modules.** The user thinks in terms of financial operations — not in terms of React components.

11. **Stale data is worse than no data.** Always show when data was last refreshed. Never present outdated information without a clear timestamp.

12. **Materiality drives hierarchy.** The most important information is always at the top, the most prominent, and the most accessible.

13. **Density serves professionals.** Enterprise users need information density. Sparse layouts waste their time. Dense layouts respect their expertise.

14. **Progressive disclosure serves everyone.** New users see simplicity. Power users see depth. Neither is compromised.

15. **Every error is recoverable.** Every error message suggests a next action. No error is a dead end.

16. **Accessibility is not optional.** Every feature must work with a keyboard. Every element must be screen-reader accessible. Every interaction must be perceivable by all users.

17. **Dark theme is the primary design target.** Light theme may exist, but dark theme is the default and the priority.

18. **Performance is a feature.** A fast interface communicates competence. A slow interface communicates indifference.

19. **Undo is safer than confirmation.** Where the domain allows, prefer undo over confirmation dialogs. The user can recover from mistakes without friction.

20. **Never optimise for screenshots.** Every design decision must serve the person using the software, not the person marketing it.

21. **Never chase design trends.** The interface must be timeless — as relevant in five years as it is today.

22. **Never imitate AI-generated dashboards.** AI-generated dashboards display everything and communicate nothing. Perionyx communicates with intent.

23. **Never overload users with KPIs.** Seven primary metrics is the maximum. Everything else belongs in drill-down views.

24. **Never hide evidence.** Every number has a source. Every source is accessible. Every accessibility action is recorded.

25. **Never sacrifice clarity for beauty.** If a beautiful design obscures the data, the design fails.

26. **Never replace professional judgement.** The system informs. The human decides. The interface must never make decisions for the user.

27. **Every financial figure must have a timestamp.** A number without a timestamp is not information. It is a rumour.

28. **The command palette is the primary interface.** Every page, every action, every record must be accessible from Cmd+K.

29. **Tables are the primary data display.** When in doubt, use a table. Tables are the most information-dense, most sortable, most scannable format for financial data.

30. **The interface must be trustworthy at 3 AM.** The CFO reviewing cash positions at 3 AM before a market open must see the same quality, the same completeness, and the same reliability as the CFO reviewing at 10 AM after coffee.

---

## Section 13 — Anti-Principles

These are the things Perionyx will never become. These are not aspirations. They are permanent prohibitions.

1. **Never optimise for screenshots.** We do not build features that look good in a demo but do not work in production. Every feature must serve the person using it, not the person presenting it.

2. **Never chase design trends.** We do not adopt glassmorphism, neumorphism, brutalism, or any other trend because it is popular. We adopt patterns that serve enterprise finance professionals.

3. **Never imitate AI-generated dashboards.** AI-generated dashboards show 40 KPIs with no hierarchy, no materiality, and no actionability. Perionyx shows the right 7 metrics with evidence and next actions.

4. **Never overload users with KPIs.** More KPIs is not more insight. It is more noise. Every KPI must justify its place on the screen.

5. **Never hide evidence.** Every number must have a source. Every recommendation must have evidence. Every risk must have a basis. If the evidence does not exist, say so.

6. **Never sacrifice clarity for beauty.** A beautiful chart that is hard to read fails. A plain chart that communicates clearly succeeds.

7. **Never replace professional judgement.** The system recommends. The human decides. We do not build auto-pilot for financial operations.

8. **Never add "delightful" interactions.** Finance professionals are not delighted by confetti, celebrations, or playful animations. They are delighted by accurate numbers and complete evidence.

9. **Never use gamification.** Finance is not a game. There are no streaks, no levels, no achievements. There are financial operations that must be executed correctly.

10. **Never hide complexity behind simplicity.** Enterprise finance is complex. The interface does not pretend otherwise. It organises complexity. It does not remove it.

11. **Never build features that require a tutorial.** The interface must be self-explanatory. If a feature requires a tutorial, the feature is poorly designed.

12. **Never prioritise new features over existing feature quality.** A platform with 67 modules that work well is better than 100 modules that work poorly.

13. **Never use colour as the only indicator.** Colour-blind users exist. Every colour-coded element must have a text or icon alternative.

14. **Never remove keyboard accessibility for visual convenience.** If a feature works with a mouse, it must work with a keyboard.

15. **Never display data without a timestamp.** Financial data without a timestamp is meaningless. Every number shows when it was last updated.

---

## Section 14 — Future Evolution

### Permanent Principles

The following principles are permanent and may not be amended:

- Evidence before recommendation
- Human authority over AI
- Auditability by default
- Tenant isolation
- Accessibility (WCAG 2.2 AA)
- Dark theme as primary design target
- Data before decoration
- Every number has a source and timestamp

These principles are foundational to Perionyx's identity as an enterprise financial operating system. They cannot change without changing what Perionyx is.

### Evolvable Principles

The following principles may evolve as the platform matures:

- Navigation structure (workspaces may be reorganised)
- Density guidelines (may increase as users become more proficient)
- Animation timing (may be refined based on user feedback)
- Colour palette (may expand for new data types)
- Keyboard shortcuts (may be extended for new features)
- Dashboard composition (may change as new data sources are added)

### Amendment Process

Amendments to this constitution follow the same process as the Governance Constitution:

1. **Proposal** — A written proposal explaining the change, the rationale, and the impact
2. **Review** — The Architecture Review Board evaluates the proposal against the permanent principles
3. **Decision** — Approval requires explicit documentation as an ADR in `DECISIONS.md`
4. **Versioning** — The document version is incremented; the change is recorded in the changelog

### Evolution Philosophy

This constitution is designed to be timeless. It should not require frequent amendments. If an amendment is needed frequently, the principle was too specific and should be generalised.

The best constitution is the one that remains relevant without modification for the longest time.

---

## Cross-References

| Document | Relationship |
|----------|-------------|
| `GOVERNANCE_CONSTITUTION.md` | Supreme authority — this document is subordinate |
| `PRODUCT_CONSTITUTION.md` | Product principles — this document governs experience |
| `AUTONOMOUS_FINANCE_WORKFORCE.md` | Specialist behaviour — this document governs specialist interfaces |
| `ARCHITECTURE.md` | System architecture — this document governs user-facing design |
| `SECURITY.md` | Security — this document governs trust-building through UX |
| `AI_GUIDELINES.md` | AI behaviour — this document governs AI interface patterns |
| `GLOSSARY.md` | Terminology — this document governs experience language |

---

*This constitution is permanent. It may only be amended through the Architecture Review Board process defined in `CONTRIBUTING.md §2`, with explicit approval recorded as an ADR in `DECISIONS.md`.*

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | July 2026 | Initial ratification |
