import type { Prediction, PredictionCategory, PredictionSeverity, PredictionStatus } from "./types";

interface RuleDefinition {
  id: string;
  name: string;
  category: PredictionCategory;
  description: string;
  enabled: boolean;
  intervalMs: number;
}

export class PredictionRegistry {
  private rules = new Map<string, RuleDefinition>();
  private predictions = new Map<string, Prediction>();

  registerRule(rule: RuleDefinition): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): RuleDefinition | undefined {
    return this.rules.get(id);
  }

  getAllRules(): RuleDefinition[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(): RuleDefinition[] {
    return this.getAllRules().filter((r) => r.enabled);
  }

  getRulesByCategory(category: PredictionCategory): RuleDefinition[] {
    return this.getAllRules().filter((r) => r.category === category);
  }

  register(prediction: Prediction): void {
    this.predictions.set(prediction.id, prediction);
  }

  get(id: string): Prediction | undefined {
    return this.predictions.get(id);
  }

  getAll(companyId?: string): Prediction[] {
    const all = Array.from(this.predictions.values());
    if (companyId) return all.filter((p) => p.companyId === companyId);
    return all;
  }

  getActive(companyId: string): Prediction[] {
    return this.getAll(companyId).filter((p) => p.status === "active");
  }

  getByCategory(category: PredictionCategory, companyId?: string): Prediction[] {
    return this.getAll(companyId).filter((p) => p.category === category);
  }

  getBySeverity(severity: PredictionSeverity, companyId?: string): Prediction[] {
    return this.getAll(companyId).filter((p) => p.severity === severity);
  }

  updateStatus(id: string, status: PredictionStatus): void {
    const pred = this.predictions.get(id);
    if (pred) {
      pred.status = status;
      pred.updatedAt = new Date().toISOString();
      this.predictions.set(id, pred);
    }
  }

  removeExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [id, pred] of this.predictions) {
      if (new Date(pred.expiresAt).getTime() < now) {
        pred.status = "expired";
        this.predictions.set(id, pred);
        count++;
      }
    }
    return count;
  }

  clearCompany(companyId: string): number {
    let count = 0;
    for (const [id, pred] of this.predictions) {
      if (pred.companyId === companyId) {
        this.predictions.delete(id);
        count++;
      }
    }
    return count;
  }

  getCount(): number {
    return this.predictions.size;
  }
}

export const predictionRegistry = new PredictionRegistry();
