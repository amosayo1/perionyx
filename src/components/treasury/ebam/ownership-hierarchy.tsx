"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_OWNERSHIP } from "./data";
import type { OwnershipNode } from "./types";
import { ChevronRight, ChevronDown, Building2, Globe, Users, Briefcase, Landmark, Wallet, Minus } from "lucide-react";

const typeIcons: Record<OwnershipNode["type"], typeof Building2> = {
  enterprise: Globe,
  region: Globe,
  entity: Building2,
  business_unit: Briefcase,
  bank: Landmark,
  account: Wallet,
};

const typeColors: Record<OwnershipNode["type"], string> = {
  enterprise: "text-amber-400",
  region: "text-blue-400",
  entity: "text-emerald-400",
  business_unit: "text-purple-400",
  bank: "text-cyan-400",
  account: "text-zinc-400",
};

const typeLabels: Record<OwnershipNode["type"], string> = {
  enterprise: "Enterprise",
  region: "Region",
  entity: "Entity",
  business_unit: "BU",
  bank: "Bank",
  account: "Account",
};

function countDescendants(node: OwnershipNode): number {
  let c = 0;
  for (const child of node.children) {
    c += 1 + countDescendants(child);
  }
  return c;
}

function TreeNode({ node, depth, defaultExpanded }: { node: OwnershipNode; depth: number; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(depth < 2 || defaultExpanded);
  const hasChildren = node.children.length > 0;
  const descendantCount = countDescendants(node);
  const Icon = typeIcons[node.type];
  const indent = depth * 20;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 transition-colors hover:bg-zinc-800/40",
          depth === 0 && "bg-zinc-800/60 rounded-md"
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse node" : `Expand ${node.label}`}
            className="flex items-center justify-center text-zinc-500 hover:text-zinc-300"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <Minus className="h-3.5 w-3.5 text-zinc-700" />
        )}
        <Icon className={cn("h-3.5 w-3.5", typeColors[node.type])} />
        <span className={cn("text-[13px]", depth === 0 ? "font-semibold text-white" : depth === 1 ? "font-medium text-white" : "font-normal text-zinc-300")}>
          {node.label}
        </span>
        {depth > 0 && (
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", typeColors[node.type].replace("text-", "bg-").replace("-400", "-500/10 ") + typeColors[node.type])}>
            {typeLabels[node.type]}
          </span>
        )}
        {hasChildren && (
          <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
            {descendantCount} descendant{descendantCount !== 1 ? "s" : ""}
          </span>
        )}
        {node.type === "account" && node.metadata.currency && (
          <span className="ml-1 text-[11px] text-zinc-600">
            {node.metadata.currency} {(node.metadata.balance ? (Number(node.metadata.balance) / 1000000).toFixed(1) : "0.0")}M
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} defaultExpanded={false} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OwnershipHierarchyProps {
  className?: string;
}

export function OwnershipHierarchy({ className }: OwnershipHierarchyProps) {
  const totalNodes = countDescendants(MOCK_OWNERSHIP) + 1;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Ownership Hierarchy</h3>
            <p className="text-[12px] text-zinc-500">{totalNodes} nodes across enterprise structure</p>
          </div>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">{totalNodes} nodes</span>
        </div>
      </div>
      <div className="overflow-auto py-2" style={{ maxHeight: "600px" }}>
        <div role="tree" aria-label="Enterprise ownership hierarchy">
          <TreeNode node={MOCK_OWNERSHIP} depth={0} defaultExpanded={true} />
        </div>
      </div>
    </div>
  );
}