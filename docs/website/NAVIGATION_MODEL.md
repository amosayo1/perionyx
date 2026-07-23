# Perionyx Public Website — Navigation Model

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Design Language**: PEDL v1.0 (dark-first, gold accent, glass surfaces)

---

## 1. Global Navigation

### 1.1 Top-Level Items

7 items. Each is a top-level link with a mega menu on hover/click.

| # | Label | URL | Icon | Has Mega Menu |
|---|---|---|---|---|
| 1 | Product | `/product` | Layers | Yes |
| 2 | Platform | `/platform` | Server | Yes |
| 3 | Security | `/security` | Shield | Yes |
| 4 | AI | `/ai` | Brain | Yes |
| 5 | Engineering | `/engineering` | Code | Yes |
| 6 | Research | `/research` | BookOpen | Yes |
| 7 | Company | `/company` | Building2 | Yes |

### 1.2 Fixed Utility Items (Right Side)

| # | Label | URL | Style |
|---|---|---|---|
| 1 | Changelog | `/changelog` | Ghost button |
| 2 | Status | `/status` | Ghost button with green dot if operational |
| 3 | Log In | `/login` | Secondary button |
| 4 | Book a Demo | `/demo` | Primary gold button (`bg-[#d4af37] text-black`) |

### 1.3 Global Nav Behavior

- **Position**: Fixed top, `h-16` (64px) on public site (smaller than app's 92px topbar)
- **Background**: `bg-[#040404]/95 backdrop-blur-xl border-b border-white/[0.06]`
- **Logo**: Left-aligned, Perionyx wordmark with gold mark, links to `/`
- **Active state**: Gold text (`text-[#d4af37]`) with gold underline (`border-b-2 border-[#d4af37]`)
- **Hover state**: Text transitions from `text-zinc-400` to `text-white`
- **Scroll behavior**: Compact on scroll (reduce height to 56px, tighter padding)
- **Z-index**: `z-50`
- **Mobile**: Hamburger menu → slide-out drawer (see §3)

### 1.4 Active State Logic

- **Exact match**: `/product` highlights "Product"
- **Nested match**: `/product/treasury` highlights "Product"
- **No match on utility**: Changelog, Status never highlight in main nav
- **Visual indicator**: 2px gold bottom border on active item, `text-[#d4af37]`

---

## 2. Mega Menus

Each mega menu follows a consistent structure: 2-3 columns + optional featured content panel. All mega menus use glass surface styling.

### 2.0 Mega Menu Base Styles

```
Background: bg-[#090909]/98 backdrop-blur-2xl border border-white/[0.06] rounded-xl shadow-2xl
Width: max-w-5xl (1024px)
Padding: p-6
Animation: fadeIn 150ms ease-out
Overlay: Optional click-away dismiss
```

### 2.1 Product Mega Menu

| Column | Items |
|---|---|
| **Domains** | Accounts Payable → `/product/accounts-payable` |
| | Accounts Receivable → `/product/accounts-receivable` |
| | Treasury → `/product/treasury` |
| | Approvals → `/product/approvals` |
| **Intelligence** | Executive Intelligence → `/product/executive-intelligence` |
| | General Ledger → `/product/general-ledger` |
| | Cash Management → `/product/cash-management` |
| | Risk → `/product/risk` |
| **Governance** | Compliance → `/product/compliance` |
| | Reconciliation → `/product/reconciliation` |
| | Audit Trail → `/product/audit` |
| **Featured** | Card with icon + "12 integrated modules. One platform." + CTA "See All Products →" linking to `/product` |

### 2.2 Platform Mega Menu

| Column | Items |
|---|---|
| **Architecture** | Architecture Overview → `/platform/architecture` |
| | Performance → `/platform/performance` |
| | Reliability → `/platform/reliability` |
| | Infrastructure → `/platform/infrastructure` |
| **Connectivity** | Integrations → `/platform/integrations` |
| | Connectors → `/platform/connectors` |
| | API → `/platform/api` |
| | Developer → `/platform/developer` |
| **Operations** | Deployment → `/platform/deployment` |
| | Observability → `/platform/observability` |
| | Security Architecture → `/platform/security` |
| **Featured** | Card with icon + "392 API routes. 67 modules. 338 data models." + CTA "Explore Architecture →" linking to `/platform` |

### 2.3 Security Mega Menu

| Column | Items |
|---|---|
| **Authentication** | Authentication & MFA → `/security/authentication` |
| | Access Control (RBAC + ABAC) → `/security/authorization` |
| | Multi-Tenancy → `/security/multi-tenancy` |
| **Protection** | Data Encryption → `/security/encryption` |
| | API Security → `/security/api-security` |
| | Infrastructure Security → `/security/infrastructure` |
| **Governance** | Tamper-Evident Audit → `/security/audit-trail` |
| | Compliance Roadmap → `/security/compliance` |
| | Dependency Scanning → `/security/dependency-scanning` |
| | Incident Response → `/security/incident-response` |
| **Featured** | Card with icon + "Zero Critical findings. AES-256-GCM. MFA." + CTA "Security Overview →" linking to `/security` |

### 2.4 AI Mega Menu

| Column | Items |
|---|---|
| **Capabilities** | AI Capabilities → `/ai/capabilities` |
| | Explainability → `/ai/explainability` |
| | Benchmarks → `/ai/benchmarks` |
| **Architecture** | Providers → `/ai/providers` |
| | Models → `/ai/models` |
| | Governance → `/ai/governance` |
| **Trust** | Privacy → `/ai/privacy` |
| | Roadmap → `/ai/roadmap` |
| **Featured** | Card with icon + "Evidence-first AI. Humans stay in control." + CTA "AI Overview →" linking to `/ai` |

### 2.5 Engineering Mega Menu

| Column | Items |
|---|---|
| **Write-ups** | Architecture Decisions → `/engineering/architecture` |
| | Performance Engineering → `/engineering/performance` |
| | Testing Strategy → `/engineering/testing` |
| | Infrastructure Engineering → `/engineering/infrastructure` |
| **Community** | Open Source → `/engineering/open-source` |
| | Contribute → `/engineering/contribute` |
| | Blog → `/engineering/blog` |
| **Featured** | Card with icon + "443 tests. 15 categories. Zero flakiness." + CTA "Read the Blog →" linking to `/engineering` |

### 2.6 Research Mega Menu

Single column (no featured panel — content is simpler).

| Items |
|---|
| Research Insights → `/research/insights` |
| Customer Stories → `/research/customer-stories` |
| Market Analysis → `/research/market` |

### 2.7 Company Mega Menu

Single column.

| Items |
|---|
| About → `/company` |
| Mission → `/company/mission` |
| Team → `/company/team` |
| Careers → `/company/careers` |
| Press & Media → `/company/press` |
| Contact → `/company/contact` |
| Partners → `/company/partners` |
| Legal → `/company/legal` |

---

## 3. Mobile Navigation

### 3.1 Mobile Top Bar

- **Logo**: Left-aligned, wordmark only
- **Right side**: Status dot (green/red) + Hamburger button
- **Height**: `h-14` (56px)
- **Background**: Same as desktop (`bg-[#040404]/95 backdrop-blur-xl`)

### 3.2 Slide-Out Drawer (Mobile Menu)

Triggered by hamburger button. Slides in from right.

```
Background: bg-[#040404] border-l border-white/[0.06]
Width: 85vw (max 360px)
Animation: slide-in-from-right 300ms ease-out
Overlay: bg-black/60 backdrop-blur-sm
Close: X button (top-right) + tap overlay + Escape key
```

**Structure**:

| Section | Items |
|---|---|
| **Primary** | Product → `/product` |
| | Platform → `/platform` |
| | Security → `/security` |
| | AI → `/ai` |
| | Engineering → `/engineering` |
| | Research → `/research` |
| | Company → `/company` |
| **Utility** | Changelog → `/changelog` |
| | Status → `/status` |
| | Log In → `/login` |
| **CTA** | Book a Demo → `/demo` (full-width gold button) |

**Styling**:
- Items: `flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.03] rounded-lg mx-3`
- Section dividers: `border-t border-white/[0.06] my-3`
- CTA: `mx-3 mt-4 bg-[#d4af37] text-black text-sm font-semibold rounded-lg px-4 py-3 text-center`

### 3.3 Bottom Navigation Bar (Mobile)

Visible on mobile only (below 768px). Fixed bottom.

| # | Label | Icon | URL |
|---|---|---|---|
| 1 | Home | Home | `/` |
| 2 | Product | Layers | `/product` |
| 3 | Book Demo | Calendar | `/demo` |
| 4 | Security | Shield | `/security` |
| 5 | More | Menu | (opens drawer) |

**Styling**:
- Height: `h-16` (64px) + safe area padding (`pb-safe`)
- Background: `bg-[#040404]/98 backdrop-blur-xl border-t border-white/[0.06]`
- Active: `text-[#d4af37]` with gold dot indicator above icon
- Inactive: `text-zinc-500`
- Book Demo: Larger gold circle icon, elevated

---

## 4. Footer

### 4.1 Layout

4-column grid on desktop. Stacked on mobile.

```
Background: bg-[#090909] border-t border-white/[0.06]
Padding: py-12 px-8 (desktop), py-8 px-6 (mobile)
Max width: max-w-7xl mx-auto
```

### 4.2 Column Structure

| Column | Title | Links |
|---|---|---|
| **Product** | Product | Overview → `/product` |
| | | Accounts Payable → `/product/accounts-payable` |
| | | Treasury → `/product/treasury` |
| | | Approvals → `/product/approvals` |
| | | Executive Intelligence → `/product/executive-intelligence` |
| | | General Ledger → `/product/general-ledger` |
| **Platform** | Platform | Architecture → `/platform/architecture` |
| | | Performance → `/platform/performance` |
| | | API → `/platform/api` |
| | | Security → `/security` |
| | | AI → `/ai` |
| | | Engineering → `/engineering` |
| **Company** | Company | About → `/company` |
| | | Careers → `/company/careers` |
| | | Contact → `/company/contact` |
| | | Partners → `/company/partners` |
| | | Press → `/company/press` |
| | | Legal → `/company/legal` |
| **Resources** | Resources | Changelog → `/changelog` |
| | | Roadmap → `/roadmap` |
| | | Status → `/status` |
| | | Research → `/research` |
| | | Privacy Policy → `/privacy` |
| | | Terms of Service → `/terms` |

### 4.3 Footer Bottom Row

| Element | Position | Content |
|---|---|---|
| Logo | Left | Perionyx wordmark (small) |
| Social links | Center-left | GitHub, LinkedIn, Twitter/X icons |
| Newsletter | Center | Email input + Subscribe button |
| Copyright | Right | "© 2026 Perionyx. All rights reserved." |
| Disclosure | Far right | "Responsible Disclosure →" link |

**Newsletter Styling**:
- Input: `bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600`
- Button: `bg-[#d4af37] text-black text-sm font-semibold rounded-lg px-4 py-2.5`
- Container: `flex gap-2 max-w-sm`

**Social Icon Styling**:
- Icons: `h-5 w-5 text-zinc-500 hover:text-[#d4af37] transition-colors`
- Spacing: `gap-4`

---

## 5. Breadcrumbs

### 5.1 Format

```
Home > Section > Page
```

- Separator: `>` (chevron-right icon, `ChevronRight`, `h-3 w-3 text-zinc-600`)
- Home: Always "Home" linking to `/`
- Current page: `text-white` (not a link)
- Parent pages: `text-zinc-400 hover:text-white`

### 5.2 Breadcrumb Pages

Only on pages with depth ≥ 2 (sub-pages of sections). NOT on hub pages (`/product`, `/platform`, etc.) or `/` itself.

| Page | Breadcrumb |
|---|---|
| `/product/accounts-payable` | Home > Product > Accounts Payable |
| `/product/treasury` | Home > Product > Treasury |
| `/product/accounts-receivable` | Home > Product > Accounts Receivable |
| `/product/approvals` | Home > Product > Approvals |
| `/product/risk` | Home > Product > Risk |
| `/product/compliance` | Home > Product > Compliance |
| `/product/reconciliation` | Home > Product > Reconciliation |
| `/product/audit` | Home > Product > Audit |
| `/product/executive-intelligence` | Home > Product > Executive Intelligence |
| `/product/general-ledger` | Home > Product > General Ledger |
| `/product/cash-management` | Home > Product > Cash Management |
| `/platform/architecture` | Home > Platform > Architecture |
| `/platform/performance` | Home > Platform > Performance |
| `/platform/reliability` | Home > Platform > Reliability |
| `/platform/integrations` | Home > Platform > Integrations |
| `/platform/connectors` | Home > Platform > Connectors |
| `/platform/api` | Home > Platform > API |
| `/platform/developer` | Home > Platform > Developer |
| `/platform/deployment` | Home > Platform > Deployment |
| `/platform/infrastructure` | Home > Platform > Infrastructure |
| `/platform/observability` | Home > Platform > Observability |
| `/platform/security` | Home > Platform > Security |
| `/security/authentication` | Home > Security > Authentication & MFA |
| `/security/authorization` | Home > Security > Access Control |
| `/security/encryption` | Home > Security > Data Encryption |
| `/security/audit-trail` | Home > Security > Tamper-Evident Audit |
| `/security/multi-tenancy` | Home > Security > Tenant Isolation |
| `/security/api-security` | Home > Security > API Security |
| `/security/infrastructure` | Home > Security > Infrastructure Security |
| `/security/compliance` | Home > Security > Compliance Roadmap |
| `/security/dependency-scanning` | Home > Security > Dependency Security |
| `/security/incident-response` | Home > Security > Incident Response |
| `/ai/capabilities` | Home > AI > Capabilities |
| `/ai/providers` | Home > AI > Providers |
| `/ai/models` | Home > AI > Models |
| `/ai/governance` | Home > AI > Governance |
| `/ai/privacy` | Home > AI > Privacy |
| `/ai/explainability` | Home > AI > Explainability |
| `/ai/benchmarks` | Home > AI > Benchmarks |
| `/ai/roadmap` | Home > AI > Roadmap |
| `/engineering/architecture` | Home > Engineering > Architecture Decisions |
| `/engineering/performance` | Home > Engineering > Performance |
| `/engineering/testing` | Home > Engineering > Testing |
| `/engineering/infrastructure` | Home > Engineering > Infrastructure |
| `/engineering/open-source` | Home > Engineering > Open Source |
| `/engineering/contribute` | Home > Engineering > Contribute |
| `/engineering/blog` | Home > Engineering > Blog |
| `/research/insights` | Home > Research > Insights |
| `/research/customer-stories` | Home > Research > Customer Stories |
| `/research/market` | Home > Research > Market Analysis |
| `/company/mission` | Home > Company > Mission |
| `/company/team` | Home > Company > Team |
| `/company/careers` | Home > Company > Careers |
| `/company/press` | Home > Company > Press & Media |
| `/company/contact` | Home > Company > Contact |
| `/company/partners` | Home > Company > Partners |
| `/company/legal` | Home > Company > Legal |
| `/privacy` | Home > Privacy Policy |
| `/terms` | Home > Terms of Service |
| `/responsible-disclosure` | Home > Responsible Disclosure |

### 5.3 Breadcrumb Styling

```
Container: h-10 px-8 flex items-center (matches page container max-width)
Font: text-xs text-zinc-500
Links: hover:text-white transition-colors
Separator: ChevronRight h-3 w-3 mx-2 text-zinc-600
```

---

## 6. Search

### 6.1 Search Scope

Full-text search across all 71+ public pages. Indexed at build time.

**Searchable content**:
- Page title, H1, meta description
- Body text (first 500 words of each section)
- Category tags (product, platform, security, AI, engineering, research, company)

### 6.2 Search Entry Points

| Trigger | Location | Shortcut |
|---|---|---|
| Search icon in nav | Global nav (right side) | — |
| Keyboard shortcut | Anywhere on site | `Cmd+K` / `Ctrl+K` |
| Command palette | Anywhere on site | `Cmd+K` / `Ctrl+K` |

### 6.3 Search Results Format

```
┌──────────────────────────────────────────────┐
│ 🔍 Search Perionyx...                    [⌘K] │
├──────────────────────────────────────────────┤
│ Pages                                        │
│ ┌──────────────────────────────────────────┐ │
│ │ 📄 Accounts Payable Automation           │ │
│ │    Product > Accounts Payable             │ │
│ │    Automate invoice receipt, three-way…   │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔒 Authentication & MFA                  │ │
│ │    Security > Authentication              │ │
│ │    TOTP-based MFA with 10 recovery…       │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Quick Actions                                │
│ ┌──────────────────────────────────────────┐ │
│ │ 📅 Book a Demo                     →     │ │
│ │ 📋 View Changelog                  →     │ │
│ │ 🟢 System Status                   →     │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ ↑↓ Navigate  ↵ Select  Esc Close            │
└──────────────────────────────────────────────┘
```

### 6.4 Search Filters

| Filter | Options |
|---|---|
| Section | Product, Platform, Security, AI, Engineering, Research, Company |
| Audience | CFO, Engineer, Security, All |
| Content type | Product page, Platform page, Security page, Blog, Research, Legal |

### 6.5 Search Keyboard Shortcuts

| Key | Action |
|---|---|
| `Cmd+K` / `Ctrl+K` | Open search / command palette |
| `↑` / `↓` | Navigate results |
| `Enter` | Select highlighted result |
| `Escape` | Close search |
| `/` | Focus search input (when palette is open) |

---

## 7. Command Palette (Cmd+K)

### 7.1 Categories

| Category | Items | Icon |
|---|---|---|
| **Pages** | All 71+ pages searchable | FileText |
| **Quick Actions** | Book a Demo, Log In, View Status, Subscribe to Newsletter | Zap |
| **Navigation** | Go to Product, Go to Platform, Go to Security, Go to AI, Go to Engineering | ArrowRight |
| **Recent** | Recently visited pages (localStorage) | Clock |

### 7.2 Quick Actions

| Action | URL / Behavior |
|---|---|
| Book a Demo | `/demo` |
| Log In | `/login` |
| View System Status | `/status` |
| View Changelog | `/changelog` |
| View Roadmap | `/roadmap` |
| Subscribe to Newsletter | Opens footer newsletter input |
| Contact Sales | `/company/contact` type=sales |
| Report a Vulnerability | `/responsible-disclosure` |

### 7.3 Command Palette Styling

```
Container: Fixed inset-0 z-[100]
Overlay: bg-black/60 backdrop-blur-sm
Palette: max-w-lg mx-auto mt-[20vh] rounded-xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl
Input: w-full bg-transparent px-4 py-4 text-sm text-white placeholder:text-zinc-500 border-b border-white/[0.06]
Results: max-h-[320px] overflow-auto p-2
Item: flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/[0.04]
Active item: bg-white/[0.06] text-white
Category header: px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold
```

---

## 8. Responsive Breakpoints

| Breakpoint | Nav Behavior |
|---|---|
| `< 768px` (mobile) | Top bar: logo + hamburger. Bottom nav visible. Mega menus → slide-out drawer. |
| `768px – 1024px` (tablet) | Top bar: all nav items visible, compact labels. Mega menus work on click. |
| `>= 1024px` (desktop) | Full mega menus on hover. All elements visible. |
| `>= 1280px` (wide) | Max width constrained to `max-w-7xl`. Generous padding. |

---

## 9. Accessibility

### 9.1 Navigation Accessibility

- All nav items are `<a>` elements (not `<div>` with onClick)
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040404]`
- Skip link: "Skip to main content" — hidden until focused (`sr-only focus:not-sr-only`)
- ARIA: `role="navigation"` on nav, `aria-label="Main navigation"`
- Mega menu: `role="menu"`, items are `role="menuitem"`
- Mobile drawer: `role="dialog"`, `aria-modal="true"`, focus trapped

### 9.2 Keyboard Navigation

| Key | Behavior |
|---|---|
| `Tab` | Move to next interactive element |
| `Shift+Tab` | Move to previous interactive element |
| `Enter` / `Space` | Activate link or open mega menu |
| `Escape` | Close mega menu or mobile drawer |
| `Arrow Left/Right` | Navigate between mega menu columns |
| `Arrow Up/Down` | Navigate within mega menu items |

### 9.3 Focus Management

- On mega menu open: focus moves to first item
- On mega menu close: focus returns to trigger
- On mobile drawer open: focus trapped inside
- On mobile drawer close: focus returns to hamburger button
- On search open: focus moves to search input
- On search close: focus returns to trigger element
