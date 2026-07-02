# ADR-017: Design System

**Status**: Ratified  
**Date**: January 2024  
**Author**: Product Team  

## Context

Perionyx needs a consistent visual identity appropriate for enterprise financial software. The design must convey trust, stability, and sophistication while maximizing data density for power users.

## Decision

Adopt a **dark theme with gold accent** (#d4af37) design system:

- **Color scheme**: Dark background (#090909), white text, gold accent (#d4af37)
- **Data density**: Compact layouts, dense tables, minimal whitespace
- **Component library**: Radix UI primitives with custom styling
- **Typography**: System font stack (SF Pro, -apple-system, sans-serif)
- **Icons**: Lucide React (outlined, consistent sizing)
- **Animation**: Framer Motion (subtle, purposeful, respects reduced-motion)
- **Accessibility**: WCAG 2.1 AA target (contrast, keyboard, screen readers)

### Rationale
- Dark theme is preferred by financial professionals who spend long hours in the platform
- Gold accent conveys premium/enterprise positioning
- Data density is essential for treasury and operations dashboards

## Consequences

- **Positive**: Distinctive visual identity in the enterprise software market
- **Positive**: Dark theme reduces eye strain for power users
- **Positive**: Radix UI provides accessible, well-tested primitives
- **Negative**: Gold accent may not appeal to all audiences
- **Negative**: Dark theme only — light theme would require significant additional work
- **Negative**: System font stack may render differently across platforms

## Alternatives Considered

1. **Light theme**: Rejected — less suitable for financial power users
2. **Blue/corporate theme**: Rejected — undifferentiated, not memorable
3. **Material UI**: Rejected — heavier bundle, less distinctive styling
