import type { FXExposure, CurrencyPosition } from "../domain/types";
import { FXExposureDirection, HedgeStatus } from "../domain/types";

export class FXExposureEngine {
  computeExposure(
    sourcePosition: CurrencyPosition,
    targetCurrency: string,
    currentRate: number,
    previousRate: number,
    companyId: string,
    legalEntityId: string,
  ): FXExposure {
    const exposureAmount = sourcePosition.totalBalance;
    const rateChange = previousRate > 0 ? (currentRate - previousRate) / previousRate : 0;
    const unrealizedPnl = exposureAmount * rateChange;
    const direction = exposureAmount > 0
      ? FXExposureDirection.LONG
      : exposureAmount < 0
        ? FXExposureDirection.SHORT
        : FXExposureDirection.FLAT;

    return {
      id: `fx-${legalEntityId}-${sourcePosition.currency}-${targetCurrency}`,
      companyId,
      legalEntityId,
      sourceCurrency: sourcePosition.currency,
      targetCurrency,
      exposureAmount: Math.abs(exposureAmount),
      exposureDirection: direction,
      currentRate,
      previousRate,
      rateChange,
      unrealizedPnl,
      realizedPnl: 0,
      hedgeStatus: HedgeStatus.NONE,
      hedgeInstrument: null,
      policyLimit: null,
      breachLimit: false,
    };
  }

  computeNetExposure(exposures: FXExposure[]): {
    totalExposure: number;
    longExposure: number;
    shortExposure: number;
    netExposure: number;
  } {
    return {
      totalExposure: exposures.reduce((s, e) => s + e.exposureAmount, 0),
      longExposure: exposures
        .filter((e) => e.exposureDirection === FXExposureDirection.LONG)
        .reduce((s, e) => s + e.exposureAmount, 0),
      shortExposure: exposures
        .filter((e) => e.exposureDirection === FXExposureDirection.SHORT)
        .reduce((s, e) => s + e.exposureAmount, 0),
      netExposure: exposures.reduce((s, e) => {
        const sign = e.exposureDirection === FXExposureDirection.SHORT ? -1 : 1;
        return s + e.exposureAmount * sign;
      }, 0),
    };
  }

  checkPolicyLimit(exposure: FXExposure, policyLimit: number): FXExposure {
    return {
      ...exposure,
      policyLimit,
      breachLimit: exposure.exposureAmount > policyLimit,
    };
  }
}

export const fxExposureEngine = new FXExposureEngine();
