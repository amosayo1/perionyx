import type { FPAService } from "./services/fpa-service";
import type {
  FPABudget, FPABudgetItem,
  FPAForecast, FPAForecastItem,
  VarianceRecord,
  FPAScenario, ScenarioImpact,
  RevenuePlan,
  ExpensePlan,
  WorkforcePlan,
  CapitalPlan,
  CostCenter,
  ProfitCenter,
  FPAAllocation,
  FPAKPI, FPAScorecard,
  FPAAlert,
  FPARecommendation,
  PlanningTrend,
  ForecastRevision,
  Forecast, ForecastLineItem,
  BudgetType, ScenarioType, ForecastScenario, ForecastMethod, VarianceType,
  RollingForecastWindow, RevenueDriver, ExpenseCategory, WorkforceCategory,
  CapitalCategory, AllocationMethod, AlertSeverity, PlanningCurrency,
} from "./types";

const NOW = new Date();
const DAY = 86400000;

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * DAY);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const COMPANY_IDS = ["co_fpa_001", "co_fpa_002", "co_fpa_003", "co_fpa_004", "co_fpa_005",
  "co_fpa_006", "co_fpa_007", "co_fpa_008", "co_fpa_009", "co_fpa_010",
  "co_fpa_011", "co_fpa_012", "co_fpa_013", "co_fpa_014", "co_fpa_015",
  "co_fpa_016", "co_fpa_017", "co_fpa_018", "co_fpa_019", "co_fpa_020",
  "co_fpa_021", "co_fpa_022", "co_fpa_023", "co_fpa_024", "co_fpa_025"];

const ENTITY_IDS = ["ent_001", "ent_002", "ent_003", "ent_004", "ent_005",
  "ent_006", "ent_007", "ent_008", "ent_009", "ent_010",
  "ent_011", "ent_012", "ent_013", "ent_014", "ent_015",
  "ent_016", "ent_017", "ent_018", "ent_019", "ent_020",
  "ent_021", "ent_022", "ent_023", "ent_024", "ent_025"];

const REGIONS = ["North America", "EMEA", "APAC", "Latin America", "Middle East & Africa",
  "Nordics", "Benelux", "DACH", "Southern Europe", "Southeast Asia",
  "Greater China", "Australia & NZ"];

const BUSINESS_UNITS: string[] = [];
for (let i = 1; i <= 60; i++) {
  BUSINESS_UNITS.push(`BU-${String(i).padStart(3, "0")}`);
}

const DEPARTMENTS_NAMES = [
  "Engineering", "Sales", "Marketing", "Finance", "Operations",
  "Human Resources", "Legal", "Compliance", "Risk Management",
  "Product Management", "Design", "Customer Success", "Support",
  "Data Science", "Research & Development", "Information Security",
  "Internal Audit", "Treasury", "Corporate Development",
  "Supply Chain", "Procurement", "Manufacturing", "Quality Assurance",
  "Business Intelligence", "Strategy", "Communications", "Facilities",
  "Learning & Development", "Corporate Communications",
  "Investor Relations", "Mergers & Acquisitions", "Tax",
  "Financial Planning & Analysis", "Corporate Accounting",
  "Revenue Accounting", "Payroll", "Accounts Payable",
  "Accounts Receivable", "Credit & Collections", "Fixed Assets",
  "Budgeting", "Forecasting", "Cost Accounting", "Transfer Pricing",
  "Internal Controls", "Enterprise Risk", "Regulatory Affairs",
  "Sustainability", "Diversity & Inclusion", "Brand Marketing",
  "Performance Marketing", "Content Marketing", "Product Marketing",
  "Demand Generation", "Sales Operations", "Sales Development",
  "Account Management", "Partner Management", "Channel Sales",
  "Direct Sales", "Field Marketing", "Events", "Web Development",
  "Mobile Development", "Cloud Infrastructure", "DevOps",
  "QA Engineering", "Security Engineering", "Network Operations",
  "Database Administration", "IT Support", "Enterprise Architecture",
  "Data Engineering", "Analytics Engineering", "Machine Learning",
  "AI Research", "User Research", "Customer Insights", "Service Delivery",
];

const FISCAL_YEARS = [2024, 2025, 2026];
const PERIODS: string[] = [];
for (const fy of FISCAL_YEARS) {
  for (let m = 1; m <= 12; m++) {
    PERIODS.push(`${fy}-${String(m).padStart(2, "0")}`);
  }
  PERIODS.push(`${fy}-Q1`, `${fy}-Q2`, `${fy}-Q3`, `${fy}-Q4`);
  PERIODS.push(`${fy}-annual`);
}

const USERS = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson",
  "Lisa Patel", "Michael Brown", "Jennifer Lee", "David Kim",
  "Maria Garcia", "Robert Taylor"];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "SGD", "HKD", "SEK"];

const ACCOUNT_NAMES = [
  "Software Licenses", "SaaS Subscriptions", "Professional Services",
  "Hardware Sales", "Consulting Services", "Support & Maintenance",
  "Interest Income", "Foreign Exchange Gains",
  "Direct Labor", "Direct Materials", "Overhead",
  "Executive Salaries", "Staff Salaries", "Bonuses", "Payroll Taxes", "Benefits",
  "Legal Fees", "Audit & Accounting", "Consulting Fees",
  "Software Licenses - IT", "Cloud Infrastructure", "Hardware & Equipment",
  "Rent", "Utilities", "Office Supplies", "Insurance",
  "Travel & Entertainment", "Advertising", "Events & Sponsorships",
  "Sales Commissions", "Depreciation & Amortization",
  "Research & Development", "Foreign Exchange Losses",
  "Interest Expense", "Tax Expense",
];

function generateBudgets(svc: FPAService): void {
  const budgetTypes: BudgetType[] = ["master", "operating", "capital", "cash", "sales",
    "expense", "department", "project", "investment", "treasury", "scenario"];
  let budgetCounter = 0;

  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const numBudgetsForCo = rand(1, 2);
      for (let b = 0; b < numBudgetsForCo; b++) {
        budgetCounter++;
        const budgetId = `fpa_budget_${String(budgetCounter).padStart(5, "0")}`;
        const type = pick(budgetTypes);
        const itemCount = rand(3, 8);
        const items: FPABudgetItem[] = [];
        let totalAmount = 0;

        for (let i = 0; i < itemCount; i++) {
          const budgetAmount = round2(rand(50000, 5000000));
          const actualAmount = round2(budgetAmount * (0.7 + Math.random() * 0.6));
          const variance = round2(budgetAmount - actualAmount);
          const variancePercent = budgetAmount > 0 ? round2((variance / budgetAmount) * 100) : 0;
          totalAmount += budgetAmount;
          items.push({
            id: `${budgetId}_item_${i}`,
            budgetId,
            accountId: `acct_${rand(1, 300)}`,
            accountCode: String(rand(1000, 9999)),
            accountName: pick(ACCOUNT_NAMES),
            period: pick(PERIODS),
            budgetAmount,
            actualAmount,
            variance,
            variancePercent,
          });
        }

        const budget: FPABudget = {
          id: budgetId,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Budget ${budgetCounter}`,
          type,
          status: pick(["draft", "active", "locked", "archived"]),
          version: pick(["draft", "v1", "v2", "v3", "final"]),
          fiscalYear: fy,
          companyId: coId,
          entityId: pick(ENTITY_IDS),
          departmentId: `dept_${rand(1, 80)}`,
          region: pick(REGIONS),
          totalAmount,
          currency: pick(CURRENCIES),
          items,
          approvedBy: Math.random() > 0.4 ? pick(USERS) : undefined,
          approvedAt: Math.random() > 0.4 ? daysAgo(rand(1, 90)) : undefined,
          notes: Math.random() > 0.7 ? `Notes for ${type} budget ${budgetCounter}` : undefined,
          createdAt: daysAgo(rand(30, 365)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.budgets.addBudget(budget);
      }
    }
  }
}

function generateForecasts(svc: FPAService): void {
  const scenarios: ForecastScenario[] = ["baseline", "best-case", "expected", "worst-case"];
  const methods: ForecastMethod[] = ["top-down", "bottom-up", "hybrid", "driver-based"];
  const types: Array<"monthly" | "quarterly" | "annual" | "rolling" | "baseline"> = ["monthly", "quarterly", "annual", "rolling", "baseline"];
  let fcCounter = 0;

  for (const coId of COMPANY_IDS) {
    for (const sc of scenarios) {
      const numForecasts = rand(1, 3);
      for (let f = 0; f < numForecasts; f++) {
        fcCounter++;
        const forecastId = `fpa_fc_${String(fcCounter).padStart(5, "0")}`;
        const itemCount = rand(2, 6);
        const items: FPAForecastItem[] = [];
        let totalAmount = 0;

        for (let i = 0; i < itemCount; i++) {
          const forecastAmount = round2(rand(100000, 10000000));
          totalAmount += forecastAmount;
          items.push({
            id: `${forecastId}_item_${i}`,
            forecastId,
            accountId: `acct_${rand(1, 300)}`,
            accountCode: String(rand(1000, 9999)),
            accountName: pick(ACCOUNT_NAMES),
            period: pick(PERIODS),
            forecastAmount,
            actualAmount: Math.random() > 0.5 ? round2(forecastAmount * (0.8 + Math.random() * 0.4)) : undefined,
            driver: Math.random() > 0.6 ? pick(["headcount", "revenue", "inflation", "growth"]) : undefined,
            driverValue: Math.random() > 0.6 ? round2(Math.random() * 100) : undefined,
          });
        }

        const forecast: FPAForecast = {
          id: forecastId,
          type: pick(types),
          scenario: sc,
          method: pick(methods),
          name: `Forecast ${fcCounter} - ${sc}`,
          companyId: coId,
          period: pick(PERIODS),
          startDate: daysAgo(rand(30, 180)),
          endDate: daysAgo(rand(-30, 60)),
          totalAmount,
          currency: pick(CURRENCIES),
          items,
          confidence: round2(0.6 + Math.random() * 0.35),
          createdBy: pick(USERS),
          createdAt: daysAgo(rand(10, 90)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.forecast.addForecast(forecast);
      }
    }
  }
}

function generateRollingForecasts(svc: FPAService): void {
  const windows: RollingForecastWindow[] = ["3-month", "6-month", "12-month", "18-month", "24-month"];
  let rfCounter = 0;

  for (const coId of COMPANY_IDS.slice(0, 15)) {
    for (const window of windows) {
      rfCounter++;
      const rfId = `fpa_rf_${String(rfCounter).padStart(5, "0")}`;
      const label = `Rolling Forecast ${rfCounter} - ${window}`;
      const currency = pick(["USD", "EUR", "GBP"] as const) as PlanningCurrency;
      const itemCount = rand(3, 6);
      const items: ForecastLineItem[] = [];
      const baseRevenue = round2(rand(5000000, 50000000));
      const totalRevenue = round2(baseRevenue * (1 + rand(5, 20) / 100));
      const totalExpenses = round2(totalRevenue * (0.6 + Math.random() * 0.25));
      const netIncome = round2(totalRevenue - totalExpenses);

      for (let i = 0; i < itemCount; i++) {
        const amount = round2(rand(200000, 8000000));
        items.push({
          id: `${rfId}_item_${i}`,
          forecastId: rfId,
          accountCode: pick(["REV-100", "REV-200", "EXP-100", "EXP-200", "COGS-100"]),
          accountName: pick(["Product Revenue", "Service Revenue", "Operating Expenses", "COGS"]),
          category: pick(["revenue", "expense", "cogs"]),
          amount,
          currency,
          period: pick(PERIODS),
          confidenceLower: round2(amount * (0.8 + Math.random() * 0.1)),
          confidenceUpper: round2(amount * (1.0 + Math.random() * 0.2)),
          notes: undefined,
        });
      }

      const rollingForecast: Forecast = {
        id: rfId,
        forecastType: window,
        fiscalYear: new Date().getFullYear(),
        fiscalPeriod: rand(1, 12),
        label,
        status: pick(["active", "paused", "completed", "archived"]),
        version: 1,
        confidenceLevel: round2(0.5 + Math.random() * 0.45),
        totalRevenue,
        totalExpenses,
        netIncome,
        totalCapital: round2(rand(0, 5000000)),
        totalCashFlow: round2(netIncome * (0.7 + Math.random() * 0.3)),
        headcount: rand(50, 500),
        currency,
        createdBy: pick(USERS),
        companyId: coId,
        createdAt: daysAgo(rand(30, 120)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.rollingForecast.addForecast(rollingForecast);
      items.forEach((item) => svc.rollingForecast.addLineItem(item));
    }
  }
}

function generateScenarios(svc: FPAService): void {
  const scenarioTypes: ScenarioType[] = ["base-case", "best-case", "worst-case", "recession",
    "rapid-growth", "inflation", "interest-rate-shock", "fx-shock",
    "acquisition", "divestiture", "custom"];
  let scCounter = 0;

  for (const coId of COMPANY_IDS) {
    const numScenarios = rand(3, 6);
    for (let s = 0; s < numScenarios; s++) {
      scCounter++;
      const scenarioId = `fpa_sc_${String(scCounter).padStart(5, "0")}`;
      const impactCount = rand(2, 5);
      const impacts: ScenarioImpact[] = [];

      for (let i = 0; i < impactCount; i++) {
        const baseline = rand(100000, 5000000);
        const impacted = round2(baseline * (0.5 + Math.random() * 1.0));
        impacts.push({
          accountId: `acct_${rand(1, 300)}`,
          accountCode: String(rand(1000, 9999)),
          accountName: pick(ACCOUNT_NAMES),
          metric: pick(["revenue", "expense", "net-income", "ebitda", "cash-flow"]),
          baseline,
          impacted,
          variance: round2(impacted - baseline),
          variancePercent: baseline > 0 ? round2(((impacted - baseline) / baseline) * 100) : 0,
        });
      }

      const params: Record<string, number> = {};
      const paramCount = rand(2, 5);
      for (let i = 0; i < paramCount; i++) {
        params[pick(["growth_rate", "inflation_rate", "interest_rate", "fx_rate", "headcount_growth", "revenue_growth", "margin_impact"])] = round2(Math.random() * 20 - 10);
      }

      const scenario: FPAScenario = {
        id: scenarioId,
        type: pick(scenarioTypes),
        name: `Scenario ${scCounter}: ${pick(["Base Case", "Best Case", "Worst Case", "Recession Impact", "Growth Opportunity", "Inflation Impact", "Acquisition Target", "Market Expansion"])}`,
        description: `Scenario analysis for ${coId} under ${pick(["normal", "stress", "optimistic", "pessimistic"])} conditions`,
        companyId: coId,
        parameters: params,
        assumptions: Array.from({ length: rand(2, 4) }, () => pick(["Revenue grows 5-10%", "Costs stable", "No major FX impact", "Interest rates unchanged", "Hiring freeze in Q2", "Market expansion 2x", "Inflation at 3-4%"])),
        impacts,
        status: pick(["draft", "active", "archived"]),
        createdBy: pick(USERS),
        createdAt: daysAgo(rand(15, 120)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.scenario.addScenario(scenario);
    }
  }
}

function generateCostCenters(svc: FPAService): void {
  let ccCounter = 0;

  for (const coId of COMPANY_IDS) {
    const root: CostCenter = {
      id: `cc_root_${coId}`,
      code: `CC-${coId.slice(-3)}-000`,
      name: `${coId} Corporate`,
      description: `Root cost center for ${coId}`,
      companyId: coId,
      level: 0,
      path: `cc_root_${coId}`,
      department: "Corporate",
      budgetAmount: round2(rand(10000000, 100000000)),
      actualAmount: round2(rand(8000000, 90000000)),
      status: "active",
      createdAt: daysAgo(rand(180, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.costCenters.addCostCenter(root);
    ccCounter++;

    const level1Count = rand(3, 5);
    for (let l1 = 0; l1 < level1Count; l1++) {
      ccCounter++;
      const l1Id = `cc_${String(ccCounter).padStart(5, "0")}`;
      const l1Dept = pick(DEPARTMENTS_NAMES);
      const l1Center: CostCenter = {
        id: l1Id,
        code: `CC-${coId.slice(-3)}-${String(l1 + 1).padStart(3, "0")}`,
        name: `${l1Dept} - ${coId}`,
        description: `${l1Dept} department cost center`,
        companyId: coId,
        parentId: root.id,
        level: 1,
        path: `${root.id}.${l1Id}`,
        department: l1Dept,
        budgetAmount: round2(rand(1000000, 20000000)),
        actualAmount: round2(rand(800000, 18000000)),
        status: pick(["active", "active", "active", "inactive"]),
        createdAt: daysAgo(rand(90, 300)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.costCenters.addCostCenter(l1Center);

      const level2Count = rand(2, 4);
      for (let l2 = 0; l2 < level2Count; l2++) {
        ccCounter++;
        const l2Id = `cc_${String(ccCounter).padStart(5, "0")}`;
        const l2Center: CostCenter = {
          id: l2Id,
          code: `CC-${coId.slice(-3)}-${String(l1 + 1).padStart(3, "0")}${String(l2 + 1).padStart(2, "0")}`,
          name: `${l1Dept} - Sub Unit ${l2 + 1}`,
          description: `Sub cost center under ${l1Dept}`,
          companyId: coId,
          parentId: l1Id,
          level: 2,
          path: `${root.id}.${l1Id}.${l2Id}`,
          department: l1Dept,
          budgetAmount: round2(rand(200000, 5000000)),
          actualAmount: round2(rand(150000, 4500000)),
          status: pick(["active", "active", "active", "inactive", "frozen"]),
          createdAt: daysAgo(rand(30, 200)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.costCenters.addCostCenter(l2Center);

        const level3Count = rand(1, 3);
        for (let l3 = 0; l3 < level3Count; l3++) {
          ccCounter++;
          const l3Id = `cc_${String(ccCounter).padStart(5, "0")}`;
          const l3Center: CostCenter = {
            id: l3Id,
            code: `CC-${coId.slice(-3)}-${String(l1 + 1).padStart(3, "0")}${String(l2 + 1).padStart(2, "0")}${String(l3 + 1).padStart(2, "0")}`,
            name: `${l1Dept} - Team ${l3 + 1}`,
            description: `Team level cost center`,
            companyId: coId,
            parentId: l2Id,
            level: 3,
            path: `${root.id}.${l1Id}.${l2Id}.${l3Id}`,
            department: l1Dept,
            budgetAmount: round2(rand(50000, 1000000)),
            actualAmount: round2(rand(30000, 900000)),
            status: "active",
            createdAt: daysAgo(rand(15, 100)),
            updatedAt: daysAgo(rand(1, 30)),
          };
          svc.costCenters.addCostCenter(l3Center);

          if (Math.random() > 0.6) {
            ccCounter++;
            const l4Id = `cc_${String(ccCounter).padStart(5, "0")}`;
            const l4Center: CostCenter = {
              id: l4Id,
              code: `CC-${coId.slice(-3)}-${String(l1 + 1).padStart(3, "0")}${String(l2 + 1).padStart(2, "0")}${String(l3 + 1).padStart(2, "0")}${String(1).padStart(2, "0")}`,
              name: `${l1Dept} - Squad ${l3 + 1}`,
              description: `Squad level cost center`,
              companyId: coId,
              parentId: l3Id,
              level: 4,
              path: `${root.id}.${l1Id}.${l2Id}.${l3Id}.${l4Id}`,
              department: l1Dept,
              budgetAmount: round2(rand(10000, 300000)),
              actualAmount: round2(rand(5000, 250000)),
              status: "active",
              createdAt: daysAgo(rand(5, 50)),
              updatedAt: daysAgo(rand(1, 15)),
            };
            svc.costCenters.addCostCenter(l4Center);
          }
        }
      }
    }
  }
}

function generateProfitCenters(svc: FPAService): void {
  let pcCounter = 0;

  for (const coId of COMPANY_IDS) {
    const numPCs = rand(4, 8);
    for (let i = 0; i < numPCs; i++) {
      pcCounter++;
      const revenue = round2(rand(1000000, 50000000));
      const cost = round2(revenue * (0.4 + Math.random() * 0.5));
      const margin = round2(revenue - cost);
      const marginPercent = revenue > 0 ? round2((margin / revenue) * 100) : 0;

      const profitCenter: ProfitCenter = {
        id: `pc_${String(pcCounter).padStart(5, "0")}`,
        code: `PC-${coId.slice(-3)}-${String(i + 1).padStart(3, "0")}`,
        name: `${pick(["Enterprise", "SMB", "Strategic", "Channel", "Direct", "Online", "Retail", "Wholesale"])} - ${pick(["North", "South", "East", "West", "Central"])}`,
        description: `Profit center for business unit tracking`,
        companyId: coId,
        businessUnit: pick(BUSINESS_UNITS),
        region: pick(REGIONS),
        product: pick(["Platform", "SaaS", "Services", "Hardware", "Support", "Consulting"]),
        revenue,
        cost,
        margin,
        marginPercent,
        budgetRevenue: round2(revenue * (0.8 + Math.random() * 0.4)),
        budgetCost: round2(cost * (0.8 + Math.random() * 0.4)),
        status: pick(["active", "active", "active", "inactive"]),
        createdAt: daysAgo(rand(60, 300)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.profitCenters.addProfitCenter(profitCenter);
    }
  }
}

function generateRevenuePlans(svc: FPAService): void {
  let rpCounter = 0;

  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const numPlans = rand(1, 2);
      for (let p = 0; p < numPlans; p++) {
        rpCounter++;
        const planId = `fpa_rp_${String(rpCounter).padStart(5, "0")}`;
        const productLine = pick(["Enterprise SaaS", "Consulting Services", "Hardware Sales", "Support Contracts", "Cloud Infrastructure", "API Licensing", "Data Analytics", "Training Services"]);
        const volume = rand(500, 50000);
        const unitPrice = round2(rand(10, 5000));
        const revenue = round2(volume * unitPrice);
        const costOfGoodsSold = round2(revenue * (0.3 + Math.random() * 0.3));
        const grossMargin = round2(revenue - costOfGoodsSold);
        const grossMarginPercent = round2((grossMargin / revenue) * 100);
        const growthRate = round2(Math.random() * 40 - 5);
        const currency = (pick(CURRENCIES));

        const plan: RevenuePlan = {
          id: planId,
          planId,
          productLine,
          revenueType: pick(["product", "service", "subscription", "other"]),
          volume,
          unitPrice,
          revenue,
          costOfGoodsSold,
          grossMargin,
          grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
          growthRate,
          marketShare: Math.random() > 0.5 ? round2(Math.random() * 25) : undefined,
          currency: currency as PlanningCurrency,
          period: pick(PERIODS),
          department: `dept_${rand(1, 80)}`,
          companyId: coId,
          fiscalYear: fy,
          driver: pick(["pricing", "volume", "customers", "market-expansion", "recurring", "one-time", "pipeline"]),
          createdAt: daysAgo(rand(30, 180)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.revenue.addPlan(plan);
      }
    }
  }
}

function generateExpensePlans(svc: FPAService): void {
  const categories = ["payroll", "marketing", "sales", "it", "facilities",
    "professional-services", "travel", "procurement", "treasury-costs"];
  let epCounter = 0;

  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const numPlans = rand(2, 4);
      for (let p = 0; p < numPlans; p++) {
        epCounter++;
        const planId = `fpa_ep_${String(epCounter).padStart(5, "0")}`;
        const amount = round2(rand(100000, 20000000));
        const currency = (pick(CURRENCIES));

        const plan: ExpensePlan = {
          id: planId,
          planId,
          department: `dept_${rand(1, 80)}`,
          expenseType: pick(["fixed", "variable", "semiVariable"]),
          category: pick(categories),
          amount,
          currency: currency as PlanningCurrency,
          period: pick(PERIODS),
          costDriver: Math.random() > 0.4 ? pick(["headcount", "revenue", "sqft", "users", "transactions"]) : undefined,
          driverValue: Math.random() > 0.5 ? round2(Math.random() * 10000) : undefined,
          isDiscretionary: Math.random() > 0.7,
          companyId: coId,
          fiscalYear: fy,
          createdAt: daysAgo(rand(30, 180)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.expense.addPlan(plan);
      }
    }
  }
}

function generateWorkforcePlans(svc: FPAService): void {
  let wpCounter = 0;

  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const numPlans = rand(1, 3);
      for (let p = 0; p < numPlans; p++) {
        wpCounter++;
        const planId = `fpa_wp_${String(wpCounter).padStart(5, "0")}`;
        const headcountCurrent = rand(50, 2000);
        const headcountPlanned = headcountCurrent + rand(0, 200);
        const headcountNewHires = rand(10, 100);
        const headcountAttrition = rand(5, 50);
        const averageSalary = round2(rand(60000, 180000));
        const totalSalaryCost = round2(headcountPlanned * averageSalary);
        const benefitsCost = round2(totalSalaryCost * (0.1 + Math.random() * 0.1));
        const payrollTax = round2(totalSalaryCost * (0.05 + Math.random() * 0.05));
        const totalCompensation = round2(totalSalaryCost + benefitsCost + payrollTax);
        const attritionRate = round2((headcountAttrition / headcountCurrent) * 100);
        const currency = (pick(CURRENCIES));

        const plan: WorkforcePlan = {
          id: planId,
          planId,
          department: `dept_${rand(1, 80)}`,
          fiscalYear: fy,
          headcountCurrent,
          headcountPlanned,
          headcountNewHires,
          headcountAttrition,
          averageSalary,
          totalSalaryCost,
          benefitsCost,
          payrollTax,
          totalCompensation,
          currency: currency as PlanningCurrency,
          vacancyRate: round2(Math.random() * 5),
          attritionRate: Math.round(attritionRate * 100) / 100,
          createdBy: pick(USERS),
          companyId: coId,
          category: pick(["permanent", "contract", "temporary", "executive"]),
          createdAt: daysAgo(rand(30, 180)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.workforce.addPlan(plan);
      }
    }
  }
}

function generateCapitalPlans(svc: FPAService): void {
  const categories: CapitalCategory[] = ["asset-purchases", "depreciation", "projects",
    "construction", "infrastructure", "technology"];
  let cpCounter = 0;

  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const numPlans = rand(1, 2);
      for (let p = 0; p < numPlans; p++) {
        cpCounter++;
        const planId = `fpa_cp_${String(cpCounter).padStart(5, "0")}`;
        const totalBudget = round2(rand(500000, 50000000));
        const spentToDate = round2(totalBudget * (0.1 + Math.random() * 0.8));
        const remainingBudget = round2(totalBudget - spentToDate);
        const roi = round2(Math.random() * 40 - 5);
        const paybackPeriod = rand(12, 60);
        const currency = (pick(CURRENCIES));

        const plan: CapitalPlan = {
          id: planId,
          planId,
          projectName: pick(["Cloud Migration", "ERP Upgrade", "Office Expansion", "Data Center", "AI Platform", "Security Infrastructure", "Network Upgrade", "Mobile App"]),
          projectType: pick(["it", "equipment", "facilities", "rAndD", "other"]),
          totalBudget,
          spentToDate,
          remainingBudget,
          currency: currency as PlanningCurrency,
          startDate: daysAgo(rand(0, 90)),
          endDate: daysAgo(rand(-365, -30)),
          status: pick(["planned", "approved", "inProgress", "completed", "cancelled"]),
          roi: Math.round(roi * 100) / 100,
          paybackPeriod,
          priority: pick(["low", "medium", "high", "critical"]),
          department: `dept_${rand(1, 80)}`,
          sponsor: pick(USERS),
          companyId: coId,
          category: pick(categories),
          fiscalYear: fy,
          createdAt: daysAgo(rand(30, 180)),
          updatedAt: daysAgo(rand(1, 30)),
        };
        svc.capital.addPlan(plan);
      }
    }
  }
}

function generateAllocations(svc: FPAService): void {
  const methods: AllocationMethod[] = ["percentage", "headcount", "revenue", "square-footage", "transaction-count", "fixed-amount"];
  let allocCounter = 0;

  const allCostCenters = svc.costCenters.getAllCostCenters();
  if (allCostCenters.length === 0) return;

  for (let i = 0; i < 60; i++) {
    allocCounter++;
    const source = pick(allCostCenters);
    const targetCount = rand(2, 5);
    const targets: string[] = [];
    for (let t = 0; t < targetCount; t++) {
      let target = pick(allCostCenters);
      let attempts = 0;
      while (target.id === source.id && attempts < 10) {
        target = pick(allCostCenters);
        attempts++;
      }
      targets.push(target.id);
    }

    const method = pick(methods);
    const percentages: Record<string, number> = {};
    const fixedAmounts: Record<string, number> = {};
    const equalShare = round2(100 / targets.length);
    for (const t of targets) {
      percentages[t] = equalShare;
      fixedAmounts[t] = round2(rand(10000, 500000));
    }

    const allocation: FPAAllocation = {
      id: `fpa_alloc_${String(allocCounter).padStart(4, "0")}`,
      name: `Allocation Rule ${allocCounter}`,
      description: `Distribute costs from ${source.name} to ${targetCount} cost centers`,
      sourceCostCenterId: source.id,
      targetCostCenterIds: targets,
      method,
      percentages,
      fixedAmounts,
      basisSource: method === "percentage" ? undefined : pick(["headcount", "revenue", "square-footage", "transaction-count"]),
      isActive: Math.random() > 0.25,
      frequency: pick(["monthly", "quarterly", "annual"]),
      companyId: source.companyId,
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.allocation.addRule(allocation);
  }
}

function generateVariances(svc: FPAService): void {
  const varianceTypes: VarianceType[] = ["budget-vs-actual", "forecast-vs-actual",
    "forecast-vs-budget", "year-over-year", "month-over-month", "quarter-over-quarter"];
  let vCounter = 0;

  for (const coId of COMPANY_IDS) {
    for (const period of PERIODS.slice(0, 24)) {
      const numVariances = rand(2, 5);
      for (let v = 0; v < numVariances; v++) {
        vCounter++;
        const budgetAmount = round2(rand(100000, 5000000));
        const actualAmount = round2(budgetAmount * (0.5 + Math.random() * 1.0));
        const forecastAmount = round2(budgetAmount * (0.7 + Math.random() * 0.6));
        const absVar = round2(budgetAmount - actualAmount);
        const pctVar = budgetAmount > 0 ? round2((absVar / budgetAmount) * 100) : 0;

        const direction = absVar > 0 ? "unfavorable" as const : absVar < 0 ? "favorable" as const : "neutral" as const;

        const variance: VarianceRecord = {
          id: `fpa_var_${String(vCounter).padStart(5, "0")}`,
          type: pick(varianceTypes),
          direction,
          companyId: coId,
          period,
          accountId: `acct_${rand(1, 300)}`,
          accountCode: String(rand(1000, 9999)),
          accountName: pick(ACCOUNT_NAMES),
          budgetAmount,
          forecastAmount,
          actualAmount,
          absoluteVariance: absVar,
          percentageVariance: pctVar,
          driver: Math.random() > 0.5 ? pick(["volume", "price", "mix", "efficiency", "exchange-rate", "one-time"]) : undefined,
          rootCause: Math.random() > 0.6 ? pick(["Higher than expected costs", "Revenue shortfall", "Operational inefficiency", "Market conditions", "Timing difference", "FX impact"]) : undefined,
          severity: Math.abs(pctVar) > 20 ? "critical" : Math.abs(pctVar) > 10 ? "high" : Math.abs(pctVar) > 5 ? "medium" : "low",
          createdAt: daysAgo(rand(1, 60)),
        };
        svc.variance.addVariance(variance);
        svc.varianceAnalysis.add({
          id: `fpa_var_analysis_${String(vCounter).padStart(5, "0")}`,
          varianceType: pick(varianceTypes),
          fiscalYear: new Date().getFullYear(),
          fiscalPeriod: rand(1, 12),
          accountCode: String(rand(1000, 9999)),
          accountName: pick(ACCOUNT_NAMES),
          category: pick(["revenue", "expense", "cogs", "opex"]),
          actualAmount,
          planAmount: budgetAmount,
          variance: absVar,
          variancePercent: pctVar,
          direction,
          isSignificant: Math.abs(pctVar) > 10,
          threshold: 5,
          rootCause: Math.random() > 0.6 ? pick(["Higher than expected costs", "Revenue shortfall", "Operational inefficiency", "Market conditions", "Timing difference", "FX impact"]) : undefined,
          currency: pick(CURRENCIES) as PlanningCurrency,
          companyId: coId,
          createdAt: daysAgo(rand(1, 60)),
          updatedAt: daysAgo(rand(1, 30)),
        });
      }
    }
  }
}

function generateKPIsAndScorecards(svc: FPAService): void {
  const kpiNames = [
    { name: "Revenue Growth Rate", unit: "%", cat: "revenue" as const },
    { name: "Net Revenue", unit: "USD", cat: "revenue" as const },
    { name: "Recurring Revenue %", unit: "%", cat: "revenue" as const },
    { name: "Revenue per Customer", unit: "USD", cat: "revenue" as const },
    { name: "Gross Margin", unit: "%", cat: "profitability" as const },
    { name: "Operating Margin", unit: "%", cat: "profitability" as const },
    { name: "EBITDA Margin", unit: "%", cat: "profitability" as const },
    { name: "Net Profit Margin", unit: "%", cat: "profitability" as const },
    { name: "Return on Equity", unit: "%", cat: "profitability" as const },
    { name: "Current Ratio", unit: "ratio", cat: "liquidity" as const },
    { name: "Quick Ratio", unit: "ratio", cat: "liquidity" as const },
    { name: "Working Capital", unit: "USD", cat: "liquidity" as const },
    { name: "Days Sales Outstanding", unit: "days", cat: "efficiency" as const },
    { name: "Days Payable Outstanding", unit: "days", cat: "efficiency" as const },
    { name: "Asset Turnover", unit: "ratio", cat: "efficiency" as const },
    { name: "Inventory Turnover", unit: "ratio", cat: "efficiency" as const },
    { name: "Revenue Growth YoY", unit: "%", cat: "growth" as const },
    { name: "Customer Growth Rate", unit: "%", cat: "growth" as const },
    { name: "Market Share", unit: "%", cat: "growth" as const },
    { name: "Budget Variance %", unit: "%", cat: "budget" as const },
    { name: "Budget Utilization", unit: "%", cat: "budget" as const },
    { name: "Forecast Accuracy", unit: "%", cat: "forecast" as const },
    { name: "Forecast Bias", unit: "%", cat: "forecast" as const },
  ];

  let kpiCounter = 0;

  for (const coId of COMPANY_IDS) {
    for (const period of PERIODS.slice(0, 12)) {
      const numKPIs = rand(10, 20);
      const scorecardKPIs: FPAKPI[] = [];

      for (let k = 0; k < numKPIs; k++) {
        kpiCounter++;
        const def = pick(kpiNames);
        const value = round2(Math.random() * 100);
        const target = round2(40 + Math.random() * 60);
        const kpi: FPAKPI = {
          id: `fpa_kpi_${String(kpiCounter).padStart(6, "0")}`,
          name: def.name,
          value,
          target,
          previousValue: round2(value * (0.7 + Math.random() * 0.6)),
          unit: def.unit,
          category: def.cat,
          trend: pick(["up", "down", "stable"]),
          status: value >= target * 0.9 ? "good" : value >= target * 0.7 ? "warning" : "critical",
          companyId: coId,
          period,
          date: daysAgo(rand(1, 30)),
        };
        svc.scorecards.addKPI(kpi);
        scorecardKPIs.push(kpi);
      }

      const scorecardId = `fpa_sc_${coId}_${period.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const score = scorecardKPIs.reduce((acc, k) => {
        if (k.status === "good") return acc + 100;
        if (k.status === "warning") return acc + 50;
        return acc + 0;
      }, 0);
      const maxScore = scorecardKPIs.length * 100;

      const scorecard: FPAScorecard = {
        id: scorecardId,
        type: pick(["corporate", "regional", "entity", "department", "business-unit"]),
        name: `Scorecard ${coId} - ${period}`,
        companyId: coId,
        period,
        kpis: scorecardKPIs,
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        status: pick(["draft", "published", "archived"]),
        generatedAt: daysAgo(rand(1, 15)),
        createdAt: daysAgo(rand(15, 60)),
      };
      svc.scorecards.addScorecard(scorecard);
    }
  }
}

function generateAlerts(svc: FPAService): void {
  let alertCounter = 0;

  for (const coId of COMPANY_IDS) {
    for (const period of PERIODS.slice(0, 8)) {
      const numAlerts = rand(1, 3);
      for (let a = 0; a < numAlerts; a++) {
        alertCounter++;
        const severity = pick(["critical", "warning", "info"] as AlertSeverity[]);
        const alert: FPAAlert = {
          id: `fpa_alert_${String(alertCounter).padStart(5, "0")}`,
          severity,
          type: pick(["variance", "budget", "forecast", "scenario", "revenue", "expense", "workforce", "capital"]),
          title: severity === "critical" ? "Critical Threshold Breached" : severity === "warning" ? "Warning Threshold Approaching" : "Informational Update",
          message: `${pick(["Budget variance exceeds threshold", "Forecast accuracy below target", "Revenue growth slowing", "Expense overrun detected", "Headcount limit approaching", "Capital spend exceeding plan"])} for ${period}`,
          companyId: coId,
          period,
          actionRequired: Math.random() > 0.5 ? pick(["Review variance drivers", "Update forecast assumptions", "Approve budget adjustment", "Escalate to management"]) : undefined,
          dismissed: Math.random() > 0.7,
          createdAt: daysAgo(rand(1, 30)),
        };
        svc.analytics.addAlert(alert);
      }
    }
  }
}

function generateRecommendations(svc: FPAService): void {
  let recCounter = 0;

  for (const coId of COMPANY_IDS) {
    const numRecs = rand(5, 10);
    for (let r = 0; r < numRecs; r++) {
      recCounter++;
      const recommendation: FPARecommendation = {
        id: `fpa_rec_${String(recCounter).padStart(5, "0")}`,
        type: pick(["budget", "forecast", "scenario", "revenue", "expense", "workforce", "capital", "risk"]),
        title: pick(["Optimize Budget Allocation", "Update Forecast Model", "Review Expense Trends", "Adjust Revenue Projections", "Optimize Headcount Plan", "Review Capital Expenditure", "Mitigate FX Risk", "Improve Forecast Accuracy"]),
        description: `Based on analysis of ${pick(["recent variances", "trending patterns", "scenario impacts", "historical data", "market conditions"])}, consider ${pick(["adjusting budget allocations", "refining forecast assumptions", "reducing discretionary spend", "accelerating revenue recognition", "optimizing workforce mix", "deferring capital projects", "hedging currency exposure"])}`,
        impact: pick(["High - Potential savings of $500K+", "Medium - Improved forecast accuracy", "Low - Incremental improvement"]),
        confidence: round2(0.5 + Math.random() * 0.45),
        companyId: coId,
        period: pick(PERIODS),
        implemented: Math.random() > 0.8,
        createdAt: daysAgo(rand(1, 60)),
      };
      svc.analytics.addRecommendation(recommendation);
    }
  }
}

function generateTrendsAndRevisions(svc: FPAService): void {
  const metricNames = ["revenue", "expense", "ebitda", "net-income", "cash-flow",
    "working-capital", "gross-margin", "operating-margin", "headcount", "budget-utilization"];

  for (const metric of metricNames) {
    for (let i = 1; i <= 12; i++) {
      const previousValue = round2(rand(1000000, 50000000));
      const value = round2(previousValue * (0.8 + Math.random() * 0.4));
      const change = round2(value - previousValue);
      const changePercent = previousValue > 0 ? round2((change / previousValue) * 100) : 0;

      const trend: PlanningTrend = {
        metric,
        period: `2025-${String(i).padStart(2, "0")}`,
        value,
        previousValue,
        change,
        changePercent,
        direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      };
      svc.analytics.addTrend(trend);
    }
  }

  let revCounter = 0;
  const forecasts = svc.forecast.getAllForecasts();
  for (const forecast of forecasts.slice(0, 800)) {
    const numRevisions = rand(1, 3);
    for (let r = 0; r < numRevisions; r++) {
      revCounter++;
      const previousAmount = round2(rand(500000, 5000000));
      const revision: ForecastRevision = {
        id: `fpa_rev_${String(revCounter).padStart(6, "0")}`,
        forecastId: forecast.id,
        previousAmount,
        newAmount: round2(previousAmount * (0.7 + Math.random() * 0.6)),
        reason: pick(["Updated market data", "Revised growth assumptions", "Actuals variance", "Management adjustment", "FX rate change", "New business pipeline"]),
        revisedBy: pick(USERS),
        revisedAt: daysAgo(rand(1, 30)),
      };
      svc.analytics.addRevision(revision);
    }
  }
}

function generatePlanningRecords(svc: FPAService): void {
  for (const fy of FISCAL_YEARS) {
    for (const coId of COMPANY_IDS) {
      const levels = ["corporate", "entity", "regional", "business-unit", "department"] as const;
      for (const level of levels) {
        svc.planning.addPlan({
          id: `plan_${coId}_${fy}_${level}`,
          name: `${level.charAt(0).toUpperCase() + level.slice(1)} Plan FY${fy}`,
          companyId: coId,
          level,
          fiscalYear: fy,
          entityId: pick(ENTITY_IDS),
          region: pick(REGIONS),
          businessUnit: pick(BUSINESS_UNITS),
          departmentId: `dept_${rand(1, 80)}`,
          totalAmount: round2(rand(10000000, 500000000)),
          currency: pick(CURRENCIES),
          status: pick(["draft", "active", "locked", "archived"]),
          createdAt: daysAgo(rand(60, 200)),
          updatedAt: daysAgo(rand(1, 30)),
        });
      }

      const extraPlans = rand(5, 15);
      for (let e = 0; e < extraPlans; e++) {
        svc.planning.addPlan({
          id: `plan_${coId}_${fy}_extra_${e}`,
          name: `Planning Record ${e + 1} - FY${fy}`,
          companyId: coId,
          level: pick(["corporate", "entity", "regional", "business-unit", "department"]),
          fiscalYear: fy,
          entityId: pick(ENTITY_IDS),
          region: pick(REGIONS),
          businessUnit: pick(BUSINESS_UNITS),
          departmentId: `dept_${rand(1, 80)}`,
          totalAmount: round2(rand(1000000, 100000000)),
          currency: pick(CURRENCIES),
          status: pick(["draft", "active", "locked", "archived"]),
          createdAt: daysAgo(rand(30, 150)),
          updatedAt: daysAgo(rand(1, 30)),
        });
      }
    }
  }
}

export function seedFPAData(svc: FPAService): void {
  console.log("Seeding FP&A data...");

  generateBudgets(svc);
  console.log(`  ${svc.budgets.count()} budgets created`);

  generateForecasts(svc);
  console.log(`  ${svc.forecast.count()} forecasts created`);

  generateRollingForecasts(svc);
  console.log(`  ${svc.rollingForecast.count()} rolling forecasts created`);

  generateScenarios(svc);
  console.log(`  ${svc.scenario.count()} scenarios created`);

  generateCostCenters(svc);
  console.log(`  ${svc.costCenters.count()} cost centers created`);

  generateProfitCenters(svc);
  console.log(`  ${svc.profitCenters.count()} profit centers created`);

  generateRevenuePlans(svc);
  console.log(`  ${svc.revenue.count()} revenue plans created`);

  generateExpensePlans(svc);
  console.log(`  ${svc.expense.count()} expense plans created`);

  generateWorkforcePlans(svc);
  console.log(`  ${svc.workforce.count()} workforce plans created`);

  generateCapitalPlans(svc);
  console.log(`  ${svc.capital.count()} capital plans created`);

  generateAllocations(svc);
  console.log(`  ${svc.allocation.count()} allocation rules created`);

  generateVariances(svc);
  console.log(`  ${svc.variance.count()} variance records created`);

  generateKPIsAndScorecards(svc);
  console.log(`  ${svc.scorecards.count()} KPIs/scorecards tracked`);

  generateAlerts(svc);
  console.log(`  ${svc.analytics.getAllAlerts().length} alerts created`);

  generateRecommendations(svc);
  console.log(`  ${svc.analytics.getAllRecommendations().length} recommendations created`);

  generateTrendsAndRevisions(svc);
  console.log(`  ${svc.analytics.getAllTrends().length} trends, ${svc.analytics.count()} total analytics records`);

  generatePlanningRecords(svc);
  console.log(`  ${svc.planning.count()} planning records created`);

  console.log("FP&A seed data complete.");
}
