import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Key,
  Cable,
  Bell,
  UserCircle,
  Shield,
  ChevronRight,
} from "lucide-react";

const settingsGroups = [
  {
    title: "Organization",
    items: [
      {
        href: "/settings/company",
        label: "Company Profile",
        desc: "Legal name, EIN, entity type, jurisdiction, and address",
        icon: Building2,
        status: "active" as const,
      },
      {
        href: "/admin/users",
        label: "Members & Roles",
        desc: "Invite teammates, manage permissions, and assign roles",
        icon: UserCircle,
        status: "active" as const,
      },
      {
        href: "/admin/approvers",
        label: "Approval Authorities",
        desc: "Configure who can approve transactions by role and amount",
        icon: Shield,
        status: "active" as const,
      },
    ],
  },
  {
    title: "Development",
    items: [
      {
        href: "/settings/api-keys",
        label: "API Keys",
        desc: "Create and manage API keys for programmatic access",
        icon: Key,
        status: "active" as const,
      },
      {
        href: "/settings/webhooks",
        label: "Webhooks",
        desc: "Configure event-driven webhooks for real-time integration",
        icon: Cable,
        status: "active" as const,
      },
      {
        href: "#",
        label: "Payment Rails",
        desc: "Connect providers for automated funding flows",
        icon: Building2,
        status: "coming-soon" as const,
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        href: "/settings/notifications",
        label: "Notifications",
        desc: "Configure which events trigger in-app, email, and Slack notifications",
        icon: Bell,
        status: "active" as const,
      },
    ],
  },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your organization, API keys, and preferences.
        </p>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {group.title}
          </h2>
          <div className="space-y-2">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                  item.status === "coming-soon"
                    ? "border-white/[0.04] bg-zinc-900/20 opacity-50 cursor-not-allowed"
                    : "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/[0.1]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-[#d4af37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      {item.status === "coming-soon" && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                {item.status === "active" && (
                  <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
