"use client";

import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, Check } from "lucide-react";
import { getMockLegalEntities } from "./data";
import type { LegalEntity, DiscoveredAccount } from "./types";

interface LegalEntitySelectorProps {
  entities?: LegalEntity[];
  selected: Record<string, string>;
  account: DiscoveredAccount;
  onAssign: (accountId: string, entityId: string) => void;
  onContinue: () => void;
  className?: string;
}

function EntityTree({
  entity,
  depth,
  selectedId,
  onSelect,
}: {
  entity: LegalEntity;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = entity.children.length > 0;
  const isSelected = selectedId === entity.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(entity.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border p-2.5 text-left transition-all",
          isSelected
            ? "border-gold bg-gold/[0.05]"
            : "border-transparent hover:bg-white/[0.03]",
        )}
        style={{ paddingLeft: `${depth * 20 + 10}px` }}
        aria-pressed={isSelected}
        aria-label={`${entity.type.replace("_", " ")}: ${entity.name}`}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="h-4 w-4 shrink-0 text-white/[0.3] hover:text-white/[0.5]"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <Building2 className="h-4 w-4 text-white/[0.4]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className={cn("text-sm", isSelected ? "text-gold font-medium" : "text-white/[0.87]")}>{entity.name}</span>
          <span className="ml-2 text-[10px] text-white/[0.3] uppercase">{entity.type.replace("_", " ")}</span>
        </div>
        {isSelected && <Check className="h-4 w-4 text-gold shrink-0" />}
      </button>
      {hasChildren && expanded && (
        <div className="ml-4">
          {entity.children.map((child) => (
            <EntityTree
              key={child.id}
              entity={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const LegalEntitySelector = memo(function LegalEntitySelector({
  entities,
  selected,
  account,
  onAssign,
  onContinue,
  className,
}: LegalEntitySelectorProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(
    selected[account.id] ?? null,
  );
  const tree = entities ?? getMockLegalEntities();

  const handleSelect = (entityId: string) => {
    setSelectedEntity(entityId);
    onAssign(account.id, entityId);
  };

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Legal entity assignment">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Assign Legal Entity</h2>
      </div>
      <p className="text-sm text-white/[0.5]">
        Assign <span className="text-white/[0.7]">{account.name}</span> to the appropriate legal entity, business unit, or department.
      </p>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] text-xs text-white/[0.5]">
            {account.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-white/[0.87]">{account.name}</p>
            <p className="text-xs text-white/[0.4]">{account.accountNumber} · {account.currency} · {account.balance}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
        {tree.map((entity) => (
          <EntityTree
            key={entity.id}
            entity={entity}
            depth={0}
            selectedId={selectedEntity}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedEntity && (
        <div className="flex justify-end border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
});
