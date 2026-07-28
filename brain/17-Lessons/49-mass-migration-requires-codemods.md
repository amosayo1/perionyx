---
title: "Lesson 49: Mass Migration Requires Codemods, Not Manual Edits"
created: 2026-07-27
tags:
  - type/lesson
  - domain/engineering
  - status/validated
aliases:
  - Codemod Lessons
  - Migration Automation
---

# Lesson 49: Mass Migration Requires Codemods, Not Manual Edits

When 448 files share the same pattern, manual migration is not an option. A codemod script handles the repetition, catches edge cases systematically, and produces consistent results. The human focuses on the 10 files that don't fit the pattern.

---

## Context

Phase 26.0A required migrating 448 consumers of `requireTenantContext()` to `withRuntimeContext()`. The pattern was identical across 366 API routes:

```typescript
// Before
const session = await auth();
const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

// After
return withRuntimeContext(request, async (ctx) => {
  // ctx.tenant is guaranteed non-null
});
```

Manual migration of 448 files would have taken days and introduced inconsistencies. A codemod script (`scripts/migrate-routes.mjs`) handled 446 of 448 files automatically. The remaining 10 required manual intervention for edge cases the codemod couldn't handle (multi-line imports, `session` property access, redundant `requireTenantContext` calls).

## The Lesson

1. **Pattern recognition before automation**: Identify the exact pattern (import statement, function call, variable usage) before writing the codemod
2. **Iterative refinement**: The codemod went through 3 versions — v1 handled basic cases, v2 added multi-line imports, v3 added no-param functions and bare `ctx` patterns
3. **Manual edge cases are expected**: ~2% of files will have patterns the codemod can't handle. Budget for manual cleanup
4. **Verification is non-negotiable**: Run typecheck after each codemod iteration. Zero errors before proceeding
5. **Delete the codemod after use**: The script is a migration tool, not production code. Archive it

## Evidence

- Codemod v3: 446/448 files migrated (99.6% success rate)
- 10 files required manual fixes (2.2% edge case rate)
- 3 typecheck iterations to reach zero errors
- Total migration time: ~2 hours (codemod development + execution + manual fixes)
- Estimated manual time: ~40 hours (448 files × 5 min each)

## Relationship to Other Lessons

- Extends Lesson 25 (one implementation per primitive) — mass migration enforces the single implementation
- Connects to Lesson 44 (context propagation is invisible architecture) — the migration makes the invisible visible
- Validates Principle #23 (architecture readiness review) — the review identified the migration as necessary
