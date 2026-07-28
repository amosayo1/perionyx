---
title: "Business Rule Audit — AP Reference Workflow v2.0"
created: 2026-07-28
phase: "27.1R"
version: "1.0"
authority: Independent Product Review
classification: Internal — Engineering & Product
tags: [product, ap, business-rules, review, audit]
---

# Business Rule Audit — AP Reference Workflow v2.0

## 1. Audit Methodology

Every rule in the 65-rule Business Rule Library was assessed against five criteria:

| Criterion | Question | Standard |
|-----------|----------|----------|
| **Necessity** | Why does this rule exist? What failure mode does it prevent? | Must answer: "Without this rule, what goes wrong?" |
| **Evidence** | What customer data supports this rule? | Evidence source cited, confidence level, or explicit [HYPOTHESIS] tag |
| **Implementation Level** | Should this be configurable (adjustable by AP Manager), hardcoded (type-enforced at schema level), or gated (requires approval to modify)? | Configurable rules need UI, hardcoded rules need schema, gated rules need approval workflow |
| **Overlap** | Does this rule duplicate or conflict with another rule? | Two rules enforcing same constraint from different angles = overlap |
| **Gap** | Does a missing rule exist that should be here? | Industry standard controls or customer pain points not addressed |

Each rule receives a verdict: **PASS** (justified, evidenced, necessary), **CONDITIONAL** (partial evidence, needs validation), or **FAIL** (unnecessary, duplicate, un-evidenced, or industry standard misattributed as hypothesis).

---

## 2. Rules by Necessity

### 2.1 Critical (Prevent Financial Loss or Legal Exposure)

18 Critical rules. 7 genuinely deserve Critical. 11 are Critical by compliance requirement rather than direct financial loss prevention.

| Rule | Actual Risk | Verdict | Notes |
|------|-------------|---------|-------|
| BR-001 Required Fields | Invoice cannot be processed. Payment blocked. | **PASS** | Fundamental. No evidence needed. |
| BR-006 Duplicate Block | Duplicate payment = direct cash loss. | **PASS** | Industry standard. E1 evidence sufficient. |
| BR-013 Three-Way Match Required | Overpayment without PO/GRN validation. | **PASS** | Core AP control. |
| BR-026 SoD Creator Cannot Approve | Fraud: single person creates PO + approves invoice. | **PASS** | SOX requirement. Constitutional. |
| BR-030 Threshold Approval | Unauthorised payment above authority limit. | **PASS** | Standard financial control. |
| BR-043 Treasury Approval Gate | Cash leak without treasury oversight. | **PASS** | Standard treasury control. |
| BR-046 Idempotent Payment | Double payment on retry. | **PASS** | Engineering best practice elevated to business rule. Correct. |
| BR-056 Exception SLA | Unresolved exceptions cause payment delays and cash loss. | **CONDITIONAL** | SLA thresholds (4h/24h/72h/7d) are not customer-validated. Thresholds may be too aggressive for low-severity exceptions. |
| BR-032 SoD Approver ≠ Payment Releaser | Fraud: approver pays themselves. | **PASS** | SOX. Constitutional. |
| BR-033 SoD Vendor Creator ≠ Approver | Fraud: fake vendor + approve invoices. | **PASS** | SOX. Constitutional. |
| BR-037 Evidence Before Approval | Rubber-stamping without evidence review. | **PASS** | Strong principle. 3s minimum evidence view is an implementation detail, not a rule. |
| BR-039 Digital Signature | Non-repudiation of approval decisions. | **PASS** | Audit requirement. |
| BR-044 Duplicate Payment Prevention | $1 AP fraud risk. | **PASS** | 60-day window seems short for monthly invoice cycles. Consider 90-day default. |
| BR-048 Bank Account Verification | BEC fraud. | **PASS** | 48-hour hold, callback verification. Industry standard. |
| BR-052 Payment Void Controls | Irreversible — must be controlled. | **PASS** | 4-step void. Correct. |
| BR-054 Complete Payment Audit | Audit trail must be complete. | **PASS** | Constitutional. |
| BR-058 Resolution Reason Required | Exception resolution without audit trail. | **PASS** | Audit requirement. |
| BR-065 Exception Audit Trail | Exception lifecycle must be auditable. | **PASS** | Audit requirement. |

**Critical verdict**: 15/18 PASS, 3 CONDITIONAL. No FAIL.

### 2.2 High (Prevent Operational Failure)

27 High rules. 12 carry genuine operational risk. 15 are Medium severity misclassified as High.

| Rule | Verdict | Notes |
|------|---------|-------|
| BR-002 Invoice Date Recency | **CONDITIONAL** | 90-day rule is hypothesis. Stale invoices are a real risk but threshold is arbitrary. |
| BR-004 Tax Jurisdiction Compliance | **PASS** | Tax accuracy = financial integrity. |
| BR-006 Active Vendor Check | **CONDITIONAL** | [HYPOTHESIS] — blocking all inactive vendors may be too aggressive. Some orgs pay legacy invoices to inactive vendors. |
| BR-008 Currency Code Validation | **PASS** | ISO 4217. Standard. |
| BR-009 Line Item Completeness | **PASS** | Accuracy prerequisite. |
| BR-010 Total Must Match Line Items | **PASS** | Mathematical invariant. |
| BR-012 PO Reference Format | **PASS** | PO matching prerequisite. |
| BR-013 Price Tolerance | **CONDITIONAL** | 2% / $100 threshold is hypothesis. Needs customer validation. |
| BR-014 Quantity Tolerance | **CONDITIONAL** | 1 unit / 1% is hypothesis. Different industries have very different tolerances (pharma: 0%, construction: 5-10%). |
| BR-016 GRN Recency | **CONDITIONAL** | 30-day window is hypothesis. Service invoices may have longer GRN windows. |
| BR-019 Partial Delivery Match | **CONDITIONAL** | [HYPOTHESIS] — AP Manager approval requirement is sensible but not validated. |
| BR-022 Match Confidence Score | **PASS** | Ayman Shawky evidence directly supports. 80/50 thresholds need validation. |
| BR-027 Supervisor Approval | **CONDITIONAL** | $1K-$10K range is hypothesis. Part of threshold ladder (BR-027 through BR-030 share same evidence gap). |
| BR-028 Manager Approval | **CONDITIONAL** | Same as BR-027. |
| BR-029 Controller Approval | **CONDITIONAL** | Same as BR-027. |
| BR-034 SoD Department Exception | **CONDITIONAL** | [HYPOTHESIS] — sensible audit practice. Some orgs allow department head to resolve own exceptions with reason. |
| BR-035 Approval SLA | **PASS** | T1 evidence supports. Thresholds (4h/8h/24h/48h) are aggressive but reasonable. |
| BR-036 Delegation Chain | **CONDITIONAL** | [HYPOTHESIS] — industry pattern but not validated. Every approver having a delegate is an operational overhead. |
| BR-038 Rejection Reason | **PASS** | Audit requirement. |
| BR-042 Multi-Channel Notification | **PASS** | T1 evidence supports. |
| BR-047 Dual Signature $50K+ | **CONDITIONAL** | Threshold is hypothesis. Dual-signature is standard, $50K boundary varies. |
| BR-049 Batch Total Verification | **PASS** | Mathematical invariant. |
| BR-050 Payment Retry Logic | **PASS** | Standard recovery. |
| BR-051 Real-Time Payment Status | **PASS** | E3 evidence supports. |
| BR-056 Exception SLA Escalation | **PASS** | Core operational requirement. Thresholds need validation. |
| BR-057 Mandatory Exception Category | **PASS** | E4 evidence supports. |
| BR-062 Exception Notifications | **PASS** | T1 evidence supports. |

**High verdict**: 15/27 PASS, 12 CONDITIONAL. No FAIL. But 12 of these are conditional primarily because threshold values are unvalidated, not because the rule itself is wrong.

### 2.3 Medium (Quality/Reliability)

19 Medium rules. Majority are sensible constraints. Some misclassified.

| Rule | Verdict | Notes |
|------|---------|-------|
| BR-007 Invoice Number Format | **PASS** | Data quality. 50-char max is reasonable. |
| BR-017 Service Invoice Two-Way Match | **CONDITIONAL** | [HYPOTHESIS] — standard practice but service certificate requirement is not validated. |
| BR-018 Multi-Currency Match | **CONDITIONAL** | [HYPOTHESIS] — 2% FX review threshold is arbitrary. |
| BR-020 Amended PO Match | **CONDITIONAL** | [HYPOTHESIS] — correct pattern but needs validation. |
| BR-021 Multi-PO Invoice Split | **CONDITIONAL** | [HYPOTHESIS] — common scenario but implementation complexity is high. |
| BR-023 PO Price History | **PASS** | E4 evidence supports. |
| BR-025 Match Timeout | **PASS** | Engineering best practice. |
| BR-026 Self-Approval $1K | **CONDITIONAL** | [HYPOTHESIS] — $1K threshold is arbitrary. Some orgs allow $500, some $5K. |
| BR-040 Bulk Approval Cap | **CONDITIONAL** | [HYPOTHESIS] — 10-invoice cap is arbitrary. Some auditors want 5, some are fine with 50. |
| BR-041 Approval Timeout Void | **CONDITIONAL** | [HYPOTHESIS] — 30-day void is sensible but notification before voiding is critical and under-specified. |
| BR-045 Default Payment Terms | **CONDITIONAL** | [HYPOTHESIS] — Net 30 is common but not universal. Net 15, Net 60, Net 90 are industry-specific. |
| BR-046 Early-Pay Discount | **CONDITIONAL** | [HYPOTHESIS] — H-013 not validated. |
| BR-053 FX Rate Lock | **CONDITIONAL** | [HYPOTHESIS] — 24-hour lock is sensible. May need to be longer for large cross-border payments. |
| BR-055 Payment Cut-Off | **PASS** | Banking operational constraint. 3:00 PM is reasonable default. |
| BR-059 Exception Re-Open Limit | **CONDITIONAL** | [HYPOTHESIS] — 2 re-opens is arbitrary. After 2, escalated to Controller is correct. |
| BR-060 Vendor Exception History | **PASS** | E4 evidence supports. |
| BR-061 Bulk Exception Resolution | **CONDITIONAL** | [HYPOTHESIS] — 20-invoice limit is arbitrary. |
| BR-063 Exception Metrics | **PASS** | E7 evidence supports. |
| BR-064 Vendor Exception Flagging | **CONDITIONAL** | [HYPOTHESIS] — 20% threshold over 90 days is arbitrary. |

**Medium verdict**: 7/19 PASS, 12 CONDITIONAL. High proportion of conditional due to [HYPOTHESIS] rules with reasonable but unvalidated thresholds.

### 2.4 Low (Nice-to-Have)

The rule library lists **0 Low** severity rules. This is a gap. Not every rule is Critical or High. Examples of genuinely Low rules that should exist but are absent:

- Vendor invoice number character set restrictions (alphanumeric standardisation)
- Default GL account by vendor category (convenience, not control)
- Invoice attachment size limits (operational, not financial)
- Payment memo field format standardisation
- Vendor statement discrepancy notification frequency

**Verdict**: Missing Low-severity rules is not a critical gap but indicates the rule library was authored with a compliance-first mindset rather than operational-day-to-day. Rules that are "nice to have" are not documented, which means they won't be built.

---

## 3. Evidence Coverage — Hypothesis Rules

**28 of 65 rules (43%) are marked [HYPOTHESIS].** This is the single most significant finding in this audit. The EPS acknowledges this (Section 8: "28 hypotheses flagged"), but the proportion is too high for a specification labelled "Ready for finance professional review."

### 3.1 Are They Really Hypotheses?

Not all [HYPOTHESIS] tags are equal. Three categories:

#### Category A: Industry Standards Misattributed as Hypotheses (8 rules)

These are well-established industry practices with decades of precedent. Marking them [HYPOTHESIS] is technically correct but misleading — they are not speculative.

| Rule | Industry Standard | Should Be |
|------|-------------------|-----------|
| BR-013 Price Tolerance (2% / $100) | Standard mid-market AP tolerance | Working — industry standard, configurable |
| BR-014 Quantity Tolerance (1 unit / 1%) | Standard AP tolerance | Working — industry standard, configurable |
| BR-016 GRN 30-Day Window | Standard GRN receipt window | Working — industry standard |
| BR-017 Service Two-Way Match | Standard AP practice | Working — industry standard |
| BR-026 $1K Self-Approval | Common threshold | Working — industry standard, configurable |
| BR-045 Net 30 Default Terms | Most common global payment term | Working — industry standard, configurable |
| BR-055 Payment Cut-Off | Banking operational constraint | Not a hypothesis — bank policy |
| BR-046 Early-Pay Discount | Common vendor offering | Working — standard practice |

**Recommendation**: Move 8 rules from [HYPOTHESIS] to Working with note "Industry standard. Configurable defaults."

#### Category B: Thresholds That Are Configurable and Don't Need Validation (12 rules)

These rules are structurally correct — the only question is the default value. Marking the entire rule as [HYPOTHESIS] because the threshold is unvalidated conflates rule structure with parameter values.

| Rule | The Core Rule (Valid) | The Hypothesis (Threshold) |
|------|----------------------|---------------------------|
| BR-013 | Price variance must be checked | 2% / $100 default |
| BR-014 | Quantity variance must be checked | 1 unit / 1% default |
| BR-016 | GRN must exist within reasonable window | 30-day default |
| BR-026 | Low-value invoices may self-approve | $1K default |
| BR-027-030 | Approval thresholds exist by role | Dollar ranges |
| BR-036 | Delegation should exist | Requirement for every approver |
| BR-040 | Bulk approval should have limits | 10-invoice cap |
| BR-045 | Default payment terms needed | Net 30 |
| BR-053 | FX rate should be locked | 24-hour window |
| BR-056 | Exceptions should have SLAs | 4h/24h/72h/7d |
| BR-059 | Exception re-open should be limited | 2 re-opens |
| BR-061 | Bulk exception resolution should have limit | 20 invoices |

**Recommendation**: Separate rule structure (always valid) from default values (configurable). Mark only the default values as [HYPOTHESIS], not the entire rule.

#### Category C: Genuine Hypotheses (8 rules)

These rules actually need customer validation before architecture commitment:

| Rule | Why It's Genuinely Unknown |
|------|---------------------------|
| BR-006 Block inactive vendor invoices | Some orgs deliberately process invoices to suspended vendors during transition. Blocking may be too aggressive. |
| BR-019 Partial delivery requires AP Manager approval | Some orgs delegate this to AP Clerk with justification. |
| BR-034 Department SoD for exceptions | Audit best practice varies. Some orgs allow department head to resolve own exceptions. |
| BR-041 30-day approval timeout void | Some orgs never void — they keep invoices pending indefinitely. |
| BR-047 Dual-signature at $50K | Threshold varies by company size and risk tolerance. |
| BR-064 20% exception rate flags vendor | 20% over 90 days is a reasonable starting point but entirely arbitrary. |
| BR-007 Invoice number format (50 chars) | Reasonable but some ERP systems use 100+ character invoice numbers. |
| BR-025 30-second match timeout | Entirely arbitrary for a rule that belongs in engineering SLAs, not business rules. |

### 3.2 Evidence Confidence Summary

| Verdict | Count | % |
|---------|-------|---|
| Genuinely evidenced (PASS) | 28 | 43% |
| Industry standard (upgrade to Working) | 8 | 12% |
| Structure valid, thresholds configurable (partial) | 12 | 18% |
| Genuine hypothesis (needs validation) | 8 | 12% |
| Un-evidenced structural questions | 9 | 14% |

**Overall**: At most 43% of rules are fully evidenced. The remaining 57% have varying levels of confidence from "industry standard but unvalidated" to "genuinely speculative."

---

## 4. Duplicate Detection

### 4.1 Direct Duplicates

| Rules | Duplicate Description | Recommendation |
|-------|----------------------|----------------|
| BR-005 & BR-011 | Both enforce duplicate detection. BR-005 uses (vendor + amount + date, 30-day window). BR-011 uses (vendor + invoice number, always). BR-005 is fuzzy, BR-011 is exact. | **Not duplicate** — different detection methods. Keep both. But rename BR-011 to "Duplicate Invoice Number" to distinguish. |
| BR-031, BR-032, BR-033, BR-034 | All four enforce Segregation of Duties. BR-031 (PO creator), BR-032 (approver ≠ payment), BR-033 (vendor creator), BR-034 (department). | **Not duplicate** — different SoD axes. Keep all. |
| BR-024, BR-054, BR-065 | All three enforce "complete audit trail" for matching, payment, and exceptions respectively. | **Not duplicate** — different entities. Keep all. |
| BR-042 & BR-062 | Both enforce multi-channel notification for approvals and exceptions. Near-identical implementation. | **Partial overlap** — notification dispatch is the same mechanism. Could merge into a single Notification Rule for all stages. |

### 4.2 Near-Duplicates

| Rules | Overlap | Recommendation |
|-------|---------|----------------|
| BR-001 (required fields) & BR-009 (line item completeness) | BR-001 requires vendor, invoice number, date, total. BR-009 requires line items with description, quantity, price. | BR-001 covers header fields. BR-009 covers line items. Different validation phases. Keep. |
| BR-010 (total = sum line items) & BR-009 (line total = qty × unit price) | Both enforce arithmetic invariants. | Different scope. BR-009 is line-level. BR-010 is invoice-level. Keep. |
| BR-043 (Treasury approval) & BR-048 (bank verification) | Both are payment-level controls. | Different control objectives. BR-043 is authorisation. BR-048 is fraud prevention. Keep. |
| BR-056 (exception SLA) & BR-035 (approval SLA) | Both enforce SLA-based escalation. | Different queues. Keep. |
| BR-058 (resolution reason) & BR-038 (rejection reason) | Both require 10-char minimum reason. | Different actions. Keep. |

### 4.3 Potential Conflicts

| Rules | Conflict | Recommendation |
|-------|----------|----------------|
| BR-026 (self-approve < $1K) vs BR-031 (SoD creator cannot approve) | If AP Clerk created the PO, they cannot self-approve invoice. BR-026 doesn't mention SoD. | Add cross-reference: "BR-026 is subject to BR-031 SoD checks." |
| BR-036 (every approver must have delegate) vs organisational reality | Small companies may have 1 approver. No delegate possible. | Add exception: "If no delegate possible, 2nd-level approver becomes delegate." |
| BR-040 (bulk approval cap 10) vs BR-035 (SLA targets) | Approving 10 at a time vs 4-hour SLA. Approver may need to bulk-approve 30 to meet SLA. | Either increase cap or SLA. |

---

## 5. Missing Rules

### 5.1 Financial Control Gaps

| Missing Rule | Risk | Priority |
|-------------|------|----------|
| **Vendor bank account change requires dual approval** | #1 BEC attack vector. EPS mentions this in AI Never Does (Section 2.3) but no corresponding business rule. | **Critical** |
| **Invoice cancellation requires documented reason** | Void without reason is an audit gap. BR-052 covers payment void but not invoice void before payment. | **High** |
| **Credit memo application requires sequencing rule** | Credit memos must be applied oldest-first or by specific invoice. Undefined. | **High** |
| **Partial payment allocation rules** | Partial payment must specify which line items are paid. Not defined. | **High** |
| **Purchase order value cannot exceed approved budget** | Budget check at PO stage is standard. Currently only mentioned in H-007 (hypothesis). | **Medium** |

### 5.2 Operational Gaps

| Missing Rule | Reason | Priority |
|-------------|--------|----------|
| **Invoice editing after submission** | What fields can AP Clerk edit after invoice is CAPTURED? After APPROVED? Not defined. | **High** |
| **Grace period for correction** | Is there a 24-hour window where AP Clerk can correct OCR errors without audit trail? | **Medium** |
| **Vendor notification of rejection** | When invoice is rejected, vendor must be notified. Not defined. | **High** |
| **Minimum batch size for payment** | Can a single invoice be paid individually? Or must it be in a batch? | **Medium** |
| **Maximum invoice age before write-off** | What happens to invoices in APPROVED state for 6+ months? | **Medium** |
| **User session timeout for approval actions** | Security control for unattended approval sessions. | **Medium** |

### 5.3 Cross-Workflow Gaps

| Missing Rule | Reason | Priority |
|-------------|--------|----------|
| **AP data retention policy** | How long are invoices, audit records, and supporting documents retained? GDPR, SOX, and local regulations differ. | **High** |
| **AP subledger to GL reconciliation frequency** | Daily? Weekly? Monthly? Currently assumed but not specified. | **High** |
| **Inter-company invoice handling** | If one legal entity invoices another within the same group, does the 10-stage workflow apply? | **Medium** |

---

## 6. Configurable vs. Hardcoded

### 6.1 Configurable by AP Manager (Requires UI)

These rules must be adjustable by AP Managers through a configuration interface:

| Rule | Default | Why Configurable |
|------|---------|-----------------|
| BR-013 Price Tolerance | 2% / $100 | Varies by industry, vendor, category |
| BR-014 Quantity Tolerance | 1 unit / 1% | Varies by product type (pharma: 0%, bulk goods: 5%) |
| BR-016 GRN Window | 30 days | Varies by industry and delivery type |
| BR-026-030 Approval Threshold Ladder | $1K/$10K/$50K/$250K | Varies by company size and risk appetite |
| BR-045 Default Payment Terms | Net 30 | Net 15, Net 60, Net 90 are industry-specific |
| BR-047 Dual-Signature Threshold | $50K | Varies by company size |
| BR-055 Payment Cut-Off | 3:00 PM | Varies by bank and jurisdiction |
| BR-056 Exception SLA | 4h/24h/72h/7d | Varies by team capacity |
| BR-064 Vendor Flag Threshold | 20% / 90 days | Varies by acceptable exception rate |
| BR-053 FX Rate Lock Duration | 24 hours | Varies by currency volatility |

### 6.2 Gated (Requires Approval to Modify)

These rules should require Controller or CFO approval to change:

| Rule | Gate Keeper | Reason |
|------|-------------|--------|
| BR-031 SoD Creator Cannot Approve | Controller | Compliance control. Override = compliance exception. |
| BR-032 SoD Approver ≠ Payment Releaser | Controller | Compliance control. |
| BR-033 SoD Vendor Creator ≠ Approver | Controller | Compliance control. |
| BR-037 Evidence Before Approval | Controller | Audit requirement. |
| BR-039 Digital Signature | Controller | Non-repudiation. |
| BR-043 Treasury Approval | CFO | Treasury control. |
| BR-048 Bank Verification | CFO | Fraud prevention. |
| BR-052 Payment Void | CFO + Controller | Irreversible action. |

### 6.3 Hardcoded (Type/Schema Enforced)

These rules must be enforced at the architectural level, not configurable:

| Rule | Enforcement | Reason |
|------|-------------|--------|
| BR-001 Required Fields | Prisma schema required fields | Structural invariant |
| BR-003 Positive Amount | Decimal constraint | Mathematical invariant |
| BR-008 Currency Code | ISO 4217 enum | Standard compliance |
| BR-010 Total Must Match | Computation invariant | Mathematical invariant |
| BR-024 Match Audit Trail | Event sourcing | Audit invariant |
| BR-049 Batch Total | Computation invariant | Mathematical invariant |
| BR-054 Payment Audit Trail | Event sourcing | Audit invariant |
| BR-065 Exception Audit Trail | Event sourcing | Audit invariant |

---

## 7. MVP Rule Set — Phase 21B v1.0

For an MVP, the rule library must be reduced to the minimum viable set. 65 rules cannot be built in a single phase.

### 7.1 P0 — Must Build (20 rules)

These rules are non-negotiable for a functional AP workflow:

| Category | Rules |
|----------|-------|
| Structural | BR-001 (required fields), BR-003 (positive amount), BR-008 (currency), BR-010 (total match) |
| Duplicate Prevention | BR-005 (duplicate detection), BR-011 (vendor invoice number unique), BR-044 (duplicate payment) |
| Matching | BR-013 (3-way match), BR-015 (PO line mapping), BR-024 (match audit trail) |
| Approval | BR-031 (SoD creator), BR-032 (SoD payment), BR-033 (SoD vendor), BR-037 (evidence before approval), BR-039 (digital signature) |
| Payment | BR-043 (treasury approval), BR-048 (bank verification), BR-049 (batch total) |
| Exception | BR-057 (exception categorisation), BR-065 (exception audit trail) |

### 7.2 P1 — Phase 21B+ (15 rules)

| Category | Rules |
|----------|-------|
| Invoice | BR-004 (tax), BR-009 (line items) |
| Match | BR-016 (GRN recency), BR-019 (partial delivery), BR-022 (confidence score) |
| Approval | BR-035 (approval SLA), BR-038 (rejection reason) |
| Payment | BR-050 (retry), BR-051 (real-time status), BR-052 (void), BR-054 (payment audit) |
| Exception | BR-056 (exception SLA), BR-058 (resolution reason), BR-062 (exception notification) |

### 7.3 P2 — Deferred (20 rules)

| Category | Rules |
|----------|-------|
| Nice-to-have validation | BR-002 (90-day recency), BR-006 (active vendor), BR-007 (invoice number format), BR-012 (PO format) |
| Advanced matching | BR-017 (service 2-way), BR-018 (multi-currency match), BR-020 (amended PO), BR-021 (PO split), BR-023 (price history), BR-025 (timeout) |
| Approval polish | BR-026 (self-approve), BR-027-030 (threshold ladder — implement flat approval first), BR-036 (delegation), BR-040 (bulk cap), BR-041 (timeout void), BR-042 (notifications) |
| Payment polish | BR-045 (default terms), BR-046 (discount), BR-053 (FX lock), BR-055 (cut-off) |
| Exception polish | BR-059 (re-open), BR-060 (vendor history), BR-061 (bulk), BR-063 (metrics), BR-064 (vendor flag) |

### 7.4 P3 — Deferred Indefinitely (10 rules)

| Rules | Reason |
|-------|--------|
| BR-017 (service 2-way hypothesis) | Awaiting H-014 validation |
| BR-018 (multi-currency hypothesis) | Awaiting H-001 validation |
| BR-020 (amended PO hypothesis) | Low probability scenario |
| BR-021 (multi-PO split hypothesis) | Low probability scenario |
| BR-025 (match timeout) | Engineering concern, not business rule |
| BR-040 (bulk cap hypothesis) | Low impact |
| BR-041 (timeout void hypothesis) | Edge case |
| BR-046 (discount hypothesis) | Awaiting H-013 validation |
| BR-053 (FX lock hypothesis) | Multi-currency dependency |
| BR-064 (vendor flag hypothesis) | Low impact |

---

## 8. Audit Verdict

### 8.1 Summary

| Verdict | Count | % |
|---------|-------|---|
| **PASS** — Justified, evidenced, necessary | 25 | 38% |
| **CONDITIONAL** — Partially evidenced, correct structure, thresholds need validation | 32 | 49% |
| **FAIL** — Unnecessary, duplicate, un-evidenced, or misclassified | 8 | 12% |

### 8.2 Fail Details

| Rule | Reason for FAIL |
|------|-----------------|
| BR-025 Match Timeout (30s) | Engineering SLA, not a business rule. Belongs in infrastructure specification. |
| BR-055 Payment Cut-Off (3:00 PM) | Banking operational constraint, not a configurable business rule. Default should reflect bank integration settings. |
| BR-040 Bulk Approval Cap (10) | Arbitrary limit. Belongs in UI configuration, not business rule library. |
| BR-061 Bulk Exception Resolution (20) | Same as BR-040. Capacity concern, not a control rule. |
| BR-059 Exception Re-Open Limit (2) | Process control, not a business rule. Re-open count is a state machine guard, not a configurable policy. |
| BR-064 Vendor Flag Threshold (20%) | Operational metric threshold, not a business rule. Belongs in analytics configuration. |
| BR-062 Audit Record Checksum (as Medium rule) | Checksum chain is an architectural invariant, not a Medium-severity business rule. Either Critical or Infrastructure. |
| BR-007 Invoice Number Format | Data quality policy, not a financial control. Complexity of implementation (50 char max, alphanumeric + hyphens/slashes/dots) is disproportionate to value. |

### 8.3 Overall Verdict

**CONDITIONAL PASS — with significant remediation required before implementation.**

Strengths:
- Critical rules are correct and well-evidenced (15/18 PASS)
- SoD, audit, and financial integrity rules are constitutionally grounded
- [HYPOTHESIS] tagging is honest and transparent — a significant positive
- Rule structure across all 65 rules is logically sound

Weaknesses:
- **43% hypothesis rate is too high for a "Ready for review" spec**. At minimum, 8 rules should be upgraded from [HYPOTHESIS] to Working (industry standards).
- **Threshold values are conflated with rule structure**. The rule "price tolerance exists" is valid. The default value "2%" is configurable. The entire rule is marked [HYPOTHESIS] when only the default is unvalidated.
- **8 rules are not business rules** (BR-025, BR-040, BR-041, BR-055, BR-059, BR-061, BR-062, BR-064). They belong in infrastructure, UI configuration, or analytics specifications.
- **6 missing rules** including a Critical gap (vendor bank change requires dual approval).
- **0 Low-severity rules** indicates the library was authored with compliance-first mindset rather than operational coverage.

### 8.4 Action Items

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| P0 | Add rule: vendor bank account change requires dual approval | Product | Before Phase 21B |
| P0 | Add rule: invoice cancellation requires documented reason | Product | Before Phase 21B |
| P0 | Add rule: vendor notification of invoice rejection | Product | Before Phase 21B |
| P1 | Upgrade 8 industry-standard rules from [HYPOTHESIS] to Working | Product | Before Phase 21B |
| P1 | Separate default threshold values from rule structure in all 28 hypothesis rules | Product | Before Phase 21B |
| P1 | Move 8 non-business-rules to appropriate infrastructure specifications | Product | Before Phase 21B |
| P1 | Add partial payment allocation rules | Product | Phase 21B |
| P2 | Add 5 remaining missing operational rules | Product | Phase 21C |
| P2 | Add Low-severity rules for operational coverage | Product | Phase 21C |
| P3 | Validate 8 genuine hypothesis rules with design partners | Product | Phase 21B-21C |
