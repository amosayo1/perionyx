import { reportLibrary } from "./data";
import { ReportCard } from "./report-card";

export function ReportLibrary() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Report Library</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Pre-built reports organized by category</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportLibrary.map((rpt) => (
          <ReportCard key={rpt.id} report={rpt} />
        ))}
      </div>
    </div>
  );
}
