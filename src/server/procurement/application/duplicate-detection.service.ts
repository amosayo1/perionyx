/**
 * Phase 21C — Duplicate Invoice Detection Service
 *
 * Compares invoices within the same company for potential duplicates using:
 * - Same vendor + exact amount match (high confidence)
 * - Same vendor + amount within tolerance (medium confidence)
 * - Same vendor + same invoice number (hard conflict — rejected at receipt)
 *
 * Confidence scoring:
 *   1.0 = exact amount + same vendor + same date
 *   0.95 = exact amount + same vendor ± 3 days
 *   0.85 = amount within 2% tolerance + same vendor
 *   0.70 = amount within 5% tolerance + same vendor
 *
 * Flags invoices via `isDuplicateSuspicion` + `duplicateConfidence` fields.
 */

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";

const AMOUNT_TIGHT_TOLERANCE = 0.02; // 2%
const AMOUNT_LOOSE_TOLERANCE = 0.05; // 5%
const DATE_EXACT_WINDOW_DAYS = 0;
const DATE_NEAR_WINDOW_DAYS = 3;
const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.70;

interface DuplicateCandidate {
  invoiceId: string;
  duplicateOfId: string;
  confidence: number;
  reasons: string[];
}

function amountWithinTolerance(a: number, b: number, tolerance: number): boolean {
  if (a === 0 || b === 0) return false;
  const diff = Math.abs(a - b);
  const avg = (a + b) / 2;
  return diff / avg <= tolerance;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

function calculateConfidence(
  amountMatch: boolean,
  amountTolerance: number,
  dateDiffDays: number,
  exactDate: boolean,
): number {
  if (amountMatch && exactDate) return 1.0;
  if (amountMatch && dateDiffDays <= DATE_NEAR_WINDOW_DAYS) return 0.95;
  if (amountTolerance <= AMOUNT_TIGHT_TOLERANCE && dateDiffDays <= DATE_NEAR_WINDOW_DAYS) return 0.85;
  if (amountTolerance <= AMOUNT_LOOSE_TOLERANCE) return 0.70;
  return 0;
}

export class DuplicateDetectionService {
  /**
   * Scan all unpaid invoices for a company and flag duplicates.
   * Returns the number of newly flagged invoices.
   */
  async scanForDuplicates(companyId: string): Promise<{
    scanned: number;
    flagged: number;
    candidates: DuplicateCandidate[];
  }> {
    const invoices = await prisma.procurementVendorInvoice.findMany({
      where: {
        companyId,
        status: { notIn: ["PAID", "VOIDED"] },
      },
      select: {
        id: true,
        vendorId: true,
        invoiceNumber: true,
        totalAmount: true,
        invoiceDate: true,
        status: true,
      },
      orderBy: { invoiceDate: "desc" },
    });

    const candidates: DuplicateCandidate[] = [];
    const flaggedIds = new Set<string>();

    // Group by vendor for efficient comparison
    const byVendor = new Map<string, typeof invoices>();
    for (const inv of invoices) {
      const list = byVendor.get(inv.vendorId) || [];
      list.push(inv);
      byVendor.set(inv.vendorId, list);
    }

    for (const [, vendorInvoices] of byVendor) {
      if (vendorInvoices.length < 2) continue;

      for (let i = 0; i < vendorInvoices.length; i++) {
        for (let j = i + 1; j < vendorInvoices.length; j++) {
          const a = vendorInvoices[i];
          const b = vendorInvoices[j];

          const amountA = a.totalAmount.toNumber();
          const amountB = b.totalAmount.toNumber();
          const exactAmountMatch = amountA === amountB;
          const tightTolerance = exactAmountMatch ? 0 : (Math.abs(amountA - amountB) / ((amountA + amountB) / 2));
          const looseTolerance = exactAmountMatch ? 0 : tightTolerance;

          const dateDiff = daysBetween(a.invoiceDate, b.invoiceDate);
          const exactDate = dateDiff === DATE_EXACT_WINDOW_DAYS;

          const reasons: string[] = [];
          if (exactAmountMatch) reasons.push("exact_amount");
          else if (tightTolerance <= AMOUNT_TIGHT_TOLERANCE) reasons.push("amount_within_2pct");
          else if (looseTolerance <= AMOUNT_LOOSE_TOLERANCE) reasons.push("amount_within_5pct");

          if (exactDate) reasons.push("same_date");
          else if (dateDiff <= DATE_NEAR_WINDOW_DAYS) reasons.push("date_within_3_days");

          if (reasons.length === 0) continue;

          const confidence = calculateConfidence(exactAmountMatch, tightTolerance, dateDiff, exactDate);
          if (confidence < MEDIUM_CONFIDENCE_THRESHOLD) continue;

          // Flag the newer invoice as the duplicate of the older one
          const older = a.invoiceDate <= b.invoiceDate ? a : b;
          const newer = a.invoiceDate <= b.invoiceDate ? b : a;

          candidates.push({
            invoiceId: newer.id,
            duplicateOfId: older.id,
            confidence,
            reasons,
          });

          flaggedIds.add(newer.id);
        }
      }
    }

    // Write flags to database
    let flagged = 0;
    for (const candidate of candidates) {
      if (flaggedIds.has(candidate.invoiceId)) {
        await prisma.procurementVendorInvoice.update({
          where: { id: candidate.invoiceId },
          data: {
            isDuplicateSuspicion: true,
            duplicateConfidence: new Prisma.Decimal(candidate.confidence),
            duplicateOfInvoiceId: candidate.duplicateOfId,
          },
        });
        flagged++;
      }
    }

    return { scanned: invoices.length, flagged, candidates };
  }

  /**
   * Dismiss a false positive — clears the duplicate suspicion flag.
   */
  async dismissFalsePositive(invoiceId: string, companyId: string): Promise<boolean> {
    const invoice = await prisma.procurementVendorInvoice.findFirst({
      where: { id: invoiceId, companyId },
    });
    if (!invoice) return false;

    await prisma.procurementVendorInvoice.update({
      where: { id: invoiceId },
      data: {
        isDuplicateSuspicion: false,
        duplicateConfidence: new Prisma.Decimal(0),
        duplicateOfInvoiceId: null,
      },
    });
    return true;
  }

  /**
   * Get all duplicate suspects for a company.
   */
  async getDuplicateSuspects(companyId: string) {
    return prisma.procurementVendorInvoice.findMany({
      where: { companyId, isDuplicateSuspicion: true },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        duplicateConfidence: true,
        duplicateOfInvoiceId: true,
        status: true,
        invoiceDate: true,
        dueDate: true,
        vendor: { select: { id: true, name: true } },
        duplicateOfInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            invoiceDate: true,
            vendor: { select: { name: true } },
          },
        },
      },
      orderBy: { duplicateConfidence: "desc" },
    });
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
