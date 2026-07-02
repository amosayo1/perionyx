import * as React from "react";
import { cn } from "@/lib/utils";

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "hidden w-72 shrink-0 border-r border-white/[0.06] bg-gradient-to-b from-[#0a0a0a] to-[#070707] md:flex md:flex-col",
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-[#d4af37]/20 before:to-transparent before:z-10 before:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarSection({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-4 px-5 py-4", className)}>
      {title ? <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">{title}</div> : null}
      {children}
    </div>
  );
}
