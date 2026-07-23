import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { PurchaseOrderGrid } from "../../../../components/procurement/purchase-order-grid";

export default function PurchaseOrdersPage() {
  const allPOs = procurementService.purchaseOrders.getAllPOs();
  const total = allPOs.length;
  const open = allPOs.filter((po) => po.status === "approved" || po.status === "sent" || po.status === "acknowledged").length;
  const closed = allPOs.filter((po) => po.status === "closed").length;
  const partiallyReceived = allPOs.filter((po) => po.status === "partially-received").length;
  const totalAmount = allPOs.reduce((s, po) => s + po.totalAmount, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Purchase Orders" description="Manage purchase orders and fulfillment" />
      <div className="mt-6 grid grid-cols-5 gap-4">
        <FPAKPICard title="Total POs" value={total} status="good" />
        <FPAKPICard title="Open" value={open} status={open > 0 ? "warning" : "good"} />
        <FPAKPICard title="Partially Received" value={partiallyReceived} status="warning" />
        <FPAKPICard title="Closed" value={closed} status="good" />
        <FPAKPICard title="Total Value" value={`$${(totalAmount / 1000000).toFixed(1)}M`} status="good" />
      </div>
      <div className="mt-6">
        <PurchaseOrderGrid orders={allPOs} />
      </div>
    </PageContainer>
  );
}
