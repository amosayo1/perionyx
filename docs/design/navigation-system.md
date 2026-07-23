# Premium Enterprise Navigation — Phase 8B.3

## Philosophy

Navigation should disappear into the user's workflow. An enterprise finance executive should never think about where to click — they should think about what to decide.

**Three questions navigation must answer:**
1. **Where am I?** — Active state, breadcrumbs, current module
2. **Where did I come from?** — Breadcrumb hierarchy, recent pages
3. **Where can I go next?** — Favorites, context actions, command palette

## Files

### New Files
| File | Purpose |
|---|---|
| `src/components/navigation/nav-config.ts` | Extracted nav tree (ALL_NAV), grouped sections (NAV_SECTIONS), RBAC filtering, sandbox restrictions |
| `src/components/navigation/enterprise-sidebar.tsx` | Refined sidebar with active gold indicator, hover/toggle-favorite on each item, favorites section at top |
| `src/components/navigation/breadcrumb-bar.tsx` | Auto-generated breadcrumbs from URL, maxItems overflow with ellipsis, clickable parents |
| `src/components/navigation/workspace-info.tsx` | Company name + environment badge (production/sandbox/dev) + role + email |
| `src/components/navigation/notification-preview.tsx` | Notification bell with unread badge, dropdown preview (type-colored), critical count, empty state |
| `src/components/navigation/navigation-search.tsx` | Search input that triggers command palette on focus, ⌘K hint |
| `src/components/navigation/index.ts` | Barrel export |

### Modified Files
| File | Change |
|---|---|
| `src/components/app-shell.tsx` | Uses extracted nav config, EnterpriseSidebar, BreadcrumbBar, NavigationSearch, NotificationPreview. Added useFavorites() + useRecentPages() hooks. Favorites persisted to localStorage. Role/company shown in user menu. |

## Interaction Rules

### Sidebar
- **Active item**: Gold left-border indicator (0.5px), gold-tinted icon background, white text
- **Hover**: Slight background lighten (zinc-800/30), reveal star toggle button
- **Favorites star**: Appears on hover at right edge of each nav item. Gold fill when favorited. Click toggles.
- **Favorites section**: Gold-star items appear at top of sidebar. Can be removed with hover-revealed filled star button.
- **Label truncation**: Overflow text truncated with ellipsis. Full label on hover tooltip.
- No unnecessary margin/padding — compact 32px items with 2px gaps.

### Breadcrumbs
- **Overflow handling**: When total breadcrumbs exceed `maxItems` (default 4), truncate middle segments with `...` separator
- **Icons**: Home icon for root, chevron separators
- **Clickable**: All parent segments are clickable links. Last segment is plain text (aria-current=page)
- **Labels**: Auto-mapped from URL via LABEL_MAP. Unknown segments are humanized (kebab-case → Title Case).

### Command Palette (⌘K)
- **Existing component** at `src/components/command-palette/command-palette.tsx`
- Triggered from NavigationSearch focus or ⌘K keyboard shortcut
- Searches pages, workflows, reports, companies, users, settings

### Notifications
- **Bell icon**: Always visible in topbar. Unread count badge (gold pill, max "9+").
- **Dropdown**: Click-opens. Shows critical count banner, notification list with type-colored icons (amber=approval, green=success, red=failure), timestamp, clickable drill-down.
- **Empty state**: "All caught up" with green checkmark.
- **Auto-refresh**: Polls every 30s.
- **View all**: Link to /notifications page.

### Workspace Awareness
- **Topbar**: Company dropdown shows role badges next to company name
- **User menu**: Shows name, email, company, role
- **Sidebar footer**: "Enterprise Treasury Operating System"
- **Environment**: Future — sandbox banner already exists (SandboxBanner)

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘1`–`⌘9` | Navigate to first 9 favorites (future) |
| `Escape` | Close dropdowns, modals, command palette |
| `Tab` | Navigate breadcrumbs |
| `Arrow Up/Down` | Navigate command palette results |

## Grouping Strategy

The nav tree is organized into 8 sections in `NAV_SECTIONS`:

1. **Overview** — Executive Dashboard, Command Center, Platform Health
2. **Treasury** — Wallets, Accounts, Transactions, Reconciliation, Ledger
3. **Governance** — Approvals, Policies, Governance, Audit Logs
4. **Risk & Intelligence** — Risk Center, Risk Intelligence, Insights, Investigation
5. **Automation** — Automation Studio, Connectors
6. **Operations** — Operations, Notifications, Calendar
7. **Administration** — Users, Roles, Approvers, Rules, Settings
8. **Developer** — Developer Portal, Integrations, Reports, Copilot

Sections are not yet rendered as grouped headers in the sidebar (the existing flat ALL_NAV is preserved for backward compatibility). The sections definition exists for future grouped rendering.

## Accessibility

- All nav items are `<Link>` elements — keyboard navigable by default
- Star toggle buttons have `aria-label`
- Notification bell has `aria-label` with unread count
- Breadcrumbs have `aria-label="Breadcrumb"` and `aria-current="page"` on last item
- Command palette uses Radix Dialog with focus trapping
- All interactive elements support `prefers-reduced-motion` (no CSS transitions on reduced motion)

## Animation Standards

All navigation transitions use `duration-100` (100ms) with `cubic-bezier(0.4, 0, 0.2, 1)`:
- Hover background changes: 100ms
- Active state indicator: 100ms
- Favorites star reveal: 100ms opacity
- Dropdown open: 200ms
- No staggered animations
- No parallax or decorative motion

## Performance

- `React.memo` on all navigation components (EnterpriseSidebar, BreadcrumbBar, NavigationSearch, NotificationPreview, WorkspaceInfo)
- Nav tree is static data — no per-render computation
- Favorites/recent pages read from localStorage synchronously on mount — no async/loading
- Notifications poll on 30s interval — debounced
- Command palette lazy-loaded with `next/dynamic`
- All icons are lucide-react — tree-shakeable
- Bundle impact: ~4KB gzipped (navigation components are mostly Tailwind classes)

## Future Extension Points

1. **Grouped sidebar sections** — render NAV_SECTIONS with collapsible group headers
2. **Collapsible sidebar** — collapsed/expanded modes with tooltip labels
3. **Pinned sidebar state** — persisted preference (expanded/collapsed)
4. **Recent pages in sidebar** — show last 5 pages below favorites
5. **Workspace switcher redesign** — full company switcher with search
6. **Mobile navigation** — improved bottom nav with favorites
7. **Keyboard shortcut customization** — user-configurable shortcuts
8. **Navigation analytics** — track most-used modules for adaptive ordering
