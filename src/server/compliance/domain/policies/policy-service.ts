import type { CompliancePolicy, PolicyStatus } from "../../types";

export class PolicyService {
  private policies = new Map<string, CompliancePolicy>();

  add(policy: CompliancePolicy): CompliancePolicy {
    this.policies.set(policy.id, policy);
    return policy;
  }

  get(id: string): CompliancePolicy | undefined {
    return this.policies.get(id);
  }

  getAll(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }

  getByStatus(status: PolicyStatus): CompliancePolicy[] {
    return this.getAll().filter(p => p.status === status);
  }

  getActive(): CompliancePolicy[] {
    return this.getAll().filter(p => p.status === "active");
  }

  getByCategory(category: string): CompliancePolicy[] {
    return this.getAll().filter(p => p.category === category);
  }

  getByOwner(owner: string): CompliancePolicy[] {
    return this.getAll().filter(p => p.owner === owner);
  }

  search(query: string): CompliancePolicy[] {
    const q = query.toLowerCase();
    return this.getAll().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<CompliancePolicy>): CompliancePolicy | undefined {
    const existing = this.policies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.policies.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.policies.delete(id);
  }

  count(): number {
    return this.policies.size;
  }
}
