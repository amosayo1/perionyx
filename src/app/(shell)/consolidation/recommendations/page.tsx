import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { ConsRecommendationsPanel } from "@/components/consolidation/cons-recommendations-panel"

export default function RecommendationsPage() {
  const recommendations = consService.recommendations.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Recommendations" description="AI-driven recommendations to optimize the consolidation process" />
      <ConsRecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  )
}
