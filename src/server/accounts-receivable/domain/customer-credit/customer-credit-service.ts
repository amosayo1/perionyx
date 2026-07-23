import type { CreditLimit, CreditReview, RiskRating, CreditLimitStatus } from "../../types";

export class CustomerCreditService {
  private limits = new Map<string, CreditLimit>();
  private reviews = new Map<string, CreditReview>();

  add(entity: CreditLimit): CreditLimit {
    this.limits.set(entity.id, entity);
    return entity;
  }

  get(id: string): CreditLimit | undefined {
    return this.limits.get(id);
  }

  getAll(): CreditLimit[] {
    return Array.from(this.limits.values());
  }

  getByCustomer(customerId: string): CreditLimit | undefined {
    return Array.from(this.limits.values()).find(l => l.customerId === customerId);
  }

  getByStatus(status: CreditLimitStatus): CreditLimit[] {
    return Array.from(this.limits.values()).filter(l => l.status === status);
  }

  getByRiskRating(rating: RiskRating): CreditLimit[] {
    return Array.from(this.limits.values()).filter(l => l.riskRating === rating);
  }

  getExpiring(days: number): CreditLimit[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return Array.from(this.limits.values()).filter(l => l.nextReviewDate <= cutoff);
  }

  search(query: string): CreditLimit[] {
    const q = query.toLowerCase();
    return Array.from(this.limits.values()).filter(l =>
      l.customerName.toLowerCase().includes(q) ||
      l.customerId.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.limits.size;
  }

  update(id: string, updates: Partial<CreditLimit>): CreditLimit {
    const existing = this.limits.get(id);
    if (!existing) throw new Error(`CreditLimit ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.limits.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.limits.delete(id);
  }

  addReview(review: CreditReview): CreditReview {
    this.reviews.set(review.id, review);
    return review;
  }

  approveReview(id: string, approvedLimit: number, reviewer: string): CreditReview {
    const review = this.reviews.get(id);
    if (!review) throw new Error(`CreditReview ${id} not found`);
    const updated: CreditReview = {
      ...review,
      status: "approved",
      approvedLimit,
      reviewedBy: reviewer,
      reviewDate: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(id, updated);
    return updated;
  }

  rejectReview(id: string, reviewer: string, reason: string): CreditReview {
    const review = this.reviews.get(id);
    if (!review) throw new Error(`CreditReview ${id} not found`);
    const updated: CreditReview = {
      ...review,
      status: "rejected",
      reviewedBy: reviewer,
      reason,
      reviewDate: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(id, updated);
    return updated;
  }

  calculateRiskScore(outstanding: number, limit: number, paymentHistory: number): number {
    if (limit <= 0) return 100;
    const utilizationWeight = 0.5;
    const historyWeight = 0.5;
    const utilizationRatio = Math.min(outstanding / limit, 1);
    return Math.round((utilizationRatio * utilizationWeight + (1 - paymentHistory) * historyWeight) * 100);
  }

  getTotalCreditExposure(): number {
    return Array.from(this.limits.values()).reduce((sum, l) => sum + l.creditUsed, 0);
  }

  getCreditUtilization(): number {
    const totalLimit = Array.from(this.limits.values()).reduce((sum, l) => sum + l.creditLimit, 0);
    if (totalLimit === 0) return 0;
    return (this.getTotalCreditExposure() / totalLimit) * 100;
  }
}
