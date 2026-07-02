import { savedReportsData } from "./data";
import { SavedReportCard } from "./saved-report-card";

const groups = [
  { key: "pinned", label: "Pinned" },
  { key: "favorite", label: "Favorites" },
  { key: "shared", label: "Shared" },
  { key: "recent", label: "Recently Viewed" },
  { key: "private", label: "Private" },
] as const;

export function SavedReports() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Saved Reports</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Quick access to your most important reports</p>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04]">
        {savedReportsData.map((rpt) => (
          <SavedReportCard key={rpt.id} report={rpt} />
        ))}
      </div>
    </div>
  );
}
