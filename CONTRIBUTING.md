# Contributing Guide

## Process

1. Create a feature branch from `main`
2. Make changes following our [Developer Guide](./DEVELOPER.md)
3. Run `pnpm typecheck` and `pnpm lint`
4. Create a pull request

## What We Accept

- New workspace additions (additive only)
- Bug fixes
- Performance improvements
- Documentation improvements
- UI polish and consistency

## What We Do Not Accept

- Backend logic changes
- Database schema changes
- API contract changes
- Module redesigns
- Dependency additions (without approval)

## Code Review

- Every PR requires one approval
- Zero TypeScript errors required
- Zero lint errors required
- Production build must pass
- No existing functionality may be modified

## Design Principles

1. **Dark zinc first** — all UI uses the PERIONYX design palette
2. **Server components** — minimize client boundaries
3. **Glassmorphism** — consistent card styling with subtle borders
4. **Emerald accents** — primary actions and status indicators
5. **Additive architecture** — never modify, always extend
