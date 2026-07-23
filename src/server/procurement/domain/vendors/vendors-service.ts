import type { Vendor, VendorStatus, VendorCategory, VendorRiskLevel, VendorPerformance, VendorDocument } from "../../types";

export class VendorService {
  private vendors = new Map<string, Vendor>();
  private performances = new Map<string, VendorPerformance>();
  private documents = new Map<string, VendorDocument>();

  addVendor(vendor: Vendor): void {
    this.vendors.set(vendor.id, vendor);
  }

  getVendor(id: string): Vendor | undefined {
    return this.vendors.get(id);
  }

  getAllVendors(): Vendor[] {
    return [...this.vendors.values()];
  }

  getByStatus(status: VendorStatus): Vendor[] {
    return this.getAllVendors().filter((v) => v.status === status);
  }

  getByCategory(category: VendorCategory): Vendor[] {
    return this.getAllVendors().filter((v) => v.category === category);
  }

  getByRiskLevel(riskLevel: VendorRiskLevel): Vendor[] {
    return this.getAllVendors().filter((v) => v.riskLevel === riskLevel);
  }

  getPreferred(): Vendor[] {
    return this.getAllVendors().filter((v) => v.preferred);
  }

  getBlocked(): Vendor[] {
    return this.getAllVendors().filter((v) => v.isBlocked);
  }

  getByCompany(companyId: string): Vendor[] {
    return this.getAllVendors().filter((v) => v.companyId === companyId);
  }

  addPerformance(perf: VendorPerformance): void {
    this.performances.set(perf.id, perf);
  }

  getPerformance(id: string): VendorPerformance | undefined {
    return this.performances.get(id);
  }

  getPerformances(vendorId: string): VendorPerformance[] {
    return [...this.performances.values()].filter((p) => p.vendorId === vendorId);
  }

  addDocument(doc: VendorDocument): void {
    this.documents.set(doc.id, doc);
  }

  getDocument(id: string): VendorDocument | undefined {
    return this.documents.get(id);
  }

  getDocuments(vendorId: string): VendorDocument[] {
    return [...this.documents.values()].filter((d) => d.vendorId === vendorId);
  }

  search(query: string): Vendor[] {
    const q = query.toLowerCase();
    return this.getAllVendors().filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q) ||
        v.legalName.toLowerCase().includes(q) ||
        v.contactName.toLowerCase().includes(q) ||
        v.taxId.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.vendors.size;
  }
}
