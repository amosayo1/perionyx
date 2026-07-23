import type { Prediction, PredictionRecommendation } from "./types";

interface PrioritizedRecommendation extends PredictionRecommendation {
  predictionTitle: string;
  predictionCategory: string;
  predictionSeverity: string;
  confidenceScore: number;
  compositeScore: number;
}

export class RecommendationPrioritizer {
  prioritize(predictions: Prediction[]): PrioritizedRecommendation[] {
    const all: PrioritizedRecommendation[] = [];

    for (const pred of predictions) {
      if (pred.status !== "active") continue;

      for (const rec of pred.recommendations) {
        const compositeScore = this.compositeScore(pred, rec);
        all.push({
          ...rec,
          predictionTitle: pred.title,
          predictionCategory: pred.category,
          predictionSeverity: pred.severity,
          confidenceScore: pred.confidenceScore,
          compositeScore,
        });
      }
    }

    return all.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  getTopRecommendations(predictions: Prediction[], limit = 5): PrioritizedRecommendation[] {
    return this.prioritize(predictions).slice(0, limit);
  }

  getImmediateActions(predictions: Prediction[]): PrioritizedRecommendation[] {
    return this.prioritize(predictions).filter((r) => r.priority === "critical");
  }

  private compositeScore(prediction: Prediction, recommendation: PredictionRecommendation): number {
    const severityWeights = { critical: 1.0, high: 0.8, medium: 0.5, low: 0.3, informational: 0.1 };
    const priorityWeights = { critical: 1.0, high: 0.8, medium: 0.5, low: 0.3 };
    const effortWeights = { low: 1.0, medium: 0.7, high: 0.4 };

    return (
      prediction.confidenceScore * 0.3 +
      severityWeights[prediction.severity] * 0.3 +
      priorityWeights[recommendation.priority] * 0.25 +
      effortWeights[recommendation.effort] * 0.15
    );
  }
}

export const recommendationPrioritizer = new RecommendationPrioritizer();
