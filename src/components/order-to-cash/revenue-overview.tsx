"use client";

import type { O2COverviewMetrics } from "./o2c-types";
import { Users, FileText, DollarSign, Clock, AlertTriangle, CheckCircle, Ban, Wallet } from "lucide-react";

interface RevenueOverviewProps {
  metrics: O2COverviewMetrics;
}

export function RevenueOverview({ metrics }: RevenueOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Total Customers</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.totalCustomers.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-gray-500">{metrics.activeCustomers} active</p>
          </div>
          <div className="text-gray-500"><Users className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Sales Orders</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.totalOrders.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-gray-500">{metrics.openOrders} open</p>
          </div>
          <div className="text-gray-500"><FileText className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Invoices</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.totalInvoices.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-gray-500">{metrics.openInvoices} open</p>
          </div>
          <div className="text-gray-500"><FileText className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Total AR</p>
            <p className="mt-1 text-2xl font-semibold text-white">${(metrics.totalAR / 1e6).toFixed(1)}M</p>
          </div>
          <div className="text-gray-500"><DollarSign className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Overdue AR</p>
            <p className="mt-1 text-2xl font-semibold text-red-400">${(metrics.overdueAR / 1e6).toFixed(1)}M</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-gray-500"><AlertTriangle className="h-4 w-4" /></div>
            {metrics.overdueAR > 0 && <div className="h-2 w-2 rounded-full bg-red-500" />}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">DSO</p>
            <p className={`mt-1 text-2xl font-semibold ${metrics.dso <= 45 ? "text-emerald-400" : metrics.dso <= 60 ? "text-amber-400" : "text-red-400"}`}>{metrics.dso.toFixed(1)}d</p>
          </div>
          <div className="text-gray-500"><Clock className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Cash Collected</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">${(metrics.cashCollected / 1e6).toFixed(1)}M</p>
          </div>
          <div className="text-gray-500"><CheckCircle className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Collection Cases</p>
            <p className={`mt-1 text-2xl font-semibold ${metrics.collectionCases > 0 ? "text-amber-400" : "text-emerald-400"}`}>{metrics.collectionCases}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-gray-500"><Ban className="h-4 w-4" /></div>
            {metrics.collectionCases > 0 && <div className="h-2 w-2 rounded-full bg-amber-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}
