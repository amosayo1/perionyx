import type { Remediation, RemediationPriority } from "../../types";

export class RemediationService {
  private remediations = new Map<string, Remediation>();

  add(remediation: Remediation): Remediation {
    this.remediations.set(remediation.id, remediation);
    return remediation;
  }

  get(id: string): Remediation | undefined {
    return this.remediations.get(id);
  }

  getAll(): Remediation[] {
    return Array.from(this.remediations.values());
  }

  getByAudit(auditId: string): Remediation[] {
    return this.getAll().filter(r => r.auditId === auditId);
  }

  getByTest(testId: string): Remediation[] {
    return this.getAll().filter(r => r.testId === testId);
  }

  getByPriority(priority: RemediationPriority): Remediation[] {
    return this.getAll().filter(r => r.priority === priority);
  }

  getByStatus(status: Remediation["status"]): Remediation[] {
    return this.getAll().filter(r => r.status === status);
  }

  getByOwner(owner: string): Remediation[] {
    return this.getAll().filter(r => r.owner === owner);
  }

  getOpen(): Remediation[] {
    return this.getAll().filter(r => r.status === "open" || r.status === "in-progress");
  }

  getCritical(): Remediation[] {
    return this.getAll().filter(r => r.priority === "critical");
  }

  getOverdue(): Remediation[] {
    return this.getAll().filter(r => r.status !== "resolved" && r.status !== "verified" && new Date(r.targetDate) < new Date());
  }

  update(id: string, data: Partial<Remediation>): Remediation | undefined {
    const existing = this.remediations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.remediations.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.remediations.delete(id);
  }

  count(): number {
    return this.remediations.size;
  }
}
