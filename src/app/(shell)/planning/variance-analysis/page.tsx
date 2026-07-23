import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAVarianceAnalysis from "@/components/fpa/fpa-variance-analysis"

export default function VarianceAnalysisPage() {
  const records = fpaService.varianceAnalysis.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Variance Analysis" description="Budget vs actual variance tracking and root cause analysis" />
      <div className="mt-6">
        <FPAVarianceAnalysis records={records} />
      </div>
    </PageContainer>
  )
}
