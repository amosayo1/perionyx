import type { Invoice, InvoiceStatus, ARStatus, BillingType } from "../../types";

export class BillingService {
  private invoices = new Map<string, Invoice>();

  addInvoice(invoice: Invoice): Invoice {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  getAllInvoices(): Invoice[] {
    return Array.from(this.invoices.values());
  }

  getByStatus(status: InvoiceStatus): Invoice[] {
    return this.getAllInvoices().filter(i => i.status === status);
  }

  getByCustomer(customerId: string): Invoice[] {
    return this.getAllInvoices().filter(i => i.customerId === customerId);
  }

  getByCompany(companyId: string): Invoice[] {
    return this.getAllInvoices().filter(i => i.companyId === companyId);
  }

  getByType(type: string): Invoice[] {
    return this.getAllInvoices().filter(i => i.type === type);
  }

  getByBillingType(billingType: BillingType): Invoice[] {
    return this.getAllInvoices().filter(i => i.billingType === billingType);
  }

  getOverdue(): Invoice[] {
    return this.getAllInvoices().filter(i => i.arStatus === "overdue" || i.arStatus === "open");
  }

  getByARStatus(arStatus: ARStatus): Invoice[] {
    return this.getAllInvoices().filter(i => i.arStatus === arStatus);
  }

  count(): number {
    return this.invoices.size;
  }
}
