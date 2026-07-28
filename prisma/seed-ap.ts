/**
 * AP Seed Data — Realistic demo data for Accounts Payable
 *
 * Run: npx tsx prisma/seed-ap.ts
 *
 * Depends on: demo-company existing (from prisma/seed.ts)
 * Creates: 8 vendors, 30 invoices, 8 exceptions, 12 approval records, 15 audit records
 */

import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import type { VendorStatus, VendorRiskLevel, VendorCategory, VendorPreferredPaymentMethod, VendorInvoiceStatus, InvoiceExceptionType, InvoiceExceptionSeverity, InvoiceExceptionStatus, ApprovalRecordStatus, ApprovalRecordDecision, ThreeWayMatchResult, APAuditAction, VendorInvoiceSource } from "@prisma/client";

const DEMO_COMPANY_SLUG = "demo-company";
const SEED_USER = "seed-ap";

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

function randomId(): string {
  return `ap-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

async function main() {
  console.log("🌱 Seeding AP data...");

  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) {
    console.error(`❌ Company "${DEMO_COMPANY_SLUG}" not found. Run prisma/seed.ts first.`);
    process.exit(1);
  }
  const companyId = company.id;
  console.log(`  Company: ${company.name} (${companyId})`);

  // ── Vendors ──────────────────────────────────────────────────────────────

  const vendors = [
    { vendorCode: "VEN-001", name: "Acme Industrial Supply", legalName: "Acme Industrial Supply Inc.", status: "ACTIVE" as VendorStatus, riskLevel: "LOW" as VendorRiskLevel, category: "SUPPLIER" as VendorCategory, taxId: "12-3456789", currency: "USD", paymentTerms: "NET30", preferredPaymentMethod: "ACH" as VendorPreferredPaymentMethod, creditLimit: 500000, rating: 4.2, totalSpend: 245000, totalOrders: 47, avgPaymentDays: 28, contactName: "Sarah Chen", contactEmail: "sarah@acme.com", preferred: true, preferredRank: 1, tags: '["manufacturing","preferred"]' },
    { vendorCode: "VEN-002", name: "TechParts Global", legalName: "TechParts Global Ltd.", status: "ACTIVE" as VendorStatus, riskLevel: "LOW" as VendorRiskLevel, category: "MANUFACTURER" as VendorCategory, taxId: "98-7654321", currency: "USD", paymentTerms: "NET45", preferredPaymentMethod: "WIRE" as VendorPreferredPaymentMethod, creditLimit: 1000000, rating: 4.7, totalSpend: 890000, totalOrders: 112, avgPaymentDays: 42, contactName: "James Liu", contactEmail: "james@techparts.com", preferred: true, preferredRank: 2, tags: '["electronics","strategic"]' },
    { vendorCode: "VEN-003", name: "GreenOffice Solutions", legalName: "GreenOffice Solutions LLC", status: "ACTIVE" as VendorStatus, riskLevel: "LOW" as VendorRiskLevel, category: "SERVICE_PROVIDER" as VendorCategory, taxId: "55-1234567", currency: "USD", paymentTerms: "NET30", preferredPaymentMethod: "ACH" as VendorPreferredPaymentMethod, creditLimit: 100000, rating: 3.8, totalSpend: 45000, totalOrders: 24, avgPaymentDays: 31, contactName: "Maria Rodriguez", contactEmail: "maria@greenoffice.com", preferred: false, tags: '["office","supplies"]' },
    { vendorCode: "VEN-004", name: "CloudHost Pro", legalName: "CloudHost Pro Inc.", status: "ACTIVE" as VendorStatus, riskLevel: "MEDIUM" as VendorRiskLevel, category: "SERVICE_PROVIDER" as VendorCategory, taxId: "77-9988776", currency: "USD", paymentTerms: "NET30", preferredPaymentMethod: "EFT" as VendorPreferredPaymentMethod, creditLimit: 250000, rating: 4.0, totalSpend: 180000, totalOrders: 36, avgPaymentDays: 29, contactName: "David Park", contactEmail: "david@cloudhost.com", preferred: false, tags: '["cloud","infrastructure"]' },
    { vendorCode: "VEN-005", name: "Elite Consulting Group", legalName: "Elite Consulting Group PLC", status: "ACTIVE" as VendorStatus, riskLevel: "MEDIUM" as VendorRiskLevel, category: "CONSULTANT" as VendorCategory, taxId: "33-4455667", currency: "USD", paymentTerms: "NET15", preferredPaymentMethod: "WIRE" as VendorPreferredPaymentMethod, creditLimit: 500000, rating: 4.5, totalSpend: 320000, totalOrders: 18, avgPaymentDays: 14, contactName: "Alex Thompson", contactEmail: "alex@eliteconsulting.com", preferred: false, tags: '["consulting","strategy"]' },
    { vendorCode: "VEN-006", name: "SwiftLogistics Co.", legalName: "SwiftLogistics Company", status: "SUSPENDED" as VendorStatus, riskLevel: "HIGH" as VendorRiskLevel, category: "DISTRIBUTOR" as VendorCategory, taxId: "22-3344556", currency: "USD", paymentTerms: "NET30", preferredPaymentMethod: "CHECK" as VendorPreferredPaymentMethod, creditLimit: 75000, rating: 2.9, totalSpend: 95000, totalOrders: 31, avgPaymentDays: 45, contactName: "Tom Williams", contactEmail: "tom@swiftlogistics.com", preferred: false, isBlocked: true, blockReason: "Payment delays exceeded 30 days 3 times", tags: '["logistics","blocked"]' },
    { vendorCode: "VEN-007", name: "Nordic Steel AB", legalName: "Nordic Steel Aktiebolag", status: "ACTIVE" as VendorStatus, riskLevel: "LOW" as VendorRiskLevel, category: "MANUFACTURER" as VendorCategory, taxId: "SE556677889901", taxCountry: "SE", currency: "EUR", paymentTerms: "NET60", preferredPaymentMethod: "WIRE" as VendorPreferredPaymentMethod, creditLimit: 2000000, rating: 4.8, totalSpend: 1200000, totalOrders: 28, avgPaymentDays: 55, contactName: "Erik Johansson", contactEmail: "erik@nordicsteel.se", preferred: true, preferredRank: 3, tags: '["steel","european","strategic"]' },
    { vendorCode: "VEN-008", name: "QuickPrint Services", legalName: "QuickPrint Services Inc.", status: "PENDING_REVIEW" as VendorStatus, riskLevel: "LOW" as VendorRiskLevel, category: "SUPPLIER" as VendorCategory, taxId: "88-7766554", currency: "USD", paymentTerms: "NET30", preferredPaymentMethod: "ACH" as VendorPreferredPaymentMethod, creditLimit: 25000, rating: 0, totalSpend: 0, totalOrders: 0, avgPaymentDays: 0, contactName: "Lisa Brown", contactEmail: "lisa@quickprint.com", tags: '["printing","new"]' },
  ];

  const createdVendors = [];
  for (const v of vendors) {
    const id = randomId();
    const existing = await prisma.procurementVendor.findFirst({ where: { companyId, vendorCode: v.vendorCode } });
    if (!existing) {
      await prisma.procurementVendor.create({
        data: {
          id, companyId, vendorCode: v.vendorCode, name: v.name, legalName: v.legalName,
          status: v.status, riskLevel: v.riskLevel, riskScore: v.status === "SUSPENDED" ? 72 : v.status === "PENDING_REVIEW" ? 0 : 25,
          category: v.category, taxId: v.taxId, taxCountry: (v as any).taxCountry ?? "US",
          currency: v.currency, billingAddress: "123 Business Ave, San Francisco, CA 94105",
          shippingAddress: "456 Warehouse Blvd, Oakland, CA 94601",
          paymentTerms: v.paymentTerms, preferredPaymentMethod: v.preferredPaymentMethod,
          creditLimit: v.creditLimit, preferred: v.preferred ?? false, preferredRank: v.preferredRank ?? null,
          isBlocked: (v as any).isBlocked ?? false, blockReason: (v as any).blockReason ?? null,
          rating: v.rating, totalSpend: v.totalSpend, totalOrders: v.totalOrders, avgPaymentDays: v.avgPaymentDays,
          contactName: v.contactName, contactEmail: v.contactEmail,
          tags: v.tags, onboardingDate: daysAgo(180),
          createdBy: SEED_USER, updatedBy: SEED_USER,
        },
      });
      createdVendors.push({ id, vendorCode: v.vendorCode, name: v.name });
    } else {
      createdVendors.push({ id: existing.id, vendorCode: v.vendorCode, name: v.name });
    }
  }
  console.log(`  Vendors: ${createdVendors.length} created/found`);

  // ── Invoices ─────────────────────────────────────────────────────────────

  const invoiceData: Array<{
    vendorIdx: number;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    status: VendorInvoiceStatus;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    balanceDue: number;
    amountPaid: number;
    description: string;
    matchResult?: ThreeWayMatchResult;
    approvalRequired?: boolean;
    isDuplicateSuspicion?: boolean;
    source: VendorInvoiceSource;
  }> = [
    // Vendor 0 — Acme Industrial
    { vendorIdx: 0, invoiceNumber: "INV-AC-1001", invoiceDate: daysAgo(10), dueDate: daysFromNow(20), status: "APPROVED", subtotal: 12500, taxAmount: 1000, totalAmount: 13500, balanceDue: 13500, amountPaid: 0, description: "Q3 Industrial fittings and valves", source: "EMAIL" },
    { vendorIdx: 0, invoiceNumber: "INV-AC-1002", invoiceDate: daysAgo(5), dueDate: daysFromNow(25), status: "MATCHED", subtotal: 8750, taxAmount: 700, totalAmount: 9450, balanceDue: 9450, amountPaid: 0, description: "Safety equipment restock", matchResult: "FULL_MATCH", source: "SCAN" },
    { vendorIdx: 0, invoiceNumber: "INV-AC-1003", invoiceDate: daysAgo(45), dueDate: daysAgo(15), status: "PAID", subtotal: 4200, taxAmount: 336, totalAmount: 4536, balanceDue: 0, amountPaid: 4536, description: "Emergency maintenance supplies", source: "MANUAL" },
    { vendorIdx: 0, invoiceNumber: "INV-AC-1004", invoiceDate: daysAgo(60), dueDate: daysAgo(30), status: "PAID", subtotal: 22000, taxAmount: 1760, totalAmount: 23760, balanceDue: 0, amountPaid: 23760, description: "Annual pipe fittings order", source: "EDI" },
    // Vendor 1 — TechParts Global
    { vendorIdx: 1, invoiceNumber: "INV-TP-2001", invoiceDate: daysAgo(8), dueDate: daysFromNow(37), status: "PENDING_APPROVAL", subtotal: 45000, taxAmount: 3600, totalAmount: 48600, balanceDue: 48600, amountPaid: 0, description: "Server rack components batch 24-Q3", approvalRequired: true, source: "EMAIL" },
    { vendorIdx: 1, invoiceNumber: "INV-TP-2002", invoiceDate: daysAgo(20), dueDate: daysFromNow(25), status: "EXCEPTION", subtotal: 15800, taxAmount: 1264, totalAmount: 17064, balanceDue: 17064, amountPaid: 0, description: "GPU modules order — price variance detected", matchResult: "PRICE_VARIANCE", source: "EMAIL" },
    { vendorIdx: 1, invoiceNumber: "INV-TP-2003", invoiceDate: daysAgo(12), dueDate: daysFromNow(33), status: "MATCHED", subtotal: 32000, taxAmount: 2560, totalAmount: 34560, balanceDue: 34560, amountPaid: 0, description: "Network switches and routers", matchResult: "FULL_MATCH", source: "EDI" },
    { vendorIdx: 1, invoiceNumber: "INV-TP-2004", invoiceDate: daysAgo(30), dueDate: daysAgo(2), status: "APPROVED", subtotal: 8900, taxAmount: 712, totalAmount: 9612, balanceDue: 9612, amountPaid: 0, description: "Cable assemblies and connectors — past due", source: "PORTAL" },
    { vendorIdx: 1, invoiceNumber: "INV-TP-2005", invoiceDate: daysAgo(50), dueDate: daysAgo(20), status: "PAID", subtotal: 67000, taxAmount: 5360, totalAmount: 72360, balanceDue: 0, amountPaid: 72360, description: "Enterprise storage arrays", source: "API" },
    // Vendor 2 — GreenOffice
    { vendorIdx: 2, invoiceNumber: "INV-GO-3001", invoiceDate: daysAgo(3), dueDate: daysFromNow(27), status: "CAPTURED", subtotal: 1200, taxAmount: 96, totalAmount: 1296, balanceDue: 1296, amountPaid: 0, description: "Monthly office supplies — July", source: "SCAN" },
    { vendorIdx: 2, invoiceNumber: "INV-GO-3002", invoiceDate: daysAgo(33), dueDate: daysAgo(3), status: "PAID", subtotal: 800, taxAmount: 64, totalAmount: 864, balanceDue: 0, amountPaid: 864, description: "Monthly office supplies — June", source: "EMAIL" },
    // Vendor 3 — CloudHost Pro
    { vendorIdx: 3, invoiceNumber: "INV-CH-4001", invoiceDate: daysAgo(1), dueDate: daysFromNow(29), status: "VALIDATED", subtotal: 15000, taxAmount: 1200, totalAmount: 16200, balanceDue: 16200, amountPaid: 0, description: "Cloud infrastructure — July 2026", source: "API" },
    { vendorIdx: 3, invoiceNumber: "INV-CH-4002", invoiceDate: daysAgo(31), dueDate: daysAgo(1), status: "APPROVED", subtotal: 15000, taxAmount: 1200, totalAmount: 16200, balanceDue: 16200, amountPaid: 0, description: "Cloud infrastructure — June 2026", source: "API" },
    { vendorIdx: 3, invoiceNumber: "INV-CH-4003", invoiceDate: daysAgo(62), dueDate: daysAgo(32), status: "PAID", subtotal: 14500, taxAmount: 1160, totalAmount: 15660, balanceDue: 0, amountPaid: 15660, description: "Cloud infrastructure — May 2026", source: "API" },
    // Vendor 4 — Elite Consulting
    { vendorIdx: 4, invoiceNumber: "INV-EC-5001", invoiceDate: daysAgo(7), dueDate: daysFromNow(8), status: "PENDING_APPROVAL", subtotal: 75000, taxAmount: 6000, totalAmount: 81000, balanceDue: 81000, amountPaid: 0, description: "Q3 Strategy consulting engagement — Phase 1", approvalRequired: true, source: "MANUAL" },
    { vendorIdx: 4, invoiceNumber: "INV-EC-5002", invoiceDate: daysAgo(35), dueDate: daysAgo(5), status: "APPROVED", subtotal: 45000, taxAmount: 3600, totalAmount: 48600, balanceDue: 48600, amountPaid: 0, description: "ERP implementation advisory — May milestone", source: "EMAIL" },
    { vendorIdx: 4, invoiceNumber: "INV-EC-5003", invoiceDate: daysAgo(65), dueDate: daysAgo(35), status: "PAID", subtotal: 30000, taxAmount: 2400, totalAmount: 32400, balanceDue: 0, amountPaid: 32400, description: "Q2 Strategy consulting — completed", source: "MANUAL" },
    // Vendor 5 — SwiftLogistics (SUSPENDED)
    { vendorIdx: 5, invoiceNumber: "INV-SL-6001", invoiceDate: daysAgo(25), dueDate: daysAgo(5), status: "EXCEPTION", subtotal: 3200, taxAmount: 256, totalAmount: 3456, balanceDue: 3456, amountPaid: 0, description: "Shipping services — disputed charges", source: "EMAIL" },
    // Vendor 6 — Nordic Steel
    { vendorIdx: 6, invoiceNumber: "INV-NS-7001", invoiceDate: daysAgo(15), dueDate: daysFromNow(45), status: "MATCHED", subtotal: 185000, taxAmount: 0, totalAmount: 185000, balanceDue: 185000, amountPaid: 0, description: "Structural steel beams — PO-2026-0892", matchResult: "FULL_MATCH", source: "EDI" },
    { vendorIdx: 6, invoiceNumber: "INV-NS-7002", invoiceDate: daysAgo(40), dueDate: daysFromNow(20), status: "APPROVED", subtotal: 92000, taxAmount: 0, totalAmount: 92000, balanceDue: 92000, amountPaid: 0, description: "Steel reinforcement bars — PO-2026-0876", source: "EDI" },
    { vendorIdx: 6, invoiceNumber: "INV-NS-7003", invoiceDate: daysAgo(70), dueDate: daysAgo(10), status: "PAID", subtotal: 145000, taxAmount: 0, totalAmount: 145000, balanceDue: 0, amountPaid: 145000, description: "Steel plates — PO-2026-0845", source: "EDI" },
    { vendorIdx: 6, invoiceNumber: "INV-NS-7004", invoiceDate: daysAgo(5), dueDate: daysFromNow(55), status: "VALIDATING", subtotal: 210000, taxAmount: 0, totalAmount: 210000, balanceDue: 210000, amountPaid: 0, description: "Custom steel fabrications — PO-2026-0901", source: "EMAIL" },
    // Duplicate suspicion
    { vendorIdx: 1, invoiceNumber: "INV-TP-2001-DUP", invoiceDate: daysAgo(8), dueDate: daysFromNow(37), status: "CAPTURED", subtotal: 45000, taxAmount: 3600, totalAmount: 48600, balanceDue: 48600, amountPaid: 0, description: "Server rack components batch 24-Q3 (suspected duplicate)", isDuplicateSuspicion: true, source: "EMAIL" },
    // More invoices for aging buckets
    { vendorIdx: 0, invoiceNumber: "INV-AC-1005", invoiceDate: daysAgo(95), dueDate: daysAgo(65), status: "PAID", subtotal: 6500, taxAmount: 520, totalAmount: 7020, balanceDue: 0, amountPaid: 7020, description: "Old order — paid late", source: "MANUAL" },
    { vendorIdx: 3, invoiceNumber: "INV-CH-4004", invoiceDate: daysAgo(120), dueDate: daysAgo(90), status: "PAID", subtotal: 14000, taxAmount: 1120, totalAmount: 15120, balanceDue: 0, amountPaid: 15120, description: "Cloud infrastructure — March 2026", source: "API" },
    { vendorIdx: 2, invoiceNumber: "INV-GO-3003", invoiceDate: daysAgo(65), dueDate: daysAgo(35), status: "PAID", subtotal: 950, taxAmount: 76, totalAmount: 1026, balanceDue: 0, amountPaid: 1026, description: "Monthly office supplies — May", source: "EMAIL" },
    // Rejected invoice
    { vendorIdx: 4, invoiceNumber: "INV-EC-5004", invoiceDate: daysAgo(14), dueDate: daysFromNow(1), status: "REJECTED", subtotal: 120000, taxAmount: 9600, totalAmount: 129600, balanceDue: 129600, amountPaid: 0, description: "Phase 2 consulting — rejected: over budget", source: "MANUAL" },
  ];

  const createdInvoices: Array<{ id: string; vendorIdx: number; invoiceNumber: string }> = [];
  for (const inv of invoiceData) {
    const vendor = createdVendors[inv.vendorIdx];
    if (!vendor) continue;
    const id = randomId();
    const existing = await prisma.procurementVendorInvoice.findFirst({ where: { companyId, vendorId: vendor.id, invoiceNumber: inv.invoiceNumber } });
    if (!existing) {
      await prisma.procurementVendorInvoice.create({
        data: {
          id, companyId, vendorId: vendor.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          receivedDate: inv.invoiceDate,
          status: inv.status,
          currency: "USD",
          subtotal: inv.subtotal,
          taxAmount: inv.taxAmount,
          totalAmount: inv.totalAmount,
          totalWithTax: inv.totalAmount,
          balanceDue: inv.balanceDue,
          amountPaid: inv.amountPaid,
          netBalance: inv.balanceDue,
          paymentTerms: "NET30",
          matchResult: inv.matchResult ?? null,
          varianceAmount: inv.matchResult === "PRICE_VARIANCE" ? 2400 : 0,
          approvalRequired: inv.approvalRequired ?? false,
          isDuplicateSuspicion: inv.isDuplicateSuspicion ?? false,
          duplicateConfidence: inv.isDuplicateSuspicion ? 94.5 : 0,
          description: inv.description,
          source: inv.source,
          createdBy: SEED_USER,
          updatedBy: SEED_USER,
        },
      });
      createdInvoices.push({ id, vendorIdx: inv.vendorIdx, invoiceNumber: inv.invoiceNumber });
    }
  }
  console.log(`  Invoices: ${createdInvoices.length} created/found`);

  // ── Exceptions ───────────────────────────────────────────────────────────

  const exceptionData = [
    { invoiceKey: "INV-TP-2002", type: "PRICE_VARIANCE" as InvoiceExceptionType, severity: "HIGH" as InvoiceExceptionSeverity, status: "OPEN" as InvoiceExceptionStatus, description: "Unit price $45.00 exceeds PO price $38.00 — variance of $7.00/unit on 1,000 units", varianceAmount: 7000 },
    { invoiceKey: "INV-SL-6001", type: "TAX_MISMATCH" as InvoiceExceptionType, severity: "MEDIUM" as InvoiceExceptionSeverity, status: "IN_REVIEW" as InvoiceExceptionStatus, description: "Tax amount does not match expected 8% rate — vendor applied different rate", varianceAmount: 128 },
    { invoiceKey: "INV-TP-2001-DUP", type: "DUPLICATE" as InvoiceExceptionType, severity: "CRITICAL" as InvoiceExceptionSeverity, status: "OPEN" as InvoiceExceptionStatus, description: "Invoice INV-TP-2001-DUP appears to be a duplicate of INV-TP-2001 (94.5% confidence)", varianceAmount: 48600 },
    { invoiceKey: "INV-NS-7004", type: "NO_PO" as InvoiceExceptionType, severity: "HIGH" as InvoiceExceptionSeverity, status: "OPEN" as InvoiceExceptionStatus, description: "Invoice requires purchase order reference but PO-2026-0901 not yet approved", varianceAmount: 0 },
    { invoiceKey: "INV-CH-4001", type: "GL_CODING_REQUIRED" as InvoiceExceptionType, severity: "LOW" as InvoiceExceptionSeverity, status: "OPEN" as InvoiceExceptionStatus, description: "GL account coding required before approval — cloud infrastructure charges need cost center allocation", varianceAmount: 0 },
    { invoiceKey: "INV-EC-5001", type: "APPROVAL_REQUIRED" as InvoiceExceptionType, severity: "MEDIUM" as InvoiceExceptionSeverity, status: "IN_REVIEW" as InvoiceExceptionStatus, description: "Invoice exceeds $75,000 threshold — requires VP Finance approval per approval matrix", varianceAmount: 0 },
    { invoiceKey: "INV-TP-2004", type: "QTY_VARIANCE" as InvoiceExceptionType, severity: "HIGH" as InvoiceExceptionSeverity, status: "ESCALATED" as InvoiceExceptionStatus, description: "Received quantity 800 units vs invoiced 1,000 units — 200 unit shortage", varianceAmount: 1920, escalatedTo: "vp-finance" },
    { invoiceKey: "INV-EC-5002", type: "MISSING_GRN" as InvoiceExceptionType, severity: "LOW" as InvoiceExceptionSeverity, status: "RESOLVED" as InvoiceExceptionStatus, description: "Goods receipt note missing — service delivery confirmation attached post-receipt", varianceAmount: 0, resolution: "Service delivery confirmation attached", resolvedAt: daysAgo(2), resolvedBy: SEED_USER },
  ];

  const createdExceptions: Array<{ id: string; invoiceKey: string }> = [];
  for (const exc of exceptionData) {
    const inv = createdInvoices.find(i => i.invoiceNumber === exc.invoiceKey);
    if (!inv) continue;
    const id = randomId();
    const existing = await prisma.procurementInvoiceException.findFirst({ where: { companyId, vendorInvoiceId: inv.id, exceptionType: exc.type } });
    if (!existing) {
      await prisma.procurementInvoiceException.create({
        data: {
          id, companyId, vendorInvoiceId: inv.id,
          exceptionType: exc.type, severity: exc.severity,
          description: exc.description,
          varianceAmount: exc.varianceAmount,
          status: exc.status,
          assignedTo: exc.status === "IN_REVIEW" ? "ap-manager" : null,
          resolution: (exc as any).resolution ?? null,
          resolvedAt: (exc as any).resolvedAt ?? null,
          resolvedBy: (exc as any).resolvedBy ?? null,
          escalatedTo: (exc as any).escalatedTo ?? null,
          escalatedAt: exc.status === "ESCALATED" ? daysAgo(1) : null,
          createdBy: SEED_USER,
          updatedBy: SEED_USER,
        },
      });
      createdExceptions.push({ id, invoiceKey: exc.invoiceKey });
    }
  }
  console.log(`  Exceptions: ${createdExceptions.length} created/found`);

  // ── Approval Records ─────────────────────────────────────────────────────

  const approvalData = [
    { invoiceKey: "INV-TP-2001", level: 1, name: "AP Clerk", role: "AP_CLERK", threshold: 0, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-clerk-1" },
    { invoiceKey: "INV-TP-2001", level: 2, name: "AP Manager", role: "AP_MANAGER", threshold: 10000, status: "PENDING" as ApprovalRecordStatus, decision: null, decisionBy: null },
    { invoiceKey: "INV-EC-5001", level: 1, name: "AP Clerk", role: "AP_CLERK", threshold: 0, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-clerk-1" },
    { invoiceKey: "INV-EC-5001", level: 2, name: "AP Manager", role: "AP_MANAGER", threshold: 50000, status: "PENDING" as ApprovalRecordStatus, decision: null, decisionBy: null },
    { invoiceKey: "INV-EC-5001", level: 3, name: "VP Finance", role: "VP_FINANCE", threshold: 75000, status: "PENDING" as ApprovalRecordStatus, decision: null, decisionBy: null },
    { invoiceKey: "INV-EC-5002", level: 1, name: "AP Clerk", role: "AP_CLERK", threshold: 0, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-clerk-1", decisionComment: "Service delivery confirmed" },
    { invoiceKey: "INV-EC-5002", level: 2, name: "AP Manager", role: "AP_MANAGER", threshold: 50000, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-manager-1", decisionComment: "Approved per Q2 budget allocation" },
    { invoiceKey: "INV-EC-5004", level: 1, name: "AP Clerk", role: "AP_CLERK", threshold: 0, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-clerk-1" },
    { invoiceKey: "INV-EC-5004", level: 2, name: "AP Manager", role: "AP_MANAGER", threshold: 50000, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-manager-1" },
    { invoiceKey: "INV-EC-5004", level: 3, name: "VP Finance", role: "VP_FINANCE", threshold: 75000, status: "REJECTED" as ApprovalRecordStatus, decision: "REJECT" as ApprovalRecordDecision, decisionBy: "vp-finance-1", decisionComment: "Exceeds Q3 consulting budget ceiling — resubmit with reduced scope" },
    { invoiceKey: "INV-NS-7002", level: 1, name: "AP Clerk", role: "AP_CLERK", threshold: 0, status: "APPROVED" as ApprovalRecordStatus, decision: "APPROVE" as ApprovalRecordDecision, decisionBy: "ap-clerk-1" },
    { invoiceKey: "INV-NS-7002", level: 2, name: "AP Manager", role: "AP_MANAGER", threshold: 50000, status: "PENDING" as ApprovalRecordStatus, decision: null, decisionBy: null },
  ];

  for (const app of approvalData) {
    const inv = createdInvoices.find(i => i.invoiceNumber === app.invoiceKey);
    if (!inv) continue;
    const id = randomId();
    const existing = await prisma.procurementApprovalRecord.findFirst({ where: { companyId, vendorInvoiceId: inv.id, approvalLevel: app.level } });
    if (!existing) {
      await prisma.procurementApprovalRecord.create({
        data: {
          id, companyId, vendorInvoiceId: inv.id,
          approvalLevel: app.level, approvalLevelName: app.name,
          requiredRole: app.role, requiredThreshold: app.threshold,
          status: app.status, decision: app.decision,
          decisionAt: app.decision ? daysAgo(app.level) : null,
          decisionBy: app.decisionBy, decisionComment: (app as any).decisionComment ?? null,
          createdBy: SEED_USER, updatedBy: SEED_USER,
        },
      });
    }
  }
  console.log(`  Approval records: ${approvalData.length} processed`);

  // ── Audit Records ────────────────────────────────────────────────────────

  const auditEntries: Array<{ entityType: string; entityId: string; action: APAuditAction; description: string; amount?: number }> = [];
  for (const inv of createdInvoices) {
    auditEntries.push({ entityType: "VendorInvoice", entityId: inv.id, action: "CREATED", description: `Invoice ${inv.invoiceNumber} received` });
    auditEntries.push({ entityType: "VendorInvoice", entityId: inv.id, action: "STATUS_CHANGED", description: `Invoice ${inv.invoiceNumber} status updated` });
  }
  for (const exc of createdExceptions) {
    auditEntries.push({ entityType: "InvoiceException", entityId: exc.id, action: "CREATED", description: `Exception created for invoice` });
  }

  let auditCount = 0;
  for (const audit of auditEntries.slice(0, 20)) {
    const id = randomId();
    const existing = await prisma.procurementAPAuditRecord.findFirst({ where: { companyId, entityType: audit.entityType, entityId: audit.entityId, action: audit.action } });
    if (!existing) {
      await prisma.procurementAPAuditRecord.create({
        data: {
          id, companyId,
          entityType: audit.entityType, entityId: audit.entityId,
          action: audit.action,
          description: audit.description,
          amount: audit.amount ?? null,
          userId: SEED_USER, userRole: "ADMIN",
          correlationId: `seed-${Date.now()}`,
        },
      });
      auditCount++;
    }
  }
  console.log(`  Audit records: ${auditCount} created`);

  console.log("✅ AP seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ AP seed failed:", e);
    process.exit(1);
  });
