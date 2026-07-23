import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExecutiveRevenueHeader } from "../../../../components/order-to-cash/executive-revenue-header";
import { ExecutiveInsights } from "../../../../components/order-to-cash/executive-insights";
import { AlertsPanel } from "../../../../components/order-to-cash/alerts-panel";
import { RecommendationsPanel } from "../../../../components/order-to-cash/recommendations-panel";

export default function ExecutivePage() {
  const customers = orderToCashService.customers.getAllCustomers();
  const orders = orderToCashService.salesOrders.getAllOrders();
  const ar = orderToCashService.ar.getAllARRecords();
  const receipts = orderToCashService.cashApplication.getAllReceipts();
  const kpis = orderToCashService.analytics.getAllKPIs();
  const alerts = orderToCashService.analytics.getActiveAlerts();
  const recommendations = orderToCashService.analytics.getAllRecommendations();

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const totalAR = ar.reduce((s, r) => s + r.totalAmount, 0);
  const openAR = ar.filter(r => r.status !== "paid" && r.status !== "written-off").reduce((s, r) => s + r.amountDue, 0);
  const overdueAR = ar.filter(r => r.status === "overdue").reduce((s, r) => s + r.amountDue, 0);
  const cashCollected = receipts.filter(r => r.status === "applied").reduce((s, r) => s + r.amount, 0);
  const dso = totalRevenue > 0 ? (totalAR / (totalRevenue / 365)) : 0;
  const openOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length;

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const pendingRecs = recommendations.filter(r => !r.implemented);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive View" description="C-suite revenue lifecycle intelligence" />
      <div className="mt-6 space-y-6">
        <ExecutiveRevenueHeader
          totalRevenue={totalRevenue}
          openAR={openAR}
          overdueAR={overdueAR}
          dso={Math.round(dso * 100) / 100}
          cashCollected={cashCollected}
        />
        <ExecutiveInsights
          kpis={kpis}
          dso={Math.round(dso * 100) / 100}
          overdueAR={overdueAR}
          cashCollected={cashCollected}
          totalAR={totalAR}
          totalCustomers={customers.length}
          openOrders={openOrders}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AlertsPanel alerts={criticalAlerts} />
          <RecommendationsPanel recommendations={pendingRecs} />
        </div>
      </div>
    </PageContainer>
  );
}
