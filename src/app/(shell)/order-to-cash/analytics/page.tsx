import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { RevenueTrendChart } from "../../../../components/order-to-cash/revenue-trend-chart";
import { CollectionsTrendChart } from "../../../../components/order-to-cash/collections-trend-chart";
import { CashCollectionChart } from "../../../../components/order-to-cash/cash-collection-chart";
import { CustomerProfitabilityChart } from "../../../../components/order-to-cash/customer-profitability-chart";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AnalyticsPage() {
  const customers = orderToCashService.customers.getAllCustomers();
  const orders = orderToCashService.salesOrders.getAllOrders();
  const invoices = orderToCashService.billing.getAllInvoices();
  const receipts = orderToCashService.cashApplication.getAllReceipts();
  const kpis = orderToCashService.analytics.getAllKPIs();
  const ar = orderToCashService.ar.getAllARRecords();

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const totalOrders = orders.length;
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = receipts.reduce((s, r) => s + r.amount, 0);

  const revenueTrendData = MONTHS.slice(0, 6).map((period, i) => {
    const currentRevenue = totalRevenue * (0.08 + i * 0.01);
    const previousRevenue = totalRevenue * (0.07 + i * 0.01);
    return {
      period,
      currentRevenue,
      previousRevenue,
      change: currentRevenue - previousRevenue,
      changePercent: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
    };
  });

  const collectionsTrendData = MONTHS.slice(0, 6).map((period, i) => {
    const collected = totalCollected * (0.1 + i * 0.02);
    const target = totalCollected * (0.12 + i * 0.02);
    return {
      period,
      collected,
      target,
      remaining: Math.max(0, target - collected),
    };
  });

  const cashCollectionData = MONTHS.slice(0, 6).map((period, i) => {
    const invoiced = totalInvoiced * (0.08 + i * 0.02);
    const collected = totalCollected * (0.07 + i * 0.02);
    return {
      period,
      invoiced,
      collected,
      outstanding: Math.max(0, invoiced - collected),
    };
  });

  const profitabilityData = customers.slice(0, 15).map(c => ({
    id: c.id,
    customerName: c.name,
    revenue: c.totalRevenue,
    orderCount: c.totalOrders,
    avgPaymentDays: c.avgPaymentDays,
    lifetimeValue: c.lifetimeValue,
    profitabilityTrend: (c.totalRevenue > 100000 ? "up" : c.totalRevenue > 50000 ? "stable" : "down") as "up" | "down" | "stable",
  }));

  const revenueKPI = kpis.find(k => k.category === "revenue");
  const collectionsKPI = kpis.find(k => k.category === "collections");
  const creditKPI = kpis.find(k => k.category === "credit");

  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="Revenue trends, collection performance, and customer profitability" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Revenue" value={`$${(totalRevenue / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} trend={revenueKPI?.trend === "up" ? "up" : "down"} />
        <FPAKPICard title="Total Orders" value={totalOrders} icon={<BarChart3 className="h-4 w-4" />} />
        <FPAKPICard title="Total Invoiced" value={`$${(totalInvoiced / 1e6).toFixed(1)}M`} icon={<TrendingUp className="h-4 w-4" />} />
        <FPAKPICard title="Total Collected" value={`$${(totalCollected / 1e6).toFixed(1)}M`} icon={<Users className="h-4 w-4" />} trend={collectionsKPI?.trend === "up" ? "up" : "down"} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueTrendChart data={revenueTrendData} />
        <CollectionsTrendChart data={collectionsTrendData} />
        <CashCollectionChart data={cashCollectionData} />
        <CustomerProfitabilityChart customers={profitabilityData} />
      </div>
    </PageContainer>
  );
}
