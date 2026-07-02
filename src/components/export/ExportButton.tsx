"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

type Props = {
  type: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

export function ExportButton({ type, label = "Export CSV", variant = "outline", size = "sm" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/export?type=${encodeURIComponent(type)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `perionyx-${type}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Error handled silently — button returns to default state
    } finally {
      setLoading(false);
    }
  }, [type]);

  return (
    <Button variant={variant} size={size} onClick={() => void handleExport()} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {loading ? "Exporting..." : label}
    </Button>
  );
}
