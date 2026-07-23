import type { ApprovalRequest, ApprovalStatus } from "../../types";

export class ApprovalsService {
  private approvals = new Map<string, ApprovalRequest>();

  addApproval(approval: ApprovalRequest): void {
    this.approvals.set(approval.id, approval);
  }

  getApproval(id: string): ApprovalRequest | undefined {
    return this.approvals.get(id);
  }

  getAllApprovals(): ApprovalRequest[] {
    return [...this.approvals.values()];
  }

  getByStatus(status: ApprovalStatus): ApprovalRequest[] {
    return this.getAllApprovals().filter((a) => a.status === status);
  }

  getByEntity(entityType: string, entityId: string): ApprovalRequest[] {
    return this.getAllApprovals().filter(
      (a) => a.entityType === entityType && a.entityId === entityId,
    );
  }

  getByApprover(approverId: string): ApprovalRequest[] {
    return this.getAllApprovals().filter(
      (a) => a.currentApproverId === approverId || a.originalApproverId === approverId,
    );
  }

  getPending(): ApprovalRequest[] {
    return this.getByStatus("pending");
  }

  getByCompany(companyId: string): ApprovalRequest[] {
    return this.getAllApprovals().filter((a) => a.companyId === companyId);
  }

  count(): number {
    return this.approvals.size;
  }
}
