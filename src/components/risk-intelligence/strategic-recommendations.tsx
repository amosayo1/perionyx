import { RecommendationCard } from "./recommendation-card";
import type { Recommendation } from "./types";

export function StrategicRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.impact] ?? 0) - (order[b.impact] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Strategic Recommendations</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Actionable insights for enterprise risk management</p>
      </div>
      <div className="grid gap-3">
        {sorted.map((r) => (
          <RecommendationCard key={r.id} rec={r} />
        ))}
      </div>
    </div>
  );
}
