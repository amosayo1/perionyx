import type { ConnectionHealthGroup } from "./types";
import { ConnectionHealthCard } from "./connection-health-card";

export function ConnectionHealth({ groups }: { groups: ConnectionHealthGroup[] }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Connection Health</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Aggregate health status of all enterprise connections</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <ConnectionHealthCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
