/**
 * Phase 21B.2 — Vendor Generator
 *
 * Generates ~150 realistic enterprise vendors with:
 * - Deterministic names, categories, statuses, risk levels
 * - Banking details, payment terms, contacts
 * - International vendors with multi-currency support
 * - Vendor performance history
 * - Vendor documents (W-9, insurance, certifications)
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, pickN, weightedPick, randInt, randFloat, randDecimal, randomDateInRange, daysAgo, addBusinessDays, uuidFromSeed, padNum, logProgress } from "./seed-utils";

const COMPANY_ID = "cmqvfocev0001koor7ragb8bq";
const SEED = 42_001;

// ── Data pools ───────────────────────────────────────────────────────────────

const STRATEGIC_NAMES = [
  "Accenture Global Solutions", "Deloitte Advisory Services", "McKinsey & Company",
  "IBM Global Services", "SAP SE", "Oracle Corporation", "Microsoft Corporation",
  "Amazon Web Services", "Salesforce Inc", "Workday Inc", "ServiceNow Inc",
  "Palantir Technologies", "Snowflake Inc", "Databricks Inc", "CrowdStrike Inc",
  "Palo Alto Networks", "Fortinet Inc", "Cisco Systems", "Juniper Networks",
  "Intel Corporation", "NVIDIA Corporation", "AMD Inc", "Qualcomm Inc",
  "Broadcom Inc", "Texas Instruments", "Applied Materials", "Lam Research",
  "ASML Holding", "TSMC", "Samsung Electronics", "SK Hynix",
  "壳牌石油 (Shell)", "BASF SE", "Dow Chemical", "3M Company",
  "Siemens AG", "ABB Ltd", "Schneider Electric", "Honeywell International",
  "General Electric", "Caterpillar Inc",
];

const STANDARD_NAMES = [
  "Apex Solutions Ltd", "BlueStar Logistics", "Cascade Manufacturing",
  "Delta Electronics", "EverGreen Supplies", "Falcon IT Services",
  "Granite Construction", "Harbor Freight Tools", "Iron Mountain Storage",
  "JetStream Communications", "Keystone Materials", "Lighthouse Analytics",
  "Meridian Consulting", "NorthPoint Engineering", "Omega Software",
  "Pinnacle Design Studio", "Quantum Data Services", "Ridgepoint Capital",
  "Summit Healthcare Supplies", "Trident Marketing Group",
  "Unified Payments Inc", "Vanguard Staffing", "Westfield Packaging",
  "Xenith Research Labs", "Yellowstone Energy", "Zenith Office Solutions",
  "Alpine Printing Co", "Bayside Consulting", "Coastal Shipping Lines",
  "Digital Forge Studios", "Eastern Seaboard Transport", "FrontRange IT",
  "Greenfield Properties", "Heartland Manufacturing", "Inland Empire Warehousing",
  "Junction City Mechanical", "Kinetic Energy Solutions", "Lakeshore Facilities",
  "Metro Clean Services", "NewHorizon Biotech", "Onward Logistics",
  "Prairie View Agriculture", "QuickTurn Prototyping", "Riverside Electric",
  "SilverLine Security", "ThunderBay Mining", "UpperCrust Catering",
  "ValleyForge Composites", "WindRiver Telecom", "Atlas Plumbing Supply",
  "Bridgeport Metalworks", "Central State Utilities", "Dakota Drilling Corp",
  "Eastern Mennonite Furniture", "Farmers Cooperative Elevator", "Golden Gate Electric",
  "Heritage Roofing Materials", "Interstate Battery Supply", "Jasper Marble & Tile",
  "Kansas City Steak Company", "Liberty Sheet Metal", "Midwest Agricultural Supply",
];

const ONETIME_NAMES = [
  "EventTech Rentals", "PopUp Infrastructure Co", "Seasonal Solutions LLC",
  "Temporary Power Systems", "FlashMove Logistics", "QuickBuild Structures",
  "RapidDeploy IT", "Surge Staffing Agency", "SprintConsulting Group",
  "OneShot Productions", "Weekend Warriors Construction", "Holiday Decor Inc",
  "Conference Connect Services", "TradeShow Builders Inc", "Emergency Supply Co",
  "Disaster Recovery Partners", "Contingency Planning Group", "Crisis Response Team",
  "SpecialEvent Catering", "VIP Executive Transport",
];

const INTERNATIONAL_NAMES = [
  "Siemens Energy AG (DE)", "Bosch Group (DE)", "ThyssenKrupp AG (DE)",
  "TotalEnergies SA (FR)", "Schneider Electric SE (FR)", "Air Liquide SA (FR)",
  "Unilever PLC (UK)", "Rolls-Royce Holdings (UK)", "BAE Systems PLC (UK)",
  "Toyota Motor Corp (JP)", "Sony Group Corp (JP)", "Hitachi Ltd (JP)",
  "Emirates Group (AE)", "ADNOC Distribution (AE)", "Emaar Properties (AE)",
  "Saudi Aramco (SA)", "SABIC (SA)", "Al-Faisal Holding (QA)",
  "Dangote Industries (NG)", "Oando PLC (NG)", "MTN Group (ZA)",
];

const CATEGORIES = ["SUPPLIER", "CONTRACTOR", "CONSULTANT", "SERVICE_PROVIDER", "DISTRIBUTOR", "MANUFACTURER"] as const;
const STATUSES = ["PENDING_REVIEW", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED", "DEACTIVATED"] as const;
const RISK_LEVELS = ["LOW", "LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH", "CRITICAL"] as const;
const PAYMENT_TERMS = ["NET15", "NET30", "NET30", "NET45", "NET60", "NET90", "NET30", "NET30"];
const PAYMENT_METHODS = ["ACH", "WIRE", "CHECK", "EFT", "VIRTUAL_CARD"] as const;
const CURRENCIES = ["USD", "USD", "USD", "USD", "EUR", "GBP", "AED", "SAR", "NGN"];

const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "Indianapolis, IN", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Nashville, TN",
];

const DOMAINS = ["tech", "supply", "global", "services", "corp", "group", "solutions", "enterprises"];

const CONTACT_FIRST = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Thomas", "Sarah", "Karen", "Daniel", "Lisa"];
const CONTACT_LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez"];

// ── Generator ────────────────────────────────────────────────────────────────

export interface GeneratedVendor {
  id: string;
  companyId: string;
  vendorCode: string;
  name: string;
  legalName: string;
  status: string;
  riskLevel: string;
  riskScore: number;
  category: string;
  taxId: string;
  taxCountry: string;
  currency: string;
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  preferredPaymentMethod: string;
  creditLimit: number;
  preferred: boolean;
  preferredRank: number | null;
  isBlocked: boolean;
  blockReason: string | null;
  rating: number;
  totalSpend: number;
  totalOrders: number;
  avgPaymentDays: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  tags: string;
  onboardingDate: Date;
  lastOrderDate: Date | null;
  createdBy: string;
  updatedBy: string;
  bankDetails: {
    bankName: string;
    bankCountry: string;
    routingNumber: string;
    accountNumber: string;
    accountHolderName: string;
    accountType: string;
    isPrimary: boolean;
    isActive: boolean;
  }[];
  performances: {
    period: string;
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
    invoiceAccuracy: number;
    returnRate: number;
    overallScore: number;
    totalOrders: number;
    totalAmount: number;
  }[];
}

const BANK_NAMES = [
  "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank", "U.S. Bank",
  "PNC Bank", "Truist Bank", "Goldman Sachs", "Morgan Stanley", "Capital One",
  "HSBC", "Deutsche Bank", "Barclays", "Standard Chartered", "BNP Paribas",
];

export function generateVendors(count: number = 150): GeneratedVendor[] {
  const rng = createRng(SEED);
  const vendors: GeneratedVendor[] = [];

  // Distribution: 40 strategic, 60 standard, 30 one-time, 20 international
  const namePools = [
    ...STRATEGIC_NAMES.map(n => ({ name: n, tier: "strategic" as const })),
    ...STANDARD_NAMES.map(n => ({ name: n, tier: "standard" as const })),
    ...ONETIME_NAMES.map(n => ({ name: n, tier: "onetime" as const })),
    ...INTERNATIONAL_NAMES.map(n => ({ name: n, tier: "international" as const })),
  ];

  for (let i = 0; i < count; i++) {
    const poolItem = namePools[i % namePools.length];
    const name = poolItem.name;
    const tier = poolItem.tier;

    const vendorCode = `VND-${padNum(i + 1, 4)}`;
    const id = uuidFromSeed(`vendor-${COMPANY_ID}-${vendorCode}`);
    const status = tier === "onetime"
      ? weightedPick(["ACTIVE", "DEACTIVATED"], [3, 7], rng)
      : tier === "strategic"
        ? weightedPick(["ACTIVE", "SUSPENDED"], [9, 1], rng)
        : weightedPick(STATUSES, [5, 50, 25, 10, 5, 3, 2], rng);

    const isInternational = tier === "international" || rng() < 0.1;
    const currency = isInternational ? pick(["EUR", "GBP", "AED", "SAR", "NGN"], rng) : "USD";
    const taxCountry = isInternational ? pick(["DE", "FR", "UK", "JP", "AE", "SA", "NG", "ZA"], rng) : "US";

    const category = tier === "strategic"
      ? weightedPick(["MANUFACTURER", "DISTRIBUTOR"], [6, 4], rng)
      : tier === "onetime"
        ? pick(["CONTRACTOR", "SERVICE_PROVIDER", "CONSULTANT"], rng)
        : pick(CATEGORIES, rng);

    const riskLevel = tier === "strategic"
      ? weightedPick(["LOW", "MEDIUM"], [8, 2], rng)
      : tier === "international"
        ? weightedPick(["LOW", "MEDIUM", "HIGH"], [4, 4, 2], rng)
        : pick(RISK_LEVELS, rng);

    const riskScore = riskLevel === "LOW" ? randFloat(1, 3, rng)
      : riskLevel === "MEDIUM" ? randFloat(4, 6, rng)
        : riskLevel === "HIGH" ? randFloat(7, 9, rng)
          : randFloat(9, 10, rng);

    const paymentTerms = tier === "strategic" ? weightedPick(["NET45", "NET60", "NET90"], [3, 5, 2], rng)
      : tier === "onetime" ? pick(["NET15", "NET30"], rng)
        : pick(PAYMENT_TERMS, rng);

    const creditLimit = tier === "strategic" ? randFloat(100000, 2000000, rng)
      : tier === "standard" ? randFloat(10000, 500000, rng)
        : randFloat(1000, 50000, rng);

    const rating = tier === "strategic" ? randFloat(3.5, 5.0, rng)
      : tier === "onetime" ? randFloat(2.0, 4.0, rng)
        : randFloat(2.5, 4.5, rng);

    const isPreferred = tier === "strategic" || (tier === "standard" && rng() < 0.3);
    const isBlocked = status === "SUSPENDED" && rng() < 0.5;

    const totalOrders = tier === "strategic" ? randInt(50, 500, rng)
      : tier === "standard" ? randInt(5, 200, rng)
        : randInt(1, 10, rng);

    const avgInvoiceAmount = tier === "strategic" ? randFloat(5000, 100000, rng)
      : tier === "standard" ? randFloat(500, 20000, rng)
        : randFloat(100, 5000, rng);

    const totalSpend = totalOrders * avgInvoiceAmount;

    const avgPaymentDays = paymentTerms === "NET15" ? randInt(10, 18, rng)
      : paymentTerms === "NET30" ? randInt(25, 38, rng)
        : paymentTerms === "NET45" ? randInt(38, 52, rng)
          : paymentTerms === "NET60" ? randInt(52, 68, rng)
            : randInt(82, 100, rng);

    const city = pick(US_CITIES, rng);
    const address = `${randInt(100, 9999, rng)} ${pick(["Main", "Oak", "Pine", "Cedar", "Elm", "Maple", "Park", "First", "Second", "Third"], rng)} ${pick(["St", "Ave", "Blvd", "Dr", "Way", "Rd"], rng)}`;

    const firstName = pick(CONTACT_FIRST, rng);
    const lastName = pick(CONTACT_LAST, rng);
    const contactName = `${firstName} ${lastName}`;
    const domain = pick(DOMAINS, rng);
    const contactEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.${domain}.com`;

    const onboardingDate = randomDateInRange(daysAgo(730), daysAgo(30), rng);
    const lastOrderDate = status === "DEACTIVATED" ? randomDateInRange(daysAgo(365), daysAgo(60), rng) : randomDateInRange(daysAgo(90), daysAgo(1), rng);

    const tags = [];
    if (isPreferred) tags.push("preferred");
    if (tier === "strategic") tags.push("strategic");
    if (isInternational) tags.push("international");
    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") tags.push("high-risk");
    if (status === "SUSPENDED") tags.push("suspended");

    // Bank details
    const bankDetails = [{
      bankName: pick(BANK_NAMES, rng),
      bankCountry: taxCountry,
      routingNumber: String(randInt(100000000, 999999999, rng)),
      accountNumber: String(randInt(1000000000, 99999999999, rng)),
      accountHolderName: name,
      accountType: pick(["CHECKING", "SAVINGS"], rng),
      isPrimary: true,
      isActive: status !== "DEACTIVATED",
    }];

    // Performance history (last 6 months)
    const performances = [];
    for (let m = 0; m < 6; m++) {
      const period = new Date();
      period.setMonth(period.getMonth() - m);
      const periodStr = `${period.getFullYear()}-${String(period.getMonth() + 1).padStart(2, "0")}`;
      const baseOD = tier === "strategic" ? 0.92 : tier === "standard" ? 0.85 : 0.75;
      performances.push({
        period: periodStr,
        onTimeDelivery: randDecimal(baseOD - 0.1, baseOD + 0.08, 2, rng),
        qualityScore: randDecimal(baseOD - 0.05, baseOD + 0.1, 2, rng),
        responseTime: randDecimal(0.7, 0.99, 2, rng),
        invoiceAccuracy: randDecimal(0.88, 0.99, 2, rng),
        returnRate: randDecimal(0, 0.08, 2, rng),
        overallScore: randDecimal(baseOD, baseOD + 0.1, 2, rng),
        totalOrders: randInt(Math.max(1, totalOrders / 8), Math.max(2, totalOrders / 3), rng),
        totalAmount: totalSpend / randInt(3, 8, rng),
      });
    }

    vendors.push({
      id,
      companyId: COMPANY_ID,
      vendorCode,
      name,
      legalName: name,
      status,
      riskLevel,
      riskScore: parseFloat(riskScore.toFixed(2)),
      category,
      taxId: isInternational ? `${taxCountry}${randInt(1000000, 99999999, rng)}` : `${randInt(10, 99, rng)}-${randInt(1000000, 9999999, rng)}`,
      taxCountry,
      currency,
      billingAddress: `${address}, ${city}`,
      shippingAddress: rng() > 0.3 ? `${address}, ${city}` : null as any,
      paymentTerms,
      preferredPaymentMethod: tier === "international" ? "WIRE" : pick(PAYMENT_METHODS, rng),
      creditLimit: parseFloat(creditLimit.toFixed(2)),
      preferred: isPreferred,
      preferredRank: isPreferred ? randInt(1, 20, rng) : null,
      isBlocked,
      blockReason: isBlocked ? "Pending compliance review" : null,
      rating: parseFloat(rating.toFixed(1)),
      totalSpend: parseFloat(totalSpend.toFixed(2)),
      totalOrders,
      avgPaymentDays,
      contactName,
      contactEmail,
      contactPhone: `+1-${randInt(200, 999, rng)}-${randInt(100, 999, rng)}-${randInt(1000, 9999, rng)}`,
      tags: JSON.stringify(tags),
      onboardingDate,
      lastOrderDate,
      createdBy: "seed-system",
      updatedBy: "seed-system",
      bankDetails,
      performances,
    });
  }

  return vendors;
}

export async function seedVendors(prisma: PrismaClient): Promise<string[]> {
  const vendors = generateVendors();
  const ids: string[] = [];

  process.stdout.write(`  Seeding ${vendors.length} vendors...\n`);

  // Batch insert for performance
  const batchSize = 50;
  for (let i = 0; i < vendors.length; i += batchSize) {
    const batch = vendors.slice(i, i + batchSize);
    for (const v of batch) {
      try {
        await prisma.procurementVendor.create({
          data: {
            id: v.id,
            companyId: v.companyId,
            vendorCode: v.vendorCode,
            name: v.name,
            legalName: v.legalName,
            status: v.status as any,
            riskLevel: v.riskLevel as any,
            riskScore: v.riskScore,
            category: v.category as any,
            taxId: v.taxId,
            taxCountry: v.taxCountry,
            currency: v.currency,
            billingAddress: v.billingAddress,
            shippingAddress: v.shippingAddress,
            paymentTerms: v.paymentTerms,
            preferredPaymentMethod: v.preferredPaymentMethod as any,
            creditLimit: v.creditLimit,
            preferred: v.preferred,
            preferredRank: v.preferredRank,
            isBlocked: v.isBlocked,
            blockReason: v.blockReason,
            rating: v.rating,
            totalSpend: v.totalSpend,
            totalOrders: v.totalOrders,
            avgPaymentDays: v.avgPaymentDays,
            contactName: v.contactName,
            contactEmail: v.contactEmail,
            contactPhone: v.contactPhone,
            tags: v.tags,
            onboardingDate: v.onboardingDate,
            lastOrderDate: v.lastOrderDate,
            createdBy: v.createdBy,
            updatedBy: v.updatedBy,
          },
        });

        // Bank details
        for (const bd of v.bankDetails) {
          await prisma.procurementVendorBankDetail.create({
            data: {
              id: uuidFromSeed(`bank-${v.id}-${bd.accountNumber}`),
              companyId: v.companyId,
              vendorId: v.id,
              bankName: bd.bankName,
              bankCountry: bd.bankCountry,
              routingNumber: bd.routingNumber,
              accountNumber: bd.accountNumber,
              accountHolderName: bd.accountHolderName,
              accountType: bd.accountType as any,
              isPrimary: bd.isPrimary,
              isActive: bd.isActive,
              createdBy: "seed-system",
              updatedBy: "seed-system",
            },
          });
        }

        // Performance history
        for (const p of v.performances) {
          await prisma.procurementVendorPerformance.create({
            data: {
              id: uuidFromSeed(`perf-${v.id}-${p.period}`),
              companyId: v.companyId,
              vendorId: v.id,
              period: p.period,
              onTimeDelivery: p.onTimeDelivery,
              qualityScore: p.qualityScore,
              responseTime: p.responseTime,
              invoiceAccuracy: p.invoiceAccuracy,
              returnRate: p.returnRate,
              overallScore: p.overallScore,
              totalOrders: p.totalOrders,
              totalAmount: p.totalAmount,
            },
          });
        }

        ids.push(v.id);
      } catch (err) {
        // Skip duplicates on re-run
        if ((err as any)?.code !== "P2002") throw err;
      }
    }
    logProgress("vendors", Math.min(i + batchSize, vendors.length), vendors.length);
  }

  return ids;
}
