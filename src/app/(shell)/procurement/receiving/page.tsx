import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { ReceivingDashboard } from "../../../../components/procurement/receiving-dashboard";

export default function ReceivingPage() {
  const allReceipts = procurementService.receiving.getAllReceipts();
  const total = allReceipts.length;
  const pending = allReceipts.filter((r) => r.status === "pending").length;
  const partial = allReceipts.filter((r) => r.status === "partial").length;
  const complete = allReceipts.filter((r) => r.status === "complete").length;
  const goodReceipts = allReceipts.filter((r) => r.type === "goods").length;
  const serviceReceipts = allReceipts.filter((r) => r.type === "service").length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Receiving" description="Track goods and service receipts against purchase orders" />
      <div className="mt-6 grid grid-cols-6 gap-4">
        <FPAKPICard title="Total Receipts" value={total} status="good" />
        <FPAKPICard title="Pending" value={pending} status={pending > 0 ? "warning" : "good"} />
        <FPAKPICard title="Partial" value={partial} status={partial > 0 ? "warning" : "good"} />
        <FPAKPICard title="Complete" value={complete} status="good" />
        <FPAKPICard title="Goods" value={goodReceipts} status="good" />
        <FPAKPICard title="Services" value={serviceReceipts} status="good" />
      </div>
      <div className="mt-6">
        <ReceivingDashboard receipts={allReceipts} />
      </div>
    </PageContainer>
  );
}
