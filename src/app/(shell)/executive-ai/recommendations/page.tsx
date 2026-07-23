import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { RecommendationBoard } from "../../../../components/executive-ai/recommendation-board";

export default async function RecommendationsPage() {
  const recommendations = executiveAIService.recommendations.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="AI Recommendations" description="AI-generated recommendations prioritized by impact and confidence" />
      <RecommendationBoard recommendations={recommendations} />
    </PageContainer>
  );
}
