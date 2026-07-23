import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import {
  Layout,
  Eye,
  EyeOff,
  Clock,
  Bell,
  Palette,
  ArrowLeft,
  Grid3X3,
  PanelRightOpen,
  Square,
  Settings as SettingsIcon,
} from "lucide-react";

export default async function ExecutiveWorkspacePage() {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const prefs = await CFOAdvisorService.getWorkspacePreferences(
    ctx,
    session!.user!.id,
  ).catch(() => null);

  const pinnedWidgets = prefs?.pinnedWidgets ?? [];
  const hiddenWidgets = prefs?.hiddenWidgets ?? [];
  const briefingTime = prefs?.briefingTime;
  const theme = prefs?.theme ?? "dark";
  const notificationPrefs = prefs?.notificationPrefs as Record<string, unknown> | null;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Executive Workspace"
        description="Personalize your CFO advisor workspace — widgets, briefing schedule, and preferences"
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
              <Grid3X3 className="h-4 w-4 text-[#d4af37]" />
              <h2 className="text-sm font-semibold text-white">Pinned Widgets</h2>
            </div>
            {pinnedWidgets.length > 0 ? (
              <div className="space-y-2">
                {pinnedWidgets.map((widget) => (
                  <div
                    key={widget}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <PanelRightOpen className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-xs text-zinc-300 capitalize">
                      {widget.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <Layout className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                <p className="text-xs text-zinc-500">No pinned widgets configured</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  Pin widgets to your workspace for quick access
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="mb-4 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Hidden Widgets</h2>
            </div>
            {hiddenWidgets.length > 0 ? (
              <div className="space-y-2">
                {hiddenWidgets.map((widget) => (
                  <div
                    key={widget}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <Eye className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-xs text-zinc-300 capitalize">
                      {widget.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <EyeOff className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                <p className="text-xs text-zinc-500">No hidden widgets</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  All widgets are currently visible
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#d4af37]" />
              <h2 className="text-sm font-semibold text-white">Briefing Time</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10">
                <Clock className="h-5 w-5 text-[#d4af37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {briefingTime ?? "Not configured"}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Daily morning briefing delivery time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#d4af37]" />
              <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
            </div>
            {notificationPrefs && Object.keys(notificationPrefs).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(notificationPrefs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <span className="text-xs text-zinc-300 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
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
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <Bell className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                <p className="text-xs text-zinc-500">Default notification preferences</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  All notifications are enabled by default
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#d4af37]" />
              <h2 className="text-sm font-semibold text-white">Theme</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Palette className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">{theme}</p>
                <p className="text-[11px] text-zinc-500">Display theme preference</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="mb-4 flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Workspace Config</h2>
            </div>
            {prefs?.config && Object.keys(prefs.config as Record<string, unknown>).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(prefs.config as Record<string, unknown>).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <span className="text-xs text-zinc-300 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <Square className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                <p className="text-xs text-zinc-500">No custom configuration</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  Workspace is using default settings
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/cfo/settings", label: "CFO Advisor Settings", icon: SettingsIcon },
                { href: "/cfo/briefing", label: "Morning Briefing", icon: Clock },
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
}
