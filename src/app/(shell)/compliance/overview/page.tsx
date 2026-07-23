import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ComplianceHeader } from "@/components/compliance/compliance-header";
import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard";
import { ComplianceScoreChart } from "@/components/compliance/compliance-score-chart";
import { ReportChart } from "@/components/compliance/report-chart";
import type { ComplianceOverviewMetrics } from "@/components/compliance/compliance-types";

export default async function ComplianceOverviewPage() {
  const metrics = complianceService.getAggregateMetrics();
  const obligations = complianceService.obligations.getAll();
  const kpis = complianceService.analytics.getAllKPIs();

  const overviewMetrics: ComplianceOverviewMetrics = metrics;

  const chartData = kpis.slice(0, 6).map(k => ({
    label: k.name,
    value: k.value,
    target: k.target,
  }));

  const obligationsByCategory = [
    { category: "Statutory", compliant: 0, nonCompliant: 0, notAssessed: 0 },
    { category: "Regulatory", compliant: 0, nonCompliant: 0, notAssessed: 0 },
    { category: "Internal", compliant: 0, nonCompliant: 0, notAssessed: 0 },
  ];

  obligations.forEach(o => {
    const entry = obligationsByCategory.find(e =>
      e.category.toLowerCase() === o.type.toLowerCase() ||
      (o.type === "statutory" && e.category === "Statutory") ||
      (o.type === "regulatory" && e.category === "Regulatory") ||
      (o.type === "internal" && e.category === "Internal")
    );
    if (entry) {
      if (o.status === "compliant") entry.compliant++;
      else if (o.status === "non-compliant" || o.status === "partially-compliant") entry.nonCompliant++;
      else entry.notAssessed++;
    }
  });

  return (
    <PageContainer>
      <EnterprisePageHeader title="Compliance Overview" description="Enterprise-wide compliance position summary" />
      <ComplianceHeader metrics={overviewMetrics} />
      <ComplianceDashboard metrics={overviewMetrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComplianceScoreChart data={chartData} />
        <ReportChart data={obligationsByCategory} />
      </div>
    </PageContainer>
  );
}
