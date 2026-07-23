"use client";

import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import type { ProcurementAlert } from "./procurement-types";

interface AlertsPanelProps {
  alerts: ProcurementAlert[];
  onDismiss?: (id: string) => void;
}

const severityStyles: Record<string, { icon: React.ReactNode; border: string; bg: string }> = {
  critical: {
    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    border: "border-red-900/50",
    bg: "bg-red-950/20",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    border: "border-amber-900/50",
    bg: "bg-amber-950/20",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-400" />,
    border: "border-blue-900/50",
    bg: "bg-blue-950/20",
  },
};

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const style = severityStyles[alert.severity] || severityStyles.info;
        return (
          <div key={alert.id} className={`flex items-start gap-3 rounded-lg border ${style.border} ${style.bg} p-3`}>
            <div className="mt-0.5">{style.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{alert.title}</p>
              <p className="text-xs text-gray-400">{alert.message}</p>
              {alert.actionRequired && (
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-950/50 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  <AlertCircle className="h-2.5 w-2.5" /> Action Required
                </span>
              )}
            </div>
            {onDismiss && (
              <button onClick={() => onDismiss(alert.id)} className="text-gray-600 hover:text-gray-400">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
