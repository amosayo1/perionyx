import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { SalesOrderBoard } from "../../../../components/order-to-cash/sales-order-board";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { ShoppingCart, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function SalesOrdersPage() {
  const orders = orderToCashService.salesOrders.getAllOrders();
  const totalOrders = orderToCashService.salesOrders.count();
  const pendingOrders = orders.filter(o => o.status === "submitted" || o.status === "approved").length;
  const fulfilledOrders = orders.filter(o => o.fulfillmentStatus === "completed").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const pendingFulfillment = orders.filter(o => o.fulfillmentStatus === "pending" || o.fulfillmentStatus === "in-progress" || o.fulfillmentStatus === "partial").length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Sales Orders" description="Order management and fulfillment tracking" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Orders" value={totalOrders} icon={<ShoppingCart className="h-4 w-4" />} />
        <FPAKPICard title="Pending" value={pendingOrders} icon={<Clock className="h-4 w-4" />} status={pendingOrders > 0 ? "warning" : "good"} />
        <FPAKPICard title="Fulfilled" value={fulfilledOrders} icon={<CheckCircle className="h-4 w-4" />} status="good" />
        <FPAKPICard title="Pending Fulfillment" value={pendingFulfillment} icon={<AlertTriangle className="h-4 w-4" />} status={pendingFulfillment > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6">
        <SalesOrderBoard orders={orders} />
      </div>
    </PageContainer>
  );
}
