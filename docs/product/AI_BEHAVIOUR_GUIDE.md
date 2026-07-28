# AI Behaviour Guide — AP Workflow

> Phase 27.0A — Enterprise Product Architecture & Workflow Design
> Version: 1.0 | Date: 2026-07-28
> Authority: Product Architecture Board
> Classification: Internal — Engineering & Product

---

## 1. Purpose

This document defines **exactly what AI can and cannot do** in the AP workflow. It is the contract between the AI system and the humans who trust it. Every AI action must be explainable, auditable, and overridable.

### The AI Promise

1. AI **collects evidence** so you don't have to.
2. AI **explains discrepancies** so you don't have to investigate.
3. AI **highlights anomalies** so you don't have to search.
4. AI **recommends actions** so you don't have to start from scratch.
5. AI **prioritises work** so you don't have to figure out what's urgent.
6. AI **NEVER decides for you**. You decide. AI prepares.

### Design Principles

1. **AI augments human judgement, never replaces it** — no autonomous approvals, no autonomous payments
2. **Every AI output has a confidence score** — you decide how much to trust it
3. **Every AI output is explainable** — it must answer: Why? Based on what? How confident?
4. **Every AI output is overridable** — humans can reject any recommendation with a reason
5. **Every AI action is logged** — full audit trail of reasoning, inputs, and outputs
6. **AI fails gracefully** — when uncertain, it falls back to manual processing, not guesses

---

## 2. AI Permission Matrix

### What AI CAN Do

| Capability | Stage | Description | Human Required? |
|-----------|-------|-------------|-----------------|
| OCR field extraction | 1 | Extract text from invoice PDFs/images | Review if confidence < 85% |
| Vendor matching | 1 | Match invoice to existing vendor records | Confirm if fuzzy match |
| Duplicate detection | 1 | Identify potential duplicate invoices | Review flagged duplicates |
| Evidence collection | 2 | Link PO, GRN, contract to invoice | No (automated) |
| Three-way matching | 3 | Compare invoice vs PO vs GRN | Override match with reason |
| Variance analysis | 3 | Calculate and classify variances | No (automated) |
| Exception classification | 4 | Classify exception type and severity | Review classification |
| Root cause analysis | 4 | Identify why exception occurred | Confirm diagnosis |
| Resolution suggestion | 4 | Suggest resolution based on history | Choose resolution |
| Risk scoring | 5 | Score invoice risk (0-100) | Interpret score |
| Recommendation generation | 5 | Recommend approve/review/reject | Make final decision |
| Evidence summarisation | 5 | Summarise evidence in plain language | Read and evaluate |
| Comparable analysis | 5 | Find similar historical invoices | Interpret relevance |
| Budget impact projection | 5 | Project cash flow impact of approval | Assess affordability |
| Approval routing | 6-7 | Route to correct approver | Approve or reject |
| Payment optimisation | 8 | Optimise batch timing and discount capture | Approve proposal |
| Payment failure diagnosis | 9 | Diagnose why payment failed | Decide action |
| GL auto-coding | 10 | Suggest GL account codes | Confirm coding |
| Reconciliation matching | 10 | Match bank statement to payments | Review exceptions |
| Anomaly detection | All | Flag unusual patterns across all stages | Investigate flagged items |
| SLA monitoring | All | Track and predict SLA compliance | Act on breaches |
| Work prioritisation | All | Rank tasks by urgency and impact | Accept or override ranking |

### What AI CANNOT Do

| Restriction | Stage | Reason | Fallback |
|------------|-------|--------|----------|
| Approve invoices | 7 | Legal authority requires human decision | Route to human approver |
| Execute payments | 9 | Financial authority requires human decision | Route to Treasury Manager |
| Override approval thresholds | 7 | Compliance and SoD controls | Block override, log attempt |
| Modify vendor banking details | 1-9 | Fraud prevention | Route to AP Manager |
| Delete audit records | 10 | Tamper-evident audit trail | Block deletion, log attempt |
| Skip approval levels | 7 | Compliance and authority controls | Block skip, log attempt |
| Process payments without approval | 9 | Unauthorised disbursement | Block execution, log attempt |
| Modify tolerance rules | 3 | Control integrity | Route to AP Manager |
| Interpret company policy | All | Policy interpretation requires human judgement | Flag for human review |
| Make legal determinations | All | Legal decisions require qualified professionals | Route to legal/compliance |
| Access external systems without audit | All | Security and compliance | Log all external access |
| Make decisions without evidence | All | Accountability requires evidence | Flag insufficient evidence |

---

## 3. AI at Each Stage

### Stage 1: Invoice Received

**AI Capability**: OCR Field Extraction

| Field | Detail |
|-------|--------|
| **Input** | Invoice PDF/image, email body, EDI payload |
| **Processing** | Extract vendor name, invoice number, date, amounts, line items, tax, banking details using trained OCR model |
| **Output** | Structured invoice data with confidence scores per field |
| **Confidence** | Per-field confidence (0-100%). Overall confidence = weighted average. Threshold: 85% for auto-accept, < 85% requires human review |
| **Explainability** | "Field 'amount' extracted as $12,450.00 with 94% confidence. Source: page 1, line 3, bold text. Alternative interpretations: $12,450.00 (94%), $12,450.06 (3%), $12,450.08 (2%)" |
| **Human Action** | Review fields with confidence < 85%. Confirm or correct extracted values. |

**AI Capability**: Vendor Matching

| Field | Detail |
|-------|--------|
| **Input** | Extracted vendor name, email domain, tax ID |
| **Processing** | Fuzzy match against vendor master using Levenshtein distance, email domain lookup, tax ID exact match |
| **Output** | Matched vendor record (confidence 0-100%) or "new vendor" flag |
| **Confidence** | Exact match (tax ID): 100%. Fuzzy match (name): 70-95%. Domain match: 60-85%. No match: 0% |
| **Explainability** | "Vendor matched: [Acme Corp] (confidence: 92%). Match basis: email domain 'acme.com' matches vendor record, name similarity 95%. Tax ID not on invoice." |
| **Human Action** | Confirm vendor match if confidence < 95%. Approve new vendor creation. |

**AI Capability**: Duplicate Detection

| Field | Detail |
|-------|--------|
| **Input** | Invoice number, vendor ID, amount, date, line items |
| **Processing** | Check against all existing invoices for same vendor. Exact duplicate: same number + amount. Near-duplicate: same vendor + similar amount (>90%) + same month |
| **Output** | Duplicate probability score (0-100%) with evidence |
| **Confidence** | Exact duplicate: 99%. Near-duplicate: 70-95%. No duplicate: < 5% |
| **Explainability** | "Potential duplicate detected (probability: 87%). Existing invoice INV-2025-089 from same vendor for $12,440.00 (difference: $10.00, 0.08%). Same date range. Review required." |
| **Human Action** | Review flagged duplicates. Confirm duplicate (void) or override (confirm unique). |

### Stage 2: Evidence Collection

**AI Capability**: Contract Clause Extraction

| Field | Detail |
|-------|--------|
| **Input** | Contract documents linked to vendor |
| **Processing** | Extract payment terms, discount percentages, pricing schedules, delivery terms using NLP |
| **Output** | Structured contract terms: payment terms (Net 30), discount (2/10 Net 30), pricing schedule |
| **Confidence** | Payment terms: 90-95%. Discount terms: 85-92%. Pricing schedule: 75-85%. Ambiguous terms: < 75% |
| **Explainability** | "Contract terms extracted: Payment terms 'Net 30 days from invoice date' (confidence: 94%). Early payment discount '2% if paid within 10 days' (confidence: 89%). Source: Section 4.2 of contract dated 2025-01-15." |
| **Human Action** | Confirm extracted terms if confidence < 90%. Flag ambiguous terms for legal review. |

### Stage 3: Three-Way Match

**AI Capability**: Anomaly Detection on Variance Patterns

| Field | Detail |
|-------|--------|
| **Input** | Match results, historical variance patterns, vendor behaviour |
| **Processing** | Detect patterns: vendor consistently over-invoices by 2%, specific line items always variance, seasonal patterns |
| **Output** | Pattern alerts with trend analysis |
| **Confidence** | Pattern detected: 70-90%. Trend confirmed: 80-95%. Anomaly: < 70% (needs investigation) |
| **Explainability** | "Pattern detected: Vendor [Acme] has invoiced above PO price in 8 of last 12 invoices (average 1.8% above). This invoice is 1.2% above PO. Consider reviewing vendor pricing agreement." |
| **Human Action** | Investigate patterns. Adjust tolerance rules if pattern is systemic. |

### Stage 4: Exception Detection

**AI Capability**: Root Cause Analysis

| Field | Detail |
|-------|--------|
| **Input** | Exception details, match results, vendor history, GRN status |
| **Processing** | Diagnose root cause from exception type, historical patterns, and contextual data |
| **Output** | Root cause classification with confidence, suggested resolution, similar historical exceptions |
| **Confidence** | Clear root cause: 80-95%. Probable root cause: 60-80%. Uncertain: < 60% |
| **Explainability** | "Root cause: Price variance (Invoice: $12,450, PO: $12,300, Variance: $150 / 1.2%). Diagnosis: PO was created before most recent price increase on 2026-06-01. Similar exceptions: 3 in last 6 months, all resolved by accepting invoice price. Suggested resolution: Accept invoice price, update PO pricing." |
| **Human Action** | Confirm or reject diagnosis. Choose resolution action. |

### Stage 5: AI Context Building

**AI Capability**: Risk Scoring

| Field | Detail |
|-------|--------|
| **Input** | Invoice data, evidence, vendor history, match results, budget data |
| **Processing** | Calculate composite risk score from weighted factors |
| **Output** | Risk score (0-100) with factor breakdown |
| **Confidence** | Score calculation: 90-95% (deterministic). Prediction accuracy: 75-85% (based on historical validation) |
| **Explainability** | "Risk score: 24/100 (Low). Breakdown: Vendor reliability 8/30 (good history), Price variance 3/25 (within tolerance), Match quality 5/20 (GREEN), Budget impact 4/15 (within budget), Payment timing 4/10 (standard terms). Overall: Low risk, recommend approval." |
| **Human Action** | Interpret risk score. Override recommendation if business context differs from AI assessment. |

**AI Capability**: Recommendation Generation

| Field | Detail |
|-------|--------|
| **Input** | Risk score, evidence package, approval matrix, historical patterns |
| **Processing** | Generate recommendation based on risk thresholds and historical approval patterns |
| **Output** | Recommendation (APPROVE / REVIEW / REJECT) with reasoning chain |
| **Confidence** | Recommendation confidence (0-100%). Threshold: > 80% for strong recommendation, 50-80% for suggestive, < 50% for uncertain |
| **Explainability** | "Recommendation: APPROVE (confidence: 87%). Reasoning: (1) Invoice matches PO-4521 with variance < 2%. (2) Vendor has 92% on-time payment history. (3) Amount within department budget. (4) No duplicate risk. (5) Similar invoices approved 15 times in last 6 months. Risk factors: None significant." |
| **Human Action** | Review recommendation and reasoning. Approve, reject, or escalate based on judgement. |

### Stage 6: Cross-Department Coordination

**AI Capability**: Route Optimisation

| Field | Detail |
|-------|--------|
| **Input** | Invoice category, amount, department mapping, historical routing, SLA data |
| **Processing** | Determine optimal routing based on required departments, availability, and SLA predictions |
| **Output** | Routing plan with predicted completion time |
| **Confidence** | Routing accuracy: 85-95%. SLA prediction: 70-80% |
| **Explainability** | "Routing plan: (1) Procurement — confirm PO (predicted: 4 hours). (2) Warehouse — confirm GRN (predicted: 8 hours). (3) Marketing — budget confirmation (predicted: 2 hours). Total predicted: 14 hours. SLA: 48 hours. Confidence: 82%." |
| **Human Action** | Approve routing plan. Override department assignment if needed. |

### Stage 7: Approval

**AI Capability**: Approval Pattern Analysis

| Field | Detail |
|-------|--------|
| **Input** | Approval chain, approver availability, historical approval times |
| **Processing** | Predict approval completion time, identify bottlenecks, suggest delegation if approver unavailable |
| **Output** | Predicted approval timeline with confidence |
| **Confidence** | Timeline prediction: 65-80%. Bottleneck detection: 75-85% |
| **Explainability** | "Approval prediction: 6 hours. Reasoning: Primary approver [Controller] average approval time: 4 hours. Backup approver [Deputy Controller] available. No delegation needed. Historical: 89% of similar invoices approved within 8 hours." |
| **Human Action** | Monitor prediction accuracy. Intervene if prediction significantly off. |

### Stage 8: Payment Readiness

**AI Capability**: Discount Optimisation

| Field | Detail |
|-------|--------|
| **Input** | Payment terms, discount windows, cash position, payment costs |
| **Processing** | Calculate NPV of early payment vs delayed payment, factoring in discount, cash cost, and bank fees |
| **Output** | Payment timing recommendation with NPV calculation |
| **Confidence** | NPV calculation: 90-95% (deterministic). Cash flow forecast: 70-80% |
| **Explainability** | "Payment optimisation: Pay within 10 days to capture 2% discount ($249.00). NPV benefit: $249.00 - $12.50 (bank fee) - $8.30 (opportunity cost of early cash outflow) = $228.20 net benefit. Recommendation: Pay on day 8." |
| **Human Action** | Approve or modify payment timing. Treasury Manager has final authority. |

### Stage 9: Payment

**AI Capability**: Payment Failure Diagnosis

| Field | Detail |
|-------|--------|
| **Input** | Payment failure response, bank error code, payment history |
| **Processing** | Diagnose failure cause from error code, historical patterns, and bank-specific rules |
| **Output** | Failure diagnosis with recommended action |
| **Confidence** | Error code interpretation: 85-95%. Recommended action: 70-85% |
| **Explainability** | "Payment failure: Error code 'INSUFFICIENT_FUNDS' from bank. Diagnosis: Account balance $45,200, payment amount $38,000, but $12,500 pending from another batch. Available: $32,700. Recommended action: Reschedule payment to tomorrow when AR collection of $25,000 is expected to clear." |
| **Human Action** | Confirm diagnosis. Decide action: retry, reschedule, manual wire, or investigate. |

### Stage 10: Audit Completion

**AI Capability**: GL Auto-Coding

| Field | Detail |
|-------|--------|
| **Input** | Invoice line items, vendor category, historical GL codes, chart of accounts |
| **Processing** | Match invoice items to GL accounts based on vendor category, item descriptions, and historical patterns |
| **Output** | Suggested GL account codes with confidence per line item |
| **Confidence** | Exact match (historical): 90-95%. Category match: 75-85%. No match: < 60% |
| **Explainability** | "GL coding suggestion: Line 1 'Cloud hosting services' -> Account 6120 (Software Subscriptions) confidence 94% (matched 23 prior invoices from this vendor to this account). Line 2 'Setup fee' -> Account 6120 (Software Subscriptions) confidence 78% (first time this item type, similar to training costs which use 6140)." |
| **Human Action** | Confirm or correct GL coding. Controller reviews at month-end. |

---

## 4. Confidence Scoring

### How Confidence is Calculated

Confidence scores are calculated per-AI-capability using a combination of:

1. **Model certainty** — How confident the ML model is in its prediction
2. **Evidence quality** — How complete and reliable the input data is
3. **Historical accuracy** — How accurate this capability has been in the past
4. **Context strength** — How much supporting context is available

### Confidence Levels

| Level | Score | Display | Meaning |
|-------|-------|---------|---------|
| High | 80-100% | Green | AI is very confident. Human should review but likely agree. |
| Medium | 50-79% | Yellow | AI is moderately confident. Human should review carefully. |
| Low | 20-49% | Orange | AI is uncertain. Human should investigate independently. |
| Very Low | 0-19% | Red | AI is guessing. Human should ignore AI suggestion and decide manually. |

### Display Rules

- Confidence score is **always** displayed alongside any AI output
- Confidence score is **never** hidden or rounded to 100%
- When confidence < 50%, the system displays: "AI is uncertain — please review independently"
- When confidence < 20%, the system displays: "AI confidence very low — manual review recommended"

---

## 5. Explainability

### The Explainability Contract

Every AI recommendation must answer three questions:

1. **Why?** — What is the reasoning behind this recommendation?
2. **Based on what?** — What data and evidence was used?
3. **How confident?** — How certain is the AI in this recommendation?

### Explainability Format

```
AI RECOMMENDATION: Approve invoice INV-2026-042
CONFIDENCE: 87% (High)

WHY:
- Invoice matches PO-4521 with variance < 2%
- Vendor has 92% on-time payment history
- Amount ($12,450) is within department budget ($45,000 remaining)
- No duplicate risk detected
- Similar invoices approved 15 times in last 6 months

BASED ON:
- Invoice data: OCR extraction (94% confidence)
- PO data: Exact match to PO-4521
- GRN: Received 3 days ago, quantities confirmed
- Vendor history: 47 invoices in last 12 months
- Budget: Marketing department, $45,000 remaining of $120,000 quarterly budget
- Comparable invoices: 15 similar invoices, all approved, average $11,800

HISTORY:
- This recommendation pattern has been correct 89% of the time
- 11 of 12 times this pattern appeared, the invoice was approved
- 1 time it was rejected (vendor had outstanding dispute)
```

### Explainability Requirements

1. Every recommendation includes a reasoning chain (not just a score)
2. Every data source is cited (which document, which record, which calculation)
3. Historical accuracy is provided (how often has this pattern been correct?)
4. Counter-evidence is included if it exists (what might contradict this recommendation?)

---

## 6. Human Override

### Override Mechanism

Every AI recommendation can be overridden by a human with the required authority. Override is recorded in the audit trail.

### Override Process

1. Human reviews AI recommendation and reasoning
2. Human decides to override (disagrees with recommendation)
3. Human provides a reason for the override (mandatory, free-text)
4. System records: original AI recommendation, override decision, override reason, human identity, timestamp
5. Workflow continues with the human decision

### Override Audit Record

```typescript
interface AIOverrideRecord {
  id: string;
  companyId: string;
  entityType: 'invoice' | 'payment' | 'exception';
  entityId: string;
  aiCapability: string;       // e.g., 'risk_scoring', 'recommendation'
  aiRecommendation: string;   // e.g., 'APPROVE'
  aiConfidence: number;       // e.g., 87
  humanDecision: string;      // e.g., 'REJECT'
  humanReason: string;        // Free-text, mandatory
  humanId: string;
  humanRole: string;
  timestamp: Date;
}
```

### Override Rules

| Rule | Description |
|------|-------------|
| Reason mandatory | Override without reason is blocked |
| Authority required | Override must come from user with required role |
| Logged immutably | Override record cannot be deleted or modified |
| AI learns | Override data used to improve future recommendations |
| No penalty | Overrides are not penalised — they are expected |

---

## 7. AI Limitations

### What AI Cannot Do

1. **Interpret company policy** — Policies are legal documents requiring human interpretation
2. **Make legal determinations** — Compliance, regulatory, and legal decisions require qualified professionals
3. **Understand context beyond data** — AI cannot know about personal relationships, office politics, or strategic considerations
4. **Predict black swan events** — AI cannot predict unprecedented events (pandemic, market crash, vendor fraud)
5. **Replace domain expertise** — AI cannot replace the intuition of an experienced AP Manager or Controller
6. **Make ethical judgements** — Ethical decisions require human moral reasoning
7. **Understand cultural nuance** — Payment timing, vendor relationships, and approval norms vary by culture
8. **Handle incomplete data gracefully** — AI may be confidently wrong when data is missing

### When AI Should Not Be Used

| Situation | Reason | Action |
|-----------|--------|--------|
| New vendor with no history | No historical data for pattern matching | Manual review |
| Amount > $500K | High-value decisions require human judgement | Manual review + dual approval |
| Novel exception type | AI has not seen this pattern before | Manual investigation |
| Legal/compliance query | Requires legal expertise | Route to legal team |
| Vendor dispute | Requires negotiation and relationship management | Route to AP Manager |
| Policy interpretation | Requires understanding of intent, not just text | Route to Controller |

---

## 8. AI Failure Modes

### Failure Detection

| Failure Mode | Detection Method | Response |
|-------------|-----------------|----------|
| OCR misread | Confidence threshold < 85% | Route to human review |
| Wrong vendor match | Confidence threshold < 95% | Confirm with human |
| False duplicate alert | Human overrides duplicate flag | Record override, improve model |
| Incorrect root cause | Human provides different resolution | Record correction, retrain |
| Risk score miscalibrated | Approval outcome differs from prediction | Recalibrate weights |
| Recommendation wrong | Human overrides recommendation | Record override, analyse pattern |
| GL coding wrong | Controller corrects at month-end | Record correction, retrain |

### Fallback Behaviour

When AI is uncertain or fails:

1. **Low confidence** (< 50%): Display warning, route to manual processing
2. **System error**: Log error, fall back to manual workflow, alert operations
3. **Model timeout**: Fall back to rule-based processing (non-AI)
4. **Data missing**: Flag insufficient data, request human intervention
5. **Contradictory signals**: Surface all signals to human, do not attempt to resolve

### Failure SLA

| Failure Type | Detection SLA | Resolution SLA |
|-------------|---------------|----------------|
| OCR failure | Immediate | 4 hours (manual review) |
| Match failure | Immediate | 2 hours (manual match) |
| Recommendation failure | Immediate | 1 hour (manual decision) |
| System error | Immediate | 30 minutes (fallback + alert) |

---

## 9. AI Ethics

### Bias Detection

1. **Vendor bias**: AI must not systematically recommend against specific vendors based on name, origin, or size
2. **Amount bias**: AI must not systematically recommend differently based on invoice amount alone (beyond threshold rules)
3. **Temporal bias**: AI must not penalise vendors for seasonal variations
4. **Historical bias**: AI must not perpetuate past human biases (e.g., always rejecting a specific vendor category)

### Fairness Requirements

1. Recommendations are based on invoice data and evidence, not vendor demographics
2. Risk scores use objective financial metrics, not subjective assessments
3. Approval routing is based on authority and availability, not personal preferences
4. AI must not favour specific payment methods beyond cash-flow optimisation

### Transparency

1. AI models used in the AP workflow are documented (model type, training data, accuracy metrics)
2. AI decision factors are disclosed to users
3. AI limitations are documented and communicated to users
4. AI errors are tracked and reported in monthly AI performance reviews

---

## 10. AI Audit Trail

### What is Logged

Every AI action generates an audit record:

```typescript
interface AIAuditRecord {
  id: string;
  companyId: string;
  timestamp: Date;
  capability: string;           // e.g., 'ocr_extraction', 'risk_scoring'
  entityType: string;           // e.g., 'invoice', 'payment'
  entityId: string;
  inputHash: string;            // SHA-256 of input data
  inputData: Record<string, unknown>;  // Input features
  outputData: Record<string, unknown>; // AI output
  confidence: number;
  modelVersion: string;
  processingTimeMs: number;
  humanOverride: boolean;
  overrideReason?: string;
  overrideBy?: string;
}
```

### Audit Trail Rules

1. AI audit records are **append-only** — no updates or deletes
2. Input data is stored for reproducibility
3. Model version is recorded for accountability
4. Human overrides are linked to the original AI action
5. Audit records are retained for 7 years (regulatory requirement)
6. Audit records are searchable by capability, entity, confidence, and override status

---

## 11. AI Training

### Learning from Human Corrections

When a human overrides an AI recommendation, the system records:
1. The AI's recommendation and reasoning
2. The human's decision and reason
3. The outcome (was the human right?)

This data is used to:
1. Retrain models periodically (monthly batch)
2. Adjust confidence thresholds (quarterly review)
3. Identify systematic weaknesses (monthly analysis)
4. Improve feature engineering (quarterly review)

### Training Data Governance

1. Training data must not include PII beyond what is necessary for the task
2. Training data must be representative of the organisation's invoice patterns
3. Training data must be validated for quality before use
4. Model performance must be measured before and after retraining
5. Model changes must be approved by the AI Governance Board

### Model Performance Monitoring

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Recommendation accuracy | > 85% | < 80% |
| OCR field accuracy | > 95% | < 90% |
| Duplicate detection precision | > 90% | < 85% |
| Risk score calibration | R-squared > 0.7 | < 0.6 |
| Override rate | < 15% | > 25% |

---

## 12. AI Governance

### AI Governance Board

| Role | Responsibility |
|------|---------------|
| CFO (Chair) | Final authority on AI policy and thresholds |
| AP Manager | Operational oversight of AI in daily workflow |
| Controller | Compliance and audit oversight of AI decisions |
| IT Security | AI system security and data protection |
| External Auditor | Independent verification of AI audit trail |

### Governance Processes

1. **Monthly AI Performance Review**: Review accuracy metrics, override rates, and error patterns
2. **Quarterly Model Review**: Evaluate model performance, consider retraining, adjust thresholds
3. **Annual AI Audit**: Independent audit of AI system, data governance, and compliance
4. **Incident Response**: AI errors are treated as incidents — root cause analysis, corrective action, prevention

### AI Policy

1. AI is a tool, not a decision-maker
2. Every AI recommendation can be overridden by a human with authority
3. AI errors are learning opportunities, not failures
4. AI transparency is non-negotiable — no black boxes
5. AI performance is measured and reported regularly
6. AI governance is a continuous process, not a one-time setup

---

## 13. AI Service Architecture

### Model Registry

All AI models used in the AP workflow are registered in the `modelRegistry`:

| Model | Provider | Purpose | Version | Accuracy |
|-------|----------|---------|---------|----------|
| OCR Extraction | Internal / Third-party | Invoice text extraction | v2.1 | 94% |
| Vendor Matching | Internal | Fuzzy vendor matching | v1.3 | 92% |
| Duplicate Detection | Internal | Invoice deduplication | v1.5 | 91% |
| Risk Scoring | Internal / AI Provider | Invoice risk assessment | v2.0 | 85% |
| Root Cause Analysis | AI Provider | Exception diagnosis | v1.2 | 82% |
| GL Auto-Coding | Internal | Account code suggestion | v1.4 | 88% |

### Provider Health Monitoring

AI provider health is monitored via `providerHealthMonitor`:
- Response time tracking
- Error rate monitoring
- Availability monitoring
- Cost tracking

When a provider fails, the system falls back to:
1. Secondary provider (if available)
2. Rule-based processing (non-AI)
3. Manual processing (human intervention)

### Integration Points

| Service | AI Capability | Integration Method |
|---------|--------------|-------------------|
| DocumentPlatform | OCR extraction | Internal pipeline |
| AIDecisionEngine | Risk scoring, recommendations | API call with retry |
| AIPatternDetection | Anomaly detection, pattern analysis | Internal processing |
| AIForecastEngine | Cash flow projection, SLA prediction | API call with retry |
| AIDiagnosis | Root cause analysis | API call with retry |
| AIAutoCoding | GL account suggestion | Internal pipeline |

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | AI_BEHAVIOUR_GUIDE_v1.0 |
| Phase | 27.0A |
| Author | Perionyx Product Architecture Board |
| Reviewers | AI Ethics Board, CFO Advisory Board, Engineering Leads |
| Status | Draft |
| Next Review | Phase 27.0B |
| Classification | Internal — Engineering & Product |
