# Customer Lifecycle

## Stages
1. **Onboarding** — Customer record creation, credit evaluation, account setup
2. **Active** — Invoice generation, payment processing, credit monitoring
3. **Monitoring** — Aging tracking, DSO monitoring, credit limit reviews
4. **Collection** — Overdue management, escalation, promise-to-pay tracking
5. **Resolution** — Disputes, adjustments, write-offs
6. **Closure** — Account settlement, status change to inactive/closed

## Data Model
Each Customer record contains:
- Customer number, name, type (individual/business/government/nonprofit)
- Contact information and billing/shipping addresses
- Payment terms (Net 30/45/60, due upon receipt, custom)
- Tax configuration (VAT, GST, Sales Tax, Withholding)
- Credit limit, risk rating, DSO tracking
- Payment behavior history (average payment days, lifetime value)
