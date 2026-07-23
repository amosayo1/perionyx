import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { ApprovalQueue } from "../../../../components/procurement/approval-queue";

export default function ApprovalsPage() {
  const allApprovals = procurementService.approvals.getAllApprovals();
  const total = allApprovals.length;
  const pending = allApprovals.filter((a) => a.status === "pending").length;
  const approved = allApprovals.filter((a) => a.status === "approved").length;
  const rejected = allApprovals.filter((a) => a.status === "rejected").length;
  const escalated = allApprovals.filter((a) => a.status === "escalated").length;
  const delegated = allApprovals.filter((a) => a.isDelegated).length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Approval Queue" description="Review and manage procurement approval requests" />
      <div className="mt-6 grid grid-cols-5 gap-4">
        <FPAKPICard title="Total Requests" value={total} status="good" />
        <FPAKPICard title="Pending" value={pending} status={pending > 0 ? "critical" : "good"} />
        <FPAKPICard title="Approved" value={approved} status="good" />
        <FPAKPICard title="Rejected" value={rejected} status={rejected > 0 ? "warning" : "good"} />
        <FPAKPICard title="Escalated" value={escalated + delegated} status={escalated > 0 ? "critical" : "good"} />
      </div>
      <div className="mt-6">
        <ApprovalQueue approvals={allApprovals} />
      </div>
    </PageContainer>
  );
}
