"use client";

import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({ checked = false, onCheckedChange, disabled }: Props) {
  const [internal, setInternal] = useState(checked);
  const isChecked = onCheckedChange ? checked : internal;

  const toggle = useCallback(() => {
    const next = !isChecked;
    if (onCheckedChange) {
      onCheckedChange(next);
    } else {
      setInternal(next);
    }
  }, [isChecked, onCheckedChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isChecked ? "bg-[#d4af37]" : "bg-white/[0.12]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-black shadow-lg ring-0 transition-transform duration-200",
          isChecked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}
