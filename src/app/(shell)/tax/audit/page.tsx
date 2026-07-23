import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AuditTimeline } from "../../../../components/tax/audit-timeline";

export default async function TaxAuditPage() {
  const events = taxService.audit.getAllEvents();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Audit Trail" description="Tax audit events, findings, and resolution tracking" />
      <AuditTimeline events={events} />
    </PageContainer>
  );
}
