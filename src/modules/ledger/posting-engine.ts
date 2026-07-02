import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { DbClient } from "@/lib/db/types";

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
      for (const posting of batch.postings) {
        await tx.ledgerEntry.create({
          data: {
            companyId: batch.companyId,
            transactionId: batch.transactionId,
            walletId: posting.walletId,
            side: posting.side,
            amount: new Prisma.Decimal(posting.amount),
            currency: batch.currency,
            sequence: posting.sequence,
          },
        });

        const sign = posting.side === "DEBIT" ? -1 : 1;
        const adjustmentAmount = new Prisma.Decimal(posting.amount).mul(sign);

        await tx.wallet.update({
          where: { id: posting.walletId },
          data: {
            balance: {
              increment: adjustmentAmount,
            },
            version: {
              increment: 1,
            },
          },
        });
      }
    });
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
