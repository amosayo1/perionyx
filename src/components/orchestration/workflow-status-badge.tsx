"use client";

interface WorkflowStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-500/10 text-zinc-400",
  running: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  rolled_back: "bg-amber-500/10 text-amber-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

export function WorkflowStatusBadge({ status, size = "sm" }: WorkflowStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium uppercase ${
      size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
    } ${STATUS_STYLES[status] ?? "bg-zinc-500/10 text-zinc-400"}`}>
      {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />}
      {status.replace("_", " ")}
    </span>
  );
}
