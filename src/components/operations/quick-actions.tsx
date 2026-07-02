"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";
import { quickActions } from "./data";
import {
  Send,
  CheckSquare,
  Landmark,
  AlertTriangle,
  RefreshCw,
  ScrollText,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import type { ElementType } from "react";

const actionIcons: Record<string, ElementType> = {
  send: Send,
  "check-square": CheckSquare,
  landmark: Landmark,
  "alert-triangle": AlertTriangle,
  "refresh-cw": RefreshCw,
  "scroll-text": ScrollText,
  "file-check": FileCheck,
};

export function QuickActions() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="Quick Actions"
        description="Frequently used operations and shortcuts"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = actionIcons[action.icon] ?? ArrowRight;

          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                action.variant === "primary"
                  ? "border-[#d4af37]/20 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30"
                  : "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/[0.1]",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  action.variant === "primary"
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white group-hover:text-[#d4af37] transition-colors">
                  {action.label}
                </p>
                <p className="text-[10px] text-zinc-600 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
