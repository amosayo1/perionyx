import type { ComplianceRule, ComplianceViolation, Holding, Security } from "../../types";

export class ComplianceService {
  private rules: Map<string, ComplianceRule> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();

  addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  getAllRules(): ComplianceRule[] {
    return [...this.rules.values()];
  }

  getRulesByType(type: ComplianceRule["type"]): ComplianceRule[] {
    return this.getAllRules().filter((r) => r.type === type);
  }

  check(holdings: Holding[], securities: Map<string, Security>, portfolioId: string): ComplianceViolation[] {
    const newViolations: ComplianceViolation[] = [];
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    for (const rule of this.rules.values()) {
      const actual = this.calculateActual(rule, holdings, securities, totalValue);
      const limit = rule.parameters.limit as number;
      if (actual > limit) {
        const violation: ComplianceViolation = {
          id: `viol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          ruleId: rule.id,
          portfolioId,
          severity: rule.severity,
          status: "open",
          description: `Violation of ${rule.name}: ${actual.toFixed(2)} exceeds limit ${limit.toFixed(2)}`,
          actualValue: actual,
          limitValue: limit,
          detectedAt: new Date(),
        };
        newViolations.push(violation);
        this.violations.set(violation.id, violation);
      }
    }
    return newViolations;
  }

  private calculateActual(
    rule: ComplianceRule,
    holdings: Holding[],
    securities: Map<string, Security>,
    totalValue: number,
  ): number {
    const type = rule.type;
    const param = rule.parameters.key as string;

    if (type === "issuer-limit") {
      const relevant = holdings.filter((h) => {
        const sec = securities.get(h.securityId);
        return sec?.issuer === param;
      });
      return (relevant.reduce((sum, h) => sum + h.marketValue, 0) / totalValue) * 100;
    }

    if (type === "sector-limit") {
      const relevant = holdings.filter((h) => {
        const sec = securities.get(h.securityId);
        return sec?.sector === param;
      });
      return (relevant.reduce((sum, h) => sum + h.marketValue, 0) / totalValue) * 100;
    }

    if (type === "credit-rating-limit") {
      const below = holdings.filter((h) => {
        const sec = securities.get(h.securityId);
        return (sec?.creditRating ?? "AAA") < (rule.parameters.minRating as string);
      });
      return (below.reduce((sum, h) => sum + h.marketValue, 0) / totalValue) * 100;
    }

    return 0;
  }

  getViolations(portfolioId?: string): ComplianceViolation[] {
    const all = [...this.violations.values()];
    return portfolioId ? all.filter((v) => v.portfolioId === portfolioId) : all;
  }

  acknowledge(violationId: string): void {
    const v = this.violations.get(violationId);
    if (v) v.status = "acknowledged";
  }

  resolve(violationId: string): void {
    const v = this.violations.get(violationId);
    if (v) {
      v.status = "resolved";
      v.resolvedAt = new Date();
    }
  }

  waive(violationId: string, waivedBy: string, notes?: string): void {
    const v = this.violations.get(violationId);
    if (v) {
      v.status = "waived";
      v.waivedBy = waivedBy;
      v.notes = notes;
    }
  }
}
