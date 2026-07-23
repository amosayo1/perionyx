// ─────────────────────────────────────────────────────────────
// Enterprise Pilot Environment — Demo Configuration
// Configurable demo environment. NEVER generates fake financial
// data from scratch — uses existing seed infrastructure.
// ─────────────────────────────────────────────────────────────

import type {
  PilotCompany,
  IndustryTemplate,
  IndustrySampleData,
} from "./types";
import { DEMO_SCENARIOS } from "./demo-scenarios";

// ─── Industry Templates ────────────────────────────────────

const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    industry: "manufacturing",
    name: "Manufacturing & Industrial",
    description: "Complex supply chains, multi-entity plants, cost accounting, and transfer pricing across jurisdictions",
    icon: "factory",
    typicalRevenue: "$50M - $500M",
    typicalEmployees: 500,
    commonEntities: ["PLANTS", "WAREHOUSES", "DISTRIBUTION_CENTERS", "VENDORS", "CUSTOMERS"],
    regulatoryFrameworks: ["SOX", "ISO_9001", "FDA_21CFR", "ENVIRONMENTAL"],
    keyMetrics: ["COGS%", "Inventory Turns", "Capacity Utilization", "Scrap Rate", "OTIF"],
    sampleData: sampleDataFor("manufacturing"),
  },
  {
    industry: "financial-services",
    name: "Financial Services & Banking",
    description: "Regulatory capital, risk-weighted assets, intercompany lending, and extensive compliance requirements",
    icon: "bank",
    typicalRevenue: "$100M - $2B",
    typicalEmployees: 1000,
    commonEntities: ["BRANCHES", "SUBSIDIARIES", "INTERCOMPANY_ACCOUNTS", "REGULATORY_BODIES"],
    regulatoryFrameworks: ["BASEL_III", "DODD_FRANK", "SOX", "GDPR", "AML_KYC"],
    keyMetrics: ["CET1 Ratio", "NPL Ratio", "Net Interest Margin", "Cost of Risk", "ROA"],
    sampleData: sampleDataFor("financial-services"),
  },
  {
    industry: "technology",
    name: "Technology & SaaS",
    description: "Recurring revenue, SaaS metrics, stock-based compensation, R&D capitalization, and multi-currency operations",
    icon: "cpu",
    typicalRevenue: "$20M - $1B",
    typicalEmployees: 300,
    commonEntities: ["PRODUCT_LINES", "COST_CENTERS", "ENGINEERING_TEAMS", "CUSTOMER_SEGMENTS"],
    regulatoryFrameworks: ["SOX", "SOC_2", "GDPR", "CCPA"],
    keyMetrics: ["ARR", "Net Revenue Retention", "Rule of 40", "CAC Payback", "LTV/CAC"],
    sampleData: sampleDataFor("technology"),
  },
  {
    industry: "healthcare",
    name: "Healthcare & Life Sciences",
    description: "Clinical trial costs, R&D capitalization, multi-entity hospital systems, and heavy regulatory compliance",
    icon: "heart-pulse",
    typicalRevenue: "$100M - $2B",
    typicalEmployees: 2000,
    commonEntities: ["FACILITIES", "DEPARTMENTS", "CLINICAL_TRIALS", "SUPPLIERS", "INSURERS"],
    regulatoryFrameworks: ["HIPAA", "FDA_21CFR", "SOX", "GLEP"],
    keyMetrics: ["Patient Days", "Revenue Per Bed", "Cost Per Case", "R&D Pipeline Value", "Payer Mix"],
    sampleData: sampleDataFor("healthcare"),
  },
  {
    industry: "retail",
    name: "Retail & Consumer",
    description: "Multi-channel operations, inventory management, seasonal forecasting, and franchise accounting",
    icon: "shopping-bag",
    typicalRevenue: "$50M - $500M",
    typicalEmployees: 800,
    commonEntities: ["STORES", "DISTRIBUTION_CENTERS", "E_COMMERCE", "FRANCHISEES", "SUPPLIERS"],
    regulatoryFrameworks: ["SOX", "PCI_DSS", "FTC", "ADA"],
    keyMetrics: ["Same-Store Sales", "Inventory Turnover", "Gross Margin", "Customer Acquisition Cost", "Basket Size"],
    sampleData: sampleDataFor("retail"),
  },
  {
    industry: "energy",
    name: "Energy & Utilities",
    description: "Capital-intensive operations, regulatory rate cases, commodity hedging, and environmental compliance",
    icon: "zap",
    typicalRevenue: "$200M - $5B",
    typicalEmployees: 1500,
    commonEntities: ["PRODUCTION_SITES", "PIPELINES", "POWER_PLANTS", "REGULATORY_BODIES", "Joint_Ventures"],
    regulatoryFrameworks: ["FERC", "SEC_10K", "SOX", "EPA", "OSHA"],
    keyMetrics: ["Reserve Replacement", "Production Costs", "EBITDA Margin", "Capex/Revenue", "Safety Incidents"],
    sampleData: sampleDataFor("energy"),
  },
  {
    industry: "real-estate",
    name: "Real Estate & REITs",
    description: "Property management, lease accounting, fund structures, NAV calculations, and property-level reporting",
    icon: "building",
    typicalRevenue: "$30M - $1B",
    typicalEmployees: 200,
    commonEntities: ["PROPERTIES", "FUNDS", "TENANTS", "LENDERS", "PROPERTY_MANAGERS"],
    regulatoryFrameworks: ["ASC_842", "SEC_REG_S-X", "SOX", "LOCAL_TAX"],
    keyMetrics: ["NOI", "Occupancy Rate", "FFO", "Cap Rate", "Same-Store NOI Growth"],
    sampleData: sampleDataFor("real-estate"),
  },
  {
    industry: "nonprofit",
    name: "Non-Profit & Government",
    description: "Fund accounting, grant management, restricted funds, and public accountability reporting",
    icon: "landmark",
    typicalRevenue: "$10M - $500M",
    typicalEmployees: 400,
    commonEntities: ["GRANTS", "PROGRAMS", "DEPARTMENTS", "DONORS", "FUND_RESTRICTIONS"],
    regulatoryFrameworks: ["GASB", "FASB_958", "OMB_UNIFORM_GUIDANCE", "SINGLE_AUDIT"],
    keyMetrics: ["Program Expense Ratio", "Fund Balance", "Grant Utilization", "Donor Retention", "Cost Per Outcome"],
    sampleData: sampleDataFor("nonprofit"),
  },
];

function sampleDataFor(industry: string): IndustrySampleData {
  const base: IndustrySampleData = {
    accounts: 200,
    transactions: 5000,
    journalEntries: 500,
    bankAccounts: 8,
    vendors: 150,
    customers: 200,
    employees: 300,
    assets: 40,
    liabilities: 25,
    equityItems: 10,
    budgets: 12,
    forecasts: 6,
    taxJurisdictions: 3,
    auditFindings: 8,
    compliancePolicies: 15,
    boardMeetings: 12,
    resolutions: 20,
  };

  const overrides: Record<string, Partial<IndustrySampleData>> = {
    "manufacturing": { accounts: 350, transactions: 8000, vendors: 300, employees: 600 },
    "financial-services": { accounts: 500, transactions: 15000, compliancePolicies: 40, employees: 1200 },
    "technology": { accounts: 150, transactions: 4000, customers: 500, employees: 250 },
    "healthcare": { accounts: 400, transactions: 10000, employees: 2500, compliancePolicies: 30 },
    "retail": { accounts: 200, transactions: 20000, customers: 1000, vendors: 250 },
    "energy": { accounts: 600, transactions: 12000, employees: 1800, assets: 80 },
    "real-estate": { accounts: 100, transactions: 3000, assets: 50, liabilities: 30 },
    "nonprofit": { accounts: 80, transactions: 2000, employees: 350 },
  };

  return { ...base, ...(overrides[industry] ?? {}) };
}

// ─── Pilot Companies ───────────────────────────────────────

const PILOT_COMPANIES: PilotCompany[] = [
  {
    id: "pilot-acme-mfg",
    name: "Acme Manufacturing Corp",
    industry: "manufacturing",
    description: "Multi-national manufacturer with 3 plants across US, Mexico, and Germany. Complex intercompany and transfer pricing.",
    employees: 2500,
    revenue: "$450M",
    currency: "USD",
    countries: ["US", "MX", "DE"],
    subsidiaries: 4,
    dataYears: 5,
    features: ["intercompany", "transfer-pricing", "multi-currency", "cost-accounting"],
  },
  {
    id: "pilot-nexus-fin",
    name: "Nexus Financial Group",
    industry: "financial-services",
    description: "Regional bank with lending, wealth management, and insurance subsidiaries. Heavy regulatory requirements.",
    employees: 1200,
    revenue: "$800M",
    currency: "USD",
    countries: ["US", "GB"],
    subsidiaries: 3,
    dataYears: 7,
    features: ["regulatory-capital", "aml-kyc", "intercompany-lending", "risk-management"],
  },
  {
    id: "pilot-cirrus-tech",
    name: "Cirrus Technologies Inc",
    industry: "technology",
    description: "B2B SaaS company with $120M ARR, international operations in 5 countries, stock-based comp complexity.",
    employees: 450,
    revenue: "$180M",
    currency: "USD",
    countries: ["US", "UK", "DE", "IN", "JP"],
    subsidiaries: 2,
    dataYears: 4,
    features: ["saas-metrics", "stock-comp", "multi-currency", "rd-capitalization"],
  },
  {
    id: "pilot-meridian-health",
    name: "Meridian Health Systems",
    industry: "healthcare",
    description: "Integrated health system with 4 hospitals, 12 clinics, and clinical research division.",
    employees: 5000,
    revenue: "$1.2B",
    currency: "USD",
    countries: ["US"],
    subsidiaries: 6,
    dataYears: 8,
    features: ["clinical-trials", "payer-contracts", "cost-accounting", "hipaa"],
  },
  {
    id: "pilot-prism-retail",
    name: "Prism Retail Holdings",
    industry: "retail",
    description: "Omnichannel retailer with 200 stores, e-commerce, and franchise operations across North America.",
    employees: 3500,
    revenue: "$320M",
    currency: "USD",
    countries: ["US", "CA"],
    subsidiaries: 3,
    dataYears: 6,
    features: ["inventory-management", "multi-channel", "franchise-accounting", "seasonal-forecasting"],
  },
  {
    id: "pilot-apex-energy",
    name: "Apex Energy Partners",
    industry: "energy",
    description: "Mid-cap E&P company with upstream operations, midstream assets, and renewable energy division.",
    employees: 800,
    revenue: "$2.1B",
    currency: "USD",
    countries: ["US", "CA"],
    subsidiaries: 5,
    dataYears: 10,
    features: ["reserve-accounting", "hedge-accounting", "joint-ventures", "environmental"],
  },
  {
    id: "pilot-horizon-re",
    name: "Horizon Real Estate Trust",
    industry: "real-estate",
    description: "REIT with 45 commercial properties, 2 fund structures, and international joint ventures.",
    employees: 150,
    revenue: "$280M",
    currency: "USD",
    countries: ["US", "SG"],
    subsidiaries: 4,
    dataYears: 9,
    features: ["lease-accounting", "nav-reporting", "fund-structures", "property-reporting"],
  },
  {
    id: "pilot-atlas-np",
    name: "Atlas Foundation",
    industry: "nonprofit",
    description: "International development foundation with 8 programs, government grants, and restricted fund management.",
    employees: 300,
    revenue: "$95M",
    currency: "USD",
    countries: ["US", "KE", "IN", "BR"],
    subsidiaries: 2,
    dataYears: 6,
    features: ["fund-accounting", "grant-management", "restricted-funds", "program-reporting"],
  },
];

// ─── Public API ────────────────────────────────────────────

export class EnterprisePilot {
  static getIndustryTemplates(): IndustryTemplate[] {
    return INDUSTRY_TEMPLATES;
  }

  static getIndustryTemplate(industry: string): IndustryTemplate | undefined {
    return INDUSTRY_TEMPLATES.find((t) => t.industry === industry);
  }

  static getPilotCompanies(): PilotCompany[] {
    return PILOT_COMPANIES;
  }

  static getPilotCompany(id: string): PilotCompany | undefined {
    return PILOT_COMPANIES.find((c) => c.id === id);
  }

  static generatePilotSetup(industry: string): {
    template: IndustryTemplate;
    company: PilotCompany | undefined;
    setupPlan: string[];
    seedInstructions: string[];
  } {
    const template = this.getIndustryTemplate(industry);
    const company = PILOT_COMPANIES.find((c) => c.industry === industry);

    const setupPlan: string[] = [
      `Load ${template?.name ?? industry} industry template`,
      `Create company: ${company?.name ?? "New Company"} (${company?.currency ?? "USD"})`,
      `Set up ${company?.subsidiaries ?? 1} subsidiary entities across ${company?.countries?.length ?? 1} countries`,
      `Configure regulatory frameworks: ${template?.regulatoryFrameworks?.join(", ") ?? "Standard"}`,
      `Load chart of accounts (${template?.sampleData?.accounts ?? 200} accounts)`,
      `Seed transaction history (${template?.sampleData?.transactions ?? 5000} transactions)`,
      `Create ${template?.sampleData?.compliancePolicies ?? 15} compliance policies`,
      `Set up ${template?.sampleData?.boardMeetings ?? 12} board meetings`,
      `Initialize ${template?.sampleData?.budgets ?? 12} budget periods`,
      "Run enterprise readiness verification",
    ];

    const seedInstructions = [
      "Use existing seed infrastructure in src/server/db/seed/",
      "Do not generate new financial data — compose from specialist seed data",
      `Reference pilot company: ${company?.id ?? "new-pilot"}`,
      `Industry context: ${template?.industry ?? industry}`,
      "Ensure tenant isolation for all seeded records",
      "Validate cross-entity relationships after seeding",
    ];

    return { template: template!, company, setupPlan, seedInstructions };
  }

  static getDemoScenarios() {
    return DEMO_SCENARIOS;
  }

  static getDemoScenario(id: string) {
    return DEMO_SCENARIOS.find((s) => s.id === id);
  }

  static getScenarioSteps(scenarioId: string) {
    const scenario = this.getDemoScenario(scenarioId);
    return scenario?.steps ?? [];
  }
}
