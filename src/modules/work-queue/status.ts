import type { WorkQueuePriority, WorkQueueSlaStatus } from "./types";
import { HIGH_VALUE_THRESHOLD, WORK_QUEUE_STATUS_LABELS, type VendorInvoiceStatus } from "./constants";

const SLA_AT_RISK_WINDOW_DAYS = 3;
const CRITICAL_INVOICE_AGE_DAYS = 30;
const MS_PER_DAY = 86400000;

export const WORK_QUEUE_SLA_LABELS: Record<WorkQueueSlaStatus, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  breached: "Breached",
};

export function toWorkQueueStatusLabel(status: string): string {
  return WORK_QUEUE_STATUS_LABELS[status as VendorInvoiceStatus] ?? status;
}

export function toWorkQueueSlaLabel(status: WorkQueueSlaStatus | string): string {
  return WORK_QUEUE_SLA_LABELS[status as WorkQueueSlaStatus] ?? status;
}

export function workQueueStatusToNextAction(status: string): string {
  switch (status) {
    case "Pending Approval":
      return "Review & Approve";
    case "Exception":
      return "Resolve Exception";
    case "Validating":
      return "Review Details";
    case "Validated":
      return "Review & Approve";
    case "Matched":
      return "Review & Approve";
    case "Match Failed":
      return "Review Match";
    case "Captured":
      return "Process Invoice";
    default:
      return "Review";
  }
}

export function deriveSlaStatus(dueDate: Date, todayStart: Date): WorkQueueSlaStatus {
  if (dueDate < todayStart) return "breached";
  if (dueDate < new Date(todayStart.getTime() + SLA_AT_RISK_WINDOW_DAYS * MS_PER_DAY)) return "at-risk";
  return "on-track";
}

export function derivePriority(input: {
  totalAmount: number;
  dueDate: Date;
  todayStart: Date;
  invoiceAgeDays: number;
}): WorkQueuePriority {
  if (input.totalAmount >= HIGH_VALUE_THRESHOLD) return "critical";
  if (input.dueDate < input.todayStart) return "high";
  if (input.invoiceAgeDays > CRITICAL_INVOICE_AGE_DAYS) return "high";
  return "medium";
}
