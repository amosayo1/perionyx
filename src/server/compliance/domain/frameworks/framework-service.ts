import type { RegulatoryFramework, RegulatoryFrameworkCode } from "../../types";

export class FrameworkService {
  private frameworks = new Map<string, RegulatoryFramework>();

  add(framework: RegulatoryFramework): RegulatoryFramework {
    this.frameworks.set(framework.id, framework);
    return framework;
  }

  get(id: string): RegulatoryFramework | undefined {
    return this.frameworks.get(id);
  }

  getAll(): RegulatoryFramework[] {
    return Array.from(this.frameworks.values());
  }

  getByCode(code: RegulatoryFrameworkCode): RegulatoryFramework[] {
    return this.getAll().filter(f => f.code === code);
  }

  getActive(): RegulatoryFramework[] {
    return this.getAll().filter(f => f.isActive);
  }

  search(query: string): RegulatoryFramework[] {
    const q = query.toLowerCase();
    return this.getAll().filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.jurisdiction.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<RegulatoryFramework>): RegulatoryFramework | undefined {
    const existing = this.frameworks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.frameworks.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.frameworks.delete(id);
  }

  count(): number {
    return this.frameworks.size;
  }
}
