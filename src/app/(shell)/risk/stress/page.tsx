import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { StressTestViewer } from "../../../../components/risk/stress-test-viewer";

export default function StressTestingPage() {
  const tests = riskService.stressTesting.getAllStressTests();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Stress Testing" description="Scenario-based stress test results and analysis" />
      <div className="mt-6">
        <StressTestViewer tests={tests} max={20} />
      </div>
    </PageContainer>
  );
}