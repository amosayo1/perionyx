import { reportKpis } from "./data";
import { ReportKpiCard } from "./report-kpi-card";

export function ReportDashboard() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {reportKpis.map((kpi) => (
        <ReportKpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
