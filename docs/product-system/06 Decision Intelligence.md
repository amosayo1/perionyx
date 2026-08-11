# 06 — Decision Intelligence

**Product System · Document 06 of 20**
**Authority: Decision Intelligence is the defining capability of Perionyx. This document defines the Decision Workspace, the Evidence Package, the Recommendation, confidence, reasoning, the evidence graph, human approval, auditability, explainability, the decision lifecycle, and the decision principles. It is binding on all AI, intelligence, and decision surfaces.**
**Sources: The four-product research program — Stripe S14.4 (the Decision Intelligence sketch), Ramp S13 (the AI Trust Contract), Linear S13.4 (the operator loop), Coupa S7 (spend intelligence) and S11 (AI governance); the EPS AI Behaviour Guide; the Agent Framework (EvidenceEngine, DecisionEngine, ApprovalIntegration); the Phase 21A AP decision model.**

---

## 1. Why Decision Intelligence Is the Differentiator

Every competitor in the financial-operating category has data. Most have dashboards. Some have AI. **No competitor has made the financial decision itself a first-class, auditable, exportable artifact with its full evidence chain.** That is Perionyx's differentiator, and it is durable because it is architectural and constitutional, not a feature toggle (Document 18).

Decision Intelligence (DI) is not "AI features sprinkled on dashboards." It is a **complete decision layer**: the machinery that takes evidence → reasoning → recommendation → human judgment → outcome, and records the whole journey so that every decision can be reconstructed, explained, exported, and audited — today or in ten years.

The one-sentence thesis, stated in the Vision and elaborated here:

> **AI explains the past and prepares decisions; humans make decisions; every decision is a first-class, exportable, screen-reader-usable artifact with its evidence chain.**

## 2. The Decision Workspace

The Decision Workspace is the surface where a financial decision is made. It is the unit of DI, as the screen is the unit of the product (PP-003). A Decision Workspace renders, for one decision, all of the following **simultaneously** (PP-149 — evidence lives on the surface, not in a tab):

1. **The question** — "Should this invoice be approved?" / "Should we move $400K to reserve on Friday?" / "Is this expense in policy?"
2. **The object** — the invoice, expense, vendor, forecast, or proposal being decided.
3. **The recommendation** — what the platform proposes, with its decision category (Approve / Reject / Needs review) and its confidence band (not a fake scalar) (PP-177).
4. **The evidence package** — sources, citations, data points, the reasoning chain, and the "why not this" alternatives (PP-148).
5. **The governing policy** — the rule, matrix entry, or threshold that justifies (PP-030).
6. **The action** — the human decision inputs (approve / reject / override-with-reason / escalate / defer), each with consequence preview (PP-092, PP-150).
7. **The audit timeline** — the append-only record of this decision and the object's history (PP-151).
8. **The status** — pending / needs review / decided, with freshness and staleness labels (PP-013).

The Decision Workspace is the merging of the trust layer (from Stripe: provenance, freshness, sources) and the craft layer (from Linear: the operator loop, keyboard-native triage) and the intelligence layer (from Ramp: decision categories, citations, autonomy). Document 01's three layers meet in the Decision Workspace.

## 3. The Evidence Package

The Evidence Package is the atomic unit of Decision Intelligence — the thing a decision is built on and the thing an auditor examines. It is defined by **eight components**:

1. **Claim.** What is being asserted ("This invoice duplicates INV-2211"). A claim is a statement, not a number.
2. **Sources.** The underlying data — documents, objects, transactions — each with identity, tenant scope, and provenance (PP-004). A source is a real object, never a paraphrase.
3. **Citations.** The specific links from the claim to the sources (Ramp S13.5). Reasoning alone can hallucinate; citations ground it.
4. **Reasoning.** The steps from sources to claim — the chain, rendered step by step. Each step is inspectable.
5. **Confidence.** A calibrated expression of certainty: the decision category (Approve / Reject / Needs review) plus a *band* where meaningful (high/medium/low), never an unverifiable scalar percentage (PP-012, PP-177).
6. **Alternatives.** The "why not this" paths — what was considered and rejected, with the consequence of each (PP-148).
7. **Basis.** The method, version, and date of the model/rule that produced the reasoning (PP-289) — because a changed model is a changed conclusion.
8. **Integrity.** The package is append-only and tamper-evident; its records are part of the audit trail (PP-201).

An Evidence Package with all eight components is **exportable as a single artifact** — the decision record that survives the platform (PP-018, PP-280).

**The Evidence Package rule:** *a recommendation without a full Evidence Package does not render as a recommendation; it renders as nothing.*

## 4. The Recommendation

A recommendation is the platform's proposal for what the human should do. It is bounded by four rules (the EPS AI Behaviour Guide, made concrete):

**DI-R1 — Recommendations are prepared, not decided.** A recommendation is input to a human judgment. The decision authority is always human and always recorded (PP-007). There is no pathway by which a recommendation executes itself.

**DI-R2 — Recommendations are categorical, not scalar.** The recommendation is one of **Approve / Reject / Needs review** (Ramp S13.4). "Needs review" is a designed state with a designed fallback (human escalation) — never an error (PP-147). Where a confidence *band* adds signal, it renders as high/medium/low — never "72%".

**DI-R3 — Recommendations carry their Evidence Package.** Sources, citations, reasoning, alternatives, basis (PP-179). The recommendation is the Evidence Package rendered for a decision.

**DI-R4 — Recommendations live on the object they mutate.** The duplicate alert renders on the invoice; the liquidity recommendation renders on the cash position; the policy question renders on the expense (PP-149). No recommendations graveyard.

## 5. Confidence

Confidence in Decision Intelligence is **calibrated expression, never fabricated precision.** The platform says one of three things:

1. **Known.** Fact with provenance — "This invoice was received on 2026-08-01" — state it as fact, with source (PP-004).
2. **Estimated.** Prediction or model output — "The 7-day cash position is expected to be $2.4M, range $2.1M–$2.7M, based on spend patterns and confirmed commitments" — render as a band with method, basis, and horizon (PP-046, PP-139).
3. **Uncertain.** The model does not know — "Needs review: 30% of line items mismatch" — render as a decision category with the reason and the escalation path (PP-147).

The rule that governs all three: **never present an unverifiable scalar as precision** (PP-012). Ramp's engineering post is the authority: LLM confidence scores are "not numerically relevant and certainly not reproducible" (Ramp S13.4). Perionyx treats a "72% confidence" badge as a hallucination, not a feature.

The confidence band (high/medium/low) is reserved for cases where the platform can *define* the band from measured data — forecast ranges, matching variance — and the band always renders with its basis. The universal status language (Document 02 PP-059) keeps the vocabulary consistent.

## 6. Reasoning and Explainability

**Explainability is a first-class visual, not a footnote** (PP-146). The bar is not "a tooltip exists" but "the user can answer 'why should I trust this?' without leaving the surface" (Philosophy §4).

The reasoning chain renders as **steps, each of which is (a) a claim, (b) a citation to a source, and (c) inspectable on demand.** The chain is the human-readable version of the Evidence Package's reasoning component.

The dual audience of reasoning (Ramp S13.5):

- **The user** uses reasoning as direction — what needs attention, why this recommendation, what would change the answer.
- **The operator/engineer** uses reasoning as observability — where the model misfires, what context was missing, what to improve.

Both audiences see the same reasoning; that is the point. Reasoning is not a black box with a pretty face; it is the actual mechanism, rendered.

**The reasoning rule:** *a recommendation whose reasoning cannot be rendered is a bug, not a recommendation.* If a model cannot produce a step-by-step chain with citations, the platform does not surface its output as a recommendation.

## 7. The Evidence Graph

The Evidence Graph is the connected web of objects, sources, decisions, and policies that DI reasons over. It is what makes provenance a *property*, not a feature:

- **Nodes:** financial objects (invoices, payments, vendors), documents, policies, decisions, transactions, ledger entries, users.
- **Edges:** derived-from, matches, references, decided-by, governs, precedes, duplicates, reconciles-to.
- **Tenant-scoped:** the graph is a tenant partition; the isolation is structural (PP-011, PP-263).
- **Append-only:** the graph's edges are records; history is never rewritten (PP-201).

The Evidence Graph is not a separate product; it is the natural relationships already in the data, made first-class. When a controller asks "where did this total come from?", the answer is a walk of the graph: total → ledger entries → invoices → POs → GRNs → receipts → approvals → evidence. That walk renders as the decision's provenance.

**The graph rule:** *every number on every screen can be traced, in one click, to the transaction, document, rule, and evidence that produced it* (the Vision's central promise, §2).

## 8. Human Approval

The human approval step is where DI ends and authority begins. Its rules:

**DI-A1 — Every decision has a human.** There is no autonomous decision path for money. Even a fully-automated "day-zero" flow renders its decisions as records of human-confirmed policies, and every *action* — approve, reject, release — is a human act with an identity (Ramp S13.3 #1, PP-007).

**DI-A2 — Approval renders the governing policy.** The approval surface shows the matrix entry, threshold, or policy that justifies (PP-030). The human approves *with reference to* the rule, not in a vacuum.

**DI-A3 — Approval tiers by amount and irreversibility.** light → typed → dual-signature (PP-091, PP-162). Thresholds are per-entity (PP-038).

**DI-A4 — Approval is consequence-previewed.** Accepting or overriding previews the resulting state — pro forma approval chain, resulting balances — before commit (PP-092, PP-150).

**DI-A5 — Overrides are data, not noise.** A human override of a recommendation is captured, reasoned, and (per tenant) learned from (PP-190). Every override is part of the decision record.

**DI-A6 — AI is marked, never anonymous.** AI-influenced decisions are visibly marked; the user always knows when the machine is working (PP-185).

**DI-A7 — SoD at the API layer.** Initiator ≠ approver ≠ releaser; the approval check is in the handler (PP-164).

## 9. Auditability

The decision lifecycle is **append-only and tamper-evident** (PP-201). The decision record captures:

- The question, object, recommendation, and decision category.
- The full Evidence Package (sources, citations, reasoning, confidence, alternatives, basis).
- The human decision and its identity.
- The governing policy version at decision time (PP-119 — a changed policy never rewrites past decisions).
- The outcome, later — what the decision led to (payment, credit note, no action), linked back.

The audit consequences:

- **Reconstructable:** any decision can be reconstructed exactly as it was made.
- **Exportable:** the decision record exports as a screen-reader-usable artifact (PP-280, PP-282).
- **The Auditor's surface:** the decision record is the answer to every "why" an auditor asks. Chronological integrity is inherent (PP-151).

**The auditability rule:** *a decision without a full audit record is a decision that did not happen.*

## 10. The Decision Lifecycle

A decision moves through defined states:

1. **Assembled** — evidence collected, evidence package built.
2. **Prepared** — recommendation rendered with reasoning, confidence, alternatives.
3. **Presented** — surfaced on the object's Decision Workspace.
4. **Under review** — pending human judgment (with freshness/staleness labeling).
5. **Decided** — human approved, rejected, or overrode-with-reason.
6. **Acted** — the decision's consequence executed (approved → payment-ready; rejected → exception).
7. **Reconciled** — outcome confirmed against reality (paid, matched, closed).
8. **Auditable** — the complete record is queryable and exportable indefinitely.

Transitions are governed by the state machine; a decision cannot skip states (PP-016). The lifecycle makes a decision a *managed object* — with an owner, a status, a queue, and a history — not a flash of UI.

## 11. The Decision Principles

The DI layer is governed by twelve principles, each traceable to the research program:

**DI-P1 — Decisions are first-class objects.** A decision is a managed, queryable, exportable artifact with a lifecycle (this document, §10). (Stripe S14.4; Perionyx constitutional.)

**DI-P2 — AI explains the past; humans decide the future.** No autonomous money path (PP-007, DI-R1). (Ramp S13.3 #1; EPS AI Behaviour Guide.)

**DI-P3 — Evidence before recommendation.** No recommendation without a full Evidence Package (PP-004, §3). (Ramp S13.5; Stripe P32.)

**DI-P4 — Categories, not confidence scores.** Approve / Reject / Needs review; bands with basis; never fake scalars (PP-012, PP-177, §5). (Ramp S13.4.)

**DI-P5 — Reasoning is rendered, not summarized away.** The chain is the mechanism, inspectable step by step (§6). (Ramp S13.5.)

**DI-P6 — Recommendations live on the object they mutate.** Proximity to the object is proximity to the decision (PP-149). (Stripe S14.4.)

**DI-P7 — Alternatives are mandatory.** "Why not this" is always answered (PP-148). (Stripe S14.4.)

**DI-P8 — Consequences are previewed before commit.** Pro forma state before decision (PP-150). (Stripe S14.4; Ramp P-097.)

**DI-P9 — Approval renders its justification.** The governing policy is on the surface (PP-030). (Ramp P-030; Coupa S6.)

**DI-P10 — Every decision is auditable and exportable.** Full record, append-only, screen-reader-usable (PP-201, PP-280). (Ramp P-101/P-109; Coupa S12.2.)

**DI-P11 — Intelligence is tenant-sovereign.** The graph, the models, and the learning are per-tenant; no cross-tenant learning, ever (PP-189). (Coupa S7.6 rejected; Ramp P-050.)

**DI-P12 — Autonomy is configured, staged, and measured.** Agent authority is a product configuration (autonomy slider), promoted in stages, and validated by evals (PP-180, PP-181, PP-182). (Ramp S13.7–S13.9.)

## 12. DI in the Four Domains

The four-product program sketched how DI applies per domain (Stripe S14.4; Ramp S13; Coupa S7; Linear S13.4). The canonical applications:

**AP — the approval decision.** Recommendation: Approve / Reject / Needs review on an invoice, with the match evidence, tolerance, policy, and duplicate check on the surface. This is the highest-volume decision in the platform and the Work Queue's core (PP-005, PR-49).

**Treasury — the liquidity decision.** "Do we have liquidity for 7 days?" — cash position, forecast bands, commitments, and the move recommendation on one surface (PP-074). The recommendation previews the resulting position (PP-092).

**Reconciliation — the match decision.** Statement line vs. ledger line; the evidence chain renders per unmatched line; resolution is a decision with its record (PR-35, PP-109).

**Policy — the exception decision.** "Is this in policy?" renders as a decision with the governing policy section cited (PP-030, Ramp S13.5). The policy editor is the human feedback loop (PP-186).

Every one of these applications is compositional — built from the Decision Workspace, the Evidence Package, and the state machine — never greenfield (Stripe S14.4's closing note).

## 13. The DI Invariants (Non-Negotiable)

These invariants are the constitutional floor of Decision Intelligence. They appear again in Document 20 as non-negotiables; they are stated here because DI is the most important surface:

1. **Never rely on LLMs as source of truth.** Model outputs are always evidence-bearing inputs, never facts. Facts come from sources with provenance.
2. **Never let AI decide.** Decision authority is human and recorded. Period.
3. **Never fabricate confidence.** Categories and defined bands only; no "72%".
4. **Never hide reasoning.** A recommendation whose chain cannot render is a bug.
5. **Never bypass governance.** Every decision routes through permission, SoD, and audit.
6. **Never ship a recommendation without its evidence.** The Evidence Package is a release gate.
7. **Never compromise tenant isolation.** The graph, models, and learning are per-tenant, provably.
8. **Never skip the consequence preview for irreversible decisions.**
9. **Never rewrite the past.** Decisions and their policy basis are append-only; a changed policy never changes a past decision.
10. **Never make the decision surface optional.** The Decision Workspace is the standard decision surface; a financial decision without its workspace is a design defect.

## 14. The Decision Workspace vs. the Research Program

The four products each contributed a piece of the Decision Workspace, and DI is where they compose:

| Research authority | Contribution to Decision Intelligence |
|---|---|
| **Stripe S14.4** | Evidence-first recommendations, confidence as first-class visual, recommendations on the object, consequence previews, "why not this" alternatives |
| **Ramp S13.3–13.9** | The AI Trust Contract, decision categories, reasoning with citations, autonomy slider, staged promotion, evals as unit tests |
| **Linear S13.4** | The "requires me" operator loop — the review queue as a decision queue, keyboard-native triage |
| **Coupa S7/S11** | Spend intelligence as the executive surface; the rejected community-moat; the governance discipline |
| **Perionyx constitutional** | EvidenceEngine, DecisionEngine, ApprovalIntegration, append-only audit, Decimal precision, tenant isolation |

Decision Intelligence is where the trust layer (Stripe), the craft layer (Linear), the intelligence layer (Ramp), and the lifecycle layer (Coupa) become one product — the product the Vision promises and the competitors cannot copy.

---

*Next: `07 Navigation.md` — the information architecture and navigation specification.*
