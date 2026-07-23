import { glService } from "./services/gl-service";
import type {
  Account, Journal, JournalEntry, PostingBatch, PostingRule, PostingTemplate,
  AccountingPeriod, FiscalYear, ClosingChecklist, Ledger, SubLedger,
  AccountBalance, LedgerBalance, TrialBalance, CostCenter, ProfitCenter,
  BusinessUnit, AllocationRule, ExchangeRateReference,
  FinancialStatement, FinancialStatementSection, BalanceSheet, IncomeStatement, CashFlowStatement, RetainedEarnings,
  IntercompanyAccount, GLAlert, GLRecommendation, GLAnalyticsKPI,
} from "./types";

function d(y: number, m: number, d: number): Date { return new Date(Date.UTC(y, m - 1, d)); }

export function seedGeneralLedger(): void {
  const cid = "company-1";
  const aid = (n: string) => `acc-${n}`;
  const lid = (n: string) => `ledger-${n}`;
  const slid = (n: string) => `sl-${n}`;
  const pid = (n: string) => `per-${n}`;
  const fyid = (n: string) => `fy-${n}`;
  const jid = (n: string) => `journal-${n}`;
  const eid = (n: string) => `entry-${n}`;
  const bid = (n: string) => `batch-${n}`;
  const coid = (n: string) => `cc-${n}`;
  const poid = (n: string) => `pc-${n}`;
  const buid = (n: string) => `bu-${n}`;

  const coa = glService.chartOfAccounts;
  const journals = glService.journals;
  const posting = glService.posting;
  const periods = glService.periods;
  const ledger = glService.ledger;
  const subledger = glService.subledger;
  const allocations = glService.allocations;
  const revaluation = glService.revaluation;
  const consolidation = glService.consolidation;
  const fs = glService.financialStatements;
  const analytics = glService.analytics;

  // Cost Centers
  const costCenters: CostCenter[] = [
    { id: coid("1"), code: "CC-EXEC", name: "Executive", description: "Executive leadership", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("2"), code: "CC-FIN", name: "Finance", description: "Finance & accounting", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("3"), code: "CC-ENG", name: "Engineering", description: "Software engineering", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("4"), code: "CC-SALES", name: "Sales", description: "Sales & marketing", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("5"), code: "CC-OPS", name: "Operations", description: "Business operations", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("6"), code: "CC-HR", name: "Human Resources", description: "HR & personnel", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("7"), code: "CC-RD", name: "R&D", description: "Research & development", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("8"), code: "CC-ADMIN", name: "Administration", description: "General admin", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("9"), code: "CC-IT", name: "IT", description: "Information technology", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: coid("10"), code: "CC-LEGAL", name: "Legal", description: "Legal & compliance", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const cc of costCenters) {
    const acct: Account = {
      id: cc.id, chartOfAccountId: "coa-us-gaap", accountNumber: cc.code, name: cc.name,
      description: cc.description, category: "statistical", type: "statistical",
      parentId: undefined, isActive: cc.isActive, naturalBalance: "debit",
      effectiveFrom: d(2024, 1, 1), effectiveTo: undefined,
      companyId: cid, createdAt: cc.createdAt, updatedAt: cc.updatedAt,
    };
    coa.addAccount(acct);
  }

  // Profit Centers
  const profitCenters: ProfitCenter[] = [
    { id: poid("1"), code: "PC-NA", name: "North America", description: "North America operations", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: poid("2"), code: "PC-EMEA", name: "EMEA", description: "Europe, Middle East, Africa", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: poid("3"), code: "PC-APAC", name: "APAC", description: "Asia Pacific", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: poid("4"), code: "PC-LATAM", name: "LATAM", description: "Latin America", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: poid("5"), code: "PC-GLOBAL", name: "Global", description: "Global operations", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];

  // Business Units
  const businessUnits: BusinessUnit[] = [
    { id: buid("1"), code: "BU-CORE", name: "Core Platform", description: "Core platform products", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: buid("2"), code: "BU-ENT", name: "Enterprise", description: "Enterprise solutions", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: buid("3"), code: "BU-CLOUD", name: "Cloud Services", description: "Cloud infrastructure", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: buid("4"), code: "BU-CONSULT", name: "Consulting", description: "Professional services", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: buid("5"), code: "BU-SUPPORT", name: "Support", description: "Customer support", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];

  // US-GAAP Chart of Accounts
  const accounts: Account[] = [
    // Assets (1000-1999)
    { id: aid("1000"), chartOfAccountId: "coa-us-gaap", accountNumber: "1000", name: "Cash & Cash Equivalents", description: "Cash on hand and demand deposits", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1010"), chartOfAccountId: "coa-us-gaap", accountNumber: "1010", name: "Cash - Operating", description: "Operating cash accounts", category: "assets", type: "balance-sheet", parentId: aid("1000"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1011"), chartOfAccountId: "coa-us-gaap", accountNumber: "1011", name: "Cash - Payroll", description: "Payroll cash account", category: "assets", type: "balance-sheet", parentId: aid("1000"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1020"), chartOfAccountId: "coa-us-gaap", accountNumber: "1020", name: "Short-term Investments", description: "Marketable securities < 1 year", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1100"), chartOfAccountId: "coa-us-gaap", accountNumber: "1100", name: "Accounts Receivable", description: "Trade accounts receivable", category: "assets", type: "balance-sheet", isControlAccount: true, naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1101"), chartOfAccountId: "coa-us-gaap", accountNumber: "1101", name: "AR - Trade", description: "Trade accounts receivable", category: "assets", type: "balance-sheet", parentId: aid("1100"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1105"), chartOfAccountId: "coa-us-gaap", accountNumber: "1105", name: "Allowance for Doubtful Accounts", description: "Bad debt reserve", category: "contra-asset", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1200"), chartOfAccountId: "coa-us-gaap", accountNumber: "1200", name: "Inventory", description: "Inventory on hand", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1300"), chartOfAccountId: "coa-us-gaap", accountNumber: "1300", name: "Prepaid Expenses", description: "Prepaid expenses and deposits", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1400"), chartOfAccountId: "coa-us-gaap", accountNumber: "1400", name: "Fixed Assets", description: "Property, plant & equipment", category: "assets", type: "balance-sheet", isControlAccount: true, naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1401"), chartOfAccountId: "coa-us-gaap", accountNumber: "1401", name: "Buildings", description: "Office buildings", category: "assets", type: "balance-sheet", parentId: aid("1400"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1402"), chartOfAccountId: "coa-us-gaap", accountNumber: "1402", name: "Equipment", description: "Office equipment", category: "assets", type: "balance-sheet", parentId: aid("1400"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1403"), chartOfAccountId: "coa-us-gaap", accountNumber: "1403", name: "Computer Equipment", description: "Computers and servers", category: "assets", type: "balance-sheet", parentId: aid("1400"), naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1405"), chartOfAccountId: "coa-us-gaap", accountNumber: "1405", name: "Accumulated Depreciation", description: "Accumulated depreciation on fixed assets", category: "contra-asset", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1500"), chartOfAccountId: "coa-us-gaap", accountNumber: "1500", name: "Intangible Assets", description: "Patents, trademarks, goodwill", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1600"), chartOfAccountId: "coa-us-gaap", accountNumber: "1600", name: "Intercompany Receivables", description: "Due from subsidiaries", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1700"), chartOfAccountId: "coa-us-gaap", accountNumber: "1700", name: "Deferred Tax Assets", description: "Deferred tax assets", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("1800"), chartOfAccountId: "coa-us-gaap", accountNumber: "1800", name: "Other Assets", description: "Other non-current assets", category: "assets", type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Liabilities (2000-2999)
    { id: aid("2000"), chartOfAccountId: "coa-us-gaap", accountNumber: "2000", name: "Accounts Payable", description: "Trade accounts payable", category: "liabilities", type: "balance-sheet", isControlAccount: true, naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2001"), chartOfAccountId: "coa-us-gaap", accountNumber: "2001", name: "AP - Trade", description: "Trade accounts payable", category: "liabilities", type: "balance-sheet", parentId: aid("2000"), naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2010"), chartOfAccountId: "coa-us-gaap", accountNumber: "2010", name: "Accrued Liabilities", description: "Accrued expenses", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2020"), chartOfAccountId: "coa-us-gaap", accountNumber: "2020", name: "Short-term Debt", description: "Short-term borrowings", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2030"), chartOfAccountId: "coa-us-gaap", accountNumber: "2030", name: "Deferred Revenue", description: "Unearned revenue", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2100"), chartOfAccountId: "coa-us-gaap", accountNumber: "2100", name: "Long-term Debt", description: "Long-term borrowings", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2200"), chartOfAccountId: "coa-us-gaap", accountNumber: "2200", name: "Intercompany Payables", description: "Due to subsidiaries", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2300"), chartOfAccountId: "coa-us-gaap", accountNumber: "2300", name: "Deferred Tax Liabilities", description: "Deferred tax liabilities", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("2400"), chartOfAccountId: "coa-us-gaap", accountNumber: "2400", name: "Other Liabilities", description: "Other non-current liabilities", category: "liabilities", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Equity (3000-3999)
    { id: aid("3000"), chartOfAccountId: "coa-us-gaap", accountNumber: "3000", name: "Common Stock", description: "Common shares issued", category: "equity", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("3100"), chartOfAccountId: "coa-us-gaap", accountNumber: "3100", name: "Additional Paid-in Capital", description: "APIC", category: "equity", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("3200"), chartOfAccountId: "coa-us-gaap", accountNumber: "3200", name: "Retained Earnings", description: "Accumulated retained earnings", category: "equity", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("3300"), chartOfAccountId: "coa-us-gaap", accountNumber: "3300", name: "Treasury Stock", description: "Treasury shares", category: "contra-equity" as any, type: "balance-sheet", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("3400"), chartOfAccountId: "coa-us-gaap", accountNumber: "3400", name: "Accumulated Other Comprehensive Income", description: "AOCI", category: "equity", type: "balance-sheet", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Revenue (4000-4999)
    { id: aid("4000"), chartOfAccountId: "coa-us-gaap", accountNumber: "4000", name: "Revenue", description: "Total revenue", category: "revenue", type: "income-statement", isSummaryAccount: true, naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("4100"), chartOfAccountId: "coa-us-gaap", accountNumber: "4100", name: "Product Revenue", description: "Software product revenue", category: "revenue", type: "income-statement", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("4200"), chartOfAccountId: "coa-us-gaap", accountNumber: "4200", name: "Services Revenue", description: "Professional services revenue", category: "revenue", type: "income-statement", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("4300"), chartOfAccountId: "coa-us-gaap", accountNumber: "4300", name: "Subscription Revenue", description: "SaaS subscription revenue", category: "revenue", type: "income-statement", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // COGS (5000-5999)
    { id: aid("5000"), chartOfAccountId: "coa-us-gaap", accountNumber: "5000", name: "Cost of Goods Sold", description: "Total COGS", category: "cogs", type: "income-statement", isSummaryAccount: true, naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("5100"), chartOfAccountId: "coa-us-gaap", accountNumber: "5100", name: "COGS - Hosting", description: "Cloud infrastructure costs", category: "cogs", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("5200"), chartOfAccountId: "coa-us-gaap", accountNumber: "5200", name: "COGS - Labor", description: "Direct labor costs", category: "cogs", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Operating Expenses (6000-6999)
    { id: aid("6000"), chartOfAccountId: "coa-us-gaap", accountNumber: "6000", name: "Operating Expenses", description: "Total operating expenses", category: "expense", type: "income-statement", isSummaryAccount: true, naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6100"), chartOfAccountId: "coa-us-gaap", accountNumber: "6100", name: "Salaries & Wages", description: "Employee salaries and wages", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6110"), chartOfAccountId: "coa-us-gaap", accountNumber: "6110", name: "Payroll Taxes", description: "Employer payroll taxes", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6120"), chartOfAccountId: "coa-us-gaap", accountNumber: "6120", name: "Benefits", description: "Employee benefits", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6200"), chartOfAccountId: "coa-us-gaap", accountNumber: "6200", name: "Rent & Occupancy", description: "Office rent and related costs", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6300"), chartOfAccountId: "coa-us-gaap", accountNumber: "6300", name: "Professional Services", description: "Legal, audit, consulting", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6400"), chartOfAccountId: "coa-us-gaap", accountNumber: "6400", name: "Marketing & Advertising", description: "Marketing and ad spend", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6500"), chartOfAccountId: "coa-us-gaap", accountNumber: "6500", name: "Travel & Entertainment", description: "Business travel and T&E", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6600"), chartOfAccountId: "coa-us-gaap", accountNumber: "6600", name: "Depreciation & Amortization", description: "D&A expense", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6700"), chartOfAccountId: "coa-us-gaap", accountNumber: "6700", name: "Insurance", description: "Business insurance", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6800"), chartOfAccountId: "coa-us-gaap", accountNumber: "6800", name: "IT & Software", description: "Software licenses and IT costs", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("6900"), chartOfAccountId: "coa-us-gaap", accountNumber: "6900", name: "Other Operating Expenses", description: "Miscellaneous operating costs", category: "expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Other Income/Expense (7000-7999)
    { id: aid("7000"), chartOfAccountId: "coa-us-gaap", accountNumber: "7000", name: "Interest Income", description: "Interest earned on deposits", category: "other-income", type: "income-statement", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("7100"), chartOfAccountId: "coa-us-gaap", accountNumber: "7100", name: "Interest Expense", description: "Interest on borrowings", category: "other-expense", type: "income-statement", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("7200"), chartOfAccountId: "coa-us-gaap", accountNumber: "7200", name: "Foreign Exchange Gain/Loss", description: "FX gains and losses", category: "other-income", type: "income-statement", naturalBalance: "credit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    // Suspense & Memo
    { id: aid("9000"), chartOfAccountId: "coa-us-gaap", accountNumber: "9000", name: "Suspense Account", description: "Clearing/suspense account", category: "suspense", type: "suspense", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: aid("9010"), chartOfAccountId: "coa-us-gaap", accountNumber: "9010", name: "Memo - Off Balance Sheet", description: "Off-balance sheet memo", category: "memo", type: "memo", naturalBalance: "debit", isActive: true, companyId: cid, effectiveFrom: d(2024, 1, 1), createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const acct of accounts) coa.addAccount(acct);

  // Ledgers
  const ledgers: Ledger[] = [
    { id: lid("primary"), code: "PRIMARY", name: "Primary Ledger", description: "Primary corporate ledger (US-GAAP)", type: "primary", currency: "USD", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: lid("secondary"), code: "SECONDARY", name: "Secondary Ledger", description: "IFRS secondary ledger", type: "secondary", currency: "EUR", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: lid("consolidation"), code: "CONSOL", name: "Consolidation Ledger", description: "Consolidated group ledger", type: "consolidation", currency: "USD", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const l of ledgers) ledger.createLedger(l);

  // SubLedgers
  const subledgers: SubLedger[] = [
    { id: slid("ap"), ledgerId: lid("primary"), code: "SL-AP", name: "Accounts Payable", description: "AP subledger", type: "accounts-payable", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: slid("ar"), ledgerId: lid("primary"), code: "SL-AR", name: "Accounts Receivable", description: "AR subledger", type: "accounts-receivable", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: slid("fa"), ledgerId: lid("primary"), code: "SL-FA", name: "Fixed Assets", description: "Fixed asset subledger", type: "fixed-assets", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: slid("inv"), ledgerId: lid("primary"), code: "SL-INV", name: "Inventory", description: "Inventory subledger", type: "inventory", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: slid("tax"), ledgerId: lid("primary"), code: "SL-TAX", name: "Tax", description: "Tax subledger", type: "tax", companyId: cid, isActive: true, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const sl of subledgers) subledger.createSubLedger(sl);

  // Fiscal Years
  const fiscalYears: FiscalYear[] = [
    { id: fyid("2024"), year: "2024", startDate: d(2024, 1, 1), endDate: d(2024, 12, 31), isOpen: false, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: fyid("2025"), year: "2025", startDate: d(2025, 1, 1), endDate: d(2025, 12, 31), isOpen: false, companyId: cid, createdAt: d(2025, 1, 1), updatedAt: d(2025, 1, 1) },
    { id: fyid("2026"), year: "2026", startDate: d(2026, 1, 1), endDate: d(2026, 12, 31), isOpen: true, companyId: cid, createdAt: d(2026, 1, 1), updatedAt: d(2026, 1, 1) },
  ];
  for (const fy of fiscalYears) periods.createFiscalYear(fy);

  // Accounting Periods (12 per year for 2024, 2025, 2026)
  for (const year of ["2024", "2025", "2026"]) {
    for (let m = 1; m <= 12; m++) {
      const periodStr = `${year}-${String(m).padStart(2, "0")}`;
      const start = d(Number(year), m, 1);
      const end = m === 12 ? d(Number(year), 12, 31) : d(Number(year), m + 1, 0);
      const isPast = year < "2026" || (year === "2026" && m < 7);
      periods.createPeriod({
        id: pid(periodStr),
        period: periodStr,
        fiscalYear: year,
        startDate: start,
        endDate: end,
        status: isPast ? "hard-close" : m < 7 ? "open" : "open",
        isAdjustmentPeriod: m === 13,
        closeDate: isPast ? end : undefined,
        companyId: cid,
        createdAt: start,
        updatedAt: end,
      });
    }
  }

  // Closing Checklists for last few periods
  const checklistSteps = ["Journal Review", "Account Reconciliation", "FX Revaluation", "Accrual Review", "Deferred Revenue", "Intercompany Reconciliation", "Allocation Execution", "Trial Balance Review", "Management Review", "Final Close"];
  for (const p of periods.getAllPeriods().filter(p => p.status === "hard-close").slice(-3)) {
    for (let i = 0; i < checklistSteps.length; i++) {
      periods.addChecklistItem({
        id: `check-${p.id}-${i}`,
        periodId: p.id,
        fiscalYear: p.fiscalYear,
        step: checklistSteps[i],
        status: "completed",
        completedBy: "seed-user",
        completedAt: p.closeDate,
        companyId: cid,
        createdAt: d(1, 1, 1),
        updatedAt: d(1, 1, 1),
      });
    }
  }

  // Journals
  const journalDefs: Array<{ id: string; num: string; desc: string; source: Journal["source"]; status: Journal["status"]; period: string; fy: string; entries: Array<{ acct: string; debit: number; credit: number }> }> = [
    {
      id: jid("manual-001"), num: "JN-2026-001", desc: "Customer payment - ABC Corp", source: "manual", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("1010"), debit: 50000, credit: 0 }, { acct: aid("1101"), debit: 0, credit: 50000 }],
    },
    {
      id: jid("manual-002"), num: "JN-2026-002", desc: "Vendor payment - Cloud Hosting Inc", source: "manual", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("2001"), debit: 15000, credit: 0 }, { acct: aid("1010"), debit: 0, credit: 15000 }],
    },
    {
      id: jid("accrual-001"), num: "JN-2026-003", desc: "Monthly salary accrual", source: "accrual", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("6100"), debit: 120000, credit: 0 }, { acct: aid("2010"), debit: 0, credit: 120000 }],
    },
    {
      id: jid("recurring-001"), num: "JN-2026-004", desc: "Monthly rent expense", source: "recurring", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("6200"), debit: 25000, credit: 0 }, { acct: aid("1010"), debit: 0, credit: 25000 }],
    },
    {
      id: jid("adjust-001"), num: "JN-2026-005", desc: "Depreciation adjustment", source: "adjustment", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("6600"), debit: 8500, credit: 0 }, { acct: aid("1405"), debit: 0, credit: 8500 }],
    },
    {
      id: jid("fx-001"), num: "JN-2026-006", desc: "FX revaluation - EUR balance", source: "fx", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("7200"), debit: 3200, credit: 0 }, { acct: aid("1010"), debit: 0, credit: 3200 }],
    },
    {
      id: jid("interco-001"), num: "JN-2026-007", desc: "Intercompany recharge - IT services", source: "intercompany", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("1600"), debit: 45000, credit: 0 }, { acct: aid("4200"), debit: 0, credit: 45000 }],
    },
    {
      id: jid("tax-001"), num: "JN-2026-008", desc: "VAT input tax credit", source: "tax", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("1700"), debit: 12000, credit: 0 }, { acct: aid("2001"), debit: 0, credit: 12000 }],
    },
    {
      id: jid("treasury-001"), num: "JN-2026-009", desc: "Short-term investment purchase", source: "treasury", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("1020"), debit: 100000, credit: 0 }, { acct: aid("1010"), debit: 0, credit: 100000 }],
    },
    {
      id: jid("revenue-001"), num: "JN-2026-010", desc: "Monthly subscription revenue recognition", source: "system", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("2030"), debit: 75000, credit: 0 }, { acct: aid("4300"), debit: 0, credit: 75000 }],
    },
    {
      id: jid("draft-001"), num: "JN-2026-011", desc: "Pending consulting invoice", source: "manual", status: "draft", period: pid("2026-02"), fy: "2026",
      entries: [{ acct: aid("1101"), debit: 35000, credit: 0 }, { acct: aid("4200"), debit: 0, credit: 35000 }],
    },
    {
      id: jid("recurring-002"), num: "JN-2026-012", desc: "Monthly insurance amortization", source: "recurring", status: "posted", period: pid("2026-02"), fy: "2026",
      entries: [{ acct: aid("6700"), debit: 5500, credit: 0 }, { acct: aid("1300"), debit: 0, credit: 5500 }],
    },
    {
      id: jid("manual-003"), num: "JN-2026-013", desc: "Software license purchase - annual", source: "manual", status: "approved", period: pid("2026-02"), fy: "2026",
      entries: [{ acct: aid("6800"), debit: 60000, credit: 0 }, { acct: aid("2001"), debit: 0, credit: 60000 }],
    },
    {
      id: jid("opening-2026"), num: "JN-2026-014", desc: "Opening balance - FY 2026", source: "opening", status: "posted", period: pid("2026-01"), fy: "2026",
      entries: [{ acct: aid("3000"), debit: 0, credit: 1000000 }, { acct: aid("1010"), debit: 500000, credit: 0 }, { acct: aid("3200"), debit: 0, credit: 250000 }],
    },
  ];

  const jEntries: JournalEntry[] = [];
  let entryCounter = 0;
  for (const jd of journalDefs) {
    journals.createJournal({
      id: jd.id,
      journalNumber: jd.num,
      description: jd.desc,
      source: jd.source,
      status: jd.status,
      totalDebit: jd.entries.reduce((s, e) => s + e.debit, 0),
      totalCredit: jd.entries.reduce((s, e) => s + e.credit, 0),
      currency: "USD",
      postingDate: d(2026, 1, 15),
      periodId: jd.period,
      fiscalYear: jd.fy,
      companyId: cid,
      createdAt: d(2026, 1, 1),
      updatedAt: d(2026, 1, 1),
    });
    for (const e of jd.entries) {
      entryCounter++;
      const entry: JournalEntry = {
        id: eid(`entry-${entryCounter}`),
        journalId: jd.id,
        accountId: e.acct,
        description: jd.desc,
        debit: e.debit,
        credit: e.credit,
        currency: "USD",
        exchangeRate: 1,
        companyId: cid,
        createdAt: d(2026, 1, 1),
        updatedAt: d(2026, 1, 1),
      };
      jEntries.push(entry);
      journals.addEntry(entry);
    }
  }

  // Posting Batches
  const batches: PostingBatch[] = [
    { id: bid("001"), batchNumber: "BATCH-2026-001", description: "January 2026 period close batch", entriesCount: 20, totalDebit: 350000, totalCredit: 350000, status: "posted", postedBy: "seed-user", postedAt: d(2026, 1, 31), companyId: cid, createdAt: d(2026, 1, 31), updatedAt: d(2026, 1, 31) },
    { id: bid("002"), batchNumber: "BATCH-2026-002", description: "February 2026 mid-month batch", entriesCount: 8, totalDebit: 120000, totalCredit: 120000, status: "approved", approvedBy: "seed-user", approvedAt: d(2026, 2, 15), companyId: cid, createdAt: d(2026, 2, 15), updatedAt: d(2026, 2, 15) },
    { id: bid("003"), batchNumber: "BATCH-2026-003", description: "Pending review batch", entriesCount: 5, totalDebit: 45000, totalCredit: 45000, status: "draft", companyId: cid, createdAt: d(2026, 2, 20), updatedAt: d(2026, 2, 20) },
  ];
  for (const batch of batches) posting.createBatch(batch);

  // Posting Rules
  const rules: PostingRule[] = [
    { id: "rule-001", code: "RULE-AR-CASH", name: "AR Cash Receipt", description: "Debit Cash, Credit AR", debitAccountId: aid("1010"), creditAccountId: aid("1101"), isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "rule-002", code: "RULE-AP-PAY", name: "AP Payment", description: "Debit AP, Credit Cash", debitAccountId: aid("2001"), creditAccountId: aid("1010"), isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "rule-003", code: "RULE-REV-DEF", name: "Revenue from Deferred", description: "Debit Deferred Revenue, Credit Revenue", debitAccountId: aid("2030"), creditAccountId: aid("4300"), isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "rule-004", code: "RULE-DEPR", name: "Depreciation", description: "Debit D&A, Credit Accum Depr", debitAccountId: aid("6600"), creditAccountId: aid("1405"), isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "rule-005", code: "RULE-PAYROLL", name: "Payroll Accrual", description: "Debit Salary, Credit Accrued", debitAccountId: aid("6100"), creditAccountId: aid("2010"), isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const rule of rules) posting.addRule(rule);

  // Account Balances
  const period202601 = pid("2026-01");
  const balanceData: Array<{ accountId: string; beginning: number; debit: number; credit: number }> = [
    { accountId: aid("1010"), beginning: 2500000, debit: 50000, credit: 143200 },
    { accountId: aid("1101"), beginning: 850000, debit: 35000, credit: 50000 },
    { accountId: aid("1200"), beginning: 320000, debit: 0, credit: 0 },
    { accountId: aid("1300"), beginning: 45000, debit: 0, credit: 5500 },
    { accountId: aid("2001"), beginning: 280000, debit: 15000, credit: 72000 },
    { accountId: aid("2010"), beginning: 95000, debit: 0, credit: 120000 },
    { accountId: aid("2030"), beginning: 180000, debit: 75000, credit: 0 },
    { accountId: aid("3000"), beginning: 5000000, debit: 0, credit: 0 },
    { accountId: aid("3200"), beginning: 3200000, debit: 0, credit: 0 },
    { accountId: aid("4300"), beginning: 0, debit: 0, credit: 75000 },
    { accountId: aid("6100"), beginning: 0, debit: 120000, credit: 0 },
    { accountId: aid("6200"), beginning: 0, debit: 25000, credit: 0 },
    { accountId: aid("6600"), beginning: 0, debit: 8500, credit: 0 },
    { accountId: aid("6700"), beginning: 0, debit: 5500, credit: 0 },
    { accountId: aid("6800"), beginning: 0, debit: 60000, credit: 0 },
  ];
  for (const bd of balanceData) {
    ledger.updateAccountBalance({
      id: `bal-${bd.accountId}-${period202601}`,
      accountId: bd.accountId,
      periodId: period202601,
      fiscalYear: "2026",
      beginningBalance: bd.beginning,
      periodDebit: bd.debit,
      periodCredit: bd.credit,
      endingBalance: bd.beginning + bd.debit - bd.credit,
      currency: "USD",
      companyId: cid,
      createdAt: d(2026, 1, 1),
      updatedAt: d(2026, 1, 31),
    });
  }

  // Allocation Rules
  const allocRules: AllocationRule[] = [
    { id: "alloc-001", code: "ALLOC-RENT", name: "Rent Allocation", description: "Allocate rent to departments by headcount", sourceAccountId: [aid("6200")], targetAccountId: [aid("6000"), aid("6100"), aid("6800")], method: "percentage", percentage: 100, isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "alloc-002", code: "ALLOC-IT", name: "IT Cost Allocation", description: "Allocate IT costs to business units", sourceAccountId: [aid("6800")], targetAccountId: [aid("6000"), aid("6100")], method: "headcount", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
    { id: "alloc-003", code: "ALLOC-MKTG", name: "Marketing Allocation", description: "Allocate marketing to product lines", sourceAccountId: [aid("6400")], targetAccountId: [aid("4100"), aid("4300")], method: "revenue", isActive: true, companyId: cid, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1) },
  ];
  for (const ar of allocRules) allocations.createRule(ar);

  // Exchange Rates
  const rates: ExchangeRateReference[] = [
    { id: "rate-001", fromCurrency: "USD", toCurrency: "EUR", rate: 0.92, rateType: "spot", date: d(2026, 1, 15), companyId: cid, createdAt: d(2026, 1, 15), updatedAt: d(2026, 1, 15) },
    { id: "rate-002", fromCurrency: "USD", toCurrency: "GBP", rate: 0.79, rateType: "spot", date: d(2026, 1, 15), companyId: cid, createdAt: d(2026, 1, 15), updatedAt: d(2026, 1, 15) },
    { id: "rate-003", fromCurrency: "USD", toCurrency: "EUR", rate: 0.91, rateType: "average", date: d(2026, 1, 1), companyId: cid, createdAt: d(2026, 1, 1), updatedAt: d(2026, 1, 1) },
    { id: "rate-004", fromCurrency: "USD", toCurrency: "JPY", rate: 149.50, rateType: "spot", date: d(2026, 1, 15), companyId: cid, createdAt: d(2026, 1, 15), updatedAt: d(2026, 1, 15) },
    { id: "rate-005", fromCurrency: "USD", toCurrency: "EUR", rate: 0.90, rateType: "closing", date: d(2025, 12, 31), companyId: cid, createdAt: d(2025, 12, 31), updatedAt: d(2025, 12, 31) },
  ];
  for (const rate of rates) revaluation.addRate(rate);

  // Intercompany Accounts
  const icAccounts: IntercompanyAccount[] = [
    { id: "ic-001", fromCompanyId: cid, toCompanyId: "subsidiary-1", accountId: aid("1600"), dueTo: 0, dueFrom: 45000, currency: "USD", settlementStatus: "unsettled", companyId: cid, createdAt: d(2026, 1, 1), updatedAt: d(2026, 1, 1) },
    { id: "ic-002", fromCompanyId: "subsidiary-1", toCompanyId: cid, accountId: aid("2200"), dueTo: 45000, dueFrom: 0, currency: "USD", settlementStatus: "unsettled", companyId: cid, createdAt: d(2026, 1, 1), updatedAt: d(2026, 1, 1) },
    { id: "ic-003", fromCompanyId: cid, toCompanyId: "subsidiary-2", accountId: aid("1600"), dueTo: 0, dueFrom: 25000, currency: "EUR", settlementStatus: "partial", lastSettlementDate: d(2026, 1, 15), companyId: cid, createdAt: d(2026, 1, 1), updatedAt: d(2026, 1, 15) },
  ];
  for (const ic of icAccounts) consolidation.addIntercompanyAccount(ic);

  // Financial Statements
  const bsId = "bs-2026-q1";
  const isId = "is-2026-q1";
  const cfId = "cf-2026-q1";
  const reId = "re-2026-q1";

  const totalAssets = 3500000;
  const totalLiabilities = 1200000;
  const totalEquity = 2300000;
  const totalRevenue = 850000;
  const totalExpense = 620000;
  const netInc = totalRevenue - totalExpense;

  fs.addBalanceSheet({
    id: bsId, statementId: `stmt-${bsId}`, periodId: period202601, fiscalYear: "2026",
    totalAssets, totalLiabilities, totalEquity,
    currentAssets: 2100000, nonCurrentAssets: 1400000,
    currentLiabilities: 700000, nonCurrentLiabilities: 500000,
    retainedEarnings: 1800000, workingCapital: 1400000,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  fs.addIncomeStatement({
    id: isId, statementId: `stmt-${isId}`, periodId: period202601, fiscalYear: "2026",
    totalRevenue, totalExpense, grossProfit: 520000,
    operatingIncome: 280000, netIncome: netInc,
    ebitda: 320000, ebit: 280000,
    costOfGoodsSold: 330000, operatingExpenses: 290000,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  fs.addCashFlowStatement({
    id: cfId, statementId: `stmt-${cfId}`, periodId: period202601, fiscalYear: "2026",
    operatingCashFlow: 320000, investingCashFlow: -150000, financingCashFlow: -50000,
    netCashFlow: 120000, beginningCash: 2500000, endingCash: 2620000, freeCashFlow: 170000,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  fs.addRetainedEarnings({
    id: reId, statementId: `stmt-${reId}`, periodId: period202601, fiscalYear: "2026",
    beginningRetainedEarnings: 3200000, netIncome: netInc, dividends: 50000,
    endingRetainedEarnings: 3200000 + netInc - 50000,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  // FinancialStatement records
  const bsSection: FinancialStatementSection = {
    name: "Assets", items: [
      { label: "Current Assets", amount: 2100000 },
      { label: "  Cash & Equivalents", accountNumber: "1000", amount: 2406800, indent: 1 },
      { label: "  Accounts Receivable", accountNumber: "1100", amount: 835000, indent: 1 },
      { label: "  Inventory", accountNumber: "1200", amount: 320000, indent: 1 },
      { label: "Non-Current Assets", amount: 1400000 },
      { label: "  Fixed Assets", accountNumber: "1400", amount: 3200000, indent: 1 },
      { label: "  Accum. Depreciation", accountNumber: "1405", amount: -1800000, indent: 1 },
    ],
  };
  fs.addStatement({
    id: `stmt-${bsId}`, type: "balance-sheet", name: "Balance Sheet - Q1 2026", periodId: period202601,
    fiscalYear: "2026", currency: "USD", sections: [bsSection],
    totalAssets, totalLiabilities, totalEquity, netIncome: netInc,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  const isSection: FinancialStatementSection = {
    name: "Revenue", items: [
      { label: "Product Revenue", accountNumber: "4100", amount: 450000 },
      { label: "Services Revenue", accountNumber: "4200", amount: 150000 },
      { label: "Subscription Revenue", accountNumber: "4300", amount: 250000 },
    ],
  };
  fs.addStatement({
    id: `stmt-${isId}`, type: "income-statement", name: "Income Statement - Q1 2026", periodId: period202601,
    fiscalYear: "2026", currency: "USD", sections: [isSection],
    totalRevenue, totalExpense, netIncome: netInc,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  fs.addStatement({
    id: `stmt-${cfId}`, type: "cash-flow", name: "Cash Flow Statement - Q1 2026", periodId: period202601,
    fiscalYear: "2026", currency: "USD", sections: [],
    operatingCashFlow: 320000, investingCashFlow: -150000, financingCashFlow: -50000,
    companyId: cid, createdAt: d(2026, 3, 31), updatedAt: d(2026, 3, 31),
  });

  // Alerts
  const alerts: GLAlert[] = [
    { id: "gl-alert-001", severity: "warning", type: "unreconciled", title: "Unreconciled AR Balance", message: "AR subledger differs from GL by $12,450", actionRequired: true, dismissed: false, companyId: cid, createdAt: d(2026, 2, 1) },
    { id: "gl-alert-002", severity: "info", type: "period-close", title: "Period Close Approaching", message: "February close is in 5 days", actionRequired: false, dismissed: false, companyId: cid, createdAt: d(2026, 2, 20) },
    { id: "gl-alert-003", severity: "critical", type: "unbalanced", title: "Unbalanced Journal Entry", message: "Journal JN-2026-011 has unbalanced debits and credits", actionRequired: true, dismissed: false, companyId: cid, createdAt: d(2026, 2, 15) },
    { id: "gl-alert-004", severity: "warning", type: "fx", title: "Large FX Loss Realized", message: "EUR position loss of $3,200 this period", actionRequired: false, dismissed: false, companyId: cid, createdAt: d(2026, 1, 31) },
    { id: "gl-alert-005", severity: "info", type: "intercompany", title: "Intercompany Balance Outstanding", message: "$70,000 in intercompany balances unsettled", actionRequired: true, dismissed: true, companyId: cid, createdAt: d(2026, 1, 1) },
  ];
  for (const alert of alerts) analytics.addAlert(alert);

  // Recommendations
  const recommendations: GLRecommendation[] = [
    { id: "gl-rec-001", type: "automation", title: "Automate Monthly Accrual", description: "Set up recurring journal for monthly salary accrual", impact: "Save 2 hours/month", confidence: 95, companyId: cid, implemented: false, createdAt: d(2026, 1, 1) },
    { id: "gl-rec-002", type: "reconciliation", title: "Automate Bank Reconciliation", description: "Connect GL to bank feeds for auto-reconciliation", impact: "Save 8 hours/month", confidence: 90, companyId: cid, implemented: false, createdAt: d(2026, 1, 1) },
    { id: "gl-rec-003", type: "allocation", title: "Review Allocation Rules", description: "Rent allocation percentages may need updating for new headcount", impact: "Improve cost accuracy", confidence: 75, companyId: cid, implemented: false, createdAt: d(2026, 1, 1) },
    { id: "gl-rec-004", type: "compliance", title: "Setup Approval Workflow", description: "Configure multi-level approval for journals over $50,000", impact: "Strengthen controls", confidence: 85, companyId: cid, implemented: true, createdAt: d(2026, 1, 1) },
    { id: "gl-rec-005", type: "optimization", title: "Archive Closed Periods", description: "Archive FY2024 data to improve query performance", impact: "Faster report generation", confidence: 80, companyId: cid, implemented: false, createdAt: d(2026, 1, 1) },
  ];
  for (const rec of recommendations) analytics.addRecommendation(rec);

  // KPIs
  const kpis: GLAnalyticsKPI[] = [
    { name: "Revenue", value: 850000, previousValue: 780000, target: 900000, unit: "USD", category: "Financial", trend: "up", status: "good" },
    { name: "Gross Margin", value: 61.2, previousValue: 59.8, target: 65, unit: "%", category: "Financial", trend: "up", status: "good" },
    { name: "Operating Margin", value: 32.9, previousValue: 30.5, target: 35, unit: "%", category: "Financial", trend: "up", status: "good" },
    { name: "EBITDA", value: 320000, previousValue: 290000, target: 350000, unit: "USD", category: "Financial", trend: "up", status: "good" },
    { name: "Net Income", value: 230000, previousValue: 210000, target: 250000, unit: "USD", category: "Financial", trend: "up", status: "good" },
    { name: "Current Ratio", value: 3.0, previousValue: 2.8, target: 2.5, unit: "x", category: "Liquidity", trend: "up", status: "good" },
    { name: "Quick Ratio", value: 2.5, previousValue: 2.3, target: 2.0, unit: "x", category: "Liquidity", trend: "up", status: "good" },
    { name: "Debt Ratio", value: 0.34, previousValue: 0.36, target: 0.4, unit: "x", category: "Leverage", trend: "down", status: "good" },
    { name: "Working Capital", value: 1400000, previousValue: 1250000, target: 1500000, unit: "USD", category: "Liquidity", trend: "up", status: "good" },
    { name: "Cash Conversion Cycle", value: 45, previousValue: 48, target: 40, unit: "days", category: "Efficiency", trend: "down", status: "warning" },
    { name: "Expense Ratio", value: 72.9, previousValue: 74.5, target: 70, unit: "%", category: "Efficiency", trend: "down", status: "warning" },
    { name: "Revenue per Employee", value: 425000, previousValue: 390000, target: 450000, unit: "USD", category: "Productivity", trend: "up", status: "good" },
  ];
  analytics.setKPIs(kpis);
}
