import { Prisma, TransactionStatus, TransactionType, type LedgerSide } from "@prisma/client";
import { ConflictError, ValidationError } from "@/lib/errors/app-error";
import { prisma as defaultPrisma } from "@/server/db/prisma";
import { PostingEngine, postingEngine, type LedgerPosting, type PostingBatch } from "./posting-engine";
import { TransactionValidator, transactionValidator } from "./transaction-validator";
import type { RBACService as RBACServiceType } from "@/modules/rbac/rbac.service";
import { rbacService as DefaultRBACService } from "@/modules/rbac/rbac.service";
import type { RiskService as RiskServiceType } from "@/modules/risk/risk.service";
import { riskService as DefaultRiskService } from "@/modules/risk/risk.service";
import { recordAudit } from "@/modules/audit/audit.service";
import type { DbClient } from "@/lib/db/types";

export type LedgerLineDraft = {
  walletId: string;
  side: LedgerSide;
  amount: Prisma.Decimal;
  currency: string;
  sequence: number;
};

export function applyLedgerSide(
  balance: Prisma.Decimal,
  side: LedgerSide,
  amount: Prisma.Decimal,
): Prisma.Decimal {
  return side === "CREDIT" ? balance.add(amount) : balance.sub(amount);
}

export function assertBalancedLedger(
  lines: Pick<LedgerLineDraft, "side" | "amount">[],
): void {
  if (lines.length < 2) {
    throw new ConflictError("Ledger postings require at least two entries.");
  }
  let debits = new Prisma.Decimal(0);
  let credits = new Prisma.Decimal(0);
  for (const line of lines) {
    if (!line.amount.gt(0)) {
      throw new ConflictError("Ledger amounts must be strictly positive.");
    }
    if (line.side === "DEBIT") {
      debits = debits.add(line.amount);
    } else {
      credits = credits.add(line.amount);
    }
  }
  if (!debits.equals(credits)) {
    throw new ConflictError("Ledger entries must balance (sum DEBIT = sum CREDIT).");
  }
}

export class LedgerService {
  private postingEngine: PostingEngine;
  private transactionValidator: TransactionValidator;

  constructor(
    private prisma: DbClient = defaultPrisma,
    postingEngineInstance?: PostingEngine,
    transactionValidatorInstance?: TransactionValidator,
    private rbacService: RBACServiceType = DefaultRBACService as any,
    private riskService: RiskServiceType = DefaultRiskService as any,
  ) {
    this.postingEngine = postingEngineInstance ?? postingEngine;
    this.transactionValidator = transactionValidatorInstance ?? transactionValidator;
  }

  async verifyWalletsAfterPosting(
    walletIds: string[],
    companyId: string,
    transactionId: string,
  ): Promise<{ drifted: boolean; results: { walletId: string; stored: string; derived: string }[] }> {
    const results: { walletId: string; stored: string; derived: string }[] = [];
    for (const walletId of walletIds) {
      const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) continue;
      const derived = await this.postingEngine.computeWalletBalance(walletId, companyId);
      if (!wallet.balance.equals(derived)) {
        results.push({
          walletId,
          stored: wallet.balance.toString(),
          derived: derived.toString(),
        });
      }
    }
    if (results.length > 0) {
      await recordAudit(this.prisma, {
        companyId,
        actorUserId: null,
        action: "LEDGER_DRIFT_DETECTED",
        resourceType: "LedgerEntry",
        resourceId: transactionId,
        metadata: { drifted: results.map((r) => `${r.walletId}: stored=${r.stored} derived=${r.derived}`).join("; ") },
      });

      await this.riskService.createAlert(
        { companyId, userId: "00000000-0000-0000-0000-000000000000", role: "OWNER" },
        {
          category: "BALANCE_ANOMALY",
          severity: results.length > 1 ? "CRITICAL" : "HIGH",
          title: "Ledger drift detected",
          description: `Wallet(s) ${results.map((r) => r.walletId).join(", ")} have stored/derived balance mismatch after transaction ${transactionId}`,
          source: "LedgerService",
          resourceType: "LedgerEntry",
          resourceId: transactionId,
          metadata: { drifted: results },
        },
      );
    }
    return { drifted: results.length > 0, results };
  }

  async recordTransfer(
    companyId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: Prisma.Decimal | number | string,
    currency: string,
    options?: {
      idempotencyKey?: string;
      reference?: string;
      metadata?: Record<string, any>;
      createdByUserId?: string;
    }
  ) {
    await this.rbacService.ensurePermission(options?.createdByUserId, companyId, "transactions.transfer");

    const validation = await this.transactionValidator.validateTransfer(
      fromWalletId,
      toWalletId,
      companyId,
      amount,
      currency
    );

    if (!validation.valid) {
      throw new ValidationError(`Transfer validation failed: ${validation.errors.join("; ")}`);
    }

    const decimalAmount = new Prisma.Decimal(amount);

    const transaction = await this.prisma.transaction.create({
      data: {
        companyId,
        type: TransactionType.INTERNAL_TRANSFER,
        status: TransactionStatus.PENDING,
        primaryAmount: decimalAmount,
        currency,
        idempotencyKey: options?.idempotencyKey,
        reference: options?.reference,
        metadata: options?.metadata,
        createdByUserId: options?.createdByUserId,
      },
    });

    try {
      const batch: PostingBatch = {
        transactionId: transaction.id,
        companyId,
        currency,
        postings: [
          { walletId: fromWalletId, side: "DEBIT", amount: decimalAmount, sequence: 0 },
          { walletId: toWalletId, side: "CREDIT", amount: decimalAmount, sequence: 1 },
        ],
      };

      await this.postingEngine.postBatch(batch);

      await this.verifyWalletsAfterPosting(
        [fromWalletId, toWalletId],
        companyId,
        transaction.id,
      );

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      return this.prisma.transaction.findUniqueOrThrow({ where: { id: transaction.id } });
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw error;
    }
  }

  async recordCredit(
    companyId: string,
    toWalletId: string,
    amount: Prisma.Decimal | number | string,
    currency: string,
    options?: {
      idempotencyKey?: string;
      reference?: string;
      metadata?: Record<string, any>;
      createdByUserId?: string;
    }
  ) {
    await this.rbacService.ensurePermission(options?.createdByUserId, companyId, "transactions.credit");

    const validation = await this.transactionValidator.validateCredit(
      toWalletId,
      companyId,
      amount,
      currency
    );

    if (!validation.valid) {
      throw new ValidationError(`Credit validation failed: ${validation.errors.join("; ")}`);
    }

    const clearingWallet = await this.prisma.wallet.findFirst({
      where: { companyId, kind: "SYSTEM_CLEARING", currency },
    });

    if (!clearingWallet) {
      throw new ValidationError(`No clearing wallet found for ${currency} in company ${companyId}`);
    }

    const decimalAmount = new Prisma.Decimal(amount);

    const transaction = await this.prisma.transaction.create({
      data: {
        companyId,
        type: TransactionType.WALLET_CREDIT,
        status: TransactionStatus.PENDING,
        primaryAmount: decimalAmount,
        currency,
        idempotencyKey: options?.idempotencyKey,
        reference: options?.reference,
        metadata: options?.metadata,
        createdByUserId: options?.createdByUserId,
      },
    });

    try {
      const batch: PostingBatch = {
        transactionId: transaction.id,
        companyId,
        currency,
        postings: [
          { walletId: clearingWallet.id, side: "DEBIT", amount: decimalAmount, sequence: 0 },
          { walletId: toWalletId, side: "CREDIT", amount: decimalAmount, sequence: 1 },
        ],
      };

      await this.postingEngine.postBatch(batch);

      await this.verifyWalletsAfterPosting(
        [toWalletId, clearingWallet.id],
        companyId,
        transaction.id,
      );

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      return this.prisma.transaction.findUniqueOrThrow({ where: { id: transaction.id } });
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw error;
    }
  }

  async recordDebit(
    companyId: string,
    fromWalletId: string,
    amount: Prisma.Decimal | number | string,
    currency: string,
    options?: {
      idempotencyKey?: string;
      reference?: string;
      metadata?: Record<string, any>;
      createdByUserId?: string;
    }
  ) {
    await this.rbacService.ensurePermission(options?.createdByUserId, companyId, "transactions.debit");

    const validation = await this.transactionValidator.validateDebit(
      fromWalletId,
      companyId,
      amount,
      currency
    );

    if (!validation.valid) {
      throw new ValidationError(`Debit validation failed: ${validation.errors.join("; ")}`);
    }

    const clearingWallet = await this.prisma.wallet.findFirst({
      where: { companyId, kind: "SYSTEM_CLEARING", currency },
    });

    if (!clearingWallet) {
      throw new ValidationError(`No clearing wallet found for ${currency} in company ${companyId}`);
    }

    const decimalAmount = new Prisma.Decimal(amount);

    const transaction = await this.prisma.transaction.create({
      data: {
        companyId,
        type: TransactionType.WALLET_DEBIT,
        status: TransactionStatus.PENDING,
        primaryAmount: decimalAmount,
        currency,
        idempotencyKey: options?.idempotencyKey,
        reference: options?.reference,
        metadata: options?.metadata,
        createdByUserId: options?.createdByUserId,
      },
    });

    try {
      const batch: PostingBatch = {
        transactionId: transaction.id,
        companyId,
        currency,
        postings: [
          { walletId: fromWalletId, side: "DEBIT", amount: decimalAmount, sequence: 0 },
          { walletId: clearingWallet.id, side: "CREDIT", amount: decimalAmount, sequence: 1 },
        ],
      };

      await this.postingEngine.postBatch(batch);

      await this.verifyWalletsAfterPosting(
        [fromWalletId, clearingWallet.id],
        companyId,
        transaction.id,
      );

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      return this.prisma.transaction.findUniqueOrThrow({ where: { id: transaction.id } });
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw error;
    }
  }

  async verifyWalletBalance(walletId: string, companyId: string): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new ValidationError(`Wallet ${walletId} not found`);
    }

    const derivedBalance = await this.postingEngine.computeWalletBalance(walletId, companyId);
    return wallet.balance.equals(derivedBalance);
  }

  async getTransactionPostings(transactionId: string) {
    return this.postingEngine.getTransactionPostings(transactionId);
  }
}

export const ledgerService = new LedgerService();
