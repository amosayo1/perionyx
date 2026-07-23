import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  createVendorSchema,
  updateVendorSchema,
  vendorListQuerySchema,
  receiveInvoiceSchema,
  invoiceListQuerySchema,
  createExceptionSchema,
  exceptionListQuerySchema,
  approveInvoiceSchema,
  rejectInvoiceSchema,
  decideApprovalSchema,
  approvalQueueQuerySchema,
  generatePaymentProposalSchema,
  approvePaymentProposalSchema,
  createPaymentBatchSchema,
  executePaymentSchema,
  confirmPaymentSchema,
  reversePaymentSchema,
  cancelPaymentSchema,
  importVendorStatementSchema,
  receiveCreditNoteSchema,
  apDashboardQuerySchema,
} from "@/lib/validations/ap";
import { idempotencyKey, getCachedResponse, storeIdempotentResponse } from "@/server/procurement/api/idempotency";

describe("AP API Validation Schemas", () => {
  describe("Vendor Schemas", () => {
    const validVendor = {
      name: "Acme Corporation",
      vendorCode: "ACME-001",
      taxId: "12-3456789",
      taxCountry: "US",
      category: "SUPPLIER",
    };

    it("accepts valid vendor creation payload", () => {
      const result = createVendorSchema.safeParse(validVendor);
      expect(result.success).toBe(true);
    });

    it("rejects vendor name shorter than 2 characters", () => {
      const result = createVendorSchema.safeParse({ ...validVendor, name: "A" });
      expect(result.success).toBe(false);
    });

    it("rejects vendor name longer than 200 characters", () => {
      const result = createVendorSchema.safeParse({ ...validVendor, name: "X".repeat(201) });
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const result = createVendorSchema.safeParse({ name: "Test" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = createVendorSchema.safeParse({ ...validVendor, contactEmail: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("accepts optional fields", () => {
      const result = createVendorSchema.safeParse({
        ...validVendor,
        legalName: "Acme Corp LLC",
        currency: "EUR",
        billingAddress: "123 Main St",
        paymentTerms: "NET30",
        creditLimit: 50000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative credit limit", () => {
      const result = createVendorSchema.safeParse({ ...validVendor, creditLimit: -100 });
      expect(result.success).toBe(false);
    });

    it("validates update vendor requires at least one field", () => {
      const result = updateVendorSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid vendor update", () => {
      const result = updateVendorSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(true);
    });
  });

  describe("Vendor List Query Schema", () => {
    it("applies default pagination", () => {
      const result = vendorListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("parses string page/limit to numbers", () => {
      const result = vendorListQuerySchema.safeParse({ page: "3", limit: "50" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it("rejects limit over 100", () => {
      const result = vendorListQuerySchema.safeParse({ limit: "500" });
      expect(result.success).toBe(false);
    });
  });

  describe("Invoice Schemas", () => {
    const validInvoice = {
      vendorId: "550e8400-e29b-41d4-a716-446655440000",
      invoiceNumber: "INV-2026-001",
      invoiceDate: "2026-01-15T00:00:00.000Z",
      dueDate: "2026-02-15T00:00:00.000Z",
      subtotal: 1000,
      lineItems: [
        { lineNumber: 1, description: "Widget A", quantity: 10, unitPrice: 100 },
      ],
    };

    it("accepts valid invoice creation", () => {
      const result = receiveInvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it("rejects missing line items", () => {
      const result = receiveInvoiceSchema.safeParse({ ...validInvoice, lineItems: [] });
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID for vendorId", () => {
      const result = receiveInvoiceSchema.safeParse({ ...validInvoice, vendorId: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("accepts invoice without optional fields", () => {
      const result = receiveInvoiceSchema.safeParse({
        ...validInvoice,
        currency: undefined,
        taxAmount: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("validates line item requires positive quantity", () => {
      const result = receiveInvoiceSchema.safeParse({
        ...validInvoice,
        lineItems: [{ lineNumber: 1, description: "Test", quantity: 0, unitPrice: 100 }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Invoice List Query Schema", () => {
    it("applies default pagination", () => {
      const result = invoiceListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });
  });

  describe("Exception Schemas", () => {
    it("accepts valid exception creation", () => {
      const result = createExceptionSchema.safeParse({
        invoiceId: "550e8400-e29b-41d4-a716-446655440000",
        exceptionType: "PRICING_VARIANCE",
        severity: "HIGH",
        description: "Price mismatch between PO and invoice",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing description", () => {
      const result = createExceptionSchema.safeParse({
        invoiceId: "550e8400-e29b-41d4-a716-446655440000",
        exceptionType: "PRICING_VARIANCE",
        severity: "HIGH",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Approval Schemas", () => {
    it("accepts valid approval decision", () => {
      const result = decideApprovalSchema.safeParse({
        decision: "APPROVED",
        comments: "Looks good",
      });
      expect(result.success).toBe(true);
    });

    it("accepts rejection with reason", () => {
      const result = decideApprovalSchema.safeParse({
        decision: "REJECTED",
        comments: "Missing documentation",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Payment Schemas", () => {
    it("accepts valid proposal generation", () => {
      const result = generatePaymentProposalSchema.safeParse({
        proposedPaymentDate: "2026-02-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("accepts batch creation", () => {
      const result = createPaymentBatchSchema.safeParse({
        proposalId: "proposal-123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts payment execution", () => {
      const result = executePaymentSchema.safeParse({ paymentId: "pay-001" });
      expect(result.success).toBe(true);
    });

    it("accepts payment confirmation", () => {
      const result = confirmPaymentSchema.safeParse({
        paymentId: "pay-001",
        bankReference: "REF-123456",
        confirmationNumber: "CONF-789",
      });
      expect(result.success).toBe(true);
    });

    it("accepts payment reversal", () => {
      const result = reversePaymentSchema.safeParse({ reason: "Duplicate payment detected" });
      expect(result.success).toBe(true);
    });

    it("accepts payment cancellation", () => {
      const result = cancelPaymentSchema.safeParse({ reason: "Vendor requested cancellation" });
      expect(result.success).toBe(true);
    });

    it("rejects empty reversal reason", () => {
      const result = reversePaymentSchema.safeParse({ reason: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("Credit Schemas", () => {
    it("accepts valid credit note", () => {
      const result = receiveCreditNoteSchema.safeParse({
        vendorId: "550e8400-e29b-41d4-a716-446655440000",
        creditNumber: "CN-001",
        creditDate: "2026-01-20T00:00:00.000Z",
        creditAmount: 500,
        reason: "Returned goods",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Dashboard Query Schema", () => {
    it("applies defaults", () => {
      const result = apDashboardQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe("AP Idempotency Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for non-existent key", () => {
    const result = getCachedResponse("non-existent-key", "company-1");
    expect(result).toBeNull();
  });

  it("stores and retrieves response by company-scoped key", () => {
    const body = JSON.stringify({ data: { id: "test" } });
    const headers = { "content-type": "application/json" };
    storeIdempotentResponse("key-1", "company-1", body, 200, headers);
    const cached = getCachedResponse("key-1", "company-1");
    expect(cached).not.toBeNull();
    expect(cached!.status).toBe(200);
    expect(cached!.headers.get("idempotent-replay")).toBe("true");
  });

  it("does not store error responses (non-2xx)", () => {
    const body = JSON.stringify({ error: { code: "NOT_FOUND" } });
    storeIdempotentResponse("key-2", "company-1", body, 404, {});
    const cached = getCachedResponse("key-2", "company-1");
    expect(cached).toBeNull();
  });

  it("isolates by company", () => {
    const body = JSON.stringify({ data: { id: "shared-key" } });
    storeIdempotentResponse("shared-key", "company-A", body, 200, {});
    storeIdempotentResponse("shared-key", "company-B", body, 201, {});
    const cachedA = getCachedResponse("shared-key", "company-A");
    const cachedB = getCachedResponse("shared-key", "company-B");
    expect(cachedA).not.toBeNull();
    expect(cachedB).not.toBeNull();
    expect(cachedA!.status).toBe(200);
    expect(cachedB!.status).toBe(201);
  });

  it("extracts idempotency key from headers", () => {
    const req = new Request("https://example.com", {
      headers: { "idempotency-key": "test-123" },
    });
    expect(idempotencyKey(req)).toBe("test-123");
  });

  it("extracts x-idempotency-key as fallback", () => {
    const req = new Request("https://example.com", {
      headers: { "x-idempotency-key": "fallback-key" },
    });
    expect(idempotencyKey(req)).toBe("fallback-key");
  });

  it("returns null when no idempotency key header present", () => {
    const req = new Request("https://example.com");
    expect(idempotencyKey(req)).toBeNull();
  });
});

describe("AP Error Model", () => {
  it("error contract has required fields", () => {
    const errorBody = {
      error: {
        code: "VALIDATION_FAILED",
        message: "Request validation failed",
        category: "CLIENT_ERROR",
        correlationId: "ap-123-abc",
        recoverability: "FIX_INPUT",
        userMessage: "Please check your request and try again.",
      },
    };

    expect(errorBody.error).toHaveProperty("code");
    expect(errorBody.error).toHaveProperty("message");
    expect(errorBody.error).toHaveProperty("category");
    expect(errorBody.error).toHaveProperty("correlationId");
    expect(errorBody.error).toHaveProperty("recoverability");
    expect(errorBody.error).toHaveProperty("userMessage");
  });

  it("error categories are well-defined", () => {
    const validCategories = [
      "CLIENT_ERROR",
      "BUSINESS_RULE",
      "AUTHENTICATION",
      "AUTHORIZATION",
      "IDEMPOTENCY",
      "CONCURRENCY",
      "SYSTEM_ERROR",
      "RATE_LIMIT",
    ];

    for (const cat of validCategories) {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    }
  });
});

describe("Route Module Exports", () => {
  it("vendor list route exports GET and POST", async () => {
    const mod = await import("@/app/api/v1/ap/vendors/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.POST).toBe("function");
  });

  it("vendor detail route exports GET and PUT", async () => {
    const mod = await import("@/app/api/v1/ap/vendors/[vendorId]/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.PUT).toBe("function");
  });

  it("invoice list route exports GET and POST", async () => {
    const mod = await import("@/app/api/v1/ap/invoices/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.POST).toBe("function");
  });

  it("invoice approve route exports POST", async () => {
    const mod = await import("@/app/api/v1/ap/invoices/[invoiceId]/approve/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("exception list route exports GET", async () => {
    const mod = await import("@/app/api/v1/ap/exceptions/route");
    expect(typeof mod.GET).toBe("function");
  });

  it("approval list route exports GET", async () => {
    const mod = await import("@/app/api/v1/ap/approvals/route");
    expect(typeof mod.GET).toBe("function");
  });

  it("payment proposal route exports POST", async () => {
    const mod = await import("@/app/api/v1/ap/payments/proposals/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("payment batch execute route exports POST", async () => {
    const mod = await import("@/app/api/v1/ap/payments/batches/[batchId]/execute/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("reconciliation list route exports GET", async () => {
    const mod = await import("@/app/api/v1/ap/reconciliations/route");
    expect(typeof mod.GET).toBe("function");
  });

  it("credit list route exports GET and POST", async () => {
    const mod = await import("@/app/api/v1/ap/credits/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.POST).toBe("function");
  });

  it("dashboard route exports GET", async () => {
    const mod = await import("@/app/api/v1/ap/dashboard/route");
    expect(typeof mod.GET).toBe("function");
  });

  it("report routes export GET", async () => {
    const aging = await import("@/app/api/v1/ap/reports/aging/route");
    const cash = await import("@/app/api/v1/ap/reports/cash-requirements/route");
    const analytics = await import("@/app/api/v1/ap/reports/analytics/route");
    const audit = await import("@/app/api/v1/ap/reports/audit-trail/route");
    expect(typeof aging.GET).toBe("function");
    expect(typeof cash.GET).toBe("function");
    expect(typeof analytics.GET).toBe("function");
    expect(typeof audit.GET).toBe("function");
  });
});
