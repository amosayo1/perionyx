import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class ConsolidatedReportsBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, entityIds, rounding } = config;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return [];

    const period = await prisma.gLAccountingPeriod.findFirst({
      where: {
        companyId,
        startDate: { lte: new Date(dateRange.end) },
        endDate: { gte: new Date(dateRange.start) },
        ...(dateRange.period ? { period: dateRange.period } : {}),
        ...(dateRange.fiscalYear ? { fiscalYear: dateRange.fiscalYear } : {}),
      },
      orderBy: { endDate: "desc" },
    });

    const targetEntityIds = entityIds.length > 0 ? entityIds : [companyId];

    const statements = await prisma.gLFinancialStatement.findMany({
      where: {
        companyId: { in: targetEntityIds },
        ...(period ? { periodId: period.id } : {}),
        ...(dateRange.fiscalYear ? { fiscalYear: dateRange.fiscalYear } : {}),
      },
    });

    const companies = await prisma.company.findMany({
      where: { id: { in: targetEntityIds } },
    });

    const companyNames = new Map(companies.map((c) => [c.id, c.name]));

    const intercompanyEntries = await prisma.gLIntercompanyAccount.findMany({
      where: {
        companyId,
        ...(targetEntityIds.length > 0
          ? {
              OR: [
                { fromCompanyId: { in: targetEntityIds } },
                { toCompanyId: { in: targetEntityIds } },
              ],
            }
          : {}),
      },
    });

    let sumRevenue = 0;
    let sumExpense = 0;
    let sumAssets = 0;
    let sumLiabilities = 0;
    let sumEquity = 0;

    for (const stmt of statements) {
      sumRevenue += Number(stmt.totalRevenue ?? 0);
      sumExpense += Number(stmt.totalExpense ?? 0);
      sumAssets += Number(stmt.totalAssets ?? 0);
      sumLiabilities += Number(stmt.totalLiabilities ?? 0);
      sumEquity += Number(stmt.totalEquity ?? 0);
    }

    const balanceSheetBalances = await prisma.gLAccountBalance.findMany({
      where: {
        companyId: { in: targetEntityIds },
        ...(period ? { periodId: period.id } : {}),
      },
    });

    const assetAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "ASSET", isActive: true },
    });
    const liabilityAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "LIABILITY", isActive: true },
    });
    const equityAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "EQUITY", isActive: true },
    });

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const calcBal = (accs: typeof assetAccounts) =>
      accs.reduce((s, a) => {
        const b = balanceSheetBalances.find((bb) => bb.accountId === a.id);
        return s + (b ? Number(b.endingBalance) : 0);
      }, 0);

    const rawAssets = calcBal(assetAccounts);
    const rawLiabilities = calcBal(liabilityAccounts);
    const rawEquity = calcBal(equityAccounts);

    let totalDueTo = 0;
    let totalDueFrom = 0;

    const elimRows: ReportRow[] = [];

    for (const ic of intercompanyEntries) {
      const dueTo = Number(ic.dueTo);
      const dueFrom = Number(ic.dueFrom);
      totalDueTo += dueTo;
      totalDueFrom += dueFrom;

      elimRows.push({
        id: `${companyId}-elim-${ic.id}`,
        label: `Intercompany: ${companyNames.get(ic.fromCompanyId) ?? ic.fromCompanyId} → ${companyNames.get(ic.toCompanyId) ?? ic.toCompanyId}`,
        depth: 1,
        type: "account",
        values: { eliminations: round(dueTo - dueFrom) },
        sourceReferences: [
          {
            id: ic.id,
            type: "journal-entry",
            number: "",
            date: ic.lastSettlementDate?.toISOString() ?? "",
            amount: dueTo - dueFrom,
            description: `Due to/from ${ic.fromCompanyId}/${ic.toCompanyId}`,
          },
        ],
      });
    }

    const netElimination = totalDueTo - totalDueFrom;

    const consolidatedAssets = rawAssets - netElimination;
    const consolidatedLiabilities = rawLiabilities - netElimination;
    const consolidatedEquity = rawEquity + netElimination;

    const sections: ReportSection[] = [
      {
        id: `${companyId}-consol-header`,
        title: "Consolidated Financial Report",
        subtitle: `Entities: ${targetEntityIds.map((id) => companyNames.get(id) ?? id).join(", ")}`,
        type: "header",
        rows: [],
      },
      {
        id: `${companyId}-consol-balance-sheet`,
        title: "Consolidated Balance Sheet",
        type: "table",
        columns: ["entity", "eliminations", "consolidated"],
        rows: [
          {
            id: `${companyId}-consol-assets`,
            label: "Total Assets",
            depth: 0,
            type: "account",
            values: { entity: round(rawAssets), eliminations: round(-netElimination), consolidated: round(consolidatedAssets) },
          },
          {
            id: `${companyId}-consol-liabilities`,
            label: "Total Liabilities",
            depth: 0,
            type: "account",
            values: { entity: round(rawLiabilities), eliminations: round(-netElimination), consolidated: round(consolidatedLiabilities) },
          },
          {
            id: `${companyId}-consol-equity`,
            label: "Total Equity",
            depth: 0,
            type: "account",
            values: { entity: round(rawEquity), eliminations: round(netElimination), consolidated: round(consolidatedEquity) },
          },
          {
            id: `${companyId}-consol-total`,
            label: "Total Liabilities & Equity",
            depth: 0,
            type: "total",
            values: {
              entity: round(rawLiabilities + rawEquity),
              eliminations: round(0),
              consolidated: round(consolidatedLiabilities + consolidatedEquity),
            },
          },
        ],
        totals: { consolidated: round(consolidatedEquity) },
      },
      {
        id: `${companyId}-consol-income`,
        title: "Consolidated Income Statement",
        type: "table",
        columns: ["entity", "consolidated"],
        rows: [
          {
            id: `${companyId}-consol-revenue`,
            label: "Total Revenue",
            depth: 0,
            type: "account",
            values: { entity: round(sumRevenue), consolidated: round(sumRevenue) },
          },
          {
            id: `${companyId}-consol-expense`,
            label: "Total Expenses",
            depth: 0,
            type: "account",
            values: { entity: round(sumExpense), consolidated: round(sumExpense) },
          },
          {
            id: `${companyId}-consol-ni`,
            label: "Consolidated Net Income",
            depth: 0,
            type: "total",
            values: { entity: round(sumRevenue - sumExpense), consolidated: round(sumRevenue - sumExpense) },
          },
        ],
      },
    ];

    if (elimRows.length > 0) {
      sections.push({
        id: `${companyId}-consol-elim`,
        title: "Intercompany Eliminations",
        type: "table",
        columns: ["eliminations"],
        rows: [
          ...elimRows,
          {
            id: `${companyId}-consol-elim-total`,
            label: "Net Elimination",
            depth: 0,
            type: "total",
            values: { eliminations: round(netElimination) },
          } as ReportRow,
        ],
        totals: { eliminations: round(netElimination) },
        notes: [
          `Total Due To: ${round(totalDueTo)}`,
          `Total Due From: ${round(totalDueFrom)}`,
          `Net Elimination: ${round(netElimination)}`,
        ],
      });
    }

    return sections;
  }
}
