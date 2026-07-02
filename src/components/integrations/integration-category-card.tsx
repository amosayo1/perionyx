"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Landmark, Building2, Calculator, Shield, MessageCircle, Code, HardDrive, BarChart3, Banknote, Puzzle } from "lucide-react";
import type { IntegrationCategory } from "./types";

const iconMap: Record<string, React.ReactNode> = {
  banking: <Landmark className="h-5 w-5" />,
  erp: <Building2 className="h-5 w-5" />,
  accounting: <Calculator className="h-5 w-5" />,
  identity: <Shield className="h-5 w-5" />,
  communication: <MessageCircle className="h-5 w-5" />,
  developer: <Code className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />,
  payments: <Banknote className="h-5 w-5" />,
  compliance: <Shield className="h-5 w-5" />,
  ai: <Puzzle className="h-5 w-5" />,
};

const healthColor: Record<string, string> = {
  connected: "text-[#d4af37]",
  available: "text-zinc-500",
  warning: "text-amber-400",
};

export function IntegrationCategoryCard({ category }: { category: IntegrationCategory }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
          {iconMap[category.id] ?? <Code className="h-5 w-5" />}
        </div>
        <span className={cn("text-[10px] font-semibold", healthColor[category.health] ?? "text-zinc-500")}>
          {category.health === "connected" ? "Healthy" : category.health === "available" ? "Available" : "Warning"}
        </span>
      </div>

      <h3 className="text-sm font-medium text-white">{category.label}</h3>
      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{category.description}</p>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-zinc-600">
          {category.connectedCount}/{category.providerCount} connected
        </span>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-zinc-500 hover:text-white">
          Open <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
