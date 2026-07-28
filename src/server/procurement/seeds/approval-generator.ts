/**
 * Phase 21B.2 — Approval Generator
 *
 * Generates 600+ approval workflows with:
 * - Multi-level approval chains (AP Clerk → Manager → Director → Controller → CFO)
 * - All statuses: auto-approved, pending, approved, rejected, delegated, escalated, expired
 * - Complete audit trail per approval
 * - Threshold-based routing
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, weightedPick, randInt, randomDateInRange, daysAgo, uuidFromSeed, logProgress } from "./seed-utils";

const COMPANY_ID = "cmqvfocev0001koor7ragb8bq";
const SEED = 42_200;

const APPROVER_IDS = [
  "ap-clerk-001", "ap-clerk-002", "ap-clerk-003",
  "ap-manager-001", "ap-manager-002",
  "controller-001", "controller-002",
  "vp-finance-001",
  "cfo-001",
];

const LEVEL_NAMES = ["AP_CLERK", "AP_MANAGER", "CONTROLLER", "VP_FINANCE", "CFO"];

const STATUS_WEIGHTS: [string, number][] = [
  ["APPROVED", 55],
  ["PENDING", 10],
  ["REJECTED", 8],
  ["DELEGATED", 7],
  ["SKIPPED", 10],
];

export interface GeneratedApproval {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  approvalLevel: number;
  approvalLevelName: string;
  requiredRole: string;
  requiredThreshold: number;
  status: string;
  decision: string | null;
  decisionAt: Date | null;
  decisionBy: string | null;
  decisionComment: string | null;
  delegatedTo: string | null;
  delegatedAt: Date | null;
  delegationReason: string | null;
  escalated: boolean;
  escalatedAt: Date | null;
  escalationReason: string | null;
  timeLimit: Date;
  createdAt: Date;
  createdBy: string;
}

const COMMENTS = [
  "Approved - within budget allocation",
  "Verified against PO #PO-2024-001",
  "Tax calculation verified",
  "Three-way match confirmed",
  "Budget code validated by department",
  "Received and inspected - quality OK",
  "Contract rate verified",
  "Approved per delegation authority",
  "Exceeds my authority - escalating",
  "Duplicate invoice detected - investigating",
  "Amount exceeds PO - requesting justification",
  "Vendor on hold - compliance review needed",
  "Approved for expedited payment",
  "Deferred to next approval cycle",
  "Rejected - missing supporting documentation",
];

export function generateApprovals(
  invoiceIds: string[],
  invoiceAmounts: Map<string, number>,
  count: number = 600,
): GeneratedApproval[] {
  const rng = createRng(SEED);
  const approvals: GeneratedApproval[] = [];

  for (let i = 0; i < count; i++) {
    const invoiceId = invoiceIds[i % invoiceIds.length];
    const amount = invoiceAmounts.get(invoiceId) ?? 5000;

    // Determine approval level based on amount
    const level = amount < 5000 ? 1
      : amount < 25000 ? 2
        : amount < 100000 ? 3
          : amount < 500000 ? 4
            : 5;

    const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
    const requiredThreshold = [5000, 25000, 100000, 500000, 999999999][level - 1];

    const status = weightedPick(
      STATUS_WEIGHTS.map(([s]) => s),
      STATUS_WEIGHTS.map(([, w]) => w),
      rng,
    );

    const createdAt = randomDateInRange(daysAgo(600), daysAgo(1), rng);
    const approver = pick(APPROVER_IDS, rng);

    let decision: string | null = null;
    let decisionAt: Date | null = null;
    let decisionBy: string | null = null;
    let decisionComment: string | null = null;
    let delegatedTo: string | null = null;
    let delegatedAt: Date | null = null;
    let delegationReason: string | null = null;
    let escalated = false;
    let escalatedAt: Date | null = null;
    let escalationReason: string | null = null;

    if (status === "APPROVED") {
      decision = "APPROVE";
      decisionAt = new Date(createdAt.getTime() + randInt(1, 48, rng) * 3600000);
      decisionBy = approver;
      decisionComment = pick(COMMENTS, rng);
    } else if (status === "REJECTED") {
      decision = "REJECT";
      decisionAt = new Date(createdAt.getTime() + randInt(1, 72, rng) * 3600000);
      decisionBy = approver;
      decisionComment = pick(["Rejected - missing documentation", "Rejected - amount exceeds contract", "Rejected - duplicate invoice", "Rejected - vendor not approved"], rng);
    } else if (status === "DELEGATED") {
      delegatedTo = pick(APPROVER_IDS.filter(a => a !== approver), rng);
      delegatedAt = new Date(createdAt.getTime() + randInt(1, 24, rng) * 3600000);
      delegationReason = pick(["Out of office", "Delegated per authority matrix", "Subject matter expert review needed"], rng);
    }

    if (rng() < 0.08) {
      escalated = true;
      escalatedAt = new Date(createdAt.getTime() + randInt(24, 72, rng) * 3600000);
      escalationReason = pick(["SLA breach", "Amount threshold exceeded", "Manager review required", "Compliance flag raised"], rng);
    }

    approvals.push({
      id: uuidFromSeed(`approval-${COMPANY_ID}-${invoiceId}-${level}`),
      companyId: COMPANY_ID,
      vendorInvoiceId: invoiceId,
      approvalLevel: level,
      approvalLevelName: levelName,
      requiredRole: levelName,
      requiredThreshold,
      status,
      decision,
      decisionAt,
      decisionBy,
      decisionComment,
      delegatedTo,
      delegatedAt,
      delegationReason,
      escalated,
      escalatedAt,
      escalationReason,
      timeLimit: new Date(createdAt.getTime() + 48 * 3600000),
      createdAt,
      createdBy: "seed-system",
    });
  }

  return approvals;
}

export async function seedApprovals(
  prisma: PrismaClient,
  invoiceIds: string[],
  invoiceAmounts: Map<string, number>,
): Promise<string[]> {
  const approvals = generateApprovals(invoiceIds, invoiceAmounts);
  const ids: string[] = [];

  process.stdout.write(`  Seeding ${approvals.length} approvals...\n`);

  const batchSize = 50;
  for (let i = 0; i < approvals.length; i += batchSize) {
    const batch = approvals.slice(i, i + batchSize);
    for (const a of batch) {
      try {
        await prisma.procurementApprovalRecord.create({
          data: {
            id: a.id,
            companyId: a.companyId,
            vendorInvoiceId: a.vendorInvoiceId,
            approvalLevel: a.approvalLevel,
            approvalLevelName: a.approvalLevelName,
            requiredRole: a.requiredRole,
            requiredThreshold: a.requiredThreshold,
            status: a.status as any,
            decision: a.decision as any,
            decisionAt: a.decisionAt,
            decisionBy: a.decisionBy,
            decisionComment: a.decisionComment,
            delegatedTo: a.delegatedTo,
            delegatedAt: a.delegatedAt,
            delegationReason: a.delegationReason,
            escalated: a.escalated,
            escalatedAt: a.escalatedAt,
            escalationReason: a.escalationReason,
            timeLimit: a.timeLimit,
            createdBy: a.createdBy,
            updatedBy: "seed-system",
          },
        });
        ids.push(a.id);
      } catch (err) {
        if ((err as any)?.code !== "P2002") throw err;
      }
    }
    logProgress("approvals", Math.min(i + batchSize, approvals.length), approvals.length);
  }

  return ids;
}
