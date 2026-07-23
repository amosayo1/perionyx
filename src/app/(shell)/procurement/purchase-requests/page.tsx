import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { PurchaseRequestBoard } from "../../../../components/procurement/purchase-request-board";

export default function PurchaseRequestsPage() {
  const allPRs = procurementService.purchaseRequests.getAllPRs();
  const total = allPRs.length;
  const pending = allPRs.filter((pr) => pr.status === "draft" || pr.status === "submitted").length;
  const approved = allPRs.filter((pr) => pr.status === "approved").length;
  const converted = allPRs.filter((pr) => pr.status === "converted").length;
  const critical = allPRs.filter((pr) => pr.urgency === "critical").length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Purchase Requests" description="Create and manage purchase requisitions" />
      <div className="mt-6 grid grid-cols-5 gap-4">
        <FPAKPICard title="Total Requests" value={total} status="good" />
        <FPAKPICard title="Pending" value={pending} status={pending > 0 ? "warning" : "good"} />
        <FPAKPICard title="Approved" value={approved} status="good" />
        <FPAKPICard title="Converted" value={converted} status="good" />
        <FPAKPICard title="Critical Urgency" value={critical} status={critical > 0 ? "critical" : "good"} />
      </div>
      <div className="mt-6">
        <PurchaseRequestBoard requests={allPRs} />
      </div>
    </PageContainer>
  );
}
