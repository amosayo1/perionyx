/**
 * Phase 21B.2 — AP Comprehensive Seed Orchestrator
 *
 * Creates realistic Fortune 500-style AP data:
 * ~150 vendors, 3500 invoices, 600+ approvals, 350+ exceptions,
 * 250 proposals, 120 batches, 130 credits, 40 reconciliations,
 * 20K+ audit records
 *
 * Run: npx tsx src/server/procurement/seeds/ap-seed.ts
 *
 * Idempotent — safe to re-run (skips when sufficient data exists).
 */

import "dotenv/config";
import { prisma } from "../../db/prisma";
import { seedVendors } from "./vendor-generator";
import { seedInvoices } from "./invoice-generator";
import { seedApprovals } from "./approval-generator";
import { seedExceptions } from "./exception-generator";
import { seedPayments } from "./payment-generator";
import { seedCredits } from "./credit-generator";
import { seedReconciliation } from "./reconciliation-generator";
import { seedAuditRecords } from "./audit-generator";

const DEMO_COMPANY_SLUG = process.env.SEED_COMPANY_SLUG ?? "demo-company";

async function main() {
  const startTime = Date.now();
  process.stdout.write("═".repeat(60) + "\n");
  process.stdout.write("  PHASE 21B.2 — AP Comprehensive Seed Data\n");
  process.stdout.write("═".repeat(60) + "\n\n");

  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) {
    process.stderr.write(`Company "${DEMO_COMPANY_SLUG}" not found. Run prisma/seed.ts first.\n`);
    process.exit(1);
  }
  const companyId = company.id;
  process.stdout.write(`Company: ${company.name} (${companyId})\n\n`);

  // ── 1. Vendors ──────────────────────────────────────────────────────────
  process.stdout.write("─── 1/8 VENDORS ───\n");
  const existingVendorCount = await prisma.procurementVendor.count({ where: { companyId } });
  let vendorIds: string[];

  if (existingVendorCount >= 100) {
    process.stdout.write(`  Skipping — ${existingVendorCount} vendors already exist\n`);
    vendorIds = (await prisma.procurementVendor.findMany({
      where: { companyId }, select: { id: true }, orderBy: { createdAt: "asc" },
    })).map(v => v.id);
  } else {
    vendorIds = await seedVendors(prisma, companyId);
  }
  process.stdout.write(`  Total vendors: ${vendorIds.length}\n\n`);

  // ── 2. Invoices ─────────────────────────────────────────────────────────
  process.stdout.write("─── 2/8 INVOICES ───\n");
  const existingInvoiceCount = await prisma.procurementVendorInvoice.count({ where: { companyId } });
  let invoiceIds: string[];

  if (existingInvoiceCount >= 2000) {
    process.stdout.write(`  Skipping — ${existingInvoiceCount} invoices already exist\n`);
    invoiceIds = (await prisma.procurementVendorInvoice.findMany({
      where: { companyId }, select: { id: true },
    })).map(i => i.id);
  } else {
    invoiceIds = await seedInvoices(prisma, companyId, vendorIds);
  }
  process.stdout.write(`  Total invoices: ${invoiceIds.length}\n\n`);

  // ── Build lookup maps from DB ───────────────────────────────────────────
  // Need invoice amounts and vendor mappings for approvals & payments
  const invoiceRows = await prisma.procurementVendorInvoice.findMany({
    where: { companyId, id: { in: invoiceIds } },
    select: { id: true, totalAmount: true, vendorId: true },
  });
  const invoiceAmounts = new Map<string, number>();
  const invoiceVendorMap = new Map<string, string>();
  for (const row of invoiceRows) {
    invoiceAmounts.set(row.id, Number(row.totalAmount));
    invoiceVendorMap.set(row.id, row.vendorId);
  }

  // ── 3. Approvals ────────────────────────────────────────────────────────
  process.stdout.write("─── 3/8 APPROVALS ───\n");
  const existingApprovalCount = await prisma.procurementApprovalRecord.count({ where: { companyId } });
  let approvalIds: string[];

  if (existingApprovalCount >= 400) {
    process.stdout.write(`  Skipping — ${existingApprovalCount} approvals already exist\n`);
    approvalIds = (await prisma.procurementApprovalRecord.findMany({
      where: { companyId }, select: { id: true },
    })).map(a => a.id);
  } else {
    approvalIds = await seedApprovals(prisma, companyId, invoiceIds, invoiceAmounts);
  }
  process.stdout.write(`  Total approvals: ${approvalIds.length}\n\n`);

  // ── 4. Exceptions ───────────────────────────────────────────────────────
  process.stdout.write("─── 4/8 EXCEPTIONS ───\n");
  const existingExceptionCount = await prisma.procurementInvoiceException.count({ where: { companyId } });
  let exceptionIds: string[];

  if (existingExceptionCount >= 200) {
    process.stdout.write(`  Skipping — ${existingExceptionCount} exceptions already exist\n`);
    exceptionIds = (await prisma.procurementInvoiceException.findMany({
      where: { companyId }, select: { id: true },
    })).map(e => e.id);
  } else {
    exceptionIds = await seedExceptions(prisma, companyId, invoiceIds);
  }
  process.stdout.write(`  Total exceptions: ${exceptionIds.length}\n\n`);

  // ── 5. Payments (proposals + batches + records) ─────────────────────────
  process.stdout.write("─── 5/8 PAYMENTS ───\n");
  const existingProposalCount = await prisma.procurementPaymentProposal.count({ where: { companyId } });

  if (existingProposalCount >= 100) {
    process.stdout.write(`  Skipping — ${existingProposalCount} proposals already exist\n`);
  } else {
    await seedPayments(prisma, companyId, vendorIds, invoiceIds, invoiceAmounts, invoiceVendorMap);
  }
  const proposalIds = (await prisma.procurementPaymentProposal.findMany({
    where: { companyId }, select: { id: true },
  })).map(p => p.id);
  process.stdout.write(`  Total proposals: ${proposalIds.length}\n\n`);

  // ── 6. Credits ──────────────────────────────────────────────────────────
  process.stdout.write("─── 6/8 CREDITS ───\n");
  const existingCreditCount = await prisma.procurementVendorCredit.count({ where: { companyId } });
  if (existingCreditCount >= 50) {
    process.stdout.write(`  Skipping — ${existingCreditCount} credits already exist\n`);
  } else {
    await seedCredits(prisma, companyId, vendorIds, invoiceIds);
  }
  process.stdout.write(`\n`);

  // ── 7. Reconciliation ───────────────────────────────────────────────────
  process.stdout.write("─── 7/8 RECONCILIATION ───\n");
  const existingStmtCount = await prisma.procurementVendorStatement.count({ where: { companyId } });
  if (existingStmtCount >= 20) {
    process.stdout.write(`  Skipping — ${existingStmtCount} statements already exist\n`);
  } else {
    await seedReconciliation(prisma, companyId, vendorIds, invoiceIds);
  }
  process.stdout.write(`\n`);

  // ── 8. Audit Records ────────────────────────────────────────────────────
  process.stdout.write("─── 8/8 AUDIT TRAIL ───\n");
  const existingAuditCount = await prisma.procurementAPAuditRecord.count({ where: { companyId } });
  if (existingAuditCount >= 10000) {
    process.stdout.write(`  Skipping — ${existingAuditCount} audit records already exist\n`);
  } else {
    await seedAuditRecords(prisma, companyId, invoiceIds, exceptionIds, approvalIds, proposalIds, vendorIds);
  }
  process.stdout.write(`\n`);

  // ── Summary ─────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  process.stdout.write("═".repeat(60) + "\n");
  process.stdout.write("  SEED COMPLETE\n");
  process.stdout.write("═".repeat(60) + "\n");

  const counts = {
    vendors: await prisma.procurementVendor.count({ where: { companyId } }),
    invoices: await prisma.procurementVendorInvoice.count({ where: { companyId } }),
    approvals: await prisma.procurementApprovalRecord.count({ where: { companyId } }),
    exceptions: await prisma.procurementInvoiceException.count({ where: { companyId } }),
    proposals: await prisma.procurementPaymentProposal.count({ where: { companyId } }),
    batches: await prisma.procurementPaymentBatch.count({ where: { companyId } }),
    credits: await prisma.procurementVendorCredit.count({ where: { companyId } }),
    statements: await prisma.procurementVendorStatement.count({ where: { companyId } }),
    reconciliations: await prisma.procurementReconciliationResult.count({ where: { companyId } }),
    auditRecords: await prisma.procurementAPAuditRecord.count({ where: { companyId } }),
  };

  process.stdout.write(`\n  Vendors:          ${counts.vendors}\n`);
  process.stdout.write(`  Invoices:         ${counts.invoices}\n`);
  process.stdout.write(`  Approvals:        ${counts.approvals}\n`);
  process.stdout.write(`  Exceptions:       ${counts.exceptions}\n`);
  process.stdout.write(`  Proposals:        ${counts.proposals}\n`);
  process.stdout.write(`  Batches:          ${counts.batches}\n`);
  process.stdout.write(`  Credits:          ${counts.credits}\n`);
  process.stdout.write(`  Statements:       ${counts.statements}\n`);
  process.stdout.write(`  Reconciliations:  ${counts.reconciliations}\n`);
  process.stdout.write(`  Audit Records:    ${counts.auditRecords}\n`);
  process.stdout.write(`\n  Completed in ${elapsed}s\n\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    process.stderr.write(`AP seed failed: ${e.message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
