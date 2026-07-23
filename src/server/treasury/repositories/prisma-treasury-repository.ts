import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  CashPosition,
  LiquidityPosition,
  TreasuryAccount,
  CashPool,
  CashMovement,
  CashForecast,
  FundingRequest,
  InvestmentBucket,
  RestrictedCash,
  WorkingCapital,
  FXExposure,
  CounterpartyRisk,
  CashPolicy,
  TreasuryPolicy,
  TreasuryAlert,
  TreasurySnapshot,
} from "../domain/types";
import type { TreasuryRepository } from "./treasury-repository";

interface DecimalLike {
  toNumber(): number;
}

function toNumber(value: DecimalLike | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}

export class PrismaTreasuryRepository implements TreasuryRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async saveCashPosition(position: CashPosition): Promise<void> {
    await this.db.treasuryCashPosition.upsert({
      where: { id: position.id },
      create: this.mapCashPosition(position),
      update: this.mapCashPosition(position),
    });
  }

  async getCashPositions(companyId: string, legalEntityId?: string): Promise<CashPosition[]> {
    const where: Record<string, unknown> = { companyId };
    if (legalEntityId) where.legalEntityId = legalEntityId;
    const rows = await this.db.treasuryCashPosition.findMany({ where: where as any });
    return rows.map((r) => this.unmapCashPosition(r));
  }

  async saveLiquidityPosition(position: LiquidityPosition): Promise<void> {
    await this.db.treasuryLiquidityPosition.upsert({
      where: { id: position.id },
      create: this.mapLiquidityPosition(position),
      update: this.mapLiquidityPosition(position),
    });
  }

  async getLiquidityPositions(companyId: string, legalEntityId?: string): Promise<LiquidityPosition[]> {
    const where: Record<string, unknown> = { companyId };
    if (legalEntityId) where.legalEntityId = legalEntityId;
    const rows = await this.db.treasuryLiquidityPosition.findMany({ where: where as any });
    return rows.map((r) => this.unmapLiquidityPosition(r));
  }

  async saveTreasuryAccount(account: TreasuryAccount): Promise<void> {
    await this.db.treasuryAccount.upsert({
      where: { id: account.id },
      create: this.mapTreasuryAccount(account),
      update: this.mapTreasuryAccount(account),
    });
  }

  async getTreasuryAccounts(companyId: string): Promise<TreasuryAccount[]> {
    const rows = await this.db.treasuryAccount.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapTreasuryAccount(r));
  }

  async saveCashPool(pool: CashPool): Promise<void> {
    await this.db.treasuryCashPool.upsert({
      where: { id: pool.id },
      create: this.mapCashPool(pool),
      update: this.mapCashPool(pool),
    });
  }

  async getCashPools(companyId: string): Promise<CashPool[]> {
    const rows = await this.db.treasuryCashPool.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapCashPool(r));
  }

  async saveCashMovement(movement: CashMovement): Promise<void> {
    await this.db.treasuryCashMovement.upsert({
      where: { id: movement.id },
      create: this.mapCashMovement(movement),
      update: this.mapCashMovement(movement),
    });
  }

  async getCashMovements(companyId: string): Promise<CashMovement[]> {
    const rows = await this.db.treasuryCashMovement.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapCashMovement(r));
  }

  async saveCashForecast(forecast: CashForecast): Promise<void> {
    await this.db.treasuryCashForecast.upsert({
      where: { id: forecast.id },
      create: this.mapCashForecast(forecast),
      update: this.mapCashForecast(forecast),
    });
  }

  async getCashForecasts(companyId: string, legalEntityId?: string): Promise<CashForecast[]> {
    const where: Record<string, unknown> = { companyId };
    if (legalEntityId) where.legalEntityId = legalEntityId;
    const rows = await this.db.treasuryCashForecast.findMany({ where: where as any });
    return rows.map((r) => this.unmapCashForecast(r));
  }

  async saveFundingRequest(request: FundingRequest): Promise<void> {
    await this.db.treasuryFundingRequest.upsert({
      where: { id: request.id },
      create: this.mapFundingRequest(request),
      update: this.mapFundingRequest(request),
    });
  }

  async getFundingRequests(companyId: string): Promise<FundingRequest[]> {
    const rows = await this.db.treasuryFundingRequest.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapFundingRequest(r));
  }

  async saveInvestmentBucket(bucket: InvestmentBucket): Promise<void> {
    await this.db.treasuryInvestmentBucket.upsert({
      where: { id: bucket.id },
      create: this.mapInvestmentBucket(bucket),
      update: this.mapInvestmentBucket(bucket),
    });
  }

  async getInvestmentBuckets(companyId: string): Promise<InvestmentBucket[]> {
    const rows = await this.db.treasuryInvestmentBucket.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapInvestmentBucket(r));
  }

  async saveRestrictedCash(rc: RestrictedCash): Promise<void> {
    await this.db.treasuryRestrictedCash.upsert({
      where: { id: rc.id },
      create: this.mapRestrictedCash(rc),
      update: this.mapRestrictedCash(rc),
    });
  }

  async getRestrictedCash(companyId: string): Promise<RestrictedCash[]> {
    const rows = await this.db.treasuryRestrictedCash.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapRestrictedCash(r));
  }

  async saveWorkingCapital(wc: WorkingCapital): Promise<void> {
    await this.db.treasuryWorkingCapital.upsert({
      where: { id: wc.id },
      create: this.mapWorkingCapital(wc),
      update: this.mapWorkingCapital(wc),
    });
  }

  async getWorkingCapital(companyId: string): Promise<WorkingCapital[]> {
    const rows = await this.db.treasuryWorkingCapital.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapWorkingCapital(r));
  }

  async saveFXExposure(exposure: FXExposure): Promise<void> {
    await this.db.treasuryFXExposure.upsert({
      where: { id: exposure.id },
      create: this.mapFXExposure(exposure),
      update: this.mapFXExposure(exposure),
    });
  }

  async getFXExposures(companyId: string): Promise<FXExposure[]> {
    const rows = await this.db.treasuryFXExposure.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapFXExposure(r));
  }

  async saveCounterpartyRisk(risk: CounterpartyRisk): Promise<void> {
    await this.db.treasuryCounterpartyRisk.upsert({
      where: { counterpartyId: risk.counterpartyId },
      create: this.mapCounterpartyRisk(risk),
      update: this.mapCounterpartyRisk(risk),
    });
  }

  async getCounterpartyRisks(_companyId: string): Promise<CounterpartyRisk[]> {
    const rows = await this.db.treasuryCounterpartyRisk.findMany();
    return rows.map((r) => this.unmapCounterpartyRisk(r));
  }

  async saveCashPolicy(policy: CashPolicy): Promise<void> {
    await this.db.treasuryCashPolicy.upsert({
      where: { id: policy.id },
      create: this.mapCashPolicy(policy),
      update: this.mapCashPolicy(policy),
    });
  }

  async getCashPolicies(companyId: string): Promise<CashPolicy[]> {
    const rows = await this.db.treasuryCashPolicy.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapCashPolicy(r));
  }

  async saveTreasuryPolicy(policy: TreasuryPolicy): Promise<void> {
    await this.db.treasuryPolicy.upsert({
      where: { id: policy.id },
      create: this.mapTreasuryPolicy(policy),
      update: this.mapTreasuryPolicy(policy),
    });
  }

  async getTreasuryPolicies(companyId: string): Promise<TreasuryPolicy[]> {
    const rows = await this.db.treasuryPolicy.findMany({ where: { companyId } });
    return rows.map((r) => this.unmapTreasuryPolicy(r));
  }

  async saveTreasuryAlert(alert: TreasuryAlert): Promise<void> {
    await this.db.treasuryAlert.upsert({
      where: { id: alert.id },
      create: this.mapTreasuryAlert(alert),
      update: this.mapTreasuryAlert(alert),
    });
  }

  async getTreasuryAlerts(companyId: string): Promise<TreasuryAlert[]> {
    const rows = await this.db.treasuryAlert.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.unmapTreasuryAlert(r));
  }

  async saveTreasurySnapshot(snapshot: TreasurySnapshot): Promise<void> {
    await this.db.treasurySnapshot.upsert({
      where: { id: snapshot.id },
      create: this.mapTreasurySnapshot(snapshot),
      update: this.mapTreasurySnapshot(snapshot),
    });
  }

  async getTreasurySnapshots(companyId: string): Promise<TreasurySnapshot[]> {
    const rows = await this.db.treasurySnapshot.findMany({
      where: { companyId },
      orderBy: { recordedAt: "desc" },
    });
    return rows.map((r) => this.unmapTreasurySnapshot(r));
  }

  // Mapping helpers — domain → Prisma
  private mapCashPosition(p: CashPosition) {
    return {
      id: p.id,
      companyId: p.companyId,
      legalEntityId: p.legalEntityId,
      region: p.region,
      currency: p.currency,
      classification: p.classification,
      totalBalance: p.totalBalance,
      availableBalance: p.availableBalance,
      ledgerBalance: p.ledgerBalance,
      floatBalance: p.floatBalance,
      bankBalance: p.bankBalance,
      bankAccountId: p.bankAccountId,
      bankConnectionId: p.bankConnectionId,
      providerKind: p.providerKind,
      institutionName: p.institutionName,
      lastSyncedAt: new Date(p.lastSyncedAt),
      recordedAt: new Date(p.recordedAt),
    };
  }

  private unmapCashPosition(r: any): CashPosition {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      region: r.region,
      currency: r.currency,
      classification: r.classification,
      totalBalance: toNumber(r.totalBalance),
      availableBalance: toNumber(r.availableBalance),
      ledgerBalance: toNumber(r.ledgerBalance),
      floatBalance: toNumber(r.floatBalance),
      bankBalance: toNumber(r.bankBalance),
      bankAccountId: r.bankAccountId,
      bankConnectionId: r.bankConnectionId,
      providerKind: r.providerKind,
      institutionName: r.institutionName,
      lastSyncedAt: r.lastSyncedAt.toISOString(),
      recordedAt: r.recordedAt.toISOString(),
    };
  }

  private mapLiquidityPosition(p: LiquidityPosition) {
    return {
      id: p.id,
      companyId: p.companyId,
      legalEntityId: p.legalEntityId,
      region: p.region,
      currency: p.currency,
      category: p.category,
      amount: p.amount,
      percentageOfTotal: p.percentageOfTotal,
      daysToLiquidate: p.daysToLiquidate,
      instruments: JSON.parse(JSON.stringify(p.instruments)),
      lastCalculatedAt: new Date(p.lastCalculatedAt),
    };
  }

  private unmapLiquidityPosition(r: any): LiquidityPosition {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      region: r.region,
      currency: r.currency,
      category: r.category as any,
      amount: toNumber(r.amount),
      percentageOfTotal: r.percentageOfTotal,
      daysToLiquidate: r.daysToLiquidate,
      instruments: r.instruments as any,
      lastCalculatedAt: r.lastCalculatedAt.toISOString(),
    };
  }

  private mapTreasuryAccount(a: TreasuryAccount) {
    return {
      id: a.id,
      companyId: a.companyId,
      name: `Account ${a.id}`,
      currency: a.currency,
      balance: 0,
      description: `${a.institutionName} - ${a.region}`,
      isActive: a.status === "ACTIVE",
    };
  }

  private unmapTreasuryAccount(r: any): TreasuryAccount {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.companyId,
      businessUnit: "",
      region: "",
      bankAccountId: r.id,
      institutionName: r.description ?? "",
      currency: r.currency,
      classification: "OPERATING" as any,
      treasuryRole: "PRIMARY_OPERATING" as any,
      isSweepTarget: false,
      isConcentrationAccount: false,
      poolMembership: [],
      minimumBalance: 0,
      targetBalance: 0,
      maximumBalance: 0,
      status: r.isActive ? "ACTIVE" as any : "CLOSED" as any,
    };
  }

  private mapCashPool(p: CashPool) {
    return {
      id: p.id,
      companyId: p.companyId,
      name: p.name,
      poolType: p.poolType,
      currency: p.currency,
      region: p.region,
      memberAccounts: JSON.parse(JSON.stringify(p.memberAccounts)),
      totalBalance: p.totalBalance,
      availableBalance: p.availableBalance,
      targetUtilization: p.targetUtilization,
      currentUtilization: p.currentUtilization,
      interestRate: p.interestRate,
      notionalValue: p.notionalValue,
    };
  }

  private unmapCashPool(r: any): CashPool {
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      poolType: r.poolType as any,
      currency: r.currency,
      region: r.region,
      memberAccounts: r.memberAccounts as any,
      totalBalance: toNumber(r.totalBalance),
      availableBalance: toNumber(r.availableBalance),
      targetUtilization: r.targetUtilization,
      currentUtilization: r.currentUtilization,
      interestRate: r.interestRate,
      notionalValue: r.notionalValue != null ? toNumber(r.notionalValue) : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private mapCashMovement(m: CashMovement) {
    return {
      id: m.id,
      companyId: m.companyId,
      sourceLegalEntityId: m.sourceLegalEntityId,
      targetLegalEntityId: m.targetLegalEntityId,
      sourceAccountId: m.sourceAccountId,
      targetAccountId: m.targetAccountId,
      currency: m.currency,
      amount: m.amount,
      fundingType: m.fundingType,
      status: m.status,
      reason: m.reason,
      approvalRequired: m.approvalRequired,
      approvedById: m.approvedById,
      executedAt: m.executedAt ? new Date(m.executedAt) : null,
      requestedAt: new Date(m.requestedAt),
      completedAt: m.completedAt ? new Date(m.completedAt) : null,
      failureReason: m.failureReason,
      referenceId: m.referenceId,
    };
  }

  private unmapCashMovement(r: any): CashMovement {
    return {
      id: r.id,
      companyId: r.companyId,
      sourceLegalEntityId: r.sourceLegalEntityId,
      targetLegalEntityId: r.targetLegalEntityId,
      sourceAccountId: r.sourceAccountId,
      targetAccountId: r.targetAccountId,
      currency: r.currency,
      amount: toNumber(r.amount),
      fundingType: r.fundingType as any,
      status: r.status as any,
      reason: r.reason,
      approvalRequired: r.approvalRequired,
      approvedById: r.approvedById,
      executedAt: r.executedAt?.toISOString() ?? null,
      requestedAt: r.requestedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      failureReason: r.failureReason,
      referenceId: r.referenceId,
    };
  }

  private mapCashForecast(f: CashForecast) {
    return {
      id: f.id,
      companyId: f.companyId,
      legalEntityId: f.legalEntityId,
      currency: f.currency,
      horizon: f.horizon,
      confidence: f.confidence,
      generatedAt: new Date(f.generatedAt),
      validFrom: new Date(f.validFrom),
      validTo: new Date(f.validTo),
      predictedInflows: JSON.parse(JSON.stringify(f.predictedInflows)),
      predictedOutflows: JSON.parse(JSON.stringify(f.predictedOutflows)),
      netPrediction: f.netPrediction,
      openingBalance: f.openingBalance,
      closingBalance: f.closingBalance,
      minimumProjectedBalance: f.minimumProjectedBalance,
      maximumProjectedBalance: f.maximumProjectedBalance,
      keyRisks: f.keyRisks,
      keyAssumptions: f.keyAssumptions,
      aiConfidenceScore: f.aiConfidenceScore,
    };
  }

  private unmapCashForecast(r: any): CashForecast {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      currency: r.currency,
      horizon: r.horizon as any,
      confidence: r.confidence as any,
      generatedAt: r.generatedAt.toISOString(),
      validFrom: r.validFrom.toISOString(),
      validTo: r.validTo.toISOString(),
      predictedInflows: r.predictedInflows as any,
      predictedOutflows: r.predictedOutflows as any,
      netPrediction: toNumber(r.netPrediction),
      openingBalance: toNumber(r.openingBalance),
      closingBalance: toNumber(r.closingBalance),
      minimumProjectedBalance: toNumber(r.minimumProjectedBalance),
      maximumProjectedBalance: toNumber(r.maximumProjectedBalance),
      keyRisks: r.keyRisks,
      keyAssumptions: r.keyAssumptions,
      aiConfidenceScore: r.aiConfidenceScore,
    };
  }

  private mapFundingRequest(r: FundingRequest) {
    return {
      id: r.id,
      companyId: r.companyId,
      sourceLegalEntityId: r.sourceLegalEntityId,
      targetLegalEntityId: r.targetLegalEntityId,
      currency: r.currency,
      requestedAmount: r.requestedAmount,
      approvedAmount: r.approvedAmount,
      fundingType: r.fundingType,
      priority: r.priority,
      reason: r.reason,
      status: r.status,
      requestedById: r.requestedById,
      approvedById: r.approvedById,
      requiredByDate: new Date(r.requiredByDate),
      approvedAt: r.approvedAt ? new Date(r.approvedAt) : null,
      executedAt: r.executedAt ? new Date(r.executedAt) : null,
      rejectionReason: r.rejectionReason,
    };
  }

  private unmapFundingRequest(r: any): FundingRequest {
    return {
      id: r.id,
      companyId: r.companyId,
      sourceLegalEntityId: r.sourceLegalEntityId,
      targetLegalEntityId: r.targetLegalEntityId,
      currency: r.currency,
      requestedAmount: toNumber(r.requestedAmount),
      approvedAmount: r.approvedAmount ? toNumber(r.approvedAmount) : null,
      fundingType: r.fundingType as any,
      priority: r.priority,
      reason: r.reason,
      status: r.status as any,
      requestedById: r.requestedById,
      approvedById: r.approvedById,
      requiredByDate: r.requiredByDate.toISOString(),
      approvedAt: r.approvedAt?.toISOString() ?? null,
      executedAt: r.executedAt?.toISOString() ?? null,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private mapInvestmentBucket(b: InvestmentBucket) {
    return {
      id: b.id,
      companyId: b.companyId,
      legalEntityId: b.legalEntityId,
      name: b.name,
      currency: b.currency,
      totalAllocated: b.totalAllocated,
      currentValue: b.currentValue,
      availableForInvestment: b.availableForInvestment,
      strategy: b.strategy,
      holdings: JSON.parse(JSON.stringify(b.holdings)),
      maturityProfile: JSON.parse(JSON.stringify(b.maturityProfile)),
      restrictions: b.restrictions,
    };
  }

  private unmapInvestmentBucket(r: any): InvestmentBucket {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      name: r.name,
      currency: r.currency,
      totalAllocated: toNumber(r.totalAllocated),
      currentValue: toNumber(r.currentValue),
      availableForInvestment: toNumber(r.availableForInvestment),
      strategy: r.strategy as any,
      holdings: r.holdings as any,
      maturityProfile: r.maturityProfile as any,
      restrictions: r.restrictions,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private mapRestrictedCash(r: RestrictedCash) {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      accountId: r.accountId,
      currency: r.currency,
      totalAmount: r.totalAmount,
      restrictionType: r.restrictionType,
      restrictionDescription: r.restrictionDescription,
      counterparty: r.counterparty,
      releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
      isReleased: r.isReleased,
      regulatoryReference: r.regulatoryReference,
    };
  }

  private unmapRestrictedCash(r: any): RestrictedCash {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      accountId: r.accountId,
      currency: r.currency,
      totalAmount: toNumber(r.totalAmount),
      restrictionType: r.restrictionType as any,
      restrictionDescription: r.restrictionDescription,
      counterparty: r.counterparty,
      releaseDate: r.releaseDate?.toISOString() ?? null,
      isReleased: r.isReleased,
      regulatoryReference: r.regulatoryReference,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private mapWorkingCapital(w: WorkingCapital) {
    return {
      id: w.id,
      companyId: w.companyId,
      legalEntityId: w.legalEntityId,
      currency: w.currency,
      currentAssets: w.currentAssets,
      currentLiabilities: w.currentLiabilities,
      netWorkingCapital: w.netWorkingCapital,
      currentRatio: w.currentRatio,
      quickRatio: w.quickRatio,
      cashConversionCycleDays: w.cashConversionCycleDays,
      accountsReceivable: w.accountsReceivable,
      accountsPayable: w.accountsPayable,
      inventory: w.inventory,
      calculatedAt: new Date(w.calculatedAt),
    };
  }

  private unmapWorkingCapital(r: any): WorkingCapital {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      currency: r.currency,
      currentAssets: toNumber(r.currentAssets),
      currentLiabilities: toNumber(r.currentLiabilities),
      netWorkingCapital: toNumber(r.netWorkingCapital),
      currentRatio: r.currentRatio,
      quickRatio: r.quickRatio,
      cashConversionCycleDays: r.cashConversionCycleDays,
      accountsReceivable: toNumber(r.accountsReceivable),
      accountsPayable: toNumber(r.accountsPayable),
      inventory: toNumber(r.inventory),
      calculatedAt: r.calculatedAt.toISOString(),
    };
  }

  private mapFXExposure(e: FXExposure) {
    return {
      id: e.id,
      companyId: e.companyId,
      legalEntityId: e.legalEntityId,
      sourceCurrency: e.sourceCurrency,
      targetCurrency: e.targetCurrency,
      exposureAmount: e.exposureAmount,
      exposureDirection: e.exposureDirection,
      currentRate: e.currentRate,
      previousRate: e.previousRate,
      rateChange: e.rateChange,
      unrealizedPnl: e.unrealizedPnl,
      realizedPnl: e.realizedPnl,
      hedgeStatus: e.hedgeStatus,
      hedgeInstrument: e.hedgeInstrument,
      policyLimit: e.policyLimit,
      breachLimit: e.breachLimit,
    };
  }

  private unmapFXExposure(r: any): FXExposure {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      sourceCurrency: r.sourceCurrency,
      targetCurrency: r.targetCurrency,
      exposureAmount: toNumber(r.exposureAmount),
      exposureDirection: r.exposureDirection as any,
      currentRate: toNumber(r.currentRate),
      previousRate: toNumber(r.previousRate),
      rateChange: r.rateChange,
      unrealizedPnl: toNumber(r.unrealizedPnl),
      realizedPnl: toNumber(r.realizedPnl),
      hedgeStatus: r.hedgeStatus as any,
      hedgeInstrument: r.hedgeInstrument,
      policyLimit: r.policyLimit ? toNumber(r.policyLimit) : null,
      breachLimit: r.breachLimit,
    };
  }

  private mapCounterpartyRisk(r: CounterpartyRisk) {
    return {
      counterpartyId: r.counterpartyId,
      counterpartyName: r.counterpartyName,
      counterpartyType: r.counterpartyType,
      creditRating: r.creditRating,
      exposureAmount: r.exposureAmount,
      exposureLimit: r.exposureLimit,
      utilizationPercent: r.utilizationPercent,
      collateralHeld: r.collateralHeld,
      daysOverLimit: r.daysOverLimit,
      status: r.status,
      lastReviewDate: new Date(r.lastReviewDate),
      nextReviewDate: new Date(r.nextReviewDate),
      riskScore: r.riskScore,
    };
  }

  private unmapCounterpartyRisk(r: any): CounterpartyRisk {
    return {
      counterpartyId: r.counterpartyId,
      counterpartyName: r.counterpartyName,
      counterpartyType: r.counterpartyType as any,
      creditRating: r.creditRating,
      exposureAmount: toNumber(r.exposureAmount),
      exposureLimit: toNumber(r.exposureLimit),
      utilizationPercent: r.utilizationPercent,
      collateralHeld: toNumber(r.collateralHeld),
      daysOverLimit: r.daysOverLimit,
      status: r.status as any,
      lastReviewDate: r.lastReviewDate.toISOString(),
      nextReviewDate: r.nextReviewDate.toISOString(),
      riskScore: r.riskScore,
    };
  }

  private mapCashPolicy(p: CashPolicy) {
    return {
      id: p.id,
      companyId: p.companyId,
      name: p.name,
      policyType: p.policyType,
      currency: p.currency,
      region: p.region,
      legalEntityId: p.legalEntityId,
      minimumBalance: p.minimumBalance,
      targetBalance: p.targetBalance,
      maximumBalance: p.maximumBalance,
      liquidityBufferPercent: p.liquidityBufferPercent,
      concentrationLimit: p.concentrationLimit,
      counterpartyLimit: p.counterpartyLimit,
      investmentLimit: p.investmentLimit,
      rules: JSON.parse(JSON.stringify(p.rules)),
      enabled: p.enabled,
    };
  }

  private unmapCashPolicy(r: any): CashPolicy {
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      policyType: r.policyType as any,
      currency: r.currency,
      region: r.region,
      legalEntityId: r.legalEntityId,
      minimumBalance: r.minimumBalance ? toNumber(r.minimumBalance) : null,
      targetBalance: r.targetBalance ? toNumber(r.targetBalance) : null,
      maximumBalance: r.maximumBalance ? toNumber(r.maximumBalance) : null,
      liquidityBufferPercent: r.liquidityBufferPercent,
      concentrationLimit: toNumber(r.concentrationLimit),
      counterpartyLimit: toNumber(r.counterpartyLimit),
      investmentLimit: toNumber(r.investmentLimit),
      rules: r.rules as any,
      enabled: r.enabled,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private mapTreasuryPolicy(p: TreasuryPolicy) {
    return {
      id: p.id,
      companyId: p.companyId,
      name: p.name,
      description: p.description,
      policies: JSON.parse(JSON.stringify(p.policies)),
      approvalMatrix: JSON.parse(JSON.stringify(p.approvalMatrix)),
      reportingSchedule: p.reportingSchedule,
      version: p.version,
      effectiveFrom: new Date(p.effectiveFrom),
      effectiveTo: p.effectiveTo ? new Date(p.effectiveTo) : null,
    };
  }

  private unmapTreasuryPolicy(r: any): TreasuryPolicy {
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      description: r.description,
      policies: r.policies as any,
      approvalMatrix: r.approvalMatrix as any,
      reportingSchedule: r.reportingSchedule,
      version: r.version,
      effectiveFrom: r.effectiveFrom.toISOString(),
      effectiveTo: r.effectiveTo?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private mapTreasuryAlert(a: TreasuryAlert) {
    return {
      id: a.id,
      companyId: a.companyId,
      legalEntityId: a.legalEntityId,
      severity: a.severity,
      category: a.category,
      title: a.title,
      message: a.message,
      metadata: a.metadata as any,
      acknowledged: a.acknowledged,
      acknowledgedById: a.acknowledgedById,
      acknowledgedAt: a.acknowledgedAt ? new Date(a.acknowledgedAt) : null,
      resolved: a.resolved,
      resolvedById: a.resolvedById,
      resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : null,
    };
  }

  private unmapTreasuryAlert(r: any): TreasuryAlert {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      severity: r.severity as any,
      category: r.category as any,
      title: r.title,
      message: r.message,
      metadata: r.metadata as Record<string, unknown>,
      acknowledged: r.acknowledged,
      acknowledgedById: r.acknowledgedById,
      acknowledgedAt: r.acknowledgedAt?.toISOString() ?? null,
      resolved: r.resolved,
      resolvedById: r.resolvedById,
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private mapTreasurySnapshot(s: TreasurySnapshot) {
    return {
      id: s.id,
      companyId: s.companyId,
      legalEntityId: s.legalEntityId,
      region: s.region,
      recordedAt: new Date(s.recordedAt),
      totalCash: s.totalCash,
      availableCash: s.availableCash,
      restrictedCash: s.restrictedCash,
      idleCash: s.idleCash,
      netLiquidity: s.netLiquidity,
      workingCapital: s.workingCapital ? JSON.parse(JSON.stringify(s.workingCapital)) : null,
      positionsByCurrency: JSON.parse(JSON.stringify(s.positionsByCurrency)),
      liquidityByCategory: JSON.parse(JSON.stringify(s.liquidityByCategory)),
      cashByClassification: JSON.parse(JSON.stringify(s.cashByClassification)),
      totalExposure: s.totalExposure,
      openFundingRequests: s.openFundingRequests,
      activePools: s.activePools,
      policyViolations: s.policyViolations,
      alerts: JSON.parse(JSON.stringify(s.alerts)),
    };
  }

  private unmapTreasurySnapshot(r: any): TreasurySnapshot {
    return {
      id: r.id,
      companyId: r.companyId,
      legalEntityId: r.legalEntityId,
      region: r.region,
      recordedAt: r.recordedAt.toISOString(),
      totalCash: toNumber(r.totalCash),
      availableCash: toNumber(r.availableCash),
      restrictedCash: toNumber(r.restrictedCash),
      idleCash: toNumber(r.idleCash),
      netLiquidity: toNumber(r.netLiquidity),
      workingCapital: r.workingCapital as any,
      positionsByCurrency: r.positionsByCurrency as any,
      liquidityByCategory: r.liquidityByCategory as any,
      cashByClassification: r.cashByClassification as any,
      totalExposure: r.totalExposure,
      openFundingRequests: r.openFundingRequests,
      activePools: r.activePools,
      policyViolations: r.policyViolations,
      alerts: r.alerts as any,
    };
  }
}
