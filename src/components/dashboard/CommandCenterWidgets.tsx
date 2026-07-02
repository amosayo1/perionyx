"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertOctagon,
  Shield,
  Activity,
} from "lucide-react";

type WidgetProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

function WidgetCard({ title, description, children, className }: WidgetProps) {
  return (
    <Card className={cn("border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-perionyx-text-primary">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs text-perionyx-text-muted">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function HealthIndicator({ status, label }: { status: string; label: string }) {
  const colorMap: Record<string, string> = {
    GOOD: "text-green-400 bg-green-500/10 border-green-500/20",
    WARNING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
    UNKNOWN: "text-perionyx-text-subtle bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]",
  };

  const iconMap: Record<string, React.ReactNode> = {
    GOOD: <CheckCircle2 className="h-3 w-3" />,
    WARNING: <AlertTriangle className="h-3 w-3" />,
    CRITICAL: <XCircle className="h-3 w-3" />,
    UNKNOWN: <Activity className="h-3 w-3" />,
  };

  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold", colorMap[status] ?? colorMap.UNKNOWN)}>
      {iconMap[status] ?? iconMap.UNKNOWN}
      <span>{label}: {status}</span>
    </div>
  );
}

type TreasurySummary = {
  accountCount: number;
  totalBalance: number;
  recentTransfers: number;
};

type RiskSummary = {
  openAlerts: number;
  criticalAlerts: number;
  openIncidents: number;
};

type ReconciliationHealth = {
  lastRunAt: string | null;
  lastRunStatus: string | null;
  openExceptions: number;
  totalRuns: number;
  health: string;
};

type ConnectorHealth = {
  totalConnectors: number;
  recentRuns: number;
  failedRuns24h: number;
  successRate: number;
  health: string;
};

export function TreasuryAccountsWidget() {
  const [data, setData] = useState<TreasurySummary | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/treasury/accounts", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then((accounts: any[]) => {
        const totalBalance = accounts.reduce((sum: number, a: any) => sum + Number(a.balance), 0);
        setData({ accountCount: accounts.length, totalBalance, recentTransfers: 0 });
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Treasury Accounts" description="Active accounts and total balance">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-perionyx-gold/10 text-perionyx-gold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums text-perionyx-text-primary">
              {data?.accountCount ?? "—"}
            </p>
            <p className="text-xs text-perionyx-text-muted">Accounts</p>
          </div>
        </div>
        {data && (
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-xs text-perionyx-text-subtle">Total balance</p>
            <p className="text-sm font-semibold tabular-nums text-perionyx-text-primary">
              {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(data.totalBalance)}
            </p>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

export function PendingApprovalsWidget() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/admin/approval-analytics", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then((data: any) => setCount(data?.metrics?.pendingApprovals ?? data?.metrics?.total ?? 0))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Pending Approvals" description="Awaiting authorization">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-perionyx-text-primary">
            {count !== null ? count : "—"}
          </p>
          <p className="text-xs text-perionyx-text-muted">Pending</p>
        </div>
      </div>
    </WidgetCard>
  );
}

export function RiskAlertsWidget() {
  const [data, setData] = useState<RiskSummary | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/risk/summary", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Risk Alerts" description="Open security and control issues">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums text-perionyx-text-primary">
              {data?.openAlerts ?? "—"}
            </p>
            <p className="text-xs text-perionyx-text-muted">Open alerts</p>
          </div>
        </div>
        {data && data.criticalAlerts > 0 && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2">
            <p className="text-xs font-semibold text-red-400">{data.criticalAlerts} critical</p>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

export function ReconciliationHealthWidget() {
  const [data, setData] = useState<ReconciliationHealth | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/reconciliation/health", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Reconciliation Health" description="Ledger integrity status">
      <div className="space-y-3">
        <HealthIndicator status={data?.health ?? "UNKNOWN"} label="Status" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-perionyx-text-subtle">Open exceptions</p>
            <p className="font-semibold text-perionyx-text-primary">{data?.openExceptions ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-perionyx-text-subtle">Total runs</p>
            <p className="font-semibold text-perionyx-text-primary">{data?.totalRuns ?? "—"}</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

export function ConnectorHealthWidget() {
  const [data, setData] = useState<ConnectorHealth | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/connectors/health", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Connector Health" description="Integration status">
      <div className="space-y-3">
        <HealthIndicator status={data?.health ?? "UNKNOWN"} label="Status" />
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-perionyx-text-subtle">Active</p>
            <p className="font-semibold text-perionyx-text-primary">{data?.totalConnectors ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-perionyx-text-subtle">Success</p>
            <p className="font-semibold text-perionyx-text-primary">{data?.successRate ?? "—"}%</p>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <p className="text-perionyx-text-subtle">Failed 24h</p>
            <p className="font-semibold text-red-400">{data?.failedRuns24h ?? "—"}</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

export function PolicyViolationsWidget() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/risk/alerts?category=POLICY_VIOLATION&status=OPEN", { credentials: "include", signal: ac.signal })
      .then((r) => r.json())
      .then((data: any) => setCount(data?.items?.length ?? 0))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <WidgetCard title="Policy Violations" description="Active compliance issues">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-perionyx-text-primary">
            {count !== null ? count : "—"}
          </p>
          <p className="text-xs text-perionyx-text-muted">Violations</p>
        </div>
      </div>
    </WidgetCard>
  );
}
