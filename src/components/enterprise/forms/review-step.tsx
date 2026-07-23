"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewItem {
  label: string;
  value: string;
  status?: "valid" | "invalid" | "warning";
  hint?: string;
}

interface ReviewStepProps {
  items: ReviewItem[];
  onEdit?: (index: number) => void;
  className?: string;
  title?: string;
  description?: string;
}

export const ReviewStep = memo(function ReviewStep({
  items,
  onEdit,
  className,
  title = "Review Configuration",
  description = "Please verify all values before proceeding",
}: ReviewStepProps) {
  const hasErrors = items.some((i) => i.status === "invalid");

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>

      {hasErrors && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">Some fields require attention. Review highlighted items below.</p>
        </div>
      )}

      <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.06]">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              item.status === "invalid" && "bg-red-500/5",
              item.status === "warning" && "bg-amber-500/5",
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                {item.label}
                {item.status === "valid" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {item.status === "invalid" && <AlertCircle className="h-3 w-3 text-red-400" />}
              </p>
              <p className={cn(
                "text-sm font-medium truncate",
                item.status === "invalid" ? "text-red-300" : "text-white",
              )}>
                {item.value}
              </p>
              {item.hint && (
                <p className={cn(
                  "text-[10px] mt-0.5",
                  item.status === "invalid" ? "text-red-400" : "text-zinc-500",
                )}>
                  {item.hint}
                </p>
              )}
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors shrink-0"
              >
                Edit
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
