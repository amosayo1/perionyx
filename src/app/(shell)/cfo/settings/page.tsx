import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import {
  Bell,
  Clock,
  Palette,
  Layout,
  Shield,
  RefreshCw,
  ArrowLeft,
  Settings as SettingsIcon,
  Sliders,
  Mail,
  Smartphone,
  Globe,
} from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function CFOSettingsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [workspacePref, recommendations, decisions] = await Promise.all([
      prisma.executiveWorkspacePreference.findFirst({
        where: { companyId: ctx.tenant.companyId, userId: ctx.tenant.userId },
      }),
      prisma.executiveRecommendation.findMany({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
      prisma.executiveDecision.findMany({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);
  
    const notificationPrefs = workspacePref?.notificationPrefs as Record<string, unknown> | null ?? {};
    const advisorConfig = workspacePref?.config as Record<string, unknown> | null ?? {};
    const briefingTime = workspacePref?.briefingTime ?? null;
    const theme = workspacePref?.theme ?? "dark";
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="CFO Advisor Settings"
          description="Configure advisor behavior, notifications, briefing schedule, and display preferences"
          actions={
            <Link
              href="/cfo/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          }
        />
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#d4af37]" />
                <h2 className="text-sm font-semibold text-white">Advisor Configuration</h2>
              </div>
              <div className="space-y-3">
                {advisorConfig && Object.keys(advisorConfig).length > 0 ? (
                  Object.entries(advisorConfig).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                    >
                      <span className="text-xs text-zinc-300 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {typeof value === "boolean"
                          ? value
                            ? "Enabled"
                            : "Disabled"
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                    <SettingsIcon className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Default advisor configuration</p>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      Configure advisor behavior in workspace preferences
                    </p>
                  </div>
                )}
                <Link
                  href="/cfo/workspace"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline"
                >
                  <Layout className="h-3 w-3" />
                  Open workspace settings
                </Link>
              </div>
            </div>
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#d4af37]" />
                <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
              </div>
              {Object.keys(notificationPrefs).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(notificationPrefs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {key.includes("email") || key.includes("mail") ? (
                          <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        ) : key.includes("push") || key.includes("mobile") ? (
                          <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        <span className="text-xs text-zinc-300 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          value
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-zinc-400/10 text-zinc-400"
                        }`}
                      >
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { key: "email_alerts", label: "Email Alerts", enabled: true },
                    { key: "push_notifications", label: "Push Notifications", enabled: true },
                    { key: "briefing_digest", label: "Briefing Digest", enabled: true },
                    { key: "critical_alerts", label: "Critical Alerts", enabled: true },
                    { key: "daily_summary", label: "Daily Summary", enabled: false },
                  ].map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {n.key.includes("email") ? (
                          <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        ) : n.key.includes("push") ? (
                          <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        <span className="text-xs text-zinc-300">{n.label}</span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          n.enabled
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-zinc-400/10 text-zinc-400"
                        }`}
                      >
                        {n.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-white">Data & Sync</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Total Recommendations</span>
                  <span className="text-xs text-white">{recommendations.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Total Decisions</span>
                  <span className="text-xs text-white">{decisions.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Last Recommendation</span>
                  <span className="text-xs text-white">
                    {recommendations.length > 0
                      ? new Date(recommendations[0].createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
  
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#d4af37]" />
                <h2 className="text-sm font-semibold text-white">Briefing Schedule</h2>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10">
                    <Clock className="h-5 w-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {briefingTime ?? "08:00"}
                    </p>
                    <p className="text-[11px] text-zinc-500">Daily briefing delivery time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <RefreshCw className="h-3 w-3" />
                  Auto-generated each morning based on latest data
                </div>
              </div>
            </div>
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#d4af37]" />
                <h2 className="text-sm font-semibold text-white">Display Preferences</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Theme</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-medium text-white capitalize">
                    {theme}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Language</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-medium text-white">
                    English (US)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Currency Display</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-medium text-white">
                    USD ($)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Date Format</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-medium text-white">
                    MMM DD, YYYY
                  </span>
                </div>
              </div>
            </div>
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-white">Security & Audit</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Session</span>
                  <span className="text-xs text-emerald-400">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Data Retention</span>
                  <span className="text-xs text-zinc-400">90 days</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs text-zinc-300">Audit Logging</span>
                  <span className="text-xs text-emerald-400">Enabled</span>
                </div>
              </div>
            </div>
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Related Settings</h3>
              <div className="space-y-2">
                {[
                  { href: "/cfo/workspace", label: "Executive Workspace", icon: Layout },
                  { href: "/cfo/briefing", label: "Morning Briefing", icon: Clock },
                  { href: "/cfo/recommendations", label: "Recommendation Center", icon: Sliders },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  });
}
