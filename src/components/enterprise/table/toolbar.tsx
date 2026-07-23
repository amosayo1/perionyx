"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Columns,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  Save,
  FolderOpen,
  Trash2,
  Filter,
  X,
  Plus,
  SlidersHorizontal,
  FileSpreadsheet,
  Pin,
  PinOff,
  CalendarClock,
} from "lucide-react";
import type { Column, Density, SavedView, FilterDef, FilterValue } from "./types";
import { RELATIVE_DATE_PRESETS } from "./types";

interface ToolbarProps<T> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  columns: Column<T>[];
  hiddenColumns: Set<string>;
  onHiddenColumnsChange: (ids: Set<string>) => void;
  density: Density;
  onDensityChange: (d: Density) => void;
  exportable: boolean;
  exportFilename?: string;
  exportFormats?: ("csv" | "xls")[];
  onExport: (format: "csv" | "xls") => void;
  savedViews: SavedView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
  filterDefs: FilterDef[];
  filterValues: FilterValue[];
  onFilterChange: (values: FilterValue[]) => void;
  groupBy?: string;
  onGroupByChange?: (columnId: string | undefined) => void;
  className?: string;
}

function ColumnVisibilityMenu<T>({
  columns,
  hidden,
  onChange,
}: {
  columns: Column<T>[];
  hidden: Set<string>;
  onChange: (ids: Set<string>) => void;
}) {
  const toggle = (colId: string) => {
    const next = new Set(hidden);
    if (next.has(colId)) next.delete(colId); else next.add(colId);
    onChange(next);
  };
  const visibleCount = columns.length - hidden.size;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          <Columns className="h-3.5 w-3.5" />
          Columns ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Column Visibility
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns
          .filter((c) => c.hideable !== false)
          .map((col) => (
            <DropdownMenuItem key={col.id} onClick={() => toggle(col.id)} className="text-sm">
              {hidden.has(col.id) ? (
                <EyeOff className="mr-2 h-3.5 w-3.5 text-zinc-600" />
              ) : (
                <Eye className="mr-2 h-3.5 w-3.5 text-[#d4af37]" />
              )}
              {col.header}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DensityMenu({ density, onChange }: { density: Density; onChange: (d: Density) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          {density === "ultra-compact" ? <Maximize2 className="h-3.5 w-3.5" /> :
           density === "compact" ? <Maximize2 className="h-3.5 w-3.5" /> :
           <Minimize2 className="h-3.5 w-3.5" />}
          {density === "ultra-compact" ? "Ultra" :
           density === "compact" ? "Compact" :
           density === "default" ? "Default" : "Comfortable"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Row Density
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["ultra-compact", "compact", "default", "comfortable"] as Density[]).map((d) => (
          <DropdownMenuItem
            key={d}
            onClick={() => onChange(d)}
            className={cn("text-sm capitalize", density === d && "text-[#d4af37]")}
          >
            {d === "ultra-compact" ? "Ultra Compact" : d}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SavedViewsMenu({
  views,
  onSave,
  onLoad,
  onDelete,
}: {
  views: SavedView[];
  onSave: () => void;
  onLoad: (view: SavedView) => void;
  onDelete: (viewId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          <FolderOpen className="h-3.5 w-3.5" />
          Views
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Saved Views
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSave} className="text-sm">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save current view...
        </DropdownMenuItem>
        {views.length > 0 && <DropdownMenuSeparator />}
        {views.map((view) => (
          <DropdownMenuItem key={view.id} onClick={() => onLoad(view)} className="flex items-center justify-between text-sm">
            <span>{view.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(view.id); }}
              className="ml-2 rounded p-0.5 hover:bg-white/10"
              aria-label={`Delete view ${view.name}`}
            >
              <Trash2 className="h-3 w-3 text-zinc-500" />
            </button>
          </DropdownMenuItem>
        ))}
        {views.length === 0 && (
          <p className="px-2 py-3 text-xs text-zinc-500 text-center">No saved views</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExportMenu({ onExport, formats }: { onExport: (format: "csv" | "xls") => void; formats: ("csv" | "xls")[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Export as...
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((fmt) => (
          <DropdownMenuItem key={fmt} onClick={() => onExport(fmt)} className="text-sm capitalize">
            {fmt === "csv" ? (
              <Download className="mr-2 h-3.5 w-3.5" />
            ) : (
              <FileSpreadsheet className="mr-2 h-3.5 w-3.5" />
            )}
            {fmt === "csv" ? "CSV" : "Excel"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RelativeDatePresets({
  onSelect,
}: {
  onSelect: (preset: (typeof RELATIVE_DATE_PRESETS)[number]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          <CalendarClock className="h-3.5 w-3.5" />
          Quick Dates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Relative Dates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {RELATIVE_DATE_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.label}
            onClick={() => onSelect(preset)}
            className="text-sm"
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterPanel({ defs, values, onChange }: { defs: FilterDef[]; values: FilterValue[]; onChange: (values: FilterValue[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [newDef, setNewDef] = useState("");

  const activeFilters = values.filter((v) => v.value.trim() !== "");

  const addFilter = (defId: string) => {
    const def = defs.find((d) => d.id === defId);
    if (!def) return;
    onChange([...values, { id: defId, operator: def.type === "select" ? "eq" : "contains", value: "" }]);
    setAdding(false);
    setNewDef("");
  };

  const removeFilter = (index: number) => onChange(values.filter((_, i) => i !== index));

  const updateFilter = (index: number, patch: Partial<FilterValue>) => {
    onChange(values.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const clearAll = () => onChange([]);
  const remainingDefs = defs.filter((d) => !values.some((v) => v.id === d.id));

  const handleRelativeDate = (preset: (typeof RELATIVE_DATE_PRESETS)[number]) => {
    const { start, end } = preset.getValue();
    const dateDefs = defs.filter((d) => d.type === "date" || d.type === "date-range");
    if (dateDefs.length >= 2) {
      const existingStartIndex = values.findIndex((v) => v.id === dateDefs[0].id);
      const existingEndIndex = values.findIndex((v) => v.id === dateDefs[1].id);
      const newValues = [...values];
      if (existingStartIndex !== -1) {
        newValues[existingStartIndex] = { ...newValues[existingStartIndex], value: start.split("T")[0], operator: "gte" };
      } else {
        newValues.push({ id: dateDefs[0].id, operator: "gte", value: start.split("T")[0] });
      }
      if (existingEndIndex !== -1) {
        newValues[existingEndIndex] = { ...newValues[existingEndIndex], value: end.split("T")[0], operator: "lte" };
      } else {
        newValues.push({ id: dateDefs[1].id, operator: "lte", value: end.split("T")[0] });
      }
      onChange(newValues);
    }
  };

  return (
    <div className="space-y-2">
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          {activeFilters.map((fv, i) => {
            const def = defs.find((d) => d.id === fv.id);
            if (!def) return null;
            return (
              <Badge key={`${fv.id}-${i}`} variant="secondary" className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 text-xs font-normal">
                <span className="text-zinc-400">{def.label}:</span>
                <span className="text-white">{fv.value}{fv.value2 ? ` - ${fv.value2}` : ""}</span>
                <button onClick={() => removeFilter(i)} className="ml-0.5 rounded-full p-0.5 hover:bg-white/10" aria-label="Remove filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-[11px] text-zinc-500 hover:text-zinc-300">
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
          {defs.some((d) => d.type === "date" || d.type === "date-range") && (
            <RelativeDatePresets onSelect={handleRelativeDate} />
          )}
        </div>
      )}

      {values.map((fv, i) => {
        const def = defs.find((d) => d.id === fv.id);
        if (!def) return null;
        return (
          <div key={`editor-${i}`} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 min-w-[80px]">{def.label}</span>
            <OperatorSelect type={def.type} value={fv.operator} onChange={(op) => updateFilter(i, { operator: op as FilterValue["operator"] })} />
            {def.type === "select" && def.options ? (
              <select
                value={fv.value}
                onChange={(e) => updateFilter(i, { value: e.target.value })}
                className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
              >
                <option value="">{def.placeholder ?? "Select..."}</option>
                {def.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : def.type === "date" || def.type === "date-range" ? (
              <input
                type="date"
                value={fv.value}
                onChange={(e) => updateFilter(i, { value: e.target.value })}
                className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
              />
            ) : (
              <input
                type={def.type === "number" ? "number" : "text"}
                value={fv.value}
                onChange={(e) => updateFilter(i, { value: e.target.value })}
                placeholder={def.placeholder ?? "Value..."}
                className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
              />
            )}
            {fv.operator === "between" && (
              <>
                <span className="text-xs text-zinc-600">and</span>
                <input
                  type="date"
                  value={fv.value2 ?? ""}
                  onChange={(e) => updateFilter(i, { value2: e.target.value })}
                  className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
                />
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="h-7 w-7" aria-label="Remove filter">
              <X className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </div>
        );
      })}

      {adding ? (
        <div className="flex items-center gap-2">
          <select
            value={newDef}
            onChange={(e) => setNewDef(e.target.value)}
            className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
          >
            <option value="">Select a field...</option>
            {remainingDefs.map((def) => (
              <option key={def.id} value={def.id}>{def.label}</option>
            ))}
          </select>
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

function OperatorSelect({ type, value, onChange }: { type: FilterDef["type"]; value: string; onChange: (v: string) => void }) {
  const ops: { value: string; label: string }[] =
    type === "select"
      ? [{ value: "eq", label: "is" }]
      : type === "text"
        ? [{ value: "eq", label: "is" }, { value: "contains", label: "contains" }]
        : type === "number"
          ? [
              { value: "eq", label: "=" },
              { value: "gt", label: ">" },
              { value: "gte", label: "\u2265" },
              { value: "lt", label: "<" },
              { value: "lte", label: "\u2264" },
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
    >
      {ops.map((op) => (
        <option key={op.value} value={op.value}>{op.label}</option>
      ))}
    </select>
  );
}

export function Toolbar<T>({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
  density,
  onDensityChange,
  exportable,
  exportFormats,
  onExport,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView,
  filterDefs,
  filterValues,
  onFilterChange,
  className,
}: ToolbarProps<T>) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const exportFormatsResolved = exportFormats ?? ["csv"];

  const handleSave = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim());
      setViewName("");
      setSaveDialogOpen(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] pl-10 pr-4 text-sm text-white shadow-sm placeholder:text-zinc-500 transition-all duration-200 ease-out focus:border-[#d4af37]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {filterDefs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "gap-1.5 text-xs",
                filtersOpen ? "text-[#d4af37]" : "text-zinc-400 hover:text-white",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {filterValues.filter((v) => v.value.trim()).length > 0 && (
                <span className="ml-0.5 text-[#d4af37]">({filterValues.filter((v) => v.value.trim()).length})</span>
              )}
            </Button>
          )}
          <ColumnVisibilityMenu columns={columns} hidden={hiddenColumns} onChange={onHiddenColumnsChange} />
          <DensityMenu density={density} onChange={onDensityChange} />
          <SavedViewsMenu views={savedViews} onSave={() => setSaveDialogOpen(true)} onLoad={onLoadView} onDelete={onDeleteView} />
          {exportable && (
            exportFormatsResolved.length === 1 ? (
              <Button variant="ghost" size="sm" onClick={() => onExport(exportFormatsResolved[0])} className="gap-1.5 text-xs text-zinc-400 hover:text-white">
                <Download className="h-3.5 w-3.5" />
                {exportFormatsResolved[0] === "csv" ? "CSV" : "Excel"}
              </Button>
            ) : (
              <ExportMenu onExport={onExport} formats={exportFormatsResolved} />
            )
          )}
        </div>
      </div>

      {saveDialogOpen && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="View name..."
            className="h-8 rounded-md border border-white/[0.06] bg-zinc-900 px-2 text-xs text-white"
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setSaveDialogOpen(false); }}
            autoFocus
          />
          <Button size="sm" onClick={handleSave} disabled={!viewName.trim()} className="h-8 text-xs">Save</Button>
          <Button variant="ghost" size="sm" onClick={() => setSaveDialogOpen(false)} className="h-8 text-xs text-zinc-500">Cancel</Button>
        </div>
      )}

      {filtersOpen && filterDefs.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3">
          <FilterPanel defs={filterDefs} values={filterValues} onChange={onFilterChange} />
        </div>
      )}
    </div>
  );
}
