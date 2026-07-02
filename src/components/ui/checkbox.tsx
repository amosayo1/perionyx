"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <label className={cn("relative inline-flex items-center justify-center", className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer absolute inset-0 cursor-pointer opacity-0"
        {...props}
      />
      <span className="flex h-4 w-4 items-center justify-center rounded border border-zinc-600 bg-transparent transition-colors peer-checked:border-[#d4af37] peer-checked:bg-[#d4af37]/20 peer-focus-visible:ring-2 peer-focus-visible:ring-[#d4af37]/30">
        {checked && <Check className="h-3 w-3 text-[#d4af37]" />}
      </span>
    </label>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
