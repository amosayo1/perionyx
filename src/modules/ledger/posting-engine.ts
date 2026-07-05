import { Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { DbClient } from "@/lib/db/types";
import { RowLockManager, FinancialTransactionManager } from "@/lib/financial-transaction";

function applyLedgerSide(balance: Prisma.Decimal, side: string, amount: Prisma.Decimal): Prisma.Decimal {
  return side === "CREDIT" ? balance.add(amount) : balance.sub(amount);
}

const postingLockManager = new RowLockManager(new FinancialTransactionManager());

export interface LedgerPosting {
  walletId: string;
  side: "DEBIT" | "CREDIT";
  amount: Prisma.Decimal | number | string;
  sequence: number;
}

export interface PostingBatch {
  transactionId: string;
  companyId: string;
  currency: string;
  postings: LedgerPosting[];
}

export class PostingEngine {
  constructor(private prisma: DbClient = defaultPrisma) {}

  validateBatch(batch: PostingBatch): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!batch.postings || batch.postings.length < 2) {
      errors.push("Transaction must have at least 2 ledger entries");
    }

    let debits = new Prisma.Decimal(0);
    let credits = new Prisma.Decimal(0);
    const sequences = new Set<number>();

    for (const posting of batch.postings) {
      const amount = new Prisma.Decimal(posting.amount);

      if (amount.isZero()) {
        errors.push(`Posting to wallet ${posting.walletId} has zero amount`);
      }
      if (amount.isNegative()) {
        errors.push(`Posting to wallet ${posting.walletId} has negative amount`);
      }

      if (sequences.has(posting.sequence)) {
        errors.push(`Duplicate sequence ${posting.sequence}`);
      }
      sequences.add(posting.sequence);

      if (posting.side === "DEBIT") {
        debits = debits.plus(amount);
      } else if (posting.side === "CREDIT") {
        credits = credits.plus(amount);
      } else {
        errors.push(`Invalid posting side: ${posting.side}`);
      }
    }

    if (!debits.equals(credits)) {
      errors.push(
        `Ledger does not balance: debits=${debits.toString()} credits=${credits.toString()}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async postBatch(batch: PostingBatch): Promise<void> {
    const validation = this.validateBatch(batch);
    if (!validation.valid) {
      throw new Error(`Posting validation failed: ${validation.errors.join("; ")}`);
    }

    await this.prisma.$transaction(async (tx: any) => {
      await this.postLedgerLines(tx, batch.companyId, batch.transactionId, batch.currency, batch.postings);
    });
  }

  async postLedgerLines(
    tx: Prisma.TransactionClient,
    companyId: string,
    transactionId: string,
    currency: string,
    lines: LedgerPosting[],
  ): Promise<void> {
    const sortedLines = [...lines].sort((a, b) => a.sequence - b.sequence);
    const walletIds = [...new Set(sortedLines.map(p => p.walletId))].sort();

    await postingLockManager.lockInTx(
      walletIds.map(id => ({ entity: "Wallet", id })),
      tx,
    );

    // Pre-load wallets with their versions inside the lock
    const wallets = await Promise.all(
      walletIds.map(id =>
        tx.wallet.findUnique({ where: { id } }),
      ),
    );
    const walletMap = new Map(wallets.filter((w): w is NonNullable<typeof w> => w !== null).map(w => [w.id, w]));

    for (const line of sortedLines) {
      const wallet = walletMap.get(line.walletId);
      if (!wallet) throw new Error(`Wallet ${line.walletId} not found`);

      if (wallet.currency !== currency) {
        throw new Error(`Ledger line currency must match wallet currency ${wallet.currency}`);
      }

      const nextBalance = applyLedgerSide(wallet.balance, line.side, new Prisma.Decimal(line.amount));
      if (wallet.kind === "STANDARD" && nextBalance.lessThan(0)) {
        throw new Error("Insufficient balance for this operation.");
      }

      await tx.ledgerEntry.create({
        data: {
          companyId,
          transactionId,
          walletId: line.walletId,
          side: line.side,
          amount: new Prisma.Decimal(line.amount),
          currency,
          sequence: line.sequence,
        },
      });

      const updated = await tx.wallet.updateMany({
        where: { id: line.walletId, version: wallet.version },
        data: {
          balance: nextBalance,
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new Error(`Wallet ${line.walletId} version conflict — concurrent modification detected`);
      }
    }
  }

  async computeWalletBalance(walletId: string, companyId: string): Promise<Prisma.Decimal> {
    const creditSum = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { walletId, side: "CREDIT", company: { id: companyId } },
    });

    const debitSum = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { walletId, side: "DEBIT", company: { id: companyId } },
    });

    const credits = creditSum._sum.amount ?? new Prisma.Decimal(0);
    const debits = debitSum._sum.amount ?? new Prisma.Decimal(0);

    return new Prisma.Decimal(credits).minus(debits);
  }

  async verifyTransactionBalance(transactionId: string): Promise<boolean> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { transactionId },
    });

    if (entries.length < 2) return false;

    let debits = new Prisma.Decimal(0);
    let credits = new Prisma.Decimal(0);

    for (const entry of entries) {
      if (entry.side === "DEBIT") {
        debits = debits.plus(entry.amount);
      } else {
        credits = credits.plus(entry.amount);
      }
    }

    return debits.equals(credits);
  }

  async getTransactionPostings(transactionId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { transactionId },
      orderBy: { sequence: "asc" },
    });
  }
}

export const postingEngine = new PostingEngine();
