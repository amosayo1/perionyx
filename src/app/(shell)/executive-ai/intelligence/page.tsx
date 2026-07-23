import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { IntelligenceDashboard } from "../../../../components/executive-ai/intelligence-dashboard";

export default async function IntelligencePage() {
  const insights = executiveAIService.intelligence.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Intelligence" description="All AI-detected insights across enterprise domains" />
      <IntelligenceDashboard insights={insights} />
    </PageContainer>
  );
}
