import type { CashReceipt, CashApplication, CashApplicationStatus, CashApplicationMethod } from "../../types";

export class CashApplicationService {
  private receipts = new Map<string, CashReceipt>();
  private applications = new Map<string, CashApplication>();

  addReceipt(receipt: CashReceipt): CashReceipt {
    this.receipts.set(receipt.id, receipt);
    return receipt;
  }

  getReceipt(id: string): CashReceipt | undefined {
    return this.receipts.get(id);
  }

  getAllReceipts(): CashReceipt[] {
    return Array.from(this.receipts.values());
  }

  getByStatus(status: CashApplicationStatus): CashReceipt[] {
    return this.getAllReceipts().filter(r => r.status === status);
  }

  getByMethod(method: CashApplicationMethod): CashReceipt[] {
    return this.getAllReceipts().filter(r => r.applicationMethod === method);
  }

  getByCustomer(customerId: string): CashReceipt[] {
    return this.getAllReceipts().filter(r => r.customerId === customerId);
  }

  getUnapplied(): CashReceipt[] {
    return this.getAllReceipts().filter(r => r.unappliedAmount > 0);
  }

  addApplication(app: CashApplication): CashApplication {
    this.applications.set(app.id, app);
    return app;
  }

  getApplication(id: string): CashApplication | undefined {
    return this.applications.get(id);
  }

  getApplications(receiptId: string): CashApplication[] {
    return Array.from(this.applications.values()).filter(a => a.receiptId === receiptId);
  }

  count(): number {
    return this.receipts.size;
  }
}
