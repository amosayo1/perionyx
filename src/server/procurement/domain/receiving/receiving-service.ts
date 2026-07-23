import type { Receipt, ReceiptStatus, ReceiptType } from "../../types";

export class ReceivingService {
  private receipts = new Map<string, Receipt>();
  private receiptCounter = 0;

  addReceipt(receipt: Receipt): void {
    this.receipts.set(receipt.id, receipt);
  }

  getReceipt(id: string): Receipt | undefined {
    return this.receipts.get(id);
  }

  getAllReceipts(): Receipt[] {
    return [...this.receipts.values()];
  }

  getByPO(poId: string): Receipt[] {
    return this.getAllReceipts().filter((r) => r.poId === poId);
  }

  getByVendor(vendorId: string): Receipt[] {
    return this.getAllReceipts().filter((r) => r.vendorId === vendorId);
  }

  getByStatus(status: ReceiptStatus): Receipt[] {
    return this.getAllReceipts().filter((r) => r.status === status);
  }

  getByType(type: ReceiptType): Receipt[] {
    return this.getAllReceipts().filter((r) => r.type === type);
  }

  getPending(): Receipt[] {
    return this.getAllReceipts().filter((r) => r.status === "pending" || r.status === "partial");
  }

  generateReceiptNumber(): string {
    this.receiptCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `RCPT-${ts}-${String(this.receiptCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.receipts.size;
  }
}
