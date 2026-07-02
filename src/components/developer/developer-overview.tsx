import { developerKpis } from "./data";
import { DeveloperKpiCard } from "./developer-kpi-card";

export function DeveloperOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {developerKpis.map((kpi) => (
        <DeveloperKpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
