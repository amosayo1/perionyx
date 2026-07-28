import { cn } from "@/lib/utils";

export function CitationBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        "bg-gold/8 border-gold/20 text-gold",
      )}
    >
      {label}
    </span>
  );
}
