import type { Quotation, QuotationStatus } from "../../types";

export class QuotationService {
  private quotations = new Map<string, Quotation>();

  addQuotation(quotation: Quotation): Quotation {
    this.quotations.set(quotation.id, quotation);
    return quotation;
  }

  getQuotation(id: string): Quotation | undefined {
    return this.quotations.get(id);
  }

  getAllQuotations(): Quotation[] {
    return Array.from(this.quotations.values());
  }

  getByStatus(status: QuotationStatus): Quotation[] {
    return this.getAllQuotations().filter(q => q.status === status);
  }

  getByCustomer(customerId: string): Quotation[] {
    return this.getAllQuotations().filter(q => q.customerId === customerId);
  }

  getExpired(): Quotation[] {
    return this.getAllQuotations().filter(q => q.status === "expired");
  }

  count(): number {
    return this.quotations.size;
  }
}
