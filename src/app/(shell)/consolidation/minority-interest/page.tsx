import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsMinorityInterestPanel from "@/components/consolidation/cons-minority-interest-panel"

export default function MinorityInterestPage() {
  const records = consService.minorityInterest.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Minority Interest" description="Non-controlling interests and minority equity tracking" />
      <ConsMinorityInterestPanel records={records} />
    </PageContainer>
  )
}
