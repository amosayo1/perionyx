/**
 * REVERSAL & CORRECTION ENGINE
 * 
 * Implements proper financial reversal patterns.
 * 
 * CRITICAL PRINCIPLE: Transactions are NEVER deleted.
 * 
 * Instead, reversals create compensating transactions that:
 * - Create inverse ledger entries
 * - Preserve original transaction (immutable)
 * - Maintain full auditability
 * - Keep running totals correct
 * 
 * Example:
 * Original: DEBIT wallet_A 100, CREDIT wallet_B 100
 * Reversal: DEBIT wallet_B 100, CREDIT wallet_A 100
 * 
 * Result: Net impact is zero, but both transactions visible in history.
 */

import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError, ConflictError } from "@/lib/errors/app-error";
import { postingEngine, type PostingBatch } from "./posting-engine";
import { TransactionStateMachine, TransactionLifecycleManager } from "./transaction-state-machine";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { logger } from "@/lib/logger";

export interface ReversalResult {
  originalTransactionId: string;
  reversalTransactionId: string;
  reversalPostings: number;
  success: boolean;
  message: string;
}

export class ReversalEngine {
  /**
   * Reverse a completed transaction.
   * 
   * Creates a new REVERSAL transaction with inverse postings.
   * Original transaction remains COMPLETED but marked as reversed.
   */
  static async reverseTransaction(
    transactionId: string,
    options?: {
      reason?: string;
      metadata?: Record<string, any>;
      actorUserId?: string;
    }
  ): Promise<ReversalResult> {
    // Get original transaction
    const originalTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ledgerEntries: {
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!originalTx) {
      return {
        originalTransactionId: transactionId,
        reversalTransactionId: "",
        reversalPostings: 0,
        success: false,
        message: `Transaction ${transactionId} not found`,
      };
    }

    // Permission: only users with reversal permission may create reversals
    await rbacService.ensurePermission(options?.actorUserId, originalTx.companyId, "transactions.reverse");

    // Verify can be reversed
    if (!TransactionStateMachine.canBeReversed(originalTx.status)) {
      return {
        originalTransactionId: transactionId,
        reversalTransactionId: "",
        reversalPostings: 0,
        success: false,
        message: `Cannot reverse transaction in ${originalTx.status} status. Only COMPLETED transactions can be reversed.`,
      };
    }

    // Check if already reversed
    const existingReversal = await prisma.transaction.findFirst({
      where: {
        companyId: originalTx.companyId,
        type: TransactionType.REVERSAL,
        metadata: {
          path: ["originalTransactionId"],
          equals: transactionId,
        },
      },
    });

    if (existingReversal) {
      return {
        originalTransactionId: transactionId,
        reversalTransactionId: existingReversal.id,
        reversalPostings: 0,
        success: false,
        message: `Transaction ${transactionId} has already been reversed (${existingReversal.id})`,
      };
    }

    // Verify we have ledger entries
    if (originalTx.ledgerEntries.length === 0) {
      return {
        originalTransactionId: transactionId,
        reversalTransactionId: "",
        reversalPostings: 0,
        success: false,
        message: `Original transaction has no ledger entries (inconsistent state)`,
      };
    }

    try {
      // Create reversal transaction
      const reversalTx = await prisma.transaction.create({
        data: {
          companyId: originalTx.companyId,
          type: TransactionType.REVERSAL,
          status: TransactionStatus.PENDING,
          primaryAmount: originalTx.primaryAmount,
          currency: originalTx.currency,
          reference: `REVERSAL_OF_${originalTx.reference || originalTx.id}`,
          metadata: {
            originalTransactionId: transactionId,
            reason: options?.reason,
            ...(options?.metadata || {}),
          },
          createdByUserId: options?.actorUserId,
        },
      });

      // Create inverse ledger entries
      const reversalPostings: any[] = [];

      for (let i = 0; i < originalTx.ledgerEntries.length; i++) {
        const entry = originalTx.ledgerEntries[i];
        const inverseSide = entry.side === "DEBIT" ? "CREDIT" : "DEBIT";

        reversalPostings.push({
          walletId: entry.walletId,
          side: inverseSide,
          amount: entry.amount,
          sequence: i,
        });
      }

      // Post reversal transaction
      const batch: PostingBatch = {
        transactionId: reversalTx.id,
        companyId: originalTx.companyId,
        currency: originalTx.currency,
        postings: reversalPostings,
      };

      await postingEngine.postBatch(batch);

      // Mark reversal as completed
      await TransactionLifecycleManager.markCompleted(reversalTx.id, options?.actorUserId);

      // Mark original as reversed
      const originalTransition = await TransactionStateMachine.transitionTo(
        originalTx.id,
        TransactionStatus.REVERSED,
        {
          reason: `Reversed by transaction ${reversalTx.id}`,
          metadata: { reversalTransactionId: reversalTx.id },
          actorUserId: options?.actorUserId,
        }
      );

      if (!originalTransition.success) {
        // If we can't mark as reversed, log warning but don't fail
        logger.warn(
          `Warning: Could not mark original transaction ${originalTx.id} as REVERSED: ${originalTransition.message}`
        );
      }

      return {
        originalTransactionId: transactionId,
        reversalTransactionId: reversalTx.id,
        reversalPostings: reversalPostings.length,
        success: true,
        message: `Transaction reversed successfully`,
      };
    } catch (error) {
      return {
        originalTransactionId: transactionId,
        reversalTransactionId: "",
        reversalPostings: 0,
        success: false,
        message: `Failed to reverse transaction: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get reversal transaction for an original transaction (if exists).
   */
  static async getReversalFor(transactionId: string): Promise<any | null> {
    return prisma.transaction.findFirst({
      where: {
        type: TransactionType.REVERSAL,
        metadata: {
          path: ["originalTransactionId"],
          equals: transactionId,
        },
      },
      include: {
        ledgerEntries: true,
      },
    });
  }

  /**
   * Get original transaction for a reversal (if this is a reversal).
   */
  static async getReversalOf(reversalTransactionId: string): Promise<any | null> {
    const reversal = await prisma.transaction.findUnique({
      where: { id: reversalTransactionId },
    });

    if (!reversal || reversal.type !== TransactionType.REVERSAL) {
      return null;
    }

    const originalId = (reversal.metadata as any)?.originalTransactionId;
    if (!originalId) {
      return null;
    }

    return prisma.transaction.findUnique({
      where: { id: originalId },
      include: {
        ledgerEntries: true,
      },
    });
  }

  /**
   * Get all reversals for a company.
   */
  static async getReversalsForCompany(
    companyId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        companyId,
        type: TransactionType.REVERSAL,
      },
      include: {
        ledgerEntries: true,
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });
  }

  /**
   * Get reversal history for a wallet (all reversals affecting it).
   */
  static async getWalletReversals(
    walletId: string,
    companyId: string
  ): Promise<any[]> {
    const reversalTransactions = await prisma.transaction.findMany({
      where: {
        companyId,
        type: TransactionType.REVERSAL,
        ledgerEntries: {
          some: {
            walletId,
          },
        },
      },
      include: {
        ledgerEntries: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reversalTransactions;
  }

  /**
   * Verify reversal integrity.
   * 
   * Checks that:
   * - Original and reversal postings are exact inverses
   * - Both transactions are balanced
   * - Original is marked as REVERSED
   */
  static async verifyReversalIntegrity(
    originalTransactionId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const original = await prisma.transaction.findUnique({
      where: { id: originalTransactionId },
      include: { ledgerEntries: true },
    });

    if (!original) {
      errors.push(`Original transaction not found`);
      return { valid: false, errors };
    }

    if (original.status !== TransactionStatus.REVERSED) {
      errors.push(`Original transaction is not marked as REVERSED (status: ${original.status})`);
    }

    const reversal = await this.getReversalFor(originalTransactionId);

    if (!reversal) {
      errors.push(`No reversal transaction found`);
      return { valid: false, errors };
    }

    if (reversal.status !== TransactionStatus.COMPLETED) {
      errors.push(
        `Reversal transaction not completed (status: ${reversal.status})`
      );
    }

    // Verify entries are exact inverses
    if (original.ledgerEntries.length !== reversal.ledgerEntries.length) {
      errors.push(
        `Entry count mismatch: original=${original.ledgerEntries.length}, reversal=${reversal.ledgerEntries.length}`
      );
      return { valid: false, errors };
    }

    for (let i = 0; i < original.ledgerEntries.length; i++) {
      const orig = original.ledgerEntries[i];
      const rev = reversal.ledgerEntries.find((e: any) => e.walletId === orig.walletId);

      if (!rev) {
        errors.push(`Reversal missing entry for wallet ${orig.walletId}`);
        continue;
      }

      if (rev.side === orig.side) {
        errors.push(
          `Entry sides not inverted for wallet ${orig.walletId}: both ${orig.side}`
        );
      }

      if (!rev.amount.equals(orig.amount)) {
        errors.push(
          `Entry amounts differ for wallet ${orig.walletId}: original=${orig.amount}, reversal=${rev.amount}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get net impact of a transaction + its reversals.
   * 
   * Should always equal zero if system is consistent.
   */
  static async getNetImpact(
    transactionId: string,
    walletId: string
  ): Promise<Prisma.Decimal> {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        walletId,
        transaction: {
          OR: [
            { id: transactionId },
            {
              type: TransactionType.REVERSAL,
              metadata: {
                path: ["originalTransactionId"],
                equals: transactionId,
              },
            },
          ],
        },
      },
    });

    let net = new Prisma.Decimal(0);

    for (const entry of entries) {
      if (entry.side === "DEBIT") {
        net = net.sub(entry.amount);
      } else {
        net = net.plus(entry.amount);
      }
    }

    return net;
  }
}
