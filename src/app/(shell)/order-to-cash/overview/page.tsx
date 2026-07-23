import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExecutiveRevenueHeader } from "../../../../components/order-to-cash/executive-revenue-header";
import { RevenueOverview } from "../../../../components/order-to-cash/revenue-overview";
import { AlertsPanel } from "../../../../components/order-to-cash/alerts-panel";

export default function OverviewPage() {
  const customers = orderToCashService.customers.getAllCustomers();
  const orders = orderToCashService.salesOrders.getAllOrders();
  const invoices = orderToCashService.billing.getAllInvoices();
  const ar = orderToCashService.ar.getAllARRecords();
  const receipts = orderToCashService.cashApplication.getAllReceipts();
  const collections = orderToCashService.collections.getAllCases();
  const alerts = orderToCashService.analytics.getActiveAlerts();
  const revenueSchedules = orderToCashService.revenueRecognition.getAllSchedules();

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const openAR = ar.filter(r => r.status === "open" || r.status === "overdue" || r.status === "partially-paid").reduce((s, r) => s + r.amountDue, 0);
  const overdueAR = ar.filter(r => r.status === "overdue").reduce((s, r) => s + r.amountDue, 0);
  const totalAR = ar.reduce((s, r) => s + r.totalAmount, 0);
  const cashCollected = receipts.filter(r => r.status === "applied").reduce((s, r) => s + r.amount, 0);
  const avgPaymentDays = customers.length > 0 ? customers.reduce((s, c) => s + c.avgPaymentDays, 0) / customers.length : 0;
  const dso = totalRevenue > 0 ? (totalAR / (totalRevenue / 365)) : 0;
  const unappliedCash = receipts.filter(r => r.unappliedAmount > 0).reduce((s, r) => s + r.unappliedAmount, 0);
  const revenueDeferred = revenueSchedules.filter(s => s.status === "deferred").reduce((s, r) => s + r.deferredAmount, 0);

  const overviewMetrics = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === "active").length,
    totalOrders: orders.length,
    openOrders: orders.filter(o => o.status === "submitted" || o.status === "approved" || o.status === "confirmed").length,
    totalInvoices: invoices.length,
    openInvoices: invoices.filter(i => i.status !== "paid" && i.status !== "cancelled" && i.status !== "written-off").length,
    overdueInvoices: invoices.filter(i => i.arStatus === "overdue").length,
    totalAR,
    overdueAR,
    dso: Math.round(dso * 100) / 100,
    cashCollected,
    unappliedCash,
    collectionCases: collections.filter(c => c.status === "active" || c.status === "escalated").length,
    revenueDeferred,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Overview" description="Order-to-Cash performance at a glance" />
      <div className="mt-6 space-y-6">
        <ExecutiveRevenueHeader
          totalRevenue={totalRevenue}
          openAR={openAR}
          overdueAR={overdueAR}
          dso={overviewMetrics.dso}
          cashCollected={cashCollected}
        />
        <RevenueOverview metrics={overviewMetrics} />
        <AlertsPanel alerts={alerts} max={10} />
      </div>
    </PageContainer>
  );
}
