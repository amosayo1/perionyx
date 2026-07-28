import { Fragment } from "react";
import { heatmapData } from "./data";
import { HeatmapCell } from "./heatmap-cell";

const categories = ["Credit Risk", "Liquidity Risk", "Operational Risk", "Compliance Risk", "FX Risk"];

export function RiskHeatmap() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Risk Heatmap</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise risk distribution by business unit and category</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[180px_repeat(5,1fr)] gap-2">
            <div className="text-[10px] font-semibold text-zinc-600 px-2 py-2" />
            {categories.map((cat) => (
              <div key={cat} className="text-[10px] font-semibold text-zinc-600 text-center px-2 py-2 truncate">
                {cat}
              </div>
            ))}
            {heatmapData.map((row) => (
              <Fragment key={row.businessUnit}>
                <div className="flex items-center text-[11px] text-zinc-400 font-medium px-2">
                  {row.businessUnit}
                </div>
                {row.categories.map((cell, i) => (
                  <HeatmapCell key={`${row.businessUnit}-${cell.category}`} cell={cell} index={i} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-zinc-600">
        <span className="font-medium">Legend:</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gold/30" /> Low</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500/30" /> Medium</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-orange-500/30" /> High</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500/30" /> Critical</span>
      </div>
    </div>
  );
}
