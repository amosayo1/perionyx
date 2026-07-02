import { queueData } from "./data";
import { QueueCard } from "./queue-card";

export function QueueMonitor() {
  const sorted = [...queueData].sort((a, b) => {
    const order = { critical: 0, warning: 1, healthy: 2 };
    return (order[a.health] ?? 0) - (order[b.health] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Queue Monitoring</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Operational queue depth, processing times, and health</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((q) => (
          <QueueCard key={q.id} queue={q} />
        ))}
      </div>
    </div>
  );
}
