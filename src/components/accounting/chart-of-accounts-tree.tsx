"use client";

import type { AccountTreeNode } from "../../server/accounting";
import { useState } from "react";
import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";

interface ChartOfAccountsTreeProps {
  tree: AccountTreeNode[];
}

function TreeNode({ node, depth = 0 }: { node: AccountTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isAsset = node.account.type === "asset";
  const balanceColor = node.account.normalBalance === "debit" ? "text-emerald-400" : "text-amber-400";

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 hover:bg-gray-800/50"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 text-gray-500" /> : <ChevronRight className="h-3 w-3 text-gray-500" />
        ) : (
          <BookOpen className="h-3 w-3 text-gray-600" />
        )}
        <span className="text-xs text-gray-500">{node.account.code}</span>
        <span className="text-sm text-gray-200">{node.account.name}</span>
        <span className={`ml-auto text-xs ${balanceColor}`}>{node.account.normalBalance}</span>
        <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${node.account.status === "active" ? "bg-emerald-900/50 text-emerald-300" : "bg-gray-700 text-gray-500"}`}>{node.account.status}</span>
      </div>
      {expanded && hasChildren && node.children.map((child) => <TreeNode key={child.account.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

export function ChartOfAccountsTree({ tree }: ChartOfAccountsTreeProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-2">
      {tree.map((node) => <TreeNode key={node.account.id} node={node} />)}
    </div>
  );
}
