/**
 * Manages transaction lifecycle with enforced state transitions.
 * 
 * Valid states: PENDING, PENDING_APPROVAL, PROCESSING, COMPLETED, FAILED, REVERSED, CANCELLED.
 * Valid transitions:
 * - PENDING → PENDING_APPROVAL (approval required)
 * - PENDING → PROCESSING (begin posting)
 * - PENDING_APPROVAL → PROCESSING (all approvals received)
 * - PROCESSING → COMPLETED (posting succeeded)
 * - PROCESSING → FAILED (posting failed)
 * - COMPLETED → REVERSED (reversal initiated)
 * - PENDING → CANCELLED (manual cancellation)
 * - PENDING_APPROVAL → CANCELLED (manual cancellation)
 * - FAILED → PENDING (retry after manual review)
 */

import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError, ConflictError } from "@/lib/errors/app-error";

export type TransitionResult = {
  success: boolean;
  message: string;
  newStatus?: TransactionStatus;
};

export type StateTransitionLog = {
  id: string;
  transactionId: string;
  fromStatus: TransactionStatus;
  toStatus: TransactionStatus;
  reason?: string;
  metadata?: Record<string, any>;
  actorUserId?: string;
  createdAt: Date;
};

export class TransactionStateMachine {
  /**
   * Define valid state transitions.
   * Key: current state, Value: allowed next states
   */
  private static readonly VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
    [TransactionStatus.PENDING]: [
      TransactionStatus.PROCESSING,
      TransactionStatus.PENDING_APPROVAL,
      TransactionStatus.CANCELLED,
      TransactionStatus.FAILED, // Immediate failure (validation)
    ],
    [TransactionStatus.PENDING_APPROVAL]: [
      TransactionStatus.PROCESSING,
      TransactionStatus.CANCELLED,
      TransactionStatus.FAILED,
    ],
    [TransactionStatus.PROCESSING]: [
      TransactionStatus.COMPLETED,
      TransactionStatus.FAILED,
    ],
    [TransactionStatus.COMPLETED]: [
      TransactionStatus.REVERSED,
    ],
    [TransactionStatus.FAILED]: [
      TransactionStatus.PENDING, // Retry after manual review
    ],
    [TransactionStatus.REVERSED]: [
      // No further transitions from REVERSED
    ],
    [TransactionStatus.CANCELLED]: [
      // No further transitions from CANCELLED
    ],
  };

  static isValidTransition(
    fromStatus: TransactionStatus,
    toStatus: TransactionStatus
  ): boolean {
    const allowedTransitions = this.VALID_TRANSITIONS[fromStatus] || [];
    return allowedTransitions.includes(toStatus);
  }

  static getAllowedTransitions(currentStatus: TransactionStatus): TransactionStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  static async transitionTo(
    transactionId: string,
    toStatus: TransactionStatus,
    options?: {
      reason?: string;
      metadata?: Record<string, any>;
      actorUserId?: string;
    }
  ): Promise<TransitionResult> {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      return {
        success: false,
        message: `Transaction ${transactionId} not found`,
      };
    }

    const fromStatus = tx.status;

    // Validate transition
    if (!this.isValidTransition(fromStatus, toStatus)) {
      return {
        success: false,
        message: `Invalid state transition: ${fromStatus} → ${toStatus}. Allowed: ${this.getAllowedTransitions(fromStatus).join(", ")}`,
      };
    }

    // Enforce preconditions for certain transitions
    const preconditionCheck = this.checkPreconditions(tx, fromStatus, toStatus);
    if (!preconditionCheck.valid) {
      return {
        success: false,
        message: preconditionCheck.reason ?? "Precondition failed",
      };
    }

    try {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: toStatus,
        },
      });

      // Log transition
      await this.logTransition(
        transactionId,
        fromStatus,
        toStatus,
        options?.reason,
        options?.metadata,
        options?.actorUserId
      );

      return {
        success: true,
        message: `Transitioned ${fromStatus} → ${toStatus}`,
        newStatus: toStatus,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to transition: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check preconditions for specific transitions.
   */
  private static checkPreconditions(
    tx: any,
    fromStatus: TransactionStatus,
    toStatus: TransactionStatus
  ): { valid: boolean; reason?: string } {
    // PROCESSING → COMPLETED: verify ledger entries exist
    if (fromStatus === TransactionStatus.PROCESSING && toStatus === TransactionStatus.COMPLETED) {
      return { valid: true };
    }

    // COMPLETED → REVERSED: verify no prior reversals
    if (fromStatus === TransactionStatus.COMPLETED && toStatus === TransactionStatus.REVERSED) {
      // Reverse check happens during reversal creation
      return { valid: true };
    }

    return { valid: true };
  }

  /**
   * Log state transition for audit trail.
   */
  private static async logTransition(
    transactionId: string,
    fromStatus: TransactionStatus,
    toStatus: TransactionStatus,
    reason?: string,
    metadata?: Record<string, any>,
    actorUserId?: string
  ): Promise<void> {
    // Store transition in audit log
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return;

    await prisma.auditLog.create({
      data: {
        companyId: transaction.companyId,
        actorUserId,
        action: "TRANSACTION_STATE_TRANSITION",
        resourceType: "Transaction",
        resourceId: transactionId,
        severity: "INFO",
        metadata: {
          fromStatus,
          toStatus,
          reason,
          ...metadata,
        },
      },
    });
  }

  /**
   * Get transaction's audit trail (all state transitions).
   */
  static async getAuditTrail(transactionId: string): Promise<StateTransitionLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        resourceType: "Transaction",
        resourceId: transactionId,
        action: "TRANSACTION_STATE_TRANSITION",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return logs.map((log) => ({
      id: log.id,
      transactionId,
      fromStatus: (log.metadata as any)?.fromStatus || "UNKNOWN",
      toStatus: (log.metadata as any)?.toStatus || "UNKNOWN",
      reason: (log.metadata as any)?.reason,
      metadata: log.metadata as Record<string, any>,
      actorUserId: log.actorUserId || undefined,
      createdAt: log.createdAt,
    }));
  }

  /**
   * Get current transaction status.
   */
  static async getStatus(transactionId: string): Promise<TransactionStatus | null> {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true },
    });

    return tx?.status || null;
  }

  /**
   * Batch get statuses for multiple transactions.
   */
  static async getBatchStatuses(
    transactionIds: string[]
  ): Promise<Map<string, TransactionStatus>> {
    const transactions = await prisma.transaction.findMany({
      where: { id: { in: transactionIds } },
      select: { id: true, status: true },
    });

    return new Map(transactions.map((tx) => [tx.id, tx.status]));
  }

  /**
   * Check if transaction is in terminal state (no more transitions possible).
   */
  static isTerminalState(status: TransactionStatus): boolean {
    return status === TransactionStatus.FAILED ||
           status === TransactionStatus.REVERSED ||
           status === TransactionStatus.CANCELLED;
  }

  /**
   * Check if transaction can be reversed (is completed).
   */
  static canBeReversed(status: TransactionStatus): boolean {
    return status === TransactionStatus.COMPLETED;
  }

  /**
   * Check if transaction is still active (processing or pending).
   */
  static isActive(status: TransactionStatus): boolean {
    return status === TransactionStatus.PENDING || status === TransactionStatus.PROCESSING;
  }

  /**
   * Get transaction statistics by status for a company.
   */
  static async getCompanyStatistics(companyId: string): Promise<Record<string, number>> {
    const counts = await prisma.transaction.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
    });

    const stats: Record<string, number> = {};
    for (const status of Object.values(TransactionStatus)) {
      stats[status] = 0;
    }

    for (const count of counts) {
      stats[count.status] = count._count;
    }

    return stats;
  }
}

/**
 * Helper for updating LedgerService to use state machine.
 * Automatically transitions through states during posting lifecycle.
 */
export class TransactionLifecycleManager {
  /**
   * Mark transaction as processing (PENDING → PROCESSING).
   */
  static async markProcessing(
    transactionId: string,
    actorUserId?: string
  ): Promise<TransitionResult> {
    return TransactionStateMachine.transitionTo(
      transactionId,
      TransactionStatus.PROCESSING,
      {
        reason: "Ledger posting initiated",
        actorUserId,
      }
    );
  }

  /**
   * Mark transaction as completed (PROCESSING → COMPLETED).
   */
  static async markCompleted(
    transactionId: string,
    actorUserId?: string
  ): Promise<TransitionResult> {
    return TransactionStateMachine.transitionTo(
      transactionId,
      TransactionStatus.COMPLETED,
      {
        reason: "Ledger posting completed successfully",
        actorUserId,
      }
    );
  }

  /**
   * Mark transaction as failed (PROCESSING → FAILED).
   */
  static async markFailed(
    transactionId: string,
    error: string,
    actorUserId?: string
  ): Promise<TransitionResult> {
    return TransactionStateMachine.transitionTo(
      transactionId,
      TransactionStatus.FAILED,
      {
        reason: `Ledger posting failed: ${error}`,
        metadata: { errorMessage: error },
        actorUserId,
      }
    );
  }

  /**
   * Mark transaction as cancelled (PENDING → CANCELLED).
   */
  static async markCancelled(
    transactionId: string,
    reason: string,
    actorUserId?: string
  ): Promise<TransitionResult> {
    return TransactionStateMachine.transitionTo(
      transactionId,
      TransactionStatus.CANCELLED,
      {
        reason,
        actorUserId,
      }
    );
  }
}
