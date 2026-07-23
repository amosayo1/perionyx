import type { Prediction, PredictionAccuracy } from "./types";
import { predictionRegistry } from "./prediction-registry";
import { predictionHistory } from "./prediction-history";
import { predictionAuditService } from "./prediction-audit-service";

export class PredictionEvaluator {
  async evaluateAccuracy(companyId: string): Promise<PredictionAccuracy[]> {
    const predictions = predictionRegistry.getActive(companyId);
    const results: PredictionAccuracy[] = [];

    for (const pred of predictions) {
      const accuracy = await this.evaluateSingle(pred);
      if (accuracy) {
        results.push(accuracy);
        predictionHistory.recordAccuracy(accuracy);
        predictionAuditService.recordAccuracyEvaluation(pred.id, companyId, accuracy.accuracy);
      }
    }

    return results;
  }

  private async evaluateSingle(prediction: Prediction): Promise<PredictionAccuracy | null> {
    const result: PredictionAccuracy = {
      predictionId: prediction.id,
      predicted: true,
      actual: true,
      accuracy: 0,
      evaluatedAt: new Date().toISOString(),
    };

    switch (prediction.title) {
      case "Potential Cash Shortage": {
        const { prisma } = await import("@/server/db/prisma");
        const wallets = await prisma.wallet.findMany({ where: { companyId: prediction.companyId } });
        const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
        const threshold = totalBalance * 0.2;
        result.actual = totalBalance < threshold;
        result.accuracy = result.actual === result.predicted ? 1 : 0;
        break;
      }
      case "Late Approvals Detected": {
        const { prisma } = await import("@/server/db/prisma");
        const overdue = await prisma.transactionApproval.count({
          where: { transaction: { companyId: prediction.companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
        });
        result.actual = overdue > 0;
        result.accuracy = result.actual === result.predicted ? 1 : 0;
        break;
      }
      default:
        return null;
    }

    return result;
  }

  async evaluateAll(): Promise<{ total: number; accurate: number; accuracy: number }> {
    const allPredictions = predictionRegistry.getAll();
    let total = 0;
    let accurate = 0;

    for (const pred of allPredictions) {
      const history = predictionHistory.getAccuracy(pred.id);
      if (history.length > 0) {
        total++;
        const avgAccuracy = history.reduce((s, h) => s + h.accuracy, 0) / history.length;
        if (avgAccuracy >= 0.5) accurate++;
      }
    }

    return {
      total,
      accurate,
      accuracy: total > 0 ? accurate / total : 0,
    };
  }

  getEvaluationHistory(predictionId: string): PredictionAccuracy[] {
    return predictionHistory.getAccuracy(predictionId);
  }
}

export const predictionEvaluator = new PredictionEvaluator();
