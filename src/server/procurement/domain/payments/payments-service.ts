import type { Payment, PaymentStatus, PaymentMethod } from "../../types";

export class PaymentService {
  private payments = new Map<string, Payment>();
  private paymentCounter = 0;

  addPayment(payment: Payment): void {
    this.payments.set(payment.id, payment);
  }

  getPayment(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  getAllPayments(): Payment[] {
    return [...this.payments.values()];
  }

  getByStatus(status: PaymentStatus): Payment[] {
    return this.getAllPayments().filter((p) => p.status === status);
  }

  getByMethod(method: PaymentMethod): Payment[] {
    return this.getAllPayments().filter((p) => p.method === method);
  }

  getByVendor(vendorId: string): Payment[] {
    return this.getAllPayments().filter((p) => p.vendorId === vendorId);
  }

  getByCompany(companyId: string): Payment[] {
    return this.getAllPayments().filter((p) => p.companyId === companyId);
  }

  getScheduled(): Payment[] {
    return this.getAllPayments().filter(
      (p) => p.status === "scheduled" || p.status === "pending",
    );
  }

  getPending(): Payment[] {
    return this.getByStatus("pending");
  }

  generatePaymentNumber(): string {
    this.paymentCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `PMT-${ts}-${String(this.paymentCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.payments.size;
  }
}
