import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FPAExecutiveInsights } from "@/components/fpa/fpa-executive-insights"

export default function ExecutiveInsightsPage() {
  const summary = fpaService.getExecutiveSummary()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Insights" description="Strategic planning insights and analytics" />
      <div className="mt-6">
        <FPAExecutiveInsights
          summary={summary}
          insights={{
            summary: "Strategic planning insights and analytics",
            highlights: [],
            risks: [],
            actions: [],
          }}
        />
      </div>
    </PageContainer>
  )
}
