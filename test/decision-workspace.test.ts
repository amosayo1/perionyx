/**
 * Phase 22.3 — Decision Workspace: unit tests
 *
 * Validates the two rules that distinguish a Decision Workspace from a
 * details page:
 *   1. Recommendations are deterministic, evidence-derived, and NEVER carry
 *      a fabricated confidence scalar (`ai === null`, bands have a basis).
 *   2. Every evidence item exposes status, confidence band + basis,
 *      timestamp, related records, and "why it matters".
 */

import { describe, it, expect } from "vitest";
import { deriveRecommendation, bandFromScore } from "@/modules/decision-workspace/recommendation";
import { buildEvidencePackage } from "@/modules/decision-workspace/evidence";
import type { WorkspaceEvidenceInput } from "@/modules/decision-workspace/types";
import type { RecommendationInput } from "@/modules/decision-workspace/recommendation";
import type {
  VendorInvoice,
  ThreeWayMatch,
  InvoiceException,
} from "@/server/procurement/ap-repositories/types";

function invoice(overrides: Partial<VendorInvoice> = {}): VendorInvoice {
  return {
    id: "inv_1",
    companyId: "c_1",
    vendorId: "v_1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    receivedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "MATCHED",
    previousStatus: null,
    statusChangedAt: null,
    poReferenceId: "po_1",
    grnReferenceId: "grn_1",
    currency: "USD",
    exchangeRate: 1,
    baseCurrency: "USD",
    subtotal: 1000,
    taxAmount: 100,
    discountAmount: 0,
    shippingAmount: 0,
    totalAmount: 1000,
    totalWithTax: 1100,
    amountPaid: 0,
    balanceDue: 1100,
    creditApplied: 0,
    netBalance: 1100,
    paymentTerms: "NET30",
    paymentMethod: null,
    glAccountId: "gl_1",
    costCenterId: null,
    departmentId: null,
    projectId: null,
    description: null,
    vendorMemo: null,
    internalMemo: null,
    ocrConfidence: 0.9,
    ocrRawText: null,
    isDuplicateSuspicion: false,
    duplicateConfidence: 0,
    duplicateOfInvoiceId: null,
    matchResult: "FULL_MATCH",
    varianceAmount: 0,
    varianceThreshold: 0.05,
    approvalRequired: true,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    paymentBatchId: null,
    paymentProposalId: null,
    paymentDate: null,
    paymentReference: null,
    checkNumber: null,
    accrualPosted: false,
    accrualReversed: false,
    glPosted: false,
    glPostedAt: null,
    periodId: null,
    idempotencyKey: null,
    source: "MANUAL",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "u_1",
    updatedBy: "u_1",
    version: 1,
    ...overrides,
  };
}

function match(overrides: Partial<ThreeWayMatch> = {}): ThreeWayMatch {
  return {
    id: "m_1",
    companyId: "c_1",
    vendorInvoiceId: "inv_1",
    poReferenceId: "po_1",
    grnReferenceId: "grn_1",
    matchResult: "FULL_MATCH",
    overallConfidence: 0.92,
    priceVarianceTotal: 0,
    quantityVarianceTotal: 0,
    totalVariance: 0,
    variancePercent: 0,
    autoApproved: false,
    approvalThreshold: 10000,
    matchedAt: new Date(Date.now() - 86400000).toISOString(),
    matchedBy: "system",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "system",
    updatedBy: "system",
    version: 1,
    ...overrides,
  };
}

function exception(overrides: Partial<InvoiceException> = {}): InvoiceException {
  return {
    id: "e_1",
    companyId: "c_1",
    vendorInvoiceId: "inv_1",
    exceptionType: "GL_CODING_REQUIRED",
    severity: "MEDIUM",
    description: "GL account is missing on line 2",
    varianceAmount: 0,
    relatedEntityId: null,
    status: "OPEN",
    assignedTo: null,
    resolution: null,
    resolvedAt: null,
    resolvedBy: null,
    escalatedTo: null,
    escalatedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    updatedBy: "system",
    version: 1,
    ...overrides,
  };
}

function evidenceInput(overrides: Partial<WorkspaceEvidenceInput> = {}): WorkspaceEvidenceInput {
  return {
    invoice: invoice(),
    vendor: null,
    lineItems: [],
    attachments: [],
    exceptions: [],
    approvals: [],
    match: match(),
    audit: [],
    payments: [],
    openCredits: [],
    recentInvoices: [],
    approvalLevels: [],
    po: null,
    grn: null,
    ...overrides,
  };
}

function recommendationInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  const base = evidenceInput();
  return {
    invoice: base.invoice,
    match: base.match,
    exceptions: base.exceptions,
    hasPo: !!base.po,
    hasGrn: !!base.grn,
    payments: base.payments,
    recentInvoices: base.recentInvoices,
    hasCommunications: !!(base.invoice.vendorMemo || base.invoice.internalMemo),
    attachments: base.attachments,
    policyApplies: base.approvalLevels.length > 0,
    ...overrides,
  };
}

describe("bandFromScore", () => {
  it("maps measured scores to categorical bands", () => {
    expect(bandFromScore(0.92)).toBe("high");
    expect(bandFromScore(0.7)).toBe("medium");
    expect(bandFromScore(0.5)).toBe("low");
    expect(bandFromScore(0.1)).toBe("none");
    expect(bandFromScore(Number.NaN)).toBe("none");
  });
});

describe("deriveRecommendation — no fabricated scalars", () => {
  it("never emits a scalar confidence and reserves ai for DI output", () => {
    const rec = deriveRecommendation({ ...recommendationInput(), match: null });
    expect(["approve", "review", "reject", "no-signal"]).toContain(rec.category);
    expect(rec.ai).toBeNull();
    expect(["high", "medium", "low", "none"]).toContain(rec.confidence);
    expect(rec.basis.length).toBeGreaterThan(0);
    expect(rec.derivedAt).toBeTruthy();
  });
});

describe("deriveRecommendation — decision priority", () => {
  it("approves a clean full match at high confidence", () => {
    const rec = deriveRecommendation(recommendationInput());
    expect(rec.category).toBe("approve");
    expect(rec.confidence).toBe("high");
    expect(rec.suggestedAction).toBe("Approve invoice");
  });

  it("reviews when match confidence is below the approval band", () => {
    const rec = deriveRecommendation(
      recommendationInput({ match: match({ overallConfidence: 0.4 }) }),
    );
    expect(rec.category).toBe("review");
    expect(rec.basis).toContain("0.40");
  });

  it("reviews a partial match", () => {
    const rec = deriveRecommendation(
      recommendationInput({ match: match({ matchResult: "PRICE_VARIANCE", totalVariance: 50, variancePercent: 0.045 }) }),
    );
    expect(rec.category).toBe("review");
  });

  it("reviews when no match exists and discloses the gap", () => {
    const rec = deriveRecommendation(recommendationInput({ match: null }));
    expect(rec.category).toBe("review");
    expect(rec.evidenceGaps).toContain("No three-way match result");
  });

  it("rejects a high-confidence duplicate", () => {
    const rec = deriveRecommendation(
      recommendationInput({ invoice: invoice({ isDuplicateSuspicion: true, duplicateConfidence: 0.9 }) }),
    );
    expect(rec.category).toBe("reject");
    expect(rec.confidence).toBe("high");
  });

  it("reviews on unresolved exceptions before match signals", () => {
    const rec = deriveRecommendation(
      recommendationInput({
        match: match({ overallConfidence: 0.95 }),
        exceptions: [exception()],
      }),
    );
    expect(rec.category).toBe("review");
    expect(rec.riskFactors.length).toBeGreaterThan(0);
  });

  it("emits no-signal for terminal statuses", () => {
    const rec = deriveRecommendation(
      recommendationInput({ invoice: invoice({ status: "PAID" }) }),
    );
    expect(rec.category).toBe("no-signal");
    expect(rec.suggestedAction).toBeNull();
  });
});

describe("buildEvidencePackage — Evidence Package rule", () => {
  it("assembles all 14 groups in order", async () => {
    const groups = await buildEvidencePackage(evidenceInput());
    expect(groups.map((g) => g.id)).toEqual([
      "invoice",
      "line-items",
      "matching",
      "exceptions",
      "duplicate-detection",
      "po",
      "grn",
      "vendor",
      "policy-checks",
      "transaction-history",
      "previous-decisions",
      "similar-cases",
      "communications",
      "supporting-documents",
    ]);
  });

  it("every item carries status, confidence band, basis, and why it matters", async () => {
    const groups = await buildEvidencePackage(evidenceInput());
    const items = groups.flatMap((g) => g.items);
    expect(items.length).toBeGreaterThan(10);
    for (const item of items) {
      expect(item.confidenceBasis.trim().length).toBeGreaterThan(0);
      expect(item.whyItMatters.trim().length).toBeGreaterThan(0);
      expect(["high", "medium", "low", "none"]).toContain(item.confidence);
      expect(["positive", "negative", "neutral", "pending", "action"]).toContain(item.status);
      expect(item.groupId).toBeTruthy();
    }
  });

  it("matching confidence band derives from the measured overallConfidence", async () => {
    const groups = await buildEvidencePackage(evidenceInput());
    const matching = groups.find((g) => g.id === "matching")!;
    const result = matching.items.find((i) => i.id === "match.result")!;
    expect(result.confidence).toBe("high");
    expect(result.confidenceBasis).toContain("0.92");
  });

  it("discloses absent PO/GRN as negative or pending, never silence", async () => {
    const groups = await buildEvidencePackage(evidenceInput());
    const po = groups.find((g) => g.id === "po")!;
    const grn = groups.find((g) => g.id === "grn")!;
    expect(po.items[0].id).toBe("po.none");
    expect(po.items[0].status).toBe("negative");
    expect(po.items[0].whyItMatters.length).toBeGreaterThan(0);
    expect(grn.items[0].id).toBe("grn.none");
    expect(grn.items[0].status).toBe("negative");
  });

  it("shows why a supplier without a record is a blocker", async () => {
    const groups = await buildEvidencePackage(evidenceInput());
    const vendor = groups.find((g) => g.id === "vendor")!;
    expect(vendor.items[0].id).toBe("vendor.missing");
    expect(vendor.items[0].status).toBe("negative");
  });
});
