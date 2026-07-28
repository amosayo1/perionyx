# AP Workflow Persona Guide

> Phase 27.0A — Enterprise Product Architecture & Workflow Design
> Version: 1.0 | Date: 2026-07-28
> Authority: Product Architecture Board
> Classification: Internal — Engineering & Product

---

## 1. Purpose

This document defines the **9 personas** who interact with the AP workflow. Each persona represents a real role in a mid-to-large enterprise finance organisation. Their needs, pain points, and success criteria are derived from customer evidence and validated against the platform's capabilities.

Every feature in the AP workflow must serve at least one persona. If a feature has no persona, it should not exist.

### Evidence Basis

- Adeel Aslam: "vendor invoice reconciliations and approval workflows... often require manual oversight to ensure accuracy"
- Ayman Shawky: "Siloed systems create reconciliation overhead" / "Need for instant view of cash positions"
- Theme T1: Manual Approval Workflows Delay Payments (2 sources, Working)
- Theme T2: Vendor Invoice Reconciliation Is Manual and Error-Prone (2 sources, Working)

---

## 2. Persona 1: AP Clerk

### Role
**Job Title**: Accounts Payable Clerk / AP Specialist
**Responsibility**: Daily processing of vendor invoices — capture, validate, match, route for approval, resolve exceptions, process payments.

### Day in the Life

Sarah starts her day at 8:30 AM. She opens her email and finds 47 new vendor invoices. Some are PDFs attached to emails, some come through the vendor portal, and a few arrive via EDI. Before Perionyx, she would open each PDF, read it, cross-reference the PO number in a spreadsheet, check the goods receipt in the ERP, and then manually key the invoice into the accounting system. This took her until noon every day.

After Perionyx, she opens the AP Dashboard. 38 of the 47 invoices have been auto-captured via OCR and matched to POs. The system shows green for 32 invoices (matched, no exceptions), yellow for 6 (minor variances within tolerance), and red for 9 (exceptions requiring investigation). She starts with the 9 red invoices — each has an AI-generated summary of what went wrong and a suggested resolution.

By 10:00 AM, she has resolved 6 exceptions (3 were GRN delays, 2 were price variances she confirmed with procurement, 1 was a duplicate she voided). She reviews the 6 yellow invoices — the variances are minor (under 2%), she overrides with a note and routes them for approval. The 32 green invoices are already in the approval queue. By 11:00 AM, her entire morning workload is processed. She spends the rest of the day on vendor queries and payment follow-ups.

### Key Metrics
1. **Invoices processed per day** — target: 50+ (up from 15 manually)
2. **Average processing time per invoice** — target: < 5 minutes (down from 45 minutes)
3. **Exception rate** — monitor trends, not a target to hit
4. **Approval turnaround time** — target: < 4 hours (down from 3 days)
5. **Data accuracy rate** — target: > 99% (OCR + validation)

### Decision Authority
- **Can**: Correct OCR errors, override match tolerances (with reason), resolve low/medium exceptions, void duplicate invoices, contact vendors for clarification
- **Cannot**: Approve invoices (requires manager), process payments, create new vendors (requires approval), override high/critical exceptions

### Pain Points (from evidence)
- Manual data entry from PDF invoices is slow and error-prone (Theme T2)
- Chasing PO confirmations and GRN receipts via email takes hours daily
- Duplicate invoices slip through manual checks
- Approvals sit in email inboxes for days with no visibility (Theme T1)
- Vendor payment queries require searching multiple systems

### How Perionyx Helps
- OCR captures invoice data automatically, eliminating manual entry
- Three-way matching runs in seconds, flagging only real exceptions
- AI pre-classifies exceptions with suggested resolutions
- Approval status visible in real-time — no more email chasing
- Vendor portal lets vendors check their own payment status

### Trust Requirements
- OCR accuracy must be > 95% — she needs to trust the capture
- Match results must be explainable — she needs to understand why an exception was raised
- Override actions must be auditable — she needs to know her overrides are tracked
- System must never silently drop an invoice — every invoice must appear somewhere

### Success Criteria
Sarah knows Perionyx is working when she finishes her invoice processing by 10:00 AM instead of noon. When she can resolve exceptions with one click instead of three email chains. When vendors stop calling to ask about payment status.

### Day in the Life — After Perionyx
Sarah arrives at 8:30 AM, grabs coffee, and opens the AP Dashboard. 47 invoices, 38 auto-processed. She spends 30 minutes on the 9 exceptions, each with AI context. By 9:30 AM, she is done with invoice processing. She spends the rest of her day on vendor relationship management — something she never had time for before. She feels like a professional, not a data entry clerk.

### Failure Scenario
If Perionyx's OCR misreads an amount, Sarah processes the wrong invoice value. If the system silently drops an invoice, a vendor goes unpaid. If exceptions are not clearly explained, Sarah overrides blindly. If the system is slow during month-end, Sarah falls behind and invoices pile up.

---

## 3. Persona 2: AP Manager

### Role
**Job Title**: Accounts Payable Manager / AP Director
**Responsibility**: Oversee AP operations, manage team, ensure SLA compliance, handle escalations, approve high-value invoices, report to Controller.

### Day in the Life

Michael manages a team of 5 AP Clerks. Before Perionyx, his day was spent on three things: (1) reviewing exception reports from yesterday, (2) chasing approvals that were stuck in email chains, and (3) preparing AP aging reports for the Controller. He spent more time on firefighting than strategy.

After Perionyx, Michael starts with the AP Dashboard showing real-time metrics: 247 invoices in pipeline, 12 exceptions (3 critical), 45 awaiting approval, $1.2M in pending payments. He sees that 3 critical exceptions are price variances over 10% — these need his attention. He reviews each one in 2 minutes (AI has already identified the root cause and suggested resolution). By 9:00 AM, all critical exceptions are resolved.

He then reviews the approval queue: 15 invoices are pending his approval (all over $10K). Each has a complete evidence package — PO, GRN, vendor history, AI recommendation. He approves 12 in 10 minutes. The 3 remaining need procurement input — he escalates them with one click. His team is processing invoices 3x faster than last quarter. He spends the afternoon on process improvement: he notices a vendor has a 30% exception rate and initiates a vendor review.

### Key Metrics
1. **Team throughput** — invoices processed per FTE per day
2. **Exception resolution time** — target: < 4 hours for critical, < 24 hours for high
3. **SLA compliance** — target: > 95% of invoices processed within 5 business days
4. **Approval cycle time** — target: < 8 hours average
5. **Cost per invoice** — target: < $5 (down from $15-25 manual)

### Decision Authority
- **Can**: Resolve all exceptions, approve invoices up to $50K, reassign team members, adjust tolerance rules, initiate vendor reviews, approve new vendors
- **Cannot**: Approve invoices over $50K (Controller), process payments (Treasury), modify GL accounts (Controller)

### Pain Points
- Exception resolution requires checking 3+ systems
- Approval chains get stuck when approvers are on leave
- No visibility into team performance without manual reporting
- Month-end close is chaotic — everything is last-minute
- Vendor payment disputes require forensic investigation

### How Perionyx Helps
- Real-time dashboard replaces manual reporting
- AI pre-classifies and suggests resolutions for exceptions
- Delegation chains ensure approvals don't get stuck
- Team performance metrics are live
- Complete audit trail for any vendor query

### Trust Requirements
- Dashboard metrics must be accurate and real-time
- Exception classifications must be reliable
- Delegation chains must be auditable
- Cost per invoice must be calculable from system data

### Success Criteria
Michael knows Perionyx is working when his team processes 50+ invoices per person per day. When exceptions are resolved in hours, not days. When month-end close takes 2 days instead of 5. When the Controller stops asking "where's the AP report?"

### Day in the Life — After Perionyx
Michael arrives at 8:00 AM, reviews the dashboard in 5 minutes, handles 3 critical exceptions in 10 minutes, approves 15 invoices in 10 minutes. By 8:30 AM, his operational firefighting is done. He spends the morning on vendor negotiations and process improvement. He leaves at 5:00 PM feeling like a manager, not a firefighter.

### Failure Scenario
If the dashboard shows stale data, Michael makes decisions on outdated information. If AI misclassifies exceptions, the team wastes time on false positives. If delegation chains break, approvals stall and vendors go unpaid. If cost-per-invoice cannot be calculated, he cannot justify his team's value.

---

## 4. Persona 3: Financial Controller

### Role
**Job Title**: Financial Controller / Comptroller
**Responsibility**: Financial reporting, GL integrity, compliance, audit readiness, month-end close, regulatory compliance.

### Day in the Life

Lisa's primary concern is accuracy and compliance. Every number in the GL must be provable. Every journal entry must have a source document. Every audit finding must be explainable. Before Perionyx, she spent 3 days each month-end reconciling AP to GL, investigating variances, and preparing audit evidence.

After Perionyx, Lisa's month-end process starts on the 25th (not the last day). The system has already reconciled 98% of AP entries automatically. She reviews the 2% exception report: 3 entries need manual GL coding, 1 needs a correcting journal. She approves the corrections in 30 minutes. On the last day, she generates the AP aging report, the GL reconciliation, and the audit trail summary. Everything matches. She signs off by noon.

When the external auditor arrives, she hands them a system-generated audit package: every invoice has a complete trail from receipt to payment, every approval has a digital signature, every GL entry traces back to an invoice. The auditor is impressed. What used to take 2 weeks of investigation takes 2 days.

### Key Metrics
1. **GL reconciliation accuracy** — target: 100% match between AP sub-ledger and GL
2. **Month-end close time** — target: 2 days (down from 5)
3. **Audit findings** — target: 0 material findings
4. **Journal entry accuracy** — target: > 99.9%
5. **Compliance score** — target: 100% on all regulatory checks

### Decision Authority
- **Can**: Approve invoices over $50K, approve GL corrections, close month-end, sign off on audit packages, modify GL account mappings
- **Cannot**: Process payments, modify approval thresholds, change vendor master data

### Pain Points
- AP-GL reconciliation requires manual journal entries
- Audit evidence gathering is manual and time-consuming
- Month-end close is a 5-day stressful event
- Compliance checks are ad-hoc, not systematic
- Variance investigation requires multiple system lookups

### How Perionyx Helps
- Automated GL posting with full traceability
- Immutable audit trail with checksum verification
- Real-time reconciliation (not just month-end)
- Compliance checks embedded in every transaction
- Audit package generation with one click

### Trust Requirements
- GL entries must be automatically generated and correct
- Audit trail must be immutable and tamper-evident
- Reconciliation must be verifiable independently
- Compliance checks must cover all regulatory requirements

### Success Criteria
Lisa knows Perionyx is working when month-end close takes 2 days instead of 5. When the auditor completes their work in 2 days instead of 2 weeks. When she can generate any compliance report in seconds. When she sleeps well during audit season.

### Day in the Life — After Perionyx
Lisa arrives at 8:00 AM, reviews the reconciliation dashboard (98% auto-reconciled), handles 4 manual entries by 9:00 AM, generates the month-end AP aging and GL reconciliation by 10:00 AM. She spends the rest of the day on financial analysis — something she never had time for before. She feels like a strategic finance professional, not a reconciliation clerk.

### Failure Scenario
If GL entries are auto-generated but wrong, Lisa discovers errors at month-end. If the audit trail has gaps, the auditor raises findings. If reconciliation is not real-time, month-end is still chaotic. If compliance checks are incomplete, the organisation faces regulatory risk.

---

## 5. Persona 4: Treasury Manager

### Role
**Job Title**: Treasury Manager / Cash Manager
**Responsibility**: Cash position management, payment scheduling, bank relationship management, foreign exchange, liquidity forecasting.

### Day in the Life

Ahmed's world is cash. He needs to know: How much cash do we have? When will payments be due? Can we afford this batch? Should we take the early-payment discount? Before Perionyx, he managed cash in Excel spreadsheets updated daily from bank feeds. He never had a real-time view.

After Perionyx, Ahmed opens the Treasury Dashboard. Real-time cash position: $4.2M across 3 accounts. Today's payments: $380K (12 invoices, 3 batches). This week's forecast: $1.1M out, $800K in (AR collections). Net cash impact: -$300K. He sees a payment proposal for $380K — AI has optimised the batch to capture $2,400 in early-payment discounts. He reviews, approves, and payments are executed by 10:00 AM.

At 2:00 PM, he receives an alert: a $150K payment to a key vendor failed (bank API timeout). The system has already retried once. He escalates to the bank, initiates a manual wire, and the vendor is paid by 4:00 PM. Before Perionyx, this failure would have been discovered the next day when the vendor called.

### Key Metrics
1. **Cash position accuracy** — target: real-time, within $100 of bank balance
2. **Payment batch optimisation** — target: capture > 80% of available discounts
3. **Payment failure rate** — target: < 0.5%
4. **Days payable outstanding (DPO)** — target: optimise for cash flow, not just minimum
5. **Bank reconciliation time** — target: < 30 minutes/day

### Decision Authority
- **Can**: Approve payment batches, execute payments, manage bank relationships, adjust payment timing, reject payment proposals
- **Cannot**: Approve invoices (AP domain), modify vendor details, change GL accounts

### Pain Points
- No real-time cash position — always working with yesterday's numbers
- Payment failures discovered too late (next day)
- Early-payment discounts missed because of approval delays
- Manual bank reconciliation is tedious
- Multi-currency payments require manual FX rate management

### How Perionyx Helps
- Real-time cash position from banking API integration
- Payment failure alerts with immediate retry and escalation
- AI-optimised payment timing for discount capture
- Automated bank reconciliation
- Integrated FX rate management

### Trust Requirements
- Cash position must be real-time, not batched
- Payment execution must be reliable (retry, escalation)
- Discount calculations must be accurate
- Bank reconciliation must be verifiable

### Success Criteria
Ahmed knows Perionyx is working when he can see his cash position in real-time. When payment failures are resolved in hours, not days. When early-payment discounts are captured automatically. When bank reconciliation takes 30 minutes, not half a day.

### Day in the Life — After Perionyx
Ahmed arrives at 8:00 AM, reviews real-time cash position in 2 minutes, approves 2 payment batches in 10 minutes, checks forecast for the week in 5 minutes. By 8:20 AM, his daily payment operations are done. He spends the rest of the day on treasury strategy — FX hedging, investment optimisation, bank negotiations. He feels like a treasury strategist, not a payment processor.

### Failure Scenario
If the cash position is stale, Ahmed makes decisions on wrong numbers. If payment failures are not alerted immediately, vendors go unpaid and relationships suffer. If discount calculations are wrong, the organisation loses money. If bank reconciliation doesn't match, Ahmed spends hours investigating.

---

## 6. Persona 5: Procurement Manager

### Role
**Job Title**: Procurement Manager / Category Manager
**Responsibility**: Vendor management, PO creation, contract negotiation, spend analysis, vendor performance tracking.

### Day in the Life

Fatima's concern is that what was ordered matches what was received and what was invoiced. Before Perionyx, she spent hours each week answering AP's questions: "Is this PO correct?" "Did we receive this?" "Has the price changed?" These interruptions killed her productivity.

After Perionyx, Fatima's involvement is primarily when exceptions arise. The system automatically matches invoices to POs and GRNs. When there's a price variance, the system flags it and routes it to her for confirmation. She receives a daily summary: 15 invoices matched her POs without issues, 3 had minor price variances (she confirms), 1 had a quantity discrepancy (she investigates with the warehouse).

She also uses the vendor performance dashboard: Vendor A has a 30% exception rate (needs review), Vendor B delivers on time 95% of the time (good candidate for strategic partnership), Vendor C has invoiced $50K more than PO value this quarter (needs contract review).

### Key Metrics
1. **PO-invoice match rate** — target: > 90% first-time match
2. **Vendor exception rate** — target: < 5% per vendor
3. **Vendor response time** — target: < 24 hours for queries
4. **Contract compliance** — target: > 95% of invoices within contract terms
5. **Spend visibility** — target: 100% of spend categorised and tracked

### Decision Authority
- **Can**: Confirm PO pricing, resolve PO-related exceptions, modify PO terms, initiate vendor reviews, approve PO changes
- **Cannot**: Approve invoices, process payments, modify GL accounts, create vendors

### Pain Points
- Constant interruptions from AP asking about POs and GRNs
- No visibility into invoice processing status
- Vendor performance data is anecdotal, not data-driven
- Price variances require manual investigation
- Contract compliance is checked only during audits

### How Perionyx Helps
- Three-way match runs automatically — only exceptions reach her
- Vendor performance dashboard with real-time metrics
- Contract terms extracted and compared automatically
- Vendor communication through the portal, not email
- Spend analysis with trend detection

### Trust Requirements
- PO match results must be accurate
- Vendor performance metrics must be based on actual data
- Exception routing must reach the right person
- Contract comparison must handle complex terms

### Success Criteria
Fatima knows Perionyx is working when she is interrupted 90% less by AP. When vendor performance is data-driven, not anecdotal. When contract compliance is monitored in real-time, not just during audits.

### Failure Scenario
If the match engine has false positives, Fatima wastes time reviewing non-issues. If vendor performance data is inaccurate, she makes wrong decisions about vendor relationships. If exceptions are not routed to her correctly, resolution is delayed.

---

## 7. Persona 6: CFO

### Role
**Job Title**: Chief Financial Officer
**Responsibility**: Financial strategy, cash management, board reporting, investor relations, risk management, compliance oversight.

### Day in the Life

David doesn't process invoices. He doesn't approve them (that's what approval thresholds are for). His concern is strategic: Is AP under control? Are we paying optimally? What's our DPO? Are there any risks in our vendor base? Before Perionyx, he got a monthly AP report that was already 2 weeks old.

After Perionyx, David has a CFO Dashboard that shows: Total AP outstanding: $8.2M (down from $12M last quarter). Average days-to-pay: 32 days (optimised for cash flow). Exception rate: 3.2% (down from 8%). Payment failure rate: 0.3%. Top 5 vendors by spend. Upcoming payment commitments for the next 30 days. Cash flow forecast: we can cover all commitments with a $1.5M buffer.

When the board asks "What's our exposure to [Vendor X]?", David pulls up the dashboard and answers in 30 seconds. When the CFO of a potential acquisition asks "What's your AP process?", David shows the workflow and audit trail. When the auditor asks for evidence, David generates a package in 2 minutes.

### Key Metrics
1. **Days Payable Outstanding (DPO)** — target: optimised (not minimised, not maximised)
2. **Total AP outstanding** — target: trending down with business growth
3. **Exception rate** — target: < 3%
4. **Payment failure rate** — target: < 0.5%
5. **Audit readiness score** — target: > 95%

### Decision Authority
- **Can**: Approve invoices over $250K (with board), set payment strategy, approve vendor onboarding for strategic vendors, override any approval with audit trail
- **Cannot**: Process individual payments, resolve exceptions, modify daily operations

### Pain Points
- No real-time visibility into AP position
- Board reports require manual data compilation
- Audit preparation is a 2-week fire drill
- Risk exposure to vendors is unknown until something goes wrong
- DPO is suboptimal because payment timing is not strategic

### How Perionyx Helps
- Real-time CFO dashboard with key metrics
- Board-ready reports generated automatically
- Audit package always ready (no fire drill)
- Vendor risk scoring with concentration analysis
- AI-optimised payment timing for DPO management

### Trust Requirements
- Dashboard metrics must be board-quality (accurate, complete, auditable)
- Reports must be generated from system data, not spreadsheets
- Audit readiness must be continuous, not periodic
- Risk scores must be based on real data

### Success Criteria
David knows Perionyx is working when he can answer any board question about AP in 30 seconds. When audit preparation takes 2 days instead of 2 weeks. When DPO is optimised for cash flow. When vendor risk is quantified, not guessed.

### Day in the Life — After Perionyx
David checks the CFO Dashboard on his phone at 7:00 AM. Cash position is good. AP outstanding is trending down. Exception rate is 3.1% (within target). He spends 2 minutes on AP, then focuses on strategy. At 10:00 AM, the board asks about vendor exposure — he answers in 30 seconds. At 2:00 PM, the auditor asks for AP evidence — he generates a package. He feels in control, not reactive.

### Failure Scenario
If the dashboard shows wrong numbers, David makes bad strategic decisions. If audit preparation is still manual, the fire drill continues. If DPO is not optimised, the organisation leaves money on the table. If vendor risk is invisible, a vendor failure surprises the organisation.

---

## 8. Persona 7: Approver (Department Head)

### Role
**Job Title**: Department Head / Budget Owner (any department)
**Responsibility**: Approve invoices related to their department's budget and operations.

### Day in the Life

Rachel runs the Marketing department. She approves 5-10 invoices per week: agency fees, event costs, software subscriptions, print materials. Before Perionyx, approvals came via email — she'd get a PDF, review it, reply "approved", and hope AP saw her email. Sometimes she'd forget. Sometimes she'd approve the wrong amount because she couldn't see the PO.

After Perionyx, Rachel gets a notification: "Invoice INV-2026-042 from [Agency] for $12,500 requires your approval. Evidence: PO-789 (Marketing Campaign Q3), GRN received, AI recommendation: Approve (risk: 12/100, match: GREEN)." She reviews in 2 minutes. The evidence is clear. She approves with one tap. Done.

When she's travelling, she approves from her phone. When she's on leave, her pre-registered delegate handles it. She never has to think about AP processing — she just makes the decision and moves on.

### Key Metrics
1. **Approval turnaround time** — target: < 2 hours (down from 2 days)
2. **Approval accuracy** — target: 100% (no post-approval corrections)
3. **Approval volume** — 5-15 invoices per week (depends on department)
4. **Delegation coverage** — target: 100% (delegate always available)

### Decision Authority
- **Can**: Approve or reject invoices within their authority threshold, escalate to higher authority, delegate to pre-registered delegate
- **Cannot**: Modify invoices, create payments, change vendor details, approve outside their authority threshold

### Pain Points
- Approval emails get buried in inbox
- No context — just a PDF, no PO reference, no GRN confirmation
- On leave, approvals stack up and delay payments
- No visibility into what was approved and when
- Approving on mobile is painful (PDF rendering, no context)

### How Perionyx Helps
- One-tap approval with full evidence context
- Mobile-optimised approval interface
- Automatic delegation when on leave
- Approval history visible in dashboard
- Push notifications for time-sensitive approvals

### Trust Requirements
- Evidence must be complete and accurate
- Approval must be recorded immutably
- Delegate must have equivalent authority
- Mobile approval must be as secure as desktop

### Success Criteria
Rachel knows Perionyx is working when she approves invoices in 2 minutes instead of 2 days. When she never has to chase AP about a pending approval. When she can approve from her phone while travelling. When she trusts the evidence enough to approve without calling procurement.

### Day in the Life — After Perionyx
Rachel gets a push notification at 9:15 AM: "Invoice from [Agency] for $12,500 — Approve?" She opens the app, sees the evidence package, taps Approve. 30 seconds. She gets 5 more notifications throughout the week. Total time spent on AP approvals: 10 minutes per week. She never thinks about AP beyond that.

### Failure Scenario
If the evidence is incomplete, Rachel has to investigate herself (defeating the purpose). If the approval is not recorded, she has no proof of her decision. If delegation breaks, approvals stall during her absence. If mobile approval is insecure, she reverts to desktop (slower).

---

## 9. Persona 8: Auditor

### Role
**Job Title**: Internal Auditor / External Auditor
**Responsibility**: Verify AP controls, test transactions, ensure compliance, report findings.

### Day in the Life

James (internal auditor) performs quarterly AP audits. Before Perionyx, he would request a sample of 50 invoices from AP, wait 3 days for the data, manually trace each invoice through the system, check approvals, verify GL entries, and write his report. The process took 2 weeks.

After Perionyx, James opens the audit portal. He selects a sample (or the system generates a statistically valid sample). For each invoice, he sees: receipt timestamp, OCR extraction, evidence collection, match result, exception handling (if any), approval chain with digital signatures, payment execution with bank reference, GL entries, reconciliation status, and audit trail with checksum verification. He can verify the entire chain in 5 minutes per invoice. His quarterly audit takes 2 days instead of 2 weeks.

When the external auditor arrives, James hands them the system-generated audit package. The external auditor verifies the checksum chain independently. Everything checks out. No findings.

### Key Metrics
1. **Audit completion time** — target: 2 days (down from 2 weeks)
2. **Sample coverage** — target: statistically valid sample (automated)
3. **Finding rate** — target: 0 material findings
4. **Evidence completeness** — target: 100% of transactions have complete audit trail
5. **Checksum verification** — target: 100% pass

### Decision Authority
- **Can**: Read any AP record, generate audit reports, flag findings, request explanations, verify checksums
- **Cannot**: Modify any AP record, approve invoices, process payments, change system configuration

### Pain Points
- Evidence gathering is manual and slow
- Tracing a transaction through multiple systems takes hours
- Verifying approvals requires checking email archives
- GL reconciliation is manual
- Checksum/tamper-evidence verification is not built-in

### How Perionyx Helps
- Complete audit trail for every transaction with one click
- Checksum chain verification automated
- Statistical sampling built-in
- Evidence package generation automated
- Real-time compliance monitoring

### Trust Requirements
- Audit trail must be immutable
- Checksums must be verifiable independently
- Evidence must be complete and chronological
- Sampling must be statistically valid

### Success Criteria
James knows Perionyx is working when his quarterly audit takes 2 days instead of 2 weeks. When he can verify any transaction's complete history in 5 minutes. When the external auditor has no findings. When compliance monitoring is continuous, not periodic.

### Day in the Life — After Perionyx
James opens the audit portal at 9:00 AM, selects a sample of 30 invoices, reviews each in 5 minutes (150 minutes total), verifies checksums in 10 minutes, generates the audit report by noon. He spends the afternoon on risk assessment and process improvement recommendations. He feels like an auditor, not a data collector.

### Failure Scenario
If the audit trail has gaps, James cannot verify transactions. If checksums don't verify, tampering is suspected. If evidence is incomplete, James must investigate manually. If sampling is not statistically valid, the audit is unreliable.

---

## 10. Persona 9: Vendor (External)

### Role
**Job Title**: Vendor / Supplier Finance Contact
**Responsibility**: Submit invoices, track payment status, manage banking details, resolve disputes.

### Day in the Life

Omar runs the finance department of a mid-size supplier. He submits 20 invoices per month to Perionyx customers. Before Perionyx, he would email invoices, then call AP to check status, then email again to confirm payment details, then call again when payment was late. This took 5 hours per month.

After Perionyx, Omar logs into the vendor portal. He uploads invoices directly — the system confirms receipt instantly. He tracks every invoice: 15 paid (with payment dates and references), 3 in approval (estimated completion date), 2 pending (awaiting GRN). He can see exactly when each payment will arrive. When he has a query, he messages AP through the portal — no email chains.

When a payment is late, the system alerts him proactively: "Payment for INV-2026-018 is delayed due to bank processing. Expected completion: 2 business days." No phone call needed.

### Key Metrics
1. **Invoice submission time** — target: < 2 minutes per invoice
2. **Payment visibility** — target: 100% of invoices show status
3. **Query response time** — target: < 24 hours
4. **Payment on-time rate** — target: > 95%
5. **Portal uptime** — target: 99.9%

### Decision Authority
- **Can**: Submit invoices, update banking details (with verification), check payment status, raise disputes, communicate with AP
- **Cannot**: Approve their own invoices, modify payment terms, access other vendors' data

### Pain Points
- No visibility into invoice processing status
- Email-based communication is slow and unreliable
- Payment delays are discovered when checking bank statements
- Banking detail changes require phone calls
- Dispute resolution is ad-hoc and slow

### How Perionyx Helps
- Vendor portal with real-time invoice status
- Direct invoice upload with instant confirmation
- Payment tracking with expected dates
- Secure messaging through the portal
- Proactive payment delay notifications

### Trust Requirements
- Portal must be secure (no unauthorised access)
- Payment status must be accurate and real-time
- Banking detail changes must be verified
- Communication must be logged and auditable

### Success Criteria
Omar knows Perionyx is working when he never has to call AP to check payment status. When invoices are processed in days, not weeks. When payment delays are communicated proactively. When the portal is always available and fast.

### Day in the Life — After Perionyx
Omar logs into the vendor portal at 9:00 AM, uploads 3 invoices (2 minutes each), checks status on 15 pending invoices (5 minutes), responds to 1 AP query (2 minutes). Total time: 15 minutes. He never picks up the phone to call AP. He feels like a partner, not a supplicant.

### Failure Scenario
If the portal is down, Omar cannot submit invoices or check status. If payment status is wrong, Omar makes wrong cash flow decisions. If banking detail changes are not verified, fraud is possible. If the portal is slow, Omar reverts to email.

---

## 11. Cross-Persona Interactions

| From | To | Trigger | Channel |
|------|----|---------|---------|
| AP Clerk | AP Manager | Exception escalation | System |
| AP Manager | Controller | Invoice > $50K approval | System |
| Controller | CFO | Invoice > $250K approval | System |
| Treasury Manager | AP Manager | Payment failure | System + Email |
| Procurement | AP Clerk | PO clarification | Portal + Email |
| AP Clerk | Vendor | Invoice query | Portal + Email |
| Vendor | AP Clerk | Invoice submission | Portal |
| Auditor | AP Manager | Audit finding | Report + Meeting |
| CFO | All | Strategic directive | Email + Meeting |

---

## 12. Persona Summary Matrix

| Persona | Primary Stage | Key Metric | Pain Point | Perionyx Solution |
|---------|--------------|------------|------------|-------------------|
| AP Clerk | 1-4 (Daily Ops) | Invoices/day | Manual data entry | OCR + auto-match |
| AP Manager | 4-6 (Escalation) | Exception resolution time | System hopping | AI context + dashboard |
| Financial Controller | 10 (Audit) | Month-end close time | Manual GL reconciliation | Auto-posting + audit trail |
| Treasury Manager | 8-9 (Payment) | Cash position accuracy | Stale cash data | Real-time banking integration |
| Procurement Manager | 2-3 (Match) | PO match rate | Constant AP interruptions | Auto-match + exception routing |
| CFO | Executive | DPO | No real-time visibility | CFO dashboard + reports |
| Approver | 7 (Approval) | Approval turnaround | Email-based approvals | One-tap approval with evidence |
| Auditor | 10 (Audit) | Audit completion time | Manual evidence gathering | Automated audit package |
| Vendor | 1 (Invoice) | Payment visibility | No status visibility | Vendor portal + notifications |

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PERSONA_GUIDE_v1.0 |
| Phase | 27.0A |
| Author | Perionyx Product Architecture Board |
| Reviewers | Customer Advisory Board, Engineering Leads |
| Status | Draft |
| Next Review | Phase 27.0B |
| Classification | Internal — Engineering & Product |
