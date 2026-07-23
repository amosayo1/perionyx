import type { TaxRule, TaxType, TaxCategory, TaxRateType } from "../../types";

export class TaxRulesService {
  private rules = new Map<string, TaxRule>();

  addRule(rule: TaxRule): TaxRule {
    this.rules.set(rule.id, rule);
    return rule;
  }

  getRule(id: string): TaxRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): TaxRule[] {
    return Array.from(this.rules.values());
  }

  getByJurisdiction(jurisdictionId: string): TaxRule[] {
    return this.getAllRules().filter(r => r.jurisdictionId === jurisdictionId);
  }

  getByTaxType(taxType: TaxType): TaxRule[] {
    return this.getAllRules().filter(r => r.taxType === taxType);
  }

  getByCategory(category: TaxCategory): TaxRule[] {
    return this.getAllRules().filter(r => r.taxCategory === category);
  }

  getActiveRules(): TaxRule[] {
    return this.getAllRules().filter(r => r.isActive);
  }

  getEffectiveRate(jurisdictionId: string, taxType: TaxType, date: Date): TaxRule | undefined {
    return this.getAllRules().find(r =>
      r.jurisdictionId === jurisdictionId &&
      r.taxType === taxType &&
      r.isActive &&
      r.effectiveFrom <= date &&
      (!r.effectiveTo || r.effectiveTo >= date)
    );
  }

  search(query: string): TaxRule[] {
    const q = query.toLowerCase();
    return this.getAllRules().filter(r =>
      r.description.toLowerCase().includes(q) ||
      r.jurisdictionId.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.rules.size;
  }
}
