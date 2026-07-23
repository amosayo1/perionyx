import type { TaxService } from "./services/tax-service";
import type {
  TaxJurisdiction, TaxAuthority, IndirectTaxTransaction, TaxReturn, TaxPayment,
  TransferPricingRecord, WithholdingTaxRecord, ComplianceRecord, TaxRecommendation,
  TaxAlert, TaxKPI, TaxCalendarEntry, TaxForecast, AuditEvent,
  TaxJurisdictionLevel, TaxType, TaxReturnStatus, TaxPaymentStatus,
  ComplianceStatus, TransferPricingMethod, TaxCalendarStatus, TaxRegistration,
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

const COMPANY_IDS: readonly string[] = ["co_001", "co_002", "co_003"];
const USERS: readonly string[] = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson"];

const COUNTRIES: readonly string[] = ["US", "GB", "CA", "AU", "DE", "FR", "JP", "SG", "AE", "BR", "IN", "MX", "CH", "NL", "SE", "NO", "DK", "IE", "NZ"];
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia", DE: "Germany",
  FR: "France", JP: "Japan", SG: "Singapore", AE: "UAE", BR: "Brazil",
  IN: "India", MX: "Mexico", CH: "Switzerland", NL: "Netherlands", SE: "Sweden",
  NO: "Norway", DK: "Denmark", IE: "Ireland", NZ: "New Zealand",
};
const STATES: Record<string, readonly string[]> = {
  US: ["California", "Texas", "New York", "Florida"],
  CA: ["Ontario", "Quebec"],
  DE: ["Bavaria", "Hesse"],
};
const CITIES: Record<string, readonly string[]> = {
  US: ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco"],
  GB: ["London", "Manchester", "Birmingham"],
  DE: ["Berlin", "Munich", "Hamburg"],
  JP: ["Tokyo", "Osaka", "Yokohama"],
};
const CCY: readonly string[] = ["USD", "EUR", "GBP", "CAD", "JPY", "SGD", "BRL"];
const TAX_TYPES_LIST: readonly TaxType[] = ["vat", "gst", "sales-tax", "corporate-income", "withholding", "payroll", "property", "import-duty", "digital-services"];
const TRANSFER_METHODS: readonly TransferPricingMethod[] = ["cup", "resale-price", "cost-plus", "profit-split", "tnmm"];
const ALL_LEVELS: readonly TaxJurisdictionLevel[] = ["country", "state", "region", "city"];
const STATUSES = {
  return: ["draft", "reviewed", "approved", "submitted", "amended", "cancelled"] as TaxReturnStatus[],
  payment: ["scheduled", "pending", "paid", "partial", "overpaid", "refunded"] as TaxPaymentStatus[],
  compliance: ["compliant", "non-compliant", "at-risk", "pending-review", "under-audit"] as ComplianceStatus[],
  calendar: ["upcoming", "upcoming", "upcoming", "overdue", "completed", "waived"] as TaxCalendarStatus[],
};

export function seedTaxData(svc: TaxService): void {
  let jurisdictionIdx = 0;
  for (const country of COUNTRIES) {
    const countryJ: TaxJurisdiction = {
      id: `jur_${country}`, name: COUNTRY_NAMES[country] ?? country, level: "country",
      country, countryCode: country, taxTypes: pick([TAX_TYPES_LIST, TAX_TYPES_LIST.slice(0, 3)]) as TaxType[],
      currency: pick(CCY), standardRate: rand(5, 25), isActive: true,
      effectiveFrom: daysAgo(rand(365, 730)), companyId: pick(COMPANY_IDS),
      createdAt: daysAgo(rand(365, 730)), updatedAt: daysAgo(rand(0, 30)),
    };
    svc.jurisdictions.addJurisdiction(countryJ);
    jurisdictionIdx++;

    for (let i = 0; i < 3; i++) {
      const auth: TaxAuthority = {
        id: `auth_${country}_${i}`, jurisdictionId: countryJ.id, name: `${COUNTRY_NAMES[country]} Tax Authority ${i + 1}`,
        code: `${country}TAX${i + 1}`, contactName: pick(USERS), contactEmail: `tax@${country.toLowerCase()}.gov`,
        contactPhone: `+1-555-${rand(100, 999)}-${rand(1000, 9999)}`, filingFrequency: pick(["monthly", "quarterly", "annual"]),
        paymentTerms: "30 days", isActive: true, companyId: pick(COMPANY_IDS),
        createdAt: daysAgo(rand(365, 730)), updatedAt: daysAgo(rand(0, 30)),
      };
      svc.jurisdictions.addAuthority(auth);
    }
  }
  for (let i = 0; i < 120; i++) {
    const level = pick(ALL_LEVELS);
    const country = pick(COUNTRIES);
    const taxTypes: TaxType[] = [pick(TAX_TYPES_LIST)];
    if (rand(0, 1) === 0) taxTypes.push(pick(TAX_TYPES_LIST));
    const j: TaxJurisdiction = {
      id: `jur_extra_${i}`, name: `${COUNTRY_NAMES[country]} ${level} ${i}`,
      level, country, countryCode: country, state: level === "state" || level === "region" ? pick(STATES[country] ?? []) : undefined,
      region: level === "region" ? `${country} Region ${i}` : undefined,
      city: level === "city" ? pick(CITIES[country] ?? []) : undefined,
      taxTypes, currency: pick(CCY), standardRate: rand(5, 25), isActive: rand(0, 4) > 0,
      effectiveFrom: daysAgo(rand(30, 730)), effectiveTo: rand(0, 3) === 0 ? daysAgo(1) : undefined,
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(30, 730)), updatedAt: daysAgo(rand(0, 30)),
    };
    svc.jurisdictions.addJurisdiction(j);
  }

  for (let i = 0; i < 2500; i++) {
    const isVat = rand(0, 1) === 0;
    const tx: IndirectTaxTransaction = {
      id: `tax_tx_${i}`, transactionId: `txn_${i}`,
      transactionType: pick(["sale", "purchase", "import", "export", "adjustment"]),
      jurisdictionId: `jur_${pick(COUNTRIES)}`, taxType: isVat ? "vat" : pick(["gst", "sales-tax", "withholding"] as TaxType[]),
      taxableAmount: round2(rand(1000, 1000000)), taxAmount: 0, inputTax: round2(rand(100, 50000)),
      outputTax: round2(rand(100, 80000)), netTax: 0, currency: pick(CCY), exchangeRate: round2(rand(80, 140) / 100),
      transactionDate: daysAgo(rand(0, 365)), isReverseCharge: rand(0, 9) === 0, isExempt: rand(0, 14) === 0,
      description: `${isVat ? "VAT" : "GST"} transaction ${i}`, companyId: pick(COMPANY_IDS),
      createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    tx.taxAmount = tx.outputTax;
    tx.netTax = tx.outputTax - tx.inputTax;
    svc.indirectTax.addTransaction(tx);
  }

  for (let i = 0; i < 500; i++) {
    const provType = pick(["current", "deferred", "estimated"] as const);
    const taxableIncome = round2(rand(1000000, 500000000));
    const taxRate = rand(10, 35);
    const jId = `jur_${pick(COUNTRIES)}`;
    const p = {
      id: `prov_${i}`, jurisdictionId: jId, provisionType: provType,
      taxType: "corporate-income" as TaxType, accountingProfit: round2(rand(500000, 600000000)),
      taxableIncome, taxRate, taxPayable: round2(taxableIncome * taxRate / 100),
      deferredTaxAsset: round2(rand(10000, 500000)), deferredTaxLiability: round2(rand(10000, 500000)),
      adjustments: round2(rand(-50000, 50000)), period: `2026-Q${rand(1, 4)}`, fiscalYear: "2026",
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    } as const;
    svc.directTax.addProvision(p);
  }

  for (let i = 0; i < 400; i++) {
    const w: WithholdingTaxRecord = {
      id: `wh_${i}`, withholdingType: pick(["supplier", "customer", "interest", "dividends", "royalties", "services"] as const),
      jurisdictionId: `jur_${pick(COUNTRIES)}`, payeeId: `payee_${i}`, payeeName: `Payee ${i}`,
      payeeType: pick(["supplier", "customer", "employee", "investor"] as const),
      grossAmount: round2(rand(10000, 2000000)), withholdingRate: round2(rand(5, 30)),
      withholdingAmount: 0, netAmount: 0, currency: pick(CCY), exchangeRate: round2(rand(80, 140) / 100),
      isRecoverable: rand(0, 3) > 0, recoveredAmount: 0,
      status: pick(["certified", "pending", "cancelled"] as const),
      transactionDate: daysAgo(rand(0, 365)), companyId: pick(COMPANY_IDS),
      createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    w.withholdingAmount = round2(w.grossAmount * w.withholdingRate / 100);
    w.netAmount = w.grossAmount - w.withholdingAmount;
    if (w.isRecoverable) w.recoveredAmount = round2(w.withholdingAmount * rand(50, 100) / 100);
    svc.withholding.addRecord(w);
  }

  for (let i = 0; i < 150; i++) {
    const tp: TransferPricingRecord = {
      id: `tp_${i}`, relatedPartyId: `rp_${i}`, relatedPartyName: `Related Entity ${i}`,
      transactionType: pick(["goods", "services", "intangibles", "loans", "management-fees"] as const),
      method: pick(TRANSFER_METHODS), controlledAmount: round2(rand(500000, 50000000)),
      armLengthAmount: round2(rand(500000, 50000000)), adjustment: 0,
      currency: pick(CCY), documentationStatus: pick(["complete", "needed", "incomplete"]),
      riskRating: pick(["low", "medium", "high"]), fiscalYear: "2026",
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    tp.adjustment = round2(tp.controlledAmount - tp.armLengthAmount);
    svc.transferPricing.addRecord(tp);
  }

  for (let i = 0; i < 500; i++) {
    const r: TaxReturn = {
      id: `ret_${i}`, returnNumber: `RET-2026-${String(i).padStart(4, "0")}`,
      jurisdictionId: `jur_${pick(COUNTRIES)}`, returnType: pick(["vat", "corporate-income", "withholding"] as TaxType[]),
      period: `2026-Q${rand(1, 4)}`, fiscalYear: "2026", status: pick(STATUSES.return),
      totalLiability: round2(rand(50000, 5000000)), totalPaid: 0, amountDue: 0, amountRefund: 0,
      currency: pick(CCY), dueDate: daysAgo(rand(-60, 90)),
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(30, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    r.totalPaid = r.status === "submitted" || r.status === "amended" ? round2(rand(0, r.totalLiability)) : 0;
    r.amountDue = r.totalLiability - r.totalPaid;
    if (r.amountDue < 0) { r.amountRefund = -r.amountDue; r.amountDue = 0; }
    svc.returns.addReturn(r);
  }

  for (let i = 0; i < 300; i++) {
    const pm: TaxPayment = {
      id: `pmt_${i}`, jurisdictionId: `jur_${pick(COUNTRIES)}`,
      paymentType: pick(["estimated", "filing", "penalty", "refund"] as const),
      amount: round2(rand(10000, 2000000)), currency: pick(CCY), exchangeRate: round2(rand(80, 140) / 100),
      status: pick(STATUSES.payment), dueDate: daysAgo(rand(-30, 90)),
      method: pick(["wire", "ach", "check"] as const), interestAmount: 0, penaltyAmount: 0,
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    if (pm.status === "paid" || pm.status === "partial") pm.paidDate = daysAgo(rand(0, 30));
    if (pm.status === "refunded") pm.paidDate = daysAgo(rand(0, 30));
    svc.payments.addPayment(pm);
  }

  for (let i = 0; i < 250; i++) {
    const c: ComplianceRecord = {
      id: `comp_${i}`, jurisdictionId: `jur_${pick(COUNTRIES)}`, period: `2026-Q${rand(1, 4)}`,
      status: pick(STATUSES.compliance), complianceScore: rand(40, 100),
      riskLevel: pick(["low", "medium", "high", "critical"] as const), violations: [],
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(0, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    if (rand(0, 2) === 0) c.violations = ["late_filing", "underpayment"];
    if (c.status === "non-compliant" || c.status === "at-risk") c.complianceScore = rand(20, 60);
    svc.compliance.addRecord(c);
  }

  for (let i = 0; i < 200; i++) {
    const sev = pick(["critical", "warning", "info"] as const);
    const al: TaxAlert = {
      id: `alert_${i}`, severity: sev,
      type: pick(["filing-missed", "payment-overdue", "compliance-breach", "audit-notice"]),
      title: `${sev === "critical" ? "Critical" : sev === "warning" ? "Warning" : "Info"} Alert ${i}`,
      message: `This is a ${sev} alert for tax monitoring`,
      actionRequired: sev === "critical", dismissed: rand(0, 4) === 0,
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(0, 90)),
    };
    svc.analytics.addAlert(al);
  }

  for (let i = 0; i < 300; i++) {
    const rec: TaxRecommendation = {
      id: `rec_${i}`, type: pick(["optimization", "compliance", "savings", "risk"]),
      title: `Recommendation ${i}`, description: `Description for recommendation ${i}`,
      impact: pick(["High", "Medium", "Low"]), confidence: round2(rand(50, 99)),
      companyId: pick(COMPANY_IDS), implemented: rand(0, 3) === 0,
      createdAt: daysAgo(rand(0, 180)),
    };
    svc.analytics.addRecommendation(rec);
  }

  for (let i = 0; i < 100; i++) {
    const cat = pick(["compliance", "efficiency", "cost", "risk", "forecast"]);
    const kpi: TaxKPI = {
      id: `kpi_${i}`, name: `${cat} KPI ${i}`, value: round2(rand(50, 100)),
      previousValue: round2(rand(50, 100)), target: 95, unit: pick(["%", "days", "USD"]),
      category: cat, trend: pick(["up", "down", "stable"] as const),
      status: pick(["good", "warning", "critical"] as const),
      companyId: pick(COMPANY_IDS), period: `2026-Q${rand(1, 4)}`, date: daysAgo(rand(0, 90)),
    };
    svc.analytics.addKPI(kpi);
  }

  for (let i = 0; i < 80; i++) {
    const cal: TaxCalendarEntry = {
      id: `cal_${i}`, jurisdictionId: `jur_${pick(COUNTRIES)}`,
      obligationType: pick(["filing", "payment", "registration"] as const),
      title: `Tax Obligation ${i}`, dueDate: daysAgo(rand(-30, 90)),
      status: pick(STATUSES.calendar), reminderDays: 7,
      recurring: rand(0, 1) === 0, estimatedAmount: round2(rand(10000, 500000)),
      companyId: pick(COMPANY_IDS), createdAt: daysAgo(rand(30, 365)), updatedAt: daysAgo(rand(0, 30)),
    };
    svc.calendar.addEntry(cal);
  }
}
