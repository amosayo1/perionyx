import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsBoardPackGenerator from "@/components/consolidation/cons-board-pack-generator"

export default function BoardReportingPage() {
  const reports = consService.boardReporting.getAll()
  const managementReports = consService.managementReporting.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Board Reporting" description="Board packs, management reports, and executive summaries" />
      <ConsBoardPackGenerator reports={reports} />
    </PageContainer>
  )
}
