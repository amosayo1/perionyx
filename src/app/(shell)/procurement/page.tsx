import { procurementService } from "../../../server/procurement";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { ExecutiveProcurementHeader } from "../../../components/procurement/executive-procurement-header";
import { ProcurementOverview } from "../../../components/procurement/procurement-overview";
import { AlertsPanel } from "../../../components/procurement/alerts-panel";
import { RecommendationsPanel } from "../../../components/procurement/recommendations-panel";
import type { ProcurementOverviewMetrics } from "../../../components/procurement/procurement-types";

export default function ProcurementPage() {
  const vendors = procurementService.vendors.getAllVendors();
  const orders = procurementService.purchaseOrders.getAllPOs();
  const invoices = procurementService.invoiceMatching.getAllInvoices();
  const receipts = procurementService.receiving.getAllReceipts();
  const contracts = procurementService.contracts.getAllContracts();
  const allApprovals = procurementService.approvals.getAllApprovals();
  const allAnalytics = procurementService.expenses.getAllAnalytics();
  const activeAlerts = procurementService.analytics.getActiveAlerts();
  const recommendations = procurementService.analytics.getAllRecommendations();

  const totalSpend = allAnalytics.reduce((s, a) => s + a.totalSpend, 0);
  const activeVendors = vendors.filter((v) => v.status === "active").length;
  const openPOs = orders.filter((o) => ["draft", "approved", "sent", "acknowledged", "partially-received"].includes(o.status)).length;
  const pendingInvoices = invoices.filter((i) => ["draft", "submitted"].includes(i.status)).length;
  const pendingApprovals = allApprovals.filter((a) => a.status === "pending").length;
  const matchExceptions = invoices.filter((i) => i.matchStatus === "exception").length;
  const blockedVendors = vendors.filter((v) => v.isBlocked).length;

  const metrics: ProcurementOverviewMetrics = {
    totalVendors: vendors.length,
    activeVendors,
    totalPOs: orders.length,
    openPOs,
    totalInvoices: invoices.length,
    pendingInvoices,
    totalReceipts: receipts.length,
    pendingReceipts: receipts.filter((r) => r.status === "partial").length,
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c) => c.status === "active").length,
    totalSpend,
    pendingApprovals,
    matchExceptions,
    blockedVendors,
  };

  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const recentRecommendations = recommendations.filter((r) => !r.implemented).slice(0, 5);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Procurement" description="Enterprise procure-to-pay operations" />
      <div className="mt-6 space-y-6">
        <ExecutiveProcurementHeader totalSpend={totalSpend} activeVendors={activeVendors} openPOs={openPOs} pendingInvoices={pendingInvoices} matchExceptions={matchExceptions} />
        <ProcurementOverview metrics={metrics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertsPanel alerts={criticalAlerts} />
          <RecommendationsPanel recommendations={recentRecommendations} />
        </div>
      </div>
    </PageContainer>
  );
}
