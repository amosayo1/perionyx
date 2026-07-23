import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsICEliminationCenter from "@/components/consolidation/cons-ic-elimination-center"

export default function ICEliminationsPage() {
  const records = consService.intercompanyEliminations.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Intercompany Eliminations" description="Match, reconcile, and eliminate intercompany transactions" />
      <ConsICEliminationCenter records={records} />
    </PageContainer>
  )
}
