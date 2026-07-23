"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, DollarSign, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/format";

interface ApprovalCardProps {
  title: string;
  amount?: string;
  requester?: string;
  timestamp?: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  department?: string;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { badge: "warning" | "success" | "danger" | "secondary"; icon: typeof Clock; text: string }> = {
  pending: { badge: "warning", icon: Clock, text: "Pending" },
  approved: { badge: "success", icon: CheckCircle2, text: "Approved" },
  rejected: { badge: "danger", icon: XCircle, text: "Rejected" },
  escalated: { badge: "secondary", icon: AlertTriangle, text: "Escalated" },
};

export function ApprovalCard({ title, amount, requester, timestamp, status, department, onApprove, onReject, className }: ApprovalCardProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white">{title}</p>
              <Badge variant={config.badge}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.text}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              {amount && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {amount}
                </span>
              )}
              {requester && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {requester}
                </span>
              )}
              {department && (
                <span className="flex items-center gap-1">{department}</span>
              )}
              {timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(timestamp)}
                </span>
              )}
            </div>
          </div>
          {status === "pending" && onApprove && onReject && (
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={onReject} className="h-8 gap-1.5 text-xs">
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button size="sm" onClick={onApprove} className="h-8 gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
