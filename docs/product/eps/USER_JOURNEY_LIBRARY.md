---
title: "User Journey Library — AP Reference Workflow v2.1"
created: 2026-07-28
phase: "27.1"
version: "2.1"
authority: Product Architecture Board
classification: Internal — Engineering & Product
tags: [product, ap, journeys, ux, workflow]
---

# User Journey Library — AP Reference Workflow v2.1

## 1. Purpose

This document defines the **10 user journeys** that comprise the Accounts Payable Reference Workflow. Each journey maps a complete end-to-end experience for a specific persona, from trigger to outcome, including decision points, edge cases, failure modes, and recovery paths.

Every journey is grounded in customer evidence. Where evidence is insufficient, the assumption is explicitly marked **[HYPOTHESIS]**.

### Design Principles

1. **Zero-loss capture** — every invoice is captured; none are silently dropped
2. **Two-click maximum** — from any screen, two clicks to actionable detail
3. **AI prepares, humans decide** — AI never approves, never pays, never overrides controls
4. **Every transition audited** — append-only trail with checksum verification
5. **Failure is expected** — every journey has defined recovery paths

### Customer Evidence Index

| ID | Source | Date | Type | Confidence |
|----|--------|------|------|------------|
| E1 | Adeel Aslam | 2026-07-21 | Discovery interview | High |
| E3 | Ayman Shawky | TBD | CRM feedback | Medium |
| E4 | Muhammed Jamsheed | TBD | CRM feedback | Medium |
| E7 | Ahmed Orabi | 2026-07-21 | Discovery interview | Medium |
| T1 | Manual Approval Workflows Delay Payments | 2026-07-21 | Theme (4 sources) | High |
| T2 | Vendor Invoice Reconciliation Is Manual | 2026-07-21 | Theme (4 sources) | High |
| T5 | Month-End Close Is Universally Painful | 2026-07-21 | Theme (3 sources) | High |

---

## 2. Journey Overview

| # | Journey | Persona | Goal | Trigger | Stages |
|---|---------|---------|------|---------|--------|
| J1 | Invoice Receipt | AP Clerk | Receive and capture with zero loss | Invoice arrives | 1 |
| J2 | Invoice Review | AP Clerk | Validate completeness and policy | After capture | 1-2 |
| J3 | Three-Way Match | AP Clerk | Match invoice to PO and GRN | After validation | 2 |
| J4 | Exception Resolution | AP Manager | Resolve all discrepancies | Exception raised | 3 |
| J5 | Supporting Documents | AP Clerk | Gather all required documents | Missing docs detected | 2 |
| J6 | Approval Path | Approver | Review and decide on payment | Invoice matched | 5 |
| J7 | Payment Readiness | AP Manager | Prepare optimal payment proposal | Invoices approved | 6 |
| J8 | Payment Release | Treasury Manager | Execute payment with confidence | Proposal approved | 7 |
| J9 | Audit Review | Auditor | Verify complete audit trail | Audit triggered | 7 |
| J10 | Month-End Close | Controller | Close AP subledger accurately | Period end | 7 |

---

## 3. Journey 1: Invoice Receipt

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J1 |
| **Persona** | AP Clerk |
| **Goal** | Receive and capture a vendor invoice with zero loss |
| **Trigger** | Invoice arrives via email, vendor portal, mail, or EDI |
| **Scope** | From invoice arrival to validated queue entry |
| **Target Duration** | < 4 hours from arrival to validated queue |
| **Success Metric** | 100% of invoices captured; 0% silently dropped |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E1 (Adeel Aslam) | "vendor invoice reconciliations... require manual oversight to ensure accuracy" | High |
| T2 | "Vendor Invoice Reconciliation Is Manual and Error-Prone" (4 sources) | High |

### Journey Map

```
TRIGGER: Invoice arrives at designated channel
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Channel Detection              │
│   Email → parse attachment             │
│   Portal → accept upload               │
│   Mail → scan + OCR                    │
│   EDI → parse structured data          │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Data Extraction (AI/OCR)       │
│   Vendor name, invoice number, date    │
│   Line items, amounts, tax             │
│   PO reference (if present)            │
│   Confidence score assigned            │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Confidence >= 95%?    │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Auto-queue for   │  │ Route to manual   │
│ AP review        │  │ review queue      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: AP Clerk Reviews          │
│   Compare extracted vs. original        │
│   Correct any errors                    │
│   Confirm or override confidence        │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ All fields confirmed? │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ STEP 4: Confirm  │  │ Correct metadata  │
│ metadata         │  │ → re-validate     │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Invoice enters validated queue  │
│   Status: CAPTURED → VALIDATED          │
│   Audit record created                  │
└─────────────────────────────────────────┘
```

### Decision Tree

| # | Decision | Criteria | Outcome |
|---|----------|----------|---------|
| D1 | Is this a duplicate? | Same vendor + same amount + same date within 30 days (BR-005) | If duplicate → flag, do not create; notify AP Clerk |
| D2 | Is the vendor known? | Vendor exists in master data with ACTIVE status | If unknown → route to new vendor registration flow |
| D3 | Is there a PO reference? | PO number extracted and matches existing PO | If yes → queue for three-way match (J3); if no → queue for two-way match or manual coding |
| D4 | Is the amount within policy? | Amount < threshold for AP Clerk authority | If over → queue for escalation |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Invoice arrives on weekend/holiday | Capture immediately; queue for next business day processing |
| E2 | Multiple invoices in single email | Parse all attachments; create separate invoice records |
| E3 | Invoice in foreign currency | Capture with currency code; queue for FX rate lookup |
| E4 | Duplicate invoice from different channel | Cross-reference all channels for duplicate detection |
| E5 | OCR fails entirely | Route to manual entry; log OCR failure for system improvement |
| E6 | Invoice references cancelled PO | Flag for AP Clerk; queue for exception (J4) |
| E7 | Vendor sends credit note (negative amount) | Capture as credit note entity; queue for credit processing |

### Accessibility Notes

- Screen reader: announce "Invoice [number] received from [vendor] for [amount]"
- Keyboard: Tab through all form fields; Enter to confirm; Escape to cancel
- Focus management: auto-focus first field requiring correction
- Color: never use color alone to indicate status; always pair with icon or text
- Contrast: all text meets WCAG 2.1 AA (4.5:1 minimum)

### Mobile Considerations

- Push notification: "New invoice from [vendor] for [amount] — tap to review"
- Swipe actions: swipe right to approve, left to reject (if within authority)
- Offline: capture invoice data locally; sync when connected
- Camera: scan paper invoices directly from mobile camera

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Confirm and submit invoice |
| `Cmd+R` | Re-scan / re-extract OCR |
| `Cmd+D` | Check for duplicates |
| `Cmd+V` | View original document |
| `Escape` | Cancel and return to queue |
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |

### Audit Trail

```
invoice.received    → timestamp, channel, vendor, amount
invoice.captured    → OCR confidence, extraction method
invoice.reviewed    → AP Clerk userId, corrections made
invoice.validated   → validation results, queue assignment
```

### Recovery Paths

| Failure | Recovery |
|---------|----------|
| OCR fails | Manual entry with original document side-by-side |
| Duplicate detected | Void duplicate; keep original; notify AP Clerk |
| Unknown vendor | Register new vendor (with approval); link to invoice |
| Lost invoice (never captured) | [HYPOTHESIS] — Vendor portal submission + email archival |

---

## 4. Journey 2: Invoice Review

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J2 |
| **Persona** | AP Clerk |
| **Goal** | Validate invoice completeness and policy compliance |
| **Trigger** | Invoice enters validated queue after capture |
| **Scope** | From queue entry to match-ready status |
| **Target Duration** | < 30 minutes per invoice |
| **Success Metric** | 100% of invoices reviewed; policy violations caught before match |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E4 (Muhammed Jamsheed) | "Inventory reconciliation still depends heavily on spreadsheets" | Medium |
| E1 (Adeel Aslam) | "these operational tasks often require manual oversight to ensure accuracy" | High |
| T2 | Theme: Vendor Invoice Reconciliation Is Manual (4 sources) | High |

### Journey Map

```
TRIGGER: Invoice in validated queue
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Open invoice for review         │
│   Display extracted data + original     │
│   Show AI-generated review summary      │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Verify extracted data           │
│   Line items match original?            │
│   Amounts correct?                      │
│   Dates valid?                          │
│   Tax calculations correct?             │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ All items verified?   │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Continue to      │  │ Correct errors →  │
│ policy check     │  │ re-verify         │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Check policy compliance         │
│   Spending limits?                      │
│   Approved vendor?                      │
│   Valid PO reference?                   │
│   Within contract terms?                │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Policy violations?    │
         └───────────┬───────────┘
              NO     │    YES
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ STEP 4: Flag     │  │ Flag violations → │
│ anomalies        │  │ route to J4       │
│ (if any)         │  │ (Exception)       │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ STEP 5: Mark review complete            │
│   Status: VALIDATED                     │
│   Audit record with reviewer + time     │
└─────────────────────────────────────────┘
```

### Decision Tree

| # | Decision | Criteria | Outcome |
|---|----------|----------|---------|
| D1 | Tax calculation correct? | Tax rate matches jurisdiction; amount matches line items | If incorrect → correct and re-calculate |
| D2 | Within spending policy? | Amount within category limits for vendor/department | If over → route to exception queue (J4) |
| D3 | Vendor is approved? | Vendor status = ACTIVE; no compliance flags | If not approved → route to vendor review |
| D4 | Contract terms valid? | Invoice within contract price and volume | If over-contract → flag for procurement review |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Invoice has 50+ line items | Paginated display; batch verification by category |
| E2 | Multi-currency invoice | Show converted amount at exchange rate; flag if rate is stale |
| E3 | Partial invoice (partial delivery) | Accept partial; link to PO line items received |
| E4 | Recurring invoice (subscription) | Match against recurring template; flag deviations |
| E5 | Invoice with credit line items | Net calculation; flag if net is negative (credit exceeds debit) |

### Accessibility Notes

- Side-by-side view: original document and extracted data at same zoom level
- Screen reader: announce each field with label, extracted value, and verification status
- Keyboard: `V` to mark field as verified; `C` to correct; `Tab` to next field
- High-contrast mode: all status indicators work in high-contrast

### Mobile Considerations

- Horizontal swipe between original document and extracted data
- Pinch-to-zoom on original document for detail verification
- Compact mode: show only fields with low confidence scores

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Mark current field as verified |
| `C` | Correct current field value |
| `A` | Approve all fields |
| `Cmd+T` | Open tax calculator |
| `Cmd+P` | View contract/pricing terms |
| `Cmd+O` | View original document |

### Audit Trail

```
invoice.review.start   → reviewer ID, timestamp
invoice.review.field   → field name, original value, corrected value (if any)
invoice.review.complete → result (pass/fail), policy violations found
```

---

## 5. Journey 3: Three-Way Match

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J3 |
| **Persona** | AP Clerk |
| **Goal** | Match invoice to PO and GRN automatically |
| **Trigger** | Invoice validated with PO reference |
| **Scope** | From match attempt to matched or exception |
| **Target Duration** | < 5 minutes (automated); < 15 minutes if manual review |
| **Success Metric** | > 85% auto-match rate; < 5% false exception rate |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| T2 | "Vendor Invoice Reconciliation Is Manual and Error-Prone" (4 sources) | High |
| E1 (Adeel Aslam) | "vendor invoice reconciliations... require manual oversight" | High |
| E3 (Ayman Shawky) | "Siloed systems create reconciliation overhead" | Medium |

### Journey Map

```
TRIGGER: Invoice validated with PO reference
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: System attempts auto-match      │
│   Price match within tolerance          │
│   Quantity match within tolerance       │
│   PO line items aligned                 │
│   GRN exists within 30 days             │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ All criteria met?     │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Auto-approve     │  │ Route to         │
│ match            │  │ exception (J4)   │
│ Status: MATCHED  │  │ Status:EXCEPTION │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ STEP 2: Generate match report           │
│   Price variance %                      │
│   Quantity variance                     │
│   Confidence score                      │
│   Exceptions (if any)                   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Invoice ready for approval (J6) │
│   Evidence package: PO + GRN + match    │
│   Audit record with match details       │
└─────────────────────────────────────────┘
```

### Decision Tree

| # | Decision | Criteria | Outcome |
|---|----------|----------|---------|
| D1 | Price within tolerance? | Variance ≤ ±2% or ±$100 (whichever is lower) — BR-013 [HYPOTHESIS] | If within → auto-match; if outside → exception |
| D2 | Quantity within tolerance? | Variance ≤ ±1 unit or ±1% — BR-014 [HYPOTHESIS] | If within → auto-match; if outside → exception |
| D3 | GRN exists? | GRN record within 30 days of invoice date — BR-016 | If missing → exception (GRN pending) |
| D4 | PO line items match? | Every invoice line maps to a PO line | If unmatched lines → exception |
| D5 | Multi-currency PO? | PO currency matches invoice currency | If mismatch → exception (FX review needed) |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Partial GRN (partial delivery received) | Match received quantity only; flag remainder |
| E2 | PO was amended after invoice date | Match against original PO terms; flag amendment |
| E3 | Invoice covers multiple POs | Split match across POs; each split audited |
| E4 | Debit note against original invoice | Match as credit against original; net to zero |
| E5 | Service invoice (no GRN) | Two-way match only (invoice ↔ PO); skip GRN check |
| E6 | PO price was updated post-invoice | Match against PO price at time of invoice; flag variance |

### Accessibility Notes

- Match result announced: "Match [passed/failed] — price variance [X]%, quantity variance [Y]"
- Visual: green (matched), amber (within tolerance), red (exception)
- Drill-down: click any variance to see original PO, GRN, and invoice side by side

### Mobile Considerations

- Push notification: "Invoice [number] [matched/exception] — tap to review"
- Quick action: swipe to approve match or escalate exception
- Match details expandable on tap

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `M` | Run match manually |
| `A` | Approve match (if within tolerance) |
| `E` | Escalate to exception queue |
| `Cmd+G` | View GRN details |
| `Cmd+P` | View PO details |

### Audit Trail

```
match.attempt     → invoice ID, PO ID, GRN ID, timestamp
match.result      → price variance, quantity variance, confidence, outcome
match.auto_approve → if auto-matched: tolerance applied, approval timestamp
match.exception   → if exception: exception type, category, escalation path
```

---

## 6. Journey 4: Exception Resolution

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J4 |
| **Persona** | AP Manager |
| **Goal** | Resolve all discrepancies and clear exception queue |
| **Trigger** | Match failure or policy violation flagged |
| **Scope** | From exception creation to resolution |
| **Target Duration** | < 4 hours for critical; < 24 hours for high; < 72 hours for low |
| **Success Metric** | > 90% resolved within SLA; zero unresolved > 7 days |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E4 (Muhammed Jamsheed) | "Intelligent discrepancy alerts would reduce manual work" | Medium |
| E1 (Adeel Aslam) | "manual oversight to ensure accuracy" — implies exception handling is manual | High |
| E7 (Ahmed Orabi) | Exception count (51) shown as KPI but no action possible — gap identified | High |

### Journey Map

```
TRIGGER: Exception raised (match failure / policy violation / anomaly)
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Open exception queue            │
│   Categorised by type                   │
│   Sorted by SLA urgency                │
│   AI summary of root cause              │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Review exception details        │
│   Original invoice                      │
│   PO / GRN (if applicable)              │
│   Variance details                      │
│   AI-suggested resolution               │
│   Vendor history                        │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Need more info?       │
         └───────────┬───────────┘
              NO     │    YES
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Proceed to       │  │ Contact vendor/  │
│ resolution       │  │ warehouse/       │
│ decision         │  │ procurement      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Investigate root cause          │
│   Price variance: check contract/amend  │
│   Quantity variance: check GRN/delivery │
│   Duplicate: check invoice history      │
│   Missing PO: check procurement process │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Root cause identified?│
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Approve/reject   │  │ Escalate to      │
│ resolution       │  │ higher authority │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 4: Apply resolution                │
│   Override match (with reason)           │
│   Reject invoice (with reason)           │
│   Request correction from vendor         │
│   Void duplicate                        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Exception resolved              │
│   Status: MATCHED or VOIDED             │
│   Audit record with resolution details  │
│   SLA metrics updated                   │
└─────────────────────────────────────────┘
```

### Decision Tree

| # | Decision | Criteria | Outcome |
|---|----------|----------|---------|
| D1 | Price variance acceptable? | Within override authority of current user | If yes → approve with note; if no → escalate |
| D2 | Quantity variance explained? | GRN confirms delivery; warehouse confirms receipt | If explained → approve; if not → reject or escalate |
| D3 | Duplicate confirmed? | Same vendor + same amount + same date within 30 days | If duplicate → void; if not → release |
| D4 | Missing PO justified? | Emergency purchase; policy allows non-PO | If justified → approve with exception code; if not → reject |
| D5 | SLA breached? | Time in queue exceeds SLA threshold | If breached → auto-escalate to next authority level |

### Exception Categories

| Category | Description | Typical Resolution |
|----------|-------------|-------------------|
| PRICE_VARIANCE | Invoice price differs from PO | Confirm with procurement; approve override or reject |
| QUANTITY_VARIANCE | Invoice quantity differs from GRN | Confirm with warehouse; approve partial or reject |
| DUPLICATE | Suspected duplicate invoice | Verify; void if confirmed; release if not |
| MISSING_PO | No PO reference | Emergency purchase verification; approve or reject |
| MISSING_GRN | No GRN within 30 days | Confirm delivery; request GRN from warehouse |
| POLICY_VIOLATION | Spending policy exceeded | Route to policy owner for exception approval |
| TAX_MISMATCH | Tax calculation incorrect | Correct and re-validate |
| CURRENCY_MISMATCH | Invoice currency differs from PO | FX review; approve rate or reject |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Exception older than 7 days | Auto-escalate to Controller; flag as overdue |
| E2 | Vendor disputes exception resolution | Re-open exception; route to dispute resolution |
| E3 | Exception requires procurement input | Hold exception; notify procurement; SLA pauses |
| E4 | Multiple exceptions on same invoice | Resolve each independently; invoice blocked until all resolved |
| E5 | Approver on leave | Delegate chain activates; delegate sees exception |

### Accessibility Notes

- Exception queue: sortable table with keyboard navigation
- Screen reader: "Exception [type] on invoice [number] from [vendor] — [SLA status]"
- Color coding: red (critical/overdue), amber (high), blue (medium), gray (low)
- All actions available via keyboard

### Mobile Considerations

- Push notification: "Exception on invoice [number] — [type] — tap to resolve"
- Quick resolve: pre-built resolution buttons for common exceptions
- Escalation: one-tap escalation with pre-populated reason

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `R` | Resolve exception |
| `E` | Escalate exception |
| `V` | View invoice details |
| `H` | View vendor history |
| `A` | Approve resolution |
| `Cmd+Shift+E` | Export exception report |

### Audit Trail

```
exception.created    → invoice ID, type, category, SLA deadline
exception.investigated → root cause, investigation notes, timestamp
exception.resolved   → resolution type, override reason, approver ID
exception.escalated  → from authority, to authority, reason
exception.sla_breach → time in queue, escalation path taken
```

---

## 7. Journey 5: Supporting Document Collection

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J5 |
| **Persona** | AP Clerk |
| **Goal** | Gather all required supporting documents for invoice |
| **Trigger** | Missing documents detected during validation or review |
| **Scope** | From detection to complete documentation package |
| **Target Duration** | < 48 hours |
| **Success Metric** | 100% of invoices have complete documentation before payment |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| [HYPOTHESIS] | Inferred from workflow requirements — no direct customer evidence | Low |

> **Note**: This journey is based on [HYPOTHESIS] — inferred from the requirement that every invoice must have supporting documentation for audit compliance. Customer validation is needed. See HYPOTHESIS_REGISTER.md H7.

### Journey Map

```
TRIGGER: Missing documents detected
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Identify missing documents      │
│   PO (if PO-referenced invoice)         │
│   GRN (goods receipt note)              │
│   Delivery note                         │
│   Contract (if under contract)          │
│   Approval email (if applicable)        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Request from source             │
│   Warehouse → GRN                       │
│   Procurement → PO / Contract           │
│   Vendor → invoice copy / correction    │
│   Approver → approval evidence          │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Documents received?   │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ STEP 3: Attach   │  │ Re-request or    │
│ to invoice       │  │ escalate after   │
│ record           │  │ 48 hours         │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 4: Verify completeness            │
│   All required docs attached?           │
│   Documents readable?                   │
│   Documents match invoice?              │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Mark documentation complete     │
│   Audit record: documents attached      │
│   Invoice ready for next stage          │
└─────────────────────────────────────────┘
```

### Required Documents by Invoice Type

| Invoice Type | Required Documents |
|-------------|-------------------|
| PO-referenced | PO, GRN, delivery note |
| Non-PO | Justification memo, budget owner confirmation |
| Service | Service completion certificate, SOW |
| Subscription | Subscription agreement, usage report |
| Expense | Expense receipt, policy compliance form |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Vendor unresponsive after 48 hours | Escalate to procurement; flag invoice |
| E2 | GRN pending (goods in transit) | Hold invoice; set expected GRN date; auto-check |
| E3 | Document is illegible | Request re-submission from source |
| E4 | Document conflicts with invoice | Flag for investigation; route to exception (J4) |
| E5 | Retroactive PO (PO created after invoice) | Accept with Controller approval; audit trail notes timing |

### Accessibility Notes

- Document checklist: screen reader friendly with completion status
- Upload: drag-and-drop with keyboard alternative (file picker)
- Preview: accessible document viewer with zoom and pan

### Mobile Considerations

- Camera: capture physical documents directly
- Push notification: "Invoice [number] — [document] still missing — tap to request"
- Quick request: one-tap send to warehouse/procurement/vendor

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `U` | Upload document |
| `R` | Re-request from source |
| `E` | Escalate missing document |
| `V` | View attached documents |
| `Cmd+Shift+C` | Check completeness |

### Audit Trail

```
doc.required    → invoice ID, document type, source
doc.requested   → from party, timestamp
doc.received    → document type, file reference, timestamp
doc.verified    → completeness check result, verifier ID
```

---

## 8. Journey 6: Approval Path

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J6 |
| **Persona** | Approver (Department Head) |
| **Goal** | Review and decide on invoice payment |
| **Trigger** | Invoice matched and documentation complete |
| **Scope** | From notification to approval/rejection |
| **Target Duration** | < 2 hours average |
| **Success Metric** | > 90% approvals within 4 hours; 0 approvals without evidence |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| T1 | "Manual Approval Workflows Delay Payments" (4 sources) | High |
| E1 (Adeel Aslam) | "approval workflows... manual oversight" | High |
| E1 (Mohamed Gamal) | "approval bottlenecks" [CRM] | Medium |
| E7 (Ahmed Orabi) | Approval matrix exists but not wired — gap identified | High |

### Journey Map

```
TRIGGER: Invoice matched + docs complete + approval required
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: System routes to approver       │
│   Match approval matrix (role/threshold)│
│   Check delegate if primary unavailable │
│   Notify via push + email               │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Approver receives notification  │
│   "Invoice [number] from [vendor]       │
│    for [amount] requires your approval" │
│   Tap/click to open evidence package    │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Review evidence package         │
│   Invoice (original + extracted data)   │
│   PO (if applicable)                    │
│   GRN (if applicable)                   │
│   Match report + confidence score       │
│   Exception notes (if any)              │
│   AI recommendation + reasoning         │
│   Vendor history                        │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Approver decision?    │
         └───────────┬───────────┘
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│APPROVE │    │ REJECT   │    │ESCALATE  │
│        │    │          │    │          │
└───┬────┘    └────┬─────┘    └────┬─────┘
    │              │               │
    ▼              ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│Status: │    │Status:   │    │Route to  │
│APPROVED│    │EXCEPTION │    │higher    │
│        │    │(return)  │    │authority │
└───┬────┘    └────┬─────┘    └────┬─────┘
    │              │               │
    ▼              ▼               ▼
┌─────────────────────────────────────────┐
│ STEP 4: Audit record created            │
│   Approver ID, decision, timestamp      │
│   Digital signature captured            │
│   Evidence package snapshot             │
└─────────────────────────────────────────┘
```

### Approval Matrix

| Threshold | Approver | Delegate | SLA |
|-----------|----------|----------|-----|
| < $1,000 | AP Clerk (self-approve) — [HYPOTHESIS] | N/A | Immediate |
| $1,000 – $10,000 | AP Manager | AP Manager | 4 hours |
| $10,000 – $50,000 | AP Manager | Controller | 8 hours |
| $50,000 – $250,000 | Controller | CFO | 24 hours |
| > $250,000 | CFO | Board delegate | 48 hours |

### Decision Tree

| # | Decision | Criteria | Outcome |
|---|----------|----------|---------|
| D1 | Within threshold? | Invoice amount ≤ approver authority | If yes → approve/reject; if no → escalate |
| D2 | SoD violated? | PO creator = invoice approver? | If violated → reject; require different approver |
| D3 | Approver on leave? | Delegation chain active | If delegated → notify delegate; SLA continues |
| D4 | SLA breached? | Time exceeds threshold | If breached → auto-escalate |

### Segregation of Duties Rules

| Rule | Description | Source |
|------|-------------|--------|
| SoD-01 | PO creator ≠ invoice approver | BR-031 |
| SoD-02 | Invoice approver ≠ payment releaser | BR-032 |
| SoD-03 | Vendor creator ≠ invoice approver | BR-033 |
| SoD-04 | Approver cannot approve own department exception | BR-034 |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Approver rejects without reviewing evidence | System requires evidence view before reject action |
| E2 | Invoice needs multiple approval levels | Sequential: Level 1 → Level 2; parallel not supported |
| E3 | Approver unavailable > SLA | Auto-escalate to delegate; if no delegate → manager |
| E4 | Same invoice submitted twice | Deduplicate; second submission voided |
| E5 | Approval after payment deadline | Flag for late-payment penalty assessment |

### Accessibility Notes

- Evidence package: keyboard navigable with section headings
- Screen reader: "Invoice [number] from [vendor] for [amount] — [match status] — Approve?"
- Large touch targets for approve/reject buttons (44px minimum)
- VoiceOver/TalkBack: full evidence package accessible via swipe

### Mobile Considerations

- Push notification with rich preview (vendor, amount, match status)
- One-tap approve with confirmation dialog
- Evidence package fully scrollable on mobile
- Offline: approve offline; sync when connected

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `A` | Approve invoice |
| `R` | Reject invoice |
| `E` | Escalate to higher authority |
| `D` | Delegate to pre-registered delegate |
| `Cmd+I` | View invoice details |
| `Cmd+P` | View PO details |
| `Cmd+G` | View GRN details |

### Audit Trail

```
approval.route     → invoice ID, approver ID, threshold, timestamp
approval.notify    → notification channel, delivery status
approval.review    → approver viewed evidence package
approval.decide    → decision (approve/reject/escalate), reason (if reject)
approval.delegate  → delegate ID, reason, approval timestamp
approval.sla_breach → time exceeded, escalation path
```

---

## 9. Journey 7: Payment Readiness

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J7 |
| **Persona** | AP Manager |
| **Goal** | Prepare optimal payment proposal |
| **Trigger** | Invoices approved and ready for payment |
| **Scope** | From approved queue to payment proposal |
| **Target Duration** | < 30 minutes for daily payment run |
| **Success Metric** | 100% of approved invoices included; > 80% early-pay discounts captured |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E3 (Ayman Shawky) | "Need for instant view of cash positions" | Medium |
| E1 (Adeel Aslam) | "cash flow planning fairly well" — implies need for payment optimisation | Medium |
| H4 | "Batch Payment Processing Is Preferred" — [HYPOTHESIS] | Low |

### Journey Map

```
TRIGGER: Daily payment run scheduled (or manual trigger)
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Select invoices for payment     │
│   All approved invoices                 │
│   Filter by: due date, vendor, amount   │
│   Prioritise: early-pay discounts       │
│   Exclude: disputed, blocked            │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Group by payment method         │
│   Bank transfer (primary)               │
│   Check (if vendor preference)          │
│   Wire (international)                  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Check payment terms             │
│   Due date vs. today                    │
│   Early-pay discount available?         │
│   Payment terms per vendor              │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 4: Calculate cash impact           │
│   Total payment amount                  │
│   Current cash position                 │
│   Forecast: inflows vs outflows         │
│   Buffer assessment                     │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Cash sufficient?      │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Generate         │  │ Optimise batch:  │
│ payment proposal │  │ prioritise by    │
│                  │  │ due date/vendor  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Generate proposal               │
│   Invoice list with amounts             │
│   Total batch amount                    │
│   Early-pay discount savings            │
│   Cash position after payment           │
│   Recommend: proceed / defer / partial  │
└─────────────────────────────────────────┘
```

### Payment Proposal Contents

| Field | Description |
|-------|-------------|
| Proposal ID | Unique identifier |
| Generated by | AP Manager userId |
| Invoice count | Number of invoices in batch |
| Total amount | Sum of all invoice amounts |
| Discount captured | Early-pay discount savings |
| Payment method | Bank transfer / check / wire |
| Cash position before | Current cash balance |
| Cash position after | Projected balance post-payment |
| Approval required | Treasury Manager approval needed |
| Vendor breakdown | Per-vendor totals with payment details |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Cash position insufficient for full batch | Split into priority batches; defer non-urgent |
| E2 | Vendor has multiple approved invoices | Group into single payment; show breakdown |
| E3 | Cross-currency payment batch | Separate by currency; FX conversion per batch |
| E4 | Payment terms conflict (Net 30 vs. Net 60) | Prioritise by due date; earlier due first |
| E5 | Bank cutoff time approaching | Flag for next business day; notify Treasury |

### Accessibility Notes

- Proposal summary: screen reader friendly with key metrics
- Invoice list: sortable table with keyboard navigation
- Cash impact: visual indicator (positive/negative/neutral)

### Mobile Considerations

- Dashboard view: payment proposal summary with approve/reject
- Invoice list: expandable per-invoice detail
- Push notification: "Payment proposal ready — [count] invoices, [total] — tap to review"

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New payment proposal |
| `Cmd+G` | Generate proposal |
| `Cmd+P` | Print/export proposal |
| `A` | Approve proposal |
| `D` | Defer proposal |
| `F` | Filter invoices |

### Audit Trail

```
proposal.created    → AP Manager ID, timestamp, invoice count, total
proposal.optimised  → discount captured, optimisation method
proposal.submitted  → submitted to Treasury for approval
proposal.approved   → Treasury Manager ID, approval timestamp
```

---

## 10. Journey 8: Payment Release

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J8 |
| **Persona** | Treasury Manager |
| **Goal** | Execute payment with confidence |
| **Trigger** | Payment proposal approved |
| **Scope** | From approved proposal to bank execution |
| **Target Duration** | < 2 hours from approval to execution |
| **Success Metric** | > 99.5% payment success rate; < 0.5% failure rate |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E3 (Ayman Shawky) | "Need for instant view of cash positions" | Medium |
| E5 (Eslam Sobhi) | Treasury feedback on payment execution [CRM] | Low |
| H4 | "Batch Payment Processing" — [HYPOTHESIS] | Low |

### Journey Map

```
TRIGGER: Payment proposal approved by Treasury
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Review payment proposal         │
│   Total amount and breakdown            │
│   Bank account selection                │
│   Cash position confirmation            │
│   FX rates (if multi-currency)          │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Confirm cash availability       │
│   Real-time bank balance check          │
│   Sufficient balance for full batch?    │
│   Reserve buffer maintained?            │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Dual signature needed?│
         └───────────┬───────────┘
         YES (>$50K) │    NO (<$50K)
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Second Treasury  │  │ Proceed to       │
│ approval         │  │ execution        │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Authorise payment               │
│   Digital signature captured            │
│   Payment instruction generated         │
│   Sent to bank API                      │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ Payment successful?   │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ STEP 4: Track    │  │ Retry or escalate│
│ confirmation     │  │                  │
│ Bank reference   │  └────────┬─────────┘
│ Status: PAID     │           │
└────────┬─────────┘           ▼
         │             ┌──────────────────┐
         ▼             │ Manual wire or   │
┌──────────────────┐   │ bank escalation  │
│ Notify AP +      │   │                  │
│ vendor           │   └──────────────────┘
└──────────────────┘
```

### Payment Execution Checklist

| # | Check | Required |
|---|-------|----------|
| 1 | Treasury Manager approval | Yes |
| 2 | Dual signature (if >$50K) | Conditional |
| 3 | Cash availability confirmed | Yes |
| 4 | Bank account details verified | Yes |
| 5 | FX rate locked (if multi-currency) | Conditional |
| 6 | Payment instruction generated | Yes |
| 7 | Bank API connection healthy | Yes |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Bank API timeout | Retry 3x with exponential backoff; then manual wire |
| E2 | Insufficient funds at execution time | Defer payment; notify AP Manager; re-prioritise |
| E3 | Bank rejects payment (invalid account) | Notify AP; hold payment; request vendor bank detail update |
| E4 | Payment partially executed (some invoices paid, some not) | Log partial; retry remaining; reconcile per-invoice |
| E5 | Duplicate payment detected pre-execution | Void duplicate; remove from batch; notify AP |
| E6 | Weekend/holiday execution | Schedule for next business day; notify stakeholders |

### Accessibility Notes

- Payment status: announced by screen reader at each stage
- Confirmation: requires explicit confirmation before execution
- Dual signature: accessible workflow for second approver

### Mobile Considerations

- Push notification: "Payment batch [ID] ready — [total] — tap to authorise"
- Biometric confirmation: Face ID / fingerprint for payment authorisation
- Status tracking: real-time payment status with push updates

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+A` | Authorise payment |
| `Cmd+R` | Retry failed payment |
| `Cmd+V` | View bank reference |
| `Cmd+L` | View bank log |
| `Escape` | Cancel payment (pre-execution only) |

### Audit Trail

```
payment.authorise   → Treasury Manager ID, signature, timestamp
payment.execute     → bank API request, instruction reference
payment.confirm     → bank response, reference number, timestamp
payment.fail        → failure reason, retry count, escalation path
payment.resolve     → resolution method, manual wire reference
```

---

## 11. Journey 9: Audit Review

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J9 |
| **Persona** | Auditor (Internal / External) |
| **Goal** | Verify complete audit trail and controls |
| **Trigger** | Audit event (scheduled or ad-hoc) |
| **Scope** | From audit initiation to report generation |
| **Target Duration** | < 2 days (down from 2 weeks) |
| **Success Metric** | 0 material findings; 100% checksum verification |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| E7 (Ahmed Orabi) | "Audit trail for every action" listed as gap — addressed in design | High |
| Constitution | "Every action is auditable" — Platform Constitution | High |
| Auditor persona | Requirements derived from Phase 20.0 validation | High |

### Journey Map

```
TRIGGER: Audit initiated (scheduled or ad-hoc)
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Access audit portal             │
│   Select audit scope (date range,       │
│   vendor, amount range, anomaly flags)  │
│   Generate statistically valid sample   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Review transaction trail        │
│   For each sampled invoice:             │
│   Receipt → Capture → Review → Match    │
│   → Exception (if any) → Approval      │
│   → Payment → Bank Confirmation → GL    │
│   All timestamps and actors documented  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 3: Verify controls                 │
│   Segregation of duties (SoD)           │
│   Threshold compliance                  │
│   Approval chain completeness           │
│   Delegation chain auditability         │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 4: Verify integrity                │
│   Checksum chain verification           │
│   Tamper-evidence check                 │
│   Record count reconciliation           │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Generate audit report           │
│   Summary of findings                   │
│   Exception analysis                    │
│   Control effectiveness assessment      │
│   Recommendations                       │
└─────────────────────────────────────────┘
```

### Audit Controls Checklist

| # | Control | Verification Method |
|---|---------|-------------------|
| C1 | All invoices have receipt record | Checksum chain — every invoice must have `invoice.received` |
| C2 | OCR accuracy > 95% | Compare extracted vs. original for sample |
| C3 | Three-way match executed | Match record present for every PO-referenced invoice |
| C4 | Exceptions resolved within SLA | SLA metrics report — % resolved on time |
| C5 | Approval chain complete | Every invoice has approval record with digital signature |
| C6 | SoD enforced | No PO creator approved their own invoice |
| C7 | Payment authorised | Treasury approval before execution |
| C8 | Bank confirmation received | Bank reference for every payment |
| C9 | GL entries posted | GL reference for every paid invoice |
| C10 | Checksum chain unbroken | Verify chain from first to last record |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Checksum chain broken | Flag as critical finding; investigate tampering |
| E2 | Missing audit record | Flag as material finding; investigate gap |
| E3 | Approver approved outside authority | Flag as control weakness; recommend remediation |
| E4 | Invoice paid without approval | Flag as critical finding; require investigation |
| E5 | Bulk sample reveals pattern | Expand sample; escalate to management |

### Accessibility Notes

- Audit report: screen reader friendly with structured headings
- Checksum verification: automated; results displayed in accessible table
- Export: accessible PDF with tagged headings and tables

### Mobile Considerations

- Read-only access on mobile
- Dashboard view: audit status summary
- Push notification: "Audit [ID] — [X] findings flagged"

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New audit |
| `Cmd+G` | Generate sample |
| `Cmd+V` | Verify checksums |
| `Cmd+R` | Generate report |
| `Cmd+E` | Export report |

### Audit Trail

```
audit.initiate    → auditor ID, scope, timestamp
audit.sample      → sample size, selection method, criteria
audit.review      → invoice ID, review result, timestamp
audit.verify      → checksum chain verification result
audit.report      → findings, recommendations, completion timestamp
```

---

## 12. Journey 10: Month-End Close

### Overview

| Field | Detail |
|-------|--------|
| **Journey ID** | J10 |
| **Persona** | Financial Controller |
| **Goal** | Close AP subledger accurately and on time |
| **Trigger** | Period end (monthly close calendar) |
| **Scope** | From close initiation to subledger sign-off |
| **Target Duration** | < 2 days (down from 5) |
| **Success Metric** | 100% GL reconciliation; 0 material variances |

### Evidence

| Source | Quote | Confidence |
|--------|-------|------------|
| T5 | "Month-End Close Is Universally Painful" (3 sources) | High |
| E7 (Ahmed Orabi) | Month-end close identified as friction point across 3+ personas | High |
| Controller persona | Requirements from Phase 20.0 validation | High |

### Journey Map

```
TRIGGER: Period end (25th of month recommended)
  │
  ▼
┌─────────────────────────────────────────┐
│ STEP 1: Run pre-close checks            │
│   All invoices in pipeline reviewed     │
│   Pending approvals escalated           │
│   Open exceptions resolved or deferr    │
│   In-transit GRNs confirmed             │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 2: Run AP-GL reconciliation        │
│   Compare AP subledger to GL            │
│   Identify variances                    │
│   Auto-reconcile matching entries       │
│   Flag manual review items              │
└────────────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │ All entries match?    │
         └───────────┬───────────┘
              YES    │    NO
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ STEP 3: Post     │  │ Investigate      │
│ pending entries  │  │ variances        │
│ (accruals,       │  │ (correct or      │
│ prepayments)     │  │ explain)         │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│ STEP 4: Verify balances                 │
│   AP aging report matches GL balance    │
│   All accounts reconciled               │
│   No orphaned entries                   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ STEP 5: Sign off                         │
│   Controller digital signature          │
│   Close period locked                    │
│   Audit package generated               │
│   Period metrics snapshot               │
└─────────────────────────────────────────┘
```

### Pre-Close Checklist

| # | Task | Owner | Deadline |
|---|------|-------|----------|
| 1 | Review all invoices in pipeline | AP Manager | 23rd |
| 2 | Escalate pending approvals | AP Manager | 24th |
| 3 | Resolve open exceptions | AP Manager | 24th |
| 4 | Confirm in-transit GRNs | Procurement | 24th |
| 5 | Run duplicate detection scan | System | 24th night |
| 6 | Post accruals for unreceived invoices | Controller | 25th |
| 7 | Post prepayment amortisation | Controller | 25th |

### Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| E1 | Invoice arrives after close | Post to next period; log as prior-period item |
| E2 | Vendor statement differs from GL | Run reconciliation; investigate discrepancy |
| E3 | Accrual estimate significantly wrong | Adjust accrual; document reason |
| E4 | Foreign currency revaluation needed | Run FX revaluation; post gain/loss |
| E5 | Intercompany AP entries | Match against intercompany AR; reconcile |

### Accessibility Notes

- Close dashboard: screen reader friendly with progress indicators
- Reconciliation table: sortable, filterable, keyboard navigable
- Sign-off: accessible confirmation dialog

### Mobile Considerations

- Read-only dashboard view on mobile
- Push notification: "Month-end close [status] — [X] items remaining"
- Quick review: approve pre-close checklist items from mobile

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+R` | Run reconciliation |
| `Cmd+P` | Post pending entries |
| `Cmd+V` | Verify balances |
| `Cmd+S` | Sign off (with confirmation) |
| `Cmd+E` | Export close package |
| `Cmd+L` | Lock period |

### Audit Trail

```
close.initiate     → Controller ID, period, timestamp
close.reconcile    → AP-GL match result, variance count
close.post         → entries posted, accrual amounts
close.verify       → balance verification, account counts
close.sign_off     → Controller signature, period locked
close.package      → audit package generated, report reference
```

---

## 13. Cross-Journey Dependencies

| Journey | Depends On | Produces |
|---------|-----------|----------|
| J1 (Invoice Receipt) | — | Invoice in validated queue |
| J2 (Invoice Review) | J1 | Invoice reviewed + validated |
| J5 (Supporting Docs) | J1 | Complete documentation |
| J3 (Three-Way Match) | J2, J5 | Matched invoice or exception |
| J4 (Exception Resolution) | J3, J6 | Resolved exception |
| J6 (Approval Path) | J3, J5 | Approved invoice |
| J7 (Payment Readiness) | J6 | Payment proposal |
| J8 (Payment Release) | J7 | Executed payment |
| J9 (Audit Review) | All | Audit report |
| J10 (Month-End Close) | All | Closed period |

---

## 14. Journey Maturity

| Journey | Evidence Confidence | Validation Status | Risk Level |
|---------|-------------------|-------------------|------------|
| J1 (Invoice Receipt) | High (E1, T2) | Working | Low |
| J2 (Invoice Review) | High (E1, E4, T2) | Working | Low |
| J3 (Three-Way Match) | High (T2, E1) | Working | Low |
| J4 (Exception Resolution) | Medium (E4, E7) | Working | Medium |
| J5 (Supporting Docs) | Low [HYPOTHESIS] | Not validated | High |
| J6 (Approval Path) | High (T1, E1) | Working | Low |
| J7 (Payment Readiness) | Medium (E3) [HYPOTHESIS] | Not validated | Medium |
| J8 (Payment Release) | Low (E5) [HYPOTHESIS] | Not validated | High |
| J9 (Audit Review) | High (Constitution) | Working | Low |
| J10 (Month-End Close) | High (T5) | Working | Low |

---

## 15. Next Steps

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| 1 | Validate J5 (Supporting Docs) with 3+ AP clerks | Product | Q3 2026 |
| 2 | Validate J7 (Payment Readiness) with 3+ AP managers | Product | Q3 2026 |
| 3 | Validate J8 (Payment Release) with 3+ Treasury managers | Product | Q3 2026 |
| 4 | Prototype J6 (Approval) on mobile with 5 users | Design | Q3 2026 |
| 5 | A/B test J4 (Exception) dedicated queue vs inline | Product | Q4 2026 |

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | USER_JOURNEY_LIBRARY_v2.0 |
| Phase | 27.1 |
| Author | Perionyx Product Architecture Board |
| Reviewers | Customer Advisory Board, Engineering Leads, UX |
| Status | Draft |
| Next Review | Phase 27.2 |
| Classification | Internal — Engineering & Product |
| Total Lines | ~800 |
| Journeys Defined | 10 |
| Hypotheses Flagged | 5 (J5, J7, J8, approval thresholds, batch payments) |
