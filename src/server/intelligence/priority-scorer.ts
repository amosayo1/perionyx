import type { Insight, IntelligenceConfig, PriorityScore, Signal } from "./types";
import { DEFAULT_INTELLIGENCE_CONFIG } from "./types";

export class PriorityScorer {
  private config: IntelligenceConfig;

  constructor(config: Partial<IntelligenceConfig> = {}) {
    this.config = { ...DEFAULT_INTELLIGENCE_CONFIG, ...config };
  }

  scoreInsight(insight: Insight): PriorityScore {
    const urgency = this.calculateUrgency(insight);
    const businessImpact = this.calculateBusinessImpact(insight);
    const confidence = insight.confidenceScore;
    const timeframe = this.calculateTimeframe(insight);

    const overall =
      urgency * this.config.scoringWeights.urgency +
      businessImpact * this.config.scoringWeights.businessImpact +
      confidence * this.config.scoringWeights.confidence +
      timeframe * this.config.scoringWeights.timeframe;

    return { overall, urgency, businessImpact, confidence, timeframe };
  }

  scoreSignal(signal: Signal): { score: number; reason: string } {
    let score = 0.5;
    const reasons: string[] = [];

    if (typeof signal.value === "number") {
      if (signal.value > 0.8) { score += 0.3; reasons.push("high signal value"); }
      else if (signal.value > 0.5) { score += 0.15; reasons.push("moderate signal value"); }
    }

    if (signal.source === "risk" || signal.source === "compliance") {
      score += 0.15;
      reasons.push(`${signal.source} domain`);
    }

    if (signal.type === "anomaly" || signal.type === "violation") {
      score += 0.2;
      reasons.push("anomaly/violation type");
    }

    return {
      score: Math.min(1, score),
      reason: reasons.join(", ") || "default scoring",
    };
  }

  compareInsights(a: Insight, b: Insight): number {
    return this.scoreInsight(b).overall - this.scoreInsight(a).overall;
  }

  getThreshold(priority: Insight["severity"]): number {
    switch (priority) {
      case "critical": return 0.8;
      case "high": return 0.6;
      case "medium": return 0.4;
      case "low": return 0.2;
      case "informational": return 0;
    }
  }

  private calculateUrgency(insight: Insight): number {
    const now = Date.now();
    const expiry = new Date(insight.expiresAt).getTime();
    const remaining = expiry - now;
    const maxTtl = 900_000;
    return Math.max(0, Math.min(1, 1 - remaining / maxTtl));
  }

  private calculateBusinessImpact(insight: Insight): number {
    const severityMap: Record<string, number> = {
      critical: 1.0,
      high: 0.75,
      medium: 0.5,
      low: 0.25,
      informational: 0.05,
    };
    return severityMap[insight.severity] ?? 0.3;
  }

  private calculateTimeframe(insight: Insight): number {
    const now = Date.now();
    const expiry = new Date(insight.expiresAt).getTime();
    const remaining = expiry - now;
    if (remaining <= 0) return 1;
    if (remaining < 3_600_000) return 0.8;
    if (remaining < 28_800_000) return 0.5;
    return 0.2;
  }
}

export const priorityScorer = new PriorityScorer();
