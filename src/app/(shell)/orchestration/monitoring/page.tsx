import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowMonitor } from "@/components/orchestration/workflow-monitor";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function MonitoringPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Workflow Monitoring"
          description="Real-time system health, running executions, and failure tracking"
        />
        <WorkflowMonitor />
      </PageContainer>
    );
  });
}
