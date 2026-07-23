import type { RiskHeatmap, RiskCategory } from "../../types";

export class RiskHeatmapService {
  private items = new Map<string, RiskHeatmap>();

  add(item: RiskHeatmap): RiskHeatmap {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskHeatmap | undefined {
    return this.items.get(id);
  }

  getAll(): RiskHeatmap[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskHeatmap>): RiskHeatmap | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  generateHeatmap(period: string, categoryData: Array<{ category: RiskCategory; likelihood: number; impact: number; count: number }>): RiskHeatmap {
    const id = `heatmap_${period.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}`;
    const heatmap: RiskHeatmap = {
      id,
      period,
      data: JSON.stringify(categoryData),
      companyId: "default",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(id, heatmap);
    return heatmap;
  }

  buildHeatmap(registers: Array<{ category: RiskCategory; riskLevel: string }>, period: string): RiskHeatmap {
    const categoryMap = new Map<RiskCategory, { likelihood: number; impact: number; count: number }>();
    for (const r of registers) {
      const level = r.riskLevel === "critical" ? 5 : r.riskLevel === "high" ? 4 : r.riskLevel === "medium" ? 3 : 2;
      const existing = categoryMap.get(r.category);
      if (existing) {
        existing.likelihood = Math.max(existing.likelihood, level);
        existing.impact = Math.max(existing.impact, level);
        existing.count++;
      } else {
        categoryMap.set(r.category, { likelihood: level, impact: level, count: 1 });
      }
    }
    const data = Array.from(categoryMap.entries()).map(([category, vals]) => ({
      category,
      likelihood: vals.likelihood,
      impact: vals.impact,
      count: vals.count,
    }));
    return this.generateHeatmap(period, data);
  }

  count(): number {
    return this.items.size;
  }
}
