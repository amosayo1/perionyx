"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Vendor } from "@/server/procurement/ap-repositories/types";

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-500/20 text-emerald-300",
  MEDIUM: "bg-yellow-500/20 text-yellow-300",
  HIGH: "bg-orange-500/20 text-orange-300",
  CRITICAL: "bg-red-500/20 text-red-300",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-300",
  PENDING_REVIEW: "bg-amber-500/20 text-amber-300",
  SUSPENDED: "bg-red-500/20 text-red-300",
  DEACTIVATED: "bg-zinc-500/20 text-zinc-400",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

interface SupplierInfoProps {
  vendor: Vendor | null;
}

export function SupplierInfo({ vendor }: SupplierInfoProps) {
  if (!vendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Vendor information is not available.</p>
        </CardContent>
      </Card>
    );
  }

  const riskColor = RISK_COLORS[vendor.riskLevel] ?? "bg-zinc-500/20 text-zinc-300";
  const statusColor = STATUS_COLORS[vendor.status] ?? "bg-zinc-500/20 text-zinc-300";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-1">
            <span className="text-zinc-500">Supplier Name</span>
            <p className="font-medium text-white">{vendor.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Supplier Code</span>
            <p className="font-mono text-xs text-white">{vendor.vendorCode}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Status</span>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
              {vendor.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Risk Level</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskColor}`}>
                {vendor.riskLevel}
              </span>
              {vendor.riskScore > 0 && (
                <span className="text-xs text-zinc-500">Score: {Math.round(vendor.riskScore)}</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Payment Terms</span>
            <p className="text-white">{vendor.paymentTerms ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Total Spend</span>
            <p className="font-semibold text-white">{formatCurrency(vendor.totalSpend)}</p>
          </div>
          {vendor.contactName && (
            <div className="space-y-1">
              <span className="text-zinc-500">Contact</span>
              <p className="text-white">{vendor.contactName}</p>
            </div>
          )}
          {vendor.contactEmail && (
            <div className="space-y-1">
              <span className="text-zinc-500">Email</span>
              <p className="text-white">{vendor.contactEmail}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
