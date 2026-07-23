import type {
  Payment, Collection, ApprovalRequest, IntercompanyPayment, TreasuryTransfer,
  CashMovement, CalendarEvent, PaymentRail, PaymentRoute, Settlement, PaymentAlert,
  PaymentRecommendation, PaymentInsight, PaymentMetrics, Counterparty, TrendPoint,
  AnalyticsSeries, PaymentRiskItem,
} from "./types";

export const MOCK_ENTITIES = [
  "Perionyx Global Ltd", "Perionyx US Corp", "Perionyx Europe BV", "Perionyx UK plc",
  "Perionyx ME FZCO", "Perionyx Africa (Pty) Ltd", "Perionyx APAC Pte Ltd",
  "Perionyx LATAM SA", "Perionyx Oceania Pty Ltd", "Perionyx Canada Inc",
  "Perionyx India Pvt Ltd", "Perionyx China Ltd",
];

export const MOCK_REGIONS = ["North America", "Europe", "Middle East", "Africa", "Asia-Pacific", "Latin America", "Oceania", "Canada"];

export const MOCK_CURRENCIES = ["USD", "EUR", "GBP", "AED", "ZAR", "SGD", "BRL", "CAD", "INR", "CNY", "AUD", "JPY", "CHF", "HKD"];

export const MOCK_BANKS = [
  "JP Morgan Chase", "Citibank", "HSBC", "Bank of America", "Deutsche Bank", "Barclays",
  "Standard Chartered", "BNP Paribas", "Santander", "First Abu Dhabi Bank", "Standard Bank",
  "DBS Bank",
];

export const MOCK_PAYMENT_TYPES = ["wire", "ach", "sepa", "swift", "rtgs", "rtp", "fednow", "fps", "chaps", "bacs", "instant", "internal", "book", "cross_border", "cheque"] as const;

export const MOCK_RAILS = ["Wire", "ACH", "SEPA", "SWIFT", "RTGS", "RTP", "FedNow", "FPS", "CHAPS", "BACS", "Instant Payment", "Internal Transfer", "Book Transfer", "Cross-border"];

export const MOCK_COUNTERPARTIES: Counterparty[] = [
  { id: "CP-001", name: "Acme Corp", type: "vendor", region: "North America", currency: "USD", riskScore: 15 },
  { id: "CP-002", name: "Global Supplies Inc", type: "vendor", region: "North America", currency: "USD", riskScore: 22 },
  { id: "CP-003", name: "TechServe Solutions", type: "vendor", region: "Europe", currency: "EUR", riskScore: 10 },
  { id: "CP-004", name: "DataStream Ltd", type: "vendor", region: "Europe", currency: "GBP", riskScore: 18 },
  { id: "CP-005", name: "MegaCorp International", type: "customer", region: "Middle East", currency: "AED", riskScore: 25 },
  { id: "CP-006", name: "AfriTrade Holdings", type: "customer", region: "Africa", currency: "ZAR", riskScore: 35 },
  { id: "CP-007", name: "Pacific Rim Trading", type: "customer", region: "Asia-Pacific", currency: "SGD", riskScore: 12 },
  { id: "CP-008", name: "LatinEx SA", type: "customer", region: "Latin America", currency: "BRL", riskScore: 42 },
  { id: "CP-009", name: "DownUnder Partners", type: "customer", region: "Oceania", currency: "AUD", riskScore: 8 },
  { id: "CP-010", name: "NorthStar Consulting", type: "vendor", region: "Canada", currency: "CAD", riskScore: 5 },
  { id: "CP-011", name: "GovCo Federal", type: "government", region: "North America", currency: "USD", riskScore: 3 },
  { id: "CP-012", name: "Tax Authority UK", type: "government", region: "Europe", currency: "GBP", riskScore: 2 },
  { id: "CP-013", name: "Payroll Services Ltd", type: "vendor", region: "North America", currency: "USD", riskScore: 5 },
  { id: "CP-014", name: "Insurance Brokers Inc", type: "vendor", region: "North America", currency: "USD", riskScore: 8 },
  { id: "CP-015", name: "UtilityCorp Global", type: "vendor", region: "Europe", currency: "EUR", riskScore: 6 },
  { id: "CP-016", name: "Telco Solutions", type: "vendor", region: "Asia-Pacific", currency: "INR", riskScore: 11 },
  { id: "CP-017", name: "Logistics Partners", type: "vendor", region: "Middle East", currency: "AED", riskScore: 20 },
  { id: "CP-018", name: "Cloud Infrastructure Ltd", type: "vendor", region: "Europe", currency: "EUR", riskScore: 7 },
  { id: "CP-019", name: "Office Space REIT", type: "vendor", region: "North America", currency: "USD", riskScore: 9 },
  { id: "CP-020", name: "Marketing Agency Co", type: "vendor", region: "Europe", currency: "EUR", riskScore: 14 },
];

export const MOCK_PAYMENTS: Payment[] = (() => {
  const payments: Payment[] = [];
  const statuses: Payment["status"][] = ["draft", "pending_approval", "approved", "queued", "processing", "settled", "failed", "cancelled"];
  const priorities: Payment["priority"][] = ["urgent", "high", "normal", "low"];
  const types: Payment["paymentType"][] = ["wire", "ach", "sepa", "swift", "rtgs", "rtp", "fednow", "fps", "chaps", "bacs", "instant", "internal", "book", "cross_border"];
  const risks: Payment["risk"][] = ["low", "medium", "high"];
  const purposes = [
    "Vendor payment - IT services", "Office lease Q3", "Supplier invoice INV-2024", "Consulting fees",
    "Software license renewal", "Cloud infrastructure hosting", "Marketing campaign Q3",
    "Payroll processing", "Tax payment - VAT", "Insurance premium",
    "Utility bill - London office", "Telecom services", "Logistics & shipping",
    "Professional services retainer", "Equipment lease", "Facilities management",
    "Training & development", "Legal services retainer", "Audit fees", "Data center colocation",
  ];

  for (let i = 0; i < 250; i++) {
    const entity = MOCK_ENTITIES[i % MOCK_ENTITIES.length];
    const region = MOCK_REGIONS[Math.floor(Math.random() * MOCK_REGIONS.length)];
    const currency = MOCK_CURRENCIES[Math.floor(Math.random() * MOCK_CURRENCIES.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const amount = Math.round(Math.random() * 20000000 * 100 + 10000 * 100) / 100;
    const d = new Date(2026, 5, 1);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30) + (status === "settled" ? -5 : 10));
    const reqDate = d.toISOString();
    const execDate = new Date(d.getTime() + Math.random() * 86400000 * 2).toISOString();
    const settDate = new Date(d.getTime() + Math.random() * 86400000 * 4 + 86400000).toISOString();
    const counterparty = MOCK_COUNTERPARTIES[Math.floor(Math.random() * MOCK_COUNTERPARTIES.length)];

    payments.push({
      id: `PAY-${String(i + 1).padStart(5, "0")}`,
      entity,
      region,
      businessUnit: ["Corporate", "Operations", "Finance", "Engineering", "Sales"][Math.floor(Math.random() * 5)],
      counterparty: counterparty.name,
      counterpartyId: counterparty.id,
      bank: MOCK_BANKS[Math.floor(Math.random() * MOCK_BANKS.length)],
      currency,
      amount,
      paymentType: type,
      rail: MOCK_RAILS[Math.floor(Math.random() * MOCK_RAILS.length)],
      priority,
      status,
      requestedDate: reqDate,
      executionDate: status === "draft" ? "" : execDate,
      settlementDate: status === "settled" ? settDate : "",
      approvedBy: status === "draft" ? "" : ["John Smith", "Sarah Chen", "Mike Johnson", "Anna Kowalski", "Carlos Rivera"][Math.floor(Math.random() * 5)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      reference: `REF-${String(i + 1).padStart(6, "0")}`,
      risk,
      slaMinutes: priority === "urgent" ? 30 : priority === "high" ? 120 : priority === "normal" ? 480 : 1440,
      cost: Math.round(amount * (Math.random() * 0.005 + 0.001) * 100) / 100,
      errorMessage: status === "failed" ? "Insufficient funds" : undefined,
    });
  }
  return payments;
})();

export const MOCK_COLLECTIONS: Collection[] = (() => {
  const collections: Collection[] = [];
  const statuses: Collection["status"][] = ["expected", "received", "overdue", "short", "disputed", "cancelled"];
  const methods: Collection["method"][] = ["wire", "ach", "sepa_direct", "rtp", "card", "direct_debit", "check", "cash"];
  const risks: Collection["risk"][] = ["low", "medium", "high"];
  const customers = [
    "Acme Corp", "Global Supplies Inc", "TechServe Solutions", "DataStream Ltd", "MegaCorp International",
    "AfriTrade Holdings", "Pacific Rim Trading", "LatinEx SA", "DownUnder Partners", "NorthStar Consulting",
    "EuroBuyers GmbH", "Asia Importers Ltd", "MENA Trading Co", "SaharaExports", "Oceania Wholesale",
    "CanDistributors Inc", "IndiaTech Partners", "ChinaSource Ltd", "BrazilTrade SA", "Japan Imports KK",
  ];

  for (let i = 0; i < 150; i++) {
    const customer = customers[i % customers.length];
    const entity = MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)];
    const region = MOCK_REGIONS[Math.floor(Math.random() * MOCK_REGIONS.length)];
    const currency = MOCK_CURRENCIES[Math.floor(Math.random() * MOCK_CURRENCIES.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const amount = Math.round(Math.random() * 15000000 * 100 + 25000 * 100) / 100;
    const varPct = (Math.random() - 0.5) * 0.2;
    const variance = Math.round(amount * varPct * 100) / 100;
    const expDate = new Date(2026, 5, 1 + Math.floor(Math.random() * 45) - 15);
    const recDate = status === "received" ? new Date(expDate.getTime() + Math.random() * 86400000 * 3).toISOString() : "";

    collections.push({
      id: `COL-${String(i + 1).padStart(5, "0")}`,
      customer,
      entity,
      region,
      currency,
      amount,
      expectedDate: expDate.toISOString(),
      receivedDate: recDate,
      method: methods[Math.floor(Math.random() * methods.length)],
      status,
      variance: status === "received" || status === "short" ? variance : 0,
      variancePercent: status === "received" || status === "short" ? Math.round(varPct * 10000) / 100 : 0,
      risk,
      reference: `INV-${String(i + 1).padStart(6, "0")}`,
    });
  }
  return collections;
})();

export const MOCK_APPROVALS: ApprovalRequest[] = (() => {
  const approvals: ApprovalRequest[] = [];
  const statuses: ApprovalRequest["status"][] = ["pending", "approved", "rejected", "escalated", "changes_requested"];
  const risks: ApprovalRequest["risk"][] = ["low", "medium", "high"];
  const approvers = ["John Smith", "Sarah Chen", "Mike Johnson", "Anna Kowalski", "Carlos Rivera", "Emily Watson", "David Park", "Lisa Tanaka"];

  for (let i = 0; i < 40; i++) {
    const payment = MOCK_PAYMENTS[i % MOCK_PAYMENTS.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const sla = 480;
    const slaRem = status === "pending" ? Math.floor(Math.random() * sla) : 0;
    const chainLength = 2 + Math.floor(Math.random() * 3);

    approvals.push({
      id: `APPR-${String(i + 1).padStart(3, "0")}`,
      paymentId: payment.id,
      paymentReference: payment.reference,
      entity: payment.entity,
      counterparty: payment.counterparty,
      currency: payment.currency,
      amount: payment.amount,
      paymentType: payment.paymentType,
      requestedBy: ["Alice Brown", "Bob Wilson", "Carol Davis", "Dan Lee", "Eva Martinez"][Math.floor(Math.random() * 5)],
      approver: approvers[Math.floor(Math.random() * approvers.length)],
      approvalLevel: Math.ceil(Math.random() * chainLength),
      approvalChain: approvers.slice(0, chainLength),
      status,
      slaMinutes: sla,
      slaRemainingMinutes: slaRem,
      policy: risk === "high" ? "Level 3 - Executive Approval Required" : risk === "medium" ? "Level 2 - Director Approval" : "Level 1 - Manager Approval",
      risk,
      requestedDate: new Date(2026, 5, 1 + Math.floor(Math.random() * 7) - 3).toISOString(),
      responseDate: status !== "pending" ? new Date(2026, 5, 1 + Math.floor(Math.random() * 3)).toISOString() : "",
      escalationLevel: risk === "high" ? 3 : risk === "medium" ? 2 : 1,
      notes: status === "changes_requested" ? "Please update payment beneficiary details" : "",
    });
  }
  return approvals;
})();

export const MOCK_INTERCOMPANY: IntercompanyPayment[] = (() => {
  const items: IntercompanyPayment[] = [];
  const statuses: IntercompanyPayment["status"][] = ["draft", "pending_approval", "approved", "settled", "failed", "cancelled"];

  const pairs = [
    ["Perionyx US Corp", "Perionyx Europe BV"], ["Perionyx Europe BV", "Perionyx UK plc"],
    ["Perionyx UK plc", "Perionyx ME FZCO"], ["Perionyx ME FZCO", "Perionyx Africa (Pty) Ltd"],
    ["Perionyx US Corp", "Perionyx APAC Pte Ltd"], ["Perionyx Europe BV", "Perionyx LATAM SA"],
    ["Perionyx UK plc", "Perionyx Oceania Pty Ltd"], ["Perionyx US Corp", "Perionyx Canada Inc"],
    ["Perionyx APAC Pte Ltd", "Perionyx India Pvt Ltd"], ["Perionyx Europe BV", "Perionyx China Ltd"],
    ["Perionyx US Corp", "Perionyx UK plc"], ["Perionyx ME FZCO", "Perionyx Africa (Pty) Ltd"],
    ["Perionyx APAC Pte Ltd", "Perionyx Oceania Pty Ltd"], ["Perionyx LATAM SA", "Perionyx Canada Inc"],
    ["Perionyx India Pvt Ltd", "Perionyx China Ltd"], ["Perionyx Global Ltd", "Perionyx US Corp"],
    ["Perionyx Global Ltd", "Perionyx Europe BV"], ["Perionyx Global Ltd", "Perionyx UK plc"],
    ["Perionyx Europe BV", "Perionyx APAC Pte Ltd"], ["Perionyx US Corp", "Perionyx LATAM SA"],
    ["Perionyx UK plc", "Perionyx India Pvt Ltd"], ["Perionyx ME FZCO", "Perionyx China Ltd"],
    ["Perionyx Africa (Pty) Ltd", "Perionyx Oceania Pty Ltd"], ["Perionyx Canada Inc", "Perionyx Europe BV"],
    ["Perionyx LATAM SA", "Perionyx UK plc"], ["Perionyx India Pvt Ltd", "Perionyx ME FZCO"],
    ["Perionyx Oceania Pty Ltd", "Perionyx APAC Pte Ltd"], ["Perionyx China Ltd", "Perionyx US Corp"],
    ["Perionyx Global Ltd", "Perionyx APAC Pte Ltd"], ["Perionyx Global Ltd", "Perionyx LATAM SA"],
    ["Perionyx Europe BV", "Perionyx ME FZCO"], ["Perionyx US Corp", "Perionyx Africa (Pty) Ltd"],
    ["Perionyx UK plc", "Perionyx Canada Inc"], ["Perionyx APAC Pte Ltd", "Perionyx India Pvt Ltd"],
    ["Perionyx ME FZCO", "Perionyx Oceania Pty Ltd"], ["Perionyx Africa (Pty) Ltd", "Perionyx China Ltd"],
    ["Perionyx LATAM SA", "Perionyx APAC Pte Ltd"], ["Perionyx Canada Inc", "Perionyx UK plc"],
    ["Perionyx India Pvt Ltd", "Perionyx Europe BV"], ["Perionyx China Ltd", "Perionyx ME FZCO"],
    ["Perionyx Oceania Pty Ltd", "Perionyx US Corp"], ["Perionyx Africa (Pty) Ltd", "Perionyx Europe BV"],
    ["Perionyx China Ltd", "Perionyx APAC Pte Ltd"], ["Perionyx India Pvt Ltd", "Perionyx UK plc"],
    ["Perionyx Canada Inc", "Perionyx US Corp"], ["Perionyx LATAM SA", "Perionyx Europe BV"],
    ["Perionyx Oceania Pty Ltd", "Perionyx ME FZCO"], ["Perionyx APAC Pte Ltd", "Perionyx China Ltd"],
    ["Perionyx Africa (Pty) Ltd", "Perionyx India Pvt Ltd"], ["Perionyx Global Ltd", "Perionyx ME FZCO"],
  ];

  const purposes = [
    "Working capital loan", "Intercompany dividend", "Management fee", "Cost allocation",
    "Funding for expansion", "Inventory purchase", "IP royalty payment", "Shared services recharge",
    "R&D cost sharing", "Marketing fee recharge", "IT infrastructure allocation", "Legal entity restructuring",
  ];
  const methods = ["Wire", "Internal Transfer", "Book Transfer", "SWIFT"];

  for (let i = 0; i < 50; i++) {
    const pair = pairs[i % pairs.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.round(Math.random() * 25000000 * 100 + 100000 * 100) / 100;
    const interest = 3.5 + Math.random() * 4.0;

    items.push({
      id: `IC-${String(i + 1).padStart(3, "0")}`,
      fromEntity: pair[0],
      fromRegion: MOCK_REGIONS[Math.floor(Math.random() * MOCK_REGIONS.length)],
      toEntity: pair[1],
      toRegion: MOCK_REGIONS[Math.floor(Math.random() * MOCK_REGIONS.length)],
      amount,
      currency: ["USD", "EUR", "GBP", "AED"][Math.floor(Math.random() * 4)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      interestRate: Math.round(interest * 100) / 100,
      settlementDate: new Date(2026, 5, 15 + Math.floor(Math.random() * 30)).toISOString(),
      expectedCompletion: new Date(2026, 5, 20 + Math.floor(Math.random() * 15)).toISOString(),
      approvalStatus: status === "settled" ? "approved" : status as IntercompanyPayment["approvalStatus"],
      settlementMethod: methods[Math.floor(Math.random() * methods.length)],
      status,
      loanTermDays: 30 + Math.floor(Math.random() * 335),
    });
  }
  return items;
})();

export const MOCK_TRANSFERS: TreasuryTransfer[] = (() => {
  const transfers: TreasuryTransfer[] = [];
  const statuses: TreasuryTransfer["status"][] = ["draft", "pending_approval", "approved", "queued", "processing", "settled", "failed", "cancelled"];
  const purposes = ["Cash concentration", "Funding injection", "Sweep to master account", "Zero balance account funding", "Dividend distribution", "Capital call", "Profit repatriation"];

  for (let i = 0; i < 30; i++) {
    const from = MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)];
    let to = MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)];
    while (to === from) to = MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)];

    transfers.push({
      id: `TRF-${String(i + 1).padStart(4, "0")}`,
      fromAccount: `${from.substring(0, 3).toUpperCase()}-CHK-${1000 + Math.floor(Math.random() * 9000)}`,
      toAccount: `${to.substring(0, 3).toUpperCase()}-CHK-${1000 + Math.floor(Math.random() * 9000)}`,
      fromEntity: from,
      toEntity: to,
      amount: Math.round(Math.random() * 50000000 * 100 + 50000 * 100) / 100,
      currency: ["USD", "EUR", "GBP", "AED"][Math.floor(Math.random() * 4)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      requestedDate: new Date(2026, 5, 1 + Math.floor(Math.random() * 14)).toISOString(),
      executionDate: new Date(2026, 5, 2 + Math.floor(Math.random() * 14)).toISOString(),
      settlementDate: new Date(2026, 5, 3 + Math.floor(Math.random() * 14)).toISOString(),
      authorizedBy: ["John Smith", "Sarah Chen", "Mike Johnson", "Anna Kowalski", "Carlos Rivera"][Math.floor(Math.random() * 5)],
      reference: `TRF-REF-${String(i + 1).padStart(4, "0")}`,
    });
  }
  return transfers;
})();

export const MOCK_CASH_MOVEMENT: CashMovement[] = [
  { category: "opening", label: "Opening Balance", inflow: 0, outflow: 0, net: 0, runningBalance: 842750000, type: "collection" },
  { category: "collections", label: "Customer Collections", inflow: 185000000, outflow: 0, net: 185000000, runningBalance: 1027750000, type: "collection" },
  { category: "payments", label: "Vendor Payments", inflow: 0, outflow: 98000000, net: -98000000, runningBalance: 929750000, type: "payment" },
  { category: "payroll", label: "Payroll Processing", inflow: 0, outflow: 42500000, net: -42500000, runningBalance: 887250000, type: "payroll" },
  { category: "taxes", label: "Tax Payments", inflow: 0, outflow: 28500000, net: -28500000, runningBalance: 858750000, type: "tax" },
  { category: "intercompany", label: "Intercompany Transfers", inflow: 32000000, outflow: 22000000, net: 10000000, runningBalance: 868750000, type: "intercompany" },
  { category: "funding", label: "Funding Injections", inflow: 45000000, outflow: 0, net: 45000000, runningBalance: 913750000, type: "funding" },
  { category: "investments", label: "Short-term Investments", inflow: 15000000, outflow: 85000000, net: -70000000, runningBalance: 843750000, type: "investment" },
  { category: "fx", label: "FX Conversions", inflow: 12000000, outflow: 15000000, net: -3000000, runningBalance: 840750000, type: "fx" },
  { category: "fees", label: "Bank & Transaction Fees", inflow: 0, outflow: 3200000, net: -3200000, runningBalance: 837550000, type: "fees" },
  { category: "closing", label: "Closing Balance", inflow: 0, outflow: 0, net: 0, runningBalance: 837550000, type: "collection" },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = (() => {
  const events: CalendarEvent[] = [];
  const types: CalendarEvent["type"][] = ["large_payment", "payroll", "tax", "debt", "treasury", "intercompany", "recurring", "settlement"];
  const statuses: CalendarEvent["status"][] = ["draft", "pending_approval", "approved", "queued", "processing", "settled", "failed", "cancelled"];
  const priorities: CalendarEvent["priority"][] = ["urgent", "high", "normal", "low"];

  for (let d = -3; d < 35; d++) {
    const count = d === 0 ? 8 : Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const date = new Date(2026, 5, 15 + d);
      events.push({
        id: `CAL-${String(Math.abs(d * 10 + i) + 1).padStart(4, "0")}`,
        date: date.toISOString(),
        type,
        label: `${type === "large_payment" ? "Large Payment" : type === "payroll" ? "Payroll" : type === "tax" ? "Tax Filing" : type === "debt" ? "Debt Service" : type === "treasury" ? "Treasury Transfer" : type === "intercompany" ? "Intercompany Settlement" : type === "recurring" ? "Recurring Payment" : "Settlement"} ${String(i + 1)}`,
        entity: MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)],
        currency: MOCK_CURRENCIES[Math.floor(Math.random() * MOCK_CURRENCIES.length)],
        amount: Math.round(Math.random() * 25000000 * 100 + 5000 * 100) / 100,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
      });
    }
  }
  return events;
})();

export const MOCK_PAYMENT_RAILS: PaymentRail[] = [
  { id: "RAIL-001", name: "Wire", code: "WIRE", type: "domestic", volume: 12500, value: 8250000000, averageSettlementMinutes: 240, averageCost: 25, successRate: 99.2, supportedCurrencies: ["USD", "EUR", "GBP", "CHF"], supportedRegions: ["North America", "Europe"], maxAmount: 100000000, minAmount: 100 },
  { id: "RAIL-002", name: "ACH", code: "ACH", type: "domestic", volume: 85000, value: 3200000000, averageSettlementMinutes: 1440, averageCost: 0.25, successRate: 98.5, supportedCurrencies: ["USD"], supportedRegions: ["North America"], maxAmount: 25000000, minAmount: 1 },
  { id: "RAIL-003", name: "SEPA", code: "SEPA", type: "domestic", volume: 45000, value: 1800000000, averageSettlementMinutes: 1440, averageCost: 0.15, successRate: 99.5, supportedCurrencies: ["EUR"], supportedRegions: ["Europe"], maxAmount: 50000000, minAmount: 0.01 },
  { id: "RAIL-004", name: "SWIFT", code: "SWIFT", type: "cross_border", volume: 32000, value: 12000000000, averageSettlementMinutes: 2880, averageCost: 35, successRate: 97.8, supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "CHF", "AED", "ZAR", "SGD", "INR", "CNY"], supportedRegions: ["Global"], maxAmount: 500000000, minAmount: 50 },
  { id: "RAIL-005", name: "RTGS", code: "RTGS", type: "domestic", volume: 8000, value: 15000000000, averageSettlementMinutes: 0, averageCost: 15, successRate: 99.9, supportedCurrencies: ["USD", "GBP", "EUR", "INR"], supportedRegions: ["North America", "Europe", "Asia-Pacific"], maxAmount: 500000000, minAmount: 500 },
  { id: "RAIL-006", name: "RTP", code: "RTP", type: "instant", volume: 28000, value: 450000000, averageSettlementMinutes: 0, averageCost: 0.10, successRate: 99.3, supportedCurrencies: ["USD"], supportedRegions: ["North America"], maxAmount: 1000000, minAmount: 0.01 },
  { id: "RAIL-007", name: "FedNow", code: "FEDNOW", type: "instant", volume: 15000, value: 280000000, averageSettlementMinutes: 0, averageCost: 0.08, successRate: 99.4, supportedCurrencies: ["USD"], supportedRegions: ["North America"], maxAmount: 500000, minAmount: 0.01 },
  { id: "RAIL-008", name: "FPS", code: "FPS", type: "instant", volume: 22000, value: 180000000, averageSettlementMinutes: 0, averageCost: 0.05, successRate: 99.6, supportedCurrencies: ["GBP"], supportedRegions: ["Europe"], maxAmount: 1000000, minAmount: 0.01 },
  { id: "RAIL-009", name: "CHAPS", code: "CHAPS", type: "domestic", volume: 6000, value: 4200000000, averageSettlementMinutes: 120, averageCost: 28, successRate: 99.1, supportedCurrencies: ["GBP"], supportedRegions: ["Europe"], maxAmount: 50000000, minAmount: 100 },
  { id: "RAIL-010", name: "BACS", code: "BACS", type: "domestic", volume: 55000, value: 1500000000, averageSettlementMinutes: 4320, averageCost: 0.12, successRate: 98.9, supportedCurrencies: ["GBP"], supportedRegions: ["Europe"], maxAmount: 25000000, minAmount: 1 },
  { id: "RAIL-011", name: "Instant Payment", code: "INSTANT", type: "instant", volume: 35000, value: 950000000, averageSettlementMinutes: 0, averageCost: 0.15, successRate: 99.2, supportedCurrencies: ["EUR", "GBP", "USD", "SGD", "INR"], supportedRegions: ["Europe", "Asia-Pacific"], maxAmount: 250000, minAmount: 0.01 },
  { id: "RAIL-012", name: "Internal Transfer", code: "INTERNAL", type: "internal", volume: 42000, value: 25000000000, averageSettlementMinutes: 0, averageCost: 0, successRate: 100, supportedCurrencies: ["ALL"], supportedRegions: ["Global"], maxAmount: 999999999, minAmount: 0 },
  { id: "RAIL-013", name: "Book Transfer", code: "BOOK", type: "internal", volume: 18000, value: 8500000000, averageSettlementMinutes: 0, averageCost: 0, successRate: 100, supportedCurrencies: ["ALL"], supportedRegions: ["Global"], maxAmount: 999999999, minAmount: 0 },
  { id: "RAIL-014", name: "Cross-border", code: "CB", type: "cross_border", volume: 15000, value: 5200000000, averageSettlementMinutes: 2880, averageCost: 45, successRate: 96.5, supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "CHF"], supportedRegions: ["Global"], maxAmount: 250000000, minAmount: 100 },
];

export const MOCK_ROUTES: PaymentRoute[] = [
  { id: "RTE-001", currency: "USD", country: "US", preferredRail: "Wire", fallbackRail: "ACH", averageTime: 240, averageCost: 25, riskScore: 5, provider: "Mock Wire Provider", maxAmount: 100000000 },
  { id: "RTE-002", currency: "USD", country: "US", preferredRail: "ACH", fallbackRail: "Wire", averageTime: 1440, averageCost: 0.25, riskScore: 8, provider: "Mock ACH Operator", maxAmount: 25000000 },
  { id: "RTE-003", currency: "USD", country: "US", preferredRail: "RTP", fallbackRail: "FedNow", averageTime: 0, averageCost: 0.10, riskScore: 3, provider: "Mock RTP Provider", maxAmount: 1000000 },
  { id: "RTE-004", currency: "EUR", country: "DE", preferredRail: "SEPA", fallbackRail: "SWIFT", averageTime: 1440, averageCost: 0.15, riskScore: 6, provider: "Mock SEPA Operator", maxAmount: 50000000 },
  { id: "RTE-005", currency: "EUR", country: "DE", preferredRail: "RTGS", fallbackRail: "SEPA", averageTime: 0, averageCost: 15, riskScore: 4, provider: "Mock RTGS Provider (EU)", maxAmount: 500000000 },
  { id: "RTE-006", currency: "GBP", country: "GB", preferredRail: "FPS", fallbackRail: "CHAPS", averageTime: 0, averageCost: 0.05, riskScore: 3, provider: "Mock FPS Operator", maxAmount: 1000000 },
  { id: "RTE-007", currency: "GBP", country: "GB", preferredRail: "CHAPS", fallbackRail: "BACS", averageTime: 120, averageCost: 28, riskScore: 5, provider: "Mock CHAPS Provider", maxAmount: 50000000 },
  { id: "RTE-008", currency: "GBP", country: "GB", preferredRail: "BACS", fallbackRail: "CHAPS", averageTime: 4320, averageCost: 0.12, riskScore: 7, provider: "Mock BACS Operator", maxAmount: 25000000 },
  { id: "RTE-009", currency: "AED", country: "AE", preferredRail: "SWIFT", fallbackRail: "Wire", averageTime: 2880, averageCost: 35, riskScore: 12, provider: "Mock SWIFT Provider", maxAmount: 500000000 },
  { id: "RTE-010", currency: "ZAR", country: "ZA", preferredRail: "SWIFT", fallbackRail: "Wire", averageTime: 4320, averageCost: 40, riskScore: 18, provider: "Mock SWIFT Provider", maxAmount: 250000000 },
  { id: "RTE-011", currency: "SGD", country: "SG", preferredRail: "Instant Payment", fallbackRail: "SWIFT", averageTime: 0, averageCost: 0.15, riskScore: 4, provider: "Mock Instant Payment SG", maxAmount: 250000 },
  { id: "RTE-012", currency: "USD", country: "Global", preferredRail: "SWIFT", fallbackRail: "Wire", averageTime: 2880, averageCost: 35, riskScore: 10, provider: "Mock SWIFT Provider", maxAmount: 500000000 },
  { id: "RTE-013", currency: "EUR", country: "Global", preferredRail: "SWIFT", fallbackRail: "SEPA", averageTime: 2880, averageCost: 35, riskScore: 10, provider: "Mock SWIFT Provider", maxAmount: 500000000 },
  { id: "RTE-014", currency: "INR", country: "IN", preferredRail: "RTGS", fallbackRail: "SWIFT", averageTime: 0, averageCost: 10, riskScore: 8, provider: "Mock RTGS Provider (IN)", maxAmount: 250000000 },
  { id: "RTE-015", currency: "CNY", country: "CN", preferredRail: "SWIFT", fallbackRail: "CIPS", averageTime: 2880, averageCost: 30, riskScore: 14, provider: "Mock SWIFT Provider (CN)", maxAmount: 150000000 },
  { id: "RTE-016", currency: "BRL", country: "BR", preferredRail: "SWIFT", fallbackRail: "Wire", averageTime: 4320, averageCost: 45, riskScore: 20, provider: "Mock SWIFT Provider", maxAmount: 100000000 },
  { id: "RTE-017", currency: "CAD", country: "CA", preferredRail: "Wire", fallbackRail: "ACH", averageTime: 240, averageCost: 15, riskScore: 5, provider: "Mock Wire Provider CA", maxAmount: 50000000 },
  { id: "RTE-018", currency: "JPY", country: "JP", preferredRail: "SWIFT", fallbackRail: "RTGS", averageTime: 2880, averageCost: 30, riskScore: 8, provider: "Mock SWIFT Provider JP", maxAmount: 300000000 },
  { id: "RTE-019", currency: "CHF", country: "CH", preferredRail: "SIC", fallbackRail: "SWIFT", averageTime: 240, averageCost: 8, riskScore: 4, provider: "Mock SIC Provider", maxAmount: 200000000 },
  { id: "RTE-020", currency: "HKD", country: "HK", preferredRail: "FPS", fallbackRail: "SWIFT", averageTime: 0, averageCost: 0.08, riskScore: 5, provider: "Mock FPS Provider HK", maxAmount: 8000000 },
];

export const MOCK_ALERTS: PaymentAlert[] = (() => {
  const alerts: PaymentAlert[] = [];
  const categories: PaymentAlert["category"][] = ["approval_sla", "failed_payment", "settlement_delay", "duplicate_payment", "large_payment", "policy_violation", "liquidity_impact", "counterparty_risk", "fx_timing", "fraud_review"];
  const severities: PaymentAlert["severity"][] = ["info", "warning", "critical", "emergency"];
  const titles = [
    "Approval SLA at risk", "Payment failed at bank", "Settlement delayed beyond SLA",
    "Duplicate payment detected", "Large payment exceeds threshold", "Policy violation - approval chain",
    "Liquidity impact - insufficient balance", "Counterparty risk limit breached",
    "FX timing - unfavorable rate window", "Fraud review required - new beneficiary",
    "Approval queue exceeded 4h SLA", "Wire transfer failed - invalid account",
    "Settlement pending > 24h", "Same beneficiary paid twice today",
    "Payment > $5M requires board approval", "Delegated approval not permitted",
    "Cash balance below minimum threshold", "Sanctions screening alert",
    "Rate lock window closing in 2h", "Beneficiary name mismatch detected",
  ];
  const messages = [
    "Payment approval pending beyond SLA threshold. Escalating to next approver.",
    "Bank rejected wire transfer due to account validation failure.",
    "SWIFT settlement confirmation not received within expected SLA window.",
    "Two payments to same beneficiary within 24h flagged for review.",
    "Payment exceeds $5M board approval threshold. Manual review required.",
    "Payment approval chain violated. Required approver level 3 but level 2 used.",
    "Insufficient available balance in operating account. Sweep required.",
    "Counterparty credit rating downgraded. Risk score exceeds policy limit.",
    "Current FX rate 15bps worse than 24h average. Consider delaying conversion.",
    "New beneficiary account flagged for enhanced due diligence review.",
    "Approval queue has 5 items pending > 4 hours. Urgent attention needed.",
    "Bank returned wire - account number does not match beneficiary name.",
    "RTGS settlement confirmation not received after 24 hours.",
    "System detected identical payment amount and beneficiary within 2h window.",
    "Payment amount $8.5M exceeds treasury board approval threshold of $5M.",
    "Payment approval was delegated but policy requires direct approver.",
    "Operating account balance would fall below $500K minimum after this payment.",
    "Counterparty matched sanctions screening list. Compliance review triggered.",
    "Best FX rate available for USD/EUR conversion expiring in 2 hours.",
    "Beneficiary name on payment does not match KYC records exactly.",
  ];

  for (let i = 0; i < 20; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const sev = severities[Math.floor(Math.random() * severities.length)];
    alerts.push({
      id: `PALERT-${String(i + 1).padStart(3, "0")}`,
      category: cat,
      severity: sev,
      title: titles[i % titles.length],
      message: messages[i % messages.length],
      entity: MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)],
      paymentReference: `REF-${String(Math.floor(Math.random() * 250) + 1).padStart(6, "0")}`,
      suggestedAction: cat === "approval_sla" ? "Escalate approval queue" : cat === "failed_payment" ? "Review payment details and retry" : cat === "settlement_delay" ? "Contact bank for confirmation" : cat === "duplicate_payment" ? "Verify and cancel duplicate" : cat === "large_payment" ? "Submit for board approval" : cat === "policy_violation" ? "Correct approval chain" : cat === "liquidity_impact" ? "Initiate cash sweep" : cat === "counterparty_risk" ? "Review counterparty exposure" : cat === "fx_timing" ? "Execute FX conversion immediately" : "Perform enhanced due diligence",
      timestamp: new Date(2026, 5, 15, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
      acknowledged: Math.random() > 0.6,
    });
  }
  return alerts;
})();

export const MOCK_RECOMMENDATIONS: PaymentRecommendation[] = [
  { id: "PREC-001", title: "Delay Low-Priority Vendor Payments", description: "15 low-priority vendor payments totaling $3.2M can be delayed by 7 days to improve liquidity buffer.", impact: 3200000, impactLabel: "+$3.2M liquidity", priority: "high", category: "timing", entity: "Perionyx US Corp", roi: "Improves DSO by 2.3 days" },
  { id: "PREC-002", title: "Accelerate Customer Collections", description: "5 overdue customer invoices totaling $4.8M aged 15-30 days. Initiate automated reminders and escalation.", impact: 4800000, impactLabel: "+$4.8M cash", priority: "high", category: "collections", entity: "Perionyx Europe BV", roi: "Reduces AR by 12%" },
  { id: "PREC-003", title: "Move Payroll Execution Earlier", description: "Payroll processing currently settles on day 1. Moving to day -1 reduces liquidity uncertainty by $4.2M.", impact: 4200000, impactLabel: "+$4.2M certainty", priority: "medium", category: "timing", entity: "Perionyx Global Ltd", roi: "Improves cash forecasting accuracy" },
  { id: "PREC-004", title: "Split Large Wire into ACH Batches", description: "Wire of $2.8M to vendor can be split into 3 ACH batches saving $22 in fees. No settlement impact.", impact: 22, impactLabel: "$22 savings", priority: "low", category: "rail_optimization", entity: "Perionyx US Corp", roi: "99% cost reduction per payment" },
  { id: "PREC-005", title: "Switch to Lower-Cost Payment Rail", description: "12 SWIFT payments to EU counterparties can use SEPA instead, saving $420 in fees and reducing settlement time.", impact: 420, impactLabel: "$420 savings", priority: "medium", category: "rail_optimization", entity: "Perionyx Europe BV", roi: "93% cost reduction + faster settlement" },
  { id: "PREC-006", title: "Consolidate Vendor Payments", description: "8 payments to Acme Corp totaling $1.6M can be consolidated into a single weekly payment, reducing wire fees by $175.", impact: 175, impactLabel: "$175 savings", priority: "low", category: "consolidation", entity: "Perionyx US Corp", roi: "Reduces transaction volume by 87%" },
  { id: "PREC-007", title: "Reduce Settlement Risk Exposure", description: "3 cross-border SWIFT payments totaling $12.5M to high-risk jurisdictions. Consider RTGS or correspondent banking.", impact: 12500000, impactLabel: "$12.5M exposure", priority: "critical", category: "risk", entity: "Perionyx Africa (Pty) Ltd", roi: "Mitigates potential $12.5M loss" },
  { id: "PREC-008", title: "Improve Liquidity Timing for Tax Payment", description: "Quarterly tax payment of $8.5M due in 14 days. Current cash position requires intercompany loan to cover.", impact: 8500000, impactLabel: "$8.5M coverage", priority: "high", category: "liquidity", entity: "Perionyx UK plc", roi: "Avoids late payment penalty of $425K" },
  { id: "PREC-009", title: "Flag Duplicate Payment Risk", description: "Two payments to TechServe Solutions totaling $450K have similar amounts and same reference. Verify before processing.", impact: 450000, impactLabel: "$450K at risk", priority: "critical", category: "duplicate", entity: "Perionyx Europe BV", roi: "Prevents $450K potential loss" },
  { id: "PREC-010", title: "Schedule FX Conversion at Optimal Rate", description: "USD/EUR conversion of $5M currently 15bps below 30-day average. Wait 48h for expected rate improvement.", impact: 75000, impactLabel: "+$75K value", priority: "medium", category: "fx", entity: "Perionyx Europe BV", roi: "Improves FX margin by 15bps" },
  { id: "PREC-011", title: "Escalate Overdue Approval Queue", description: "6 payments totaling $3.8M pending approval > 4 hours. SLA breach risk. Escalate to backup approvers.", impact: 3800000, impactLabel: "$3.8M unblocked", priority: "high", category: "timing", entity: "Perionyx US Corp", roi: "Prevents operational disruption" },
  { id: "PREC-012", title: "Implement Auto-Sweep for Idle Cash", description: "Operating accounts holding $2.1M above target. Auto-sweep to interest-bearing account yields additional $8.4K/month.", impact: 100800, impactLabel: "+$100.8K/year", priority: "medium", category: "liquidity", entity: "Perionyx Global Ltd", roi: "4.8% annual yield on swept funds" },
  { id: "PREC-013", title: "Review High-Risk Counterparty Exposure", description: "Counterparty AfriTrade Holdings has $6.2M total exposure with deteriorating credit rating. Reduce credit limit.", impact: 6200000, impactLabel: "$6.2M exposure", priority: "high", category: "risk", entity: "Perionyx Africa (Pty) Ltd", roi: "Reduces potential default loss" },
  { id: "PREC-014", title: "Optimize Intercompany Loan Structure", description: "6 intercompany loans totaling $18.5M can be netted to reduce cross-border FX costs by $12K.", impact: 12000, impactLabel: "$12K savings", priority: "low", category: "consolidation", entity: "Perionyx Global Ltd", roi: "Reduces FX conversion costs by 35%" },
  { id: "PREC-015", title: "Pre-Fund Payroll Account", description: "Payroll of $4.2M due in 3 days. Pre-fund today to avoid last-minute wire rush fees.", impact: 4200000, impactLabel: "$4.2M payroll", priority: "high", category: "timing", entity: "Perionyx US Corp", roi: "Avoids $2.5K rush wire fees" },
  { id: "PREC-016", title: "Convert Idle GBP to USD", description: "UK entity holding £3.5M idle cash. Convert to USD at current favorable rate to fund US operations.", impact: 3500000, impactLabel: "£3.5M deployed", priority: "medium", category: "fx", entity: "Perionyx UK plc", roi: "Eliminates idle cash drag" },
  { id: "PREC-017", title: "Renegotiate Bank Fee Structure", description: "Current average wire cost of $25 is 20% above market. Renegotiate with primary banks for volume discount.", impact: 48000, impactLabel: "$48K/year savings", priority: "low", category: "rail_optimization", entity: "Perionyx Global Ltd", roi: "20% reduction in wire fees" },
  { id: "PREC-018", title: "Set Up Payment Batching for APAC", description: "APAC entities process payments individually. Implement daily batching to reduce SWIFT costs by 40%.", impact: 36000, impactLabel: "$36K/year savings", priority: "low", category: "consolidation", entity: "Perionyx APAC Pte Ltd", roi: "40% cost reduction" },
  { id: "PREC-019", title: "Verify Beneficiary Before Release", description: "Payment to new beneficiary Global Supplies Inc for $850K flagged for enhanced due diligence. Verify bank details.", impact: 850000, impactLabel: "$850K at risk", priority: "critical", category: "risk", entity: "Perionyx US Corp", roi: "Prevents potential fraud loss" },
  { id: "PREC-020", title: "Align Payment Timing with FX Window", description: "EUR-denominated payments of $6.5M can be shifted 2 days to align with expected favorable EUR/USD rate.", impact: 97500, impactLabel: "+$97.5K value", priority: "medium", category: "fx", entity: "Perionyx Europe BV", roi: "15bps improvement on $6.5M" },
  { id: "PREC-021", title: "Increase Minimum Liquidity Buffer", description: "Current $12M liquidity buffer below policy minimum of $15M. Reduce outgoing payments until buffer restored.", impact: 3000000, impactLabel: "+$3M buffer", priority: "high", category: "liquidity", entity: "Perionyx Global Ltd", roi: "Restores policy compliance" },
  { id: "PREC-022", title: "Automate Payment Reconciliation", description: "35% of payments lack automated reconciliation. Implement matching rules to reduce manual effort by 150 hours/month.", impact: 180000, impactLabel: "$180K/year savings", priority: "medium", category: "consolidation", entity: "Perionyx Global Ltd", roi: "150 hrs/month saved" },
  { id: "PREC-023", title: "Escalate Failed SWIFT Payment", description: "SWIFT payment to LatinEx SA of $420K failed. Initiate trace and consider alternative correspondent bank.", impact: 420000, impactLabel: "$420K unblocked", priority: "high", category: "risk", entity: "Perionyx LATAM SA", roi: "Unblocks critical vendor payment" },
  { id: "PREC-024", title: "Net Intercompany Balances", description: "12 intercompany balances across entities can be netted to reduce gross settlement volume by 60%.", impact: 15000000, impactLabel: "$15M reduction", priority: "medium", category: "consolidation", entity: "Perionyx Global Ltd", roi: "60% reduction in IC settlement volume" },
  { id: "PREC-025", title: "Implement Payment Calendar Automation", description: "35 recurring payments can be automated on a payment calendar, reducing manual processing by 40 hours/week.", impact: 240000, impactLabel: "$240K/year savings", priority: "low", category: "consolidation", entity: "Perionyx Global Ltd", roi: "40 hrs/week saved" },
];

export const MOCK_INSIGHTS: PaymentInsight[] = [
  { label: "Largest Outgoing Payment", value: "$8.5M", description: "Tax payment to GovCo Federal from Perionyx UK plc", metric: "8,500,000", entity: "Perionyx UK plc", severity: "warning" },
  { label: "Largest Collection", value: "$4.2M", description: "Client payment from MegaCorp International to Perionyx ME FZCO", metric: "4,200,000", entity: "Perionyx ME FZCO", severity: "positive" },
  { label: "Most Active Entity", value: "47 payments", description: "Perionyx US Corp processes the highest payment volume today", metric: "47", entity: "Perionyx US Corp", severity: "positive" },
  { label: "Highest Settlement Delay", value: "4 days", description: "Cross-border payments to Africa region averaging 96h settlement", metric: "96h", entity: "Perionyx Africa (Pty) Ltd", severity: "critical" },
  { label: "Most Expensive Rail", value: "$45 avg", description: "Cross-border rail has highest average cost per transaction", metric: "45", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Highest Processing Volume", value: "$42.5M", description: "SWIFT rail processing highest total value today", metric: "42,500,000", entity: "Perionyx Global Ltd", severity: "positive" },
  { label: "Largest Cash Outflow", value: "$98M", description: "Total vendor payments represent largest cash outflow category", metric: "98,000,000", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Largest Cash Inflow", value: "$185M", description: "Customer collections represent largest cash inflow category", metric: "185,000,000", entity: "Perionyx Global Ltd", severity: "positive" },
];

export const MOCK_RISK_ITEMS: PaymentRiskItem[] = [
  { id: "RISK-001", category: "high_value", label: "High Value Payments", description: "3 payments exceeding $5M requiring board approval", value: 18500000, count: 3, severity: "critical", entity: "Perionyx Global Ltd" },
  { id: "RISK-002", category: "duplicate", label: "Duplicate Risk", description: "2 potential duplicate payments flagged for review", value: 620000, count: 2, severity: "watch", entity: "Perionyx Europe BV" },
  { id: "RISK-003", category: "sanctions", label: "Sanctions Review", description: "1 counterparty matched sanctions screening list", value: 1200000, count: 1, severity: "critical", entity: "Perionyx Africa (Pty) Ltd" },
  { id: "RISK-004", category: "approval_breach", label: "Approval Breach", description: "4 payments approved without required authorization level", value: 3200000, count: 4, severity: "critical", entity: "Perionyx US Corp" },
  { id: "RISK-005", category: "policy_violation", label: "Policy Violation", description: "6 payments violating treasury policy", value: 4500000, count: 6, severity: "watch", entity: "Perionyx UK plc" },
  { id: "RISK-006", category: "settlement_delay", label: "Settlement Delay", description: "8 payments exceeding settlement SLA", value: 7800000, count: 8, severity: "watch", entity: "Perionyx APAC Pte Ltd" },
  { id: "RISK-007", category: "liquidity", label: "Liquidity Risk", description: "2 payments would cause balance below minimum threshold", value: 5200000, count: 2, severity: "critical", entity: "Perionyx LATAM SA" },
  { id: "RISK-008", category: "counterparty", label: "Counterparty Risk", description: "Counterparty credit rating downgraded for 2 active payments", value: 3200000, count: 2, severity: "watch", entity: "Perionyx Africa (Pty) Ltd" },
];

export const MOCK_TREND_DATA: Record<string, TrendPoint[]> = {
  cashMovement: [
    { date: "2026-05-01", value: 842750000, label: "May 1" },
    { date: "2026-05-05", value: 868200000, label: "May 5" },
    { date: "2026-05-10", value: 891500000, label: "May 10" },
    { date: "2026-05-15", value: 878900000, label: "May 15" },
    { date: "2026-05-20", value: 912300000, label: "May 20" },
    { date: "2026-05-25", value: 898700000, label: "May 25" },
    { date: "2026-06-01", value: 837550000, label: "Jun 1" },
  ],
  paymentVolume: [
    { date: "2026-05-01", value: 185, label: "May 1" },
    { date: "2026-05-05", value: 210, label: "May 5" },
    { date: "2026-05-10", value: 195, label: "May 10" },
    { date: "2026-05-15", value: 245, label: "May 15" },
    { date: "2026-05-20", value: 220, label: "May 20" },
    { date: "2026-05-25", value: 235, label: "May 25" },
    { date: "2026-06-01", value: 250, label: "Jun 1" },
  ],
  settlementPerformance: [
    { date: "2026-05-01", value: 95.2, label: "May 1" },
    { date: "2026-05-05", value: 96.8, label: "May 5" },
    { date: "2026-05-10", value: 94.5, label: "May 10" },
    { date: "2026-05-15", value: 97.1, label: "May 15" },
    { date: "2026-05-20", value: 93.8, label: "May 20" },
    { date: "2026-05-25", value: 95.5, label: "May 25" },
    { date: "2026-06-01", value: 96.2, label: "Jun 1" },
  ],
  netCashFlow: [
    { date: "2026-05-01", value: 125000000, label: "May 1" },
    { date: "2026-05-05", value: 98000000, label: "May 5" },
    { date: "2026-05-10", value: 145000000, label: "May 10" },
    { date: "2026-05-15", value: 87000000, label: "May 15" },
    { date: "2026-05-20", value: 115000000, label: "May 20" },
    { date: "2026-05-25", value: 102000000, label: "May 25" },
    { date: "2026-06-01", value: -5200000, label: "Jun 1" },
  ],
};

export const MOCK_PAYMENT_METRICS: PaymentMetrics = {
  outgoingCount: 250,
  outgoingValue: 289500000,
  incomingCount: 150,
  incomingValue: 185000000,
  netCashFlow: -104500000,
  pendingCount: 42,
  pendingValue: 38500000,
  awaitingApproval: 18,
  awaitingApprovalValue: 18500000,
  completedToday: 85,
  completedTodayValue: 92300000,
  failedToday: 3,
  failedTodayValue: 1850000,
  averageProcessingMinutes: 45,
  averageSettlementHours: 18.5,
  dailyVolume: 250,
  entities: 12,
  banks: 12,
  currencies: 14,
  alerts: 20,
  trend: "stable",
  lastUpdated: new Date().toISOString(),
};

export const MOCK_ANALYTICS_SERIES: AnalyticsSeries[] = [
  { name: "Incoming", data: MOCK_TREND_DATA.cashMovement.map((d) => ({ ...d, value: d.value * 1.15 })), color: "#22c55e" },
  { name: "Outgoing", data: MOCK_TREND_DATA.cashMovement.map((d) => ({ ...d, value: d.value * 0.85 })), color: "#ef4444" },
  { name: "Net", data: MOCK_TREND_DATA.cashMovement, color: "#c9a84c" },
];
