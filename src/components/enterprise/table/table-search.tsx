"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Clock } from "lucide-react";

const RECENT_KEY = "enterprise-table-recent-searches";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  try {
    const recent = loadRecent().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* noop */
  }
}

export function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[#d4af37]/20 text-white rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  highlightResults?: boolean;
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
  highlightResults: _highlightResults = true,
}: TableSearchProps) {
  const [focused, setFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  const recent = loadRecent();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (recentRef.current && !recentRef.current.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleRecentClick = useCallback(
    (q: string) => {
      onChange(q);
      setShowRecent(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && value.trim()) {
        saveRecent(value.trim());
        setShowRecent(false);
      }
      if (e.key === "Escape") {
        setShowRecent(false);
        inputRef.current?.blur();
      }
    },
    [value],
  );

  return (
    <div className={cn("relative min-w-[220px] flex-1 max-w-sm", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocused(true); setShowRecent(true); }}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] pl-10 pr-8 text-sm text-white shadow-sm placeholder:text-zinc-500 transition-all duration-200 ease-out focus:border-[#d4af37]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-white/10"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5 text-zinc-500" />
        </button>
      )}

      {/* Recent searches dropdown */}
      {showRecent && recent.length > 0 && !value && (
        <div
          ref={recentRef}
          className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg border border-white/[0.06] bg-zinc-900 py-1 shadow-xl"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Recent searches
          </div>
          {recent.map((q) => (
            <button
              key={q}
              onClick={() => handleRecentClick(q)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white text-left"
            >
              <Clock className="h-3 w-3 shrink-0 text-zinc-600" />
              <span className="truncate">{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
