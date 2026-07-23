import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ComplianceDashboard } from "../../../../components/investments/compliance-dashboard";

export default async function CompliancePage() {
  const svc = new InvestmentService();
  const rules = svc.compliance.getAllRules();
  const violations = svc.compliance.getViolations();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Compliance" description="Investment policy compliance and violations" />
      <ComplianceDashboard rules={rules} violations={violations} />
    </PageContainer>
  );
}
