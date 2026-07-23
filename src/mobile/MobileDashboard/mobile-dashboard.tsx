"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExecutiveCard, ExecutiveCardGrid, ExecutiveHealthScore } from "@/mobile/ExecutiveCards/executive-cards";
import { QuickActions } from "@/mobile/QuickActions/quick-actions";
import { DollarSign, BarChart3, Activity, Shield, TrendingUp, Users, AlertTriangle } from "lucide-react";

const MOCK = {
  cashPosition: { label: "Cash Position", value: "$847.2M", subtitle: "+2.3% vs yesterday", trend: "up" as const, trendValue: "+2.3%" },
  workingCapital: { label: "Working Capital", value: "$612.5M", subtitle: "+1.8% this quarter", trend: "up" as const, trendValue: "+1.8%" },
  revenue: { label: "Revenue (MTD)", value: "$124.7M", subtitle: "12% above target", trend: "up" as const, trendValue: "+12%" },
  expenses: { label: "OpEx (MTD)", value: "$38.2M", subtitle: "Within budget", trend: "down" as const, trendValue: "-2.1%" },
  liquidity: { label: "Liquidity", value: "94.2%", subtitle: "Above threshold", trend: "up" as const, trendValue: "+1.1%" },
  healthScore: { label: "Business Health", value: "84", subtitle: "Stable", trend: "up" as const, trendValue: "+2" },
  pendingApprovals: { label: "Approvals", value: "12", subtitle: "3 urgent", trend: "neutral" as const, trendValue: "" },
  alerts: { label: "Alerts", value: "2", subtitle: "Critical", trend: "down" as const, trendValue: "-1" },
};

export function ExecutiveDashboard({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={cn("mx-auto max-w-lg space-y-3 px-4 pb-32 pt-2", className)}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-[11px] text-zinc-500">Executive performance overview</p>
      </motion.div>

      <ExecutiveHealthScore
        score={84}
        label="Business Health"
        trend="up"
        trendValue="+2 pts"
      />

      <ExecutiveCardGrid>
        <ExecutiveCard metric={MOCK.cashPosition} accent="gold" icon={<DollarSign className="h-4 w-4" />} onClick={() => router.push("/mobile/treasury")} />
        <ExecutiveCard metric={MOCK.workingCapital} accent="emerald" icon={<TrendingUp className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.revenue} accent="blue" icon={<BarChart3 className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.expenses} accent="amber" icon={<Activity className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.liquidity} accent="emerald" icon={<BarChart3 className="h-4 w-4" />} />
        <ExecutiveCard metric={MOCK.pendingApprovals} accent="amber" icon={<Users className="h-4 w-4" />} onClick={() => router.push("/mobile/approvals")} />
      </ExecutiveCardGrid>

      <QuickActions
        actions={[
          { id: "treasury", label: "Treasury", icon: <DollarSign className="h-5 w-5" />, onClick: () => router.push("/mobile/treasury"), color: "gold" },
          { id: "approvals", label: "Approvals", icon: <Users className="h-5 w-5" />, onClick: () => router.push("/mobile/approvals"), color: "emerald" },
          { id: "reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" />, onClick: () => {}, color: "blue" },
          { id: "alerts", label: "Alerts", icon: <AlertTriangle className="h-5 w-5" />, onClick: () => router.push("/notifications"), color: "red" },
        ]}
      />
    </div>
  );
}
