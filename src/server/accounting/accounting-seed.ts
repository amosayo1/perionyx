import type { AccountingService } from "./services/accounting-service";
import type {
  Account, JournalEntry, JournalLine, AccountingPeriod, FiscalYear,
  AccountBalance, Reconciliation, AllocationRule, AllocationRun,
  IntercompanyJournal, Consolidation, Budget, BudgetItem,
  AuditEvent, AccountingKPI, AccountingForecast,
  FinancialStatement, FinancialStatementRow, PostingBatch,
  AccountIdentifier, CloseProcess,
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

const COMPANY_IDS = ["co_001", "co_002", "co_003", "co_004", "co_005"];
const LEGAL_ENTITIES = ["le_001", "le_002", "le_003", "le_004"];
const USERS = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson", "Lisa Patel"];
const CCY = (c: string) => c;

function generateAccounts(svc: AccountingService): void {
  const assetAccounts: Array<{ code: string; name: string; class: string; parentCode?: string }> = [
    { code: "1000", name: "Assets", class: "asset" },
    { code: "1100", name: "Cash and Cash Equivalents", class: "current-asset", parentCode: "1000" },
    { code: "1110", name: "Cash - Operating", class: "current-asset", parentCode: "1100" },
    { code: "1120", name: "Cash - Payroll", class: "current-asset", parentCode: "1100" },
    { code: "1130", name: "Cash - Reserve", class: "current-asset", parentCode: "1100" },
    { code: "1140", name: "Petty Cash", class: "current-asset", parentCode: "1100" },
    { code: "1200", name: "Accounts Receivable", class: "current-asset", parentCode: "1000" },
    { code: "1210", name: "Trade Receivables", class: "current-asset", parentCode: "1200" },
    { code: "1220", name: "Other Receivables", class: "current-asset", parentCode: "1200" },
    { code: "1230", name: "Allowance for Doubtful Accounts", class: "contra-asset", parentCode: "1200" },
    { code: "1300", name: "Inventory", class: "current-asset", parentCode: "1000" },
    { code: "1310", name: "Raw Materials", class: "current-asset", parentCode: "1300" },
    { code: "1320", name: "Work in Progress", class: "current-asset", parentCode: "1300" },
    { code: "1330", name: "Finished Goods", class: "current-asset", parentCode: "1300" },
    { code: "1400", name: "Prepaid Expenses", class: "current-asset", parentCode: "1000" },
    { code: "1500", name: "Investments", class: "non-current-asset", parentCode: "1000" },
    { code: "1510", name: "Short-term Investments", class: "current-asset", parentCode: "1500" },
    { code: "1520", name: "Long-term Investments", class: "non-current-asset", parentCode: "1500" },
    { code: "1600", name: "Property, Plant & Equipment", class: "non-current-asset", parentCode: "1000" },
    { code: "1610", name: "Land", class: "non-current-asset", parentCode: "1600" },
    { code: "1620", name: "Buildings", class: "non-current-asset", parentCode: "1600" },
    { code: "1630", name: "Equipment", class: "non-current-asset", parentCode: "1600" },
    { code: "1640", name: "Furniture & Fixtures", class: "non-current-asset", parentCode: "1600" },
    { code: "1650", name: "Accumulated Depreciation", class: "contra-asset", parentCode: "1600" },
    { code: "1700", name: "Intangible Assets", class: "non-current-asset", parentCode: "1000" },
    { code: "1710", name: "Goodwill", class: "non-current-asset", parentCode: "1700" },
    { code: "1720", name: "Patents & Trademarks", class: "non-current-asset", parentCode: "1700" },
    { code: "1730", name: "Software", class: "non-current-asset", parentCode: "1700" },
    { code: "1800", name: "Intercompany Receivables", class: "current-asset", parentCode: "1000" },
    { code: "1900", name: "Deferred Tax Assets", class: "non-current-asset", parentCode: "1000" },
  ];

  const liabilityAccounts = [
    { code: "2000", name: "Liabilities", class: "liability" },
    { code: "2100", name: "Accounts Payable", class: "current-liability", parentCode: "2000" },
    { code: "2110", name: "Trade Payables", class: "current-liability", parentCode: "2100" },
    { code: "2120", name: "Accrued Expenses", class: "current-liability", parentCode: "2100" },
    { code: "2200", name: "Short-term Debt", class: "current-liability", parentCode: "2000" },
    { code: "2210", name: "Bank Loans - Short Term", class: "current-liability", parentCode: "2200" },
    { code: "2220", name: "Current Portion of Long-term Debt", class: "current-liability", parentCode: "2200" },
    { code: "2300", name: "Long-term Debt", class: "non-current-liability", parentCode: "2000" },
    { code: "2310", name: "Bank Loans - Long Term", class: "non-current-liability", parentCode: "2300" },
    { code: "2320", name: "Bonds Payable", class: "non-current-liability", parentCode: "2300" },
    { code: "2400", name: "Taxes Payable", class: "current-liability", parentCode: "2000" },
    { code: "2410", name: "Income Tax Payable", class: "current-liability", parentCode: "2400" },
    { code: "2420", name: "Sales Tax Payable", class: "current-liability", parentCode: "2400" },
    { code: "2430", name: "Payroll Tax Payable", class: "current-liability", parentCode: "2400" },
    { code: "2500", name: "Accrued Liabilities", class: "current-liability", parentCode: "2000" },
    { code: "2510", name: "Salaries Payable", class: "current-liability", parentCode: "2500" },
    { code: "2520", name: "Bonus Accruals", class: "current-liability", parentCode: "2500" },
    { code: "2530", name: "Vacation Accruals", class: "current-liability", parentCode: "2500" },
    { code: "2600", name: "Deferred Revenue", class: "current-liability", parentCode: "2000" },
    { code: "2700", name: "Intercompany Payables", class: "current-liability", parentCode: "2000" },
    { code: "2800", name: "Other Liabilities", class: "non-current-liability", parentCode: "2000" },
    { code: "2900", name: "Deferred Tax Liabilities", class: "non-current-liability", parentCode: "2000" },
  ];

  const equityAccounts = [
    { code: "3000", name: "Equity", class: "equity" },
    { code: "3100", name: "Common Stock", class: "equity", parentCode: "3000" },
    { code: "3200", name: "Additional Paid-in Capital", class: "equity", parentCode: "3000" },
    { code: "3300", name: "Retained Earnings", class: "equity", parentCode: "3000" },
    { code: "3400", name: "Accumulated Other Comprehensive Income", class: "equity", parentCode: "3000" },
    { code: "3500", name: "Treasury Stock", class: "contra-equity", parentCode: "3000" },
    { code: "3600", name: "Dividends Declared", class: "equity", parentCode: "3000" },
  ];

  const revenueAccounts = [
    { code: "4000", name: "Revenue", class: "revenue" },
    { code: "4100", name: "Product Revenue", class: "revenue", parentCode: "4000" },
    { code: "4110", name: "Software Licenses", class: "revenue", parentCode: "4100" },
    { code: "4120", name: "SaaS Subscriptions", class: "revenue", parentCode: "4100" },
    { code: "4130", name: "Professional Services", class: "revenue", parentCode: "4100" },
    { code: "4140", name: "Hardware Sales", class: "revenue", parentCode: "4100" },
    { code: "4200", name: "Service Revenue", class: "revenue", parentCode: "4000" },
    { code: "4210", name: "Consulting Services", class: "revenue", parentCode: "4200" },
    { code: "4220", name: "Implementation Services", class: "revenue", parentCode: "4200" },
    { code: "4230", name: "Support & Maintenance", class: "revenue", parentCode: "4200" },
    { code: "4300", name: "Other Revenue", class: "revenue", parentCode: "4000" },
    { code: "4310", name: "Interest Income", class: "revenue", parentCode: "4300" },
    { code: "4320", name: "Foreign Exchange Gains", class: "revenue", parentCode: "4300" },
  ];

  const expenseAccounts = [
    { code: "5000", name: "Cost of Sales", class: "expense" },
    { code: "5100", name: "Direct Labor", class: "expense", parentCode: "5000" },
    { code: "5200", name: "Direct Materials", class: "expense", parentCode: "5000" },
    { code: "5300", name: "Overhead", class: "expense", parentCode: "5000" },
    { code: "6000", name: "Operating Expenses", class: "expense" },
    { code: "6100", name: "Salaries & Wages", class: "expense", parentCode: "6000" },
    { code: "6110", name: "Executive Salaries", class: "expense", parentCode: "6100" },
    { code: "6120", name: "Staff Salaries", class: "expense", parentCode: "6100" },
    { code: "6130", name: "Bonuses", class: "expense", parentCode: "6100" },
    { code: "6140", name: "Payroll Taxes", class: "expense", parentCode: "6100" },
    { code: "6150", name: "Benefits", class: "expense", parentCode: "6100" },
    { code: "6200", name: "Professional Fees", class: "expense", parentCode: "6000" },
    { code: "6210", name: "Legal Fees", class: "expense", parentCode: "6200" },
    { code: "6220", name: "Audit & Accounting", class: "expense", parentCode: "6200" },
    { code: "6230", name: "Consulting Fees", class: "expense", parentCode: "6200" },
    { code: "6300", name: "Technology", class: "expense", parentCode: "6000" },
    { code: "6310", name: "Software Licenses", class: "expense", parentCode: "6300" },
    { code: "6320", name: "Cloud Infrastructure", class: "expense", parentCode: "6300" },
    { code: "6330", name: "Hardware & Equipment", class: "expense", parentCode: "6300" },
    { code: "6400", name: "Office & Administrative", class: "expense", parentCode: "6000" },
    { code: "6410", name: "Rent", class: "expense", parentCode: "6400" },
    { code: "6420", name: "Utilities", class: "expense", parentCode: "6400" },
    { code: "6430", name: "Office Supplies", class: "expense", parentCode: "6400" },
    { code: "6440", name: "Insurance", class: "expense", parentCode: "6400" },
    { code: "6450", name: "Travel & Entertainment", class: "expense", parentCode: "6400" },
    { code: "6500", name: "Marketing & Sales", class: "expense", parentCode: "6000" },
    { code: "6510", name: "Advertising", class: "expense", parentCode: "6500" },
    { code: "6520", name: "Events & Sponsorships", class: "expense", parentCode: "6500" },
    { code: "6530", name: "Sales Commissions", class: "expense", parentCode: "6500" },
    { code: "6600", name: "Depreciation & Amortization", class: "expense", parentCode: "6000" },
    { code: "6700", name: "Research & Development", class: "expense", parentCode: "6000" },
    { code: "7000", name: "Other Expenses", class: "expense" },
    { code: "7100", name: "Foreign Exchange Losses", class: "expense", parentCode: "7000" },
    { code: "7200", name: "Interest Expense", class: "expense", parentCode: "7000" },
    { code: "7300", name: "Tax Expense", class: "expense", parentCode: "7000" },
    { code: "7400", name: "Extraordinary Items", class: "expense", parentCode: "7000" },
  ];

  const allDefs = [
    ...assetAccounts, ...liabilityAccounts, ...equityAccounts,
    ...revenueAccounts, ...expenseAccounts,
  ];

  let accountCounter = 0;
  const codeToId = new Map<string, AccountIdentifier>();

  for (const def of allDefs) {
    accountCounter++;
    const id = `acct_${String(accountCounter).padStart(4, "0")}`;
    codeToId.set(def.code, id);
    const parentId = def.parentCode ? codeToId.get(def.parentCode) : undefined;
    const isAsset = ["asset", "current-asset", "non-current-asset", "contra-asset"].includes(def.class);
    const isLiability = ["liability", "current-liability", "non-current-liability", "contra-liability"].includes(def.class);
    const isEquity = ["equity", "contra-equity"].includes(def.class);
    const isRevenue = ["revenue", "contra-revenue"].includes(def.class);
    const type: any = isAsset ? "asset" : isLiability ? "liability" : isEquity ? "equity" : isRevenue ? "revenue" : "operating-expense";
    const normalBalance: "debit" | "credit" = isAsset ? "debit" : "credit";

    const account: Account = {
      id,
      code: def.code,
      name: def.name,
      description: `${def.name} account`,
      type: type,
      class: def.class as any,
      normalBalance,
      status: "active",
      parentId,
      level: parentId ? (def.parentCode === "1000" || def.parentCode === "2000" || def.parentCode === "3000" || def.parentCode === "4000" || def.parentCode === "5000" || def.parentCode === "6000" || def.parentCode === "7000" ? 2 : 3) : 0,
      path: parentId ? `${parentId}.${id}` : id,
      currency: "USD",
      companyId: pick(COMPANY_IDS),
      isControlAccount: def.code.length === 4 && def.code.endsWith("000"),
      allowManualPosting: true,
      tags: [type],
      createdAt: daysAgo(rand(180, 730)),
      updatedAt: daysAgo(rand(1, 90)),
    };
    svc.coa.addAccount(account);
  }

  for (let i = 0; i < 1800; i++) {
    accountCounter++;
    const id = `acct_${String(accountCounter).padStart(4, "0")}`;
    const parent = pick(allDefs.filter((d) => d.code.length === 4 && d.code.endsWith("000")));
    const types: any[] = ["asset", "liability", "equity", "revenue", "cost-of-sales", "operating-expense", "other-income", "other-expense"];
    const t = pick(types);
    const isAssetType = t === "asset";
    const account: Account = {
      id,
      code: `${parent.code}${String(rand(10, 99))}`,
      name: `Custom Account ${i + 1}`,
      description: `Custom sub-account under ${parent.name}`,
      type: t,
      class: isAssetType ? "current-asset" : t === "liability" ? "current-liability" : t === "equity" ? "equity" : "expense",
      normalBalance: isAssetType ? "debit" : "credit",
      status: pick(["active", "active", "active", "inactive"]),
      parentId: codeToId.get(parent.code),
      level: 4,
      path: `${codeToId.get(parent.code)}.${id}`,
      currency: "USD",
      companyId: pick(COMPANY_IDS),
      isControlAccount: false,
      allowManualPosting: true,
      tags: [t],
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.coa.addAccount(account);
  }
}

function generatePeriods(svc: AccountingService): void {
  for (let fy = 2024; fy <= 2026; fy++) {
    const fyId = `fy_${fy}`;
    const periods: AccountingPeriod[] = [];
    for (let m = 1; m <= 12; m++) {
      const periodId = `per_${fy}_${String(m).padStart(2, "0")}`;
      const isPast = fy < 2025 || (fy === 2025 && m < 7);
      periods.push({
        id: periodId,
        fiscalYearId: fyId,
        name: `${fy}-${String(m).padStart(2, "0")}`,
        type: "monthly",
        startDate: new Date(fy, m - 1, 1),
        endDate: new Date(fy, m, 0),
        status: isPast ? "locked" : m <= 6 ? "open" : "open",
        sequence: m,
        isAdjustingPeriod: m === 12,
        closedBy: isPast ? pick(USERS) : undefined,
        closedAt: isPast ? daysAgo(rand(30, 180)) : undefined,
        createdAt: daysAgo(rand(100, 730)),
        updatedAt: daysAgo(rand(1, 30)),
      });
    }
    const fiscalYear: FiscalYear = {
      id: fyId,
      name: `Fiscal Year ${fy}`,
      companyId: pick(COMPANY_IDS),
      startDate: new Date(fy, 0, 1),
      endDate: new Date(fy, 11, 31),
      isClosed: fy < 2025,
      closedBy: fy < 2025 ? pick(USERS) : undefined,
      closedAt: fy < 2025 ? daysAgo(rand(30, 365)) : undefined,
      periods,
      createdAt: daysAgo(rand(365, 730)),
      updatedAt: daysAgo(rand(1, 90)),
    };
    svc.periods.addFiscalYear(fiscalYear);
    for (const p of periods) {
      svc.periods.addPeriod(p);
    }
  }
}

function generateJournals(svc: AccountingService): void {
  const accounts = svc.coa.getAllAccounts();
  const assetAccounts = accounts.filter((a) => a.type === "asset");
  const liabilityAccounts = accounts.filter((a) => a.type === "liability");
  const revenueAccounts = accounts.filter((a) => a.type === "revenue");
  const expenseAccounts = accounts.filter((a) => a.type === "operating-expense" || a.type === "cost-of-sales");
  const periods = svc.periods.getAllPeriods();

  for (let i = 0; i < 5000; i++) {
    const period = pick(periods);
    const isDebit = Math.random() > 0.5;
    const debitAccount = pick(assetAccounts);
    const creditAccount = pick(isDebit ? liabilityAccounts : revenueAccounts);
    const amount = round2(Math.random() * 100000 + 10);

    const lines: JournalLine[] = [
      {
        id: `line_${i}_1`,
        journalId: `jrn_${String(i + 1).padStart(5, "0")}`,
        accountId: debitAccount.id,
        accountCode: debitAccount.code,
        accountName: debitAccount.name,
        description: `Journal entry ${i + 1} - debit`,
        debit: amount,
        credit: 0,
        currency: "USD",
        exchangeRate: 1,
        costCenter: pick(["CC-001", "CC-002", "CC-003", "CC-004", "CC-005", undefined].filter(Boolean)) as string | undefined,
        profitCenter: pick(["PC-001", "PC-002", "PC-003", undefined].filter(Boolean)) as string | undefined,
        department: pick(["Engineering", "Sales", "Marketing", "Finance", "Operations", undefined].filter(Boolean)) as string | undefined,
        businessUnit: pick(["Corporate", "Enterprise", "SMB", undefined].filter(Boolean)) as string | undefined,
      },
      {
        id: `line_${i}_2`,
        journalId: `jrn_${String(i + 1).padStart(5, "0")}`,
        accountId: creditAccount.id,
        accountCode: creditAccount.code,
        accountName: creditAccount.name,
        description: `Journal entry ${i + 1} - credit`,
        debit: 0,
        credit: amount,
        currency: "USD",
        exchangeRate: 1,
      },
    ];

    const journal: JournalEntry = {
      id: `jrn_${String(i + 1).padStart(5, "0")}`,
      journalNumber: svc.journal.generateJournalNumber(),
      type: i % 20 === 0 ? "adjusting" : i % 15 === 0 ? "recurring" : "standard",
      status: i % 8 === 0 ? "draft" : i % 6 === 0 ? "approved" : "posted",
      description: `Transaction ${i + 1}: ${pick(["Revenue recognition", "Expense payment", "Asset purchase", "Liability settlement", "Intercompany transfer", "Allocation run", "Adjusting entry"])}`,
      lines,
      totalDebit: amount,
      totalCredit: amount,
      isBalanced: true,
      source: pick(["manual", "api", "batch", "recurring", "integration"]),
      sourceId: undefined,
      companyId: pick(COMPANY_IDS),
      legalEntityId: pick(LEGAL_ENTITIES),
      periodId: period.id,
      currency: "USD",
      exchangeRate: 1,
      approvedBy: Math.random() > 0.3 ? pick(USERS) : undefined,
      approvedAt: Math.random() > 0.3 ? daysAgo(rand(1, 30)) : undefined,
      postedBy: Math.random() > 0.2 ? pick(USERS) : undefined,
      postedAt: Math.random() > 0.2 ? daysAgo(rand(1, 30)) : undefined,
      tags: [pick(["monthly-close", "audit", "recurring", "manual"])],
      createdAt: daysAgo(rand(1, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.journal.addJournal(journal);
  }
}

function generatePostingBatches(svc: AccountingService): void {
  const journals = svc.journal.getJournalsByStatus("posted");
  for (let i = 0; i < 50; i++) {
    const batchJournals = journals.slice(i * 20, i * 20 + 20);
    const batch: PostingBatch = {
      id: `batch_${String(i + 1).padStart(3, "0")}`,
      name: `Batch Posting ${i + 1}`,
      mode: pick(["automatic", "manual", "batch"] as const),
      journalIds: batchJournals.map((j) => j.id),
      totalJournals: batchJournals.length,
      postedJournals: batchJournals.length,
      failedJournals: 0,
      status: "posted",
      startedBy: pick(USERS),
      startedAt: daysAgo(rand(1, 90)),
      completedAt: daysAgo(rand(1, 90)),
      errors: [],
      createdAt: daysAgo(rand(1, 90)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.posting.addBatch(batch);
  }
}

function generateBalances(svc: AccountingService): void {
  const accounts = svc.coa.getAllAccounts();
  const periods = svc.periods.getAllPeriods();
  for (const account of accounts) {
    for (const period of periods.slice(0, 8)) {
      const activity = rand(10000, 5000000);
      const balance: AccountBalance = {
        id: `bal_${account.id}_${period.id}`,
        accountId: account.id,
        periodId: period.id,
        companyId: account.companyId,
        beginningDebit: account.normalBalance === "debit" ? rand(100000, 5000000) : 0,
        beginningCredit: account.normalBalance === "credit" ? rand(100000, 5000000) : 0,
        periodDebit: rand(1000, activity),
        periodCredit: rand(1000, activity),
        endingDebit: 0,
        endingCredit: 0,
        netChange: rand(-100000, 100000),
        endingBalance: rand(-5000000, 5000000),
        currency: "USD",
        lastActivity: daysAgo(rand(1, 30)),
        createdAt: period.createdAt,
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.ledger.addBalance(balance);
    }
  }
}

function generateReconciliations(svc: AccountingService): void {
  const accounts = svc.coa.getAccountsByType("asset").filter((a) => a.code.startsWith("11"));
  const periods = svc.periods.getAllPeriods().slice(0, 10);
  for (let i = 0; i < 250; i++) {
    const account = pick(accounts);
    const period = pick(periods);
    const statementBalance = rand(100000, 5000000);
    const ledgerBalance = rand(100000, 5000000);
    const diff = statementBalance - ledgerBalance;
    const rec: Reconciliation = {
      id: `rec_${String(i + 1).padStart(4, "0")}`,
      type: pick(["bank", "ledger", "account"] as const),
      accountId: account.id,
      periodId: period.id,
      statementDate: daysAgo(rand(1, 30)),
      statementBalance,
      ledgerBalance,
      difference: diff,
      status: Math.abs(diff) < 100 ? "completed" : "exception",
      items: [],
      completedBy: Math.random() > 0.3 ? pick(USERS) : undefined,
      completedAt: Math.random() > 0.3 ? daysAgo(rand(1, 14)) : undefined,
      createdAt: daysAgo(rand(10, 90)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.reconciliation.addReconciliation(rec);
  }
}

function generateAllocations(svc: AccountingService): void {
  const accounts = svc.coa.getAllAccounts();
  for (let i = 0; i < 120; i++) {
    const source = pick(accounts);
    const targets = [pick(accounts), pick(accounts), pick(accounts)].filter((a) => a.id !== source.id);
    const rule: AllocationRule = {
      id: `alloc_rule_${String(i + 1).padStart(3, "0")}`,
      name: `Allocation Rule ${i + 1}`,
      description: `Distribute costs from ${source.name} to target departments`,
      sourceAccountId: source.id,
      targetAccountIds: targets.map((t) => t.id),
      method: pick(["percentage", "headcount", "revenue"] as const),
      percentages: targets.reduce((acc, t, idx) => ({ ...acc, [t.id]: 100 / targets.length }), {}),
      costCenters: ["CC-001", "CC-002", "CC-003", "CC-004"],
      profitCenters: ["PC-001", "PC-002"],
      departments: ["Engineering", "Sales", "Marketing", "Finance"],
      isActive: Math.random() > 0.2,
      frequency: pick(["monthly", "quarterly", "annual"] as const),
      lastRun: Math.random() > 0.3 ? daysAgo(rand(1, 30)) : undefined,
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.allocations.addRule(rule);
  }

  const activeRules = svc.allocations.getActiveRules();
  for (let i = 0; i < activeRules.length && i < 60; i++) {
    const rule = activeRules[i];
    const run: AllocationRun = {
      id: `alloc_run_${String(i + 1).padStart(3, "0")}`,
      ruleId: rule.id,
      periodId: pick(svc.periods.getAllPeriods()).id,
      totalAmount: rand(10000, 500000),
      journalId: `jrn_${rand(1, 5000)}`,
      status: pick(["executed", "posted"] as const),
      allocations: rule.targetAccountIds.map((targetId) => ({
        targetAccountId: targetId,
        amount: rand(1000, 50000),
        costCenter: pick(["CC-001", "CC-002"]),
      })),
      executedBy: pick(USERS),
      executedAt: daysAgo(rand(1, 30)),
      createdAt: daysAgo(rand(1, 30)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.allocations.addRun(run);
  }
}

function generateIntercompanyJournals(svc: AccountingService): void {
  for (let i = 0; i < 80; i++) {
    const fromCo = pick(COMPANY_IDS);
    let toCo = pick(COMPANY_IDS);
    while (toCo === fromCo) toCo = pick(COMPANY_IDS);
    const ic: IntercompanyJournal = {
      id: `ic_${String(i + 1).padStart(4, "0")}`,
      fromCompanyId: fromCo,
      toCompanyId: toCo,
      fromJournalId: `jrn_${rand(1, 5000)}`,
      toJournalId: `jrn_${rand(1, 5000)}`,
      totalAmount: rand(10000, 2000000),
      currency: "USD",
      exchangeRate: 1,
      description: `Intercompany transaction ${i + 1} between ${fromCo} and ${toCo}`,
      type: pick(["due-to", "due-from"] as const),
      status: pick(["draft", "approved", "posted", "settled"] as const),
      settledAt: Math.random() > 0.5 ? daysAgo(rand(1, 30)) : undefined,
      settledById: Math.random() > 0.5 ? pick(USERS) : undefined,
      createdAt: daysAgo(rand(10, 90)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.intercompany.addJournal(ic);
  }
}

function generateConsolidations(svc: AccountingService): void {
  const periods = svc.periods.getAllPeriods().slice(0, 6);
  for (let i = 0; i < 50; i++) {
    const period = pick(periods);
    const parent = pick(COMPANY_IDS);
    let child = pick(COMPANY_IDS);
    while (child === parent) child = pick(COMPANY_IDS);
    const minorityInterest = rand(100000, 2000000);
    const cons: Consolidation = {
      id: `cons_${String(i + 1).padStart(4, "0")}`,
      parentCompanyId: parent,
      childCompanyId: child,
      periodId: period.id,
      ownershipPercent: rand(51, 100),
      method: rand(51, 100) >= 80 ? "full" : "equity",
      minorityInterest,
      status: pick(["draft", "calculated", "reviewed", "posted"] as const),
      eliminationEntries: [],
      translationAdjustments: [],
      calculatedBy: pick(USERS),
      calculatedAt: daysAgo(rand(1, 30)),
      postedBy: Math.random() > 0.5 ? pick(USERS) : undefined,
      postedAt: Math.random() > 0.5 ? daysAgo(rand(1, 14)) : undefined,
      createdAt: daysAgo(rand(10, 60)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.consolidation.addConsolidation(cons);
  }
}

function generateBudgets(svc: AccountingService): void {
  const accounts = svc.coa.getAllAccounts();
  const periods = svc.periods.getAllPeriods();
  for (let i = 0; i < 30; i++) {
    const items: BudgetItem[] = [];
    const sampleAccounts = [pick(accounts), pick(accounts), pick(accounts), pick(accounts), pick(accounts)];
    for (const account of sampleAccounts) {
      for (const period of periods.slice(0, 6)) {
        const budgetAmount = rand(10000, 5000000);
        const actualAmount = round2(budgetAmount * (0.8 + Math.random() * 0.4));
        items.push({
          id: `bi_${i}_${account.id}_${period.id}`,
          budgetId: `budget_${i + 1}`,
          accountId: account.id,
          periodId: period.id,
          budgetAmount,
          actualAmount,
          variance: round2(budgetAmount - actualAmount),
          variancePercent: round2(((budgetAmount - actualAmount) / budgetAmount) * 100),
        });
      }
    }
    const budget: Budget = {
      id: `budget_${i + 1}`,
      name: `${pick(["Operating", "Capital", "Revenue", "Expense"])} Budget ${i + 1}`,
      fiscalYearId: pick(svc.periods.getAllFiscalYears()).id,
      companyId: pick(COMPANY_IDS),
      type: pick(["operating", "capital", "revenue", "expense"] as const),
      status: pick(["draft", "active", "locked", "archived"] as const),
      items,
      totalAmount: items.reduce((s, item) => s + item.budgetAmount, 0),
      version: rand(1, 5),
      approvedBy: Math.random() > 0.5 ? pick(USERS) : undefined,
      approvedAt: Math.random() > 0.5 ? daysAgo(rand(1, 30)) : undefined,
      createdAt: daysAgo(rand(30, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.budgets.addBudget(budget);
  }
}

function generateAuditEvents(svc: AccountingService): void {
  const actions = ["create", "update", "post", "approve", "close", "lock"] as const;
  const entities = ["journal", "account", "period", "reconciliation", "allocation", "intercompany", "consolidation", "budget", "close"] as const;
  for (let i = 0; i < 100; i++) {
    const event: AuditEvent = {
      id: `audit_${String(i + 1).padStart(4, "0")}`,
      action: pick(actions),
      entityType: pick(entities),
      entityId: `entity_${rand(1, 5000)}`,
      userId: `user_${rand(1, 10)}`,
      userName: pick(USERS),
      changes: [
        { field: pick(["status", "amount", "description", "date"]), oldValue: "old_value", newValue: "new_value" },
      ],
      source: pick(["manual", "system", "api", "batch"]),
      timestamp: daysAgo(rand(1, 60)),
      createdAt: daysAgo(rand(1, 60)),
    };
    svc.audit.addEvent(event);
  }
}

function generateKPIs(svc: AccountingService): void {
  const kpiDefs = [
    { name: "Net Income", unit: "USD", cat: "profitability" as const },
    { name: "Gross Margin", unit: "percent", cat: "profitability" as const },
    { name: "Operating Margin", unit: "percent", cat: "profitability" as const },
    { name: "EBITDA", unit: "USD", cat: "profitability" as const },
    { name: "Working Capital", unit: "USD", cat: "liquidity" as const },
    { name: "Current Ratio", unit: "ratio", cat: "liquidity" as const },
    { name: "Quick Ratio", unit: "ratio", cat: "liquidity" as const },
    { name: "Cash Ratio", unit: "ratio", cat: "liquidity" as const },
    { name: "Debt Ratio", unit: "percent", cat: "leverage" as const },
    { name: "Return on Assets", unit: "percent", cat: "efficiency" as const },
    { name: "Return on Equity", unit: "percent", cat: "efficiency" as const },
    { name: "Revenue Growth", unit: "percent", cat: "growth" as const },
  ];
  for (const def of kpiDefs) {
    const kpi: AccountingKPI = {
      id: `kpi_acct_${def.name.toLowerCase().replace(/\s+/g, "_")}`,
      name: def.name,
      value: rand(0, 100),
      previousValue: rand(0, 100),
      target: rand(50, 100),
      unit: def.unit,
      category: def.cat,
      trend: pick(["up", "down", "stable"] as const),
      status: pick(["good", "warning", "critical"] as const),
      companyId: pick(COMPANY_IDS),
      periodId: pick(svc.periods.getAllPeriods()).id,
      date: NOW,
    };
    svc.analytics.addKPI(kpi);
  }
}

function generateForecasts(svc: AccountingService): void {
  const metrics = ["revenue", "expense", "net-income", "ebitda", "cash", "working-capital"] as const;
  for (const metric of metrics) {
    for (let i = 0; i < 3; i++) {
      const forecast: AccountingForecast = {
        id: `fc_acct_${metric}_${i}`,
        companyId: pick(COMPANY_IDS),
        metric,
        period: pick(["1M", "3M", "6M", "1Y"]),
        currentValue: rand(1000000, 50000000),
        forecastValue: rand(1000000, 50000000),
        lowerBound: rand(-5000000, 0),
        upperBound: rand(0, 5000000),
        confidence: rand(60, 95) / 100,
        trend: pick(["increasing", "decreasing", "stable"] as const),
        date: NOW,
      };
      svc.analytics.addForecast(forecast);
    }
  }
}

export function seedAccountingData(svc: AccountingService): void {
  console.log("Seeding accounting data...");

  generateAccounts(svc);
  console.log(`  ${svc.coa.count()} accounts created`);

  generatePeriods(svc);
  console.log(`  ${svc.periods.countPeriods()} periods created`);
  console.log(`  ${svc.periods.countFiscalYears()} fiscal years created`);

  generateJournals(svc);
  console.log(`  ${svc.journal.count()} journal entries created`);

  generatePostingBatches(svc);
  console.log(`  ${svc.posting.getAllBatches().length} posting batches created`);

  generateBalances(svc);
  console.log(`  ${svc.ledger.count()} account balances created`);

  generateReconciliations(svc);
  console.log(`  ${svc.reconciliation.count()} reconciliations created`);

  generateAllocations(svc);
  console.log(`  ${svc.allocations.countRules()} allocation rules, ${svc.allocations.countRuns()} runs created`);

  generateIntercompanyJournals(svc);
  console.log(`  ${svc.intercompany.count()} intercompany journals created`);

  generateConsolidations(svc);
  console.log(`  ${svc.consolidation.count()} consolidations created`);

  generateBudgets(svc);
  console.log(`  ${svc.budgets.getAllBudgets().length} budgets created`);

  generateAuditEvents(svc);
  console.log(`  ${svc.audit.count()} audit events created`);

  generateKPIs(svc);
  generateForecasts(svc);
  console.log(`  ${svc.analytics.count()} KPIs and forecasts created`);

  console.log("Accounting seed data complete.");
}
