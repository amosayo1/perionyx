import type { DriverDefinition, DriverCategory, DriverImpactReport, DriverTimePeriod } from "../../types";

export class DriverBasedPlanningService {
  private drivers = new Map<string, DriverDefinition>();

  addDriver(driver: DriverDefinition): void { this.drivers.set(driver.id, driver); }
  getDriver(id: string): DriverDefinition | undefined { return this.drivers.get(id); }
  getAllDrivers(): DriverDefinition[] { return Array.from(this.drivers.values()); }
  getByCategory(category: DriverCategory): DriverDefinition[] { return this.getAllDrivers().filter((d) => d.category === category); }
  getByDepartment(dept: string): DriverDefinition[] { return this.getAllDrivers().filter((d) => d.department === dept); }
  getActive(): DriverDefinition[] { return this.getAllDrivers().filter((d) => d.isActive); }
  getByPeriod(period: DriverTimePeriod): DriverDefinition[] { return this.getAllDrivers().filter((d) => d.period === period); }
  countDrivers(): number { return this.drivers.size; }
  updateDriver(id: string, updates: Partial<DriverDefinition>): DriverDefinition | undefined {
    const existing = this.drivers.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.drivers.set(id, updated); return updated;
  }
  deleteDriver(id: string): boolean { return this.drivers.delete(id); }

  applyDriverChange(driverId: string, newValue: number): DriverDefinition | undefined {
    const existing = this.drivers.get(driverId);
    if (!existing) return undefined;
    const growthRate = existing.previousValue !== 0 ? ((newValue - existing.previousValue) / existing.previousValue) * 100 : 0;
    const updated = { ...existing, previousValue: existing.value, value: newValue, growthRate, updatedAt: new Date() };
    this.drivers.set(driverId, updated);
    return updated;
  }

  calculateDriverImpact(drivers: DriverDefinition[]): DriverImpactReport[] {
    return drivers.map((d) => ({
      driver: d.name,
      category: d.category,
      baseValue: d.previousValue,
      currentValue: d.value,
      changePercent: d.growthRate,
      revenueImpact: 0,
      expenseImpact: 0,
      netIncomeImpact: 0,
    }));
  }
}
