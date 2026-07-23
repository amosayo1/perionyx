import type { Invoice, InvoiceStatus, MatchStatus, MatchType, InvoiceItem, MatchResult } from "../../types";

export class InvoiceMatchingService {
  private invoices = new Map<string, Invoice>();
  private matchResults = new Map<string, MatchResult>();
  private invoiceCounter = 0;

  addInvoice(invoice: Invoice): void {
    this.invoices.set(invoice.id, invoice);
  }

  getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  getAllInvoices(): Invoice[] {
    return [...this.invoices.values()];
  }

  getByStatus(status: InvoiceStatus): Invoice[] {
    return this.getAllInvoices().filter((inv) => inv.status === status);
  }

  getByVendor(vendorId: string): Invoice[] {
    return this.getAllInvoices().filter((inv) => inv.vendorId === vendorId);
  }

  getByPO(poId: string): Invoice[] {
    return this.getAllInvoices().filter((inv) => inv.poId === poId);
  }

  getByCompany(companyId: string): Invoice[] {
    return this.getAllInvoices().filter((inv) => inv.companyId === companyId);
  }

  getByMatchStatus(status: MatchStatus): Invoice[] {
    return this.getAllInvoices().filter((inv) => inv.matchStatus === status);
  }

  getExceptions(): Invoice[] {
    return this.getByMatchStatus("exception");
  }

  addMatchResult(result: MatchResult): void {
    this.matchResults.set(result.id, result);
  }

  getMatchResult(id: string): MatchResult | undefined {
    return this.matchResults.get(id);
  }

  getMatchResults(invoiceId: string): MatchResult[] {
    return [...this.matchResults.values()].filter((m) => m.invoiceId === invoiceId);
  }

  perform2WayMatch(invoiceItem: InvoiceItem, poItem: { quantity: number; unitPrice: number }): MatchResult {
    const quantityMatch = Math.abs(invoiceItem.quantity - poItem.quantity) <= 0.01;
    const priceMatch = Math.abs(invoiceItem.unitPrice - poItem.unitPrice) <= 0.01;
    const quantityVariance = invoiceItem.quantity - poItem.quantity;
    const priceVariance = invoiceItem.unitPrice - poItem.unitPrice;
    const allMatch = quantityMatch && priceMatch;

    const result: MatchResult = {
      id: `match_${invoiceItem.id}_${Date.now()}`,
      invoiceId: invoiceItem.invoiceId,
      invoiceItemId: invoiceItem.id,
      poItemId: invoiceItem.poItemId || "",
      matchType: "2-way",
      status: allMatch ? "matched" : "exception",
      quantityMatch,
      priceMatch,
      quantityTolerance: 0.01,
      priceTolerance: 0.01,
      quantityVariance,
      priceVariance,
      discrepancyNotes: allMatch ? undefined : `Qty var: ${quantityVariance}, Price var: ${priceVariance}`,
      createdAt: new Date(),
    };

    this.matchResults.set(result.id, result);
    return result;
  }

  perform3WayMatch(
    invoiceItem: InvoiceItem,
    poItem: { quantity: number; unitPrice: number },
    receiptItem: { quantityAccepted: number },
  ): MatchResult {
    const quantityMatch = Math.abs(invoiceItem.quantity - receiptItem.quantityAccepted) <= 0.01;
    const priceMatch = Math.abs(invoiceItem.unitPrice - poItem.unitPrice) <= 0.01;
    const quantityVariance = invoiceItem.quantity - receiptItem.quantityAccepted;
    const priceVariance = invoiceItem.unitPrice - poItem.unitPrice;
    const allMatch = quantityMatch && priceMatch;

    const result: MatchResult = {
      id: `match_${invoiceItem.id}_${Date.now()}`,
      invoiceId: invoiceItem.invoiceId,
      invoiceItemId: invoiceItem.id,
      poItemId: invoiceItem.poItemId || "",
      receiptItemId: invoiceItem.receiptItemId,
      matchType: "3-way",
      status: allMatch ? "matched" : "exception",
      quantityMatch,
      priceMatch,
      quantityTolerance: 0.01,
      priceTolerance: 0.01,
      quantityVariance,
      priceVariance,
      discrepancyNotes: allMatch ? undefined : `Qty var: ${quantityVariance}, Price var: ${priceVariance}`,
      createdAt: new Date(),
    };

    this.matchResults.set(result.id, result);
    return result;
  }

  generateInvoiceNumber(): string {
    this.invoiceCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `INV-${ts}-${String(this.invoiceCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.invoices.size;
  }
}
