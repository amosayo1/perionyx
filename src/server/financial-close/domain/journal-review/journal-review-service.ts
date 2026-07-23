import type { JournalReviewRecord, JournalFlag, JournalReviewStatus } from "../../types";

export class JournalReviewService {
  private reviews = new Map<string, JournalReviewRecord>();

  add(rec: JournalReviewRecord): JournalReviewRecord {
    this.reviews.set(rec.id, rec);
    return rec;
  }

  get(id: string): JournalReviewRecord | undefined {
    return this.reviews.get(id);
  }

  getAll(): JournalReviewRecord[] {
    return Array.from(this.reviews.values());
  }

  getByPeriod(periodId: string): JournalReviewRecord[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  getByStatus(status: JournalReviewStatus): JournalReviewRecord[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getPending(): JournalReviewRecord[] {
    return this.getAll().filter((r) => r.status === "pending" || r.status === "inReview");
  }

  getFlagged(): JournalReviewRecord[] {
    return this.getAll().filter((r) => r.status === "flagged" || r.flags.length > 0);
  }

  search(query: string): JournalReviewRecord[] {
    const q = query.toLowerCase();
    return this.getAll().filter((r) => r.journalNumber.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  count(): number {
    return this.reviews.size;
  }

  update(id: string, updates: Partial<JournalReviewRecord>): JournalReviewRecord {
    const existing = this.reviews.get(id);
    if (!existing) throw new Error(`JournalReview ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.reviews.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.reviews.delete(id);
  }

  addFlag(recId: string, flag: JournalFlag): JournalReviewRecord {
    const rec = this.reviews.get(recId);
    if (!rec) throw new Error(`JournalReview ${recId} not found`);
    return this.update(recId, { flags: [...rec.flags, flag], status: "flagged" });
  }

  resolveFlag(recId: string, flagId: string): JournalReviewRecord {
    const rec = this.reviews.get(recId);
    if (!rec) throw new Error(`JournalReview ${recId} not found`);
    const flags = rec.flags.map((f) => (f.id === flagId ? { ...f, resolved: true } : f));
    return this.update(recId, { flags, status: flags.every((f) => f.resolved) ? "approved" : "flagged" });
  }

  approve(id: string, reviewer: string): JournalReviewRecord {
    return this.update(id, { status: "approved", reviewer, reviewDate: new Date() });
  }

  reject(id: string, reviewer: string, notes?: string): JournalReviewRecord {
    return this.update(id, { status: "rejected", reviewer, reviewDate: new Date(), notes });
  }
}
