import { Database, Filter, Columns, Group, SortAsc, Eye, Download } from "lucide-react";
import type { BuilderStep } from "./types";

const iconMap: Record<string, React.ReactNode> = {
  database: <Database className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  columns: <Columns className="h-4 w-4" />,
  group: <Group className="h-4 w-4" />,
  sort: <SortAsc className="h-4 w-4" />,
  eye: <Eye className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
};

export function BuilderStepCard({ step, index }: { step: BuilderStep; index: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500">
        {index + 1}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
        {iconMap[step.icon] ?? <Database className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-white">{step.label}</span>
        <p className="text-[10px] text-zinc-600">{step.description}</p>
      </div>
    </div>
  );
}
