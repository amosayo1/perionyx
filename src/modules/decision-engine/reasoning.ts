/**
 * Phase 22.5 — Decision Intelligence: Reasoning Graph
 *
 * Builds the serializable, auditable reasoning graph (DI-P5): evidence → rule
 * → policy → risk → decision. Every node carries structured data only — no
 * prose walls. The graph is deterministically ordered (rules, then policies,
 * then risk factors, then the decision node).
 */

import type {
  DecisionEvidence,
  DecisionRule,
  DecisionPolicy,
  ReasoningEdge,
  ReasoningGraph,
  ReasoningNode,
  RiskFactorDef,
  RuleEvaluation,
  PolicyEvaluation,
  RiskFactorResult,
  ConfidenceFactorResult,
  ConfidenceFactorDef,
} from "./types";

export function buildReasoningGraph(input: {
  evidence: DecisionEvidence;
  rules: DecisionRule[];
  policies: DecisionPolicy[];
  riskFactors: RiskFactorDef[];
  confidenceFactors: ConfidenceFactorDef[];
  ruleResults: RuleEvaluation[];
  policyResults: PolicyEvaluation[];
  riskResults: RiskFactorResult[];
  confidenceResults: ConfidenceFactorResult[];
  decisionId: string;
  recommendation: string;
  confidence: string;
  riskLevel: string;
}): ReasoningGraph {
  const nodes: ReasoningNode[] = [];
  const edges: ReasoningEdge[] = [];
  const evidenceNodeIds: string[] = [];

  for (const item of input.evidence.items) {
    const id = `evidence:${item.id}`;
    evidenceNodeIds.push(id);
    nodes.push({
      id,
      kind: "evidence",
      label: item.id,
      references: [],
      data: { status: item.status, confidence: item.confidence, groupId: item.groupId },
    });
  }

  for (const r of input.ruleResults) {
    const id = `rule:${r.ruleId}`;
    const refs = r.evidenceIds.map((e) => `evidence:${e}`);
    nodes.push({
      id,
      kind: "rule",
      label: r.label,
      references: refs,
      data: { triggered: r.triggered, level: r.level ?? "none" },
    });
    for (const e of r.evidenceIds) edges.push({ from: `evidence:${e}`, to: id, label: "supports" });
  }

  for (const p of input.policyResults) {
    const id = `policy:${p.policyId}`;
    const refs = p.evidenceIds.map((e) => `evidence:${e}`);
    nodes.push({
      id,
      kind: "policy",
      label: p.name,
      references: refs,
      data: { applies: p.applies, satisfied: p.satisfied ?? "not-applicable" },
    });
    for (const e of p.evidenceIds) edges.push({ from: `evidence:${e}`, to: id, label: "checks" });
  }

  for (const f of input.riskResults) {
    const id = `risk:${f.id}`;
    const refs = f.evidenceIds.map((e) => `evidence:${e}`);
    nodes.push({
      id,
      kind: "risk",
      label: f.label,
      references: refs,
      data: { triggered: f.triggered, severity: f.severity, category: f.category },
    });
    for (const e of f.evidenceIds) edges.push({ from: `evidence:${e}`, to: id, label: "indicates" });
  }

  for (const c of input.confidenceResults) {
    const id = `confidence:${c.id}`;
    nodes.push({
      id,
      kind: "confidence",
      label: c.label,
      references: [],
      data: { triggered: c.triggered, direction: c.direction },
    });
  }

  const decisionNode: ReasoningNode = {
    id: `decision:${input.decisionId}`,
    kind: "decision",
    label: input.recommendation,
    references: [],
    data: { confidence: input.confidence, risk: input.riskLevel, state: input.evidence.state },
  };
  nodes.push(decisionNode);

  for (const r of input.ruleResults) if (r.triggered) edges.push({ from: `rule:${r.ruleId}`, to: decisionNode.id, label: "triggers" });
  for (const p of input.policyResults) if (p.applies) edges.push({ from: `policy:${p.policyId}`, to: decisionNode.id, label: "governs" });
  for (const f of input.riskResults) if (f.triggered) edges.push({ from: `risk:${f.id}`, to: decisionNode.id, label: "raises" });
  for (const c of input.confidenceResults) edges.push({ from: `confidence:${c.id}`, to: decisionNode.id, label: "qualifies" });

  return { nodes, edges };
}
