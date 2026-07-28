"use client";

import { FileText, AlertTriangle, Clock, CheckCircle, XCircle, Ban } from "lucide-react";
import type { PurchaseRequest } from "./procurement-types";

interface PurchaseRequestBoardProps {
  requests: PurchaseRequest[];
}

const statusStyles: Record<string, { badge: string; icon: React.ReactNode }> = {
  draft: { badge: "bg-gray-800 text-gray-400 border-gray-700", icon: <FileText className="h-3 w-3" /> },
  submitted: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50", icon: <Clock className="h-3 w-3" /> },
  approved: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <XCircle className="h-3 w-3" /> },
  cancelled: { badge: "bg-gray-800 text-gray-500 border-gray-700", icon: <Ban className="h-3 w-3" /> },
  converted: { badge: "bg-purple-950/50 text-purple-400 border-purple-900/50", icon: <CheckCircle className="h-3 w-3" /> },
};

const urgencyColors: Record<string, string> = {
  low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400", critical: "text-red-500",
};

export function PurchaseRequestBoard({ requests }: PurchaseRequestBoardProps) {
  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-8">
        <p className="text-sm text-gray-500">No purchase requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a24]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">PR Number</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Requester</th>
            <th className="px-4 py-3 font-medium text-right">Total Amount</th>
            <th className="px-4 py-3 font-medium">Urgency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a24]">
          {requests.map((pr) => {
            const style = statusStyles[pr.status] || statusStyles.draft;
            return (
              <tr key={pr.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{pr.prNumber}</td>
                <td className="px-4 py-3 text-xs text-gray-200">{pr.title}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    {style.icon} {pr.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{pr.department}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{pr.requestedBy}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">${pr.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${urgencyColors[pr.urgency] || "text-gray-400"}`}>
                    {pr.urgency === "critical" && <AlertTriangle className="h-3 w-3" />}
                    {pr.urgency}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
