# Perionyx Navigation Guide

Navigation architecture for the Perionyx enterprise platform. Workflow-based sections reduce cognitive load by organizing ~84 nav entries (down from 224) into 7 logical groups.

---

## Table of Contents

1. [Sidebar Navigation](#sidebar-navigation)
2. [Top Bar](#top-bar)
3. [Command Palette](#command-palette)
4. [Mobile Navigation](#mobile-navigation)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Role-Based Access](#role-based-access)
7. [Workspace Switching](#workspace-switching)

---

## Sidebar Navigation

The sidebar is the primary navigation surface. It persists across all pages and provides consistent access to all platform features.

### Structure

```
┌────────────────────────────┐
│  [Logo] Perionyx           │
│  ───────────────────────── │
│  [Workspace Switcher ▼]    │
│  Acme Corporation          │
│  ───────────────────────── │
│  ★ Favorites               │
│  ⏱ Recent                  │
│  ───────────────────────── │
│  📊 Executive Office       │
│  💰 Financial Operations   │
│  🏦 Treasury               │
│  📈 Planning & Strategy    │
│  🛡 Governance/Risk/Compl. │
│  🤖 Intelligence & Autom.  │
│  ⚙ Administration          │
│  ───────────────────────── │
│  [Help]  [Settings]        │
└────────────────────────────┘
```

### Section 1: Executive Office

The command center for C-suite decision-making.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Dashboard | `/dashboard` | LayoutDashboard | Executive overview with KPIs, alerts, activity |
| Executive Summary | `/executive/summary` | FileText | Consolidated financial position report |
| Approvals | `/approvals` | CheckCircle | Pending approvals requiring executive action |
| Notifications | `/notifications` | Bell | System alerts, policy violations, escalations |

### Section 2: Financial Operations

Core financial workflows — the daily operating system for finance teams.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Ledger | `/ledger` | BookOpen | General ledger entries and journal views |
| Transactions | `/transactions` | ArrowLeftRight | All financial transactions with filters |
| Accounts Payable | `/accounts-payable` | Receipt | Vendor bills, payment runs, approval chains |
| Accounts Receivable | `/accounts-receivable` | FileText | Customer invoices, collections, aging |
| Reconciliation | `/reconciliation` | RefreshCw | Bank reconciliation and matching |
| Payments | `/payments` | CreditCard | Payment processing, batch payments, status |
| Audit Logs | `/audit-logs` | Shield | Immutable audit trail of all actions |
| Incidents | `/incidents` | AlertTriangle | Security and operational incidents |

### Section 3: Treasury

Cash management, liquidity, and investment oversight.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Treasury Dashboard | `/treasury` | Landmark | Cash positions, liquidity, forecasts |
| Cash Positions | `/treasury/cash-positions` | Wallet | Real-time cash across all accounts |
| Cash Flow | `/treasury/cash-flow` | TrendingUp | Inflows, outflows, and projections |
| Investments | `/treasury/investments` | PiggyBank | Investment portfolio and returns |
| Banking | `/treasury/banking` | Building2 | Bank connections, accounts, feeds |
| FX & Risk | `/treasury/fx-risk` | Globe | Foreign exchange exposure and hedging |
| Compliance | `/treasury/compliance` | Scale | Treasury policy compliance |

### Section 4: Planning & Strategy

Budgeting, forecasting, and strategic planning.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Budgets | `/planning/budgets` | PieChart | Budget creation, tracking, variance |
| Forecasts | `/planning/forecasts` | LineChart | Financial forecasting models |
| Scenarios | `/planning/scenarios` | GitBranch | What-if analysis and scenario planning |
| Reports | `/reports` | FileBarChart | Generated financial reports |
| Analytics | `/analytics` | BarChart3 | Cross-functional analytics and insights |

### Section 5: Governance, Risk & Compliance

Policy enforcement, risk management, and regulatory compliance.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Governance Dashboard | `/governance` | Shield | Policy health, violations, compliance score |
| Policies | `/governance/policies` | Scroll | Policy definitions and framework management |
| Risk Register | `/governance/risks` | AlertOctagon | Risk assessment, mitigation, tracking |
| Compliance | `/governance/compliance` | Scale | Regulatory compliance monitoring |
| Workflows | `/governance/workflows` | GitMerge | Approval workflows and escalation chains |

### Section 6: Intelligence & Automation

AI-powered insights, automated workflows, and intelligent processing.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| AI Dashboard | `/ai` | Brain | AI model status, usage, recommendations |
| Automation Studio | `/automation-studio` | Zap | Workflow builder, templates, triggers |
| Business Rules | `/automation-studio/business-rules` | Cog | Conditional logic and rule management |
| Approval Matrix | `/automation-studio/approval-matrix` | CheckSquare | Multi-level approval configuration |
| Scheduler | `/automation-studio/scheduler` | Clock | Automated task scheduling |
| Agent Framework | `/agents` | Bot | Autonomous agent management |

### Section 7: Administration

System configuration, user management, and platform settings.

| Nav Entry | Route | Icon | Description |
|---|---|---|---|
| Settings | `/settings` | Settings | General platform settings |
| Users | `/settings/users` | Users | User management, roles, permissions |
| Integrations | `/settings/integrations` | Plug | Bank connections, ERP, third-party |
| Deployment | `/system/deployment` | Server | System health, deployment status |
| Identity | `/system/identity` | Key | IAM, SSO, authentication settings |

### Favorites & Recent

- **Favorites**: User-pinned nav entries. Stored in `localStorage`. Max 8 items.
- **Recent**: Last 5 visited routes. Auto-updated on navigation. Stored in `localStorage`.

---

## Top Bar

The top bar provides context and global actions.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [☰]  Dashboard > Treasury > Cash Positions    [Cmd+K 🔍]  │
│                                    [Acme ▼]  [🔔 3]  [JD ▼] │
└──────────────────────────────────────────────────────────────┘
```

### Components

| Component | Position | Description |
|---|---|---|
| Sidebar toggle | Left | Collapses/expands sidebar (mobile only) |
| Breadcrumbs | Center-left | Auto-generated from URL segments |
| Search trigger | Center-right | Opens command palette (Cmd+K) |
| Company switcher | Right | Workspace/tenant switcher dropdown |
| Notifications | Right | Bell icon with unread count badge |
| User menu | Right | Avatar + name, dropdown with profile/settings/logout |

### Breadcrumbs

Auto-generated from URL path segments using `LABEL_MAP`:

| Segment | Label |
|---|---|
| `dashboard` | Dashboard |
| `treasury` | Treasury |
| `cash-positions` | Cash Positions |
| `cash-flow` | Cash Flow |
| `settings` | Settings |
| `users` | Users |
| `integrations` | Integrations |
| `automation-studio` | Automation Studio |
| `business-rules` | Business Rules |
| `approval-matrix` | Approval Matrix |
| `scheduler` | Scheduler |
| `agents` | Agent Framework |
| `governance` | Governance |
| `compliance` | Compliance |
| `analytics` | Analytics |
| `reports` | Reports |
| `ledger` | Ledger |
| `transactions` | Transactions |
| `approvals` | Approvals |
| `notifications` | Notifications |
| `system` | System |
| `deployment` | Deployment |
| `identity` | Identity |

Clicking a breadcrumb navigates to that level. The final segment is not clickable (it's the current page).

---

## Command Palette

Global command palette triggered by `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux).

### Behavior

1. Opens with backdrop blur overlay
2. Search input auto-focused
3. Results update on debounced input (200ms)
4. Keyboard navigation: Arrow Up/Down to navigate, Enter to select, Escape to close
5. Recent searches shown when input is empty

### Search Scope

The command palette searches across:

| Scope | Examples |
|---|---|
| Navigation | All ~84 nav entries with fuzzy matching |
| Pages | Dashboard, reports, settings pages |
| Actions | Create transaction, Export report, Run forecast |
| Entities | Specific transactions, invoices, accounts (by ID/description) |
| Settings | User settings, integrations, configuration |
| Help | Documentation pages, keyboard shortcuts |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` | Open command palette |
| `Escape` | Close command palette |
| `Arrow Up/Down` | Navigate results |
| `Enter` | Select highlighted result |
| `Tab` | Switch between search scopes |

### Result Display

Results are grouped by category with icons:

```
┌─────────────────────────────────────────────┐
│  🔍  Search navigation, actions, entities... │
├─────────────────────────────────────────────┤
│  Navigation                                  │
│    📊  Dashboard                             │
│    🏦  Treasury > Cash Positions             │
│    💰  Financial Operations > Transactions   │
│                                             │
│  Actions                                     │
│    ➕  Create Transaction                    │
│    📤  Export Report                         │
│                                             │
│  Recent                                      │
│    ⏱  Treasury Dashboard                    │
│    ⏱  Approvals                             │
└─────────────────────────────────────────────┘
```

---

## Mobile Navigation

### Bottom Navigation Bar

On mobile (< 768px), the sidebar is replaced with a bottom navigation bar.

| Tab | Icon | Route | Badge |
|---|---|---|---|
| Dashboard | LayoutDashboard | `/dashboard` | None |
| Timeline | Clock | `/timeline` | Unread count |
| Approvals | CheckCircle | `/approvals` | Pending count |
| AI | Brain | `/ai` | None |
| Profile | User | `/profile` | None |

- Active state: gold color + filled icon
- Inactive state: `text-tertiary` color + outline icon
- Touch target: minimum 44px x 44px
- Safe area padding for iPhone notch/home indicator

### Horizontal Scroll Pills

For page-level navigation on mobile (e.g., tab bars within a page):

- Horizontal scrolling container with momentum scrolling
- Active pill: `gold` background, `text-primary` text
- Inactive pill: `surface-tertiary` background, `text-secondary` text
- Scroll hint: gradient fade on right edge

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `Cmd+K` | Open command palette | Global |
| `Cmd+N` | Create new (context-aware) | Global |
| `Cmd+F` | Open filter/search | List/table pages |
| `Cmd+S` | Save current form | Form pages |
| `?` | Open keyboard shortcuts dialog | Global |
| `Escape` | Close dialog/modal/popover | Global |
| `Tab` | Move focus forward | Global |
| `Shift+Tab` | Move focus backward | Global |
| `Enter` | Activate focused element | Global |
| `Space` | Toggle checkbox/button | Global |
| `Arrow Up/Down` | Navigate list items | Lists, menus |
| `Arrow Left/Right` | Navigate tabs, tree items | Tabs, trees |
| `Home` | Jump to first item | Lists, tables |
| `End` | Jump to last item | Lists, tables |

### Table Shortcuts

| Shortcut | Action |
|---|---|
| `Arrow Up/Down` | Navigate rows |
| `Space` | Toggle row selection |
| `Shift+Click` | Range select |
| `Cmd+A` | Select all |
| `Escape` | Clear selection |
| `Enter` | Open selected row |

### Form Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (on last field) |
| `Escape` | Cancel / close form |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |

### Workflow Canvas Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Scroll` | Zoom in/out |
| `Cmd+0` | Reset zoom |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+S` | Save workflow |
| `Delete/Backspace` | Delete selected |
| `Escape` | Deselect all |

---

## Role-Based Access

### Role Hierarchy

```
OWNER (full access)
  └── ADMIN (management access)
        └── TREASURER (treasury + financial operations)
              └── MEMBER (standard access)
                    └── VIEWER (read-only access)
```

### Section Access by Role

| Section | OWNER | ADMIN | TREASURER | MEMBER | VIEWER |
|---|---|---|---|---|---|
| Executive Office | ✅ | ✅ | ✅ | ⚠️ Limited | ⚠️ Limited |
| Financial Operations | ✅ | ✅ | ✅ | ✅ | 👁 Read |
| Treasury | ✅ | ✅ | ✅ | ⚠️ Limited | 👁 Read |
| Planning & Strategy | ✅ | ✅ | ✅ | ⚠️ Limited | 👁 Read |
| Governance/Risk/Compliance | ✅ | ✅ | ✅ | ⚠️ Limited | 👁 Read |
| Intelligence & Automation | ✅ | ✅ | ✅ | ⚠️ Limited | 👁 Read |
| Administration | ✅ | ✅ | ❌ | ❌ | ❌ |

### Permission Enforcement

- Nav entries are filtered by role before rendering
- Routes are protected by middleware + server-side auth checks
- API endpoints validate permissions via `requirePermission()` guards
- UI components conditionally render action buttons based on permissions

---

## Workspace Switching

Multi-tenant support with workspace switching.

### Sidebar Workspace Switcher

- Position: Below logo, above favorites
- Displays current workspace name
- Dropdown lists all accessible workspaces
- Selecting a workspace calls `session.update({ workspaceId })`
- Page reloads with new workspace context

### Top Bar Company Switcher

- Position: Right side of top bar
- Displays current company/workspace name
- Dropdown lists all accessible companies
- Selecting a company calls `session.update({ companyId })`
- All data reloads with new tenant context

### Behavior

- Workspace switching is async — shows loading state during transition
- All cached data is invalidated on workspace switch
- URL is preserved across workspace switch (same route, different context)
- Recent items and favorites are per-workspace
- User permissions are re-evaluated on workspace switch

---

## Navigation State

### Persistence

| State | Storage | Scope |
|---|---|---|
| Sidebar collapsed | `localStorage` | Global |
| Section expanded/collapsed | `localStorage` | Per-section |
| Favorites | `localStorage` | Per-workspace |
| Recent | `localStorage` | Per-workspace |
| Active filters | URL query params | Per-page |
| Sort state | URL query params | Per-page |
| Density | `localStorage` | Global |

### URL Structure

All routes follow the pattern: `/:section/:subsection/:id?`

Examples:
- `/treasury/cash-positions/cp_123` — specific cash position
- `/settings/users/usr_456` — specific user settings
- `/automation-studio/business-rules/br_789` — specific business rule

Query parameters for filters, sorts, and views:
- `?page=2&pageSize=50` — pagination
- `?sort=amount&order=desc` — sorting
- `?status=active&type=wire` — filtering
- `?view=saved-123` — saved view
