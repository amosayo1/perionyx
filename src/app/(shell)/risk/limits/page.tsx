import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { LimitMonitoringPanel } from "../../../../components/risk/limit-monitoring-panel";

export default function LimitsPage() {
  const limits = riskService.limits.getAllLimits();
  const escalations = riskService.limits.getAllEscalations();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Limits & Escalations" description="Risk limit monitoring and breach escalation" />
      <div className="mt-6">
        <LimitMonitoringPanel limits={limits} escalations={escalations} />
      </div>
    </PageContainer>
  );
}