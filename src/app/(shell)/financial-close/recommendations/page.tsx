import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCRecommendationsPanel } from "@/components/financial-close/fc-recommendations-panel"

export default function FCRecommendationsPage() {
  const recommendations = fcService.recommendations.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Recommendations" description="AI-driven recommendations to optimize the close process" />
      <FCRecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  )
}
