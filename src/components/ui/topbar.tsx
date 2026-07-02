import * as React from "react";
import { cn } from "@/lib/utils";

export function Topbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        // Topbar: atmospheric, premium, executive
        "sticky top-0 z-40 flex h-[92px] items-center justify-between gap-6 border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(90deg,rgba(10,10,10,0.98)_60%,rgba(212,175,55,0.03)_100%)] px-8 backdrop-blur-2xl shadow-[0_32px_90px_rgba(0,0,0,0.28)]",
        className,
      )}
      {...props}
    />
  );
}
