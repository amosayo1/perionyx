import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { OrchestrationAnalyticsClient } from "./client";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Workflow Analytics" description="Performance metrics, trends, and execution analytics" />
      <OrchestrationAnalyticsClient />
    </PageContainer>
  );
}
