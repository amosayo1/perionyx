import { InvoicesService } from "../domain/invoices/invoices-service";
import { ReceiptsService } from "../domain/receipts/receipts-service";
import { CashApplicationService } from "../domain/cash-application/cash-application-service";
import { CollectionsService } from "../domain/collections/collections-service";
import { CustomerCreditService } from "../domain/customer-credit/customer-credit-service";
import { DisputesService } from "../domain/disputes/disputes-service";
import { AdjustmentsService } from "../domain/adjustments/adjustments-service";
import { WriteOffsService } from "../domain/write-offs/write-offs-service";
import { StatementsService } from "../domain/statements/statements-service";
import { AnalyticsService } from "../domain/analytics/analytics-service";
import { ForecastingService } from "../domain/forecasting/forecasting-service";
import { RecommendationsService } from "../domain/recommendations/recommendations-service";
import { AlertsService } from "../domain/alerts/alerts-service";
import { ReportingService } from "../domain/reporting/reporting-service";
import { GLIntegrationService } from "../domain/gl-integration/gl-integration-service";
import { TreasuryIntegrationService } from "../domain/treasury-integration/treasury-integration-service";
import { TaxIntegrationService } from "../domain/tax-integration/tax-integration-service";
import { CustomersService } from "../domain/customers/customers-service";
import type { ARAggregateMetrics, ARExecutiveSummary } from "../types";

export class AccountsReceivableService {
  customers: CustomersService;
  invoices: InvoicesService;
  receipts: ReceiptsService;
  cashApplication: CashApplicationService;
  collections: CollectionsService;
  credit: CustomerCreditService;
  disputes: DisputesService;
  adjustments: AdjustmentsService;
  writeOffs: WriteOffsService;
  statements: StatementsService;
  analytics: AnalyticsService;
  forecasting: ForecastingService;
  recommendations: RecommendationsService;
  alerts: AlertsService;
  reporting: ReportingService;
  glIntegration: GLIntegrationService;
  treasuryIntegration: TreasuryIntegrationService;
  taxIntegration: TaxIntegrationService;

  constructor() {
    this.customers = new CustomersService();
    this.invoices = new InvoicesService();
    this.receipts = new ReceiptsService();
    this.cashApplication = new CashApplicationService();
    this.collections = new CollectionsService();
    this.credit = new CustomerCreditService();
    this.disputes = new DisputesService();
    this.adjustments = new AdjustmentsService();
    this.writeOffs = new WriteOffsService();
    this.statements = new StatementsService();
    this.analytics = new AnalyticsService();
    this.forecasting = new ForecastingService();
    this.recommendations = new RecommendationsService();
    this.alerts = new AlertsService();
    this.reporting = new ReportingService();
    this.glIntegration = new GLIntegrationService();
    this.treasuryIntegration = new TreasuryIntegrationService();
    this.taxIntegration = new TaxIntegrationService();
  }

  getAggregateMetrics(): ARAggregateMetrics {
    return this.analytics.calculateAggregateMetrics(
      this.invoices.getAll(),
      this.receipts.getAll(),
      this.collections.getAll(),
      this.disputes.getAll(),
      this.writeOffs.getAll(),
      this.customers.getAll(),
      this.credit.getAll(),
    );
  }

  getExecutiveSummary(): ARExecutiveSummary {
    return this.analytics.calculateExecutiveSummary(
      this.invoices.getAll(),
      this.receipts.getAll(),
      this.collections.getAll(),
      this.disputes.getAll(),
      this.credit.getAll(),
      this.forecasting.getAll(),
    );
  }
}

export const arService = new AccountsReceivableService();
