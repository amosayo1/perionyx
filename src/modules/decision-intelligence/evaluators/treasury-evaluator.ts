import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class TreasuryDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "treasury";
  readonly label = "Treasury Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [wallets, treasuryAccounts, snapshots] = await Promise.all([
      prisma.wallet.findMany({ where: { companyId: ctx.companyId } }),
      prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId, isActive: true } }),
      prisma.intelligenceSnapshot.findMany({
        where: { companyId: ctx.companyId, metric: "total_balance" },
        orderBy: { takenAt: "desc" }, take: 30,
      }),
    ]);

    const totalWallet = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const totalTreasury = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);

    // ── Idle Cash Deployment ────────────────────────────────────────────
    const idleAccounts = treasuryAccounts.filter((a) => Number(a.balance) > 0 && !a.plaidAccountId);
    if (idleAccounts.length > 0) {
      const idleAmount = idleAccounts.reduce((s, a) => s + Number(a.balance), 0);
      decisions.push(makeDecision({
        type: "treasury",
        title: "Deploy idle cash to yield-bearing accounts",
        description: `${idleAmount.toFixed(2)} in idle cash across ${idleAccounts.length} non-linked treasury accounts`,
        affectedAccounts: idleAccounts.map((a) => a.id),
        affectedEntities: ["treasury"],
        suggestedActions: [
          "Link idle accounts to external banks via Plaid",
          "Set up automated cash sweeps",
          "Invest in short-term instruments",
        ],
        supportingEvidence: [
          `${idleAccounts.length} accounts without Plaid link`,
          `Total idle amount: ${idleAmount.toFixed(2)}`,
          `Current wallet balance: ${totalWallet.toFixed(2)}`,
        ],
        score: {
          businessValue: 4, urgency: 3, financialImpact: 4,
          operationalImpact: 2, confidence: 4, effort: 3, riskReduction: 2,
        },
        sourceService: "decision-intelligence:treasury-evaluator",
        explainability: {
          why: `${idleAmount.toFixed(2)} in idle cash is not earning yield or available for operations`,
          evidenceUsed: ["treasury_accounts", "external_accounts"],
          forecastsConsidered: ["Balance trend from 30 snapshots"],
          policiesInvolved: [],
          assumptions: ["Linked accounts provide yield or sweep functionality"],
          confidenceCalculation: "Confidence 4/5 — direct account link status provides high certainty",
          expectedOutcome: "Idle cash deployed to yield-bearing instruments, improving returns",
          alternativesConsidered: ["Manual sweep on fixed schedule", "Threshold-based auto-sweep"],
        },
      }));
    }

    // ── Liquidity Consolidation ─────────────────────────────────────────
    if (treasuryAccounts.length > 3) {
      const multiCurrency = new Set(treasuryAccounts.map((a) => a.currency));
      if (multiCurrency.size > 1) {
        decisions.push(makeDecision({
          type: "treasury",
          title: "Consolidate multi-currency liquidity",
          description: `${treasuryAccounts.length} treasury accounts across ${multiCurrency.size} currencies — consider consolidation`,
          affectedAccounts: treasuryAccounts.map((a) => a.id),
          affectedEntities: ["treasury", "finance"],
          suggestedActions: [
            "Review account necessity per currency",
            "Merge small-balance accounts",
            "Consolidate to primary accounts per currency",
          ],
          supportingEvidence: [
            `${treasuryAccounts.length} active accounts`,
            `${multiCurrency.size} currencies: ${Array.from(multiCurrency).join(", ")}`,
            `Total treasury balance: ${totalTreasury.toFixed(2)}`,
          ],
          score: {
            businessValue: 3, urgency: 2, financialImpact: 2,
            operationalImpact: 3, confidence: 3, effort: 4, riskReduction: 2,
          },
          sourceService: "decision-intelligence:treasury-evaluator",
          explainability: {
            why: `${treasuryAccounts.length} accounts across ${multiCurrency.size} currencies increases operational complexity`,
            evidenceUsed: ["treasury_accounts"],
            forecastsConsidered: [],
            policiesInvolved: [],
            assumptions: ["Fewer accounts reduce management overhead"],
            confidenceCalculation: "Confidence 3/5 — consolidation benefit depends on account structure",
            expectedOutcome: "Reduced operational overhead and simplified reconciliation",
            alternativesConsidered: ["Maintain current structure", "Add sub-account grouping"],
          },
        }));
      }
    }

    // ── Entity Rebalancing ──────────────────────────────────────────────
    if (totalTreasury > totalWallet * 2 && totalWallet > 0) {
      decisions.push(makeDecision({
        type: "treasury",
        title: "Rebalance treasury-to-wallet allocation",
        description: `Treasury (${totalTreasury.toFixed(2)}) is ${Math.round(totalTreasury / totalWallet)}x wallet balance (${totalWallet.toFixed(2)})`,
        affectedAccounts: [...treasuryAccounts.map((a) => a.id), ...wallets.map((w) => w.id)],
        affectedEntities: ["treasury", "finance"],
        suggestedActions: [
          "Transfer excess treasury funds to operating wallets",
          "Review liquidity requirements per entity",
          "Set target allocation ratios",
        ],
        supportingEvidence: [
          `Treasury balance: ${totalTreasury.toFixed(2)}`,
          `Wallet balance: ${totalWallet.toFixed(2)}`,
          `Ratio: ${(totalTreasury / totalWallet).toFixed(1)}x`,
        ],
        score: {
          businessValue: 3, urgency: 2, financialImpact: 3,
          operationalImpact: 2, confidence: 3, effort: 3, riskReduction: 3,
        },
        sourceService: "decision-intelligence:treasury-evaluator",
        explainability: {
          why: `Treasury accounts (${totalTreasury.toFixed(2)}) hold ${Math.round(totalTreasury / totalWallet)}x the wallet balance (${totalWallet.toFixed(2)}), indicating potential overallocation`,
          evidenceUsed: ["wallet", "treasury_accounts"],
          forecastsConsidered: snapshots.length > 0 ? [`${snapshots.length} snapshots of total balance history`] : [],
          policiesInvolved: [],
          assumptions: ["Optimal ratio is closer to 1:1 or 2:1"],
          confidenceCalculation: "Confidence 3/5 — optimal ratio depends on business requirements",
          expectedOutcome: "Better liquidity alignment between treasury and operating accounts",
          alternativesConsidered: ["Maintain current allocation", "Partial rebalance only"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
