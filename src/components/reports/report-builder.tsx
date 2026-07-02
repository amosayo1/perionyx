import { builderSteps } from "./data";
import { BuilderStepCard } from "./builder-step";
import { ArrowDown } from "lucide-react";

export function ReportBuilder() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Report Builder</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Create custom reports with a step-by-step workflow</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {builderSteps.map((step, i) => (
          <BuilderStepCard key={step.id} step={step} index={i} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pt-1">
        {builderSteps.slice(0, -1).map((_, i) => (
          <ArrowDown key={i} className="h-3 w-3 text-zinc-700 sm:hidden" />
        ))}
      </div>
    </div>
  );
}
