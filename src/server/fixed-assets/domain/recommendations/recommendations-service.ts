import type { AssetRecommendation, RecommendationType, FixedAsset } from "../../types";

export class RecommendationsService {
  private recommendations = new Map<string, AssetRecommendation>();

  add(rec: AssetRecommendation): AssetRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  get(id: string): AssetRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAll(): AssetRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: RecommendationType): AssetRecommendation[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByPriority(priority: string): AssetRecommendation[] {
    return this.getAll().filter((r) => r.priority === priority);
  }

  getActive(): AssetRecommendation[] {
    return this.getAll().filter((r) => r.status === "active");
  }

  getImplemented(): AssetRecommendation[] {
    return this.getAll().filter((r) => r.status === "implemented");
  }

  getDismissed(): AssetRecommendation[] {
    return this.getAll().filter((r) => r.status === "dismissed");
  }

  getByAsset(assetId: string): AssetRecommendation[] {
    return this.getAll().filter((r) => r.assetId === assetId);
  }

  count(): number {
    return this.recommendations.size;
  }

  update(id: string, updates: Partial<AssetRecommendation>): AssetRecommendation {
    const existing = this.recommendations.get(id);
    if (!existing) throw new Error(`Recommendation ${id} not found`);
    const updated = { ...existing, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.recommendations.delete(id);
  }

  generateReplacementRecommendation(asset: FixedAsset): AssetRecommendation {
    const remLife = asset.remainingLifeMonths;
    const priority = remLife <= 6 ? "critical" : remLife <= 12 ? "high" : remLife <= 24 ? "medium" : "low";
    return {
      id: `rec-replace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "replacement",
      title: `Replace ${asset.name}`,
      description: `Asset ${asset.assetTag} (${asset.name}) is near end of life with ${remLife} months remaining. Category: ${asset.category}. Current NBV: ${asset.depreciationDetails.netBookValue}.`,
      priority,
      status: "active",
      impact: `Prevents operational disruption from asset failure. Estimated replacement cost: ${asset.acquisition.totalCost}`,
      effort: "medium",
      estimatedSavings: asset.depreciationDetails.monthlyDepreciation * remLife,
      assetId: asset.id,
      companyId: asset.companyId,
      createdAt: new Date(),
    };
  }

  generateUtilizationRecommendation(asset: FixedAsset, _rate: number): AssetRecommendation {
    return {
      id: `rec-util-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "utilization",
      title: `Review underutilized asset: ${asset.name}`,
      description: `Asset ${asset.assetTag} (${asset.name}) has low utilization. Category: ${asset.category}. Consider reallocation, consolidation, or disposal.`,
      priority: "medium",
      status: "active",
      impact: "Improve capital efficiency and reduce carrying costs",
      effort: "low",
      estimatedSavings: asset.depreciationDetails.monthlyDepreciation * 6,
      assetId: asset.id,
      companyId: asset.companyId,
      createdAt: new Date(),
    };
  }
}
