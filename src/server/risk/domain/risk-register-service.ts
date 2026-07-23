import type {
  EnterpriseRisk,
  Recommendation,
  Alert,
  BusinessUnit,
  Entity,
  RegisterType,
  RiskCategory,
  RiskStatus,
} from "../types";

export class RiskRegisterService {
  private risks = new Map<string, EnterpriseRisk>();
  private recommendations = new Map<string, Recommendation>();
  private alerts = new Map<string, Alert>();
  private businessUnits = new Map<string, BusinessUnit>();
  private entities = new Map<string, Entity>();

  addRisk(risk: EnterpriseRisk): void {
    this.risks.set(risk.id, risk);
  }

  getRisk(id: string): EnterpriseRisk | undefined {
    return this.risks.get(id);
  }

  getAllRisks(): EnterpriseRisk[] {
    return [...this.risks.values()];
  }

  getRisksByCategory(category: RiskCategory): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) => r.category === category);
  }

  getRisksByStatus(status: RiskStatus): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) => r.status === status);
  }

  getRisksByRegister(registerType: RegisterType): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) => r.registerType === registerType);
  }

  getRisksByPriority(priority: string): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) => r.priority === priority);
  }

  getRisksByOwner(owner: string): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) =>
      r.owner.toLowerCase().includes(owner.toLowerCase()),
    );
  }

  getRisksByBusinessUnit(businessUnit: string): EnterpriseRisk[] {
    return this.getAllRisks().filter((r) => r.businessUnit === businessUnit);
  }

  getOverdueReviewRisks(): EnterpriseRisk[] {
    const now = new Date();
    return this.getAllRisks().filter((r) => r.nextReviewDate < now);
  }

  addRecommendation(rec: Recommendation): void {
    this.recommendations.set(rec.id, rec);
  }

  getRecommendation(id: string): Recommendation | undefined {
    return this.recommendations.get(id);
  }

  getAllRecommendations(): Recommendation[] {
    return [...this.recommendations.values()];
  }

  getRecommendationsByRiskId(riskId: string): Recommendation[] {
    return this.getAllRecommendations().filter((r) => r.riskId === riskId);
  }

  addAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
  }

  getAlert(id: string): Alert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts.values()];
  }

  getActiveAlerts(): Alert[] {
    return this.getAllAlerts().filter((a) => a.status === "active");
  }

  getAlertsBySeverity(severity: string): Alert[] {
    return this.getAllAlerts().filter((a) => a.severity === severity);
  }

  addBusinessUnit(bu: BusinessUnit): void {
    this.businessUnits.set(bu.id, bu);
  }

  getBusinessUnit(id: string): BusinessUnit | undefined {
    return this.businessUnits.get(id);
  }

  getAllBusinessUnits(): BusinessUnit[] {
    return [...this.businessUnits.values()];
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return [...this.entities.values()];
  }
}
