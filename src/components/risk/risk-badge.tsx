import type { HeatLevel, Priority, RiskLevel, RiskStatus } from "./risk-types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const heatStyles: Record<HeatLevel, string> = {
  extreme: "bg-red-900/50 text-red-300 border border-red-800",
  high: "bg-orange-900/50 text-orange-300 border border-orange-800",
  elevated: "bg-amber-900/50 text-amber-300 border border-amber-800",
  moderate: "bg-yellow-900/50 text-yellow-300 border border-yellow-800",
  low: "bg-emerald-900/50 text-emerald-300 border border-emerald-800",
};

const priorityStyles: Record<Priority, string> = {
  critical: "bg-red-900/50 text-red-300 border border-red-800",
  high: "bg-orange-900/50 text-orange-300 border border-orange-800",
  medium: "bg-blue-900/50 text-blue-300 border border-blue-800",
  low: "bg-gray-700 text-gray-300 border border-gray-600",
};

const statusStyles: Record<RiskStatus, string> = {
  identified: "bg-gray-700 text-gray-300",
  assessed: "bg-blue-900/50 text-blue-300",
  mitigated: "bg-emerald-900/50 text-emerald-300",
  monitored: "bg-amber-900/50 text-amber-300",
  closed: "bg-gray-800 text-gray-500",
  historical: "bg-gray-800 text-gray-500",
  emerging: "bg-purple-900/50 text-purple-300",
};

export function HeatBadge({ level }: { level: HeatLevel }) {
  return <Badge className={heatStyles[level]}>{level}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={priorityStyles[priority]}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: RiskStatus }) {
  return <Badge className={statusStyles[status]}>{status.replace(/-/g, " ")}</Badge>;
}