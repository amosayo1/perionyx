import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class FixedAssetsBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const fixedAssetAccounts = await prisma.gLAccount.findMany({
      where: {
        companyId: { in: companyIds },
        category: { in: ["fixed-asset", "property-plant-equipment", "ppe", "fixed_asset"] },
        isActive: true,
      },
      orderBy: { accountNumber: "asc" },
    });

    const allAssetAccounts = await prisma.gLAccount.findMany({
      where: {
        companyId: { in: companyIds },
        type: "asset",
        category: { in: ["fixed-asset", "property-plant-equipment", "ppe", "fixed_asset", "non-current-asset"] },
        isActive: true,
      },
      orderBy: { accountNumber: "asc" },
    });

    const period = await prisma.gLAccountingPeriod.findFirst({
      where: {
        companyId: { in: companyIds },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { endDate: "desc" },
    });

    const balanceFilter = period ? { periodId: period.id } : {};

    const balances = await prisma.gLAccountBalance.findMany({
      where: {
        accountId: { in: allAssetAccounts.map((a) => a.id) },
        ...balanceFilter,
      },
    });

    const balanceByAccount = new Map<string, number>();
    for (const bal of balances) {
      balanceByAccount.set(
        bal.accountId,
        (balanceByAccount.get(bal.accountId) ?? 0) + Number(bal.endingBalance),
      );
    }

    const depreciationAccounts = await prisma.gLAccount.findMany({
      where: {
        companyId: { in: companyIds },
        name: { contains: "depreciation", mode: "insensitive" },
        isActive: true,
      },
    });

    const depreciationBalances = await prisma.gLAccountBalance.findMany({
      where: {
        accountId: { in: depreciationAccounts.map((a) => a.id) },
        ...balanceFilter,
      },
    });

    const depreciationByAssetAccount = new Map<string, number>();
    for (const depAcc of depreciationAccounts) {
      const depBal = depreciationBalances
        .filter((b) => b.accountId === depAcc.id)
        .reduce((s, b) => s + Number(b.endingBalance), 0);
      depreciationByAssetAccount.set(depAcc.id, depBal);
    }

    const accumDepreciation = depreciationAccounts.reduce(
      (s, a) => s + (depreciationByAssetAccount.get(a.id) ?? 0),
      0,
    );

    const rows: ReportRow[] = allAssetAccounts.map((acc) => {
      const cost = balanceByAccount.get(acc.id) ?? 0;
      const dep = depreciationAccounts
        .filter((d) => d.parentId === acc.id || d.name.toLowerCase().includes(acc.name.toLowerCase()))
        .reduce((s, d) => s + (depreciationByAssetAccount.get(d.id) ?? 0), 0);
      const netBookValue = cost - dep;

      return {
        id: `fa-${acc.id}`,
        label: `${acc.accountNumber} — ${acc.name}`,
        depth: 0,
        type: "account",
        values: {
          assetCode: acc.accountNumber,
          assetName: acc.name,
          category: acc.category,
          acquisitionCost: round(cost),
          accumulatedDepreciation: round(dep),
          netBookValue: round(netBookValue),
        },
        sourceReferences: [
          {
            id: acc.id,
            type: "ledger-entry",
            number: acc.accountNumber,
            date: endDate.toISOString().split("T")[0],
            amount: netBookValue,
            description: acc.name,
          },
        ],
      };
    });

    const totalCost = allAssetAccounts.reduce((s, a) => s + (balanceByAccount.get(a.id) ?? 0), 0);
    const totalNetBookValue = totalCost - accumDepreciation;

    const sections: ReportSection[] = [
      {
        id: "fixed-assets",
        title: "Fixed Assets Schedule",
        subtitle: `As of ${config.dateRange.end} — ${allAssetAccounts.length} asset accounts`,
        type: "table",
        columns: [
          "Asset Code",
          "Asset Name",
          "Category",
          "Acquisition Cost",
          "Accumulated Depreciation",
          "Net Book Value",
        ],
        rows,
        totals: {
          acquisitionCost: round(totalCost),
          accumulatedDepreciation: round(accumDepreciation),
          netBookValue: round(totalNetBookValue),
        },
        notes: [
          `Total Fixed Assets (Cost): ${round(totalCost)}`,
          `Total Accumulated Depreciation: ${round(accumDepreciation)}`,
          `Total Net Book Value: ${round(totalNetBookValue)}`,
        ],
      },
    ];

    return sections;
  }
}
