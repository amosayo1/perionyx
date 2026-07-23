import type {
  FundingRequest,
  FundingDecision,
  CashMovement,
  TreasuryApprovalMatrix,
} from "../domain/types";
import { FundingStatus, FundingType } from "../domain/types";

export class FundingService {
  private requests = new Map<string, FundingRequest>();
  private movements = new Map<string, CashMovement>();

  createRequest(params: {
    companyId: string;
    sourceLegalEntityId: string;
    targetLegalEntityId: string;
    currency: string;
    requestedAmount: number;
    fundingType: FundingType;
    priority: number;
    reason: string;
    requestedById: string;
    requiredByDate: string;
  }): FundingRequest {
    const request: FundingRequest = {
      id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId: params.companyId,
      sourceLegalEntityId: params.sourceLegalEntityId,
      targetLegalEntityId: params.targetLegalEntityId,
      currency: params.currency,
      requestedAmount: params.requestedAmount,
      approvedAmount: null,
      fundingType: params.fundingType,
      priority: params.priority,
      reason: params.reason,
      status: FundingStatus.DRAFT,
      requestedById: params.requestedById,
      approvedById: null,
      requiredByDate: params.requiredByDate,
      approvedAt: null,
      executedAt: null,
      rejectionReason: null,
      createdAt: new Date().toISOString(),
    };

    this.requests.set(request.id, request);
    return request;
  }

  approveRequest(
    requestId: string,
    decision: FundingDecision,
    approvalMatrix: TreasuryApprovalMatrix,
  ): FundingRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    const requiredApprover = this.determineRequiredApprover(request.requestedAmount, approvalMatrix);

    request.approvedAmount = decision.approvedAmount ?? request.requestedAmount;
    request.approvedById = decision.decisionById;
    request.approvedAt = decision.decisionAt;
    request.status = decision.decision === "APPROVED"
      ? FundingStatus.APPROVED
      : decision.decision === "REJECTED"
        ? FundingStatus.CANCELLED
        : FundingStatus.APPROVED;
    request.rejectionReason = decision.decision === "REJECTED" ? decision.reason : null;

    this.requests.set(requestId, request);
    return request;
  }

  executeFunding(requestId: string): CashMovement | null {
    const request = this.requests.get(requestId);
    if (!request || request.status !== FundingStatus.APPROVED) return null;

    request.status = FundingStatus.EXECUTING;
    this.requests.set(requestId, request);

    const movement: CashMovement = {
      id: `cm-${Date.now()}`,
      companyId: request.companyId,
      sourceLegalEntityId: request.sourceLegalEntityId,
      targetLegalEntityId: request.targetLegalEntityId,
      sourceAccountId: "",
      targetAccountId: "",
      currency: request.currency,
      amount: request.approvedAmount ?? request.requestedAmount,
      fundingType: request.fundingType,
      status: FundingStatus.COMPLETED,
      reason: request.reason,
      approvalRequired: true,
      approvedById: request.approvedById,
      executedAt: new Date().toISOString(),
      requestedAt: request.createdAt,
      completedAt: new Date().toISOString(),
      failureReason: null,
      referenceId: `ref-${request.id}`,
    };

    this.movements.set(movement.id, movement);

    request.status = FundingStatus.COMPLETED;
    request.executedAt = movement.executedAt;
    this.requests.set(requestId, request);

    return movement;
  }

  getRequest(requestId: string): FundingRequest | null {
    return this.requests.get(requestId) ?? null;
  }

  getRequestsByCompany(companyId: string): FundingRequest[] {
    return Array.from(this.requests.values())
      .filter((r) => r.companyId === companyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPendingRequests(companyId: string): FundingRequest[] {
    return this.getRequestsByCompany(companyId)
      .filter((r) => r.status === FundingStatus.PENDING_APPROVAL || r.status === FundingStatus.DRAFT);
  }

  getMovementsByCompany(companyId: string): CashMovement[] {
    return Array.from(this.movements.values())
      .filter((m) => m.companyId === companyId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  private determineRequiredApprover(
    amount: number,
    matrix: TreasuryApprovalMatrix,
  ): string {
    if (amount >= 10_000_000) return matrix.fundingAbove10M;
    if (amount >= 1_000_000) return matrix.fundingBelow10M;
    return matrix.fundingBelow1M;
  }

  clear(): void {
    this.requests.clear();
    this.movements.clear();
  }
}

export const fundingService = new FundingService();
