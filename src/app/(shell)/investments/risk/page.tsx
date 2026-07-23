import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { RiskDashboard } from "../../../../components/investments/risk-dashboard";
import { ComplianceDashboard } from "../../../../components/investments/compliance-dashboard";

export default async function RiskPage() {
  const svc = new InvestmentService();
  const portfolioIds = svc.portfolios.getAll().map((p) => p.id);
  const risks = portfolioIds.map((id) => svc.risk.getLatest(id)).filter((r): r is NonNullable<typeof r> => r != null);
  const rules = svc.compliance.getAllRules();
  const violations = svc.compliance.getViolations();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk & Compliance" description="Investment risk metrics and compliance status" />
      <RiskDashboard risks={risks} />
      <ComplianceDashboard rules={rules} violations={violations} />
    </PageContainer>
  );
}
