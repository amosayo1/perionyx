import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { FrameworkDashboard } from "@/components/compliance/framework-dashboard";

export default async function ComplianceFrameworksPage() {
  const frameworks = complianceService.frameworks.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Regulatory Frameworks" description="Applicable regulatory frameworks and standards" />
      <FrameworkDashboard frameworks={frameworks} />
    </PageContainer>
  );
}
