"use client";

import { FileText, ShoppingCart, FileSignature, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, User, ChevronRight } from "lucide-react";
import type { ApprovalRequest } from "./procurement-types";

interface ApprovalQueueProps {
  approvals: ApprovalRequest[];
}

const entityIcons: Record<string, React.ReactNode> = {
  pr: <FileText className="h-4 w-4" />,
  po: <ShoppingCart className="h-4 w-4" />,
  invoice: <FileSignature className="h-4 w-4" />,
  contract: <FileSignature className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
};

const entityColors: Record<string, string> = {
  pr: "text-blue-400", po: "text-amber-400", invoice: "text-purple-400", contract: "text-emerald-400", payment: "text-cyan-400",
};

const statusStyles: Record<string, { badge: string; icon: React.ReactNode }> = {
  pending: { badge: "bg-amber-950/50 text-amber-400 border-amber-900/50", icon: <Clock className="h-3 w-3" /> },
  approved: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <XCircle className="h-3 w-3" /> },
  escalated: { badge: "bg-red-950/50 text-red-400 border-red-900/50", icon: <AlertTriangle className="h-3 w-3" /> },
  delegated: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50", icon: <User className="h-3 w-3" /> },
};

export function ApprovalQueue({ approvals }: ApprovalQueueProps) {
  if (approvals.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-8">
        <p className="text-sm text-gray-500">No approval requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {approvals.map((apr) => {
        const style = statusStyles[apr.status] || statusStyles.pending;
        const isOverdue = apr.dueDate < new Date() && apr.status === "pending";
        const isApproved = apr.status === "approved";
        const isRejected = apr.status === "rejected";
        return (
          <div key={apr.id} className={`rounded-lg border ${isOverdue ? "border-red-900/50 bg-red-950/10" : "border-gray-800 bg-[#1a1a24]"} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 ${entityColors[apr.entityType] || "text-gray-400"}`}>
                {entityIcons[apr.entityType] || <DollarSign className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{apr.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-gray-500">{apr.entityNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                      {style.icon} {apr.status}
                    </span>
                    {isOverdue && <span className="text-[11px] font-medium text-red-400">Overdue</span>}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-300">${apr.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{apr.requesterId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">Level {apr.level}/{apr.maxLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className={`text-xs ${isOverdue ? "text-red-400" : "text-gray-400"}`}>{apr.dueDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {isApproved && <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3" /> Approved</span>}
                  {isRejected && <span className="inline-flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3 w-3" /> Rejected</span>}
                  {apr.isDelegated && <span className="inline-flex items-center gap-1 text-xs text-blue-400"><User className="h-3 w-3" /> Delegated</span>}
                  {apr.isEscalated && <span className="inline-flex items-center gap-1 text-xs text-red-400"><AlertTriangle className="h-3 w-3" /> Escalated</span>}
                  {apr.comments && <span className="text-xs text-gray-500">· {apr.comments}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
