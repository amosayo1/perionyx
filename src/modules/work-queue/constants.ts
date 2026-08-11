export type VendorInvoiceStatus =
  | "DRAFT"
  | "CAPTURED"
  | "VALIDATING"
  | "VALIDATED"
  | "THREE_WAY_MATCHING"
  | "MATCHED"
  | "MATCH_FAILED"
  | "EXCEPTION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOIDED";

export const HIGH_VALUE_THRESHOLD = 25000;

export const PENDING_STATUSES: VendorInvoiceStatus[] = [
  "PENDING_APPROVAL",
  "VALIDATING",
  "VALIDATED",
  "THREE_WAY_MATCHING",
];

export const WORK_QUEUE_STATUS_LABELS: Record<VendorInvoiceStatus, string> = {
  DRAFT: "Draft",
  CAPTURED: "Captured",
  VALIDATING: "Validating",
  VALIDATED: "Validated",
  THREE_WAY_MATCHING: "Matching",
  MATCHED: "Matched",
  MATCH_FAILED: "Match Failed",
  EXCEPTION: "Exception",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  VOIDED: "Voided",
};
