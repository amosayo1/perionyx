import type { CollectionRecord, CollectionActivity, CollectionStatus, CollectionPriority, CollectionAction } from "../../types";

export class CollectionsService {
  private store = new Map<string, CollectionRecord>();

  add(entity: CollectionRecord): CollectionRecord {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): CollectionRecord | undefined {
    return this.store.get(id);
  }

  getAll(): CollectionRecord[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): CollectionRecord[] {
    return Array.from(this.store.values()).filter(c => c.customerId === customerId);
  }

  getByStatus(status: CollectionStatus): CollectionRecord[] {
    return Array.from(this.store.values()).filter(c => c.status === status);
  }

  getByPriority(priority: CollectionPriority): CollectionRecord[] {
    return Array.from(this.store.values()).filter(c => c.priority === priority);
  }

  getByCollector(collector: string): CollectionRecord[] {
    return Array.from(this.store.values()).filter(c => c.collector === collector);
  }

  getOverdueThreshold(days: number): CollectionRecord[] {
    return Array.from(this.store.values()).filter(c => c.daysOverdue >= days);
  }

  getByInvoice(invoiceId: string): CollectionRecord | undefined {
    return Array.from(this.store.values()).find(c => c.invoiceId === invoiceId);
  }

  search(query: string): CollectionRecord[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(c =>
      c.customerName.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      c.invoiceNumber.toLowerCase().includes(q) ||
      c.invoiceId.toLowerCase().includes(q) ||
      c.collector.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<CollectionRecord>): CollectionRecord {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`CollectionRecord ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  addActivity(collectionId: string, activity: CollectionActivity): CollectionRecord {
    const record = this.store.get(collectionId);
    if (!record) throw new Error(`CollectionRecord ${collectionId} not found`);
    const activities = [...record.activities, activity];
    const updated: CollectionRecord = {
      ...record,
      activities,
      lastActivity: activity.performedAt,
      updatedAt: new Date(),
    };
    this.store.set(collectionId, updated);
    return updated;
  }

  escalate(collectionId: string, level: number): CollectionRecord {
    const record = this.store.get(collectionId);
    if (!record) throw new Error(`CollectionRecord ${collectionId} not found`);
    const updated: CollectionRecord = {
      ...record,
      escalationLevel: level,
      status: level > 1 ? "escalated" : record.status,
      updatedAt: new Date(),
    };
    this.store.set(collectionId, updated);
    return updated;
  }

  assignCollector(collectionId: string, collector: string): CollectionRecord {
    const record = this.store.get(collectionId);
    if (!record) throw new Error(`CollectionRecord ${collectionId} not found`);
    const updated: CollectionRecord = {
      ...record,
      collector,
      assignedAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(collectionId, updated);
    return updated;
  }

  recordPromiseToPay(collectionId: string, promiseDate: Date, promiseAmount: number): CollectionRecord {
    const record = this.store.get(collectionId);
    if (!record) throw new Error(`CollectionRecord ${collectionId} not found`);
    const updated: CollectionRecord = {
      ...record,
      promiseToPay: promiseDate,
      promiseAmount,
      promiseKept: undefined,
      updatedAt: new Date(),
    };
    this.store.set(collectionId, updated);
    return updated;
  }
}
