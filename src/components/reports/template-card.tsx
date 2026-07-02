"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import type { ReportTemplate } from "./types";

const categoryColors: Record<string, string> = {
  Executive: "text-rose-400", Finance: "text-[#d4af37]", Treasury: "text-blue-400",
  Operations: "text-orange-400", Audit: "text-zinc-400", Compliance: "text-amber-400",
  Risk: "text-red-400", Platform: "text-cyan-400", Developer: "text-purple-400",
};

export function TemplateCard({ template, onSelect }: { template: ReportTemplate; onSelect?: (template: ReportTemplate) => void }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
          <FileText className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-white">{template.title}</span>
          <span className={`block text-[10px] font-medium ${categoryColors[template.category] ?? "text-zinc-500"}`}>
            {template.category}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{template.description}</p>
      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-3" onClick={() => onSelect?.(template)}>
        Use Template <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
