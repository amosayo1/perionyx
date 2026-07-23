import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FPARecommendationsPanel } from "@/components/fpa/fpa-recommendations-panel"

export default function RecommendationsPage() {
  const recommendations = fpaService.recommendations.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Recommendations" description="AI-powered planning recommendations and insights" />
      <div className="mt-6">
        <FPARecommendationsPanel recommendations={recommendations} />
      </div>
    </PageContainer>
  )
}
