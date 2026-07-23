import type { TaxPayment, TaxPaymentStatus } from "../../types";

export class TaxPaymentsService {
  private payments = new Map<string, TaxPayment>();

  addPayment(payment: TaxPayment): TaxPayment {
    this.payments.set(payment.id, payment);
    return payment;
  }

  getPayment(id: string): TaxPayment | undefined {
    return this.payments.get(id);
  }

  getAllPayments(): TaxPayment[] {
    return Array.from(this.payments.values());
  }

  getByJurisdiction(jurisdictionId: string): TaxPayment[] {
    return this.getAllPayments().filter(p => p.jurisdictionId === jurisdictionId);
  }

  getByStatus(status: TaxPaymentStatus): TaxPayment[] {
    return this.getAllPayments().filter(p => p.status === status);
  }

  getByType(paymentType: string): TaxPayment[] {
    return this.getAllPayments().filter(p => p.paymentType === paymentType);
  }

  getByDateRange(from: Date, to: Date): TaxPayment[] {
    return this.getAllPayments().filter(p => p.dueDate >= from && p.dueDate <= to);
  }

  getScheduled(): TaxPayment[] {
    return this.getAllPayments().filter(p => p.status === "scheduled");
  }

  getOverdue(): TaxPayment[] {
    const now = new Date();
    return this.getAllPayments().filter(p => (p.status === "scheduled" || p.status === "pending") && p.dueDate < now);
  }

  getRefundable(): TaxPayment[] {
    return this.getAllPayments().filter(p => p.status === "overpaid" || p.paymentType === "refund");
  }

  getTotalPaid(): number {
    return this.getAllPayments()
      .filter(p => p.status === "paid" || p.status === "partial")
      .reduce((sum, p) => sum + p.amount, 0);
  }

  count(): number {
    return this.payments.size;
  }
}
