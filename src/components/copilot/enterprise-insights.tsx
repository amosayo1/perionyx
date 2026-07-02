import { enterpriseInsights } from "./data";
import { InsightCard } from "./insight-card";

export function EnterpriseInsights() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Enterprise Insights</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Key observations from across the platform</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enterpriseInsights.map((ei) => (
          <InsightCard key={ei.id} insight={ei} />
        ))}
      </div>
    </div>
  );
}
