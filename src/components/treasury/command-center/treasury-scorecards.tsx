"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Droplets, ArrowUpDown, Landmark, TrendingUp, Briefcase } from "lucide-react";
import {
  MOCK_CASH_POSITION,
  MOCK_LIQUIDITY_SUMMARY,
  MOCK_PAYMENT_SUMMARY,
  MOCK_BANK_ACCOUNT_SUMMARY,
  MOCK_FORECAST_SUMMARY,
  MOCK_WORKING_CAPITAL,
} from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}

interface ScorecardProps {
  icon: React.ElementType;
  title: string;
  route: string;
  metrics: MetricRowProps[];
  index: number;
}

function ScorecardCard({ icon: Icon, title, route, metrics, index }: ScorecardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5 flex flex-col hover:border-zinc-600 transition-colors"
      role="article" aria-label={`${title} scorecard`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
          <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="flex-1 border-t border-white/[0.06] pt-2 space-y-0.5">
        {metrics.map((m) => (
          <MetricRow key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-white/[0.06]">
        <Link href={route} className="flex items-center gap-1 text-[11px] font-medium text-gold hover:text-gold/80 transition-colors" aria-label={`Open ${title}`}>
          Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}

export function TreasuryScorecards({ className }: { className?: string }) {
  const cash = MOCK_CASH_POSITION;
  const liquidity = MOCK_LIQUIDITY_SUMMARY;
  const payments = MOCK_PAYMENT_SUMMARY;
  const banks = MOCK_BANK_ACCOUNT_SUMMARY;
  const forecast = MOCK_FORECAST_SUMMARY;
  const wc = MOCK_WORKING_CAPITAL;

  const cards: Omit<ScorecardProps, "index">[] = [
    {
      icon: DollarSign,
      title: "Cash Position",
      route: "/treasury/cash-position",
      metrics: [
        { label: "Total Cash", value: formatCompact(cash.totalCash) },
        { label: "Available", value: formatCompact(cash.availableCash) },
        { label: "Restricted", value: formatCompact(cash.restrictedCash) },
      ],
    },
    {
      icon: Droplets,
      title: "Liquidity",
      route: "/treasury/liquidity",
      metrics: [
        { label: "Score", value: `${liquidity.liquidityScore}/100` },
        { label: "Coverage Ratio", value: `${liquidity.coverageRatio}x` },
        { label: "Days Cash Remaining", value: `${liquidity.daysCashRemaining}d` },
      ],
    },
    {
      icon: ArrowUpDown,
      title: "Payments",
      route: "/treasury/payments",
      metrics: [
        { label: "Today", value: `${payments.paymentsToday} (${formatCompact(payments.paymentsTodayValue)})` },
        { label: "Collections", value: `${payments.collectionsToday} (${formatCompact(payments.collectionsTodayValue)})` },
        { label: "Pending", value: `${payments.pendingApprovals} (${formatCompact(payments.pendingApprovalsValue)})` },
      ],
    },
    {
      icon: Landmark,
      title: "Bank Accounts",
      route: "/treasury/bank-accounts",
      metrics: [
        { label: "Active", value: `${banks.activeAccounts}` },
        { label: "Dormant", value: `${banks.dormantAccounts}` },
        { label: "Compliance Issues", value: `${banks.complianceIssues}` },
      ],
    },
    {
      icon: TrendingUp,
      title: "Forecast",
      route: "/treasury/cash-forecast",
      metrics: [
        { label: "Accuracy", value: `${forecast.forecastAccuracy}%` },
        { label: "Confidence", value: `${forecast.confidenceScore}%` },
        { label: "Cash Runway", value: `${forecast.cashRunway}d` },
      ],
    },
    {
      icon: Briefcase,
      title: "Working Capital",
      route: "/treasury/dashboard",
      metrics: [
        { label: "NWC", value: formatCompact(wc.netWorkingCapital) },
        { label: "Current Ratio", value: `${wc.currentRatio}x` },
        { label: "DSO / DPO", value: `${wc.dso}d / ${wc.dpo}d` },
      ],
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)} role="list" aria-label="Treasury scorecards">
      {cards.map((card, i) => (
        <ScorecardCard key={card.title} index={i} icon={card.icon} title={card.title} route={card.route} metrics={card.metrics} />
      ))}
    </div>
  );
}
