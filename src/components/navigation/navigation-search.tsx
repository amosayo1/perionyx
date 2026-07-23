"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface NavigationSearchProps {
  className?: string;
  onOpen?: () => void;
}

export const NavigationSearch = memo(function NavigationSearch({
  className,
  onOpen,
}: NavigationSearchProps) {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    if (onOpen) {
      onOpen();
    } else {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
    }
  }, [onOpen]);

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-zinc-500" />
      </div>
      <input
        className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-3 text-[13px] text-zinc-200 placeholder:text-zinc-500 transition-colors focus:border-gold-500/30 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-gold-500/20"
        placeholder="Search...  ⌘K"
        aria-label="Search"
        onFocus={handleFocus}
        readOnly
      />
      <kbd className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] text-zinc-600">
        ⌘K
      </kbd>
    </div>
  );
});
