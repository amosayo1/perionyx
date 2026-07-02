import { scheduledReports } from "./data";
import { ScheduledReportCard } from "./scheduled-report-card";

export function ScheduledReports() {
  const sorted = [...scheduledReports].sort((a, b) => {
    const order = { error: 0, paused: 1, active: 2 };
    return (order[a.status] ?? 0) - (order[b.status] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Scheduled Reports</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Recurring report delivery schedules</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((rpt) => (
          <ScheduledReportCard key={rpt.id} report={rpt} />
        ))}
      </div>
    </div>
  );
}
