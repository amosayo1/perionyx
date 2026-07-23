import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExecutiveTaxHeader } from "../../../../components/tax/executive-tax-header";
import { TaxFilters } from "../../../../components/tax/tax-filters";
import { TaxOverview } from "../../../../components/tax/tax-overview";
import type { TaxOverviewMetrics } from "../../../../components/tax/tax-types";

export default async function TaxOverviewPage() {
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

  const totalTaxLiability = returns.reduce((sum, r) => sum + r.totalLiability, 0);
  const effectiveTaxRate = provisions.length > 0
    ? provisions.reduce((sum, p) => sum + (p.taxableIncome > 0 ? (p.taxPayable / p.taxableIncome) * 100 : 0), 0) / provisions.length
    : 0;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Tax Overview" description="High-level tax position and compliance summary" />
      <ExecutiveTaxHeader
        totalTaxLiability={totalTaxLiability}
        effectiveTaxRate={Math.round(effectiveTaxRate * 100) / 100}
        vatCollected={vatCollected}
        vatPaid={vatPaid}
        corporateTax={corporateTax}
        deferredTax={deferredTax}
        complianceScore={complianceScore}
        upcomingDeadlines={upcomingDeadlines}
      />
      <TaxFilters />
      <TaxOverview metrics={metrics} />
    </PageContainer>
  );
}
