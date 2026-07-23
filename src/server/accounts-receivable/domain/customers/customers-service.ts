import type { Customer, CustomerContact, CustomerStatus, RiskRating, CustomerType, CurrencyCode } from "../../types";

export class CustomersService {
  private customers = new Map<string, Customer>();

  add(customer: Customer): Customer {
    this.customers.set(customer.id, customer);
    return customer;
  }

  get(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  getByNumber(customerNumber: string): Customer | undefined {
    return this.getAll().find((c) => c.customerNumber === customerNumber);
  }

  getAll(): Customer[] {
    return Array.from(this.customers.values());
  }

  getByStatus(status: CustomerStatus): Customer[] {
    return this.getAll().filter((c) => c.status === status);
  }

  getByType(type: CustomerType): Customer[] {
    return this.getAll().filter((c) => c.type === type);
  }

  getByRiskRating(rating: RiskRating): Customer[] {
    return this.getAll().filter((c) => c.riskRating === rating);
  }

  getByCurrency(currency: CurrencyCode): Customer[] {
    return this.getAll().filter((c) => c.currency === currency);
  }

  getHighRisk(): Customer[] {
    return this.getAll().filter((c) => c.riskRating === "high" || c.riskRating === "critical");
  }

  search(query: string): Customer[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.customerNumber.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.taxId?.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.customers.size;
  }

  update(id: string, updates: Partial<Customer>): Customer {
    const existing = this.customers.get(id);
    if (!existing) throw new Error(`Customer ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.customers.delete(id);
  }

  getTotalCustomers(): number {
    return this.customers.size;
  }

  getTotalOutstanding(): number {
    return this.getAll().reduce((sum, c) => sum + c.totalOutstanding, 0);
  }

  getTotalOverdue(): number {
    return this.getAll().reduce((sum, c) => sum + c.totalOverdue, 0);
  }

  getAverageDSO(): number {
    const customers = this.getAll();
    if (customers.length === 0) return 0;
    return customers.reduce((sum, c) => sum + c.dso, 0) / customers.length;
  }
}
