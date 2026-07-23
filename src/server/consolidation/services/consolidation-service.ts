import { EntityManagementService } from "../domain/entity-management/entity-management-service"
import { GroupStructureService } from "../domain/group-structure/group-structure-service"
import { OwnershipManagementService } from "../domain/ownership-management/ownership-management-service"
import { ConsolidationEngineService } from "../domain/consolidation-engine/consolidation-engine-service"
import { CurrencyTranslationService } from "../domain/currency-translation/currency-translation-service"
import { IntercompanyEliminationsService } from "../domain/intercompany-eliminations/intercompany-eliminations-service"
import { MinorityInterestService } from "../domain/minority-interest/minority-interest-service"
import { EquityAccountingService } from "../domain/equity-accounting/equity-accounting-service"
import { ConsolidationAdjustmentsService } from "../domain/consolidation-adjustments/consolidation-adjustments-service"
import { FinancialStatementsService } from "../domain/financial-statements/financial-statements-service"
import { BoardReportingService } from "../domain/board-reporting/board-reporting-service"
import { ManagementReportingService } from "../domain/management-reporting/management-reporting-service"
import { AnalyticsService } from "../domain/analytics/analytics-service"
import { RecommendationsService } from "../domain/recommendations/recommendations-service"
import { AlertsService } from "../domain/alerts/alerts-service"
import { ExecutiveInsightsService } from "../domain/executive-insights/executive-insights-service"
import type { ExecutiveConsolidationSummary, AggregateConsolidationMetrics } from "../types"

export class ConsolidationService {
  entityManagement: EntityManagementService
  groupStructure: GroupStructureService
  ownership: OwnershipManagementService
  consolidationEngine: ConsolidationEngineService
  currencyTranslation: CurrencyTranslationService
  intercompanyEliminations: IntercompanyEliminationsService
  minorityInterest: MinorityInterestService
  equityAccounting: EquityAccountingService
  consolidationAdjustments: ConsolidationAdjustmentsService
  financialStatements: FinancialStatementsService
  boardReporting: BoardReportingService
  managementReporting: ManagementReportingService
  analytics: AnalyticsService
  recommendations: RecommendationsService
  alerts: AlertsService
  executiveInsights: ExecutiveInsightsService

  constructor() {
    this.entityManagement = new EntityManagementService()
    this.groupStructure = new GroupStructureService()
    this.ownership = new OwnershipManagementService()
    this.consolidationEngine = new ConsolidationEngineService()
    this.currencyTranslation = new CurrencyTranslationService()
    this.intercompanyEliminations = new IntercompanyEliminationsService()
    this.minorityInterest = new MinorityInterestService()
    this.equityAccounting = new EquityAccountingService()
    this.consolidationAdjustments = new ConsolidationAdjustmentsService()
    this.financialStatements = new FinancialStatementsService()
    this.boardReporting = new BoardReportingService()
    this.managementReporting = new ManagementReportingService()
    this.analytics = new AnalyticsService()
    this.recommendations = new RecommendationsService()
    this.alerts = new AlertsService()
    this.executiveInsights = new ExecutiveInsightsService()
  }

  getExecutiveSummary(): ExecutiveConsolidationSummary {
    return this.analytics.calculateExecutiveSummary(
      this.entityManagement.getAll(),
      this.consolidationEngine.getAll(),
      this.intercompanyEliminations.getAll(),
      this.consolidationAdjustments.getAll(),
      this.alerts.getAll(),
      this.managementReporting.getAll(),
    )
  }

  getAggregateMetrics(): AggregateConsolidationMetrics {
    return this.analytics.calculateAggregateMetrics(
      this.entityManagement.getAll(),
      this.consolidationEngine.getAll(),
      this.intercompanyEliminations.getAll(),
      this.consolidationAdjustments.getAll(),
      [],
    )
  }
}

export const consService = new ConsolidationService()
