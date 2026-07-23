import type { LegalEntity, EntityType } from "../../types";

export class EntityManagementService {
  private items = new Map<string, LegalEntity>();

  add(entity: LegalEntity): LegalEntity {
    this.items.set(entity.id, entity);
    return entity;
  }

  get(id: string): LegalEntity | undefined {
    return this.items.get(id);
  }

  getAll(): LegalEntity[] {
    return Array.from(this.items.values());
  }

  getByType(type: EntityType): LegalEntity[] {
    return this.getAll().filter((e) => e.entityType === type);
  }

  getByCountry(country: string): LegalEntity[] {
    return this.getAll().filter((e) => e.country === country);
  }

  getByStatus(status: string): LegalEntity[] {
    return this.getAll().filter((e) => e.status === status);
  }

  getByParent(parentId: string): LegalEntity[] {
    return this.getAll().filter((e) => e.parentEntityId === parentId);
  }

  getActive(): LegalEntity[] {
    return this.getAll().filter((e) => e.status === "active");
  }

  getConsolidated(): LegalEntity[] {
    return this.getAll().filter((e) => e.isConsolidated);
  }

  getByConsolidationMethod(method: string): LegalEntity[] {
    return this.getAll().filter((e) => e.consolidationMethod === method);
  }

  getByFunctionalCurrency(currency: string): LegalEntity[] {
    return this.getAll().filter((e) => e.functionalCurrency === currency);
  }

  count(): number {
    return this.items.size;
  }

  countByType(type: EntityType): number {
    return this.getByType(type).length;
  }

  countByCountry(country: string): number {
    return this.getByCountry(country).length;
  }

  update(id: string, updates: Partial<LegalEntity>): LegalEntity {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`LegalEntity ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.items.delete(id);
  }

  search(query: string): LegalEntity[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (e) => e.legalName.toLowerCase().includes(q) || e.entityCode.toLowerCase().includes(q) ||
        e.taxId.toLowerCase().includes(q) || e.country.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q),
    );
  }
}
