# Accessibility System

**Phase 22.0B — WCAG 2.1 AA Compliance**

---

## Standards

- **WCAG 2.1 Level AA** — minimum compliance target
- **Section 508** — federal accessibility requirements
- **ARIA 1.2** — assistive technology compatibility

## Color Contrast

All text/background combinations must meet **4.5:1** contrast ratio (normal text) or **3:1** (large text).

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `TEXT.primary` (`#f7f6f2`) | `SURFACES.base` (`#0a0a0f`) | 17.8:1 | ✅ |
| `TEXT.primary` (`#f7f6f2`) | `SURFACES.raised` (`#111118`) | 15.2:1 | ✅ |
| `TEXT.secondary` (`#a1a1aa`) | `SURFACES.base` (`#0a0a0f`) | 8.1:1 | ✅ |
| `TEXT.secondary` (`#a1a1aa`) | `SURFACES.raised` (`#111118`) | 6.9:1 | ✅ |
| `TEXT.tertiary` (`#71717a`) | `SURFACES.base` (`#0a0a0f`) | 4.6:1 | ✅ |
| `TEXT.tertiary` (`#71717a`) | `SURFACES.raised` (`#111118`) | 3.9:1 | ✅ (large text) |
| `BRAND.gold` (`#d4af37`) | `SURFACES.base` (`#0a0a0f`) | 8.3:1 | ✅ |
| `BRAND.gold` (`#d4af37`) | `SURFACES.raised` (`#111118`) | 7.1:1 | ✅ |

## Keyboard Navigation

| Key | Action |
|---|---|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter/Space | Activate button/link |
| Escape | Close dialog/dropdown |
| Arrow keys | Navigate within composite widgets |
| Home/End | Jump to first/last item |

## Focus Management

- **Visible focus ring** on all interactive elements: `BORDERS.gold` (`rgba(212,175,55,0.5)`)
- **Focus trap** in modals and dialogs
- **Skip navigation link** — first focusable element, hidden until focused
- **Return focus** to trigger element when dialog closes

## ARIA Requirements

| Pattern | ARIA |
|---|---|
| Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Toast | `role="status"`, `aria-live="polite"` |
| Error | `role="alert"`, `aria-live="assertive"` |
| Navigation | `role="navigation"`, `aria-label` |
| Table | `role="table"`, `aria-label` or `aria-labelledby` |
| Button (icon-only) | `aria-label` required |
| Form field | `aria-describedby` for help/error text |
| Badge | `role="status"` for status badges |

## Reduced Motion

- `MotionProvider` context provides `enabled: false` when `prefers-reduced-motion: reduce`
- All EDL motion tokens have a `REDUCED_MOTION` override (0ms, linear)
- Components check `enabled` before applying animations

## Screen Reader Support

- All images have `alt` text
- All icon-only buttons have `aria-label`
- All tables have `aria-label`
- All form fields have associated labels (`htmlFor`/`id`)
- Error messages are announced via `aria-live`
- Loading states are announced via `aria-busy`

## Touch Targets

- Minimum 44px × 44px for all interactive elements
- `touch-target` CSS utility available
- Safe area insets for mobile (notch, home indicator)

## Testing

- Automated: `axe-core` integration in CI
- Manual: Keyboard-only navigation testing
- Screen reader: VoiceOver (macOS), NVDA (Windows) testing quarterly
