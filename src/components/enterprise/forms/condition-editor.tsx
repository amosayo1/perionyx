"use client";

import { useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { Plus, X, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartSelect } from "./smart-select";
import type { SmartSelectOption } from "./types";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  logic?: "AND" | "OR";
  onLogicChange?: (logic: "AND" | "OR") => void;
  fieldOptions?: SmartSelectOption[];
  operatorOptions?: { value: string; label: string }[];
  className?: string;
  compact?: boolean;
}

const DEFAULT_OPERATORS = [
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "contains", label: "contains" },
  { value: "in", label: "in" },
  { value: "matches", label: "matches" },
];

export const ConditionEditor = memo(function ConditionEditor({
  conditions,
  onChange,
  logic = "AND",
  onLogicChange,
  fieldOptions,
  operatorOptions = DEFAULT_OPERATORS,
  className,
  compact,
}: ConditionEditorProps) {
  const addCondition = useCallback(() => {
    onChange([...conditions, { field: "", operator: "eq", value: "" }]);
  }, [conditions, onChange]);

  const updateCondition = useCallback(
    (idx: number, key: keyof Condition, value: string) => {
      const updated = conditions.map((c, i) => (i === idx ? { ...c, [key]: value } : c));
      onChange(updated);
    },
    [conditions, onChange],
  );

  const removeCondition = useCallback(
    (idx: number) => {
      onChange(conditions.filter((_, i) => i !== idx));
    },
    [conditions, onChange],
  );

  return (
    <div className={cn("space-y-2", className)}>
      {onLogicChange && conditions.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">Match</span>
          <div className="flex rounded-md border border-white/[0.06] overflow-hidden">
            <button
              type="button"
              onClick={() => onLogicChange("AND")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium transition-colors",
                logic === "AND" ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => onLogicChange("OR")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium border-l border-white/[0.06] transition-colors",
                logic === "OR" ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              ANY
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {conditions.map((cond, idx) => (
          <div key={idx} className={cn("flex items-center gap-2", compact ? "" : "")}>
            {fieldOptions ? (
              <SmartSelect
                options={fieldOptions}
                value={cond.field}
                onChange={(v) => updateCondition(idx, "field", v as string)}
                placeholder="Field"
                searchable
                className="flex-1"
              />
            ) : (
              <Input
                value={cond.field}
                onChange={(e) => updateCondition(idx, "field", e.target.value)}
                placeholder="Field"
                className={cn("font-mono", compact ? "h-7 text-xs" : "h-8 text-xs")}
              />
            )}

            <div className="flex rounded-md border border-white/[0.06] overflow-hidden shrink-0">
              {operatorOptions.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => updateCondition(idx, "operator", op.value)}
                  className={cn(
                    "px-1.5 py-1 text-[10px] font-mono transition-colors leading-none",
                    cond.operator === op.value
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-zinc-600 hover:text-zinc-300",
                  )}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <Input
              value={cond.value}
              onChange={(e) => updateCondition(idx, "value", e.target.value)}
              placeholder="Value"
              className={cn("font-mono", compact ? "h-7 text-xs w-20" : "h-8 text-xs w-24")}
            />

            <button
              type="button"
              onClick={() => removeCondition(idx)}
              className="rounded p-1 text-zinc-600 hover:text-red-400 shrink-0"
              aria-label="Remove condition"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" size="sm" variant="outline" onClick={addCondition} className={cn("gap-1", compact ? "h-7 text-[10px]" : "")}>
        <Plus className="h-3 w-3" />
        Add Condition
      </Button>
    </div>
  );
});
