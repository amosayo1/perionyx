import type { CatalogItem } from "../../types";

export class CatalogService {
  private items = new Map<string, CatalogItem>();

  addItem(item: CatalogItem): void {
    this.items.set(item.id, item);
  }

  getItem(id: string): CatalogItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): CatalogItem[] {
    return [...this.items.values()];
  }

  getByCategory(category: string): CatalogItem[] {
    return this.getAllItems().filter((i) => i.category === category);
  }

  getByVendor(vendorId: string): CatalogItem[] {
    return this.getAllItems().filter((i) => i.vendorId === vendorId);
  }

  getActive(): CatalogItem[] {
    return this.getAllItems().filter((i) => i.isActive);
  }

  search(query: string): CatalogItem[] {
    const q = query.toLowerCase();
    return this.getAllItems().filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.items.size;
  }
}
