"use client";

import { cn } from "@/lib/utils";
import type { WorkflowStage } from "./types";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  XCircle,
  SkipForward,
  ChevronRight,
} from "lucide-react";

interface Props {
  stages: WorkflowStage[];
  compact?: boolean;
}

function StageIcon({ stage }: { stage: WorkflowStage }) {
  switch (stage.status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />;
    case "active":
      return stage.id === "approval" && stage.label === "Approvals" && stage.description?.includes("Escalated")
        ? <AlertTriangle className="h-4 w-4 text-amber-400 animate-pulse" />
        : <Clock className="h-4 w-4 text-[#d4af37] animate-pulse" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-400" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-zinc-600" />;
    default:
      return <Circle className="h-4 w-4 text-zinc-600" />;
  }
}

export function WorkflowDiagram({ stages, compact = false }: Props) {
  return (
    <div className={cn("w-full", compact ? "py-2" : "py-4")}>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const isActive = stage.status === "active";
          const isCompleted = stage.status === "completed";
          const isFailed = stage.status === "failed";

          return (
            <div key={stage.id} className="flex items-start shrink-0">
              <div className="flex flex-col items-center gap-2 min-w-0">
                {/* Stage circle + connector */}
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted && "border-[#d4af37]/50 bg-[#d4af37]/10",
                      isActive && "border-[#d4af37] bg-[#d4af37]/15 shadow-[0_0_20px_rgba(212,175,55,0.15)]",
                      isFailed && "border-red-500/50 bg-red-500/10",
                      stage.status === "pending" && "border-zinc-700 bg-zinc-800/50",
                      stage.status === "skipped" && "border-zinc-700/50 bg-zinc-800/30",
                    )}
                  >
                    <StageIcon stage={stage} />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "h-0.5 w-8 sm:w-12 md:w-16",
                        isCompleted ? "bg-[#d4af37]/30" : "bg-zinc-700/50",
                      )}
                    />
                  )}
                </div>

                {/* Stage label */}
                <div className="text-center px-1 max-w-[90px]">
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      isActive && "text-[#d4af37]",
                      isCompleted && "text-zinc-300",
                      isFailed && "text-red-400",
                      stage.status === "pending" && "text-zinc-600",
                    )}
                  >
                    {stage.label}
                  </p>
                  {stage.description && !compact && (
                    <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight line-clamp-2">
                      {stage.description}
                    </p>
                  )}
                  {stage.owner && isActive && (
                    <p className="text-[10px] text-[#d4af37]/80 mt-0.5 font-medium">
                      {stage.owner}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
