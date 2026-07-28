# Design Governance

**Phase**: 22.0B.5 — Enterprise Design Governance

## Overview

The Enterprise Design Language (EDL) is enforced through automated tooling, not documentation. Every component, page, and new code must comply with EDL tokens. This directory contains the governance infrastructure that makes compliance automatic.

## Architecture

```
tools/design-governance/
├── constants.ts                    # Shared forbidden patterns, exemptions, requirements
├── edl-audit.ts                    # CI entry point — runs all audits
├── edl-report.ts                   # Generates DESIGN_COMPLIANCE_REPORT.md
├── edl-tokens.ts                   # Token health check
├── edl-compliance.ts               # Component compliance audit
├── edl-eslint-plugin/              # 12 ESLint rules
│   ├── index.ts                    # Plugin barrel with recommended/strict configs
│   └── rules/
│       ├── no-hardcoded-colors.ts
│       ├── no-hardcoded-spacing.ts
│       ├── no-hardcoded-shadow.ts
│       ├── no-hardcoded-zindex.ts
│       ├── no-hardcoded-radius.ts
│       ├── no-hardcoded-typography.ts
│       ├── no-hardcoded-animation.ts
│       ├── no-inline-style-colors.ts
│       ├── require-design-tokens.ts
│       ├── no-arbitrary-tailwind-colors.ts
│       ├── no-legacy-imports.ts
│       └── require-motion-import.ts
├── auditors/
│   ├── component-auditor.ts        # 10-check component compliance audit
│   └── page-auditor.ts             # Page-level compliance scoring
├── validators/
│   ├── token-validator.ts          # Token integrity validator
│   └── codebase-scanner.ts         # Full codebase violation scan
├── fixers/
│   └── edl-fixer.ts                # Auto-fix safe violations (dry-run by default)
└── reporters/
    └── compliance-report.ts        # Design compliance report generator
```

## CI Pipeline

Add to your CI workflow:

```yaml
- name: EDL Design Audit
  run: pnpm edl:audit

- name: EDL Token Health
  run: pnpm edl:tokens

- name: EDL Component Compliance
  run: pnpm edl:compliance
```

## Commands

| Command | Description | Exit Code |
|---|---|---|
| `pnpm edl:audit` | Full audit — codebase scan + page compliance | 0 = pass, 1 = fail |
| `pnpm edl:fix` | Auto-fix safe violations (dry-run without --apply) | — |
| `pnpm edl:report` | Generate DESIGN_COMPLIANCE_REPORT.md | — |
| `pnpm edl:tokens` | Token health check | 0 = pass, 1 = fail |
| `pnpm edl:compliance` | Component compliance audit | — |

## Enforcement Levels

### Error (blocks merge)
- Hardcoded hex colors (not in EDL palette)
- Arbitrary Tailwind color values
- Legacy design-system imports
- Hardcoded box-shadow
- Hardcoded zIndex ≥ 50

### Warning (advisory)
- Hardcoded inline spacing
- Hardcoded border-radius
- Hardcoded font properties
- Inline motion values

## Exemptions

These paths are exempt from governance checks:
- `tools/design-governance/` (the tooling itself)
- `src/design-system/edl/` (token definitions)
- `tailwind.config.cjs` (Tailwind configuration)
- `src/app/globals.css` (CSS custom properties)
- Config files (`.config.js`, `next.config.ts`, etc.)
- `docs/` (documentation)

## Architecture Principle

> Architecture is enforced through tooling, not documentation.

If a rule can be automated, it should be. If a rule requires human judgment, it should be documented in the review checklist. The goal is zero manual enforcement.
