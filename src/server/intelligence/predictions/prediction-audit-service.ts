import type { Prediction, PredictionCategory, PredictionSeverity } from "./types";

interface AuditEvent {
  predictionId: string;
  action: string;
  details: string;
  companyId: string;
  timestamp: string;
  severity: string;
}

export class PredictionAuditService {
  private events: AuditEvent[] = [];
  private readonly maxEvents = 10_000;

  recordGeneration(prediction: Prediction): void {
    this.events.push({
      predictionId: prediction.id,
      action: "PREDICTION_GENERATED",
      details: `${prediction.title} (${prediction.category}) — confidence ${prediction.confidence}`,
      companyId: prediction.companyId,
      timestamp: new Date().toISOString(),
      severity: prediction.severity,
    });
    this.trim();
  }

  recordUpdate(predictionId: string, companyId: string, details: string): void {
    this.events.push({
      predictionId, companyId,
      action: "PREDICTION_UPDATED",
      details,
      timestamp: new Date().toISOString(),
      severity: "medium",
    });
    this.trim();
  }

  recordStatusChange(predictionId: string, companyId: string, oldStatus: string, newStatus: string): void {
    this.events.push({
      predictionId, companyId,
      action: "PREDICTION_STATUS_CHANGED",
      details: `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date().toISOString(),
      severity: "medium",
    });
    this.trim();
  }

  recordAccuracyEvaluation(predictionId: string, companyId: string, accuracy: number): void {
    this.events.push({
      predictionId, companyId,
      action: "PREDICTION_ACCURACY_EVALUATED",
      details: `Accuracy: ${(accuracy * 100).toFixed(0)}%`,
      timestamp: new Date().toISOString(),
      severity: "low",
    });
    this.trim();
  }

  getEvents(companyId: string, limit = 50): AuditEvent[] {
    return this.events
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getRecentEvents(limit = 20): AuditEvent[] {
    return this.events.slice(-limit).reverse();
  }

  getEventCount(): number {
    return this.events.length;
  }

  private trim(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}

export const predictionAuditService = new PredictionAuditService();
