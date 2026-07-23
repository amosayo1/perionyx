import type { AIModelMetrics, AIModelType } from "../types";

export class ModelMetricsService {
  private models = new Map<string, AIModelMetrics>();

  add(model: AIModelMetrics): AIModelMetrics {
    this.models.set(model.name, { ...model, updatedAt: new Date() });
    return model;
  }

  get(name: string): AIModelMetrics | undefined {
    return this.models.get(name);
  }

  getAll(): AIModelMetrics[] {
    return Array.from(this.models.values());
  }

  update(name: string, updates: Partial<AIModelMetrics>): AIModelMetrics | undefined {
    const existing = this.models.get(name);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.models.set(name, updated);
    return updated;
  }

  delete(name: string): boolean {
    return this.models.delete(name);
  }

  getByType(modelType: AIModelType): AIModelMetrics[] {
    return this.getAll().filter(m => m.modelType === modelType);
  }

  getActive(): AIModelMetrics[] {
    return this.getAll().filter(m => m.status === "active");
  }

  updateAccuracy(name: string, accuracy: number): AIModelMetrics | undefined {
    return this.update(name, { accuracy });
  }

  count(): number {
    return this.models.size;
  }
}
