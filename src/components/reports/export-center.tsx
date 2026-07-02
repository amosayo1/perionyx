import { exportOptions } from "./data";
import { ExportCard } from "./export-card";

export function ExportCenter() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Export Center</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Download reports in your preferred format</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {exportOptions.map((opt) => (
          <ExportCard key={opt.id} option={opt} />
        ))}
      </div>
    </div>
  );
}
