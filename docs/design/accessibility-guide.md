# Perionyx Accessibility Guide

WCAG AA compliance guidelines for the Perionyx enterprise platform. Accessibility is not optional — CFOs, Treasurers, Controllers, Finance Managers, and Auditors must be able to use every feature with assistive technology, keyboard-only navigation, and reduced motion preferences.

---

## Table of Contents

1. [Color Contrast](#color-contrast)
2. [Focus Indicators](#focus-indicators)
3. [ARIA Attributes](#aria-attributes)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Screen Readers](#screen-readers)
6. [Touch Targets](#touch-targets)
7. [Responsive Breakpoints](#responsive-breakpoints)
8. [Error Handling](#error-handling)
9. [Skip Navigation](#skip-navigation)
10. [Reduced Motion](#reduced-motion)

---

## Color Contrast

All text and interactive elements meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components).

### Text Contrast Ratios

| Combination | Ratio | WCAG Level | Usage |
|---|---|---|---|
| `text-primary` on `surface-primary` | 15.8:1 | AAA | Headings, primary content, metric values |
| `text-secondary` on `surface-primary` | 8.2:1 | AAA | Descriptions, labels, secondary info |
| `text-tertiary` on `surface-primary` | 5.1:1 | AA | Placeholders, hints, timestamps |
| `text-disabled` on `surface-primary` | 3.6:1 | AA (large) | Disabled text (large text only) |
| `gold` on `surface-primary` | 7.1:1 | AA | Active nav, gold badges, accent text |
| `text-primary` on `surface-secondary` | 14.2:1 | AAA | Card content, sidebar text |
| `text-secondary` on `surface-secondary` | 7.4:1 | AAA | Card descriptions, sidebar labels |

### Status Color Contrast

| Combination | Ratio | WCAG Level |
|---|---|---|
| `success` on `surface-primary` | 5.9:1 | AA |
| `warning` on `surface-primary` | 6.8:1 | AA |
| `danger` on `surface-primary` | 5.2:1 | AA |
| `info` on `surface-primary` | 4.8:1 | AA |
| Status text on muted backgrounds | 4.5:1+ | AA |

### Non-Color Indicators

Status is never communicated by color alone. Every color-coded element includes at least one additional indicator:

| Status | Color | Additional Indicator |
|---|---|---|
| Success | Green | Checkmark icon + "Completed" text |
| Warning | Amber | Warning icon + "Pending" text |
| Danger | Red | Alert icon + "Failed" text |
| Info | Blue | Info icon + "Informational" text |
| Active nav | Gold | Bold weight + left border indicator |

---

## Focus Indicators

All interactive elements have visible focus indicators for keyboard navigation.

### Standard Focus Ring

```css
:focus-visible {
  outline: 2px solid #d4af37;  /* gold */
  outline-offset: 2px;
}
```

### Focus Ring Variants

| Element | Focus Style |
|---|---|
| Buttons | 2px gold ring, 2px offset |
| Inputs | 2px gold ring on input, 2px offset |
| Links | 2px gold ring, 2px offset |
| Nav items | 2px gold ring + `border-gold` left border |
| Table rows | 2px gold ring on row |
| Dialog close | 2px gold ring, 2px offset |
| Cards (interactive) | 2px gold ring, 2px offset |
| Checkboxes/radios | 2px gold ring, 2px offset |

### Focus Management

| Context | Behavior |
|---|---|
| Dialog open | Focus moves to first focusable element in dialog |
| Dialog close | Focus returns to trigger element |
| Tab panel switch | Focus moves to tab panel content |
| Page navigation | Focus moves to page heading or main content |
| Toast appear | Focus not moved (aria-live announces) |
| Dropdown open | Focus moves to first menu item |
| Command palette open | Focus moves to search input |

---

## ARIA Attributes

### Roles

| Element | Role | Usage |
|---|---|---|
| Error alerts | `role="alert"` | Auto-announced error messages |
| Status messages | `role="status"` | Loading states, success confirmations |
| Dialogs | `role="dialog"` | Modal and non-modal dialogs |
| Menus | `role="menu"` | Dropdown menus, context menus |
| Menu items | `role="menuitem"` | Items within menus |
| Navigation | `role="navigation"` | Sidebar, breadcrumbs, pagination |
| Main content | `role="main"` | Primary page content |
| Tables | `role="grid"` | Interactive data tables |
| Tabs | `role="tablist"` | Tab containers |
| Tab panels | `role="tabpanel"` | Tab content panels |
| Progress bars | `role="progressbar"` | Loading indicators with value |

### Labels

| Element | Attribute | Example |
|---|---|---|
| Icon-only buttons | `aria-label` | `aria-label="Close dialog"` |
| Form inputs | `aria-label` or `aria-labelledby` | `aria-label="Search transactions"` |
| Navigation sections | `aria-label` | `aria-label="Main navigation"` |
| Sidebar | `aria-label` | `aria-label="Main sidebar"` |
| Top bar | `aria-label` | `aria-label="Top bar"` |
| Mobile nav | `aria-label` | `aria-label="Mobile navigation"` |
| Bottom nav | `aria-label` | `aria-label="Bottom navigation"` |
| Skip link | `aria-label` | `aria-label="Skip to main content"` |

### Descriptions

| Element | Attribute | Usage |
|---|---|---|
| Form fields | `aria-describedby` | Links field to error message and help text |
| Error messages | `aria-describedby` | Describes the error for the associated field |
| Help text | `aria-describedby` | Provides additional context for form fields |
| Character counts | `aria-describedby` | Announces remaining characters |
| Progress bars | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | Reports current progress |

### States

| Element | Attributes | Usage |
|---|---|---|
| Expandable sections | `aria-expanded`, `aria-controls` | Collapsible sections, accordions |
| Toggle buttons | `aria-pressed` | Toggle states (minimap on/off) |
| Selectable items | `aria-selected` | Tab selection, table row selection |
| Disabled elements | `aria-disabled` | Disabled buttons, inputs |
| Required fields | `aria-required="true"` | Required form inputs |
| Invalid fields | `aria-invalid="true"` | Fields with validation errors |
| Loading states | `aria-busy="true"` | Elements being updated |

---

## Keyboard Navigation

### Tab Order

Tab order follows visual layout:

1. Skip navigation link (visible on focus)
2. Sidebar navigation (top to bottom)
3. Top bar elements (left to right)
4. Main content (top to bottom, left to right)
5. Sidebar/panels (if present)

### Key Bindings

| Key | Context | Action |
|---|---|---|
| `Tab` | Global | Move focus to next interactive element |
| `Shift+Tab` | Global | Move focus to previous interactive element |
| `Enter` | Buttons, links | Activate element |
| `Space` | Buttons, checkboxes, toggles | Toggle/activate element |
| `Escape` | Dialogs, popovers, dropdowns | Close/dismiss |
| `Arrow Up/Down` | Lists, menus, dropdowns | Navigate items |
| `Arrow Left/Right` | Tabs, tree views, horizontal lists | Navigate items |
| `Home` | Lists, tables, grids | Jump to first item |
| `End` | Lists, tables, grids | Jump to last item |
| `Page Up/Down` | Long lists, tables | Scroll by page |
| `Cmd+A` | Tables with selection | Select all rows |
| `Delete` | Selected items | Delete selected |

### Interactive Element Requirements

All interactive elements must be:

1. **Reachable** via Tab key
2. **Activatable** via Enter or Space
3. **Dismissable** via Escape (if it opens a popup)
4. **Navigable** via arrow keys (if it contains a list)
5. **Focusable** with a visible focus indicator

---

## Screen Readers

### Live Regions

Dynamic content updates are announced to screen readers via `aria-live` regions.

| Region | Usage |
|---|---|
| `aria-live="polite"` | Non-urgent updates (table data refresh, status change) |
| `aria-live="assertive"` | Urgent updates (error messages, critical alerts) |
| `aria-live="off"` | Content updates that should not be announced (skeleton loading) |

### SR-Only Text

Visual-only elements that convey meaning must have screen-reader-only text:

| Element | SR Text |
|---|---|
| Loading spinner | "Loading..." |
| Success icon | "Success" |
| Error icon | "Error" |
| Warning icon | "Warning" |
| Info icon | "Information" |
| Status dot (green) | "Healthy" |
| Status dot (red) | "Unhealthy" |
| Status dot (gray) | "Unknown" |
| Trend arrow (up) | "Trending up" |
| Trend arrow (down) | "Trending down" |
| Expand chevron | "Expand" / "Collapse" |
| Close button (×) | "Close" |

### Descriptive Labels

Every interactive element must have a descriptive label that explains its purpose:

| Bad | Good |
|---|---|
| "Button" | "Create new transaction" |
| "Click here" | "View cash position details" |
| "Edit" | "Edit invoice INV-2024-001" |
| "Delete" | "Delete selected transactions" |
| "Submit" | "Submit payment for approval" |
| "Toggle" | "Toggle compact density" |

---

## Touch Targets

All interactive elements must meet minimum touch target size for mobile and tablet use.

### Minimum Size

| Element | Minimum Size |
|---|---|
| Buttons | 44px × 44px |
| Links (in body text) | 44px × 44px (including padding) |
| Form inputs | 44px height |
| Checkboxes/radios | 44px × 44px (including label) |
| Table row actions | 44px × 44px |
| Nav items | 44px height |
| Tab buttons | 44px height |
| Dropdown items | 44px height |

### Padding for Small Elements

When the visual element is smaller than 44px, invisible padding expands the touch target:

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Responsive Breakpoints

| Name | Min Width | Max Width | Target |
|---|---|---|---|
| `mobile` | 0 | 767px | Phones |
| `tablet` | 768px | 1023px | Tablets (portrait) |
| `laptop` | 1024px | 1279px | Tablets (landscape), small laptops |
| `desktop` | 1280px | 1919px | Standard desktop monitors |
| `ultrawide` | 1920px | — | Ultrawide monitors |

### Breakpoint Behavior

| Breakpoint | Sidebar | Top Bar | Content | Navigation |
|---|---|---|---|---|
| Mobile | Hidden (drawer) | Compact | Single column | Bottom nav bar |
| Tablet | Collapsible | Standard | 1-2 columns | Sidebar (collapsed) |
| Laptop | Collapsible | Standard | 2-3 columns | Sidebar (expanded) |
| Desktop | Expanded | Full | 3-4 columns | Sidebar (expanded) |
| Ultrawide | Expanded | Full | 4+ columns | Sidebar (expanded) |

---

## Error Handling

### Error Message Standards

Every error message must:

1. **Explain what went wrong** — "Failed to save transaction"
2. **Explain how to fix it** — "Check that all required fields are filled"
3. **Be associated with the relevant field** — via `aria-describedby`
4. **Not use color alone** — include icon + text

### Error Placement

| Error Type | Placement |
|---|---|
| Field validation | Below the field, red text + icon |
| Form submission | Top of form, alert banner with field links |
| Page load failure | Center of content area, ErrorState component |
| API error | Toast notification (top-right) |
| Permission denied | Inline message + redirect suggestion |

### Error Message Examples

| Scenario | Message |
|---|---|
| Required field empty | "This field is required" |
| Invalid email | "Enter a valid email address (e.g., user@company.com)" |
| Amount exceeds limit | "Amount must be less than $1,000,000" |
| API timeout | "Request timed out. Check your connection and try again." |
| Permission denied | "You don't have permission to perform this action. Contact your administrator." |
| Concurrent edit | "This record was modified by another user. Reload to see the latest version." |

---

## Skip Navigation

A skip navigation link allows keyboard users to bypass the sidebar and jump directly to main content.

### Implementation

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gold focus:text-surface-primary focus:rounded-md focus:font-medium"
>
  Skip to main content
</a>
```

### Behavior

- Hidden by default (`sr-only`)
- Visible only when focused via Tab
- Positioned at top-left with high z-index
- Gold background with dark text for high contrast
- Focuses `#main-content` on click
- `#main-content` is the `main` element or primary content container

---

## Reduced Motion

All animations respect the `prefers-reduced-motion` media query.

### Implementation

```tsx
// Framer Motion respects prefers-reduced-motion automatically
import { motion, useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}
```

### What Gets Reduced

| Animation | Normal | Reduced Motion |
|---|---|---|
| Page transitions | fade-in-up 400ms | Instant (no animation) |
| Card hover | lift -2y 150ms | No movement |
| Dialog entrance | backdrop fade + scale-in 200ms | Instant appear |
| Skeleton shimmer | 1.5s infinite loop | Static gray (no shimmer) |
| Stagger lists | 30ms delay per item | All items appear at once |
| Toast slide-in | spring animation | Instant appear |
| Expand/collapse | height transition | Instant toggle |
| Counter animation | 600ms count-up | Display final value immediately |
| Table row entrance | stagger fade-in | All rows appear at once |

### Exceptions

Some animations are essential for functionality and are not reduced:

- Loading spinner rotation (functional, not decorative)
- Progress bar fill (communicates progress state)
- Focus ring appearance (accessibility requirement)

---

## Testing Checklist

### Automated Testing

- [ ] Axe-core scan passes with zero violations
- [ ] Lighthouse accessibility score ≥ 95
- [ ] Color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)
- [ ] All images have alt text
- [ ] All form inputs have associated labels

### Manual Testing

- [ ] Complete workflow using keyboard only (no mouse)
- [ ] Screen reader announces all dynamic content (NVDA/VoiceOver)
- [ ] Focus order follows visual layout
- [ ] Focus is visible on all interactive elements
- [ ] Dialogs trap focus correctly
- [ ] Escape closes all modals/popovers
- [ ] Skip navigation link works
- [ ] Touch targets ≥ 44px on mobile
- [ ] Reduced motion mode disables all animations
- [ ] Error messages are clear and actionable

### Browser Testing

- [ ] Chrome (latest) — full keyboard + screen reader
- [ ] Firefox (latest) — full keyboard + screen reader
- [ ] Safari (latest) — VoiceOver + keyboard
- [ ] Edge (latest) — full keyboard + screen reader
- [ ] Mobile Safari (iOS) — VoiceOver + touch
- [ ] Mobile Chrome (Android) — TalkBack + touch
