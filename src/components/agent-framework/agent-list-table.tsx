"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Bot, Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentStatusBadge } from "./agent-status-badge";

interface AgentListTableProps {
  agents: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    capabilityCount?: number;
    taskCount?: number;
    healthStatus?: "healthy" | "degraded" | "unhealthy";
    lastActiveAt?: string;
  }>;
  onRowClick?: (agent: AgentListTableProps["agents"][number]) => void;
  className?: string;
}

type SortKey = "name" | "role" | "status" | "capabilityCount" | "taskCount" | "healthStatus" | "lastActiveAt";
type SortDir = "asc" | "desc";

const HEALTH_LABELS: Record<string, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
};

const HEALTH_DOTS: Record<string, string> = {
  healthy: "bg-emerald-400",
  degraded: "bg-amber-400",
  unhealthy: "bg-red-400",
};

function getAgentValue(agent: AgentListTableProps["agents"][number], key: SortKey): string | number {
  switch (key) {
    case "name": return agent.name;
    case "role": return agent.role;
    case "status": return agent.status;
    case "capabilityCount": return agent.capabilityCount ?? 0;
    case "taskCount": return agent.taskCount ?? 0;
    case "healthStatus": return agent.healthStatus ?? "healthy";
    case "lastActiveAt": return agent.lastActiveAt ?? "";
    default: return "";
  }
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDir }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40" />;
  return direction === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3 shrink-0 text-[#d4af37]" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 shrink-0 text-[#d4af37]" />
  );
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function AgentListTable({ agents, onRowClick, className }: AgentListTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const sorted = useMemo(() => {
    const copy = [...agents];
    copy.sort((a, b) => {
      const aVal = getAgentValue(a, sortKey);
      const bVal = getAgentValue(b, sortKey);
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [agents, sortKey, sortDir]);

  const columns: Array<{ key: SortKey; label: string; className?: string }> = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "capabilityCount", label: "Capabilities", className: "text-right" },
    { key: "taskCount", label: "Tasks", className: "text-right" },
    { key: "healthStatus", label: "Health" },
    { key: "lastActiveAt", label: "Last Active" },
  ];

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
          <Inbox className="h-6 w-6 text-zinc-500" />
        </div>
        <p className="mt-4 text-sm font-medium text-white">No agents found</p>
        <p className="mt-1 text-xs text-zinc-500">Create your first agent to get started.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101010]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "group cursor-pointer select-none",
                    col.className,
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <SortIcon active={sortKey === col.key} direction={sortDir} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((agent, index) => (
              <motion.tr
                key={agent.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={cn(
                  "border-b border-white/[0.05] transition-colors hover:bg-white/[0.03]",
                  onRowClick && "cursor-pointer",
                )}
                onClick={() => onRowClick?.(agent)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10">
                      <Bot className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-400">{agent.role}</span>
                </TableCell>
                <TableCell>
                  <AgentStatusBadge status={agent.status} />
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm tabular-nums text-zinc-400">{agent.capabilityCount ?? 0}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm tabular-nums text-zinc-400">{agent.taskCount ?? 0}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", HEALTH_DOTS[agent.healthStatus ?? "healthy"])} />
                    <span className="text-sm text-zinc-400">{HEALTH_LABELS[agent.healthStatus ?? "healthy"]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-500">{formatRelativeTime(agent.lastActiveAt)}</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-zinc-500">
        {agents.length} agent{agents.length !== 1 && "s"}
      </p>
    </div>
  );
}
