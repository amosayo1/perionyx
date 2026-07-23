import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AnomalyDashboard } from "../../../../components/executive-ai/anomaly-dashboard";

export default async function AnomaliesPage() {
  const anomalies = executiveAIService.anomalies.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Anomaly Detection" description="AI-detected anomalies across all enterprise domains" />
      <AnomalyDashboard anomalies={anomalies} />
    </PageContainer>
  );
}
