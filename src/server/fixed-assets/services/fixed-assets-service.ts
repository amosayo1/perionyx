import { AssetRegistryService } from "../domain/asset-registry/asset-registry-service";
import { AcquisitionService } from "../domain/acquisition/acquisition-service";
import { CapitalizationService } from "../domain/capitalization/capitalization-service";
import { DepreciationService } from "../domain/depreciation/depreciation-service";
import { ImpairmentService } from "../domain/impairment/impairment-service";
import { TransfersService } from "../domain/transfers/transfers-service";
import { MaintenanceService } from "../domain/maintenance/maintenance-service";
import { DisposalsService } from "../domain/disposals/disposals-service";
import { RevaluationService } from "../domain/revaluation/revaluation-service";
import { LeaseAccountingReadinessService } from "../domain/lease-accounting-readiness/lease-accounting-readiness-service";
import { AnalyticsService } from "../domain/analytics/analytics-service";
import { RecommendationsService } from "../domain/recommendations/recommendations-service";
import { AlertsService } from "../domain/alerts/alerts-service";
import { ExecutiveInsightsService } from "../domain/executive-insights/executive-insights-service";
import { RepositoriesService } from "../domain/repositories/repositories-service";
import type { AggregateAssetMetrics, ExecutiveAssetSummary } from "../types";

export class FixedAssetsService {
  registry: AssetRegistryService;
  acquisition: AcquisitionService;
  capitalization: CapitalizationService;
  depreciation: DepreciationService;
  impairment: ImpairmentService;
  transfers: TransfersService;
  maintenance: MaintenanceService;
  disposals: DisposalsService;
  revaluation: RevaluationService;
  leaseReadiness: LeaseAccountingReadinessService;
  analytics: AnalyticsService;
  recommendations: RecommendationsService;
  alerts: AlertsService;
  executiveInsights: ExecutiveInsightsService;
  repositories: RepositoriesService;

  constructor() {
    this.registry = new AssetRegistryService();
    this.acquisition = new AcquisitionService();
    this.capitalization = new CapitalizationService();
    this.depreciation = new DepreciationService();
    this.impairment = new ImpairmentService();
    this.transfers = new TransfersService();
    this.maintenance = new MaintenanceService();
    this.disposals = new DisposalsService();
    this.revaluation = new RevaluationService();
    this.leaseReadiness = new LeaseAccountingReadinessService();
    this.analytics = new AnalyticsService();
    this.recommendations = new RecommendationsService();
    this.alerts = new AlertsService();
    this.executiveInsights = new ExecutiveInsightsService();
    this.repositories = new RepositoriesService();
  }

  getAggregateMetrics(): AggregateAssetMetrics {
    return this.analytics.calculateAggregateMetrics(this.registry.getAll());
  }

  getExecutiveSummary(): ExecutiveAssetSummary {
    return this.analytics.calculateExecutiveSummary(this.registry.getAll());
  }
}

export const faService = new FixedAssetsService();
