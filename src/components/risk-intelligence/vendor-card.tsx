"use client";

import { cn } from "@/lib/utils";
import { Building2, MapPin, AlertTriangle, ShieldCheck, Eye } from "lucide-react";
import type { Vendor } from "./types";

const riskColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <ShieldCheck className="h-3 w-3 text-[#d4af37]" />,
  review: <Eye className="h-3 w-3 text-amber-400" />,
  watchlist: <AlertTriangle className="h-3 w-3 text-red-400" />,
  suspended: <AlertTriangle className="h-3 w-3 text-zinc-500" />,
};

const statusLabels: Record<string, string> = {
  active: "Active",
  review: "In Review",
  watchlist: "Watch List",
  suspended: "Suspended",
};

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <Building2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{vendor.name}</p>
            <span className="text-[10px] text-zinc-600">{vendor.category}</span>
          </div>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold shrink-0", riskColors[vendor.riskLevel])}>
          {vendor.riskLevel.charAt(0).toUpperCase() + vendor.riskLevel.slice(1)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <MapPin className="h-3 w-3" />
        <span>{vendor.country}</span>
        <span className="flex items-center gap-1 ml-auto">
          {statusIcons[vendor.status]}
          <span>{statusLabels[vendor.status]}</span>
        </span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-600 leading-relaxed border-t border-white/[0.04] pt-2">
        {vendor.recommendation}
      </p>
    </div>
  );
}
