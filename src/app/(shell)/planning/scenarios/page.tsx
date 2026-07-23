import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAScenarioBoard from "@/components/fpa/fpa-scenario-board"

export default function ScenariosPage() {
  const scenarios = fpaService.scenarioPlanning.getAllScenarios()
  const baseScenarios = scenarios.filter((s) => s.scenarioType === "base")
  const baseId = baseScenarios.length > 0 ? baseScenarios[0].id : ""
  const adjustedIds = scenarios.filter((s) => s.id !== baseId).map((s) => s.id)
  const comparisons = baseId && adjustedIds.length > 0
    ? fpaService.scenarioPlanning.compareScenarios(baseId, adjustedIds)
    : []

  return (
    <PageContainer>
      <EnterprisePageHeader title="Scenarios" description="Scenario planning and what-if analysis" />
      <div className="mt-6">
        <FPAScenarioBoard scenarios={scenarios} comparisons={comparisons} />
      </div>
    </PageContainer>
  )
}
