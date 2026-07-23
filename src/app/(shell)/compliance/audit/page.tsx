import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AuditTimeline } from "@/components/compliance/audit-timeline";

export default async function ComplianceAuditPage() {
  const audits = complianceService.audits.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Audit Timeline" description="Compliance audit history and status tracking" />
      <AuditTimeline audits={audits} />
    </PageContainer>
  );
}
