import { exceptionMetrics } from "./data";
import { ExceptionCard } from "./exception-card";

export function ExceptionAnalysis() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Exception Analysis</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise exception metrics and control effectiveness</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {exceptionMetrics.map((m) => (
          <ExceptionCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}
