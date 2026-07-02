import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionService } from "./decision.service";
import type { Decision, DecisionPriority } from "./types";

const _decisionService = new DecisionService();

export interface DecisionBriefingSection {
  title: string;
  summary: string;
  decisions: Decision[];
  totalScore: number;
}

export interface ExecutiveDecisionBriefing {
  title: string;
  generatedAt: string;
  period: string;
  topDecisions: Decision[];
  sections: DecisionBriefingSection[];
  criticalCount: number;
  totalDecisions: number;
  recommendations: string[];
}

const PRIORITY_LABELS: Record<DecisionPriority, string> = {
  1: "Low",
  2: "Moderate",
  3: "Significant",
  4: "High",
  5: "Critical",
};

export async function generateDecisionBriefing(
  ctx: TenantContext,
  period?: "daily" | "weekly",
): Promise<ExecutiveDecisionBriefing> {
  const p = period ?? "daily";
  const now = new Date().toISOString();

  const prioritized = await _decisionService.getPrioritizedDecisions(ctx);
  const topDecisions = prioritized.decisions.slice(0, 10);
  const criticalCount = prioritized.decisions.filter((d) => d.priority >= 4).length;

  const sections: DecisionBriefingSection[] = [];
  const categoryOrder = ["risk", "treasury", "payment", "approval", "reconciliation", "operational"] as const;

  for (const cat of categoryOrder) {
    const catDecisions = prioritized.decisions.filter((d) => d.type === cat);
    if (catDecisions.length === 0) continue;

    const totalScore = catDecisions.reduce((s, d) => s + d.score.overall, 0);
    const avgScore = totalScore / catDecisions.length;
    const bestPriority = Math.min(...catDecisions.map((d) => d.priority));

    sections.push({
      title: `${capitalize(cat)} Decisions`,
      summary: `${catDecisions.length} decisions, avg score ${avgScore.toFixed(2)}. ` +
        `Highest priority: ${PRIORITY_LABELS[bestPriority as DecisionPriority]}.`,
      decisions: catDecisions,
      totalScore: Math.round(totalScore * 10) / 10,
    });
  }

  const briefingRecs: string[] = [];
  const criticalDecisions = prioritized.decisions.filter((d) => d.priority >= 4);
  if (criticalDecisions.length > 0) {
    briefingRecs.push(`Review ${criticalDecisions.length} critical-priority decisions requiring immediate attention`);
  }
  for (const d of topDecisions.slice(0, 3)) {
    briefingRecs.push(`[P${d.priority}] ${d.title}: ${d.suggestedActions[0] ?? d.description.slice(0, 80)}`);
  }

  return {
    title: `${capitalize(p)} Decision Intelligence Briefing`,
    generatedAt: now,
    period: p,
    topDecisions,
    sections,
    criticalCount,
    totalDecisions: prioritized.decisions.length,
    recommendations: briefingRecs,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
