import type { Recommendation, Invoice, Dispute } from "../../types";
import type { Customer } from "../../types";
import type { CreditLimit } from "../../types";

export class RecommendationsService {
  private recommendations = new Map<string, Recommendation>();

  add(rec: Recommendation): Recommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  get(id: string): Recommendation | undefined {
    return this.recommendations.get(id);
  }

  getAll(): Recommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: string): Recommendation[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByPriority(priority: string): Recommendation[] {
    return this.getAll().filter((r) => r.priority === priority);
  }

  getByStatus(status: string): Recommendation[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByCustomer(customerId: string): Recommendation[] {
    return this.getAll().filter((r) => r.customerId === customerId);
  }

  getActive(): Recommendation[] {
    return this.getAll().filter((r) => r.status === "active");
  }

  search(query: string): Recommendation[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.recommendations.size;
  }

  update(id: string, updates: Partial<Recommendation>): Recommendation {
    const existing = this.recommendations.get(id);
    if (!existing) throw new Error(`Recommendation ${id} not found`);
    const updated = { ...existing, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.recommendations.delete(id);
  }

  dismiss(id: string): void {
    this.update(id, { status: "dismissed" });
  }

  implement(id: string): void {
    this.update(id, { status: "implemented", implementedAt: new Date() });
  }

  generateCollectionRecommendation(invoice: Invoice, customer: Customer): Recommendation {
    const daysOverdue = invoice.daysOverdue ?? 0;
    const priority = daysOverdue > 90 ? "critical" : daysOverdue > 60 ? "high" : daysOverdue > 30 ? "medium" : "low";
    return {
      id: `rec-collect-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "collection",
      title: `Collect overdue payment from ${customer.name}`,
      description: `Invoice ${invoice.invoiceNumber} for ${invoice.amountDue.toLocaleString()} ${invoice.currency} is ${daysOverdue} days overdue. Recommended action: ${daysOverdue > 90 ? "escalate to legal" : daysOverdue > 60 ? "send final notice" : daysOverdue > 30 ? "send reminder" : "send friendly reminder"}.`,
      priority: priority as "low" | "medium" | "high" | "critical",
      status: "active",
      impact: invoice.amountDue,
      impactCurrency: invoice.currency,
      effort: daysOverdue > 90 ? "high" : daysOverdue > 60 ? "medium" : "low",
      customerId: customer.id,
      customerName: customer.name,
      invoiceId: invoice.id,
      createdAt: new Date(),
      companyId: invoice.companyId,
    };
  }

  generateCollectionRecommendations(invoices: Invoice[], customers: Customer[]): Recommendation[] {
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const recs: Recommendation[] = [];
    for (const inv of invoices) {
      if (inv.status !== "overdue" && inv.status !== "partial") continue;
      const customer = customerMap.get(inv.customerId);
      if (customer) {
        recs.push(this.generateCollectionRecommendation(inv, customer));
      }
    }
    return recs;
  }

  generateCreditRecommendation(customer: Customer, creditLimit: CreditLimit): Recommendation {
    const utilization = creditLimit.creditLimit > 0 ? creditLimit.creditUsed / creditLimit.creditLimit : 0;
    const priority = utilization > 0.9 ? "critical" : utilization > 0.75 ? "high" : utilization > 0.5 ? "medium" : "low";
    return {
      id: `rec-credit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "credit",
      title: `Credit review recommended for ${customer.name}`,
      description: `${customer.name} has ${(utilization * 100).toFixed(0)}% credit utilization (${creditLimit.creditUsed.toLocaleString()}/${creditLimit.creditLimit.toLocaleString()} ${creditLimit.currency}). Risk rating: ${creditLimit.riskRating}.${utilization > 0.9 ? " Immediate review required." : ""}`,
      priority: priority as "low" | "medium" | "high" | "critical",
      status: "active",
      impact: creditLimit.creditLimit - creditLimit.creditUsed,
      impactCurrency: creditLimit.currency,
      effort: "medium",
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date(),
      companyId: customer.companyId,
    };
  }

  generateDisputeRecommendation(dispute: Dispute): Recommendation {
    const daysOpen = Math.floor((Date.now() - dispute.createdAt.getTime()) / 86400000);
    return {
      id: `rec-dispute-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "dispute",
      title: `Resolve dispute ${dispute.disputeNumber}`,
      description: `Dispute from ${dispute.customerName} for ${dispute.amount.toLocaleString()} ${dispute.currency} has been open for ${daysOpen} days. Reason: ${dispute.reason}.`,
      priority: daysOpen > 30 ? "high" : "medium",
      status: "active",
      impact: dispute.amount,
      impactCurrency: dispute.currency,
      effort: "medium",
      customerId: dispute.customerId,
      customerName: dispute.customerName,
      invoiceId: dispute.invoiceId,
      createdAt: new Date(),
      companyId: dispute.companyId,
    };
  }
}
