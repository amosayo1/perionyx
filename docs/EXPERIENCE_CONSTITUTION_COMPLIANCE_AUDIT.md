# Perionyx — Experience Constitution Compliance Audit

**Phase 15.3 Deliverable**
**Version 1.0 — July 2026**
**Baseline: V2 UX/UI Audit Score 6.0/10**
**Target: 8.5/10**

---

## Executive Summary

This audit measures the entire Perionyx platform against the 14 sections of the Experience Constitution. Every finding references concrete codebase evidence — no assumptions, no subjective opinions.

### Overall Compliance Score: 4.8 / 10

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Workspace Architecture | 5.5 / 10 | 62 workspaces, inconsistent depth, 12 without dashboards |
| Dashboard Compliance | 3.5 / 10 | Only 2/11 use DashboardTemplate; 7/11 fail "What changed?" |
| Information Architecture | 6.0 / 10 | 7-section nav works; dual breadcrumbs; command palette bypasses RBAC |
| Design Language | 4.0 / 10 | 137 raw buttons, 130 raw tables, 4 skeleton implementations |
| Interaction Philosophy | 5.0 / 10 | 12 raw forms, no undo system, no context menus |
| Enterprise Trust | 4.5 / 10 | 7/11 dashboards lack timestamps; 82 silent catches |
| Accessibility | 4.0 / 10 | 137 unlabeled buttons, 12 raw forms without labels |
| Performance Experience | 5.5 / 10 | 41 loading.tsx files, 1 Suspense boundary, 57 hand-rolled skeletons |
| Product Cohesion | 5.0 / 10 | 4 skeleton systems, 2 breadcrumb systems, 2 nav data sources |

---

## 1. Workspace Audit

### Methodology

All 62 workspace directories under `src/app/(shell)/` were reviewed. Each workspace was scored on 9 constitutional criteria from Section 4 of the Experience Constitution.

### Workspace Scores

| Workspace | Pages | Dashboard | Mission Clarity | Nav Quality | Info Hierarchy | Primary Actions | Evidence Visibility | Decision Support | Trust | Cognitive Load | Score |
|-----------|------:|:---------:|:---------------:|:-----------:|:--------------:|:---------------:|:-------------------:|:----------------:|:-----:|:--------------:|:-----:|
| **Executive** | 6 | ✅ | 7 | 8 | 8 | 7 | 8 | 8 | 8 | 7 | **7.7** |
| **CFO** | 8 | ✅ | 7 | 7 | 7 | 6 | 5 | 7 | 6 | 6 | **6.4** |
| **Controller** | 9 | ✅ | 6 | 6 | 6 | 6 | 4 | 5 | 5 | 5 | **5.4** |
| **Treasury** | 18 | ✅ | 6 | 6 | 6 | 6 | 4 | 5 | 5 | 5 | **5.4** |
| **Compliance** | 15 | ✅ | 6 | 6 | 5 | 5 | 4 | 5 | 5 | 5 | **5.1** |
| **FP&A** | 10 | ✅ | 5 | 6 | 5 | 5 | 4 | 5 | 5 | 5 | **5.0** |
| **Tax** | 18 | ✅ | 6 | 6 | 6 | 6 | 6 | 5 | 6 | 5 | **5.8** |
| **Audit** | 10 | ✅ | 5 | 6 | 5 | 5 | 4 | 4 | 5 | 5 | **4.9** |
| **Board** | 11 | ✅ | 6 | 6 | 6 | 5 | 5 | 5 | 5 | 5 | **5.4** |
| **Finance Collab** | 10 | ✅ | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 5 | **4.6** |
| **Risk** | 22 | ❌ | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 4 | **4.4** |
| **Reconciliation** | 10 | ✅ | 5 | 5 | 5 | 5 | 2 | 4 | 3 | 5 | **4.2** |
| **Agents** | 9 | ✅ | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 5 | **4.6** |
| **Intelligence** | 13 | ❌ | 4 | 5 | 4 | 4 | 3 | 4 | 4 | 4 | **4.0** |
| **General Ledger** | 12 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Fixed Assets** | 16 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Consolidation** | 17 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Planning** | 17 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Accounts Receivable** | 15 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Order to Cash** | 12 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Procurement** | 11 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Financial Close** | 15 | ✅ | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 5 | **4.6** |
| **Investments** | 15 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Automation Studio** | 13 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Integration Platform** | 13 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **Admin** | 14 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |
| **System** | 13 | ❌ | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 4 | **3.8** |

### Key Findings

**Constitution Section 4 — Workspace Philosophy violations:**

1. **12 multi-page workspaces have no dashboard or overview page** (Risk 22 pages, Planning 17, Consolidation 17, Fixed Assets 16, Admin 14, Automation Studio 13, Integration Platform 13, System 13, Intelligence 13, General Ledger 12, Order to Cash 12, Procurement 11). The Constitution requires every workspace to answer "What changed? Why? Does it matter?" — impossible without a dashboard.

2. **Only 2/11 existing dashboards use DashboardTemplate** (Tax, Governance). The remaining 9 are hand-rolled with inconsistent layouts, missing evidence timestamps, and no trend/variance display.

3. **Executive workspace is the only one scoring above 7.0** — it has source badges, trend indicators, specialist highlights, and per-section skeletons. It is the constitutional gold standard. All other workspaces fall below.

4. **Reconciliation workspace scores lowest (4.2)** — no timestamps, no source attribution, custom skeleton with animate-pulse, no evidence chain visible.

---

## 2. Dashboard Audit

### Methodology

Each dashboard was tested against the six questions from Experience Constitution Section 5.

### Dashboard Compliance Matrix

| Dashboard | What Changed? | Why? | Does It Matter? | What Should I Do? | Can I Trust This? | Where Is Evidence? | Score |
|-----------|:------------:|:----:|:---------------:|:-----------------:|:-----------------:|:------------------:|:-----:|
| **Executive** | ✅ Trend + source | ✅ Specialist highlights | ✅ Impact ratings | ✅ Recommendations | ✅ Fetch-time timestamp + source badges | ✅ Drill-down links | **9.0** |
| **Tax** | ✅ Trend arrows via DashboardTemplate | ⚠️ Briefing summaries only | ⚠️ KPI thresholds | ✅ Action items | ✅ lastUpdated via DashboardTemplate | ⚠️ Limited drill-down | **6.5** |
| **Governance** | ✅ Trend arrows via DashboardTemplate | ⚠️ Briefing summaries only | ⚠️ KPI thresholds | ✅ Action items | ✅ lastUpdated via DashboardTemplate | ⚠️ Limited drill-down | **6.5** |
| **CFO** | ✅ Anomaly deviations (sigma) | ✅ Executive summary + business reason | ⚠️ No materiality threshold | ✅ Decisions + insights | ❌ No timestamp (server component) | ✅ Insight feed | **5.5** |
| **Finance Collab** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Timeline events | ⚠️ Static render timestamp | ⚠️ Event sources only | **3.0** |
| **FP&A** | ⚠️ Status indicators only | ❌ No variance explanations | ⚠️ Good/warning/critical | ⚠️ Planning items | ⚠️ Static render timestamp | ❌ No drill-down | **3.5** |
| **Compliance** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Compliance items | ⚠️ Static render timestamp | ❌ No drill-down | **2.5** |
| **Audit** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Audit items | ⚠️ Static render timestamp | ❌ No drill-down | **2.5** |
| **Controller** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Close items | ⚠️ Static render timestamp | ❌ No drill-down | **2.5** |
| **Treasury** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Treasury items | ⚠️ Static render timestamp | ❌ No drill-down | **2.5** |
| **Reconciliation** | ❌ Point-in-time only | ❌ No explanations | ❌ No materiality | ⚠️ Reconciliation items | ❌ No timestamp at all | ❌ No drill-down | **1.5** |

### Critical Findings

1. **7/11 dashboards use `new Date().toLocaleTimeString()` as timestamp** — this is the render time, not the data fetch time. Constitution §5: "Every dashboard should show when its data was last refreshed." This is a trust violation.

2. **7/11 dashboards fail "What changed?"** — They show only current-state values with no variance, trend, or delta. Constitution §5: "Change before state. Always."

3. **9/11 dashboards fail "Why?"** — They display numbers without explaining what caused them. Constitution §5: "Every change must have an explanation."

4. **Reconciliation dashboard has no timestamp at all** — Constitution §5: "Every dashboard must answer: Can I trust this?" Without a timestamp, the user cannot know if the data is current.

5. **CFO dashboard is the only one without a loading state** — It's a server component that either renders or silently catches to null. Constitution §10: "Every data-fetching operation must show a loading state."

---

## 3. Information Architecture Audit

### Navigation

| Criterion | Status | Evidence | Constitution Ref |
|-----------|--------|----------|-----------------|
| 7 workflow-based sections | ✅ Pass | 7 sections in NAV_SECTIONS | §6 — "Navigation should reflect finance workflows" |
| Role-based filtering | ✅ Pass | filterNavByPermissions() + filterNavByRole() in app-shell.tsx | §6 — Workspace-scoped |
| Command palette (Cmd+K) | ✅ Pass | 86 pages indexed, enterprise search | §7 — "Cmd+K is primary interface" |
| Breadcrumbs | ⚠️ Partial | Two implementations with divergent label maps (55 vs 62 entries) | §6 — "Always visible, always accurate" |
| Command palette RBAC bypass | ❌ Fail | Command palette shows all 86 pages regardless of role | §8 — "No skipped approvals" |
| Nav entry count | ⚠️ 91 entries | Constitution doesn't specify count, but 91 is high for cognitive load | §12.3 — "Reduce cognitive load" |
| Un-grouped nav items | ⚠️ 11 items | 11 items rendered outside sections at sidebar bottom | §6 — "Grouping by decision context" |

### Information Architecture Findings

1. **Dual breadcrumb implementations** — `navigation/BreadcrumbBar` (55 labels) and `layout/Breadcrumbs` (62 labels) disagree on labels (e.g., `dashboard` = "Executive Overview" vs "Dashboard"). Only BreadcrumbBar is used in the app shell. Violates Constitution §8: "Consistency creates confidence."

2. **Command palette bypasses access control** — A MEMBER-role user can discover and navigate to ADMIN-only pages via Cmd+K. The page-level auth handles authorization, but the interface exposes restricted navigation. Violates Constitution §6: "Workspace-scoped" navigation.

3. **Dual navigation data sources** — `nav-config.ts` (91 items) and `command-palette.tsx` (86 items) are independent lists that must be manually synchronized. Violates Constitution §6: "One source of truth."

---

## 4. Design Language Audit

### Canonical Component Adoption

| Component | Canonical Exists? | Adoption | Raw/Alternative | Constitution Ref |
|-----------|:-----------------:|:--------:|:---------------:|-----------------|
| Button | ✅ `<Button>` (7 variants) | 137 files raw | 0% adoption of canonical | §7 — "Buttons: Primary/Secondary/Danger/Ghost" |
| Card | ✅ `<Card>` (6 variants) | 511 raw card divs | 0% adoption of canonical | §7 — "Cards: title + content + footer + timestamp" |
| Dialog | ✅ `<Dialog>/<Sheet>/<ConfirmDialog>` | 103 usages | 24 raw dialog patterns | §7 — "Dialogs: title, focus trap, Escape" |
| Table | ✅ `<EnterpriseTable>` | 8 files | 130 raw `<table>` | §7 — "Tables: sticky headers, sort, select, empty state" |
| Form | ✅ `<EnterpriseForm>` | 9 files | 12 raw `<form>` | §7 — "Forms: labels above, inline validation, help text" |
| Skeleton | ✅ `<Skeleton>` (7 variants) | 75 files | 57 direct animate-pulse | §10 — "Skeleton loaders preferred" |
| Badge | ✅ `<Badge>` (7 variants) | Growing | Inline span badges | §7 — "Colour never only indicator" |
| Alert | ✅ `<Alert>` (4 variants) | Growing | Inline error patterns | §7 — "Errors: what happened, why, what to do" |
| Empty State | ✅ `<EmptyState>` | Growing | Inline empty patterns | §7 — "Empty: explain why, suggest next action" |
| Error State | ✅ `<ErrorState>` | Growing | Inline error patterns | §7 — "Errors: never a dead end" |
| Page Header | ✅ `<PageHeader>` | 3 usages | 465 inline headers | §7 — "Typography: headings" |

### Design Language Findings

1. **137 files use raw `<button>` HTML** — Constitution §7: "Every interactive element must be keyboard-accessible." Raw HTML buttons lack consistent styling, focus states, and accessibility attributes.

2. **130 files use raw `<table>` HTML** — Constitution §7: "Tables: sticky headers, column sorting, row selection, empty state, loading skeleton." None of these are present in raw tables.

3. **4 parallel skeleton implementations** — `ui/skeleton.tsx`, `design-system/skeleton.tsx`, `design-system/loading/loading-states.tsx`, `enterprise/motion/loading-skeleton.tsx`. Constitution §7: "One canonical implementation."

4. **12 raw `<form>` elements** — Constitution §7: "Forms: labels above inputs, inline validation on blur, error messages below input, help text." Raw forms lack these patterns.

5. **0 files use `window.confirm`** — ✅ Pass. Constitution §8: "Confirmation dialogs required for destructive actions."

---

## 5. Workflow Audit

### CFO Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Open app | See executive summary with overnight changes | Dashboard shows point-in-time metrics with trends | ✅ Adequate |
| Check cash position | Cash position with timestamp and source | Cash position shown, timestamp present | ✅ Adequate |
| Review alerts | Alerts with severity, evidence, recommended action | Alerts present with specialist attribution | ✅ Adequate |
| Approve pending items | Approval queue with context | Approvals page exists, context visible | ✅ Adequate |
| Review AI insights | Insights with confidence, evidence, source | Insight feed present with descriptions | ✅ Adequate |

**CFO friction points:** None critical. The executive workspace is the best-implemented.

### Controller Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check close status | Close dashboard with progress, exceptions | Close status page exists | ✅ Adequate |
| Review unreconciled items | Reconciliation status with age, amount, counterparty | Items shown but no age or trend | ⚠️ Missing variance |
| Approve journals | Journal queue with risk flags | Journal review page exists | ✅ Adequate |
| Check statement readiness | Readiness checklist with completeness | Statement readiness page exists | ✅ Adequate |

**Controller friction points:**
- No "What changed?" on controller dashboard — shows current close progress without comparing to previous period
- No timestamps on reconciliation items — Constitution §5: "Every number has a timestamp"
- No evidence chain from exception to source transaction

### Treasurer Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check cash position | Real-time position with bank-source timestamp | Position shown, timestamp is render-time | ⚠️ Wrong timestamp |
| Review payments due | Upcoming obligations with due dates | Payments page exists | ✅ Adequate |
| Check FX exposure | Exposure by currency with hedge status | FX page exists | ✅ Adequate |
| Review forecasts | Forecast vs actual with variance | Forecast pages exist | ⚠️ No variance display |

**Treasurer friction points:**
- Treasury dashboard shows static render timestamp, not data fetch time — Constitution §5: "Can I trust this?"
- No forecast vs actual comparison on dashboard
- No "What changed?" — point-in-time values only

### Auditor Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check audit trail completeness | Completeness indicator with gaps highlighted | Audit trail page exists | ⚠️ No completeness score |
| Review control status | Control test results with pass/fail | Control pages exist | ✅ Adequate |
| Track findings | Finding list with severity, status, age | Finding pages exist | ✅ Adequate |
| Export evidence | Evidence packages downloadable | Export exists | ✅ Adequate |

**Auditor friction points:**
- No audit trail completeness score on dashboard — Constitution §5: "Can I trust this?"
- No evidence chain visibility from finding to source record
- Dashboard has no timestamp

### Compliance Officer Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check compliance score | Overall score with trend | Score shown | ⚠️ No trend |
| Review violations | Violation list with severity, evidence | Violations page exists | ⚠️ No evidence chain |
| Check deadlines | Deadline list sorted by urgency | Deadlines page exists | ✅ Adequate |
| Review policy status | Policy compliance by category | Policy pages exist | ✅ Adequate |

**Compliance friction points:**
- No "What changed?" — compliance score shown without trend
- No "Why?" — violations shown without root cause
- No evidence chain from violation to policy clause

### Tax Manager Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check filing deadlines | Deadline list sorted by urgency, jurisdiction | Deadlines shown with DashboardTemplate | ✅ Adequate |
| Review tax position | Position by jurisdiction with estimates | Position pages exist | ✅ Adequate |
| Check payment status | Payment tracking | Payment pages exist | ✅ Adequate |

**Tax friction points:** Least friction of all workspaces — DashboardTemplate provides trend arrows and timestamps.

### FP&A Manager Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check budget vs actual | Variance with explanation | Budget workspace exists | ⚠️ No variance explanation |
| Review forecasts | Forecast vs actual with confidence | Forecast center exists | ⚠️ No confidence display |
| Analyse scenarios | Scenario comparison | Scenario modeling exists | ✅ Adequate |

**FP&A friction points:**
- No "What changed?" on planning dashboard — shows status indicators without deltas
- No "Why?" — variances shown without driver analysis
- 3/3 FP&A files have all-silent catch blocks — Constitution §10: "Users should always understand what the system is doing"

### Board Secretary Morning Workflow

| Step | Expected | Actual | Gap |
|------|----------|--------|-----|
| Check board pack status | Completeness with missing items highlighted | Board pages exist | ✅ Adequate |
| Review resolutions | Resolution list with status | Resolution pages exist | ✅ Adequate |
| Check governance compliance | Compliance score with trend | Governance dashboard uses DashboardTemplate | ✅ Adequate |

**Board friction points:** Least friction after Tax — DashboardTemplate provides structure and timestamps.

---

## 6. Enterprise Trust Audit

### Trust Element Visibility Across Workspaces

| Trust Element | Executive | CFO | Controller | Treasury | Compliance | FP&A | Tax | Audit | Board |
|---------------|:---------:|:---:|:----------:|:--------:|:----------:|:----:|:---:|:-----:|:-----:|
| Evidence-first | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ⚠️ |
| Explainability | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ⚠️ |
| Audit visibility | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Deterministic recs | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Approval visibility | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financial confidence | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Human authority | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Traceability | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ |

### Trust Findings

1. **Only Executive workspace achieves full trust compliance** — All 8 elements present. This is the constitutional gold standard.

2. **CFO workspace is close (6/8)** — Missing audit visibility and traceability on some pages.

3. **Controller, Treasury, Compliance, FP&A, Audit all fail evidence-first and explainability** — Dashboards show numbers without sources or explanations. Constitution §11: "Every number on screen should make the user think: I can verify this."

4. **Approval visibility is universally implemented** — All workspaces show approval status. This is a strength.

5. **82 silent catch blocks across 51 files** — Constitution §10: "Users should always understand what the system is silent errors violate this principle."

---

## 7. Accessibility Audit

### WCAG 2.2 AA Compliance

| Criterion | Status | Evidence | Constitution Ref |
|-----------|--------|----------|-----------------|
| Skip-to-content link | ✅ Pass | Added in Phase 8B.9 | §9 — "Every page has skip navigation" |
| Global focus-visible | ✅ Pass | Added in globals.css | §9 — "Focus is always visible" |
| window.confirm removed | ✅ Pass | 0 instances | §9 — "No window.confirm" |
| Icon button aria-labels | ⚠️ Partial | 9+ fixed, ~50 remaining | §9 — "Every interactive element is keyboard-accessible" |
| Form labels | ❌ Fail | ~215 inputs without labels | §9 — "Every form has labels" |
| Error role="alert" | ⚠️ Partial | 16 implemented, ~23 remaining | §9 — "Dynamic content is announced" |
| Keyboard navigation | ⚠️ Partial | Core flows work; some custom components lack keyboard support | §9 — "No mouse required" |
| Contrast ratios | ⚠️ Partial | ~1,700 instances of low-contrast text at small sizes | §9 — "4.5:1 minimum" |
| Reduced motion | ✅ Pass | MotionProvider respects prefers-reduced-motion | §9 — "All animations disabled" |
| Touch targets | ⚠️ Partial | 44px utility exists but not universally applied | §9 — "44x44px minimum" |
| ARIA landmarks | ❌ Fail | No ARIA landmarks on major sections | §9 — Implicit in WCAG AA |

### Accessibility Score: 4.0 / 10

The platform has foundational accessibility (skip-to-content, focus-visible, reduced motion) but fails on the most impactful items: 215 unlabeled inputs, 137 raw buttons without consistent aria-labels, and no ARIA landmarks.

---

## 8. Performance Experience Audit

| Criterion | Status | Evidence | Constitution Ref |
|-----------|--------|----------|-----------------|
| Loading states on all routes | ⚠️ Partial | 41 loading.tsx files; many child pages lack loading boundaries | §10 — "Every data-fetching operation must show a loading state" |
| Skeleton loaders | ⚠️ Partial | 75 files use Skeleton; 57 use direct animate-pulse | §10 — "Skeleton loaders preferred over spinners" |
| Suspense boundaries | ❌ Fail | Only 1 Suspense boundary in entire app | §10 — "Streaming results as they become available" |
| Long-running job feedback | ⚠️ Partial | Some background jobs have status; many don't | §10 — "Operations >5s must show progress" |
| Error feedback | ⚠️ Partial | 2 files expose raw error.message; 82 silent catches | §10 — "Every error is recoverable" |
| Success feedback | ⚠️ Partial | Some toasts; many form submissions redirect without toast | §10 — "Every action produces feedback" |

### Performance Experience Score: 5.5 / 10

The platform has basic loading states but lacks streaming, consistent skeleton usage, and comprehensive feedback for long-running operations.

---

## 9. Product Cohesion Audit

### Does the product feel like one operating system?

**Answer: Partially.**

#### Evidence for cohesion:
- Single navigation system with 7 workflow-based sections
- Consistent dark theme across all workspaces
- Shared design tokens (13 files, 70+ CSS variables)
- Shared command palette (Cmd+K) across all pages
- Shared breadcrumbs (single implementation in app shell)
- Shared app shell with consistent topbar, sidebar, mobile nav

#### Evidence against cohesion:
- **4 parallel skeleton implementations** — `ui/skeleton.tsx`, `design-system/skeleton.tsx`, `design-system/loading/loading-states.tsx`, `enterprise/motion/loading-skeleton.tsx`. Each workspace uses a different one.
- **2 breadcrumb implementations** — `navigation/BreadcrumbBar` (55 labels) and `layout/Breadcrumbs` (62 labels) with divergent label maps.
- **2 navigation data sources** — `nav-config.ts` (91 items) and `command-palette.tsx` (86 items) must be manually synchronized.
- **137 raw buttons** — Most specialist components use raw HTML instead of the canonical Button.
- **130 raw tables** — Every table in the platform bypasses EnterpriseTable.
- **12 raw forms** — Most forms bypass EnterpriseForm.
- **Inconsistent dashboard patterns** — Only 2/11 use DashboardTemplate; the rest are hand-rolled.

### Product Cohesion Score: 5.0 / 10

The foundation is cohesive (tokens, shell, navigation, command palette), but the implementation is fragmented. The design system components exist but are barely adopted. The product feels like several independent modules wearing the same dark theme, not one operating system with consistent patterns.

---

## 10. Top 25 Violations

Ranked by constitutional severity and user impact.

| # | Violation | Constitution Section | Impact | Evidence |
|---|-----------|---------------------|--------|----------|
| 1 | **7/11 dashboards fail "What changed?"** | §5 — Dashboard Philosophy | Users cannot identify material changes | Only Tax, Governance, Executive show trends |
| 2 | **130 files use raw `<table>` (0% EnterpriseTable adoption)** | §7 — "Tables: sticky headers, sort, select, empty state" | No consistent table behavior across platform | Every table bypasses the canonical system |
| 3 | **215 form inputs without labels** | §9 — "Every form has labels" | Screen readers cannot identify fields | Raw `<input>` without `<label>` or `aria-label` |
| 4 | **137 files use raw `<button>` (0% Button adoption)** | §7 — "Buttons: Primary/Secondary/Danger/Ghost" | Inconsistent button styling and behavior | Raw HTML buttons throughout |
| 5 | **7/11 dashboards lack trustworthy timestamps** | §5 — "Can I trust this?" | Users cannot verify data freshness | `new Date().toLocaleTimeString()` is render-time, not fetch-time |
| 6 | **9/11 dashboards fail "Why?"** | §5 — "Every change must have a why" | Users see numbers without context | No variance explanations, no root cause |
| 7 | **Command palette bypasses RBAC** | §6 — "Workspace-scoped" | Users discover restricted pages | cmd palette shows all 86 pages regardless of role |
| 8 | **82 silent catch blocks** | §10 — "Users should always understand" | Errors disappear without feedback | 51 files silently swallow errors |
| 9 | **12 multi-page workspaces have no dashboard** | §4 — "Workspace Philosophy" | Users land on list pages with no overview | Risk (22), Planning (17), Consolidation (17), etc. |
| 10 | **4 parallel skeleton implementations** | §7 — "One canonical implementation" | Visual inconsistency across loading states | ui/, design-system/, design-system/loading/, enterprise/motion/ |
| 11 | **Dual breadcrumb implementations** | §8 — "Consistency creates confidence" | Users see different labels depending on page | BreadcrumbBar (55) vs Breadcrumbs (62) |
| 12 | **12 raw `<form>` elements** | §7 — "Forms: labels above, validation, help text" | No auto-save, no validation summary, no unsaved guard | Raw forms bypass EnterpriseForm |
| 13 | **No ARIA landmarks** | §9 — WCAG 2.2 AA | Screen readers cannot navigate page structure | No `<main>`, `<nav>`, `<aside>` landmarks |
| 14 | **CFO dashboard has no loading state** | §10 — "Every data-fetching operation must show loading" | Blank page during data fetch | Server component catches to null |
| 15 | **57 files use direct animate-pulse** | §10 — "Skeleton loaders preferred" | Inconsistent loading shimmer patterns | Hand-rolled loading states |
| 16 | **Reconciliation dashboard has no timestamp** | §5 — "Every number has a timestamp" | Cannot verify data freshness | No timestamp element |
| 17 | **Dual navigation data sources** | §6 — "One source of truth" | Maintenance burden, sync issues | nav-config.ts (91) vs command-palette (86) |
| 18 | **~1,700 low-contrast text instances** | §9 — "4.5:1 minimum" | Text unreadable for some users | `text-white/30` at small sizes |
| 19 | **No undo system** | §8 — "Undo is safer than confirmation" | Destructive actions are irreversible | No undo mechanism in UI |
| 20 | **50 remaining icon buttons without aria-label** | §9 — "Every interactive element accessible" | Screen readers cannot identify buttons | Phase 8B.9 fixed 9; ~50 remain |
| 21 | **No context menus** | §8 — "Context menus provide secondary actions" | No right-click or "..." menu on entities | Not implemented |
| 22 | **511 raw card divs** | §7 — "Cards: title + content + footer + timestamp" | No consistent card structure | Raw divs with inline styles |
| 23 | **No favorites/recent persistence** | §6 — "Progressive disclosure" | Users repeat navigation searches | Not implemented |
| 24 | **No streaming for long operations** | §10 — "Stream results as they become available" | Users wait for full completion | No Suspense boundaries for data streaming |
| 25 | **FP&A files have all-silent catch blocks** | §10 — "Users should always understand" | FP&A errors disappear silently | 3/3 FP&A specialist files: all catches silent |

---

## 11. Top 25 Quick Wins

Changes that can be made rapidly with high impact.

| # | Quick Win | Constitution Section | Effort | Impact |
|---|-----------|---------------------|--------|--------|
| 1 | **Add fetch-time timestamps to all dashboards** | §5 — "Can I trust this?" | Low | Replaces `new Date().toLocaleTimeString()` with actual fetch timestamp |
| 2 | **Add trend arrows to all KPI cards** | §5 — "What changed?" | Low | Add `trend` prop to existing metric displays |
| 3 | **Wire command palette to RBAC** | §6 — "Workspace-scoped" | Low | Filter cmd palette pages by user role |
| 4 | **Add `role="alert"` to 23 remaining error messages** | §9 — "Dynamic content announced" | Low | Add attribute to existing error elements |
| 5 | **Add `aria-label` to 50 remaining icon buttons** | §9 — "Every interactive element accessible" | Low | Add attribute to existing buttons |
| 6 | **Merge dual breadcrumb implementations** | §8 — "Consistency creates confidence" | Low | Remove layout/Breadcrumbs, use BreadcrumbBar everywhere |
| 7 | **Add loading state to CFO dashboard** | §10 — "Every data-fetching operation shows loading" | Low | Add skeleton or spinner to server component |
| 8 | **Fix 2 bare `alert()` calls in sandbox-entry-button** | §8 — "Confirmation dialogs required" | Low | Replace with ConfirmDialog |
| 9 | **Add ARIA landmarks to app shell** | §9 — WCAG 2.2 AA | Low | Add `<main>`, `<nav>`, `<aside>` to layout |
| 10 | **Add `aria-label` to all form inputs** | §9 — "Every form has labels" | Medium | Add labels to raw inputs |
| 11 | **Unify nav-config and command palette data** | §6 — "One source of truth" | Medium | Single source for both nav and palette |
| 12 | **Add drill-down links from dashboard KPIs** | §5 — "Where is the evidence?" | Medium | Link KPI values to source pages |
| 13 | **Replace static render timestamps with fetch timestamps** | §5 — "Can I trust this?" | Medium | Pass actual fetch time from API |
| 14 | **Add "What changed?" to Controller dashboard** | §5 — "Change before state" | Medium | Add trend comparison to close metrics |
| 15 | **Add "What changed?" to Treasury dashboard** | §5 — "Change before state" | Medium | Add trend comparison to cash metrics |
| 16 | **Add "What changed?" to Compliance dashboard** | §5 — "Change before state" | Medium | Add trend to compliance score |
| 17 | **Add "What changed?" to Audit dashboard** | §5 — "Change before state" | Medium | Add trend to audit metrics |
| 18 | **Add "What changed?" to FP&A dashboard** | §5 — "Change before state" | Medium | Add variance to planning metrics |
| 19 | **Add evidence chains to Compliance violations** | §11 — "Evidence-first" | Medium | Link violations to policy clauses |
| 20 | **Add evidence chains to Controller reconciliation** | §11 — "Evidence-first" | Medium | Link exceptions to source transactions |
| 21 | **Add evidence chains to Audit findings** | §11 — "Evidence-first" | Medium | Link findings to control tests |
| 22 | **Fix 82 silent catch blocks** | §10 — "Users should always understand" | Medium | Add error logging/toasts to catch blocks |
| 23 | **Bump low-contrast text** | §9 — "4.5:1 minimum" | Medium | Change `text-white/30` to `text-white/50` |
| 24 | **Add timestamp to Reconciliation dashboard** | §5 — "Every number has a timestamp" | Low | Add Clock icon with fetch time |
| 25 | **Add "Why?" explanations to Finance dashboard** | §5 — "Every change has a why" | Medium | Add variance explanations to stat cards |

---

## 12. Top 25 Long-Term Improvements

Strategic improvements requiring significant effort.

| # | Improvement | Constitution Section | Effort | Impact |
|---|-------------|---------------------|--------|--------|
| 1 | **Migrate 130 raw tables to EnterpriseTable** | §7 — "Tables: sticky headers, sort, select" | High | Consistent table behavior across platform |
| 2 | **Migrate 137 raw buttons to Button** | §7 — "Buttons: Primary/Secondary/Danger/Ghost" | High | Consistent button styling and accessibility |
| 3 | **Migrate 511 raw card divs to Card** | §7 — "Cards: title + content + footer + timestamp" | High | Consistent card structure |
| 4 | **Migrate all dashboards to DashboardTemplate** | §5 — "Dashboard Philosophy" | High | Consistent dashboard pattern |
| 5 | **Add dashboards to 12 workspaces without one** | §4 — "Workspace Philosophy" | High | Every workspace answers the 6 dashboard questions |
| 6 | **Implement undo system** | §8 — "Undo is safer than confirmation" | High | Recoverable destructive actions |
| 7 | **Implement context menus** | §8 — "Context menus provide secondary actions" | Medium | Right-click/"..." on any entity |
| 8 | **Add streaming via Suspense boundaries** | §10 — "Stream results as they become available" | Medium | Progressive loading across platform |
| 9 | **Migrate 12 raw forms to EnterpriseForm** | §7 — "Forms: labels, validation, help text" | Medium | Auto-save, validation summary, unsaved guard |
| 10 | **Consolidate 4 skeleton implementations** | §7 — "One canonical implementation" | Medium | Single loading system |
| 11 | **Add role-based dashboard views** | §4 — "Role-aware" | Medium | Different metrics per role |
| 12 | **Add favorites/recent persistence** | §6 — "Progressive disclosure" | Low | Personalized quick access |
| 13 | **Reduce nav entries from 91 to ~50** | §12.3 — "Reduce cognitive load" | Medium | Fewer navigation choices |
| 14 | **Add page transitions** | §7 — "Motion communicates state changes" | Low | Smooth route transitions |
| 15 | **Add lazy loading to dashboard sections** | §10 — "Perceived performance" | Medium | Faster initial render |
| 16 | **Add ARIA live regions for real-time data** | §9 — "Dynamic content announced" | Medium | Screen reader updates for live data |
| 17 | **Implement skeleton table loading** | §10 — "Skeleton loaders preferred" | Medium | Consistent table loading |
| 18 | **Add "Why?" explanations to all dashboards** | §5 — "Every change has a why" | High | Root cause for every metric |
| 19 | **Add evidence chains to all financial data** | §11 — "Evidence-first" | High | Clickable path from any number to source |
| 20 | **Add confidence ratings to all AI recommendations** | §11 — "Deterministic recommendations" | Medium | Trust through transparency |
| 21 | **Add materiality thresholds to dashboards** | §5 — "Materiality drives hierarchy" | Medium | Distinguish noise from signal |
| 22 | **Implement keyboard shortcuts for all actions** | §8 — "Keyboard support" | Medium | Power user efficiency |
| 23 | **Add mobile-responsive table views** | §7 — "Tables" | Medium | Readable tables on mobile |
| 24 | **Add chart accessibility (alt text, descriptions)** | §9 — "Every image has alt text" | Medium | Screen reader access to charts |
| 25 | **Implement command palette actions** | §7 — "Cmd+K is primary interface" | Medium | Execute actions, not just navigate |

---

## 13. Implementation Priority

### Phase 15.4 — Quick Wins (1-2 days)
Focus on the 25 quick wins. Highest impact, lowest effort. Target: 4.8 → 5.5.

### Phase 15.5 — Trust & Evidence (1-2 weeks)
Focus on dashboard timestamps, trend arrows, evidence chains, and "Why?" explanations. Target: 5.5 → 6.5.

### Phase 15.6 — Component Migration (2-4 weeks)
Systematic migration of raw buttons, tables, cards, and forms to canonical components. Target: 6.5 → 7.5.

### Phase 15.7 — Workspace Completion (2-4 weeks)
Add dashboards to 12 workspaces, migrate all dashboards to DashboardTemplate, add role-based views. Target: 7.5 → 8.0.

### Phase 15.8 — Advanced Interactions (2-4 weeks)
Implement undo, context menus, streaming, favorites, keyboard shortcuts. Target: 8.0 → 8.5.

---

## 14. Appendix: Evidence Files

| Audit Area | Key Files Reviewed |
|------------|-------------------|
| Navigation | `src/components/navigation/nav-config.ts`, `src/components/command-palette/command-palette.tsx`, `src/components/navigation/breadcrumb-bar.tsx`, `src/components/layout/breadcrumbs.tsx` |
| Design System | `src/design-system/` (12 files), `src/components/ui/` (shadcn), `src/components/enterprise/` |
| Dashboards | 11 dashboard files across Executive, CFO, Controller, Treasury, Compliance, FP&A, Tax, Audit, Governance, Finance, Reconciliation |
| Accessibility | `src/app/globals.css`, `src/app/(shell)/app-shell.tsx`, `src/components/ui/error-boundary.tsx` |
| Error Handling | 853 files with try/catch blocks, 51 files with silent catches |
| Loading | 41 loading.tsx files, 75 Skeleton-using files, 57 direct animate-pulse files |

---

*Phase 15.3 — Experience Constitution Compliance Audit*
*This document is the implementation blueprint for Phase 15.4+*
