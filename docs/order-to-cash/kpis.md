# O2C Key Performance Indicators

## KPI Framework

KPIs are managed by `O2CAnalyticsService` and stored as `O2CKPI` records. Each KPI has:
- Current value, previous value, and target
- Unit (currency, percentage, days, count)
- Category for grouping
- Trend direction
- Status indicator

## Revenue KPIs

### Total Revenue
- **Definition**: Gross revenue from all customers
- **Calculation**: `∑ customers.totalRevenue`
- **Unit**: Currency (USD)
- **Target**: Period-over-period growth
- **Trend**: Up is positive

### Revenue Growth Rate
- **Definition**: Percentage change in revenue period-over-period
- **Calculation**: `((currentRevenue - previousRevenue) / previousRevenue) * 100`
- **Unit**: Percentage
- **Target**: ≥ 10% YoY growth

### Recognized Revenue
- **Definition**: Revenue fully recognized from schedules
- **Calculation**: `∑ revenueRecognition.recognizedAmount (status === "recognized")`
- **Unit**: Currency
- **Trend**: Up indicates active revenue conversion

### Deferred Revenue
- **Definition**: Revenue scheduled for future recognition
- **Calculation**: `∑ revenueRecognition.deferredAmount (status === "deferred")`
- **Unit**: Currency
- **Note**: High deferred = strong forward pipeline

## AR KPIs

### Days Sales Outstanding (DSO)
- **Definition**: Average days to collect payment after invoicing
- **Calculation**: `(totalAR / (totalRevenue / 365))`
- **Target**: ≤ 45 days (good), 45–60 (elevated), > 60 (critical)
- **Unit**: Days
- **Trend**: Down is positive

### Total AR
- **Definition**: Total accounts receivable outstanding
- **Calculation**: `∑ ARRecord.totalAmount`
- **Unit**: Currency

### Outstanding AR
- **Definition**: Amount remaining to be collected
- **Calculation**: `∑ ARRecord.amountOutstanding`
- **Unit**: Currency

### Overdue AR
- **Definition**: AR past due date
- **Calculation**: `∑ ARRecord.amountDue (status === "overdue")`
- **Unit**: Currency

## Aging KPIs

### Current (0 days)
- **Definition**: AR not yet due
- **Target**: ≥ 60% of total AR

### 1-30 Days
- **Definition**: AR 1–30 days past due

### 31-60 Days
- **Definition**: AR 31–60 days past due

### 61-90 Days
- **Definition**: AR 61–90 days past due

### 91+ Days
- **Definition**: AR 91+ days past due (high risk)
- **Target**: < 5% of total AR

## Collections KPIs

### Collection Rate
- **Definition**: Percentage of outstanding AR collected
- **Calculation**: `(cashCollected / totalAR) * 100`
- **Target**: ≥ 80%
- **Unit**: Percentage

### Active Collections
- **Definition**: Number of active collection cases
- **Calculation**: `count(status === "active" || "escalated")`

### Resolution Rate
- **Definition**: Cases resolved vs total
- **Calculation**: `(resolved / total) * 100`
- **Target**: ≥ 70%

### Promise-to-Pay Rate
- **Definition**: Cases with active promises
- **Calculation**: `count(status === "promise-to-pay")`

## Bad Debt KPIs

### Bad Debt Ratio
- **Definition**: Written-off amount as percentage of total AR
- **Calculation**: `(writtenOff / totalAR) * 100`
- **Target**: < 2%

### Write-off Amount
- **Definition**: Total amount written off as uncollectible

## Customer KPIs

### Customer Profitability
- **Definition**: Revenue per customer relative to cost-to-serve
- **Calculation**: `totalRevenue - (orders * avgCostPerOrder)`
- **Unit**: Currency

### Average Payment Days
- **Definition**: Average days customers take to pay
- **Calculation**: `avg(customers.avgPaymentDays)`
- **Target**: ≤ 30 days

### Customer Lifetime Value (LTV)
- **Definition**: Projected revenue from a customer over their lifetime
- **Unit**: Currency

## Credit KPIs

### Credit Utilization Ratio
- **Definition**: Total credit used vs total credit extended
- **Calculation**: `(totalUtilization / totalCreditLimit) * 100`
- **Target**: < 70%
- **Unit**: Percentage

### High-Risk Exposure
- **Definition**: Total credit extended to high/critical risk customers
- **Calculation**: `∑ creditLimit (riskRating === "high" || "critical")`
- **Unit**: Currency

### On-Hold Customers
- **Definition**: Customers with credit on hold
- **Calculation**: `count(onHold === true)`

## Cash Application KPIs

### Cash Collection Rate
- **Definition**: Percentage of received cash that has been applied
- **Calculation**: `(appliedAmount / totalReceipts) * 100`
- **Target**: ≥ 95%

### Unapplied Cash Ratio
- **Definition**: Unapplied cash as percentage of total receipts
- **Calculation**: `(unappliedAmount / totalReceipts) * 100`
- **Target**: < 5%

## Efficiency KPIs

### Order Fulfillment Rate
- **Definition**: Percentage of orders fulfilled on time
- **Calculation**: `(fulfilled / total) * 100`
- **Target**: ≥ 95%

### Invoice Accuracy
- **Definition**: Invoices without disputes or corrections
- **Calculation**: `((totalInvoices - disputed) / totalInvoices) * 100`
- **Target**: ≥ 98%

## KPI Categories

| Category | KPIs |
|----------|------|
| `revenue` | Total Revenue, Revenue Growth, Recognized Revenue, Deferred Revenue |
| `collections` | Collection Rate, Active Collections, Resolution Rate, Promise-to-Pay |
| `credit` | Credit Utilization, High-Risk Exposure, On-Hold Customers |
| `efficiency` | DSO, Fulfillment Rate, Invoice Accuracy |
| `customer` | Customer Profitability, Average Payment Days, LTV |
