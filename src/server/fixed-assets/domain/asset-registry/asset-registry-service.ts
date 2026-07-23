import type { FixedAsset, AssetFilter, AssetSort, PaginatedResult } from "../../types";

export class AssetRegistryService {
  private items = new Map<string, FixedAsset>();

  add(asset: FixedAsset): void {
    this.items.set(asset.id, asset);
  }

  get(id: string): FixedAsset | undefined {
    return this.items.get(id);
  }

  getAll(): FixedAsset[] {
    return Array.from(this.items.values());
  }

  getByCategory(category: string): FixedAsset[] {
    return this.getAll().filter((a) => a.category === category);
  }

  getByStatus(status: string): FixedAsset[] {
    return this.getAll().filter((a) => a.status === status);
  }

  getByDepartment(dept: string): FixedAsset[] {
    return this.getAll().filter((a) => a.department === dept);
  }

  getByCustodian(custodian: string): FixedAsset[] {
    return this.getAll().filter((a) => a.custodian === custodian);
  }

  getActive(): FixedAsset[] {
    return this.getAll().filter((a) => a.isActive);
  }

  getFullyDepreciated(): FixedAsset[] {
    return this.getAll().filter((a) => a.isFullyDepreciated);
  }

  getUnderMaintenance(): FixedAsset[] {
    return this.getAll().filter((a) => a.status === "underMaintenance");
  }

  count(): number {
    return this.items.size;
  }

  countByStatus(status: string): number {
    return this.getByStatus(status).length;
  }

  countByCategory(category: string): number {
    return this.getByCategory(category).length;
  }

  update(id: string, updates: Partial<FixedAsset>): FixedAsset | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  search(query: string): FixedAsset[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (a) => a.name.toLowerCase().includes(q) || a.assetTag.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) || a.serialNumber?.toLowerCase().includes(q) ||
        a.model?.toLowerCase().includes(q) || a.manufacturer?.toLowerCase().includes(q),
    );
  }

  getPaginated(filter: AssetFilter, sort: AssetSort, page: number, pageSize: number): PaginatedResult<FixedAsset> {
    let items = this.getAll();
    if (filter.status && filter.status.length > 0) items = items.filter((a) => filter.status!.includes(a.status));
    if (filter.category && filter.category.length > 0) items = items.filter((a) => filter.category!.includes(a.category));
    if (filter.department) items = items.filter((a) => a.department === filter.department);
    if (filter.costCenter) items = items.filter((a) => a.costCenter === filter.costCenter);
    if (filter.isFullyDepreciated !== undefined) items = items.filter((a) => a.isFullyDepreciated === filter.isFullyDepreciated);
    if (filter.isActive !== undefined) items = items.filter((a) => a.isActive === filter.isActive);
    if (filter.costFrom !== undefined) items = items.filter((a) => a.acquisition.totalCost >= filter.costFrom!);
    if (filter.costTo !== undefined) items = items.filter((a) => a.acquisition.totalCost <= filter.costTo!);
    if (filter.searchQuery) items = this.search(filter.searchQuery);
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const sorted = items.sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      switch (sort.field) {
        case "assetTag": return a.assetTag.localeCompare(b.assetTag) * dir;
        case "name": return a.name.localeCompare(b.name) * dir;
        case "category": return a.category.localeCompare(b.category) * dir;
        case "status": return a.status.localeCompare(b.status) * dir;
        case "cost": return (a.acquisition.totalCost - b.acquisition.totalCost) * dir;
        case "netBookValue": return (a.depreciationDetails.netBookValue - b.depreciationDetails.netBookValue) * dir;
        case "acquisitionDate": return (a.acquisition.acquisitionDate.getTime() - b.acquisition.acquisitionDate.getTime()) * dir;
        default: return 0;
      }
    });
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
    return { items: paginated, total, page, pageSize, totalPages };
  }
}

export default AssetRegistryService;
