import { taxService } from "../../../server/tax";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { TaxOverview } from "../../../components/tax/tax-overview";
import { ComplianceDashboard } from "../../../components/tax/compliance-dashboard";
import { AlertsPanel } from "../../../components/tax/alerts-panel";
import { RecommendationsPanel } from "../../../components/tax/recommendations-panel";
import type { TaxOverviewMetrics } from "../../../components/tax/tax-types";

export default async function TaxManagementPage() {
  const jurisdictions = taxService.jurisdictions.getAllJurisdictions();
  const rules = taxService.taxRules.getAllRules();
  const transactions = taxService.indirectTax.getAllTransactions();
  const provisions = taxService.directTax.getAllProvisions();
  const withholding = taxService.withholding.getAllRecords();
  const returns = taxService.returns.getAllReturns();
  const payments = taxService.payments.getAllPayments();
  const compliance = taxService.compliance.getAllRecords();
  const alerts = taxService.analytics.getAllAlerts();
  const recommendations = taxService.analytics.getAllRecommendations();

  const vatCollected = transactions.filter(t => t.taxType === "vat" || t.taxType === "gst" || t.taxType === "sales-tax").reduce((s, t) => s + t.outputTax, 0);
  const vatPaid = transactions.filter(t => t.taxType === "vat" || t.taxType === "gst" || t.taxType === "sales-tax").reduce((s, t) => s + t.inputTax, 0);
  const corporateTax = provisions.filter(p => p.provisionType === "current").reduce((s, p) => s + p.taxPayable, 0);
  const deferredTax = provisions.filter(p => p.provisionType === "deferred").reduce((s, p) => s + p.deferredTaxLiability, 0);
  const complianceScore = compliance.length > 0 ? Math.round(compliance.reduce((s, r) => s + r.complianceScore, 0) / compliance.length) : 0;
  const atRiskJurisdictions = compliance.filter(r => r.status === "at-risk" || r.status === "non-compliant").length;
  const calendarEntries = taxService.calendar.getAllEntries();
  const upcomingDeadlines = calendarEntries.filter(e => e.status === "upcoming").length;
  const overdueDeadlines = calendarEntries.filter(e => e.status === "overdue").length;

  const metrics: TaxOverviewMetrics = {
    totalJurisdictions: jurisdictions.length,
    activeRules: rules.filter(r => r.isActive).length,
    totalTransactions: transactions.length,
    totalVatCollected: vatCollected,
    totalVatPaid: vatPaid,
    netVat: vatCollected - vatPaid,
    totalCorporateTax: corporateTax,
    totalDeferredTax: deferredTax,
    totalWithholding: withholding.length,
    totalTransferPricing: taxService.transferPricing.count(),
    totalReturns: returns.length,
    returnsSubmitted: returns.filter(r => r.status === "submitted").length,
    returnsDraft: returns.filter(r => r.status === "draft").length,
    totalPayments: payments.length,
    paymentsPaid: payments.filter(p => p.status === "paid").length,
    paymentsOverdue: payments.filter(p => p.status === "pending" || p.status === "scheduled").filter(p => p.dueDate < new Date()).length,
    complianceScore,
    atRiskJurisdictions,
    upcomingDeadlines,
    overdueDeadlines,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Tax Management" description="Enterprise-wide tax compliance, filing, and intelligence" />
      <TaxOverview metrics={metrics} />
      <ComplianceDashboard records={compliance} />
      <AlertsPanel alerts={alerts} />
      <RecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  );
}
