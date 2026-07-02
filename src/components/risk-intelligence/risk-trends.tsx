import { trendPeriods } from "./data";
import { TrendChartPlaceholder } from "./trend-chart-placeholder";

export function RiskTrends() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Risk Trends</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise risk score trends across time periods</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trendPeriods.map((p) => (
          <TrendChartPlaceholder key={p.id} period={p} />
        ))}
      </div>
    </div>
  );
}
