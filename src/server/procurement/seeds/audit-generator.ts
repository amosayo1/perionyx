/**
 * Phase 21B.2 — Audit Generator
 *
 * Generates 20,000+ audit records covering:
 * - Every invoice lifecycle event (create, status change, approve, pay)
 * - Every exception event (create, assign, resolve, escalate)
 * - Every payment event (propose, approve, execute, confirm)
 * - Every approval event (create, decide, delegate, escalate)
 * - Complete chronological audit trail
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, weightedPick, randInt, randFloat, randomDateInRange, daysAgo, uuidFromSeed, logProgress, roundToCents } from "./seed-utils";

const COMPANY_ID = "cmqvfocev0001koor7ragb8bq";
const SEED = 42_500;

const ACTIONS = [
  "CREATED", "UPDATED", "STATUS_CHANGED", "APPROVED", "REJECTED",
  "VOIDED", "PAID", "EXCEPTION", "RESOLVED", "DELEGATED",
  "ESCALATED", "CONFIG_CHANGED",
] as const;

const ENTITY_TYPES = [
  "VendorInvoice", "InvoiceException", "ApprovalRecord",
  "PaymentProposal", "PaymentBatch", "PaymentRecord",
  "Vendor", "VendorCredit", "VendorStatement",
] as const;

const USERS = [
  "seed-system", "ap-clerk-001", "ap-clerk-002", "ap-clerk-003",
  "ap-manager-001", "ap-manager-002", "controller-001", "controller-002",
  "vp-finance-001", "cfo-001",
];

const USER_ROLES: Record<string, string> = {
  "seed-system": "SYSTEM",
  "ap-clerk-001": "AP_CLERK", "ap-clerk-002": "AP_CLERK", "ap-clerk-003": "AP_CLERK",
  "ap-manager-001": "AP_MANAGER", "ap-manager-002": "AP_MANAGER",
  "controller-001": "CONTROLLER", "controller-002": "CONTROLLER",
  "vp-finance-001": "VP_FINANCE", "cfo-001": "CFO",
};

const DESCRIPTIONS: Record<string, string[]> = {
  CREATED: ["Invoice received and captured", "Exception recorded", "Approval initiated", "Payment proposed"],
  UPDATED: ["Invoice details corrected", "Payment terms updated", "Vendor information modified"],
  STATUS_CHANGED: ["Status transitioned", "Workflow step advanced", "Payment status updated"],
  APPROVED: ["Invoice approved for payment", "Proposal approved", "Batch approved"],
  REJECTED: ["Invoice rejected - documentation required", "Proposal rejected - budget exceeded"],
  VOIDED: ["Invoice voided - duplicate detected", "Payment reversed"],
  PAID: ["Payment processed", "Payment cleared by bank", "ACH transfer completed"],
  EXCEPTION: ["Price variance detected", "Duplicate invoice flagged", "Missing PO reference"],
  RESOLVED: ["Exception resolved - variance accepted", "Dispute resolved in vendor favor"],
  DELEGATED: ["Approval delegated to backup", "Review assigned to specialist"],
  ESCALATED: ["SLA breach - escalated to management", "Amount threshold exceeded - escalated"],
  CONFIG_CHANGED: ["Matching tolerance updated", "Approval threshold changed", "Auto-approve limit modified"],
};

const IP_ADDRESSES = [
  "10.0.1.100", "10.0.1.101", "10.0.1.102", "10.0.1.103",
  "192.168.1.50", "172.16.0.20", "10.0.2.150", "10.0.3.200",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "PerionyxAPIClient/1.0",
];

export interface GeneratedAuditRecord {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  amount: number | null;
  description: string;
  reason: string | null;
  userId: string;
  userRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export function generateAuditRecords(
  invoiceIds: string[],
  exceptionIds: string[],
  approvalIds: string[],
  proposalIds: string[],
  vendorIds: string[],
  targetCount: number = 22000,
): GeneratedAuditRecord[] {
  const rng = createRng(SEED);
  const records: GeneratedAuditRecord[] = [];

  const entityCounts: [string, number][] = [
    ["VendorInvoice", Math.floor(targetCount * 0.45)],
    ["InvoiceException", Math.floor(targetCount * 0.15)],
    ["ApprovalRecord", Math.floor(targetCount * 0.15)],
    ["PaymentProposal", Math.floor(targetCount * 0.08)],
    ["PaymentBatch", Math.floor(targetCount * 0.05)],
    ["PaymentRecord", Math.floor(targetCount * 0.05)],
    ["Vendor", Math.floor(targetCount * 0.04)],
    ["VendorCredit", Math.floor(targetCount * 0.015)],
    ["VendorStatement", Math.floor(targetCount * 0.005)],
  ];

  for (const [entityType, count] of entityCounts) {
    const entityIds = entityType === "VendorInvoice" ? invoiceIds
      : entityType === "InvoiceException" ? exceptionIds
        : entityType === "ApprovalRecord" ? approvalIds
          : entityType === "PaymentProposal" ? proposalIds
            : vendorIds;

    for (let i = 0; i < count; i++) {
      const entityId = entityIds[i % entityIds.length];
      const action = pick(ACTIONS, rng);
      const user = pick(USERS, rng);
      const createdAt = randomDateInRange(daysAgo(730), daysAgo(1), rng);

      const actionDescs = DESCRIPTIONS[action] || ["System event"];
      const description = pick(actionDescs, rng);

      const hasField = rng() < 0.4;
      const field = hasField ? pick(["status", "amount", "paymentTerms", "assignedTo", "resolution", "description", "riskLevel", "currency"], rng) : null;

      const hasAmount = rng() < 0.3;
      const amount = hasAmount ? roundToCents(randFloat(50, 100000, rng)) : null;

      const hasReason = ["REJECTED", "VOIDED", "RESOLVED", "ESCALATED"].includes(action) && rng() < 0.6;
      const reason = hasReason ? pick([
        "Budget exceeded", "Duplicate detected", "SLA breach", "Documentation incomplete",
        "Vendor dispute", "Policy violation", "Threshold exceeded", "Manual review required",
      ], rng) : null;

      const hasMetadata = rng() < 0.25;
      const metadata = hasMetadata ? {
        source: pick(["web", "api", "webhook", "scheduler"], rng),
        sessionId: uuidFromSeed(`session-${user}-${i}`),
        ipLocation: pick(["US-East", "US-West", "EU-West", "APAC"], rng),
      } : null;

      records.push({
        id: uuidFromSeed(`audit-${COMPANY_ID}-${entityType}-${i}`),
        companyId: COMPANY_ID,
        entityType,
        entityId,
        action,
        field,
        oldValue: hasField ? pick(["OPEN", "DRAFT", "PENDING", "null"], rng) : null,
        newValue: hasField ? pick(["IN_REVIEW", "APPROVED", "RESOLVED", "PAID"], rng) : null,
        amount,
        description,
        reason,
        userId: user,
        userRole: USER_ROLES[user] || "SYSTEM",
        ipAddress: rng() < 0.7 ? pick(IP_ADDRESSES, rng) : null,
        userAgent: pick(USER_AGENTS, rng),
        correlationId: uuidFromSeed(`corr-${entityType}-${i}-${createdAt.getTime()}`),
        metadata,
        createdAt,
      });
    }
  }

  records.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return records;
}

export async function seedAuditRecords(
  prisma: PrismaClient,
  invoiceIds: string[],
  exceptionIds: string[],
  approvalIds: string[],
  proposalIds: string[],
  vendorIds: string[],
): Promise<void> {
  const records = generateAuditRecords(invoiceIds, exceptionIds, approvalIds, proposalIds, vendorIds);
  process.stdout.write(`  Seeding ${records.length} audit records...\n`);

  const batchSize = 200;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await prisma.procurementAPAuditRecord.createMany({
      data: batch.map(r => ({
        id: r.id,
        companyId: r.companyId,
        entityType: r.entityType,
        entityId: r.entityId,
        action: r.action as any,
        field: r.field,
        oldValue: r.oldValue,
        newValue: r.newValue,
        amount: r.amount ?? null,
        description: r.description,
        reason: r.reason,
        userId: r.userId,
        userRole: r.userRole,
        ipAddress: r.ipAddress,
        userAgent: r.userAgent,
        correlationId: r.correlationId,
        metadata: (r.metadata as any) ?? null,
        createdAt: r.createdAt,
      })),
      skipDuplicates: true,
    });
    logProgress("audit", Math.min(i + batchSize, records.length), records.length);
  }
}
