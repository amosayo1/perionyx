"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/components/mobile/offline-indicator";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { ExecutiveCard, ExecutiveCardGrid, ExecutiveHealthScore } from "@/mobile/ExecutiveCards/executive-cards";
import { QuickActions } from "@/mobile/QuickActions/quick-actions";
import { DollarSign, BarChart3, Bell, Sparkles, Building2, TrendingUp, Activity, Shield, CheckCircle2 } from "lucide-react";

const MOCK = {
  userName: "David",
  orgName: "Acme Corp",
  date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
  healthScore: 84,
  cashPosition: { label: "Cash Position", value: "$847.2M", subtitle: "+2.3% vs yesterday", trend: "up" as const, trendValue: "+2.3%" },
  revenue: { label: "Revenue (MTD)", value: "$124.7M", subtitle: "+12% vs target", trend: "up" as const, trendValue: "+12%" },
  treasuryHealth: { label: "Treasury Health", value: "94.2%", subtitle: "Above minimum threshold", trend: "up" as const, trendValue: "+1.1%" },
  criticalAlerts: { label: "Critical Alerts", value: "2", subtitle: "Requires immediate attention", trend: "down" as const, trendValue: "-1" },
  pendingApprovals: 12,
  aiSummary: "Cash position up 2.3% driven by strong receivables collection. Two high-value wire transfers pending approval. FX exposure within limits.",
};

export function ExecutiveHome({ className }: { className?: string }) {
  const router = useRouter();
  const { isOnline } = useOnlineStatus();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const handleAction = useCallback(
    (path: string) => {
      const allowed = ["/mobile/approvals", "/mobile/treasury", "/mobile/ai", "/notifications", "/risk", "/mobile/reports", "/mobile/timeline"];
      if (allowed.includes(path)) router.push(path);
    },
    [router],
  );

  return (
    <div className={cn("mx-auto max-w-lg", className)}>
      {!isOnline && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-red-600/90 px-4 py-2 text-[11px] font-medium text-white backdrop-blur-sm">
          <span>You are offline — showing cached data</span>
        </div>
      )}

      <div className="space-y-3 px-4 pb-32 pt-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-white">
              {greeting}, {MOCK.userName}
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-[12px] text-zinc-500">{MOCK.orgName}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-zinc-600">{MOCK.date}</p>
          </div>
          <ConnectionStatus />
        </motion.div>

        <QuickActions
          actions={[
            { id: "approve", label: "Approve", icon: <CheckCircle2 className="h-5 w-5" />, onClick: () => handleAction("/mobile/approvals"), color: "emerald" },
            { id: "treasury", label: "Treasury", icon: <DollarSign className="h-5 w-5" />, onClick: () => handleAction("/mobile/treasury"), color: "gold" },
            { id: "ai", label: "AI Brief", icon: <Sparkles className="h-5 w-5" />, onClick: () => handleAction("/mobile/ai"), color: "purple" },
            { id: "alerts", label: "Alerts", icon: <Bell className="h-5 w-5" />, onClick: () => handleAction("/notifications"), color: "red" },
          ]}
        />

        <ExecutiveHealthScore
          score={MOCK.healthScore}
          label="Enterprise Health"
          trend="up"
          trendValue="+2 pts"
          onClick={() => router.push("/mobile")}
        />

        <ExecutiveCardGrid>
          <ExecutiveCard metric={MOCK.cashPosition} accent="gold" onClick={() => handleAction("/mobile/treasury")} icon={<DollarSign className="h-4 w-4" />} />
          <ExecutiveCard metric={MOCK.revenue} accent="emerald" onClick={() => router.push("/dashboard")} icon={<TrendingUp className="h-4 w-4" />} />
          <ExecutiveCard metric={MOCK.treasuryHealth} accent="blue" onClick={() => handleAction("/mobile/treasury")} icon={<Activity className="h-4 w-4" />} />
          <ExecutiveCard metric={MOCK.criticalAlerts} accent="red" onClick={() => handleAction("/notifications")} icon={<Bell className="h-4 w-4" />} />
        </ExecutiveCardGrid>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">AI Executive Summary</span>
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-300">{MOCK.aiSummary}</p>
        </motion.div>

        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pending Approvals</span>
            </div>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gold/15 px-2 text-[11px] font-bold text-gold">
              {MOCK.pendingApprovals}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-zinc-500">
            {MOCK.pendingApprovals} items require your review. Open approvals to see details.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <Shield className="h-4 w-4 text-zinc-600" />
          <span className="text-[11px] text-zinc-500">
            Last synced: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}


