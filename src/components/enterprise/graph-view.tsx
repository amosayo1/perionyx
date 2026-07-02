"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  subtitle?: string;
  type: string;
  href?: string;
  children?: GraphNode[];
}

interface GraphViewProps {
  root: GraphNode;
  className?: string;
}

const typeColors: Record<string, string> = {
  payment: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  vendor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  bank: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  approval: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  policy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ledger: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  risk: "border-red-500/30 bg-red-500/10 text-red-400",
  audit: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  report: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  notification: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  default: "border-white/[0.08] bg-white/[0.03] text-zinc-400",
};

export function GraphView({ root, className }: GraphViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([root.id]));
  const [selected, setSelected] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (node: GraphNode, depth: number = 0, isLast: boolean = true) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selected === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const color = typeColors[node.type] ?? typeColors.default;

    return (
      <div key={node.id} className="relative">
        {/* Connection line */}
        {depth > 0 && (
          <div className="absolute left-4 top-0 bottom-1/2 w-px bg-white/[0.06]" />
        )}

        <div className="relative flex items-start gap-2 py-1">
          {/* Indent spacer */}
          {depth > 0 && <div className="w-8 shrink-0" />}

          {/* Expand/collapse toggle */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/[0.06] bg-white/[0.03] text-[8px] text-zinc-600 hover:bg-white/[0.06] transition-colors"
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
          {!hasChildren && depth > 0 && (
            <div className="mt-1.5 h-4 w-4 shrink-0" />
          )}

          {/* Node */}
          <button
            onClick={() => {
              setSelected(node.id);
              if (node.href) window.location.href = node.href;
            }}
            onMouseEnter={() => setSelected(node.id)}
            onMouseLeave={() => setSelected(null)}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-left transition-all",
              color,
              isSelected ? "ring-1 ring-white/[0.1]" : "",
              "hover:opacity-80",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
              )}>
                {node.type}
              </span>
              <span className="text-xs font-medium text-white">{node.label}</span>
            </div>
            {node.subtitle && (
              <p className="text-[10px] text-zinc-500 mt-0.5">{node.subtitle}</p>
            )}
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-white/[0.06] pl-2">
            {node.children!.map((child, i) => renderNode(child, depth + 1, i === node.children!.length - 1))}
          </div>
        )}

        {/* Arrow between levels */}
        {hasChildren && isExpanded && depth === 0 && (
          <div className="flex items-center gap-1 pl-14 py-0.5">
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4", className)}>
      <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-3">
        Relationship Graph
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          {renderNode(root)}
        </div>
      </div>
    </div>
  );
}

export type { GraphNode };
