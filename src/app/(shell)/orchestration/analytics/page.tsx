import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { OrchestrationAnalyticsClient } from "./client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function AnalyticsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Workflow Analytics" description="Performance metrics, trends, and execution analytics" />
        <OrchestrationAnalyticsClient />
      </PageContainer>
    );
  });
}
