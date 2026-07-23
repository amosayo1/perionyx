import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CompliancePanel } from "../../../../components/risk/compliance-panel";

export default function CompliancePage() {
  const violations = riskService.compliance.getAllViolations();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Compliance" description="Policy violations, threshold breaches, and audit findings" />
      <div className="mt-6">
        <CompliancePanel violations={violations} max={50} />
      </div>
    </PageContainer>
  );
}