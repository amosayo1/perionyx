# Workflow Observations

**Phase:** 8E.2
**Status:** Active registry
**Last Updated:** July 8, 2026

---

## Purpose

Capture detailed workflow observations from customer interviews, user testing, and session recordings. These observations document the step-by-step processes users follow, the tools they touch, the friction they encounter, and the context in which they work.

---

## Observation Schema

| Field | Description |
|---|---|
| ID | `WO-{YYYYMMDD}-{NNN}` |
| Workflow | Primary workflow name |
| Workflow Category | Taxonomy category |
| Participant Role | Job title |
| Organization | Company name |
| Industry | Industry vertical |
| Source | Interview ID, session recording, or testing session |
| Date Observed | ISO 8601 |
| Trigger Event | What initiates this workflow |
| Steps | Numbered list of observed steps |
| Tools Used | Systems interacted with during workflow |
| Friction Points | Where the user stalled, backtracked, or expressed frustration |
| Time per Step | Estimated or measured duration per step |
| Total Duration | Estimated total workflow duration |
| Frequency | How often this workflow is performed (daily/weekly/monthly/quarterly) |
| Context | Environment notes (desktop/mobile, location, interruptions) |
| Workarounds | Any manual processes or scripts used to compensate |
| Quotes | Direct participant quotes during observation |
| Follow-up | Actions needed after this observation |

---

## Workflow Registry

| ID | Workflow | Role | Organization | Source | Date | Steps | Friction Count | Frequency |
|---|---|---|---|---|---|---|---|---|
| | *(no entries yet)* | | | | | | | |

---

## Workflow Templates

### Month-end Close

```yaml
workflow: Month-end Close
trigger: Calendar date (monthly)
typical_duration: 5-10 business days
typical_steps:
  - Reconcile bank accounts
  - Post journal entries
  - Review trial balance
  - Investigate variances
  - Generate financial statements
  - Obtain approvals
  - File regulatory reports
roles_involved:
  - Accountant
  - Controller
  - Finance Manager
  - CFO
tools_encountered:
  - ERP
  - Reconciliation tool
  - Spreadsheets
  - Email
common_frictions:
  - Data not synchronized between systems
  - Manual journal entry validation
  - Late submissions from departments
  - Last-minute adjustments
  - Version control on reports
```

### Bank Reconciliation

```yaml
workflow: Bank Reconciliation
trigger: Bank statement availability (daily/weekly)
typical_duration: 30 min - 2 hours per entity
typical_steps:
  - Import bank statement
  - Match transactions
  - Investigate exceptions
  - Create adjusting entries
  - Approve reconciliation
  - Archive documentation
roles_involved:
  - Accountant
  - Controller
tools_encountered:
  - Banking portal
  - ERP
  - Reconciliation module
  - Spreadsheets
common_frictions:
  - Manual match suggestions
  - Large number of exceptions in high-volume accounts
  - Missing supporting documentation
  - Delay between statement date and availability
```

### Payment Approval

```yaml
workflow: Payment Approval
trigger: Payment initiation or threshold breach
typical_duration: 5-30 min per approval
typical_steps:
  - Receive notification
  - Review transaction details
  - Verify supporting documents
  - Check available balance
  - Approve or reject
  - Add justification (if rejected)
roles_involved:
  - AP Clerk
  - Finance Manager
  - CFO
  - Treasury Director
tools_encountered:
  - Approval system
  - Banking portal
  - ERP
  - Email
common_frictions:
  - Insufficient context in approval request
  - Hard to verify supporting documents
  - No batch approve for similar items
  - Mobile approval limited or absent
```

### Financial Reporting

```yaml
workflow: Financial Reporting
trigger: Period close, board meeting, investor request
typical_duration: 1-3 days per report cycle
typical_steps:
  - Select report template
  - Configure parameters (period, entity, currency)
  - Generate draft
  - Review for accuracy
  - Add commentary
  - Share with stakeholders
roles_involved:
  - Accountant
  - Finance Manager
  - CFO
  - Executive Viewer
tools_encountered:
  - Reporting tool
  - Spreadsheets
  - Presentation software
  - Email
common_frictions:
  - Report generation takes too long
  - Cannot customize layouts
  - Data doesn't match ERP
  - No variance explanations in report
  - Formatting lost in export
```

---

## Friction Point Index

| Friction | Workflows Affected | Frequency | Severity |
|---|---|---|---|
| *(no entries yet)* | | | |

---

## Adding an Observation

1. Assign next ID: `WO-{YYYYMMDD}-{NNN}`
2. Reference the originating Interview ID
3. Fill all observed fields from the observation
4. Link to affected pain points in the pain point catalog
5. Update the Friction Point Index if new friction is identified
