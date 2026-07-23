import type { InvestmentService } from "./services/investment-service";
import type { Portfolio, Security, Issuer, Holding, IncomeEntry, PerformanceData, YieldData, RiskMetrics, Valuation, ComplianceRule, Forecast } from "./types";

const CCY = (c: string) => c;
const DATE = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const NOW = new Date();
const TENANT = "tenant_001";

export function seedInvestmentData(svc: InvestmentService): void {
  seedIssuers(svc);
  seedSecurities(svc);
  seedPortfolios(svc);
  seedHoldings(svc);
  seedIncome(svc);
  seedPerformance(svc);
  seedYield(svc);
  seedRisk(svc);
  seedValuation(svc);
  seedComplianceRules(svc);
  seedForecasts(svc);
}

function seedIssuers(svc: InvestmentService): void {
  const issuers: Issuer[] = [
    { id: "iss_001", name: "US Treasury", sector: "Government", country: "United States", region: "north-america", creditRating: "AAA", riskRating: "low", isGovernment: true, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_002", name: "European Central Bank", sector: "Government", country: "Germany", region: "europe", creditRating: "AAA", riskRating: "low", isGovernment: true, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_003", name: "JPMorgan Chase", sector: "Banking", country: "United States", region: "north-america", creditRating: "A+", riskRating: "medium-low", isGovernment: false, isSupranational: false, isFinancialInstitution: true, status: "active" },
    { id: "iss_004", name: "Goldman Sachs", sector: "Banking", country: "United States", region: "north-america", creditRating: "A+", riskRating: "medium-low", isGovernment: false, isSupranational: false, isFinancialInstitution: true, status: "active" },
    { id: "iss_005", name: "Apple Inc", sector: "Technology", country: "United States", region: "north-america", creditRating: "AA+", riskRating: "low", isGovernment: false, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_006", name: "Microsoft Corporation", sector: "Technology", country: "United States", region: "north-america", creditRating: "AAA", riskRating: "low", isGovernment: false, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_007", name: "UK Treasury", sector: "Government", country: "United Kingdom", region: "europe", creditRating: "AA", riskRating: "low", isGovernment: true, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_008", name: "Japanese Government", sector: "Government", country: "Japan", region: "asia-pacific", creditRating: "A+", riskRating: "low", isGovernment: true, isSupranational: false, isFinancialInstitution: false, status: "active" },
    { id: "iss_009", name: "World Bank", sector: "Supranational", country: "United States", region: "global", creditRating: "AAA", riskRating: "low", isGovernment: false, isSupranational: true, isFinancialInstitution: false, status: "active" },
    { id: "iss_010", name: "BlackRock", sector: "Asset Management", country: "United States", region: "north-america", creditRating: "AA-", riskRating: "low", isGovernment: false, isSupranational: false, isFinancialInstitution: true, status: "active" },
  ];
  issuers.forEach((i) => svc.securities.addIssuer(i));
}

function seedSecurities(svc: InvestmentService): void {
  const securities: Security[] = [
    { id: "sec_001", internalId: "TREAS-3M-001", isin: "US912796KQ18", cusip: "912796KQ1", ticker: "BIL", name: "US Treasury 3-Month Bill", issuer: "US Treasury", issuerId: "iss_001", sector: "Government", country: "United States", region: "north-america", currency: "USD", securityType: "treasury-bill", creditRating: "AAA", riskRating: "low", liquidityRating: "high", issueSize: 50000000000, outstandingAmount: 35000000000, issueDate: DATE(2026, 1, 15), maturityDate: DATE(2026, 4, 15), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_002", internalId: "TREAS-10Y-001", isin: "US912810SE98", cusip: "912810SE9", ticker: "IEF", name: "US Treasury 10-Year Note", issuer: "US Treasury", issuerId: "iss_001", sector: "Government", country: "United States", region: "north-america", currency: "USD", securityType: "government-bond", creditRating: "AAA", riskRating: "low", coupon: 4.125, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "actual/actual", liquidityRating: "high", issueSize: 35000000000, outstandingAmount: 35000000000, issueDate: DATE(2024, 3, 1), maturityDate: DATE(2034, 3, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_003", internalId: "CORP-MSFT-001", isin: "US594918AA10", cusip: "594918AA1", ticker: "MSFT", name: "Microsoft 2.5% 2030", issuer: "Microsoft Corporation", issuerId: "iss_006", sector: "Technology", country: "United States", region: "north-america", currency: "USD", securityType: "corporate-bond", creditRating: "AAA", riskRating: "low", coupon: 2.5, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "30/360", liquidityRating: "high", issueSize: 10000000000, outstandingAmount: 8000000000, issueDate: DATE(2023, 6, 15), maturityDate: DATE(2030, 6, 15), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_004", internalId: "CD-JPM-001", isin: "US46625HHH72", cusip: "46625HHH7", name: "JPMorgan 6-Month CD", issuer: "JPMorgan Chase", issuerId: "iss_003", sector: "Banking", country: "United States", region: "north-america", currency: "USD", securityType: "certificate-of-deposit", creditRating: "A+", riskRating: "medium-low", coupon: 4.75, couponType: "fixed", couponFrequency: "at-maturity", dayCountConvention: "actual/360", liquidityRating: "medium", issueSize: 5000000000, outstandingAmount: 5000000000, issueDate: DATE(2026, 2, 1), maturityDate: DATE(2026, 8, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_005", internalId: "MMF-BLK-001", name: "BlackRock T-Fund Money Market Fund", issuer: "BlackRock", issuerId: "iss_010", sector: "Asset Management", country: "United States", region: "north-america", currency: "USD", securityType: "money-market-fund", creditRating: "AAA", riskRating: "low", liquidityRating: "high", issueSize: 200000000000, outstandingAmount: 200000000000, issueDate: DATE(2020, 1, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_006", internalId: "GOVT-UK-001", isin: "GB00BDBRT105", ticker: "UKT", name: "UK Treasury 3.75% 2030", issuer: "UK Treasury", issuerId: "iss_007", sector: "Government", country: "United Kingdom", region: "europe", currency: "GBP", securityType: "government-bond", creditRating: "AA", riskRating: "low", coupon: 3.75, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "actual/actual", liquidityRating: "high", issueSize: 20000000000, outstandingAmount: 20000000000, issueDate: DATE(2024, 9, 1), maturityDate: DATE(2030, 9, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_007", internalId: "CORP-AAPL-001", isin: "US037833DQ50", cusip: "037833DQ5", ticker: "AAPL", name: "Apple 2.0% 2029", issuer: "Apple Inc", issuerId: "iss_005", sector: "Technology", country: "United States", region: "north-america", currency: "USD", securityType: "corporate-bond", creditRating: "AA+", riskRating: "low", coupon: 2.0, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "30/360", liquidityRating: "high", issueSize: 8000000000, outstandingAmount: 6000000000, issueDate: DATE(2024, 1, 15), maturityDate: DATE(2029, 1, 15), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_008", internalId: "FRN-GS-001", name: "Goldman Sachs Floating Rate Note 2027", issuer: "Goldman Sachs", issuerId: "iss_004", sector: "Banking", country: "United States", region: "north-america", currency: "USD", securityType: "floating-rate-note", creditRating: "A+", riskRating: "medium-low", coupon: 5.25, couponType: "floating", couponFrequency: "quarterly", dayCountConvention: "actual/360", liquidityRating: "medium", issueSize: 4000000000, outstandingAmount: 4000000000, issueDate: DATE(2025, 6, 1), maturityDate: DATE(2027, 6, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_009", internalId: "SUPRA-WB-001", name: "World Bank Sustainable Development Bond 2031", issuer: "World Bank", issuerId: "iss_009", sector: "Supranational", country: "United States", region: "global", currency: "USD", securityType: "government-bond", creditRating: "AAA", riskRating: "low", coupon: 2.875, couponType: "fixed", couponFrequency: "annual", dayCountConvention: "actual/365", liquidityRating: "high", issueSize: 5000000000, outstandingAmount: 5000000000, issueDate: DATE(2024, 4, 1), maturityDate: DATE(2031, 4, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_010", internalId: "JGB-001", name: "Japanese Government 0.5% 2035", issuer: "Japanese Government", issuerId: "iss_008", sector: "Government", country: "Japan", region: "asia-pacific", currency: "JPY", securityType: "government-bond", creditRating: "A+", riskRating: "low", coupon: 0.5, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "actual/actual", liquidityRating: "high", issueSize: 500000000000, outstandingAmount: 500000000000, issueDate: DATE(2022, 1, 1), maturityDate: DATE(2035, 1, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_011", internalId: "CP-GS-001", name: "Goldman Sachs 90-Day Commercial Paper", issuer: "Goldman Sachs", issuerId: "iss_004", sector: "Banking", country: "United States", region: "north-america", currency: "USD", securityType: "commercial-paper", creditRating: "A+", riskRating: "low", liquidityRating: "high", issueSize: 3000000000, outstandingAmount: 3000000000, issueDate: DATE(2026, 3, 1), maturityDate: DATE(2026, 6, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_012", internalId: "ETF-AGG-001", ticker: "AGG", name: "iShares Core US Aggregate Bond ETF", issuer: "BlackRock", issuerId: "iss_010", sector: "Asset Management", country: "United States", region: "north-america", currency: "USD", securityType: "exchange-traded-fund", creditRating: "AA", riskRating: "medium-low", liquidityRating: "high", issueSize: 80000000000, outstandingAmount: 80000000000, issueDate: DATE(2003, 9, 22), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_013", internalId: "FD-JPM-001", name: "JPMorgan 12-Month Fixed Deposit", issuer: "JPMorgan Chase", issuerId: "iss_003", sector: "Banking", country: "United States", region: "north-america", currency: "USD", securityType: "fixed-deposit", creditRating: "A+", riskRating: "medium-low", coupon: 4.35, couponType: "fixed", couponFrequency: "at-maturity", dayCountConvention: "actual/360", liquidityRating: "medium", issueSize: 2000000000, outstandingAmount: 2000000000, issueDate: DATE(2026, 1, 1), maturityDate: DATE(2027, 1, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_014", internalId: "MUNI-NY-001", isin: "US64985PCF26", name: "NY State General Obligation 3.25% 2032", issuer: "US Treasury", issuerId: "iss_001", sector: "Municipal", country: "United States", region: "north-america", currency: "USD", securityType: "municipal-bond", creditRating: "AA", riskRating: "low", coupon: 3.25, couponType: "fixed", couponFrequency: "semi-annual", dayCountConvention: "30/360", liquidityRating: "medium", issueSize: 3000000000, outstandingAmount: 3000000000, issueDate: DATE(2024, 6, 1), maturityDate: DATE(2032, 6, 1), status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "sec_015", internalId: "FXD-EUR-001", name: "EUR 6-Month Fixed Deposit", issuer: "JPMorgan Chase", issuerId: "iss_003", sector: "Banking", country: "Germany", region: "europe", currency: "EUR", securityType: "foreign-currency-deposit", creditRating: "A+", riskRating: "medium-low", coupon: 2.85, couponType: "fixed", couponFrequency: "at-maturity", dayCountConvention: "actual/360", liquidityRating: "medium", issueSize: 1000000000, outstandingAmount: 1000000000, issueDate: DATE(2026, 2, 15), maturityDate: DATE(2026, 8, 15), status: "active", createdAt: NOW, updatedAt: NOW },
  ];
  securities.forEach((s) => svc.securities.addSecurity(s));
}

function seedPortfolios(svc: InvestmentService): void {
  const portfolios: Portfolio[] = [
    { id: "port_001", name: "Enterprise Consolidated Portfolio", type: "enterprise", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_002", name: "North America Liquidity Portfolio", type: "liquidity", parentId: "port_001", currency: "USD", region: "north-america", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_003", name: "Europe Liquidity Portfolio", type: "liquidity", parentId: "port_001", currency: "EUR", region: "europe", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_004", name: "Capital Preservation Portfolio", type: "capital-preservation", parentId: "port_001", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_005", name: "Income Portfolio", type: "income", parentId: "port_001", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_006", name: "Growth Portfolio", type: "growth", parentId: "port_001", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_007", name: "APAC Regional Portfolio", type: "regional", parentId: "port_001", currency: "JPY", region: "asia-pacific", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_008", name: "EMEA Regional Portfolio", type: "regional", parentId: "port_001", currency: "GBP", region: "europe", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_009", name: "Tech Sector Investment Portfolio", type: "investment-strategy", parentId: "port_001", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
    { id: "port_010", name: "Corporate Treasury Portfolio", type: "corporate", parentId: "port_001", currency: "USD", region: "global", tenantId: TENANT, status: "active", createdAt: DATE(2023, 1, 1), updatedAt: NOW },
  ];
  portfolios.forEach((p) => svc.portfolios.add(p));
}

function seedHoldings(svc: InvestmentService): void {
  const now = Date.now();
  const holdings: Holding[] = [
    { id: "hld_001", portfolioId: "port_002", securityId: "sec_001", quantity: 50000000, units: 50000000, costBasis: 49950000, bookValue: 49950000, marketValue: 49980000, fairValue: 49980000, faceValue: 50000000, parValue: 50000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2026, 3, 15), accruedInterest: 0, realizedGain: 0, unrealizedGain: 30000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_002", portfolioId: "port_002", securityId: "sec_002", quantity: 25000000, units: 25000000, costBasis: 24500000, bookValue: 24500000, marketValue: 25300000, fairValue: 25300000, faceValue: 25000000, parValue: 25000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2024, 3, 1), accruedInterest: 515625, realizedGain: 0, unrealizedGain: 800000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_003", portfolioId: "port_002", securityId: "sec_003", quantity: 10000000, units: 10000000, costBasis: 9800000, bookValue: 9800000, marketValue: 10200000, fairValue: 10200000, faceValue: 10000000, parValue: 10000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2023, 6, 15), accruedInterest: 125000, realizedGain: 0, unrealizedGain: 400000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_004", portfolioId: "port_002", securityId: "sec_004", quantity: 5000000, units: 5000000, costBasis: 5000000, bookValue: 5000000, marketValue: 5093750, fairValue: 5093750, faceValue: 5000000, parValue: 5000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2026, 2, 1), accruedInterest: 93750, realizedGain: 0, unrealizedGain: 93750, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_005", portfolioId: "port_002", securityId: "sec_005", quantity: 30000000, units: 30000000, costBasis: 30000000, bookValue: 30000000, marketValue: 30075000, fairValue: 30075000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2026, 1, 1), accruedInterest: 0, realizedGain: 0, unrealizedGain: 75000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_006", portfolioId: "port_003", securityId: "sec_006", quantity: 15000000, units: 15000000, costBasis: 14250000, bookValue: 14250000, marketValue: 14850000, fairValue: 14850000, faceValue: 15000000, parValue: 15000000, currency: "GBP", fxRate: 0.79, fxTranslation: -2250000, purchaseDate: DATE(2024, 9, 1), accruedInterest: 281250, realizedGain: 0, unrealizedGain: 600000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_007", portfolioId: "port_002", securityId: "sec_007", quantity: 8000000, units: 8000000, costBasis: 7840000, bookValue: 7840000, marketValue: 8120000, fairValue: 8120000, faceValue: 8000000, parValue: 8000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2024, 1, 15), accruedInterest: 80000, realizedGain: 0, unrealizedGain: 280000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_008", portfolioId: "port_005", securityId: "sec_008", quantity: 5000000, units: 5000000, costBasis: 5000000, bookValue: 5000000, marketValue: 5065625, fairValue: 5065625, faceValue: 5000000, parValue: 5000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2025, 6, 1), accruedInterest: 65625, realizedGain: 0, unrealizedGain: 65625, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_009", portfolioId: "port_004", securityId: "sec_009", quantity: 5000000, units: 5000000, costBasis: 4900000, bookValue: 4900000, marketValue: 5050000, fairValue: 5050000, faceValue: 5000000, parValue: 5000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2024, 4, 1), accruedInterest: 143750, realizedGain: 0, unrealizedGain: 150000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_010", portfolioId: "port_007", securityId: "sec_010", quantity: 100000000, units: 100000000, costBasis: 85000000, bookValue: 85000000, marketValue: 85200000, fairValue: 85200000, faceValue: 100000000, parValue: 100000000, currency: "JPY", fxRate: 0.0069, fxTranslation: -58000000, purchaseDate: DATE(2022, 1, 1), accruedInterest: 250000, realizedGain: 0, unrealizedGain: 200000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_011", portfolioId: "port_002", securityId: "sec_011", quantity: 3000000, units: 3000000, costBasis: 2985000, bookValue: 2985000, marketValue: 2991000, fairValue: 2991000, faceValue: 3000000, parValue: 3000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2026, 3, 1), accruedInterest: 0, realizedGain: 0, unrealizedGain: 6000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_012", portfolioId: "port_006", securityId: "sec_012", quantity: 100000, units: 100000, costBasis: 9700000, bookValue: 9700000, marketValue: 9850000, fairValue: 9850000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2025, 6, 1), accruedInterest: 0, realizedGain: 0, unrealizedGain: 150000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_013", portfolioId: "port_002", securityId: "sec_013", quantity: 2000000, units: 2000000, costBasis: 2000000, bookValue: 2000000, marketValue: 2087000, fairValue: 2087000, faceValue: 2000000, parValue: 2000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2026, 1, 1), accruedInterest: 87000, realizedGain: 0, unrealizedGain: 87000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_014", portfolioId: "port_004", securityId: "sec_014", quantity: 3000000, units: 3000000, costBasis: 2940000, bookValue: 2940000, marketValue: 3060000, fairValue: 3060000, faceValue: 3000000, parValue: 3000000, currency: "USD", fxRate: 1, fxTranslation: 0, purchaseDate: DATE(2024, 6, 1), accruedInterest: 48750, realizedGain: 0, unrealizedGain: 120000, status: "active", createdAt: NOW, updatedAt: NOW },
    { id: "hld_015", portfolioId: "port_003", securityId: "sec_015", quantity: 1000000, units: 1000000, costBasis: 1000000, bookValue: 1000000, marketValue: 1014250, fairValue: 1014250, faceValue: 1000000, parValue: 1000000, currency: "EUR", fxRate: 1.08, fxTranslation: 80000, purchaseDate: DATE(2026, 2, 15), accruedInterest: 14250, realizedGain: 0, unrealizedGain: 14250, status: "active", createdAt: NOW, updatedAt: NOW },
  ];
  holdings.forEach((h) => svc.holdings.add(h));
}

function seedIncome(svc: InvestmentService): void {
  const incomes: IncomeEntry[] = [
    { id: "inc_001", holdingId: "hld_002", type: "coupon", amount: 515625, currency: "USD", payDate: DATE(2026, 3, 1), accruedDays: 180, status: "received" },
    { id: "inc_002", holdingId: "hld_002", type: "coupon", amount: 515625, currency: "USD", payDate: DATE(2026, 9, 1), accruedDays: 180, status: "projected" },
    { id: "inc_003", holdingId: "hld_003", type: "coupon", amount: 125000, currency: "USD", payDate: DATE(2026, 6, 15), accruedDays: 180, status: "received" },
    { id: "inc_004", holdingId: "hld_003", type: "coupon", amount: 125000, currency: "USD", payDate: DATE(2026, 12, 15), accruedDays: 180, status: "projected" },
    { id: "inc_005", holdingId: "hld_006", type: "coupon", amount: 281250, currency: "GBP", payDate: DATE(2026, 3, 1), accruedDays: 180, status: "received" },
    { id: "inc_006", holdingId: "hld_006", type: "coupon", amount: 281250, currency: "GBP", payDate: DATE(2026, 9, 1), accruedDays: 180, status: "projected" },
    { id: "inc_007", holdingId: "hld_007", type: "coupon", amount: 80000, currency: "USD", payDate: DATE(2026, 1, 15), accruedDays: 180, status: "received" },
    { id: "inc_008", holdingId: "hld_007", type: "coupon", amount: 80000, currency: "USD", payDate: DATE(2026, 7, 15), accruedDays: 180, status: "projected" },
    { id: "inc_009", holdingId: "hld_008", type: "interest", amount: 65625, currency: "USD", payDate: DATE(2026, 3, 1), accruedDays: 90, status: "received" },
    { id: "inc_010", holdingId: "hld_008", type: "interest", amount: 65625, currency: "USD", payDate: DATE(2026, 6, 1), accruedDays: 90, status: "projected" },
    { id: "inc_011", holdingId: "hld_009", type: "coupon", amount: 143750, currency: "USD", payDate: DATE(2026, 4, 1), accruedDays: 365, status: "projected" },
    { id: "inc_012", holdingId: "hld_013", type: "interest", amount: 87000, currency: "USD", payDate: DATE(2027, 1, 1), accruedDays: 365, status: "projected" },
    { id: "inc_013", holdingId: "hld_014", type: "coupon", amount: 48750, currency: "USD", payDate: DATE(2026, 6, 1), accruedDays: 180, status: "received" },
    { id: "inc_014", holdingId: "hld_014", type: "coupon", amount: 48750, currency: "USD", payDate: DATE(2026, 12, 1), accruedDays: 180, status: "projected" },
    { id: "inc_015", holdingId: "hld_005", type: "dividend", amount: 120000, currency: "USD", payDate: DATE(2026, 3, 1), status: "received" },
    { id: "inc_016", holdingId: "hld_005", type: "dividend", amount: 120000, currency: "USD", payDate: DATE(2026, 4, 1), status: "projected" },
  ];
  incomes.forEach((i) => svc.income.record(i));
}

function seedPerformance(svc: InvestmentService): void {
  const performances: PerformanceData[] = [
    { id: "perf_001", portfolioId: "port_002", period: "monthly", startDate: DATE(2026, 5, 1), endDate: DATE(2026, 6, 1), returnValue: 0.32, timeWeightedReturn: 0.32, moneyWeightedReturn: 0.31, sharpeRatio: 1.2, sortinoRatio: 1.8, treynorRatio: 0.08, trackingError: 0.15, informationRatio: 0.45 },
    { id: "perf_002", portfolioId: "port_002", period: "quarterly", startDate: DATE(2026, 3, 1), endDate: DATE(2026, 6, 1), returnValue: 0.95, timeWeightedReturn: 0.95, moneyWeightedReturn: 0.93 },
    { id: "perf_003", portfolioId: "port_002", period: "yearly", startDate: DATE(2025, 6, 1), endDate: DATE(2026, 6, 1), returnValue: 3.85, timeWeightedReturn: 3.82, moneyWeightedReturn: 3.78, alpha: 0.12, beta: 0.92, sharpeRatio: 1.15, sortinoRatio: 1.75, treynorRatio: 0.08, trackingError: 0.15, informationRatio: 0.42 },
    { id: "perf_004", portfolioId: "port_002", period: "since-inception", startDate: DATE(2023, 1, 1), endDate: DATE(2026, 6, 1), returnValue: 12.45, timeWeightedReturn: 12.32, moneyWeightedReturn: 12.18, irr: 11.95 },
    { id: "perf_005", portfolioId: "port_005", period: "yearly", startDate: DATE(2025, 6, 1), endDate: DATE(2026, 6, 1), returnValue: 4.25, timeWeightedReturn: 4.22, moneyWeightedReturn: 4.18, sharpeRatio: 1.35 },
    { id: "perf_006", portfolioId: "port_006", period: "yearly", startDate: DATE(2025, 6, 1), endDate: DATE(2026, 6, 1), returnValue: 6.82, timeWeightedReturn: 6.75, moneyWeightedReturn: 6.65, alpha: 0.35, beta: 1.15, sharpeRatio: 0.95 },
    { id: "perf_007", portfolioId: "port_004", period: "yearly", startDate: DATE(2025, 6, 1), endDate: DATE(2026, 6, 1), returnValue: 2.95, timeWeightedReturn: 2.92, moneyWeightedReturn: 2.90, sharpeRatio: 0.85 },
  ];
  performances.forEach((p) => svc.performance.record(p));
}

function seedYield(svc: InvestmentService): void {
  const yields: YieldData[] = [
    { id: "yld_001", holdingId: "hld_001", asOf: NOW, currentYield: 4.85, effectiveYield: 4.82, annualizedYield: 4.85 },
    { id: "yld_002", holdingId: "hld_002", asOf: NOW, currentYield: 4.12, yieldToMaturity: 4.08, yieldToWorst: 4.08, effectiveYield: 4.15, annualizedYield: 4.12 },
    { id: "yld_003", holdingId: "hld_003", asOf: NOW, currentYield: 2.50, yieldToMaturity: 2.45, yieldToWorst: 2.45, effectiveYield: 2.52, annualizedYield: 2.50 },
    { id: "yld_004", holdingId: "hld_004", asOf: NOW, currentYield: 4.75, annualizedYield: 4.75 },
    { id: "yld_005", holdingId: "hld_008", asOf: NOW, currentYield: 5.25, effectiveYield: 5.30 },
    { id: "yld_006", holdingId: "hld_009", asOf: NOW, currentYield: 2.875, yieldToMaturity: 2.82, yieldToWorst: 2.82 },
    { id: "yld_007", portfolioId: "port_002", asOf: NOW, currentYield: 4.15, runningYield: 4.08, portfolioYield: 4.12, weightedAverageYield: 4.05 },
  ];
  yields.forEach((y) => svc.yield_.record(y));
}

function seedRisk(svc: InvestmentService): void {
  const risks: RiskMetrics[] = [
    { id: "rsk_001", portfolioId: "port_002", asOf: NOW, marketRisk: 3.2, interestRateRisk: 4.1, creditRisk: 1.8, liquidityRisk: 0.5, concentrationRisk: 8.5, issuerRisk: 6.2, sectorRisk: 12.3, countryRisk: 5.1, currencyRisk: 3.8, durationRisk: 4.2, valueAtRisk: 1250000, stressTestLoss: 3500000, diversificationScore: 72 },
    { id: "rsk_002", portfolioId: "port_003", asOf: NOW, marketRisk: 4.5, interestRateRisk: 5.2, creditRisk: 2.1, liquidityRisk: 1.2, concentrationRisk: 15.3, issuerRisk: 8.5, sectorRisk: 18.2, countryRisk: 25.1, currencyRisk: 12.5, durationRisk: 5.8, valueAtRisk: 850000, stressTestLoss: 2100000, diversificationScore: 45 },
    { id: "rsk_003", portfolioId: "port_004", asOf: NOW, marketRisk: 2.1, interestRateRisk: 3.5, creditRisk: 0.8, liquidityRisk: 0.3, concentrationRisk: 5.2, issuerRisk: 4.1, sectorRisk: 8.5, countryRisk: 3.2, currencyRisk: 1.5, durationRisk: 3.8, valueAtRisk: 450000, stressTestLoss: 1200000, diversificationScore: 85 },
    { id: "rsk_004", portfolioId: "port_005", asOf: NOW, marketRisk: 2.8, interestRateRisk: 3.8, creditRisk: 2.5, liquidityRisk: 0.8, concentrationRisk: 12.1, issuerRisk: 7.5, sectorRisk: 15.2, countryRisk: 4.8, currencyRisk: 2.5, durationRisk: 3.5, valueAtRisk: 320000, stressTestLoss: 950000, diversificationScore: 60 },
  ];
  risks.forEach((r) => svc.risk.record(r));
}

function seedValuation(svc: InvestmentService): void {
  const valuations: Valuation[] = [
    { id: "val_001", portfolioId: "port_002", asOf: NOW, bookValue: 112785000, marketValue: 116014750, fairValue: 116014750, nav: 116014750, totalInvestments: 10, cashHeld: 5000000, accruedIncome: 901375, currency: "USD", fxRate: 1, status: "final" },
    { id: "val_002", portfolioId: "port_003", asOf: NOW, bookValue: 15250000, marketValue: 15864250, fairValue: 15864250, nav: 15864250, totalInvestments: 2, cashHeld: 2000000, accruedIncome: 295500, currency: "EUR", fxRate: 1.08, status: "final" },
    { id: "val_003", portfolioId: "port_004", asOf: NOW, bookValue: 7840000, marketValue: 8110000, fairValue: 8110000, nav: 8110000, totalInvestments: 2, cashHeld: 3000000, accruedIncome: 192500, currency: "USD", fxRate: 1, status: "final" },
  ];
  valuations.forEach((v) => svc.valuation.record(v));
}

function seedComplianceRules(svc: InvestmentService): void {
  const rules: ComplianceRule[] = [
    { id: "cmp_001", name: "Single Issuer Limit", type: "issuer-limit", parameters: { limit: 15, key: "US Treasury" }, severity: "critical", enabled: true },
    { id: "cmp_002", name: "Sector Concentration Limit", type: "sector-limit", parameters: { limit: 40, key: "Government" }, severity: "warning", enabled: true },
    { id: "cmp_003", name: "Minimum Credit Rating", type: "credit-rating-limit", parameters: { limit: 20, minRating: "BBB-" }, severity: "critical", enabled: true },
    { id: "cmp_004", name: "Country Exposure Limit", type: "country-limit", parameters: { limit: 30, key: "United States" }, severity: "warning", enabled: true },
    { id: "cmp_005", name: "Duration Limit", type: "duration-limit", parameters: { limit: 8 }, severity: "warning", enabled: true },
  ];
  rules.forEach((r) => svc.compliance.addRule(r));
}

function seedForecasts(svc: InvestmentService): void {
  const holdings = svc.holdings.getByPortfolio("port_002");
  const securitiesMap = new Map(svc.securities.getAllSecurities().map((s) => [s.id, s]));
  const income = svc.income.getByHolding(holdings[0]?.id ?? "");
  const fc = svc.forecast.generate("port_002", holdings, securitiesMap, income);
  svc.forecast.record(fc);
}
