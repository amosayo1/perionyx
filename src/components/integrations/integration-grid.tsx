import type { ConnectedIntegration } from "./types";
import { IntegrationCard } from "./integration-card";

export function IntegrationGrid({ integrations }: { integrations: ConnectedIntegration[] }) {
  const grouped = integrations.reduce(
    (acc, curr) => {
      (acc[curr.category] = acc[curr.category] || []).push(curr);
      return acc;
    },
    {} as Record<string, ConnectedIntegration[]>,
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Connected Systems</h2>
        <p className="text-xs text-zinc-500 mt-0.5">All connected enterprise integrations and their current status</p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{category}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((int) => (
              <IntegrationCard key={int.id} integration={int} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
