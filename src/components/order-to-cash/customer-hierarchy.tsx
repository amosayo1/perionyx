"use client";

import { Building2, ChevronRight, Users } from "lucide-react";

interface CustomerGroup {
  id: string;
  name: string;
  customerCount: number;
  totalRevenue: number;
  children?: CustomerGroup[];
}

interface CustomerHierarchyProps {
  groups: CustomerGroup[];
}

export function CustomerHierarchy({ groups }: CustomerHierarchyProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Customer Hierarchy</h3>
      </div>
      <div className="space-y-2">
        {renderGroups(groups)}
      </div>
    </div>
  );
}

function renderGroups(groups: CustomerGroup[], depth = 0) {
  return groups.map((group) => (
    <div key={group.id}>
      <div className={`flex items-center justify-between rounded-lg border border-gray-800 p-3 hover:bg-gray-800/30 ${depth > 0 ? "ml-6" : ""}`}>
        <div className="flex items-center gap-3">
          {depth > 0 && <ChevronRight className="h-3 w-3 text-gray-600" />}
          <div>
            <p className="text-sm font-medium text-gray-200">{group.name}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group.customerCount} customers</span>
              <span>${(group.totalRevenue / 1e6).toFixed(1)}M revenue</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{(group.totalRevenue / group.customerCount / 1e3).toFixed(0)}K avg</span>
        </div>
      </div>
      {group.children && group.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {renderGroups(group.children, depth + 1)}
        </div>
      )}
    </div>
  ));
}
