# Phase 22.3 — Decision Workspace: Audit of the Current Invoice Workspace

**Deliverable 1 of 5 · Phase 22.3 — Decision Workspace**
**Authority: Product System (docs/product-system/), especially 06 Decision Intelligence, 01 Product Philosophy, 04 Finance Principles, 05 Procurement Principles, 20 Product Constitution.**
**Scope: `src/components/invoice-workspace/` (9 files) + `src/app/(shell)/procurement/invoices/[invoiceId]/page.tsx`.**

---

## 1. Verdict

The current Invoice Workspace is a competent **details page**. It is not a **Decision Workspace**. It presents the invoice and its related objects in cards, but it never assembles them into a decision: there is no decision question, no recommendation grounded in evidence, no evidence package, no risk summary, no consequence preview, and no audit-reconstructable timeline. It fails the Decision-Surface Doctrine (Philosophy §3) and the Decision Intelligence specification (06) at its core, and it ships a fabricated confidence scalar that the Product Constitution names a non-negotiable violation.

**Product System compliance: ~35%.**

---

## 2. What Is Good (Keep)

| Aspect | Evidence | Product System support |
|---|---|---|
| Tenant-scoped reads | All repository reads pass `companyId`; page returns `notFound()` on missing invoice | PP-011, Law 11 (tenant isolation) |
| Independent fallibility | Page loads 6 related datasets via `Promise.allSettled`; one failure does not blank the page | PP-058 (anti-pattern A-6) |
| Approval timeline renders who/what/when/comment | `approval-timeline.tsx` shows approver, timestamp, role, comment, delegation, escalation | PP-151, F-39 (history on the object) |
| Exceptions surface severity + status + resolution | `exception-summary.tsx` | PR-20, PP-099 (exceptions are work) |
| Supplier risk level displayed | `supplier-info.tsx` shows `riskLevel`/`riskScore` | PR-06, PR-40 (score with context) |
| Supporting documents categorized | `supporting-documents.tsx` shows category, size, type, OCR flag | PR-11, PR-51 |
| Actions are recorded | ActionPanel calls the existing AP endpoints (`/api/v1/ap/invoices/[id]/approve|reject`) | PP-165, F-08 (no new API surface needed) |
| Status rendered with label + color | Status badges pair color with text | PP-125, F-32 (color never sole carrier) |

---

## 3. Findings

Findings are ordered by severity within the Product System's decision hierarchy (Constitution > Philosophy > Decision Intelligence > domain principles).

### SEV-1 — No Decision Workspace exists; it is a details page (Critical)

The page answers "what is this invoice?" not "should this invoice be approved?". There is no declared question (PP-048, Philosophy §3), no decision summary, no current recommendation, no risk summary, no required action, no business impact. The layout is a 2-column card stack (`lg:grid-cols-3`), not the Decision Workspace's three zones (question → evidence → action). Violates the Decision Workspace definition (06 §2), the Decision-Surface Doctrine, and the DI invariant "never make the decision surface optional" (06 §13.10).

### SEV-2 — Fabricated confidence scalar from a placeholder AI stub (Critical)

`aiRecommendationService.analyzeInvoice()` is a stub: it returns a hardcoded `confidence: 0.15` with the string "AI analysis is not yet available". The UI then renders "**15% confidence**" as if it were measured. This violates, in order:

- Constitution non-negotiable 2/3 (AI never fabricates; never hides reasoning).
- Measured-Confidence Doctrine (Philosophy §10): "never present an unverifiable scalar as precision".
- DI-R2 / DI-P4 (categories, not confidence scores; bands with basis).
- Anti-pattern D-3 (the fake confidence): "a percentage that doesn't correspond to any model".

A placeholder that reports a number it cannot defend is worse than the absence of a recommendation.

### SEV-3 — No Evidence Package (Critical)

The related objects are rendered as five separate cards (summary, matching, exceptions, approvals, documents) with **no shared evidence model**. No evidence item exposes source, status, confidence, timestamp, related records, or "why it matters" (06 §3). Nothing is expandable (PP-110: reasoning/evidence expandable). There are no evidence gaps (what is missing is never stated). The Evidence-Package rule (06 §3) — *a recommendation without a full Evidence Package does not render as a recommendation* — cannot be satisfied because no package exists.

### SEV-4 — Missing PO, GRN, line items, transaction history, similar cases, communications (High)

The invoice's data contract and the page already fetch **line items** (`getLineItems`) but the client never renders them. The PO and GRN references (`poReferenceId`, `grnReferenceId`) are shown as bare IDs with no PO/GRN object, no status, no amounts, no line-level comparison. There is no vendor transaction history, no previous decisions, no similar historical cases, no vendor communications/notes (the `vendorMemo`/`internalMemo` fields are unused). All are required by the Evidence Package inventory (06 §3) and the "no context switching" requirement of the workspace brief.

### SEV-5 — No Decision Timeline (High)

Only the *approval* timeline exists. There is no append-only decision timeline covering who/what/when/why/outcome for status changes, exceptions, matching, and audit events. The AP `IAuditRepository.getEntityAuditTrail()` (append-only, tamper-evident) exists and is unused. Violates DI §9 (auditability), F-39 (timeline on the object), PR-37.

### SEV-6 — No Related Intelligence (High)

Nothing surfaces duplicate detection, policy violations, open disputes, payment history, or recent changes — despite the data being available (`isDuplicateSuspicion`, `duplicateOfInvoiceId`, `duplicateConfidence`, exception types `DUPLICATE`/`NO_PO`/`GL_CODING_REQUIRED`/`TAX_MISMATCH`, `paymentBatch.findByInvoiceId`, `credit.findOpenByVendor`). The workspace brief requires supplier risk, payment history, open disputes, duplicate detection, policy violations, matching status, and recent changes on the surface.

### SEV-7 — No governing policy rendered (High)

The approve action shows no matrix entry, threshold, or policy that justifies the decision (DI-A2, PP-030, PR-25). The human cannot approve "with reference to the rule". Violates PR-25 ("every approval carries its justifying policy").

### SEV-8 — No consequence preview (High)

Approve executes immediately with no preview of the resulting state — pro forma approval chain, resulting balances, downstream effect (DI-P8, F-37). Only reject requires a reason. Violates the consequence-preview requirement for money decisions.

### SEV-9 — Recommendation panel lacks required anatomy (Medium)

The panel renders recommendation + reason + flat `supportingEvidence: string[]` + suggested action, but has no evidence gaps, no risk factors, and no alternatives ("why not this", PP-148 / DI-P7). Confidence is a fabricated scalar (see SEV-2).

### SEV-10 — Action panel is approve/reject only (Medium)

No escalate, block, dispute, request-information, or assign actions — despite `escalate`, `block`, `dispute`, `unblock`, `void` endpoints already existing (`src/app/api/v1/ap/invoices/[id]/…`). The workspace brief requires Approve / Reject / Request information / Escalate / Assign / Comment / Audit history. Also missing: audit history access on the decision surface.

### SEV-11 — Money formatting duplicated across 5 components (Medium)

`formatCurrency`/`formatDate` are re-implemented in `invoice-summary`, `supplier-info`, `matching-status`, `exception-summary`, `approval-timeline`, `supporting-documents`. Violates F-08 (one currency layer), PP-131 (shared capability implemented once), and the EDL discipline.

### SEV-12 — Matching confidence shown as an unbounded percentage (Medium)

`matching-status.tsx` renders `Confidence: {Math.round(overallConfidence * 100)}%` with no basis. Matching variance *is* measured data and may warrant a band, but the raw percentage lacks the band + basis the Measured-Confidence Doctrine requires (Philosophy §10, DI §5).

### SEV-13 — Accessibility gaps (Medium)

The reject modal is a raw `<div>` overlay with no `role="dialog"`, no focus trap, no Escape handling, no labelled textarea (`htmlFor`/`id`), no `aria-describedby`. Buttons rely on color alone in places. Violates PP-113 (WCAG 2.1 AA is a release gate), PP-115 (focus management), anti-pattern E-2.

### SEV-14 — Not keyboard-first (Medium)

No keyboard shortcuts, no j/k triage, no focus management for the action flow. The workspace brief requires keyboard-first interaction (operator velocity, PP-116, PP-090).

### SEV-15 — No evidence freshness / staleness labeling (Low)

Status and recommendation render without age or staleness labels (PP-013, PP-060, F-28). An approver cannot see whether the match result is fresh or stale.

---

## 4. Compliance Mapping (Current State)

| Product System requirement | Status |
|---|---|
| The screen is a decision surface (Philosophy §2/3) | ✗ Details page |
| Evidence Package with 8 components (06 §3) | ✗ None |
| Recommendation is categorical, band-with-basis (DI-R2, DI-P4) | ✗ Fabricated scalar 15% |
| Recommendation carries evidence, gaps, risk, alternatives (DI-R3, DI-P7) | ✗ Partial (evidence list only) |
| Reasoning rendered, inspectable (DI-P5) | ✗ |
| Governing policy rendered (DI-A2, PR-25) | ✗ |
| Consequence preview (DI-P8, F-37) | ✗ |
| Decision timeline on the object (F-39, PR-37) | ✗ Approvals only |
| Related intelligence on the surface (workspace brief) | ✗ |
| PO/GRN/line items/transaction history/similar cases (PR-03, PR-50) | ✗ Missing |
| Actions preserve context, include escalate/block/dispute (brief) | ✗ Approve/reject only |
| Keyboard-first (PP-090, PP-116) | ✗ |
| Accessibility AA release gate (PP-113) | ✗ Modal defects |
| Money rendering centralized (F-08, PP-131) | ✗ 5 local formatters |
| Independent fallibility (PP-058) | ✓ allSettled |
| Tenant-scoped reads (Law 11) | ✓ |
| Status = dot + label + explanation (F-32) | ✓ Mostly |
| Exceptions are first-class work (PP-099) | ✓ |
| Append-only audit available for use (F-08) | ✓ (unused) |

---

## 5. What Must Be Built (Consolidated)

1. A three-zone Decision Workspace: **Decision Summary (left) → Evidence Package + Recommendation + Timeline (center) → Decision Actions + Audit (right)**.
2. A canonical **Evidence Package** where every item exposes source, status, confidence band, timestamp, related records, and "why it matters", grouped as Invoice / PO / GRN / Vendor / Transaction history / Previous decisions / Communications / Policy checks / Supporting documents / Similar cases / Exceptions.
3. A **deterministic, evidence-derived recommendation** — categorical (Approve / Needs review / Reject) with a band + basis, supporting evidence, evidence gaps, risk factors, and a suggested next action. **No fabricated scalars; the stub AI service is not used.**
4. A **decision timeline** built from the append-only AP audit trail + approvals + status changes + exceptions (who/what/when/why/evidence/outcome).
5. **Related intelligence**: supplier risk, payment history, open disputes, duplicate detection, policy violations, matching status, recent changes.
6. **Decision actions** that reuse the existing AP endpoints (approve, reject, escalate, block, dispute) with consequence preview and the governing policy rendered.
7. Accessibility AA (dialog semantics, focus trap, labelled fields), keyboard-first flows, EDL tokens, and centralized formatting.

*Next: `DECISION_WORKSPACE_REDESIGN_SPEC.md`.*
