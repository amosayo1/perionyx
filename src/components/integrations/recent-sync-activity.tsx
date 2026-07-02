import type { SyncEvent } from "./types";
import { SyncEventItem } from "./sync-event-item";

export function RecentSyncActivity({ events }: { events: SyncEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Recent Sync Activity</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Latest integration synchronization events</p>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04]">
        {sorted.map((evt) => (
          <SyncEventItem key={evt.id} event={evt} />
        ))}
      </div>
    </div>
  );
}
