import type { ConsolidationRecommendation, RecommendationType, IntercompanyRecord, CurrencyTranslationRun, OwnershipRecord } from "../../types";

export class RecommendationsService {
  private recommendations = new Map<string, ConsolidationRecommendation>();

  add(rec: ConsolidationRecommendation): ConsolidationRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  get(id: string): ConsolidationRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAll(): ConsolidationRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: RecommendationType): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByPriority(priority: string): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.priority === priority);
  }

  getActive(): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.status === "active");
  }

  getImplemented(): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.status === "implemented");
  }

  getByConsolidationRun(runId: string): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.consolidationRunId === runId);
  }

  getByEntity(entityId: string): ConsolidationRecommendation[] {
    return this.getAll().filter((r) => r.entityId === entityId);
  }

  count(): number {
    return this.recommendations.size;
  }

  update(id: string, updates: Partial<ConsolidationRecommendation>): ConsolidationRecommendation {
    const existing = this.recommendations.get(id);
    if (!existing) throw new Error(`Recommendation ${id} not found`);
    const updated = { ...existing, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.recommendations.delete(id);
  }

  dismiss(id: string): void {
    this.update(id, { status: "dismissed" });
  }

  implement(id: string): void {
    this.update(id, { status: "implemented" });
  }

  generateEliminationRecommendation(icRecords: IntercompanyRecord[]): ConsolidationRecommendation[] {
    const recs: ConsolidationRecommendation[] = [];
    const unmatched = icRecords.filter((r) => r.status === "unmatched");
    for (const r of unmatched.slice(0, 20)) {
      recs.push({
        id: `rec-elim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "elimination",
        title: `Unmatched IC transaction: ${r.intercompanyType}`,
        description: `${r.fromEntityId} -> ${r.toEntityId}: ${r.fromAmount} ${r.currency} (diff: ${r.difference})`,
        priority: Math.abs(r.difference) > 100000 ? "critical" : Math.abs(r.difference) > 10000 ? "high" : "medium",
        status: "active",
        impact: `Unmatched amount: ${Math.abs(r.difference).toLocaleString()} ${r.currency}`,
        effort: "medium",
        consolidationRunId: r.consolidationRunId,
        entityId: r.fromEntityId,
        companyId: r.companyId,
        createdAt: new Date(),
      });
    }
    return recs;
  }

  generateTranslationRecommendation(translations: CurrencyTranslationRun[]): ConsolidationRecommendation[] {
    const recs: ConsolidationRecommendation[] = [];
    for (const t of translations.filter((tr) => tr.status !== "approved")) {
      const rateSpread = Math.abs(t.averageRate - t.closingRate);
      recs.push({
        id: `rec-trans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "translation",
        title: `Translation pending: ${t.sourceCurrency} -> ${t.targetCurrency}`,
        description: `Method: ${t.translationMethod}. Avg rate: ${t.averageRate}, Close rate: ${t.closingRate}. Spread: ${rateSpread.toFixed(4)}. CTA: ${t.ctaAmount}.`,
        priority: rateSpread > 0.1 ? "high" : "medium",
        status: "active",
        impact: `CTA impact: ${Math.abs(t.ctaAmount).toLocaleString()}`,
        effort: "low",
        consolidationRunId: t.consolidationRunId,
        companyId: t.companyId,
        createdAt: new Date(),
      });
    }
    return recs;
  }

  generateOwnershipRecommendation(ownerships: OwnershipRecord[]): ConsolidationRecommendation[] {
    const recs: ConsolidationRecommendation[] = [];
    for (const o of ownerships) {
      if (o.ownershipPercentage < 50 && o.consolidationMethod === "full") {
        recs.push({
          id: `rec-own-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "ownership",
          title: `Ownership inconsistency: ${o.parentEntityId} -> ${o.subsidiaryEntityId}`,
          description: `Ownership ${o.ownershipPercentage}% but method is full consolidation. Verify control assessment.`,
          priority: "high",
          status: "active",
          impact: "May require restatement if consolidation method is incorrect",
          effort: "medium",
          consolidationRunId: o.id,
          entityId: o.subsidiaryEntityId,
          companyId: o.companyId,
          createdAt: new Date(),
        });
      }
      if (o.ownershipType === "cross") {
        recs.push({
          id: `rec-own-cross-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "ownership",
          title: `Cross ownership detected: ${o.parentEntityId} / ${o.subsidiaryEntityId}`,
          description: `Cross ownership requires special elimination treatment. Percentage: ${o.ownershipPercentage}%.`,
          priority: "medium",
          status: "active",
          impact: "Cross ownership may require complex elimination entries",
          effort: "high",
          consolidationRunId: o.id,
          entityId: o.subsidiaryEntityId,
          companyId: o.companyId,
          createdAt: new Date(),
        });
      }
    }
    return recs;
  }
}
