# 05 — Procurement Principles

**Product System · Document 05 of 20**
**Authority: Procurement Principles govern the procure-to-pay lifecycle — requisition through reconciliation. They derive from the Vision (00), Philosophy (01), Product Principles (02), Enterprise Principles (03), and Finance Principles (04), and are binding on all AP, sourcing, contracting, and supplier surfaces.**
**Sources: The four-product research program; the Coupa review (the lifecycle authority); the Ramp review (the AP/expense authority); the AP domain architecture (Phase 21A); the EPS; the AP implementation plan (Phase 21); the Procurement workflow documentation.**

---

## 1. Why Procurement Is the Platform's Wedge

Procurement — and specifically Accounts Payable — is the first fully-wired Perionyx workflow, for reasons grounded in evidence:

- **Customer evidence is strongest here.** The formal interviews (Adeel Aslam; CRM-sourced interactions with Ayman Shawky, Muhammed Jamsheed) center on vendor invoice reconciliation and approval workflow delays — the two pain points AP is built to solve.
- **AP touches every other domain.** Vendors, approvals, treasury, GL, budget, audit, cards. A correct AP core creates the skeleton for everything else (Vision §6, Phase A).
- **The lifecycle is the spine.** Coupa proved that owning design-to-pay creates dominance (Coupa S3); Perionyx adopts the lifecycle (Vision §6) while rejecting the data moat and surpassing on trust (Document 18).
- **The AP Manager is the joint-lowest-scoring persona** (Phase 21.0): 5/10, unable to perform any core task. The platform's entire credibility rests on fixing this first.

The procurement principles that follow govern this spine. They are divided into: the lifecycle model, the object model, the intake, matching, approval, exception, payment, reconciliation, supplier, contract, and intelligence layers.

## 2. The Lifecycle Model

**Procurement principle PR-01 — The spine is requisition-to-reconciliation.**
The canonical AP lifecycle: Requisition → Approval → PO → Receipt (GRN) → Invoice → Three-Way Match → Exception → Payment Readiness → Treasury Approval → Payment → Reconciliation → Close → Audit. Every stage is a decision surface with evidence (PP-003, PP-101). No stage is a dead end (PP-120).

**Procurement principle PR-02 — State machines govern transitions.**
Every object's lifecycle is a defined state machine (EPS WORKFLOW_STATE_MACHINE; AP STATE_MACHINES: Invoice 12 states/23 transitions, Payment 7 states, Approval 7 states per level). Illegal transitions are impossible, not warned about (PP-016).

**Procurement principle PR-03 — The invoice is the central aggregate.**
The invoice carries the lifecycle; PO and GRN are reference objects, not aggregates (Phase 21A.0 decision). The invoice detail is the trust workhorse and must carry the full evidence chain (PP-149).

**Procurement principle PR-04 — The lifecycle is visible and labeled.**
Every object renders its stage, its next stage, and its route (PP-132). The operator reads the spine at a glance.

**Procurement principle PR-05 — Policy-before-spend.**
Controls (limits, blocklists, budget checks) exist before the first transaction and are enforced at intake (PP-108). Silent prevention beats post-hoc detection (Ramp P-026).

## 3. The Object Model

**Procurement principle PR-06 — Vendors are the center of gravity.**
The vendor is the shared counterparty object across AP, Treasury, and cards (PP-037, Coupa S5). Vendor trust state is shared; vendor risk and compliance attach to the vendor.

**Procurement principle PR-07 — Vendor identity is verified before money moves.**
Bank details, tax IDs, and identity are verified before any funds move (PP-059). The critical control: **vendor bank changes require dual approval** (PP-090, PR-31).

**Procurement principle PR-08 — PO and GRN are references, not aggregates.**
The PO authorizes; the GRN confirms receipt; the invoice is the money aggregate (Phase 21A.0). Reference integrity is maintained but reference objects do not own the workflow.

**Procurement principle PR-09 — A universal money object model powers all workflows.**
Funds, entities, cost centers, and vendors compose the container model (PP-038, PP-020). Every money object is entity-scoped (PP-204).

**Procurement principle PR-10 — Reference data is immutable or change-requires-approval.**
Vendor master, GL codes, and bank details are immutable or change through approved workflows (PP-090, PP-019).

## 4. Intake and Capture

**Procurement principle PR-11 — Capture at the moment of purchase.**
Receipts and evidence are captured at the point of purchase by default (PP-110). Zero-friction capture is the intake standard (Ramp S9.2).

**Procurement principle PR-12 — Any channel, one pipeline.**
Invoices arrive through email, portal, API, EDI, or upload and meet one pipeline (PP-111). Channel diversity never fragments the workflow.

**Procurement principle PR-13 — Intake is structured at the moment of capture.**
OCR/extraction runs at intake; GL coding defaults are pre-hardcoded (PP-032). Data quality is by construction, not scrubbing (PP-019).

**Procurement principle PR-14 — Duplicate detection runs at intake.**
Duplicate invoice/expense detection runs at intake and surfaces on the object with evidence (PP-098). Duplicate payment is a top control failure; prevention beats detection.

**Procurement principle PR-15 — Intake adapts to request type.**
Requisition and intake forms adapt to the request type (PP-069, Ramp P-069). A shared question library prevents per-department drift (Ramp P-070).

## 5. Matching

**Procurement principle PR-16 — Matching is visible, tolerance-configurable, exception-first.**
Two-way and three-way matching render visibly; tolerances configure; mismatches route to exceptions, never silent passes (PP-112, Coupa S8.3).

**Procurement principle PR-17 — Matching is evidence-bearing.**
A match decision shows the invoice lines, PO lines, GRN lines, the tolerance applied, and the variance (PP-149, PP-032). The matching engine (InvoiceMatchingService) is wired to UI and queue.

**Procurement principle PR-18 — Tolerance rules are versioned, tenant-editable policy.**
Matching tolerances are a policy object, versioned and audited (PP-186, PP-119) — not hardcoded constants. The historical hardcoded tolerance (Phase 21.0 finding) is a defect class, not a pattern.

**Procurement principle PR-19 — Budget check at approval.**
Budget availability is checked at approval, not at payment (PP-108). An over-budget request is flagged at the moment it can be redirected.

**Procurement principle PR-20 — Exceptions are first-class work items.**
Matching failures, duplicates, and policy violations are work items with owners, reasons, and resolution paths (PP-109, PP-067). The exception queue is the primary AP working view (Ramp P-067).

## 6. Approvals

**Procurement principle PR-21 — Approval routing is a pure resolver.**
WHAT to do (ApprovalMatrixEvaluator) is separated from HOW to do it (ApprovalStepExecutor) (PP-105). Rules are testable; execution is transactional.

**Procurement principle PR-22 — Levels, escalation, delegation, and groups are structural.**
Approval chains support levels; escalation, delegation (four-type), and groups are structural nodes (PP-106, Coupa S6.4).

**Procurement principle PR-23 — SKIPPED never equals APPROVED.**
Skipped levels do not count as approvals (PP-107). The cascade logic treats SKIPPED distinctly — the Phase 21A.4 bug that broke multi-level chains is a class-level rule now.

**Procurement principle PR-24 — Threshold tiers by amount and risk.**
Approval thresholds are per-entity, tiered ($1K/$10K/$50K/$250K), and route through the same engine (PP-038, PP-116, Coupa S6.6).

**Procurement principle PR-25 — Every approval carries its justifying policy.**
Approval decisions render the policy that justified them (PP-030). The auditor sees the rule, not just the click.

**Procurement principle PR-26 — Delegation is explicit, temporary, and audited.**
Delegated authority has expiry and full audit (Enterprise §5). No shadow approvers.

**Procurement principle PR-27 — SoD is enforced at the API layer.**
Initiator ≠ approver ≠ releaser; the check is in the route handler (PP-164). Native SoD is a Perionyx differentiator (Coupa's native gap).

## 7. Payments

**Procurement principle PR-28 — Payments flow proposal → named run → review → release.**
The batch model governs all payment execution (PP-113). The batch is audited as a unit; each line stays traceable.

**Procurement principle PR-29 — Every payment command is idempotent and concurrency-safe.**
Idempotency keys and version fields guard every payment command (PP-020, PP-169, PP-170). Double-submit cannot double-move money.

**Procurement principle PR-30 — Debit/credit approval precedes treasury movement.**
GL debit/credit intent is approved before any treasury money movement (PP-114).

**Procurement principle PR-31 — Vendor bank changes require dual approval.**
The fraud surface (PP-090, Finance F-24) is closed by workflow: change requests are routed, approved, and audited.

**Procurement principle PR-32 — Partial and scheduled payments are core.**
Partial and scheduled payments are capabilities, not exceptions (PP-060). Recurring in-policy spend syncs continuously (Ramp P-061).

**Procurement principle PR-33 — Payment is reconciliation-first by design.**
Payment design anticipates reconciliation: references, batch linkage, and expected settlement render on the payment (PP-079).

## 8. Reconciliation and Close

**Procurement principle PR-34 — Reconciliation is a standing state, not an event.**
Continuous close is the default (PP-116). Unreconciled items render with age, owner, and resolution path.

**Procurement principle PR-35 — Statement reconciliation is evidence-bearing.**
Vendor statements reconcile line-by-line with the evidence chain visible (PP-149). The reconciliation result is a first-class object.

**Procurement principle PR-36 — The close is a checklist with scope.**
Close is a designed surface: checklist, scope vs. actuals, audit (PP-116, Linear S19.6 close-cycle view).

**Procurement principle PR-37 — Posting and audit complete the lifecycle.**
GL posting flags, audit records, and the append-only timeline complete the spine (PP-017, PP-151). The auditor walks the object end-to-end.

## 9. Suppliers, Contracts, and Sourcing

**Procurement principle PR-38 — The supplier portal is self-service.**
Suppliers manage their own profile, documents, and bank details through a portal (Coupa S5.2) — with the bank-change dual-approval rule (PR-31) governing the money-critical fields.

**Procurement principle PR-39 — Onboarding is a lifecycle, not a form.**
Supplier onboarding includes identity, compliance, bank verification, and documents — each a validated stage (Coupa S5.3, PP-059).

**Procurement principle PR-40 — Supplier risk is scored and prescriptive.**
Risk monitoring and scoring render with prescriptive recommendations, not raw scores (Coupa S5.4). A score without a recommendation is decoration.

**Procurement principle PR-41 — Contracts attach to the supplier and lifecycle.**
Contracts are first-class lifecycle objects attached to the supplier (Coupa S5.6, S9), with AI assistance that is evidence-bearing (PP-179).

**Procurement principle PR-42 — Contracts-to-treasury integration is explicit.**
Contract obligations inform cash forecasting and payment scheduling (Coupa S15.11). The contract is not an island.

**Procurement principle PR-43 — Preferred suppliers and performance are measurable.**
Supplier performance and preferred status render from measured data (Coupa S5.7), self-referential to the tenant (PP-274).

## 10. Procurement Intelligence

**Procurement principle PR-44 — Spend intelligence is the executive surface.**
Spend visibility renders as decision surfaces: category analysis, savings tracking (baseline → realized → discipline), budget visibility, concentration (Coupa S7).

**Procurement principle PR-45 — Savings tracking is disciplined and evidence-based.**
Savings claims render baseline, realized, and the discipline that produced them (Coupa S7.4). Claims without method are not shown (PP-289).

**Procurement principle PR-46 — Community intelligence is rejected.**
Supplier/spend benchmarking is self-referential or opt-in-cohort; the Coupa community moat is the rejected model (PP-011, PP-274, Vision §7).

**Procurement principle PR-47 — Intelligence feeds the operator.**
Spend insights drill to underlying work items (PP-050, PP-085). The AP Manager acts on the insight, not just reads it.

**Procurement principle PR-48 — Behavioral risk is surfaced as drift.**
Vendor concentration, exception rates, and maverick spend render as trends with early signals (PP-054, PP-089).

## 11. The AP Decision Surface

**Procurement principle PR-49 — The Work Queue is the operator's surface.**
The exception/approval queue is the primary AP working view: decision queue, keyboard-native, evidence-bearing, bulk-capable (PP-005, PP-067, Linear S13.4).

**Procurement principle PR-50 — The invoice detail carries the full evidence chain.**
Match evidence, tolerance, policy, approvals, timeline, exceptions, and next actions all render on the invoice (PP-149, PP-036). The 320-point cognitive-load risk (Phase 27.1R) is managed by Progressive-Depth: core → properties → evidence/timeline (PP-010).

**Procurement principle PR-51 — AP data is accessible and auditable.**
Every AP export carries metadata; every decision is screen-reader-exportable (PP-277, PP-282). The Auditor's requirement holds at every stage.

## 12. Where Perionyx Surpasses the AP Market

The Coupa review's verdict (Coupa S8.9, S11.8) and the Ramp review's verdict (Ramp S10.7) converge on the same point: the market's AP tools own the *stages* but not the *trust*. Perionyx surpasses them on:

- **Native SoD** — enforced at the API layer (PR-27), where Coupa has a documented native gap.
- **Tenant sovereignty** — provable isolation (PR-46), where Coupa pools community data.
- **Evidence-first AI** — citations and decision categories (PP-177, PP-179), where the market ships opaque confidence scores.
- **Constitutional product discipline** — every AP surface cites doctrine (PP-295), so the lifecycle stays coherent as it grows.

The procurement principle in one sentence: **own the complete lifecycle, reject the data moat, and surpass on trust** (the Coupa thesis, applied).

---

*Next: `06 Decision Intelligence.md` — the most important document: how Perionyx turns data and evidence into defensible decisions.*
