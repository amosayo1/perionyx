import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class BalanceSheetBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const periods = await prisma.gLAccountingPeriod.findMany({
      where: {
        companyId: { in: companyIds },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { startDate: "asc" },
    });
    const periodIds = periods.map((p) => p.id);

    const [priorPeriods, priorPeriodIds] = await (async () => {
      if (config.comparison === "none") return [null, null] as const;
      const prior = await prisma.gLAccountingPeriod.findMany({
        where: {
          companyId: { in: companyIds },
          endDate: { lt: startDate },
        },
        orderBy: { endDate: "desc" },
        take: 1,
      });
      if (!prior.length) return [null, null] as const;
      const ids = new Set<string>();
      for (const p of prior) {
        const range = await prisma.gLAccountingPeriod.findMany({
          where: { companyId: p.companyId, fiscalYear: config.comparison === "prior-year" ? String(Number(p.fiscalYear) - 1) : p.fiscalYear, endDate: { lt: startDate } },
          orderBy: { endDate: "desc" },
          take: 3,
        });
        for (const r of range) ids.add(r.id);
      }
      return [prior, Array.from(ids)] as const;
    })();

    const accounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: { in: ["asset", "liability", "equity"] }, isActive: true },
      include: {
        balances: { where: { periodId: { in: periodIds } } },
        children: { select: { id: true } },
      },
      orderBy: [{ type: "asc" }, { accountNumber: "asc" }],
    });

    const priorBalances = priorPeriodIds
      ? await prisma.gLAccountBalance.findMany({
          where: { accountId: { in: accounts.map((a) => a.id) }, periodId: { in: priorPeriodIds } },
        })
      : [];

    const priorByAccount = new Map<string, number>();
    for (const pb of priorBalances) {
      const existing = priorByAccount.get(pb.accountId) ?? 0;
      priorByAccount.set(pb.accountId, existing + Number(pb.endingBalance));
    }

    const balanceByAccount = new Map<string, number>();
    for (const acc of accounts) {
      let total = 0;
      for (const bal of acc.balances) {
        if (acc.naturalBalance === "debit") total += Number(bal.endingBalance);
        else total -= Number(bal.endingBalance);
      }
      balanceByAccount.set(acc.id, round(total));
    }

    const sections: ReportSection[] = [];
    let sectionIndex = 0;

    const buildSection = (type: string, title: string, subtitle?: string): { sectionTotal: number; priorTotal: number } => {
      const typeAccounts = accounts.filter((a) => a.type === type && !a.parentId);
      const children = accounts.filter((a) => a.type === type && a.parentId);
      const rows: ReportRow[] = [];
      let sectionTotal = 0;
      let priorTotal = 0;

      const byCategory = new Map<string, typeof typeAccounts>();
      for (const acc of typeAccounts) {
        const cat = acc.category || "Uncategorized";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(acc);
      }

      let rowIndex = 0;
      for (const [cat, catAccounts] of byCategory) {
        const catRows: ReportRow[] = [];
        let catTotal = 0;
        let catPrior = 0;
        for (const acc of catAccounts) {
          const bal = balanceByAccount.get(acc.id) ?? 0;
          const prior = priorByAccount.get(acc.id) ?? 0;
          const childRows: ReportRow[] = [];
          let childTotal = 0;
          let childPrior = 0;
          for (const child of children.filter((c) => c.parentId === acc.id)) {
            const cbal = balanceByAccount.get(child.id) ?? 0;
            const cprior = priorByAccount.get(child.id) ?? 0;
            childTotal += cbal;
            childPrior += cprior;
            childRows.push({
              id: `bs-${sectionIndex}-${rowIndex}-child-${child.id}`,
              label: child.name,
              depth: 2,
              type: "account",
              values: { amount: cbal },
              priorValues: config.comparison !== "none" ? { amount: cprior } : undefined,
              variance: config.comparison !== "none" ? { amount: round(cbal - cprior) } : undefined,
              variancePercent: config.comparison !== "none" && cprior !== 0 ? { amount: round(((cbal - cprior) / Math.abs(cprior)) * 100) } : undefined,
            });
          }
          const totalBal = bal + childTotal;
          const totalPrior = prior + childPrior;
          catTotal += totalBal;
          catPrior += totalPrior;
          catRows.push({
            id: `bs-${sectionIndex}-${rowIndex}-${acc.id}`,
            label: acc.name,
            depth: 1,
            type: childRows.length ? "section-header" : "account",
            values: { amount: totalBal },
            priorValues: config.comparison !== "none" ? { amount: totalPrior } : undefined,
            variance: config.comparison !== "none" ? { amount: round(totalBal - totalPrior) } : undefined,
            variancePercent: config.comparison !== "none" && totalPrior !== 0 ? { amount: round(((totalBal - totalPrior) / Math.abs(totalPrior)) * 100) } : undefined,
            children: childRows.length ? childRows : undefined,
          });
          rowIndex++;
        }
        sectionTotal += catTotal;
        priorTotal += catPrior;
        rows.push({
          id: `bs-${sectionIndex}-cat-${cat}`,
          label: cat,
          depth: 0,
          type: "section-header",
          values: { amount: round(catTotal) },
          priorValues: config.comparison !== "none" ? { amount: round(catPrior) } : undefined,
          variance: config.comparison !== "none" ? { amount: round(catTotal - catPrior) } : undefined,
          variancePercent: config.comparison !== "none" && catPrior !== 0 ? { amount: round(((catTotal - catPrior) / Math.abs(catPrior)) * 100) } : undefined,
          children: catRows,
        });
      }

      sections.push({
        id: `bs-section-${sectionIndex}`,
        title,
        subtitle,
        type: "table",
        rows,
        columns: ["Account", "Amount", ...(config.comparison !== "none" ? ["Prior Period", "Variance", "Variance %"] : [])],
        totals: { amount: round(sectionTotal) },
        subtotals: config.comparison !== "none" ? { amount: { current: round(sectionTotal), prior: round(priorTotal) } } : undefined,
      });
      sectionIndex++;
      return { sectionTotal, priorTotal };
    };

    const assetResult = buildSection("asset", "Assets", "Assets as of the reporting date");
    const liabilityResult = buildSection("liability", "Liabilities", "Liabilities as of the reporting date");
    const equityResult = buildSection("equity", "Equity", "Shareholders' equity");

    const grandTotalAssets = round(assetResult.sectionTotal);
    const grandTotalLiabilitiesEquity = round(liabilityResult.sectionTotal + equityResult.sectionTotal);

    sections.push({
      id: `bs-section-${sectionIndex}`,
      title: "Balance Sheet Summary",
      type: "summary",
      rows: [
        {
          id: `bs-total-assets`,
          label: "Total Assets",
          depth: 0,
          type: "total",
          values: { amount: grandTotalAssets },
        },
        {
          id: `bs-total-liabilities`,
          label: "Total Liabilities",
          depth: 0,
          type: "total",
          values: { amount: round(liabilityResult.sectionTotal) },
        },
        {
          id: `bs-total-equity`,
          label: "Total Equity",
          depth: 0,
          type: "total",
          values: { amount: round(equityResult.sectionTotal) },
        },
        {
          id: `bs-total-liabilities-equity`,
          label: "Total Liabilities + Equity",
          depth: 0,
          type: "total",
          values: { amount: grandTotalLiabilitiesEquity },
        },
      ],
      notes: [
        grandTotalAssets === grandTotalLiabilitiesEquity
          ? "Balance sheet is in balance."
          : `Difference of ${Math.abs(grandTotalAssets - grandTotalLiabilitiesEquity)} — review for errors.`,
      ],
    });

    return sections;
  }
}
