import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const variant: "success" | "warning" | "danger" | "secondary" =
    normalized === "COMPLETED"
      ? "success"
      : normalized === "PROCESSING"
        ? "warning"
        : normalized === "FAILED"
          ? "danger"
          : normalized === "REVERSED"
            ? "warning"
            : "secondary";

  return <Badge variant={variant} className="uppercase tracking-[0.18em] text-[11px]" >{status}</Badge>;
}

