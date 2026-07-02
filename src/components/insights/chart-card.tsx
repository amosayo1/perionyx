import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  height?: string;
}

export function ChartCard({ title, description, children, className, height = "h-48" }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4",
        className,
      )}
    >
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn("flex items-end justify-center", height)}>
        {children}
      </div>
    </div>
  );
}
