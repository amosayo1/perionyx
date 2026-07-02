import { vendors } from "./data";
import { VendorCard } from "./vendor-card";

export function VendorRisk() {
  const sorted = [...vendors].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.riskLevel] ?? 0) - (order[b.riskLevel] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Vendor Risk</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise vendor risk assessment and monitoring</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((v) => (
          <VendorCard key={v.id} vendor={v} />
        ))}
      </div>
    </div>
  );
}
