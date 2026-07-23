import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ComplianceScoreChart } from "@/components/compliance/compliance-score-chart";
import { ReportChart } from "@/components/compliance/report-chart";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function ComplianceReportingPage() {
  const reports = complianceService.reports.getAll();
  const obligations = complianceService.obligations.getAll();
  const kpis = complianceService.analytics.getAllKPIs();

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
      <EnterprisePageHeader title="Compliance Reporting" description="Generated reports and compliance analytics" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComplianceScoreChart data={chartData} />
        <ReportChart data={obligationsByCategory} />
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Title</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {reports.map(r => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{r.title}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.period}</td>
                <td className="px-4 py-3 text-sm capitalize text-zinc-400">{r.type}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(r.generatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
