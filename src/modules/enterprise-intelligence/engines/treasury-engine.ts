import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult } from "../types";
import { makeInsight, makeRecommendation } from "../types";

export class TreasuryIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "treasury";
  readonly label = "Treasury Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();
    const insights = [];
    const recommendations = [];

    const transactions = await prisma.transaction.findMany({
      where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 200,
    });

    const outgoing = transactions.filter((t) => t.type === "WALLET_DEBIT");
    const incoming = transactions.filter((t) => t.type === "WALLET_CREDIT");

    if (outgoing.length >= 10) {
      const timings = outgoing.map((t) => ({ hour: new Date(t.createdAt).getHours(), amount: Number(t.primaryAmount) }));
      const offHours = timings.filter((t) => t.hour < 8 || t.hour > 18);
      if (offHours.length > timings.length * 0.3) {
        insights.push(makeInsight({
          id: `treasury-timing-${ctx.companyId}`, category: "treasury",
          title: "Unusual payment timing",
          description: `${offHours.length} of ${timings.length} outgoing transactions (${Math.round((offHours.length / timings.length) * 100)}%) are initiated outside business hours`,
          severity: offHours.some((t) => t.amount > 50000) ? "high" : "medium", confidence: 80,
          sourceData: ["transactions"], timestamp: new Date().toISOString(),
          metadata: { offHourCount: offHours.length, totalCount: timings.length },
          explainability: {
            why: `${offHours.length} of ${timings.length} outgoing transactions (${Math.round((offHours.length / timings.length) * 100)}%) occur outside 8 AM - 6 PM business hours`,
            evidence: [`${offHours.length} off-hour transactions`, `${timings.length} total transactions analyzed`, `${offHours.filter((t) => t.amount > 50000).length} exceed $50k`],
            confidenceCalculation: "80% — threshold-based: >30% off-hour activity triggers analysis",
            whatToDo: "Review transaction schedules and verify recent approvals",
          },
        }));
        recommendations.push(makeRecommendation({
          id: `rec-treasury-timing-${ctx.companyId}`, title: "Review off-hour transaction activity",
          description: `${offHours.length} transactions (${Math.round((offHours.length / timings.length) * 100)}%) were initiated outside business hours`,
          severity: "medium", confidence: 75, category: "treasury",
          affectedEntities: ["treasury"], affectedAccounts: [],
          supportingEvidence: [`${offHours.length} off-hour transactions`, offHours.filter((t) => t.amount > 50000).length > 0 ? `${offHours.filter((t) => t.amount > 50000).length} off-hour transactions exceed $50,000` : ""].filter(Boolean),
          suggestedActions: ["Review transaction schedule", "Verify recent approvals", "Set up off-hour approval rules"],
          relatedInsightIds: [`treasury-timing-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
        }));
      }
    }

    if (incoming.length >= 10) {
      const incomingByCurrency: Record<string, { count: number; total: number }> = {};
      for (const t of incoming) {
        const cur = t.currency;
        if (!incomingByCurrency[cur]) incomingByCurrency[cur] = { count: 0, total: 0 };
        incomingByCurrency[cur].count++;
        incomingByCurrency[cur].total += Number(t.primaryAmount);
      }
      const currencies = Object.entries(incomingByCurrency);
      if (currencies.length >= 2) {
        insights.push(makeInsight({
          id: `treasury-currency-inflow-${ctx.companyId}`, category: "treasury",
          title: "Multi-currency incoming volume",
          description: `Incoming transactions received across ${currencies.length} currencies`,
          severity: "info", confidence: 95, sourceData: ["transactions"], timestamp: new Date().toISOString(),
          metadata: { currencyCount: currencies.length, totals: Object.fromEntries(currencies.map(([k, v]) => [k, v.total])) },
          explainability: {
            why: `Incoming transactions span ${currencies.length} currencies`,
            evidence: currencies.map(([k, v]) => `${k}: ${v.total.toFixed(2)} (${v.count} transactions)`),
            confidenceCalculation: "95% — direct currency diversity analysis",
            whatToDo: "Review multi-currency treasury operations",
          },
        }));
        const sorted = currencies.sort((a, b) => b[1].total - a[1].total);
        const dominant = sorted[0];
        if (dominant[1].total / currencies.reduce((s, [, v]) => s + v.total, 0) > 0.6) {
          recommendations.push(makeRecommendation({
            id: `rec-treasury-currency-${ctx.companyId}`, title: "Diversify incoming currency sources",
            description: `${dominant[0]} represents ${Math.round((dominant[1].total / currencies.reduce((s, [, v]) => s + v.total, 0)) * 100)}% of incoming volume`,
            severity: "medium", confidence: 70, category: "treasury",
            affectedEntities: ["treasury", "finance"], affectedAccounts: [],
            supportingEvidence: [`${dominant[0]}: ${dominant[1].total.toFixed(2)} of ${currencies.reduce((s, [, v]) => s + v.total, 0).toFixed(2)} total incoming`, "Concentration > 60% is a single point of failure"],
            suggestedActions: ["Re-evaluate currency exposure", "Set up multi-currency routing", "Review concentration thresholds"],
            relatedInsightIds: [`treasury-currency-inflow-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
          }));
        }
      }
    }

    return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
