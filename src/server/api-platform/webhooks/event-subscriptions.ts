import type { ApiVersion } from "../types";

export type EventDomain =
  | "treasury"
  | "accounting"
  | "journal"
  | "payment"
  | "invoice"
  | "customer"
  | "vendor"
  | "asset"
  | "risk"
  | "compliance"
  | "integration";

export interface EventTypeDefinition {
  type: string;
  domain: EventDomain;
  version: ApiVersion;
  description: string;
  category: string;
  sample: Record<string, unknown>;
}

export const EVENT_TYPES: EventTypeDefinition[] = [
  {
    type: "treasury.account.created",
    domain: "treasury",
    version: "v1",
    description: "A treasury account was created",
    category: "entity",
    sample: { id: "ta_123", name: "Operating Account", currency: "USD" },
  },
  {
    type: "treasury.account.updated",
    domain: "treasury",
    version: "v1",
    description: "A treasury account was updated",
    category: "entity",
    sample: { id: "ta_123", name: "Operating Account", balance: "150000" },
  },
  {
    type: "treasury.balance.changed",
    domain: "treasury",
    version: "v1",
    description: "Account balance changed",
    category: "state",
    sample: { accountId: "ta_123", previousBalance: "140000", newBalance: "150000", currency: "USD" },
  },
  {
    type: "treasury.transfer.created",
    domain: "treasury",
    version: "v1",
    description: "A treasury transfer was initiated",
    category: "action",
    sample: { id: "trf_789", source: "ta_123", destination: "ta_456", amount: "5000", currency: "USD" },
  },
  {
    type: "treasury.transfer.completed",
    domain: "treasury",
    version: "v1",
    description: "A treasury transfer was completed",
    category: "action",
    sample: { id: "trf_789", status: "completed", settledAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "treasury.transfer.failed",
    domain: "treasury",
    version: "v1",
    description: "A treasury transfer failed",
    category: "action",
    sample: { id: "trf_789", status: "failed", reason: "Insufficient funds" },
  },
  {
    type: "treasury.reconciliation.completed",
    domain: "treasury",
    version: "v1",
    description: "A reconciliation run completed",
    category: "process",
    sample: { id: "rec_001", matched: 142, unmatched: 3, accountId: "ta_123" },
  },
  {
    type: "treasury.forecast.updated",
    domain: "treasury",
    version: "v1",
    description: "Cash forecast was recalculated",
    category: "process",
    sample: { periodStart: "2026-07-15", periodEnd: "2026-07-21", projectedBalance: "1200000" },
  },
  {
    type: "treasury.limit.exceeded",
    domain: "treasury",
    version: "v1",
    description: "A spending or risk limit was exceeded",
    category: "alert",
    sample: { limitType: "SPENDING_LIMIT", accountId: "ta_123", limit: "100000", currentUsage: "125000" },
  },
  {
    type: "accounting.transaction.posted",
    domain: "accounting",
    version: "v1",
    description: "An accounting transaction was posted",
    category: "action",
    sample: { id: "txn_456", journalId: "j_789", amount: "2500", currency: "USD", postedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "accounting.period.closed",
    domain: "accounting",
    version: "v1",
    description: "An accounting period was closed",
    category: "process",
    sample: { periodId: "p_2026_07", closedAt: "2026-07-31T23:59:59Z", status: "closed" },
  },
  {
    type: "accounting.period.reopened",
    domain: "accounting",
    version: "v1",
    description: "An accounting period was reopened",
    category: "process",
    sample: { periodId: "p_2026_07", reopenedAt: "2026-08-01T00:00:00Z" },
  },
  {
    type: "accounting.trial_balance.updated",
    domain: "accounting",
    version: "v1",
    description: "Trial balance was updated after posting",
    category: "process",
    sample: { periodId: "p_2026_07", totalDebits: "500000", totalCredits: "500000", difference: "0" },
  },
  {
    type: "journal.entry.created",
    domain: "journal",
    version: "v1",
    description: "A journal entry was created",
    category: "entity",
    sample: { id: "je_001", description: "Monthly accrual", totalAmount: "10000", lineItems: 5 },
  },
  {
    type: "journal.entry.posted",
    domain: "journal",
    version: "v1",
    description: "A journal entry was posted",
    category: "action",
    sample: { id: "je_001", postedAt: "2026-07-14T12:00:00Z", postedBy: "user_456" },
  },
  {
    type: "journal.entry.reversed",
    domain: "journal",
    version: "v1",
    description: "A journal entry was reversed",
    category: "action",
    sample: { id: "je_001", reversalId: "je_002", reversedAt: "2026-07-14T12:30:00Z" },
  },
  {
    type: "journal.entry.approved",
    domain: "journal",
    version: "v1",
    description: "A journal entry was approved",
    category: "action",
    sample: { id: "je_001", approvedBy: "user_789", approvedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "payment.created",
    domain: "payment",
    version: "v1",
    description: "A payment was initiated",
    category: "entity",
    sample: { id: "pay_001", amount: "5000", currency: "USD", beneficiary: "Vendor XYZ", method: "wire" },
  },
  {
    type: "payment.processed",
    domain: "payment",
    version: "v1",
    description: "A payment was processed successfully",
    category: "action",
    sample: { id: "pay_001", status: "processed", processedAt: "2026-07-14T12:00:00Z", reference: "REF_123" },
  },
  {
    type: "payment.failed",
    domain: "payment",
    version: "v1",
    description: "A payment failed",
    category: "action",
    sample: { id: "pay_001", status: "failed", reason: "Insufficient balance", failedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "payment.reconciled",
    domain: "payment",
    version: "v1",
    description: "A payment was reconciled with bank statement",
    category: "process",
    sample: { id: "pay_001", reconciledAt: "2026-07-14T12:00:00Z", matchId: "stmt_line_789" },
  },
  {
    type: "payment.batch.completed",
    domain: "payment",
    version: "v1",
    description: "A payment batch was completed",
    category: "process",
    sample: { batchId: "batch_001", totalAmount: "250000", paymentCount: 50, completedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "invoice.created",
    domain: "invoice",
    version: "v1",
    description: "An invoice was created",
    category: "entity",
    sample: { id: "inv_001", amount: "15000", currency: "USD", customerId: "cust_123", dueDate: "2026-08-14" },
  },
  {
    type: "invoice.updated",
    domain: "invoice",
    version: "v1",
    description: "An invoice was updated",
    category: "entity",
    sample: { id: "inv_001", status: "sent", updatedFields: ["status"] },
  },
  {
    type: "invoice.paid",
    domain: "invoice",
    version: "v1",
    description: "An invoice was paid",
    category: "action",
    sample: { id: "inv_001", amountPaid: "15000", paidAt: "2026-07-14T12:00:00Z", paymentId: "pay_002" },
  },
  {
    type: "invoice.overdue",
    domain: "invoice",
    version: "v1",
    description: "An invoice became overdue",
    category: "alert",
    sample: { id: "inv_001", dueDate: "2026-07-01", daysOverdue: 13, amount: "15000" },
  },
  {
    type: "invoice.cancelled",
    domain: "invoice",
    version: "v1",
    description: "An invoice was cancelled",
    category: "action",
    sample: { id: "inv_001", cancelledAt: "2026-07-14T12:00:00Z", reason: "Duplicated entry" },
  },
  {
    type: "invoice.credit_note.issued",
    domain: "invoice",
    version: "v1",
    description: "A credit note was issued against an invoice",
    category: "action",
    sample: { invoiceId: "inv_001", creditNoteId: "cn_001", amount: "1500", reason: "Partial return" },
  },
  {
    type: "customer.created",
    domain: "customer",
    version: "v1",
    description: "A customer was created",
    category: "entity",
    sample: { id: "cust_123", name: "Acme Corp", email: "billing@acme.com", currency: "USD" },
  },
  {
    type: "customer.updated",
    domain: "customer",
    version: "v1",
    description: "A customer was updated",
    category: "entity",
    sample: { id: "cust_123", updatedFields: ["creditLimit", "status"] },
  },
  {
    type: "customer.credit_limit.changed",
    domain: "customer",
    version: "v1",
    description: "A customer's credit limit changed",
    category: "state",
    sample: { customerId: "cust_123", previousLimit: "50000", newLimit: "75000" },
  },
  {
    type: "vendor.created",
    domain: "vendor",
    version: "v1",
    description: "A vendor was created",
    category: "entity",
    sample: { id: "vend_123", name: "Supplier Ltd", taxId: "TX-456789", paymentTerms: "NET30" },
  },
  {
    type: "vendor.updated",
    domain: "vendor",
    version: "v1",
    description: "A vendor was updated",
    category: "entity",
    sample: { id: "vend_123", updatedFields: ["bankAccount", "paymentTerms"] },
  },
  {
    type: "vendor.approval_status.changed",
    domain: "vendor",
    version: "v1",
    description: "A vendor's approval status changed",
    category: "state",
    sample: { vendorId: "vend_123", previousStatus: "pending", newStatus: "approved" },
  },
  {
    type: "asset.created",
    domain: "asset",
    version: "v1",
    description: "An asset was created",
    category: "entity",
    sample: { id: "ast_001", name: "Office Building", type: "fixed", value: "2000000", depreciationMethod: "straight-line" },
  },
  {
    type: "asset.updated",
    domain: "asset",
    version: "v1",
    description: "An asset was updated",
    category: "entity",
    sample: { id: "ast_001", updatedFields: ["value", "depreciationRate"] },
  },
  {
    type: "asset.depreciation.posted",
    domain: "asset",
    version: "v1",
    description: "Depreciation was posted for an asset",
    category: "process",
    sample: { assetId: "ast_001", period: "2026-07", amount: "8333.33", accumulatedDepreciation: "500000" },
  },
  {
    type: "asset.disposed",
    domain: "asset",
    version: "v1",
    description: "An asset was disposed",
    category: "action",
    sample: { id: "ast_001", disposedAt: "2026-07-14", disposalValue: "1500000", gainLoss: "-500000" },
  },
  {
    type: "risk.alert.triggered",
    domain: "risk",
    version: "v1",
    description: "A risk alert was triggered",
    category: "alert",
    sample: { alertId: "alert_001", type: "CONCENTRATION_RISK", severity: "high", details: "Single counterparty exposure exceeds 25%" },
  },
  {
    type: "risk.limit.approaching",
    domain: "risk",
    version: "v1",
    description: "A risk limit is being approached",
    category: "alert",
    sample: { limitType: "FX_EXPOSURE", currentUsage: "85", threshold: "80", limit: "1000000" },
  },
  {
    type: "risk.assessment.completed",
    domain: "risk",
    version: "v1",
    description: "A risk assessment was completed",
    category: "process",
    sample: { assessmentId: "ra_001", overallScore: 72, category: "counterparty", recommendations: ["Reduce exposure"] },
  },
  {
    type: "compliance.rule.violated",
    domain: "compliance",
    version: "v1",
    description: "A compliance rule was violated",
    category: "alert",
    sample: { ruleId: "cr_001", ruleName: "Anti-Money Laundering Check", severity: "critical", transactionId: "txn_789" },
  },
  {
    type: "compliance.report.generated",
    domain: "compliance",
    version: "v1",
    description: "A compliance report was generated",
    category: "process",
    sample: { reportId: "cr_001", type: "SAR", period: "2026-Q2", generatedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "compliance.framework.updated",
    domain: "compliance",
    version: "v1",
    description: "A compliance framework was updated",
    category: "entity",
    sample: { frameworkId: "fw_001", name: "SOC 2", version: "2.1", updatedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "compliance.audit.scheduled",
    domain: "compliance",
    version: "v1",
    description: "A compliance audit was scheduled",
    category: "process",
    sample: { auditId: "aud_001", type: "external", scheduledDate: "2026-08-01", framework: "ISO 27001" },
  },
  {
    type: "integration.connector.connected",
    domain: "integration",
    version: "v1",
    description: "An integration connector was connected",
    category: "state",
    sample: { connectorId: "conn_001", type: "plaid", status: "connected", connectedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "integration.connector.disconnected",
    domain: "integration",
    version: "v1",
    description: "An integration connector was disconnected",
    category: "state",
    sample: { connectorId: "conn_001", type: "sap", status: "disconnected", disconnectedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "integration.connector.health_changed",
    domain: "integration",
    version: "v1",
    description: "An integration connector's health status changed",
    category: "alert",
    sample: { connectorId: "conn_001", previousStatus: "good", newStatus: "degraded", reason: "API rate limit exceeded" },
  },
  {
    type: "integration.sync.completed",
    domain: "integration",
    version: "v1",
    description: "A data synchronization run completed",
    category: "process",
    sample: { syncId: "sync_001", connectorId: "conn_001", recordsProcessed: 1500, durationMs: 45000, status: "success" },
  },
  {
    type: "integration.sync.failed",
    domain: "integration",
    version: "v1",
    description: "A data synchronization run failed",
    category: "process",
    sample: { syncId: "sync_001", connectorId: "conn_001", error: "Authentication expired", failedAt: "2026-07-14T12:00:00Z" },
  },
  {
    type: "integration.webhook.endpoint_failed",
    domain: "integration",
    version: "v1",
    description: "A webhook endpoint is failing delivery",
    category: "alert",
    sample: { subscriptionId: "sub_001", url: "https://example.com/webhook", failureRate: "75", lastError: "Connection timeout" },
  },
  {
    type: "integration.credential.expiring",
    domain: "integration",
    version: "v1",
    description: "Integration credentials are expiring soon",
    category: "alert",
    sample: { connectorId: "conn_001", expiresAt: "2026-08-01T00:00:00Z", daysRemaining: 14 },
  },
];

export function getEventsByDomain(domain: EventDomain): EventTypeDefinition[] {
  return EVENT_TYPES.filter((e) => e.domain === domain);
}

export function getEventsByCategory(category: string): EventTypeDefinition[] {
  return EVENT_TYPES.filter((e) => e.category === category);
}

export function getEventDefinition(type: string): EventTypeDefinition | undefined {
  return EVENT_TYPES.find((e) => e.type === type);
}

export function getEventDomains(): EventDomain[] {
  return [...new Set(EVENT_TYPES.map((e) => e.domain))];
}

export function getDomainLabel(domain: EventDomain): string {
  const labels: Record<EventDomain, string> = {
    treasury: "Treasury",
    accounting: "Accounting",
    journal: "Journal",
    payment: "Payment",
    invoice: "Invoice",
    customer: "Customer",
    vendor: "Vendor",
    asset: "Asset",
    risk: "Risk",
    compliance: "Compliance",
    integration: "Integration",
  };
  return labels[domain];
}

export function getEventTypesByDomain(): Record<EventDomain, EventTypeDefinition[]> {
  const grouped: Record<string, EventTypeDefinition[]> = {};
  for (const event of EVENT_TYPES) {
    if (!grouped[event.domain]) grouped[event.domain] = [];
    grouped[event.domain].push(event);
  }
  return grouped as Record<EventDomain, EventTypeDefinition[]>;
}

export function getTotalEventTypes(): number {
  return EVENT_TYPES.length;
}
