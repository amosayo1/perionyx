# Phase 20.0 — Enterprise Platform Recommendations

> **Status**: Complete
> **Type**: Documentation-only — zero code changes
> **Platform Version**: v1.0.0
> **Date**: July 21, 2026
> **Audience**: Engineering, Product, Architecture

---

## Executive Summary

Phase 20.0 validation audited 460 routes, 291 constitutional principles, 14 core workflows, and 10 target personas. The results reveal a platform with deep domain coverage and strong infrastructure foundations, but significant gaps between implementation completeness and production readiness.

| Metric | Current | Target |
|--------|---------|--------|
| Experience Constitution compliance | 4.8 / 10 | 7.0 / 10 |
| Average workflow trust score | 6.4 / 10 | 8.0 / 10 |
| Production-ready workflows | 3 / 14 | 12 / 14 |
| Average persona coverage | 6.2 / 10 | 8.5 / 10 |
| Friction issues (total) | 25 | ≤ 5 |
| Friction issues (critical) | 4 | 0 |
| Friction issues (high) | 8 | 0 |

This document defines the work required to close every gap between where the platform is and where it must be for customer deployment. Recommendations are organized into four priority tiers with clear ownership, effort estimates, risk assessments, and success criteria.

---

## Current State Assessment

### What Works

The platform has a solid infrastructure backbone. AES-256-GCM encryption, tamper-evident audit logging, RBAC with 62 permissions, MFA with TOTP and recovery codes, multi-tenant isolation, Docker and Kubernetes deployment manifests, CI/CD pipelines, and 12 operational runbooks are all production-grade. The 14 Prisma-backed data models, PgBoss queue system, and distributed health monitoring demonstrate that the foundational engineering is sound.

Domain coverage is extensive. Procurement, order-to-cash, treasury, general ledger, financial close, fixed assets, tax, investments, risk, compliance, FP&A, CRM, and an AI agent framework are all implemented with types, services, seed data, and UI surfaces. The Experience Constitution, Workflow Constitution, and Engineering Constitution provide a clear philosophical foundation.

### What Blocks Production

Three structural issues undermine the entire platform's credibility:

**1. Dual GL architecture.** Two parallel general ledger systems exist at `/general-ledger/` (12 pages) and `/accounting/` (14 pages) with different type systems, different service implementations, and no shared data layer. A Controller opening trial balance must first determine which route is authoritative. This is an architecture-level trust violation.

**2. Disconnected workflows.** The CRM module has no pipeline to invoicing. Procurement has no automated GL posting. Business rules, approval matrix rules, and scheduler entries exist only in memory and vanish on server restart. No end-to-end business workflow actually works from start to finish.

**3. Experience Constitution non-compliance.** 9/11 dashboards lack "What changed?" analysis. 7/11 dashboards have no timestamps on financial figures. 130+ tables are raw HTML without the EnterpriseTable design system. 137 buttons lack proper styling. 12 multi-page workspaces have no dashboard. The Executive workspace scores 7.7/10; the lowest workspace (General Ledger) scores 3.8/10.

---

## Tier 1: P0 — Must Fix Before Any Customer Sees the Product

> **Window**: Weeks 1–4
> **Goal**: Eliminate trust-blocking issues that would cause immediate loss of confidence

These are not improvements. They are prerequisites. No customer, pilot partner, or design partner should encounter the platform until these issues are resolved.

---

### R-001: Consolidate GL Architecture

| | |
|---|---|
| **Issue** | Dual GL at `/general-ledger/` and `/accounting/` with different type systems, services, and data |
| **Constitution** | Section 1 (Clarity), Section 5 (Trust) |
| **Friction** | WF-001 — Critical |
| **Personas** | Controller, Treasurer, Auditor |

**Current state:** Two GL modules implement the same domain concepts independently. `src/modules/general-ledger/types.ts` and `src/modules/accounting/types.ts` define overlapping but incompatible types. Services are duplicated. Neither module indicates which is authoritative.

**Action:**
1. Designate `/general-ledger/` as the authoritative GL surface (broader MEMBER role access).
2. Add deprecation banners to all `/accounting/` routes: "This route is deprecated. Use [general-ledger equivalent]."
3. Implement 301 redirects from `/accounting/*` to `/general-ledger/*` equivalents.
4. Merge service implementations into a single Prisma-backed GL service.
5. Reconcile type definitions — retire `src/modules/accounting/types.ts`, normalize on `src/modules/general-ledger/types.ts`.
6. Delete duplicate UI components (chart-of-accounts-chart.tsx vs chart-of-accounts-tree.tsx).

**Expected outcome:** One authoritative GL surface. Zero ambiguity about data source. Controller and Treasurer see the same chart of accounts, same trial balance, same journal entries.

**Effort:** 3 person-weeks (architect + backend engineer)

**Risk if not addressed:** Every financial operation lacks a single source of truth. Auditors cannot verify which GL is authoritative. Data integrity is impossible to guarantee across two independent implementations.

---

### R-002: Wire End-to-End Workflow APIs

| | |
|---|---|
| **Issue** | No complete business workflow functions from trigger to settlement |
| **Constitution** | Section 1 (Clarity), Section 2 (Confidence), Section 5 (Trust) |
| **Workflow validation** | Procure-to-Pay: 60%, Order-to-Cash: 72%, most others <50% |

**Current state:** Individual services exist for each step (CRM contact → invoice → payment), but no orchestration connects them. Creating an invoice from a CRM opportunity requires manual re-entry. Procurement invoice matching produces no GL journal entries. Payment execution does not update cash position.

**Action:**
1. **CRM → Invoice pipeline**: Wire `CRMService.createOpportunity()` → `InvoiceService.create()` → `OrderToCashService.process()`. A closed-won deal auto-generates an invoice with line items from the opportunity.
2. **Procurement GL integration**: Implement `GLIntegrationService` for procurement events. PO receipt → journal entry (Debit Inventory / Credit AP). Payment release → journal entry (Debit AP / Credit Cash).
3. **Payment → Cash position**: Wire `PaymentsService.release()` → `TreasuryService.updateCashPosition()`. Released payments reflect immediately in cash forecasts.
4. **Invoice → Collections**: Wire `InvoiceService.createOverdue()` → `CollectionsService.createTask()`. Overdue invoices auto-generate collection actions.
5. **Close → Consolidation**: Wire `PeriodCloseService.close()` → `ConsolidationService.generate()`. Closed periods auto-trigger consolidation entries.

**Expected outcome:** A CFO can trace a deal from CRM contact through invoice, payment, cash application, GL posting, and period close without leaving the platform.

**Effort:** 6 person-weeks (2 backend engineers, 4 weeks)

**Risk if not addressed:** The platform is a collection of isolated modules, not a financial operating system. Every workflow requires manual re-entry between systems, which is exactly what ERPs already solve.

---

### R-003: Fix Experience Constitution Compliance

| | |
|---|---|
| **Issue** | Constitution compliance at 4.8/10 — below minimum viable threshold |
| **Constitution** | All 14 sections |
| **Compliance audit** | 9/14 dimensions below 6.0 |

**Current state:** The Executive workspace scores 7.7/10. All other workspaces score between 3.8 and 6.4. The lowest-scoring dimensions are Enterprise Trust (4.5), Accessibility (4.0), and Design Language (4.0).

**Action:**
1. **Dashboard trust scores** (Week 1): Add "last updated" timestamps to all 9 non-compliant dashboards. Add source badges to all data cards. Add delta indicators (change from previous period) to all KPI cards.
2. **EnterpriseTable migration** (Weeks 2-3): Replace the 10 highest-traffic raw `<table>` elements with EnterpriseTable. Prioritize: approval queue, transaction list, journal entries, invoice list, payment history.
3. **Button standardization** (Week 3): Replace raw buttons with EnterpriseButton across the 5 highest-traffic pages.
4. **Workspace dashboards** (Week 4): Add overview/dashboard pages to the 5 highest-traffic workspaces without one: Risk, Intelligence, General Ledger, Fixed Assets, Consolidation.

**Expected outcome:** Constitution compliance rises from 4.8 to at least 6.0. Every dashboard shows timestamps, sources, and deltas. The top 10 pages use EnterpriseTable. The 5 largest workspaces have overview dashboards.

**Effort:** 4 person-weeks (2 frontend engineers)

**Risk if not addressed:** The Experience Constitution is the philosophical foundation of the platform. Non-compliance at this level means the platform contradicts its own stated principles.

---

### R-004: Add "What Changed?" to All Dashboards

| | |
|---|---|
| **Issue** | 7/11 dashboards fail the "What changed? Why? Does it matter?" constitutional test |
| **Constitution** | Section 5 (Dashboard Philosophy) |

**Current state:** Only the Executive, Tax, and Governance dashboards provide change analysis. The remaining 8 show point-in-time data with no delta, no variance, and no explanation.

**Action:**
1. Create a `DashboardDelta` component that renders period-over-period change with direction arrow, percentage, and materiality indicator.
2. Integrate into CFO, Controller, FP&A, Compliance, Audit, Finance Collab, Reconciliation, and Risk dashboards.
3. Each delta links to a drill-down showing the contributing transactions or events.
4. Materiality thresholds: ±1% default, configurable per metric.

**Expected outcome:** Every dashboard answers "What changed since last time I looked?" within 2 seconds of load.

**Effort:** 2 person-weeks (frontend engineer)

**Risk if not addressed:** Finance professionals cannot distinguish current state from historical snapshot. Every dashboard visit requires manual comparison with previous values.

---

### R-005: Add Timestamps to All Financial Figures

| | |
|---|---|
| **Issue** | 7/11 dashboards display financial numbers without "as of" timestamps |
| **Constitution** | Section 5 (Trust), Principle 27 (Every figure has timestamp) |

**Current state:** Executive dashboard shows `fetch-time timestamp`. CFO dashboard shows server render time. All other dashboards show static numbers with no indication of data freshness.

**Action:**
1. Create a `StaleAwareTimestamp` component that shows "as of [time]" with automatic staleness highlighting (>5min = yellow, >30min = orange, >2hr = red).
2. Replace all static `lastUpdated` props with this component.
3. Add data freshness metadata to all API responses (`dataAsOf`, `serverTime`).
4. Wire component into all 11 dashboard implementations.

**Expected outcome:** A CFO never sees a number without knowing how old it is. Stale data is visually flagged, not silently trusted.

**Effort:** 1 person-week (frontend engineer)

**Risk if not addressed:** Trust violation — every financial decision made on stale data without the user knowing. This is the exact scenario the Experience Constitution was written to prevent.

---

## Tier 2: P1 — Must Fix Before Production

> **Window**: Weeks 5–12
> **Goal**: Eliminate trust issues that surface during enterprise evaluation

Enterprise buyers evaluate platforms by trying to break them. These issues will surface during any serious evaluation.

---

### R-006: Replace In-Memory Stores with Prisma

| | |
|---|---|
| **Issue** | Business rules, approval matrix, and scheduler use in-memory Maps — data lost on restart |
| **Constitution** | Section 5 (Trust) |
| **Friction** | WF-022 |

**Current state:** `BusinessRulesBuilder`, `ApprovalMatrixEvaluator`, and `AutomationScheduler` store all data in `Map<string, Rule>`. Server restart wipes all configured rules, matrix entries, and schedules.

**Action:**
1. Create Prisma models: `BusinessRule`, `ApprovalMatrixRule`, `AutomationSchedule` (or reuse existing `AutomationRule` if compatible).
2. Migrate `BusinessRulesBuilder` from `Map` to Prisma CRUD.
3. Migrate `ApprovalMatrixEvaluator` from `Map` to Prisma CRUD.
4. Migrate `AutomationScheduler` from `Map` to Prisma CRUD via queue service.
5. Add seed data for default rules and matrix entries.
6. Write migration and data integrity tests.

**Expected outcome:** Configured rules survive server restarts. Horizontal scaling is possible. Audit trail shows who changed what rule and when.

**Effort:** 3 person-weeks (backend engineer)

**Risk if not addressed:** Every production restart erases all business configuration. No audit trail for rule changes. Impossible to scale beyond single process.

---

### R-007: Implement Undo System for Critical Actions

| | |
|---|---|
| **Issue** | No undo capability for destructive financial actions |
| **Constitution** | Section 3 (Speed), Principle 19 (Undo safer than confirmation) |
| **Friction** | WF-010 |

**Current state:** Approving a payment, closing a period, writing off an invoice, or deleting a journal entry is immediately and permanently committed. No recovery path except manual reversal entries.

**Action:**
1. Implement `UndoProvider` React context with a 5-second undo window for destructive actions.
2. Implement `withUndo` HOC that wraps action handlers with undo capability.
3. Wire into: payment approval, period close, invoice write-off, journal entry deletion, vendor deactivation.
4. Show undo toast with countdown and explicit "Undo" button.
5. Log undo actions in audit trail for compliance.

**Expected outcome:** Every destructive financial action has a 5-second safety net. Finance professionals can act quickly without fear of irreversible mistakes.

**Effort:** 2 person-weeks (frontend engineer)

**Risk if not addressed:** Every destructive action is a potential incident. Finance professionals slow down to avoid mistakes, reducing the platform's core value proposition of speed.

---

### R-008: Add Cmd+K Command Palette

| | |
|---|---|
| **Issue** | No quick navigation between 460+ routes |
| **Constitution** | Section 3 (Speed), Section 4 (Keyboard-First) |
| **Friction** | WF-011 |

**Current state:** Navigation requires clicking through the sidebar, which has 8 sections and 62+ workspace entries. Keyboard shortcuts exist for 3 actions (Cmd+N/F/S) but not for route navigation.

**Action:**
1. Implement `CommandPalette` component with Cmd+K trigger.
2. Index all 460 routes with fuzzy search (name, description, keyboard shortcut).
3. Support role-based filtering — show only routes the current user can access.
4. Add recent routes (localStorage) and pinned routes.
5. Wire into `app-shell.tsx` as a global overlay.

**Expected outcome:** Any route reachable in <3 seconds via keyboard. CFOs never touch the mouse to navigate.

**Effort:** 2 person-weeks (frontend engineer)

**Risk if not addressed:** Navigation friction scales with every new workspace. The 460-route inventory is already unmanageable via sidebar alone.

---

### R-009: Complete Keyboard Navigation

| | |
|---|---|
| **Issue** | Keyboard-first is a constitutional principle but only 3 shortcuts exist |
| **Constitution** | Section 4 (Keyboard-First), Principle 15 (Keyboard should work) |

**Current state:** `useKeyboardShortcuts()` handles Cmd+N, Cmd+F, Cmd+S, and `?`. Table row navigation, approval actions, and workflow steps all require mouse interaction.

**Action:**
1. Add keyboard shortcuts for all critical financial actions: approve (Cmd+Shift+A), reject (Cmd+Shift+R), create journal entry (Cmd+Shift+J), close period (Cmd+Shift+C).
2. Implement arrow-key navigation for all data tables.
3. Add `Enter` to activate, `Escape` to cancel, `Tab` to move between sections.
4. Document all shortcuts in the `?` dialog.
5. Test every workflow with keyboard-only operation.

**Expected outcome:** Every critical workflow completable without touching a mouse.

**Effort:** 3 person-weeks (frontend engineer)

**Risk if not addressed:** Power users (the target persona) cannot operate the platform at the speed they expect. Keyboard-first becomes a marketing claim, not a product reality.

---

### R-010: Add Evidence Links to All Recommendations

| | |
|---|---|
| **Issue** | AI recommendations lack source attribution and confidence scores |
| **Constitution** | Section 1 (Evidence-Driven), Principle 4 (Evidence before recommendation), Principle 9 (Explainable) |
| **Friction** | WF-008, WF-016 |

**Current state:** The Copilot and AI recommendation surfaces generate suggestions without linking to the underlying data, transactions, or analysis that produced them. Confidence scores are absent.

**Action:**
1. Extend `Recommendation` type with `evidenceLinks: Array<{source, entity, metric}>` and `confidence: number`.
2. Wire evidence collection into all 5 AI services (DecisionEngine, IntelligenceService, GovernanceService, OperationsService, AnalyticsService).
3. Render evidence links as clickable badges on every recommendation card.
4. Render confidence as a percentage badge with color coding (green >80%, yellow 50-80%, red <50%).
5. Add "View evidence" expandable section to each recommendation.

**Expected outcome:** Every AI recommendation shows what data produced it, how confident the system is, and allows drill-down to source records.

**Effort:** 2 person-weeks (AI engineer + frontend)

**Risk if not addressed:** AI recommendations are unverifiable opinions. Finance professionals will not act on them.

---

### R-011: Standardize Empty States

| | |
|---|---|
| **Issue** | Inconsistent empty states across pages — some show helpful guidance, some show nothing |
| **Constitution** | Section 1 (Clarity), Section 7 (Progressive Disclosure) |

**Current state:** Some pages use `EmptyState` component, others show raw "No data" text, others show a blank page. No consistent pattern for first-time setup guidance, filtered results, or data import prompts.

**Action:**
1. Create a standard `EmptyState` component with title, description, illustration, and primary action button.
2. Create variants: `NoData` (first use), `NoResults` (filtered empty), `NoAccess` (permission denied), `LoadingFailed` (error recovery).
3. Replace all raw empty states across the 20 highest-traffic pages.
4. Each empty state includes a context-specific action: "Create your first journal entry", "Import transactions from CSV", "Connect your bank account".

**Expected outcome:** Every empty page tells the user why it's empty and what to do next.

**Effort:** 1 person-week (frontend engineer)

**Risk if not addressed:** New users see blank screens with no guidance. The platform feels unfinished.

---

### R-012: Complete Mobile Support for Top 5 Workflows

| | |
|---|---|
| **Issue** | Only 2 mobile pages exist (`/mobile-dashboard`, `/mobile/treasury`). Top workflows are desktop-only |
| **Constitution** | Section 3 (Executive experience) |

**Current state:** The CFO morning briefing, approval workflow, payment review, cash position check, and alert triage all require a desktop. Mobile components exist (`ApprovalQuickView`, `MobileMetricCard`) but are not wired to most workflows.

**Action:**
1. `/mobile/approvals` — Mobile approval queue with approve/reject/delegate actions.
2. `/mobile/briefing` — Mobile morning briefing with cash position, pending items, alerts.
3. `/mobile/payments` — Mobile payment review with approve/release workflow.
4. `/mobile/cash` — Mobile cash position with account balances and recent movements.
5. `/mobile/alerts` — Mobile alert triage with acknowledge/escalate actions.

**Expected outcome:** CFOs can approve payments, check cash, and triage alerts from a phone.

**Effort:** 4 person-weeks (2 frontend engineers)

**Risk if not addressed:** Executives cannot use the platform outside their office. The mobile experience is a differentiator.

---

### R-013: Add Workflow Progress Indicators

| | |
|---|---|
| **Issue** | Multi-step workflows have no visible progress indication |
| **Constitution** | Section 3 (Speed), Section 7 (Progressive Disclosure) |

**Current state:** Financial close, onboarding, and approval workflows have steps but no visual progress bar or step indicator. Users do not know where they are in a multi-step process.

**Action:**
1. Create a `WorkflowProgress` component with numbered steps, completion indicators, and estimated time remaining.
2. Wire into: financial close wizard, onboarding wizard, procurement approval chain, payment processing workflow.
3. Each step shows: completed (checkmark), current (highlighted), upcoming (grayed), skipped (dashed).

**Expected outcome:** Users always know where they are in a multi-step process and how much remains.

**Effort:** 1 person-week (frontend engineer)

**Risk if not addressed:** Multi-step workflows feel unpredictable. Users abandon or repeat steps.

---

## Tier 3: P2 — Should Fix Before Scale

> **Window**: Weeks 13–24
> **Goal**: Improve efficiency for daily-use scenarios

These issues become painful with repeated use. They do not block a pilot but will surface with daily operation.

---

### R-014: Standardize Dashboard Patterns

| | |
|---|---|
| **Issue** | 8 different dashboard implementations with inconsistent layouts |
| **Constitution** | Section 4 (Beauty), Section 8 (Predictable) |

**Current state:** Executive dashboard uses `DashboardTemplate`. Tax and Governance use it too. The remaining 8 are hand-rolled with different grid systems, different card components, and different loading patterns.

**Action:**
1. Audit all 8 hand-rolled dashboards against `DashboardTemplate` capabilities.
2. Migrate the 5 lowest-scoring dashboards (Compliance 2.5, Audit 2.5, Controller 2.5, Reconciliation 4.2, Finance Collab 3.0) to `DashboardTemplate`.
3. Extend `DashboardTemplate` to support the remaining layout needs (if any gaps exist).
4. Standardize on 3 dashboard types: Executive (high-density metrics), Operational (workflow-oriented), Analytical (charts and drill-down).

**Expected outcome:** Every dashboard follows the same visual language. New workspaces can be added by configuration, not custom code.

**Effort:** 4 person-weeks (2 frontend engineers)

**Risk if not addressed:** Every new workspace requires a custom dashboard build. Inconsistency compounds with every release.

---

### R-015: Complete EnterpriseTable Adoption

| | |
|---|---|
| **Issue** | 130+ raw HTML tables remain across the platform |
| **Constitution** | Section 4 (Design Language), Section 6 (Enterprise Trust) |

**Current state:** `EnterpriseTable` is fully built with sorting, filtering, pagination, inline editing, cell formatters, export, and accessibility. But only 4 pages use it. The remaining 130+ tables are raw `<table>` elements without any design system consistency.

**Action:**
1. Prioritize by traffic: approval queue, transaction lists, journal entries, invoice lists, vendor lists, payment history, audit logs, contact list, employee directory, reconciliation items.
2. Migrate top 20 pages in order of user impact (Weeks 13-16).
3. Migrate next 30 pages (Weeks 17-20).
4. Create migration guide for remaining pages.
5. Grep-based verification: `grep -r "<table" src/app` count should reach zero.

**Expected outcome:** All data tables use the same design system. Sorting, filtering, export, and accessibility work everywhere.

**Effort:** 8 person-weeks (2 frontend engineers, 4 weeks each)

**Risk if not addressed:** Tables are the most-used component in financial applications. Inconsistent tables signal an inconsistent platform.

---

### R-016: Add Offline Capability for Mobile

| | |
|---|---|
| **Issue** | Mobile pages require network connectivity — no offline support |
| **Constitution** | Section 3 (Executive experience) |

**Action:**
1. Implement Service Worker for static asset caching.
2. Cache the last-viewed dashboard and cash position data in IndexedDB.
3. Queue approval actions when offline, sync on reconnect.
4. Show `OfflineIndicator` with last-synced timestamp.

**Expected outcome:** CFOs can review cached cash position and approval queue during flights or in low-connectivity environments.

**Effort:** 3 person-weeks (frontend engineer)

---

### R-017: Implement Batch Operations

| | |
|---|---|
| **Issue** | All actions are single-item — no batch approve, batch export, batch update |
| **Constitution** | Section 3 (Speed) |

**Action:**
1. Add checkbox selection to all EnterpriseTable instances.
2. Implement batch actions toolbar: approve selected, reject selected, export selected, assign to.
3. Wire batch approve into approval queue (approve 10 invoices in one click).
4. Wire batch export into all report pages.

**Expected outcome:** Finance managers process approval queues 10x faster. Batch operations reduce repetitive actions.

**Effort:** 3 person-weeks (frontend engineer)

---

### R-018: Add Export for All Reports

| | |
|---|---|
| **Issue** | Export exists on EnterpriseTable but not on dashboard reports and analytics pages |

**Action:**
1. Add CSV and Excel export buttons to all 11 dashboard summary sections.
2. Add PDF export for morning briefing and board packs.
3. Add "Export all" for audit log and compliance report pages.
4. Use existing `export-utils.ts` (CSV with UTF-8 BOM, XLS via XML Spreadsheet 2003).

**Expected outcome:** Every report page has a one-click export.

**Effort:** 2 person-weeks (frontend engineer)

---

### R-019: Standardize Error Handling

| | |
|---|---|
| **Issue** | 82 silent `catch` blocks swallow errors without user feedback |
| **Constitution** | Section 6 (Trust) |

**Action:**
1. Create a global `ErrorProvider` React context.
2. Replace all silent `catch` blocks with structured error reporting to `ErrorProvider`.
3. `ErrorProvider` renders toast notifications for non-critical errors and inline banners for critical ones.
4. Log all errors to the observability system with correlation IDs.
5. Verify with `grep -r "catch.*{" src --include="*.tsx" | wc -l` count.

**Expected outcome:** No error is silently swallowed. Every failure is visible to the user and logged for debugging.

**Effort:** 3 person-weeks (frontend engineer)

---

### R-020: Complete ARIA Landmark Coverage

| | |
|---|---|
| **Issue** | 137 icon-only buttons and 12 forms without proper ARIA labels |
| **Constitution** | Section 8 (Accessibility) |

**Action:**
1. Audit all icon-only buttons with `axe-core` or equivalent.
2. Add `aria-label` to all 137 unlabeled buttons.
3. Ensure all 12 raw forms have `aria-required`, `aria-invalid`, and associated error messages.
4. Add `role` attributes to all custom widgets (tree views, tabs, accordions).
5. Test with screen reader (VoiceOver on macOS).

**Expected outcome:** WCAG 2.1 AA compliance across the platform.

**Effort:** 2 person-weeks (frontend engineer)

---

## Tier 4: P3 — Nice-to-Have

> **Window**: Week 25+
> **Goal**: Differentiate Perionyx from existing financial platforms

These features would make Perionyx a market leader rather than a market participant.

---

### R-021: Real-Time Collaboration

| | |
|---|---|
| **Feature** | Multiple users editing the same financial close or budget simultaneously |
| **Value** | Eliminates "who is editing this?" conflicts during month-end close |
| **Effort** | 6 person-weeks |

**Action:**
1. Implement WebSocket-based presence indicators.
2. Add field-level locking with conflict resolution.
3. Show "User X is editing this section" indicators.
4. Implement operational transform for concurrent edits.

---

### R-022: Advanced AI Explainability

| | |
|---|---|
| **Feature** | Full reasoning chain for every AI recommendation with confidence intervals |
| **Value** | CFOs can audit AI decisions before acting on them |
| **Effort** | 4 person-weeks |

**Action:**
1. Extend `DecisionEngine` to record reasoning chain (data → analysis → recommendation).
2. Add confidence intervals to all numerical predictions.
3. Implement "Why this recommendation?" expandable on every AI card.
4. Add "Disagree" feedback loop that feeds back into model tuning.

---

### R-023: Custom Dashboard Builder

| | |
|---|---|
| **Feature** | Drag-and-drop dashboard customization for each persona |
| **Value** | CFOs see what they care about; Controllers see what they care about |
| **Effort** | 8 person-weeks |

**Action:**
1. Implement widget registry with 20+ pre-built widgets (KPI cards, charts, tables, lists).
2. Build drag-and-drop grid editor with snap-to-grid.
3. Save dashboard configurations per user in Prisma.
4. Add "Reset to default" and "Share with team" options.

---

### R-024: Workflow Template Marketplace

| | |
|---|---|
| **Feature** | Pre-built workflow templates for common financial processes |
| **Value** | New customers start with working workflows, not blank screens |
| **Effort** | 4 person-weeks |

**Action:**
1. Create 10 workflow templates: month-end close, quarterly tax filing, vendor onboarding, customer credit check, payment approval chain, bank reconciliation, budget variance review, compliance audit prep, board pack generation, cash forecast.
2. Implement template install flow with configuration wizard.
3. Add template versioning and update mechanism.

---

### R-025: Advanced Analytics and Reporting

| | |
|---|---|
| **Feature** | Custom report builder with scheduled delivery |
| **Value** | Finance teams automate recurring reports instead of building them manually |
| **Effort** | 6 person-weeks |

**Action:**
1. Build report template editor with drag-and-drop sections.
2. Implement scheduled delivery via email and Slack.
3. Add PDF generation for formatted reports.
4. Support cross-module data joins in report queries.

---

## Cross-Cutting Recommendations

These recommendations apply across all tiers and must be tracked as ongoing workstreams.

---

### CC-001: Architecture Consolidation

| | |
|---|---|
| **Scope** | Dual GL, dual accounting, duplicate components, 6 event buses |
| **Priority** | P0 (GL consolidation), P1 (remaining) |
| **Effort** | 8 person-weeks total |

**Actions:**
1. P0: Consolidate dual GL (R-001).
2. P1: Merge remaining duplicate components (4 skeleton systems, 2 breadcrumb systems, 2 nav data sources).
3. P1: Reduce event buses from 2 to 1 (enterprise bus absorbs connector bus events).
4. P2: Audit and remove dead code identified in Phase 18.0 (identity module has 9 page consumers — cannot delete but can deprecate).

---

### CC-002: Data Persistence Migration

| | |
|---|---|
| **Scope** | All in-memory stores (business rules, approval matrix, scheduler, analytics cache) |
| **Priority** | P1 (R-006), P2 (remaining) |
| **Effort** | 5 person-weeks total |

**Actions:**
1. P1: Migrate business rules, approval matrix, scheduler to Prisma (R-006).
2. P2: Migrate analytics cache to Prisma with TTL-based invalidation.
3. P2: Migrate onboarding session data to Prisma (currently ephemeral).
4. P3: Migrate agent memory to Prisma (currently in-memory Map).

---

### CC-003: Enterprise Design System Adoption

| | |
|---|---|
| **Scope** | 130+ raw tables, 137 raw buttons, 12 raw forms, 4 skeleton systems |
| **Priority** | P1 (R-003), P2 (R-015) |
| **Effort** | 12 person-weeks total |

**Actions:**
1. P0: Migrate top 10 pages to EnterpriseTable (R-003).
2. P1: Migrate top 10 pages to EnterpriseButton.
3. P2: Migrate all remaining tables (R-015).
4. P2: Standardize on single skeleton system (LoadingSkeleton from motion library).
5. P2: Standardize on single breadcrumb system.

---

### CC-004: E2E Workflow Testing

| | |
|---|---|
| **Scope** | 14 core workflows, zero E2E tests currently |
| **Priority** | P1 |
| **Effort** | 8 person-weeks |

**Actions:**
1. P1: Write E2E tests for the 3 production-ready workflows (Order-to-Cash, Treasury, General Ledger).
2. P1: Write E2E tests for the 4 workflows wired in R-002 (CRM→Invoice, Procurement GL, Payment→Cash, Invoice→Collections).
3. P2: Write E2E tests for remaining 7 workflows.
4. Add E2E tests to CI pipeline as a required check.
5. Target: every production workflow has at least one happy-path E2E test.

---

### CC-005: Documentation Completion

| | |
|---|---|
| **Scope** | API reference, user guides, admin guides, developer onboarding |
| **Priority** | P2 |
| **Effort** | 6 person-weeks |

**Actions:**
1. P1: Generate OpenAPI/Swagger documentation for all 460 routes.
2. P2: Write user guides for each persona (CFO, Controller, Treasurer, etc.).
3. P2: Write admin guide for platform setup, configuration, and maintenance.
4. P2: Write developer onboarding guide for new engineers.
5. P3: Create interactive API explorer.

---

### CC-006: Security Remediation

| | |
|---|---|
| **Scope** | Remaining findings from Phase 16.0 security audit |
| **Priority** | P1 (deferred High items) |
| **Effort** | 3 person-weeks |

**Actions:**
1. P1: Address Docker port exposure (non-default ports, network policies).
2. P1: Add webhook signature verification as optional but recommended.
3. P2: Implement DDoS protection beyond rate limiting (IP reputation, behavioral analysis).
4. P2: Complete ABAC evaluator (currently stub).
5. P3: Implement SSO token validation (currently stubbed).

---

## Constitution Compliance Roadmap

| Recommendation | Constitution Section | Principle | Current | After Fix |
|---|---|---|---|---|
| R-001 (GL consolidation) | §1 Clarity, §5 Trust | Single source of truth | 3/10 | 7/10 |
| R-002 (E2E workflows) | §1 Clarity, §2 Confidence | Complete workflows | 4/10 | 7/10 |
| R-003 (Constitution compliance) | §1-§8 (all) | All principles | 4.8/10 | 6.0/10 |
| R-004 (What Changed?) | §5 Dashboard | Change analysis | 3/10 | 7/10 |
| R-005 (Timestamps) | §5 Trust, P27 | Data freshness | 3/10 | 8/10 |
| R-006 (Prisma stores) | §5 Trust | Persistence | 3/10 | 7/10 |
| R-007 (Undo system) | §3 Speed, P19 | Undo > confirmation | 2/10 | 7/10 |
| R-008 (Cmd+K) | §3 Speed, §4 Keyboard | Quick navigation | 2/10 | 8/10 |
| R-009 (Keyboard nav) | §4 Keyboard, P15 | Keyboard should work | 2/10 | 7/10 |
| R-010 (Evidence links) | §1 Evidence, P4, P9 | Explainable AI | 3/10 | 8/10 |
| R-011 (Empty states) | §1 Clarity, §7 Progressive | Guidance | 4/10 | 7/10 |
| R-012 (Mobile) | §3 Executive | Mobile access | 3/10 | 6/10 |
| R-013 (Progress indicators) | §3 Speed, §7 Progressive | Process visibility | 3/10 | 7/10 |

---

## Investment ROI

### Tier 1 (P0) — Weeks 1–4

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Engineering effort | — | 16 person-weeks | — |
| Experience Constitution compliance | 4.8/10 | 6.0/10 | +1.2 |
| Average workflow trust score | 6.4/10 | 7.0/10 | +0.6 |
| Production-ready workflows | 3/14 | 5/14 | +2 |
| Average persona coverage | 6.2/10 | 6.5/10 | +0.3 |
| Critical friction issues | 4 | 0 | -4 |

**Business value:** Without this work, no customer should see the platform. This is table stakes.

### Tier 2 (P1) — Weeks 5–12

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Engineering effort | — | 28 person-weeks | — |
| Experience Constitution compliance | 6.0/10 | 7.2/10 | +1.2 |
| Average workflow trust score | 7.0/10 | 8.0/10 | +1.0 |
| Production-ready workflows | 5/14 | 10/14 | +5 |
| Average persona coverage | 6.5/10 | 7.8/10 | +1.3 |
| Critical friction issues | 0 | 0 | — |
| High friction issues | 8 | 2 | -6 |

**Business value:** Enterprise buyers can evaluate the platform with confidence. Design partners can use it for daily work.

### Tier 3 (P2) — Weeks 13–24

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Engineering effort | — | 28 person-weeks | — |
| Experience Constitution compliance | 7.2/10 | 8.5/10 | +1.3 |
| Average workflow trust score | 8.0/10 | 8.8/10 | +0.8 |
| Production-ready workflows | 10/14 | 13/14 | +3 |
| Average persona coverage | 7.8/10 | 8.8/10 | +1.0 |
| Critical friction issues | 0 | 0 | — |
| High friction issues | 2 | 0 | -2 |

**Business value:** The platform operates at enterprise scale with daily-use efficiency. All personas are well-served.

### Tier 4 (P3) — Week 25+

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Engineering effort | — | 28 person-weeks | — |
| Experience Constitution compliance | 8.5/10 | 9.2/10 | +0.7 |
| Average workflow trust score | 8.8/10 | 9.3/10 | +0.5 |
| Production-ready workflows | 13/14 | 14/14 | +1 |
| Average persona coverage | 8.8/10 | 9.3/10 | +0.5 |

**Business value:** Market differentiation. Features that no existing financial platform offers.

### Total Investment

| Tier | Person-Weeks | Calendar Weeks | Cost Estimate |
|------|-------------|----------------|---------------|
| P0 | 16 | 4 | Foundation |
| P1 | 28 | 8 | Production-ready |
| P2 | 28 | 12 | Scale-ready |
| P3 | 28 | Ongoing | Market-leading |
| Cross-cutting | 42 | Parallel | Infrastructure |
| **Total** | **142** | **24 weeks** | — |

---

## Success Metrics

### Measurable Success Criteria

| Metric | Baseline (Phase 20.0) | P0 Target | P1 Target | P2 Target | P3 Target |
|--------|----------------------|-----------|-----------|-----------|-----------|
| Experience Constitution compliance | 4.8/10 | 6.0/10 | 7.2/10 | 8.5/10 | 9.2/10 |
| Average workflow trust score | 6.4/10 | 7.0/10 | 8.0/10 | 8.8/10 | 9.3/10 |
| Production-ready workflows | 3/14 | 5/14 | 10/14 | 13/14 | 14/14 |
| Average persona coverage | 6.2/10 | 6.5/10 | 7.8/10 | 8.8/10 | 9.3/10 |
| Total friction issues | 25 | 21 | 7 | 2 | 0 |
| Critical friction issues | 4 | 0 | 0 | 0 | 0 |
| High friction issues | 8 | 6 | 0 | 0 | 0 |
| Dashboards with timestamps | 4/11 | 11/11 | 11/11 | 11/11 | 11/11 |
| Dashboards with change analysis | 3/11 | 11/11 | 11/11 | 11/11 | 11/11 |
| Pages using EnterpriseTable | 4/130+ | 14/130+ | 40/130+ | 130+/130+ | 130+/130+ |
| In-memory stores remaining | 3 | 0 | 0 | 0 | 0 |
| E2E tests for core workflows | 0 | 3 | 10 | 14 | 14 |
| Mobile workflows | 2 | 2 | 7 | 10 | 14 |
| Keyboard-shortcut coverage | 3 | 3 | 10 | 20 | 30+ |
| ARIA compliance | ~60% | 65% | 80% | 95% | 100% |

### Verification Methods

| Metric | Verification |
|--------|-------------|
| Constitution compliance | Re-run compliance audit against all 14 sections |
| Workflow trust score | Re-run workflow validation with updated scoring rubric |
| Production-ready workflows | Each workflow must pass: types ✅, service ✅, GL integration ✅, UI ✅, E2E test ✅ |
| Persona coverage | Re-run persona validation with updated coverage scoring |
| Friction issues | Re-run friction analysis with same methodology |
| EnterpriseTable adoption | `grep -r "<table" src/app --include="*.tsx" | wc -l` must be 0 |
| In-memory stores | `grep -r "new Map" src/modules | wc -l` must be 0 |

---

## Implementation Sequence

### Phase 20.1 (Weeks 1–4): P0 Foundation

```
Week 1: GL architecture audit + consolidation plan
Week 2: GL consolidation implementation + timestamp/delta components
Week 3: E2E workflow wiring (CRM→Invoice, Procurement→GL)
Week 4: Dashboard compliance fixes + GL consolidation verification
```

### Phase 20.2 (Weeks 5–12): P1 Production Readiness

```
Weeks 5-6: Prisma migration for in-memory stores + undo system
Weeks 7-8: Cmd+K command palette + keyboard navigation
Weeks 9-10: Evidence links + empty states + error handling
Weeks 11-12: Mobile workflows + progress indicators + ARIA fixes
```

### Phase 20.3 (Weeks 13–24): P2 Scale Readiness

```
Weeks 13-16: EnterpriseTable migration (top 20 pages) + dashboard standardization
Weeks 17-20: EnterpriseTable migration (next 30 pages) + batch operations
Weeks 21-24: Offline capability + export completeness + documentation
```

### Phase 20.4 (Week 25+): P3 Market Leadership

```
Ongoing: Real-time collaboration, AI explainability, custom dashboards,
         workflow templates, advanced analytics
```

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| GL consolidation breaks existing functionality | High | Critical | Comprehensive test suite before and after; feature flags for rollback |
| E2E workflow wiring reveals hidden dependencies | Medium | High | Start with simplest workflow (CRM→Invoice), expand incrementally |
| In-memory to Prisma migration causes data model drift | Medium | High | Write migration tests that verify data integrity before/after |
| EnterpriseTable migration introduces visual regressions | Medium | Medium | Side-by-side comparison for each migrated page |
| Keyboard navigation conflicts with existing shortcuts | Low | Medium | Audit all existing shortcuts before adding new ones |
| Mobile workflows require different API response shapes | Low | Medium | Add mobile-specific fields to existing responses, not new endpoints |
| Constitution compliance fixes conflict with each other | Low | Low | Fix in priority order; each fix is independently deployable |

---

## Appendix A: Friction Issue Mapping

| WF-ID | Issue | Severity | Fixed By |
|-------|-------|----------|----------|
| WF-001 | Dual GL architecture | Critical | R-001 |
| WF-002 | Duplicate navigation paths | Medium | R-001 (redirects) |
| WF-003 | No Quick View panels | Medium | R-014 |
| WF-004 | Orphaned routes | Low | R-008 (Cmd+K index) |
| WF-005 | No change indicators on KPI cards | High | R-004 |
| WF-006 | No timestamps on financial figures | High | R-005 |
| WF-007 | No data mode indicator | Low | New component |
| WF-008 | No evidence links on recommendations | High | R-010 |
| WF-009 | No default filters on list pages | Medium | R-011 (empty states) |
| WF-010 | No undo system | High | R-007 |
| WF-011 | No command palette | High | R-008 |
| WF-012 | Raw tables (130+) | High | R-015 |
| WF-013 | Inconsistent error handling | Medium | R-019 |
| WF-014 | Limited keyboard shortcuts | Medium | R-009 |
| WF-015 | Inconsistent button styles | Low | R-003 |
| WF-016 | No confidence ratings on AI outputs | High | R-010 |
| WF-017 | Limited AI audit trail | Medium | R-010 |
| WF-018 | Float fields for monetary values | Medium | R-006 (Prisma migration) |
| WF-019 | Financial close not using wizard | Medium | R-013 |
| WF-020 | No autosave for long workflows | Medium | EnterpriseForm (existing) |
| WF-021 | No cross-module GL integration | Critical | R-002 |
| WF-022 | In-memory stores (ephemeral) | Critical | R-006 |
| WF-023 | No offline capability | Low | R-016 |
| WF-024 | No unified empty state | Low | R-011 |
| WF-025 | No terminology glossary | Low | CC-005 |

## Appendix B: Constitution Principle Coverage

| Principle | Section | Covered By | Status |
|-----------|---------|------------|--------|
| Clarity | §1 | R-001, R-002, R-011 | Partial |
| Confidence | §2 | R-002, R-005 | Partial |
| Speed | §3 | R-007, R-008, R-013, R-017 | Partial |
| Keyboard-First | §4 | R-008, R-009 | Partial |
| Trust | §5 | R-001, R-005, R-006, R-010 | Partial |
| Audit Trail | §6 | R-019, CC-006 | Partial |
| Progressive Disclosure | §7 | R-011, R-013 | Partial |
| Accessibility | §8 | R-020, CC-003 | Partial |
| Evidence-Driven | §12 P4 | R-010 | Partial |
| Explainable | §12 P9 | R-010, R-022 | Partial |
| Every Figure Has Source | §12 P27 | R-005 | Partial |
| Undo > Confirmation | §12 P19 | R-007 | Partial |
| Keyboard Should Work | §12 P15 | R-009 | Partial |
| Stale Data Worse Than None | §12 P11 | R-005 | Partial |

---

*Phase 20.0 — Documentation only. No code changes.*
*Generated: July 21, 2026*
