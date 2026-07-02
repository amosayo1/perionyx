import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult } from "../types";
import { makeInsight, makeRecommendation } from "../types";

export class LiquidityIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "liquidity";
  readonly label = "Liquidity Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();
    const insights = [];
    const recommendations = [];

    const wallets = await prisma.wallet.findMany({ where: { companyId: ctx.companyId } });
    const treasuryAccounts = await prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId, isActive: true } });
    const snapshots = await prisma.intelligenceSnapshot.findMany({
      where: { companyId: ctx.companyId, metric: { in: ["total_balance", "wallet_count"] } },
      orderBy: { takenAt: "desc" }, take: 60,
    });

    const idleCashAccounts = treasuryAccounts.filter((a) => Number(a.balance) > 0 && !a.plaidAccountId);
    if (idleCashAccounts.length > 0) {
      const idleAmount = idleCashAccounts.reduce((s, a) => s + Number(a.balance), 0);
      insights.push(makeInsight({
        id: `liq-idle-cash-${ctx.companyId}`, category: "liquidity",
        title: "Idle cash detected",
        description: `${idleCashAccounts.length} non-linked accounts hold ${idleAmount.toFixed(2)} in idle cash`,
        severity: idleAmount > 100000 ? "high" : "medium", confidence: 85,
        sourceData: ["treasury_accounts", "external_accounts"], timestamp: new Date().toISOString(),
        affectedAccounts: idleCashAccounts.map((a) => a.id),
        explainability: {
          why: `${idleCashAccounts.length} treasury accounts have no Plaid link, indicating idle cash`,
          evidence: [`${idleCashAccounts.length} accounts without Plaid link`, `Total idle amount: ${idleAmount.toFixed(2)}`],
          confidenceCalculation: "85% — based on account link status and balance data",
          whatToDo: "Link these accounts to external banking or set up automated sweeps",
        },
      }));

      recommendations.push(makeRecommendation({
        id: `rec-liq-invest-${ctx.companyId}`, title: "Deploy idle cash",
        description: `Deploy ${idleAmount.toFixed(2)} in idle cash to yield-bearing accounts or sweep to linked bank accounts`,
        severity: idleAmount > 100000 ? "high" : "medium", confidence: 80, category: "liquidity",
        affectedEntities: ["treasury"], affectedAccounts: idleCashAccounts.map((a) => a.id),
        supportingEvidence: [`${idleCashAccounts.length} accounts with no external link`, `Total idle: ${idleAmount.toFixed(2)}`],
        suggestedActions: ["Create external account links", "Set up cash sweep", "Invest in short-term instruments"],
        relatedInsightIds: [`liq-idle-cash-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
      }));
    }

    if (snapshots.length >= 10) {
      const recent = snapshots.filter((s) => s.metric === "total_balance").slice(0, 30);
      const values = recent.map((s) => Number(s.value));
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const min = Math.min(...values);
      if (min < mean * 0.7) {
        insights.push(makeInsight({
          id: `liq-runway-${ctx.companyId}`, category: "liquidity",
          title: "Declining cash runway",
          description: `Cash balance of ${min.toFixed(2)} is 30%+ below the 30-day average of ${mean.toFixed(2)}`,
          severity: "high", confidence: 75, direction: "down",
          sourceData: ["intelligence_snapshots", "treasury_accounts"], timestamp: new Date().toISOString(),
          explainability: {
            why: `Current minimum balance ${min.toFixed(2)} is more than 30% below the ${values.length}-day average of ${mean.toFixed(2)}`,
            evidence: [`30-day avg: ${mean.toFixed(2)}`, `Current low: ${min.toFixed(2)}`, `${values.length} data points analyzed`],
            confidenceCalculation: "75% — statistical deviation from moving average",
            whatToDo: "Review cash flow forecast and consider liquidity measures",
          },
        }));
        recommendations.push(makeRecommendation({
          id: `rec-liq-runway-${ctx.companyId}`, title: "Review cash runway",
          description: "Cash levels have dropped significantly below the 30-day average",
          severity: "high", confidence: 75, category: "liquidity",
          affectedEntities: ["treasury", "finance"], affectedAccounts: [],
          supportingEvidence: [`30-day avg: ${mean.toFixed(2)}`, `Current low: ${min.toFixed(2)}`],
          suggestedActions: ["Review cash flow forecast", "Reduce discretionary spend", "Evaluate credit line usage"],
          relatedInsightIds: [`liq-runway-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
        }));
      }
    }

    const currencies = new Set(treasuryAccounts.map((a) => a.currency));
    if (currencies.size > 3) {
      insights.push(makeInsight({
        id: `liq-concentration-${ctx.companyId}`, category: "liquidity",
        title: "Multi-currency liquidity concentration",
        description: `${currencies.size} currencies active across treasury accounts`,
        severity: "medium", confidence: 90,
        sourceData: ["treasury_accounts"], timestamp: new Date().toISOString(),
        explainability: {
          why: `Treasury accounts span ${currencies.size} different currencies`,
          evidence: [`Currencies: ${Array.from(currencies).join(", ")}`],
          confidenceCalculation: "90% — direct currency diversity count",
          whatToDo: "Review FX exposure and hedging strategy",
        },
      }));
    }

    return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
