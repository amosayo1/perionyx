# Bundle Analysis

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Tool**: `@next/bundle-analyzer` via `pnpm analyze`

---

## 1. Platform Scale

| Metric | Count |
|---|---|
| Total pages | 306 |
| Route groups | 46 |
| Client components | 180+ |
| Server components | 250+ |
| Production chunks (gzip) | 112 |
| Total JS bundle (gzip) | 312 KB |

---

## 2. Page Counts per Module

| Module | Pages | Route Group | Bundle Share |
|---|---|---|---|
| Automation Studio | 11 | `(shell)/automation-studio` | 12.3% |
| Enterprise (executive) | 15 | `(shell)/enterprise` | 18.7% |
| Treasury | 28 | `(shell)/treasury` | 22.1% |
| Mobile | 15 | `mobile/`, `(shell)/mobile-dashboard` | 4.2% |
| Setup / Onboarding | 6 | `(shell)/automation-studio/setup` | 3.1% |
| Shared layouts | — | `(shell)/layout.tsx` | 8.4% |
| Auth / Identity | 12 | `(auth)` | 6.8% |
| Other | 219 | Remaining groups | 24.4% |

---

## 3. Largest Client Components (gzip)

| Component | Size | Note |
|---|---|---|
| `WorkflowCanvas` | 24.3 KB | Canvas rendering + zoom/pan/minimap |
| `DataTable` + `EnterpriseTable` | 18.7 KB | Virtualization + sort + filter + inline edit |
| `NotificationCenter` | 12.1 KB | AnimatePresence + action handlers |
| `OnboardingWizard` | 11.5 KB | Multi-step wizard controller |
| `AnalyticsDashboard` | 9.8 KB | Chart orchestration + toolbar |
| `ApprovalAnalytics` | 8.4 KB | Donut + stacked bars |
| `EnterpriseForm` | 8.1 KB | Auto-save + validation system |
| `MobileNotificationCenter` | 7.2 KB | Deep-link + action handlers |
| `SmartSelect` | 6.4 KB | Searchable grouped multi-select |
| `AnimatedMetric` | 5.9 KB | Counter animation + trend arrows |
| `WorkflowToolbar` | 5.7 KB | Undo/redo + alignment + shortcuts |

---

## 4. Tree-Shaking Audit

All imports use named exports for barrel files to enable tree-shaking:

```tsx
// Correct — tree-shakeable
import { BusinessRule } from '@/modules/automation-studio/types';
import { fadeInUp, stagger } from '@/components/enterprise/motion/tokens';

// Avoid — imports entire barrel
import * as Types from '@/modules/automation-studio/types';
```

**Suspicious imports** (resolved in 8B.4):
- **framer-motion**: only `motion`, `AnimatePresence`, `useMotionValue` used — tree-shaken from v12.42.1
- **next-intl**: only `useTranslations`, `NextIntlClientProvider` used
- **ioredis**: only `Redis` class used — rest tree-shaken

---

## 5. Dependency Audit

| Dependency | Version | Bundle Share | Notes |
|---|---|---|---|
| `framer-motion` | 12.42.1 | 28.3 KB | Largest dep; tree-shaken to 18 KB |
| `next-intl` | 4.13.1 | 6.2 KB | i18n framework |
| `zod` | ^3.23 | 4.1 KB | Validation, tree-shakeable |
| `date-fns` | ^4.1 | 3.8 KB | Tree-shakeable imports |
| `ioredis` | ^5.4 | 2.1 KB | Server-side only |
| `pgboss` | ^10.0 | 1.4 KB | Server-side only |

---

## 6. Chunk Optimization

```
▲ $ next build
✓ Compiled successfully
✓ Linting passed
✓ Type check passed

Route (app)                              Size (gzip)
+ First Load JS (shared)                 89.6 kB
  ├── (shell)/layout.tsx                 32.1 kB
  ├── (shell)/automation-studio/page     45.2 kB
  ├── (shell)/automation-studio/analytics 52.8 kB
  ├── (shell)/automation-studio/designer  68.4 kB
  + 112 chunks (312.4 kB total)

Chunks >10 KB:
  chunk-K7a3W8eN [metadata-dashboard]    14.2 kB
  chunk-pL9mN2cV [canvas-engine]         24.3 kB
  chunk-R5tB4fGh [table-system]          18.7 kB
  chunk-X2yZ1vAb [notification]          12.1 kB
  chunk-J8kQ6wLm [form-system]           11.5 kB
```

---

## 7. Using the Bundle Analyzer

```bash
# Generate interactive treemap
pnpm analyze

# The treemap opens at http://localhost:8888
# Compare client.js, server.js, edge.js tabs
# Identify unexpected duplications
```

**Run commands:**

```bash
pnpm build               # Standard build
ANALYZE=true pnpm build  # Build + bundle analysis
pnpm analyze             # Open analyzer server
```

---

## 8. Bundle Budgets (CI Enforcement)

| Check | Threshold | Current | Status |
|---|---|---|---|
| `First Load JS` | <120 KB | 89.6 KB | ✅ |
| `Total JS (gzip)` | <400 KB | 312.4 KB | ✅ |
| `Max single chunk` | <80 KB | 24.3 KB (canvas) | ✅ |
| `Duplicate modules` | 0 | 0 | ✅ |
