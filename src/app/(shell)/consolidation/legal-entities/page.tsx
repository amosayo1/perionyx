import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsEntityRegistry from "@/components/consolidation/cons-entity-registry"

export default function LegalEntitiesPage() {
  const entities = consService.entityManagement.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Legal Entities" description="Entity registry with consolidation methods and status" />
      <ConsEntityRegistry entities={entities} />
    </PageContainer>
  )
}
