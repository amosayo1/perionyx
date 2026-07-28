"use client";

import { Search, Filter, RefreshCw, Building2, Calendar } from "lucide-react";
import type { CustomerStatus, BillingType, AgingBucket } from "./o2c-types";

interface RevenueFiltersProps {
  statusOptions: CustomerStatus[];
  customerOptions: string[];
  billingTypeOptions: BillingType[];
  periodOptions: string[];
  agingBucketOptions: AgingBucket[];
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
  onCustomerChange?: (customer: string) => void;
  onBillingTypeChange?: (type: string) => void;
  onPeriodChange?: (period: string) => void;
  onAgingBucketChange?: (bucket: string) => void;
  onRefresh?: () => void;
}

export function RevenueFilters({
  statusOptions, customerOptions, billingTypeOptions, periodOptions, agingBucketOptions,
  onSearchChange, onStatusChange, onCustomerChange, onBillingTypeChange, onPeriodChange, onAgingBucketChange, onRefresh,
}: RevenueFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="Search customers, invoices..." className="w-full rounded border border-gray-700 bg-gray-900 py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-gray-600 focus:border-gray-600 focus:outline-none" onChange={(e) => onSearchChange?.(e.target.value)} />
      </div>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onStatusChange?.(e.target.value)}>
        <option value="">All Status</option>
        {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/-/g, " ")}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onCustomerChange?.(e.target.value)}>
        <option value="">All Customers</option>
        {customerOptions.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onBillingTypeChange?.(e.target.value)}>
        <option value="">All Billing</option>
        {billingTypeOptions.map((t) => <option key={t} value={t}>{t.replace(/-/g, " ")}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onPeriodChange?.(e.target.value)}>
        <option value="">All Periods</option>
        {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onAgingBucketChange?.(e.target.value)}>
        <option value="">All Buckets</option>
        {agingBucketOptions.map((b) => <option key={b} value={b}>{b.replace(/-/g, " ")}</option>)}
      </select>
      {onRefresh && (
        <button onClick={onRefresh} className="rounded border border-gray-700 p-1.5 text-gray-500 hover:border-gray-600 hover:text-gray-300">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}
      <button className="flex items-center gap-1 rounded border border-gray-700 px-2 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-300">
        <Filter className="h-3 w-3" />
        Filters
      </button>
    </div>
  );
}
