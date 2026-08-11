# Phase 22.3 — Decision Workspace: Validation Report

**Status:** Complete · **Compliance estimate:** ~40% → **~90%** of Product System requirements for the Invoice Workspace surface

This document maps every requirement in `DECISION_WORKSPACE_REDESIGN_SPEC.md` to its implemented artifact, provides per-zone evidence, records deviations with rationale, and reports verification results.

---

## 1. Summary

| Dimension | Audit baseline (before) | After Phase 22.3 |
|---|---|---|
| Product System compliance (Decision Intelligence 06, Finance 04, Procurement 05) | ~35% | **~90%** |
| Verdict | "A details page, not a decision surface" | Evidence-first decision surface |
| Recommendation | Missing → deterministic, categorical, band + basis, no fabricated scalars | Implemented + unit-tested |
| Decision timeline | Missing → no chronological integrity | Implemented (merged audit + approvals + exceptions) |
| Policy visibility | Missing → no governing rule shown | Implemented (approval matrix threshold) |
| Confidence | Fake scalar `0.15` (SEV-2) | Categorical band + measured basis, `ai: null` |
| Keyboard operation | Mouse-only | `?` legend + `a/r/x/b/d/v/k/j/t` |
| Actions | Scattered, no consequences | Unified right zone, consequence preview, confirmation dialogs |

---

## 2. Requirement → Implementation Map

| Spec § | Requirement | Implemented in | Status |
|---|---|---|---|
| §3 Architecture | 3-zone layout: summary / evidence / actions | `workspace-summary.tsx`, `workspace-evidence.tsx`, `workspace-actions.tsx`; grid in `decision-workspace.tsx` (`lg:grid-cols-12`) | ✅ |
| §4 | Mobile order summary → actions → evidence | `decision-workspace.tsx` (flex ordering via CSS) | ✅ |
| §5.1 EvidenceItem | id/groupId/label/value/status/confidence/confidenceBasis/evidence/timestamp/related/whyItMatters/expandable | `src/modules/decision-workspace/types.ts` + `buildEvidencePackage` | ✅ |
| §5.2 EvidenceConfidence | Categorical band `high\|medium\|low\|none`, basis mandatory | `bandFromScore()` in `recommendation.ts`; every item passes a basis | ✅ |
| §5.3 Recommendation | category/confidence/basis/supportingEvidence/evidenceGaps/riskFactors/alternatives/suggestedAction/derivedAt/ai=null | `Recommendation` type + `deriveRecommendation()` | ✅ |
| §5.4 DecisionSummary | status, recommendation, risks, requiredAction, businessImpact, policy | `buildSummary()` in `workspace-service.ts` | ✅ |
| §5.5 DecisionWorkspaceData | summary, evidenceGroups, timeline, actions | `DecisionWorkspaceData` type; assembled in `getDecisionWorkspace()` | ✅ |
| §6 | Deterministic priority: reject → review → approve → no-signal | `deriveRecommendation()` (tested) | ✅ |
| §6 | evidenceGaps lists what was not present | `deriveRecommendation()` (e.g. "No three-way match result") | ✅ |
| §7 Timeline | Merge audit + approvals + exceptions, chronological, every entry has actor + timestamp | `buildTimeline()` (audit `getEntityAuditTrail` + approval records + exception records) | ✅ |
| §8 Related intelligence | Transaction history, previous decisions, similar cases, communications, duplicate, policy checks, open credits | `evidence.ts` groups `transaction-history`, `previous-decisions`, `similar-cases`, `communications`, `duplicate-detection`, `policy-checks`, `matching` | ✅ |
| §9 Actions | Reuse existing AP endpoints only | `buildActions()` + `workspace-actions.tsx` → `/api/v1/ap/invoices/[id]/{approve,reject,escalate,block,dispute,void}` | ✅ (request-info/assign dropped — no endpoint exists) |
| §9 | Dialog `role="dialog"`, focus trap, Escape, labelled fields, consequence preview, destructive confirmation | `AnimatedDialog` (enterprise primitive) + labelled textarea/select + consequence text | ✅ |
| §10 Keyboard-first | `?` legend, P1 `a/r/x`, P2 `b/d`, `k/j`, `t`, `isTypingTarget` guard | `workspace-shortcuts.tsx` | ✅ (partial — see deviations) |
| §11 EDL compliance | Tokens only, no new hex literals | All components use `@/design-system/edl` tokens via Tailwind | ✅ |
| §11 Money (F-08) | One formatting source | `src/modules/decision-workspace/format.ts` — server-side `formatCurrency`/`formatDateTime`/`formatNumber` | ✅ |
| §11 Accessibility | WCAG 2.1 AA — labelled fields, aria, no color-only signals | Label/input pairing, `aria-invalid`, text+icon status (not color-only) | ✅ |

### Evidence groups (14, ordered 1–14) — `buildEvidencePackage()`

`invoice` → `line-items` → `matching` → `exceptions` → `duplicate-detection` → `po` → `grn` → `vendor` → `policy-checks` → `transaction-history` → `previous-decisions` → `similar-cases` → `communications` → `supporting-documents`.

Key item ids: `inv.amount`, `inv.balance`, `match.result` (band + basis from `overallConfidence`), `exc.clean`, `dup.suspicion`, `po.none`/`po.id`/`po.amount`, `vendor.missing`/`vendor.risk`/`vendor.blocked`, `policy.level`/`policy.roles`/`policy.required`, `tx.none`, `prev.none`, `similar.none`, `comm.none`/`comm.internal`, `docs.none`. Absence is always disclosed as `negative`/`pending` — never silence.

---

## 3. Per-zone evidence

### Left zone — Decision Summary (`workspace-summary.tsx`)
- Status rendered as dot + label + plain-language explanation.
- Recommendation: categorical badge + confidence band + basis sentence + supporting evidence ids.
- Risk summary (severity-ordered list), required action, business impact (exposure, overdue days, aging, high-value flag), governing policy (approval matrix threshold + applies flag).
- Freshness: `derivedAt` timestamp shown.

### Center zone — Evidence Package (`workspace-evidence.tsx`)
- 14 collapsible groups, stable order, each with title + description + items.
- Items are expandable (`data-evidence-item` anchors) with status color/icon, confidence band + basis, timestamp, related records, why-it-matters.
- Timeline rendered in the center zone beneath the evidence groups (`workspace-timeline.tsx`) — append-only merged feed.

### Right zone — Decision Actions (`workspace-actions.tsx`)
- Available actions derived from status guards mirroring `invoice-service.ts` (approve/escalate: `MATCHED`/`PENDING_APPROVAL`; reject: `MATCHED`/`PENDING_APPROVAL`/`APPROVED`; block/void: `CAPTURED`/`VALIDATED`; dispute: `CAPTURED`/`VALIDATED`/`MATCHED`).
- Each action: consequence preview text, reason field where required (min 10 chars, mirroring server), confirmation dialog for destructive actions, error display on failed calls.
- Shortcut legend dialog (`?`).

---

## 4. Deviations from spec (with rationale)

| Spec | Actual | Rationale |
|---|---|---|
| `DecisionWorkspaceData.formatted` bag of client formatters | Removed — all values pre-formatted server-side in `format.ts` | Spec §5.1 itself requires "already formatted by server". Keeps money formatting in exactly one place (F-08) and keeps the client bundle small. |
| Actions `request-info` and `assign` | Dropped from `AvailableAction` | No existing endpoint. Phase 22.3 constraint: **no new API surface**. Revisit when the EPS approval flow ships request-info. |
| Shortcut `f` (focus evidence search) | Dropped | No evidence search control implemented in this phase; keeps the legend honest. |
| Shortcut `v` (void) | Added as P2 | `void` is a real available action (endpoint exists) and deserves a shortcut. |
| `workspace-evidence-item.tsx` (spec file list) | Inlined into `workspace-evidence.tsx` | One fewer file, identical behavior. |

---

## 5. Verification

```bash
# TypeScript (strict) — 0 new errors; only pre-existing docs/site + seed-fresh remain
NODE_OPTIONS="--max-old-space-size=8192" pnpm typecheck   # 11 pre-existing, none in decision-workspace

# Production build — PASS, route compiled
pnpm build                                                 # /procurement/invoices/[invoiceId] ✓

# New unit tests — 14/14
pnpm vitest run test/decision-workspace.test.ts

# Regression — 112/112 existing
pnpm vitest run test/procurement/ap-api.test.ts test/runtime.test.ts   # 52 + 60
```

The build initially failed on the exact H-01 hazard: a client component imported the module **barrel**, which re-exports the Prisma-backed `decisionWorkspaceService`, pulling `pg` into the client bundle. Fixed by deep-importing `types` + `format` only from client components. The barrel is imported solely by the server page.

### Test coverage (`test/decision-workspace.test.ts`)
- `bandFromScore` mapping (incl. `NaN` → `none`).
- No fabricated scalars: `ai === null`, band is always one of 4 values, basis always present.
- Decision priority: approve (clean full match) → review (low confidence / partial / no match / unresolved exception) → reject (high-confidence duplicate) → no-signal (terminal status).
- Evidence package: all 14 groups in order; every item has non-empty `confidenceBasis` + `whyItMatters` + valid status/confidence; matching band derives from measured `overallConfidence`; missing PO/GRN/vendor disclosed as negative/pending.

---

## 6. Security & compliance checklist

| # | Question | Answer |
|---|---|---|
| 1 | Exposes sensitive financial data? | Only within an authenticated, tenant-scoped page; values pre-formatted server-side |
| 2 | New permission? | No — reuses existing AP endpoints and page auth |
| 3 | Cross-tenant access? | No — service queries scoped by `companyId`; PO/GRN loaded with company filter |
| 4 | Audit logging? | Yes — all mutations go through existing AP command services which record audit entries |
| 5 | Encryption required? | No new PII/secret handling |
| 6 | Reversible? | Actions mirror existing reversible/confirmed flows; destructive actions get confirmation dialogs |
| 7 | Privilege escalation? | No — no new endpoints, no bypassed permission checks |
| 8 | New secrets? | None |
| 9 | Rate limiting? | Existing proxy rate limiting applies to the reused endpoints |
| 10 | Architecture compliance? | Yes — no new API surface, EDL tokens, DI rules R2/R3/P4/P7/P8 honored |

---

## 7. Residual gaps (deferred, documented)

1. **No live demo data** — Demo Company has 0 AP invoices; the 28k AP seed is stale (`COMPANY_ID` mismatch). Not seeded per user decision; drive the workspace with new seed when the AP seed is repaired.
2. **`ai` always `null`** — reserved for Decision Intelligence platform output; when DI ships, the evidence package is already the contract it feeds.
3. **`formatted` bag not in the client payload** — intentional deviation; revisit only if a future screen needs client-side formatting.
4. **Evidence search (`f`)** — deferred; search is a later phase.
5. **PO/GRN loaded via direct Prisma** (no AP repository) — the AP repo layer lacks PO/GRN repositories; a repository adapter can replace the direct query without changing the surface contract.

---

*Companion documents: `DECISION_WORKSPACE_AUDIT.md` (baseline) · `DECISION_WORKSPACE_REDESIGN_SPEC.md` (spec) · `EDP_22_3.md` (decision packet).*
