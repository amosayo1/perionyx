# 04 — Finance Principles

**Product System · Document 04 of 20**
**Authority: Finance Principles govern every monetary surface, value, calculation, and money movement in Perionyx. They derive from the Vision (00), Philosophy (01), Product Principles (02), and Enterprise Principles (03), and are binding on all financial code, models, and UI.**
**Sources: The four-product research program; the Financial Integrity phases (19.0/19.1); the Platform Constitution's Canonical Financial Model; the AP domain architecture (21A); the EPS; the financial-precision helpers (`src/lib/financial-precision.ts`).**

---

## 1. Why Finance Needs Its Own Principles

Finance is the one domain in Perionyx where a bug is not an inconvenience — it is a liability, an audit finding, or a regulatory event. A rendering bug in a list is cosmetic; a rounding bug in an allocation is fraud-adjacent. Finance therefore has its own principle layer, stricter than the product principles, because:

- **Money must reconcile to the cent** — across systems, periods, currencies, and audits.
- **Money must be attributable** — every cent traces to a source (PP-004).
- **Money must be tamper-evident** — the record of money is as important as the money (PP-201).
- **Money decisions are irreversible or elevated** — the safety model for money is stricter than for any other object (PP-162).
- **Money is the product** — "money is always the hero" (PP-121) is not an aesthetic; it is the whole point.

The finance principles that follow are ordered from the deepest (how money is represented) to the most visible (how money is shown and moved).

## 2. Representation: How Money Is Stored

**Finance principle F-01 — Money is exact; never approximate.**
Money is stored as exact decimals. The canonical precision is Decimal(38,12): 26 integer digits and 12 fractional digits, giving exact representation of any monetary value the platform will encounter (PP-123). Floats never hold money in any committed path. The four Float fields that historically held money in Perionyx (MorningBriefing pending approval amount, cash position, cash change, ApprovalMatrixRule threshold) were migrated to Decimal in Phase 19.1; the migration is the template for the whole platform: *no Float money, ever*.

**Finance principle F-02 — Precision tiers are documented and enforced.**
Monetary fields carry a documented precision tier. The tiers are:
- **Tier 2** — display-rounded values (dashboards, summaries) computed from exact tiers.
- **Tier 4** — the standard operational precision (AP amounts, treasury balances) where the platform shows and reconciles to the cent.
- **Tier 12** — the canonical storage precision (Decimal(38,12)) for all committed money.
Display never rounds the stored truth; stored truth is always the exact value.

**Finance principle F-03 — Money is never stored as a percentage of itself.**
Percentages are derived at render time from amounts, with the basis explicit (PP-137). A stored percentage silently corrupts when its base changes. Allocations, taxes, and fee calculations recompute from amounts every time.

**Finance principle F-04 — All arithmetic routes through one precision engine.**
Every calculation uses the financial-precision helpers: `financialRound` (banker's rounding via Intl), `toDecimal`, `sumDecimals`, `multiplyDecimals`, `divideDecimals`, `allocateAmount` (residual-handling), `calculateTax`, `calculateWithholding`, `decimalEquals`. Ad hoc `Math.round`, `Number(n.toFixed(2))`, and raw float accumulation are defects (PP-122). Phase 19.1 removed all `Math.round(n*100)/100` occurrences; that removal is permanent policy.

**Finance principle F-05 — Banker's rounding everywhere.**
All rounding is `financialRound` (round-half-to-even), so that summing rounded values is stable and tax/VAT arithmetic is deterministic (PP-124). The rounding direction and location in a multi-step calculation are documented.

**Finance principle F-06 — Residuals are assigned explicitly.**
Allocation and apportionment assign the residual explicitly to the last line: `last = total − sum(previous)`, each prior line rounded first (PP-124). No phantom unallocated amounts, no "missing cents". The GL allocation executor implements this (Phase 19.1 P1); it is the pattern for every allocation in the platform.

**Finance principle F-07 — Identity and value are separate types.**
A monetary amount and a string identifier are different kinds of things. IDs render in mono, selectable and copyable (PP-133); amounts render in the human font, tabular, right-aligned (PP-062–063). They never share a type or a cell convention.

## 3. Currency: How Money Is Denominated

**Finance principle F-08 — One currency layer.**
There is exactly one currency service: one canonical `SUPPORTED_CURRENCIES` set, one conversion layer, one formatting module (PP-286). The historical drift — three competing SUPPORTED_CURRENCIES sets (3, 12, 34 currencies), CurrencyService vs FxService duplication, 100+ formatCurrency implementations — was inventoried in Phase 19.0 and consolidated. The consolidation is permanent: *one currency layer, one format function*.

**Finance principle F-09 — Conversion is explicit, sourced, and dated.**
Every currency conversion renders or records its rate, rate date, and source (PP-131). A multi-currency number that hides its conversion basis is a hazard. Conversion results are labeled "at rate X dated Y".

**Finance principle F-10 — Multi-currency is never implicit.**
Every money field knows its currency. A column of amounts in mixed currencies is an explicit, labeled surface with a currency column and totals computed in a declared base currency with the basis labeled (PP-128, PP-080).

**Finance principle F-11 — Estimates and actuals never merge silently.**
Forecasts and estimates render as distinct, labeled series — bands with horizon and basis — never blended into a single confident number (PP-139, PP-046).

## 4. Integrity: How Money Is Trusted

**Finance principle F-12 — The ledger is the authority for settled money.**
The general ledger (via GLIntegration) is the source of truth for posted/settled money. Operational views (AP aging, treasury position, dashboards) reconcile to it; when they diverge, the divergence is a labeled, investigated state — never a silent assumption (PP-138).

**Finance principle F-13 — Money records are append-only and tamper-evident.**
Financial decisions and money records are append-only with integrity checks (PP-201). Corrections are new events (void, credit note, adjustment) with their own audit; the original event is never edited (PP-016).

**Finance principle F-14 — Idempotency for every money command.**
Every money-moving command is idempotent (PP-020, PP-169): a retry or double-submit cannot double-move money. The x-idempotency-key middleware (Phase 21A.3) is the standard.

**Finance principle F-15 — Optimistic concurrency on money aggregates.**
Money aggregates carry version fields; stale writes are rejected (PP-170). Two editors cannot silently overwrite each other's money state.

**Finance principle F-16 — Fail-closed on money uncertainty.**
When money state is uncertain — a sync failed, a confirmation timed out — the platform fails closed and labels the state as pending/unconfirmed; it never assumes success (PP-171). Fail-open on money is a security finding (Phase 17.1).

**Finance principle F-17 — Money is pessimistic; views are optimistic.**
Rendering: views update optimistically; money renders pending until confirmed (PP-168, PP-254). The UI never shows a payment as settled before the server and reconciliation confirm it (PP-008).

**Finance principle F-18 — Reconciliation is a standing discipline.**
Reconciliation is not a month-end event; it is a continuous, visible state (PP-116, continuous close). Unreconciled differences render with age, owner, and a resolution path — the exception queue for money (PP-109).

## 5. Authority: How Money Is Approved and Moved

**Finance principle F-19 — Every external money movement has an approval gate.**
No external money movement occurs without a human approval gate (Ramp S13.3 #1; PP-007, PP-114). The gate is recorded in the audit trail with the policy that justified it (PP-030).

**Finance principle F-20 — Approval tiers by amount and irreversibility.**
Confirmation scales with irreversibility and amount: light → typed → dual-signature (PP-091, PP-162). Thresholds are per-entity (PP-038) and follow the documented tier table (AP Permission Matrix: $1K/$10K/$50K/$250K).

**Finance principle F-21 — Separation of duties is enforced at the API layer.**
Initiator ≠ approver ≠ releaser (PP-164). The enforcement is a check in the route handler, not a convention in the data model. Native SoD is a Perionyx differentiator (Coupa's documented native gap — Document 18).

**Finance principle F-22 — Debit/credit approval precedes treasury movement.**
GL debit/credit intent is approved before any treasury money movement (PP-114). Money does not move on an accounting ambiguity.

**Finance principle F-23 — Batch payments flow proposal → named run → review → release.**
Payment execution follows the batch model: proposal, named run, review, release gates (PP-113). The batch is audited as a unit and each line remains individually traceable.

**Finance principle F-24 — Vendor bank changes require dual approval.**
The critical missing rule from Phase 27.1R: vendor bank-detail changes are an approved, audited workflow with dual approval — the fraud surface that invoice-fraud attacks exploit (PP-090).

**Finance principle F-25 — Target-balance and sweep automation are audited and thresholded.**
Automated treasury moves (sweeps, target-balance) carry audit trails and confirmation thresholds (PP-115). Automation is transparent, never silent.

## 6. Visibility: How Money Is Shown

**Finance principle F-26 — Money is the hero.**
Money renders prominently, tabular, source-labeled (PP-121). The numeral is the subject; the caption is its meaning (PP-126).

**Finance principle F-27 — Money is right-aligned and tabular.**
Money columns align right with tabular figures so vertical comparison works (PP-062–063). Labels are left-aligned.

**Finance principle F-28 — Every number has a source and a timestamp.**
Every KPI, total, and value carries provenance and freshness (PP-014, PP-044, PP-152). A number without a source invites doubt.

**Finance principle F-29 — Totals state their basis.**
Totals/subtotals label coverage (all rows vs. filtered), currency, and computation basis (PP-128, PP-080). "Filtered 23 of 340" is standard.

**Finance principle F-30 — Negative money is explicit.**
Negatives render with sign and/or parentheses consistently; color is never the sole carrier (PP-129, PP-125).

**Finance principle F-31 — FX is annotated.**
Any conversion shows rate, rate date, and source (PP-131). Period comparisons label their basis — same-period, currency-adjusted (PP-135).

**Finance principle F-32 — Status is dot + label + explanation.**
Financial status renders as icon + label + meaning + next action; color supplements, never carries alone (PP-125, PP-141).

**Finance principle F-33 — Every financial object has a lifecycle label.**
Objects render their stage (received → matched → approved → scheduled → released → reconciled → closed) visibly, at a glance (PP-132) — the Treasurer's status-at-a-glance requirement.

**Finance principle F-34 — Consequences are annotated on numbers.**
Microcopy under money explains inclusions/exclusions — "amount includes fees" (PP-127). Assumptions are stated, never assumed.

**Finance principle F-35 — Annotations accompany estimates.**
Estimates render as bands with method, basis, and horizon (PP-046, PP-139); "estimated" is never presented as fact.

## 7. The Money Decision Surface

**Finance principle F-36 — The decision and its evidence are one surface.**
Money decisions happen where the evidence lives (PP-149): the invoice carries its match, tolerance, policy, and history; the approval carries its matrix; the payment carries its batch and reconciliation state. The evidence is not a click away — it is on the surface.

**Finance principle F-37 — Consequences are previewed before commit.**
Accepting a money recommendation or releasing a payment previews the resulting state — pro forma approval chain, resulting balances, downstream effect — before commit (PP-092, PP-150). Informed consent beats post-hoc regret.

**Finance principle F-38 — Money exceptions are first-class work.**
Reconciliation breaks, matching failures, and policy violations are work items with owners and resolutions — the exception queue (PP-109, PP-067). They are never error states, never silent.

**Finance principle F-39 — The audit timeline is on the object.**
Every financial object renders its append-only event timeline (PP-151, PP-017). The Auditor reads the history on the object, not from a report.

## 8. Finance Principles in Conflict

When a finance principle appears to conflict with another principle, the resolution order is:

1. **Money authority principles (F-19…F-25) and integrity principles (F-12…F-18) are absolute.** They are the release gates of the finance layer; nothing relaxes them.
2. **Representation principles (F-01…F-07) outrank convenience.** A faster display that risks precision is rejected.
3. **Visibility principles (F-26…F-35) outrank aesthetics.** A prettier number that is less legible is rejected (PP-140).

A concrete example: the "momentum" doctrine (speed) never relaxes F-14 (idempotency) or F-16 (fail-closed). Speed in finance means *faster evidence assembly and faster rendering*, never *faster commit without confirmation*. The Money-Boundary Doctrine (Philosophy §5) is the reconciliation of the whole finance layer with the rest of the product.

---

*Next: `05 Procurement Principles.md` — the principles governing the procure-to-pay lifecycle.*
