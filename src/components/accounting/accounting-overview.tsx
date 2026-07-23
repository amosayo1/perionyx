"use client";

import { AccountingKPICard } from "./accounting-kpi-card";
import type { AccountingOverviewMetrics } from "./accounting-types";
import { BookOpen, FileText, CheckCircle, Clock, AlertTriangle, Ban } from "lucide-react";

interface AccountingOverviewProps {
  metrics: AccountingOverviewMetrics;
}

export function AccountingOverview({ metrics }: AccountingOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <AccountingKPICard title="Total Accounts" value={metrics.totalAccounts.toLocaleString()} icon={<BookOpen className="h-4 w-4" />} />
      <AccountingKPICard title="Total Journals" value={metrics.totalJournals.toLocaleString()} subtitle={`${metrics.postedJournals} posted`} icon={<FileText className="h-4 w-4" />} />
      <AccountingKPICard title="Posted" value={metrics.postedJournals.toLocaleString()} subtitle={`${metrics.unpostedJournals} pending`} status={metrics.unpostedJournals > 0 ? "warning" : "good"} icon={<CheckCircle className="h-4 w-4" />} />
      <AccountingKPICard title="Open Periods" value={metrics.openPeriods} icon={<Clock className="h-4 w-4" />} />
      <AccountingKPICard title="Recon Exceptions" value={metrics.exceptions} status={metrics.exceptions > 0 ? "critical" : "good"} icon={<AlertTriangle className="h-4 w-4" />} />
      <AccountingKPICard title="Unsettled IC" value={metrics.unsettledIC} status={metrics.unsettledIC > 0 ? "warning" : "good"} icon={<Ban className="h-4 w-4" />} />
    </div>
  );
}
