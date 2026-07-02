import type { IntegrationKpi } from "./types";
import { IntegrationKpiCard } from "./integration-kpi-card";

export function IntegrationOverview({ kpis }: { kpis: IntegrationKpi[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <IntegrationKpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
