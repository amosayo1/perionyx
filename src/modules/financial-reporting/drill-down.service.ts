import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportType, ReportConfig, SourceReference } from "./types";

type QueryStrategy = "gl-journal" | "gl-journal-entry" | "ledger-entry" | "treasury-movement" | "transaction" | "account" | "fx-exposure";

const STRATEGY_MAP: Partial<Record<ReportType, QueryStrategy>> = {
  "balance-sheet": "gl-journal",
  "profit-loss": "gl-journal",
  "cash-flow": "ledger-entry",
  "equity-statement": "gl-journal",
  "trial-balance": "gl-journal-entry",
  "general-ledger": "gl-journal-entry",
  "journal-report": "gl-journal-entry",
  "chart-of-accounts": "account",
  "aged-receivables": "transaction",
  "aged-payables": "transaction",
  "fixed-assets": "gl-journal",
  "budget-vs-actual": "gl-journal-entry",
  "department-pl": "gl-journal-entry",
  "cost-center": "gl-journal-entry",
  "consolidated-group": "gl-journal",
  "multi-company": "gl-journal",
  "treasury-report": "treasury-movement",
  "fx-exposure": "fx-exposure",
  "cash-position": "treasury-movement",
};

export class DrillDownService {
  static async getSourceTransactions(
    ctx: TenantContext,
    reportType: ReportType,
    _sectionId: string,
    _rowId: string,
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const strategy = STRATEGY_MAP[reportType];
    if (!strategy) return [];

    const companyIds = config.companyIds.length > 0 ? config.companyIds : [ctx.companyId];

    switch (strategy) {
      case "gl-journal":
        return this.queryGlJournals(ctx, companyIds, config);
      case "gl-journal-entry":
        return this.queryGlJournalEntries(ctx, companyIds, config);
      case "ledger-entry":
        return this.queryLedgerEntries(ctx, companyIds, config);
      case "treasury-movement":
        return this.queryTreasuryMovements(ctx, companyIds, config);
      case "transaction":
        return this.queryTransactions(ctx, companyIds, config);
      case "account":
        return this.queryAccounts(ctx, companyIds);
      case "fx-exposure":
        return this.queryFxExposures(ctx, companyIds);
      default:
        return [];
    }
  }

  private static async queryGlJournals(
    ctx: TenantContext,
    companyIds: string[],
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const journals = await prisma.gLJournal.findMany({
      where: {
        companyId: { in: companyIds },
        createdAt: {
          gte: new Date(config.dateRange.start),
          lte: new Date(config.dateRange.end),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return journals.map((j) => ({
      id: j.id,
      type: "journal" as const,
      number: j.journalNumber,
      date: j.createdAt.toISOString(),
      amount: Number(j.totalDebit),
      description: j.description,
    }));
  }

  private static async queryGlJournalEntries(
    ctx: TenantContext,
    companyIds: string[],
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const entries = await prisma.gLJournalEntry.findMany({
      where: {
        companyId: { in: companyIds },
        createdAt: {
          gte: new Date(config.dateRange.start),
          lte: new Date(config.dateRange.end),
        },
      },
      include: { journal: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return entries.map((e) => ({
      id: e.id,
      type: "journal-entry" as const,
      number: e.journal.journalNumber,
      date: e.createdAt.toISOString(),
      amount: Number(e.debit) + Number(e.credit),
      description: e.description ?? "Journal entry",
    }));
  }

  private static async queryLedgerEntries(
    ctx: TenantContext,
    companyIds: string[],
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        companyId: { in: companyIds },
        createdAt: {
          gte: new Date(config.dateRange.start),
          lte: new Date(config.dateRange.end),
        },
      },
      include: { transaction: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return entries.map((e) => ({
      id: e.id,
      type: "ledger-entry" as const,
      number: e.transaction.reference ?? e.transaction.id,
      date: e.createdAt.toISOString(),
      amount: Number(e.amount),
      description: `Ledger ${e.side} — ${e.transaction.type}`,
    }));
  }

  private static async queryTreasuryMovements(
    ctx: TenantContext,
    companyIds: string[],
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const movements = await prisma.treasuryCashMovement.findMany({
      where: {
        companyId: { in: companyIds },
        createdAt: {
          gte: new Date(config.dateRange.start),
          lte: new Date(config.dateRange.end),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return movements.map((m) => ({
      id: m.id,
      type: "payment" as const,
      number: m.referenceId,
      date: m.createdAt.toISOString(),
      amount: Number(m.amount),
      description: m.reason,
    }));
  }

  private static async queryTransactions(
    ctx: TenantContext,
    companyIds: string[],
    config: ReportConfig,
  ): Promise<SourceReference[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: { in: companyIds },
        createdAt: {
          gte: new Date(config.dateRange.start),
          lte: new Date(config.dateRange.end),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return transactions.map((t) => ({
      id: t.id,
      type: "transaction" as const,
      number: t.reference ?? t.id,
      date: t.createdAt.toISOString(),
      amount: Number(t.primaryAmount),
      description: t.type,
    }));
  }

  private static async queryAccounts(
    ctx: TenantContext,
    companyIds: string[],
  ): Promise<SourceReference[]> {
    const accounts = await prisma.gLAccount.findMany({
      where: {
        companyId: { in: companyIds },
      },
      orderBy: { accountNumber: "asc" },
      take: 50,
    });

    return accounts.map((a) => ({
      id: a.id,
      type: "ledger-entry" as const,
      number: a.accountNumber,
      date: "",
      amount: 0,
      description: a.name ?? "Account",
    }));
  }

  private static async queryFxExposures(
    ctx: TenantContext,
    companyIds: string[],
  ): Promise<SourceReference[]> {
    const exposures = await prisma.treasuryFXExposure.findMany({
      where: {
        companyId: { in: companyIds },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return exposures.map((e) => ({
      id: e.id,
      type: "transaction" as const,
      number: "",
      date: e.createdAt.toISOString(),
      amount: Number(e.exposureAmount),
      description: `${e.sourceCurrency}/${e.targetCurrency} exposure`,
    }));
  }
}
