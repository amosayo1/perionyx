import type { Obligation, ObligationType, ComplianceStatus } from "../../types";

export class ObligationService {
  private obligations = new Map<string, Obligation>();

  add(obligation: Obligation): Obligation {
    this.obligations.set(obligation.id, obligation);
    return obligation;
  }

  get(id: string): Obligation | undefined {
    return this.obligations.get(id);
  }

  getAll(): Obligation[] {
    return Array.from(this.obligations.values());
  }

  getByFramework(frameworkId: string): Obligation[] {
    return this.getAll().filter(o => o.frameworkId === frameworkId);
  }

  getByType(type: ObligationType): Obligation[] {
    return this.getAll().filter(o => o.type === type);
  }

  getByStatus(status: ComplianceStatus): Obligation[] {
    return this.getAll().filter(o => o.status === status);
  }

  getByDepartment(department: string): Obligation[] {
    return this.getAll().filter(o => o.department === department);
  }

  getByOwner(owner: string): Obligation[] {
    return this.getAll().filter(o => o.owner === owner);
  }

  getCompliant(): Obligation[] {
    return this.getAll().filter(o => o.status === "compliant");
  }

  getNonCompliant(): Obligation[] {
    return this.getAll().filter(o => o.status === "non-compliant" || o.status === "partially-compliant");
  }

  search(query: string): Obligation[] {
    const q = query.toLowerCase();
    return this.getAll().filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q) ||
      o.owner.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<Obligation>): Obligation | undefined {
    const existing = this.obligations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.obligations.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.obligations.delete(id);
  }

  count(): number {
    return this.obligations.size;
  }
}
