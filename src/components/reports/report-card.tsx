"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportBuilderDialog } from "./report-builder-dialog";
import type { Report, ReportTemplate } from "./types";

const categoryColors: Record<string, string> = {
  Treasury: "text-[#d4af37]", Payments: "text-blue-400", Approvals: "text-purple-400",
  Policy: "text-amber-400", Risk: "text-red-400", Audit: "text-zinc-400",
  Ledger: "text-sky-400", Settlement: "text-indigo-400", Executive: "text-rose-400",
  Operations: "text-orange-400", Incidents: "text-red-400", Platform: "text-cyan-400",
};

export function ReportCard({ report }: { report: Report }) {
  const [builderOpen, setBuilderOpen] = useState(false);

  const handleGenerate = useCallback(() => {
    setBuilderOpen(true);
  }, []);

  const template: ReportTemplate = {
    id: report.id,
    title: report.title,
    category: report.category,
    description: report.description,
  };

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-white">{report.title}</span>
            <span className={cn("block text-[10px] font-medium", categoryColors[report.category] ?? "text-zinc-500")}>{report.category}</span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">{report.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-zinc-600">Updated {report.lastUpdated}</span>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-zinc-500 hover:text-white" onClick={handleGenerate}>
            Generate <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ReportBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        template={template}
      />
    </>
  );
}
