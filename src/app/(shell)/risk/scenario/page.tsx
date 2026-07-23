import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ScenarioSimulator } from "../../../../components/risk/scenario-simulator";
import { RiskDistributionChart } from "../../../../components/risk/risk-distribution-chart";
import { StressTestViewer } from "../../../../components/risk/stress-test-viewer";

export default function ScenarioPlanningPage() {
  const scenarios = riskService.stressTesting.getAllScenarios();
  const tests = riskService.stressTesting.getAllStressTests();
  const risks = riskService.register.getAllRisks();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Scenario Planning" description="Strategic scenario modeling and analysis" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScenarioSimulator scenarios={scenarios} />
        <RiskDistributionChart risks={risks} />
      </div>
    </PageContainer>
  );
}