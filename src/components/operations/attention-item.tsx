"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { AttentionItem as AttentionItemType } from "./types";

const severityConfig: Record<
  string,
  { label: string; className: string }
> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  low: {
    label: "Low",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export function AttentionItem({ item }: { item: AttentionItemType }) {
  const severity = severityConfig[item.severity] ?? severityConfig.low;

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all duration-200 hover:bg-zinc-900/60 hover:border-white/[0.1]">
      {/* Severity indicator line */}
      <div
        className={cn(
          "mt-1 h-full min-h-[40px] w-[3px] shrink-0 rounded-full",
          item.severity === "critical" && "bg-red-500",
          item.severity === "high" && "bg-orange-500",
          item.severity === "medium" && "bg-amber-500",
          item.severity === "low" && "bg-zinc-600",
        )}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Icon */}
        {item.severity === "critical" && (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                severity.className,
              )}
            >
              {severity.label}
            </span>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {item.category}
            </Badge>
            <span className="text-[10px] text-zinc-600 font-mono">{item.age}</span>
          </div>
          <h3 className="mt-1 text-sm font-medium text-white">{item.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
            <span>Owner: {item.owner}</span>
            <span>Status: {item.status}</span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0 self-center">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={item.actionHref}>
              {item.actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
