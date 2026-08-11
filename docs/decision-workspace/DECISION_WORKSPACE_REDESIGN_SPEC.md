# Phase 22.3 — Decision Workspace: Redesign Specification

**Deliverable 2 of 5 · Phase 22.3 — Decision Workspace**
**Authority: Product System (docs/product-system/), especially 06 Decision Intelligence, 01 Product Philosophy, 04 Finance Principles, 05 Procurement, 20 Product Constitution.**
**Guiding question: "Can I confidently make this financial decision?"**

---

## 1. Objective

Replace the Invoice Workspace details page with the canonical Perionyx **Decision Workspace**: the signature, evidence-first, auditable financial decision surface. The surface must make the decision obvious, the evidence inspectable, the recommendation honest, and the action reversible-in-policy.

## 2. Scope

| In scope | Out of scope |
|---|---|
| New module `src/modules/decision-workspace/` (types, evidence assembly, recommendation) | New API endpoints (reuse existing `api/v1/ap/invoices/[id]/…`) |
| Rebuild `src/components/decision-workspace/` (3-zone layout) | Changes to AP domain / repositories |
| Rewire `src/app/(shell)/procurement/invoices/[invoiceId]/page.tsx` | Changes to the AI platform (stub stays) |
| New docs `docs/decision-workspace/` (audit, spec, validation, EDP) | Regressing Phase 22.2 Dashboard v2 |

## 3. Architecture

```
src/modules/decision-workspace/
  types.ts            # EvidenceItem, EvidenceGroup, Recommendation, DecisionSummary, DecisionWorkspaceData
  evidence.ts         # buildEvidencePackage(): repository data → EvidenceGroup[]
  recommendation.ts   # deriveRecommendation(): evidence + invoice → categorical Recommendation (deterministic, no AI)
  workspace-service.ts# getDecisionWorkspace(invoiceId, companyId): DecisionWorkspaceData (server-only)
  index.ts            # barrel
```

- **Server-only.** The service is never imported by client components (mirrors Dashboard v2 pattern: client imports types only).
- **No duplicated domain logic.** All derivation is a pure projection over the canonical repositories (`getAPRepositories()`), the `work-queue/status.ts` helpers, and the EDL tokens. The repositories remain the canonical source of truth.
- **The stub AI service is not called.** Its contract can't produce evidence-grounded output; the recommendation is a deterministic, rule-based projection of measured data. If a real DI implementation replaces it later, the *Recommendation* shape is the extension point.

## 4. The Decision Surface (3 Zones)

```
┌─ LEFT: DECISION SUMMARY ────────────────┬─ CENTER: EVIDENCE PACKAGE ────────────────┐
│  Status (dot+label+explanation)         │  Invoice overview (amounts, dates, terms) │
│  Current Recommendation (categorical)   │  Line items                               │
│  Confidence band + basis                │  PO / GRN (status, amounts, line compare) │
│  Risk summary (severity list)           │  Vendor (risk, spend, payment behaviour)  │
│  Required action + suggested action     │  Transaction history / previous decisions │
│  Business impact (exposure, overdue)    │  Similar cases                             │
│  Governing policy (approval matrix)     │  Communications / notes                    │
│                                         │  Exceptions → resolution status           │
│                                         │  Policy checks                             │
│                                         │  Matching status (band + basis)           │
│                                         │  Duplicate detection                       │
│                                         │  Supporting documents                      │
│                                         │  Decision Timeline (who/what/when/why)    │
└─────────────────────────────────────────┴────────────────────────────────────────────┘
┌─ RIGHT: DECISION ACTIONS ───────────────┐
│  Primary: Approve / Reject              │
│  Secondary: Request info / Escalate /   │
│            Block / Dispute / Assign     │
│  Each with consequence preview          │
│  Audit history access                   │
│  Keyboard shortcuts legend              │
└─────────────────────────────────────────┘
```

## 5. Data Model

### 5.1 EvidenceItem (06 §3)

```ts
interface EvidenceItem {
  id: string;                  // stable, e.g. "inv.duplicate"
  groupId: string;
  label: string;               // human label ("Line-item variance")
  value: string;               // rendered value (already formatted by server)
  status: EvidenceStatus;      // positive | negative | neutral | pending | action
  confidence: EvidenceConfidence; // categorical band
  confidenceBasis: string;     // "what was measured" — never "from the model"
  evidence: string[];          // supporting record references (ids + human labels)
  timestamp: string | null;    // ISO of the underlying fact
  related?: string[];          // related record ids (invoice/PO/GRN/vendor)
  whyItMatters: string;        // the "so what" for a CFO
  expandable?: boolean;
}
```

### 5.2 EvidenceConfidence (DI-R2, DI-P4)

Categorical, band-with-basis — **never a raw scalar**:

```ts
type EvidenceConfidence = "high" | "medium" | "low" | "none";
```

Basis is mandatory text describing exactly what was measured (e.g. "line-level 2-way match against PO 3 of 5 lines; 2 lines unmatched").

### 5.3 Recommendation (DI-R3, DI-P7)

```ts
type RecommendationCategory = "approve" | "review" | "reject" | "no-signal";

interface Recommendation {
  category: RecommendationCategory;    // derived, deterministic
  confidence: EvidenceConfidence;      // band of the deciding evidence set
  basis: string;                       // what drove the category
  supportingEvidence: string[];        // evidence item ids
  evidenceGaps: string[];              // what is missing
  riskFactors: { id: string; label: string; severity: "high" | "medium" | "low" }[];
  alternatives: string[];              // "why not the other action" (DI-P7)
  suggestedAction: string | null;      // human action string
  derivedAt: string;                   // ISO timestamp
  ai: null;                            // reserved — DI output, no fake scalars
}
```

### 5.4 DecisionSummary (left zone)

```ts
interface DecisionSummary {
  status: { label: string; dot: string; explanation: string };
  recommendation: Recommendation;
  risks: { severity: "high" | "medium" | "low"; label: string }[];
  requiredAction: string | null;
  businessImpact: { exposure: string; overdueDays: number | null; aging: string } | null;
  policy: { label: string; threshold: string; applies: boolean } | null;
}
```

### 5.5 DecisionWorkspaceData

```ts
interface DecisionWorkspaceData {
  summary: DecisionSummary;
  evidenceGroups: EvidenceGroup[];       // ordered center-zone groups
  timeline: TimelineEntry[];             // append-only decision timeline
  actions: ActionContext;                // available actions + audit history
  formatted: { currency: (n) => string; date: (iso) => string; percent: (n) => string };
}
```

## 6. Recommendation derivation (deterministic, no AI)

Decision priority, strongest signal wins:

1. **REJECT** if status is `BLOCKED` or `FULLY_PAID` (terminal, not actionable) or duplicate-suspicion is high with hard match.
2. **REVIEW** if any active exception exists (`DUPLICATE`, `NO_PO`, `GL_CODING_REQUIRED`, `TAX_MISMATCH`, `PRICE_VARIANCE`), or match is unresolved (`overallConfidence` band `low`/`none` with partial matching), or PO mismatch, or policy threshold would be exceeded.
3. **APPROVE** if matched, no unresolved exceptions, `overallConfidence` band `high`/`medium`, within policy.
4. **NO-SIGNAL** when the invoice is in an informational state (draft) or evidence is absent.

Confidence band = the band of the deciding evidence set (matching confidence mapped to a band with basis), **not** a computed blend of unrelated numbers. `evidenceGaps` always lists what was not present (no PO, no GRN, no similar cases, no payment history, no communications, no policy match).

## 7. Decision timeline (06 §9, F-39)

Merge, chronological, append-only, one entry per event:

- AP audit trail (`getEntityAuditTrail("PROCUREMENT_VENDOR_INVOICE", id, companyId)`)
- Approval steps (approver, action, comment, delegated from/to, escalation)
- Status transitions with actor
- Exceptions with resolution events

Entry shape: `{ id, at, actor, action, detail, evidence: string[], outcome }`. Every entry has an actor and a timestamp — **no anonymous mutations**.

## 8. Related intelligence (center-zone "Related" groups)

| Group | Source |
|---|---|
| Transaction history | `paymentRepo.findByInvoiceId` |
| Previous decisions | approvals + audit trail entries for this vendor/invoice |
| Similar cases | latest invoices for the same vendor (`invoiceRepo.findLatestByVendor`) + duplicateOf invoice |
| Communications | `vendorMemo` / `internalMemo` on invoice + vendor `notes` |
| Duplicate detection | `isDuplicateSuspicion`, `duplicateOfInvoiceId`, `duplicateConfidence` + duplicate-type exceptions |
| Policy checks | `getApprovalMatrix` matched against invoice amount |
| Open disputes | credit/open credits for vendor (`creditRepo.findOpenByVendor`), payment disputes |

## 9. Decision actions (right zone)

Reuse existing endpoints — **no new API surface**:

| Action | Endpoint | Consequence preview |
|---|---|---|
| Approve | `POST /api/v1/ap/invoices/[id]/approve` | Resulting approval path + next status |
| Reject | `POST …/reject` | Resulting status + reason required (min 10 chars) |
| Request info | `POST …/reject` (rejectReason "request-info") OR follow existing pattern | — |
| Escalate | `POST …/escalate` | Escalation target |
| Block | `POST …/block` | Resulting `BLOCKED` status + reason + type |
| Dispute | `POST …/dispute` | Resulting dispute state |

Each action modal: `role="dialog"`, focus trap, Escape, labelled fields, destructive actions get a confirmation, and every action previews consequence before executing. **Every mutation records an audit entry** (handled by the existing command services).

## 10. Keyboard-first (operator velocity)

`?` opens shortcut legend. Priority-1: `a` approve · `r` reject · `x` escalate. Priority-2: `b` block · `d` dispute · `k`/`j` next/prev evidence item. Priority-3: `f` focus evidence search · `t` jump to timeline. Guarded so typing in a textarea/input never triggers a shortcut. Full legend rendered in the action zone.

## 11. Design compliance

- **EDL tokens only** (`@/design-system/edl`): surfaces, text, borders, status, financial, risk, AI, spacing, radius, motion, z-index. No new hex literals.
- **Clarity:** every zone answers one question; the three zones have a stable reading order.
- **Confidence:** every number carries a source + age; recommendation carries a band + basis.
- **Accessibility (PP-113):** WCAG 2.1 AA — dialogs with correct roles, focus management, `aria-describedby`, label/input pairing, no color-only signals.
- **Money (F-08):** one `formatCurrency` in the workspace module; all components consume the `formatted` bag.

## 12. Files

| Action | Path |
|---|---|
| Create | `src/modules/decision-workspace/{types,evidence,recommendation,workspace-service,index}.ts` |
| Create | `src/components/decision-workspace/{decision-workspace.tsx,workspace-summary.tsx,workspace-evidence.tsx,workspace-evidence-item.tsx,workspace-timeline.tsx,workspace-actions.tsx,workspace-shortcuts.tsx,types.ts,index.ts}` |
| Replace | `src/app/(shell)/procurement/invoices/[invoiceId]/page.tsx` |
| Keep (deprecated, untouched) | `src/components/invoice-workspace/` (left in place; not imported) |
| Docs | `DECISION_WORKSPACE_AUDIT.md` ✅ · `DECISION_WORKSPACE_REDESIGN_SPEC.md` · `DECISION_WORKSPACE_VALIDATION.md` · `EDP_22_3.md` |

*Next: implementation.*
