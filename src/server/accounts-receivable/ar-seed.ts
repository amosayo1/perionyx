import type { AccountsReceivableService } from "./services/accounts-receivable-service";
import type {
  Customer, CustomerContact, Invoice, InvoiceLine, Receipt, PaymentAllocation, CashApplication,
  CollectionRecord, CollectionActivity, CreditLimit, CreditReview, Dispute, Adjustment, WriteOff,
  CustomerStatement, StatementLine, ARKPI, ARAlert, ARForecast, Recommendation,
  AgingSummary, Address, PaymentTerms,
} from "./types";

const NOW = new Date();
const DAY = 86400000;

function daysAgo(n: number): Date { return new Date(NOW.getTime() - n * DAY); }
function daysAhead(n: number): Date { return new Date(NOW.getTime() + n * DAY); }
function rand(min: number, max: number): number { return Math.round((min + Math.random() * (max - min)) * 100) / 100; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const COMPANY = "company-1";

const ADDRESSES: Address[] = [
  { line1: "100 Market Street", city: "San Francisco", state: "CA", postalCode: "94105", country: "US" },
  { line1: "200 Park Avenue", city: "New York", state: "NY", postalCode: "10017", country: "US" },
  { line1: "1 Michigan Avenue", city: "Chicago", state: "IL", postalCode: "60601", country: "US" },
  { line1: "100 King Street W", city: "Toronto", state: "ON", postalCode: "M5X 1A9", country: "CA" },
  { line1: "1 Canada Square", city: "London", state: "", postalCode: "E14 5AB", country: "GB" },
  { line1: "Chiyoda 1-1", city: "Tokyo", state: "", postalCode: "100-0005", country: "JP" },
];

const CUSTOMER_NAMES = [
  "Acme Corp", "Global Industries Inc", "MegaCorp LLC", "Premier Solutions Ltd",
  "Pacific Rim Trading", "Atlantic Partners", "Summit Enterprises", "Horizon Technologies",
  "Cascade Distribution", "Meridian Supply Co", "Frontier Logistics", "Pinnacle Services",
  "Bay Area Manufacturing", "River City Wholesale", "Northern Star Retail",
];

function makeCustomer(index: number): Customer {
  const id = `cust-${String(index + 1).padStart(3, "0")}`;
  const name = CUSTOMER_NAMES[index] ?? `Customer ${index + 1}`;
  const outstanding = rand(10000, 500000);
  const overdue = rand(0, outstanding * 0.4);
  const creditLimit = rand(200000, 2000000);
  const riskRatings: Array<"low" | "medium" | "high" | "critical"> = ["low", "low", "medium", "medium", "high"];
  const rr = pick(riskRatings);
  const contact: CustomerContact = {
    id: `${id}-contact-1`,
    firstName: "John", lastName: "Doe", email: `accounts@${name.toLowerCase().replace(/\s+/g, "")}.com`,
    phone: "+1-555-0100", isPrimary: true, title: "AP Manager",
  };
  return {
    id, customerNumber: `CUST-${String(index + 1).padStart(5, "0")}`, name,
    type: index < 11 ? "business" : index < 13 ? "government" : "nonprofit",
    status: index < 13 ? "active" : "inactive",
    email: `billing@${name.toLowerCase().replace(/\s+/g, "")}.com`,
    phone: "+1-555-0100", taxId: `TX-${String(index + 1).padStart(6, "0")}`,
    taxExempt: false, taxType: index < 8 ? "vat" : index < 12 ? "gst" : "sales",
    taxRate: index < 8 ? 20 : index < 12 ? 13 : 8.25,
    currency: index < 4 ? "USD" : index < 7 ? "EUR" : index < 10 ? "GBP" : "CAD",
    paymentTerms: { type: "net30", netDays: 30 },
    billingAddress: ADDRESSES[index % ADDRESSES.length],
    contacts: [contact],
    creditLimit, creditUsed: rand(0, creditLimit * 0.8), creditAvailable: creditLimit * 0.2,
    riskRating: rr, riskScore: rr === "low" ? rand(60, 90) : rr === "medium" ? rand(40, 60) : rand(10, 40),
    totalOutstanding: outstanding, totalOverdue: overdue,
    dso: rand(30, 65), lifetimeValue: rand(500000, 5000000),
    averagePaymentDays: rand(28, 52), onboardingDate: daysAgo(rand(180, 730)),
    companyId: COMPANY, createdAt: daysAgo(rand(180, 730)), updatedAt: daysAgo(rand(0, 30)),
  };
}

const CUSTOMER_COUNT = 15;
const CUSTOMERS = Array.from({ length: CUSTOMER_COUNT }, (_, i) => makeCustomer(i));

function makeInvoice(customer: Customer, index: number): Invoice {
  const id = `inv-${customer.id}-${index}`;
  const invDate = daysAgo(rand(0, 120));
  const dueDate = new Date(invDate.getTime() + 30 * DAY);
  const lineCount = rand(1, 5);
  const lines: InvoiceLine[] = [];
  for (let li = 0; li < lineCount; li++) {
    const qty = rand(1, 100);
    const unitPrice = rand(50, 2000);
    const netTotal = qty * unitPrice;
    lines.push({
      id: `${id}-line-${li}`,
      lineNumber: li + 1,
      description: `Product/Service ${li + 1}`,
      quantity: qty, unitPrice, taxRate: customer.taxRate,
      taxAmount: netTotal * (customer.taxRate / 100),
      discountPercent: 0, discountAmount: 0, lineTotal: netTotal, netTotal,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.netTotal, 0);
  const taxTotal = lines.reduce((s, l) => s + l.taxAmount, 0);
  const grandTotal = subtotal + taxTotal;
  const isOverdue = Math.random() > 0.4;
  const isPaid = !isOverdue && Math.random() > 0.3;
  const isDisputed = !isPaid && Math.random() > 0.85;
  const rawOverdue = Math.floor((NOW.getTime() - dueDate.getTime()) / DAY);
  const daysOverdue = isOverdue && !isPaid ? Math.max(0, rawOverdue) : 0;
  const agingBucket = daysOverdue <= 0 ? "current" : daysOverdue <= 30 ? "1to30" : daysOverdue <= 60 ? "31to60" : daysOverdue <= 90 ? "61to90" : "91plus";
  const status = isPaid ? "paid" : isDisputed ? "disputed" : isOverdue ? "overdue" : "sent";
  return {
    id, invoiceNumber: `INV-${String(index + 1).padStart(6, "0")}`,
    customerId: customer.id, customerName: customer.name,
    status: status as Invoice["status"],
    type: "standard", currency: customer.currency,
    lines, subtotal, discountTotal: 0, taxTotal, taxType: customer.taxType, taxExempt: customer.taxExempt,
    grandTotal, amountDue: isPaid ? 0 : grandTotal, amountPaid: isPaid ? grandTotal : 0,
    paymentTerms: customer.paymentTerms,
    invoiceDate: invDate, dueDate,
    paidDate: isPaid ? daysAgo(rand(0, 29)) : undefined,
    poNumber: Math.random() > 0.5 ? `PO-${String(index + 1).padStart(5, "0")}` : undefined,
    billingAddress: customer.billingAddress,
    dunningLevel: daysOverdue > 90 ? "final" : daysOverdue > 60 ? "level3" : daysOverdue > 30 ? "level2" : "level1",
    dunningCount: daysOverdue > 0 ? Math.min(Math.floor(daysOverdue / 15) + 1, 5) : 0,
    daysOverdue, agingBucket, companyId: COMPANY, createdBy: "system",
    createdAt: invDate, updatedAt: daysAgo(rand(0, 5)),
  };
}

const ALL_INVOICES: Invoice[] = [];
CUSTOMERS.forEach((c, ci) => {
  const count = rand(3, 8);
  for (let i = 0; i < count; i++) {
    ALL_INVOICES.push(makeInvoice(c, ci * 10 + i));
  }
});

function seedData(svc: AccountsReceivableService): void {
  for (const c of CUSTOMERS) svc.customers.add(c);
  for (const inv of ALL_INVOICES) svc.invoices.add(inv);

  for (const inv of ALL_INVOICES.filter((i) => i.status === "paid")) {
    const receipt: Receipt = {
      id: `rcpt-${inv.id}`,
      receiptNumber: `RCPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customerId: inv.customerId, customerName: inv.customerName,
      amount: inv.grandTotal, currency: inv.currency, fxRate: 1, baseAmount: inv.grandTotal,
      paymentMethod: pick(["bankTransfer", "check", "ach", "wire"]),
      receiptDate: inv.paidDate ?? daysAgo(rand(0, 30)), status: "applied",
      appliedAmount: inv.grandTotal, unappliedAmount: 0, onAccountAmount: 0,
      companyId: COMPANY, createdBy: "system",
      createdAt: inv.paidDate ?? daysAgo(rand(0, 30)), updatedAt: daysAgo(rand(0, 5)),
    };
    svc.receipts.add(receipt);
  }

  svc.credit.add({
    id: "credit-001", customerId: "cust-001", customerName: "Acme Corp",
    creditLimit: 500000, creditUsed: 275000, creditAvailable: 225000,
    currency: "USD", riskRating: "low", riskScore: 78, status: "active",
    approvedBy: "admin", approvalDate: daysAgo(180), reviewDate: daysAgo(90),
    lastReviewDate: daysAgo(90), nextReviewDate: daysAhead(90),
    companyId: COMPANY, createdAt: daysAgo(180), updatedAt: daysAgo(30),
  });
  svc.credit.add({
    id: "credit-002", customerId: "cust-005", customerName: "Pacific Rim Trading",
    creditLimit: 250000, creditUsed: 230000, creditAvailable: 20000,
    currency: "USD", riskRating: "high", riskScore: 35, status: "active",
    approvedBy: "admin", approvalDate: daysAgo(90), reviewDate: daysAgo(45),
    lastReviewDate: daysAgo(45), nextReviewDate: daysAhead(45),
    companyId: COMPANY, createdAt: daysAgo(90), updatedAt: daysAgo(15),
  });

  svc.collections.add({
    id: "coll-001", customerId: "cust-003", customerName: "MegaCorp LLC",
    invoiceId: "inv-cust-003-0", invoiceNumber: "INV-000003",
    amountDue: 125000, currency: "USD", daysOverdue: 65, agingBucket: "61to90",
    status: "inProgress", priority: "high", collector: "collector-1",
    assignedAt: daysAgo(10), activities: [
      {
        id: "act-001", collectionId: "coll-001",
        action: "email", description: "Sent payment reminder",
        performedBy: "collector-1", performedAt: daysAgo(10), outcome: "No response",
      },
    ],
    escalationLevel: 1, companyId: COMPANY,
    createdAt: daysAgo(10), updatedAt: daysAgo(8),
  });

  svc.disputes.add({
    id: "disp-001", disputeNumber: "DSP-000001",
    customerId: "cust-002", customerName: "Global Industries Inc",
    invoiceId: "inv-cust-002-1", invoiceNumber: "INV-000012",
    amount: 45000, currency: "USD", reason: "incorrectAmount",
    description: "Amount billed does not match purchase order", status: "investigating",
    dueDate: daysAhead(15), assignedTo: "adjuster-1",
    companyId: COMPANY, createdBy: "system", createdAt: daysAgo(14), updatedAt: daysAgo(7),
  });

  svc.adjustments.add({
    id: "adj-001", adjustmentNumber: "ADJ-000001",
    customerId: "cust-004", customerName: "Premier Solutions Ltd",
    invoiceId: "inv-cust-004-2", invoiceNumber: "INV-000023",
    type: "creditNote", status: "approved", amount: 12000, currency: "USD",
    reason: "Price adjustment per agreement", description: "Volume discount applied",
    taxImpact: 2400, approvedBy: "manager-1", approvalDate: daysAgo(5),
    appliedDate: daysAgo(5), companyId: COMPANY,
    createdBy: "system", createdAt: daysAgo(10), updatedAt: daysAgo(5),
  });

  svc.writeOffs.add({
    id: "wo-001", writeOffNumber: "WO-000001",
    customerId: "cust-008", customerName: "Horizon Technologies",
    invoiceId: "inv-cust-008-0", invoiceNumber: "INV-000045",
    originalAmount: 8500, writeOffAmount: 8500, remainingAmount: 0,
    currency: "USD", reason: "smallBalance", status: "approved",
    glAccountCode: "6400", approvedBy: "manager-1", approvalDate: daysAgo(3),
    appliedDate: daysAgo(3), recoveryAmount: 0, companyId: COMPANY,
    createdBy: "system", createdAt: daysAgo(7), updatedAt: daysAgo(3),
  });

  svc.statements.add({
    id: "stmt-001", statementNumber: "STM-000001",
    customerId: "cust-001", customerName: "Acme Corp",
    billingAddress: ADDRESSES[0], currency: "USD",
    statementDate: NOW, dueDate: daysAhead(15), status: "generated",
    beginningBalance: 125000, invoiceTotal: 85000, paymentTotal: 45000,
    adjustmentTotal: 5000, endingBalance: 160000,
    lines: [
      { invoiceNumber: "INV-000001", invoiceDate: daysAgo(45), dueDate: daysAgo(15), originalAmount: 45000, payments: 0, adjustments: 0, outstanding: 45000, daysOverdue: 15, agingBucket: "1to30" },
      { invoiceNumber: "INV-000002", invoiceDate: daysAgo(30), dueDate: NOW, originalAmount: 40000, payments: 0, adjustments: 0, outstanding: 40000, daysOverdue: 0, agingBucket: "current" },
    ],
    agingSummary: { current: 40000, days1to30: 45000, days31to60: 0, days61to90: 0, days91plus: 75000, total: 160000, totalOverdue: 120000, overduePercentage: 75, buckets: [] },
    companyId: COMPANY, createdAt: NOW, updatedAt: NOW,
  });

  svc.analytics.addKPI({
    id: "kpi-001", name: "DSO", value: 42, target: 35, unit: "days", trend: "down", changePercent: 8.3,
    period: "current", category: "efficiency", status: "atRisk",
  });
  svc.analytics.addKPI({
    id: "kpi-002", name: "Collection Efficiency Index", value: 78, target: 85, unit: "%", trend: "stable", changePercent: -1.2,
    period: "current", category: "collection", status: "atRisk",
  });
  svc.analytics.addKPI({
    id: "kpi-003", name: "Total Outstanding", value: 2450000, target: 2000000, unit: "USD", trend: "up", changePercent: 5.5,
    period: "current", category: "aging", status: "atRisk",
  });
  svc.analytics.addKPI({
    id: "kpi-004", name: "Overdue Percentage", value: 22, target: 15, unit: "%", trend: "up", changePercent: 4.7,
    period: "current", category: "aging", status: "atRisk",
  });
  svc.analytics.addKPI({
    id: "kpi-005", name: "Cash Inflow (30 days)", value: 890000, target: 1000000, unit: "USD", trend: "stable", changePercent: -1.1,
    period: "current", category: "cash", status: "onTrack",
  });
  svc.analytics.addKPI({
    id: "kpi-006", name: "High Risk Exposure", value: 450000, target: 300000, unit: "USD", trend: "up", changePercent: 12.0,
    period: "current", category: "credit", status: "critical",
  });

  svc.alerts.add({
    id: "alert-001", type: "payment", severity: "critical",
    title: "Large invoice overdue - MegaCorp LLC",
    message: "Invoice INV-000003 for $125,000 is 65 days overdue. Escalate immediately.",
    customerId: "cust-003", customerName: "MegaCorp LLC", invoiceId: "inv-cust-003-0",
    isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1),
  });
  svc.alerts.add({
    id: "alert-002", type: "credit", severity: "warning",
    title: "Credit limit near threshold - Pacific Rim Trading",
    message: "Pacific Rim Trading at 92% credit utilization ($230,000/$250,000).",
    customerId: "cust-005", customerName: "Pacific Rim Trading",
    isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(2),
  });

  svc.recommendations.add({
    id: "rec-001", type: "collection", title: "Escalate MegaCorp collection",
    description: "Invoice INV-000003 for $125,000 is 65 days overdue. Consider escalating to level 2.",
    priority: "high", status: "active", impact: 125000, impactCurrency: "USD",
    effort: "medium", customerId: "cust-003", customerName: "MegaCorp LLC",
    invoiceId: "inv-cust-003-0", createdAt: daysAgo(1), companyId: COMPANY,
  });
  svc.recommendations.add({
    id: "rec-002", type: "credit", title: "Review Pacific Rim credit limit",
    description: "Pacific Rim Trading at 92% utilization. Consider increasing limit or reducing exposure.",
    priority: "high", status: "active", impact: 20000, impactCurrency: "USD",
    effort: "low", customerId: "cust-005", customerName: "Pacific Rim Trading",
    createdAt: daysAgo(2), companyId: COMPANY,
  });
}

export { seedData };
