import { ExecutiveKpiCard } from "./executive-kpi-card";
import type { KpiMetric } from "./types";

export function ExecutiveSummary({ metrics }: { metrics: KpiMetric[] }) {
  const rows = [];
  for (let i = 0; i < metrics.length; i += 4) {
    rows.push(metrics.slice(i, i + 4));
  }

  return (
    <div className="space-y-4">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {row.map((metric) => (
            <ExecutiveKpiCard key={metric.id} metric={metric} />
          ))}
        </div>
      ))}
    </div>
  );
}
