"use client";

import { Search, Filter, RefreshCw } from "lucide-react";

interface ProcurementFiltersProps {
  statusOptions: string[];
  vendorOptions: string[];
  departmentOptions: string[];
  categoryOptions: string[];
  periodOptions: string[];
  onStatusChange?: (status: string) => void;
  onVendorChange?: (vendor: string) => void;
  onDepartmentChange?: (department: string) => void;
  onCategoryChange?: (category: string) => void;
  onPeriodChange?: (period: string) => void;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
}

export function ProcurementFilters({
  statusOptions, vendorOptions, departmentOptions, categoryOptions, periodOptions,
  onStatusChange, onVendorChange, onDepartmentChange, onCategoryChange, onPeriodChange,
  onSearchChange, onRefresh,
}: ProcurementFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-800 bg-[#1a1a1a] px-3 py-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search procurement..."
          className="w-full rounded border border-gray-700 bg-gray-900 py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-gray-600 focus:border-gray-600 focus:outline-none"
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onStatusChange?.(e.target.value)}>
        <option value="">All Status</option>
        {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/-/g, " ")}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onVendorChange?.(e.target.value)}>
        <option value="">All Vendors</option>
        {vendorOptions.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onDepartmentChange?.(e.target.value)}>
        <option value="">All Departments</option>
        {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onCategoryChange?.(e.target.value)}>
        <option value="">All Categories</option>
        {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300 focus:border-gray-600 focus:outline-none" onChange={(e) => onPeriodChange?.(e.target.value)}>
        <option value="">All Periods</option>
        {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
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
