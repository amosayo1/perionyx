import type { PurchaseRequest, PRStatus } from "../../types";

export class PurchaseRequestService {
  private requests = new Map<string, PurchaseRequest>();
  private prCounter = 0;

  addPR(pr: PurchaseRequest): void {
    this.requests.set(pr.id, pr);
  }

  getPR(id: string): PurchaseRequest | undefined {
    return this.requests.get(id);
  }

  getAllPRs(): PurchaseRequest[] {
    return [...this.requests.values()];
  }

  getByStatus(status: PRStatus): PurchaseRequest[] {
    return this.getAllPRs().filter((pr) => pr.status === status);
  }

  getByDepartment(department: string): PurchaseRequest[] {
    return this.getAllPRs().filter((pr) => pr.department === department);
  }

  getByRequester(requester: string): PurchaseRequest[] {
    return this.getAllPRs().filter((pr) => pr.requestedBy === requester);
  }

  getByCompany(companyId: string): PurchaseRequest[] {
    return this.getAllPRs().filter((pr) => pr.companyId === companyId);
  }

  getPending(): PurchaseRequest[] {
    return this.getAllPRs().filter((pr) => pr.status === "draft" || pr.status === "submitted");
  }

  convertToPO(prId: string, poId: string): void {
    const pr = this.requests.get(prId);
    if (pr) {
      pr.status = "converted";
      pr.convertedToPOId = poId;
      pr.updatedAt = new Date();
    }
  }

  generatePRNumber(): string {
    this.prCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `PR-${ts}-${String(this.prCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.requests.size;
  }
}
