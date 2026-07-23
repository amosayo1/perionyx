"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Filter, RotateCcw } from "lucide-react";
import type { FilterDef, FilterValue } from "./types";

interface Props {
  defs: FilterDef[];
  values: FilterValue[];
  onChange: (values: FilterValue[]) => void;
}

function OperatorSelect({
  type,
  value,
  onChange,
}: {
  type: FilterDef["type"];
  value: string;
  onChange: (v: string) => void;
}) {
  const ops: { value: string; label: string }[] =
    type === "select"
      ? [{ value: "eq", label: "is" }]
      : type === "text"
      ? [
          { value: "eq", label: "is" },
          { value: "contains", label: "contains" },
        ]
      : type === "number"
      ? [
          { value: "eq", label: "=" },
          { value: "gt", label: ">" },
          { value: "gte", label: "≥" },
          { value: "lt", label: "<" },
          { value: "lte", label: "≤" },
        ]
      : type === "date" || type === "date-range"
      ? [
          { value: "eq", label: "is" },
          { value: "gte", label: "after" },
          { value: "lte", label: "before" },
          { value: "between", label: "between" },
        ]
      : [{ value: "eq", label: "is" }];

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-[110px] text-xs">
      {ops.map((op) => (
        <option key={op.value} value={op.value}>{op.label}</option>
      ))}
    </Select>
  );
}

function ValueInput({
  type,
  options,
  value,
  onChange,
  placeholder,
}: {
  type: FilterDef["type"];
  options?: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  if (type === "select" && options) {
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs">
        <option value="">{placeholder ?? "Select..."}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
    );
  }
  if (type === "date" || type === "date-range") {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter date value"
        className="h-8 w-[140px] text-xs"
      />
    );
  }
  return (
    <Input
      type={type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Value..."}
      aria-label="Filter value"
      className="h-8 w-[160px] text-xs"
    />
  );
}

export function FilterBuilder({ defs, values, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [newDef, setNewDef] = useState<string>("");

  const activeFilters = values.filter((v) => v.value.trim() !== "");

  const addFilter = (defId: string) => {
    const def = defs.find((d) => d.id === defId);
    if (!def) return;
    onChange([
      ...values,
      { id: defId, operator: def.type === "select" ? "eq" : "contains", value: "" },
    ]);
    setAdding(false);
    setNewDef("");
  };

  const removeFilter = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, patch: Partial<FilterValue>) => {
    onChange(
      values.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  };

  const clearAll = () => onChange([]);

  const remainingDefs = defs.filter((d) => !values.some((v) => v.id === d.id));

  return (
    <div className="space-y-2">
      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          {activeFilters.map((fv, i) => {
            const def = defs.find((d) => d.id === fv.id);
            if (!def) return null;
            return (
              <Badge
                key={`${fv.id}-${i}`}
                variant="secondary"
                className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 text-xs font-normal"
              >
                <span className="text-zinc-400">{def.label}:</span>
                <span className="text-white">{fv.value}{fv.value2 ? ` - ${fv.value2}` : ""}</span>
                <button onClick={() => removeFilter(i)} className="ml-0.5 rounded-full p-0.5 hover:bg-white/10">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-[11px] text-zinc-500 hover:text-zinc-300">
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {/* Filter editor for each active filter */}
      {values.map((fv, i) => {
        const def = defs.find((d) => d.id === fv.id);
        if (!def) return null;
        return (
          <div key={`editor-${i}`} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 min-w-[80px]">{def.label}</span>
            <OperatorSelect
              type={def.type}
              value={fv.operator}
              onChange={(op) => updateFilter(i, { operator: op as FilterValue["operator"] })}
            />
            <ValueInput
              type={def.type}
              options={def.options}
              value={fv.value}
              onChange={(v) => updateFilter(i, { value: v })}
              placeholder={def.placeholder}
            />
            {fv.operator === "between" && (
              <>
                <span className="text-xs text-zinc-600">and</span>
                <Input
                  type="date"
                  value={fv.value2 ?? ""}
                  onChange={(e) => updateFilter(i, { value2: e.target.value })}
                  aria-label="Filter end date value"
                  className="h-8 w-[140px] text-xs"
                />
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="h-7 w-7" aria-label="Remove filter">
              <X className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </div>
        );
      })}

      {/* Add filter */}
      {adding ? (
        <div className="flex items-center gap-2">
          <Select value={newDef} onChange={(e) => setNewDef(e.target.value)} className="h-8 w-[200px] text-xs">
            <option value="">Select a field...</option>
            {remainingDefs.map((def) => (
              <option key={def.id} value={def.id}>{def.label}</option>
            ))}
          </Select>
          <Button size="sm" disabled={!newDef} onClick={() => addFilter(newDef)} className="h-8 text-xs">Add</Button>
          <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-8 text-xs text-zinc-500">Cancel</Button>
        </div>
      ) : remainingDefs.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)} className="gap-1 text-xs text-zinc-400 hover:text-white">
          <Plus className="h-3.5 w-3.5" />Add filter
        </Button>
      )}
    </div>
  );
}
