# Engineering Decision Packet — Phase 22.0B

**Enterprise Design Language (EDL) — Canonical Visual Operating System**

---

## Decision

Create a single, canonical token system that resolves all visual inconsistencies across Perionyx. The EDL defines one truth for every color, spacing, typography, motion, radius, z-index, shadow, and icon value in the platform.

## Context

Phase 22.0B design audit revealed:

| Finding | Severity | Impact |
|---|---|---|
| 4 different background palettes | Critical | Visual inconsistency across pages |
| 3 gold hex codes (#d4af37, #c9a84c, #d4a843) | Critical | Brand identity confusion |
| 6 font stack declarations | High | Typography inconsistency |
| 3 parallel motion token systems | High | Animation behavior varies |
| 6+ card styling patterns | Medium | Component inconsistency |
| 2 parallel component libraries | Medium | Developer confusion |
| Status colors in 3 locations | Medium | Status inconsistency |

### Conflicting Source Locations

1. `src/design-system/tokens/colors.ts` — canonical colors + `TOKENS` object
2. `src/design-system/tokens/surfaces.ts` — different surface values (#141414 vs #0a0a0f)
3. `src/design-system/tokens/status.ts` — different gold (#c9a84c vs #d4af37)
4. `src/components/enterprise/motion/tokens.ts` — duplicate motion tokens
5. `src/components/enterprise/design-system/tokens/` — second design system
6. `src/components/theme/defaults.ts` — third background color (#040404)
7. `tailwind.config.cjs` — custom Tailwind colors (perionyx.*, gold.*)

## Decision

**Resolve ALL conflicts by establishing EDL as the single source of truth.**

### Chosen Values

| Token | Canonical Value | Reasoning |
|---|---|---|
| Base background | `#0a0a0f` | Consistent with `colors.ts` (the most widely consumed) |
| Gold | `#d4af37` | Original brand gold, most widely used |
| Primary font | Inter | Clean, geometric, enterprise-appropriate |
| Mono font | JetBrains Mono | Financial number precision |
| Base spacing unit | 4px | Industry standard, sufficient granularity |
| Motion durations | 100–600ms | Enterprise-appropriate, no spring physics |

### Implementation

- **8 token files** in `src/design-system/edl/`
- **16 documentation files** in `docs/design/`
- **Backward compatible** — legacy tokens deprecated, not deleted
- **Incremental migration** — new components use EDL, existing migrate during maintenance

## Alternatives Considered

### 1. Migrate All Code to Existing `design-system/tokens/`
- **Pros**: Less new code
- **Cons**: Existing tokens have conflicting values across files; merging would require choosing which file is "right" anyway
- **Rejected**: The conflict exists because there are multiple source files. A single new canonical source is cleaner than trying to merge 4 conflicting files.

### 2. Use Tailwind Config as Single Source
- **Pros**: Tailwind is already in use
- **Cons**: Tailwind config is CSS-centric; TypeScript components need typed tokens. Can't define composed tokens (elevation, component presets) in Tailwind config alone.
- **Rejected**: Tailwind config is a consumer of EDL tokens, not the source.

### 3. Use CSS Custom Properties Only
- **Pros**: Runtime theming, no JS bundle impact
- **Cons**: No TypeScript type safety, harder to compose tokens, no tree-shaking
- **Rejected**: TypeScript tokens provide type safety and autocompletion. CSS variables can be derived from tokens if needed.

## Consequences

### Positive
- **One truth** — no more "which gold is correct?"
- **Type safety** — TypeScript autocompletion for all tokens
- **Consistency** — every component consumes the same foundation
- **Documentation** — 16 docs capture every design decision
- **Performance** — tree-shaking eliminates unused tokens

### Negative
- **Migration effort** — existing components need updating (incremental, not blocking)
- **Two token systems temporarily** — EDL + legacy during migration
- **Documentation maintenance** — 16 docs need keeping in sync

### Risks
- **Stale documentation** — mitigated by EDP linking tokens to docs
- **Incomplete migration** — mitigated by linting rules (future: enforce EDL imports)

## Scope

### In Scope
- Canonical token definitions (8 files)
- Documentation (16 files)
- Token architecture and naming conventions
- Migration strategy for existing components

### Out of Scope
- Component library rewrite (future phase)
- Figma integration (no Figma in use)
- CSS variable derivation (can be added later)
- Automated migration tooling (manual migration during maintenance)

## Related Decisions

- Phase 22.0A: Public Platform Architecture — established visual direction
- Phase 8B.7: Enterprise Motion & Micro-Interactions — now superseded by EDL motion tokens
- Phase 8B.6: Enterprise Forms & Workflow UX — will consume EDL tokens
- Phase 8B.9: Enterprise Accessibility & UX Polish — WCAG compliance maintained

## Brain

- **Lesson 40**: Design Language Is Infrastructure — a canonical visual system prevents inconsistency from compounding across hundreds of components
- **Principle #16**: Visual Consistency Enforced Through Tokens — every visual decision must derive from a single source of truth
