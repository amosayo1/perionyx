import type { CounterpartyRisk } from "../domain/types";
import { CounterpartyStatus } from "../domain/types";

export class CounterpartyRiskEngine {
  private counterparties = new Map<string, CounterpartyRisk>();

  register(params: {
    counterpartyId: string;
    counterpartyName: string;
    counterpartyType: import("../domain/types").CounterpartyType;
    creditRating: string;
    exposureLimit: number;
    riskScore: number;
  }): CounterpartyRisk {
    const risk: CounterpartyRisk = {
      counterpartyId: params.counterpartyId,
      counterpartyName: params.counterpartyName,
      counterpartyType: params.counterpartyType,
      creditRating: params.creditRating,
      exposureAmount: 0,
      exposureLimit: params.exposureLimit,
      utilizationPercent: 0,
      collateralHeld: 0,
      daysOverLimit: 0,
      status: CounterpartyStatus.ACTIVE,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      riskScore: params.riskScore,
    };

    this.counterparties.set(params.counterpartyId, risk);
    return risk;
  }

  recordExposure(counterpartyId: string, amount: number, collateralHeld = 0): CounterpartyRisk | null {
    const risk = this.counterparties.get(counterpartyId);
    if (!risk) return null;

    risk.exposureAmount = amount;
    risk.collateralHeld = collateralHeld;
    risk.utilizationPercent = risk.exposureLimit > 0
      ? (amount / risk.exposureLimit) * 100
      : 0;

    if (risk.utilizationPercent > 100) {
      risk.daysOverLimit = (risk.daysOverLimit ?? 0) + 1;
      risk.status = risk.daysOverLimit > 30 ? CounterpartyStatus.SUSPENDED : CounterpartyStatus.RESTRICTED;
    } else if (risk.utilizationPercent > 80) {
      risk.status = CounterpartyStatus.WATCH;
    } else {
      risk.status = CounterpartyStatus.ACTIVE;
    }

    return risk;
  }

  getRisk(counterpartyId: string): CounterpartyRisk | null {
    return this.counterparties.get(counterpartyId) ?? null;
  }

  getAllRisks(): CounterpartyRisk[] {
    return Array.from(this.counterparties.values());
  }

  getRisksByStatus(status: CounterpartyStatus): CounterpartyRisk[] {
    return Array.from(this.counterparties.values()).filter((r) => r.status === status);
  }

  getHighRiskCounterparties(thresholdScore = 70): CounterpartyRisk[] {
    return Array.from(this.counterparties.values()).filter((r) => r.riskScore >= thresholdScore);
  }
}

export const counterpartyRiskEngine = new CounterpartyRiskEngine();
