export type DecisionCategory =
  | "treasury"
  | "payment"
  | "approval"
  | "reconciliation"
  | "operational"
  | "risk";

export type DecisionUrgency = 1 | 2 | 3 | 4 | 5;
export type DecisionImpact = 1 | 2 | 3 | 4 | 5;
export type DecisionConfidence = 1 | 2 | 3 | 4 | 5;
export type DecisionEffort = 1 | 2 | 3 | 4 | 5;
export type DecisionPriority = 1 | 2 | 3 | 4 | 5;

export interface DecisionScore {
  businessValue: number;
  urgency: DecisionUrgency;
  financialImpact: DecisionImpact;
  operationalImpact: DecisionImpact;
  confidence: DecisionConfidence;
  effort: DecisionEffort;
  riskReduction: number;
  overall: number;
}

export interface DecisionTimeline {
  generatedAt: string;
  status: "recommended" | "accepted" | "dismissed" | "expired";
  evaluatedAt?: string;
  acceptedAt?: string;
  dismissedAt?: string;
  dismissedReason?: string;
  expiredAt?: string;
}

export interface Decision {
  id: string;
  type: DecisionCategory;
  title: string;
  description: string;
  score: DecisionScore;
  priority: DecisionPriority;
  affectedAccounts: string[];
  affectedEntities: string[];
  suggestedActions: string[];
  supportingEvidence: string[];
  scenarioComparison?: ScenarioComparison;
  explainability: DecisionExplainability;
  timeline: DecisionTimeline;
  sourceService: string;
  metadata?: Record<string, unknown>;
}

export interface DecisionExplainability {
  why: string;
  evidenceUsed: string[];
  forecastsConsidered: string[];
  policiesInvolved: string[];
  assumptions: string[];
  confidenceCalculation: string;
  expectedOutcome: string;
  alternativesConsidered: string[];
}

export interface ScenarioComparison {
  currentStrategy: ScenarioStrategy;
  alternativeStrategy: ScenarioStrategy;
  expectedImprovement: string;
  riskTradeoffs: string[];
}

export interface ScenarioStrategy {
  label: string;
  description: string;
  projectedOutcome: string;
  confidence: number;
  metrics: { label: string; value: string; change?: string }[];
}

export interface DecisionEvaluatorResult {
  decisions: Decision[];
  evaluatedAt: string;
  durationMs: number;
}

export interface DecisionWeightConfig {
  businessValue: number;
  urgency: number;
  financialImpact: number;
  operationalImpact: number;
  confidence: number;
  effort: number;
  riskReduction: number;
}

export const DEFAULT_WEIGHTS: DecisionWeightConfig = {
  businessValue: 0.20,
  urgency: 0.20,
  financialImpact: 0.20,
  operationalImpact: 0.15,
  confidence: 0.10,
  effort: 0.05,
  riskReduction: 0.10,
};

export function calculateOverallScore(
  score: Omit<DecisionScore, "overall">,
  weights: DecisionWeightConfig = DEFAULT_WEIGHTS,
): number {
  return Math.round(
    (score.businessValue * weights.businessValue +
     score.urgency * weights.urgency +
     score.financialImpact * weights.financialImpact +
     score.operationalImpact * weights.operationalImpact +
     score.confidence * weights.confidence +
     (6 - score.effort) * weights.effort +
     score.riskReduction * weights.riskReduction) * 10,
  ) / 10;
}

export function priorityFromScore(overall: number): DecisionPriority {
  if (overall >= 4.0) return 5;
  if (overall >= 3.0) return 4;
  if (overall >= 2.0) return 3;
  if (overall >= 1.0) return 2;
  return 1;
}

export function makeDecision(
  base: Omit<Decision, "id" | "priority" | "score" | "timeline"> & {
    id?: string;
    score?: Partial<DecisionScore>;
    timeline?: Partial<DecisionTimeline>;
  },
  weights?: DecisionWeightConfig,
): Decision {
  const score: DecisionScore = {
    businessValue: base.score?.businessValue ?? 1,
    urgency: base.score?.urgency ?? 1,
    financialImpact: base.score?.financialImpact ?? 1,
    operationalImpact: base.score?.operationalImpact ?? 1,
    confidence: base.score?.confidence ?? 1,
    effort: base.score?.effort ?? 3,
    riskReduction: base.score?.riskReduction ?? 1,
    overall: 0,
  };
  score.overall = calculateOverallScore(score, weights);

  return {
    ...base,
    id: base.id ?? `dec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    score,
    priority: priorityFromScore(score.overall),
    timeline: {
      generatedAt: base.timeline?.generatedAt ?? new Date().toISOString(),
      status: base.timeline?.status ?? "recommended",
    },
  };
}
