import type { CustomerStatement, StatementLine, AgingSummary, AgingBucket, Address } from "../../types";

function calculateAging(lines: StatementLine[], asOf: Date): AgingSummary {
  const buckets: AgingBucket[] = [
    { bucket: "current", amount: 0, count: 0, percentage: 0 },
    { bucket: "1to30", amount: 0, count: 0, percentage: 0 },
    { bucket: "31to60", amount: 0, count: 0, percentage: 0 },
    { bucket: "61to90", amount: 0, count: 0, percentage: 0 },
    { bucket: "91plus", amount: 0, count: 0, percentage: 0 },
  ];

  for (const line of lines) {
    const overdue = Math.floor((asOf.getTime() - line.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const outstanding = line.outstanding;
    if (outstanding <= 0) continue;

    if (overdue <= 0) {
      buckets[0].amount += outstanding;
      buckets[0].count++;
    } else if (overdue <= 30) {
      buckets[1].amount += outstanding;
      buckets[1].count++;
    } else if (overdue <= 60) {
      buckets[2].amount += outstanding;
      buckets[2].count++;
    } else if (overdue <= 90) {
      buckets[3].amount += outstanding;
      buckets[3].count++;
    } else {
      buckets[4].amount += outstanding;
      buckets[4].count++;
    }
  }

  const totalOverdue = buckets.slice(1).reduce((s, b) => s + b.amount, 0);
  const total = buckets.reduce((s, b) => s + b.amount, 0);

  for (const bucket of buckets) {
    bucket.percentage = total > 0 ? (bucket.amount / total) * 100 : 0;
  }

  return {
    current: buckets[0].amount,
    days1to30: buckets[1].amount,
    days31to60: buckets[2].amount,
    days61to90: buckets[3].amount,
    days91plus: buckets[4].amount,
    total,
    totalOverdue,
    overduePercentage: total > 0 ? (totalOverdue / total) * 100 : 0,
    buckets,
  };
}

export class StatementsService {
  private store = new Map<string, CustomerStatement>();

  add(entity: CustomerStatement): CustomerStatement {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): CustomerStatement | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): CustomerStatement | undefined {
    return Array.from(this.store.values()).find(s => s.statementNumber === number);
  }

  getAll(): CustomerStatement[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): CustomerStatement[] {
    return Array.from(this.store.values()).filter(s => s.customerId === customerId);
  }

  getByStatus(status: CustomerStatement["status"]): CustomerStatement[] {
    return Array.from(this.store.values()).filter(s => s.status === status);
  }

  getByDateRange(start: Date, end: Date): CustomerStatement[] {
    return Array.from(this.store.values()).filter(
      s => s.statementDate >= start && s.statementDate <= end
    );
  }

  search(query: string): CustomerStatement[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(s =>
      s.statementNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.customerId.toLowerCase().includes(q) ||
      s.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<CustomerStatement>): CustomerStatement {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Statement ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  generateStatement(
    customerId: string,
    statementDate: Date,
    invoices: { invoiceNumber: string; invoiceDate: Date; dueDate: Date; originalAmount: number; payments: number; adjustments: number; outstanding: number }[],
    receipts: { amount: number }[],
    adjustments: { amount: number }[]
  ): CustomerStatement {
    const lines: StatementLine[] = invoices.map(inv => {
      const overdue = Math.floor((statementDate.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      let agingBucket: string;
      if (overdue <= 0) agingBucket = "current";
      else if (overdue <= 30) agingBucket = "1to30";
      else if (overdue <= 60) agingBucket = "31to60";
      else if (overdue <= 90) agingBucket = "61to90";
      else agingBucket = "91plus";

      return {
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        originalAmount: inv.originalAmount,
        payments: inv.payments,
        adjustments: inv.adjustments,
        outstanding: inv.outstanding,
        daysOverdue: Math.max(0, overdue),
        agingBucket,
      };
    });

    const beginningBalance = 0;
    const invoiceTotal = invoices.reduce((s, i) => s + i.originalAmount, 0);
    const paymentTotal = receipts.reduce((s, r) => s + r.amount, 0);
    const adjustmentTotal = adjustments.reduce((s, a) => s + a.amount, 0);
    const endingBalance = beginningBalance + invoiceTotal - paymentTotal + adjustmentTotal;

    const agingSummary = calculateAging(lines, statementDate);

    const dueDate = new Date(statementDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const statement: CustomerStatement = {
      id: crypto.randomUUID(),
      statementNumber: `STM-${statementDate.getFullYear()}-${String(statementDate.getMonth() + 1).padStart(2, "0")}-${String(this.count() + 1).padStart(4, "0")}`,
      customerId,
      customerName: "",
      billingAddress: {} as Address,
      currency: "USD",
      statementDate,
      dueDate,
      status: "generated",
      beginningBalance,
      invoiceTotal,
      paymentTotal,
      adjustmentTotal,
      endingBalance,
      lines,
      agingSummary,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.store.set(statement.id, statement);
    return statement;
  }

  sendStatement(id: string): CustomerStatement {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Statement ${id} not found`);
    const updated = { ...existing, status: "sent" as const, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }
}
