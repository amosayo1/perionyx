import { cn } from "@/lib/utils";

export function CitationBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        "bg-[#d4af37]/8 border-[#d4af37]/20 text-[#d4af37]",
      )}
    >
      {label}
    </span>
  );
}
