import { riskKpis } from "./data";
import { RiskKpiCard } from "./risk-kpi-card";

export function RiskOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {riskKpis.map((kpi) => (
        <RiskKpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
