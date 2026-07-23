# AGENTS.md — Perionyx Enterprise Software

## Build & Verify Commands

```bash
pnpm typecheck     # TypeScript strict mode — must pass before any commit
pnpm build         # Production build — must pass before any commit
pnpm test          # Test suite (currently 443/443 pass via vitest)
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

### Phase 22.0A — Public Platform Architecture (Complete)
- **Scope**: 25 documents defining the complete public-facing website architecture — zero code, all design
- **Documents**: WEBSITE_INFORMATION_ARCHITECTURE, SITE_MAP (97 URLs), PAGE_HIERARCHY (71 pages), NAVIGATION_MODEL (global nav + mega menus + mobile + footer + Cmd+K), CONTENT_STRATEGY (6 pillars), CONTENT_GOVERNANCE (RACI), PUBLIC_CONTENT_POLICY (CAN/CANNOT publish), SEO_STRATEGY, KEYWORD_STRATEGY (60+ keywords), DESIGN_LANGUAGE (PEDL extension), BRANDING_GUIDELINES, VISUAL_DIRECTION (hero concepts + scroll behaviors), MOTION_SYSTEM (page-level + component-level specs), ILLUSTRATION_GUIDE (diagram style, no stock), ICONOGRAPHY_GUIDE (Lucide + custom product icons), ACCESSIBILITY_GUIDE (WCAG 2.1 AA), COPYWRITING_GUIDE (voice pillars + headline formulas), MICROCOPY_GUIDE (buttons, forms, validation, tooltips), CALL_TO_ACTION_STRATEGY (hierarchy + placement + A/B tests), USER_JOURNEYS (8 persona journeys), COMPETITOR_WEBSITE_ANALYSIS (8 competitors), REFERENCE_EXPERIENCE (curated web inspirations), CONTENT_BRIEFS (10 priority page briefs), WEBSITE_ROADMAP (5-phase, 16-week plan), EDP_22_0A (10 key decisions)
- **Key Decisions**: Brain is source of truth (website = curated public view), dark-first (#040404) + gold accent (#d4af37), no stock imagery, Inter + JetBrains Mono, WCAG 2.1 AA, 97 URLs across 9 sections, 16-week phased rollout
- **Brain**: Lesson 38 (Brain→Public Content Pipeline), Principle #14 in Decision Network, evolution timeline entry

### Upcoming (Phase 8+)
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

### Brain — Lessons
- `brain/05-Engineering/Lessons/32-domain-scaffolding-is-not-domain.md` — Domain scaffolding is not domain functionality
- `brain/05-Engineering/Lessons/33-domain-architecture-precedes-implementation.md` — Domain architecture design precedes implementation
- `brain/05-Engineering/Lessons/34-entity-classification-prevents-over-schema.md` — Entity classification prevents over-schema
- `brain/05-Engineering/Lessons/35-command-handlers-encode-business-rules.md` — Command handlers encode business rules, not infrastructure
- `brain/11-ADR/decision-network.md` — Principles 1-11 (Principle #8: Scaffolding ≠ functionality, Principle #9: Architecture before code, Principle #10: Entity classification before schema, Principle #11: Application services own business rules)
- `brain/12-Roadmaps/evolution-timeline.md` — Phase 21.0 + 21A.0 + 21A.1 + 21A.2 entries
