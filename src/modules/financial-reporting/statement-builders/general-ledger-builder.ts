import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class GeneralLedgerBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const whereFilters: Record<string, unknown> = {
      companyId: { in: companyIds },
      journal: {
        postingDate: { gte: startDate, lte: endDate },
      },
    };

    if (config.costCenterIds.length) {
      whereFilters.costCenterId = { in: config.costCenterIds };
    }

    if (config.departmentIds.length) {
      whereFilters.profitCenterId = { in: config.departmentIds };
    }

    const entries = await prisma.gLJournalEntry.findMany({
      where: whereFilters,
      include: {
        journal: { select: { journalNumber: true, description: true, postingDate: true, source: true, status: true } },
        account: { select: { accountNumber: true, name: true, type: true } },
      },
      orderBy: [{ account: { accountNumber: "asc" } }, { journal: { postingDate: "asc" } }],
    });

    const groupedByAccount = new Map<string, typeof entries>();
    for (const entry of entries) {
      const key = entry.accountId;
      if (!groupedByAccount.has(key)) groupedByAccount.set(key, []);
      groupedByAccount.get(key)!.push(entry);
    }

    const sections: ReportSection[] = [];

    let sectionIdx = 0;
    for (const [accountId, accountEntries] of groupedByAccount) {
      const firstEntry = accountEntries[0];
      const accountCode = firstEntry.account.accountNumber;
      const accountName = firstEntry.account.name;

      let runningBalance = 0;
      const rows: ReportRow[] = accountEntries.map((entry, i) => {
        const debit = Number(entry.debit);
        const credit = Number(entry.credit);
        runningBalance += debit - credit;

        return {
          id: `gl-${accountId}-${i}`,
          label: entry.description ?? entry.journal.description,
          depth: 0,
          type: "account",
          values: {
            date: entry.journal.postingDate?.toISOString().split("T")[0] ?? "",
            journalNumber: entry.journal.journalNumber,
            description: entry.description ?? entry.journal.description,
            debit: debit > 0 ? round(debit) : "",
            credit: credit > 0 ? round(credit) : "",
            runningBalance: round(runningBalance),
          },
          sourceReferences: [
            {
              id: entry.id,
              type: "journal-entry",
              number: entry.journal.journalNumber,
              date: entry.journal.postingDate?.toISOString().split("T")[0] ?? "",
              amount: debit + credit,
              description: entry.description ?? entry.journal.description,
            },
          ],
        };
      });

      sections.push({
        id: `gl-section-${sectionIdx}`,
        title: `${accountCode} — ${accountName}`,
        subtitle: `${firstEntry.account.type.charAt(0).toUpperCase() + firstEntry.account.type.slice(1)} account`,
        type: "table",
        columns: ["Date", "Journal #", "Description", "Debit", "Credit", "Running Balance"],
        rows,
      });
      sectionIdx++;
    }

    if (sections.length === 0) {
      sections.push({
        id: "gl-empty",
        title: "General Ledger",
        subtitle: "No entries found for the given criteria",
        type: "table",
        columns: ["Date", "Journal #", "Description", "Debit", "Credit", "Running Balance"],
        rows: [],
      });
    }

    return sections;
  }
}
