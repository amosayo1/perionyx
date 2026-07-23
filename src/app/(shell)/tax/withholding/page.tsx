import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { WithholdingDashboard } from "../../../../components/tax/withholding-dashboard";

export default async function WithholdingPage() {
  const records = taxService.withholding.getAllRecords();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Withholding Tax" description="Cross-border withholding tax management" />
      <WithholdingDashboard records={records} />
    </PageContainer>
  );
}
