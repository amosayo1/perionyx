import type { ConfidenceLevel } from "./types";
import { CONFIDENCE_THRESHOLDS } from "./types";

interface ConfidenceFactors {
  dataCompleteness: number;
  dataFreshness: number;
  historicalAccuracy: number;
  signalStrength: number;
  ruleReliability: number;
}

export class ConfidenceScoreCalculator {
  calculate(factors: ConfidenceFactors): { score: number; level: ConfidenceLevel; explanation: string } {
    const weights = {
      dataCompleteness: 0.2,
      dataFreshness: 0.2,
      historicalAccuracy: 0.25,
      signalStrength: 0.2,
      ruleReliability: 0.15,
    };

    const score =
      factors.dataCompleteness * weights.dataCompleteness +
      factors.dataFreshness * weights.dataFreshness +
      factors.historicalAccuracy * weights.historicalAccuracy +
      factors.signalStrength * weights.signalStrength +
      factors.ruleReliability * weights.ruleReliability;

    const level = this.toLevel(score);
    const explanation = this.buildExplanation(score, level, factors);

    return { score: Math.round(score * 100) / 100, level, explanation };
  }

  fromEvidenceStrength(strength: number, historicalAccuracy: number): { score: number; level: ConfidenceLevel; explanation: string } {
    return this.calculate({
      dataCompleteness: 0.9,
      dataFreshness: 0.8,
      historicalAccuracy,
      signalStrength: Math.min(strength, 1),
      ruleReliability: 0.8,
    });
  }

  fromSignalCount(detectedCount: number, totalPossible: number, historicalAccuracy: number): { score: number; level: ConfidenceLevel; explanation: string } {
    const ratio = totalPossible > 0 ? detectedCount / totalPossible : 0;
    const signalStrength = Math.min(ratio * 1.5, 1);
    return this.calculate({
      dataCompleteness: 0.85,
      dataFreshness: 0.8,
      historicalAccuracy,
      signalStrength,
      ruleReliability: 0.75,
    });
  }

  fromThresholdDeviation(currentValue: number, threshold: number, deviation: number, historicalAccuracy: number): { score: number; level: ConfidenceLevel; explanation: string } {
    const absDeviation = Math.abs(deviation);
    const signalStrength = Math.min(absDeviation / threshold, 1);
    return this.calculate({
      dataCompleteness: 0.9,
      dataFreshness: 0.85,
      historicalAccuracy,
      signalStrength,
      ruleReliability: 0.85,
    });
  }

  fromTrendConsistency(consistentPeriods: number, totalPeriods: number, historicalAccuracy: number): { score: number; level: ConfidenceLevel; explanation: string } {
    const consistency = totalPeriods > 0 ? consistentPeriods / totalPeriods : 0;
    return this.calculate({
      dataCompleteness: 0.8,
      dataFreshness: 0.7,
      historicalAccuracy,
      signalStrength: consistency,
      ruleReliability: 0.7,
    });
  }

  private toLevel(score: number): ConfidenceLevel {
    if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH.min) return "VERY_HIGH";
    if (score >= CONFIDENCE_THRESHOLDS.HIGH.min) return "HIGH";
    if (score >= CONFIDENCE_THRESHOLDS.MEDIUM.min) return "MEDIUM";
    return "LOW";
  }

  private buildExplanation(score: number, level: ConfidenceLevel, factors: ConfidenceFactors): string {
    const parts: string[] = [];

    if (factors.dataCompleteness >= 0.8) parts.push("sufficient data available");
    else parts.push("limited data available");

    if (factors.dataFreshness >= 0.8) parts.push("data is current");
    else parts.push("data may be stale");

    if (factors.historicalAccuracy >= 0.8) parts.push("strong historical accuracy");
    else if (factors.historicalAccuracy >= 0.5) parts.push("moderate historical accuracy");
    else parts.push("limited historical data");

    if (factors.signalStrength >= 0.7) parts.push("strong signal detected");
    else if (factors.signalStrength >= 0.4) parts.push("moderate signal detected");
    else parts.push("weak signal detected");

    return `Confidence ${level} (${(score * 100).toFixed(0)}%): ${parts.join("; ")}.`;
  }
}

export const confidenceScoreCalculator = new ConfidenceScoreCalculator();
