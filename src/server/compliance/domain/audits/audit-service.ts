import type { ComplianceAudit } from "../../types";

export class AuditService {
  private audits = new Map<string, ComplianceAudit>();

  add(audit: ComplianceAudit): ComplianceAudit {
    this.audits.set(audit.id, audit);
    return audit;
  }

  get(id: string): ComplianceAudit | undefined {
    return this.audits.get(id);
  }

  getAll(): ComplianceAudit[] {
    return Array.from(this.audits.values());
  }

  getByStatus(status: ComplianceAudit["status"]): ComplianceAudit[] {
    return this.getAll().filter(a => a.status === status);
  }

  getByType(type: ComplianceAudit["type"]): ComplianceAudit[] {
    return this.getAll().filter(a => a.type === type);
  }

  getByFramework(frameworkId: string): ComplianceAudit[] {
    return this.getAll().filter(a => a.frameworkId === frameworkId);
  }

  getByAuditor(auditor: string): ComplianceAudit[] {
    return this.getAll().filter(a => a.auditor === auditor);
  }

  getOpen(): ComplianceAudit[] {
    return this.getAll().filter(a => a.status === "planned" || a.status === "in-progress");
  }

  getCompleted(): ComplianceAudit[] {
    return this.getAll().filter(a => a.status === "completed" || a.status === "remediated");
  }

  search(query: string): ComplianceAudit[] {
    const q = query.toLowerCase();
    return this.getAll().filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.scope.toLowerCase().includes(q) ||
      a.auditor.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<ComplianceAudit>): ComplianceAudit | undefined {
    const existing = this.audits.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.audits.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.audits.delete(id);
  }

  count(): number {
    return this.audits.size;
  }
}
