import { regions } from "./data";
import { RegionCard } from "./region-card";

export function GeographicExposure() {
  const sorted = [...regions].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Geographic Exposure</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Regional risk distribution across enterprise operations</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sorted.map((r) => (
          <RegionCard key={r.id} region={r} />
        ))}
      </div>
    </div>
  );
}
