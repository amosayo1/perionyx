import { Badge } from "@/components/ui/badge";

export function SeverityBadge({ severity }: { severity: string }) {
  const variant: "secondary" | "warning" | "danger" =
    severity === "CRITICAL" ? "danger" : severity === "WARNING" ? "warning" : "secondary";
  return (
    <Badge variant={variant} className="font-normal uppercase tracking-[0.18em] text-[11px]">
      {severity}
    </Badge>
  );
}

