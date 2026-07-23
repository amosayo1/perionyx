"use client";

import type { CollectionCase } from "./o2c-types";
import { Phone, Mail, AlertTriangle, ArrowUp, User, Calendar } from "lucide-react";

interface CollectionsDashboardProps {
  cases: CollectionCase[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  open: "bg-blue-900/50 text-blue-300",
  in_progress: "bg-amber-900/50 text-amber-300",
  escalated: "bg-red-900/50 text-red-300",
  resolved: "bg-emerald-900/50 text-emerald-300",
  closed: "bg-gray-800 text-gray-500",
};

const escalationStyles: Record<string, string> = {
  none: "text-gray-500",
  level_1: "text-amber-400",
  level_2: "text-orange-400",
  level_3: "text-red-400 font-semibold",
};

const actionStyles: Record<string, string> = {
  call: "bg-blue-900/30 text-blue-400",
  email: "bg-violet-900/30 text-violet-400",
  follow_up: "bg-amber-900/30 text-amber-400",
  negotiation: "bg-emerald-900/30 text-emerald-400",
  escalation: "bg-red-900/30 text-red-400",
};

export function CollectionsDashboard({ cases, max = 20 }: CollectionsDashboardProps) {
  const displayed = cases.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Invoice</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Assignee</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Promise Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Escalation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((c) => (
            <tr key={c.id} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-sm text-gray-200">{c.customerName}</td>
              <td className="px-3 py-2 text-xs font-medium text-gray-200">{c.invoiceNumber}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${c.amount.toLocaleString()}</td>
              <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[c.status] || "bg-gray-700 text-gray-300"}`}>{c.status.replace(/_/g, " ")}</span></td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${actionStyles[c.action] || "bg-gray-700 text-gray-300"}`}>
                  {c.action === "call" ? <Phone className="h-2.5 w-2.5" /> : c.action === "email" ? <Mail className="h-2.5 w-2.5" /> : null}
                  {c.action.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-400">{c.assignee || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-400">{c.promiseDate ? new Date(c.promiseDate).toLocaleDateString() : "—"}</td>
              <td className="px-3 py-2"><span className="text-xs text-gray-500">Level {c.escalationLevel}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
