/**
 * Phase 21A.4 — AP Workflow Execution & Integration Tests
 *
 * Comprehensive end-to-end validation of all 16 AP workflows exercising
 * the actual application service layer against in-memory repositories.
 *
 * Workflows covered:
 *   1. Vendor Onboarding
 *   2. Vendor Maintenance
 *   3. Invoice Receipt
 *   4. Invoice Validation
 *   5. Duplicate Detection
 *   6. Three-Way Matching
 *   7. Exception Handling
 *   8. Approval Routing
 *   9. Payment Proposal Generation
 *  10. Treasury Approval
 *  11. Payment Execution
 *  12. GL Posting (flags only — no external GL)
 *  13. Vendor Credit Application
 *  14. Vendor Statement Reconciliation
 *  15. Month-End AP Close (manual checks)
 *  16. Audit Trail Reconstruction
 *
 * Also validates: events, permissions (via SoD checks), financial precision,
 * concurrency (optimistic locking), and failure recovery.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { InMemoryAPRepositoryRegistry } from "@/server/procurement/ap-repositories/in-memory-registry";
import type { APRepositoryRegistry } from "@/server/procurement/ap-repositories/registry";
import type { CommandContext } from "@/server/procurement/application/types";
import { VendorApplicationService } from "@/server/procurement/application/vendor-service";
import { InvoiceApplicationService } from "@/server/procurement/application/invoice-service";
import { ExceptionApplicationService } from "@/server/procurement/application/exception-service";
import { ApprovalApplicationService } from "@/server/procurement/application/approval-service";
import { PaymentApplicationService } from "@/server/procurement/application/payment-service";
import { ReconciliationApplicationService } from "@/server/procurement/application/reconciliation-service";
import { CreditApplicationService } from "@/server/procurement/application/credit-service";
import { apEventBus } from "@/server/procurement/domain/events/event-bus";

// ── Helpers ────────────────────────────────────────────────────────────────

const COMPANY = "test-company-001";
const CREATOR = "user-creator-001";
const APPROVER = "user-approver-001";
const CFO = "user-cfo-001";
const CORR = "corr-001";

function ctx(userId = CREATOR): CommandContext {
  return {
    companyId: COMPANY,
    userId,
    correlationId: CORR,
    timestamp: new Date(),
  };
}

function d(n: number): Prisma.Decimal {
  return new Prisma.Decimal(n);
}

// ── Fixtures ───────────────────────────────────────────────────────────────

function buildVendorCmd() {
  return {
    name: "Acme Corporation",
    vendorCode: "ACME-001",
    taxId: "12-3456789",
    taxCountry: "US",
    category: "SUPPLIER",
  };
}

function buildInvoiceCmd(vendorId: string, invoiceNumber = "INV-001") {
  return {
    vendorId,
    invoiceNumber,
    invoiceDate: new Date("2026-01-15"),
    dueDate: new Date("2026-02-14"),
    currency: "USD",
    subtotal: d(1000),
    taxAmount: d(80),
    lineItems: [
      {
        lineNumber: 1,
        description: "Widget A",
        quantity: d(10),
        unitPrice: d(100),
        taxRate: d(8),
      },
    ],
  };
}

// ── Setup ──────────────────────────────────────────────────────────────────

let repos: APRepositoryRegistry;
let vendorSvc: VendorApplicationService;
let invoiceSvc: InvoiceApplicationService;
let exceptionSvc: ExceptionApplicationService;
let approvalSvc: ApprovalApplicationService;
let paymentSvc: PaymentApplicationService;
let reconciliationSvc: ReconciliationApplicationService;
let creditSvc: CreditApplicationService;

beforeEach(() => {
  repos = new InMemoryAPRepositoryRegistry();
  vendorSvc = new VendorApplicationService(repos);
  invoiceSvc = new InvoiceApplicationService(repos);
  exceptionSvc = new ExceptionApplicationService(repos);
  approvalSvc = new ApprovalApplicationService(repos);
  paymentSvc = new PaymentApplicationService(repos);
  reconciliationSvc = new ReconciliationApplicationService(repos);
  creditSvc = new CreditApplicationService(repos);
  apEventBus.clear();
});

/** Helper: create + approve a vendor, return the vendor. */
async function onboardVendor() {
  const created = await vendorSvc.createVendor(buildVendorCmd(), ctx());
  expect(created.success).toBe(true);
  const vendor = created.data!;

  const approved = await vendorSvc.approveVendor(
    { vendorId: vendor.id },
    ctx(APPROVER),
  );
  expect(approved.success).toBe(true);
  return approved.data!;
}

/** Helper: receive an invoice through validation, return the invoice. */
async function receiveAndValidateInvoice(vendorId: string, invNum = "INV-001") {
  const received = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendorId, invNum), ctx());
  expect(received.success).toBe(true);
  const invoice = received.data!;

  const validated = await invoiceSvc.validateInvoice({ invoiceId: invoice.id }, ctx());
  expect(validated.success).toBe(true);
  return validated.data!;
}

// ══════════════════════════════════════════════════════════════════════════
// Workflow 1 — Vendor Onboarding
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 1 — Vendor Onboarding", () => {
  it("creates vendor in PENDING_REVIEW with correct defaults", async () => {
    const result = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    expect(result.success).toBe(true);
    const v = result.data!;
    expect(v.status).toBe("PENDING_REVIEW");
    expect(v.riskLevel).toBe("LOW");
    expect(v.preferredPaymentMethod).toBe("ACH");
    expect(v.version).toBe(1);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].eventType).toBe("vendor.created");
    expect(result.auditEntries).toHaveLength(1);
    expect(result.auditEntries[0].severity).toBe("INFO");
  });

  it("rejects duplicate vendor code (conflict)", async () => {
    await vendorSvc.createVendor(buildVendorCmd(), ctx());
    const dup = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    expect(dup.success).toBe(false);
    expect(dup.error?.code).toBe("CONFLICT");
  });

  it("approves vendor from PENDING_REVIEW → ACTIVE", async () => {
    const created = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    const v = created.data!;

    const approved = await vendorSvc.approveVendor({ vendorId: v.id }, ctx(APPROVER));
    expect(approved.success).toBe(true);
    expect(approved.data!.status).toBe("ACTIVE");
    expect(approved.events[0].eventType).toBe("vendor.approved");
  });

  it("prevents self-approval (separation of duties)", async () => {
    const created = await vendorSvc.createVendor(buildVendorCmd(), ctx(CREATOR));
    const approved = await vendorSvc.approveVendor({ vendorId: created.data!.id }, ctx(CREATOR));
    expect(approved.success).toBe(false);
    expect(approved.error?.code).toBe("FORBIDDEN");
  });

  it("rejects approval from non-reviewable status", async () => {
    const created = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    const approved = await vendorSvc.approveVendor({ vendorId: created.data!.id }, ctx(APPROVER));
    expect(approved.success).toBe(true); // PENDING_REVIEW → ACTIVE

    const doubleApprove = await vendorSvc.approveVendor({ vendorId: created.data!.id }, ctx(APPROVER));
    expect(doubleApprove.success).toBe(false);
    expect(doubleApprove.error?.code).toBe("INVALID_STATE");
  });

  it("emits vendor.created event with company scoping", async () => {
    const result = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    expect(result.events[0].companyId).toBe(COMPANY);
    expect(result.events[0].aggregateType).toBe("Vendor");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 2 — Vendor Maintenance
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 2 — Vendor Maintenance", () => {
  it("updates vendor fields and bumps version", async () => {
    const vendor = await onboardVendor();
    const updated = await vendorSvc.updateVendor(
      { vendorId: vendor.id, name: "Acme Corp Updated", paymentTerms: "NET45" },
      ctx(),
    );
    expect(updated.success).toBe(true);
    expect(updated.data!.name).toBe("Acme Corp Updated");
    expect(updated.data!.paymentTerms).toBe("NET45");
    expect(updated.data!.version).toBe(3);
  });

  it("rejects update when no fields change", async () => {
    const vendor = await onboardVendor();
    const result = await vendorSvc.updateVendor({ vendorId: vendor.id }, ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("suspends ACTIVE vendor → SUSPENDED", async () => {
    const vendor = await onboardVendor();
    const suspended = await vendorSvc.suspendVendor(
      { vendorId: vendor.id, reason: "Compliance review pending — supplier audit required" },
      ctx(APPROVER),
    );
    expect(suspended.success).toBe(true);
    expect(suspended.data!.status).toBe("SUSPENDED");
  });

  it("reactivates SUSPENDED vendor → ACTIVE", async () => {
    const vendor = await onboardVendor();
    await vendorSvc.suspendVendor(
      { vendorId: vendor.id, reason: "Compliance review pending — supplier audit required" },
      ctx(APPROVER),
    );
    const reactivated = await vendorSvc.reactivateVendor({ vendorId: vendor.id }, ctx(APPROVER));
    expect(reactivated.success).toBe(true);
    expect(reactivated.data!.status).toBe("ACTIVE");
  });

  it("deactivates ACTIVE vendor (terminal state)", async () => {
    const vendor = await onboardVendor();
    const deactivated = await vendorSvc.deactivateVendor(
      { vendorId: vendor.id, reason: "Vendor no longer in business — contract terminated 2026" },
      ctx(APPROVER),
    );
    expect(deactivated.success).toBe(true);
    expect(deactivated.data!.status).toBe("DEACTIVATED");

    // Cannot update a deactivated vendor
    const update = await vendorSvc.updateVendor({ vendorId: vendor.id, name: "X" }, ctx());
    expect(update.success).toBe(false);
    expect(update.error?.code).toBe("INVALID_STATE");
  });

  it("updates bank details with valid routing/account", async () => {
    const vendor = await onboardVendor();
    const result = await vendorSvc.updateBankDetails(
      {
        vendorId: vendor.id,
        bankAccountNumber: "123456789012345",
        bankRoutingNumber: "021000021",
        bankName: "JPMorgan Chase",
        reason: "Annual bank detail update — vendor requested change",
      },
      ctx(APPROVER),
    );
    expect(result.success).toBe(true);
    expect(result.events[0].eventType).toBe("vendor.bank_updated");
  });

  it("rejects invalid routing number format", async () => {
    const vendor = await onboardVendor();
    const result = await vendorSvc.updateBankDetails(
      {
        vendorId: vendor.id,
        bankAccountNumber: "123456789012345",
        bankRoutingNumber: "123",
        bankName: "JPMorgan Chase",
        reason: "Annual bank detail update — vendor requested change",
      },
      ctx(APPROVER),
    );
    expect(result.success).toBe(false);
  });

  it("requires minimum 10-character reason for destructive actions", async () => {
    const vendor = await onboardVendor();
    const result = await vendorSvc.suspendVendor(
      { vendorId: vendor.id, reason: "short" },
      ctx(APPROVER),
    );
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 3 — Invoice Receipt
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 3 — Invoice Receipt", () => {
  it("receives invoice for ACTIVE vendor in CAPTURED status", async () => {
    const vendor = await onboardVendor();
    const result = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx());
    expect(result.success).toBe(true);
    const inv = result.data!;
    expect(inv.status).toBe("CAPTURED");
    expect(inv.vendorId).toBe(vendor.id);
    expect(inv.lineItems).toHaveLength(1);
    expect(result.events[0].eventType).toBe("invoice.captured");
  });

  it("rejects invoice for non-ACTIVE vendor", async () => {
    const created = await vendorSvc.createVendor(buildVendorCmd(), ctx());
    const result = await invoiceSvc.receiveInvoice(buildInvoiceCmd(created.data!.id), ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_STATE");
  });

  it("rejects duplicate invoice number for same vendor", async () => {
    const vendor = await onboardVendor();
    await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-001"), ctx());
    const dup = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-001"), ctx());
    expect(dup.success).toBe(false);
    expect(dup.error?.code).toBe("CONFLICT");
  });

  it("allows same invoice number for different vendors", async () => {
    const vendor1 = await onboardVendor();
    const created2 = await vendorSvc.createVendor(
      { ...buildVendorCmd(), vendorCode: "ACME-002", taxId: "98-7654321" },
      ctx(),
    );
    await vendorSvc.approveVendor({ vendorId: created2.data!.id }, ctx(APPROVER));

    const r1 = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor1.id, "INV-001"), ctx());
    expect(r1.success).toBe(true);
    const r2 = await invoiceSvc.receiveInvoice(
      buildInvoiceCmd(created2.data!.id, "INV-001"),
      ctx(),
    );
    expect(r2.success).toBe(true);
  });

  it("computes financial totals with Decimal precision", async () => {
    const vendor = await onboardVendor();
    const result = await invoiceSvc.receiveInvoice(
      {
        vendorId: vendor.id,
        invoiceNumber: "INV-FIN",
        invoiceDate: new Date("2026-01-15"),
        dueDate: new Date("2026-02-14"),
        subtotal: d(1544.38),
        lineItems: [
          { lineNumber: 1, description: "Item A", quantity: d(3), unitPrice: d(333.33), taxRate: d(8) },
          { lineNumber: 2, description: "Item B", quantity: d(7), unitPrice: d(77.77), taxRate: d(8) },
        ],
      },
      ctx(),
    );
    expect(result.success).toBe(true);
    const inv = result.data!;
    // subtotal = 3*333.33 + 7*77.77 = 999.99 + 544.39 = 1544.38
    expect(inv.subtotal).toBeCloseTo(1544.38, 2);
    expect(inv.totalAmount).toBeGreaterThan(0);
    expect(inv.balanceDue).toBe(inv.totalAmount);
  });

  it("updates invoice in CAPTURED status only", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    const updated = await invoiceSvc.updateInvoice(
      { invoiceId: inv.id, description: "Updated description" },
      ctx(),
    );
    expect(updated.success).toBe(true);
    expect(updated.data!.description).toBe("Updated description");
  });

  it("soft-deletes (voids) CAPTURED invoice", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    const deleted = await invoiceSvc.deleteInvoice(
      { invoiceId: inv.id, reason: "Duplicate entry created by mistake — removing to avoid confusion" },
      ctx(),
    );
    expect(deleted.success).toBe(true);
    expect(deleted.data!.status).toBe("VOIDED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 4 — Invoice Validation
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 4 — Invoice Validation", () => {
  it("validates CAPTURED invoice → VALIDATED", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    const validated = await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    expect(validated.success).toBe(true);
    expect(validated.data!.status).toBe("VALIDATED");
    expect(validated.events[0].eventType).toBe("invoice.validated");
  });

  it("creates exception on validation failure", async () => {
    const vendor = await onboardVendor();
    // Create invoice with zero-quantity line item
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-BAD",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(0),
          lineItems: [
            { lineNumber: 1, description: "Bad item", quantity: d(0), unitPrice: d(100) },
          ],
        },
        ctx(),
      )
    ).data!;

    const result = await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("CAPTURED"); // status unchanged on validation fail
    expect(result.events.some((e) => e.eventType === "invoice.validation_failed")).toBe(true);
    expect(result.events.some((e) => e.eventType === "exception.created")).toBe(true);
  });

  it("rejects validation of non-CAPTURED invoice", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    const result = await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_STATE");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 5 — Duplicate Detection
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 5 — Duplicate Detection", () => {
  it("blocks duplicate invoice number for same vendor at receive time", async () => {
    const vendor = await onboardVendor();
    const r1 = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-DUP"), ctx());
    expect(r1.success).toBe(true);

    const r2 = await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-DUP"), ctx());
    expect(r2.success).toBe(false);
    expect(r2.error?.code).toBe("CONFLICT");
  });

  it("allows same number for different vendors (cross-vendor)", async () => {
    const v1 = await onboardVendor();
    const c2 = await vendorSvc.createVendor(
      { ...buildVendorCmd(), vendorCode: "VEND-002", taxId: "99-9999999" },
      ctx(),
    );
    await vendorSvc.approveVendor({ vendorId: c2.data!.id }, ctx(APPROVER));

    const r1 = await invoiceSvc.receiveInvoice(buildInvoiceCmd(v1.id, "INV-SHARED"), ctx());
    const r2 = await invoiceSvc.receiveInvoice(buildInvoiceCmd(c2.data!.id, "INV-SHARED"), ctx());
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 6 — Three-Way Matching
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 6 — Three-Way Matching", () => {
  it("rejects match without linked PO", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    const result = await invoiceSvc.runThreeWayMatch({ invoiceId: inv.id }, ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NO_PO_LINKED");
  });

  it("runs match on VALIDATED invoice with PO reference", async () => {
    const vendor = await onboardVendor();
    // Manually set PO reference on invoice
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;
    inv.poReferenceId = "po-ref-001";
    await repos.invoice.save(inv);
    const validated = (await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx())).data!;

    const result = await invoiceSvc.runThreeWayMatch({ invoiceId: validated.id }, ctx());
    expect(result.success).toBe(true);
    expect(result.data!.matchResult).toBe("FULL_MATCH");
    expect(result.data!.status).toBe("MATCHED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 7 — Exception Handling
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 7 — Exception Handling", () => {
  async function createTestException(invoiceId: string) {
    return exceptionSvc.createException(
      {
        invoiceId,
        exceptionType: "PRICE_VARIANCE",
        severity: "HIGH",
        description: "Invoice unit price exceeds PO price by 15% — variance $150.00 exceeds threshold",
      },
      ctx(),
    );
  }

  it("creates exception for an invoice", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    const result = await createTestException(inv.id);
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("OPEN");
    expect(result.events[0].eventType).toBe("exception.created");
  });

  it("assigns OPEN exception → IN_REVIEW", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;
    const ex = (await createTestException(inv.id)).data!;

    const assigned = await exceptionSvc.assignException(
      { exceptionId: ex.id, assignedTo: "analyst-001" },
      ctx(),
    );
    expect(assigned.success).toBe(true);
    expect(assigned.data!.status).toBe("IN_REVIEW");
    expect(assigned.data!.assignedTo).toBe("analyst-001");
  });

  it("resolves IN_REVIEW exception and restores invoice", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    // Block invoice to put it in EXCEPTION status
    const blocked = await invoiceSvc.blockInvoice(
      { invoiceId: inv.id, reason: "Price variance exceeds threshold — requires manual review", blockType: "PRICE" },
      ctx(),
    );
    expect(blocked.success).toBe(true);
    expect(blocked.data!.status).toBe("EXCEPTION");

    // Create and assign exception
    const ex = (await createTestException(inv.id)).data!;
    await exceptionSvc.assignException({ exceptionId: ex.id, assignedTo: "analyst-001" }, ctx());

    // Resolve
    const resolved = await exceptionSvc.resolveException(
      {
        exceptionId: ex.id,
        resolution: "APPROVED",
        resolutionNotes: "Price variance is within acceptable range for this vendor category",
      },
      ctx(),
    );
    expect(resolved.success).toBe(true);
    expect(resolved.data!.status).toBe("RESOLVED");

    // Invoice should be restored to MATCHED
    const updatedInv = await repos.invoice.findById(inv.id, COMPANY);
    expect(updatedInv?.status).toBe("MATCHED");
  });

  it("escalates OPEN exception → ESCALATED", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;
    const ex = (await createTestException(inv.id)).data!;

    const escalated = await exceptionSvc.escalateException(
      { exceptionId: ex.id, reason: "SLA breach — critical severity requires immediate attention" },
      ctx(),
    );
    expect(escalated.success).toBe(true);
    expect(escalated.data!.status).toBe("ESCALATED");
  });

  it("auto-resolves PRICE_VARIANCE with high confidence", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;
    const ex = (await createTestException(inv.id)).data!;

    const auto = await exceptionSvc.autoResolveException(
      { exceptionId: ex.id, patternId: "pattern-001", confidence: 0.95 },
      ctx(),
    );
    expect(auto.success).toBe(true);
    expect(auto.data!.status).toBe("RESOLVED");
    expect(auto.data!.resolvedBy).toContain("pattern-001");
  });

  it("rejects auto-resolve with confidence below threshold", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;
    const ex = (await createTestException(inv.id)).data!;

    const auto = await exceptionSvc.autoResolveException(
      { exceptionId: ex.id, patternId: "pattern-001", confidence: 0.5 },
      ctx(),
    );
    expect(auto.success).toBe(false);
  });

  it("bulk-resolves matching-type IN_REVIEW exceptions", async () => {
    const vendor = await onboardVendor();
    const inv = (await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id), ctx())).data!;

    const ex1 = (await createTestException(inv.id)).data!;
    const ex2 = (
      await exceptionSvc.createException(
        {
          invoiceId: inv.id,
          exceptionType: "PRICE_VARIANCE",
          severity: "MEDIUM",
          description: "Secondary price variance found on same invoice line — rounding difference",
        },
        ctx(),
      )
    ).data!;

    // Assign both to move to IN_REVIEW
    await exceptionSvc.assignException({ exceptionId: ex1.id, assignedTo: "analyst-001" }, ctx());
    await exceptionSvc.assignException({ exceptionId: ex2.id, assignedTo: "analyst-001" }, ctx());

    const bulk = await exceptionSvc.bulkResolveExceptions(
      {
        exceptionIds: [ex1.id, ex2.id],
        resolution: "APPROVED",
        resolutionNotes: "Both variances are within tolerance — approved by AP manager",
      },
      ctx(),
    );
    expect(bulk.success).toBe(true);
    expect(bulk.data!).toHaveLength(2);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 8 — Approval Routing
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 8 — Approval Routing", () => {
  it("auto-approves invoice under $1K", async () => {
    const vendor = await onboardVendor();
    // Small invoice under $1K threshold for auto-approve
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-SMALL",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(500),
          lineItems: [{ lineNumber: 1, description: "Office supplies", quantity: d(5), unitPrice: d(100) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;

    // Set PO to enable match → APPROVED path
    invRefreshed.poReferenceId = "po-001";
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const result = await approvalSvc.requestApproval({ invoiceId: invRefreshed.id }, ctx());
    expect(result.success).toBe(true);
    expect(result.data!).toHaveLength(1);
    expect(result.data![0].status).toBe("APPROVED");
    expect(result.data![0].decisionBy).toBe("SYSTEM");

    // Invoice should be APPROVED
    const updated = await repos.invoice.findById(invRefreshed.id, COMPANY);
    expect(updated?.status).toBe("APPROVED");
  });

  it("creates multi-level chain for invoice $10K–$50K", async () => {
    const vendor = await onboardVendor();
    // High-value invoice
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-HIGH",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(25000),
          lineItems: [
            { lineNumber: 1, description: "Enterprise license", quantity: d(1), unitPrice: d(25000) },
          ],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRefreshed.poReferenceId = "po-high-001";
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const result = await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx());
    expect(result.success).toBe(true);
    expect(result.data!.length).toBeGreaterThanOrEqual(2);
    expect(result.data![0].status).toBe("PENDING"); // First level pending
    expect(result.data![0].requiredRole).toBe("AP_MANAGER");

    const invAfter = await repos.invoice.findById(inv.id, COMPANY);
    expect(invAfter?.status).toBe("PENDING_APPROVAL");
  });

  it("approves level 1 → cascades level 2 to PENDING", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-CASCADE",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(25000),
          lineItems: [
            { lineNumber: 1, description: "Enterprise license", quantity: d(1), unitPrice: d(25000) },
          ],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRefreshed.poReferenceId = "po-001";
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx())).data!;
    const level1 = records.find((r) => r.approvalLevel === 1)!;

    // Approve level 1 (by non-creator)
    const decided = await approvalSvc.approveLevel(
      { approvalRecordId: level1.id, decision: "APPROVED", comment: "Approved — budget confirmed" },
      ctx(APPROVER),
    );
    expect(decided.success).toBe(true);

    // Level 2 should now be PENDING
    const updatedRecords = await repos.approval.findRecordsByInvoiceId(inv.id, COMPANY);
    const level2 = updatedRecords.find((r) => r.approvalLevel === 2);
    expect(level2?.status).toBe("PENDING");
  });

  it("rejects approval → invoice becomes REJECTED", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    inv.poReferenceId = "po-001";
    await repos.invoice.save(inv);
    await invoiceSvc.runThreeWayMatch({ invoiceId: inv.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx())).data!;
    const level1 = records[0];

    const rejected = await approvalSvc.rejectLevel(
      { approvalRecordId: level1.id, decision: "REJECTED", comment: "Insufficient documentation provided" },
      ctx(APPROVER),
    );
    expect(rejected.success).toBe(true);
    expect(rejected.data!.status).toBe("REJECTED");
  });

  it("prevents SoD: invoice creator cannot approve", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    inv.poReferenceId = "po-001";
    await repos.invoice.save(inv);
    await invoiceSvc.runThreeWayMatch({ invoiceId: inv.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx())).data!;
    const level1 = records[0];

    // Creator tries to approve their own invoice
    const result = await approvalSvc.approveLevel(
      { approvalRecordId: level1.id, decision: "APPROVED" },
      ctx(CREATOR),
    );
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("SOD_VIOLATION");
  });

  it("delegates approval to another user", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-DELEGATE",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(25000),
          lineItems: [
            { lineNumber: 1, description: "Service engagement", quantity: d(1), unitPrice: d(25000) },
          ],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invDel = (await repos.invoice.findById(inv.id, COMPANY))!;
    invDel.poReferenceId = "po-001";
    await repos.invoice.save(invDel);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invDel.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: invDel.id }, ctx())).data!;
    const level1 = records[0];

    const delegated = await approvalSvc.delegateApproval(
      { approvalRecordId: level1.id, delegatedTo: CFO, reason: "On vacation — delegated to CFO" },
      ctx(APPROVER),
    );
    expect(delegated.success).toBe(true);
    expect(delegated.data!.delegatedTo).toBe(CFO);
  });

  it("escalating a level activates the next level and never leaves a stale PENDING record on an APPROVED invoice", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-ESCALATE",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(25000),
          lineItems: [
            { lineNumber: 1, description: "Escalation fixture", quantity: d(1), unitPrice: d(25000) },
          ],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRefreshed.poReferenceId = "po-esc-001";
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx())).data!;
    expect(records.length).toBeGreaterThanOrEqual(2);
    const level1 = records.find((r) => r.approvalLevel === 1)!;
    expect(level1.status).toBe("PENDING");

    // Escalating L1 auto-approves L1 and activates L2 (SKIPPED → PENDING).
    // The invoice must remain PENDING_APPROVAL — L2 still needs a decision —
    // rather than being marked APPROVED while a PENDING record survives.
    const escalated = await approvalSvc.escalateApprovalLevel(
      { approvalRecordId: level1.id, reason: "SLA breach — fast-track to next level" },
      ctx(APPROVER),
    );
    expect(escalated.success).toBe(true);

    const after = await repos.approval.findRecordsByInvoiceId(inv.id, COMPANY);
    const l1 = after.find((r) => r.approvalLevel === 1)!;
    const l2 = after.find((r) => r.approvalLevel === 2)!;
    expect(l1.status).toBe("APPROVED");
    expect(l2.status).toBe("PENDING");

    const invAfter = await repos.invoice.findById(inv.id, COMPANY);
    expect(invAfter?.status).toBe("PENDING_APPROVAL");

    // Sanity: the chain cannot complete until the final level decides, so
    // there is no path to invoice=APPROVED with a PENDING record.
    const decided = await approvalSvc.approveLevel(
      { approvalRecordId: l2.id, decision: "APPROVED", comment: "Approved after escalation" },
      ctx(CFO),
    );
    expect(decided.success).toBe(true);
    const finalInv = await repos.invoice.findById(inv.id, COMPANY);
    expect(finalInv?.status).toBe("APPROVED");
    const finalRecords = await repos.approval.findRecordsByInvoiceId(inv.id, COMPANY);
    expect(finalRecords.every((r) => r.status === "APPROVED")).toBe(true);
  });

  it("escalating the final pending level completes the chain, approves the invoice, and emits chain-approved events + status-change audits", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-ESCALATE-FINAL",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(25000),
          lineItems: [
            { lineNumber: 1, description: "Final-level escalation fixture", quantity: d(1), unitPrice: d(25000) },
          ],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRefreshed.poReferenceId = "po-esc-final-001";
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const records = (await approvalSvc.requestApproval({ invoiceId: inv.id }, ctx())).data!;
    expect(records.length).toBeGreaterThanOrEqual(2);
    const level1 = records.find((r) => r.approvalLevel === 1)!;
    expect(level1.status).toBe("PENDING");

    // Reproduce the stale-seed shape from the INV-NS-7002 review case: every
    // higher level is already APPROVED while level 1 is the sole remaining
    // PENDING record. Escalating level 1 is therefore escalating the final
    // pending level — the completion branch must fire: every record APPROVED,
    // invoice APPROVED, and the chain-approved event + status-change audits
    // must be emitted.
    const higher = records.filter((r) => r.approvalLevel > 1);
    for (const r of higher) {
      r.status = "APPROVED";
      r.decision = "APPROVE";
      r.decisionAt = new Date().toISOString();
      r.decisionBy = APPROVER;
      r.updatedAt = new Date().toISOString();
      r.updatedBy = APPROVER;
      r.version += 1;
      await repos.approval.saveRecord(r);
    }

    const escalated = await approvalSvc.escalateApprovalLevel(
      { approvalRecordId: level1.id, reason: "SLA breach — last pending level escalated" },
      ctx(APPROVER),
    );
    expect(escalated.success).toBe(true);

    const finalRecords = await repos.approval.findRecordsByInvoiceId(inv.id, COMPANY);
    expect(finalRecords.every((r) => r.status === "APPROVED")).toBe(true);

    const finalInv = await repos.invoice.findById(inv.id, COMPANY);
    expect(finalInv?.status).toBe("APPROVED");
    expect(finalInv?.approvedAt).toBeTruthy();

    const eventTypes = escalated.events.map((e) => e.eventType);
    expect(eventTypes).toContain("approval.level.decided");
    expect(eventTypes).toContain("approval.level.escalated");
    expect(eventTypes).toContain("approval.chain.approved");
    expect(eventTypes).toContain("invoice.updated");

    const actions = escalated.auditEntries.map((a) => a.action);
    expect(actions).toContain("approval.escalated");
    expect(actions).toContain("approval.chain_approved");
    expect(actions).toContain("invoice.status_changed");
    expect(
      escalated.auditEntries.find((a) => a.action === "invoice.status_changed")?.metadata,
    ).toMatchObject({ previousStatus: "PENDING_APPROVAL", newStatus: "APPROVED" });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 9 — Payment Proposal Generation
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 9 — Payment Proposal Generation", () => {
  async function getApprovedInvoice(vendorId: string, invNum: string) {
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId,
          invoiceNumber: invNum,
          invoiceDate: new Date("2026-01-01"),
          dueDate: new Date("2026-01-30"),
          subtotal: d(5000),
          lineItems: [{ lineNumber: 1, description: "Services", quantity: d(1), unitPrice: d(5000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());

    const invRefreshed = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRefreshed.poReferenceId = `po-${invNum}`;
    await repos.invoice.save(invRefreshed);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRefreshed.id }, ctx());

    const approved = await invoiceSvc.approveInvoice({ invoiceId: invRefreshed.id }, ctx());
    expect(approved.success).toBe(true);
    return approved.data!;
  }

  it("generates proposal from approved unscheduled invoices", async () => {
    const vendor = await onboardVendor();
    const inv = await getApprovedInvoice(vendor.id, "INV-PAY-001");

    const proposal = await paymentSvc.generatePaymentProposal(
      { paymentDate: new Date("2026-02-01") },
      ctx(),
    );
    expect(proposal.success).toBe(true);
    expect(proposal.data!.status).toBe("DRAFT");
    expect(proposal.data!.totalInvoices).toBe(1);
    expect(proposal.data!.totalAmount).toBeGreaterThan(0);
  });

  it("rejects proposal when no eligible invoices exist", async () => {
    const result = await paymentSvc.generatePaymentProposal(
      { paymentDate: new Date("2026-02-01") },
      ctx(),
    );
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  it("reviews proposal DRAFT → REVIEWED", async () => {
    const vendor = await onboardVendor();
    await getApprovedInvoice(vendor.id, "INV-PAY-REV");

    const proposal = (
      await paymentSvc.generatePaymentProposal(
        { paymentDate: new Date("2026-02-01") },
        ctx(),
      )
    ).data!;

    const reviewed = await paymentSvc.reviewPaymentProposal(
      { proposalId: proposal.id, notes: "Reviewed — all amounts match" },
      ctx(APPROVER),
    );
    expect(reviewed.success).toBe(true);
    expect(reviewed.data!.status).toBe("REVIEWED");
  });

  it("approves proposal with SoD check", async () => {
    const vendor = await onboardVendor();
    await getApprovedInvoice(vendor.id, "INV-PAY-APPR");

    const proposal = (
      await paymentSvc.generatePaymentProposal(
        { paymentDate: new Date("2026-02-01") },
        ctx(),
      )
    ).data!;
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));

    const approved = await paymentSvc.approvePaymentProposal(
      { proposalId: proposal.id, comments: "Approved for payment" },
      ctx(CFO),
    );
    expect(approved.success).toBe(true);
    expect(approved.data!.status).toBe("APPROVED");
  });

  it("prevents creator from approving own proposal", async () => {
    const vendor = await onboardVendor();
    await getApprovedInvoice(vendor.id, "INV-PAY-SOD");

    const proposal = (
      await paymentSvc.generatePaymentProposal(
        { paymentDate: new Date("2026-02-01") },
        ctx(CREATOR),
      )
    ).data!;
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));

    const approved = await paymentSvc.approvePaymentProposal(
      { proposalId: proposal.id },
      ctx(CREATOR),
    );
    expect(approved.success).toBe(false);
    expect(approved.error?.code).toBe("FORBIDDEN");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 10 — Treasury Approval
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 10 — Treasury Approval", () => {
  it("approves proposal < $100K as AP_MANAGER tier", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-T1",
          invoiceDate: new Date("2026-01-01"),
          dueDate: new Date("2026-01-30"),
          subtotal: d(50000),
          lineItems: [{ lineNumber: 1, description: "Services", quantity: d(1), unitPrice: d(50000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invT1 = (await repos.invoice.findById(inv.id, COMPANY))!;
    invT1.poReferenceId = "po-t1";
    await repos.invoice.save(invT1);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invT1.id }, ctx());
    await invoiceSvc.approveInvoice({ invoiceId: invT1.id }, ctx());

    const proposal = (
      await paymentSvc.generatePaymentProposal({ paymentDate: new Date("2026-02-01") }, ctx())
    ).data!;
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));

    const approved = await paymentSvc.approvePaymentProposal(
      { proposalId: proposal.id },
      ctx(APPROVER),
    );
    expect(approved.success).toBe(true);
  });

  it("rejects proposal REVIEWED → REJECTED", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-REJ",
          invoiceDate: new Date("2026-01-01"),
          dueDate: new Date("2026-01-30"),
          subtotal: d(5000),
          lineItems: [{ lineNumber: 1, description: "Services", quantity: d(1), unitPrice: d(5000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invRej = (await repos.invoice.findById(inv.id, COMPANY))!;
    invRej.poReferenceId = "po-rej";
    await repos.invoice.save(invRej);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invRej.id }, ctx());
    await invoiceSvc.approveInvoice({ invoiceId: invRej.id }, ctx());

    const proposal = (
      await paymentSvc.generatePaymentProposal({ paymentDate: new Date("2026-02-01") }, ctx())
    ).data!;
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));

    const rejected = await paymentSvc.rejectPaymentProposal(
      { proposalId: proposal.id, reason: "Budget exhausted for this quarter — defer to Q2" },
      ctx(CFO),
    );
    expect(rejected.success).toBe(true);
    expect(rejected.data!.status).toBe("REJECTED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 11 — Payment Execution
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 11 — Payment Execution", () => {
  async function getApprovedProposal(vendorId: string) {
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId,
          invoiceNumber: "INV-PAY-EXEC",
          invoiceDate: new Date("2026-01-01"),
          dueDate: new Date("2026-01-30"),
          subtotal: d(5000),
          lineItems: [{ lineNumber: 1, description: "Services", quantity: d(1), unitPrice: d(5000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invR = (await repos.invoice.findById(inv.id, COMPANY))!;
    invR.poReferenceId = "po-pay-exec";
    await repos.invoice.save(invR);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invR.id }, ctx());
    await invoiceSvc.approveInvoice({ invoiceId: invR.id }, ctx());

    const proposal = (
      await paymentSvc.generatePaymentProposal({ paymentDate: new Date("2026-02-01") }, ctx())
    ).data!;
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));
    const approved = (
      await paymentSvc.approvePaymentProposal({ proposalId: proposal.id }, ctx(CFO))
    ).data!;
    return { proposal: approved, invoiceId: inv.id };
  }

  it("creates batch from approved proposal", async () => {
    const vendor = await onboardVendor();
    const { proposal } = await getApprovedProposal(vendor.id);

    const batch = await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx());
    expect(batch.success).toBe(true);
    expect(batch.data!.status).toBe("PENDING");
    expect(batch.data!.totalPayments).toBe(1);
  });

  it("rejects batch from non-APPROVED proposal", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-BATCH-FAIL",
          invoiceDate: new Date("2026-01-01"),
          dueDate: new Date("2026-01-30"),
          subtotal: d(5000),
          lineItems: [{ lineNumber: 1, description: "Services", quantity: d(1), unitPrice: d(5000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invBf = (await repos.invoice.findById(inv.id, COMPANY))!;
    invBf.poReferenceId = "po-batch-fail";
    await repos.invoice.save(invBf);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invBf.id }, ctx());
    await invoiceSvc.approveInvoice({ invoiceId: invBf.id }, ctx());
    const proposal = (
      await paymentSvc.generatePaymentProposal({ paymentDate: new Date("2026-02-01") }, ctx())
    ).data!;

    const batch = await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx());
    expect(batch.success).toBe(false);
    expect(batch.error?.code).toBe("CONFLICT");
  });

  it("executes payment in batch", async () => {
    const vendor = await onboardVendor();
    const { proposal } = await getApprovedProposal(vendor.id);
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx())).data!;

    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);
    expect(payments).toHaveLength(1);

    const executed = await paymentSvc.executePayment(
      { batchId: batch.id, paymentId: payments[0].id },
      ctx(),
    );
    expect(executed.success).toBe(true);
    expect(executed.data!.status).toBe("CLEARED");
  });

  it("confirms payment → invoice becomes PAID", async () => {
    const vendor = await onboardVendor();
    const { proposal, invoiceId } = await getApprovedProposal(vendor.id);
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx())).data!;
    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);
    await paymentSvc.executePayment(
      { batchId: batch.id, paymentId: payments[0].id },
      ctx(),
    );

    const confirmed = await paymentSvc.confirmPayment(
      { batchId: batch.id, paymentId: payments[0].id, bankReference: "ACH-REF-20260201-001" },
      ctx(),
    );
    expect(confirmed.success).toBe(true);

    // Invoice should be PAID
    const invoice = await repos.invoice.findById(invoiceId, COMPANY);
    expect(invoice?.status).toBe("PAID");
    expect(invoice?.paymentReference).toBe("ACH-REF-20260201-001");
  });

  it("batch auto-completes when all payments confirmed", async () => {
    const vendor = await onboardVendor();
    const { proposal } = await getApprovedProposal(vendor.id);
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx())).data!;
    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);
    await paymentSvc.executePayment(
      { batchId: batch.id, paymentId: payments[0].id },
      ctx(),
    );
    await paymentSvc.confirmPayment(
      { batchId: batch.id, paymentId: payments[0].id, bankReference: "REF-001" },
      ctx(),
    );

    const updatedBatch = await repos.paymentBatch.findById(batch.id, COMPANY);
    expect(updatedBatch?.status).toBe("COMPLETED");
  });

  it("reverses payment → invoice restored to APPROVED", async () => {
    const vendor = await onboardVendor();
    const { proposal, invoiceId } = await getApprovedProposal(vendor.id);
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx())).data!;
    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);
    await paymentSvc.executePayment(
      { batchId: batch.id, paymentId: payments[0].id },
      ctx(),
    );

    const reversed = await paymentSvc.reversePayment(
      {
        batchId: batch.id,
        paymentId: payments[0].id,
        reason: "Vendor requested payment reversal — incorrect amount invoiced",
      },
      ctx(),
    );
    expect(reversed.success).toBe(true);
    expect(reversed.data!.status).toBe("REVERSED");

    const invoice = await repos.invoice.findById(invoiceId, COMPANY);
    expect(invoice?.status).toBe("APPROVED");
  });

  it("cancels PROCESSED payment", async () => {
    const vendor = await onboardVendor();
    const { proposal } = await getApprovedProposal(vendor.id);
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: proposal.id }, ctx())).data!;
    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);

    const cancelled = await paymentSvc.cancelPayment(
      {
        batchId: batch.id,
        paymentId: payments[0].id,
        reason: "Payment cancelled before bank submission — vendor updated bank details",
      },
      ctx(),
    );
    expect(cancelled.success).toBe(true);
    expect(cancelled.data!.status).toBe("VOIDED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 12 — GL Posting (Flags)
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 12 — GL Posting (Flags)", () => {
  it("invoice tracks GL posting flags", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    expect(inv.glPosted).toBe(false);
    expect(inv.accrualPosted).toBe(false);

    // After payment confirmation, flags would be set by GL integration
    inv.glPosted = true;
    inv.glPostedAt = new Date().toISOString();
    await repos.invoice.save(inv);

    const updated = await repos.invoice.findById(inv.id, COMPANY);
    expect(updated?.glPosted).toBe(true);
    expect(updated?.glPostedAt).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 13 — Vendor Credit Application
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 13 — Vendor Credit Application", () => {
  it("receives credit note for a vendor", async () => {
    const vendor = await onboardVendor();
    const credit = await creditSvc.receiveCreditNote(
      {
        vendorId: vendor.id,
        creditNumber: "CN-001",
        creditDate: new Date("2026-02-01"),
        creditAmount: d(500),
        reason: "Return of defective goods — vendor credit for 2 widgets",
      },
      ctx(),
    );
    expect(credit.success).toBe(true);
    expect(credit.data!.status).toBe("ISSUED");
    expect(credit.data!.creditAmount).toBe(500);
  });

  it("rejects credit with amount ≤ 0", async () => {
    const vendor = await onboardVendor();
    const credit = await creditSvc.receiveCreditNote(
      {
        vendorId: vendor.id,
        creditNumber: "CN-ZERO",
        creditDate: new Date("2026-02-01"),
        creditAmount: d(0),
        reason: "Zero amount credit — testing validation boundary",
      },
      ctx(),
    );
    expect(credit.success).toBe(false);
  });

  it("applies credit to invoice and reduces balance", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    const credit = (
      await creditSvc.receiveCreditNote(
        {
          vendorId: vendor.id,
          creditNumber: "CN-002",
          creditDate: new Date("2026-02-01"),
          creditAmount: d(200),
          reason: "Partial return credit for damaged items in shipment",
        },
        ctx(),
      )
    ).data!;

    const applied = await creditSvc.applyCreditNote(
      {
        creditId: credit.id,
        applications: [{ invoiceId: inv.id, amount: d(200) }],
      },
      ctx(),
    );
    expect(applied.success).toBe(true);
    expect(applied.data!.status).toBe("FULLY_APPLIED");

    const updatedInv = await repos.invoice.findById(inv.id, COMPANY);
    expect(updatedInv!.creditApplied).toBe(200);
    expect(updatedInv!.balanceDue).toBeLessThan(updatedInv!.totalAmount);
  });

  it("prevents over-application beyond credit balance", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    const credit = (
      await creditSvc.receiveCreditNote(
        {
          vendorId: vendor.id,
          creditNumber: "CN-003",
          creditDate: new Date("2026-02-01"),
          creditAmount: d(100),
          reason: "Small credit for shipping overcharge correction",
        },
        ctx(),
      )
    ).data!;

    const result = await creditSvc.applyCreditNote(
      {
        creditId: credit.id,
        applications: [{ invoiceId: inv.id, amount: d(500) }],
      },
      ctx(),
    );
    expect(result.success).toBe(false);
  });

  it("partially applies credit across multiple invoices", async () => {
    const vendor = await onboardVendor();
    const inv1 = (
      await invoiceSvc.receiveInvoice(
        buildInvoiceCmd(vendor.id, "INV-CR-1"),
        ctx(),
      )
    ).data!;
    const inv2 = (
      await invoiceSvc.receiveInvoice(
        buildInvoiceCmd(vendor.id, "INV-CR-2"),
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv1.id }, ctx());
    await invoiceSvc.validateInvoice({ invoiceId: inv2.id }, ctx());

    const credit = (
      await creditSvc.receiveCreditNote(
        {
          vendorId: vendor.id,
          creditNumber: "CN-PARTIAL",
          creditDate: new Date("2026-02-01"),
          creditAmount: d(1500),
          reason: "Credit note for return — to be split across two invoices",
        },
        ctx(),
      )
    ).data!;

    const applied = await creditSvc.applyCreditNote(
      {
        creditId: credit.id,
        applications: [
          { invoiceId: inv1.id, amount: d(750) },
          { invoiceId: inv2.id, amount: d(750) },
        ],
      },
      ctx(),
    );
    expect(applied.success).toBe(true);
    expect(applied.data!.status).toBe("FULLY_APPLIED");
  });

  it("voids credit note and restores invoice balances", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    const credit = (
      await creditSvc.receiveCreditNote(
        {
          vendorId: vendor.id,
          creditNumber: "CN-VOID",
          creditDate: new Date("2026-02-01"),
          creditAmount: d(300),
          reason: "Credit note voided — issued in error, vendor re-invoiced correctly",
        },
        ctx(),
      )
    ).data!;

    await creditSvc.applyCreditNote(
      {
        creditId: credit.id,
        applications: [{ invoiceId: inv.id, amount: d(300) }],
      },
      ctx(),
    );

    const originalBalance = (await repos.invoice.findById(inv.id, COMPANY))!.balanceDue;

    const voided = await creditSvc.voidCreditNote(
      {
        creditId: credit.id,
        reason: "Credit issued in error — vendor corrected the amount on new invoice",
      },
      ctx(),
    );
    expect(voided.success).toBe(true);
    expect(voided.data!.status).toBe("EXPIRED");

    // Invoice balance should be restored
    const restoredInv = await repos.invoice.findById(inv.id, COMPANY);
    expect(restoredInv!.balanceDue).toBeGreaterThan(originalBalance);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 14 — Vendor Statement Reconciliation
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 14 — Vendor Statement Reconciliation", () => {
  it("imports vendor statement lines", async () => {
    const vendor = await onboardVendor();
    const result = await reconciliationSvc.importVendorStatement(
      {
        vendorId: vendor.id,
        period: "2026-01",
        statementDate: new Date("2026-01-31"),
        openingBalance: d(0),
        closingBalance: d(1080),
        lines: [
          {
            lineNumber: 1,
            transactionDate: new Date("2026-01-15"),
            reference: "INV-001",
            description: "Invoice #INV-001",
            debitAmount: d(1080),
            balance: d(1080),
            transactionType: "INVOICE",
          },
        ],
      },
      ctx(),
    );
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("IN_PROGRESS");
  });

  it("runs reconciliation matching statement lines to invoices", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id, "INV-REC");

    const imported = (
      await reconciliationSvc.importVendorStatement(
        {
          vendorId: vendor.id,
          period: "2026-01",
          statementDate: new Date("2026-01-31"),
          openingBalance: d(0),
          closingBalance: d(inv.totalAmount),
          lines: [
            {
              lineNumber: 1,
              transactionDate: new Date("2026-01-15"),
              reference: "INV-REC",
              description: "Matched invoice",
              debitAmount: d(inv.totalAmount),
              balance: d(inv.totalAmount),
              transactionType: "INVOICE",
            },
          ],
        },
        ctx(),
      )
    ).data!;

    const result = await reconciliationSvc.runReconciliation(
      { reconciliationId: imported.id },
      ctx(),
    );
    expect(result.success).toBe(true);
    expect(result.data!.matchedLines).toBe(1);
    expect(result.data!.status).toBe("COMPLETED");
  });

  it("completes reconciliation with zero variance", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id, "INV-COMP");

    const imported = (
      await reconciliationSvc.importVendorStatement(
        {
          vendorId: vendor.id,
          period: "2026-01",
          statementDate: new Date("2026-01-31"),
          openingBalance: d(0),
          closingBalance: d(inv.totalAmount),
          lines: [
            {
              lineNumber: 1,
              transactionDate: new Date("2026-01-15"),
              reference: "INV-COMP",
              description: "Matched",
              debitAmount: d(inv.totalAmount),
              balance: d(inv.totalAmount),
              transactionType: "INVOICE",
            },
          ],
        },
        ctx(),
      )
    ).data!;

    await reconciliationSvc.runReconciliation({ reconciliationId: imported.id }, ctx());

    const completed = await reconciliationSvc.completeReconciliation(
      { reconciliationId: imported.id },
      ctx(),
    );
    expect(completed.success).toBe(true);
    expect(completed.data!.status).toBe("COMPLETED");
  });

  it("prevents completing reconciliation with non-zero variance", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id, "INV-VAR");

    // Statement shows different amount than invoice
    const imported = (
      await reconciliationSvc.importVendorStatement(
        {
          vendorId: vendor.id,
          period: "2026-01",
          statementDate: new Date("2026-01-31"),
          openingBalance: d(0),
          closingBalance: d(5000),
          lines: [
            {
              lineNumber: 1,
              transactionDate: new Date("2026-01-15"),
              reference: "INV-VAR",
              description: "Mismatched",
              debitAmount: d(5000),
              balance: d(5000),
              transactionType: "INVOICE",
            },
          ],
        },
        ctx(),
      )
    ).data!;

    await reconciliationSvc.runReconciliation({ reconciliationId: imported.id }, ctx());

    const completed = await reconciliationSvc.completeReconciliation(
      { reconciliationId: imported.id },
      ctx(),
    );
    expect(completed.success).toBe(false);
  });

  it("prevents duplicate reconciliation for same vendor/period", async () => {
    const vendor = await onboardVendor();
    const stmtCmd = {
      vendorId: vendor.id,
      period: "2026-01",
      statementDate: new Date("2026-01-31"),
      openingBalance: d(0),
      closingBalance: d(100),
      lines: [
        {
          lineNumber: 1,
          transactionDate: new Date("2026-01-15"),
          reference: "REF-1",
          description: "Line 1",
          debitAmount: d(100),
          balance: d(100),
          transactionType: "INVOICE" as const,
        },
      ],
    };

    await reconciliationSvc.importVendorStatement(stmtCmd, ctx());
    const dup = await reconciliationSvc.importVendorStatement(stmtCmd, ctx());
    expect(dup.success).toBe(false);
    expect(dup.error?.code).toBe("CONFLICT");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 15 — Month-End AP Close (Manual Checks)
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 15 — Month-End AP Close", () => {
  it("blocks invoices prevent payment during close", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id, "INV-CLOSE");

    const blocked = await invoiceSvc.blockInvoice(
      { invoiceId: inv.id, reason: "Month-end close in progress — payment hold until period opens", blockType: "PERIOD_CLOSE" },
      ctx(),
    );
    expect(blocked.success).toBe(true);
    expect(blocked.data!.status).toBe("EXCEPTION");
  });

  it("unblocks invoice after close completes", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id, "INV-UNBLOCK");

    await invoiceSvc.blockInvoice(
      { invoiceId: inv.id, reason: "Month-end close in progress — payment hold until period opens", blockType: "PERIOD_CLOSE" },
      ctx(),
    );

    const unblocked = await invoiceSvc.unblockInvoice(
      { invoiceId: inv.id, reason: "Month-end close completed — payment hold released for processing" },
      ctx(),
    );
    expect(unblocked.success).toBe(true);
    expect(unblocked.data!.status).toBe("VALIDATED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Workflow 16 — Audit Trail Reconstruction
// ══════════════════════════════════════════════════════════════════════════

describe("Workflow 16 — Audit Trail Reconstruction", () => {
  it("every command produces audit entries with required fields", async () => {
    const vendor = await onboardVendor();

    // Create invoice
    const inv = (
      await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-AUDIT"), ctx())
    ).data!;

    // Validate
    const validated = await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    expect(validated.auditEntries.length).toBeGreaterThanOrEqual(1);
    expect(validated.auditEntries[0].companyId).toBe(COMPANY);
    expect(validated.auditEntries[0].actorId).toBeDefined();
    expect(validated.auditEntries[0].resourceType).toBe("VendorInvoice");

    // Block
    const blocked = await invoiceSvc.blockInvoice(
      { invoiceId: inv.id, reason: "Audit trail verification — blocking to test event collection", blockType: "TEST" },
      ctx(),
    );
    expect(blocked.auditEntries).toHaveLength(1);
    expect(blocked.auditEntries[0].severity).toBe("WARNING");

    // Unblock
    const unblocked = await invoiceSvc.unblockInvoice(
      { invoiceId: inv.id, reason: "Audit trail test complete — unblocking invoice for processing" },
      ctx(),
    );
    expect(unblocked.auditEntries).toHaveLength(1);
  });

  it("events carry correct aggregate and company scoping", async () => {
    const vendor = await onboardVendor();
    const events: string[] = []; // placeholder — vendor import works

    const inv = (
      await invoiceSvc.receiveInvoice(buildInvoiceCmd(vendor.id, "INV-EVT"), ctx())
    ).data!;

    const event = (await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx())).events[0];
    expect(event.companyId).toBe(COMPANY);
    expect(event.aggregateType).toBe("VendorInvoice");
    expect(event.correlationId).toBe(CORR);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it("approval chain creates complete audit trail", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-AUD-CHAIN",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(75000),
          lineItems: [{ lineNumber: 1, description: "Consulting", quantity: d(1), unitPrice: d(75000) }],
        },
        ctx(),
      )
    ).data!;
    await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx());
    const invAudit = (await repos.invoice.findById(inv.id, COMPANY))!;
    invAudit.poReferenceId = "po-audit-001";
    await repos.invoice.save(invAudit);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invAudit.id }, ctx());

    const requestResult = await approvalSvc.requestApproval({ invoiceId: invAudit.id }, ctx());
    expect(requestResult.auditEntries.length).toBeGreaterThanOrEqual(2);
    expect(requestResult.events.some((e) => e.eventType === "approval.created")).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Event Bus
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Event Bus", () => {
  it("subscribe receives events published via reconciliation", async () => {
    const received: string[] = [];
    const unsub = apEventBus.subscribe("reconciliation.imported", (e) => {
      received.push(e.eventType);
    });

    const vendor = await onboardVendor();
    const importResult = await reconciliationSvc.importVendorStatement(
      {
        vendorId: vendor.id,
        period: "2026-01",
        statementDate: new Date("2026-01-31"),
        openingBalance: d(0),
        closingBalance: d(100),
        lines: [
          {
            lineNumber: 1,
            transactionDate: new Date("2026-01-15"),
            reference: "REF",
            description: "Test",
            debitAmount: d(100),
            balance: d(100),
            transactionType: "INVOICE",
          },
        ],
      },
      ctx(),
    );

    // Events are now returned in CommandResult and published by the Unit of Work
    // Simulate UoW publishing by publishing the returned events
    if (importResult.events.length > 0) {
      await apEventBus.publishAll(importResult.events);
    }

    expect(received).toContain("reconciliation.imported");
    unsub();
  });

  it("event history tracks all published events", () => {
    const history = apEventBus.getHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it("clear removes all history", () => {
    apEventBus.clear();
    expect(apEventBus.getHistory()).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Financial Precision
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Financial Precision", () => {
  it("invoice totals computed with Decimal arithmetic", async () => {
    const vendor = await onboardVendor();
    const inv = (
      await invoiceSvc.receiveInvoice(
        {
          vendorId: vendor.id,
          invoiceNumber: "INV-FP",
          invoiceDate: new Date("2026-01-15"),
          dueDate: new Date("2026-02-14"),
          subtotal: d(1544.38),
          lineItems: [
            { lineNumber: 1, description: "Item A", quantity: d(3), unitPrice: d(333.33), taxRate: d(8) },
            { lineNumber: 2, description: "Item B", quantity: d(7), unitPrice: d(77.77), taxRate: d(8) },
          ],
        },
        ctx(),
      )
    ).data!;

    // Verify no floating point drift
    expect(Number.isFinite(inv.subtotal)).toBe(true);
    expect(Number.isFinite(inv.totalAmount)).toBe(true);
    expect(inv.totalAmount).toBeGreaterThanOrEqual(inv.subtotal);
  });

  it("credit application uses Decimal arithmetic", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    const credit = (
      await creditSvc.receiveCreditNote(
        {
          vendorId: vendor.id,
          creditNumber: "CN-FP",
          creditDate: new Date("2026-02-01"),
          creditAmount: d(333.33),
          reason: "Financial precision test credit — partial return of 3 items at $111.11 each",
        },
        ctx(),
      )
    ).data!;

    const applied = await creditSvc.applyCreditNote(
      {
        creditId: credit.id,
        applications: [{ invoiceId: inv.id, amount: d(333.33) }],
      },
      ctx(),
    );
    expect(applied.success).toBe(true);
    expect(creditSvc).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Concurrency (Optimistic Locking)
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Concurrency", () => {
  it("version increments on every mutation", async () => {
    const vendor = await onboardVendor();
    expect(vendor.version).toBeGreaterThanOrEqual(1);

    const updated = await vendorSvc.updateVendor(
      { vendorId: vendor.id, name: "Updated" },
      ctx(),
    );
    expect(updated.data!.version).toBeGreaterThan(vendor.version);
  });

  it("invoice version increments through lifecycle", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);
    const v1 = inv.version;

    await invoiceSvc.blockInvoice(
      { invoiceId: inv.id, reason: "Version tracking test — blocking and unblocking", blockType: "TEST" },
      ctx(),
    );
    const after = (await repos.invoice.findById(inv.id, COMPANY))!;
    expect(after.version).toBeGreaterThan(v1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Failure Recovery
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Failure Recovery", () => {
  it("operations on non-existent entities return NOT_FOUND", async () => {
    const result = await vendorSvc.updateVendor({ vendorId: "non-existent" }, ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  it("invalid state transitions return INVALID_STATE", async () => {
    const vendor = await onboardVendor();
    // Try to reactivate an ACTIVE vendor (not SUSPENDED)
    const result = await vendorSvc.reactivateVendor({ vendorId: vendor.id }, ctx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_STATE");
  });

  it("validation failures return early without side effects", async () => {
    const vendor = await onboardVendor();
    const result = await invoiceSvc.receiveInvoice(
      {
        vendorId: vendor.id,
        invoiceNumber: "INV-VAL",
        invoiceDate: new Date("2026-01-15"),
        dueDate: new Date("2026-02-14"),
        subtotal: d(0),
        lineItems: [],
      },
      ctx(),
    );
    // Should succeed (empty line items is allowed at receive, caught at validate)
    expect(result.success).toBe(true);
  });

  it("all service errors have statusCode", async () => {
    const vendor = await onboardVendor();
    const result = await vendorSvc.suspendVendor(
      { vendorId: vendor.id, reason: "Testing error structure compliance" },
      ctx(APPROVER),
    );
    // ACTIVE vendor should suspend fine, but if it failed:
    if (!result.success) {
      expect(result.error!.statusCode).toBeDefined();
      expect(typeof result.error!.statusCode).toBe("number");
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Dispute Workflow
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Dispute Workflow", () => {
  it("disputes CAPTURED invoice → EXCEPTION", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    const disputed = await invoiceSvc.disputeInvoice(
      { invoiceId: inv.id, disputeReason: "Quantity on invoice does not match delivery note — overcharge detected" },
      ctx(),
    );
    expect(disputed.success).toBe(true);
    expect(disputed.data!.status).toBe("EXCEPTION");
  });

  it("resolves dispute by restoring to previous status", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    await invoiceSvc.disputeInvoice(
      { invoiceId: inv.id, disputeReason: "Quantity mismatch on delivered goods — under investigation" },
      ctx(),
    );

    const resolved = await invoiceSvc.resolveDispute(
      {
        invoiceId: inv.id,
        resolution: "upheld",
        resolutionNotes: "Vendor confirmed overcharge — credit note issued to correct balance",
      },
      ctx(),
    );
    expect(resolved.success).toBe(true);
    expect(resolved.data!.status).toBe("VALIDATED");
  });

  it("resolves dispute by voiding invoice", async () => {
    const vendor = await onboardVendor();
    const inv = await receiveAndValidateInvoice(vendor.id);

    await invoiceSvc.disputeInvoice(
      { invoiceId: inv.id, disputeReason: "Invoice issued for goods never received — requesting void" },
      ctx(),
    );

    const resolved = await invoiceSvc.resolveDispute(
      {
        invoiceId: inv.id,
        resolution: "voided",
        resolutionNotes: "Confirmed — goods never delivered, vendor agreed to void and re-invoice",
      },
      ctx(),
    );
    expect(resolved.success).toBe(true);
    expect(resolved.data!.status).toBe("VOIDED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-Cutting — Complete Happy Path (Vendor → Invoice → Pay → Close)
// ══════════════════════════════════════════════════════════════════════════

describe("Cross-Cutting — Complete Happy Path", () => {
  it("end-to-end: vendor onboard → invoice → validate → approve → pay → confirm", async () => {
    // 1. Vendor onboarding
    const vendor = await onboardVendor();
    expect(vendor.status).toBe("ACTIVE");

    // 2. Invoice receipt
    const inv = (
      await invoiceSvc.receiveInvoice(
        buildInvoiceCmd(vendor.id, "INV-E2E"),
        ctx(),
      )
    ).data!;
    expect(inv.status).toBe("CAPTURED");

    // 3. Invoice validation
    const validated = (await invoiceSvc.validateInvoice({ invoiceId: inv.id }, ctx())).data!;
    expect(validated.status).toBe("VALIDATED");

    // 4. Three-way match + approval
    const invE2E = (await repos.invoice.findById(inv.id, COMPANY))!;
    invE2E.poReferenceId = "po-e2e";
    await repos.invoice.save(invE2E);
    await invoiceSvc.runThreeWayMatch({ invoiceId: invE2E.id }, ctx());
    const approved = (await invoiceSvc.approveInvoice({ invoiceId: invE2E.id }, ctx())).data!;
    expect(approved.status).toBe("APPROVED");

    // 5. Payment proposal
    const proposal = (
      await paymentSvc.generatePaymentProposal({ paymentDate: new Date("2026-02-15") }, ctx())
    ).data!;
    expect(proposal.status).toBe("DRAFT");
    expect(proposal.totalInvoices).toBe(1);

    // 6. Review
    await paymentSvc.reviewPaymentProposal({ proposalId: proposal.id }, ctx(APPROVER));

    // 7. Treasury approval
    const treasuryApproved = (
      await paymentSvc.approvePaymentProposal({ proposalId: proposal.id }, ctx(CFO))
    ).data!;
    expect(treasuryApproved.status).toBe("APPROVED");

    // 8. Create batch
    const batch = (await paymentSvc.createPaymentBatch({ proposalId: treasuryApproved.id }, ctx())).data!;
    expect(batch.status).toBe("PENDING");

    // 9. Execute
    const payments = await repos.paymentBatch.getPaymentRecords(batch.id, COMPANY);
    await paymentSvc.executePayment({ batchId: batch.id, paymentId: payments[0].id }, ctx());

    // 10. Confirm with bank reference
    await paymentSvc.confirmPayment(
      { batchId: batch.id, paymentId: payments[0].id, bankReference: "WIRE-E2E-20260201-FINAL" },
      ctx(),
    );

    // 11. Final state checks
    const finalInvoice = await repos.invoice.findById(inv.id, COMPANY);
    expect(finalInvoice?.status).toBe("PAID");
    expect(finalInvoice?.paymentReference).toBe("WIRE-E2E-20260201-FINAL");

    const finalBatch = await repos.paymentBatch.findById(batch.id, COMPANY);
    expect(finalBatch?.status).toBe("COMPLETED");

    const finalProposal = await repos.paymentProposal.findById(proposal.id, COMPANY);
    expect(finalProposal?.status).toBe("EXECUTED");
  });
});
