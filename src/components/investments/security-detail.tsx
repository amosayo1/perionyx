"use client";

import { memo } from "react";
import { Building2, Award, Percent, Calendar, Shield, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Security } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface SecurityDetailProps {
  security: Security;
  className?: string;
}

const RATING_COLORS: Record<string, string> = {
  AAA: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "AA+": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  AA: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "AA-": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "A+": "text-blue-400 border-blue-500/20 bg-blue-500/10",
  A: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  "A-": "text-blue-400 border-blue-500/20 bg-blue-500/10",
  "BBB+": "text-amber-400 border-amber-500/20 bg-amber-500/10",
  BBB: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  "BBB-": "text-amber-400 border-amber-500/20 bg-amber-500/10",
};

function DetailRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700/50 bg-zinc-800/60">
        <div className="h-4 w-4 text-zinc-500">{icon}</div>
      </div>
      <div>
        <p className="text-[11px] text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

export const SecurityDetail = memo(function SecurityDetail({ security, className }: SecurityDetailProps) {
  const ratingColor = RATING_COLORS[security.creditRating] ?? "text-zinc-400 border-zinc-500/20 bg-zinc-500/10";
  return (
    <div className={cn("space-y-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">{security.name}</h3>
            {security.ticker && <span className="text-sm text-zinc-500">({security.ticker})</span>}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{security.issuer}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold", ratingColor)}>
            {security.creditRating}
          </span>
          <span className="rounded-md border border-zinc-700/50 bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
            {security.securityType.replace(/-/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailRow label="Issuer" value={security.issuer} icon={<Building2 />} />
        <DetailRow label="Credit Rating" value={security.creditRating} icon={<Award />} />
        {security.coupon != null && <DetailRow label="Coupon" value={`${security.coupon}%`} icon={<Percent />} />}
        {security.couponType && <DetailRow label="Coupon Type" value={security.couponType.replace(/-/g, " ")} icon={<Tag />} />}
        {security.maturityDate && <DetailRow label="Maturity Date" value={formatDate(security.maturityDate)} icon={<Calendar />} />}
        {security.issueDate && <DetailRow label="Issue Date" value={formatDate(security.issueDate)} icon={<Calendar />} />}
        <DetailRow label="Risk Rating" value={security.riskRating.replace(/-/g, " ")} icon={<Shield />} />
        <DetailRow label="Liquidity" value={security.liquidityRating} icon={<Shield />} />
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/40 pt-3">
        <div>
          <p className="text-[11px] text-zinc-500">Issue Size</p>
          <p className="text-sm font-bold text-white">{formatCurrency(security.issueSize)}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">Outstanding</p>
          <p className="text-sm font-bold text-white">{formatCurrency(security.outstandingAmount)}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">Sector</p>
          <p className="text-sm font-bold text-white">{security.sector}</p>
        </div>
      </div>
    </div>
  );
});
