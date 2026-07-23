import type {
  CashPosition,
  LiquidityPosition,
  TreasuryAccount,
  CashPool,
  CashMovement,
  CashForecast,
  FundingRequest,
  FundingDecision,
  InvestmentBucket,
  RestrictedCash,
  WorkingCapital,
  FXExposure,
  CounterpartyRisk,
  CashPolicy,
  TreasuryPolicy,
  TreasuryAlert,
  TreasurySnapshot,
  TreasuryApprovalMatrix,
} from "../domain/types";
import {
  CashClassification,
  LiquidityCategory,
  PoolType,
  FundingType,
  TreasuryAlertSeverity,
  TreasuryAlertCategory,
  CurrencyType,
  FXExposureDirection,
} from "../domain/types";
import { cashPositionService } from "./cash-position-service";
import { fundingService } from "./funding-service";
import { intercompanyService } from "./intercompany-service";
import { cashEngine } from "../cash";
import { liquidityEngine, poolManager } from "../liquidity";
import { analyticsEngine } from "../analytics";
import { forecastEngine, type ForecastInput } from "../forecast";
import { fxExposureEngine } from "../risk";
import { counterpartyRiskEngine } from "../risk";
import { policyEngine } from "../policies";
import { treasuryRepository } from "../repositories";

export class TreasuryService {
  async recordCashPosition(position: CashPosition): Promise<void> {
    cashPositionService.recordPosition(position);
    await treasuryRepository.saveCashPosition(position);
  }

  async buildTreasurySnapshot(
    companyId: string,
    legalEntityId: string,
    region: string,
    accounts: TreasuryAccount[],
  ): Promise<TreasurySnapshot> {
    const snapshot = cashPositionService.buildSnapshot(companyId, legalEntityId, region, accounts);

    const liquidityPositions = liquidityEngine.computeLiquidityPosition(
      [],
      [],
      companyId,
      legalEntityId,
      region,
      "USD",
    );
    for (const lp of liquidityPositions) {
      snapshot.liquidityByCategory[lp.category] += lp.amount;
    }

    const pools = poolManager.getPoolsByCompany(companyId);
    snapshot.activePools = pools.length;

    const pendingRequests = fundingService.getPendingRequests(companyId);
    snapshot.openFundingRequests = pendingRequests.length;

    snapshot.netLiquidity = snapshot.availableCash;
    snapshot.workingCapital = cashEngine.computeWorkingCapital(
      snapshot.totalCash, 0, 0, 0, 0, companyId, legalEntityId, "USD",
    );

    const cashPositions = cashPositionService.getPositions({ companyId, legalEntityId });
    const exposures = cashPositions.map((p) =>
      fxExposureEngine.computeExposure(
        { currency: p.currency, currencyType: CurrencyType.BASE, totalBalance: p.totalBalance, availableBalance: p.availableBalance, restrictedBalance: 0, classificationBreakdown: {} as Record<CashClassification, number>, liquidityBreakdown: {} as Record<LiquidityCategory, number>, fxExposure: 0, fxExposureDirection: FXExposureDirection.FLAT, exchangeRateToBase: 1, exchangeRateTimestamp: new Date().toISOString() },
        "USD",
        1,
        1,
        companyId,
        legalEntityId,
      ),
    );
    snapshot.totalExposure = exposures.length;

    const policyViolations = policyEngine.evaluateAll({}, {});
    snapshot.policyViolations = policyViolations.filter((v) => !v.passed).length;

    await treasuryRepository.saveTreasurySnapshot(snapshot);
    return snapshot;
  }

  async generateForecast(input: ForecastInput): Promise<CashForecast> {
    const forecast = forecastEngine.generate(input);
    await treasuryRepository.saveCashForecast(forecast);
    return forecast;
  }

  async createCashPool(
    name: string,
    poolType: PoolType,
    currency: string,
    region: string,
    companyId: string,
  ): Promise<CashPool> {
    const pool = poolManager.createPool({ name, poolType, currency, region, targetUtilization: 0.8 }, companyId);
    await treasuryRepository.saveCashPool(pool);
    return pool;
  }

  async addAccountToPool(
    poolId: string,
    account: TreasuryAccount,
    balance: number,
  ): Promise<CashPool | null> {
    const pool = poolManager.addMember(poolId, account, balance, 0.5, false);
    if (pool) await treasuryRepository.saveCashPool(pool);
    return pool;
  }

  async createFundingRequest(params: {
    companyId: string;
    sourceLegalEntityId: string;
    targetLegalEntityId: string;
    currency: string;
    requestedAmount: number;
    fundingType: FundingType;
    priority: number;
    reason: string;
    requestedById: string;
    requiredByDate: string;
  }): Promise<FundingRequest> {
    const request = fundingService.createRequest(params);
    await treasuryRepository.saveFundingRequest(request);
    return request;
  }

  async approveFundingRequest(
    requestId: string,
    decision: FundingDecision,
    approvalMatrix: TreasuryApprovalMatrix,
  ): Promise<FundingRequest | null> {
    const request = fundingService.approveRequest(requestId, decision, approvalMatrix);
    if (request) await treasuryRepository.saveFundingRequest(request);
    return request;
  }

  async executeFunding(requestId: string): Promise<CashMovement | null> {
    const movement = fundingService.executeFunding(requestId);
    if (movement) await treasuryRepository.saveCashMovement(movement);
    return movement;
  }

  async recordRestrictedCash(rc: RestrictedCash): Promise<void> {
    await treasuryRepository.saveRestrictedCash(rc);
  }

  async recordFXExposure(exposure: FXExposure): Promise<void> {
    await treasuryRepository.saveFXExposure(exposure);
  }

  async registerCounterpartyRisk(params: {
    counterpartyId: string;
    counterpartyName: string;
    counterpartyType: import("../domain/types").CounterpartyType;
    creditRating: string;
    exposureLimit: number;
    riskScore: number;
  }): Promise<CounterpartyRisk> {
    const risk = counterpartyRiskEngine.register(params);
    await treasuryRepository.saveCounterpartyRisk(risk);
    return risk;
  }

  async evaluatePolicy(policyId: string, value: number, context: Record<string, unknown>) {
    const result = policyEngine.evaluate(policyId, value, context);

    if (!result.passed) {
      for (const violation of result.violations) {
        const alert: TreasuryAlert = {
          id: `alert-policy-${Date.now()}`,
          companyId: "",
          legalEntityId: null,
          severity: violation.severity,
          category: TreasuryAlertCategory.POLICY_VIOLATION,
          title: `Policy Violation: ${violation.policyName}`,
          message: violation.message,
          metadata: { policyId, actualValue: violation.actualValue, rule: violation.rule },
          acknowledged: false,
          acknowledgedById: null,
          acknowledgedAt: null,
          resolved: false,
          resolvedById: null,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
        };
        await treasuryRepository.saveTreasuryAlert(alert);
      }
    }

    return result;
  }

  async getAlerts(companyId: string): Promise<TreasuryAlert[]> {
    return treasuryRepository.getTreasuryAlerts(companyId);
  }

  async getSnapshots(companyId: string): Promise<TreasurySnapshot[]> {
    return treasuryRepository.getTreasurySnapshots(companyId);
  }

  getMetrics(snapshot: TreasurySnapshot) {
    return analyticsEngine.computeMetrics(snapshot);
  }

  getRegionalBreakdown(positions: CashPosition[]) {
    return analyticsEngine.computeRegionalBreakdown(positions);
  }

  createIntercompanyLoan(params: {
    companyId: string;
    lenderEntityId: string;
    borrowerEntityId: string;
    principal: number;
    currency: string;
    interestRate: number;
    maturityDate: string;
    repaymentSchedule: "BULLET" | "AMORTIZING" | "INTEREST_ONLY";
  }) {
    return intercompanyService.originateLoan({
      companyId: params.companyId,
      lenderEntityId: params.lenderEntityId,
      borrowerEntityId: params.borrowerEntityId,
      terms: {
        principal: params.principal,
        currency: params.currency,
        interestRate: params.interestRate,
        maturityDate: params.maturityDate,
        repaymentSchedule: params.repaymentSchedule,
      },
    });
  }
}

export const treasuryService = new TreasuryService();
