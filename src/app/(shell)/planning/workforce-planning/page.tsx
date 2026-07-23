import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAWorkforcePlanning from "@/components/fpa/fpa-workforce-planning"

export default function WorkforcePlanningPage() {
  const workforces = fpaService.workforcePlanning.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Workforce Planning" description="Headcount planning and compensation modeling" />
      <div className="mt-6">
        <FPAWorkforcePlanning plans={workforces} />
      </div>
    </PageContainer>
  )
}
