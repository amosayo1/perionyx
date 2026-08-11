import type { UrgencyLevel, PrioritySignals } from "./types";

const OVERDUE_HIGH_THRESHOLD = 10;
const OVERDUE_MEDIUM_THRESHOLD = 3;
const HIGH_RISK_EXCEPTION_THRESHOLD = 5;
const BLOCKED_HIGH_THRESHOLD = 3;
const INVOICE_AGE_CRITICAL_DAYS = 30;
const INVOICE_AGE_HIGH_DAYS = 14;

export function calculateCategoryUrgency(signals: PrioritySignals): UrgencyLevel {
  let score = 0;

  if (signals.overdueInvoices >= OVERDUE_HIGH_THRESHOLD) score += 4;
  else if (signals.overdueInvoices >= OVERDUE_MEDIUM_THRESHOLD) score += 2;
  else if (signals.overdueInvoices > 0) score += 1;

  if (signals.openExceptions >= HIGH_RISK_EXCEPTION_THRESHOLD) score += 3;
  else if (signals.openExceptions > 0) score += 2;

  if (signals.blockedInvoices >= BLOCKED_HIGH_THRESHOLD) score += 3;
  else if (signals.blockedInvoices > 0) score += 1;

  if (signals.approvalSlaBreachedCount > 0) score += 2;

  if (signals.oldestInvoiceAgeDays >= INVOICE_AGE_CRITICAL_DAYS) score += 4;
  else if (signals.oldestInvoiceAgeDays >= INVOICE_AGE_HIGH_DAYS) score += 2;

  if (signals.paymentsDueTodayCount > 0) score += 2;

  if (signals.supplierRiskCount > 0) score += 1;

  if (score >= 8) return "critical";
  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function getDefaultSignals(): PrioritySignals {
  return {
    overdueInvoices: 0,
    paymentsDueTodayCount: 0,
    openExceptions: 0,
    blockedInvoices: 0,
    supplierRiskCount: 0,
    approvalSlaBreachedCount: 0,
    oldestInvoiceAgeDays: 0,
    totalPendingInvoices: 0,
  };
}
