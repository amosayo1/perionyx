"use client";

import { Plus, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ConditionGroup, RuleCondition, ConditionOperator } from "@/modules/automation-studio/types";

const OPERATORS: { value: ConditionOperator; label: string }[] = [
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

interface ConditionGroupBuilderProps {
  group: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  depth?: number;
}

export function ConditionGroupBuilder({ group, onChange, depth = 0 }: ConditionGroupBuilderProps) {
  const updateLogic = (logic: "AND" | "OR") => {
    onChange({ ...group, logic });
  };

  const addCondition = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { variable: "", operator: "eq" as ConditionOperator, value: "" },
      ],
    });
  };

  const addSubGroup = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { logic: "AND", conditions: [{ variable: "", operator: "eq" as ConditionOperator, value: "" }] },
      ],
    });
  };

  const updateItem = (idx: number, item: ConditionGroup | RuleCondition) => {
    const updated = group.conditions.map((c, i) => (i === idx ? item : c));
    onChange({ ...group, conditions: updated });
  };

  const removeItem = (idx: number) => {
    const updated = group.conditions.filter((_, i) => i !== idx);
    onChange({ ...group, conditions: updated });
  };

  const isRuleCondition = (item: ConditionGroup | RuleCondition): item is RuleCondition => {
    return "variable" in item;
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? "ml-4 pl-4 border-l border-white/[0.06]" : ""}`}>
      {depth > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            <GitBranch className="h-3 w-3 mr-1" />
            {group.logic}
          </Badge>
        </div>
      )}
      <div className="flex items-center gap-2">
        {depth > 0 && (
          <div className="flex rounded-md border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => updateLogic("AND")}
              className={`px-2 py-1 text-[10px] font-medium ${
                group.logic === "AND" ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              AND
            </button>
            <button
              onClick={() => updateLogic("OR")}
              className={`px-2 py-1 text-[10px] font-medium border-x border-white/[0.06] ${
                group.logic === "OR" ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              OR
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {group.conditions.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1">
              {isRuleCondition(item) ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={item.variable}
                    onChange={(e) => updateItem(idx, { ...item, variable: e.target.value })}
                    placeholder="Variable (e.g. amount)"
                    className="h-8 text-xs w-36"
                  />
                  <div className="flex rounded-md border border-white/[0.06] overflow-hidden">
                    {OPERATORS.map((op) => (
                      <button
                        key={op.value}
                        onClick={() => updateItem(idx, { ...item, operator: op.value })}
                        className={`px-1.5 py-1 text-[10px] leading-none whitespace-nowrap ${
                          item.operator === op.value
                            ? "bg-gold/10 text-gold"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={String(item.value ?? "")}
                    onChange={(e) => updateItem(idx, { ...item, value: e.target.value })}
                    placeholder="Value"
                    className="h-8 text-xs w-28"
                  />
                </div>
              ) : (
                <ConditionGroupBuilder
                  group={item}
                  onChange={(updated) => updateItem(idx, updated)}
                  depth={depth + 1}
                />
              )}
            </div>
            <button
              onClick={() => removeItem(idx)}
              className="mt-1.5 p-1 text-zinc-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
          className="h-7 text-[10px] gap-1"
        >
          <Plus className="h-3 w-3" />
          Condition
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSubGroup}
          className="h-7 text-[10px] gap-1"
        >
          <GitBranch className="h-3 w-3" />
          Sub-group
        </Button>
      </div>
    </div>
  );
}
