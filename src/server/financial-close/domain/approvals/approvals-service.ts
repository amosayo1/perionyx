import type { ApprovalRecord, ApprovalEntityType, ApprovalStatus } from "../../types";

export class ApprovalsService {
  private approvals = new Map<string, ApprovalRecord>();

  add(approval: ApprovalRecord): ApprovalRecord {
    this.approvals.set(approval.id, approval);
    return approval;
  }

  get(id: string): ApprovalRecord | undefined {
    return this.approvals.get(id);
  }

  getAll(): ApprovalRecord[] {
    return Array.from(this.approvals.values());
  }

  getByPeriod(periodId: string): ApprovalRecord[] {
    return this.getAll().filter((a) => a.periodId === periodId);
  }

  getByStatus(status: ApprovalStatus): ApprovalRecord[] {
    return this.getAll().filter((a) => a.status === status);
  }

  getByEntityType(type: ApprovalEntityType): ApprovalRecord[] {
    return this.getAll().filter((a) => a.entityType === type);
  }

  getPending(): ApprovalRecord[] {
    return this.getAll().filter((a) => a.status === "pending");
  }

  getByRequestor(requestor: string): ApprovalRecord[] {
    return this.getAll().filter((a) => a.requestedBy === requestor);
  }

  search(query: string): ApprovalRecord[] {
    const q = query.toLowerCase();
    return this.getAll().filter((a) => a.entityDescription.toLowerCase().includes(q));
  }

  count(): number {
    return this.approvals.size;
  }

  update(id: string, updates: Partial<ApprovalRecord>): ApprovalRecord {
    const existing = this.approvals.get(id);
    if (!existing) throw new Error(`Approval ${id} not found`);
    const updated = { ...existing, ...updates };
    this.approvals.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.approvals.delete(id);
  }

  approve(id: string, approvedBy: string, comments?: string): ApprovalRecord {
    return this.update(id, { status: "approved", approvedBy, approvedAt: new Date(), comments });
  }

  reject(id: string, approvedBy: string, comments?: string): ApprovalRecord {
    return this.update(id, { status: "rejected", approvedBy, approvedAt: new Date(), comments });
  }

  escalate(id: string): ApprovalRecord {
    const approval = this.approvals.get(id);
    if (!approval) throw new Error(`Approval ${id} not found`);
    return this.update(id, { status: "escalated", escalationLevel: approval.escalationLevel + 1 });
  }

  getApprovalRate(periodId: string): { total: number; approved: number; rejected: number; pending: number; rate: number } {
    const period = this.getByPeriod(periodId);
    const total = period.length;
    const approved = period.filter((a) => a.status === "approved").length;
    const rejected = period.filter((a) => a.status === "rejected").length;
    const pending = period.filter((a) => a.status === "pending").length;
    return { total, approved, rejected, pending, rate: total > 0 ? (approved / total) * 100 : 0 };
  }
}
