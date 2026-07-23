---
id: experience-platform
title: Experience Platform
sidebar_label: Experience Platform
description: Role-tailored dashboards, morning briefings, onboarding, workspaces, feature discovery, adoption analytics, and customer success resources.
---

# Enterprise Experience Platform

**Location**: `src/modules/enterprise-experience/` (10 source files), `src/modules/onboarding/`

The Experience Platform delivers role-tailored dashboards, morning briefings, onboarding wizards, workspaces, product guidance, feature discovery, implementation tracking, adoption analytics, and customer success resources.

---

## Components

| Component | File | Responsibility |
|---|---|---|
| `RoleExperienceService` | `role-experience.service.ts` | Role-specific dashboard configurations |
| `WorkspaceService` | `workspace.service.ts` | Workspace definitions and initialization |
| `MorningBriefingService` | `morning-briefing.service.ts` | Daily financial snapshot generation |
| `FeatureDiscoveryService` | `feature-discovery.service.ts` | Feature flags and discovery |
| `ProductGuidanceService` | `product-guidance.service.ts` | Interactive product tours |
| `AdoptionAnalyticsService` | `adoption-analytics.service.ts` | Feature adoption tracking |
| `ImplementationCenterService` | `implementation-center.service.ts` | Implementation milestone tracking |
| `CustomerSuccessService` | `customer-success.service.ts` | Resources, tickets, feature requests |
| Onboarding Module | `src/modules/onboarding/` | 10-step setup wizard and readiness verification |

## Role Dashboards

`RoleExperienceService` defines role-specific dashboard layouts, KPIs, reports, and quick actions for:
- **CFO** — cash position, approval queue, forecast, risk summary, KPI grid (3 columns)
- **Controller** — reconciliation status, month-end progress, GL activity, exceptions, approvals (3 columns)
- **Treasurer** — cash position, liquidity overview, FX exposure, forecast, transfer queue (3 columns)
- **Finance Manager** — team activity, approval queue, exceptions, calendar, KPIs (2 columns)
- **AP** — invoice queue, payment schedule, vendor list, exceptions (2 columns)
- **AR** — receivable aging, collections, disputed items, payment forecasts
- **Auditor** — audit trail, compliance status, access review, exception list
- **Executive** — executive summary, board pack status, strategic KPIs
- **Administrator** — system health, user activity, integration status, billing

Layout is configurable with widgets, columns (2 or 3), KPIs, report references, and quick action buttons.

## Morning Briefings

`MorningBriefingService.generate(ctx)` produces a daily financial snapshot containing:
- Pending approval count and total amounts
- Cash position (total balance, available balance)
- Last reconciliation status and timestamp
- Recent risk alerts (last 24 hours, unresolved)
- KPI snapshots (cash balance, liquidity, forecast accuracy)
- Recommended actions (pending reviews, overdue items)

Data is gathered via 5 parallel Prisma queries across Treasury, Risk, and Transaction models.

## Workspaces

`WorkspaceService` manages 7 default workspaces initialized per company:

| Workspace | Slug | Icon |
|---|---|---|
| Treasury | `treasury` | Landmark |
| Month-End Close | `month-end` | CalendarCheck |
| Reporting | `reporting` | BarChart3 |
| Audit | `audit` | SearchCheck |
| Procurement | `procurement` | ShoppingCart |
| Cash Management | `cash-management` | Wallet |
| Financial Operations | `financial-ops` | Building2 |

Workspaces are upserted by `companyId + slug` and are soft-toggleable via `isActive`.

## Feature Discovery

`FeatureDiscoveryService` manages 12 feature flags across four categories:

| Category | Features |
|---|---|
| Onboarding | Multi-Currency, Auto-Reconciliation, Approval Workflows, Audit Trail |
| Advanced | Forecasting, Treasury Optimization, Compliance Monitoring |
| Expert | AI Insights, Custom Report Builder, API Access |
| Beta | Blockchain Ledger, AI Copilot |

Features are role-gated (`requiredRole`) and can have dependencies (`dependsOn`). Beta features have `isBeta: true`.

## Product Guidance

`ProductGuidanceService` manages interactive product tours. Default tours include:
- **Welcome** — 5-step overview of platform navigation
- **First Integration** — connecting your ERP system
- **Approval Setup** — configuring approval workflows
- **Reconciliation** — running your first bank reconciliation
- **Reporting** — understanding financial reports
- **Treasury Management** — managing cash positions

Tours have trigger conditions (`triggerOn`), target role filters, priority ordering, and multi-step guides with target element selectors, content, and placement.

## Adoption Analytics

`AdoptionAnalyticsService.trackEvent(ctx, data)` records user actions with:
- Event type: `feature_used`, `page_viewed`, `tour_completed`, etc.
- Category: `core`, `advanced`, `expert`, `beta`, `onboarding`
- Duration tracking for engagement analysis
- Per-user adoption scoring with percentile calculations

`getUserAdoption(ctx, userId)` computes a user's adoption score relative to their cohort — number of distinct features used, time since first use, and percentile rank.

## Implementation Center

`ImplementationCenterService` tracks 15 implementation milestones across five categories:

| Category | Milestones |
|---|---|
| Setup | Company Profile, Fiscal Calendar, Entity Creation, Currency Config |
| Configuration | Chart of Accounts, Tax Config, Approval Rules, Policy Setup |
| Integration | ERP Connection, Bank Connection, Data Import |
| Validation | Reconcile Balances, Validation Summary, User Acceptance Testing |
| Go-Live | Launch Checklist |

Each milestone has: estimated days, dependencies (prerequisites), required/optional flag, and status tracking (pending/in-progress/completed/blocked).

## Customer Success

`CustomerSuccessService` provides:
- **Resources**: 10 built-in resources (documentation, tutorials, release notes, guides, FAQs) with role targeting
- **Feature Requests**: user-submitted feature suggestions with voting and status tracking
- **Support Tickets**: ticket submission with priority (critical/high/normal/low) and status workflow

## Onboarding Module

The onboarding module (`src/modules/onboarding/`) provides a 10-step setup wizard:
1. Company Setup — legal entity, fiscal calendar, base currency
2. Organization Structure — entity hierarchy with cycle detection
3. User Invitation — role assignment and access configuration
4. Treasury Setup — bank accounts, wallet configuration
5. Workflow Configuration — approval rules and automation
6. Integration Setup — connector credentials and health verification
7. Governance — policy frameworks and violation review
8. AI Configuration — provider setup and model selection
9. Intelligence — financial health baseline assessment
10. Enterprise Readiness — 12-domain readiness verification with scoring

Readiness verification (`EnterpriseReadinessService`) checks identity, organization, users, treasury, banks, ERP, accounting, governance, workflow, automation, AI, and connectors. Produces a scored report with per-domain pass/warn/fail badges and actionable suggestions.
