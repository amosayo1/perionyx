import type { PredictionHistoryEntry, PredictionEvent, PredictionAccuracy } from "./types";

export class PredictionHistory {
  private entries = new Map<string, PredictionHistoryEntry[]>();
  private accuracies = new Map<string, PredictionAccuracy[]>();

  record(predictionId: string, event: PredictionEvent, details: string, actorId?: string): void {
    const entry: PredictionHistoryEntry = {
      predictionId, event, details, actorId,
      timestamp: new Date().toISOString(),
    };
    const existing = this.entries.get(predictionId) ?? [];
    existing.push(entry);
    this.entries.set(predictionId, existing);
  }

  getHistory(predictionId: string): PredictionHistoryEntry[] {
    return this.entries.get(predictionId) ?? [];
  }

  getTimeline(companyId: string): PredictionHistoryEntry[] {
    const all: PredictionHistoryEntry[] = [];
    for (const entries of this.entries.values()) {
      all.push(...entries);
    }
    return all
      .filter((e) => e.predictionId.startsWith(`pred-${companyId}`))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  recordAccuracy(accuracy: PredictionAccuracy): void {
    const existing = this.accuracies.get(accuracy.predictionId) ?? [];
    existing.push(accuracy);
    this.accuracies.set(accuracy.predictionId, existing);
  }

  getAccuracy(predictionId: string): PredictionAccuracy[] {
    return this.accuracies.get(predictionId) ?? [];
  }

  getOverallAccuracy(companyId: string): { average: number; count: number } {
    let total = 0;
    let count = 0;
    for (const accuracies of this.accuracies.values()) {
      for (const acc of accuracies) {
        if (acc.predictionId.startsWith(`pred-${companyId}`)) {
          total += acc.accuracy;
          count++;
        }
      }
    }
    return { average: count > 0 ? total / count : 0, count };
  }

  getPredictionCount(): number {
    return this.entries.size;
  }
}

export const predictionHistory = new PredictionHistory();
