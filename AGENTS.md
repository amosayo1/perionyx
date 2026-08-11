# AGENTS.md — Perionyx Enterprise Software

## Build & Verify Commands

```bash
pnpm typecheck     # TypeScript strict mode — must pass before any commit
pnpm build         # Production build — must pass before any commit
pnpm test          # Test suite (currently 60/60 runtime + 52/52 AP + others pass via vitest)
```

## Engineering Constitution — UI Decision Mandate

Every UI decision must be justified by the needs of **CFOs, Treasurers, Controllers, Finance Managers, and Auditors** — not by consumer SaaS aesthetics or visual trends. Beauty is important, but **clarity, speed, and confidence** always come first.

- **CFOs** need instant financial visibility, drill-down trust, and audit-ready clarity.
- **Treasurers** need precision, status-at-a-glance, and zero ambiguity on balances/transfers.
- **Controllers** need unbroken audit trails, clear approval chains, and exception highlighting.
- **Finance Managers** need workflow-state visibility and team-activity overview.
- **Auditors** need chronological integrity, tamper-evident design, and screen-reader-friendly exports.

### Design Principles (in order)

1. **Clarity** — every screen answers one question; no visual noise
2. **Confidence** — data is stale? label it. action is destructive? confirm it. balance is cached? mark it.
3. **Speed** — CFOs don't wait. Metric values render first, charts second
4. **Beauty** — achieved through restraint: generous whitespace, consistent rhythm, purposeful color
5. **Trust** — every number has a source; every state has an explanation

### Visual Identity

- **Charcoal surfaces** ~95% — backgrounds, cards, sidebars, headers
- **Typography** ~4% — white/off-white text on charcoal
- **Gold accents** ~1% — currency, active states, key metrics, logo
- Influence: Bloomberg Terminal, Stripe Dashboard, Linear, Apple, Mercedes S-Class interior

## Security Review (Mandatory Pre-Commit Checklist)

Every new feature, edit, or optimization MUST pass all 10 questions below. Document answers inline in the commit message or as a comment in the PR.

| # | Question | Must Be |
|---|---|---|
| 1 | Does this expose sensitive financial data? | **No** — if yes, require encryption, audit, and additional permission checks |
| 2 | Does this require a new permission? | **No or Yes with explicit grant** — every new action that mutates or exposes data needs a `GranularPermission` in `PermissionRegistry` |
| 3 | Can another tenant access this? | **No** — all cross-tenant access must be blocked by `requireTenantContext()` or equivalent isolation |
| 4 | Does this need audit logging? | **Yes** — any action affecting security, finance, approvals, configuration must call `recordAudit()` or `recordIAMAudit()` |
| 5 | Is encryption required? | **No** unless handling PII, financial data, credentials, API keys, or tokens — then **yes** |
| 6 | Is the operation reversible? | **Documented** — destructive actions must have recovery path or confirmation; irreversible ops need elevated permissions |
| 7 | Could this be abused through privilege escalation? | **No** — verify permission checks are applied at the endpoint, not skipped; API keys must not hard-code ADMIN |
| 8 | Does it introduce new secrets? | **No** — never commit secrets, keys, tokens, passwords. Use env vars + secret manager |
| 9 | Is rate limiting required? | **Yes** for auth, mutation, financial, and public endpoints — use `rateLimit()` in proxy or handler |
| 10 | Does it comply with our security architecture? | **Yes** — follow the IAM permission model, tenant isolation, error handling, audit patterns established in phase 9A.1 |

## Architecture

- **Pages**: Server Components in `src/app/(shell)/automation-studio/` (11 routes)
- **Components**: Client components in `src/components/automation-studio/` + `src/components/onboarding/`
- **Modules**: Business logic in `src/modules/automation-studio/` (11 files) + `src/modules/onboarding/` (20+ files)
- **API Routes**: `src/app/api/automation-studio/{business-rules,approval-matrix,schedules,setup,ai}`

### Module Organization

| Module | Location | State |
|---|---|---|
| TemplateLibrary | `template-library.ts` | In-memory `Map` |
| AutomationRegistry | `automation-registry.ts` | In-memory `Map` |
| BusinessRulesBuilder | `business-rules-builder.ts` | In-memory `Map` |
| ApprovalMatrixEvaluator | `approval-matrix-evaluator.ts` | In-memory `Map` |
| AutomationScheduler | `automation-scheduler.ts` | In-memory `Map` |
| WorkflowAnalyticsService | `workflow-analytics.service.ts` | Prisma queries |
| AutomationStudioService | `automation-studio.service.ts` | Facade over all above |
| OnboardingService | `onboarding.service.ts` | In-memory sessions (ephemeral) |
| EnterpriseReadinessService | `enterprise-readiness.service.ts` | Stateless — evaluates via Prisma + existing services |

### Integration Points

| Integration | How |
|---|---|
| WorkflowEngine | `WorkflowEngine.getInstance()` — shared singleton |
| GovernanceService | Called for health score, violations, violation recording |
| DecisionService | Called for top decisions, evaluate all |
| IntelligenceService | Called for evaluate all |
| OperationsService | Called for connector health, sync metrics, queue status, readiness |
| Queue Service | `enqueue`, `scheduleCron`, `unscheduleCron`, `registerHandler` |
| ConditionEvaluator | Shared with `OPERATOR_MAP` export |
| ConnectorPlatform | `ConnectorLifecycle.validate()`, `ConnectorLifecycle.healthCheck()`, `connectorPlatformRegistry` |
| AI Platform | `aiProviderRegistry.getActiveProviders()`, `modelRegistry.getByProvider()`, `providerHealthMonitor` |

### Key Types (from `src/modules/automation-studio/types.ts`)

- `BusinessRuleDefinition` — structured rules with `ConditionGroup` + `RuleAction[]`
- `BusinessRule` — simple config-based rules
- `ApprovalMatrixRule` — role/dept/threshold approval rules
- `AutomationSchedule` — all 12 trigger types
- `WorkflowAnalytics` — step durations, bottlenecks, failure rates, queue metrics

### Key Decisions

1. **ConditionEvaluator** extracted from `ConditionalBranchStepExecutor` — shared with business rules + approval matrix
2. **In-memory stores** for rules/schedules/matrix — ephemeral per process; DB persistence planned for Phase 7D
3. **OPERATOR_MAP** lives in `condition-evaluator.ts` — single source of truth
4. **ApprovalMatrixEvaluator** is pure resolver (WHAT to do) — execution stays in `ApprovalStepExecutor` (HOW to do it)
5. **AutomationScheduler** wraps PgBoss via `queue.service.ts` — no queue management duplication
6. **Workflow Analytics** reuses `WorkflowEngine.getMetrics()` — new computation only for step-level data
7. **EnterpriseReadinessService** reuses OperationsService, GovernanceService, WorkflowEngine, aiProviderRegistry — no duplicated evaluation logic
8. **Onboarding steps** are validation-only — they check config metadata and existing Prisma records, but don't call module execution methods (avoids side effects during setup)
9. **Readiness verification** runs 12 checks across all domains — identity, organization, users, treasury, banks, ERP, accounting, governance, workflow, automation, AI, connectors

## What Was Built

### Phase 7D — Onboarding Module & Enterprise Readiness
...
- `types.ts` — 20+ interfaces, 10 step IDs
- `onboarding-state-machine.ts` — Pure session + step state transition validation
- `setup-registry.ts` — 10 step definitions with prerequisites, category, estimated minutes
- `validators.ts` — Per-step, prerequisite, and session validation
- `onboarding.service.ts` — Session lifecycle (create, start, advance, skip, abandon, progress)
- `company-setup.service.ts` — SaveDraft, getDraft, complete, validate
- `organization-structure.service.ts` — CRUD + tree hierarchy + bulk create with cycle detection
- **Enhanced `steps/integrations-step.ts`** — Validates credentials via `ConnectorLifecycle.validate()`, runs `ConnectorLifecycle.healthCheck()`, categorizes connectors (banking, ERP, accounting, CSV)
- **Enhanced `steps/governance-step.ts`** — Reuses `GovernanceService.getMetrics()`, `PolicyRegistry.getFrameworks()`, checks policies and violations
- **Enhanced `steps/ai-step.ts`** — Reuses `aiProviderRegistry.getActiveProviders()`, `modelRegistry.getByProvider()`, `providerHealthMonitor.getCachedHealth()`; OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere
- `steps/base-step.ts` — Abstract base with skip, validate, execute, getProgress
- 5 other steps: org-structure, users, treasury-setup, workflows, operations, intelligence
- `utils/index.ts` — Format helpers (calculatePercentComplete, formatEstimatedTime, etc.)
- `index.ts` — Barrel export
- **New `enterprise-readiness.service.ts`** — 12-domain readiness verification with scoring, suggestions, report generation
- **Updated `index.ts`** — Exports `EnterpriseReadinessService`, `ReadinessCheckResult`, `ReadinessReport`

### UI Components (`src/components/onboarding/`)
- `onboarding-wizard.tsx` — Main client component with welcome screen, step detail panel, completion view
- `onboarding-stepper.tsx` — Progress bar + vertical step list with category colors, icons, status indicators
- `onboarding-readiness.tsx` — Enterprise Readiness report with score rings, per-domain pass/warn/fail badges, suggestions
- `onboarding-dashboard-preview.tsx` — Post-completion dashboard with feature grid and navigation buttons

### Pages (`src/app/(shell)/automation-studio/setup/`)
- `page.tsx` — Server Component page with auth, readiness service, wizard orchestration
- `loading.tsx` — Skeleton loading state
- `error.tsx` — Error boundary with recovery UI

### API Routes
- `src/app/api/automation-studio/setup/route.ts` — POST to create/start onboarding session

### Phase 8A.5 — Background Jobs & Async Processing
- **Job types**: `src/modules/queue/job-types.ts` — typed payload schemas (NotificationJobPayload, WorkflowJobPayload, AiJobPayload, ReportJobPayload, ConnectorSyncJobPayload)
- **Async notification delivery**: `src/modules/queue/jobs/notification-delivery.job.ts` — handles email, Slack, and connector delivery as background jobs instead of inline
- **Enhanced queue service**: `src/modules/queue/queue.service.ts` — added `cancelJob()`, `getJobStatus()`, `fromPrisma` re-export, improved error logging
- **Job monitoring API**: `src/app/api/v1/queue/jobs/route.ts` — GET for job status lookup (by queue+id) and queue stats; POST for job cancellation
- **Notification service**: `src/modules/notifications/notifications.service.ts` — email and Slack delivery now enqueued to PgBoss instead of inline `await`
- **Registered handlers**: `src/modules/queue/jobs/index.ts` — `notification-delivery` handler registered

### Phase 8B.5 — Executive Data Visualization & Analytics
- **13 new analytics components** at `src/components/enterprise/analytics/` — ExecutiveKpiCard, ChartToolbar, ChartLegend, VarianceCard, CashFlowTimeline, ForecastChart, ApprovalAnalytics, WorkflowAnalytics, DrillDownPanel, InsightPanel, ExecutiveSummary, types/index
- **Purposely built for CFOs/Controllers**: cash flow timeline with forecast boundary, budget variance bars, approval path donut, workflow performance stacked bars, AI insights panel
- **No external chart libraries** — all custom SVG inline rendering
- **No new dependencies, zero TypeScript errors, build passes**

### Phase 8B.6 — Enterprise Forms & Workflow UX
- **15 new form/workflow components** at `src/components/enterprise/forms/` + `src/components/enterprise/workflow/`
- **EnterpriseForm** — root wrapper with auto-save (debounced 2s), ValidationSummary, UnsavedChangesGuard (beforeunload + inline save/discard), AutoSaveIndicator (saving/saved/failed/unsaved states)
- **EnterpriseSection** — collapsible section with error count badge, advanced badge, icon support
- **EnterpriseField** — standardized label + input + error + help + hint with vertical/horizontal layouts
- **FieldHelp / FieldHint** — contextual help text + styled hints (example/best-practice/regulatory/tip)
- **SmartSelect** — searchable, grouped multi-select with keyboard navigation, chip display
- **ConditionEditor** — field/operator/value builder with AND/OR logic toggle
- **ApprovalPreview** — visual approval path simulation (sequential/parallel modes, status icons per step)
- **EnterpriseWizard** — multi-step wizard with step indicator bar, back/next/complete
- **ReviewStep** — pre-submit review with valid/invalid/warning field status and edit navigation
- **WorkflowCanvas** — zoom (Cmd+Scroll, +/- buttons, Cmd+0 reset), pan (click-drag), dot grid toggle, minimap, keyboard shortcuts
- **WorkflowToolbar** — undo/redo (Cmd+Z / Cmd+Shift+Z), alignment controls, save (Cmd+S), export, minimap/readonly toggles
- **Validation standards** — inline on blur, format/range/cross-field/async/business-rule/duplicate detection, human-readable error messages explaining HOW to fix
- **Progressive disclosure** — core fields always visible, optional labeled "Optional", advanced sections collapsed with badge, expert settings hidden behind toggle
- **Smart defaults** — previous input > org defaults > role defaults > sensible defaults
- **Accessibility** — WCAG 2.1 AA, `aria-invalid`, `aria-describedby`, `aria-required`, keyboard Tab/Shift+Tab/Enter/Escape
- **3 migrated forms** — business-rules-form, approval-matrix-form, scheduler-form now use EnterpriseForm system (backward-compatible, same interfaces/props)
- **Documentation**: `docs/design/enterprise-forms.md` — full philosophy, component architecture, state/field states, validation standards, smart default strategy, progressive disclosure rules, workflow UX principles, keyboard shortcuts, error handling standards, accessibility guidelines
- **No new dependencies, zero TypeScript errors, build passes**

### Phase 8B.4 — Enterprise Tables 2.0
- **Enhanced types**: `src/components/enterprise/table/types.ts` — ultra-compact density, multi-sort state (`SortState[]`), cell formatters config (`CellConfig`), inline editing config (`InlineEditConfig`), relative date presets, column pinning
- **Cell formatters**: `src/components/enterprise/table/cell-formatters.tsx` — `CurrencyCell` (negative-red parentheses, abbreviate), `NumberCell`, `DateCell` (relative "3m ago"), `StatusCell` (color-coded status badges), `TrendCell` (up/down arrows + percentage), `TagsCell` (truncated badge list)
- **Inline editing**: `src/components/enterprise/table/inline-edit.tsx` — text, number, currency, date, select dropdowns with validation, optimistic save, undo, keyboard navigation (Enter/Tab to save, Escape to cancel)
- **Multi-column sort**: `src/components/enterprise/table/hooks/use-multi-sort.ts` — priority-based multi-sort with toggle (desc->clear cycle), priority labels (primary/secondary/tertiary), persisting to saved views
- **Exports**: `src/components/enterprise/table/export-utils.ts` — CSV (UTF-8 BOM for Excel) + XLS (XML Spreadsheet 2003, zero dependencies), respects column visibility, filters, and sorting
- **Enhanced search**: `src/components/enterprise/table/table-search.tsx` — results highlighting with `<mark>` rendering, recent searches dropdown (localStorage)
- **Enhanced pagination**: `src/components/enterprise/table/table-pagination.tsx` — ellipsis-style page buttons, page size selector (25/50/100/200)
- **Enhanced toolbar**: `src/components/enterprise/table/toolbar.tsx` — relative date presets (Today, This Week, This Month, Last 30 Days, Last Quarter, This Year), export menu with CSV/Excel, ultra-compact density option
- **Enhanced data-table**: `src/components/enterprise/table/data-table.tsx` — integrated all new features, `useFilteredData` memoized pipeline, `renderRow`/`renderCell` plain functions, cellConfig-based automatic formatting, inline editing support
- **Consumer page migration**: ledger, transactions, audit-logs, incidents pages migrated from `DataTable` (base) to `EnterpriseTable` (enhanced) with cellConfig formatters for currency/date/status columns, Excel export support
- **Documentation**: `docs/design/enterprise-table-system.md` — table philosophy, density guidelines, filtering rules, grouping rules, accessibility, performance guidelines, architecture summary, future extension points

### Phase 20.1 — Workflow Remediation (Critical & High Priority)
- **Deprecation Banners**: All 13 `/accounting/` pages show deprecation warnings with redirect to `/general-ledger`
- **GL Integration Services**: Created `GLIntegrationService` for procurement, treasury, fixed-assets following the AR pattern
- **Data Freshness Indicator**: `DataFreshnessIndicator` component shows persisted vs. in-memory status + age
- **Dashboard KPI Improvements**: All 5 KPIs show previous period values, timestamps, and data sources
- **Data Mode Indicator**: Sidebar footer shows "Demo Data · Seeded · not persisted" badge
- **Evidence Links**: `InsightPanel` items support `sourceUrl`, `sourceLabel`, `confidence` with external links
- **Global Undo System**: `UndoProvider` wraps app shell, toast-based undo with 8s auto-dismiss
- **ConfidenceBadge**: Standardized component (5 levels, 3 variants, 5 icons)
- **Cmd+K**: Verified pre-existing implementation in CommandPalette
- **Deferred**: WF-012 (19 raw table pages in Fixed Assets + Identity)

### Phase 20.2 — Enterprise Workflow Revalidation (Complete)
- **Scope**: Re-evaluate all 14 workflows, 10 personas using Phase 20.0 methodology
- **Trust Score**: 6.4 → 6.8 (+0.4). Executive Briefing graduated to production-ready (8/10)
- **Persona Coverage**: 6.2 → 6.9 (+0.7). CFO, Treasury, FP&A, FinOps, Board Secretary improved
- **Product Readiness**: 67% → 75% (+8%). UX and Executive Trust dimensions improved
- **Friction Issues**: 25 → 17 (-8). All 4 critical resolved. 4 of 8 high resolved
- **Production-Ready Workflows**: 2 → 3 (+1). Bank Reconciliation, Risk Alert Handling, Executive Briefing
- **Key Finding**: Cross-cutting UX fixes have broad but shallow impact — 8 fixes benefited 8-10 personas each but at 0.5-1 point increments. Domain-specific gaps (AP matching, AR collections) require dedicated engineering
- **Remaining Structural Blockers**: In-memory stores (data loss on restart), disconnected workflows (no end-to-end orchestration)
- **Path to 85%**: ~28 person-weeks — Prisma persistence (3w), end-to-end wiring (6w), wizards (4w), payment safety (2w), domain-specific (13w)
- **Deliverables**: 6 documents at `docs/validation/` — WORKFLOW_REVALIDATION_REPORT, PERSONA_REVALIDATION, WORKFLOW_SCORECARD_V2, PRODUCT_READINESS_V2, WORKFLOW_IMPROVEMENT_DELTA, PHASE20_2_DECISION_PACKET
- **Brain**: Lesson 31 (Cross-Cutting UX Shallow Impact), Principle #7 in Decision Network, evolution timeline entry

### Phase 21.0 — Accounts Payable Capability Inventory (Complete)
- **Scope**: Comprehensive AP domain inventory against 14-stage enterprise procure-to-pay workflow
- **Key Finding**: AP has extensive scaffolding (11 pages, 12 services, 20 components, 5,716 seeded records) but zero runtime functionality — zero Prisma models, zero API routes, zero mutation methods
- **AP Manager Persona**: 5/10 — joint-lowest of all 10 personas. Cannot perform any core task.
- **Enterprise Readiness**: 3.7% → 98.5% target post-Phase 21
- **Matching Engine**: `InvoiceMatchingService` has correct 2-way/3-way matching (126 lines) but hardcoded tolerance, no persistence, no UI trigger
- **GL Integration**: `GLIntegrationService` generates correct debit/credit entries but is never called
- **17 Feature Gaps**: Duplicate detection, payment scheduling, OCR, vendor portal, tolerance rules, exception management, multi-currency, withholding tax, partial payments, split allocations, recurring invoices, blocked invoices, budget check, vendor credit notes, audit timeline, explainability, GRN automation
- **4-Phase Implementation Plan**: 21A Foundation (Prisma + API, 3-4w), 21B Core Workflow (Match + Approve + Pay, 2-3w), 21C Intelligence (Exception + Duplicate + Analytics, 2w), 21D Hardening (Reconciliation + Audit + Safety, 1-2w). Total: 8-11 weeks
- **Deliverables**: 6 documents at `docs/ap/` — GAP_ANALYSIS, WORKFLOW, IMPLEMENTATION_PLAN, PERSONA_REVIEW, ENTERPRISE_SCORECARD, PHASE21_DECISION_PACKET
- **Brain**: Lesson 32 (Domain Scaffolding Is Not Domain Functionality), Principle #8 in Decision Network, evolution timeline entry

### Phase 22.0A — Public Platform Architecture (Complete)
- **Scope**: 25 documents defining the complete public-facing website architecture — zero code, all design
- **Documents**: WEBSITE_INFORMATION_ARCHITECTURE, SITE_MAP (97 URLs), PAGE_HIERARCHY (71 pages), NAVIGATION_MODEL (global nav + mega menus + mobile + footer + Cmd+K), CONTENT_STRATEGY (6 pillars), CONTENT_GOVERNANCE (RACI), PUBLIC_CONTENT_POLICY (CAN/CANNOT publish), SEO_STRATEGY, KEYWORD_STRATEGY (60+ keywords), DESIGN_LANGUAGE (PEDL extension), BRANDING_GUIDELINES, VISUAL_DIRECTION (hero concepts + scroll behaviors), MOTION_SYSTEM (page-level + component-level specs), ILLUSTRATION_GUIDE (diagram style, no stock), ICONOGRAPHY_GUIDE (Lucide + custom product icons), ACCESSIBILITY_GUIDE (WCAG 2.1 AA), COPYWRITING_GUIDE (voice pillars + headline formulas), MICROCOPY_GUIDE (buttons, forms, validation, tooltips), CALL_TO_ACTION_STRATEGY (hierarchy + placement + A/B tests), USER_JOURNEYS (8 persona journeys), COMPETITOR_WEBSITE_ANALYSIS (8 competitors), REFERENCE_EXPERIENCE (curated web inspirations), CONTENT_BRIEFS (10 priority page briefs), WEBSITE_ROADMAP (5-phase, 16-week plan), EDP_22_0A (10 key decisions)
- **Key Decisions**: Brain is source of truth (website = curated public view), dark-first (#040404) + gold accent (#d4af37), no stock imagery, Inter + JetBrains Mono, WCAG 2.1 AA, 97 URLs across 9 sections, 16-week phased rollout
- **Brain**: Lesson 38 (Brain→Public Content Pipeline), Principle #14 in Decision Network, evolution timeline entry

## Completed Gaps (Phase 8B.6 Post-Ship)

### EnterpriseForm Adoption
- **EnterpriseWizard** wired into `onboarding-wizard.tsx` — welcome screen uses EnterpriseWizard with `hideStepBar`, step detail uses EnterpriseForm + EnterpriseSection + EnterpriseField
- **WorkflowCanvas** wired into `workflow-designer.tsx` — replaces raw canvas div with zoom/pan/grid/minimap handling
- **WorkflowToolbar** wired into `workflow-designer.tsx` — replaces custom undo/redo/save buttons with keyboard shortcut support

### Documentation
- `docs/design/form-audit.md` — Full audit of all 11 form domains with migration roadmap
- `docs/research/customer-discovery.md` — Validated customer pain points driving form design decisions
- `docs/strategy/erp-adoption-friction.md` — ERP integration friction reduction strategy
- `docs/i18n/localization-strategy.md` — Arabic RTL readiness plan with phased component audit

### Localization & Infrastructure
- `next-intl` v4.13.1 installed — full i18n framework
- `src/i18n/routing.ts` — en/ar locale routing config
- `src/i18n/request.ts` — message loading with locale negotiation
- `src/messages/en.json` + `src/messages/ar.json` — starter translation files
- `src/proxy.ts` — locale detection via `NEXT_LOCALE` cookie + `Accept-Language` header
- `@next/bundle-analyzer` installed with `pnpm analyze` script
- `EnterpriseWizard` — added `hideStepBar` prop for sidebar-based wizard layouts

### Phase 8B.7 — Enterprise Motion & Micro-Interactions
- **Motion Tokens** — `src/components/enterprise/motion/tokens.ts`: standardized durations (100-600ms), 6 easing curves, 12+ animation variants (fadeIn, scaleIn, slideIn, stagger, expand/collapse, shimmer)
- **MotionProvider** — `src/components/enterprise/motion/provider.tsx`: React context for reduced-motion awareness, `enabled` flag consumed by all motion components
- **13 new components** at `src/components/enterprise/motion/`:
  - `AnimatedCard` — hover elevation/scale, press feedback, selection glow, all with `whileHover`/`whileTap`
  - `AnimatedButton` — hover scale, press scale, loading/success/error status states, reduced-motion-safe
  - `AnimatedDialog` — backdrop blur + scale-in animation, AnimatePresence mount/unmount, Escape key, focus trap
  - `AnimatedToast` — slide-in-right spring animation, stack via layout animation, variant icons (success/error/info/warning)
  - `AnimatedMetric` — counter animation (600ms cubic ease-out), trend arrows, initial fade-in-up
  - `AnimatedSidebar` — slide-in from left/right (400ms), backdrop fade, AnimatePresence
  - `AnimatedTable` + `AnimatedTableRow` — stagger fade-in rows (30ms delay), exit animation
  - `PageTransition` — fade-in-up page enter (400ms), used by `PageContainer`
  - `SectionTransition` + `SectionItem` — fade-in with optional stagger for child sections
  - `LoadingSkeleton` + `SkeletonGroup` + `SkeletonCard` + `SkeletonTable` — shimmer animation, staggered appearance, presets for text/card/circle/chart/metric/table-row
- **Legacy backward compatibility** — `MotionDiv` and `MotionStagger` re-exported from `motion/legacy.tsx` with identical API
- **Existing components wired**:
  - `MetricCard` → uses `AnimatedCard` with hover elevation + selection glow
  - `PageContainer` → wraps content in `PageTransition`
  - `EnterprisePageHeader` → uses `fadeInUp` variant
  - `EnterpriseForm` submit button → uses `AnimatedButton` with loading status
  - `EnterpriseSection` → AnimatePresence expand/collapse via `expandCollapse` variants
  - `EnterpriseField` → AnimatePresence error/warning text with y-slide (150ms)
  - `ValidationSummary` → scale+fade entrance (200ms)
  - `Breadcrumbs` → AnimatePresence `popLayout` for segment transitions (150ms, staggered 30ms)
  - `ChartCard` → `fadeInUp` entrance animation (350ms)
  - `DataTable` → `motion.tr` with stagger row entrance (200ms, 20ms delay per row)
  - `NotificationCenter` → AnimatePresence `popLayout` spring animations on add/dismiss
  - `WorkflowCanvas` step indicator → `motion.div` scale animation on selection
  - `WorkflowDesigner` step cards → `motion.div` entrance stagger (250ms, 30ms delay)
- **Documentation**: `docs/design/motion-system.md` — philosophy, durations, easings, per-component specs, accessibility, performance rules, reduced-motion strategy
- **No new runtime dependencies** — leverages existing `framer-motion` v12.42.1
- **Zero TypeScript errors, build passes**

### Phase 8B.8 — Executive Mobile Experience
- **Page audit**: Classified all 96 routes — 26 DesktopOnly, 41 Responsive, 15 ExecutiveMobile, 7 TabletOptimized
- **Responsive hooks**: `useBreakpoint()`, `useIsMobile()`, `useIsTablet()`, `useOnlineStatus()` at `src/hooks/`
- **Mobile components** (9 files at `src/components/mobile/`):
  - `MobileMetricCard` — value + label + trend + color-coded accent, tappable with `whileTap` animation
  - `ExecutiveSummaryCard` — section wrapper with title and action link
  - `ApprovalQuickView` — expandable approval card with inline approve/reject/delegate/escalate/docs/audit actions
  - `MobileNotificationCenter` — notification list with type icons, priority grouping, deep links, quick actions, AnimatePresence
  - `QuickActionBar` — horizontal scrolling action buttons (approve/review/search/create/scan/notifications/recent)
  - `AdaptiveNavigation` — slide-out drawer navigation (phone only), spring animation, badge support
  - `TouchToolbar` — horizontal toolbar with swipe gesture support (configurable threshold)
  - `OfflineIndicator` — sticky offline banner with retry button, spring animation
  - `ConnectionStatus` — inline connection dot indicator (green/red/gray)
- **Mobile pages created**:
  - `/mobile-dashboard` — mobile-first executive dashboard with cash position, liquidity, pending approvals, critical alerts, treasury snapshot, workflow health, compliance, today's activity, quick actions
  - `/mobile/treasury` — mobile treasury with balance summary, FX rates, risk alerts, pending payments
- **App shell enhanced**:
  - Mobile bottom navigation bar (Overview/Approvals/Treasury/Alerts/Insights) with active state, safe-area-aware
  - `touch-target` CSS utility (44px min touch area)
  - `safe-bottom/safe-top/safe-left/safe-right` safe area utilities
  - `mobile-container` (max-width 640px) utility
  - `scrollbar-none` utility for scrollable mobile nav
- **Documentation**: `docs/design/executive-mobile-experience.md` — mobile philosophy, responsive guidelines (5 breakpoints), executive workflows, tablet guidelines, performance strategy (Lighthouse ≥95 targets), component architecture, accessibility, future extension points, business value assessment
- **Zero TypeScript errors, production build passes**

### Phase 8B.9 — Enterprise Accessibility & UX Polish
- **Skip navigation link** added to `app-shell.tsx` — WCAG 2.4.1 (Critical), hidden until focused via `sr-only/focus:not-sr-only`
- **33 orphaned form labels** fixed across 12 pages — added `htmlFor`/`id` pairs for screen reader association
- **25+ icon-only buttons** with missing `aria-label` fixed across 8 components (drill-down, notification-preview, animated-toast, smart-select, inline-edit, keyboard-shortcuts)
- **4 backdrop overlays** with keyboard support — added `role="button"`, `tabIndex`, and `onKeyDown` handlers
- **6 `window.confirm()`/`alert()` calls** replaced with reusable `<ConfirmDialog>` component (`role="alertdialog"`, focus trap, Escape handling)
- **Keyboard shortcuts** wired — `useKeyboardShortcuts()` now active in `app-shell.tsx`; `?` key opens `KeyboardShortcutsDialog`; Cmd+N/F/S registered
- **Landmark labels** — `aria-label` added to sidebar (Main sidebar), topbar (Top bar), mobile nav, bottom nav
- **Sheet component** — Added close button with `sr-only "Close"` text matching dialog pattern
- **Documentation**: `docs/design/ux-accessibility-audit.md` — findings, remediation, business value, future recommendations
- **Zero TypeScript errors, production build passes**

### Phase 13.0 — Agent Framework (Complete)
- **Prisma Models (14)**: `AgentDefinition`, `AgentCapability`, `AgentSession`, `AgentTask`, `AgentExecution`, `AgentDecision`, `AgentEvidence`, `AgentMemory`, `AgentHealth`, `AgentPermission`, `AgentConfiguration`, `AgentConversation`, `AgentDelegation`, `AgentAudit`
- **Migration**: `20260717040000_agent_framework` — 14 tables, 37 indexes (5 unique + 32 composite), 23 foreign keys
- **Services (11)**: AgentRegistry (12 methods), AgentRuntime (12), AgentContextEngine (10), AgentMemory (11), EvidenceEngine (8), DecisionEngine (11), ApprovalIntegration (8), CollaborationFramework (10), HumanInteraction (10), AgentGovernance (11), AgentService facade (10)
- **APIs (8 endpoint groups)**: `/api/agents` (GET/POST), `/api/agents/[id]` (GET/PUT/DELETE), `/api/agents/[id]/start` (POST), `/api/agents/[id]/stop` (POST), `/api/agents/[id]/decisions` (GET/POST), `/api/agents/[id]/tasks` (GET/POST), `/api/agents/[id]/memory` (GET/POST), `/api/agents/[id]/health` (GET)
- **UI Pages (9)**: dashboard, registry, health, decisions, sessions, tasks, memory, governance, configuration
- **Components (12)**: AgentListTable, AgentCard, AgentStatusBadge, AgentMetricCard, HealthPulseCard, AgentConversation, AgentConfigurationClient, AgentSessionsClient, AgentTasksClient, AgentGovernanceClient, DecisionListClient, MemoryExplorer
- **Types**: 560+ lines — 17 type unions, 9 input types, 4 query types, 4 relation types
- **Validation**: Zod schemas in `src/lib/validations/agent-framework.ts`
- **Documentation**: `docs/architecture/24-agent-framework.md` (architecture), `docs/architecture/25-agent-framework-extension-guide.md` (extension guide)
- **Navigation**: 10 entries in `nav-config.ts` under Bot icon group, requires ADMIN role
- **Zero TypeScript errors, production build passes**

## Next Steps

### Phase 7E (Complete — Enterprise Persistence Infrastructure)

#### 7E.1 — Persistence Foundation (Complete)
- `src/server/persistence/` — 42 files: domain types, errors, repository interfaces, transaction manager, pagination/filters/sorting abstractions, base/generic repositories, memory/postgres/mysql/sqlite adapters, registry, factory, unit-of-work, migration framework (engine, history, runner), schema versioning (version, compatibility), health monitor, diagnostics, barrel index
- 14 documentation files in `docs/persistence/`
- ✅ `pnpm typecheck`, `pnpm build`
- Zero ORM dependencies, zero database drivers, zero UI changes, zero business logic changes

#### 7E.2 — Prisma Repository Layer (Complete)
- 16 new Prisma models (`TreasuryCashPosition`, `TreasuryLiquidityPosition`, `TreasuryCashPool`, `TreasuryCashMovement`, `TreasuryCashForecast`, `TreasuryFundingRequest`, `TreasuryInvestmentBucket`, `TreasuryRestrictedCash`, `TreasuryWorkingCapital`, `TreasuryFXExposure`, `TreasuryCounterpartyRisk`, `TreasuryCashPolicy`, `TreasuryPolicy`, `TreasuryAlert`, `TreasurySnapshot`)
- `PrismaTreasuryRepository` implementing `TreasuryRepository` with full domain↔Prisma type mapping
- `prisma-repository-registry.ts`, migration `20260709152916_treasury_domain_repositories` (15 tables), `seed-treasury.ts` (deterministic mock data)
- ✅ `pnpm typecheck`, `pnpm build`

#### 7E.3 — Production Infrastructure (Complete)
- **Cache Layer** — `src/server/cache/`: `CacheManager` facade over LRU in-memory + Redis (ioredis); tiered TTL config (critical 5s → stale 600s); namespaced key builder (entity/query/aggregation/dashboard/metrics/forecast/permission/config/session); hit/miss/set/eviction tracking; typed event bus; graceful degradation on Redis failure
- **Distributed Locks** — `src/server/locks/`: `ILockManager` facade; in-memory + Redis-backed; hierarchical locking; exponential backoff retry; automatic lease renewal; `withLock` helper; `LockError`/`DeadlockError`/`LeaseExpiredError`/`OwnershipError` types
- **Queue Persistence** — `src/server/queues/`: FIFO/priority/delayed/scheduled queue types; worker pool with concurrency control; 8 default queues (sync/forecast/payment/notification/alert/metrics/audit/recommendation); dead-letter routing; `QueueManager` facade with `enqueueBatch`/`registerWorker`/`start`/`stop`
- **Observability** — `src/server/observability/`: `MetricsRegistry` with Counter/Gauge/Histogram; span-based tracing with ring buffer; `HealthRegistry` with 5 standard checks (cache/memory/uptime/queues/persistence)
- **Configuration** — `src/server/persistence/config.ts`: typed `InfrastructureConfig` for all layers; env variable loading (`CACHE_PROVIDER`/`REDIS_HOST`/`LOCK_PROVIDER`/`PERSISTENCE_PROVIDER`); deep merge; programmatic API
- **Infrastructure Facade** — `src/server/infrastructure.ts`: `initializeInfrastructure()` / `shutdownInfrastructure()` / `checkInfrastructureHealth()`
- 8 documentation files in `docs/infrastructure/` (cache-architecture, distributed-locks, queue-persistence, observability, configuration, performance-benchmarking, integration-guide, index)
- ✅ `pnpm typecheck`, `pnpm build` — zero errors

### Phase 7F (Complete — Enterprise Production Readiness Platform)
- `src/testing/` — 18 test suites across 15 categories: unit, integration, repository, service, API, component, infrastructure, smoke, regression, golden snapshot, contract, E2E, benchmark, load, stress, chaos; mock factories, seed factories, fixtures, data builders, repo comparator, vitest config (85% coverage threshold)
- `src/server/security/` — Secrets/env validation, CSP/HSTS/security headers, rate limiting, CSRF (`validateOrigin`), input sanitization, AES-256-GCM encryption + key rotation, security audit logging, dependency scanner
- `src/server/recovery/` — Backup manager, restore manager, snapshot manager, recovery validator/drills, recovery metrics
- `src/server/ha/` — Health/readiness/liveness endpoints, graceful shutdown/startup, connection draining, circuit breaker, auto-reconnect
- `Dockerfile` (multi-stage), `docker-compose` (dev + prod), `k8s/` (deploy, ingress, secrets, ConfigMap, HPA, PDB, network policies, PVC)
- `.github/workflows/ci.yml` + `deploy.yml` — typecheck, lint, test, build, security scan, dependency audit, migration verify, deploy, rollback
- `src/server/observability/` — 8 metric domains, Prometheus exporter, structured JSON logger, OpenTelemetry bridge
- `docs/operations/` — 8 runbooks (deploy, rollback, recovery, monitoring, scaling, maintenance, oncall, checklist)
- `docs/compliance/` — SOC 2, ISO 27001, PCI DSS, GDPR readiness
- `docs/testing/`, `docs/security/`, `docs/deployment/`, `docs/recovery/`, `docs/monitoring/`, `docs/release/`
- Zero UI changes, zero dashboard changes, zero business logic changes, zero breaking changes
- ✅ `pnpm typecheck`, `pnpm build`

### Version 1.0 Milestone (Complete)
- `docs/releases/v1.0-platform-core.md` — platform metadata, completion phases, statistics
- `docs/architecture/architecture-freeze-v1.md` — 15 frozen architecture components, change management policy
- `VERSION` — `v1.0.0`
- `src/version.ts` — platformVersion, releaseName, releaseDate, buildNumber, architectureVersion
- `docs/releases/release-notes-v1.0.md` — major capabilities, infrastructure, roadmap
- `README.md` — platform status badge with version and completion marks
- `src/modules/crm/` — CRM module (types, service, seed data) for 3 LinkedIn contacts with interaction history and strategic advisor flags
- ✅ `pnpm typecheck`, `pnpm build`

### Phase 11B — Enterprise Installation & Deployment Platform (Complete)
- `src/server/installer/` — 16 files: types, installation engine, validator, env validator, prerequisite checker, migration runner, seed manager, rollback manager, company bootstrap, admin bootstrap, health validator, backup manager, upgrade manager, installation report, facade, barrel
- `src/cli/` — 8 files: CLI entry with 11 commands (install, validate, migrate, seed, backup, restore, upgrade, doctor, health, version)
- Pages: `/system/deployment` (deployment dashboard), `/setup` (10-step installation wizard)
- Docker: improved Dockerfile with healthcheck, docker-entrypoint.sh, docker-compose with logging/volumes
- Kubernetes: migration Job, updated ConfigMap with feature flags
- `docs/deployment/` — 11 docs (installation, production, docker, k8s, upgrade, rollback, DR, troubleshooting, ops manual, admin guide, index)
- `docs/deployment/phase-report.md` — full phase report
- ✅ `pnpm typecheck`, `pnpm build`

### Phase 11C — Enterprise Identity & Access Management (Complete)
- `src/server/identity/` — 13 files: types, identity provider manager, authentication service, session manager, user provisioning, group manager, role manager, permission manager, policy engine, audit service, SSO handler, facade, barrel
- Pages: `/system/identity/` — 9 pages (dashboard, users, groups, roles, permissions, providers, sessions, audit, policies)
- `docs/identity/` — 12 docs (architecture, authentication, authorization, RBAC, ABAC, SSO, SAML, OIDC, security, developer guide, admin guide, index)
- `docs/identity/phase-report.md` — full phase report
- ✅ `pnpm typecheck`, `pnpm build`

### Phase 16.0 — Enterprise Security Audit (Complete)
- 23 specialist audit agents across 5 parallel waves
- 295 total findings: 23 Critical, 58 High, 107 Medium, 62 Low, 45 Info
- OWASP Top 10 Score: 6.0/10 — Partially Compliant (7/10 categories)
- Architecture Security Score: 5.5/10
- Compliance Readiness: SOC 2 52%, PCI DSS 25%, GDPR 62%, ISO 27001 45%
- **15 audit deliverable documents** at `docs/security/`:
  - `ENTERPRISE_SECURITY_AUDIT.md` — Master report with all findings, OWASP compliance, remediation priority
  - `AUTHENTICATION_AUDIT.md` — 16 findings (no MFA, in-memory identity, password comparison fail-open)
  - `AUTHORIZATION_AUDIT.md` — 14 findings (CRM IDOR, API keys hardcoded ADMIN, Owner bypass)
  - `MULTI_TENANCY_AUDIT.md` — 9 findings (workflow engine cross-tenant, cache tenant isolation)
  - `DATABASE_SECURITY_AUDIT.md` — 23 findings (SQL via $queryRawUnsafe, Float precision, N+1 queries)
  - `API_SECURITY_AUDIT.md` — 30 findings (health endpoint info leak, unauthenticated data exposure)
  - `INPUT_VALIDATION_AUDIT.md` — 20 findings (missing Zod on admin routes, command injection, path traversal)
  - `INFRASTRUCTURE_SECURITY_AUDIT.md` — 108 findings (K8s secrets plaintext, Docker exposed ports, CSP gaps)
  - `AI_SECURITY_AUDIT.md` — 17 findings (unvalidated AI proxy, prompt injection, PII leakage)
  - `APPLICATION_SECURITY_AUDIT.md` — 110 findings (CSRF bypass, workflow approval no authz, broken webhooks)
  - `FINANCIAL_INTEGRITY_AUDIT.md` — 25 findings (reconciliation race, idempotency not wired, Float fields)
  - `OWASP_COMPLIANCE_REPORT.md` — OWASP Top 10 (2021) assessment per category
  - `COMPLIANCE_READINESS.md` — SOC 2, PCI DSS, GDPR, ISO 27001 readiness
  - `ENTERPRISE_ARCHITECTURE_REVIEW.md` — 10 architecture domains assessed
  - `SECURITY_REMEDIATION_PLAN.md` — 4-phase roadmap (P0: Week 1-2, P1: Month 1-2, P2: Month 2-4, P3: Month 4-8)
- **Key Strengths**: AES-256-GCM encryption, tamper-evident audit chains, RBAC+ABAC, Prisma parameterized queries, zero dangerouslySetInnerHTML, zero eval()
- **Key Gaps**: No MFA, CSRF origin bypass, SSRF on webhooks, fail-open auth, no body size limits, empty dependency scanner
- Zero code changes — documentation only, zero TypeScript errors

### Phase 17.0 — Security Findings Validation (Complete)
- Validated all 81 Critical + High findings against source code
- Confirmed 24 unique root causes (8 Critical, 16 High)
- Zero false positives — every finding is real
- Source files verified: 23 files across security, auth, workflow, CRM, webhooks, K8s

### Phase 17.1 — P0 Security Remediation (Complete)
- 5 P0 findings resolved with before/after evidence
- CSRF Origin Bypass — `validateOrigin(req, !!token)` rejects missing Origin for session-auth
- Workflow Approval No Authz — role + status checks before granting approval
- CRM Missing Tenant Isolation — `companyId` in all 17 CRM methods
- K8s Secrets — all replaced with `REPLACE_ME`, `.gitignore` protection
- Session Fail-Open — 30s in-memory revocation cache on DB failure
- 24/24 P0-specific tests pass, typecheck pass, build pass

### Phase 17.2 — Enterprise Security Completion (Complete)
- **Multi-Factor Authentication**: TOTP-based MFA with 10 SHA-256-hashed recovery codes, enrollment/confirm/verify/disable flows, timing-safe comparison, ±1 clock skew window, rate limiting, audit logging. Prisma fields: mfaEnabled, mfaSecret, mfaRecoveryCodes, mfaEnrolledAt, mfaLastVerifiedAt, mfaRequired. API: POST/GET /api/auth/mfa.
- **Password Comparison**: Identity adapter (`local.ts`) verified fail-closed (throws "Invalid credentials"). Updated to check MFA status from DB and set `mfaRequired` flag.
- **Body Size Limits**: `parseJsonBody()` now checks `Content-Length` header before `request.json()`. 1MB default, 10MB hard cap. Returns 413 on oversized.
- **Information Disclosure**: Health endpoint returns only `{ status, ready, live }` (no DB errors, memory, uptime, Node version). Cache headers changed from `public` to `private`. Error messages sanitized: RBAC (generic), approval workflow (no type/amount/role), workflow engine (no step status/roles), ledger (no wallet/company ID), user changePassword (generic).
- **Tenant Isolation**: `relationship-intelligence.service.ts` — all 11 methods now require `companyId` parameter. PainPoint/VoC/DiscoverySession queries join through Contact for company scoping. 3 API routes updated.
- **Dependency Security**: `DependencyScanner` rewritten to run `pnpm audit --json` with structured results. CI `security` job now fails on `--audit-level=high` (no `|| true`). `dependency-audit` job generates JSON artifact.
- **Webhook SSRF**: URL validation blocks `file:`, `ftp:`, private IPs (10.x, 172.16-31.x, 192.168.x), cloud metadata (169.254.169.254). 10s fetch timeout. Max 5 retry attempts.
- **Rate Limiter**: Memory leak fixed — 60s periodic cleanup, 100K max entries, 10% evictions on capacity.
- **Credentials**: Demo password generated per bootstrap (24-char random). Sandbox password derived from HMAC(server_secret, email) — deterministic but not guessable, no plaintext export.
- **K8s Hardening**: Network policy restricted to `ingress-nginx` namespace. Ingress adds rate limiting (50 rps, 20 connections), security headers (HSTS, X-Content-Type-Options, X-Frame-Options), DNS egress.
- **5 documentation files**: MFA_ARCHITECTURE.md, ERROR_HANDLING_STRATEGY.md, DEPENDENCY_SECURITY.md, SESSION_SECURITY_REVIEW.md, SECURITY_COMPLETION_REPORT.md
- Zero Critical findings remaining. 3 deferred High (P3): Docker port exposure, webhook optional signature, DDoS protection.
- TypeScript passes. Production build passes. Zero regressions.

### Phase 18.0 — Enterprise Architecture Consolidation (Complete)
- **Scope**: Full architectural inventory of 64 modules, 402 API routes, 33 global singletons
- **Workflow Engine**: DUPLICATE — two engines (`workflow/engine.ts` singleton vs `orchestration/workflow-engine.ts` static). Different Prisma tables. Recommend deprecating orchestration engine.
- **Event Buses**: 6 independent implementations with identical `Map<EventType, Set<Handler>>` architecture. Recommend consolidating to 3 (enterprise, connector, cache).
- **Currency Services**: DUPLICATE — `CurrencyService` and `FxService` have identical FALLBACK_RATES and conversion logic. 19 formatCurrency implementations (14 in investment components alone). 3 SUPPORTED_CURRENCIES sets (3, 12, 34 currencies). Recommend merging into single currency service.
- **Logger**: DUPLICATE — Pino (60+ consumers) vs StructuredLogger (~10 consumers). Recommend migrating to Pino.
- **Permission Registry**: CONFLICT — `permission-registry.ts` (24 permissions) vs `iam/permissions.ts` (60 permissions). Recommend deleting permission-registry.ts.
- **Queues**: 3 systems — PgBoss (production), MemoryQueue (unused scaffolding), Banking queues (domain-specific). PgBoss is authoritative.
- **Cache**: Two access patterns — `getCached()` (primary) vs `CacheManager` (infrastructure). Two key builders. Recommend consolidating key builders.
- **AI Architecture**: 7 providers, 22 models, clean provider layer. ONE rogue route (`automation-studio/ai/route.ts`) bypasses ai-provider with raw fetch to Gemini.
- **Dead Code**: `src/server/identity/` (13 files, zero consumers).
- **8 deliverable documents**: ENTERPRISE_ARCHITECTURE_REPORT.md, PLATFORM_PRIMITIVES.md, ENTERPRISE_DOMAIN_MODEL.md, MODULE_RESPONSIBILITY_MATRIX.md, DEPENDENCY_ANALYSIS.md, API_STANDARDS.md, ARCHITECTURE_DECISION_SUMMARY.md, ARCHITECTURE_CONSOLIDATION_PLAN.md
- **16 consolidation actions** prioritized across 4 phases (P0: dead code deletion, P1: service merges, P2: infrastructure consolidation, P3: large refactors)
- TypeScript passes. Production build passes. Zero regressions.

### Phase 18.1A — Enterprise Architecture Consolidation (Safe Removals) (Complete)
- **Scope**: Remove verified dead code and resolve architectural noise from Phase 18.0 inventory
- **Deletions (11 files)**:
  - `src/modules/enterprise-intelligence/event-bus.ts` — EnterpriseEventBus (0 subscribers, 1 producer)
  - `src/modules/orchestration/internal-event-bus.ts` — Internal EventBus (0 subscribers, 4 producers)
  - `src/server/integrations/event-bus.ts` — Integrations EventBus (0 subscribers, 0 producers)
  - `src/server/banking/events/event-bus.ts` + `index.ts` — BankingEventBus (0 subscribers, 6 producers)
  - `src/server/cache-enhanced/` (3 files) — CacheManager scaffolding (0 consumers)
  - `src/server/queues/` (3 files) — MemoryQueue scaffolding (replaced by PgBoss)
- **Renames (1 class, 6 files)**:
  - `WorkflowEngine` → `OrchestrationExecutionEngine` in orchestration module — eliminates naming collision with primary `WorkflowEngine`
- **No-ops (8 files)**:
  - `emitIntegrationDomainEvent()` — 22 call sites preserved, no-op body
  - `IntegrationFacade.emitEvent/onEvent/offEvent/getEventHistory` — 5 methods preserved, no-op body
  - `emitConnectionEvent()` in connection-manager — no-op body
  - Alert evaluators for queues — no-op return
  - Queue health checks — "PgBoss managed externally" message
- **Infrastructure cleanup**: infrastructure.ts (removed queue init/shutdown/health), health-manager.ts (simplified queue health), alert-manager.ts (no-op evaluators), observability/health-checks.ts (removed registerQueueHealth)
- **BLOCKED**: `src/server/identity/` — 9 page consumers in `src/app/(shell)/system/identity/`, cannot delete
- **Deliverable**: `docs/architecture/EDP_18_1A.md` — full engineering decision packet
- **Metrics**: 7 event buses → 2, 2 queue systems → 1, 2 cache patterns → 1, 1 naming collision → 0
- TypeScript passes. Production build passes. Zero regressions.

### Phase 18.1B — Enterprise Platform Primitive Consolidation (Complete)
- **Logger consolidation**: Migrated 7 StructuredLogger consumers (all `src/server/` infrastructure) to Pino. Deleted StructuredLogger class (50-line hand-rolled console.log wrapper). Deleted unused `logWithCorrelation`, `CorrelationMiddleware`, `LogEntry` type. Pino provides built-in redaction of auth/cookie/password/secret fields, log level filtering, and proper Error serialization — security improvements.
- **Permission registry consolidation**: Admin permissions endpoint (`/api/v1/admin/permissions`) now returns IAM PermissionRegistry data (64 permissions with scopes + MFA flags) instead of legacy array (24 permissions, no metadata). Added 10 missing permissions to IAM: `approvals.request`, `admin.approvals`, `admin.authorities`, `agents.manage`, `agents.view`, `crm.view`, `crm.manage`, `crm.delete`, `crm.seed`. Legacy registry preserved for Prisma RBAC compatibility (100+ API routes).
- **AI provider bypass fix**: Rewrote `automation-studio/ai/route.ts` from raw `fetch()` to Gemini v1beta to `promptExecutionService.execute()`. Now has: retry (3x exponential backoff), rate limiting (token-bucket), health monitoring, usage tracking (Prisma), system prompts, response normalization, provider selection, cost estimation. Converts Gemini `contents` format to `ChatMessage[]` for backward compatibility.
- **Documentation**: LOGGER_ARCHITECTURE.md, PERMISSION_MODEL.md, AI_PLATFORM_ARCHITECTURE.md, PLATFORM_OWNERSHIP_MATRIX.md, EDP_18_1B.md
- **Brain**: Lesson 25 (one implementation per primitive), Principle #2 in Decision Network, evolution timeline entry
- TypeScript passes. Production build passes. Zero regressions.

### Phase 19.0 — Financial Core Consolidation (Complete)
- **Financial Integrity Inventory**: Complete inventory of every financial implementation across the codebase
- **Key Findings**: CurrencyService/FxService near-duplicate (different APIs, different fallback ordering), 100+ formatCurrency implementations (mostly USD-only), 4 conflicting SUPPORTED_CURRENCIES definitions, no Money value object, native number arithmetic in GL allocation/cash application/tax/statement builders, 4 Prisma Float fields storing monetary values
- **Deliverables**: FINANCIAL_INTEGRITY_INVENTORY.md, FINANCIAL_PLATFORM_REPORT.md, MONEY_ARCHITECTURE.md, CURRENCY_ARCHITECTURE.md, FINANCIAL_PRECISION_POLICY.md, FINANCIAL_FORMATTING_STANDARD.md, FINANCIAL_PRIMITIVES.md, FINANCIAL_CONSOLIDATION_PLAN.md
- **Brain**: Lesson 26 (financial precision is non-negotiable), Principle #3 in Decision Network, evolution timeline entry
- **No code changes** — documentation only, zero TypeScript errors

### Phase 19.1 — Financial Foundation Implementation (Complete)
- **Financial Precision Helpers**: Created `src/lib/financial-precision.ts` with 13 exported functions: `financialRound` (banker's rounding via `Intl.NumberFormat`), `toDecimal` (safe conversion), `sumDecimals` (safe aggregation), `multiplyDecimals`, `divideDecimals`, `allocateAmount` (with residual handling), `calculateTax`, `calculateWithholding`, `toDisplayNumber`, `formatDecimalCurrency`, `formatDecimalCompact`, `decimalEquals`, `isValidMonetaryAmount`
- **P0 Float→Decimal Migration**: Migrated 4 Prisma Float monetary fields to `Decimal @db.Decimal(20,4)`: `MorningBriefing.pendingApprovalAmount`, `MorningBriefing.cashPosition`, `MorningBriefing.cashChange`, `ApprovalMatrixRule.thresholdValue`. Created migration `20260721000000_financial_integrity_float_to_decimal`. Updated 10 files (types, services, persistence, evaluator, validation, UI).
- **P1 GL Allocation Residual Handling**: Added residual handling to `AllocationService.executeRule()` — last target receives `total - sum(previous)`, all amounts rounded with `financialRound(2)`.
- **P1 Cash Application**: Replaced raw accumulation with `financialRound()` at each step to prevent phantom unallocated amounts.
- **P1 Tax Integration**: Replaced all `Math.round(n * 100) / 100` with `financialRound(n, 2)` for banker's rounding consistency.
- **P1 Morning Briefing Computation**: Replaced native `reduce()` sum with `sumDecimals()`, replaced `Number()` aggregate conversion with `toDecimal().toNumber()`.
- **Documentation**: EDP_19_1.md, FINANCIAL_INTEGRITY_IMPLEMENTATION.md
- TypeScript passes. Production build passes. Zero regressions.

### Phase 20.0 — Enterprise Workflow Validation (Complete)
- **Scope**: First product-level evaluation of Perionyx (not codebase-level). Evaluated 14 core workflows, 10 personas, 291 constitutional principles across 10 constitution documents.
- **Key Findings**: Average workflow trust score 6.4/10. Experience Constitution compliance 4.8/10. Only 3 of 14 workflows production-ready (Bank Reconciliation, Order-to-Cash, Risk Alert Handling). Average persona coverage 6.2/10. 25 friction issues identified (4 critical, 8 high, 8 medium, 5 low). Product readiness 3.34/5 (67%).
- **Deliverables (7)**: `docs/validation/WORKFLOW_VALIDATION_REPORT.md` (14 workflows, 6 questions each, 12 dimensions), `docs/validation/PERSONA_VALIDATION_REPORT.md` (10 personas with objectives, decisions, evidence, stress points), `docs/validation/WORKFLOW_FRICTION_ANALYSIS.md` (25 issues ranked), `docs/validation/EXECUTIVE_USABILITY_REVIEW.md` (trust assessment, readiness matrix, competitive position), `docs/validation/WORKFLOW_SCORECARD.md` (scoring across all dimensions), `docs/validation/PRODUCT_READINESS_ASSESSMENT.md` (8 assessment areas, 20 gaps, 36-week timeline), `docs/validation/PHASE20_RECOMMENDATIONS.md` (25 recommendations across 4 tiers).
- **Critical Findings**: Dual GL architecture creates confusion. In-memory data stores mean workflows reset on restart. No end-to-end workflow wiring (CRM → Invoice → Payment doesn't actually work). Experience Constitution compliance too low for customer-facing use.
- **Verdict**: "A-grade building blocks assembled into a B-minus product." Ready for internal demo. Not ready for production or enterprise customers.
- **Brain**: Lesson 28 (modules are not workflows), Principle #5 in Decision Network, evolution timeline entry, customer discovery pain points, product roadmap impact.
- **Zero code changes — documentation only.**

### Phase 21.0 — Accounts Payable Capability Inventory (Complete)
- **Scope**: Comprehensive AP domain inventory against 14-stage enterprise procure-to-pay workflow
- **Key Finding**: AP has extensive scaffolding (11 pages, 12 services, 20 components, 5,716 seeded records) but zero runtime functionality — zero Prisma models, zero API routes, zero mutation methods
- **AP Manager Persona**: 5/10 — joint-lowest of all 10 personas. Cannot perform any core task.
- **Enterprise Readiness**: 3.7% → 98.5% target post-Phase 21
- **Matching Engine**: `InvoiceMatchingService` has correct 2-way/3-way matching (126 lines) but hardcoded tolerance, no persistence, no UI trigger
- **GL Integration**: `GLIntegrationService` generates correct debit/credit entries but is never called
- **17 Feature Gaps**: Duplicate detection, payment scheduling, OCR, vendor portal, tolerance rules, exception management, multi-currency, withholding tax, partial payments, split allocations, recurring invoices, blocked invoices, budget check, vendor credit notes, audit timeline, explainability, GRN automation
- **4-Phase Implementation Plan**: 21A Foundation (Prisma + API, 3-4w), 21B Core Workflow (Match + Approve + Pay, 2-3w), 21C Intelligence (Exception + Duplicate + Analytics, 2w), 21D Hardening (Reconciliation + Audit + Safety, 1-2w). Total: 8-11 weeks
- **Deliverables**: 6 documents at `docs/ap/` — GAP_ANALYSIS, WORKFLOW, IMPLEMENTATION_PLAN, PERSONA_REVIEW, ENTERPRISE_SCORECARD, PHASE21_DECISION_PACKET
- **Brain**: Lesson 32 (Domain Scaffolding Is Not Domain Functionality), Principle #8 in Decision Network, evolution timeline entry

### Phase 21A.0 — AP Domain Architecture (Complete)
- **Scope**: Complete domain modeling for AP bounded context — 10 deliverables, ~8,000+ lines, zero code
- **Domain Model**: 25 entities, 18 value objects, ER diagram, data flows
- **Aggregates**: 11 aggregate roots (VendorInvoice central; PO/GRN as references only)
- **State Machines**: 12 machines — Invoice (12 states, 23 transitions), Payment (7 states), Approval (7 states per level)
- **Domain Events**: 63 events across 10 categories (Vendor, Invoice, Match, Exception, Approval, Payment, Reconciliation, Credit, Budget, System)
- **Commands/Queries**: 51 commands, 18 queries (CQRS pattern)
- **Invariants**: 137 business rules across 8 categories (Financial 27, State Transition 25, Authorization 21, Temporal 12, Data Integrity 20, Audit 11, Multi-Tenancy 8, Process 13)
- **Integrations**: 10 integration points (GL journal entries, Treasury dual-signature, Approval Matrix thresholds, Notifications, Budget checks, AI duplicate/coding, Audit trail)
- **Permissions**: 8 roles × 51 commands, 12 SoD rules, 9 threshold tiers ($1K/$10K/$50K/$250K)
- **10 Design Decisions**: Invoice as central aggregate, append-only audit, idempotent payments, Decimal(38,12), typed function events, CQRS same-database, separate ThreeWayMatch, Proposal/Batch separation, reusable ApprovalChain, 8-role RBAC
- **Deliverables**: 11 documents at `docs/ap/` — DOMAIN_ARCHITECTURE, DOMAIN_MODEL, AGGREGATES, STATE_MACHINES, DOMAIN_EVENTS, COMMAND_QUERY_MODEL, DOMAIN_INVARIANTS, INTEGRATION_ARCHITECTURE, PERMISSION_MATRIX, EDP_21A_0, DATABASE_DECISIONS
- **Brain**: Lesson 33 (Domain Architecture Design Precedes Implementation), Principle #9 in Decision Network, evolution timeline entry

### Phase 21A.1 — AP Prisma Models (Complete)
- **Scope**: 25 Prisma models for the AP bounded context — `Procurement` prefix, zero changes to existing models
- **Schema Growth**: 349 models / 9,764 lines → 374 models / 11,390 lines (+25 models, +1,626 lines)
- **Enums**: 33 new Prisma enums (VendorStatus, InvoiceStatus, MatchStatus, PaymentMethod, etc.)
- **Indexes**: ~79 total (25 tenant isolation + 37 performance + 17 unique constraints)
- **Foreign Keys**: ~40 constraints, all `onDelete: Restrict`
- **Money**: All monetary fields `Decimal(38,12)`, ~96 Decimal fields across 6 precision tiers
- **Concurrency**: Optimistic locking (`version Int @default(0)`) on 12 aggregate roots
- **Audit**: Append-only `ProcurementAPAuditRecord` — no update/delete allowed
- **Value Objects**: 18 domain VOs embedded as fields (not tables) — Money, TaxRate, PaymentTerms, Address, etc.
- **Entity Classification**: 12 Aggregate Roots + 10 Child Entities + 2 Reference Entities (PO/GRN) + 1 Audit Entity
- **Deliverables**: 5 documents at `docs/ap/` — PRISMA_MODELS, DATABASE_SCHEMA, DATABASE_DECISIONS, ER_DIAGRAM_V2, EDP_21A_1
- **Validation**: `prisma validate` PASS, `pnpm typecheck` PASS, zero breaking changes
- **Brain**: Lesson 34 (Entity Classification Prevents Over-Schema), Principle #10 in Decision Network, evolution timeline entry

### Phase 21A.2 — AP Application Layer (Complete)
- **Scope**: Application services, domain events, unit of work, repository registry
- **Files Created**: 13 new TypeScript files (~5,934 lines)
- **Application Services (7)**: VendorService (8 commands), InvoiceService (15), ExceptionService (6), ApprovalService (6), PaymentService (9), ReconciliationService (4), CreditService (3) = 51 total commands
- **Infrastructure**: APDomainEventBus (in-process typed event bus), UnitOfWork (Prisma interactive transactions), CommandResult type with events + audit entries
- **Repository Layer**: 22 files in ap-repositories/ — 10 interfaces, 10 InMemory, 10 Prisma adapters, registry
- **Domain Events**: 63 typed events across 7 categories
- **Deliverables**: 6 documents at `docs/ap/` — AP_APPLICATION_SERVICES, AP_REPOSITORY_ARCHITECTURE, AP_TRANSACTION_BOUNDARIES, AP_DOMAIN_EVENT_FLOW, AP_COMMAND_EXECUTION_MODEL, EDP_21A_2
- **Validation**: `pnpm typecheck` PASS, zero TypeScript errors
- **Brain**: Lesson 35 (Command Handlers Encode Business Rules, Not Infrastructure), Principle #11 in Decision Network, evolution timeline entry

### Phase 21A.3 — AP Enterprise API Layer (Complete)
- **Scope**: 65 REST endpoints, 37 permissions, 40+ Zod schemas, idempotency, enterprise error contract
- **Endpoints**: vendors (10), invoices (12), three-way matching (6), exceptions (6), approvals (6), payments (8), reconciliation (5), credit notes (5), reports (4), dashboard (3)
- **Middleware**: Idempotency (x-idempotency-key, 24h TTL), tenant isolation, correlation ID
- **Tests**: 52 API endpoint tests — all passing
- **Deliverables**: 5 documents at `docs/ap/` — AP_API_ARCHITECTURE, AP_ENDPOINT_CATALOG, AP_PERMISSION_MAPPING, AP_API_SECURITY, AP_API_TEST_REPORT, EDP_21A_3
- **Validation**: `pnpm typecheck` PASS, `pnpm vitest test/procurement/ap-api.test.ts` 52/52 PASS
- **Brain**: Lesson 36 (API Contracts Encode Domain Boundaries), Principle #12 in Decision Network, evolution timeline entry

### Phase 21A.4 — AP Workflow Execution & Integration (Complete)
- **Scope**: 87 integration tests validating all 16 AP workflows + 4 cross-cutting categories
- **Workflows Validated**: Vendor onboarding (6), vendor maintenance (8), invoice receipt (7), invoice validation (3), duplicate detection (2), three-way matching (2), exception handling (7), approval routing (6), payment proposal (5), treasury approval (2), payment execution (7), GL posting flags (1), vendor credit (6), reconciliation (5), month-end close (2), audit trail (3)
- **Cross-Cutting**: Event bus (3), financial precision (2), concurrency (2), failure recovery (8)
- **Happy Path E2E**: vendor onboard → invoice → validate → three-way match → approve → payment proposal → review → treasury approve → batch → execute → confirm → final state verified
- **Bugs Found & Fixed**: (1) Approval cascade — SKIPPED records treated as approved in `approveLevel()`, preventing multi-level chain cascading. Fix: removed SKIPPED from `allApproved` check. (2) Credit void — FULLY_APPLIED status not in VOIDABLE_STATUSES. Fix: added to void check.
- **Tests**: 87 workflow + 52 API = 139/139 passing, TypeScript clean
- **Deliverables**: 9 documents at `docs/ap/` — AP_WORKFLOW_EXECUTION_REPORT, AP_END_TO_END_VALIDATION, AP_EVENT_VALIDATION, AP_PERMISSION_VALIDATION, AP_FINANCIAL_INTEGRITY_REPORT, AP_CONCURRENCY_REPORT, AP_FAILURE_RECOVERY_REPORT, AP_WORKFLOW_SCORECARD, EDP_21A_4
- **Brain**: Lesson 37 (Integration Tests Catch Interaction Bugs That Unit Tests Miss), Principle #13 in Decision Network, evolution timeline entry

### Phase 21B.2 — Enterprise AP Seed Data System (Complete)
- **Scope**: Deterministic seed data generator producing ~28,000 records across 10 AP aggregate types
- **Files Created**: 10 generator files in `src/server/procurement/seeds/` (~2,450 lines)
- **Data Volumes**: 158 vendors, 3,527 invoices, 612 approvals, 358 exceptions, 250 proposals, 120 batches, 649 payment records, 130 credits, 40 statements (496 lines), 40 reconciliation results, 21,800 audit records
- **Key Decisions**: mulberry32 deterministic PRNG, per-generator seeds, dependency-ordered generation, count thresholds for idempotent re-runs
- **Bugs Found**: 5 schema inconsistencies caught during generation (invalid enum values, missing required fields, type mismatches)
- **Deliverables**: `docs/ap/PHASE_21B_2_SEED_DATA.md`, `docs/ap/EDP_21B_2.md`
- **Brain**: Lesson 39 (Deterministic Seed Data Reveals Integration Gaps), Principle #15 in Decision Network, evolution timeline entry

### Phase 22.0A — Public Platform Architecture (Complete)
- **Scope**: 25 documents defining the complete public-facing website architecture — zero code, all design
- **Documents**: WEBSITE_INFORMATION_ARCHITECTURE, SITE_MAP (97 URLs), PAGE_HIERARCHY (71 pages), NAVIGATION_MODEL (global nav + mega menus + mobile + footer + Cmd+K), CONTENT_STRATEGY (6 pillars), CONTENT_GOVERNANCE (RACI), PUBLIC_CONTENT_POLICY (CAN/CANNOT publish), SEO_STRATEGY, KEYWORD_STRATEGY (60+ keywords), DESIGN_LANGUAGE (PEDL extension), BRANDING_GUIDELINES, VISUAL_DIRECTION (hero concepts + scroll behaviors), MOTION_SYSTEM (page-level + component-level specs), ILLUSTRATION_GUIDE (diagram style, no stock), ICONOGRAPHY_GUIDE (Lucide + custom product icons), ACCESSIBILITY_GUIDE (WCAG 2.1 AA), COPYWRITING_GUIDE (voice pillars + headline formulas), MICROCOPY_GUIDE (buttons, forms, validation, tooltips), CALL_TO_ACTION_STRATEGY (hierarchy + placement + A/B tests), USER_JOURNEYS (8 persona journeys), COMPETITOR_WEBSITE_ANALYSIS (8 competitors), REFERENCE_EXPERIENCE (curated web inspirations), CONTENT_BRIEFS (10 priority page briefs), WEBSITE_ROADMAP (5-phase, 16-week plan), EDP_22_0A (10 key decisions)
- **Key Decisions**: Brain is source of truth (website = curated public view), dark-first (#040404) + gold accent (#d4af37), no stock imagery, Inter + JetBrains Mono, WCAG 2.1 AA, 97 URLs across 9 sections, 16-week phased rollout
- **Brain**: Lesson 38 (Brain→Public Content Pipeline), Principle #14 in Decision Network, evolution timeline entry

### Phase 22.0B — Enterprise Design Language (EDL) Foundation (Complete)
- **Scope**: Canonical visual operating system — 8 token files, 16 documentation files
- **Design Audit Findings**: 4 background palettes, 3 gold hex codes, 6 font stacks, 3 motion systems, 6+ card patterns, 2 parallel component libraries, status colors in 3 locations
- **Token Files** (8): `src/design-system/edl/colors.ts` (brand, surfaces, text, borders, status, financial, risk, charts, AI, shadows, elevation), `typography.ts` (Inter + JetBrains Mono, 14-size scale), `spacing.ts` (4px base, semantic layout), `radius.ts` (8 values), `motion.ts` (durations, easings, variants, reduced-motion), `z-index.ts` (14 levels), `icons.ts` (sizes, strokes, feature map), `components.ts` (Button, Card, Input, Badge, Table, Dialog, Toast, Tooltip, Skeleton presets), `index.ts` (barrel)
- **Documentation** (16): ENTERPRISE_DESIGN_LANGUAGE, DESIGN_PRINCIPLES (8 principles), VISUAL_IDENTITY, COLOR_SYSTEM, TYPOGRAPHY_SYSTEM, SPACING_SYSTEM, LAYOUT_SYSTEM, MOTION_SYSTEM, ICONOGRAPHY, ILLUSTRATION_SYSTEM, ACCESSIBILITY_SYSTEM, RESPONSIVE_SYSTEM, COMPONENT_PRINCIPLES, TOKEN_ARCHITECTURE, BRAND_GUIDELINES, EDP_22_0B
- **Key Decisions**: `#0a0a0f` canonical base, `#d4af37` canonical gold, Inter + JetBrains Mono, 4px spacing, no spring physics, legacy tokens deprecated not deleted
- **Brain**: Lesson 40 (Design Language Is Infrastructure), Principle #16 in Decision Network, evolution timeline entry

### Phase 22.0B.1 — EDL Token Migration (Complete)
- **Scope**: Migrated ~470+ files from hardcoded values to EDL tokens
- **Legacy gold eliminated**: ~88 files #c9a84c→#d4af37; ~20+ files #d4a843→#d4af37
- **Wrong surfaces fixed**: ~35 files #101010→#111118; ~94 files #1a1a1a→#1a1a24; ~104 files #1a1a2e→#1a1a24
- **Tailwind arbitrary replaced**: 17 files gold arbitrary→EDL utilities; 120+ files status arbitrary→EDL utilities
- **Legacy motion tokens rewritten**: `src/components/enterprise/motion/tokens.ts` now re-exports from EDL; 35 consumers unchanged
- **Legacy design-system barrel updated**: `src/components/design-system/index.ts` now exports from EDL canonical sources
- **virtualized-table.tsx fully rewritten**: 25 hardcoded values replaced with EDL tokens
- **z-index fixes**: `z-[11]`→`z-[10]`, `z-[200]`→`z-toast`
- **Brain**: Lesson 40 updated, Principle #16, evolution timeline entry

### Phase 22.0B.5 — Enterprise Design Governance & Compliance (Complete)
- **Scope**: Automated enforcement of EDL through tooling — 12 ESLint rules, 5 CI scripts, auto-fixer, VS Code integration
- **Governance Tooling** (`tools/design-governance/`): constants.ts, token-validator.ts, component-auditor.ts, page-auditor.ts, codebase-scanner.ts, edl-fixer.ts, edl-audit.ts, edl-report.ts, edl-tokens.ts, edl-compliance.ts
- **12 ESLint Rules**: no-hardcoded-colors, no-hardcoded-spacing, no-hardcoded-shadow, no-hardcoded-zindex, no-hardcoded-radius, no-hardcoded-typography, no-hardcoded-animation, no-inline-style-colors, require-design-tokens, no-arbitrary-tailwind-colors, no-legacy-imports, require-motion-import
- **5 CI Scripts**: `pnpm edl:audit` (full audit), `pnpm edl:fix` (auto-fix safe violations), `pnpm edl:report` (generate compliance report), `pnpm edl:tokens` (token health check), `pnpm edl:compliance` (component compliance audit)
- **Auto-fixer**: Safely replaces hardcoded values with EDL equivalents; dry-run by default, `--apply` to write
- **VS Code Integration**: `.vscode/settings.json` with ESLint on save, Tailwind CSS class detection, edl/* rules as warnings
- **Documentation** (6 files): DESIGN_GOVERNANCE, DESIGN_TOKEN_POLICY, DESIGN_REVIEW_CHECKLIST, EDL_CI_PIPELINE, DESIGN_COMPLIANCE_REPORT, EDP_22_0B_5
- **Brain**: Lesson 40 updated ("Architecture is enforced through tooling"), Principle #17 (Architecture Enforcement Through Tooling), evolution timeline entry

### Phase 22.1 — Product & Design Research Program (Complete)
- **Scope**: Reverse-engineer the world's best software into decision-ready principles for Perionyx — grounded exclusively in first-party sources, every claim traceable, every inference labeled `[inferred]`
- **4 deep-dive reviews** (~10,400 lines) at `docs/research/`:
  - **Stripe Dashboard** (`stripe-dashboard-review/stripe-design-review.md`) — "The Perionyx Design Bible" — dashboard trust patterns, metric hierarchy, empty states
  - **Linear** (`linear-review/`, 10-part series incl. `linear-design-review.md`) — navigation/IA, workflows, interaction & performance, keyboard, visual design, microinteractions, design decisions, opportunities, principles, roadmap comparison
  - **Ramp** (`ramp-review/ramp-design-review.md`) — spend management, corporate cards, AP, procurement, banking, AI agents
  - **Coupa** (`coupa-review/coupa-design-review.md`) — Total Spend Management: procurement, AP, supplier management, contracts, spend intelligence
- **Key cross-product findings**: module drift is a trust tax (consistency = release requirement via EDL governance); tabular numerals as a design rule for financial columns; trust = verifiable numbers; evidence-first over polish; the reset is a funded recurring program, not a fire drill
- **Inputs directly consumed by Phase 22.2 (Dashboard v2) and Phase 22.3 (Decision Workspace)** design specs

### Phase 22.2 — Dashboard v2 (Complete)
- **Scope**: Rebuilt the executive dashboard around the `DashboardDataV2` contract — answers "What should I do next?", not "What happened?"
- **Docs**: `docs/dashboard/{DASHBOARD_AUDIT, DASHBOARD_REDESIGN_SPEC, DASHBOARD_VALIDATION}.md` — 15 severity-ranked findings (SEV-1…SEV-15), 8 non-negotiable commitments, 100% finding resolution
- **Key violations fixed**: fake scalar confidence (SEV-1) → categorical bands with basis; no evidence package (SEV-2); heuristic branded as AI (SEV-3) → real `Decision` objects, "Decision Brief" not "AI Brief"; dead action buttons (SEV-4); hardcoded "previous period" (SEV-5) → computed `pctDelta`; no source/timestamp (SEV-6); no drill-down (SEV-7); greeting before KPIs (SEV-8); double fetch (SEV-9) → single composed payload; lossy preview projection (SEV-10); no data-mode boundary (SEV-11); activity without consequence (SEV-12); single hardcoded persona (SEV-13) → `personaFromRole()`; false "All caught up" (SEV-14); dashboard dead-ends (SEV-15)
- **Module**: `src/modules/dashboard/` — `DashboardV2CompositionService` (parallel section composition with per-section `.catch()` fallibility), 5 real KPIs (cash position, pending approvals, open AP value, automation rate, open exceptions) with `value/delta/basis/source/updatedAt/status/drillTarget`, ranked attention queue, decision brief, full work-queue state, today's work, consequence-rich activity
- **Route**: `src/app/api/dashboard/data/route.ts` — `withRuntimeContext` + `cacheHeaders(15)`; `INSTANCE_DATA_MODE=live` env for live/seeded badge
- **Pages/components**: `dashboard-page-client`, `dashboard-metric-strip`, `dashboard-attention-queue`, `dashboard-decision-brief`, `dashboard-work-queue`, `dashboard-todays-work`, `dashboard-activity`; deleted `dashboard-greeting`/`dashboard-ai-brief`/`dashboard-queue-preview`/`dashboard-financial-health`
- **Verification**: 16/16 `test/dashboard-composition.test.ts`, typecheck + build pass, H-01 deep-import respected (client imports types only)
- **Deferred**: persona section *visibility* filtering (identity only), section dismissal persistence, timestamped empty states

### Phase 22.3 — Decision Workspace (Complete)
- **Scope**: Replaced the Invoice Workspace details page with the canonical evidence-first, auditable financial decision surface — "Can I confidently make this financial decision?"
- **Docs**: `docs/decision-workspace/{DECISION_WORKSPACE_AUDIT, DECISION_WORKSPACE_REDESIGN_SPEC, DECISION_WORKSPACE_VALIDATION, EDP_22_3}.md` — Product System compliance ~35% → ~90%
- **Module**: `src/modules/decision-workspace/` — `types.ts` (EvidenceItem/Group, Recommendation, DecisionSummary, TimelineEntry, ActionContext), `evidence.ts` (`buildEvidencePackage` → 14 ordered groups, absence always disclosed as negative/pending), `recommendation.ts` (`deriveRecommendation` — deterministic priority reject→review→approve→no-signal, `ai: null` reserved, no fabricated scalars), `workspace-service.ts` (server-only composition over `getAPRepositories()`, PO/GRN via direct Prisma — no AP PO/GRN repo exists)
- **Components**: `src/components/decision-workspace/` — 3-zone layout (summary / evidence+timeline / actions), keyboard shortcuts (`?` legend + `a/r/x/b/d/v/k/j/t` with `isTypingTarget` guard), consequence previews, confirmation dialogs (AnimatedDialog)
- **Page**: `src/app/(shell)/procurement/invoices/[invoiceId]/page.tsx`
- **Constraints honored**: no new API surface (reuses `/api/v1/ap/invoices/[id]/{approve,reject,escalate,block,dispute,void}`), money formatted in exactly one server-side `format.ts`, EDL tokens only
- **Key decision (EDP)**: `formatted` client bag removed (server pre-formats); `request-info`/`assign` actions dropped (no endpoint); `v` shortcut added; item component inlined
- **Verification**: 14/14 `test/decision-workspace.test.ts`, 112/112 regression (`ap-api` 52 + `runtime` 60), typecheck + build pass; build hazard fixed — client components deep-import `types`/`format` (barrel pulls Prisma→`pg` into client bundle)
- **Deferred**: `ai` stays `null` until DI ships (evidence package is its contract), evidence search (`f`), live demo data (Demo Company has 0 AP invoices)

### Phase 23.0 — Perionyx Platform Constitution (Complete)
- **Scope**: Constitutional architecture for the Enterprise Financial Operating System — 32 documents, 15 Architectural Laws, 15 Platforms, canonical financial model, provider driver model
- **Constitutional Authority**: `docs/platform/PLATFORM_CONSTITUTION.md` — highest engineering authority for all Perionyx code
- **15 Architectural Laws**: Business domains never import provider SDKs; vendor terminology never enters domain model; every platform exposes capability contracts; provider drivers are replaceable; every external dependency is observable; financial integrity is never compromised; architecture governed through automation; every platform is measurable; every platform is testable; every platform is replaceable; tenant isolation is absolute; zero trust is the default; data classification governs handling; events are vendor-neutral; constitution evolves through process
- **15 Platforms Defined**: Integration, Banking, ERP, Payments, Identity, Notification, Document, AI, Workflow, Audit, Observability, Search, Storage, Security, Developer
- **Canonical Financial Model**: 38 entities, 5 value objects, translation tables for Plaid, QuickBooks, SAP, NetSuite, Dynamics
- **Provider Driver Model**: Thin adapters (auth, retries, pagination, rate limiting, error translation, telemetry) — no business logic
- **Security Constitution**: Zero Trust, defense in depth, RBAC+ABAC, AES-256-GCM, MFA, SSO, tenant isolation
- **Data Constitution**: 5 classification levels, Decimal(38,12) precision, retention, encryption, backup, GDPR
- **Deployment Constitution**: 5 models (Shared SaaS → On-Prem), blue-green, canary, zero-downtime
- **Governance**: Maturity model (0-4), ownership matrix, extension guide, provider certification, readiness checklist
- **Documents** (32 in `docs/platform/`): PLATFORM_CONSTITUTION, ENTERPRISE_PLATFORM_ARCHITECTURE, PLATFORM_CAPABILITIES, CANONICAL_FINANCIAL_MODEL, CAPABILITY_CONTRACTS, PROVIDER_DRIVER_MODEL, INTEGRATION_PLATFORM, ERP_PLATFORM, BANKING_PLATFORM, PAYMENTS_PLATFORM, IDENTITY_PLATFORM, NOTIFICATION_PLATFORM, DOCUMENT_PLATFORM, AI_PLATFORM, WORKFLOW_PLATFORM, AUDIT_PLATFORM, OBSERVABILITY_PLATFORM, SEARCH_PLATFORM, STORAGE_PLATFORM, SECURITY_PLATFORM, DEVELOPER_PLATFORM, DEPLOYMENT_ARCHITECTURE, MULTI_TENANCY_MODEL, EVENT_ARCHITECTURE, ERROR_ARCHITECTURE, DATA_ARCHITECTURE, PLATFORM_MATURITY_MODEL, PLATFORM_OWNERSHIP_MATRIX, PLATFORM_EXTENSION_GUIDE, PROVIDER_CERTIFICATION_GUIDE, ENTERPRISE_READINESS_CHECKLIST, EDP_23_0
- **Brain**: Lesson 41 ("Constitutions outlive architectures"), Principle #18 (Platform Constitution is Highest Engineering Authority), evolution timeline entry

### Phase 23.1 — Constitutional Validation (Complete)
- **Scope**: Evidence-based validation of the Platform Constitution against actual codebase implementation — 15 Laws, 15 Platforms, AP reference implementation, dependencies, security, observability, governance
- **Validation Documents** (9 in `docs/platform/`): PLATFORM_CONSTITUTION_VALIDATION, CONSTITUTION_COMPLIANCE_MATRIX, PLATFORM_GAP_ANALYSIS, REFERENCE_IMPLEMENTATION_REVIEW, DEPENDENCY_ANALYSIS, CANONICAL_MODEL_VALIDATION, ARCHITECTURAL_DEBT_REGISTER, SECURITY_OBSERVABILITY_ASSESSMENT, EDP_23_1
- **Constitutional Compliance**: 7.0/10 — 7 PASS (Laws 2,4,6,7,12,14,15), 7 PARTIAL (Laws 1,3,5,8,9,10,11), 1 FAIL (Law 13: Data Classification)
- **Platform Maturity**: 3.5/10 — Average maturity 1.4/4 across 15 platforms. 1 at Level 3 (Banking), 9 at Level 2, 2 at Level 1, 3 at Level 0
- **AP Reference Implementation**: 7.4/10 CONDITIONAL — 5 conditions: wire audit persistence, eliminate `as any`, persist idempotency, fix duplicate-detection arithmetic, add event schema versioning
- **Governance**: 6.3/10 — 32/32 docs present, Brain aligned (18/19 principles, 40/41 lessons), Constitution overstates platform readiness corrected
- **Architectural Debt Register**: 17 items — 3 P0 (data classification, audit persistence, tick.service.ts), 6 P1 (contracts, metrics, workflow engine, identity store, idempotency, duplicate detection), 5 P2, 3 P3
- **Violations Found**: `tick.service.ts:3` imports PlaidService (Law 1); zero data classification (Law 13); 12/15 platforms lack contracts (Law 3); AP audit entries not persisted; `plaidAccessToken` DB field (Law 14)
- **Constitution Amendment**: v1.1 — corrected platform maturity labels, added validation section
- **Brain**: Lesson 42 ("Validation gives constitution authority"), Principle #19 (Validation Gives Authority), evolution timeline entry

### Phase 24.0 — Enterprise Foundation Implementation (Complete)
- **Scope**: 5 shared enterprise capabilities that every platform inherits — Data Classification, Configuration, Secret Management, Capability Registry, Provider Runtime
- **Files Created** (24 files in `src/server/foundation/`):
  - **Data Classification** (`classification/`): types.ts (11 levels), registry.ts (ClassificationRegistry singleton, 10 default policies), validation.ts, index.ts
  - **Configuration** (`config/`): types.ts, registry.ts (hierarchical resolution: Tenant > Environment > Global), feature-flags.ts (6 built-in flags), index.ts
  - **Secret Management** (`secrets/`): types.ts, providers/environment.ts (env var adapter), manager.ts (SecretManager), index.ts
  - **Capability Registry** (`capability-registry/`): types.ts (11 categories), registry.ts (discovery, health, events), index.ts
  - **Provider Runtime** (`provider-runtime/`): types.ts, driver.ts (ProviderDriver abstract base class), circuit-breaker.ts, rate-limiter.ts (token bucket), retry.ts (exponential backoff + jitter), index.ts
  - **Barrel** (`foundation/index.ts`)
- **Documentation** (7 files): DATA_CLASSIFICATION_PLATFORM.md, CONFIGURATION_PLATFORM.md, SECRET_MANAGEMENT_PLATFORM.md, CAPABILITY_REGISTRY.md, PROVIDER_RUNTIME.md, PHASE24_IMPLEMENTATION_REPORT.md, EDP_24_0.md
- **Law Compliance Impact**: Law 13 (Data Classification) 2/10 → functional; Law 3/14 (Capability Contracts/Events) improved via CapabilityRegistry; Law 2/4/11 (Provider SDKs/Replaceable/Observable) improved via ProviderDriver base class
- **Brain**: Lesson 43 ("Shared capabilities before integrations"), Principle #20 (Every Shared Capability Implemented Once, Centrally), evolution timeline entry

### Phase 24.0B — Runtime Platform (Complete)
- **Scope**: AsyncLocalStorage-based Runtime Context + Prisma-backed Runtime Registry + Runtime Secrets/Capabilities
- **Runtime Core** (`src/runtime/core/`): Runtime singleton, lifecycle management, startup/shutdown
- **Runtime Context** (`src/runtime/context/`): AsyncLocalStorage propagation of tenant, request, trace, permission, financial, locale context — 16 zero-argument getters, concurrency-safe, backward-compatible
- **Runtime Registry** (`src/runtime/configuration/`): Prisma-backed feature flags, service configuration, capability registry with health monitoring
- **Runtime Secrets** (`src/runtime/secrets/`): Multi-provider secret management (Environment, Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- **Runtime Errors** (`src/runtime/errors/`): Typed error hierarchy with recovery strategies
- **Prisma Migration**: `20260726100000_prt_runtime_services` — RuntimeConfiguration, RuntimeSecret, RuntimeCapability models
- **Tests**: 63 runtime tests in `test/runtime.test.ts` — all passing
- **Documentation**: `docs/architecture/RUNTIME_ARCHITECTURE.md`
- **Brain**: Lesson 44 ("Context propagation is invisible architecture"), Principle #21 (Context Propagation Through AsyncLocalStorage), evolution timeline entry, ADR-021

### Phase 25.0 — Brain Knowledge Platform Restructure (Complete)
- **Scope**: Restructured the Brain from 16 loosely-organized folders to 20 formally-governed folders with constitutional authority
- **Constitution** (`brain/00-Constitution/`): Knowledge Constitution (10 core laws), Page Standards (mandatory template), Knowledge Graph Guide (relationship types, metrics), Brain Architecture (20-folder design, 5 clusters), EDP-25.0
- **Customer Intelligence** (`brain/03-Customer Intelligence/`): People profiles (Adeel Aslam, Mostafa, Aman), Interview templates, Pain Points (vendor invoice reconciliation, approval workflow delays), Validated Evidence (fragmented workflows), Product Hypotheses (AI cash forecasting), Competitive Signals (QuickBooks), CRM Alignment
- **Content Migration**: 44 lessons → `17-Lessons/`, 22+ ADRs → `11-Decisions/`, engineering knowledge → `04-Engineering/`, 15 templates → `18-Templates/`
- **Archived**: 9 empty root stubs, 4 canvas/base files, 10 old folder indexes — all to `19-Archive/`
- **20 INDEX.md Entry Points**: Every folder has an entry point with frontmatter, purpose, content map, navigation, and cross-links
- **Health Report**: `brain/BRAIN_HEALTH_REPORT.md` — 194 files, 16,177 lines, 1,315 wikilinks, 84% frontmatter coverage
- **Brain**: Lesson 45 ("Knowledge structure enables knowledge growth"), Principle #22 (Knowledge Structure Enables Knowledge Growth), ADR-025, evolution timeline entry

### Phase 25.5 — Enterprise Architecture Review & Readiness (Complete)
- **Scope**: 10-workstream evidence-based architecture review across all platform capabilities
- **Workstreams**: Architecture (5.5/10), Foundation (4.5/10), Constitution (7.0/10), Security (7.2/10), Data Architecture (6.5/10), Runtime (5.5/10), Integration Readiness (4.2/10 avg), Performance (5.5/10), Developer Experience (7.2/10), Product Readiness (4.5/10)
- **Weighted Average Score**: 5.7/10 — NOT ready for platform expansion
- **Critical Findings**: Foundation zero adoption (~1,500 lines dead code), in-memory stores (data loss on restart), 763 `as any` assertions, broken webhook signature, plaintext passwords in identity module, `ignoreBuildErrors: true`
- **30 Architectural Debt Items**: 5 P0, 12 P1, 8 P2, 5 P3 (total ~56-77 person-weeks)
- **20 Risks Cataloged**: 4 Critical, 11 High, 5 Medium
- **12 Readiness Gates**: 0 PASS, 3 CONDITIONAL PASS, 7 FAIL
- **Decision**: Phase 26 must be Foundation Wiring & Persistence, not platform expansion
- **Documentation** (10 files): ENTERPRISE_ARCHITECTURE_REVIEW, ENTERPRISE_READINESS_SCORECARD, ARCHITECTURAL_RISK_REGISTER, ARCHITECTURAL_DEBT_REPORT, SECURITY_READINESS_REPORT, SCALABILITY_ASSESSMENT, PLATFORM_MATURITY_REPORT, PRODUCT_READINESS_REPORT, ENTERPRISE_READINESS_GATES, PHASE_25_5_EXECUTIVE_SUMMARY, EDP_25_5
- **Brain**: Lesson 46 ("Architecture earns trust through continuous validation"), Principle #23 ("Every major platform expansion must be preceded by an evidence-based architecture readiness review"), ADR-026, evolution timeline entry

### Phase 25.2A — Customer Intelligence Structural Readiness (Complete)
- **Scope**: Made Brain's Customer Intelligence folder structurally ready for interview imports — no content fabricated
- **Structure**: 32 files (INDEX, IMPORT guide, 11 People profiles, 10 interview placeholders, 9 synthesis pages, 1 lesson)
- **People Profiles**: 11 created (1 populated from Adeel Aslam interview, 10 marked Pending Import)
- **Interview Placeholders**: 10 created (all Pending Import with metadata templates)
- **Synthesis Pages**: VALIDATED_MARKET_THEMES (6 themes), PRODUCT_PRINCIPLES (7 principles: 3 Working, 4 Hypothesis), WORKFLOW_RESEARCH_INDEX (8 workflows), ERP_OBSERVATIONS (5 ERP systems), DESIGN_PARTNER_PROGRAM (scoring framework), VOICE_OF_CUSTOMER (quote banks), PRODUCT_EVIDENCE_MATRIX (contact × claim), CUSTOMER_DISCOVERY_SUMMER_2026 (campaign summary), CRM_INDEX (19 CRM contacts mapped)
- **Updated**: CUSTOMER_INTELLIGENCE_GUIDE (import workflow), CRM_ALIGNMENT (import procedure)
- **Brain**: Lesson 47 ("Interview structure before content"), Principle #24 ("Structure before content — knowledge graphs must be architecturally ready before evidence arrives"), evolution timeline entry

### Phase 26.0 — Foundation Activation & Security Remediation (In Progress)
- **First Principle**: "Architecture has no value until every production code path depends upon it"
- **Wave 1 — RuntimeContext Activation**:
  - Created `src/server/http/init-runtime-context.ts` — bridge function reading proxy headers → RuntimeContext via AsyncLocalStorage
  - `RouteTenantContext` / `RouteRuntimeContext` types bridge `role: string` → `role: CompanyRole` for backward compatibility
  - Migrated 5 routes from `auth()` + `requireTenantContext()` to `withRuntimeContext()`:
    1. `/api/executive/dashboard` (GET)
    2. `/api/controller/journals` (GET + POST)
    3. `/api/treasury/forecasts` (GET + POST)
    4. `/api/v1/webhooks` (GET + POST + PATCH + DELETE)
    5. `/api/agents/[id]/tasks` (GET + POST)
  - RuntimeContext adoption: 0 → 5 routes (proof of concept)
- **Security Fixes**:
  - **CRIT-01** (webhook HMAC): Replaced FNV-1a hash with real HMAC-SHA256 via Node.js `crypto`. Added `crypto.timingSafeEqual` (replaced `===`). `webhook-platform.ts`
  - **CRIT-02** (plaintext passwords): Rewrote `identity/authentication.ts` — `bcrypt.hash(password, 12)` for all password storage, async `bcrypt.compare()` for login/changePassword/resetPassword
  - **CRIT-03** (Plaid verification): Replaced `institutionsGet` no-op with proper JWS/ES256 verification against Plaid production JWKS. `plaid-webhook-handler.ts`
  - **HIGH** (admin bootstrap): Replaced SHA-256 (`createHash("sha256")` + 8-char salt) with `bcrypt.hash(password, 12)`. `administrator-bootstrap.ts`
- **Impact**: 3 Critical → 0, 4 High → 3 resolved
- **Files changed**: 10 (1 new, 9 modified)
- **Brain**: Evolution timeline entry, Lesson 48, Principle #25

### Phase 26.0A — Runtime Convergence & Canonical Execution Path (Complete)
- **First Principle**: "There must be exactly one way for production code to execute"
- **Migration**: 446 files migrated via codemod (`scripts/migrate-routes.mjs` v3) — 369 API routes + 77 Server Components
- **Infrastructure Rewrites**:
  - `require-permission.ts` — Now reads from RuntimeContext, keeps API key fallback
  - `authenticate-request.ts` — Now reads from RuntimeContext, keeps API key fallback
  - `procurement/api/middleware.ts` — `apAuth()` wraps `withRuntimeContext()` internally (67 AP routes)
  - `automation-studio/actions.ts` — Server Actions use `headers()` + `withRuntimeContext()`
  - Migrated `transfer`/`credit` routes and `companies/[id]` DELETE to `withRuntimeContext()`
- **Deletions**:
  - Deleted `requireTenantContext` function (kept `TenantContext` type for 242 module consumers)
  - Deleted 13 dead runtime getters (reduced from 16 exports to 3)
- **Verification**: TypeScript 0 errors, build passes, 52/52 AP tests, 60/60 runtime tests
- **Metrics**: ~460 files modified, net -1,500 lines, dual execution paths: 2 → 1
- **Brain**: Lesson 49, Principle #26, ADR-027, 8 deliverable documents at `docs/architecture/`

### Phase 26.1 — Foundation Operationalization (Complete)
- **Scope**: Eliminate gaps between architectural foundation and production operation
- **Key Audit Corrections**: Encryption is production-grade AES-256-GCM (audit claim corrected); "73 in-memory stores" conflated dead code, by-design caches, in-process state, and persisted Runtime layer; AP event bus in-process is architecturally correct for transactional events
- **Graceful Shutdown**: Wired SIGTERM/SIGINT with 4 ordered handlers (database → cache → secrets → capabilities), force exit after 60s
- **Dead Code Eliminated**: Deleted `iam/session.ts` (0 consumers), `security/rate-limiter.ts` (superseded), cleaned barrel exports
- **Event Bus Hardened**: Error isolation per handler, bounded history (1K max), Pino logging, published/error metrics
- **Structured Pino Logging**: Added to 7 foundation files (classification, config, capabilities, secrets, identity facade, SSO handler, graceful shutdown)
- **Console.log Replaced**: All `console.log`/`console.error` in `ha/graceful.ts` replaced with structured Pino
- **Verification**: TypeScript 0 errors from modified files, 60/60 runtime tests, 139/139 AP tests
- **Brain**: Lesson 50 (Audits correct more than they discover), Principle #27 (Audits produce hypotheses not conclusions), 6 deliverable documents at `docs/architecture/`

### Phase 26.2 — Enterprise Foundation Certification (Complete)
- **Scope**: Adversarial technical due diligence of foundation architecture across 25 certification domains
- **Methodology**: 38 files read (~7,320 lines), 10-category adversarial search, integration trace, test verification, Constitution compliance
- **25-Domain Scoring**: Architecture 7.2, Services 6.4, Security 6.8, Resilience 6.0, Quality 5.6 → **Weighted Average: 6.60/10**
- **10 Strengths**: RuntimeContext (9.0), ProviderDriver (8.5), PgBoss (7.5), Graceful Shutdown (9.0), AP Event Bus (7.0), Security (7.0), MFA (7.0), Fail-Open Docs (7.0), Pino Logging (8.0), Config Cache (6.5)
- **6 Weaknesses**: Singleton overwrite (CRITICAL), Cross-tenant audit leak (CRITICAL), Unbounded memory arrays (HIGH), Silent error swallowing (HIGH), Missing input validation (HIGH), Sandbox fallback secret (MEDIUM)
- **Certification Decision**: **CERTIFIED WITH CONDITIONS** — 6 conditions (C-01 through C-06), 3-4 week remediation timeline
- **Certificate-Blocking**: 5 AT-RISK domains exceed 2-domain threshold for full certification
- **14 Risks Cataloged**: 3 Critical, 8 High, 3 Medium
- **23 Debt Items**: 6 P0, 8 P1, 5 P2, 4 P3 (total ~10-15 weeks)
- **Verification**: 60/60 runtime tests, 139/139 AP tests, TypeScript 0 errors
- **Brain**: Lesson 51 (Strong platforms earn trust through independent verification), Principle #28 (Enterprise foundations are certified through evidence not confidence), ADR-028, 11 deliverable documents at `docs/architecture/`

### Phase 26.3 — Enterprise Foundation Hardening (Complete)
- **Scope**: Remediated all 6 certification conditions through class-level prevention, not just instance fixes
- **First Principle**: "The best remediation eliminates the entire class of defects, not only the reported instance."
- **C-01 Singleton Lifecycle**: 3 Runtime `create()` methods now async, call `shutdown()` before overwrite
- **C-02 Cross-Tenant Audit**: `tenantId` required in `getAuditLog()` and `listSecrets()`
- **C-03 Memory Bounds**: Created `BoundedRingBuffer<T>` utility (10K max, slice eviction). Replaced 5 unbounded arrays: config auditLog, secrets rotationHistory + auditLog, classification auditLog, capability eventLog
- **C-04 Exception Discipline**: Fixed 25+ empty catch blocks across 10 files. Created ESLint rule `no-empty-catch` with auto-fix
- **C-05 API Validation**: Added Zod schemas to 19 unvalidated API routes
- **C-06 Secret Safety**: Removed "sandbox-fallback" default. Now throws on missing AUTH_SECRET
- **Prevention Artifacts**: `BoundedRingBuffer<T>` utility, ESLint rule `no-empty-catch`, CI validation script (`foundation-validation.sh` — 7 checks)
- **Verification**: 0 TypeScript errors (excluding pre-existing docs/site), 60/60 runtime + 52/52 AP = 112/112 tests, 7/7 CI checks pass
- **Brain**: Lesson 52 (Prevention Outlasts Remediation), Principle #29 (Every recurring defect class must be addressed at the tooling or architectural level), ADR-029, 10 deliverable documents at `docs/architecture/`

### Phase 27.0A — Enterprise Product Architecture & Workflow Design (Complete)
- **Scope**: Enterprise Product Specification (EPS) for the AP Reference Workflow — the blueprint for every future financial workflow
- **First Principle**: "The quality of enterprise software is determined by the quality of its workflows."
- **13 Deliverable Documents** at `docs/product/` (~5,200 lines total):
  - ENTERPRISE_PRODUCT_SPECIFICATION_AP.md — Master spec (508 lines)
  - PRODUCT_PHILOSOPHY.md — Core beliefs (328 lines)
  - PERIONYX_PRODUCT_PRINCIPLES.md — 15 principles (420 lines)
  - AP_REFERENCE_WORKFLOW.md — 10 workflow stages (534 lines)
  - WORKFLOW_STATE_MACHINE.md — 5 state machines (576 lines)
  - PERSONA_GUIDE.md — 9 personas (567 lines)
  - UX_INFORMATION_ARCHITECTURE.md — 25 screens (502 lines)
  - AI_BEHAVIOUR_GUIDE.md — AI permission matrix (608 lines)
  - DESIGN_SYSTEM_GUIDELINES.md — EDL application (581 lines)
  - CUSTOMER_EVIDENCE_TRACEABILITY.md — Evidence matrix (200 lines)
  - HYPOTHESIS_REGISTER.md — 14 hypotheses (280 lines)
  - SUCCESS_METRICS.md — 12 metrics (300 lines)
  - EDP_27_0A.md — Engineering decision packet
- **Key Design Decisions**: AP is first workflow (evidence: T1, T2, P2), 10 stages (simplified from 14), AI explains but never decides, dedicated exception queue, immutable audit trail, batch payments as hypothesis
- **Customer Evidence**: Adeel Aslam (E1), Ayman Shawky (E3), Muhammed Jamsheed (E4), Phase 20.0 validation, Phase 21.0 gap analysis
- **Verification**: No production code written (by design). All 13 documents produced and reviewed.
- **Brain**: Lesson 53 (Workflow Quality Determines Software Quality), Principle #30 (Every workflow must reduce cognitive effort for trusted financial decisions), ADR-030, 13 deliverable documents at `docs/product/`

### Phase 27.0 — Customer Intelligence Platform Completion (Complete)
- **Scope**: Complete the Customer Intelligence Platform as the canonical knowledge base for all customer-facing intelligence
- **First Principle**: "Customer knowledge compounds when every conversation becomes structured evidence."
- **39 People Profiles**: 17 LinkedIn contacts (9 existing enhanced, 8 created new), 19 CRM contacts mapped to Brain, 3 existing
- **39 Interview Records**: 1 formal interview (Adeel Aslam), 18 CRM-sourced interaction records, 20 pending formal interviews
- **9 Canonical Relationship Stages**: Prospect → Connected → Interview Scheduled → Interview Completed → Prototype Reviewer → Design Partner → Pilot Customer → Reference Customer → Strategic Advisor
- **Knowledge Graph**: People → Companies (2), Pain Points (8 themes), Workflows (10 AP stages), Evidence (8 claims), Principles (9 product principles)
- **Evidence Traceability**: P3 validated (3 sources), P1-P5 at Working level, P6-P9 as Hypotheses. T3 and T5 promoted to Validated with 3 CRM sources
- **Design Partner Pipeline**: 7 pre-scored candidates — Khaleel Ur Rehman (HIGHEST), Ahmed Orabi (VERY HIGH), Muhammed Jamsheed (HIGH), Ayman Shawky (MEDIUM)
- **CRM Health**: 0 duplicates, 0 broken links, 38 contacts pending formal interviews
- **8 Deliverable Documents** at `docs/customer-intelligence/` (~2,625 lines):
  1. CUSTOMER_INTELLIGENCE_COMPLETION_REPORT.md
  2. CRM_HEALTH_REPORT.md
  3. DESIGN_PARTNER_PIPELINE.md
  4. CUSTOMER_EVIDENCE_INDEX.md
  5. CUSTOMER_RELATIONSHIP_SCORECARD.md
  6. INTERVIEW_COVERAGE_REPORT.md
  7. CUSTOMER_INTELLIGENCE_GRAPH.md
  8. EDP_27_0_CUSTOMER_INTELLIGENCE.md
- **Brain**: Lesson 54 (Customer Knowledge Compounds), Principle #31 (Enterprise products evolve through evidence, not opinions), ADR-031, evolution timeline entry, 8 deliverable documents at `docs/customer-intelligence/`

### Phase 27.1 — Enterprise Product Specification v2.0 (Complete)
- **Scope**: 13 enhanced EPS documents at `docs/product/eps/` (~9,110 lines total)
- **First Principle**: "The best enterprise software is designed around decisions, not transactions."
- **Documents**: ENTERPRISE_PRODUCT_SPECIFICATION_AP.md (622 lines), REFERENCE_WORKFLOW_AP.md (698), USER_JOURNEY_LIBRARY.md (1,533), BUSINESS_RULE_LIBRARY.md (1,195), PRODUCT_PRINCIPLES.md (334), INFORMATION_ARCHITECTURE.md (775), AI_BEHAVIOUR_GUIDE.md (636), DESIGN_SYSTEM_GUIDE.md (684), CUSTOMER_VALIDATION_PLAN.md (852), OPEN_PRODUCT_HYPOTHESES.md (467), SUCCESS_METRICS.md (448), WORKFLOW_STATE_MACHINE.md (464), EDP_27_1.md (402)
- **Key decisions**: 10-stage workflow redesigned around decision points, 5 state machines with decision-readiness guards, AI prepares evidence but never decides, 3 density modes, 65 business rules with evidence tags, 14 open hypotheses (3 red-zone risk), 12 success metrics
- **Evidence**: Every decision traces to customer evidence (E1-E10) or is marked [HYPOTHESIS] (~30 tags)
- **Brain**: Lesson 55, Principle #32, ADR-032, evolution timeline entry

### Phase 27.1R — Enterprise Product Review & Readiness (Complete)
- **Scope**: Independent product review of the EPS before any UX or engineering — 11 documents at `docs/product/review/` (~3,957 lines)
- **First Principle**: "Enterprise products earn trust through independent review before implementation."
- **Review Dimensions**: Workflow architecture, cognitive load, business rules, AI trust, customer evidence traceability, product philosophy, enterprise readiness, product debt
- **Key Findings**: Readiness 6.75/10 (Conditionally Ready). 27 debt items (3 P0). 20 risks (2 Critical). 43% hypothesis rate in business rules. Only 1 formal interview supports entire spec. 6 missing rules (Critical: vendor bank change requires approval). Invoice Detail ~320 data points cognitive overload risk. Persona count inconsistent (9 vs 10).
- **Documents**: PRODUCT_REVIEW_REPORT, PRODUCT_READINESS_SCORECARD, PRODUCT_RISK_REGISTER, PRODUCT_DEBT_REGISTER, COGNITIVE_LOAD_REVIEW, BUSINESS_RULE_AUDIT, AI_TRUST_REVIEW, CUSTOMER_TRACEABILITY_AUDIT, PRODUCT_SIMPLIFICATION_REPORT, PHASE_27_1R_EXECUTIVE_SUMMARY, EDP_27_1R
- **Brain**: Lesson 56, Principle #33, ADR-033, evolution timeline entry

### Phase 28.1 — Enterprise Readiness Remediation (Complete)
- **Scope**: Resolve every Critical and High finding from the Phase 28.0 survey; re-verify; document honestly. Constraint: no new features, no untestable code, every change maps to a documented finding
- **Security (all fixed)**:
  - **C-01 (Critical) header spoofing** — proxy now strips `x-user-id`/`x-company-id`/`x-company-role` from ALL requests and derives identity only from verified JWT (`token.sub`/`activeCompanyId`/`companyRole`) or DB-backed API key (`roleFromApiKeyScopes`); `verifyHeaderIdentity()` in `withRuntimeContext` re-verifies claims + rejects unknown roles (defense-in-depth)
  - **C-02 (Critical) unguarded tick** — `CRON_SECRET` mandatory (≥16 chars else 503 fail-closed), `crypto.timingSafeEqual`, 401 on mismatch
  - **C-03 (Critical) API-key ADMIN** — `roleFromApiKeyScopes(scopes)`: `admin:all`→ADMIN, `write:*`→MEMBER, else VIEWER; single source of truth (proxy + authenticate-request + require-permission)
  - **H-01 MFA enforcement** — `enforceMfa()`: `PermissionRegistry.requiresMfa` permissions demand fresh TOTP/recovery verification (12h window) for enrolled users; un-enrolled users not blocked (accepted — forced enrollment is a product decision)
  - **H-02 webhook mutations** — `webhooks.manage` required on POST/PATCH/DELETE + Zod schemas (idempotency preserved)
  - **H-03 13 unguarded v1 routes** — 7 gated (`approvals.view/approve/reject`, `analytics.read`, `admin.settings`), 6 documented as correctly open (public leads, token-authenticated invites, existing session guards)
  - **H-04 inbound webhook verification** — documented ACCEPTED RISK with wiring plan (verifiers unit-complete; no inbound source exists; wiring deferred to first real integration)
  - **H-05 legacy identity module** — documented accepted (zero-consumer; deletion blocked by system/identity pages)
- **Performance (all fixed)**: `ignoreBuildErrors` removed + `docs/site` excluded from root tsconfig + `seed-fresh.ts` errors fixed → **typecheck 0 errors** (was 11 pre-existing); approval polling hammer (30s polls, select, take 100, cache 10s); 9 N+1 loops → single-query batches (reconciliation-engine, approval-thread, trend.engine, scenario-modeling, calendar, risk, multi-company-builder, automation-engine, anomaly-detection); 9 unbounded queries → take/skip (admin users/roles/connectors/webhooks + financial-reports ×4); cache headers on cfo/dashboard (30s), ap/invoices (15s), ledger (15s)
- **UX (all fixed)**: `/invoices` + `/audit-trail` rebuilt as live Prisma server components (fabricated figures removed; merged AuditLog + ProcurementAPAuditRecord feed — verified live 1,673 open invoices / 21,780 AP audit records); `/reports` un-disabled in nav; deprecated `/accounting` tree removed from nav (routes kept); Guidance Start/Resume/Retake wired to `useOnboarding().startTour()`; report Export → real CSV
- **Test fix**: `ForbiddenError` message includes permission name (satisfies authorization suite)
- **Verification**: typecheck 0 errors; `pnpm build` passes (12 GB heap — 8 GB OOMs a worker); `pnpm vitest run` — 47 failures all pre-existing environmental (dev-DB workflow tests + env-dependent ai-provider/secrets), zero in changed modules; targeted 5 suites 50/50; live-DB smoke passed
- **Deliverables**: 11 documents at `docs/readiness/` — REMEDIATION_LOG, VERIFICATION_REPORT, updated README/SECURITY_REVIEW/ENTERPRISE_READINESS (6.6 → 7.8)/OPEN_DECISIONS (6 of 8 resolved)/KNOWN_LIMITATIONS; AGENTS.md entry; brain updates
- **Remaining (deferred, non-blocking)**: D-04 treasury hub mocks, D-05 one-command seed, CSP/chunked-body/rate-limit-keying hardening, forced MFA enrollment, H-04 wiring, 650 `formatCurrency` / 803 `as any` / zero-consumer modules
- **Brain**: Lesson 58, Principle #35, evolution timeline entry

### Phase 28.0 — Enterprise Readiness Survey (Complete)
- **Scope**: Evidence-based readiness assessment for a CFO-facing demo and production — 9 objectives, 5 parallel deep-dive audits (UX, Security, Performance, Demo, Tech Debt), live-DB verification, 7 high-confidence fixes
- **Verdict**: **Overall 6.6/10** — Demo-ready with caveats (Sandbox tenant + AP seed); **NOT production-ready** (3 Critical security findings)
- **Blocker Found & Fixed**: AP seed generators hardcoded a phantom company ID (`cmqvfocev0001koor7ragb8bq`, zero rows) → parameterized via `SEED_COMPANY_ID`/`--company-id`; **verified live: 150 vendors / 3,500 invoices / 21,780 audit records written to Demo Company, 0 to phantom**
- **Performance F-01 Fixed**: `cacheHeaders()` emitted `no-store` overriding TTLs (0 of 212 "cached" GETs cached) + `s-maxage` CDN cross-tenant leak → `private, max-age=N` (`handle-route.ts:61`)
- **UX Fixed**: treasury hub 404 (EBAM) + 6 dead buttons wired; sidebar role-filtering bypass fixed (sections ∩ RBAC-filtered nav); no-op Cmd+N/Cmd+S removed; Vaulta→Perionyx tab titles (6 pages); legacy `#d4a843`→`#d4af37` (13×)
- **Security Findings**: C-01 forged `x-user-id`/`x-company-id`/`x-company-role` headers bypass auth on ~195 non-v1 routes; C-02 unguarded `/api/v1/tick`; C-03 API key → ADMIN; MFA unenforced; webhook HMAC/Plaid JWS verifiers written but never wired; ~half of `docs/security` remediation claims verified fixed, 2 PARTIAL, 1 still present
- **Performance**: 15 N+1 loops (10 read-path), 9 unbounded admin queries, `ignoreBuildErrors: true`, approval polling hammer (10s+15s, uncached, take 200)
- **Known limitations**: 650 `formatCurrency` (0 use canonical), 803 `as any`, zero-consumer `persistence/` (31 files) + `locks/` (5), 3 workflow engines, 4 stub screens (`/invoices`, `/audit-trail` with fabricated figures, `/mobile-dashboard`, `/mobile/treasury`), treasury hub still `MOCK_*`
- **Deliverables**: 8 documents at `docs/readiness/` — README (checklist), ENTERPRISE_READINESS (scorecard), SECURITY_REVIEW, PERFORMANCE_REVIEW, UX_AUDIT, DEMO_READINESS, KNOWN_LIMITATIONS, OPEN_DECISIONS (8 decisions D-01…D-08) + 5 raw audits at `docs/readiness/source-audits/`
- **Verification**: typecheck — zero new errors (only 11 documented pre-existing: `docs/site` + `seed-fresh.ts`); test suite — 33 failures unchanged (pre-existing environmental: env-dependent ai-provider/secrets tests + dev-DB state in workflow tests), zero related to survey changes
- **Brain**: Lesson 57, Principle #34, evolution timeline entry

### H-01 — Work Queue Domain Consolidation (Complete)
- **Scope**: Made `src/modules/work-queue/` the single canonical source of truth for Work Queue state (types, status labels, SLA labels, priority/SLA derivation, filters, pagination, preview projection) and eliminated all duplicate implementations
- **Canonical module additions**: `constants.ts` (`VendorInvoiceStatus`, `HIGH_VALUE_THRESHOLD`=25000, `PENDING_STATUSES`, `WORK_QUEUE_STATUS_LABELS`), `status.ts` (`WORK_QUEUE_SLA_LABELS`, `toWorkQueueStatusLabel`, `toWorkQueueSlaLabel`, `workQueueStatusToNextAction`, `deriveSlaStatus`, `derivePriority`), `filters.ts` (`buildWorkQueueWhere`, `getWorkQueuePagination`, `DEFAULT_WORK_QUEUE_FILTERS`), `preview.ts` (`toWorkQueuePreviewItem`); `types.ts` rewritten with canonical `WorkQueuePriority`, `WorkQueueSlaStatus`, `WorkQueueItem`, `WorkQueuePreviewItem`, `WorkQueueFilters`
- **Duplicates eliminated**: dashboard `WorkQueueItem` deleted → canonical `WorkQueuePreviewItem` (composition.service uses `toWorkQueuePreviewItem`); todays-work imports canonical `PENDING_STATUSES`/`HIGH_VALUE_THRESHOLD`; finance-collab `CasePriority` now aliases `WorkQueuePriority` + its `WorkQueueItem` renamed `SpecialistQueueItem` (distinct concept, thin adapter over `prisma.workQueue`); dead `findPendingApproval` removed from `IInvoiceRepository` + InMemory + Prisma implementations; hardcoded SLA label map in `work-queue-page-client.tsx` replaced with canonical `toWorkQueueSlaLabel` (client component deep-imports from `work-queue/status` — barrel import pulls `WorkQueueService` → Prisma → `pg` into the client bundle and breaks Turbopack on Node `dns`)
- **Verified**: zero duplicate `WorkQueueItem`/status/priority/filter logic in the AP invoice queue domain (remaining same-literal unions are distinct severity/risk/confidence domains); `pnpm typecheck` clean except pre-existing `docs/site` + `prisma/seed-fresh.ts` errors; 57/57 targeted tests pass (incl. 22 in `test/work-queue-domain.test.ts`); full suite failures unchanged (pre-existing environmental only); `pnpm build` passes
- **No UI, API, or behaviour changes**

### Recommended Next Phase

**Phase 21B.0 — AP UI Wireframing** (6-8 weeks, AFTER PAB sign-off on Phase 27.1R decisions):

The EPS is conditionally approved for prototyping. Before UI wireframing begins, the following must be resolved:
1. PAB sign-off on 8 EDP_27_1R decisions (especially D-02: stage consolidation, D-05: business rule MVP)
2. Expand customer evidence base — target 3+ formal AP interviews before UI implementation
3. Resolve persona inconsistency (9 vs 10) across all documents
4. Add missing Critical business rule: vendor bank detail change requires dual approval
5. Define per-capability AI confidence thresholds (replace universal 70%)
6. Reduce cognitive load in Invoice Detail screen

**Phase 27.0B — AP Workflow Implementation** (8-12 weeks, deferred until wireframes validated):
1. Wire invoice entry form to Prisma (Stage 1: Invoice Received)
2. Implement evidence collection service (Stage 2: Evidence Collection)
3. Wire matching engine to invoice/PO/GRN creation (Stage 3: Three-Way Match)
4. Build exception queue UI with resolution actions (Stage 4: Exception Detection)
5. Implement AI context building with explainability (Stage 5: AI Context Building)
6. Build cross-department coordination (Stage 6: Coordination)
7. Wire approval matrix to invoice workflow (Stage 7: Approval)
8. Implement payment proposal generation (Stage 8: Payment Readiness)
9. Wire payment execution to treasury (Stage 9: Payment)
10. Implement GL posting and audit trail (Stage 10: Audit Completion)
**Phase 27.0B — AP Workflow Implementation** (8-12 weeks):
1. Wire invoice entry form to Prisma (Stage 1: Invoice Received)
2. Implement evidence collection service (Stage 2: Evidence Collection)
3. Wire matching engine to invoice/PO/GRN creation (Stage 3: Three-Way Match)
4. Build exception queue UI with resolution actions (Stage 4: Exception Detection)
5. Implement AI context building with explainability (Stage 5: AI Context Building)
6. Build cross-department coordination (Stage 6: Coordination)
7. Wire approval matrix to invoice workflow (Stage 7: Approval)
8. Implement payment proposal generation (Stage 8: Payment Readiness)
9. Wire payment execution to treasury (Stage 9: Payment)
10. Implement GL posting and audit trail (Stage 10: Audit Completion)

### Upcoming (Deferred until foundation is wired)
1. **Phase 21B — AP Core Workflow**: Service rewrites, 3-way match wiring, approval routing, payment processing, GL integration
2. **Phase 21C — AP Intelligence**: Exception queue UI, duplicate invoice detection, AP analytics dashboard
3. **Phase 21D — AP Hardening**: Vendor statement reconciliation, audit trail, payment safety, multi-currency
4. Version diff/comparison to workflow detail page
5. Analytics drill-down: click charts → see per-instance details
6. Wire onboarding wizard step execution to actual module APIs
7. Unit tests for all onboarding module classes and readiness service
8. Distributed rate limiting + Postgres read replicas
9. Phase 9C — Investments
10. Phase 9D — Risk
11. Phase 9E — Compliance
12. Phase 9F — Executive AI
13. WF-012: Migrate 19 raw table pages (Fixed Assets + Identity) to EnterpriseTable

### Phase 8B (Planned)
1. Implement Redis for distributed rate limiting + caching
2. Add Postgres read replicas for GET endpoints
3. Add ETag support for entity endpoints
4. Implement response compression (Accept-Encoding: gzip)
5. Add response streaming for AI and analytics endpoints
6. Move sync background jobs to PgBoss queue
7. Build EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseBadge primitives on design tokens (8B.6 post-v1)
8. Arabic RTL Phase 1-4 (see `docs/i18n/localization-strategy.md`)
9. i18n integration into enterprise table/analytics/forms components
10. Native push notifications with deep linking for mobile
11. Offline action queue — persist approvals when offline, sync on reconnect
12. iOS/Android home screen widgets for cash position

## Key Decisions

- **Proxy replaces Middleware**: Next.js 16 uses `src/proxy.ts` instead of `src/middleware.ts`. The proxy handles edge rate limiting, CSRF, auth token extraction, and now correlation ID generation + request timing + locale detection for all requests.
- **Error format unification**: All 272 API endpoints now use the shared `handleRouteError()` / `zodErrorResponse()` pattern from `src/server/http/handle-route.ts`. The auto-studio-specific `serverError`/`validationError`/`notFoundError` are deprecated.
- **Cache strategy**: `cacheHeaders(ttl)` applied to 18 read endpoints with tiered TTLs (15-120s). Designed for CDN adoption. Stale-while-revalidate allows background refresh.
- **Parallelization**: 9 independent DB queries across 2 services converted from sequential to `Promise.all`. All are read-only operations against different tables — no transaction concern.

## Relevant Files

### Performance & Optimization Reports
- `docs/performance/enterprise-performance-audit.md` — Phase 8A.1: 43 findings across 7 domains
- `docs/performance/database-optimization-report.md` — Phase 8A.2: 18 indexes, 5 N+1 eliminations, pagination, transactions
- `docs/performance/api-optimization-report.md` — Phase 8A.4: 31 files changed, unified error format, Cache-Control, parallelization

### API Infrastructure
- `src/proxy.ts` — Global edge proxy (auth, rate limiting, CSRF, correlation IDs, timing)
- `src/server/http/handle-route.ts` — Shared route helpers (error handling, validation parsing, cache headers)

## Relevant Files

### Pages
- `src/app/(shell)/automation-studio/page.tsx` — Dashboard with analytics
- `src/app/(shell)/automation-studio/analytics/page.tsx` — Analytics
- `src/app/(shell)/automation-studio/approval-matrix/page.tsx` — Approval Matrix
- `src/app/(shell)/automation-studio/business-rules/page.tsx` — Business Rules
- `src/app/(shell)/automation-studio/scheduler/page.tsx` — Scheduler
- `src/app/(shell)/automation-studio/templates/page.tsx` — Templates
- `src/app/(shell)/automation-studio/designer/page.tsx` — Workflow Designer
- `src/app/(shell)/automation-studio/monitoring/page.tsx` — Monitoring
- `src/app/(shell)/automation-studio/setup/page.tsx` — Enterprise Setup Wizard

### Components
- `automation-dashboard.tsx` — Dashboard with feature tiles, metrics, analytics preview
- `analytics-dashboard.tsx` — Analytics charts, stats, bottlenecks, queue
- `approval-matrix-client.tsx` + `approval-matrix-form.tsx` — List + create/edit
- `business-rules-client.tsx` + `business-rules-form.tsx` — List + create/edit
- `scheduler-client.tsx` + `scheduler-form.tsx` — List + create/edit
- `src/components/onboarding/onboarding-wizard.tsx` — Setup wizard client component
- `src/components/onboarding/onboarding-stepper.tsx` — Step list with progress
- `src/components/onboarding/onboarding-readiness.tsx` — Readiness report display
- `src/components/onboarding/onboarding-dashboard-preview.tsx` — Post-setup dashboard preview
- `src/components/enterprise/forms/` — 15 form system components (EnterpriseForm, EnterpriseSection, EnterpriseField, SmartSelect, ConditionEditor, ApprovalPreview, EnterpriseWizard, ReviewStep, FieldHelp, FieldHint, ValidationSummary, AutoSaveIndicator, UnsavedChangesGuard, types, index)
- `src/components/enterprise/workflow/` — 2 workflow components (WorkflowCanvas, WorkflowToolbar)

### Modules
- `automation-studio.service.ts` — All CRUD + execution methods
- `workflow-analytics.service.ts` — Analytics computation
- `business-rules-builder.ts` — Condition group evaluation
- `approval-matrix-evaluator.ts` — Rule matching, escalation, delegation
- `automation-scheduler.ts` — Trigger management, cron, events
- `condition-evaluator.ts` — Shared evaluation + OPERATOR_MAP
- `enterprise-readiness.service.ts` — 12-domain readiness verification
- `onboarding.service.ts` — Session lifecycle management
- `onboarding-state-machine.ts` — State transition validation
- `setup-registry.ts` — Step definitions and registry
- `validators.ts` — Per-step and session validation
- `steps/integrations-step.ts` — Connector credential validation, health checks, categorization
- `steps/governance-step.ts` — Governance metrics, policies, frameworks
- `steps/ai-step.ts` — AI provider status, models, health monitoring

### API Routes
- `src/app/api/automation-studio/business-rules/route.ts` — POST create
- `src/app/api/automation-studio/approval-matrix/route.ts` — POST create
- `src/app/api/automation-studio/schedules/route.ts` — POST create
- `src/app/api/automation-studio/setup/route.ts` — POST create/start session
- `src/app/api/automation-studio/ai/route.ts` — AI assistant proxy
- `src/app/api/agents/route.ts` — GET list, POST create
- `src/app/api/agents/[id]/route.ts` — GET detail, PUT update, DELETE disable
- `src/app/api/agents/[id]/start/route.ts` — POST start agent
- `src/app/api/agents/[id]/stop/route.ts` — POST stop agent
- `src/app/api/agents/[id]/decisions/route.ts` — GET list, POST create
- `src/app/api/agents/[id]/tasks/route.ts` — GET list, POST create
- `src/app/api/agents/[id]/memory/route.ts` — GET list, POST store
- `src/app/api/agents/[id]/health/route.ts` — GET health + safety report

### Agent Framework
- `src/modules/agent-framework/types.ts` — 560+ lines, 17 type unions, 9 input types
- `src/modules/agent-framework/agent-registry.ts` — Registration, discovery, listing (12 methods)
- `src/modules/agent-framework/agent-runtime.ts` — Lifecycle, sessions, tasks, executions (12 methods)
- `src/modules/agent-framework/agent-context.ts` — Trusted context from 9 sources (10 methods)
- `src/modules/agent-framework/agent-memory.ts` — 5 memory types (11 methods)
- `src/modules/agent-framework/evidence-engine.ts` — Source tracking, verification (8 methods)
- `src/modules/agent-framework/decision-engine.ts` — Structured decisions, approvals (11 methods)
- `src/modules/agent-framework/approval-integration.ts` — Existing approval framework bridge (8 methods)
- `src/modules/agent-framework/collaboration-framework.ts` — Agent delegation with traceability (10 methods)
- `src/modules/agent-framework/human-interaction.ts` — Questions, clarification, feedback (10 methods)
- `src/modules/agent-framework/agent-governance.ts` — Permissions, rate limits, safety (11 methods)
- `src/modules/agent-framework/agent-service.ts` — Facade over all services (10 methods)
- `src/modules/agent-framework/index.ts` — Barrel export
- `src/lib/validations/agent-framework.ts` — Zod validation schemas
- `src/components/agent-framework/` — 12 client components
- `docs/architecture/24-agent-framework.md` — Architecture documentation
- `docs/architecture/25-agent-framework-extension-guide.md` — Extension guide

### AP Domain Architecture (Phase 21A.0)
- `docs/ap/AP_DOMAIN_ARCHITECTURE.md` — Bounded context, context map, module structure, dependency rules, data ownership
- `docs/ap/AP_DOMAIN_MODEL.md` — 25 entities, 18 value objects, ER diagram, data flows
- `docs/ap/AP_AGGREGATES.md` — 11 aggregate roots with invariants, lifecycle, saga patterns
- `docs/ap/AP_STATE_MACHINES.md` — 12 state machines with complete transition tables
- `docs/ap/AP_DOMAIN_EVENTS.md` — 63 domain events across 10 categories
- `docs/ap/AP_COMMAND_QUERY_MODEL.md` — 51 commands, 18 queries, CQRS pattern
- `docs/ap/AP_DOMAIN_INVARIANTS.md` — 137 invariants across 8 categories
- `docs/ap/AP_INTEGRATION_ARCHITECTURE.md` — 10 integration points (GL, Treasury, Approvals, Notifications, Budget, AI, Audit)
- `docs/ap/AP_PERMISSION_MATRIX.md` — 8 roles × 51 commands, SoD rules, threshold authority
- `docs/ap/EDP_21A_0.md` — Engineering decision packet with 10 decisions, alternatives, trade-offs

### AP Persistence Layer (Phase 21A.1)
- `docs/ap/AP_PRISMA_MODELS.md` — Entity classification (25 models, 18 embedded VOs), full Prisma schema specification
- `docs/ap/AP_DATABASE_SCHEMA.md` — Schema documentation, enum types, cascade rules, indexes, migration strategy
- `docs/ap/AP_DATABASE_DECISIONS.md` — 15 persistence design decisions (Procurement prefix, embedded VOs, Decimal(38,12))
- `docs/ap/ER_DIAGRAM_V2.md` — Text-based ER diagram with aggregate boundaries, FK maps, field details
- `docs/ap/EDP_21A_1.md` — Phase 21A.1 engineering decision packet
- `prisma/schema.prisma` — 25 Procurement* models, 33 enums, ~79 indexes, ~40 FK constraints

### AP Application Layer (Phase 21A.2)
- `src/server/procurement/application/types.ts` — Command inputs, results, context, domain events (~335 lines)
- `src/server/procurement/application/vendor-service.ts` — 8 vendor commands (~393 lines)
- `src/server/procurement/application/invoice-service.ts` — 15 invoice commands
- `src/server/procurement/application/exception-service.ts` — 6 exception commands
- `src/server/procurement/application/approval-service.ts` — 6 approval commands
- `src/server/procurement/application/payment-service.ts` — 9 payment commands
- `src/server/procurement/application/reconciliation-service.ts` — 4 reconciliation commands
- `src/server/procurement/application/credit-service.ts` — 3 credit commands
- `src/server/procurement/application/unit-of-work.ts` — Prisma interactive transaction wrapper
- `src/server/procurement/application/index.ts` — Barrel export
- `src/server/procurement/domain/events/event-bus.ts` — In-process typed event bus
- `src/server/procurement/domain/events/event-types.ts` — 63 typed event constructors
- `src/server/procurement/domain/events/index.ts` — Barrel export
- `src/server/procurement/ap-repositories/` — 22 files: 10 interfaces, 10 InMemory, 10 Prisma adapters, registry, types
- `docs/ap/AP_APPLICATION_SERVICES.md` — 7 services, 51 commands documented
- `docs/ap/AP_REPOSITORY_ARCHITECTURE.md` — 22-file repository layer
- `docs/ap/AP_TRANSACTION_BOUNDARIES.md` — Unit of Work pattern
- `docs/ap/AP_DOMAIN_EVENT_FLOW.md` — 63 events, bus architecture
- `docs/ap/AP_COMMAND_EXECUTION_MODEL.md` — 7-layer pipeline, all 51 commands mapped
- `docs/ap/EDP_21A_2.md` — 10 engineering decisions

### AP Domain Implementation Plan (Phase 21.0)
- `docs/ap/ACCOUNTS_PAYABLE_GAP_ANALYSIS.md` — Complete AP capability inventory
- `docs/ap/ACCOUNTS_PAYABLE_WORKFLOW.md` — 14-stage workflow definition
- `docs/ap/ACCOUNTS_PAYABLE_IMPLEMENTATION_PLAN.md` — 4-phase build plan (21A-21D)
- `docs/ap/AP_PERSONA_REVIEW.md` — 7 persona profiles
- `docs/ap/AP_ENTERPRISE_SCORECARD.md` — Enterprise rubric scoring
- `docs/ap/PHASE21_DECISION_PACKET.md` — Phase 21 decisions, trade-offs, risks

### Brain — Knowledge Platform
- `brain/00-Constitution/KNOWLEDGE_CONSTITUTION.md` — Supreme governing document (10 core laws, authority hierarchy)
- `brain/00-Constitution/PAGE_STANDARDS.md` — Mandatory page template and quality requirements
- `brain/00-Constitution/KNOWLEDGE_GRAPH_GUIDE.md` — Relationship types, graph metrics, 5 knowledge clusters
- `brain/00-Constitution/BRAIN_ARCHITECTURE.md` — 20-folder design, page requirements, content lifecycle
- `brain/00-Constitution/EDP_25_0.md` — Phase 25.0 engineering decision packet
- `brain/03-Customer Intelligence/` — People, Companies, Interviews, Pain Points, Evidence, Hypotheses, Competitive Signals
- `brain/03-Customer Intelligence/CUSTOMER_INTELLIGENCE_GUIDE.md` — Knowledge model, evidence confidence, CRM alignment
- `brain/17-Lessons/` — 56 engineering/product lessons (01-56)
- `brain/11-Decisions/decision-network.md` — Principles 1-33, ADRs 1-33
- `brain/12-Roadmaps/evolution-timeline.md` — 28 phases documented (1,900+ lines)
- `brain/BRAIN_HEALTH_REPORT.md` — ~195 files, ~17,000 lines, 84%+ frontmatter coverage

### Enterprise Product Specification v2.0 (Phase 27.1)
- `docs/product/eps/ENTERPRISE_PRODUCT_SPECIFICATION_AP.md` — Master spec v2.0 (622 lines)
- `docs/product/eps/REFERENCE_WORKFLOW_AP.md` — 10-stage workflow (698 lines)
- `docs/product/eps/USER_JOURNEY_LIBRARY.md` — 10 user journeys (1,533 lines)
- `docs/product/eps/BUSINESS_RULE_LIBRARY.md` — 65 business rules (1,195 lines)
- `docs/product/eps/PRODUCT_PRINCIPLES.md` — 10 canonical principles (334 lines)
- `docs/product/eps/INFORMATION_ARCHITECTURE.md` — 20 screens (775 lines)
- `docs/product/eps/AI_BEHAVIOUR_GUIDE.md` — 8 AI actions (636 lines)
- `docs/product/eps/DESIGN_SYSTEM_GUIDE.md` — 3 density modes (684 lines)
- `docs/product/eps/CUSTOMER_VALIDATION_PLAN.md` — Design partner program (852 lines)
- `docs/product/eps/OPEN_PRODUCT_HYPOTHESES.md` — 14 open hypotheses (467 lines)
- `docs/product/eps/SUCCESS_METRICS.md` — 12 success metrics (448 lines)
- `docs/product/eps/WORKFLOW_STATE_MACHINE.md` — 5 state machines (464 lines)
- `docs/product/eps/EDP_27_1.md` — Engineering decision packet (402 lines)

### Enterprise Product Review (Phase 27.1R)
- `docs/product/review/PRODUCT_REVIEW_REPORT.md` — Verdict: Conditionally approve for prototyping
- `docs/product/review/PRODUCT_READINESS_SCORECARD.md` — 12-dimension scorecard (6.75/10)
- `docs/product/review/PRODUCT_RISK_REGISTER.md` — 20 risks ranked (2 Critical)
- `docs/product/review/PRODUCT_DEBT_REGISTER.md` — 27 debt items (3 P0)
- `docs/product/review/COGNITIVE_LOAD_REVIEW.md` — 10 recommendations for cognitive load reduction
- `docs/product/review/BUSINESS_RULE_AUDIT.md` — 65 rules audited (CONDITIONAL PASS)
- `docs/product/review/AI_TRUST_REVIEW.md` — 8 AI actions reviewed (CONDITIONAL PASS)
- `docs/product/review/CUSTOMER_TRACEABILITY_AUDIT.md` — Only 1 formal interview supports entire spec
- `docs/product/review/PRODUCT_SIMPLIFICATION_REPORT.md` — MVP proposal: 65→25 rules
- `docs/product/review/PHASE_27_1R_EXECUTIVE_SUMMARY.md` — Top 10 findings
- `docs/product/review/EDP_27_1R.md` — 8 key decisions pending PAB sign-off
