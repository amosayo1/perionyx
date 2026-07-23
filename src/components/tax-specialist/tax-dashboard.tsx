"use client";

import { useState, useEffect } from "react";
import {
  Receipt, Calculator, Percent, ArrowRightLeft, Calendar, Target,
  ShieldAlert, FileText, BarChart3, AlertTriangle,
  CheckCircle, Clock, TrendingUp,
} from "lucide-react";
import { Card, Badge } from "@/design-system";
import { DashboardTemplate, type KpiData, type NavItem, type StatItem, type AlertItem } from "@/components/enterprise/dashboard-template";

interface TaxStats {
  effectiveTaxRate: number;
  openReturns: number;
  upcomingDeadlines: number;
  provisionStatus: string;
  activeRisks: number;
  planningOpportunities: number;
}

interface Deadline {
  id: string;
  name: string;
  jurisdiction: string;
  dueDate: string;
  type: string;
  status: "upcoming" | "overdue" | "completed";
}

interface Briefing {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
}

const kpiData: KpiData[] = [
  { label: "Effective Tax Rate", value: "21.4%", trend: { value: "+0.8%", direction: "up" } },
  { label: "Open Returns", value: 7, trend: { value: "-2 vs Q1", direction: "down" } },
  { label: "Upcoming Deadlines", value: 12, trend: { value: "+3 next month", direction: "up" } },
  { label: "Provision Status", value: "In Progress", trend: { value: "On track", direction: "neutral" } },
  { label: "Active Risks", value: 3, trend: { value: "-1 this week", direction: "down" } },
  { label: "Planning Opportunities", value: 5, trend: { value: "+2 identified", direction: "up" } },
];

const navItems: NavItem[] = [
  { label: "Provisions", icon: <Calculator className="w-5 h-5" />, href: "/tax/provisions", description: "Manage tax provisions and estimates" },
  { label: "Indirect Tax", icon: <Percent className="w-5 h-5" />, href: "/tax/indirect-tax", description: "VAT, GST, and sales tax compliance" },
  { label: "Transfer Pricing", icon: <ArrowRightLeft className="w-5 h-5" />, href: "/tax/transfer-pricing", description: "Intercompany pricing and documentation" },
  { label: "Calendar", icon: <Calendar className="w-5 h-5" />, href: "/tax/calendar", description: "Filing deadlines and payment dates" },
  { label: "Planning", icon: <Target className="w-5 h-5" />, href: "/tax/planning", description: "Tax strategy and optimization" },
  { label: "Risk", icon: <ShieldAlert className="w-5 h-5" />, href: "/tax/risk", description: "Compliance risk assessment" },
  { label: "Executive", icon: <FileText className="w-5 h-5" />, href: "/tax/executive", description: "Executive tax summary reports" },
  { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/tax/analytics", description: "Tax data analysis and trends" },
  { label: "Returns", icon: <Receipt className="w-5 h-5" />, href: "/tax/returns", description: "Tax return filing and tracking" },
];

const overviewStats: StatItem[] = [
  { label: "Returns Filed (YTD)", value: "18 of 25" },
  { label: "Payments Made (YTD)", value: "$4.2M" },
  { label: "Provision Accuracy", value: "97.3%" },
  { label: "Jurisdictions Active", value: "14" },
];

export function TaxDashboard() {
  const [stats, setStats] = useState<TaxStats | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, deadlinesRes, briefingsRes] = await Promise.all([
          fetch("/api/tax/dashboard/stats").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/dashboard/deadlines").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/dashboard/briefings").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (statsRes) setStats(statsRes);
        if (deadlinesRes) setDeadlines(deadlinesRes.deadlines ?? []);
        if (briefingsRes) setBriefings(briefingsRes.briefings ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const s = stats ?? {
    effectiveTaxRate: 21.4,
    openReturns: 7,
    upcomingDeadlines: 12,
    provisionStatus: "In Progress",
    activeRisks: 3,
    planningOpportunities: 5,
  };

  const defaultDeadlines: Deadline[] = [
    { id: "1", name: "US Federal Corporate Return", jurisdiction: "US-Federal", dueDate: "2026-04-15", type: "filing", status: "completed" },
    { id: "2", name: "UK VAT Return Q1", jurisdiction: "UK", dueDate: "2026-07-31", type: "filing", status: "upcoming" },
    { id: "3", name: "Germany Trade Tax", jurisdiction: "DE", dueDate: "2026-08-15", type: "payment", status: "upcoming" },
    { id: "4", name: "Singapore GST F5", jurisdiction: "SG", dueDate: "2026-07-20", type: "filing", status: "overdue" },
    { id: "5", name: "Transfer Pricing Documentation", jurisdiction: "Multi", dueDate: "2026-12-31", type: "assessment", status: "upcoming" },
  ];

  const defaultBriefings: Briefing[] = [
    { id: "1", title: "Q2 Provision Estimate Updated", type: "provision", date: "2026-07-17", summary: "Current provision adjusted for new DTL from asset revaluation." },
    { id: "2", title: "Transfer Pricing Risk Alert", type: "risk", date: "2026-07-16", summary: "DE-SG intercompany margin flagged outside arm length range." },
    { id: "3", title: "Planning Opportunity: R&D Credits", type: "planning", date: "2026-07-15", summary: "New R&D tax credit eligibility identified for APAC operations." },
  ];

  const deadlineBadgeVariant: Record<string, "success" | "danger" | "warning"> = {
    completed: "success",
    overdue: "danger",
    upcoming: "warning",
  };

  const liveKpis = kpiData.map((kpi, i) => {
    const liveValues = [s.effectiveTaxRate, s.openReturns, s.upcomingDeadlines, s.provisionStatus, s.activeRisks, s.planningOpportunities];
    return { ...kpi, value: loading ? "\u2014" : liveValues[i] };
  });

  const alertItems: AlertItem[] = (deadlines.length > 0 ? deadlines : defaultDeadlines)
    .filter((d) => d.status === "overdue")
    .map((d) => ({
      id: d.id,
      severity: "high" as const,
      title: `Overdue: ${d.name}`,
      message: `${d.jurisdiction} - due ${d.dueDate}`,
      source: d.jurisdiction,
      timestamp: d.dueDate,
    }));

  const sidebar = (
    <>
      <div className="space-y-4">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Recent Briefings</div>
        <div className="space-y-2">
          {(briefings.length > 0 ? briefings : defaultBriefings).map((b) => (
            <Card key={b.id} padding="md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-gold)]" />
                <span className="text-sm text-[var(--text-primary)]">{b.title}</span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">{b.summary}</p>
              <div className="text-[10px] text-[var(--text-disabled)]">{b.type.toUpperCase()} &middot; {b.date}</div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <DashboardTemplate
      title="Tax Specialist Dashboard"
      subtitle="Corporate tax provisioning, compliance, and planning"
      icon={<Receipt className="w-4 h-4" />}
      loading={loading}
      kpis={liveKpis}
      navItems={navItems}
      alerts={alertItems}
      stats={overviewStats}
      statsTitle="Tax Overview"
      sidebar={sidebar}
      lastUpdated={new Date()}
    >
      <div className="space-y-4">
        <div className="text-lg font-semibold text-[var(--text-primary)]">Top Deadlines</div>
        <div className="space-y-2">
          {(deadlines.length > 0 ? deadlines : defaultDeadlines).slice(0, 5).map((d) => (
            <Card key={d.id} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {d.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                  ) : d.status === "overdue" ? (
                    <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />
                  ) : (
                    <Clock className="w-5 h-5 text-[var(--color-warning)]" />
                  )}
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">{d.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{d.jurisdiction} &middot; {d.dueDate}</div>
                  </div>
                </div>
                <Badge variant={deadlineBadgeVariant[d.status]} size="sm">
                  {d.type.toUpperCase()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardTemplate>
  );
}
