import type { OwnershipRecord, OwnershipType, ConsolidationMethod } from "../../types";

export class OwnershipManagementService {
  private items = new Map<string, OwnershipRecord>();

  add(record: OwnershipRecord): OwnershipRecord {
    this.items.set(record.id, record);
    return record;
  }

  get(id: string): OwnershipRecord | undefined {
    return this.items.get(id);
  }

  getAll(): OwnershipRecord[] {
    return Array.from(this.items.values());
  }

  getByParent(parentId: string): OwnershipRecord[] {
    return this.getAll().filter((r) => r.parentEntityId === parentId);
  }

  getBySubsidiary(subsidiaryId: string): OwnershipRecord[] {
    return this.getAll().filter((r) => r.subsidiaryEntityId === subsidiaryId);
  }

  getByType(type: OwnershipType): OwnershipRecord[] {
    return this.getAll().filter((r) => r.ownershipType === type);
  }

  getByMethod(method: ConsolidationMethod): OwnershipRecord[] {
    return this.getAll().filter((r) => r.consolidationMethod === method);
  }

  getActive(): OwnershipRecord[] {
    const now = new Date();
    return this.getAll().filter((r) => r.effectiveDate <= now && (!r.endDate || r.endDate > now));
  }

  getDirect(): OwnershipRecord[] {
    return this.getAll().filter((r) => r.isDirect);
  }

  getIndirect(): OwnershipRecord[] {
    return this.getAll().filter((r) => !r.isDirect);
  }

  getEffectiveOwnership(parentId: string, subsidiaryId: string): number {
    const direct = this.getAll().find(
      (r) => r.parentEntityId === parentId && r.subsidiaryEntityId === subsidiaryId && r.isDirect,
    );
    if (direct) return direct.ownershipPercentage;
    const indirect = this.getAll().filter(
      (r) => r.subsidiaryEntityId === subsidiaryId && !r.isDirect,
    );
    if (indirect.length === 0) return 0;
    return indirect.reduce((sum, r) => {
      const parentOwnership = this.getEffectiveOwnership(parentId, r.parentEntityId);
      return sum + (parentOwnership * r.ownershipPercentage) / 100;
    }, 0);
  }

  getConsolidationScope(entityId: string): "full" | "proportional" | "equity" | "none" {
    const records = this.getAll().filter((r) => r.subsidiaryEntityId === entityId);
    if (records.length === 0) return "none";
    const active = records.filter((r) => {
      const now = new Date();
      return r.effectiveDate <= now && (!r.endDate || r.endDate > now);
    });
    if (active.length === 0) return "none";
    const maxScope = active.reduce<"full" | "proportional" | "equity" | "none">((prev, r) => {
      const order = { full: 4, proportional: 3, equity: 2, none: 1 };
      return order[r.consolidationScope] > order[prev] ? r.consolidationScope : prev;
    }, "none");
    return maxScope;
  }

  count(): number {
    return this.items.size;
  }

  countByType(type: OwnershipType): number {
    return this.getByType(type).length;
  }

  countByMethod(method: ConsolidationMethod): number {
    return this.getByMethod(method).length;
  }

  update(id: string, updates: Partial<OwnershipRecord>): OwnershipRecord {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`OwnershipRecord ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.items.delete(id);
  }
}
