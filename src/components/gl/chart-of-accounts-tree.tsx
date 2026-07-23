"use client";

import { useState, memo } from "react";
import { ChevronRight, ChevronDown, FolderOpen, File } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account } from "./gl-types";

interface ChartOfAccountsTreeProps {
  accounts: Account[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  assets: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  liabilities: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  equity: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  revenue: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  expense: "border-red-500/20 bg-red-500/10 text-red-400",
  cogs: "border-red-500/20 bg-red-500/10 text-red-400",
  "other-income": "border-purple-500/20 bg-purple-500/10 text-purple-400",
  "other-expense": "border-purple-500/20 bg-purple-500/10 text-purple-400",
  "contra-asset": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  "contra-liability": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  "contra-revenue": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  "contra-expense": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  statistical: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  suspense: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  memo: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

interface TreeNode {
  account: Account;
  children: TreeNode[];
  depth: number;
}

function buildTree(accounts: Account[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const a of accounts) {
    map.set(a.id, { account: a, children: [], depth: 0 });
  }

  for (const node of map.values()) {
    if (node.account.parentId && map.has(node.account.parentId)) {
      const parent = map.get(node.account.parentId)!;
      parent.children.push(node);
      node.depth = parent.depth + 1;
    } else {
      roots.push(node);
    }
  }

  return roots.sort((a, b) => a.account.accountNumber.localeCompare(b.account.accountNumber));
}

function TreeNodeRow({ node, expanded, onToggle }: { node: TreeNode; expanded: Set<string>; onToggle: (id: string) => void }) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.account.id);
  const indent = node.depth * 20;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-zinc-800/40 cursor-pointer border-b border-zinc-800/40 last:border-0",
          !node.account.isActive && "opacity-50",
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={() => hasChildren && onToggle(node.account.id)}
      >
        <div className="flex h-5 w-5 items-center justify-center">
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />
          ) : (
            <File className="h-4 w-4 text-zinc-500" />
          )}
        </div>
        {hasChildren && (
          <FolderOpen className={cn("h-4 w-4", isExpanded ? "text-[#d4af37]" : "text-zinc-500")} />
        )}
        <span className="min-w-[80px] text-xs font-mono text-zinc-500">{node.account.accountNumber}</span>
        <span className="flex-1 text-sm text-white truncate">{node.account.name}</span>
        <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", CATEGORY_COLORS[node.account.category] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
          {node.account.category.replace(/-/g, " ")}
        </span>
        <span className="text-sm font-mono text-zinc-300">{formatCurrency(0)}</span>
      </div>
      {isExpanded && node.children.map((child) => (
        <TreeNodeRow key={child.account.id} node={child} expanded={expanded} onToggle={onToggle} />
      ))}
    </>
  );
}

export const ChartOfAccountsTree = memo(function ChartOfAccountsTree({ accounts, className }: ChartOfAccountsTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleNode(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const tree = buildTree(accounts);

  if (accounts.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <p className="text-sm text-zinc-500">No accounts found</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)}>
      <div className="border-b border-zinc-800/60 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <FolderOpen className="h-4 w-4 text-[#d4af37]" />
          Chart of Accounts ({accounts.length})
        </h3>
      </div>
      <div className="divide-y divide-zinc-800/40">
        {tree.map((node) => (
          <TreeNodeRow key={node.account.id} node={node} expanded={expanded} onToggle={toggleNode} />
        ))}
      </div>
    </div>
  );
});
