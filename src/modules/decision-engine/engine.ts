/**
 * Phase 22.5 — Decision Intelligence Engine: Engine
 *
 * The generic reasoning core. Four capabilities, all deterministic:
 *
 *   evaluateEvidence(input)  — rules + policies + risk + confidence
 *   buildRecommendation(...) — synthesizeRecommendation (pure)
 *   evaluateDecision(...)    — full Decision artifact with reasoning graph
 *   explainDecision(...)     — human-readable, evidence-grounded explanation
 *
 * The engine never decides and never writes free-form prose. LLMs are
 * explicitly out of scope — a future LLM capability may only summarize the
 * deterministic reasoning graph.
 */

import { createHash } from "node:crypto";
import type {
  Decision,
  DecisionConfidenceResult,
  DecisionEvidence,
  DecisionExplanation,
  DecisionLifecycleState,
  PolicyEvaluation,
  ReasoningGraph,
  RiskAssessment,
  RuleEvaluation,
} from "./types";
import { RECOMMENDATION_LABELS } from "./types";
import { evaluatePolicies } from "./policy-evaluator";
import { assessRisk } from "./risk-engine";
import { deriveConfidence } from "./confidence";
import { evaluateRules } from "./rule-engine";
import { buildReasoningGraph } from "./reasoning";
import { buildExplanation, buildAlternatives } from "./explanations";
import { synthesizeRecommendation, type RecommendationResult } from "./recommendation";
import { getDecisionTypeRegistry } from "./registry";

export const DECISION_ENGINE_VERSION = "1.0.0";

export interface DecisionEvaluation {
  evidence: DecisionEvidence;
  rules: RuleEvaluation[];
  policies: PolicyEvaluation[];
  risk: RiskAssessment;
  confidence: DecisionConfidenceResult;
  recommendation: RecommendationResult;
}

export class DecisionIntelligenceEngine {
  constructor(
    private readonly config = getDecisionTypeRegistry(),
  ) {}

  evaluateEvidence(evidence: DecisionEvidence): DecisionEvaluation {
    const config = this.config.require(evidence.entityType);
    const rules = evaluateRules(config.rules, evidence);
    const policies = evaluatePolicies(config.policies, evidence);
    const risk = assessRisk(config.riskFactors, evidence);
    const confidence = deriveConfidence(config.confidenceFactors, evidence);
    const recommendation = synthesizeRecommendation({ evidence, ruleResults: rules, policyResults: policies, risk, confidence });
    return { evidence, rules, policies, risk, confidence, recommendation };
  }

  buildRecommendation(evidence: DecisionEvidence): RecommendationResult {
    return this.evaluateEvidence(evidence).recommendation;
  }

  evaluateDecision(evidence: DecisionEvidence): Decision {
    const evaluation = this.evaluateEvidence(evidence);
    const now = evidence.now ?? new Date().toISOString();
    const config = this.config.require(evidence.entityType);
    const decisionId = `dec:${evidence.entityType}:${evidence.entityId}`;
    const reasoningGraph = buildReasoningGraph({
      evidence,
      rules: config.rules,
      policies: config.policies,
      riskFactors: config.riskFactors,
      confidenceFactors: config.confidenceFactors,
      ruleResults: evaluation.rules,
      policyResults: evaluation.policies,
      riskResults: evaluation.risk.factors,
      confidenceResults: evaluation.confidence.factors,
      decisionId,
      recommendation: evaluation.recommendation.category,
      confidence: evaluation.confidence.band,
      riskLevel: evaluation.risk.level,
    });

    return {
      id: decisionId,
      type: evidence.entityType,
      entity: { type: evidence.entityType, id: evidence.entityId },
      statusLabel: evidence.statusLabel ?? null,
      recommendation: evaluation.recommendation.category,
      recommendationLabel: RECOMMENDATION_LABELS[evaluation.recommendation.category],
      confidence: evaluation.confidence.band,
      confidenceBasis: evaluation.confidence.basis,
      reasoningGraph,
      triggeredRules: evaluation.rules,
      triggeredPolicies: evaluation.policies,
      supportingEvidence: collectSupportingEvidence(evaluation),
      missingEvidence: evidence.missing,
      riskAssessment: evaluation.risk,
      requiredHumanActions: evaluation.recommendation.requiredHumanActions,
      alternativeOutcomes: buildAlternatives(
        RECOMMENDATION_LABELS[evaluation.recommendation.category],
        evaluation.risk.level,
      ),
      audit: {
        engineVersion: DECISION_ENGINE_VERSION,
        lifecycle: "recommended" as DecisionLifecycleState,
        transitions: [
          { from: "created", to: "evaluated", at: now, actor: "engine", reason: "evidence evaluated" },
          { from: "evaluated", to: "recommended", at: now, actor: "engine", reason: "recommendation synthesized" },
        ],
        determinismHash: determinismHash(evidence, config),
        sourceSystems: collectSourceSystems(evidence),
      },
      version: DECISION_ENGINE_VERSION,
      createdAt: now,
    };
  }

  explainDecision(evidence: DecisionEvidence): DecisionExplanation {
    const evaluation = this.evaluateEvidence(evidence);
    return buildExplanation({
      evidence,
      ruleResults: evaluation.rules,
      policyResults: evaluation.policies,
      risk: evaluation.risk,
      recommendationLabel: RECOMMENDATION_LABELS[evaluation.recommendation.category],
      recommendationReason: evaluation.recommendation.reason,
      nextAction: evaluation.recommendation.nextAction,
    });
  }
}

export function labelFor(category: RecommendationResult["category"]): string {
  return RECOMMENDATION_LABELS[category];
}

function collectSupportingEvidence(evaluation: DecisionEvaluation): string[] {
  const ids: string[] = [];
  for (const r of evaluation.rules) if (r.triggered) ids.push(...r.evidenceIds);
  for (const p of evaluation.policies) if (p.applies) ids.push(...p.evidenceIds);
  for (const f of evaluation.risk.factors) if (f.triggered) ids.push(...f.evidenceIds);
  return Array.from(new Set(ids));
}

function collectSourceSystems(evidence: DecisionEvidence): string[] {
  const systems = new Set<string>();
  for (const item of evidence.items) {
    if (item.sectionId) systems.add(item.sectionId);
    if (item.groupId) systems.add(item.groupId);
  }
  for (const m of evidence.missing) {
    if (m.sourceSystem) systems.add(m.sourceSystem);
  }
  return Array.from(systems);
}

function determinismHash(
  evidence: DecisionEvidence,
  config: { rules: unknown; policies: unknown; riskFactors: unknown; confidenceFactors: unknown },
): string {
  const canonical = JSON.stringify({
    evidence: { ...evidence, now: undefined },
    rules: config.rules,
    policies: config.policies,
    riskFactors: config.riskFactors,
    confidenceFactors: config.confidenceFactors,
    version: DECISION_ENGINE_VERSION,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export type { ReasoningGraph };
