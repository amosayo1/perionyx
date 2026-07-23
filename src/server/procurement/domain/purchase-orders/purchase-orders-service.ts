import type { PurchaseOrder, POStatus, POType } from "../../types";

export class PurchaseOrderService {
  private orders = new Map<string, PurchaseOrder>();
  private poCounter = 0;

  addPO(po: PurchaseOrder): void {
    this.orders.set(po.id, po);
  }

  getPO(id: string): PurchaseOrder | undefined {
    return this.orders.get(id);
  }

  getAllPOs(): PurchaseOrder[] {
    return [...this.orders.values()];
  }

  getByStatus(status: POStatus): PurchaseOrder[] {
    return this.getAllPOs().filter((po) => po.status === status);
  }

  getByType(type: POType): PurchaseOrder[] {
    return this.getAllPOs().filter((po) => po.type === type);
  }

  getByVendor(vendorId: string): PurchaseOrder[] {
    return this.getAllPOs().filter((po) => po.vendorId === vendorId);
  }

  getByCompany(companyId: string): PurchaseOrder[] {
    return this.getAllPOs().filter((po) => po.companyId === companyId);
  }

  getPending(): PurchaseOrder[] {
    return this.getAllPOs().filter(
      (po) => po.status === "draft" || po.status === "approved" || po.status === "sent",
    );
  }

  getByContract(contractId: string): PurchaseOrder[] {
    return this.getAllPOs().filter((po) => po.contractId === contractId);
  }

  generatePONumber(): string {
    this.poCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `PO-${ts}-${String(this.poCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.orders.size;
  }
}
