import type { RiskService } from "./services/risk-service";
import type {
  EnterpriseRisk,
  RiskScore,
  MarketRiskData,
  CreditRiskData,
  LiquidityRiskData,
  FXRiskData,
  InterestRateRiskData,
  OperationalRiskData,
  CounterpartyRiskData,
  CountryRiskData,
  ConcentrationRiskData,
  PolicyViolation,
  Recommendation,
  Alert,
  Counterparty,
  BusinessUnit,
  Entity,
  Control,
  StressTest,
  Scenario,
  HistoricalLossEvent,
  Limit,
  Escalation,
  RiskKPI,
  RiskForecast,
  RiskInsight,
  RiskCategory,
  RiskStatus,
  RegisterType,
  Likelihood,
  Impact,
  Velocity,
  ControlEffectiveness,
  HeatLevel,
  Priority,
  ReviewCycle,
  OperationalRiskSubType,
  LimitType,
  ScenarioType,
  ScenarioCategory,
  RiskTrend,
  RiskRegister,
  RiskResponseStrategy,
  ResponseStatus,
  RiskAssessment,
  RiskResponse,
  RiskControl,
  ControlType,
  RiskEvent,
  IncidentStatus,
  RiskIndicator,
  KRIStatus,
  RiskReport,
  ReportType,
  RiskScenario,
  RiskLevel,
} from "./types";

const NOW = new Date();
const DAY = 86400000;

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * DAY);
}

function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * DAY);
}

const CATEGORIES: RiskCategory[] = [
  "market", "credit", "liquidity", "fx", "interest-rate",
  "operational", "counterparty", "country", "concentration",
  "settlement", "funding", "investment", "treasury", "bank",
];

const REGISTER_TYPES: RegisterType[] = [
  "enterprise", "business-unit", "regional", "entity", "bank",
  "investment", "treasury", "operational", "closed", "historical", "emerging",
];

const STATUSES: RiskStatus[] = [
  "identified", "assessed", "mitigated", "monitored", "closed", "historical", "emerging",
];

const LIKELIHOODS: Likelihood[] = [
  "rare", "unlikely", "possible", "likely", "almost-certain",
];
const IMPACTS: Impact[] = [
  "negligible", "minor", "moderate", "major", "severe",
];
const VELOCITIES: Velocity[] = ["slow", "moderate", "fast", "immediate"];
const EFFECTIVENESS: ControlEffectiveness[] = [
  "strong", "satisfactory", "weak", "ineffective", "not-tested",
];
const HEAT_LEVELS: HeatLevel[] = ["extreme", "high", "elevated", "moderate", "low"];
const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];
const REVIEW_CYCLES: ReviewCycle[] = [
  "weekly", "monthly", "quarterly", "semi-annually", "annually",
];
const OPERATIONAL_SUBTYPES: OperationalRiskSubType[] = [
  "human-error", "fraud", "system-failure", "process-failure",
  "compliance-failure", "near-miss", "external-event",
];
const LIMIT_TYPES: LimitType[] = [
  "exposure", "credit", "bank", "issuer", "country",
  "liquidity", "fx", "investment",
];
const SCENARIO_TYPES: ScenarioType[] = [
  "base", "optimistic", "pessimistic", "financial-crisis", "liquidity-crisis",
  "currency-crash", "interest-shock", "bank-failure", "counterparty-default",
  "black-swan", "custom",
];
const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  "revenue-drop", "inflation", "fx-shock", "interest-increase",
  "acquisition", "rapid-growth", "recession", "supply-chain-failure",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function randDecimal(min: number, max: number, decimals = 2): number {
  return round2(Math.random() * (max - min) + min);
}

function heatLevelFromScore(score: number): HeatLevel {
  if (score >= 80) return "extreme";
  if (score >= 60) return "high";
  if (score >= 40) return "elevated";
  if (score >= 20) return "moderate";
  return "low";
}

function priorityFromScore(score: number): Priority {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function generateRiskScore(): RiskScore {
  const likelihoodIdx = LIKELIHOODS.indexOf(pick(LIKELIHOODS));
  const impactIdx = IMPACTS.indexOf(pick(IMPACTS));
  const inherentRisk = round2((likelihoodIdx + 1) / 5 * (impactIdx + 1) / 5 * 100);
  const controlEff = pick(EFFECTIVENESS);
  const controlEffMap: Record<ControlEffectiveness, number> = {
    strong: 0.15, satisfactory: 0.35, weak: 0.55, ineffective: 0.8, "not-tested": 0.65,
  };
  const residualRisk = round2(inherentRisk * controlEffMap[controlEff]);
  const weightedScore = round2(residualRisk * (0.8 + Math.random() * 0.4));

  return {
    likelihood: LIKELIHOODS[likelihoodIdx],
    impact: IMPACTS[impactIdx],
    velocity: pick(VELOCITIES),
    detectability: pick(["high", "medium", "low"] as const),
    controlEffectiveness: controlEff,
    inherentRisk,
    residualRisk,
    weightedScore,
    riskAppetitePercent: randDecimal(40, 150),
    heatLevel: heatLevelFromScore(weightedScore),
  };
}

const RISK_TITLES: Record<RiskCategory, string[]> = {
  market: [
    "Equity portfolio volatility exposure",
    "Fixed income duration risk",
    "Commodity price fluctuation risk",
    "Derivative valuation uncertainty",
    "Market liquidity deterioration",
    "Cross-asset correlation breakdown",
    "Volatility regime shift",
    "Bond spread widening",
    "Equity market correction",
    "Alternative asset valuation risk",
  ],
  credit: [
    "Corporate bond default risk",
    "High-yield portfolio credit spread",
    "Loan portfolio credit quality deterioration",
    "Counterparty credit concentration",
    "SME lending default risk",
    "Mortgage portfolio credit risk",
    "Revolving credit facility utilization",
    "Trade finance credit exposure",
    "Sovereign debt credit risk",
    "Asset-backed security credit risk",
  ],
  liquidity: [
    "Short-term funding gap risk",
    "Liquidity coverage ratio decline",
    "Cash reserve insufficiency",
    "Emergency liquidity facility dependency",
    "Marketable securities haircut risk",
    "Deposit concentration risk",
    "Wholesale funding rollover risk",
    "Intraday liquidity shortfall",
    "Cross-border liquidity transfer restriction",
    "Secured funding market disruption",
  ],
  fx: [
    "EUR/USD position volatility",
    "Emerging market FX exposure",
    "Cross-currency basis risk",
    "FX translation exposure",
    "Unhedged foreign currency receivables",
    "FX swap counterparty risk",
    "Settlement currency mismatch",
    "FX options volatility exposure",
    "Multi-currency cash pool imbalance",
    "Foreign exchange reserve depletion",
  ],
  "interest-rate": [
    "Yield curve flattening exposure",
    "Repricing gap mismatch",
    "Bond portfolio duration extension",
    "Floating rate note basis risk",
    "Mortgage prepayment sensitivity",
    "Swap rate exposure",
    "Short-rate volatility risk",
    "Negative carry on hedge portfolio",
    "Basis risk between benchmarks",
    "Rate shock impact on NIM",
  ],
  operational: [
    "Payment processing system failure",
    "Trade settlement error risk",
    "Internal fraud control weakness",
    "Data integrity breach risk",
    "Business continuity plan gap",
    "Third-party service provider disruption",
    "Regulatory reporting error",
    "Cyber security incident risk",
    "Staff misconduct risk",
    "Model risk management deficiency",
  ],
  counterparty: [
    "Prime broker credit downgrade",
    "Derivative counterparty default",
    "Repo counterparty concentration",
    "Clearing member default risk",
    "OTC derivative bilateral exposure",
    "Securities lending counterparty risk",
    "Margin call dispute risk",
    "Cross-border counterparty legal risk",
    "Central counterparty clearing risk",
    "Settlement bank failure risk",
  ],
  country: [
    "Sovereign debt restructuring risk",
    "Currency convertibility restriction",
    "Capital controls imposition risk",
    "Political instability impact",
    "Regulatory regime change",
    "Trade sanction exposure",
    "Legal system inadequacy risk",
    "Tax regime adverse change",
    "Sovereign rating downgrade",
    "Cross-border dispute resolution risk",
  ],
  concentration: [
    "Sector concentration in energy",
    "Single-name credit concentration",
    "Geographic concentration risk",
    "Product line revenue concentration",
    "Counterparty group concentration",
    "Collateral type concentration",
    "Maturity bucket concentration",
    "Currency concentration in USD",
    "Industry sector overexposure",
    "Funding source concentration",
  ],
  settlement: [
    "T+2 settlement failure risk",
    "Cross-border settlement delay",
    "CLS settlement disruption",
    "Failed trade reconciliation gap",
    "Securities settlement operational risk",
    "FX settlement Herstatt risk",
    "Derivative cash settlement risk",
    "Repo settlement mismatch",
    "Settlement instruction error",
    "Custodian settlement bottleneck",
  ],
  funding: [
    "Short-term debt rollover risk",
    "Commercial paper market access",
    "Loan commitment drawdown risk",
    "Secured funding haircut increase",
    "Deposit outflow acceleration",
    "Interbank funding withdrawal",
    "Contingent funding requirement",
    "Asset encumbrance limit breach",
    "Cross-currency funding mismatch",
    "Emergency funding facility access",
  ],
  investment: [
    "Private equity valuation uncertainty",
    "Hedge fund strategy drift risk",
    "Infrastructure investment illiquidity",
    "Real estate valuation correction",
    "Venture capital concentration risk",
    "ESG compliance investment risk",
    "Alternative investment fee drag",
    "Fund manager style drift",
    "Co-investment commitment risk",
    "Secondary market discount risk",
  ],
  treasury: [
    "Cash position shortfall risk",
    "Treasury system integration failure",
    "Bank account structure inefficiency",
    "Group cash pooling legal risk",
    "Treasury policy compliance gap",
    "Intercompany loan mismatch",
    "Netting settlement error risk",
    "Treasury hedge accounting compliance",
    "Bank relationship concentration",
    "Liquidity stress contingency gap",
  ],
  bank: [
    "Correspondent bank relationship risk",
    "Concentration in top 5 banks",
    "Bank deposit insurance limit breach",
    "Single bank credit limit exceeded",
    "Bank counterparty rating downgrade",
    "Regional bank exposure risk",
    "Bank financial health deterioration",
    "Cross-border bank regulatory risk",
    "Bank service level agreement risk",
    "Bank technology platform dependency",
  ],
};

const RISK_DESCRIPTIONS: Record<string, string[]> = {
  market: [
    "Exposure to adverse movements in equity, fixed income, commodity, and derivative markets.",
    "Risk of loss from changes in market prices, rates, indices, or volatility levels.",
  ],
  credit: [
    "Potential financial loss from counterparty or borrower failure to meet contractual obligations.",
    "Risk of deterioration in credit quality across lending and investment portfolios.",
  ],
  liquidity: [
    "Risk that the organization cannot meet its financial obligations as they fall due.",
    "Risk of being unable to fund asset growth or roll over maturing liabilities.",
  ],
  fx: [
    "Exposure to adverse currency movements affecting financial position and cash flows.",
    "Risk of loss from foreign exchange rate fluctuations on open positions.",
  ],
  "interest-rate": [
    "Sensitivity of earnings and economic value to changes in interest rates.",
    "Risk of loss from adverse interest rate movements affecting the balance sheet.",
  ],
  operational: [
    "Risk of loss from inadequate or failed internal processes, people, systems, or external events.",
    "Operational failure risk spanning people, process, technology, and external factors.",
  ],
  counterparty: [
    "Risk that a counterparty defaults before final settlement of a transaction.",
    "Credit risk on derivative, repo, and securities lending counterparties.",
  ],
  country: [
    "Risk of loss from economic, political, or social events in a foreign country.",
    "Sovereign and cross-border risk including transfer and convertibility restrictions.",
  ],
  concentration: [
    "Risk of loss from concentrated exposures that move together under stress.",
    "Insufficient diversification across sectors, names, geographies, or instruments.",
  ],
  settlement: [
    "Risk that settlement of a transaction does not occur as expected.",
    "Timing and operational risk in the settlement and clearing process.",
  ],
  funding: [
    "Risk that the organization cannot obtain adequate funding to meet obligations.",
    "Structural funding risk from maturity mismatch and market access constraints.",
  ],
  investment: [
    "Risk of loss or underperformance in the investment portfolio.",
    "Valuation, illiquidity, and strategic risk in investment holdings.",
  ],
  treasury: [
    "Risk of treasury operations failure, including cash management and hedging.",
    "Treasury process, system, and policy compliance risk.",
  ],
  bank: [
    "Risk concentration from banking relationships and counterparty exposure.",
    "Risk of loss from bank failure, downgrade, or service disruption.",
  ],
};

function generateRisks(svc: RiskService): void {
  let idCounter = 0;
  for (const category of CATEGORIES) {
    const count = category === "market" || category === "credit" || category === "operational"
      ? 45
      : category === "liquidity" || category === "counterparty" || category === "country"
        ? 40
        : 30;
    const titles = RISK_TITLES[category];
    const descriptions = RISK_DESCRIPTIONS[category];
    for (let i = 0; i < count; i++) {
      idCounter++;
      const score = generateRiskScore();
      const status = pick(STATUSES);
      const risk: EnterpriseRisk = {
        id: `risk_${String(idCounter).padStart(4, "0")}`,
        title: titles[i % titles.length],
        description: descriptions[i % descriptions.length],
        category,
        subCategory: i % 3 === 0 ? `${category}-sub-${(i % 5) + 1}` : undefined,
        status,
        registerType: pick(REGISTER_TYPES),
        score,
        priority: priorityFromScore(score.weightedScore),
        owner: pick(["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel", "Mohamed Ali"]),
        ownerEmail: undefined,
        businessUnit: pick(["Corporate Treasury", "Investment Banking", "Asset Management", "Retail Banking", "Wealth Management"]),
        entityId: `entity_${rand(1, 15)}`,
        region: pick(["North America", "Europe", "Asia Pacific", "Middle East", "Latin America", "Africa"]),
        counterpartyId: i % 4 === 0 ? `cp_${rand(1, 80)}` : undefined,
        bankId: i % 6 === 0 ? `bank_${rand(1, 35)}` : undefined,
        tags: pickN(["critical", "regulatory", "board-report", "audit-finding", "emerging", "cross-border"], rand(2, 4)),
        source: pick(["risk-workshop", "audit-finding", "regulatory-review", "self-assessment", "incident-report"]),
        lastReviewed: daysAgo(rand(10, 180)),
        reviewCycle: pick(REVIEW_CYCLES),
        nextReviewDate: daysFromNow(rand(30, 365)),
        mitigationPlan: i % 3 === 0 ? `Mitigation plan for ${titles[i % titles.length]}` : undefined,
        contingencyPlan: i % 5 === 0 ? `Contingency plan reference: CP-${String(idCounter).padStart(4, "0")}` : undefined,
        notes: i % 7 === 0 ? `Additional notes for risk assessment review cycle.` : undefined,
        createdAt: daysAgo(rand(30, 365)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.register.addRisk(risk);
    }
  }
}

function generateDomainData(svc: RiskService): void {
  const allRisks = svc.register.getAllRisks();
  for (const risk of allRisks) {
    if (risk.category === "market") {
      svc.market.addMarketRiskData({
        riskId: risk.id,
        portfolioExposure: randDecimal(1000000, 500000000),
        dailyPnL: randDecimal(-5000000, 5000000),
        var95: randDecimal(50000, 5000000),
        var99: randDecimal(100000, 10000000),
        expectedShortfall: randDecimal(150000, 15000000),
        volatility: randDecimal(0.05, 0.45),
        sensitivity: randDecimal(-2, 2),
        correlation: randDecimal(-1, 1),
        duration: randDecimal(0.5, 15),
        convexity: randDecimal(-100, 200),
        beta: randDecimal(-0.5, 2),
        sharpeRatio: randDecimal(-1, 3),
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
    if (risk.category === "credit") {
      svc.credit.addCreditData({
        riskId: risk.id,
        creditLimit: randDecimal(1000000, 500000000),
        creditUtilization: randDecimal(0, 450000000),
        exposure: randDecimal(500000, 480000000),
        probabilityOfDefault: randDecimal(0.001, 0.25),
        lossGivenDefault: randDecimal(0.1, 0.9),
        exposureAtDefault: randDecimal(500000, 500000000),
        expectedCreditLoss: randDecimal(10000, 50000000),
        internalRating: pick(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "B+", "B", "CCC", "CC", "C", "D"]),
        externalRating: Math.random() > 0.7 ? pick(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "B+", "B", "CCC"]) : undefined,
        daysPastDue: Math.random() > 0.8 ? rand(1, 180) : undefined,
        collateralValue: Math.random() > 0.5 ? randDecimal(100000, 200000000) : undefined,
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
    if (risk.category === "liquidity") {
      svc.liquidity.addLiquidityData({
        riskId: risk.id,
        liquidityCoverageRatio: randDecimal(80, 250),
        fundingGap: randDecimal(-50000000, 50000000),
        liquidityBuffer: randDecimal(1000000, 200000000),
        emergencyLiquidity: randDecimal(500000, 150000000),
        cashReserve: randDecimal(200000, 100000000),
        refinancingRisk: randDecimal(0.05, 0.45),
        netStableFunding: Math.random() > 0.5 ? randDecimal(80, 150) : undefined,
        loanToDepositRatio: Math.random() > 0.5 ? randDecimal(60, 130) : undefined,
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
    if (risk.category === "fx") {
      svc.market.addFXRiskData({
        riskId: risk.id,
        grossExposure: randDecimal(100000, 200000000),
        netExposure: randDecimal(-100000000, 100000000),
        openPosition: randDecimal(50000, 150000000),
        closedPosition: randDecimal(50000, 100000000),
        naturalHedge: randDecimal(0, 120000000),
        syntheticHedge: randDecimal(0, 80000000),
        fxGainLoss: randDecimal(-5000000, 5000000),
        sensitivity: randDecimal(-0.15, 0.15),
        valueAtRisk: randDecimal(10000, 2000000),
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
    if (risk.category === "interest-rate") {
      svc.market.addInterestRateData({
        riskId: risk.id,
        yieldCurveExposure: randDecimal(500000, 300000000),
        duration: randDecimal(0.5, 20),
        modifiedDuration: randDecimal(0.45, 18.5),
        repricingGap: randDecimal(-100000000, 100000000),
        interestSensitivity: randDecimal(-5000000, 5000000),
        rateShock100bp: randDecimal(-10000000, 5000000),
        rateShock200bp: randDecimal(-20000000, 10000000),
        convexity: randDecimal(-50, 150),
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
    if (risk.category === "operational") {
      svc.operational.addOperationalData({
        riskId: risk.id,
        subType: pick(OPERATIONAL_SUBTYPES),
        operationalLoss: randDecimal(1000, 10000000),
        rootCause: pick(["Inadequate training", "System bug", "Process gap", "Communication failure", "Third-party error"]),
        mitigationPlan: Math.random() > 0.4 ? `Implement additional controls for ${risk.title}` : undefined,
        fraudType: pick(["Internal fraud", "External fraud", "Cyber fraud", "Payment fraud", "None"]),
        systemName: pick(["Payment Engine", "Settlement System", "Treasury Workstation", "Risk Platform", "Accounting System", "CRM", "Trading Platform"]),
        processName: pick(["Payment Processing", "Trade Settlement", "Reconciliation", "Reporting", "Approval Workflow"]),
        isNearMiss: Math.random() > 0.85,
        occurrenceDate: daysAgo(rand(1, 365)),
        resolutionDate: Math.random() > 0.5 ? daysAgo(rand(1, 30)) : undefined,
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
      });
    }
  }
}

function generateCounterparties(svc: RiskService): void {
  const names = [
    "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Citigroup", "Bank of America",
    "Barclays", "Deutsche Bank", "UBS Group", "Credit Suisse", "HSBC Holdings",
    "BNP Paribas", "Societe Generale", "Mitsubishi UFJ", "Sumitomo Mitsui", "Mizuho Financial",
    "ING Group", "Santander", "Lloyds Banking Group", "Standard Chartered", "ICBC",
    "China Construction Bank", "Agricultural Bank of China", "Bank of China", "Wells Fargo",
    "Royal Bank of Canada", "Toronto-Dominion Bank", "Commonwealth Bank", "Westpac",
    "National Australia Bank", "ANZ Bank", "DBS Group", "Oversea-Chinese Banking", "United Overseas Bank",
    "Nomura Holdings", "Daiwa Securities", "MUFG Securities", "RBC Capital Markets",
    "BMO Capital Markets", "CIBC World Markets", "Scotiabank Global Banking",
    "Credit Agricole", "UniCredit", "Intesa Sanpaolo", "Nordea Bank", "Danske Bank",
    "SEB Group", "Swedbank", "DNB ASA", "Erste Group Bank", "Raiffeisen Bank",
    "Commerzbank", "Landesbank Baden-Wuerttemberg", "DZ Bank", "KfW Group",
    "Bank of Montreal", "Canadian Imperial Bank", "National Bank of Canada",
    "Truist Financial", "PNC Financial", "US Bancorp", "Capital One Financial",
    "State Street Corp", "Bank of New York Mellon", "Northern Trust", "Charles Schwab",
    "BlackRock", "Vanguard Group", "Fidelity Investments", "State Street Global",
    "PIMCO", "Bridgewater Associates", "Renaissance Technologies", "Two Sigma Investments",
    "Citadel LLC", "DE Shaw & Co", "Millennium Management", "Point72 Asset Management",
    "AQR Capital Management", "Man Group", "Schroders", "Legal & General",
    "Axa Investment Managers", "Amundi Asset Management", "BNP Paribas Asset Management",
  ];
  const countries = [
    "US", "GB", "DE", "FR", "CH", "JP", "SG", "HK", "CA", "AU",
    "NL", "ES", "IT", "SE", "DK", "NO", "FI", "AT", "BE", "IE",
    "KR", "TW", "IN", "BR", "MX", "ZA", "AE", "SA", "CN", "LU",
  ];
  const ratings = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB"];
  const sectors = [
    "Banking", "Asset Management", "Insurance", "Securities", "Financial Services",
    "Investment Banking", "Wealth Management", "Custody", "Hedge Fund", "Pension Fund",
  ];

  for (let i = 0; i < 80; i++) {
    const cp: Counterparty = {
      id: `cp_${String(i + 1).padStart(3, "0")}`,
      name: names[i],
      type: pick(["bank", "corporate", "government", "fund", "other"] as const),
      rating: pick(ratings),
      creditLimit: randDecimal(10000000, 5000000000),
      utilizedAmount: randDecimal(0, 4000000000),
      countryCode: pick(countries),
      sector: pick(sectors),
      status: pick(["active", "restricted", "suspended", "defaulted"] as const),
      createdAt: daysAgo(rand(90, 730)),
      updatedAt: daysAgo(rand(1, 90)),
    };
    svc.credit.addCounterparty(cp);
  }
}

function generateBusinessUnits(svc: RiskService): void {
  const units = [
    { name: "Corporate Treasury", region: "Global", head: "Sarah Chen", appetite: 85 },
    { name: "Investment Banking", region: "North America", head: "James Miller", appetite: 70 },
    { name: "Asset Management", region: "Europe", head: "Emma Wilson", appetite: 75 },
    { name: "Retail Banking", region: "North America", head: "David Kim", appetite: 90 },
    { name: "Wealth Management", region: "Global", head: "Lisa Patel", appetite: 80 },
    { name: "Global Markets", region: "Europe", head: "Robert Johnson", appetite: 65 },
    { name: "Transaction Banking", region: "Asia Pacific", head: "Maria Garcia", appetite: 85 },
    { name: "Private Banking", region: "Middle East", head: "Ahmed Hassan", appetite: 75 },
    { name: "Digital Banking", region: "Global", head: "Tom Chen", appetite: 70 },
    { name: "Risk Management", region: "Global", head: "Anna Schmidt", appetite: 95 },
    { name: "Compliance", region: "Global", head: "John O'Brien", appetite: 98 },
    { name: "Operations", region: "Global", head: "Priya Sharma", appetite: 85 },
    { name: "Finance", region: "Global", head: "Michael Brown", appetite: 90 },
    { name: "Technology", region: "Global", head: "Alex Wong", appetite: 70 },
    { name: "Human Resources", region: "Global", head: "Rachel Green", appetite: 95 },
    { name: "Legal", region: "Global", head: "William Taylor", appetite: 98 },
    { name: "Internal Audit", region: "Global", head: "Susan Lee", appetite: 99 },
    { name: "Strategy", region: "Global", head: "Mark Anderson", appetite: 65 },
    { name: "Mergers & Acquisitions", region: "Global", head: "Jennifer White", appetite: 55 },
    { name: "Sustainable Finance", region: "Europe", head: "Claire Martin", appetite: 80 },
  ];
  for (const unit of units) {
    const bu: BusinessUnit = {
      id: `bu_${unit.name.toLowerCase().replace(/\s+/g, "_")}`,
      name: unit.name,
      region: unit.region,
      head: unit.head,
      riskAppetite: unit.appetite,
      totalExposure: randDecimal(100000000, 5000000000),
      status: "active",
      createdAt: daysAgo(rand(180, 730)),
      updatedAt: daysAgo(rand(1, 90)),
    };
    svc.register.addBusinessUnit(bu);
  }
}

function generateEntities(svc: RiskService): void {
  const names = [
    "Perionyx Holdings Ltd", "Perionyx Treasury Services Plc", "Perionyx Investment Management Inc",
    "Perionyx Asset Advisors LLC", "Perionyx Capital Partners LP", "Perionyx Securities Corp",
    "Perionyx Digital Finance Ltd", "Perionyx Payments Solutions GmbH", "Perionyx FX Markets SA",
    "Perionyx Trade Finance Ltd", "Perionyx Wealth Advisors Pte Ltd", "Perionyx Risk Analytics Inc",
    "Perionyx Compliance Services LLP", "Perionyx Technology Services Ltd", "Perionyx Advisory Ltd",
  ];
  for (let i = 0; i < 15; i++) {
    const entity: Entity = {
      id: `entity_${i + 1}`,
      name: names[i],
      type: pick(["corporation", "subsidiary", "joint-venture", "fund"] as const),
      region: pick(["North America", "Europe", "Asia Pacific", "Middle East", "Latin America"]),
      industry: pick(["Financial Services", "Technology", "Investment", "Banking", "Advisory"]),
      totalAssets: randDecimal(50000000, 5000000000),
      riskScore: randDecimal(10, 85),
      createdAt: daysAgo(rand(180, 730)),
      updatedAt: daysAgo(rand(1, 90)),
    };
    svc.register.addEntity(entity);
  }
}

function generatePolicyViolations(svc: RiskService): void {
  const violationTitles = [
    "Credit limit exceeded without approval",
    "Late regulatory report submission",
    "Incomplete KYC documentation",
    "Settlement instruction error",
    "Unauthorized trading limit override",
    "Missing audit trail for approval",
    "Policy exception not documented",
    "Control testing overdue",
    "Risk limit breach not escalated",
    "Incomplete due diligence record",
    "Trade confirmation mismatch",
    "System access not revoked on termination",
    "Data retention policy violation",
    "Segregation of duties not maintained",
    "Vendor risk assessment overdue",
  ];
  const allRisks = svc.register.getAllRisks();
  for (let i = 0; i < 150; i++) {
    const risk = allRisks[i % allRisks.length];
    const violation: PolicyViolation = {
      id: `violation_${String(i + 1).padStart(4, "0")}`,
      riskId: i % 4 === 0 ? risk.id : undefined,
      title: pick(violationTitles),
      description: `Policy violation detected during ${pick(["quarterly review", "audit", "automated monitoring", "compliance check", "incident investigation"])}.`,
      policyRef: `POL-${String(rand(100, 999))}`,
      severity: pick(["critical", "high", "medium", "low"] as const),
      status: pick(["compliant", "non-compliant", "pending-review", "under-remediation"] as const),
      detectedAt: daysAgo(rand(1, 180)),
      remediatedAt: Math.random() > 0.5 ? daysAgo(rand(1, 30)) : undefined,
      owner: pick(["John O'Brien", "Anna Schmidt", "William Taylor", "Susan Lee", "Rachel Green"]),
      createdAt: daysAgo(rand(1, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.compliance.addViolation(violation);
  }
}

function generateRecommendations(svc: RiskService): void {
  const recTitles = [
    "Enhance monitoring controls",
    "Implement automated limit checking",
    "Reduce counterparty concentration",
    "Increase hedge coverage",
    "Strengthen business continuity plan",
    "Improve reporting frequency",
    "Deploy real-time risk dashboard",
    "Establish early warning system",
    "Conduct stress testing quarterly",
    "Review risk appetite framework",
    "Enhance data quality controls",
    "Implement workflow automation",
    "Strengthen audit trail",
    "Reduce manual processing",
    "Enhance staff training program",
  ];
  const allRisks = svc.register.getAllRisks();
  for (let i = 0; i < 100; i++) {
    const risk = allRisks[rand(0, allRisks.length - 1)];
    const rec: Recommendation = {
      id: `rec_${String(i + 1).padStart(4, "0")}`,
      riskId: risk.id,
      title: pick(recTitles),
      description: `Recommended action to address ${risk.category} risk: ${risk.title}.`,
      priority: pick(["critical", "high", "medium", "low"] as const),
      status: pick(["open", "in-progress", "implemented", "rejected", "deprecated"] as const),
      owner: pick(["Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel", "Mohamed Ali"]),
      estimatedEffort: pick(["1-2 weeks", "1 month", "2-3 months", "3-6 months", "6-12 months"]),
      expectedImpact: pick(["High reduction in risk score", "Moderate improvement", "Compliance milestone", "Operational efficiency"]),
      createdAt: daysAgo(rand(10, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.register.addRecommendation(rec);
  }
}

function generateAlerts(svc: RiskService): void {
  const alertTitles = [
    "Critical risk limit breached",
    "Counterparty credit downgrade detected",
    "Liquidity ratio below threshold",
    "Market volatility spike detected",
    "Operational incident reported",
    "Policy violation detected",
    "FX exposure exceeds limit",
    "Stress test shows capital gap",
    "Control test failure identified",
    "Regulatory deadline approaching",
    "Concentration limit approaching",
    "Settlement failure detected",
    "Audit finding requires action",
    "Risk appetite limit exceeded",
    "Emerging risk identified",
  ];
  const allRisks = svc.register.getAllRisks();
  for (let i = 0; i < 100; i++) {
    const risk = allRisks[rand(0, allRisks.length - 1)];
    const alert: Alert = {
      id: `alert_${String(i + 1).padStart(4, "0")}`,
      riskId: i % 3 === 0 ? risk.id : undefined,
      title: pick(alertTitles),
      description: `Alert triggered based on ${pick(["automated monitoring", "threshold breach", "risk assessment", "external data feed"])}.`,
      severity: pick(["critical", "high", "medium", "low", "info"] as const),
      status: pick(["active", "acknowledged", "resolved", "dismissed"] as const),
      category: pick(CATEGORIES),
      acknowledgedAt: Math.random() > 0.5 ? daysAgo(rand(1, 14)) : undefined,
      resolvedAt: Math.random() > 0.7 ? daysAgo(rand(1, 14)) : undefined,
      acknowledgedBy: Math.random() > 0.5 ? pick(["Sarah Chen", "James Miller", "Emma Wilson"]) : undefined,
      createdAt: daysAgo(rand(1, 60)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.register.addAlert(alert);
  }
}

function generateControls(svc: RiskService): void {
  const controlNames = [
    "Automated limit monitoring",
    "Daily reconciliation check",
    "Weekly risk report review",
    "Monthly compliance review",
    "Quarterly stress testing",
    "Annual audit review",
    "Real-time transaction monitoring",
    "Segregation of duties check",
    "Dual approval workflow",
    "Exception reporting mechanism",
    "Data quality validation",
    "System access control review",
    "Vendor risk assessment",
    "Business continuity testing",
    "Fraud detection monitoring",
    "KYC/AML screening",
    "Trade confirmation matching",
    "Payment validation gateway",
    "Rate verification process",
    "Document retention audit",
  ];
  const allRisks = svc.register.getAllRisks();
  for (let i = 0; i < 300; i++) {
    const risk = allRisks[rand(0, allRisks.length - 1)];
    const control: Control = {
      id: `ctrl_${String(i + 1).padStart(4, "0")}`,
      riskId: risk.id,
      name: pick(controlNames),
      description: `Control measure designed to ${pick(["prevent", "detect", "mitigate"])} ${risk.category} risk.`,
      type: pick(["preventive", "detective", "corrective", "directive"] as const),
      effectiveness: pick(EFFECTIVENESS),
      owner: pick(["Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel"]),
      lastTested: daysAgo(rand(10, 180)),
      nextTestDate: daysFromNow(rand(30, 365)),
      frequency: pick(REVIEW_CYCLES),
      status: pick(["active", "inactive", "expired", "pending-review"] as const),
      createdAt: daysAgo(rand(90, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.operational.addControl(control);
  }
}

function generateStressTests(svc: RiskService): void {
  const testNames = [
    "Global Financial Crisis Replay",
    "2008 Crisis Scenario",
    "COVID-19 Market Stress",
    "Oil Price Shock Analysis",
    "US-China Trade War Impact",
    "Eurozone Sovereign Crisis",
    "Japan Lost Decade Scenario",
    "Asian Financial Crisis 2.0",
    "Global Recession Simulation",
    "Inflation Shock Analysis",
    "Rapid Rate Hike Scenario",
    "Currency Crisis Simulation",
    "Banking Sector Stress",
    "Liquidity Freeze Scenario",
    "Counterparty Default Chain",
    "Geopolitical Risk Stress",
    "Cyber Attack Impact Analysis",
    "Climate Change Scenario",
    "Regulatory Change Impact",
    "Technology Disruption Risk",
    "Supply Chain Disruption",
    "Labor Market Shock",
    "Commodity Super Cycle",
    "Housing Market Correction",
    "EM Debt Crisis Scenario",
  ];
  for (let i = 0; i < 120; i++) {
    const scenarioType = pick(SCENARIO_TYPES);
    const test: StressTest = {
      id: `stress_${String(i + 1).padStart(4, "0")}`,
      name: testNames[i % testNames.length],
      description: `Stress test scenario simulating ${scenarioType.replace(/-/g, " ")} conditions.`,
      scenarioType,
      parameters: {
        shock_size: randDecimal(-50, 50),
        volatility_multiplier: randDecimal(1, 5),
        recovery_time_months: rand(3, 36),
        correlation_shift: randDecimal(-0.5, 0.5),
        liquidity_haircut: randDecimal(0.05, 0.4),
      },
      results: i % 3 === 0 ? {
        capital_impact: randDecimal(-2e9, 0),
        revenue_impact: randDecimal(-5e8, 0),
        var_impact: randDecimal(0, 5e8),
        lcr_impact: randDecimal(-40, 0),
        pfe_increase: randDecimal(0, 3e8),
        loss_given_stress: randDecimal(1e6, 1e9),
        recovery_rate: randDecimal(0.2, 0.8),
      } : undefined,
      status: pick(["draft", "running", "completed", "failed"] as const),
      performedBy: pick(["Sarah Chen", "James Miller", "Emma Wilson", "Risk Analytics Team", "Stress Testing Unit"]),
      performedAt: i % 3 === 0 ? daysAgo(rand(1, 90)) : undefined,
      notes: Math.random() > 0.6 ? `Scenario assumptions based on ${pick(["historical precedents", "econometric models", "expert judgment", "regulatory guidance"])}.` : undefined,
      createdAt: daysAgo(rand(10, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.stressTesting.addStressTest(test);
  }
}

function generateScenarios(svc: RiskService): void {
  const scenarioNames = [
    "Global Recession Scenario",
    "Stagflation Scenario",
    "Soft Landing Scenario",
    "Hard Landing Scenario",
    "Digital Currency Adoption",
    "ESG Regulation Scenario",
    "AI Disruption in Finance",
    "Demographic Shift Scenario",
    "Trade War Escalation",
    "Pandemic 2.0 Scenario",
    "Climate Transition Stress",
    "Geopolitical Fragmentation",
    "De-dollarization Scenario",
    "CBDC Adoption Scenario",
    "Open Banking Evolution",
    "Crypto Market Maturation",
    "Private Credit Growth",
    "Monetary Policy Normalization",
    "Fiscal Dominance Scenario",
    "Wealth Transfer Scenario",
    "Infrastructure Investment Boom",
    "Green Finance Transition",
    "Regional Integration Scenario",
    "Financial Disintermediation",
    "Basel IV Implementation",
    "IFRS 9 Impact Scenario",
    "Brexit Aftermath Scenario",
    "EM Growth Decoupling",
    "Commodity Super Cycle 2.0",
    "Labor Shortage Scenario",
    "Supply Chain Regionalization",
    "Housing Affordability Crisis",
    "Healthcare Cost Inflation",
    "Education Technology Disruption",
    "Space Economy Scenario",
    "Quantum Computing Risk",
    "Cyber Insurance Market Evolution",
    "Digital Identity Framework",
    "Decentralized Finance Regulation",
    "Tokenization of Assets",
    "Real Estate Market Correction",
    "Infrastructure Rebuilding",
    "Energy Transition Scenario",
    "Water Scarcity Risk",
    "Food Security Scenario",
    "Migration Patterns Shift",
    "Urbanization Acceleration",
    "Remote Work Structural Shift",
    "Gig Economy Regulation",
    "Autonomous Vehicles Impact",
    "AI Regulation Framework",
    "Data Privacy Regulation",
    "Cross-border Data Flow",
    "Digital Tax Harmonization",
    "Wealth Inequality Scenario",
    "Social Unrest Scenario",
    "Democracy Index Decline",
    "Arctic Trade Route Opening",
    "Space Resource Economy",
    "Nuclear Energy Renaissance",
  ];
  for (let i = 0; i < 60; i++) {
    const scenario: Scenario = {
      id: `scenario_${String(i + 1).padStart(3, "0")}`,
      name: scenarioNames[i % scenarioNames.length],
      description: `Strategic scenario modeling ${scenarioNames[i % scenarioNames.length].toLowerCase()} impacts.`,
      category: pick(SCENARIO_CATEGORIES),
      type: pick(SCENARIO_TYPES),
      assumptions: [
        `${pick(["GDP growth", "Inflation", "Interest rates", "Unemployment"])} changes by ${randDecimal(-5, 10)}%`,
        `${pick(["Market volatility", "Credit spreads", "FX rates", "Commodity prices"])} ${pick(["increases", "decreases"])} by ${randDecimal(5, 50)}%`,
        `${pick(["Regulatory environment", "Geopolitical situation", "Technology adoption", "Consumer behavior"])} shifts significantly`,
      ],
      financialImpact: randDecimal(-5000000000, 5000000000),
      probability: randDecimal(0.05, 0.8),
      timeHorizon: pick(["1 year", "2 years", "3 years", "5 years", "10 years"]),
      riskCategories: pickN(CATEGORIES, rand(2, 5)),
      status: pick(["draft", "active", "archived"] as const),
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 60)),
    };
    svc.stressTesting.addScenario(scenario);
  }
}

function generateHistoricalLosses(svc: RiskService): void {
  const lossEvents = [
    { title: "Trading Loss - Equities", desc: "Unauthorized trading activity in equity derivatives desk" },
    { title: "Fraud - Wire Transfer", desc: "Social engineering fraud targeting payment operations" },
    { title: "System Outage - Trading Platform", desc: "Core trading system outage during market hours" },
    { title: "Credit Loss - Corporate Bond", desc: "Default on corporate bond holding in investment portfolio" },
    { title: "FX Loss - Emerging Market", desc: "Adverse FX movement on unhedged EM position" },
    { title: "Settlement Error - Repo Market", desc: "Failed repo settlement resulting in penalty charges" },
    { title: "Operational Error - Trade Confirmation", desc: "Trade confirmation mismatch unresolved for 3 days" },
    { title: "Compliance Penalty - Late Reporting", desc: "Regulatory penalty for late transaction reporting" },
    { title: "Counterparty Default - Derivative", desc: "Bilateral derivative counterparty default on margin call" },
    { title: "Liquidity Shortfall - Intraday", desc: "Intraday liquidity shortfall requiring emergency funding" },
    { title: "Interest Rate Mismatch", desc: "Repricing gap loss during rapid rate change environment" },
    { title: "Concentration Loss - Sector", desc: "Energy sector concentration resulting in significant write-down" },
    { title: "Country Risk - Sovereign Default", desc: "Sovereign debt restructuring impacting bond holdings" },
    { title: "Valuation Dispute - Alternative", desc: "Valuation disagreement on illiquid alternative investment" },
    { title: "Cyber Incident - Ransomware", desc: "Ransomware attack on treasury management system" },
    { title: "Process Failure - Reconciliation", desc: "Unreconciled transactions accumulating over 30 days" },
    { title: "Third-Party Failure - Custodian", desc: "Custodian operational failure delaying settlement" },
    { title: "Model Error - Risk Calculation", desc: "Incorrect VaR calculation due to model parameter error" },
    { title: "Documentation Gap - Trade", desc: "Missing trade documentation for regulatory examination" },
    { title: "Hedge Ineffectiveness", desc: "Hedge accounting disqualification resulting in P&L volatility" },
  ];
  for (const event of lossEvents) {
    const loss: HistoricalLossEvent = {
      id: `loss_${Math.random().toString(36).slice(2, 8)}`,
      title: event.title,
      description: event.desc,
      category: pick(CATEGORIES),
      lossAmount: randDecimal(100000, 50000000),
      currency: "USD",
      eventDate: daysAgo(rand(30, 1095)),
      recoveryAmount: Math.random() > 0.5 ? randDecimal(0, 20000000) : undefined,
      rootCause: pick([
        "Inadequate controls", "System limitation", "Process gap", "Human error",
        "External event", "Third-party failure", "Model limitation",
      ]),
      lessonsLearned: Math.random() > 0.5 ? `Implemented ${pick(["additional controls", "monitoring", "training", "automation"])} to prevent recurrence.` : undefined,
      createdAt: daysAgo(rand(30, 1095)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.stressTesting.addHistoricalLoss(loss);
  }
}

function generateLimits(svc: RiskService): void {
  for (let i = 0; i < 50; i++) {
    const limitType = pick(LIMIT_TYPES);
    const hardLimit = randDecimal(1000000, 500000000);
    const softLimit = hardLimit * randDecimal(0.7, 0.9);
    const utilization = randDecimal(0, hardLimit * 1.2);
    const status: Limit["status"] = utilization > hardLimit ? "breached"
      : utilization > softLimit ? "approaching-limit"
        : utilization > hardLimit * 0.9 ? "at-limit"
          : "within-limit";

    const limit: Limit = {
      id: `limit_${String(i + 1).padStart(3, "0")}`,
      name: `${limitType.charAt(0).toUpperCase() + limitType.slice(1)} Limit ${i + 1}`,
      description: `Limit for ${limitType} risk category.`,
      type: limitType,
      limitValue: hardLimit,
      currentUtilization: round2(utilization),
      threshold: softLimit,
      softLimit,
      hardLimit,
      status,
      owner: pick(["Sarah Chen", "James Miller", "David Kim", "Lisa Patel"]),
      counterpartyId: i % 4 === 0 ? `cp_${rand(1, 80)}` : undefined,
      countryCode: i % 5 === 0 ? pick(["US", "GB", "DE", "FR", "JP", "SG", "CN", "AE"]) : undefined,
      businessUnit: i % 3 === 0 ? pick(["Corporate Treasury", "Investment Banking", "Asset Management"]) : undefined,
      lastEscalatedAt: status === "breached" ? daysAgo(rand(1, 14)) : undefined,
      escalationCount: status === "breached" ? rand(1, 5) : 0,
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.limits.addLimit(limit);
  }
}

function generateEscalations(svc: RiskService): void {
  const breachedLimits = svc.limits.getBreachedLimits();
  for (let i = 0; i < breachedLimits.length && i < 30; i++) {
    const limit = breachedLimits[i];
    const escalation: Escalation = {
      id: `esc_${String(i + 1).padStart(3, "0")}`,
      limitId: limit.id,
      reason: `Limit breached: ${limit.name} at ${limit.currentUtilization} vs hard limit ${limit.hardLimit}`,
      level: pick([1, 2, 3] as const),
      escalatedTo: pick(["Sarah Chen", "James Miller", "CFO Office", "Board Risk Committee", "CEO Office"]),
      escalatedBy: pick(["Risk System", "David Kim", "Lisa Patel", "John O'Brien"]),
      status: pick(["open", "acknowledged", "resolved", "rejected"] as const),
      resolution: Math.random() > 0.6 ? `Limit temporarily increased to ${randDecimal(limit.hardLimit, limit.currentUtilization * 1.2)} pending review.` : undefined,
      resolvedAt: Math.random() > 0.6 ? daysAgo(rand(1, 7)) : undefined,
      createdAt: daysAgo(rand(1, 14)),
      updatedAt: daysAgo(rand(1, 7)),
    };
    svc.limits.addEscalation(escalation);
  }
}

function generateKPIs(svc: RiskService): void {
  const kpiDefs: Array<{ name: string; unit: string; category: RiskCategory }> = [
    { name: "Enterprise Risk Score", unit: "score", category: "market" },
    { name: "Residual Risk Level", unit: "score", category: "market" },
    { name: "Open Risk Count", unit: "count", category: "market" },
    { name: "Critical Risk Count", unit: "count", category: "market" },
    { name: "Average Risk Rating", unit: "score", category: "market" },
    { name: "Control Effectiveness", unit: "percent", category: "operational" },
    { name: "Risk Appetite Utilization", unit: "percent", category: "market" },
    { name: "Policy Violations Open", unit: "count", category: "operational" },
    { name: "VaR 95%", unit: "USD", category: "market" },
    { name: "Expected Shortfall", unit: "USD", category: "market" },
    { name: "Credit Utilization Ratio", unit: "percent", category: "credit" },
    { name: "Liquidity Coverage Ratio", unit: "percent", category: "liquidity" },
    { name: "Net FX Exposure", unit: "USD", category: "fx" },
    { name: "Duration Gap", unit: "years", category: "interest-rate" },
    { name: "Concentration Index", unit: "index", category: "concentration" },
    { name: "Operational Loss YTD", unit: "USD", category: "operational" },
    { name: "Stress Test Pass Rate", unit: "percent", category: "market" },
    { name: "Alert Resolution Time", unit: "hours", category: "operational" },
    { name: "Limit Breaches", unit: "count", category: "market" },
    { name: "Escalation Response Time", unit: "hours", category: "operational" },
  ];
  for (const def of kpiDefs) {
    const kpi: RiskKPI = {
      id: `kpi_${def.name.toLowerCase().replace(/\s+/g, "_")}`,
      name: def.name,
      value: randDecimal(0, 100),
      previousValue: randDecimal(0, 100),
      target: randDecimal(50, 100),
      unit: def.unit,
      category: def.category,
      trend: pick(["up", "down", "stable"] as const),
      status: pick(["good", "warning", "critical"] as const),
      date: NOW,
    };
    svc.analytics.addKPI(kpi);
  }
}

function generateForecasts(svc: RiskService): void {
  const allRisks = svc.register.getAllRisks();
  for (let i = 0; i < 40; i++) {
    const risk = allRisks[rand(0, allRisks.length - 1)];
    const forecast: RiskForecast = {
      id: `forecast_${String(i + 1).padStart(4, "0")}`,
      riskId: risk.id,
      category: risk.category,
      metric: pick(["risk_score", "exposure", "probability", "loss_given_default", "var", "liquidity_gap", "fx_exposure"]),
      period: pick(["1M", "3M", "6M", "1Y", "2Y"]),
      currentValue: randDecimal(0, 100),
      forecastValue: randDecimal(0, 100),
      lowerBound: randDecimal(-20, 0),
      upperBound: randDecimal(0, 20),
      confidence: randDecimal(0.6, 0.95),
      trend: pick(["increasing", "decreasing", "stable"] as const),
      date: NOW,
    };
    svc.analytics.addForecast(forecast);
  }
}

function generateInsights(svc: RiskService): void {
  const insightData: Array<{ type: RiskInsight["type"]; title: string }> = [
    { type: "early-warning", title: "Credit risk concentration approaching threshold" },
    { type: "early-warning", title: "Liquidity coverage ratio trending below target" },
    { type: "trend", title: "Market risk metrics showing increased volatility" },
    { type: "trend", title: "Operational loss frequency increasing quarter-over-quarter" },
    { type: "anomaly", title: "Unusual FX position detected in Asian trading session" },
    { type: "anomaly", title: "Counterparty credit utilization spike detected" },
    { type: "recommendation", title: "Increase hedge coverage on emerging market exposure" },
    { type: "recommendation", title: "Review counterparty credit limits for top 10 exposures" },
    { type: "summary", title: "Weekly risk summary: 3 new critical risks identified" },
    { type: "summary", title: "Monthly risk report: Risk score stable, 2 breaches resolved" },
  ];
  const allRisks = svc.register.getAllRisks();
  for (const data of insightData) {
    const insight: RiskInsight = {
      id: `insight_${Math.random().toString(36).slice(2, 8)}`,
      type: data.type,
      title: data.title,
      description: `AI-generated ${data.type} based on analysis of ${pick(["recent risk data", "historical patterns", "market conditions", "control effectiveness"])}.`,
      severity: pick(["critical", "high", "medium", "low", "info"] as const),
      category: pick(CATEGORIES),
      relatedRiskId: Math.random() > 0.4 ? allRisks[rand(0, allRisks.length - 1)].id : undefined,
      metadata: {
        confidence: randDecimal(0.6, 0.98),
        dataPoints: rand(10, 1000),
        generatedBy: "risk-analytics-engine",
      },
      createdAt: daysAgo(rand(0, 7)),
    };
    svc.analytics.addInsight(insight);
  }
}

export function seedRiskData(svc: RiskService): void {
  console.log("Seeding risk data...");
  generateRisks(svc);
  console.log(`  ${svc.register.getAllRisks().length} risks created`);

  generateDomainData(svc);
  console.log("  Domain-specific risk data created");

  generateCounterparties(svc);
  console.log(`  ${svc.credit.getAllCounterparties().length} counterparties created`);

  generateBusinessUnits(svc);
  console.log(`  ${svc.register.getAllBusinessUnits().length} business units created`);

  generateEntities(svc);
  console.log(`  ${svc.register.getAllEntities().length} entities created`);

  generatePolicyViolations(svc);
  console.log(`  ${svc.compliance.getAllViolations().length} policy violations created`);

  generateRecommendations(svc);
  console.log(`  ${svc.register.getAllRecommendations().length} recommendations created`);

  generateAlerts(svc);
  console.log(`  ${svc.register.getAllAlerts().length} alerts created`);

  generateControls(svc);
  console.log(`  ${svc.operational.getAllControls().length} controls created`);

  generateStressTests(svc);
  console.log(`  ${svc.stressTesting.getAllStressTests().length} stress tests created`);

  generateScenarios(svc);
  console.log(`  ${svc.stressTesting.getAllScenarios().length} scenarios created`);

  generateHistoricalLosses(svc);
  console.log(`  ${svc.stressTesting.getAllHistoricalLosses().length} historical loss events created`);

  generateLimits(svc);
  console.log(`  ${svc.limits.getAllLimits().length} limits created`);

  generateEscalations(svc);
  console.log(`  ${svc.limits.getAllEscalations().length} escalations created`);

  generateKPIs(svc);
  console.log(`  ${svc.analytics.getAllKPIs().length} KPIs created`);

  generateForecasts(svc);
  console.log(`  ${svc.analytics.getAllForecasts().length} forecasts created`);

  generateInsights(svc);
  console.log(`  ${svc.analytics.getAllInsights().length} insights created`);

  generateRiskRegister(svc);
  console.log(`  ${svc.riskRegister.count()} risk register entries created`);
  generateRiskAssessments(svc);
  console.log(`  ${svc.riskAssessment.count()} assessments created`);
  generateRiskResponses(svc);
  console.log(`  ${svc.riskResponse.count()} responses created`);
  generateRiskControls(svc);
  console.log(`  ${svc.riskControl.count()} controls created`);
  generateRiskIncidents(svc);
  console.log(`  ${svc.riskIncident.count()} incidents created`);
  generateRiskIndicators(svc);
  console.log(`  ${svc.riskIndicator.count()} KRIs created`);
  generateRiskReports(svc);
  console.log(`  ${svc.riskReport.count()} reports created`);
  generateRiskScenarios(svc);
  console.log(`  ${svc.riskScenario.count()} scenarios created`);
  generateRiskHeatmap(svc);
  console.log(`  ${svc.riskHeatmap.count()} heatmaps created`);
  generateRiskKPIs(svc);
  console.log(`  ${svc.riskAnalytics.countKPIs()} KPI items created`);
  generateRiskAlerts(svc);
  console.log(`  ${svc.riskAnalytics.countAlerts()} alerts created`);
  generateRiskRecommendations(svc);
  console.log(`  ${svc.riskAnalytics.countRecommendations()} recommendations created`);
  console.log("Risk seed data complete.");
}

function generateRiskRegister(svc: RiskService): void {
  const registerTitles: Array<{ title: string; category: RiskCategory }> = [
    { title: "Interest Rate Volatility Exposure", category: "interest-rate" },
    { title: "Corporate Credit Portfolio Deterioration", category: "credit" },
    { title: "Liquidity Coverage Ratio Deficiency", category: "liquidity" },
    { title: "EUR/USD FX Position Risk", category: "fx" },
    { title: "Equity Market Correction Impact", category: "market" },
    { title: "Payment Processing System Failure", category: "operational" },
    { title: "Derivative Counterparty Default Risk", category: "counterparty" },
    { title: "Sovereign Debt Exposure - Emerging Markets", category: "country" },
    { title: "Single Name Credit Concentration", category: "concentration" },
    { title: "T+2 Settlement Failure Risk", category: "settlement" },
    { title: "Short-term Debt Rollover Risk", category: "funding" },
    { title: "Private Equity Valuation Uncertainty", category: "investment" },
    { title: "Cross-border Cash Pooling Legal Risk", category: "treasury" },
    { title: "Correspondent Bank Relationship Risk", category: "bank" },
    { title: "Operational Fraud Risk in Payment Operations", category: "operational" },
    { title: "Technology System Failure - Treasury Systems", category: "operational" },
    { title: "Third-party Service Provider Disruption", category: "operational" },
    { title: "Regulatory Compliance Gap - MiFID II", category: "operational" },
    { title: "ESG Related Reputational Risk", category: "market" },
    { title: "Strategic Risk - New Market Entry", category: "market" },
  ];
  const statuses: RiskStatus[] = ["identified", "assessed", "mitigated", "monitored", "closed", "emerging"];
  const levels: RiskLevel[] = ["low", "medium", "high", "critical"];
  const trends: RiskTrend[] = ["improving", "stable", "deteriorating"];
  const owners = ["Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel", "Mohamed Ali", "Anna Schmidt"];
  const departments = ["Treasury", "Risk Management", "Finance", "Operations", "Compliance", "Internal Audit", "Investment"];
  for (let i = 0; i < 20; i++) {
    const entry = registerTitles[i % registerTitles.length];
    const risk: RiskRegister = {
      id: `rr_${String(i + 1).padStart(3, "0")}`,
      title: entry.title,
      description: `Enterprise risk assessment for ${entry.title}. Mitigation strategies under review.`,
      category: entry.category,
      riskLevel: pick(levels),
      status: pick(statuses),
      owner: pick(owners),
      department: pick(departments),
      businessUnit: i % 3 === 0 ? pick(["Corporate Treasury", "Investment Banking", "Asset Management"]) : undefined,
      dateIdentified: daysAgo(rand(30, 365)),
      lastReviewed: daysAgo(rand(1, 90)),
      targetDate: i % 2 === 0 ? daysFromNow(rand(30, 180)) : undefined,
      closureDate: i % 4 === 0 ? daysAgo(rand(1, 30)) : undefined,
      trend: pick(trends),
      companyId: "default",
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskRegister.add(risk);
  }
}

function generateRiskAssessments(svc: RiskService): void {
  const entries = svc.riskRegister.getAll();
  const assessors = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel", "Anna Schmidt"];
  const methodologies = ["Bow-tie Analysis", "HAZOP", "SWIFT", "FMEA", "What-If Analysis", "Risk Matrix", "Monte Carlo"];
  for (const entry of entries) {
    const inherentL = rand(1, 5);
    const inherentI = rand(1, 5);
    const residualL = Math.max(1, inherentL - rand(0, 2));
    const residualI = Math.max(1, inherentI - rand(0, 2));
    const assessment: RiskAssessment = {
      id: `ra_${entry.id}`,
      registerId: entry.id,
      inherentLikelihood: inherentL,
      inherentImpact: inherentI,
      inherentScore: svc.riskAssessment.computeInherentScore(inherentL, inherentI),
      residualLikelihood: residualL,
      residualImpact: residualI,
      residualScore: svc.riskAssessment.computeResidualScore(residualL, residualI),
      assessmentDate: daysAgo(rand(1, 90)),
      assessedBy: pick(assessors),
      methodology: pick(methodologies),
      companyId: "default",
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskAssessment.add(assessment);
  }
}

function generateRiskResponses(svc: RiskService): void {
  const entries = svc.riskRegister.getAll();
  const strategies: RiskResponseStrategy[] = ["avoid", "reduce", "transfer", "accept", "escalate"];
  const parties = ["Risk Owner", "Department Head", "Risk Committee", "Board of Directors", "Internal Audit", "External Consultant"];
  const statuses: ResponseStatus[] = ["planned", "in-progress", "completed", "overdue"];
  for (const entry of entries) {
    const strategy = pick(strategies);
    const response: RiskResponse = {
      id: `resp_${entry.id}`,
      registerId: entry.id,
      strategy,
      description: `Response strategy: ${strategy} approach for "${entry.title}". Controls and monitoring plan implemented.`,
      responsibleParty: pick(parties),
      timeline: daysFromNow(rand(30, 365)),
      cost: strategy === "transfer" ? randDecimal(10000, 500000) : undefined,
      status: pick(statuses),
      effectiveness: pick(["strong", "satisfactory", "weak", "ineffective", "not-tested"] as const),
      companyId: "default",
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskResponse.add(response);
  }
}

function generateRiskControls(svc: RiskService): void {
  const controlNames = [
    "Automated Transaction Monitoring",
    "Dual Approval Workflow",
    "Daily Reconciliation Check",
    "Weekly Risk Limit Review",
    "Monthly Compliance Audit",
    "Quarterly Stress Testing",
    "Real-time Position Tracking",
    "Segregation of Duties Control",
    "Exception Reporting System",
    "Data Quality Validation",
    "System Access Control Review",
    "Vendor Risk Assessment",
    "Business Continuity Testing",
    "Fraud Detection Algorithm",
    "KYC/AML Screening System",
  ];
  const entries = svc.riskRegister.getAll();
  const cTypes: ControlType[] = ["preventive", "detective", "corrective", "directive"];
  const effs: ControlEffectiveness[] = ["strong", "satisfactory", "weak", "ineffective", "not-tested"];
  const freqs = ["Daily", "Weekly", "Monthly", "Quarterly", "Annually", "Continuous"];
  for (let i = 0; i < 25; i++) {
    const entry = entries[i % entries.length];
    const control: RiskControl = {
      id: `rc_${String(i + 1).padStart(3, "0")}`,
      registerId: entry.id,
      name: pick(controlNames),
      description: `Control measure for ${entry.title}. Designed to ${pick(["prevent", "detect", "correct"])} risk events.`,
      type: pick(cTypes),
      owner: pick(["Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Lisa Patel"]),
      frequency: pick(freqs),
      effectiveness: pick(effs),
      lastTested: i % 3 === 0 ? daysAgo(rand(10, 180)) : undefined,
      nextTestDate: i % 2 === 0 ? daysFromNow(rand(30, 365)) : undefined,
      companyId: "default",
      createdAt: daysAgo(rand(90, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskControl.add(control);
  }
}

function generateRiskIncidents(svc: RiskService): void {
  const incidentTitles = [
    "Unauthorized Trading Activity Detected",
    "Payment Processing System Outage",
    "Trade Settlement Error - Repo Market",
    "Social Engineering Fraud Attempt",
    "Data Breach - Customer Information",
    "Regulatory Reporting Deadline Missed",
    "Counterparty Margin Call Dispute",
    "FX Settlement Herstatt Risk Event",
    "Business Continuity Plan Activation",
    "Model Risk Parameter Error",
  ];
  const entries = svc.riskRegister.getAll();
  const statuses: IncidentStatus[] = ["open", "investigating", "resolved", "closed"];
  for (let i = 0; i < 10; i++) {
    const entry = entries[i % entries.length];
    const incident: RiskEvent = {
      id: `inc_${String(i + 1).padStart(3, "0")}`,
      registerId: i % 2 === 0 ? entry.id : undefined,
      title: incidentTitles[i],
      description: `Incident report: ${incidentTitles[i]}. Investigation and remediation in progress.`,
      date: daysAgo(rand(1, 90)),
      impact: pick(["Financial loss of $50K-$500K", "Reputational damage", "Regulatory penalty", "Operational disruption", "Client impact"]),
      response: pick(["Immediate containment applied", "Root cause analysis completed", "Compensating controls activated", "Incident team mobilized"]),
      lessons: pick(["Enhance monitoring frequency", "Improve staff training", "Implement additional controls", "Update incident response plan"]),
      status: pick(statuses),
      companyId: "default",
      createdAt: daysAgo(rand(1, 90)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.riskIncident.add(incident);
  }
}

function generateRiskIndicators(svc: RiskService): void {
  const kriDefs: Array<{ name: string; desc: string; category: RiskCategory }> = [
    { name: "Value at Risk (VaR) 95%", desc: "Daily VaR at 95% confidence level", category: "market" },
    { name: "Credit Utilization Ratio", desc: "Percentage of credit limit utilized", category: "credit" },
    { name: "Liquidity Coverage Ratio", desc: "High-quality liquid assets / net cash outflows", category: "liquidity" },
    { name: "Net FX Open Position", desc: "Aggregate net foreign exchange exposure", category: "fx" },
    { name: "Interest Rate Gap", desc: "Repricing gap within 12 months", category: "interest-rate" },
    { name: "Operational Loss Events", desc: "Number of operational loss events YTD", category: "operational" },
    { name: "Counterparty Default Rate", desc: "Percentage of counterparties in default", category: "counterparty" },
    { name: "Sovereign Exposure Ratio", desc: "Exposure to sovereign debt as % of capital", category: "country" },
    { name: "Concentration Index", desc: "Herfindahl-Hirschman Index for credit portfolio", category: "concentration" },
    { name: "Settlement Failure Rate", desc: "Percentage of trades failing settlement", category: "settlement" },
    { name: "Funding Gap Ratio", desc: "Short-term funding gap as % of total funding", category: "funding" },
    { name: "Portfolio Volatility", desc: "Annualized volatility of investment portfolio", category: "investment" },
    { name: "Cash Position Accuracy", desc: "Percentage of accurate cash position reports", category: "treasury" },
    { name: "Bank Credit Rating", desc: "Weighted average credit rating of bank counterparties", category: "bank" },
    { name: "Fraud Detection Rate", desc: "Percentage of fraudulent transactions detected", category: "operational" },
  ];
  const owners = ["Sarah Chen", "James Miller", "Emma Wilson", "David Kim", "Risk Analytics Team"];
  const freqs = ["Daily", "Weekly", "Monthly", "Quarterly"];
  for (let i = 0; i < 15; i++) {
    const def = kriDefs[i];
    const threshold = randDecimal(80, 200);
    const warningThreshold = threshold * 0.75;
    const value = randDecimal(0, threshold * 1.2);
    const status: KRIStatus = value >= threshold ? "breach" : value >= warningThreshold ? "warning" : "normal";
    const kri: RiskIndicator = {
      id: `kri_${String(i + 1).padStart(3, "0")}`,
      name: def.name,
      description: def.desc,
      category: def.category,
      value: Math.round(value * 100) / 100,
      threshold: Math.round(threshold * 100) / 100,
      warningThreshold: Math.round(warningThreshold * 100) / 100,
      status,
      frequency: pick(freqs),
      owner: pick(owners),
      companyId: "default",
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskIndicator.add(kri);
  }
}

function generateRiskReports(svc: RiskService): void {
  const reportDefs: Array<{ title: string; type: ReportType; period: string }> = [
    { title: "Enterprise Risk Dashboard", type: "dashboard", period: "Q1 2026" },
    { title: "Monthly Risk Summary", type: "summary", period: "2026-06" },
    { title: "Detailed Risk Assessment Report", type: "detailed", period: "2026-06" },
    { title: "Regulatory Capital Adequacy Report", type: "regulatory", period: "2026-Q2" },
    { title: "Operational Risk Loss Report", type: "detailed", period: "2026-H1" },
  ];
  for (let i = 0; i < 5; i++) {
    const def = reportDefs[i];
    const report: RiskReport = {
      id: `rpt_${String(i + 1).padStart(3, "0")}`,
      title: def.title,
      type: def.type,
      period: def.period,
      generatedAt: daysAgo(rand(1, 30)),
      section: JSON.stringify({
        summary: `Executive summary for ${def.title}`,
        riskCount: rand(10, 50),
        criticalCount: rand(1, 10),
        controlEffectiveness: randDecimal(60, 95),
        recommendations: rand(3, 15),
      }),
      companyId: "default",
      createdAt: daysAgo(rand(30, 90)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.riskReport.add(report);
  }
}

function generateRiskScenarios(svc: RiskService): void {
  const scenarioDefs: Array<{ name: string; desc: string; category: RiskCategory }> = [
    { name: "Global Recession Scenario", desc: "Prolonged global economic downturn with 3-year recovery horizon", category: "market" },
    { name: "Credit Crunch Scenario", desc: "Systematic credit tightening across banking sector", category: "credit" },
    { name: "Liquidity Freeze Scenario", desc: "Complete freeze of interbank lending markets", category: "liquidity" },
    { name: "Currency Crisis Scenario", desc: "Major currency devaluation event across emerging markets", category: "fx" },
    { name: "Cyber Attack Scenario", desc: "Coordinated cyber attack on financial infrastructure", category: "operational" },
  ];
  for (let i = 0; i < 5; i++) {
    const def = scenarioDefs[i];
    const scenario: RiskScenario = {
      id: `scen_${String(i + 1).padStart(3, "0")}`,
      name: def.name,
      description: def.desc,
      category: def.category,
      likelihood: randDecimal(0.1, 0.8),
      impact: randDecimal(5000000, 500000000),
      stressFactors: JSON.stringify({
        factors: [pick(["inflation", "interest_rates", "unemployment", "market_volatility", "credit_spreads"]), pick(["GDP_contraction", "currency_depreciation", "capital_outflow", "trade_disruption"])],
        timeHorizon: pick(["6 months", "1 year", "2 years", "3 years"]),
        severity: pick(["moderate", "severe", "extreme"]),
      }),
      companyId: "default",
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.riskScenario.add(scenario);
  }
}

function generateRiskHeatmap(svc: RiskService): void {
  const entries = svc.riskRegister.getAll();
  const heatmap = svc.riskHeatmap.buildHeatmap(
    entries.map(e => ({ category: e.category, riskLevel: e.riskLevel })),
    "2026-Q2",
  );
  svc.riskHeatmap.add(heatmap);
}

function generateRiskKPIs(svc: RiskService): void {
  const kpiDefs = [
    { name: "Enterprise Risk Score", value: randDecimal(25, 75), prev: randDecimal(20, 70), target: 50, unit: "score", category: "overall" },
    { name: "Open Risk Resolution Rate", value: randDecimal(60, 95), prev: randDecimal(55, 90), target: 90, unit: "%", category: "overall" },
    { name: "Control Effectiveness", value: randDecimal(50, 90), prev: randDecimal(45, 85), target: 85, unit: "%", category: "operational" },
    { name: "Risk Appetite Utilization", value: randDecimal(40, 120), prev: randDecimal(35, 115), target: 100, unit: "%", category: "overall" },
    { name: "Incident Response Time", value: randDecimal(2, 48), prev: randDecimal(4, 72), target: 24, unit: "hours", category: "operational" },
  ];
  for (const def of kpiDefs) {
    const trend = def.value < def.prev ? "up" as const : "down" as const;
    const status = def.category === "overall" && def.name === "Risk Appetite Utilization"
      ? (def.value > 100 ? "critical" as const : def.value > 85 ? "warning" as const : "good" as const)
      : (def.value >= def.target * 0.8 ? "good" as const : def.value >= def.target * 0.6 ? "warning" as const : "critical" as const);
    svc.riskAnalytics.addKPI({
      name: def.name,
      value: Math.round(def.value * 100) / 100,
      previousValue: Math.round(def.prev * 100) / 100,
      target: def.target,
      unit: def.unit,
      category: def.category,
      trend,
      status,
    });
  }
}

function generateRiskAlerts(svc: RiskService): void {
  const alertDefs = [
    { severity: "critical" as const, type: "limit-breach", title: "Credit Limit Breached", message: "Counterparty credit utilization exceeds approved limit by 15%." },
    { severity: "warning" as const, type: "threshold", title: "LCR Approaching Minimum", message: "Liquidity Coverage Ratio at 102%, approaching regulatory minimum of 100%." },
    { severity: "critical" as const, type: "incident", title: "Active Security Incident", message: "Unauthorized access attempt detected on treasury management system." },
    { severity: "warning" as const, type: "compliance", title: "Regulatory Filing Deadline Approaching", message: "MiFID II transaction reporting due in 3 business days." },
    { severity: "info" as const, type: "review", title: "Risk Assessment Overdue", message: "5 risk register entries have not been reviewed in over 90 days." },
  ];
  for (let i = 0; i < 5; i++) {
    const def = alertDefs[i];
    svc.riskAnalytics.addAlert({
      id: `ralert_${String(i + 1).padStart(3, "0")}`,
      severity: def.severity,
      type: def.type,
      title: def.title,
      message: def.message,
      actionRequired: def.severity === "critical",
      dismissed: false,
      companyId: "default",
      createdAt: daysAgo(rand(0, 14)),
    });
  }
}

function generateRiskRecommendations(svc: RiskService): void {
  const recDefs = [
    { type: "control-enhancement", title: "Strengthen Monitoring Controls", description: "Implement real-time monitoring for all critical risk limits.", impact: "High", confidence: 0.85 },
    { type: "process-improvement", title: "Automate Risk Assessment Workflow", description: "Replace manual quarterly assessments with continuous automated evaluation.", impact: "Medium", confidence: 0.72 },
    { type: "risk-transfer", title: "Review Insurance Coverage", description: "Evaluate cyber risk insurance policy limits and coverage gaps.", impact: "Medium", confidence: 0.68 },
    { type: "policy-update", title: "Update Risk Appetite Framework", description: "Align risk appetite thresholds with current market conditions and regulatory expectations.", impact: "High", confidence: 0.91 },
    { type: "training", title: "Conduct Risk Awareness Training", description: "Mandatory risk management training for all treasury and finance staff.", impact: "Low", confidence: 0.55 },
  ];
  for (let i = 0; i < 5; i++) {
    const def = recDefs[i];
    svc.riskAnalytics.addRecommendation({
      id: `rrec_${String(i + 1).padStart(3, "0")}`,
      type: def.type,
      title: def.title,
      description: def.description,
      impact: def.impact,
      confidence: def.confidence,
      companyId: "default",
      implemented: false,
      createdAt: daysAgo(rand(1, 30)),
    });
  }
}
