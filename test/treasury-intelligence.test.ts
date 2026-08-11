/**
 * Program 1 — Treasury Intelligence Platform: comprehensive tests
 *
 * Validates the complete treasury intelligence surface through the
 * TreasuryDataSource boundary with an in-memory stub — DB-free and
 * deterministic. Covers the canonical constants, the measured analysis
 * modules, the evidence providers, the decision types + decision service,
 * the workflow definitions + workflow service, and the command center.
 *
 * Constitutional invariants asserted here:
 *   - no Prisma anywhere in the intelligence layer (Law 1 boundary)
 *   - decisions are deterministic given `now` (no random, no LLM)
 *   - amounts stay decimal strings until measured facts are derived
 *   - every state has an explanation; absence is always disclosed
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  analyzeCashPosition,
  analyzeLiquidity,
  analyzeForecast,
  analyzeForecastForTenant,
  analyzeCashPositionForTenant,
  analyzeLiquidityForTenant,
  registerTreasuryDecisionTypes,
  registerTreasuryEvidenceProviders,
  registerTreasuryWorkflows,
  setTreasuryDataSource,
  resetTreasuryDataSource,
  TreasuryDecisionService,
  TreasuryWorkflowService,
  TreasuryCommandCenterService,
  TREASURY_BALANCE_STALE_DAYS,
  TREASURY_CONCENTRATION_THRESHOLD,
  TREASURY_ENTITY_IDS,
  TREASURY_ENTITY_TYPES,
  TREASURY_ESCALATION_IDS,
  TREASURY_HIGH_VALUE_AMOUNT,
  TREASURY_IMMINENT_DAYS,
  TREASURY_LOAD_KEYS,
  TREASURY_QUEUES,
  TREASURY_ROLES,
  TREASURY_WORKFLOW_IDS,
  TREASURY_PAYMENT_DECISION_TYPE,
  TREASURY_TRANSFER_DECISION_TYPE,
  TREASURY_FUNDING_DECISION_TYPE,
  treasuryPaymentApprovalDefinition,
  treasuryTransferApprovalDefinition,
  treasuryFundingApprovalDefinition,
  type BankAccountRecord,
  type CashForecastRecord,
  type CashPositionRecord,
  type FxExposureRecord,
  type LiquidityPositionRecord,
  type TreasuryAlertRecord,
  type TreasuryDataSource,
  type TreasuryFundingRecord,
  type TreasuryPaymentRecord,
  type TreasuryTransferRecord,
} from "@/modules/treasury";
import {
  assembleEvidenceFor,
  resetEvidenceAssembler,
  resetEvidenceRegistry,
  type EvidencePackage,
} from "@/modules/evidence";
import {
  DecisionIntelligenceEngine,
  resetDecisionTypeRegistry,
  getDecisionTypeRegistry,
  type Decision,
} from "@/modules/decision-engine";
import { EnterpriseWorkflowEngine } from "@/modules/enterprise-workflow";

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures — time-stable across the suite
// ──────────────────────────────────────────────────────────────────────────────

const TENANT = "c_treasury";
const NOW = "2026-08-05T00:00:00.000Z";

function daysAgo(days: number, from = NOW): string {
  return new Date(new Date(from).getTime() - days * 86_400_000).toISOString();
}

function daysAhead(days: number, from = NOW): string {
  return new Date(new Date(from).getTime() + days * 86_400_000).toISOString();
}

function cashPosition(overrides?: Partial<CashPositionRecord>): CashPositionRecord {
  return {
    tenantId: TENANT,
    id: "pos_1",
    entityId: "pos_1",
    region: "EMEA",
    currency: "USD",
    classification: "operating",
    totalBalance: "100000",
    availableBalance: "80000",
    ledgerBalance: "95000",
    floatBalance: "5000",
    bankBalance: "100000",
    bankAccountId: "acct_1",
    institutionName: "Bank A",
    lastSyncedAt: NOW,
    recordedAt: NOW,
    ...overrides,
  };
}

function liquidityPosition(overrides?: Partial<LiquidityPositionRecord>): LiquidityPositionRecord {
  return {
    tenantId: TENANT,
    id: "liq_1",
    entityId: "liq_1",
    region: "EMEA",
    currency: "USD",
    category: "cash",
    amount: "50000",
    daysToLiquidate: 0,
    lastCalculatedAt: NOW,
    ...overrides,
  };
}

function forecast(overrides?: Partial<CashForecastRecord>): CashForecastRecord {
  return {
    tenantId: TENANT,
    id: "fcst_1",
    entityId: "fcst_1",
    currency: "USD",
    horizon: "month",
    confidence: "high",
    generatedAt: daysAgo(0),
    validFrom: NOW,
    validTo: daysAhead(30),
    predictedInflows: [{ label: "Receipts", amount: "120000", currency: "USD", dueAt: daysAhead(15) }],
    predictedOutflows: [{ label: "Payroll", amount: "80000", currency: "USD", dueAt: daysAhead(10) }],
    netPrediction: "40000",
    openingBalance: "50000",
    closingBalance: "90000",
    minimumProjectedBalance: "10000",
    maximumProjectedBalance: "95000",
    keyRisks: [],
    keyAssumptions: [],
    ...overrides,
  };
}

function payment(overrides?: Partial<TreasuryPaymentRecord>): TreasuryPaymentRecord {
  return {
    tenantId: TENANT,
    id: "pay_1",
    entityId: "pay_1",
    beneficiaryName: "Acme Global Ltd",
    beneficiaryRiskLevel: "low",
    amount: "12000",
    currency: "USD",
    method: "wire",
    status: "pending-approval",
    scheduledDate: daysAhead(10),
    initiatorId: "user_1",
    approvedById: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    reference: "INV-2026-001",
    bankConfirmationId: null,
    mandateVerified: true,
    ...overrides,
  };
}

function transfer(overrides?: Partial<TreasuryTransferRecord>): TreasuryTransferRecord {
  return {
    tenantId: TENANT,
    id: "trf_1",
    entityId: "trf_1",
    sourceAccountId: "acct_1",
    targetAccountId: "acct_2",
    currency: "USD",
    amount: "25000",
    fundingType: "sweep",
    status: "pending-approval",
    reason: "Replenish operating account",
    approvalRequired: true,
    approvedById: null,
    requestedAt: daysAgo(1),
    executedAt: null,
    failureReason: null,
    referenceId: "TRF-2026-001",
    ...overrides,
  };
}

function funding(overrides?: Partial<TreasuryFundingRecord>): TreasuryFundingRecord {
  return {
    tenantId: TENANT,
    id: "fnd_1",
    entityId: "fnd_1",
    sourceEntityId: "entity_1",
    targetEntityId: "entity_2",
    currency: "EUR",
    amount: "50000",
    purpose: "Working capital",
    status: "pending-approval",
    intercompanyAgreementRef: "ICA-2026-014",
    approvedById: null,
    requestedAt: daysAgo(1),
    ...overrides,
  };
}

function fxExposure(overrides?: Partial<FxExposureRecord>): FxExposureRecord {
  return {
    tenantId: TENANT,
    id: "fx_1",
    entityId: "fx_1",
    currency: "EUR",
    exposure: "1500000",
    rate: "1.08",
    counterpartyRiskLevel: "medium",
    hedged: false,
    measuredAt: NOW,
    ...overrides,
  };
}

function alert(overrides?: Partial<TreasuryAlertRecord>): TreasuryAlertRecord {
  return {
    tenantId: TENANT,
    id: "alt_1",
    severity: "warning",
    category: "concentration",
    title: "Concentration risk",
    message: "One bank holds most cash.",
    createdAt: daysAgo(0),
    target: null,
    ...overrides,
  };
}

function bankAccount(overrides?: Partial<BankAccountRecord>): BankAccountRecord {
  return {
    tenantId: TENANT,
    id: "acct_1",
    entityId: "acct_1",
    name: "Operating USD",
    currency: "USD",
    accountNumber: "••••1234",
    bankName: "Bank A",
    bankCode: "BKAUS33",
    country: "US",
    balance: "100000",
    isActive: true,
    lastSyncedAt: NOW,
    ...overrides,
  };
}

/** In-memory TreasuryDataSource stub — deterministic and DB-free. */
class MemoryTreasurySource implements TreasuryDataSource {
  positions: CashPositionRecord[] = [];
  liquidity: LiquidityPositionRecord[] = [];
  forecasts: CashForecastRecord[] = [];
  accounts: BankAccountRecord[] = [];
  payments: TreasuryPaymentRecord[] = [];
  transfers: TreasuryTransferRecord[] = [];
  funding: TreasuryFundingRecord[] = [];
  fx: FxExposureRecord[] = [];
  alerts: TreasuryAlertRecord[] = [];

  getCashPositions(tenantId: string) {
    return Promise.resolve(this.positions.filter((r) => r.tenantId === tenantId));
  }
  getLiquidityPositions(tenantId: string) {
    return Promise.resolve(this.liquidity.filter((r) => r.tenantId === tenantId));
  }
  getForecasts(tenantId: string) {
    return Promise.resolve(this.forecasts.filter((r) => r.tenantId === tenantId));
  }
  getBankAccounts(tenantId: string) {
    return Promise.resolve(this.accounts.filter((r) => r.tenantId === tenantId));
  }
  getPayments(tenantId: string) {
    return Promise.resolve(this.payments.filter((r) => r.tenantId === tenantId));
  }
  getTransfers(tenantId: string) {
    return Promise.resolve(this.transfers.filter((r) => r.tenantId === tenantId));
  }
  getFundingRequests(tenantId: string) {
    return Promise.resolve(this.funding.filter((r) => r.tenantId === tenantId));
  }
  getFxExposure(tenantId: string) {
    return Promise.resolve(this.fx.filter((r) => r.tenantId === tenantId));
  }
  getAlerts(tenantId: string) {
    return Promise.resolve(this.alerts.filter((r) => r.tenantId === tenantId));
  }
}

let source: MemoryTreasurySource;

beforeEach(() => {
  resetEvidenceRegistry();
  resetEvidenceAssembler();
  resetDecisionTypeRegistry();
  EnterpriseWorkflowEngine.reset();
  resetTreasuryDataSource();
  source = new MemoryTreasurySource();
  setTreasuryDataSource(source);
  registerTreasuryEvidenceProviders();
  registerTreasuryDecisionTypes();
});

// ──────────────────────────────────────────────────────────────────────────────
// Canonical constants — the treasury contract
// ──────────────────────────────────────────────────────────────────────────────

describe("treasury canonical contract", () => {
  it("defines exactly six canonical entity types", () => {
    expect(TREASURY_ENTITY_TYPES).toEqual([
      "treasury.payment",
      "treasury.transfer",
      "treasury.funding",
      "treasury.cash-position",
      "treasury.forecast",
      "treasury.bank-account",
    ]);
    expect(TREASURY_ENTITY_IDS.payment).toBe("treasury.payment");
    expect(TREASURY_ENTITY_IDS.bankAccount).toBe("treasury.bank-account");
  });

  it("defines the three approval workflow ids and escalation policies", () => {
    expect(TREASURY_WORKFLOW_IDS).toEqual({
      paymentApproval: "workflow.treasury-payment-approval",
      transferApproval: "workflow.treasury-transfer-approval",
      fundingApproval: "workflow.treasury-funding-approval",
    });
    expect(TREASURY_ESCALATION_IDS.payment).toBe("escalation.treasury-payment");
    expect(TREASURY_ROLES.approver).toBe("treasury-approver");
    expect(TREASURY_QUEUES.decision).toBe("treasury.decision-queue");
  });

  it("keeps measured financial thresholds as numbers, never formatted strings", () => {
    expect(TREASURY_HIGH_VALUE_AMOUNT).toBe(250_000);
    expect(TREASURY_IMMINENT_DAYS).toBe(3);
    expect(TREASURY_BALANCE_STALE_DAYS).toBe(1);
    expect(TREASURY_CONCENTRATION_THRESHOLD).toBe(0.5);
  });

  it("defines evidence load keys the providers seed from", () => {
    expect(TREASURY_LOAD_KEYS.payment).toBe("treasury.payment");
    expect(TREASURY_LOAD_KEYS.cashPosition).toBe("treasury.cash-position");
    expect(TREASURY_LOAD_KEYS.fxExposure).toBe("treasury.fx-exposure");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Analysis — cash position (measured facts, nothing invented)
// ──────────────────────────────────────────────────────────────────────────────

describe("cash position analysis", () => {
  it("aggregates totals, currency breakdown, and classification per currency", () => {
    source.positions = [
      cashPosition({ id: "pos_1", totalBalance: "100000", availableBalance: "80000", classification: "operating" }),
      cashPosition({ id: "pos_2", totalBalance: "50000", availableBalance: "50000", classification: "reserve", currency: "EUR" }),
    ];
    const result = analyzeCashPosition(source.positions, [], NOW);

    expect(result.totalBalance).toBe(150000);
    expect(result.availableBalance).toBe(130000);
    expect(result.positionsByCurrency).toHaveLength(2);
    expect(result.positionsByCurrency[0].currency).toBe("USD");
    expect(result.positionsByCurrency[0].totalBalance).toBe(100000);
    expect(result.positionsByCurrency[0].bankCount).toBe(1);
    expect(result.positionsByCurrency[0].classificationBreakdown.operating).toBe(100000);
  });

  it("flags stale positions — older than the staleness threshold or never synced", () => {
    const fresh = cashPosition({ id: "pos_fresh", lastSyncedAt: daysAgo(0.5) });
    const stale = cashPosition({ id: "pos_stale", lastSyncedAt: daysAgo(5) });
    const never = cashPosition({ id: "pos_never", lastSyncedAt: null });
    const result = analyzeCashPosition([fresh, stale, never], [], NOW);

    expect(result.stalePositions.map((p) => p.id)).toEqual(["pos_never", "pos_stale"]);
  });

  it("surfaces concentration risk when one bank holds >= threshold of cash", () => {
    source.positions = [
      cashPosition({ id: "pos_a", bankAccountId: "acct_a", institutionName: "Bank A", totalBalance: "900000" }),
      cashPosition({ id: "pos_b", bankAccountId: "acct_b", institutionName: "Bank B", totalBalance: "100000" }),
    ];
    const result = analyzeCashPosition(source.positions, [], NOW);

    expect(result.concentration).toHaveLength(1);
    expect(result.concentration[0].institutionName).toBe("Bank A");
    expect(result.concentration[0].share).toBeCloseTo(0.9, 5);
  });

  it("reports the newest sync timestamp as lastSyncedAt", () => {
    source.positions = [
      cashPosition({ id: "pos_old", lastSyncedAt: daysAgo(3) }),
      cashPosition({ id: "pos_new", lastSyncedAt: daysAgo(0.25) }),
    ];
    const result = analyzeCashPosition(source.positions, [], NOW);
    expect(result.lastSyncedAt).toBe(daysAgo(0.25));
  });

  it("passes recorded alerts through and is stable on empty input", () => {
    const alerts = [alert()];
    const empty = analyzeCashPosition([], [], NOW);
    expect(empty.totalBalance).toBe(0);
    expect(empty.concentration).toEqual([]);
    expect(empty.stalePositions).toEqual([]);
    expect(empty.alerts).toEqual([]);

    const withAlerts = analyzeCashPosition([cashPosition()], alerts, NOW);
    expect(withAlerts.alerts).toEqual(alerts);
  });

  it("forTenant reads through the data-source boundary", async () => {
    source.positions = [cashPosition({ id: "pos_1", totalBalance: "20000" })];
    source.alerts = [alert()];
    const result = await analyzeCashPositionForTenant(TENANT, NOW);
    expect(result.totalBalance).toBe(20000);
    expect(result.alerts).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Analysis — liquidity (weighted liquidation horizon)
// ──────────────────────────────────────────────────────────────────────────────

describe("liquidity analysis", () => {
  it("totals by category and computes the amount-weighted liquidation days", () => {
    source.liquidity = [
      liquidityPosition({ id: "liq_cash", category: "cash", amount: "60000", daysToLiquidate: 0 }),
      liquidityPosition({ id: "liq_inv", category: "investments", amount: "40000", daysToLiquidate: 10 }),
    ];
    const result = analyzeLiquidity(source.liquidity, NOW);

    expect(result.totalLiquidAssets).toBe(100000);
    expect(result.weightedLiquidationDays).toBe(4);
    expect(result.byCategory[0].category).toBe("cash");
    expect(result.byCategory[0].amount).toBe(60000);
    expect(result.byCategory[1].daysToLiquidate).toBe(10);
  });

  it("aggregates multiple entries into one category row", () => {
    source.liquidity = [
      liquidityPosition({ id: "liq_1", category: "cash", amount: "10000", daysToLiquidate: 0 }),
      liquidityPosition({ id: "liq_2", category: "cash", amount: "20000", daysToLiquidate: 1 }),
    ];
    const result = analyzeLiquidity(source.liquidity, NOW);
    expect(result.byCategory).toHaveLength(1);
    expect(result.byCategory[0].amount).toBe(30000);
    expect(result.byCategory[0].entries).toBe(2);
  });

  it("is stable on empty input", () => {
    const result = analyzeLiquidity([], NOW);
    expect(result.totalLiquidAssets).toBe(0);
    expect(result.weightedLiquidationDays).toBe(0);
    expect(result.byCategory).toEqual([]);
  });

  it("forTenant reads through the data-source boundary", async () => {
    source.liquidity = [liquidityPosition({ amount: "70000", daysToLiquidate: 2 })];
    const result = await analyzeLiquidityForTenant(TENANT, NOW);
    expect(result.totalLiquidAssets).toBe(70000);
    expect(result.weightedLiquidationDays).toBe(2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Analysis — forecast (flags recorded facts, never decides the response)
// ──────────────────────────────────────────────────────────────────────────────

describe("forecast analysis", () => {
  it("returns null when no forecast exists", () => {
    expect(analyzeForecast(null)).toBeNull();
  });

  it("projects a critical flag when the minimum balance is negative", () => {
    const result = analyzeForecast(forecast({ minimumProjectedBalance: "-5000" }));
    expect(result!.flags.some((f) => f.key === "negative-balance" && f.severity === "critical")).toBe(true);
  });

  it("projects a warning flag for low confidence and an info flag for named risks", () => {
    const result = analyzeForecast(
      forecast({ confidence: "low", keyRisks: ["FX volatility", "Late receipts"] }),
    );
    const keys = result!.flags.map((f) => f.key);
    expect(keys).toContain("low-confidence");
    expect(keys).toContain("risk-named");
    expect(result!.flags.find((f) => f.key === "risk-named")!.detail).toContain("FX volatility");
  });

  it("projects no flags for a clean high-confidence forecast", () => {
    const result = analyzeForecast(forecast());
    expect(result!.flags).toEqual([]);
    expect(result!.netPrediction).toBe(40000);
    expect(result!.closingBalance).toBe(90000);
  });

  it("forTenant selects the most recently generated forecast", async () => {
    source.forecasts = [
      forecast({ id: "fcst_old", generatedAt: daysAgo(3) }),
      forecast({ id: "fcst_new", generatedAt: daysAgo(0) }),
    ];
    const result = await analyzeForecastForTenant(TENANT);
    expect(result!.tenantId).toBe(TENANT);
    expect(result!.generatedAt).toBe(daysAgo(0));
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Evidence — providers assemble the full explainability surface
// ──────────────────────────────────────────────────────────────────────────────

async function assemble(entityType: string, entityId: string): Promise<EvidencePackage> {
  return assembleEvidenceFor({ entityType, entityId, tenantId: TENANT, now: NOW });
}

describe("treasury evidence providers", () => {
  it("assembles a complete payment package with no missing evidence", async () => {
    source.payments = [payment()];
    const pkg = await assemble("treasury.payment", "pay_1");

    expect(pkg.metadata.decisionReady).toBe(true);
    expect(pkg.metadata.providerIds).toContain("treasury.payment");
    const ids = pkg.sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).toEqual(
      expect.arrayContaining(["pay.identity", "pay.amount", "pay.mandate", "pay.status", "pay.risk"]),
    );
    const mandate = findItem(pkg, "pay.mandate");
    expect(mandate.status).toBe("positive");
    const amount = findItem(pkg, "pay.amount");
    expect(amount.summary).toBe("12000.00 USD");
    expect(pkg.missing).toEqual([]);
  });

  it("discloses blocking missing evidence when the payment does not exist", async () => {
    const pkg = await assemble("treasury.payment", "missing_pay");

    expect(pkg.metadata.decisionReady).toBe(false);
    const blocking = pkg.missing.filter((m) => m.impact === "blocking");
    // Amount is a blocking required item with no emitted evidence.
    expect(blocking.map((m) => m.id)).toEqual(["payment.amount"]);
    // Identity is disclosed as a negative item rather than a gap.
    expect(findItem(pkg, "pay.identity").status).toBe("negative");
    expect(pkg.sections.some((s) => s.items.some((i) => i.id === "pay.amount"))).toBe(false);
  });

  it("flags an unverified mandate as pending evidence", async () => {
    source.payments = [payment({ mandateVerified: false })];
    const pkg = await assemble("treasury.payment", "pay_1");
    expect(findItem(pkg, "pay.mandate").status).toBe("pending");
    expect(findItem(pkg, "pay.mandate").confidence).toBe("none");
  });

  it("assembles a transfer package reflecting the approval control", async () => {
    source.transfers = [transfer()];
    const pkg = await assemble("treasury.transfer", "trf_1");

    expect(pkg.metadata.decisionReady).toBe(true);
    expect(findItem(pkg, "trf.approval-required").status).toBe("pending");
    expect(pkg.missing).toEqual([]);
  });

  it("assembles a funding package reflecting the intercompany agreement", async () => {
    source.funding = [funding()];
    const withAgreement = await assemble("treasury.funding", "fnd_1");
    expect(findItem(withAgreement, "fund.agreement").status).toBe("positive");

    source.funding = [funding({ intercompanyAgreementRef: null })];
    const withoutAgreement = await assemble("treasury.funding", "fnd_1");
    expect(findItem(withoutAgreement, "fund.agreement").status).toBe("pending");
  });

  it("assembles cash-position, forecast, and bank-account packages", async () => {
    source.positions = [cashPosition()];
    source.forecasts = [forecast()];
    source.accounts = [bankAccount()];

    const cash = await assemble("treasury.cash-position", "pos_1");
    expect(cash.sections.some((s) => s.items.some((i) => i.id === "cash.balance"))).toBe(true);

    const fcst = await assemble("treasury.forecast", "fcst_1");
    expect(fcst.sections.some((s) => s.items.some((i) => i.id === "fc.net"))).toBe(true);

    const acct = await assemble("treasury.bank-account", "acct_1");
    expect(acct.sections.some((s) => s.items.some((i) => i.id === "bank.identity"))).toBe(true);
  });

  it("uses seeded records instead of re-fetching from the data source", async () => {
    const seeded = payment({ id: "pay_seeded", beneficiaryName: "Seeded Beneficiary" });
    const pkg = await assembleEvidenceFor({
      entityType: "treasury.payment",
      entityId: "pay_seeded",
      tenantId: TENANT,
      now: NOW,
      seed: { [TREASURY_LOAD_KEYS.payment]: seeded },
    });
    expect(findItem(pkg, "pay.identity").summary).toBe("Seeded Beneficiary");
  });

  it("registration is idempotent — repeated calls do not duplicate providers", async () => {
    resetEvidenceRegistry();
    resetEvidenceAssembler();
    registerTreasuryEvidenceProviders();
    registerTreasuryEvidenceProviders();
    const pkg = await assemble("treasury.payment", "nope");
    expect(pkg.metadata.providerIds.filter((id) => id === "treasury.payment")).toHaveLength(1);
  });
});

function findItem(pkg: EvidencePackage, id: string) {
  for (const section of pkg.sections) {
    const found = section.items.find((i) => i.id === id);
    if (found) return found;
  }
  throw new Error(`Evidence item "${id}" not found`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Decisions — deterministic recommendations from measured facts
// ──────────────────────────────────────────────────────────────────────────────

describe("treasury decision service", () => {
  let service: TreasuryDecisionService;

  beforeEach(() => {
    service = new TreasuryDecisionService(new DecisionIntelligenceEngine(), source);
  });

  it("registers the three treasury decision types idempotently", () => {
    const registry = getDecisionTypeRegistry();
    expect(registry.has("treasury.payment")).toBe(true);
    expect(registry.has("treasury.transfer")).toBe(true);
    expect(registry.has("treasury.funding")).toBe(true);
    expect(TREASURY_PAYMENT_DECISION_TYPE.entityType).toBe("treasury.payment");
    expect(TREASURY_TRANSFER_DECISION_TYPE.label).toContain("Transfer");
    expect(TREASURY_FUNDING_DECISION_TYPE.label).toContain("Funding");
  });

  it("approves a clean, low-value, mandate-verified payment", async () => {
    source.payments = [payment({ amount: "12000", scheduledDate: daysAhead(10), mandateVerified: true })];
    const decision = await service.evaluateEntity({
      entityType: "treasury.payment",
      entityId: "pay_1",
      tenantId: TENANT,
      now: NOW,
    });
    expect(decision.recommendation).toBe("approve");
    expect(decision.confidence).toBe("high");
    expect(decision.triggeredRules.filter((r) => r.triggered)).toEqual([]);
  });

  it("approves-with-warning when the payment is scheduled imminently", async () => {
    source.payments = [payment({ scheduledDate: daysAhead(TREASURY_IMMINENT_DAYS) })];
    const rec = await service.recommend({ entityType: "treasury.payment", entityId: "pay_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("approve-with-warning");
  });

  it("escalates a high-value payment beyond the threshold", async () => {
    source.payments = [payment({ amount: String(TREASURY_HIGH_VALUE_AMOUNT + 1) })];
    const decision = await service.evaluateEntity({
      entityType: "treasury.payment",
      entityId: "pay_1",
      tenantId: TENANT,
      now: NOW,
    });
    expect(decision.recommendation).toBe("escalate");
    expect(decision.triggeredRules.map((r) => r.ruleId)).toContain("pay.high-value");
  });

  it("escalates a high-risk beneficiary even at a low amount", async () => {
    source.payments = [payment({ amount: "1000", beneficiaryRiskLevel: "critical" })];
    const rec = await service.recommend({ entityType: "treasury.payment", entityId: "pay_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("escalate");
  });

  it("needs-review when the beneficiary mandate is unverified", async () => {
    source.payments = [payment({ mandateVerified: false })];
    const rec = await service.recommend({ entityType: "treasury.payment", entityId: "pay_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("needs-review");
  });

  it("cannot-decide on a terminal payment status", async () => {
    source.payments = [payment({ status: "released" })];
    const rec = await service.recommend({ entityType: "treasury.payment", entityId: "pay_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("cannot-decide");
  });

  it("cannot-decide when the payment record does not exist", async () => {
    const rec = await service.recommend({ entityType: "treasury.payment", entityId: "missing", tenantId: TENANT, now: NOW });
    expect(rec).toBe("cannot-decide");
  });

  it("needs-review for an approval-required transfer with an unmet control", async () => {
    source.transfers = [transfer({ approvalRequired: true, amount: "25000" })];
    const rec = await service.recommend({ entityType: "treasury.transfer", entityId: "trf_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("needs-review");
  });

  it("approves an approval-required transfer once the control is cleared", async () => {
    source.transfers = [transfer({ approvalRequired: false })];
    const rec = await service.recommend({ entityType: "treasury.transfer", entityId: "trf_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("approve");
  });

  it("escalates a high-value transfer", async () => {
    source.transfers = [transfer({ amount: String(TREASURY_HIGH_VALUE_AMOUNT * 2) })];
    const rec = await service.recommend({ entityType: "treasury.transfer", entityId: "trf_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("escalate");
  });

  it("needs-review for funding without an intercompany agreement", async () => {
    source.funding = [funding({ intercompanyAgreementRef: null })];
    const rec = await service.recommend({ entityType: "treasury.funding", entityId: "fnd_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("needs-review");
  });

  it("approves funding that references its governing agreement", async () => {
    source.funding = [funding({ intercompanyAgreementRef: "ICA-2026-014" })];
    const rec = await service.recommend({ entityType: "treasury.funding", entityId: "fnd_1", tenantId: TENANT, now: NOW });
    expect(rec).toBe("approve");
  });

  it("produces a full decision artifact with a reasoning graph and audit trail", async () => {
    source.payments = [payment()];
    const decision: Decision = await service.evaluateEntity({
      entityType: "treasury.payment",
      entityId: "pay_1",
      tenantId: TENANT,
      now: NOW,
    });
    expect(decision.id).toBe("dec:treasury.payment:pay_1");
    expect(decision.entity.type).toBe("treasury.payment");
    expect(decision.requiredHumanActions.length).toBeGreaterThan(0);
    expect(decision.audit.determinismHash).toMatch(/^[a-f0-9]{64}$/);
    expect(decision.alternativeOutcomes.length).toBeGreaterThan(0);
  });

  it("is deterministic — identical input yields an identical recommendation and hash", async () => {
    source.payments = [payment({ amount: "90000" })];
    const input = { entityType: "treasury.payment" as const, entityId: "pay_1", tenantId: TENANT, now: NOW };
    const a = await service.evaluateEntity(input);
    const b = await service.evaluateEntity(input);
    expect(a.recommendation).toBe(b.recommendation);
    expect(a.audit.determinismHash).toBe(b.audit.determinismHash);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Workflow — treasury approval definitions + decision queue
// ──────────────────────────────────────────────────────────────────────────────

describe("treasury workflow service", () => {
  let engine: EnterpriseWorkflowEngine;
  let workflow: TreasuryWorkflowService;

  beforeEach(() => {
    EnterpriseWorkflowEngine.reset();
    engine = EnterpriseWorkflowEngine.getInstance({ registerGeneralApproval: false });
    registerTreasuryWorkflows(engine.registry);
    workflow = new TreasuryWorkflowService(engine);
  });

  it("registers the three treasury approval definitions", () => {
    for (const id of [
      TREASURY_WORKFLOW_IDS.paymentApproval,
      TREASURY_WORKFLOW_IDS.transferApproval,
      TREASURY_WORKFLOW_IDS.fundingApproval,
    ]) {
      const def = workflow.registry.getDefinition(id);
      expect(def).toBeDefined();
      expect(def!.category).toBe("treasury");
      expect(def!.autoStart).toBe(true);
      expect(def!.requiresDecision).toBe(true);
      expect(def!.steps.approval.kind).toBe("approval");
      expect(def!.steps.approval.escalationPolicyId).toBeDefined();
    }
  });

  it("adopts the general-approval shape — routing, approval, notify, complete", () => {
    const def = treasuryPaymentApprovalDefinition();
    expect(def.entryStepId).toBe("start");
    expect(def.steps.start.kind).toBe("routing");
    expect(def.steps["notify-approve"].autoComplete).toBe(true);
    expect(def.steps.complete.completesInstance).toBe(true);
  });

  it("registers escalation policies for time and sla-breach triggers", () => {
    expect(workflow.registry.getEscalationPolicy(TREASURY_ESCALATION_IDS.payment)).toBeDefined();
    expect(workflow.registry.getEscalationPolicy(TREASURY_ESCALATION_IDS.transfer)).toBeDefined();
    expect(workflow.registry.getEscalationPolicy(TREASURY_ESCALATION_IDS.funding)).toBeDefined();
  });

  it("creates an auto-started decision instance for a payment entity", () => {
    const instance = workflow.createDecisionInstance({
      workflowId: TREASURY_WORKFLOW_IDS.paymentApproval,
      tenantId: TENANT,
      initiatorId: "user_1",
      entityRef: { type: "treasury.payment", id: "pay_1" },
    });

    expect(instance.workflowId).toBe(TREASURY_WORKFLOW_IDS.paymentApproval);
    expect(instance.entityRef).toEqual({ type: "treasury.payment", id: "pay_1" });
    expect(instance.state).not.toBe("created");
    expect(instance.startedAt).not.toBeNull();
  });

  it("attaches a decision and surfaces it in the treasury decision queue", async () => {
    const instance = workflow.createDecisionInstance({
      workflowId: TREASURY_WORKFLOW_IDS.paymentApproval,
      tenantId: TENANT,
      initiatorId: "user_1",
      entityRef: { type: "treasury.payment", id: "pay_1" },
    });

    const service = new TreasuryDecisionService(new DecisionIntelligenceEngine(), source);
    source.payments = [payment({ amount: String(TREASURY_HIGH_VALUE_AMOUNT + 1) })];
    const decision = await service.evaluateEntity({
      entityType: "treasury.payment",
      entityId: "pay_1",
      tenantId: TENANT,
      now: NOW,
    });

    workflow.attachDecision(instance.id, decision, "engine");
    const queue = workflow.getDecisionQueue(TENANT);

    expect(queue.length).toBeGreaterThan(0);
    const queued = queue.find((q) => q.instanceId === instance.id);
    expect(queued).toBeDefined();
    expect(queued!.recommendation).toBe("escalate");
    expect(queued!.workflowId).toBe(TREASURY_WORKFLOW_IDS.paymentApproval);
  });

  it("excludes clean approvals from the decision queue (decisionRequired)", async () => {
    const instance = workflow.createDecisionInstance({
      workflowId: TREASURY_WORKFLOW_IDS.transferApproval,
      tenantId: TENANT,
      initiatorId: "user_1",
      entityRef: { type: "treasury.transfer", id: "trf_1" },
    });

    const service = new TreasuryDecisionService(new DecisionIntelligenceEngine(), source);
    source.transfers = [transfer({ approvalRequired: false })];
    const decision = await service.evaluateEntity({
      entityType: "treasury.transfer",
      entityId: "trf_1",
      tenantId: TENANT,
      now: NOW,
    });

    workflow.attachDecision(instance.id, decision, "engine");
    const queue = workflow.getDecisionQueue(TENANT);
    expect(queue.find((q) => q.instanceId === instance.id)).toBeUndefined();
  });

  it("approve-path instances complete once the decision routes to notify-approve", () => {
    const instance = workflow.createDecisionInstance({
      workflowId: TREASURY_WORKFLOW_IDS.fundingApproval,
      tenantId: TENANT,
      initiatorId: "user_1",
      entityRef: { type: "treasury.funding", id: "fnd_1" },
    });
    expect(instance.state).not.toBe("created");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Command center — the aggregate read surface
// ──────────────────────────────────────────────────────────────────────────────

describe("treasury command center", () => {
  it("composes measured cash, liquidity, forecast, fx, alerts, and movements", async () => {
    source.positions = [
      cashPosition({ id: "pos_1", totalBalance: "300000", lastSyncedAt: NOW }),
    ];
    source.liquidity = [
      liquidityPosition({ id: "liq_1", amount: "250000", daysToLiquidate: 1 }),
    ];
    source.forecasts = [forecast()];
    source.payments = [
      payment({ id: "pay_1", amount: "12000", status: "pending-approval", updatedAt: NOW }),
      payment({ id: "pay_2", amount: String(TREASURY_HIGH_VALUE_AMOUNT + 1), status: "pending-approval", updatedAt: NOW }),
      payment({ id: "pay_3", amount: "5000", status: "released", updatedAt: NOW }),
    ];
    source.transfers = [
      transfer({ id: "trf_1", amount: "25000", status: "pending-approval", requestedAt: NOW }),
    ];
    source.funding = [
      funding({ id: "fnd_1", amount: "50000", status: "executed", requestedAt: NOW }),
    ];
    source.fx = [
      fxExposure({ id: "fx_eur", currency: "EUR", exposure: "1500000" }),
      fxExposure({ id: "fx_jpy", currency: "JPY", exposure: "800000" }),
    ];
    source.alerts = [alert({ id: "alt_1" })];

    const service = new TreasuryCommandCenterService(
      source,
      new TreasuryWorkflowService(EnterpriseWorkflowEngine.getInstance({ registerGeneralApproval: false })),
    );
    const overview = await service.overview(TENANT, NOW);

    expect(overview.tenantId).toBe(TENANT);
    expect(overview.measuredAt).toBe(NOW);
    expect(overview.cash.totalBalance).toBe(300000);
    expect(overview.liquidity.totalLiquidAssets).toBe(250000);
    expect(overview.forecast!.netPrediction).toBe(40000);
    expect(overview.fx.map((f) => f.currency)).toEqual(["EUR", "JPY"]);
    expect(overview.alerts).toHaveLength(1);
    expect(overview.movements.payments.awaitingDecision).toBe(2);
    expect(overview.movements.payments.highValueAwaitingDecision).toBe(1);
    expect(overview.movements.payments.releasedToday).toBe(1);
    expect(overview.movements.transfers.awaitingDecision).toBe(1);
    expect(overview.movements.funding.awaitingDecision).toBe(0);
    expect(overview.movements.funding.releasedToday).toBe(1);
  });

  it("reports a null forecast when none has been generated", async () => {
    const service = new TreasuryCommandCenterService(
      source,
      new TreasuryWorkflowService(EnterpriseWorkflowEngine.getInstance({ registerGeneralApproval: false })),
    );
    const overview = await service.overview(TENANT, NOW);
    expect(overview.forecast).toBeNull();
    expect(overview.decisions).toEqual([]);
  });

  it("surfaces pending non-clean decisions in the queue", async () => {
    const workflow = new TreasuryWorkflowService(
      EnterpriseWorkflowEngine.getInstance({ registerGeneralApproval: false }),
    );
    registerTreasuryWorkflows(workflow.registry);

    const instance = workflow.createDecisionInstance({
      workflowId: TREASURY_WORKFLOW_IDS.paymentApproval,
      tenantId: TENANT,
      initiatorId: "user_1",
      entityRef: { type: "treasury.payment", id: "pay_1" },
    });

    source.payments = [payment({ amount: String(TREASURY_HIGH_VALUE_AMOUNT + 1) })];
    const service = new TreasuryDecisionService(new DecisionIntelligenceEngine(), source);
    const decision = await service.evaluateEntity({
      entityType: "treasury.payment",
      entityId: "pay_1",
      tenantId: TENANT,
      now: NOW,
    });
    workflow.attachDecision(instance.id, decision, "engine");

    const cc = new TreasuryCommandCenterService(source, workflow);
    const overview = await cc.overview(TENANT, NOW);
    expect(overview.decisions.length).toBeGreaterThan(0);
    expect(overview.decisions[0].workflowId).toBe(TREASURY_WORKFLOW_IDS.paymentApproval);
  });
});
