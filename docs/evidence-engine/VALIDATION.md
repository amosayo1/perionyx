# Phase 22.4 — Evidence Engine Validation

> Evidence that the canonical Evidence Engine satisfies its contract and the Decision Workspace remains regression-free.

## 1. Validation Summary

| Domain | Result |
|---|---|
| Engine unit tests (`test/evidence-engine.test.ts`) | **11 / 11 passing** |
| Decision Workspace regression (`test/decision-workspace.test.ts`) | **14 / 14 passing** |
| TypeScript (`pnpm typecheck`) | **0 errors in evidence + decision-workspace files** (only pre-existing `docs/site` + `prisma/seed-fresh.ts` failures) |
| Production build (`pnpm build`) | **Pass** |
| API contract (14 groups, item ids, confidence bands) | **Unchanged** — UI renders the same `data.evidenceGroups` |

## 2. Scope of Validation

The engine (`src/modules/evidence/`) is validated at two layers:

1. **Engine core** — registry, resolver, assembler, context (determinism, dedup, missing evidence, fallibility, request controls, provenance).
2. **Workspace adapter** — the rewired `buildEvidencePackage(input): Promise<EvidenceGroup[]>` must reproduce the exact 14-group contract the UI and prior tests depend on.

Validation used a **fresh `EvidenceRegistry` + `EvidenceAssembler` instance** per test — no global state, no AP dependency — so the engine is proven independently of its reference providers. The workspace regression additionally proves the full path `registerAPEvidenceProviders()` → `assembleEvidenceFor()` → projection.

## 3. Engine Core Verification

### 3.1 Determinism

**Test:** two `assemble()` calls with the identical pinned request (`now: "2026-01-15T12:00:00.000Z"`).

**Result:** identical section order, identical item ids, identical `metadata.contentHash`, identical `metadata.itemCount`. A CFO re-deriving a decision from evidence sees a stable package; the `contentHash` is a tamper-evident integrity digest (sha256 over section/item ids + missing + decisionReady).

### 3.2 Dedup — first-wins

**Test:** provider A emits `a.identity`; provider B emits a duplicate `a.identity` plus `b.risk`.

**Result:** `a.identity` appears exactly once; `metadata.duplicatesSkipped === 1`; `metadata.itemCount === 2`. First emission wins; the skip is measured, not silent.

### 3.3 Missing evidence — mandatory and always present

**Test:** provider declares a blocking `required` and satisfies it; and, separately, a provider that emits nothing.

**Result:**
- The `missing-evidence` section is **always present**, even when nothing is missing (emits `e_1:no-missing`, status `positive`).
- When a required is unfilled, the section emits `missing:{id}` (status `negative`, impact `blocking`) and `metadata.decisionReady` flips `false`.
- Missing evidence is sorted with **blocking gaps first**.

### 3.4 Absence is disclosed, never silent

**Test:** provider loads `missing-record` → `null` and emits an explicit absence item.

**Result:** `d.absence` appears with `status: "negative"` and `confidence: "none"` (`confidenceBasis: "no record present"`). Absence is a first-class fact, matching the Decision Workspace rule (D-07).

### 3.5 Fallibility — a package never rejects

**Test:** provider `test.c` throws `Error("boom")` mid-`provide()` while declaring a blocking required.

**Result:** `assemble()` resolves normally. The package contains:
- a `test.c:failure` item in the metadata section (status `negative`, confidence `none`, reason = thrown message);
- `req.c.data` in `missing` with impact `blocking`;
- `metadata.decisionReady === false`.

The engine's `Promise.all` + per-provider try/catch (assembler.ts:132-146) guarantees a single bad provider cannot fail the assembly — it degrades into typed missing evidence.

### 3.6 Request controls

| Control | Behavior verified |
|---|---|
| `request.sections` | `["identity"]` → only `identity` + mandatory `missing-evidence` emitted; other contributions dropped |
| `request.maxItemsPerSection` | `2` on a 5-item history section → first 2 items by order kept |
| `request.seed` | seeded `seeded-key` value returned by `context.load()` **without calling the fallback fn** (verified with a `vi.fn()` that throws if invoked) |

### 3.7 Provenance

Every item carries `source` (`system`/`type`/`id`/`at`), `sectionId`, and `order`; `metadata.evidenceVersion` is semver (`22.4.0`); `metadata.assembledAt` honours `request.now`.

## 4. Workspace Regression Verification

`test/decision-workspace.test.ts` was migrated from synchronous `buildEvidencePackage(input)` calls to `await buildEvidencePackage(evidenceInput())`. The tests assert the pre-existing UI contract:

- **14 groups in exact order:** invoice, line-items, matching, exceptions, duplicate-detection, po, grn, vendor, policy-checks, transaction-history, previous-decisions, similar-cases, communications, supporting-documents.
- **Item ids preserved:** `match.result` (confidence `high`, `confidenceBasis` containing the fixture's `0.92` match confidence), `po.none`, `grn.none`, `vendor.missing` (status `negative`).
- **Field shape:** every item exposes `label`/`value`/`whyItMatters`/`status`/`confidence`/`confidenceBasis`.

**14 / 14 passing.** The adapter projection (canonical `groupId` → 14-group layout, engine items sorted by `order` before projection, engine-only groups `credits`/`audit`/`timeline` filtered) is contract-preserving. The UI (`workspace-evidence.tsx`) is untouched.

## 5. Verification Commands

```bash
NODE_OPTIONS="--max-old-space-size=8192" pnpm vitest run test/evidence-engine.test.ts   # 11/11
NODE_OPTIONS="--max-old-space-size=8192" pnpm vitest run test/decision-workspace.test.ts # 14/14
NODE_OPTIONS="--max-old-space-size=8192" pnpm typecheck    # 0 errors in evidence + decision-workspace
NODE_OPTIONS="--max-old-space-size=8192" pnpm build        # pass
```

## 6. Security Review

| Question | Answer |
|---|---|
| Exposes sensitive financial data? | **No** — new surface is module-internal; no new API route. |
| Requires a new permission? | **No** — read-only assembly over existing tenant-scoped repository methods. |
| Cross-tenant access? | **No** — every provider reads via `findById(id, companyId)`-style methods; context tenant id comes from the request. |
| Audit logging needed? | **No** — no mutation; provenance (source/at) is inherent to the package. |
| Encryption required? | **No** — no new persisted PII; only in-memory composition. |
| Reversible? | **N/A** — no mutation. |
| Privilege escalation? | **No** — no auth boundary changed. |
| New secrets? | **No**. |
| Rate limiting? | **N/A** — server-side module, no HTTP surface. |
| Constitution compliance? | **Yes** — Data Classification (in-memory transient), events vendor-neutral, tenant isolation absolute. |

## 7. Known Residuals

- `docs/site` + `prisma/seed-fresh.ts` typecheck failures are pre-existing and unrelated.
- The workspace adapter still seeds PO/GRN data from pre-loaded workspace input (the repository layer has no PO/GRN repo — documented in EDP_22_3 D-06); an eventual `po-grn` repository adapter can replace this without touching the surface contract.
