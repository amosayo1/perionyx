---
title: "AI Behaviour Guide — Role of Artificial Intelligence in the AP Workflow v1.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
tags:
  - type/specification
  - domain/ai
  - domain/ap
  - status/active
owner: AI Platform Team
authority: Phase 27.1
---

# AI Behaviour Guide — Role of Artificial Intelligence in the AP Workflow v1.0

> **Classification**: Restricted — Internal Use Only
> **Status**: Design Document (Phase 27.1)
> **Authority**: Phase 27.1 — AI Behaviour Contract for AP Reference Workflow
> **Evidence Basis**: Adeel Aslam (E1), Ayman Shawky (E3), Muhammed Jamsheed (E4), Mohamed Gamal (E5), Khaleel Ur Rehman (E6), Ahmed Orabi (E7), Themes T1–T8, Principles P1–P10

---

## 1. Philosophy — AI Explains but Never Decides

### 1.1 Core Tenet

AI in Perionyx is an **evidence collector and explainer**, never a decision-maker. Every AI output is a recommendation that a human can accept, modify, or reject with a reason. This is non-negotiable and applies to all 10 stages of the AP workflow.

**The AI Promise:**

1. AI **collects evidence** so you don't have to — PO linking, GRN matching, contract term extraction, vendor history assembly (E1: "manual oversight to ensure accuracy")
2. AI **explains discrepancies** so you don't have to investigate — variance analysis, root cause diagnosis, pattern detection (T2: "vendor invoice reconciliation is manual and error-prone")
3. AI **highlights anomalies** so you don't have to search — outlier amounts, unusual terms, new bank accounts, behavioural shifts (T1: approval delays imply anomalies go unnoticed)
4. AI **recommends actions** so you don't have to start from scratch — GL coding suggestions, resolution proposals, payment timing optimisation (P5: AI Must Explain)
5. AI **prioritises work** so you don't have to figure out what's urgent — SLA-based queue ordering, risk-based exception ranking (T5: month-end close pain implies prioritisation need)
6. AI **NEVER decides for you**. You decide. AI prepares.

### 1.2 Evidence Basis

| Principle | Source | Confidence |
|-----------|--------|------------|
| P5: AI Must Explain | P5 (Product Principle) — constitutional | Working |
| T6: AI Trust | Ayman Shawky (E3): "Need for confidence scoring on forecasts"; Mohamed Gamal (E5): desire for automated reconciliation with trust | Working (2 sources) |
| AI assists, never replaces | E1 (Adeel Aslam): "manual oversight to ensure accuracy" implies human must remain in control | High |
| Human override mandatory | E1 + E3: trust requires ability to verify and override | Working |

### 1.3 Design Principles

1. **AI augments human judgement, never replaces it** — no autonomous approvals, no autonomous payments, no autonomous vendor changes
2. **Every AI output has a confidence score** — you decide how much to trust it; confidence is always visible, never hidden
3. **Every AI output is explainable** — it must answer: What was found? Why is this relevant? What evidence supports this? What is the confidence? What happens if ignored?
4. **Every AI output is overridable** — humans can reject any recommendation with a mandatory reason; overrides are logged and used to improve models
5. **Every AI action is logged** — full audit trail of reasoning, inputs, outputs, model version, human action taken
6. **AI fails gracefully** — when uncertain (< 50% confidence), it falls back to manual processing, never to guesses or approximations

---

## 2. AI Permissions Matrix

### 2.1 What AI Can Do Autonomously

AI operates autonomously only for **data collection, evidence assembly, and computation**. Any action that could affect financial outcomes or compliance requires human confirmation.

| Category | AI Actions | Autonomy Level | Human Required? |
|----------|-----------|----------------|-----------------|
| **Data Extraction** | OCR field extraction, line item parsing, vendor name extraction, date/amount extraction | Automated | Review fields < 85% confidence |
| **Evidence Collection** | PO linking, GRN linking, contract term extraction, vendor history assembly, past invoice comparison | Fully autonomous | No (automated data pipeline) |
| **Matching** | Three-way match computation, variance calculation, tolerance evaluation | Automated | Override match with reason |
| **Duplicate Detection** | Similarity scoring, exact match detection, near-duplicate flagging | Automated | Confirm duplicate before void |
| **Anomaly Detection** | Statistical outlier detection, behavioural shift detection, pattern identification | Automated | Investigate flagged items |
| **Coding Suggestions** | GL code suggestions from history + PO match | Suggestive | Confirm coding before posting |
| **Cash Flow Prediction** | Payment outflow projection, discount NPV calculation | Suggestive | Treasury approves timing [HYPOTHESIS] |
| **Vendor Risk Scoring** | Composite risk score from payment history, dispute history, ageing | Suggestive | Interpret score, make decision |
| **Audit Trail Analysis** | Chronological reconstruction, checksum verification, gap detection | Automated | Review exceptions only |
| **Work Prioritisation** | SLA-based queue ordering, risk-based ranking, deadline alerts | Suggestive | Accept or override ranking |
| **Exception Classification** | Type assignment, severity scoring, root cause diagnosis | Suggestive | Confirm classification |
| **Resolution Suggestion** | Historical match-based resolution proposal | Suggestive | Choose and apply resolution |
| **Recommendation Generation** | Approve/review/reject recommendation with reasoning chain | Suggestive | Make final decision |
| **Payment Optimisation** | Discount capture calculation, timing recommendation, batch grouping | Suggestive | Treasury approves proposal |
| **Payment Failure Diagnosis** | Error code interpretation, root cause, retry recommendation | Suggestive | Decide action |
| **Reconciliation Matching** | Bank statement line matching, exception flagging | Automated | Review exceptions |
| **GL Auto-Coding** | Account code suggestion by vendor category, item type, history | Suggestive | Controller confirms coding |
| **SLA Monitoring** | Real-time SLA tracking, breach prediction, escalation triggers | Automated | Act on breach alerts |

### 2.2 What Requires Human Confirmation

| Category | AI Action | Confirmation Required From | Evidence |
|----------|-----------|---------------------------|----------|
| Data Extraction | Low-confidence field override | AP Clerk | T2: manual accuracy requirement |
| Vendor Matching | Fuzzy match (confidence < 95%) | AP Clerk | E1: manual vendor verification |
| Duplicate Detection | Confirm duplicate before void | AP Clerk | T2: false duplicates would erode trust |
| Exception Classification | Confirm type and severity | AP Manager | WP1: exceptions deserve attention |
| Resolution Suggestion | Choose and apply resolution | AP Manager | P5: AI explains, human decides |
| Recommendation | Accept/reject approve/review/reject | Role-based approver | T1: approval workflow pain point |
| GL Coding | Confirm account codes | Controller | E5: manual reconciliation pain |
| Payment Optimisation | Approve batch timing and composition | Treasury Manager | E3: cash position visibility |
| Payment Failure | Decide retry, reschedule, or manual | Treasury Manager | E9: treasury reliability |
| Routing Plan | Approve cross-department routing | AP Manager | T3: ERP silos integration pain |
| Risk Score | Interpret and act on score | Approver | E3: confidence scoring need |
| Anomaly | Investigate flagged item | AP Clerk / AP Manager | T6: AI trust requires verification |

### 2.3 What AI Must Never Do (Hard Blocks)

| Restriction | Stage | Reason | Fallback | Evidence |
|------------|-------|--------|----------|----------|
| Approve invoices | 7 | Legal authority requires human decision; AI lacks legal standing | Route to human approver | SOX compliance, constitutional |
| Execute payments | 9 | Financial authority requires human decision; AI cannot hold signing authority | Route to Treasury Manager | SOX, dual-signature requirement |
| Override approval thresholds | 7 | Compliance and SoD controls; threshold overrides are control failures | Block override, log attempt | Constitution Law 12 |
| Modify vendor banking details | 1–9 | Fraud prevention; banking detail changes are the #1 BEC attack vector | Route to AP Manager with dual approval | T2: fraud prevention |
| Delete audit records | 10 | Tamper-evident audit trail is constitutional | Block deletion, log attempt | VP4: Every Action Is Auditable |
| Skip approval levels | 7 | Compliance and authority controls; skipping levels breaks SoD | Block skip, log attempt | SOX compliance |
| Process unauthorised payments | 9 | Unauthorised disbursement | Block execution, log attempt | VP5: Financial Precision |
| Modify tolerance rules | 3 | Control integrity; tolerance rules are policy decisions | Route to AP Manager | T2: matching integrity |
| Interpret company policy | All | Policy interpretation requires human judgement and context | Flag for human review | P5: AI explains, does not decide |
| Make legal determinations | All | Legal decisions require qualified professionals | Route to legal/compliance | Constitutional |
| Access external systems without audit | All | Security and compliance | Log all external access | Security Constitution |
| Present decisions without evidence | All | Accountability requires evidence trail | Flag "insufficient evidence" | VP4: audit trail requirement |

---

## 3. AI Actions — Detailed Specifications

### 3.1 AP-AI-01: Invoice Data Extraction

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-01 |
| **Stage** | 1 — Invoice Received |
| **Capability** | OCR field extraction with structured output |
| **Input** | Invoice PDF/image, email body, EDI payload, fax capture |
| **Processing** | Extract vendor name, VAT/tax ID, invoice number, issue date, due date, line items (description, quantity, unit price, net amount, tax rate, tax amount, gross amount), PO number, remittance address, banking details using trained OCR model with layout analysis |
| **Can Do** | Extract all standard invoice fields with per-field confidence scores; highlight low-confidence fields in yellow with source coordinates; auto-detect layout type (standard PO, credit note, pro forma, debit note); parse multi-page invoices; handle rotated/scanned pages |
| **Cannot Do** | Override extracted data without human confirmation; extract from handwritten invoices (flag for manual entry); infer missing fields (return null, never guess); modify original document |
| **Must Do** | Show per-field confidence score (0–100%); highlight fields below 85% confidence in yellow with visual indicator; show source coordinates ("page 1, line 3, bold text"); show top 3 alternative interpretations for low-confidence fields; flag unreadable fields explicitly |
| **Output** | Structured `ExtractedInvoice` object with fields, confidence scores, source coordinates, alternative interpretations |
| **Confidence Model** | Per-field: 0–100%. Overall document confidence = weighted average of field confidences by field importance (amount 30%, vendor 25%, invoice number 20%, date 15%, line items 10%) |
| **Confidence Thresholds** | ≥ 85%: auto-accept, route to validation. 50–84%: flag for review, show alternatives. < 50%: route to manual entry |
| **Explainability** | "Field 'amount' extracted as $12,450.00 with 94% confidence. Source: page 1, line 3, bold text in 'TOTAL DUE' row. Alternative interpretations: $12,450.00 (94%), $12,450.06 (3%), $12,450.08 (2%). Field 'PO Number' extracted as 'PO-7821' with 78% confidence (partial occlusion). Please verify." |
| **Human Action** | Review highlighted fields; confirm or correct extracted values; provide corrected value if AI is wrong; override reason required if AI was above threshold |
| **Performance Target** | Field accuracy > 95%; processing time < 3s per page; coverage > 99% of invoices (excluding handwritten) |
| **Audit** | Log every extracted field (value, confidence, source coordinates, alternatives) + every human correction (original, corrected, reason, userId, timestamp) |
| **Evidence** | T2 (vendor invoice reconciliation is manual and error-prone); E1 (Adeel Aslam: "manual oversight to ensure accuracy") |

### 3.2 AP-AI-02: Three-Way Match Suggestions

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-02 |
| **Stage** | 3 — Three-Way Match |
| **Capability** | Automated invoice vs. PO vs. GRN matching with line-level comparison |
| **Input** | Extracted invoice data (AP-AI-01 output), PO record (from procurement), GRN record (from warehouse), contract terms (from evidence assembly) |
| **Processing** | Compare invoice line items against PO line items and GRN line items; compute match/no-match/partial-match per line and overall; apply configurable tolerance rules per vendor and item category; identify missing POs, missing GRNs, quantity variances, price variances, tax mismatches, currency mismatches |
| **Can Do** | Flag match (all lines match within tolerance), no-match (systematic failure), partial-match (some lines match, some disagree) with per-line discrepancy details; show line-level comparison with values side-by-side; apply vendor-specific tolerance rules; detect hidden discounts, early-payment terms |
| **Cannot Do** | Auto-approve matches; auto-pay matched invoices; override tolerance rules (must route to AP Manager); skip approval because match passed |
| **Must Do** | Show line-level comparison grid: invoice amount vs PO amount vs GRN amount, variance absolute and percentage; flag each line as MATCH / VARIANCE / MISSING / EXTRA; show overall match status with colour indicator; link to source documents (invoice image, PO view, GRN view); display AI confidence per line match |
| **Confidence Model** | Per-line: deterministic (computation-based, 95–100% for data we have). Overall: based on completeness of source data (missing PO = no match possible, confidence 0%) |
| **Output** | MatchResult with matchLevel (FULL_MATCH / PARTIAL_MATCH / NO_MATCH / EVIDENCE_GAP), lineMatches[], overallConfidence, discrepancySummary |
| **Explainability** | "Match status: PARTIAL MATCH (confidence: 94%). 3 of 4 line items match within tolerance. Line 2: Widget B — Invoice: $3,950.00, PO: $3,900.00, Variance: +$50.00 (+1.28%). Tolerance for this vendor: ±2%. Within tolerance — auto-accepted. Line 4: Setup Fee — Invoice: $500.00, PO: No matching line. GRN: No matching line. No evidence found for this charge." |
| **Human Action** | Review partial matches; confirm or dispute variance; provide reason for overriding match status; upload missing PO/GRN if evidence gap |
| **Performance Target** | Auto-match rate > 70% (target > 90% at 180 days); processing time < 2s; false positive rate < 1% |
| **Audit** | Log match result per line (invoice value, PO value, GRN value, variance, tolerance used, match verdict) + human override (verdict before, verdict after, reason, userId, timestamp) |
| **Evidence** | T2 (manual matching is the pain point, 4 sources); E1 (Adeel Aslam: manual matching cited); E4 (Muhammed Jamsheed: inventory reconciliation pain) |

### 3.3 AP-AI-03: Duplicate Detection

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-03 |
| **Stage** | 1 — Invoice Received (pre-validation) |
| **Capability** | Identify potential duplicate invoices before they enter the workflow |
| **Input** | Invoice vendor ID, invoice number, amount, issue date, due date, line item hash, PO reference |
| **Processing** | Search all existing invoices (past 24 months) for same vendor + same invoice number (exact match); same vendor + similar amount (±10%) + same or adjacent month (near-duplicate); same line item hash (content match); same PO reference + different invoice number (double-billing); fuzzy match on amount + date + vendor name (vendor name variations) |
| **Can Do** | Flag exact duplicates (same vendor, same invoice number — 99% probability); flag near-duplicates (same vendor, similar amount, same month — 70–95% probability); show similarity breakdown by matched field with percentage; surface previous invoice for side-by-side comparison |
| **Cannot Do** | Mark as duplicate without human confirmation; auto-void the flagged invoice; delete the duplicate without audit trail; block invoice creation (must allow creation with DUPLICATE flag) |
| **Must Do** | Show similarity score (0–100%) with per-field breakdown; show matched fields with values side-by-side; link to existing invoice for comparison; flag exact vs near vs potential; provide "Confirm Duplicate" and "Not a Duplicate" buttons with reason field |
| **Confidence Model** | Exact match (same vendor + same invoice number): 99%. Near-duplicate (same vendor + amount ±10% + same month): 70–95%. Content match (same line item hash): 95%. Double-billing (same PO, different invoice): 80%. Fuzzy vendor match: 50–70% |
| **Output** | DuplicateAssessment with probability (0–100%), matchType (EXACT / NEAR / CONTENT / PO_DUPLICATE / FUZZY), matchedInvoiceId, fieldComparisons[], supportingEvidence |
| **Explainability** | "Potential duplicate detected (probability: 92%). Matched with INV-2026-0321 from same vendor (Acme Corp). Invoice number: INV-2026-0451 vs INV-2026-0321 — different (37% similarity). Amount: $12,450.00 vs $12,440.00 — difference $10.00 (0.08%). Date: 15 Jul 2026 vs 12 Jul 2026 — 3 days apart. Line items: 4 of 5 line items match description and quantity. PO reference: PO-7821 appears on both invoices. Assessment: HIGH PROBABILITY of duplicate billing for same goods." |
| **Human Action** | Review comparison; click "Confirm Duplicate" (triggers exception workflow, vendor notified) or "Not a Duplicate" (invoice continues, reason required); set as false positive to improve model |
| **Performance Target** | Precision > 90% (few false positives); recall > 99% (catch all duplicates); processing time < 1s; false negative rate < 0.5% |
| **Audit** | Log every detection (matched fields, similarity score, decision, human action + reason) + every false positive or false negative for model retraining |
| **Evidence** | T2 (error-prone reconciliation implies duplicates slip through); E1 (Adeel Aslam: manual reconciliation is painful) |

### 3.4 AP-AI-04: Anomaly Detection

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-04 |
| **Stage** | All stages (continuous) |
| **Capability** | Detect unusual patterns in invoice data, vendor behaviour, payment requests |
| **Input** | Invoice amount, vendor history (past 24 months), payment terms, bank account details, line item categories, PO patterns, user behaviour |
| **Processing** | Statistical analysis against vendor behavioural baseline; compute mean and standard deviation of historical invoice amounts for vendor; flag amounts > 2σ from vendor history; flag payment terms that differ from vendor's standard terms (e.g., vendor always uses Net 30, suddenly shows Net 0); flag new bank accounts for active vendors (BEC detection); flag high-velocity invoice submission (> 10 invoices in 24 hours from same vendor); flag unusual item categories (vendor of office supplies suddenly billing for server hardware); flag unusual user behaviour (AP Clerk processing 300% of normal volume); flag off-cycle submission patterns (vendor always submits on weekdays, suddenly submits on weekend); flag inconsistent tax treatment (vendor always charges VAT, suddenly shows zero-rated) |
| **Can Do** | Flag amounts > 2σ from vendor historical mean; flag payment term changes; flag new bank accounts; flag high-velocity submissions; flag unusual categories; flag behavioural shifts; flag off-cycle patterns; flag tax inconsistencies; show historical context for every flag |
| **Cannot Do** | Block payment without review; auto-decline invoice; modify vendor record; trigger payment hold without human decision; make fraud determination (only flag unusual, never accuse) |
| **Must Do** | Show historical baseline for comparison ("Vendor's typical invoice: $5,000–$15,000. This invoice: $245,000. 16× the median."); show behavioural trend graph (12-month history with current value highlighted); show similar anomalies and their outcomes; rate anomaly severity (LOW / MEDIUM / HIGH / CRITICAL) based on financial impact and fraud signal strength |
| **Confidence Model** | Statistical anomalies (2σ+): percentile-based. The further from baseline, the higher the confidence. Behavioural shifts: pattern-break detection, confidence based on sample size. New bank accounts: binary flag + verification status |
| **Output** | AnomalyReport with anomalyType (AMOUNT_OUTLIER / TERM_CHANGE / NEW_ACCOUNT / VELOCITY / CATEGORY_SHIFT / BEHAVIOURAL / OFF_CYCLE / TAX_MISMATCH), severity (LOW / MEDIUM / HIGH / CRITICAL), confidence (0–100%), historicalContext, similarAnomalies[] |
| **Explainability** | "Anomaly detected: Amount $245,000.00 is a HIGH outlier for this vendor. Historical analysis (24 months, 47 invoices): Mean: $8,450.00, Median: $6,200.00, Std Dev: $4,100.00. This invoice is 58σ above the mean — 245× the vendor's typical invoice. Similar anomalies: 1 case in past 24 months (vendor submitted $180,000 invoice in error, was corrected). Risk: This may be a legitimate large order or an invoice error. Recommendation: Verify PO and contact vendor before processing." |
| **Human Action** | Investigate flagged anomaly; review historical context; verify with vendor or procurement; confirm safe (invoice continues) or escalate (invoice held for investigation); provide resolution reason |
| **Performance Target** | Critical anomaly precision > 95%; HIGH severity precision > 85%; processing time < 500ms; zero missed critical anomalies (fraud, BEC) |
| **Audit** | Log every anomaly (type, severity, confidence, factors, human action, resolution, timestamp) |
| **Evidence** | T6 (AI trust requires confidence scoring — 2 sources); E3 (Ayman Shawky: "confidence scoring on forecasts"); T1 (approval delays imply issues go undetected) |

### 3.5 AP-AI-05: GL Coding Suggestions

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-05 |
| **Stage** | 9 — GL Posting |
| **Capability** | Suggest GL account codes based on invoice line items, vendor category, and historical coding patterns |
| **Input** | Invoice line items (description, quantity, amount), vendor category, vendor G/L account (if configured), PO account codes, historical coding for same vendor, chart of accounts, cost centre mapping |
| **Processing** | Match line item → GL account: exact match (same item description coded to same account 5+ times for this vendor) → 90–95% confidence; category match (vendor mapped to expense category, items within standard mapping) → 75–85% confidence; semantic match (ML-based description embedding to account prediction) → 60–75% confidence; ambiguous match (new item type, no history) → < 60% confidence; compute top 3 suggestions with confidence per line |
| **Can Do** | Suggest GL account codes per line item with confidence score; show top 3 alternatives with confidence deltas; show historical coding frequency ("23 of 30 past invoices coded to 6120"); flag ambiguous items for confirmation; learn from Controller corrections and improve suggestions |
| **Cannot Do** | Apply GL codes automatically without confirmation; override Controller's correction; skip confirmation for ambiguous items; post to GL without Controller approval |
| **Must Do** | Show suggested code + account name + confidence for each line item; show top 3 alternatives if no suggestion > 80% confidence; show historical coding evidence ("This item was coded to 6120 in 23 of 30 past invoices from this vendor"); flag items where vendor category conflicts with line item (e.g., vendor is "Software" but line item is "Furniture"); show total debits = total credits before enabling confirmation |
| **Confidence Model** | Exact match (item coded to same account 5+ times for vendor, same description): 90–95%. Category match (vendor category mapping, standard expense type): 75–85%. Semantic match (ML embedding prediction): 60–75%. No match (new item, no vendor history): < 60%. Confidence displayed per line item |
| **Output** | CodingSuggestion[] with lineItemId, suggestedAccountCode, accountName, confidence (0–100%), alternatives[] (accountCode, accountName, confidence), evidenceText, flag (boolean) |
| **Explainability** | "GL coding suggestion: Line 1 'Cloud hosting services ($8,500.00)' → Account 6120 (Software Subscriptions) — confidence 94%. Evidence: This vendor (Acme Corp) has submitted 23 invoices in past 12 months. All 23 coded 'cloud hosting' to account 6120. 0 corrections by Controller. Alternative: Account 6140 (IT Infrastructure) — confidence 6% (coded to 6140 for 'server hardware' items, not cloud). Recommendation: Accept 6120." |
| **Human Action** | Confirm suggested code (single click); change code (open account picker, search/filter); override reason required if changing from AI suggestion with > 90% confidence; Controller batch-confirms at month-end |
| **Performance Target** | Top-1 accuracy > 85%; top-3 accuracy > 95%; confirmation rate > 90%; processing time < 500ms per line item |
| **Audit** | Log every suggestion (line item, suggested code, confidence, alternatives) + human decision (accepted, changed to, reason, ControllerId, timestamp) |
| **Evidence** | E5 (Mohamed Gamal: "manual account reconciliation" — automation target); T5 (month-end close pain — GL coding is a contributor); E3 (Ayman Shawky: integrated financial platform expectation) |

### 3.6 AP-AI-06: Cash Flow Prediction [HYPOTHESIS]

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-06 |
| **Stage** | 6 — Payment Readiness |
| **Capability** | Project payment outflows by vendor, predict optimal payment timing, estimate discount capture benefit |
| **Input** | Approved invoices awaiting payment, payment terms per invoice, discount windows, current cash position, historical payment timing, bank fee schedules, AR forecast (from Treasury) |
| **Processing** | Aggregate all approved invoices; group by vendor and due date; compute daily cash outflow projection for next 90 days; apply discount optimisation (NPV calculation per invoice — discount benefit vs early cash outflow cost vs opportunity cost); recommend batch grouping by payment method (ACH < $50K, Wire > $50K, Check for vendors without EFT); flag cash constraint periods where projected outflows exceed projected balance |
| **Can Do** | Project payment outflows by vendor, category, and due date; calculate NPV of early payment discount capture; recommend optimal payment timing within discount window; group invoices into payment batches by method and timing; forecast cash balance with confidence interval; identify required borrowing periods |
| **Cannot Do** | Delay payments unilaterally; reschedule invoices without Treasury approval; override payment terms; commit cash without Treasury Manager confirmation; make borrowing decisions |
| **Must Do** | Show daily outflow projection (bar chart: next 90 days, current cash level line, minimum balance threshold); show discount capture opportunity table (invoice, discount % and $, NPV benefit, optimal payment date); flag cash constraint days (red highlighted bars where projected < minimum); show confidence interval as shaded band around projection; allow "what-if" scenario adjustments (what if payment batch is delayed by 7 days?) |
| **Confidence Model** | Deterministic (approved invoices due dates): 95% certainty. Discount optimisation (NPV calculation): 90–95%. Cash flow projection (based on historical cash flow timing): 70–80%. Payment timing prediction (vendor behaviour variability): 65–75%. Overall projection confidence: 75–80% for 30-day, 65–70% for 60-day, 55–60% for 90-day |
| **Output** | CashFlowProjection with dailyOutflows[], discountOpportunities[], cashConstraintDates[], confidenceInterval, whatIfScenarios[] |
| **Explainability** | "Cash flow projection: 90-day outlook. Total payables: $2,450,890.00 across 847 approved invoices. Daily average: $27,232.00. Discount opportunities: 23 invoices with early payment discounts (total benefit: $24,500.00). Recommended timing: Pay 14 invoices on day 1 (capture $12,400 in discounts, NPV positive after cash cost). Cash constraint projected on day 47 (outflows $189,000 vs minimum balance $150,000). Recommendation: Defer 3 non-urgent invoices by 5 days to avoid cash call." |
| **Human Action** | Review projection; accept or modify batch timing; override discount priority; approve cash constraint mitigation (delay batch, request AR acceleration, arrange financing); provide override reason |
| **Performance Target** | 30-day forecast accuracy > 85%; discount capture rate > 80%; processing time < 5s; [HYPOTHESIS — targets to be validated with real data] |
| **Audit** | Log every projection (parameters, output, confidence) + every Treasury decision (batch composition, timing, override reason, TreasuryManagerId, timestamp) |
| **Evidence** | **[HYPOTHESIS]** — No direct customer evidence for cash flow prediction. E3 (Ayman Shawky: "ML-based cash flow predictions" expressed interest, but not validated). E10 (Mahmoud Shaker: FP&A interest). Infer from T4 (real-time cash visibility is expected, 2 sources). Must be validated before production deployment. |

### 3.7 AP-AI-07: Vendor Risk Scoring

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-07 |
| **Stage** | 5 — AI Context Building |
| **Capability** | Score vendor risk based on payment history, dispute history, ageing, and operational factors |
| **Input** | Vendor master record, payment history (24 months), dispute records, ageing report, D&B/credit score (if available), invoice volume trends |
| **Processing** | Compute composite risk score from weighted factors: payment reliability (30%) — percentage of invoices paid on time; dispute history (20%) — frequency and severity of disputes; ageing (20%) — current AR balance and days outstanding; credit score (15%) — external credit data (if available); invoice volume stability (10%) — variance in monthly invoicing; relationship tenure (5%) — years as active vendor |
| **Can Do** | Score vendor risk 0–100 with factor breakdown; show trend (risk improving/declining over 12 months); flag score changes > 10 points in 30 days; compare vendor to peers in same category; show risk factors in order of contribution to score |
| **Cannot Do** | Recommend vendor disqualification; block invoice processing based on score alone; share score externally (internal use only); make automated decisions based on score |
| **Must Do** | Show score (0–100) with colour band (green 0–30, amber 31–60, red 61–100); show factor breakdown as horizontal bar chart (each factor's contribution to score); show 12-month trend line (mini sparkline); show comparable vendors in same category (avg score, range); show alert if score changed > 10 points in 30 days |
| **Confidence Model** | Deterministic factors (payment history, ageing): 95% confidence. Credit score integration: depends on data source availability. Overall composite: 85–90% confidence |
| **Output** | VendorRiskScore with score (0–100), factors[], trend (IMPROVING / DECLINING / STABLE), factorContributions[], peerComparison, alerts[] |
| **Explainability** | "Vendor risk score: 18/100 (Low Risk). Breakdown: Payment reliability (30% weight) — 5/30 (98% on-time payments, 47 of 48 invoices paid within terms). Dispute history (20% weight) — 2/20 (1 dispute in 24 months, resolved in vendor's favour). Ageing (20% weight) — 4/20 (current balance $12,000, no overdue items). Credit score (15% weight) — 3/15 (D&B 78/100, stable). Invoice volume (10% weight) — 2/10 (steady monthly volume, CV 12%). Tenure (5% weight) — 2/5 (active 8 years). Trend: Stable (no change > 5 points in 12 months). Peers in same category: avg 32, range 8–67." |
| **Human Action** | Interpret score; use as input to approval decision; override score if business context differs (e.g., vendor is strategic despite moderate risk); flag vendor for review if score crosses threshold |
| **Performance Target** | Score correlation with actual payment issues (R-squared > 0.7); processing time < 1s; recalculation cadence: real-time (event-driven) |
| **Audit** | Log every score calculation (score, factors, versions, timestamp) + every human override (original score, override reason, userId, timestamp) |
| **Evidence** | **[HYPOTHESIS]** — Industry pattern, no direct customer evidence. E6 (Khaleel Ur Rehman: Finance Manager interest in risk assessment implicit). E7 (Ahmed Orabi: AP/P2P risk management inferred). Must be validated before production deployment. |

### 3.8 AP-AI-08: Audit Trail Analysis

| Field | Specification |
|-------|--------------|
| **ID** | AP-AI-08 |
| **Stage** | 10 — Audit & Reconciliation |
| **Capability** | Automated audit trail reconstruction, gap detection, and integrity verification |
| **Input** | Complete transaction log for invoice lifecycle, event store (63 domain events), human action log, AI action log, external confirmations (bank statements, GRN timestamps) |
| **Processing** | Chronological reconstruction of every action taken on an invoice from capture to close; checksum verification (SHA-256 chain of event hashes to detect tampering); gap detection (find missing required events in sequence); SLA compliance check (measured vs expected duration per stage); anomaly detection in audit patterns (unusual access times, bulk operations outside business hours) |
| **Can Do** | Reconstruct complete chronological timeline for any invoice; verify checksum integrity of event chain; detect missing events (e.g., invoice went from CAPTURED to APPROVED without MATCHED); flag out-of-sequence operations; measure SLA compliance per stage per approver; detect anomalous audit patterns |
| **Cannot Do** | Modify audit records (append-only enforced at database level); delete any audit entry; override checksum failures; make compliance determinations (flag for human review, never rule) |
| **Must Do** | Show complete timeline with visual state indicators (green = on-time, amber = borderline, red = SLA breach); show checksum chain with verification status per block; flag gaps with red annotation and explanation; show comparison to expected workflow path (happy path vs actual); export audit package as PDF for auditor review |
| **Output** | AuditReport with eventTimeline[], checksumChain[], gapAnalysis[], slaCompliance[], anomalyFlags[], exportPackage |
| **Explainability** | "Audit trail for INV-2026-0451: 23 events across 10 stages. Checksum: VALID (SHA-256: a3f5b1... — matches stored hash). Timeline: CAPTURED → VALIDATED (0.3h, on SLA) → MATCHED (2.1h, on SLA) → APPROVED (6.5h, on SLA — 3 approvers completed within thresholds) → PAYMENT_SCHEDULED (1.2h) → PAID (4.0h, batch processing) → RECONCILED (0.5h). Total: 14.6 hours. SLA compliance: 100% (all stages within targets). No anomalous patterns detected. Certificate of audit integrity generated." |
| **Human Action** | Review gaps and anomalies flagged by AI; confirm or dispute SLA breach classification; export audit package for external auditor; close audit with certification |
| **Performance Target** | Detection rate: 100% of checksum failures; false positive rate for anomaly detection < 2%; processing time < 2s per invoice; zero missed gaps (100% recall on missing events) |
| **Audit** | (Meta-audit) Log every audit report generation (parameters, output, flags, who reviewed, timestamp). Audit of the audit system is performed quarterly by external firm |
| **Evidence** | VP4 (Every Action Is Auditable — constitutional); T5 (month-end close preparation — 3 sources); E5 (Mohamed Gamal: manual reconciliation pain → audit trail automation) |

---

## 4. Confidence Model

### 4.1 Confidence Scoring Scale

Every AI output carries a confidence score on a 1–5 scale. This is the universal confidence language displayed to all users.

| Level | Score | Label | Display Colour | Meaning | Action Required |
|-------|-------|-------|---------------|---------|-----------------|
| 5 | 90–100% | Very High | Green badge | AI is highly confident. Multiple strong signals, consistent evidence. | Human can approve quickly; low risk |
| 4 | 70–89% | High | Green-tinted badge | AI is confident. Converging evidence, some minor uncertainty. | Human should review but likely agree |
| 3 | 50–69% | Moderate | Amber/yellow badge | AI is moderately confident. Mixed signals or incomplete evidence. | Human should review carefully |
| 2 | 20–49% | Low | Orange badge | AI is uncertain. Weak signals, conflicting evidence, or data gaps. | Human should investigate independently |
| 1 | 0–19% | Very Low | Red badge | AI is guessing. Insufficient data or contradictory signals. Ignore recommendation. | Human should decide based on own judgement |

### 4.2 Confidence Calculation

Confidence is calculated per-AI-capability using a weighted combination of:

1. **Model certainty** (40%) — How confident the ML model is in its prediction (softmax probability, ensemble agreement)
2. **Evidence quality** (30%) — How complete and reliable the input data is (OCR confidence, source availability, data freshness)
3. **Historical accuracy** (20%) — How accurate this capability has been for this entity/vendor in the past (lookback: 90 days)
4. **Context strength** (10%) — How much supporting context is available (cross-references, alternative sources, consistency checks)

### 4.3 Display Rules

- Confidence score is **always** displayed alongside any AI output — never hidden, never rounded to 100%
- Score displayed as label + colour band (e.g., "High · 87%") — both numeric and semantic
- When confidence is Level 3 (Moderate) or below, system displays a contextual warning banner
- When confidence is Level 1 (Very Low), the AI output is visually muted (reduced opacity, dashed border) and the user message reads: "AI confidence very low — please decide independently"
- Confidence trend arrow (↑ stable ↓) shown if score has changed > 10 points from this capability's average for this entity

### 4.4 Confidence Degradation

Confidence naturally degrades over time as data ages:

| Data Age | Degradation | Display Note |
|----------|-------------|--------------|
| < 1 hour | None | — |
| 1–24 hours | −5% | "Data: recent" |
| 24–72 hours | −15% | "Data: 1–3 days old" |
| 3–7 days | −30% | "Data: 3–7 days old" |
| > 7 days | −50% | "Data: > 7 days — stale, refresh recommended" |

---

## 5. Explainability

### 5.1 The Explainability Contract

Every AI output must answer five questions. No AI action is presented to a human until all five are answerable.

1. **What was found?** — The AI output in plain language
2. **Why is this relevant?** — What business context makes this output important
3. **What evidence supports this?** — Links to source data, calculations, and historical patterns
4. **How confident are we?** — Numeric score + semantic label + factor breakdown
5. **What happens if ignored?** — Consequence of accepting vs rejecting vs ignoring the recommendation

### 5.2 Explainability Format (Canonical)

```
AI RECOMMENDATION: [Action] [Entity]
CONFIDENCE: [Level] · [Score]%

WHAT WAS FOUND:
- [Finding 1 with supporting evidence citation]
- [Finding 2 with supporting evidence citation]
- [Finding 3 with supporting evidence citation]

WHY THIS MATTERS:
- [Business context — what this means for the user's decision]

BASED ON:
- [Data source 1]: [value] ([confidence])
- [Data source 2]: [value] ([confidence])
- [Data source 3]: [value] ([confidence])

HISTORICAL CONTEXT:
- This pattern has occurred [N] times in the last [period]
- [N%] of similar cases resulted in [outcome]
- Counter-evidence: [if any, what contradicts this recommendation]

IF IGNORED:
- [Consequence of not acting on this recommendation]
- [Consequence of rejecting this recommendation]
```

### 5.3 Explainability Requirements

1. Every recommendation includes a reasoning chain (not just a score)
2. Every data source is cited (document name, ID, field, timestamp)
3. Historical accuracy is provided (how often has this pattern been correct?)
4. Counter-evidence is surfaced if it exists (what contradicts this recommendation?)
5. Explainability is rendered in the UI as collapsible sections — never hidden behind a secondary click
6. The explainability view has a "Copy as text" button for audit documentation

---

## 6. Human-in-the-Loop

### 6.1 Trigger Conditions

| Condition | AI Action | Human Required | SLA |
|-----------|-----------|---------------|-----|
| Confidence < 85% on any field | AP-AI-01 (Extraction) | AP Clerk review | 4 hours |
| Fuzzy vendor match (< 95%) | AP-AI-01 (Extraction) | AP Clerk confirm | 2 hours |
| Duplicate probability > 80% | AP-AI-03 (Duplicate) | AP Clerk confirm | 2 hours |
| Any exception raised | AP-AI-02 (Match) | AP Clerk/Manager resolve | SLA per severity |
| Recommendation (APPROVE/REVIEW/REJECT) | AP-AI-07 (Risk) | Role-based approver | 48 hours |
| GL coding confidence < 80% | AP-AI-05 (Coding) | Controller confirm | Month-end |
| Payment batch proposal | AP-AI-06 (Cash Flow) | Treasury Manager approve | 24 hours |
| Any anomaly > HIGH severity | AP-AI-04 (Anomaly) | AP Manager investigate | 4 hours |
| Audit trail gap detected | AP-AI-08 (Audit) | Controller review | 48 hours |
| First-time AI override on same entity | All | Secondary review by lead | 24 hours |
| AI override rate > 25% in 7 days | All | System alerts AI governance board | Weekly review |

### 6.2 Notification Channels

| Priority | Channel | Format | Target |
|----------|---------|--------|--------|
| Critical (SLA breach imminent) | In-app alert + email + mobile push | "ACTION REQUIRED: Invoice INV-2026-0451 will breach SLA in 2 hours" | Direct assignee |
| High (requires action) | In-app alert + email | "Review required: Exception on invoice INV-2026-0451" | Queue owner |
| Medium (awareness) | In-app notification only | "AI recommendation ready: 12 invoices ready for approval" | Role-based queue |
| Low (information) | In-app badge count | Sidebar badge: "3" pending AI-reviewed items | Optional |

### 6.3 Response Time SLAs

| Action Type | Target | Breach | Escalation |
|-------------|--------|-------|------------|
| Confirm extraction (low confidence) | 4 hours | > 4h | Routes to AP Manager |
| Resolve exception (CRITICAL) | 1 hour | > 1h | Routes to AP Manager + Controller |
| Resolve exception (HIGH) | 4 hours | > 4h | Routes to AP Manager |
| Resolve exception (MEDIUM) | 24 hours | > 24h | Routes to AP Manager |
| Approve invoice (standard) | 48 hours | > 48h | Routes to next-level approver |
| Approve invoice (high-value > $50K) | 12 hours | > 12h | Controller notified |
| Confirm GL coding | Month-end close | > close date | Controller escalated |
| Treasury approve batch | 24 hours | > 24h | CFO notified |
| Investigate anomaly (CRITICAL) | 1 hour | > 1h | Controller + Legal notified |
| Close audit review | 48 hours | > 48h | External auditor notified |

### 6.4 Escalation Paths

```
Level 0: AP Clerk — routine confirmations, exception resolution
  → Level 1: AP Manager — exception review, override decisions, SLA breaches
    → Level 2: Controller — compliance decisions, audit sign-off, policy exceptions
      → Level 3: CFO — strategic decisions, high-value approvals (> $250K), policy changes
        → Level 4: Board — extraordinary decisions (> $1M), new vendor categories, policy overrides
```

---

## 7. Audit Requirements

### 7.1 AI Audit Record Schema

Every AI action generates an immutable audit record:

```typescript
interface AIAuditRecord {
  id: string;                     // Unique record ID
  companyId: string;              // Tenant isolation
  timestamp: Date;                // When AI action occurred
  capability: string;             // AP-AI-01 through AP-AI-08
  actionType: string;             // 'extraction' | 'matching' | 'classification' | 'prediction' | 'suggestion'
  entityType: string;             // 'invoice' | 'payment' | 'vendor' | 'exception'
  entityId: string;               // Entity identifier
  inputHash: string;              // SHA-256 of input data
  inputData: Record<string, unknown>;  // Input features (truncated at 10KB in DB, full in blob storage)
  outputData: Record<string, unknown>; // AI output
  confidence: number;             // 0–100
  modelVersion: string;           // Semantic version of AI model
  processingTimeMs: number;       // Latency
  humanAction: 'accepted' | 'rejected' | 'modified' | 'ignored' | 'no_action_taken';
  humanActionDetail: string;      // Reason for action
  humanUserId: string | null;     // Who acted (null if no action yet)
  humanActionTimestamp: Date | null;
  overrideChain: AIAuditRecord[]; // Linked records for cascading overrides
}
```

### 7.2 Audit Trail Rules

1. AI audit records are **append-only** — no updates, no deletes, no soft-deletes (enforced at database trigger level)
2. Input data hash is stored for reproducibility — full input stored in blob storage (30-day retention hot, 7-year retention cold)
3. Model version is recorded for every action — enables reproducibility and model regression analysis
4. Human actions are linked to the original AI action via foreign key (never orphaned)
5. Override chains are fully traceable — every override links to the original AI recommendation
6. Audit records are searchable by: capability, entity type, entity ID, date range, confidence band, human action, user ID
7. Audit records are retained for 7 years (regulatory minimum for financial transactions in most jurisdictions)
8. Monthly AI audit package: all AI actions for the month, aggregated by capability, with performance metrics
9. Quarterly AI audit: random sample of 100 AI actions manually verified by external auditor

### 7.3 Checksum Chain

Every audit record in the chain includes the SHA-256 hash of the previous record, forming a tamper-evident blockchain:

```typescript
interface AuditBlock {
  index: number;
  previousHash: string;
  timestamp: Date;
  data: AIAuditRecord;
  hash: string;
}
```

The current chain hash is displayed on the audit dashboard and can be independently verified by external auditors.

---

## 8. Failure Modes

### 8.1 Low Confidence Fallback

| Confidence Level | Behaviour | UX Treatment |
|-----------------|-----------|-------------|
| 70–100% (Level 4–5) | Standard processing | No fallback needed |
| 50–69% (Level 3) | Route to human with warning | Yellow banner: "AI confidence is moderate — please verify" |
| 20–49% (Level 2) | Route to human as suggestion only | Orange banner: "AI confidence is low — please review independently." Output visually muted (dashed border) |
| 0–19% (Level 1) | Do not present recommendation | Red banner: "AI unable to process with sufficient confidence. Manual processing required." Output hidden, manual form displayed instead |

### 8.2 Model Unavailable Fallback

| Failure | Detection | Response | Recovery |
|---------|-----------|----------|----------|
| Model timeout (> 5s) | Latency monitoring | Fall back to rule-based processing (non-AI) | Retry model on next request; alert operations after 3 consecutive timeouts |
| Model returns error | HTTP error code | Fall back to manual processing queue | Log error, alert AI platform team, retry with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s) |
| Provider unavailable | Health check failure | Route to secondary provider (if available) or fall back to rule-based | Circuit breaker opens after 5 failures (30s cooldown); alert on-call engineer |
| Model returns garbage (confidence < 10%) | Confidence filter | Treat as Low confidence fallback (Level 1) | Log for model retraining, alert ML team |
| Data quality insufficient (< 3 data points) | Data quality check | Skip AI processing, route to manual | Flag insufficient data to user; log for data quality monitoring |

### 8.3 Data Quality Fallback

| Data Quality Issue | Detection | Fallback |
|--------------------|-----------|----------|
| Missing vendor history | Less than 3 invoices in system | Skip vendor risk scoring; route all invoices for manual review |
| OCR confidence < 50% | Per-field threshold | Route to manual data entry; do not present extracted data to downstream AI |
| PO not in system | PO number on invoice but no match in procurement | Flag as evidence gap; do attempt partial match (invoice vs GRN only) |
| GRN not received | Goods receipt not yet recorded | Flag as EVIDENCE_GAP; route to AP Clerk for goods receipt verification |
| Conflicting data sources | Invoice amount ≠ PO amount ≠ GRN amount (all three different) | Surface all three values; do not attempt to reconcile; flag for human investigation |

### 8.4 Failure SLAs

| Failure Type | Detection SLA | Resolution SLA | Owner |
|-------------|---------------|----------------|-------|
| OCR failure | Immediate (< 1s) | 4 hours (manual review) | AP Clerk |
| Match failure | Immediate (< 1s) | 2 hours (manual match) | AP Clerk |
| Recommendation failure | Immediate (< 1s) | 1 hour (manual decision) | Role-based approver |
| Model timeout | 5s (threshold) | 15 minutes (fallback to rule-based) | AI Platform Team |
| Provider unavailable | 30s (health check) | 30 minutes (failover or recovery) | AI Platform Team |
| Data quality insufficient | Immediate (< 1s) | N/A (flag and continue) | System |
| Audit chain integrity failure | Immediate (checksum mismatch) | 1 hour (investigate and verify) | Controller + Security |

---

## 9. Performance Metrics

### 9.1 Accuracy Targets

| Metric | Target (30-day) | Target (90-day) | Target (180-day) | Measurement |
|--------|-----------------|-----------------|-------------------|-------------|
| OCR field accuracy | > 92% | > 94% | > 95% | Correct / total extracted fields |
| OCR document accuracy | > 88% | > 90% | > 92% | All fields correct / total documents |
| Match rate (auto-matched) | > 65% | > 75% | > 85% | Matched / total invoices (excluding exceptions) |
| Match accuracy (correct verdict) | > 96% | > 98% | > 99% | Correct match / total matches |
| Duplicate detection precision | > 88% | > 90% | > 92% | True positives / (true + false positives) |
| Duplicate detection recall | > 97% | > 98% | > 99% | True positives / (true + false negatives) |
| GL coding top-1 accuracy | > 80% | > 83% | > 85% | Correct top suggestion / total suggestions |
| GL coding top-3 accuracy | > 92% | > 94% | > 95% | Correct in top 3 / total suggestions |
| Recommendation accuracy | > 82% | > 85% | > 88% | Human agreed with AI / total recommendations |
| Risk score calibration (R²) | > 0.65 | > 0.70 | > 0.75 | Correlation between predicted risk and actual outcome |

### 9.2 Latency SLAs

| Capability | SLA (p50) | SLA (p95) | SLA (p99) |
|-----------|-----------|-----------|-----------|
| OCR extraction (single page) | < 2s | < 4s | < 8s |
| OCR extraction (multi-page, 5 pages) | < 6s | < 12s | < 20s |
| Vendor matching | < 500ms | < 1s | < 2s |
| Duplicate detection | < 1s | < 2s | < 3s |
| Three-way match (10 lines) | < 2s | < 4s | < 6s |
| Anomaly detection (per invoice) | < 500ms | < 1s | < 2s |
| GL coding suggestion (10 lines) | < 1s | < 2s | < 4s |
| Risk scoring | < 500ms | < 1s | < 2s |
| Cash flow projection (90 days) | < 5s | < 10s | < 15s |
| Audit trail analysis | < 2s | < 4s | < 8s |
| Recommendation generation | < 2s | < 5s | < 10s |

### 9.3 Coverage Targets

| Capability | Target Coverage | Exclusions |
|-----------|-----------------|------------|
| OCR extraction | > 99% of invoice submissions | Handwritten invoices (flag for manual) |
| Vendor matching | 100% of vendor fields on invoice | New vendors with zero record |
| Duplicate detection | 100% of incoming invoices | — |
| Three-way match | 100% where PO + GRN exist | EVIDENCE_GAP handled explicitly |
| Anomaly detection | 100% of invoice lifecycle | — |
| GL coding | > 95% of line items | Novel item types (explicitly flagged) |
| Risk scoring | 100% of active vendors | New vendors (< 3 invoices) |
| Cash flow prediction | 100% of approved invoices | [HYPOTHESIS] |
| Audit trail analysis | 100% of closed invoices | — |

### 9.4 Override Rate Targets

| Capability | Target Override Rate | Alert Threshold |
|-----------|---------------------|-----------------|
| OCR fields | < 8% | > 15% |
| Duplicate detection | < 5% | > 10% |
| Match verdict | < 5% | > 10% |
| GL coding | < 15% | > 25% |
| Recommendation | < 15% | > 25% |
| Risk score | < 10% | > 20% |

Override rates above alert threshold trigger automated review by AI Governance Board.

---

## 10. Relationship to Other Documents

| Type | Document | Description |
|------|----------|-------------|
| Authority | [[PLATFORM_CONSTITUTION]] | Highest engineering authority — AI must comply |
| Product | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master product spec — this document is the AI chapter |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | 10-stage workflow this AI supports |
| Design | [[DESIGN_SYSTEM_GUIDE]] | UI patterns for AI explainability and confidence display |
| Architecture | `docs/ap/AP_DOMAIN_ARCHITECTURE.md` | Domain model AI integrates with |
| Architecture | `docs/ap/AP_INTEGRATION_ARCHITECTURE.md` | AI integration points with 10 platform services |
| Architecture | `docs/platform/AI_PLATFORM.md` | Perionyx AI Platform capability contract |
| Architecture | `src/server/foundation/provider-runtime/` | Provider driver model for AI inference |
| Evidence | `brain/03-Customer Intelligence/` | Customer discovery source data |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | P5: AI Must Explain, P10: Trust Through Evidence |

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[PLATFORM_CONSTITUTION]] | AI must comply with constitutional laws |
| Product | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | Master spec — AI contract for AP |
| Design | [[DESIGN_SYSTEM_GUIDE]] | UI patterns for AI explainability |
| Workflow | [[REFERENCE_WORKFLOW_AP]] | 10-stage workflow AI supports |
| Principles | [[PERIONYX_PRODUCT_PRINCIPLES]] | P5, P10 govern AI behaviour |

---

## Version History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Phase 27.1 — AI Behaviour Guide for AP Reference Workflow | Product + AI Platform Teams |
