type Collection = "assets" | "acquisitions" | "capitalizations" | "depreciation" | "impairments" | "transfers" | "maintenance" | "disposals" | "revaluations" | "leases";

export class RepositoriesService {
  private stores = new Map<Collection, Map<string, unknown>>();

  private getStore(collection: Collection): Map<string, unknown> {
    if (!this.stores.has(collection)) {
      this.stores.set(collection, new Map());
    }
    return this.stores.get(collection)!;
  }

  findById<T>(collection: Collection, id: string): T | undefined {
    return this.getStore(collection).get(id) as T | undefined;
  }

  findAll<T>(collection: Collection): T[] {
    return Array.from(this.getStore(collection).values()) as T[];
  }

  findByField<T>(collection: Collection, field: keyof T, value: unknown): T[] {
    return this.findAll<T>(collection).filter((item) => item[field] === value);
  }

  insert<T>(collection: Collection, id: string, data: T): void {
    this.getStore(collection).set(id, data);
  }

  update<T>(collection: Collection, id: string, data: Partial<T>): T | undefined {
    const store = this.getStore(collection);
    const existing = store.get(id) as T | undefined;
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    store.set(id, updated);
    return updated;
  }

  delete(collection: Collection, id: string): boolean {
    return this.getStore(collection).delete(id);
  }

  count(collection: Collection): number {
    return this.getStore(collection).size;
  }
}
