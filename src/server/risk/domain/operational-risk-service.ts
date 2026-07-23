import type {
  OperationalRiskData,
  PolicyViolation,
  Control,
  Escalation,
  Limit,
} from "../types";

export class OperationalRiskService {
  private operationalData = new Map<string, OperationalRiskData>();
  private controls = new Map<string, Control>();

  addOperationalData(data: OperationalRiskData): void {
    this.operationalData.set(data.riskId, data);
  }

  getOperationalData(riskId: string): OperationalRiskData | undefined {
    return this.operationalData.get(riskId);
  }

  getAllOperationalData(): OperationalRiskData[] {
    return [...this.operationalData.values()];
  }

  getBySubType(subType: string): OperationalRiskData[] {
    return this.getAllOperationalData().filter(
      (d) => d.subType === subType,
    );
  }

  addControl(control: Control): void {
    this.controls.set(control.id, control);
  }

  getControl(id: string): Control | undefined {
    return this.controls.get(id);
  }

  getAllControls(): Control[] {
    return [...this.controls.values()];
  }

  getControlsByRiskId(riskId: string): Control[] {
    return this.getAllControls().filter((c) => c.riskId === riskId);
  }

  getTotalOperationalLoss(): number {
    return [...this.operationalData.values()].reduce(
      (sum, d) => sum + d.operationalLoss,
      0,
    );
  }

  getNearMissCount(): number {
    return this.getAllOperationalData().filter((d) => d.isNearMiss).length;
  }
}

export class LimitsService {
  private limits = new Map<string, Limit>();
  private escalations = new Map<string, Escalation>();

  addLimit(limit: Limit): void {
    this.limits.set(limit.id, limit);
  }

  getLimit(id: string): Limit | undefined {
    return this.limits.get(id);
  }

  getAllLimits(): Limit[] {
    return [...this.limits.values()];
  }

  getLimitsByType(type: string): Limit[] {
    return this.getAllLimits().filter((l) => l.type === type);
  }

  getBreachedLimits(): Limit[] {
    return this.getAllLimits().filter(
      (l) => l.status === "breached" || l.status === "exceeded",
    );
  }

  addEscalation(escalation: Escalation): void {
    this.escalations.set(escalation.id, escalation);
  }

  getEscalation(id: string): Escalation | undefined {
    return this.escalations.get(id);
  }

  getAllEscalations(): Escalation[] {
    return [...this.escalations.values()];
  }

  getOpenEscalations(): Escalation[] {
    return this.getAllEscalations().filter((e) => e.status === "open");
  }
}

export class ComplianceRiskService {
  private violations = new Map<string, PolicyViolation>();

  addViolation(violation: PolicyViolation): void {
    this.violations.set(violation.id, violation);
  }

  getViolation(id: string): PolicyViolation | undefined {
    return this.violations.get(id);
  }

  getAllViolations(): PolicyViolation[] {
    return [...this.violations.values()];
  }

  getViolationsByStatus(status: string): PolicyViolation[] {
    return this.getAllViolations().filter((v) => v.status === status);
  }

  getViolationsBySeverity(severity: string): PolicyViolation[] {
    return this.getAllViolations().filter((v) => v.severity === severity);
  }

  getActiveViolations(): PolicyViolation[] {
    return this.getAllViolations().filter(
      (v) => v.status === "non-compliant" || v.status === "pending-review",
    );
  }
}
