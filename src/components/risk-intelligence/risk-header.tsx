"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export/ExportButton";

const dateRangeOptions = ["This Month", "Last Month", "This Quarter", "This Year"];
const businessUnitOptions = ["All Units", "Treasury", "Finance", "Operations", "Compliance"];

export function RiskHeader() {
  const router = useRouter();
  const [dateRangeIdx, setDateRangeIdx] = useState(0);
  const [buIdx, setBuIdx] = useState(0);

  const handleRefresh = useCallback(() => {
    router.refresh();
    toast.success("Risk data refreshed");
  }, [router]);

  const cycleDateRange = useCallback(() => {
    setDateRangeIdx((prev) => {
      const next = (prev + 1) % dateRangeOptions.length;
      toast.info(`Date range: ${dateRangeOptions[next]}`);
      return next;
    });
  }, []);

  const cycleBusinessUnit = useCallback(() => {
    setBuIdx((prev) => {
      const next = (prev + 1) % businessUnitOptions.length;
      toast.info(`Business unit: ${businessUnitOptions[next]}`);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Risk Intelligence</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Enterprise risk monitoring across treasury, policy, approvals and operations.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ExportButton type="risk" label="Export Risk Report" size="sm" />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.info("AI risk summary will be available in the next release")}>
          <Sparkles className="h-3.5 w-3.5" />
          Generate Summary
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={cycleDateRange}>
          <Calendar className="h-3.5 w-3.5" />
          {dateRangeOptions[dateRangeIdx]}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={cycleBusinessUnit}>
          <Building2 className="h-3.5 w-3.5" />
          {businessUnitOptions[buIdx]}
        </Button>
      </div>
    </div>
  );
}
