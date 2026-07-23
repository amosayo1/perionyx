import { TaxRulesService } from "../domain/tax-rules/tax-rules-service";
import { JurisdictionService } from "../domain/jurisdictions/jurisdictions-service";
import { IndirectTaxService } from "../domain/indirect-tax/indirect-tax-service";
import { DirectTaxService } from "../domain/direct-tax/direct-tax-service";
import { WithholdingService } from "../domain/withholding/withholding-service";
import { TransferPricingService } from "../domain/transfer-pricing/transfer-pricing-service";
import { TaxCalendarService } from "../domain/tax-calendar/tax-calendar-service";
import { TaxReturnsService } from "../domain/tax-returns/tax-returns-service";
import { TaxPaymentsService } from "../domain/tax-payments/tax-payments-service";
import { TaxReconciliationService } from "../domain/tax-reconciliation/tax-reconciliation-service";
import { TaxComplianceService } from "../domain/compliance/compliance-service";
import { AuditService } from "../domain/audit/audit-service";
import { TaxAnalyticsService } from "../domain/analytics/analytics-service";
import { TaxForecastService } from "../domain/forecast/forecast-service";
import type { TaxAggregateMetrics } from "../types";

export class TaxService {
  taxRules: TaxRulesService;
  jurisdictions: JurisdictionService;
  indirectTax: IndirectTaxService;
  directTax: DirectTaxService;
  withholding: WithholdingService;
  transferPricing: TransferPricingService;
  calendar: TaxCalendarService;
  returns: TaxReturnsService;
  payments: TaxPaymentsService;
  reconciliation: TaxReconciliationService;
  compliance: TaxComplianceService;
  audit: AuditService;
  analytics: TaxAnalyticsService;
  forecast: TaxForecastService;

  constructor() {
    this.taxRules = new TaxRulesService();
    this.jurisdictions = new JurisdictionService();
    this.indirectTax = new IndirectTaxService();
    this.directTax = new DirectTaxService();
    this.withholding = new WithholdingService();
    this.transferPricing = new TransferPricingService();
    this.calendar = new TaxCalendarService();
    this.returns = new TaxReturnsService();
    this.payments = new TaxPaymentsService();
    this.reconciliation = new TaxReconciliationService();
    this.compliance = new TaxComplianceService();
    this.audit = new AuditService();
    this.analytics = new TaxAnalyticsService();
    this.forecast = new TaxForecastService();
  }

  getAggregateMetrics(): TaxAggregateMetrics {
    const allAlerts = this.analytics.getAllAlerts();
    const allRecommendations = this.analytics.getAllRecommendations();
    const allCalendarEntries = this.calendar.getAllEntries();
    const allAuthorities = this.jurisdictions.getAllAuthorities();
    const allComplianceRecords = this.compliance.getAllRecords();

    return {
      totalJurisdictions: this.jurisdictions.count(),
      totalAuthorities: allAuthorities.length,
      totalRules: this.taxRules.count(),
      totalTransactions: this.indirectTax.count(),
      totalProvisions: this.directTax.count(),
      totalWithholding: this.withholding.count(),
      totalTransferPricing: this.transferPricing.count(),
      totalReturns: this.returns.count(),
      totalPayments: this.payments.count(),
      totalReconciliations: this.reconciliation.count(),
      totalComplianceRecords: allComplianceRecords.length,
      totalAlerts: allAlerts.length,
      activeAlerts: allAlerts.filter(a => !a.dismissed).length,
      totalRecommendations: allRecommendations.length,
      pendingRecommendations: allRecommendations.filter(r => !r.implemented).length,
      totalUpcomingCalendarEntries: allCalendarEntries.filter(e => e.status === "upcoming").length,
      totalOverdueCalendarEntries: allCalendarEntries.filter(e => e.status === "overdue").length,
      totalNonCompliant: this.compliance.getNonCompliant().length,
      totalAtRisk: this.compliance.getAtRisk().length,
    };
  }
}

export const taxService = new TaxService();
