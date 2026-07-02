"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueCardData } from "./types";

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColorMap: Record<string, string> = {
  up: "text-[#d4af37]",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

export function QueueCard({ card }: { card: QueueCardData }) {
  const TrendIcon = trendIconMap[card.trend];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-white">{card.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {card.count}
            </span>
            <div
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-medium",
                trendColorMap[card.trend],
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {card.trendLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px] text-zinc-600 mb-4">
        <div className="flex justify-between">
          <span>Avg wait time</span>
          <span className="text-zinc-400 font-medium">{card.avgWait}</span>
        </div>
        <div className="flex justify-between">
          <span>Largest item</span>
          <span className="text-zinc-400 truncate max-w-[160px]">{card.largestItem}</span>
        </div>
      </div>

      <Button asChild variant="outline" size="sm" className="w-full gap-1.5 text-xs">
        <Link href={card.href}>
          Open Queue
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
