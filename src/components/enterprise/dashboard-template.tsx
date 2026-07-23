"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { RefreshCw, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  DashboardLayout,
  DashboardSection,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  Card,
  Badge,
  Button,
} from "@/design-system";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface KpiData {
  label: string;
  value: string | number;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
  color?: string;
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

export interface AlertItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  message: string;
  source: string;
  timestamp: string;
}

export interface StatItem {
  label: string;
  value: string | number;
}

export interface DashboardTemplateProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  loading?: boolean;
  kpis?: KpiData[];
  navItems?: NavItem[];
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  alerts?: AlertItem[];
  onAckAlert?: (id: string) => void;
  stats?: StatItem[];
  statsTitle?: string;
  activity?: React.ReactNode;
  lastUpdated?: Date | string;
  onRefresh?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                                  Motion                                    */
/* -------------------------------------------------------------------------- */

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

/* -------------------------------------------------------------------------- */
/*                              Severity helpers                              */
/* -------------------------------------------------------------------------- */

const severityBadge: Record<AlertItem["severity"], { variant: "danger" | "warning" | "gold" | "info" | "muted"; label: string }> = {
  critical: { variant: "danger", label: "CRITICAL" },
  high: { variant: "warning", label: "HIGH" },
  medium: { variant: "gold", label: "MEDIUM" },
  low: { variant: "info", label: "LOW" },
  info: { variant: "muted", label: "INFO" },
};

const trendDirection = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

const trendColor: Record<string, string> = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-danger)]",
  neutral: "text-[var(--text-disabled)]",
};

/* -------------------------------------------------------------------------- */
/*                               Loading skeleton                             */
/* -------------------------------------------------------------------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="rect" height={72} className="w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="metric" height={112} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SkeletonCard count={2} />
        </div>
        <div className="space-y-6">
          <Skeleton variant="rect" height={200} />
          <Skeleton variant="rect" height={160} />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <SkeletonGroup>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 space-y-3"
        >
          <Skeleton variant="text" width="35%" />
          <Skeleton variant="chart" height={120} />
        </div>
      ))}
    </SkeletonGroup>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   KPI Card                                 */
/* -------------------------------------------------------------------------- */

function KpiCard({ kpi, index }: { kpi: KpiData; index: number }) {
  const TrendIcon = kpi.trend ? trendDirection[kpi.trend.direction] : Minus;
  const color = kpi.trend ? trendColor[kpi.trend.direction] : "text-[var(--text-disabled)]";

  return (
    <motion.div variants={fadeUp}>
      <Card className="h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-[var(--text-tertiary)]">{kpi.label}</span>
          {kpi.icon && (
            <span className={cn("w-4 h-4", kpi.color ?? "text-[var(--text-disabled)]")}>
              {kpi.icon}
            </span>
          )}
        </div>
        <div className="text-[20px] font-bold text-[var(--text-primary)]">{kpi.value}</div>
        {kpi.trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={cn("w-3.5 h-3.5", color)} />
            <span className={cn("text-[12px] font-medium", color)}>{kpi.trend.value}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Nav Card                                  */
/* -------------------------------------------------------------------------- */

function NavCard({ item }: { item: NavItem }) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={item.href} className="block">
        <Card variant="interactive" padding="md" className="h-full">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--color-gold)]">{item.icon}</span>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-[var(--text-primary)]">{item.label}</div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Alert Row                                 */
/* -------------------------------------------------------------------------- */

function AlertRow({ alert, onAck }: { alert: AlertItem; onAck?: (id: string) => void }) {
  const badge = severityBadge[alert.severity];

  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
          <span className="text-[13px] text-[var(--text-primary)] truncate">{alert.title}</span>
        </div>
        <p className="text-[12px] text-[var(--text-tertiary)] line-clamp-1">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-[var(--text-disabled)]">{alert.source}</span>
          <span className="text-[10px] text-[var(--text-disabled)]">{alert.timestamp}</span>
        </div>
      </div>
      {onAck && (
        <Button variant="ghost" size="xs" onClick={() => onAck(alert.id)}>
          Ack
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Format timestamp                              */
/* -------------------------------------------------------------------------- */

function formatTimestamp(value?: Date | string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* -------------------------------------------------------------------------- */
/*                              DashboardTemplate                             */
/* -------------------------------------------------------------------------- */

export function DashboardTemplate({
  title,
  subtitle,
  icon,
  iconColor = "text-[var(--color-gold)]",
  breadcrumbs,
  loading = false,
  kpis,
  navItems,
  children,
  sidebar,
  alerts,
  onAckAlert,
  stats,
  statsTitle = "Overview",
  activity,
  lastUpdated,
  onRefresh,
}: DashboardTemplateProps) {
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DashboardSkeleton />
      </div>
    );
  }

  /* ---- Page header ---- */
  const header = (
    <PageHeader
      title={title}
      description={subtitle}
      breadcrumbs={breadcrumbs}
      badge={
        <Badge variant="gold" size="sm">
          <span className={cn("w-3.5 h-3.5 inline-block", iconColor)}>{icon}</span>
          Enterprise
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--text-disabled)]">
              <Clock className="w-3.5 h-3.5" />
              {formatTimestamp(lastUpdated)}
            </span>
          )}
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh dashboard">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      }
    />
  );

  /* ---- KPI slot ---- */
  const kpiSlot = kpis && kpis.length > 0 ? (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} kpi={kpi} index={i} />
      ))}
    </motion.div>
  ) : undefined;

  /* ---- Alert slot ---- */
  const alertSlot = alerts && alerts.length > 0 ? (
    <DashboardSection title="Active Alerts" action={<span className="text-[12px] text-[var(--text-disabled)]">{alerts.length} active</span>}>
      <div className="divide-y divide-[var(--border-subtle)]">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} onAck={onAckAlert} />
        ))}
      </div>
    </DashboardSection>
  ) : undefined;

  /* ---- Sidebar: stats + custom sidebar ---- */
  const sidebarContent = (
    <>
      {stats && stats.length > 0 && (
        <DashboardSection title={statsTitle}>
          <div className="space-y-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--text-secondary)]">{stat.label}</span>
                <span className="text-[14px] font-semibold text-[var(--text-primary)]">{stat.value}</span>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      {sidebar}
    </>
  );

  return (
    <DashboardLayout
      header={header}
      kpis={kpiSlot}
      alerts={alertSlot}
      activity={activity}
      sidebar={sidebarContent}
    >
      {/* Main content area (3/4) */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {navItems && navItems.length > 0 && (
          <motion.div variants={fadeUp} className="mb-6">
            <DashboardSection title="Quick Navigation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {navItems.map((item) => (
                  <NavCard key={item.href} item={item} />
                ))}
              </div>
            </DashboardSection>
          </motion.div>
        )}
        {children}
      </motion.div>
    </DashboardLayout>
  );
}
