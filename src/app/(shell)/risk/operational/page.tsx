import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { OperationalRiskDashboard } from "../../../../components/risk/operational-risk-dashboard";

export default function OperationalRiskPage() {
  const operationalData = riskService.operational.getAllOperationalData();
  const controls = riskService.operational.getAllControls();
  const violations = riskService.compliance.getAllViolations();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Operational Risk" description="Operational loss, controls, and near-miss tracking" />
      <div className="mt-6">
        <OperationalRiskDashboard operationalData={operationalData} controls={controls} violations={violations} />
      </div>
    </PageContainer>
  );
}