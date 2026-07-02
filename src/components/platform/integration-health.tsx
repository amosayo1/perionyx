import { integrations } from "./data";
import { IntegrationCard } from "./integration-card";

export function IntegrationHealth() {
  const sorted = [...integrations].sort((a, b) => {
    const order = { disconnected: 0, retrying: 1, warning: 2, connected: 3 };
    return (order[a.status] ?? 0) - (order[b.status] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Integration Health</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Connection status and synchronization for all enterprise integrations</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((int) => (
          <IntegrationCard key={int.id} integration={int} />
        ))}
      </div>
    </div>
  );
}
