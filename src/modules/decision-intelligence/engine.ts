import type { TenantContext } from "@/server/context/tenant-context";
import type { DecisionCategory, DecisionEvaluatorResult } from "./types";

export abstract class DecisionEvaluator {
  abstract readonly category: DecisionCategory;
  abstract readonly label: string;

  abstract evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult>;

  priority(): number {
    const order: Record<string, number> = {
      treasury: 1, payment: 2, approval: 3,
      reconciliation: 4, operational: 5, risk: 6,
    };
    return order[this.category] ?? 99;
  }
}

class EvaluatorRegistry {
  private evaluators = new Map<DecisionCategory, DecisionEvaluator>();

  register(evaluator: DecisionEvaluator): void {
    if (this.evaluators.has(evaluator.category)) return;
    this.evaluators.set(evaluator.category, evaluator);
  }

  get(category: DecisionCategory): DecisionEvaluator | undefined {
    return this.evaluators.get(category);
  }

  getAll(): DecisionEvaluator[] {
    return Array.from(this.evaluators.values()).sort((a, b) => a.priority() - b.priority());
  }

  getCategories(): DecisionCategory[] {
    return Array.from(this.evaluators.keys());
  }
}

export const evaluatorRegistry = new EvaluatorRegistry();
