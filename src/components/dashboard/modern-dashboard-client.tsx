"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Wallet, Landmark, Activity, ArrowRight,
  TrendingUp, TrendingDown, DollarSign, ArrowLeftRight,
  Shield, Clock, ChevronRight, Sparkles,
  BarChart3, RefreshCw, Building2, ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { AuditPreviewTable } from "@/components/dashboard/AuditPreviewTable";
import { TelemetryWidget } from "@/components/dashboard/TelemetryWidget";
import { FxSyncStatusWidget } from "@/components/dashboard/FxSyncStatusWidget";
import { LedgerIntegrityWidget } from "@/components/dashboard/LedgerIntegrityWidget";
import { SparklineGraph } from "@/components/dashboard/SparklineGraph";
import { FinancialInsightsPanel } from "@/components/dashboard/FinancialInsightsPanel";
import { ApprovalStatusWidget, ApprovalBottlenecksWidget } from "@/components/dashboard";

type Wallet = { id: string; name: string; currency: string; balance: string; kind: string };
type TransactionRow = { id: string; type: string; status: string; primaryAmount: string; currency: string; reference: string | null; metadata: unknown; createdAt: string; ledgerEntryCount: number };
type AuditRow = { id: string; companyId: string; actorUserId: string | null; action: string; resourceType: string; resourceId: string | null; severity: string; metadata: unknown; requestId: string | null; payloadHash: string | null; ipAddress: string | null; userAgent: string | null; createdAt: string };

interface Props {
  wallets: Wallet[];
  transactions: TransactionRow[];
  audits: AuditRow[];
  approvalMetrics: any;
  approvalBottlenecks: any[];
  totalBal: number;
  totalTransactions: { total: number; truncated: boolean } | null;
}

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "activity", label: "Activity", icon: Activity },
];

const StatCard = memo(function StatCard({ label, value, trend, icon: Icon, color, subtitle }: { label: string; value: string; trend?: "up" | "down" | null; icon: any; color: string; subtitle?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/60 via-zinc-900/30 to-black/40 p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-[0.04] blur-3xl ${color}`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>2.4% vs last month</span>
              </div>
            )}
            {subtitle && <p className="text-[11px] text-zinc-600">{subtitle}</p>}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}/10 border ${color}/20 backdrop-blur-sm`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </div>
    </div>
  );
});

function EmptyStateSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-zinc-900/10 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/50 text-zinc-600 ring-1 ring-white/[0.04]">
        <Activity className="h-7 w-7" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-[#d4af37]/10 text-[#d4af37] shadow-sm"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
      }`}
    >
      {active && (
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-[#d4af37]/20" />
      )}
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function ModernDashboardClient({ wallets, transactions, audits, approvalMetrics, approvalBottlenecks, totalBal, totalTransactions }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currency = wallets[0]?.currency || "USD";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black/60 p-6 lg:p-8">
        <div className="absolute right-0 top-0 h-48 w-96 opacity-[0.02]">
          <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4af37" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d4af37] opacity-[0.03] blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              Enterprise Command Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">Executive Overview</h1>
            <p className="max-w-lg text-sm leading-relaxed text-zinc-500">
              Treasury balances, operational metrics, and governance intelligence.
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/60 px-4 py-2.5 text-xs text-zinc-500 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              {mounted ? new Date().toLocaleTimeString() : "—"}
            </div>
            <Link href="/automation-studio">
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Automation Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/60 p-1 ring-1 ring-white/[0.06]">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/wallets">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-500">
              <Wallet className="h-3.5 w-3.5" />
              Wallets
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link href="/accounts">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-500">
              <Building2 className="h-3.5 w-3.5" />
              Accounts
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI ROW */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Total Balance"
              value={`${currency} ${Number(totalBal).toLocaleString()}`}
              trend="up"
              icon={DollarSign}
              color="text-[#d4af37]"
              subtitle="Across all wallets"
            />
            <StatCard
              label="Active Wallets"
              value={String(wallets.length)}
              icon={Wallet}
              color="text-emerald-400"
              subtitle="Operational accounts"
            />
            <StatCard
              label="Transactions"
              value={String(transactions.length)}
              icon={ArrowLeftRight}
              color="text-blue-400"
              subtitle="Latest 8 postings"
            />
            <StatCard
              label="Audit Events"
              value={String(audits.length)}
              icon={Shield}
              color="text-purple-400"
              subtitle="Security-sensitive"
            />
          </div>

          {/* HERO + SIDEBAR */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            {/* Treasury Balance Card */}
            <div className="lg:col-span-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/50 p-6 lg:p-8">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#d4af37] opacity-[0.02] blur-3xl" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
                <div className="relative space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                      Treasury Summary
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-white">
                        {Number(totalBal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-lg font-medium text-zinc-500">{currency}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                        <TrendingUp className="h-3 w-3" />
                        +2.4%
                      </span>
                      <span className="text-xs text-zinc-600">vs last month</span>
                    </div>
                  </div>

                  <div className="h-12">
                    <SparklineGraph
                      data={wallets.map((w) => Number(w.balance)).slice(0, 14)}
                      color="#d4af37"
                      height={48}
                      width={400}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href="/transactions">
                      <Button size="sm" className="gap-2 bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#d4af37]/90 hover:shadow-[#d4af37]/30">
                        <ArrowUpRight className="h-4 w-4" />
                        New Transaction
                      </Button>
                    </Link>
                    <Link href="/reconciliation">
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reconciliation
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-3 lg:col-span-3">
              <FxSyncStatusWidget />
              <LedgerIntegrityWidget />

              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-3">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Quick Stats
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Pending Approvals", value: approvalMetrics?.pendingApprovals ?? 0, color: "text-amber-400" },
                    { label: "Approval Value", value: approvalMetrics?.pendingValue ?? "—", color: "text-[#d4af37]" },
                    { label: "Total Wallets", value: wallets.length, color: "text-emerald-400" },
                    { label: "Transaction Count", value: totalTransactions?.total ?? transactions.length, color: "text-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{s.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* METRICS + INSIGHTS */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5">
              <TelemetryWidget
                value={totalBal}
                label="Live Treasury Balance"
                unit={currency}
                trend={transactions.length > 0 && Number(transactions[0]?.primaryAmount) > 0 ? "up" : "down"}
              />
            </div>
            <FinancialInsightsPanel
              insights={[
                { label: "Liquidity Ratio", value: "2.8", trend: "up" },
                { label: "Avg. Tx Size", value: transactions.length ? `${Number(transactions[0].primaryAmount).toLocaleString()} ${transactions[0].currency}` : "-", trend: null },
                { label: "Audit Events", value: String(audits.length), trend: audits.length > 2 ? "up" : null },
                { label: "Wallets", value: String(wallets.length), trend: wallets.length > 2 ? "up" : null },
              ]}
            />
          </div>

          {/* APPROVAL + BOTTLENECKS */}
          <div className="grid gap-6 lg:grid-cols-2">
            {approvalMetrics && (
              <ApprovalStatusWidget metrics={approvalMetrics} isLoading={false} />
            )}
            {approvalBottlenecks && approvalBottlenecks.length > 0 && (
              <ApprovalBottlenecksWidget bottlenecks={approvalBottlenecks} isLoading={false} />
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ WALLETS TAB ═══════════════ */}
      {activeTab === "wallets" && (
        <div className="space-y-6">
          <WalletOverview wallets={wallets} />
        </div>
      )}

      {/* ═══════════════ ACCOUNTS TAB ═══════════════ */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Treasury Accounts</CardTitle>
                  <CardDescription>Bank accounts and linked financial institutions</CardDescription>
                </div>
                <Link href="/accounts">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <EmptyStateSection title="No accounts yet" description="Link a bank account or create a treasury account to get started." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {wallets.slice(0, 6).map((w, i) => (
                    <Link
                      key={w.id}
                      href={`/wallets/${w.id}`}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/30 p-4 transition-all duration-200 hover:border-[#d4af37]/30 hover:shadow-lg hover:shadow-black/30"
                    >
                      <div className={`absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full opacity-[0.03] blur-2xl ${i % 2 === 0 ? "bg-[#d4af37]" : "bg-emerald-400"}`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          i % 2 === 0 ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white group-hover:text-[#d4af37] transition-colors truncate">{w.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{w.currency} &middot; {w.kind === "STANDARD" ? "Standard" : "System"}</p>
                          <p className="mt-2 text-lg font-bold text-white tabular-nums">
                            {Number(w.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{w.currency}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════ ACTIVITY TAB ═══════════════ */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Latest postings across the active company</p>
                </div>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {transactions.length === 0 ? (
                  <EmptyStateSection title="No transactions yet" description="Transactions will appear here after your first wallet operations." />
                ) : (
                  <RecentTransactionsTable transactions={transactions} wallets={wallets} />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Audit Activity</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Security-sensitive events with severity indicators</p>
                </div>
                <Link href="/audit-logs">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {audits.length === 0 ? (
                  <EmptyStateSection title="No audit logs yet" description="Mutating operations will be recorded in the audit trail." />
                ) : (
                  <AuditPreviewTable audits={audits} />
                )}
                {audits.length > 0 && (
                  <p className="mt-3 text-xs text-zinc-600">Latest activity as of {new Date(audits[0].createdAt).toLocaleString()}.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
