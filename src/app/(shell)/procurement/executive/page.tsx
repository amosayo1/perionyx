import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExecutiveProcurementHeader } from "../../../../components/procurement/executive-procurement-header";
import { ExecutiveInsights } from "../../../../components/procurement/executive-insights";
import { RecommendationsPanel } from "../../../../components/procurement/recommendations-panel";
import { AlertsPanel } from "../../../../components/procurement/alerts-panel";

export default function ExecutivePage() {
  const allVendors = procurementService.vendors.getAllVendors();
  const allOrders = procurementService.purchaseOrders.getAllPOs();
  const allInvoices = procurementService.invoiceMatching.getAllInvoices();
  const allApprovals = procurementService.approvals.getAllApprovals();
  const allKPIs = procurementService.expenses.getAllKPIs();
  const allAlerts = procurementService.analytics.getAllAlerts();
  const recommendations = procurementService.analytics.getAllRecommendations();
  const allAnalytics = procurementService.expenses.getAllAnalytics();
  const allContracts = procurementService.contracts.getAllContracts();

  const totalSpend = allAnalytics.reduce((s, a) => s + a.totalSpend, 0);
  const totalSavings = allAnalytics.reduce((s, a) => s + a.savingsAmount, 0);
  const savingsPercent = totalSpend > 0 ? (totalSavings / totalSpend) * 100 : 0;
  const activeVendors = allVendors.filter((v) => v.status === "active").length;
  const openPOs = allOrders.filter((o) => ["draft", "approved", "sent", "acknowledged", "partially-received"].includes(o.status)).length;
  const pendingInvoices = allInvoices.filter((i) => ["draft", "submitted"].includes(i.status)).length;
  const matchExceptions = allInvoices.filter((i) => i.matchStatus === "exception").length;
  const vendorAtRisk = allVendors.filter((v) => v.riskLevel === "high" || v.riskLevel === "critical").length;
  const expiringContracts = allContracts.filter((c) => {
    if (c.status !== "active") return false;
    const daysToExpiry = Math.ceil((c.endDate.getTime() - Date.now()) / 86400000);
    return daysToExpiry > 0 && daysToExpiry <= 30;
  }).length;
  const approvalBottlenecks = allApprovals.filter((a) => a.status === "pending" && a.dueDate < new Date()).length;

  const activeAlerts = allAlerts.filter((a) => !a.dismissed);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const recentRecommendations = recommendations.filter((r) => !r.implemented).slice(0, 5);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive View" description="C-suite procurement intelligence overview" />
      <div className="mt-6 space-y-6">
        <ExecutiveProcurementHeader totalSpend={totalSpend} activeVendors={activeVendors} openPOs={openPOs} pendingInvoices={pendingInvoices} matchExceptions={matchExceptions} />
        <ExecutiveInsights
          metrics={{ totalVendors: allVendors.length, activeVendors, totalPOs: allOrders.length, openPOs, totalInvoices: allInvoices.length, pendingInvoices, totalReceipts: procurementService.getTotalReceipts(), pendingReceipts: 0, totalContracts: allContracts.length, activeContracts: allContracts.filter((c) => c.status === "active").length, totalSpend, pendingApprovals: allApprovals.filter((a) => a.status === "pending").length, matchExceptions, blockedVendors: allVendors.filter((v) => v.isBlocked).length }}
          totalSpend={totalSpend} spendGrowth={10} avgSavingsPercent={savingsPercent} vendorAtRisk={vendorAtRisk} expiringContracts={expiringContracts} approvalBottlenecks={approvalBottlenecks}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertsPanel alerts={criticalAlerts} />
          <RecommendationsPanel recommendations={recentRecommendations} />
        </div>
      </div>
    </PageContainer>
  );
}
