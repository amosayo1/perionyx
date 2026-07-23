import type { MaintenanceRecord, MaintenanceType, MaintenancePriority, MaintenanceStatus } from "../../types";

export class MaintenanceService {
  private items = new Map<string, MaintenanceRecord>();

  add(record: MaintenanceRecord): void { this.items.set(record.id, record); }
  get(id: string): MaintenanceRecord | undefined { return this.items.get(id); }
  getAll(): MaintenanceRecord[] { return Array.from(this.items.values()); }
  getByAsset(assetId: string): MaintenanceRecord[] { return this.getAll().filter((r) => r.assetId === assetId); }
  getByType(type: MaintenanceType): MaintenanceRecord[] { return this.getAll().filter((r) => r.type === type); }
  getByPriority(priority: MaintenancePriority): MaintenanceRecord[] { return this.getAll().filter((r) => r.priority === priority); }
  getByStatus(status: MaintenanceStatus): MaintenanceRecord[] { return this.getAll().filter((r) => r.status === status); }
  getScheduled(): MaintenanceRecord[] { return this.getByStatus("scheduled"); }
  getInProgress(): MaintenanceRecord[] { return this.getByStatus("inProgress"); }
  getCompleted(): MaintenanceRecord[] { return this.getByStatus("completed"); }
  getOverdue(from: Date): MaintenanceRecord[] { return this.getByStatus("scheduled").filter((r) => r.scheduledDate < from); }
  getByDateRange(from: Date, to: Date): MaintenanceRecord[] { return this.getAll().filter((r) => r.scheduledDate >= from && r.scheduledDate <= to); }
  getByVendor(vendor: string): MaintenanceRecord[] { return this.getAll().filter((r) => r.vendorName === vendor); }
  getTotalCost(): number { return this.getAll().reduce((sum, r) => sum + r.cost, 0); }
  getTotalCostByAsset(assetId: string): number { return this.getByAsset(assetId).reduce((sum, r) => sum + r.cost, 0); }
  getTotalDowntime(): number { return this.getAll().filter((r) => r.status === "completed").reduce((sum, r) => sum + (r.downtimeHours || 0), 0); }
  count(): number { return this.items.size; }
  countByType(type: MaintenanceType): number { return this.getByType(type).length; }
  countByPriority(priority: MaintenancePriority): number { return this.getByPriority(priority).length; }

  update(id: string, updates: Partial<MaintenanceRecord>): MaintenanceRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  complete(id: string, completedDate: Date, actualCost: number, downtimeHours?: number): MaintenanceRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "completed" as const, completedDate, cost: actualCost, downtimeHours: downtimeHours || existing.downtimeHours };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
