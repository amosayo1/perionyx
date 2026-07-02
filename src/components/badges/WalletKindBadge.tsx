import { Badge } from "@/components/ui/badge";

export function WalletKindBadge({ kind }: { kind: string }) {
  const normalized = kind.toUpperCase();
  const label =
    normalized === "STANDARD"
      ? "Standard"
      : normalized === "SYSTEM_CLEARING"
        ? "System"
        : normalized.replaceAll("_", " ");

  return (
    <Badge variant={normalized === "STANDARD" ? "secondary" : "outline"} className="font-normal">
      {label}
    </Badge>
  );
}

