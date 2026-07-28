"use client";

import type { O2CAlert } from "./o2c-types";
import { AlertTriangle, Info, AlertCircle, X, DollarSign, Clock, Users, FileText } from "lucide-react";

interface AlertsPanelProps {
  alerts: O2CAlert[];
  max?: number;
  onDismiss?: (id: string) => void;
}

const severityConfig: Record<string, { icon: React.ReactNode; border: string; bg: string; label: string }> = {
  critical: {
    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    border: "border-red-900/50",
    bg: "bg-red-950/20",
    label: "Critical",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    border: "border-amber-900/50",
    bg: "bg-amber-950/20",
    label: "Warning",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-400" />,
    border: "border-blue-900/50",
    bg: "bg-blue-950/20",
    label: "Info",
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  cash: <DollarSign className="h-3 w-3" />,
  dso: <Clock className="h-3 w-3" />,
  customer: <Users className="h-3 w-3" />,
  credit: <AlertTriangle className="h-3 w-3" />,
  invoice: <FileText className="h-3 w-3" />,
};

export function AlertsPanel({ alerts, max = 10, onDismiss }: AlertsPanelProps) {
  const displayed = alerts.slice(0, max);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-medium text-gray-200">Alerts</h3>
      </div>
      <div className="space-y-2">
        {displayed.map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div key={alert.id} className={`flex items-start gap-3 rounded-lg border ${config.border} ${config.bg} p-3`}>
              <div className="mt-0.5">{config.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-200">{alert.title}</p>
                  <span className={`text-[10px] font-medium ${
                    alert.severity === "critical" ? "text-red-400" : alert.severity === "warning" ? "text-amber-400" : "text-blue-400"
                  }`}>{config.label}</span>
                </div>
                <p className="text-xs text-gray-400">{alert.message}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                  <span>{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
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
    </div>
  );
}
