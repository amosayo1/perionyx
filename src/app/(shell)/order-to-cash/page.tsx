import { orderToCashService } from "../../../server/order-to-cash";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { ExecutiveRevenueHeader } from "../../../components/order-to-cash/executive-revenue-header";
import { RevenueOverview } from "../../../components/order-to-cash/revenue-overview";
import { AlertsPanel } from "../../../components/order-to-cash/alerts-panel";
import { RecommendationsPanel } from "../../../components/order-to-cash/recommendations-panel";

export default function OrderToCashPage() {
  const customers = orderToCashService.customers.getAllCustomers();
  const orders = orderToCashService.salesOrders.getAllOrders();
  const invoices = orderToCashService.billing.getAllInvoices();
  const ar = orderToCashService.ar.getAllARRecords();
  const collections = orderToCashService.collections.getAllCases();
  const revenue = orderToCashService.revenueRecognition.getAllSchedules();
  const cashReceipts = orderToCashService.cashApplication.getAllReceipts();
  const creditProfiles = orderToCashService.credit.getAllProfiles();
  const activeAlerts = orderToCashService.analytics.getAllAlerts().filter((a) => !a.dismissed);
  const recommendations = orderToCashService.analytics.getAllRecommendations().filter((r) => !r.implemented);

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const totalAR = ar.reduce((s, a) => s + a.amountOutstanding, 0);
  const overdueAR = ar.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amountOutstanding, 0);
  const cashCollected = cashReceipts.filter((r) => r.status === "applied").reduce((s, r) => s + r.amount, 0);
  const dso = totalRevenue > 0 ? totalAR / (totalRevenue / 365) : 0;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const openInvoices = invoices.filter((i) => i.arStatus === "open").length;
  const overdueInvoices = invoices.filter((i) => i.arStatus === "overdue").length;

  const metrics: import("../../../components/order-to-cash/o2c-types").O2COverviewMetrics = {
    totalCustomers: customers.length, activeCustomers, totalOrders: orders.length,
    openOrders: orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length,
    totalInvoices: invoices.length, openInvoices, overdueInvoices,
    totalAR, overdueAR, dso: Math.round(dso * 100) / 100,
    cashCollected, unappliedCash: cashReceipts.filter((r) => r.unappliedAmount > 0).reduce((s, r) => s + r.unappliedAmount, 0),
    collectionCases: collections.length, revenueDeferred: revenue.filter((r) => r.status === "deferred").reduce((s, r) => s + r.deferredAmount, 0),
  };

  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const recentRecommendations = recommendations.slice(0, 5);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Order-to-Cash" description="Enterprise revenue lifecycle management" />
      <div className="mt-6 space-y-6">
        <ExecutiveRevenueHeader
          totalRevenue={totalRevenue}
          openAR={totalAR}
          overdueAR={overdueAR}
          dso={Math.round(dso * 100) / 100}
          cashCollected={cashCollected}
        />
        <RevenueOverview metrics={metrics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertsPanel alerts={criticalAlerts} />
          <RecommendationsPanel recommendations={recentRecommendations} />
        </div>
      </div>
    </PageContainer>
  );
}
