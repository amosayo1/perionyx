"use client";

import { useState, useEffect } from "react";
import {
  Crown, Users, Calendar, Scale, ClipboardCheck, CheckCircle,
  FileText, BarChart3, AlertTriangle, Clock, Target,
} from "lucide-react";
import { Card, Badge } from "@/design-system";
import { DashboardTemplate, type KpiData, type NavItem, type StatItem, type AlertItem } from "@/components/enterprise/dashboard-template";

interface BoardStats {
  governanceScore: number;
  activeMembers: number;
  upcomingMeetings: number;
  openResolutions: number;
  outstandingActions: number;
  completedThisQuarter: number;
}

interface Briefing {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
}

interface Priority {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium";
  dueDate: string;
  assignee: string;
}

const kpiData: KpiData[] = [
  { label: "Governance Score", value: "92%", trend: { value: "+2 pts", direction: "up" } },
  { label: "Active Members", value: 12, trend: { value: "No change", direction: "neutral" } },
  { label: "Upcoming Meetings", value: 4, trend: { value: "+2 next quarter", direction: "up" } },
  { label: "Open Resolutions", value: 3, trend: { value: "-1 this week", direction: "down" } },
  { label: "Outstanding Actions", value: 7, trend: { value: "+2 vs last month", direction: "up" } },
  { label: "Completed This Quarter", value: 18, trend: { value: "+3 vs target", direction: "up" } },
];

const navItems: NavItem[] = [
  { label: "Board Center", icon: <Users className="w-5 h-5" />, href: "/governance/board", description: "Board member directory and profiles" },
  { label: "Meetings", icon: <Calendar className="w-5 h-5" />, href: "/governance/meetings", description: "Schedule and manage board meetings" },
  { label: "Agenda Builder", icon: <FileText className="w-5 h-5" />, href: "/governance/agenda", description: "Create and approve meeting agendas" },
  { label: "Board Packs", icon: <ClipboardCheck className="w-5 h-5" />, href: "/governance/packs", description: "Board meeting materials and reports" },
  { label: "Resolutions", icon: <Scale className="w-5 h-5" />, href: "/governance/resolutions", description: "Board resolutions and voting" },
  { label: "Committees", icon: <Users className="w-5 h-5" />, href: "/governance/committees", description: "Committee management and charters" },
  { label: "Calendar", icon: <Calendar className="w-5 h-5" />, href: "/governance/calendar", description: "Governance calendar and deadlines" },
  { label: "Briefings", icon: <FileText className="w-5 h-5" />, href: "/governance/briefings", description: "Board briefings and updates" },
  { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/governance/analytics", description: "Governance analytics and insights" },
];

const overviewStats: StatItem[] = [
  { label: "Board Meetings (YTD)", value: "6 of 8" },
  { label: "Resolutions Passed", value: "14" },
  { label: "Attendance Rate", value: "96.2%" },
  { label: "Active Committees", value: "5" },
];

export function BoardDashboard() {
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, briefingsRes, prioritiesRes] = await Promise.all([
          fetch("/api/board/dashboard/stats").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/board/dashboard/briefings").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/board/dashboard/priorities").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (statsRes) setStats(statsRes);
        if (briefingsRes) setBriefings(briefingsRes.briefings ?? []);
        if (prioritiesRes) setPriorities(prioritiesRes.priorities ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const s = stats ?? {
    governanceScore: 92,
    activeMembers: 12,
    upcomingMeetings: 4,
    openResolutions: 3,
    outstandingActions: 7,
    completedThisQuarter: 18,
  };

  const defaultBriefings: Briefing[] = [
    { id: "1", title: "Q2 Board Meeting Preview", type: "meeting", date: "2026-07-20", summary: "Agenda includes FY26 budget approval, CFO search update, and risk framework review." },
    { id: "2", title: "Audit Committee Report Ready", type: "audit", date: "2026-07-18", summary: "Internal audit findings packaged for board review. 2 critical items require resolution." },
    { id: "3", title: "Compliance Update: New Regulations", type: "compliance", date: "2026-07-17", summary: "Updated SOX compliance requirements ready for governance committee review." },
  ];

  const defaultPriorities: Priority[] = [
    { id: "1", title: "Approve FY26 Annual Budget", priority: "critical", dueDate: "2026-07-25", assignee: "Full Board" },
    { id: "2", title: "Finalize Audit Committee Charter", priority: "high", dueDate: "2026-07-30", assignee: "Audit Committee" },
    { id: "3", title: "Board Skills Matrix Review", priority: "medium", dueDate: "2026-08-05", assignee: "Nominating Committee" },
  ];

  const priorityBadgeVariant: Record<string, "danger" | "warning" | "gold"> = {
    critical: "danger",
    high: "warning",
    medium: "gold",
  };

  const liveKpis = kpiData.map((kpi, i) => {
    const liveValues = [s.governanceScore, s.activeMembers, s.upcomingMeetings, s.openResolutions, s.outstandingActions, s.completedThisQuarter];
    return { ...kpi, value: loading ? "\u2014" : liveValues[i] };
  });

  const alertItems: AlertItem[] = priorities.length > 0
    ? priorities.filter((p) => p.priority === "critical").map((p) => ({
        id: p.id,
        severity: "critical" as const,
        title: p.title,
        message: `Due ${p.dueDate} - ${p.assignee}`,
        source: p.assignee,
        timestamp: p.dueDate,
      }))
    : defaultPriorities.filter((p) => p.priority === "critical").map((p) => ({
        id: p.id,
        severity: "critical" as const,
        title: p.title,
        message: `Due ${p.dueDate} - ${p.assignee}`,
        source: p.assignee,
        timestamp: p.dueDate,
      }));

  const sidebar = (
    <>
      <div className="space-y-4">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Recent Briefings</div>
        <div className="space-y-2">
          {(briefings.length > 0 ? briefings : defaultBriefings).map((b) => (
            <Card key={b.id} padding="md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[var(--color-gold)]" />
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
      title="Board Governance Dashboard"
      subtitle="Board oversight, governance compliance, and meeting management"
      icon={<Crown className="w-4 h-4" />}
      loading={loading}
      kpis={liveKpis}
      navItems={navItems}
      alerts={alertItems}
      stats={overviewStats}
      statsTitle="Governance Overview"
      sidebar={sidebar}
      lastUpdated={new Date()}
    >
      <div className="space-y-4">
        <div className="text-lg font-semibold text-[var(--text-primary)]">Top Priorities</div>
        <div className="space-y-2">
          {(priorities.length > 0 ? priorities : defaultPriorities).map((p) => (
            <Card key={p.id} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {p.priority === "critical" ? (
                    <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />
                  ) : p.priority === "high" ? (
                    <Target className="w-5 h-5 text-orange-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-[var(--color-warning)]" />
                  )}
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">{p.title}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{p.assignee} &middot; Due {p.dueDate}</div>
                  </div>
                </div>
                <Badge variant={priorityBadgeVariant[p.priority]} size="sm">
                  {p.priority.toUpperCase()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardTemplate>
  );
}
