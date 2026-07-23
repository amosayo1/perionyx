import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { RecommendationsPanel } from "../../../../components/accounts-receivable/ar-recommendations-panel"

export default function ARRecommendationsPage() {
  const recommendations = arService.recommendations.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Recommendations" description="AI-powered recommendations and insights" />
      <RecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  )
}
