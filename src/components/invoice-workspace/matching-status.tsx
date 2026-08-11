"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ThreeWayMatch, MatchLineItem } from "@/server/procurement/ap-repositories/types";

const MATCH_COLORS: Record<string, string> = {
  FULL_MATCH: "bg-emerald-500/20 text-emerald-300",
  PARTIAL_MATCH: "bg-yellow-500/20 text-yellow-300",
  PRICE_VARIANCE: "bg-orange-500/20 text-orange-300",
  QTY_VARIANCE: "bg-orange-500/20 text-orange-300",
  NO_MATCH: "bg-red-500/20 text-red-300",
};

const LINE_MATCH_COLORS: Record<string, string> = {
  EXACT_MATCH: "bg-emerald-500/20 text-emerald-300",
  PRICE_VARIANCE: "bg-orange-500/20 text-orange-300",
  QTY_VARIANCE: "bg-orange-500/20 text-orange-300",
  NO_MATCH: "bg-red-500/20 text-red-300",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface MatchingStatusProps {
  match: ThreeWayMatch | null;
  lineItems?: MatchLineItem[];
}

export function MatchingStatus({ match, lineItems }: MatchingStatusProps) {
  if (!match) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Three-way matching has not been performed on this invoice.</p>
        </CardContent>
      </Card>
    );
  }

  const matchColor = MATCH_COLORS[match.matchResult] ?? "bg-zinc-500/20 text-zinc-300";
  const items = lineItems ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${matchColor}`}>
            {match.matchResult.replace(/_/g, " ")}
          </span>
          {match.overallConfidence > 0 && (
            <span className="text-xs text-zinc-500">
              Confidence: {Math.round(match.overallConfidence * 100)}%
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Price Variance</span>
            <p className={`font-medium ${match.priceVarianceTotal !== 0 ? "text-orange-300" : "text-emerald-300"}`}>
              {formatCurrency(Math.abs(match.priceVarianceTotal))}
              {match.priceVarianceTotal !== 0 && (
                <span className="ml-1 text-xs text-zinc-500">{match.priceVarianceTotal > 0 ? "over" : "under"}</span>
              )}
            </p>
          </div>
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Qty Variance</span>
            <p className={`font-medium ${match.quantityVarianceTotal !== 0 ? "text-orange-300" : "text-emerald-300"}`}>
              {match.quantityVarianceTotal !== 0 ? `${Math.abs(match.quantityVarianceTotal)} units` : "None"}
            </p>
          </div>
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Total Variance</span>
            <p className={`font-medium ${match.totalVariance !== 0 ? "text-orange-300" : "text-emerald-300"}`}>
              {formatCurrency(Math.abs(match.totalVariance))}
            </p>
          </div>
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Variance %</span>
            <p className="font-medium text-white">{match.variancePercent.toFixed(2)}%</p>
          </div>
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Matched By</span>
            <p className="text-white">{match.matchedBy}</p>
          </div>
          <div className="space-y-1 rounded-md bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-zinc-500">Matched At</span>
            <p className="text-white">{formatDate(match.matchedAt)}</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <span className="text-xs font-medium text-zinc-400">Line Items</span>
            <div className="mt-2 space-y-1.5">
              {items.map((item) => {
                const lineColor = LINE_MATCH_COLORS[item.matchStatus] ?? "bg-zinc-500/20 text-zinc-300";
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${lineColor}`}>
                        {item.matchStatus.replace(/_/g, " ")}
                      </span>
                      <span className="text-zinc-300">{item.invoiceQuantity} @ {formatCurrency(item.invoiceUnitPrice)}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {item.priceVariance !== 0 && `Price Δ ${formatCurrency(item.priceVariance)} `}
                      {item.quantityVariance !== 0 && `Qty Δ ${item.quantityVariance}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
