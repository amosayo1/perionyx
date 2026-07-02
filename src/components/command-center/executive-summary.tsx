"use client";

import { KpiCard, WidgetCard } from "./widget-card";
import type { KpiMetric } from "@/modules/command-center/command-center.service";

export function ExecutiveSummarySection({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">Executive Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <KpiCard
            key={m.label}
            label={m.label}
            value={m.value}
            change={m.change}
            direction={m.direction}
            status={m.status}
          />
        ))}
      </div>
    </section>
  );
}
