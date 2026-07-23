import type { AnomalyDetection, AnomalySeverity, InsightCategory } from "../types";

export class AnomalyService {
  private anomalies = new Map<string, AnomalyDetection>();

  add(anomaly: AnomalyDetection): AnomalyDetection {
    this.anomalies.set(anomaly.id, { ...anomaly, updatedAt: new Date() });
    return anomaly;
  }

  get(id: string): AnomalyDetection | undefined {
    return this.anomalies.get(id);
  }

  getAll(): AnomalyDetection[] {
    return Array.from(this.anomalies.values());
  }

  update(id: string, updates: Partial<AnomalyDetection>): AnomalyDetection | undefined {
    const existing = this.anomalies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.anomalies.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.anomalies.delete(id);
  }

  getBySeverity(severity: AnomalySeverity): AnomalyDetection[] {
    return this.getAll().filter(a => a.severity === severity);
  }

  getByCategory(category: InsightCategory): AnomalyDetection[] {
    return this.getAll().filter(a => a.category === category);
  }

  getUnacknowledged(): AnomalyDetection[] {
    return this.getAll().filter(a => !a.acknowledged);
  }

  getByMetric(metric: string): AnomalyDetection[] {
    return this.getAll().filter(a => a.metric === metric);
  }

  count(): number {
    return this.anomalies.size;
  }
}
