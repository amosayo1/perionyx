import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAExecutiveHeader from "@/components/fpa/fpa-executive-header"
import { FPAExecutiveInsights } from "@/components/fpa/fpa-executive-insights"

export default function ExecutivePage() {
  const summary = fpaService.getExecutiveSummary()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive View" description="C-suite financial planning overview" />
      <div className="mt-6 space-y-6">
        <FPAExecutiveHeader summary={summary} />
        <FPAExecutiveInsights
          summary={summary}
          insights={{
            summary: "Executive planning overview",
            highlights: [],
            risks: [],
            actions: [],
          }}
        />
      </div>
    </PageContainer>
  )
}
