import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class TreasuryIntelligenceEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [prevScore, cashPositions, cashPools, glBalances, fxExposures, forecasts] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId, scoreType: "treasury-health" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.treasuryCashPosition.findMany({ where: { companyId } }),
      prisma.treasuryCashPool.findMany({ where: { companyId } }),
      prisma.gLAccountBalance.findMany({
        where: { companyId },
        select: { endingBalance: true, account: { select: { category: true } } },
      }),
      prisma.treasuryFXExposure.findMany({ where: { companyId } }),
      prisma.treasuryCashForecast.findMany({
        where: { companyId },
        orderBy: { generatedAt: "desc" },
        take: 5,
      }),
    ]);

    const components: ScoreComponent[] = [];

    // cashPosition (25%): Cash to short-term liabilities
    let cashScore = 0;
    const totalCashBalance = cashPositions.reduce((s, p) => s + Number(p.availableBalance), 0);
    const totalPoolBalance = cashPools.reduce((s, p) => s + Number(p.availableBalance), 0);
    const totalCash = totalCashBalance + totalPoolBalance;
    if (totalCash > 0) {
      cashScore = 100;
    } else if (cashPositions.length > 0 || cashPools.length > 0) {
      cashScore = 50;
    }
    components.push({
      label: "Cash Position",
      value: Math.round(cashScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(cashScore),
      evidence: `Total cash: ${totalCashBalance + totalPoolBalance}`,
    });

    // liquidityScore (20%): Current ratio from GL balances
    let liquidityScore = 0;
    if (glBalances.length > 0) {
      const assetBalances = glBalances
        .filter((b) => b.account.category === "ASSET")
        .reduce((s, b) => s + Number(b.endingBalance), 0);
      const liabilityBalances = glBalances
        .filter((b) => b.account.category === "LIABILITY")
        .reduce((s, b) => s + Number(b.endingBalance), 0);
      if (liabilityBalances > 0) {
        const ratio = assetBalances / liabilityBalances;
        liquidityScore = Math.min(100, ratio * 50);
      } else if (assetBalances > 0) {
        liquidityScore = 100;
      }
    }
    components.push({
      label: "Liquidity Score",
      value: Math.round(liquidityScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(liquidityScore),
      evidence: `${glBalances.length} GL balances checked`,
    });

    // fxExposure (15%): Hedged vs open positions
    let fxScore = 100;
    if (fxExposures.length > 0) {
      const openExposures = fxExposures.filter((fx) => fx.hedgeStatus !== "HEDGED").length;
      fxScore = Math.max(0, 100 - (openExposures / fxExposures.length) * 100);
    }
    components.push({
      label: "FX Exposure",
      value: Math.round(fxScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(fxScore),
      evidence: `${fxExposures.length} FX positions`,
    });

    // bankBalanceCoverage (15%)
    let bankCoverageScore = 50;
    try {
      const bankConnections = await prisma.bankConnection.findMany({
        where: { companyId, isActive: true },
      });
      if (bankConnections.length > 0) {
        const externalBalances = await prisma.externalBalance.findMany({
          where: {
            externalAccount: { companyId },
          },
          orderBy: { recordedAt: "desc" },
          take: 100,
          select: { current: true },
        });
        if (externalBalances.length > 0) {
          bankCoverageScore = 100;
        }
      }
    } catch {
      bankCoverageScore = 50;
    }
    components.push({
      label: "Bank Balance Coverage",
      value: Math.round(bankCoverageScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(bankCoverageScore),
      evidence: `Bank coverage evaluated`,
    });

    // paymentObligations (15%)
    let paymentScore = 100;
    if (forecasts.length > 0) {
      const latest = forecasts[0];
      const netPrediction = Number(latest.netPrediction);
      const openingBalance = Number(latest.openingBalance);
      if (netPrediction < 0 && openingBalance + netPrediction < 0) {
        paymentScore = Math.max(0, 50 + ((openingBalance + netPrediction) / Math.abs(netPrediction)) * 50);
      }
    }
    components.push({
      label: "Payment Obligations",
      value: Math.round(paymentScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(paymentScore),
      evidence: `${forecasts.length} forecasts available`,
    });

    // cashConcentration (10%): Centralized vs total cash
    let concentrationScore = 0;
    if (cashPools.length > 0 && (totalCashBalance > 0 || totalPoolBalance > 0)) {
      const centralizedRatio = totalPoolBalance / (totalCashBalance + totalPoolBalance || 1);
      concentrationScore = Math.min(100, centralizedRatio * 100);
    } else if (cashPositions.length > 0) {
      concentrationScore = 50;
    }
    components.push({
      label: "Cash Concentration",
      value: Math.round(concentrationScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(concentrationScore),
      evidence: `${cashPools.length} pools, ${cashPositions.length} positions`,
    });

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    const score =
      totalWeight > 0
        ? components.reduce((s, c) => s + (c.value * c.weight) / totalWeight, 0)
        : 0;
    const overall = Math.round(score * 100) / 100;
    const severity = computeSeverity(overall);

    // compute forecast from last 4 cash positions
    const sortedPositions = [...cashPositions].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
    const recentPositions = sortedPositions.slice(0, 4).map((p) => Number(p.totalBalance));
    let forecastData: Record<string, unknown> | undefined;
    if (recentPositions.length >= 2) {
      const sumX = (recentPositions.length * (recentPositions.length - 1)) / 2;
      const sumY = recentPositions.reduce((s, v) => s + v, 0);
      const sumXY = recentPositions.reduce((s, v, i) => s + v * i, 0);
      const sumX2 = recentPositions.reduce((s, _, i) => s + i * i, 0);
      const n = recentPositions.length;
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
      forecastData = {
        lastFourBalances: recentPositions,
        projectedNextBalance: recentPositions[recentPositions.length - 1] + slope,
        trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable",
      };
    }

    const recommendations: EngineResult["recommendations"] = [];
    if (cashScore < 60) {
      recommendations.push({
        title: "Cash position requires attention",
        reason: `Cash position score is ${cashScore}/100. Consider optimizing cash reserves.`,
        priority: "high",
        confidence: "medium",
      });
    }
    for (const comp of components) {
      if (comp.value < 70 && comp.label !== "Cash Position") {
        recommendations.push({
          title: `${comp.label} needs improvement`,
          reason: `${comp.label} score is ${comp.value}/100. ${comp.evidence ?? ""}`,
          priority: comp.value < 50 ? "high" : "normal",
          confidence: "medium",
        });
      }
    }

    const evidence: Record<string, unknown> = {
      forecastData,
      totalCashBalance,
      totalPoolBalance,
      fxExposureCount: fxExposures.length,
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Treasury health score: ${overall}/100 — ${severity}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
