import { healthMetrics } from "./data";
import { PlatformHealthCard } from "./platform-health-card";

export function PlatformHealthOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {healthMetrics.map((metric) => (
        <PlatformHealthCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
