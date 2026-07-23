import { RiskRegisterService as OldRiskRegisterService } from "../domain/risk-register-service";
import { MarketRiskService } from "../domain/market-risk-service";
import { CreditRiskService } from "../domain/credit-risk-service";
import { LiquidityRiskService } from "../domain/liquidity-risk-service";
import {
  OperationalRiskService,
  LimitsService,
  ComplianceRiskService,
} from "../domain/operational-risk-service";
import { StressTestingService } from "../domain/stress-testing-service";
import { AnalyticsService } from "../domain/analytics-service";
import { RiskRegisterService } from "../domain/risk-register/risk-register-service";
import { RiskAssessmentService } from "../domain/risk-assessment/risk-assessment-service";
import { RiskResponseService } from "../domain/risk-response/risk-response-service";
import { RiskControlService } from "../domain/risk-controls/risk-controls-service";
import { RiskIncidentService } from "../domain/risk-incidents/risk-incidents-service";
import { RiskIndicatorService } from "../domain/risk-indicators/risk-indicators-service";
import { RiskReportService } from "../domain/risk-reporting/risk-reporting-service";
import { RiskScenarioService } from "../domain/risk-scenarios/risk-scenarios-service";
import { RiskHeatmapService } from "../domain/risk-heatmap/risk-heatmap-service";
import { RiskAnalyticsService } from "../domain/risk-analytics/analytics-service";
import type { RiskAggregateMetrics } from "../types";

export class RiskService {
  register: OldRiskRegisterService;
  market: MarketRiskService;
  credit: CreditRiskService;
  liquidity: LiquidityRiskService;
  operational: OperationalRiskService;
  limits: LimitsService;
  compliance: ComplianceRiskService;
  stressTesting: StressTestingService;
  analytics: AnalyticsService;
  riskRegister: RiskRegisterService;
  riskAssessment: RiskAssessmentService;
  riskResponse: RiskResponseService;
  riskControl: RiskControlService;
  riskIncident: RiskIncidentService;
  riskIndicator: RiskIndicatorService;
  riskReport: RiskReportService;
  riskScenario: RiskScenarioService;
  riskHeatmap: RiskHeatmapService;
  riskAnalytics: RiskAnalyticsService;

  constructor() {
    this.register = new OldRiskRegisterService();
    this.market = new MarketRiskService();
    this.credit = new CreditRiskService();
    this.liquidity = new LiquidityRiskService();
    this.operational = new OperationalRiskService();
    this.limits = new LimitsService();
    this.compliance = new ComplianceRiskService();
    this.stressTesting = new StressTestingService();
    this.analytics = new AnalyticsService();
    this.riskRegister = new RiskRegisterService();
    this.riskAssessment = new RiskAssessmentService();
    this.riskResponse = new RiskResponseService();
    this.riskControl = new RiskControlService();
    this.riskIncident = new RiskIncidentService();
    this.riskIndicator = new RiskIndicatorService();
    this.riskReport = new RiskReportService();
    this.riskScenario = new RiskScenarioService();
    this.riskHeatmap = new RiskHeatmapService();
    this.riskAnalytics = new RiskAnalyticsService();
  }

  getEnterpriseRiskScore(): number {
    return this.analytics.computeEnterpriseRiskScore(
      this.register.getAllRisks(),
    );
  }

  getResidualRiskScore(): number {
    return this.analytics.computeResidualRisk(this.register.getAllRisks());
  }

  getOpenRiskCount(): number {
    return this.analytics.computeOpenRiskCount(this.register.getAllRisks());
  }

  getCriticalRiskCount(): number {
    return this.analytics.computeCriticalRiskCount(this.register.getAllRisks());
  }

  getRiskTrend(): "improving" | "deteriorating" | "stable" {
    const risks = this.register.getAllRisks();
    const current = this.analytics.computeEnterpriseRiskScore(risks);
    const previous = this.analytics.computeEnterpriseRiskScore(
      risks.map((r) => ({
        ...r,
        score: {
          ...r.score,
          weightedScore: r.score.weightedScore * 0.95,
        },
      })),
    );
    return this.analytics.computeTrend(current, previous);
  }

  getAggregateMetrics(): RiskAggregateMetrics {
    return {
      totalRisks: this.riskRegister.count(),
      openRisks: this.riskRegister.getOpenRisks().length,
      criticalRisks: this.riskRegister.getCriticalRisks().length,
      highRisks: this.riskRegister.getByLevel("high").length,
      totalControls: this.riskControl.count(),
      ineffectiveControls: this.riskControl.getIneffective().length,
      totalIncidents: this.riskIncident.count(),
      openIncidents: this.riskIncident.getOpen().length,
      totalAssessments: this.riskAssessment.count(),
      totalScenarios: this.riskScenario.count(),
      kriBreaches: this.riskIndicator.getBreaches().length,
    };
  }
}

export const riskService = new RiskService();
