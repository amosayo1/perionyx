"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown } from "lucide-react";
import type { InlineEditConfig } from "./types";

interface InlineEditProps<T> {
  value: string;
  row: T;
  config: InlineEditConfig<T>;
  onSave: (value: string, row: T) => Promise<void> | void;
  onCancel?: () => void;
  className?: string;
}

export function InlineEdit<T>({ value, row, config, onSave, onCancel, className }: InlineEditProps<T>) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (config.type === "text") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editing, config.type]);

  const handleStart = useCallback(() => {
    setEditValue(value);
    setError(undefined);
    setEditing(true);
  }, [value]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setError(undefined);
    onCancel?.();
  }, [onCancel]);

  const handleSave = useCallback(async () => {
    if (config.validate) {
      const validationError = config.validate(editValue, row);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    if (editValue === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSave(editValue, row);
      setEditing(false);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [editValue, value, row, config, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && config.type !== "select") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, handleCancel, config.type],
  );

  if (!editing) {
    return (
      <button
        onClick={handleStart}
        className={cn(
          "w-full text-left hover:bg-white/[0.04] rounded px-1 -mx-1 cursor-pointer transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37]/40",
          className,
        )}
        aria-label={`Edit ${value}`}
      >
        {value || <span className="text-zinc-700">{config.placeholder ?? "Click to edit"}</span>}
      </button>
    );
  }

  if (config.type === "select" && config.options) {
    return (
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <select
            ref={inputRef as React.Ref<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 w-full rounded border border-[#d4af37]/30 bg-zinc-900 px-2 pr-6 text-xs text-white outline-none focus:border-[#d4af37]/60"
            disabled={saving}
          >
            {config.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
        </div>
        <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving} className="h-6 w-6 shrink-0" aria-label="Save">
          <Check className="h-3 w-3 text-emerald-400" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleCancel} disabled={saving} className="h-6 w-6 shrink-0" aria-label="Cancel">
          <X className="h-3 w-3 text-zinc-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type={config.type === "number" || config.type === "currency" ? "number" : "text"}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        step={config.type === "currency" ? "0.01" : undefined}
        placeholder={config.placeholder}
        className={cn(
          "h-7 w-full rounded border border-[#d4af37]/30 bg-zinc-900 px-2 text-xs text-white outline-none",
          "focus:border-[#d4af37]/60",
          error && "border-red-400/50",
        )}
        disabled={saving}
      />
      <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving} className="h-6 w-6 shrink-0" aria-label="Save edit">
        <Check className="h-3 w-3 text-emerald-400" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleCancel} disabled={saving} className="h-6 w-6 shrink-0" aria-label="Cancel edit">
        <X className="h-3 w-3 text-zinc-500" />
      </Button>
      {error && <span className="text-[10px] text-red-400 absolute -bottom-4 left-0" role="alert" aria-live="polite">{error}</span>}
    </div>
  );
}
