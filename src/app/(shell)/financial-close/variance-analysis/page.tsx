import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCVarianceDashboard } from "@/components/financial-close/fc-variance-dashboard"

export default function FCVarianceAnalysisPage() {
  const variances = fcService.varianceAnalysis.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Variance Analysis" description="Period-over-period variance comparison and explanation" />
      <FCVarianceDashboard variances={variances} />
    </PageContainer>
  )
}
