/** Multi-level approval workflows for transactions. */

import { Prisma, TransactionStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/errors/app-error";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { ApprovalAuthorityService } from "@/modules/rbac/approval-authority.service";
import { RuleEvaluationEngine, type TransactionContext } from "@/modules/rbac/rule-evaluation.engine";
import { recordAudit } from "@/modules/audit/audit.service";
import { logger } from "@/lib/logger";
import type { LedgerLineDraft } from "@/modules/ledger/ledger.service";
import { assertBalancedLedger } from "@/modules/ledger/ledger.service";
import { postingEngine } from "@/modules/ledger/posting-engine";
import { NotificationService } from "@/modules/notifications/notifications.service";

const notificationService = new NotificationService();

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ESCALATED = "ESCALATED",
}

export enum ApprovalLevel {
  NONE = 0,
  OWNER = 100,
  ADMIN = 75,
  TREASURER = 50,
  SPECIALIST = 25,
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;

  // Trigger conditions
  minAmount: Prisma.Decimal;
  maxAmount: Prisma.Decimal | null;
  applicableTransactionTypes: string[];

  // Approval requirements
  requiredApprovalsCount: number;
  sequentialApproval: boolean;
  dualApprovalRequired: boolean;
  escalationTimeoutHours?: number | null;
  escalationPath?: string[] | null;
  autoEscalateAfterHours?: number | null;
  requiresComplianceReview: boolean;

  enabled: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionApproval {
  id: string;
  transactionId: string;
  companyId: string;

  status: string;
  approvingUserId: string | null;
  approvingUserRole: string | null;

  approvedAt?: Date | null;
  rejectionReason?: string | null;

  level: ApprovalLevel;
  sequenceNumber: number; // Order in sequential approval

  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRequirement {
  transactionId: string;
  rulesApplied: string[];
  requiredApprovals: { level: ApprovalLevel; roleRequired: string }[];
  currentApprovals: TransactionApproval[];
  isApproved: boolean;
  canBePosted: boolean;
  remainingApprovals: ApprovalLevel[];
}

export class ApprovalWorkflowEngine {
  /**
   * Determine approval requirements for a transaction.
   */
  static async getApprovalRequirements(
    transactionId: string,
    companyId: string
  ): Promise<ApprovalRequirement> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ValidationError(`Transaction ${transactionId} not found`);
    }

    // Evaluate rules to determine which apply to this transaction
    const context: TransactionContext = {
      companyId,
      amount: transaction.primaryAmount,
      transactionType: transaction.type,
      metadata: transaction.metadata as Record<string, any>,
    };

    const matchedRules = await RuleEvaluationEngine.evaluateTransaction(context);

    const rulesApplied = matchedRules.map((r) => r.ruleId);

    // Build approval requirements from matched rules
    const requiredApprovals: { level: ApprovalLevel; roleRequired: string }[] = [];
    const roleSet = new Set<string>();

    for (const rule of matchedRules) {
      for (const step of rule.approvalSteps) {
        if (!roleSet.has(step.roleRequired)) {
          roleSet.add(step.roleRequired);
          requiredApprovals.push({
            level: this.getRoleLevel(step.roleRequired),
            roleRequired: step.roleRequired,
          });
        }
      }
    }

    // Get current approvals
    const currentApprovals = await prisma.transactionApproval.findMany({
      where: {
        transactionId,
        status: ApprovalStatus.APPROVED,
      },
      orderBy: { sequenceNumber: "asc" },
    });

    const approvedRoles = new Set(currentApprovals.map((a: any) => a.approvingUserRole));

    // Determine if transaction is fully approved
    const isApproved =
      requiredApprovals.length === 0 ||
      requiredApprovals.every((req) => approvedRoles.has(req.roleRequired));

    // Determine remaining approvals
    const remainingApprovals = requiredApprovals
      .filter((req) => !approvedRoles.has(req.roleRequired))
      .map((req) => req.level);

    return {
      transactionId,
      rulesApplied,
      requiredApprovals,
      currentApprovals,
      isApproved,
      canBePosted: isApproved,
      remainingApprovals,
    };
  }

  /**
   * Create approval records for a transaction based on matching rules.
   * Returns the approval requirements if approval is needed, or null if no rules match.
   */
  static async createApprovals(
    transactionId: string,
    companyId: string,
  ): Promise<ApprovalRequirement | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new ValidationError(`Transaction ${transactionId} not found`);
    }

    const context: TransactionContext = {
      companyId,
      amount: transaction.primaryAmount,
      transactionType: transaction.type,
      metadata: transaction.metadata as Record<string, any>,
    };

    const matchedRules = await RuleEvaluationEngine.evaluateTransaction(context);
    if (matchedRules.length === 0) {
      return null;
    }

    const rulesApplied = matchedRules.map((r) => r.ruleId);

    const requiredApprovals: { level: ApprovalLevel; roleRequired: string }[] = [];
    const roleSet = new Set<string>();

    for (const rule of matchedRules) {
      for (const step of rule.approvalSteps) {
        if (!roleSet.has(step.roleRequired)) {
          roleSet.add(step.roleRequired);
          requiredApprovals.push({
            level: this.getRoleLevel(step.roleRequired),
            roleRequired: step.roleRequired,
          });
        }
      }
    }

    if (requiredApprovals.length === 0) {
      return null;
    }

    // Create TransactionApproval records
    await prisma.transactionApproval.createMany({
      data: requiredApprovals.map((req, index) => ({
        transactionId,
        companyId,
        status: ApprovalStatus.PENDING,
        level: req.level,
        sequenceNumber: index + 1,
      })),
    });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.PENDING_APPROVAL },
    });

    return {
      transactionId,
      rulesApplied,
      requiredApprovals,
      currentApprovals: [],
      isApproved: false,
      canBePosted: false,
      remainingApprovals: requiredApprovals.map((r) => r.level),
    };
  }

  /**
   * Approve a transaction approval.
   */
  static async approveTransaction(
    transactionId: string,
    companyId: string,
    approvingUserId: string,
    userRole: string
  ): Promise<ApprovalRequirement> {
    // Permission: approver must have approval rights
    await rbacService.ensurePermission(approvingUserId, companyId, "approvals.approve");
    const userLevel = this.getRoleLevel(userRole);

    // Fetch transaction to check amount and type
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ValidationError(`Transaction ${transactionId} not found`);
    }

    // Check if user has approval authority for this transaction
    const hasAuthority = await ApprovalAuthorityService.userHasApprovalAuthority(
      approvingUserId,
      companyId,
      transaction.primaryAmount,
      transaction.type,
      undefined,
    );

    if (!hasAuthority) {
      throw new ForbiddenError(
        "You do not have sufficient approval authority for this transaction."
      );
    }

    // Find pending approval for this transaction at this or higher level
    let approval = await prisma.transactionApproval.findFirst({
      where: {
        transactionId,
        companyId,
        status: ApprovalStatus.PENDING,
        level: { lte: userLevel },
      },
      orderBy: { sequenceNumber: "asc" },
    });

    if (!approval) {
      throw new ForbiddenError(
        "No pending approval found for your role."
      );
    }

    // Update approval
    await prisma.transactionApproval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.APPROVED,
        approvingUserId,
        approvingUserRole: userRole,
        approvedAt: new Date(),
      },
    });

    await notificationService.send({
      companyId,
      userId: approvingUserId,
      eventType: "APPROVAL_COMPLETED",
      title: "Approval Submitted",
      message: `You approved transaction #${transactionId.slice(0, 8)}`,
      link: `/transactions/${transactionId}`,
      metadata: { transactionId, action: "approved" },
    }).catch((err) => { logger.error(err, "Failed to send approval completed notification"); });

    return this.getApprovalRequirements(transactionId, companyId);
  }

  /**
   * Reject a transaction approval.
   */
  static async rejectTransaction(
    transactionId: string,
    companyId: string,
    approvingUserId: string,
    userRole: string,
    reason: string
  ): Promise<void> {
    // Permission: approver must have rejection rights
    await rbacService.ensurePermission(approvingUserId, companyId, "approvals.reject");
    const userLevel = this.getRoleLevel(userRole);

    // Fetch transaction to check amount and type
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ValidationError(`Transaction ${transactionId} not found`);
    }

    // Check if user has approval authority to reject this transaction
    const hasAuthority = await ApprovalAuthorityService.userHasApprovalAuthority(
      approvingUserId,
      companyId,
      transaction.primaryAmount,
      transaction.type,
      undefined, // walletId - not directly on transaction
    );

    if (!hasAuthority) {
      throw new ForbiddenError(
        "You do not have sufficient authority to reject this transaction."
      );
    }

    const approval = await prisma.transactionApproval.findFirst({
      where: {
        transactionId,
        status: ApprovalStatus.PENDING,
        level: { lte: userLevel },
      },
    });

    if (!approval) {
      throw new ForbiddenError(
        "No pending approval found for your role."
      );
    }

    // Reject all pending approvals
    await prisma.transactionApproval.updateMany({
      where: {
        transactionId,
        status: ApprovalStatus.PENDING,
      },
      data: {
        status: ApprovalStatus.REJECTED,
        rejectionReason: reason,
        approvingUserId,
        updatedAt: new Date(),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: approvingUserId,
        action: "TRANSACTION_REJECTED",
        resourceType: "Transaction",
        resourceId: transactionId,
        severity: "WARNING",
        metadata: { reason },
      },
    });

    await notificationService.send({
      companyId,
      eventType: "APPROVAL_REJECTED",
      title: "Transaction Rejected",
      message: `Transaction #${transactionId.slice(0, 8)} was rejected. Reason: ${reason}`,
      link: `/transactions/${transactionId}`,
      metadata: { transactionId, reason, rejectedBy: approvingUserId },
    }).catch((err) => { logger.error(err, "Failed to send approval rejected notification"); });
  }

  /**
   * Escalate transaction to higher authority.
   */
  static async escalateTransaction(
    transactionId: string,
    companyId: string,
    escalatingUserId: string,
    reason: string
  ): Promise<void> {
    // Permission: escalator must have escalate rights
    await rbacService.ensurePermission(escalatingUserId, companyId, "approvals.escalate");
    const approval = await prisma.transactionApproval.findFirst({
      where: {
        transactionId,
        status: ApprovalStatus.PENDING,
      },
    });

    if (!approval) {
      throw new ConflictError(`Transaction has no pending approval to escalate`);
    }

    // Update to escalated
    await prisma.transactionApproval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.ESCALATED,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: escalatingUserId,
        action: "TRANSACTION_ESCALATED",
        resourceType: "Transaction",
        resourceId: transactionId,
        severity: "INFO",
        metadata: { reason },
      },
    });
  }

  /**
   * Execute the stored ledger lines for a fully-approved transaction.
   * Called after all required approvals have been collected.
   */
  static async completeTransaction(
    transactionId: string,
    companyId: string,
  ): Promise<{ completed: boolean; error?: string }> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { completed: false, error: "Transaction not found" };
    }

    if (transaction.status !== TransactionStatus.PENDING_APPROVAL) {
      return { completed: false, error: `Transaction status is ${transaction.status}, not PENDING_APPROVAL` };
    }

    const metadata = transaction.metadata as Record<string, unknown> | null;
    const rawLines = metadata?.ledgerLines as Array<{
      walletId: string;
      side: string;
      amount: number;
      currency: string;
      sequence: number;
    }> | undefined;

    if (!rawLines || rawLines.length === 0) {
      return { completed: false, error: "No ledger lines found in transaction metadata" };
    }

    const lines: LedgerLineDraft[] = rawLines.map((l) => ({
      walletId: l.walletId,
      side: l.side as "DEBIT" | "CREDIT",
      amount: new Prisma.Decimal(l.amount),
      currency: l.currency,
      sequence: l.sequence,
    }));

    try {
      await prisma.$transaction(async (tx) => {
        const uniqueCurrencies = new Set(lines.map((l) => l.currency));
        if (uniqueCurrencies.size === 1) {
          assertBalancedLedger(lines);
        }

        const currency = lines[0]?.currency ?? "USD";

        // Use shared PostingEngine for ledger writes with row locks + version checks
        await postingEngine.postLedgerLines(tx, companyId, transactionId, currency, lines);

        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: TransactionStatus.COMPLETED },
        });

        await recordAudit(tx, {
          companyId,
          actorUserId: null,
          action: "TRANSACTION_APPROVAL_COMPLETED",
          resourceType: "Transaction",
          resourceId: transactionId,
          metadata: { previousStatus: TransactionStatus.PENDING_APPROVAL },
        });
      });

      return { completed: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.FAILED },
      }).catch((err) => { logger.error(err, "Failed to mark transaction as FAILED"); });
      return { completed: false, error: message };
    }
  }

  /**
   * Get approval statistics for a company.
   */
  static async getStatistics(companyId: string): Promise<Record<string, any>> {
    const pending = await prisma.transactionApproval.count({
      where: { companyId, status: ApprovalStatus.PENDING },
    });

    const approved = await prisma.transactionApproval.count({
      where: { companyId, status: ApprovalStatus.APPROVED },
    });

    const rejected = await prisma.transactionApproval.count({
      where: { companyId, status: ApprovalStatus.REJECTED },
    });

    const escalated = await prisma.transactionApproval.count({
      where: { companyId, status: ApprovalStatus.ESCALATED },
    });

    return {
      pending,
      approved,
      rejected,
      escalated,
      total: pending + approved + rejected + escalated,
    };
  }

  // ============= HELPERS =============

  static getRoleLevel(role: string): ApprovalLevel {
    const roleMap: Record<string, ApprovalLevel> = {
      OWNER: ApprovalLevel.OWNER,
      ADMIN: ApprovalLevel.ADMIN,
      TREASURER: ApprovalLevel.TREASURER,
      SPECIALIST: ApprovalLevel.SPECIALIST,
    };

    return roleMap[role] || ApprovalLevel.SPECIALIST;
  }

  static getLevelName(level: ApprovalLevel): string {
    const nameMap: Record<ApprovalLevel, string> = {
      [ApprovalLevel.OWNER]: "OWNER",
      [ApprovalLevel.ADMIN]: "ADMIN",
      [ApprovalLevel.TREASURER]: "TREASURER",
      [ApprovalLevel.SPECIALIST]: "SPECIALIST",
      [ApprovalLevel.NONE]: "NONE",
    };

    return nameMap[level] || "UNKNOWN";
  }
}
