"use client";

import { useState, memo } from "react";
import { ChevronRight, ChevronDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioTreeNode } from "./investment-types";

interface PortfolioTreeProps {
  tree: PortfolioTreeNode;
  selectedId?: string;
  onSelect?: (portfolioId: string) => void;
  className?: string;
}

function TreeNode({ node, depth = 0, selectedId, onSelect }: { node: PortfolioTreeNode; depth?: number; selectedId?: string; onSelect?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.portfolio.id === selectedId;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect?.(node.portfolio.id);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
          isSelected ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Building2 className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="truncate">{node.portfolio.name}</span>
        <span className="ml-auto text-[11px] text-zinc-600">{node.portfolio.type.replace(/-/g, " ")}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.portfolio.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export const PortfolioTree = memo(function PortfolioTree({ tree, selectedId, onSelect, className }: PortfolioTreeProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2", className)}>
      <TreeNode node={tree} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
});
