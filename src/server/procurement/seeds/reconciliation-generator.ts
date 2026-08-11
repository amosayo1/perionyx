/**
 * Phase 21B.2 — Reconciliation Generator
 *
 * Generates vendor statement reconciliations with:
 * - Matched, variance, adjusted, pending, and completed states
 * - Statement lines with invoice/payment/credit/adjustment types
 * - Reconciliation results with match rates
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, weightedPick, randInt, randFloat, randomDateInRange, daysAgo, uuidFromSeed, logProgress, roundToCents, padNum } from "./seed-utils";

let companyId = process.env.SEED_COMPANY_ID ?? "";
const SEED = 42_700;

const STATEMENT_STATUSES = ["RECEIVED", "PARSED", "RECONCILING", "RECONCILED", "EXCEPTION"] as const;
const RECONCILIATION_STATUSES = ["IN_PROGRESS", "COMPLETED", "EXCEPTION", "ADJUSTED"] as const;

export function generateReconciliation(
  vendorIds: string[],
  invoiceIds: string[],
): { statements: any[]; lines: any[]; results: any[] } {
  const rng = createRng(SEED);
  const statements: any[] = [];
  const allLines: any[] = [];
  const results: any[] = [];

  const selectedVendors = vendorIds.slice(0, Math.min(40, vendorIds.length));

  for (let i = 0; i < selectedVendors.length; i++) {
    const vendorId = selectedVendors[i];
    const seq = i + 1;
    const stmtDate = randomDateInRange(daysAgo(180), daysAgo(7), rng);
    const periodStart = new Date(stmtDate);
    periodStart.setMonth(periodStart.getMonth() - 1);
    const statementNumber = `STMT-${padNum(seq, 4)}-${stmtDate.getFullYear()}`;

    const openingBalance = roundToCents(randFloat(0, 100000, rng));
    const totalInvoices = roundToCents(randFloat(5000, 200000, rng));
    const totalPayments = roundToCents(randFloat(3000, 150000, rng));
    const totalCredits = roundToCents(randFloat(0, 20000, rng));
    const closingBalance = roundToCents(openingBalance + totalInvoices - totalPayments - totalCredits);

    const stmtStatus = weightedPick([...STATEMENT_STATUSES], [10, 15, 20, 45, 10], rng);

    const stmtId = uuidFromSeed(`stmt-${companyId}-${statementNumber}`);
    statements.push({
      id: stmtId,
      companyId,
      vendorId,
      statementNumber,
      statementDate: stmtDate,
      periodStart,
      periodEnd: stmtDate,
      openingBalance,
      totalInvoices,
      totalPayments,
      totalCredits,
      closingBalance,
      currency: "USD",
      status: stmtStatus,
      createdBy: "seed-system",
      updatedBy: "seed-system",
    });

    const lineCount = randInt(5, 20, rng);
    for (let ln = 1; ln <= lineCount; ln++) {
      const txnType = weightedPick(["INVOICE", "PAYMENT", "CREDIT", "ADJUSTMENT", "FEE"], [40, 35, 10, 10, 5], rng);
      const txnDate = randomDateInRange(periodStart, stmtDate, rng);
      const amount = txnType === "FEE" ? roundToCents(randFloat(5, 200, rng))
        : txnType === "PAYMENT" ? roundToCents(randFloat(100, 50000, rng))
          : roundToCents(randFloat(200, 100000, rng));

      const matchStatus = weightedPick(["MATCHED", "UNMATCHED", "PARTIAL", "EXCEPTION"], [60, 15, 15, 10], rng);

      allLines.push({
        id: uuidFromSeed(`stmtline-${stmtId}-${ln}`),
        companyId,
        vendorStatementId: stmtId,
        lineNumber: ln,
        transactionDate: txnDate,
        reference: `${txnType}-${padNum(ln, 4)}`,
        description: `${txnType} transaction`,
        debitAmount: txnType === "INVOICE" || txnType === "FEE" ? amount : 0,
        creditAmount: txnType === "PAYMENT" || txnType === "CREDIT" ? amount : 0,
        balance: roundToCents(openingBalance + (ln / lineCount) * (closingBalance - openingBalance)),
        transactionType: txnType,
        matchStatus,
        matchedInvoiceId: matchStatus === "MATCHED" && txnType === "INVOICE" ? pick(invoiceIds, rng) : null,
        matchedPaymentId: null,
        createdBy: "seed-system",
        updatedBy: "seed-system",
      });
    }

    const totalLines = lineCount;
    const matchedLines = Math.floor(totalLines * randFloat(0.6, 0.95, rng));
    const reconStatus = weightedPick([...RECONCILIATION_STATUSES], [10, 55, 15, 20], rng);
    const isResolved = reconStatus === "COMPLETED" || reconStatus === "ADJUSTED";

    results.push({
      id: uuidFromSeed(`recon-${stmtId}`),
      companyId,
      vendorStatementId: stmtId,
      vendorId,
      reconciliationDate: new Date(stmtDate.getTime() + randInt(1, 7, rng) * 86400000),
      apBalance: closingBalance,
      vendorBalance: closingBalance + roundToCents(randFloat(-500, 500, rng)),
      balanceVariance: roundToCents(randFloat(-500, 500, rng)),
      totalLines,
      matchedLines,
      unmatchedLines: totalLines - matchedLines,
      matchRate: roundToCents((matchedLines / totalLines) * 100),
      status: reconStatus,
      adjustmentAmount: reconStatus === "ADJUSTED" ? roundToCents(randFloat(10, 2000, rng)) : 0,
      adjustmentReason: reconStatus === "ADJUSTED" ? pick(["Timing difference", "Rounding adjustment", "Unrecorded credit note"], rng) : null,
      adjustedBy: reconStatus === "ADJUSTED" ? pick(["ap-manager-001", "ap-manager-002", "controller-001"], rng) : null,
      resolvedBy: isResolved ? pick(["ap-manager-001", "ap-manager-002", "controller-001"], rng) : null,
      resolvedAt: isResolved ? new Date(stmtDate.getTime() + randInt(3, 14, rng) * 86400000) : null,
      createdBy: "seed-system",
      updatedBy: "seed-system",
    });
  }

  return { statements, lines: allLines, results };
}

export async function seedReconciliation(
  prisma: PrismaClient,
  targetCompanyId: string = companyId,
  vendorIds: string[],
  invoiceIds: string[],
): Promise<void> {
  companyId = targetCompanyId;
  const { statements, lines, results } = generateReconciliation(vendorIds, invoiceIds);
  process.stdout.write(`  Seeding ${statements.length} statements, ${lines.length} lines, ${results.length} results...\n`);

  for (const s of statements) {
    try {
      await prisma.procurementVendorStatement.create({ data: s });
    } catch (err) {
      if ((err as any)?.code !== "P2002") throw err;
    }
  }

  const batchSize = 100;
  for (let i = 0; i < lines.length; i += batchSize) {
    await prisma.procurementVendorStatementLine.createMany({
      data: lines.slice(i, i + batchSize),
      skipDuplicates: true,
    });
  }

  for (const r of results) {
    try {
      await prisma.procurementReconciliationResult.create({ data: r });
    } catch (err) {
      if ((err as any)?.code !== "P2002") throw err;
    }
  }
}
