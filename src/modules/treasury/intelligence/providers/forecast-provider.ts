/**
 * Program 1 — Treasury Intelligence Platform: Cash Forecast Evidence Provider
 *
 * Evidence surface for the most recent recorded cash forecast. Identity,
 * status (confidence band), business context (horizon), financial context
 * (projected balances) and risk (negative projection, named risks). The
 * provider surfaces recorded facts only — a negative projected minimum is
 * surfaced as the fact it is; the platform never decides the response.
 * Serves the canonical entity type `treasury.forecast`.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";
import { amountLabel, contribution, item, RECORDED_BASIS, section, treasurySource } from "./helpers";
import { loadForecast } from "./loaders";
import type { CashForecastRecord } from "../types";

export class TreasuryForecastProvider implements IEvidenceProvider {
  readonly id = "treasury.forecast";
  readonly name = "Treasury Cash Forecast";
  readonly entityTypes = ["treasury.forecast"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "forecast.identity",
      sectionId: "identity",
      label: "Forecast identity",
      reason: "A forecast must name its currency and horizon.",
      blocking: true,
      satisfiedBy: ["fc.identity"],
    },
    {
      id: "forecast.projection",
      sectionId: "financial-context",
      label: "Projected balance",
      reason: "The projected closing balance is the measured forecast output.",
      blocking: true,
      satisfiedBy: ["fc.projection"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const forecast = await loadForecast(context);
    if (!forecast) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "forecast.record",
            sectionId: "identity",
            label: "Cash forecast record",
            reason: "No treasury cash forecast exists for this entity.",
            impact: "blocking",
            canProceed: false,
            sourceSystem: "treasury.prisma",
          },
        ],
        this.sourceSystems,
      );
    }
    return contribution(
      this.id,
      [
        section("identity", this.identityItems(forecast)),
        section("status", this.statusItems(forecast)),
        section("business-context", this.contextItems(forecast)),
        section("financial-context", this.financialItems(forecast)),
        section("risk", this.riskItems(forecast)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "fc.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Forecast identity",
      summary: "Forecast record not found",
      reason: "No treasury cash forecast exists for the requested entity.",
      source: treasurySource("TreasuryCashForecast", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(forecast: CashForecastRecord): EvidenceItem[] {
    return [
      item({
        id: "fc.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Cash forecast",
        summary: `${forecast.currency} · ${forecast.horizon} horizon`,
        reason: "The exact projection being read.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [forecast.entityId],
        order: 0,
      }),
    ];
  }

  private statusItems(forecast: CashForecastRecord): EvidenceItem[] {
    return [
      item({
        id: "fc.confidence",
        sectionId: "status",
        groupId: "status",
        title: "Forecast confidence",
        summary: forecast.confidence,
        reason: "The recorded confidence band dictates how the projection should be weighted.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "high",
        status: forecast.confidence === "high" ? "positive" : forecast.confidence === "medium" ? "neutral" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private contextItems(forecast: CashForecastRecord): EvidenceItem[] {
    return [
      item({
        id: "fc.horizon",
        sectionId: "business-context",
        groupId: "context",
        title: "Horizon",
        summary: forecast.horizon,
        reason: "The horizon bounds the projection's decision relevance.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private financialItems(forecast: CashForecastRecord): EvidenceItem[] {
    return [
      item({
        id: "fc.projection",
        sectionId: "financial-context",
        groupId: "projection",
        title: "Projected closing balance",
        summary: amountLabel(forecast.closingBalance, forecast.currency),
        reason: "The projected closing balance is the measured forecast output.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
      item({
        id: "fc.opening",
        sectionId: "financial-context",
        groupId: "projection",
        title: "Opening balance",
        summary: amountLabel(forecast.openingBalance, forecast.currency),
        reason: "The recorded opening position the projection extends.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
      item({
        id: "fc.net",
        sectionId: "financial-context",
        groupId: "projection",
        title: "Net prediction",
        summary: amountLabel(forecast.netPrediction, forecast.currency),
        reason: "The projected net cash movement across the horizon.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 2,
      }),
      item({
        id: "fc.minimum",
        sectionId: "financial-context",
        groupId: "projection",
        title: "Minimum projected balance",
        summary: amountLabel(forecast.minimumProjectedBalance, forecast.currency),
        reason: "The lowest projected point flags liquidity headroom.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "medium",
        status: Number(forecast.minimumProjectedBalance) < 0 ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 3,
      }),
    ];
  }

  private riskItems(forecast: CashForecastRecord): EvidenceItem[] {
    const negative = Number(forecast.minimumProjectedBalance) < 0;
    return [
      item({
        id: "fc.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Projected balance risk",
        summary: negative ? "Projected minimum is negative" : "No negative projection",
        reason: "A negative projected minimum is a recorded fact the treasury operator must weigh.",
        source: treasurySource("TreasuryCashForecast", forecast.id, forecast.generatedAt),
        timestamp: forecast.generatedAt,
        importance: "medium",
        status: negative ? "pending" : "positive",
        confidence: negative ? "medium" : "high",
        confidenceBasis: negative ? "recorded minimum projected balance is negative" : RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}
