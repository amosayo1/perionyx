import { prisma } from "../src/server/db/prisma";

const DEMO_COMPANY_SLUG = process.env.SEED_COMPANY_SLUG ?? "demo-company";

async function main() {
  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) {
    console.log("No demo company found. Run prisma seed first.");
    return;
  }

  const companyId = company.id;

  // Cash Positions
  const cashPositionId = "seed-cash-pos-001";
  await prisma.treasuryCashPosition.upsert({
    where: { id: cashPositionId },
    update: {},
    create: {
      id: cashPositionId,
      companyId,
      legalEntityId: companyId,
      region: "North America",
      currency: "USD",
      classification: "OPERATING",
      totalBalance: 125000000,
      availableBalance: 85000000,
      ledgerBalance: 125000000,
      floatBalance: 2500000,
      bankBalance: 122500000,
      bankAccountId: "ba-usd-001",
      bankConnectionId: "bc-plaid-001",
      providerKind: "plaid",
      institutionName: "JP Morgan Chase",
      lastSyncedAt: new Date(),
      recordedAt: new Date(),
    },
  });

  // Liquidity Position
  const liquidityId = "seed-liq-001";
  await prisma.treasuryLiquidityPosition.upsert({
    where: { id: liquidityId },
    update: {},
    create: {
      id: liquidityId,
      companyId,
      legalEntityId: companyId,
      region: "Global",
      currency: "USD",
      category: "IMMEDIATE",
      amount: 85000000,
      percentageOfTotal: 45,
      daysToLiquidate: 0,
      instruments: [
        { type: "cash", description: "Operating accounts", amount: 50000000, currency: "USD", maturityDate: null, daysToLiquidate: 0, haircut: 0 },
        { type: "cash", description: "Concentration account", amount: 35000000, currency: "USD", maturityDate: null, daysToLiquidate: 0, haircut: 0 },
      ],
      lastCalculatedAt: new Date(),
    },
  });

  // Cash Pool
  const poolId = "seed-pool-001";
  await prisma.treasuryCashPool.upsert({
    where: { id: poolId },
    update: {},
    create: {
      id: poolId,
      companyId,
      name: "Global USD Pool",
      poolType: "PHYSICAL",
      currency: "USD",
      region: "Global",
      memberAccounts: [
        { accountId: "ba-usd-001", institutionName: "JP Morgan Chase", balance: 50000000, targetBalance: 25000000, contributionRatio: 0.4, isLeadAccount: true },
        { accountId: "ba-usd-002", institutionName: "Bank of America", balance: 35000000, targetBalance: 20000000, contributionRatio: 0.3, isLeadAccount: false },
      ],
      totalBalance: 85000000,
      availableBalance: 65000000,
      targetUtilization: 0.8,
      currentUtilization: 0.76,
      interestRate: 0.0425,
      notionalValue: null,
    },
  });

  // Cash Forecast
  const forecastId = "seed-fc-001";
  await prisma.treasuryCashForecast.upsert({
    where: { id: forecastId },
    update: {},
    create: {
      id: forecastId,
      companyId,
      legalEntityId: companyId,
      currency: "USD",
      horizon: "MONTH",
      confidence: "HIGH",
      generatedAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 86400000),
      predictedInflows: [
        { category: "AR Collections", description: "Customer payments", predictedAmount: 45000000, probability: 0.9, expectedDate: new Date(Date.now() + 15 * 86400000).toISOString(), isRecurring: true, variance: null },
      ],
      predictedOutflows: [
        { category: "AP Payments", description: "Vendor payments", predictedAmount: 32000000, probability: 0.85, expectedDate: new Date(Date.now() + 20 * 86400000).toISOString(), isRecurring: true, variance: null },
      ],
      netPrediction: 13000000,
      openingBalance: 85000000,
      closingBalance: 98000000,
      minimumProjectedBalance: 72000000,
      maximumProjectedBalance: 105000000,
      keyRisks: ["FX volatility on EUR receivables", "Delayed AR from major customer"],
      keyAssumptions: ["All recurring payments process on schedule", "No major unexpected expenses"],
      aiConfidenceScore: 0.92,
    },
  });

  // FX Exposure
  const fxId = "seed-fx-001";
  await prisma.treasuryFXExposure.upsert({
    where: { id: fxId },
    update: {},
    create: {
      id: fxId,
      companyId,
      legalEntityId: companyId,
      sourceCurrency: "EUR",
      targetCurrency: "USD",
      exposureAmount: 25000000,
      exposureDirection: "LONG",
      currentRate: 1.08,
      previousRate: 1.07,
      rateChange: 0.0093,
      unrealizedPnl: 232500,
      realizedPnl: 0,
      hedgeStatus: "PARTIALLY_HEDGED",
      hedgeInstrument: "EUR/USD Forward Contract (50% notional)",
      policyLimit: 30000000,
      breachLimit: false,
    },
  });

  // Counterparty Risk
  await prisma.treasuryCounterpartyRisk.upsert({
    where: { counterpartyId: "cp-jpm-001" },
    update: {},
    create: {
      counterpartyId: "cp-jpm-001",
      counterpartyName: "JP Morgan Chase",
      counterpartyType: "BANK",
      creditRating: "AA-",
      exposureAmount: 45000000,
      exposureLimit: 100000000,
      utilizationPercent: 45,
      collateralHeld: 0,
      daysOverLimit: 0,
      status: "ACTIVE",
      lastReviewDate: new Date(Date.now() - 30 * 86400000),
      nextReviewDate: new Date(Date.now() + 335 * 86400000),
      riskScore: 15,
    },
  });

  // Cash Policy
  const policyId = "seed-cpol-001";
  await prisma.treasuryCashPolicy.upsert({
    where: { id: policyId },
    update: {},
    create: {
      id: policyId,
      companyId,
      name: "Minimum Operating Cash - USD",
      policyType: "MINIMUM_CASH",
      currency: "USD",
      region: "Global",
      minimumBalance: 10000000,
      targetBalance: 25000000,
      maximumBalance: null,
      liquidityBufferPercent: 0.15,
      concentrationLimit: 50000000,
      counterpartyLimit: 100000000,
      investmentLimit: 50000000,
      rules: [
        { field: "totalBalance", operator: "LT", value: 10000000, severity: "CRITICAL", message: "Cash balance below minimum threshold" },
        { field: "totalBalance", operator: "GT", value: 50000000, severity: "WARNING", message: "Excess cash — consider investment" },
      ],
      enabled: true,
    },
  });

  // Treasury Alert
  const alertId = "seed-alert-001";
  await prisma.treasuryAlert.upsert({
    where: { id: alertId },
    update: {},
    create: {
      id: alertId,
      companyId,
      legalEntityId: null,
      severity: "INFO",
      category: "FORECAST_DEVIATION",
      title: "Forecast variance detected — EUR region",
      message: "Actual inflows for EUR region are 8% below forecast. Review AR collections.",
      metadata: { forecastId, variance: -0.08, region: "Europe" },
      acknowledged: false,
      acknowledgedById: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedById: null,
      resolvedAt: null,
    },
  });

  // Working Capital
  const wcId = "seed-wc-001";
  await prisma.treasuryWorkingCapital.upsert({
    where: { id: wcId },
    update: {},
    create: {
      id: wcId,
      companyId,
      legalEntityId: companyId,
      currency: "USD",
      currentAssets: 210000000,
      currentLiabilities: 95000000,
      netWorkingCapital: 115000000,
      currentRatio: 2.21,
      quickRatio: 1.85,
      cashConversionCycleDays: 45,
      accountsReceivable: 78000000,
      accountsPayable: 52000000,
      inventory: 42000000,
      calculatedAt: new Date(),
    },
  });

  // Funding Request
  const frId = "seed-fr-001";
  await prisma.treasuryFundingRequest.upsert({
    where: { id: frId },
    update: {},
    create: {
      id: frId,
      companyId,
      sourceLegalEntityId: companyId,
      targetLegalEntityId: "subsidiary-eu-001",
      currency: "EUR",
      requestedAmount: 5000000,
      approvedAmount: null,
      fundingType: "INTERCOMPANY_LOAN",
      priority: 1,
      reason: "Working capital support for EU expansion",
      status: "PENDING_APPROVAL",
      requestedById: "seed-user-001",
      approvedById: null,
      requiredByDate: new Date(Date.now() + 14 * 86400000),
      approvedAt: null,
      executedAt: null,
      rejectionReason: null,
    },
  });

  // Investment Bucket
  const invId = "seed-inv-001";
  await prisma.treasuryInvestmentBucket.upsert({
    where: { id: invId },
    update: {},
    create: {
      id: invId,
      companyId,
      legalEntityId: companyId,
      name: "Short-term Treasury Portfolio",
      currency: "USD",
      totalAllocated: 30000000,
      currentValue: 30250000,
      availableForInvestment: 5000000,
      strategy: "CONSERVATIVE",
      holdings: [
        { type: "T-Bill", description: "US T-Bill 3mo", amount: 15000000, currency: "USD", purchaseDate: new Date(Date.now() - 60 * 86400000).toISOString(), maturityDate: new Date(Date.now() + 30 * 86400000).toISOString(), yield: 0.043, counterparty: "US Treasury", rating: "AAA" },
        { type: "CP", description: "Commercial Paper", amount: 10000000, currency: "USD", purchaseDate: new Date(Date.now() - 45 * 86400000).toISOString(), maturityDate: new Date(Date.now() + 45 * 86400000).toISOString(), yield: 0.052, counterparty: "Goldman Sachs", rating: "A1+" },
      ],
      maturityProfile: { under30Days: 5000000, under90Days: 15000000, under180Days: 10000000, under365Days: 0, over365Days: 0 },
      restrictions: [],
    },
  });

  // Treasury Policy
  await prisma.treasuryPolicy.upsert({
    where: { id: "seed-tpol-001" },
    update: {},
    create: {
      id: "seed-tpol-001",
      companyId,
      name: "Global Treasury Policy 2026",
      description: "Enterprise-wide treasury policy governing cash management, liquidity, and risk",
      policies: [],
      approvalMatrix: {
        fundingBelow1M: "Treasury Manager",
        fundingBelow10M: "Treasury Director",
        fundingAbove10M: "CFO",
        intercompanyBelow1M: "Treasury Manager",
        intercompanyAbove1M: "Treasury Director",
        investmentBelow5M: "Treasury Director",
        investmentAbove5M: "CIO/CFO",
      },
      reportingSchedule: "Monthly",
      version: 2,
      effectiveFrom: new Date("2026-01-01"),
      effectiveTo: new Date("2026-12-31"),
    },
  });

  // Treasury Snapshot
  await prisma.treasurySnapshot.upsert({
    where: { id: "seed-ss-001" },
    update: {},
    create: {
      id: "seed-ss-001",
      companyId,
      legalEntityId: companyId,
      region: "Global",
      recordedAt: new Date(),
      totalCash: 125000000,
      availableCash: 85000000,
      restrictedCash: 15000000,
      idleCash: 10000000,
      netLiquidity: 85000000,
      workingCapital: { currentAssets: 210000000, currentLiabilities: 95000000, netWorkingCapital: 115000000, currentRatio: 2.21, quickRatio: 1.85, cashConversionCycleDays: 45, accountsReceivable: 78000000, accountsPayable: 52000000, inventory: 42000000, calculatedAt: new Date().toISOString() },
      positionsByCurrency: [
        { currency: "USD", currencyType: "BASE", totalBalance: 85000000, availableBalance: 65000000, restrictedBalance: 5000000, classificationBreakdown: { OPERATING: 50000000, TREASURY: 20000000, RESERVE: 15000000 }, liquidityBreakdown: { IMMEDIATE: 45000000, SAME_DAY: 20000000, SHORT_TERM: 20000000 }, fxExposure: 0, fxExposureDirection: "FLAT", exchangeRateToBase: 1, exchangeRateTimestamp: new Date().toISOString() },
      ],
      liquidityByCategory: { IMMEDIATE: 45000000, SAME_DAY: 20000000, T_PLUS_1: 10000000, SHORT_TERM: 20000000, MEDIUM_TERM: 20000000, LONG_TERM: 10000000 },
      cashByClassification: { OPERATING: 50000000, TREASURY: 20000000, RESERVE: 15000000, INVESTMENT: 25000000, RESTRICTED: 15000000 },
      totalExposure: 5,
      openFundingRequests: 2,
      activePools: 3,
      policyViolations: 0,
      alerts: [
        { id: alertId, companyId, legalEntityId: null, severity: "INFO", category: "FORECAST_DEVIATION", title: "Forecast variance", message: "EUR inflows 8% below forecast", metadata: {}, acknowledged: false, acknowledgedById: null, acknowledgedAt: null, resolved: false, resolvedById: null, resolvedAt: null, createdAt: new Date().toISOString() },
      ],
    },
  });

  console.log("✅ Treasury seed data created successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
