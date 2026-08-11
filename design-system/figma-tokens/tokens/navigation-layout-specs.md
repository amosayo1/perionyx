# PEDS — Navigation & Layout System

## 1. Application Shell

The App Shell is the outermost layout primitive. Every screen lives inside it.

### Structure

```
┌─────────────────────────────────────────────────┐
│  Top Navigation (56px)                           │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │  Main Content Area                    │
│ (280px)  │  (fills remaining width)              │
│          │                                       │
│          │  ┌─────────────────────────────────┐  │
│          │  │  Page Header                     │  │
│          │  ├─────────────────────────────────┤  │
│          │  │                                 │  │
│          │  │  Content (scrollable)            │  │
│          │  │                                 │  │
│          │  └─────────────────────────────────┘  │
│          │                                       │
├──────────┴──────────────────────────────────────┤
│  Footer / Status Bar (optional, 32px)            │
└─────────────────────────────────────────────────┘
```

### Spec

**Frame**: Auto Layout, Vertical
- Fill: `surface.base`
- W: Fill, H: Fill

**Children** (top to bottom):
1. `Top Navigation` — H: 56px, Fill width
2. `Content Area` — Auto Layout, Horizontal, Fill remaining
   - `Sidebar` — W: 280px (or 64px collapsed), Fill height
   - `Main Content` — Auto Layout, Vertical, Fill remaining
     - `Page Header` — H: auto, Fill width
     - `Content` — Vertical, Fill remaining, scrollable
3. `Status Bar` (optional) — H: 32px, Fill width

### States
| State | Sidebar Width | Description |
|-------|---------------|-------------|
| Expanded | 280px | Default, full navigation labels |
| Collapsed | 64px | Icons only, tooltip on hover |
| Hidden | 0px | Full-screen mode for workspaces |

### Responsive Behaviour
| Breakpoint | Sidebar | Topbar | Content |
|------------|---------|--------|---------|
| ≥1280px (xl) | Expanded 280px | Full | Full |
| ≥1024px (lg) | Collapsed 64px | Full | Full |
| ≥768px (md) | Hidden, overlay drawer | Condensed | Full |
| <768px (sm) | Hidden, overlay drawer | Condensed (hamburger) | Full |

---

## 2. Sidebar (Expanded)

**Frame**: Auto Layout, Vertical
- W: 280px (sidebar-width), H: Fill
- Fill: `sidebar.bg`
- Border-Right: 1px, `topbar.border`
- Padding: 12px top, 8px horizontal, 12px bottom
- Gap: 4px

### Children (top to bottom):

#### Logo Area
- H: 40px, Auto Layout, Horizontal
- Logo mark (24×24, gold)
- "Perionyx" text (style `button`, `text.primary`)
- Gap: 10px
- Padding: 4px 12px

#### Search Bar
- Same as Input/Search
- H: 36px, radius: 6px
- Placeholder: "Search..."
- Margin: 8px horizontal, 8px bottom

#### Navigation Group
**Group Label**:
- Text: style `nav-group` (11px, semibold, uppercase, 0.04em tracking)
- Color: `sidebar.group-label`
- Padding: 8px 12px 4px

**Nav Item**:
- Frame: Auto Layout, Horizontal
- H: 36px, Fill width
- Padding: 0 12px
- Radius: 6px
- Gap: 12px
- Icon: 20×20
- Label: style `nav` (14px, medium)
- Active indicator: 3px left border (when active)

| State | Background | Text | Icon |
|-------|-----------|------|------|
| Default | transparent | `sidebar.item-text` | `sidebar.item-text` |
| Hover | `sidebar.item-hover` | `text.primary` | `text.primary` |
| Active | `sidebar.item-active` | `sidebar.item-active-text` | `sidebar.item-active-text` |
| Active + Indicator | `sidebar.item-active` | `sidebar.item-active-text` | `sidebar.item-active-text` + 3px gold left border |

#### Divider
- H: 1px, Fill width
- Fill: `sidebar.divider`
- Margin: 8px 12px

#### Bottom Area (user + settings)
- Push to bottom using Auto Layout "Space Between"
- User avatar (28×28)
- User name + role
- Settings icon

### Component Set Properties
| Property | Values |
|----------|--------|
| State | default, hover, active |
| Has Icon | true, false |
| Has Badge | true, false |
| Group | finance, workflow, intelligence, settings |

---

## 3. Sidebar (Collapsed)

**Frame**: Auto Layout, Vertical
- W: 64px (sidebar-collapsed-width), H: Fill
- Fill: `sidebar.bg`
- Border-Right: 1px, `topbar.border`
- Padding: 12px 0
- Gap: 4px
- Items alignment: center

### Differences from Expanded:
- Labels hidden (tooltip on hover)
- Icons centered (20×20)
- No text, no search bar
- Logo: icon only (24×24)
- User: avatar only (28×28)

### Interaction
- Hovering a collapsed icon shows tooltip with label
- Width transition: 250ms ease-out (`motion.duration.sidebar-collapse`)

---

## 4. Top Navigation

**Frame**: Auto Layout, Horizontal
- H: 56px (topbar-height), Fill width
- Fill: `topbar.bg`
- Border-Bottom: 1px, `topbar.border`
- Padding: 0 16px
- Gap: 8px
- Items alignment: center, space-between

### Left Section
- Menu toggle button (hamburger, for responsive)
- Workspace title / breadcrumb (style `h4`, `text.primary`)

### Center Section
- Tab navigation (optional, for workspaces with sub-views)

### Right Section
- Global search trigger (icon button)
- Notifications (icon button + badge)
- User menu (avatar + name)
- All icons: 20px, `topbar.icon`, hover `topbar.icon-hover`

### Component Set Properties
| Property | Values |
|----------|--------|
| Has Breadcrumb | true, false |
| Has Tabs | true, false |
| Has Search | true, false |
| Notification Count | 0, 1-9, 9+ |

---

## 5. Global Search

### Search Trigger
- Icon button (search/magnifying glass)
- Cmd+K shortcut hint (micro text)

### Search Dialog (Overlay)
**Frame**: Auto Layout, Vertical
- W: 640px, H: auto (max 480px)
- Fill: `dialog.bg`
- Border: `dialog.border`
- Shadow: `dialog.shadow`
- Radius: `dialog` (12px)
- Centered on screen

**Children**:
1. **Search Input**: 48px height, large icon, placeholder "Search anything…", style `body`
2. **Recent Section**: Recent searches with timestamps
3. **Results Section**: Categorised results
   - Each result: icon + label + description + badge
   - Hover: `surface.elevated`
4. **Shortcuts Footer**: Keyboard shortcuts (↑↓ navigate, ↵ open, Esc close)

---

## 6. Notifications

### Notification Trigger
- Icon button (bell)
- Badge with count

### Notification Panel (Dropdown)
**Frame**: Auto Layout, Vertical
- W: 400px, H: auto (max 560px)
- Fill: `surface.floating`
- Border: `border.strong`
- Shadow: `shadow.large`
- Radius: `dropdown` (8px)

**Children**:
1. **Header**: "Notifications" + "Mark all read" link + count
2. **Notification List** (scrollable):
   - Each item: Auto Layout, Horizontal, 16px padding
   - Icon (20px, status color)
   - Title + description + timestamp
   - Unread: `brand.gold-subtle` left accent
   - Hover: `surface.elevated`
3. **Footer**: "View all notifications" link

### Notification Item States
| State | Background | Left Accent |
|-------|-----------|-------------|
| Unread | `brand.gold-subtle` (very subtle) | 3px gold left border |
| Read | transparent | none |
| Hover | `surface.elevated` | preserved |

### Notification Types
| Type | Icon | Colour |
|------|------|--------|
| Approval Required | CheckCircle | `status.info` |
| Payment Executed | CreditCard | `status.success` |
| Exception Raised | AlertTriangle | `status.warning` |
| Match Failed | XCircle | `status.error` |
| AI Recommendation | Sparkles | `brand.gold` |
| Report Ready | FileText | `status.info` |
| System Alert | Bell | `status.warning` |

---

## 7. User Menu

### Trigger
- Avatar (28×28, radius `full`) + name (hidden on mobile)

### Dropdown Menu
**Frame**: Auto Layout, Vertical
- W: 240px
- Fill: `surface.floating`
- Border: `border.strong`
- Shadow: `shadow.large`
- Radius: `dropdown` (8px)
- Padding: 4px

**Sections**:
1. **User Info** (non-interactive): avatar + name + role + email
2. **Actions**: Profile, Settings, Keyboard Shortcuts
3. **Workspace Switcher** (if applicable)
4. **Admin** (if role=admin)
5. **Footer**: Theme toggle, Log out

---

## 8. Breadcrumbs

**Frame**: Auto Layout, Horizontal
- Gap: 6px
- Items: center

**Crumbs**:
- Each: text style `link` or `sm`, `text.tertiary`
- Active (last): style `sm-medium`, `text.primary`
- Separator: "›" text, style `sm`, `text.disabled`

### Component Properties
| Property | Values |
|----------|--------|
| Items | 2, 3, 4, 5 |
| Has Home Icon | true, false |

---

## 9. Workspace Switcher

### Trigger
- Dropdown button showing current workspace name
- Icon: LayoutDashboard

### Dropdown
**Frame**: Same structure as dropdown menu
- List of workspaces with:
  - Icon (16px)
  - Name (style `body`)
  - Description (style `sm`, `text.tertiary`)
  - Current workspace: gold dot indicator
- Hover: `surface.elevated`

---

## 10. Layout Primitives

### Dashboard Layout
**Frame**: Auto Layout, Vertical, Fill
- Gap: `section-gap`

**Children**:
1. **Metric Row** — Auto Layout, Horizontal, Fill, gap 16px
   - 3-4 Metric Cards (equal width, Fill)
2. **Chart Section** — Auto Layout, Horizontal, Fill, gap 16px
   - Main chart (flex: 2) + Side chart (flex: 1)
3. **Activity Section** — Auto Layout, Horizontal, Fill, gap 16px
   - Recent activity (flex: 1) + Queue summary (flex: 1)

### Workspace Layout
**Frame**: Auto Layout, Vertical, Fill
- Padding: `page-padding`
- Gap: `section-gap`

**Children**:
1. **Page Header** — title + actions + metadata
2. **Toolbar** — filters + search + actions
3. **Content** — Fill remaining, scrollable

### Split View
**Frame**: Auto Layout, Horizontal, Fill
- Gap: 0
- Divider: draggable (8px wide, cursor col-resize)

**Panels**:
1. **Left Panel** (min 320px, max 50%)
2. **Right Panel** (fills remaining)

### Inspector Panel
**Frame**: Auto Layout, Vertical
- W: 400px, H: Fill
- Fill: `surface.raised`
- Border-Left: 1px, `border.default`
- Padding: `card-padding`
- Gap: `card-gap`

**Sections**:
1. Header with close button
2. Scrollable content
3. Fixed footer with actions

### Modal Layout
**Frame**: Auto Layout, Vertical
- W: 480px (default), H: auto (max 85vh)
- Fill: `dialog.bg`
- Border: `dialog.border`
- Shadow: `dialog.shadow`
- Radius: `dialog`
- Centered via overlay (`surface.overlay`)

**Children**:
1. **Header**: title + close button
2. **Body**: scrollable, `dialog.body-text`
3. **Footer**: action buttons, right-aligned

### Full Width Workspace
**Frame**: Auto Layout, Vertical, Fill
- No sidebar or minimal chrome
- Used for: review workspaces, canvas, data heavy screens

### Multi-Column Workspace
**Frame**: Auto Layout, Horizontal, Fill
- Gap: 16px
- Children: 2-4 columns, equal width
- Each column: Auto Layout, Vertical
- Responsive: collapses to single column at <1024px

---

## 11. Responsive Behaviour Summary

| Breakpoint | Shell | Sidebar | Layout | Components |
|------------|-------|---------|--------|------------|
| ≥1440px (2xl) | Full | Expanded 280px | 12-col grid | Standard |
| 1280px (xl) | Full | Expanded 280px | 12-col grid | Standard |
| 1024px (lg) | Full | Collapsed 64px | 8-col grid | Standard |
| 768px (md) | Full | Hidden, overlay | 4-col grid | Touch-friendly (44px min) |
| <768px (sm) | Full | Hidden, drawer | 1-col stack | Mobile, safe-area-aware |

### Grid System
- Desktop-first: 1440px
- 12 columns
- Column width: 90px (at 1440px with 80px margins)
- Gutter: 16px
- Margin: 80px (desktop), 24px (tablet), 16px (mobile)
- Grid overlay: available as a frame for alignment checking

---

## 12. Layout Token Reference

| Token | Value | Used By |
|-------|-------|---------|
| `layout-semantic.page-padding` | 24px | All page content areas |
| `layout-semantic.section-gap` | 32px | Between major sections |
| `layout-semantic.card-padding` | 20px | Inside cards |
| `layout-semantic.sidebar-width` | 280px | Expanded sidebar |
| `layout-semantic.sidebar-collapsed-width` | 64px | Collapsed sidebar |
| `layout-semantic.topbar-height` | 56px | Top navigation |
| `layout-semantic.dialog-padding` | 24px | Inside dialogs |
| `border-radius.semantic.card` | 8px | Cards, panels |
| `border-radius.semantic.dialog` | 12px | Modals, dialogs |
| `border-radius.semantic.control` | 6px | Inputs, buttons |
| `z-index.sidebar` | 400 | Sidebar |
| `z-index.overlay` | 500 | Backdrops |
| `z-index.modal` | 600 | Dialogs |
| `z-index.popover` | 700 | Dropdowns, tooltips |
| `z-index.toast` | 900 | Toasts |
