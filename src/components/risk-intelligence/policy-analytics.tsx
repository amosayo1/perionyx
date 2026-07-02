import { policyMetrics } from "./data";
import { PolicyCard } from "./policy-card";

export function PolicyAnalytics() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Policy Analytics</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise policy intelligence and compliance metrics</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {policyMetrics.map((m) => (
          <PolicyCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}
