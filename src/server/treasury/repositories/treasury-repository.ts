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

export interface TreasuryRepository {
  saveCashPosition(position: CashPosition): Promise<void>;
  getCashPositions(companyId: string, legalEntityId?: string): Promise<CashPosition[]>;

  saveLiquidityPosition(position: LiquidityPosition): Promise<void>;
  getLiquidityPositions(companyId: string, legalEntityId?: string): Promise<LiquidityPosition[]>;

  saveTreasuryAccount(account: TreasuryAccount): Promise<void>;
  getTreasuryAccounts(companyId: string): Promise<TreasuryAccount[]>;

  saveCashPool(pool: CashPool): Promise<void>;
  getCashPools(companyId: string): Promise<CashPool[]>;

  saveCashMovement(movement: CashMovement): Promise<void>;
  getCashMovements(companyId: string): Promise<CashMovement[]>;

  saveCashForecast(forecast: CashForecast): Promise<void>;
  getCashForecasts(companyId: string, legalEntityId?: string): Promise<CashForecast[]>;

  saveFundingRequest(request: FundingRequest): Promise<void>;
  getFundingRequests(companyId: string): Promise<FundingRequest[]>;

  saveInvestmentBucket(bucket: InvestmentBucket): Promise<void>;
  getInvestmentBuckets(companyId: string): Promise<InvestmentBucket[]>;

  saveRestrictedCash(rc: RestrictedCash): Promise<void>;
  getRestrictedCash(companyId: string): Promise<RestrictedCash[]>;

  saveWorkingCapital(wc: WorkingCapital): Promise<void>;
  getWorkingCapital(companyId: string): Promise<WorkingCapital[]>;

  saveFXExposure(exposure: FXExposure): Promise<void>;
  getFXExposures(companyId: string): Promise<FXExposure[]>;

  saveCounterpartyRisk(risk: CounterpartyRisk): Promise<void>;
  getCounterpartyRisks(companyId: string): Promise<CounterpartyRisk[]>;

  saveCashPolicy(policy: CashPolicy): Promise<void>;
  getCashPolicies(companyId: string): Promise<CashPolicy[]>;

  saveTreasuryPolicy(policy: TreasuryPolicy): Promise<void>;
  getTreasuryPolicies(companyId: string): Promise<TreasuryPolicy[]>;

  saveTreasuryAlert(alert: TreasuryAlert): Promise<void>;
  getTreasuryAlerts(companyId: string): Promise<TreasuryAlert[]>;

  saveTreasurySnapshot(snapshot: TreasurySnapshot): Promise<void>;
  getTreasurySnapshots(companyId: string): Promise<TreasurySnapshot[]>;
}

export class InMemoryTreasuryRepository implements TreasuryRepository {
  private cashPositions = new Map<string, CashPosition[]>();
  private liquidityPositions = new Map<string, LiquidityPosition[]>();
  private treasuryAccounts = new Map<string, TreasuryAccount[]>();
  private cashPools = new Map<string, CashPool[]>();
  private cashMovements = new Map<string, CashMovement[]>();
  private cashForecasts = new Map<string, CashForecast[]>();
  private fundingRequests = new Map<string, FundingRequest[]>();
  private investmentBuckets = new Map<string, InvestmentBucket[]>();
  private restrictedCash = new Map<string, RestrictedCash[]>();
  private workingCapital = new Map<string, WorkingCapital[]>();
  private fxExposures = new Map<string, FXExposure[]>();
  private counterpartyRisks = new Map<string, CounterpartyRisk[]>();
  private cashPolicies = new Map<string, CashPolicy[]>();
  private treasuryPolicies = new Map<string, TreasuryPolicy[]>();
  private treasuryAlerts = new Map<string, TreasuryAlert[]>();
  private treasurySnapshots = new Map<string, TreasurySnapshot[]>();

  async saveCashPosition(position: CashPosition): Promise<void> {
    const list = this.cashPositions.get(position.companyId) ?? [];
    list.push(position);
    this.cashPositions.set(position.companyId, list);
  }

  async getCashPositions(companyId: string, legalEntityId?: string): Promise<CashPosition[]> {
    let list = this.cashPositions.get(companyId) ?? [];
    if (legalEntityId) list = list.filter((p) => p.legalEntityId === legalEntityId);
    return list;
  }

  async saveLiquidityPosition(position: LiquidityPosition): Promise<void> {
    const list = this.liquidityPositions.get(position.companyId) ?? [];
    list.push(position);
    this.liquidityPositions.set(position.companyId, list);
  }

  async getLiquidityPositions(companyId: string, legalEntityId?: string): Promise<LiquidityPosition[]> {
    let list = this.liquidityPositions.get(companyId) ?? [];
    if (legalEntityId) list = list.filter((p) => p.legalEntityId === legalEntityId);
    return list;
  }

  async saveTreasuryAccount(account: TreasuryAccount): Promise<void> {
    const list = this.treasuryAccounts.get(account.companyId) ?? [];
    const idx = list.findIndex((a) => a.id === account.id);
    if (idx >= 0) list[idx] = account;
    else list.push(account);
    this.treasuryAccounts.set(account.companyId, list);
  }

  async getTreasuryAccounts(companyId: string): Promise<TreasuryAccount[]> {
    return this.treasuryAccounts.get(companyId) ?? [];
  }

  async saveCashPool(pool: CashPool): Promise<void> {
    const list = this.cashPools.get(pool.companyId) ?? [];
    const idx = list.findIndex((p) => p.id === pool.id);
    if (idx >= 0) list[idx] = pool;
    else list.push(pool);
    this.cashPools.set(pool.companyId, list);
  }

  async getCashPools(companyId: string): Promise<CashPool[]> {
    return this.cashPools.get(companyId) ?? [];
  }

  async saveCashMovement(movement: CashMovement): Promise<void> {
    const list = this.cashMovements.get(movement.companyId) ?? [];
    list.push(movement);
    this.cashMovements.set(movement.companyId, list);
  }

  async getCashMovements(companyId: string): Promise<CashMovement[]> {
    return this.cashMovements.get(companyId) ?? [];
  }

  async saveCashForecast(forecast: CashForecast): Promise<void> {
    const list = this.cashForecasts.get(forecast.companyId) ?? [];
    list.push(forecast);
    this.cashForecasts.set(forecast.companyId, list);
  }

  async getCashForecasts(companyId: string, legalEntityId?: string): Promise<CashForecast[]> {
    let list = this.cashForecasts.get(companyId) ?? [];
    if (legalEntityId) list = list.filter((f) => f.legalEntityId === legalEntityId);
    return list;
  }

  async saveFundingRequest(request: FundingRequest): Promise<void> {
    const list = this.fundingRequests.get(request.companyId) ?? [];
    const idx = list.findIndex((r) => r.id === request.id);
    if (idx >= 0) list[idx] = request;
    else list.push(request);
    this.fundingRequests.set(request.companyId, list);
  }

  async getFundingRequests(companyId: string): Promise<FundingRequest[]> {
    return this.fundingRequests.get(companyId) ?? [];
  }

  async saveInvestmentBucket(bucket: InvestmentBucket): Promise<void> {
    const list = this.investmentBuckets.get(bucket.companyId) ?? [];
    const idx = list.findIndex((b) => b.id === bucket.id);
    if (idx >= 0) list[idx] = bucket;
    else list.push(bucket);
    this.investmentBuckets.set(bucket.companyId, list);
  }

  async getInvestmentBuckets(companyId: string): Promise<InvestmentBucket[]> {
    return this.investmentBuckets.get(companyId) ?? [];
  }

  async saveRestrictedCash(rc: RestrictedCash): Promise<void> {
    const list = this.restrictedCash.get(rc.companyId) ?? [];
    const idx = list.findIndex((r) => r.id === rc.id);
    if (idx >= 0) list[idx] = rc;
    else list.push(rc);
    this.restrictedCash.set(rc.companyId, list);
  }

  async getRestrictedCash(companyId: string): Promise<RestrictedCash[]> {
    return this.restrictedCash.get(companyId) ?? [];
  }

  async saveWorkingCapital(wc: WorkingCapital): Promise<void> {
    const list = this.workingCapital.get(wc.companyId) ?? [];
    const idx = list.findIndex((w) => w.id === wc.id);
    if (idx >= 0) list[idx] = wc;
    else list.push(wc);
    this.workingCapital.set(wc.companyId, list);
  }

  async getWorkingCapital(companyId: string): Promise<WorkingCapital[]> {
    return this.workingCapital.get(companyId) ?? [];
  }

  async saveFXExposure(exposure: FXExposure): Promise<void> {
    const list = this.fxExposures.get(exposure.companyId) ?? [];
    const idx = list.findIndex((e) => e.id === exposure.id);
    if (idx >= 0) list[idx] = exposure;
    else list.push(exposure);
    this.fxExposures.set(exposure.companyId, list);
  }

  async getFXExposures(companyId: string): Promise<FXExposure[]> {
    return this.fxExposures.get(companyId) ?? [];
  }

  async saveCounterpartyRisk(risk: CounterpartyRisk): Promise<void> {
    const list = this.counterpartyRisks.get(risk.counterpartyId) ?? [];
    const idx = list.findIndex((r) => r.counterpartyId === risk.counterpartyId);
    if (idx >= 0) list[idx] = risk;
    else list.push(risk);
    this.counterpartyRisks.set(risk.counterpartyId, list);
  }

  async getCounterpartyRisks(companyId: string): Promise<CounterpartyRisk[]> {
    return Array.from(this.counterpartyRisks.values()).flat();
  }

  async saveCashPolicy(policy: CashPolicy): Promise<void> {
    const list = this.cashPolicies.get(policy.companyId) ?? [];
    const idx = list.findIndex((p) => p.id === policy.id);
    if (idx >= 0) list[idx] = policy;
    else list.push(policy);
    this.cashPolicies.set(policy.companyId, list);
  }

  async getCashPolicies(companyId: string): Promise<CashPolicy[]> {
    return this.cashPolicies.get(companyId) ?? [];
  }

  async saveTreasuryPolicy(policy: TreasuryPolicy): Promise<void> {
    const list = this.treasuryPolicies.get(policy.companyId) ?? [];
    const idx = list.findIndex((p) => p.id === policy.id);
    if (idx >= 0) list[idx] = policy;
    else list.push(policy);
    this.treasuryPolicies.set(policy.companyId, list);
  }

  async getTreasuryPolicies(companyId: string): Promise<TreasuryPolicy[]> {
    return this.treasuryPolicies.get(companyId) ?? [];
  }

  async saveTreasuryAlert(alert: TreasuryAlert): Promise<void> {
    const list = this.treasuryAlerts.get(alert.companyId) ?? [];
    list.push(alert);
    this.treasuryAlerts.set(alert.companyId, list);
  }

  async getTreasuryAlerts(companyId: string): Promise<TreasuryAlert[]> {
    return this.treasuryAlerts.get(companyId) ?? [];
  }

  async saveTreasurySnapshot(snapshot: TreasurySnapshot): Promise<void> {
    const list = this.treasurySnapshots.get(snapshot.companyId) ?? [];
    list.push(snapshot);
    this.treasurySnapshots.set(snapshot.companyId, list);
  }

  async getTreasurySnapshots(companyId: string): Promise<TreasurySnapshot[]> {
    return this.treasurySnapshots.get(companyId) ?? [];
  }

  clear(): void {
    this.cashPositions.clear();
    this.liquidityPositions.clear();
    this.treasuryAccounts.clear();
    this.cashPools.clear();
    this.cashMovements.clear();
    this.cashForecasts.clear();
    this.fundingRequests.clear();
    this.investmentBuckets.clear();
    this.restrictedCash.clear();
    this.workingCapital.clear();
    this.fxExposures.clear();
    this.counterpartyRisks.clear();
    this.cashPolicies.clear();
    this.treasuryPolicies.clear();
    this.treasuryAlerts.clear();
    this.treasurySnapshots.clear();
  }
}

export const treasuryRepository = new InMemoryTreasuryRepository();
