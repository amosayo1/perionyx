import type { DepreciationEntry, DepreciationMethod, FixedAsset } from "../../types";

export class DepreciationService {
  private items = new Map<string, DepreciationEntry>();

  add(entry: DepreciationEntry): void {
    this.items.set(entry.id, entry);
  }

  get(id: string): DepreciationEntry | undefined {
    return this.items.get(id);
  }

  getAll(): DepreciationEntry[] {
    return Array.from(this.items.values());
  }

  getByAsset(assetId: string): DepreciationEntry[] {
    return this.getAll().filter((e) => e.assetId === assetId);
  }

  getByPeriod(period: string): DepreciationEntry[] {
    return this.getAll().filter((e) => e.period === period);
  }

  getByFiscalYear(year: number): DepreciationEntry[] {
    return this.getAll().filter((e) => e.fiscalYear === year);
  }

  getByFiscalPeriod(year: number, period: number): DepreciationEntry[] {
    return this.getAll().filter((e) => e.fiscalYear === year && e.fiscalPeriod === period);
  }

  getUnposted(): DepreciationEntry[] {
    return this.getAll().filter((e) => !e.postedToGL);
  }

  count(): number {
    return this.items.size;
  }

  calculateMonthlyDepreciation(method: DepreciationMethod, cost: number, salvage: number, usefulLifeYears: number): number {
    const depreciableBase = cost - salvage;
    if (depreciableBase <= 0 || usefulLifeYears <= 0) return 0;
    switch (method) {
      case "straightLine":
        return depreciableBase / (usefulLifeYears * 12);
      case "doubleDeclining": {
        const rate = 2 / usefulLifeYears;
        return (cost * rate) / 12;
      }
      case "sumOfYearsDigits": {
        const sum = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
        return (depreciableBase * (usefulLifeYears / sum)) / 12;
      }
      case "unitsOfProduction":
        return depreciableBase / (usefulLifeYears * 12);
      case "macrs": {
        const macrsRates: Record<number, number[]> = {
          3: [33.33, 44.45, 14.81, 7.41],
          5: [20.00, 32.00, 19.20, 11.52, 11.52, 5.76],
          7: [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
        };
        const rates = macrsRates[usefulLifeYears] || [1 / usefulLifeYears * 100];
        const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length;
        return (cost * avgRate / 100) / 12;
      }
      default:
        return depreciableBase / (usefulLifeYears * 12);
    }
  }

  generateDepreciationSchedule(asset: FixedAsset): DepreciationEntry[] {
    const { depreciationDetails } = asset;
    const monthlyAmount = this.calculateMonthlyDepreciation(
      depreciationDetails.method,
      depreciationDetails.originalCost,
      depreciationDetails.salvageValue,
      depreciationDetails.usefulLifeYears,
    );
    const entries: DepreciationEntry[] = [];
    const startDate = new Date(depreciationDetails.inServiceDate);
    const remainingMonths = depreciationDetails.remainingLifeMonths;
    let accumulatedAfter = depreciationDetails.accumulatedDepreciation;
    let netBookValueAfter = depreciationDetails.netBookValue;

    for (let i = 0; i < remainingMonths; i++) {
      const entryDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      accumulatedAfter += monthlyAmount;
      netBookValueAfter -= monthlyAmount;
      entries.push({
        id: `${asset.id}-dep-${i}`,
        assetId: asset.id,
        period: `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}`,
        fiscalYear: entryDate.getFullYear(),
        fiscalPeriod: entryDate.getMonth() + 1,
        amount: monthlyAmount,
        accumulatedAfter,
        netBookValueAfter: Math.max(netBookValueAfter, 0),
        postedToGL: false,
      });
    }
    return entries;
  }

  markAsPosted(entryId: string, glJournalId: string): DepreciationEntry | undefined {
    const entry = this.items.get(entryId);
    if (!entry) return undefined;
    const updated: DepreciationEntry = {
      ...entry,
      postedToGL: true,
      glJournalId,
      postedDate: new Date(),
    };
    this.items.set(entryId, updated);
    return updated;
  }

  update(id: string, updates: Partial<DepreciationEntry>): DepreciationEntry | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export default DepreciationService;
