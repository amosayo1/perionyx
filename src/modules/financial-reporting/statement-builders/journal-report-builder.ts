import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class JournalReportBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const journals = await prisma.gLJournal.findMany({
      where: {
        companyId: { in: companyIds },
        postingDate: { gte: startDate, lte: endDate },
      },
      include: {
        entries: {
          include: {
            account: { select: { accountNumber: true, name: true } },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { postingDate: "asc" },
    });

    const sections: ReportSection[] = [];
    let sectionIdx = 0;

    for (const journal of journals) {
      const entryRows: ReportRow[] = journal.entries.map((entry, i) => ({
        id: `jr-${journal.id}-entry-${i}`,
        label: entry.description ?? "",
        depth: 1,
        type: "account" as const,
        values: {
          accountCode: entry.account.accountNumber,
          accountName: entry.account.name,
          description: entry.description ?? "",
          debit: Number(entry.debit) > 0 ? round(Number(entry.debit)) : "",
          credit: Number(entry.credit) > 0 ? round(Number(entry.credit)) : "",
        },
        sourceReferences: [
          {
            id: entry.id,
            type: "journal-entry",
            number: journal.journalNumber,
            date: journal.postingDate?.toISOString().split("T")[0] ?? "",
            amount: Number(entry.debit) + Number(entry.credit),
            description: entry.description ?? journal.description,
          },
        ],
      }));

      const totalDebit = journal.entries.reduce((s, e) => s + Number(e.debit), 0);
      const totalCredit = journal.entries.reduce((s, e) => s + Number(e.credit), 0);

      const headerRow: ReportRow = {
        id: `jr-${journal.id}-header`,
        label: `Journal #${journal.journalNumber} — ${journal.description}`,
        depth: 0,
        type: "section-header",
        values: {
          journalNumber: journal.journalNumber,
          date: journal.postingDate?.toISOString().split("T")[0] ?? "",
          description: journal.description,
          source: journal.source,
          status: journal.status,
          totalDebit: round(totalDebit),
          totalCredit: round(totalCredit),
        },
        children: entryRows,
      };

      sections.push({
        id: `jr-section-${sectionIdx}`,
        title: `Journal: ${journal.journalNumber}`,
        subtitle: `${journal.source} — ${journal.status} | ${journal.postingDate?.toISOString().split("T")[0] ?? "Unposted"}`,
        type: "table",
        columns: ["Account Code", "Account Name", "Description", "Debit", "Credit"],
        rows: [headerRow],
        totals: { debit: round(totalDebit), credit: round(totalCredit) },
      });
      sectionIdx++;
    }

    if (sections.length === 0) {
      sections.push({
        id: "jr-empty",
        title: "Journal Report",
        subtitle: "No journals found for the given criteria",
        type: "table",
        columns: ["Account Code", "Account Name", "Description", "Debit", "Credit"],
        rows: [],
      });
    }

    return sections;
  }
}
