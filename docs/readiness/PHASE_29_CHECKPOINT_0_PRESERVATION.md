# Phase 29.0 — Checkpoint 0: Repository Preservation

**Date:** 2026-08-10
**Status:** COMPLETE

## Situation

- **Branch:** `main`
- **HEAD:** `8f2be5f` (Phase 27.1S — EPS doc stabilisation, authored 2026-07-28)
- **Origin:** `https://github.com/amosayo1/perionyx.git`
- **Divergence:** local `main` is **ahead of `origin/main` by 3 commits**, behind 0.
  - `b8d825d` — Phase 21B.1 (origin/main)
  - `6180312` — Phase 27.1 EPS
  - `e694397` — Infrastructure housekeeping (1,553 files / 110,695+ lines — bulk of phase work)
  - `8f2be5f` — Phase 27.1S (HEAD)

## What exists / What is at risk

### Committed (safe)
The bulk of engineering work through Phase 27.1S is committed on `main` in `e694397` (the "Infrastructure housekeeping — batch commit of completed phases" commit). This includes EDL migration, Runtime Platform (24.0B), AP engine, evidence/decision modules, and prior phase work.

### Working tree (at risk — the delta below is UNCOMMITTED)
| Set | Count | Contents |
|---|---|---|
| Staged | 139 | `design-system/` figma tokens + specs (16), `src/components` (32), `src/modules` (27), `src/app` (9), `src/server` (2), `docs` (42), `test` (9), `brain` (1), `AGENTS.md` |
| Unstaged | 79 | Phase 28.1 remediation: `src/proxy.ts` (header stripping), `src/server` (14 — incl. `init-runtime-context.ts` C-01 work), `src/app/api/v1` (19), `src/app/(shell)/executive` (6), `next.config.ts` (ignoreBuildErrors removal), `tsconfig.json`, `prisma/seed-fresh.ts`, `AGENTS.md` |
| Untracked | 118 | New canonical modules: `src/modules/treasury` (23), `src/modules/enterprise-workflow` (21), `src/modules/evidence` (20), `src/modules/decision-engine` (14); `docs/` (31 — readiness + engine docs), `test` (4), `brain` (3) |

### Secret risk
- `.env` is gitignored (`.gitignore` line: `.env*`); only `.env.example` is tracked.
- No `.env`, `.pem`, `.key`, credential, or secret files present in the untracked set (verified).
- Safe to snapshot the working tree.

## Preservation strategy

1. Create branch `checkpoint/pre-phase-29` from current HEAD `8f2be5f`.
2. Commit the full working tree (staged + unstaged + untracked) as a single snapshot commit:
   `checkpoint: pre-phase-29 working tree snapshot (139 staged + 79 unstaged + 118 untracked)`.
3. Return to `main` (clean tree) and begin Phase 29.0 on `main`.
4. Stash `stash@{0}` (`lint-staged automatic backup`) is left untouched.

This guarantees zero loss: the exact pre-Phase-29 state is recoverable at any time via
`git switch checkpoint/pre-phase-29`.

## Authorisation note
Preservation commit is explicitly authorised by Phase 29.0 rules ("Work is safely committed/checkpointed"
is a Phase 29.0 exit criterion; Checkpoint 0 requires a preservation strategy before code changes).
No history is rewritten; no pushes are performed without explicit instruction.
