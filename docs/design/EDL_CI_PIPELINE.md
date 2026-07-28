# EDL CI Pipeline

**Phase**: 22.0B.5 — Enterprise Design Governance

## Overview

The EDL CI pipeline enforces design compliance automatically. Every PR must pass the design audit before merge.

## Pipeline Steps

### 1. Token Health Check (`pnpm edl:tokens`)

Verifies all EDL token files exist and are valid.

- **Checks**: 9 required token files present
- **Exit code**: 0 = pass, 1 = fail
- **Time**: < 1s

### 2. Codebase Scan (`pnpm edl:audit`)

Scans all `.tsx` and `.ts` files for design violations.

- **Rules checked**:
  - Hardcoded hex colors
  - Hardcoded rgba() values
  - Hardcoded inline spacing
  - Hardcoded box-shadow
  - Hardcoded zIndex ≥ 50
  - Hardcoded border-radius
  - Hardcoded font properties
  - Legacy design-system imports
  - Arbitrary Tailwind color classes
- **Exit code**: 0 = pass (score ≥ 50), 1 = fail
- **Time**: ~5-10s

### 3. Component Compliance (`pnpm edl:compliance`)

Audits all enterprise components for EDL compliance.

- **Checks per component**:
  - EDL import present
  - No hardcoded hex colors
  - No inline style objects
  - Accessibility class present
- **Time**: ~2-3s

### 4. Page Compliance (part of `pnpm edl:audit`)

Audits all pages for design compliance.

- **Checks per page**: Colors, RGBA, Spacing, Shadows, Z-Index, Radius
- **Score**: Percentage of checks passed
- **Time**: ~2-3s

## GitHub Actions Integration

```yaml
name: Design Compliance

on:
  pull_request:
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'
      - 'src/**/*.css'
      - 'tailwind.config.cjs'
      - 'src/design-system/**'

jobs:
  edl-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: EDL Token Health
        run: pnpm edl:tokens
      - name: EDL Design Audit
        run: pnpm edl:audit
      - name: EDL Component Compliance
        run: pnpm edl:compliance
```

## Local Development

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
pnpm edl:tokens && pnpm edl:audit
```

### VS Code Integration

The VS Code settings (`.vscode/settings.json`) automatically:
- Runs ESLint on save with `edl/*` rules
- Highlights design violations in real-time
- Shows quick fixes for safe violations

### Manual Audit

```bash
# Full audit
pnpm edl:audit

# Auto-fix safe violations
pnpm edl:fix

# Dry-run (see what would change)
tsx tools/design-governance/fixers/edl-fixer.ts

# Generate compliance report
pnpm edl:report
```

## Failure Handling

### Token Health Fails

- **Cause**: Missing or corrupted EDL token file
- **Fix**: Restore the missing file from `src/design-system/edl/`

### Codebase Scan Fails

- **Cause**: New hardcoded values introduced
- **Fix**: Replace with EDL tokens or Tailwind utilities
- **Auto-fix**: `pnpm edl:fix` handles safe replacements

### Component Compliance Fails

- **Cause**: New component not using EDL primitives
- **Fix**: Import from `@/design-system/edl` and use EDL components

## Metrics

Track these metrics over time:
- Overall compliance score (target: ≥ 80%)
- Violations per PR (target: 0)
- Migration progress (target: 100% by Phase 22.0B.6)
- Time to fix violations (target: < 5min)

---

*Pipeline version: 1.0 — Phase 22.0B.5*
