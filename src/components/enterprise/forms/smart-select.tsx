"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, ChevronDown, X } from "lucide-react";
import type { SmartSelectOption } from "./types";

interface SmartSelectProps {
  options: SmartSelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  grouped?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
  disabled?: boolean;
}

export function SmartSelect({
  options,
  value,
  onChange,
  multiple = false,
  searchable = true,
  grouped = false,
  placeholder = "Select...",
  emptyMessage = "No matches found",
  maxItems,
  className,
  disabled,
}: SmartSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const values = Array.isArray(value) ? value : [value].filter(Boolean);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    let result = options;
    if (search && searchable) {
      const q = search.toLowerCase();
      result = result.filter((opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q));
    }
    if (maxItems) result = result.slice(0, maxItems);

    if (grouped) {
      const groups = new Map<string, SmartSelectOption[]>();
      result.forEach((opt) => {
        const g = opt.group || "Other";
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g)!.push(opt);
      });
      return Array.from(groups.entries());
    }
    return result;
  }, [options, search, searchable, maxItems, grouped]);

  const isSelected = useCallback((optValue: string) => values.includes(optValue), [values]);

  const handleSelect = useCallback(
    (optValue: string) => {
      if (multiple) {
        const next = isSelected(optValue)
          ? values.filter((v) => v !== optValue)
          : [...values, optValue];
        onChange(next);
      } else {
        onChange(optValue);
        setOpen(false);
        setSearch("");
      }
    },
    [multiple, values, onChange],
  );

  const removeValue = (optValue: string) => {
    if (multiple) {
      onChange(values.filter((v) => v !== optValue));
    }
  };

  const displayLabel = useMemo(() => {
    if (multiple) return values.length ? `${values.length} selected` : placeholder;
    const selected = options.find((o) => o.value === value);
    return selected ? selected.label : placeholder;
  }, [multiple, values, options, value, placeholder]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
          open ? "border-[#d4af37]/40 ring-2 ring-[#d4af37]/20" : "border-white/[0.1]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-white/[0.2]",
          "bg-white/[0.03]",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("flex-1 text-left truncate", !multiple && !value ? "text-zinc-500" : "text-white")}>
          {displayLabel}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>

      {multiple && values.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {values.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-[#d4af37]/10 px-2 py-0.5 text-[10px] text-[#d4af37]"
              >
                {opt?.label || v}
                <button type="button" onClick={() => removeValue(v)} className="hover:text-red-400" aria-label={`Remove ${opt?.label || v}`}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-900 shadow-xl">
          {searchable && (
            <div className="border-b border-white/[0.06] p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md border border-white/[0.06] bg-zinc-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#d4af37]/30"
                  autoFocus
                />
              </div>
            </div>
          )}

          <ul className="max-h-48 overflow-y-auto p-1 space-y-0.5" role="listbox">
            {Array.isArray(filtered) && filtered.length === 0 && (
              <li className="px-2.5 py-3 text-center text-[11px] text-zinc-600">{emptyMessage}</li>
            )}

            {Array.isArray(filtered) && filtered.length > 0 && !grouped && (
              (filtered as SmartSelectOption[]).map((opt) => (
                <li key={opt.value} role="option" aria-selected={isSelected(opt.value)}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors",
                      isSelected(opt.value)
                        ? "bg-[#d4af37]/10 text-[#d4af37]"
                        : "text-zinc-300 hover:bg-white/[0.04]",
                    )}
                  >
                    <span className={cn("flex-1 text-left", opt.description && "font-medium")}>{opt.label}</span>
                    {opt.description && (
                      <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{opt.description}</span>
                    )}
                    {isSelected(opt.value) && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                </li>
              ))
            )}

            {grouped && (
              (filtered as [string, SmartSelectOption[]][]).map(([group, groupOptions]) => (
                <li key={group}>
                  <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    {group}
                  </p>
                  {groupOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                        isSelected(opt.value)
                          ? "bg-[#d4af37]/10 text-[#d4af37]"
                          : "text-zinc-300 hover:bg-white/[0.04]",
                      )}
                    >
                      <span className="flex-1 text-left">{opt.label}</span>
                      {isSelected(opt.value) && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
