import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ControlDashboard } from "@/components/compliance/control-dashboard";

export default async function ComplianceControlsPage() {
  const controls = complianceService.controls.getAll();
  const tests = complianceService.controlTests.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Controls & Testing" description="Internal controls monitoring and test results" />
      <ControlDashboard controls={controls} tests={tests} />
    </PageContainer>
  );
}
