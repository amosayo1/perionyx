// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActionPanel } from "../src/components/invoice-workspace/action-panel";
import type { VendorInvoice } from "../src/server/procurement/ap-repositories/types";

function makeInvoice(overrides?: Partial<VendorInvoice>): VendorInvoice {
  return {
    id: "inv-1",
    companyId: "company-1",
    vendorId: "vendor-1",
    invoiceNumber: "INV-001",
    invoiceDate: "2026-07-01T00:00:00.000Z",
    dueDate: "2026-07-15T00:00:00.000Z",
    receivedDate: "2026-07-01T00:00:00.000Z",
    status: "PENDING_APPROVAL",
    previousStatus: null,
    statusChangedAt: null,
    poReferenceId: null,
    grnReferenceId: null,
    currency: "USD",
    exchangeRate: 1,
    baseCurrency: "USD",
    subtotal: 1000,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    totalAmount: 1000,
    totalWithTax: 1000,
    amountPaid: 0,
    balanceDue: 1000,
    creditApplied: 0,
    netBalance: 1000,
    paymentTerms: null,
    paymentMethod: null,
    glAccountId: null,
    costCenterId: null,
    departmentId: null,
    projectId: null,
    description: null,
    vendorMemo: null,
    internalMemo: null,
    ocrConfidence: 0,
    ocrRawText: null,
    isDuplicateSuspicion: false,
    duplicateConfidence: 0,
    duplicateOfInvoiceId: null,
    matchResult: null,
    varianceAmount: 0,
    varianceThreshold: 5,
    approvalRequired: false,
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
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    createdBy: "test-user",
    updatedBy: "test-user",
    version: 0,
    ...overrides,
  };
}

describe("ActionPanel", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders approve and reject buttons for actionable invoice", () => {
    render(<ActionPanel invoice={makeInvoice()} />);
    expect(screen.getByText("Approve")).toBeDefined();
    expect(screen.getByText("Reject")).toBeDefined();
  });

  it("shows terminal message and no action buttons for paid invoices", () => {
    render(<ActionPanel invoice={makeInvoice({ status: "PAID" })} />);
    expect(screen.getByText(/This invoice is/)).toBeDefined();
    expect(screen.getByText(/PAID/)).toBeDefined();
    expect(screen.queryByText("Approve")).toBeNull();
    expect(screen.queryByText("Reject")).toBeNull();
  });

  it("shows terminal message for approved invoices", () => {
    render(<ActionPanel invoice={makeInvoice({ status: "APPROVED" })} />);
    expect(screen.getByText(/APPROVED/)).toBeDefined();
  });

  it("shows terminal message for rejected invoices", () => {
    render(<ActionPanel invoice={makeInvoice({ status: "REJECTED" })} />);
    expect(screen.getByText(/REJECTED/)).toBeDefined();
  });

  it("shows terminal message for voided invoices", () => {
    render(<ActionPanel invoice={makeInvoice({ status: "VOIDED" })} />);
    expect(screen.getByText(/VOIDED/)).toBeDefined();
  });

  it("shows non-actionable message for non-actionable status", () => {
    render(<ActionPanel invoice={makeInvoice({ status: "MATCH_FAILED" })} />);
    expect(screen.getByText(/Actions are not available/)).toBeDefined();
  });

  it("calls fetch on approve click", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/ap/invoices/inv-1/approve",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });
  });

  it("shows loading state during approval", async () => {
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Approve"));
    expect(await screen.findByText("Approving...")).toBeDefined();
  });

  it("shows error message on failed approval", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: { message: "Insufficient permissions" } }),
    });
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(screen.getByText("Insufficient permissions")).toBeDefined();
    });
  });

  it("shows error message on network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });

  it("disables approve button during loading", async () => {
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Approve"));
    expect(await screen.findByText("Approving...")).toBeDefined();
    const approveBtn = screen.getByText("Approving...").closest("button") as HTMLButtonElement;
    expect(approveBtn.disabled).toBe(true);
  });

  it("opens reject modal on reject click", () => {
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    expect(screen.getByText("Reject Invoice")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter rejection reason...")).toBeDefined();
  });

  it("disables confirm reject button with short reason", () => {
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    const textarea = screen.getByPlaceholderText("Enter rejection reason...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Short" } });
    const confirmBtn = screen.getByText("Confirm Rejection") as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);
  });

  it("enables confirm reject button with sufficient reason", () => {
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    const textarea = screen.getByPlaceholderText("Enter rejection reason...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "This is a valid rejection reason" } });
    const confirmBtn = screen.getByText("Confirm Rejection") as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);
  });

  it("calls fetch with reason on confirm rejection", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    const textarea = screen.getByPlaceholderText("Enter rejection reason...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "This is a valid rejection reason" } });
    fireEvent.click(screen.getByText("Confirm Rejection"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/ap/invoices/inv-1/reject",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reason: "This is a valid rejection reason" }),
        }),
      );
    });
  });

  it("closes reject modal on cancel", () => {
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    expect(screen.getByText("Reject Invoice")).toBeDefined();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Reject Invoice")).toBeNull();
  });

  it("handles API error gracefully during rejection", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: { message: "Internal server error" } }),
    });
    render(<ActionPanel invoice={makeInvoice()} />);
    fireEvent.click(screen.getByText("Reject"));
    const textarea = screen.getByPlaceholderText("Enter rejection reason...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "This is a valid rejection reason" } });
    fireEvent.click(screen.getByText("Confirm Rejection"));
    await waitFor(() => {
      expect(screen.getByText("Internal server error")).toBeDefined();
    });
  });
});
