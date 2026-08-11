/**
 * Phase 21B.2 — Payment Generator
 *
 * Generates 200+ proposals and 100+ batches with:
 * - Complete proposal lifecycle (draft → reviewed → approved → executed)
 * - Payment batches with multiple methods (ACH, Wire, SEPA, SWIFT, Check, Virtual Card)
 * - Payment records with transaction references
 * - Status progression with realistic timing
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { createRng, pick, weightedPick, randInt, randFloat, randomDateInRange, daysAgo, uuidFromSeed, logProgress, roundToCents, padNum } from "./seed-utils";

let companyId = process.env.SEED_COMPANY_ID ?? "";
const SEED = 42_400;

const PROPOSAL_STATUSES = ["DRAFT", "SUBMITTED", "REVIEWED", "APPROVED", "REJECTED", "EXECUTED", "CANCELLED"] as const;
const PROPOSAL_WEIGHTS = [5, 8, 10, 40, 5, 25, 7];

const BATCH_STATUSES = ["PENDING", "GENERATING", "READY", "SUBMITTED", "COMPLETED", "FAILED", "CANCELLED"] as const;
const BATCH_WEIGHTS = [5, 3, 5, 10, 65, 7, 5];

const PAYMENT_METHODS = ["ACH", "WIRE", "CHECK", "EFT", "VIRTUAL_CARD"] as const;

const APPROVERS = ["ap-manager-001", "ap-manager-002", "controller-001", "controller-002", "vp-finance-001", "cfo-001"];

export interface GeneratedProposal {
  id: string;
  companyId: string;
  proposalNumber: string;
  proposalDate: Date;
  paymentDate: Date;
  currency: string;
  totalAmount: number;
  totalInvoices: number;
  totalVendors: number;
  paymentMethod: string;
  status: string;
  submittedBy: string | null;
  submittedAt: Date | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  createdBy: string;
}

export interface GeneratedBatch {
  id: string;
  companyId: string;
  batchNumber: string;
  proposalId: string;
  paymentMethod: string;
  bankAccountId: string;
  totalPayments: number;
  totalAmount: number;
  totalFees: number;
  netDisbursement: number;
  status: string;
  submittedAt: Date | null;
  completedAt: Date | null;
  confirmedBy: string | null;
  createdBy: string;
}

export interface GeneratedPaymentRecord {
  id: string;
  companyId: string;
  paymentNumber: string;
  paymentBatchId: string;
  vendorInvoiceId: string;
  vendorId: string;
  paymentDate: Date;
  amount: number;
  discountTaken: number;
  creditApplied: number;
  netPayment: number;
  currency: string;
  exchangeRate: number;
  baseCurrencyAmount: number;
  paymentMethod: string;
  bankAccountId: string;
  transactionReference: string;
  status: string;
  glPosted: boolean;
  idempotencyKey: string;
  createdBy: string;
}

export function generatePayments(
  vendorIds: string[],
  invoiceIds: string[],
  invoiceAmounts: Map<string, number>,
  invoiceVendorMap: Map<string, string>,
): { proposals: GeneratedProposal[]; batches: GeneratedBatch[]; records: GeneratedPaymentRecord[] } {
  const rng = createRng(SEED);

  // ── Proposals ────────────────────────────────────────────────────────────
  const proposals: GeneratedProposal[] = [];
  const proposalCount = 250;

  for (let i = 0; i < proposalCount; i++) {
    const seq = i + 1;
    const id = uuidFromSeed(`proposal-${companyId}-${seq}`);
    const proposalNumber = `PP-${padNum(seq, 5)}`;
    const proposalDate = randomDateInRange(daysAgo(600), daysAgo(7), rng);
    const paymentDate = new Date(proposalDate.getTime() + randInt(3, 15, rng) * 86400000);

    const status = weightedPick([...PROPOSAL_STATUSES], PROPOSAL_WEIGHTS, rng);
    const totalInvoices = randInt(3, 30, rng);
    const totalVendors = randInt(1, Math.min(10, totalInvoices), rng);
    const totalAmount = roundToCents(randFloat(50000, 2000000, rng));
    const paymentMethod = pick(PAYMENT_METHODS, rng);

    let submittedBy: string | null = null;
    let submittedAt: Date | null = null;
    let reviewedBy: string | null = null;
    let reviewedAt: Date | null = null;
    let approvedBy: string | null = null;
    let approvedAt: Date | null = null;
    let rejectedBy: string | null = null;
    let rejectionReason: string | null = null;

    if (["SUBMITTED", "REVIEWED", "APPROVED", "EXECUTED"].includes(status)) {
      submittedBy = "ap-manager-001";
      submittedAt = new Date(proposalDate.getTime() + randInt(1, 2, rng) * 86400000);
    }
    if (["REVIEWED", "APPROVED", "EXECUTED"].includes(status)) {
      reviewedBy = "controller-001";
      reviewedAt = new Date((submittedAt || proposalDate).getTime() + randInt(1, 3, rng) * 86400000);
    }
    if (["APPROVED", "EXECUTED"].includes(status)) {
      approvedBy = pick(["vp-finance-001", "cfo-001"], rng);
      approvedAt = new Date((reviewedAt || submittedAt || proposalDate).getTime() + randInt(1, 2, rng) * 86400000);
    }
    if (status === "REJECTED") {
      rejectedBy = pick(APPROVERS, rng);
      rejectionReason = pick([
        "Insufficient budget allocation",
        "Missing approval documentation",
        "Duplicate payments detected in batch",
        "Vendor banking details not verified",
        "Exceeds quarterly payment limit",
      ], rng);
    }

    proposals.push({
      id, companyId, proposalNumber, proposalDate, paymentDate,
      currency: "USD", totalAmount, totalInvoices, totalVendors,
      paymentMethod, status, submittedBy, submittedAt, reviewedBy, reviewedAt,
      approvedBy, approvedAt, rejectedBy, rejectionReason, createdBy: "seed-system",
    });
  }

  // ── Batches ──────────────────────────────────────────────────────────────
  const batches: GeneratedBatch[] = [];
  const executedProposals = proposals.filter(p => p.status === "EXECUTED" || p.status === "APPROVED");
  const batchCount = Math.min(120, executedProposals.length);

  for (let i = 0; i < batchCount; i++) {
    const proposal = executedProposals[i % executedProposals.length];
    const seq = i + 1;
    const id = uuidFromSeed(`batch-${companyId}-${seq}`);
    const batchNumber = `PB-${padNum(seq, 5)}`;

    const status = weightedPick([...BATCH_STATUSES], BATCH_WEIGHTS, rng);
    const totalPayments = proposal.totalInvoices;
    const totalAmount = proposal.totalAmount;
    const totalFees = roundToCents(totalAmount * randFloat(0.001, 0.005, rng));
    const netDisbursement = roundToCents(totalAmount + totalFees);

    let submittedAt: Date | null = null;
    let completedAt: Date | null = null;
    let confirmedBy: string | null = null;

    if (["SUBMITTED", "COMPLETED", "FAILED"].includes(status)) {
      submittedAt = new Date(proposal.approvedAt || proposal.proposalDate).getTime() + randInt(1, 2, rng) * 86400000 > 0
        ? new Date(new Date(proposal.approvedAt || proposal.proposalDate).getTime() + randInt(1, 2, rng) * 86400000)
        : proposal.proposalDate;
    }
    if (status === "COMPLETED") {
      completedAt = new Date((submittedAt || proposal.proposalDate).getTime() + randInt(1, 5, rng) * 86400000);
      confirmedBy = pick(APPROVERS, rng);
    }

    batches.push({
      id, companyId, batchNumber, proposalId: proposal.id,
      paymentMethod: proposal.paymentMethod, bankAccountId: `bank-${companyId}-${i}`,
      totalPayments, totalAmount,
      totalFees, netDisbursement, status, submittedAt, completedAt,
      confirmedBy, createdBy: "seed-system",
    });
  }

  // ── Payment Records ──────────────────────────────────────────────────────
  const records: GeneratedPaymentRecord[] = [];
  const completedBatches = batches.filter(b => b.status === "COMPLETED");

  for (const batch of completedBatches) {
    const paymentsInBatch = randInt(3, 15, rng);
    for (let p = 0; p < paymentsInBatch; p++) {
      const invoiceId = pick(invoiceIds, rng);
      const vendorId = invoiceVendorMap.get(invoiceId) || pick(vendorIds, rng);
      const amount = roundToCents(batch.totalAmount / paymentsInBatch * randFloat(0.5, 2, rng));
      const discountTaken = rng() < 0.1 ? roundToCents(amount * 0.02) : 0;
      const netPayment = roundToCents(amount - discountTaken);
      const payNum = `PAY-${batch.batchNumber}-${padNum(p + 1, 3)}`;

      records.push({
        id: uuidFromSeed(`payment-${payNum}`),
        companyId,
        paymentNumber: payNum,
        paymentBatchId: batch.id,
        vendorInvoiceId: invoiceId,
        vendorId,
        paymentDate: batch.completedAt || batch.submittedAt || new Date(),
        amount,
        discountTaken,
        creditApplied: 0,
        netPayment,
        currency: "USD",
        exchangeRate: 1,
        baseCurrencyAmount: netPayment,
        paymentMethod: batch.paymentMethod,
        bankAccountId: batch.bankAccountId,
        transactionReference: `TXN-${randInt(100000, 999999, rng)}`,
        status: weightedPick(["PROCESSED", "CLEARED"], [30, 70], rng),
        glPosted: true,
        idempotencyKey: `seed-${payNum.toLowerCase()}`,
        createdBy: "seed-system",
      });
    }
  }

  return { proposals, batches, records };
}

export async function seedPayments(
  prisma: PrismaClient,
  targetCompanyId: string = companyId,
  vendorIds: string[],
  invoiceIds: string[],
  invoiceAmounts: Map<string, number>,
  invoiceVendorMap: Map<string, string>,
): Promise<void> {
  companyId = targetCompanyId;
  const { proposals, batches, records } = generatePayments(vendorIds, invoiceIds, invoiceAmounts, invoiceVendorMap);

  process.stdout.write(`  Seeding ${proposals.length} proposals, ${batches.length} batches, ${records.length} records...\n`);

  // Seed proposals
  for (const p of proposals) {
    try {
      await prisma.procurementPaymentProposal.create({
        data: {
          id: p.id, companyId: p.companyId, proposalNumber: p.proposalNumber,
          proposalDate: p.proposalDate, paymentDate: p.paymentDate, currency: p.currency,
          totalAmount: p.totalAmount, totalInvoices: p.totalInvoices, totalVendors: p.totalVendors,
          paymentMethod: p.paymentMethod as any, status: p.status as any,
          submittedBy: p.submittedBy, submittedAt: p.submittedAt,
          reviewedBy: p.reviewedBy, reviewedAt: p.reviewedAt,
          approvedBy: p.approvedBy, approvedAt: p.approvedAt,
          rejectedBy: p.rejectedBy, rejectionReason: p.rejectionReason,
          createdBy: p.createdBy, updatedBy: "seed-system",
        },
      });
    } catch (err) {
      if ((err as any)?.code !== "P2002") throw err;
    }
  }

  // Seed batches
  for (const b of batches) {
    try {
      await prisma.procurementPaymentBatch.create({
        data: {
          id: b.id, companyId: b.companyId, batchNumber: b.batchNumber,
          paymentProposalId: b.proposalId, paymentMethod: b.paymentMethod as any,
          bankAccountId: b.bankAccountId,
          totalPayments: b.totalPayments, totalAmount: b.totalAmount,
          totalFees: b.totalFees, netDisbursement: b.netDisbursement,
          status: b.status as any, submittedAt: b.submittedAt,
          completedAt: b.completedAt, confirmedBy: b.confirmedBy,
          createdBy: b.createdBy, updatedBy: "seed-system",
        },
      });
    } catch (err) {
      if ((err as any)?.code !== "P2002") throw err;
    }
  }

  // Seed payment records in batches
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    for (const r of batch) {
      try {
        await prisma.procurementPaymentRecord.create({
          data: {
            id: r.id, companyId: r.companyId, paymentNumber: r.paymentNumber,
            paymentBatchId: r.paymentBatchId, vendorInvoiceId: r.vendorInvoiceId,
            vendorId: r.vendorId, paymentDate: r.paymentDate, amount: r.amount,
            discountTaken: r.discountTaken, creditApplied: r.creditApplied,
            netPayment: r.netPayment, currency: r.currency, exchangeRate: r.exchangeRate,
            baseCurrencyAmount: r.baseCurrencyAmount, paymentMethod: r.paymentMethod as any,
            bankAccountId: r.bankAccountId,
            transactionReference: r.transactionReference, status: r.status as any,
            glPosted: r.glPosted, idempotencyKey: r.idempotencyKey,
            createdBy: r.createdBy, updatedBy: "seed-system",
          },
        });
      } catch (err) {
        if ((err as any)?.code !== "P2002") throw err;
      }
    }
    logProgress("payments", Math.min(i + batchSize, records.length), records.length);
  }
}
