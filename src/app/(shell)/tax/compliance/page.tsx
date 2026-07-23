import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ComplianceDashboard } from "../../../../components/tax/compliance-dashboard";

export default async function TaxCompliancePage() {
  const records = taxService.compliance.getAllRecords();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Compliance" description="Tax compliance monitoring and risk assessment" />
      <ComplianceDashboard records={records} />
    </PageContainer>
  );
}
