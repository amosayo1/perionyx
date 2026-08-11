/**
 * Phase 21B.2 — Credit Generator
 *
 * Generates 120+ vendor credits with realistic scenarios:
 * - Overpayment credits, return credits, price adjustment credits
 * - Applied, partially applied, expired, and open statuses
 * - Links to invoices where applicable
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, weightedPick, randInt, randFloat, randomDateInRange, daysAgo, uuidFromSeed, logProgress, roundToCents, padNum } from "./seed-utils";

let companyId = process.env.SEED_COMPANY_ID ?? "";
const SEED = 42_600;

const CREDIT_STATUSES = ["ISSUED", "PARTIALLY_APPLIED", "FULLY_APPLIED", "EXPIRED"] as const;
const CREDIT_WEIGHTS = [25, 20, 40, 15];

const REASONS = [
  "Overpayment on INV-2024-001234",
  "Goods return - damaged shipment",
  "Price adjustment per contract renegotiation",
  "Service credit for SLA breach",
  "Duplicate payment correction",
  "Promotional discount credit",
  "Volume rebate credit",
  "Quality defect credit",
  "Shipping damage credit",
  "Early payment discount missed",
];

export function generateCredits(
  vendorIds: string[],
  invoiceIds: string[],
  count: number = 130,
): { id: string; companyId: string; vendorId: string; creditNumber: string; creditDate: Date; creditAmount: number; appliedAmount: number; currency: string; status: string; appliedToInvoiceId: string | null; expiryDate: Date; reason: string; createdBy: string }[] {
  const rng = createRng(SEED);
  const credits = [];

  for (let i = 0; i < count; i++) {
    const vendorId = vendorIds[i % vendorIds.length];
    const seq = i + 1;
    const creditNumber = `CN-${padNum(seq, 5)}`;
    const creditDate = randomDateInRange(daysAgo(600), daysAgo(30), rng);
    const creditAmount = roundToCents(randFloat(100, 75000, rng));

    const status = weightedPick([...CREDIT_STATUSES], CREDIT_WEIGHTS, rng);
    let appliedAmount = 0;
    let appliedToInvoiceId: string | null = null;

    if (status === "FULLY_APPLIED") {
      appliedAmount = creditAmount;
      appliedToInvoiceId = pick(invoiceIds, rng);
    } else if (status === "PARTIALLY_APPLIED") {
      appliedAmount = roundToCents(creditAmount * randFloat(0.2, 0.8, rng));
      appliedToInvoiceId = pick(invoiceIds, rng);
    }

    const expiryDate = new Date(creditDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    credits.push({
      id: uuidFromSeed(`credit-${companyId}-${creditNumber}`),
      companyId,
      vendorId,
      creditNumber,
      creditDate,
      creditAmount,
      appliedAmount,
      currency: "USD",
      status,
      appliedToInvoiceId,
      expiryDate,
      reason: pick(REASONS, rng),
      createdBy: "seed-system",
    });
  }

  return credits;
}

export async function seedCredits(
  prisma: PrismaClient,
  targetCompanyId: string = companyId,
  vendorIds: string[],
  invoiceIds: string[],
): Promise<void> {
  companyId = targetCompanyId;
  const credits = generateCredits(vendorIds, invoiceIds);
  process.stdout.write(`  Seeding ${credits.length} credits...\n`);

  for (const c of credits) {
    try {
      await prisma.procurementVendorCredit.create({
        data: {
          id: c.id, companyId: c.companyId, vendorId: c.vendorId,
          creditNumber: c.creditNumber, creditDate: c.creditDate,
          creditAmount: c.creditAmount, appliedAmount: c.appliedAmount,
          currency: c.currency, status: c.status as any,
          appliedToInvoiceId: c.appliedToInvoiceId,
          expiryDate: c.expiryDate, reason: c.reason,
          createdBy: c.createdBy, updatedBy: "seed-system",
        },
      });
    } catch (err) {
      if ((err as any)?.code !== "P2002") throw err;
    }
  }
}
