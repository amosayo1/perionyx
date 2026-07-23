import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowMonitor } from "@/components/orchestration/workflow-monitor";

export default async function MonitoringPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Workflow Monitoring"
        description="Real-time system health, running executions, and failure tracking"
      />
      <WorkflowMonitor />
    </PageContainer>
  );
}
