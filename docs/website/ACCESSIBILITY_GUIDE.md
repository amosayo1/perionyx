# Perionyx Public Website — Accessibility Guide

> **Status**: v1.0
> **Scope**: WCAG 2.1 AA compliance for the public marketing website
> **Principle**: Accessibility is not a feature. It is the foundation. Every visitor must be able to use every page.

---

## 1. Compliance Target

**WCAG 2.1 Level AA** — full compliance across all public pages.

| Principle | Target |
|---|---|
| Perceivable | All content perceivable by all users |
| Operable | All functionality operable via keyboard |
| Understandable | All content and UI understandable |
| Robust | Content works with assistive technologies |

---

## 2. Keyboard Navigation

### 2.1 Tab Order

Logical tab order follows visual layout:

```
Skip link (hidden until focused)
  -> Navbar items (left to right)
    -> Dropdown items (top to bottom)
      -> Main content (top to bottom, left to right)
        -> CTAs and interactive elements
          -> Footer links
```

**Rules:**
- Tab order must match visual reading order
- No positive `tabIndex` values (only 0 or -1)
- All interactive elements must be focusable
- Non-interactive elements must NOT be focusable

### 2.2 Focus Indicators

Every interactive element has a visible focus indicator:

```css
:focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 2px;
  border-radius: 4px;
}
```

| Property | Value |
|---|---|
| Color | `#d4af37` (gold) |
| Width | 2px |
| Offset | 2px |
| Style | Solid |
| Radius | Matches element radius |

**Rules:**
- Never `outline: none` without a replacement
- Focus ring must be visible on all backgrounds (gold on dark = 9.5:1 contrast)
- Focus ring must not be obscured by neighboring elements
- Use `focus-visible` (not `focus`) to avoid showing rings on mouse click

### 2.3 Skip Links

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
    focus:rounded-lg focus:bg-[#d4af37] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
>
  Skip to main content
</a>
```

**Rules:**
- First focusable element on every page
- Hidden visually, visible on focus
- Links to `<main id="main-content">`
- Styled with gold background for brand consistency

### 2.4 Keyboard Shortcuts

| Key | Action |
|---|---|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate links and buttons |
| Space | Activate buttons and checkboxes |
| Escape | Close mega menu, mobile drawer, dialogs |
| Arrow keys | Navigate within tab groups, dropdown menus |

### 2.5 Focus Trapping

When a modal or drawer is open, focus is trapped:

```tsx
// Mega menu: focus trapped within dropdown
// Mobile drawer: focus trapped within drawer
// Dialogs (if any): focus trapped within dialog
```

**Rules:**
- Focus must not escape to background content when menu/drawer is open
- Escape key closes the overlay and returns focus to trigger
- Tab wraps within the trapped region

---

## 3. Screen Readers

### 3.1 Semantic HTML

Every page uses semantic HTML elements:

```html
<html lang="en">
<body>
  <a href="#main-content" class="sr-only">Skip to content</a>
  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main-content">
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
      ...
    </section>
  </main>
  <footer role="contentinfo">
    <nav aria-label="Footer navigation">...</nav>
  </footer>
</body>
</html>
```

### 3.2 Heading Hierarchy

Every page has exactly one `<h1>`. Headings descend logically:

```
h1 — Page title (one per page)
  h2 — Major sections
    h3 — Sub-sections
      h4 — Sub-sub-sections (rare)
```

**Rules:**
- Never skip heading levels (h1 -> h3 is forbidden)
- Never use headings for styling only (use CSS classes)
- Headings must be meaningful and descriptive
- Each page has exactly one h1

### 3.3 Landmarks

| Landmark | Element | Usage |
|---|---|---|
| `banner` | `<header>` | Site header/navbar |
| `main` | `<main>` | Primary content |
| `contentinfo` | `<footer>` | Site footer |
| `navigation` | `<nav>` | Navigation sections |
| `region` | `<section>` with label | Major page sections |

**Rules:**
- Every `<nav>` has `aria-label` describing its purpose
- `<main>` appears exactly once per page
- Sections with headings are implicitly landmarks

### 3.4 Alt Text Rules

| Image Type | Alt Text Rule | Example |
|---|---|---|
| Product screenshot | Describe what the screenshot shows | "Perionyx dashboard showing $2.4M cash position and 12 pending approvals" |
| Architecture diagram | Describe the diagram's purpose | "Architecture diagram showing workflow engine connecting to decision engine and audit trail" |
| Logo (decorative) | `alt=""` (empty) | `alt=""` |
| Logo (informative) | Company name | `alt="Stripe"` |
| Icon (decorative) | `aria-hidden="true"` | No alt needed |
| Icon (informative) | `aria-label` on parent | N/A |
| Decorative pattern | `aria-hidden="true"` | No alt needed |

### 3.5 Lists

Use semantic list elements:

```html
<!-- Navigation links -->
<ul role="list">
  <li><a href="/product">Product</a></li>
  <li><a href="/platform">Platform</a></li>
</ul>

<!-- Feature list -->
<ul role="list" class="space-y-3">
  <li class="flex items-start gap-3">
    <CheckCircle2 class="h-5 w-5 text-[#d4af37] shrink-0" aria-hidden="true" />
    <span>Three-way matching</span>
  </li>
</ul>
```

---

## 4. Color Contrast

### 4.1 Required Ratios (WCAG 2.1 AA)

| Element Type | Minimum Ratio |
|---|---|
| Normal text (< 18px) | 4.5:1 |
| Large text (>= 18px bold or >= 24px) | 3:1 |
| UI components (borders, icons) | 3:1 |
| Focus indicators | 3:1 |

### 4.2 Tested Combinations

| Text | Background | Ratio | Pass |
|---|---|---|---|
| `#f7f6f2` (primary text) | `#040404` (page bg) | 19.2:1 | AAA |
| `#f7f6f2` (primary text) | `#0d0d0d` (card bg) | 17.5:1 | AAA |
| `#b8b5ae` (secondary text) | `#0d0d0d` (card bg) | 8.2:1 | AAA |
| `#8f8a81` (muted text) | `#0d0d0d` (card bg) | 5.3:1 | AA |
| `#d4af37` (gold) | `#040404` (page bg) | 9.5:1 | AAA |
| `#d4af37` (gold) | `#121212` (input bg) | 8.8:1 | AAA |
| `#3ca16d` (success) | `#040404` (page bg) | 6.1:1 | AA |
| `#b56b5e` (error) | `#040404` (page bg) | 4.8:1 | AA |
| `#6c6b67` (faint text) | `#0d0d0d` (card bg) | 3.5:1 | Large only |

### 4.3 Contrast Rules

| Rule | Specification |
|---|---|
| Body text minimum | 4.5:1 (use zinc-400 or darker) |
| Faint text (`zinc-600`) | Only for large text (18px+ bold, 24px+) |
| Never text on gold | Gold is accent-only, never a text background |
| Status colors | Always use 10% background tint for contrast testing |
| Focus rings | Gold on dark = 9.5:1 (exceeds requirements) |
| Verify every combination | Test with axe-core or manual contrast checker |

---

## 5. Motion Accessibility

### 5.1 prefers-reduced-motion

```tsx
// Wrap all animated content in reduced-motion check
function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
```

### 5.2 Reduced Motion Rules

| Animation | With Motion | Reduced Motion |
|---|---|---|
| Scroll reveals | Fade-in + translate | Appear instantly (opacity: 1) |
| Page transitions | Cross-fade 300ms | Instant switch |
| Metric counters | Count from 0 | Show final value |
| Diagram animations | Draw on scroll | Show final state |
| Hover states | Scale + color | Color only |
| Stagger animations | Sequential | Simultaneous |

### 5.3 No Auto-Playing Media

| Rule | Specification |
|---|---|
| No auto-playing video | Video plays only on user click |
| No auto-playing audio | Never |
| No flashing content | Nothing flashes more than 3 times per second |
| No parallax scrolling | Banned (causes motion sickness) |
| No marquee or ticker | Banned |

---

## 6. Forms

### 6.1 Form Structure

Every form field follows this pattern:

```tsx
<div>
  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
    Email address <span className="text-[#d4af37]" aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </label>
  <input
    id="email"
    type="email"
    required
    autoComplete="email"
    aria-required="true"
    aria-describedby="email-error"
    className="..."
  />
  <p id="email-error" role="alert" className="text-sm text-red-400 mt-1">
    {/* Error message appears here */}
  </p>
</div>
```

### 6.2 Form Rules

| Rule | Specification |
|---|---|
| Labels | Every input has a visible `<label>` with `htmlFor` |
| Required fields | Visual indicator (gold `*`) + `aria-required="true"` + sr-only text |
| Error messages | `role="alert"`, `aria-describedby`, red text below field |
| Autocomplete | `autocomplete` attribute on all common fields |
| Focus management | Error field receives focus on validation failure |
| Keyboard | All fields reachable via Tab, submittable via Enter |

### 6.3 Autocomplete Attributes

| Field | Autocomplete Value |
|---|---|
| Name | `name` |
| Email | `email` |
| Company | `organization` |
| Phone | `tel` |
| Address | `street-address` |
| Country | `country` |

---

## 7. Images

### 7.1 Alt Text Decision Tree

```
Is the image purely decorative?
  -> YES -> alt="" and aria-hidden="true"
  -> NO ↓

Does the image convey information?
  -> YES -> Write descriptive alt text explaining WHAT the image shows
  -> NO ↓

Is the image a link?
  -> YES -> Alt text describes the LINK DESTINATION, not the image
  -> NO ↓

Is the image a complex diagram?
  -> YES -> Short alt + long description (aria-describedby or longdesc)
  -> NO ↓

Default: Write concise alt text describing the image content
```

### 7.2 Alt Text Examples

| Image | Alt Text |
|---|---|
| Product dashboard screenshot | "Perionyx executive dashboard showing cash position of $2.4M, 12 pending approvals, and 3 workflow alerts" |
| Architecture diagram | "Diagram showing workflow engine connected to decision engine, approval matrix, and audit trail via domain events" |
| Partner logo (decorative) | `alt=""` |
| Partner logo (in a list of partners) | `alt="Stripe"` |
| Decorative dot pattern | `aria-hidden="true"` |
| Code example image | Describe what the code demonstrates |

---

## 8. Language

### 8.1 HTML Language Attribute

```html
<html lang="en">
```

### 8.2 Content Structure

- Use `<p>` for paragraphs (not divs)
- Use `<ul>`/`<ol>` for lists (not paragraphs with dashes)
- Use `<blockquote>` for quotes (not styled paragraphs)
- Use `<code>` for inline code (not styled spans)
- Use `<strong>` for emphasis (not styled spans)
- Use `<em>` for stress emphasis

---

## 9. Tables

### 9.1 Data Tables

```tsx
<div className="relative overflow-auto rounded-xl border border-white/[0.06]">
  <table>
    <caption className="sr-only">Feature comparison between plans</caption>
    <thead>
      <tr>
        <th scope="col">Feature</th>
        <th scope="col">Standard</th>
        <th scope="col">Enterprise</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Three-way matching</th>
        <td>Included</td>
        <td>Included</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 9.2 Table Rules

| Rule | Specification |
|---|---|
| Caption | Every data table has `<caption>` (sr-only is fine) |
| Scope | `<th scope="col">` for column headers, `scope="row"` for row headers |
| Headers | Use `<thead>` and `<tbody>` |
| Layout tables | Never use tables for layout |
| Responsive | Use `overflow-auto` wrapper for horizontal scroll |

---

## 10. Testing Checklist

### 10.1 Automated Testing (axe-core)

Run on every page before deployment:

```bash
# Integrate into CI
npx axe-core --url https://perionyx.com/product
```

**Zero critical violations. Zero serious violations.**

### 10.2 Manual Testing

| Test | How | Frequency |
|---|---|---|
| Keyboard navigation | Tab through every page, verify focus order and visibility | Every page |
| Screen reader | Test with VoiceOver (Mac) or NVDA (Windows) on key pages | Major pages |
| Zoom | Test at 200% zoom, verify no content cutoff or overlap | Every page |
| Reduced motion | Enable prefers-reduced-motion, verify no jarring animation | Every page |
| High contrast | Test with Windows High Contrast mode | Key pages |
| Mobile | Test on iOS Safari and Android Chrome | Every page |

### 10.3 Testing Checklist

**Every page must pass:**

- [ ] All interactive elements keyboard-reachable
- [ ] Focus indicator visible on every focusable element
- [ ] Tab order matches visual order
- [ ] Skip link works and is visible on focus
- [ ] One h1 per page
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] All images have appropriate alt text
- [ ] All forms have labels and error messages
- [ ] Color contrast meets AA ratios
- [ ] No information conveyed by color alone
- [ ] prefers-reduced-motion respected
- [ ] No auto-playing media
- [ ] Screen reader can navigate all landmarks
- [ ] Screen reader can read all interactive elements
- [ ] Page works at 200% zoom
- [ ] No content overlaps at any viewport width
- [ ] `lang="en"` on html element
- [ ] Page title is descriptive
- [ ] Meta description is present
- [ ] Focus does not get trapped (except in modals)

---

## 11. PDF and Downloadable Content

### 11.1 Rules

| Rule | Specification |
|---|---|
| Prefer HTML | Content should be on the web page, not in a PDF |
| PDF accessibility | If PDFs exist, they must be tagged and structured |
| Alt text | All images in PDFs have alt text |
| Reading order | Logical reading order in tagged PDFs |
| Link text | All links in PDFs have descriptive text |

### 11.2 Link Text

Never use "click here" or "read more" as link text. Always descriptive:

| Bad | Good |
|---|---|
| Click here | Read the security documentation |
| Read more | Learn how three-way matching works |
| Learn more | See the architecture overview |
| Here | View the API reference |

---

## 12. ARIA Patterns

### 12.1 Common Patterns

| Pattern | ARIA Usage |
|---|---|
| Mega menu | `aria-expanded` on trigger, `role="menu"` on dropdown, `role="menuitem"` on items |
| Mobile drawer | `aria-expanded` on trigger, `role="dialog"`, `aria-modal="true"` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Accordion | `aria-expanded` on trigger, `aria-controls` pointing to panel id |
| Progress bar | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Toast notification | `role="status"`, `aria-live="polite"` |

### 12.2 ARIA Rules

| Rule | Specification |
|---|---|
| Don't overuse ARIA | Use native HTML elements first |
| Labels | Every interactive element has an accessible name |
| Live regions | Dynamic content updates use `aria-live="polite"` |
| States | `aria-expanded`, `aria-selected`, `aria-current` reflect current state |
| Relationships | `aria-describedby`, `aria-labelledby` for related content |

---

## 13. Performance Impact on Accessibility

| Rule | Rationale |
|---|---|
| Content loads before motion | Text is readable even if JS fails |
| No layout shift | Predictable page layout for screen readers |
| Fast LCP (< 2.5s) | Screen reader users shouldn't wait long |
| No infinite scroll | Screen readers need discrete pages |
| Progressive enhancement | Core content works without JavaScript |

---

## 14. Accessibility Checklist (Pre-Ship)

Before any page goes live:

**Perceivable:**
- [ ] All text meets contrast ratios
- [ ] All images have alt text
- [ ] No information conveyed by color alone
- [ ] Content readable without CSS
- [ ] Content readable without JavaScript

**Operable:**
- [ ] All interactive elements keyboard-reachable
- [ ] Focus indicator visible
- [ ] Skip link present and functional
- [ ] No keyboard traps
- [ ] No time limits (or extendable)

**Understandable:**
- [ ] Page language declared
- [ ] Heading hierarchy logical
- [ ] Form labels and error messages present
- [ ] Link text is descriptive
- [ ] Consistent navigation across pages

**Robust:**
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Works with screen readers
- [ ] Works at 200% zoom
- [ ] axe-core: zero critical/serious violations
