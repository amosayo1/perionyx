"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { startTransition, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  BookOpen,
  Calendar,
  ChevronDown,
  Command,
  Cpu,
  LayoutDashboard,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  UserCircle,
  Wallet,
  AlertTriangle,
  Cable,
  Database,
  FileCheck,
  FileText,
  GitBranch,
  Key,
  Landmark,
  MessageSquareText,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { Topbar } from "@/components/ui/topbar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TenantGate } from "@/components/tenant-gate";
import { DemoBanner } from "@/components/demo/demo-banner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CommandPalette } from "@/components/command-palette";
import { SandboxBanner, SandboxSidebarBadge } from "@/components/sandbox/sandbox-banner";
import { DemoController } from "@/components/sandbox/demo-controller";
import { OnboardingProvider } from "@/components/sandbox/onboarding-context";
import { WelcomeModal } from "@/components/sandbox/welcome-modal";
import { GuidedTourOverlay } from "@/components/sandbox/guided-tour-overlay";
import { MissionPanel } from "@/components/sandbox/mission-panel";

type CompanyRow = {
  membershipId: string;
  role: string;
  company: { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
};

type NavItem = {
  href: string;
  label: string;
  icon: any;
  permission?: string;
  /** Minimum CompanyRole level to see this item when no RBAC is configured.
   *  Hierarchy: OWNER > ADMIN > TREASURER > MEMBER > VIEWER */
  minRole?: string;
};

const ALL_NAV: NavItem[] = [
  { href: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
  { href: "/command-center", label: "Command Center", icon: Command, minRole: "ADMIN" },
  { href: "/wallets", label: "Wallets", icon: Wallet, permission: "wallet.view", minRole: "TREASURER" },
  { href: "/accounts", label: "Accounts", icon: Landmark, permission: "treasury.manage", minRole: "TREASURER" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, permission: "transactions.transfer", minRole: "TREASURER" },
  { href: "/approvals", label: "Approvals", icon: Bell, permission: "approvals.approve", minRole: "ADMIN" },
  { href: "/reconciliation", label: "Reconciliation", icon: RefreshCw, permission: "reconciliation.run", minRole: "TREASURER" },
  { href: "/insights", label: "Executive Insights", icon: BarChart3, minRole: "ADMIN" },
  { href: "/platform", label: "Platform Health", icon: Activity, minRole: "ADMIN" },
  { href: "/operations", label: "Operations", icon: Monitor, permission: "transactions.transfer", minRole: "ADMIN" },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/ledger", label: "Ledger", icon: BookOpen, permission: "audit.view", minRole: "ADMIN" },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, permission: "audit.view", minRole: "ADMIN" },
  { href: "/investigation", label: "Investigation", icon: Search, permission: "audit.view", minRole: "ADMIN" },
  { href: "/policies", label: "Policies", icon: FileCheck, permission: "policies.manage", minRole: "ADMIN" },
  { href: "/risk", label: "Risk Center", icon: AlertTriangle, permission: "risk.manage", minRole: "TREASURER" },
  { href: "/risk-intelligence", label: "Risk Intelligence", icon: Shield, minRole: "ADMIN" },
  { href: "/governance", label: "Governance", icon: ShieldCheck, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/automation-studio", label: "Automation Studio", icon: GitBranch, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/connectors", label: "Connectors", icon: Cable, permission: "connectors.manage", minRole: "ADMIN" },
  { href: "/integrations", label: "Integrations", icon: GitBranch, minRole: "ADMIN" },
  { href: "/developer", label: "Developer Portal", icon: Terminal, minRole: "ADMIN" },
  { href: "/reports", label: "Reports", icon: FileText, minRole: "ADMIN" },
  { href: "/copilot", label: "Copilot", icon: MessageSquareText, minRole: "ADMIN" },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/analytics", label: "Approval Analytics", icon: BarChart3, permission: "admin.manage_roles", minRole: "OWNER" },
  { href: "/admin/identity", label: "Enterprise Identity", icon: Shield, permission: "admin.manage_roles", minRole: "OWNER" },
  { href: "/admin/ai-providers", label: "AI Providers", icon: Cpu, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/admin/rules", label: "Rules", icon: Shield, permission: "admin.manage_authorities", minRole: "ADMIN" },
  { href: "/admin/roles", label: "Roles", icon: Shield, permission: "admin.manage_roles", minRole: "OWNER" },
  { href: "/admin/approvers", label: "Approvers", icon: Shield, permission: "admin.manage_approvers", minRole: "ADMIN" },
  { href: "/admin/users", label: "Users", icon: UserCircle, permission: "admin.manage_users", minRole: "OWNER" },
  { href: "/admin/rates", label: "Exchange rates", icon: ArrowLeftRight, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/admin/fx", label: "FX Sync", icon: RefreshCw, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/admin/queue", label: "Queue", icon: Database, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/company", label: "Company Profile", icon: Building2 },
  { href: "/settings/api-keys", label: "API Keys", icon: Key, permission: "admin.manage_users", minRole: "OWNER" },
  { href: "/settings/webhooks", label: "Webhooks", icon: Cable, permission: "webhooks.manage", minRole: "ADMIN" },
  { href: "/settings/notifications", label: "Notification Prefs", icon: Bell },
  { href: "/sign-out", label: "Sign Out", icon: LogOut },
];

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 5, ADMIN: 4, TREASURER: 3, MEMBER: 2, VIEWER: 1,
};

function filterNavByRole(all: NavItem[], role: string): NavItem[] {
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  return all.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= (ROLE_HIERARCHY[item.minRole] ?? 0);
  });
}

function filterNavByPermissions(all: NavItem[], permissions: string[]): NavItem[] {
  const set = new Set(permissions);
  return all.filter((item) => {
    if (!item.permission) return true;
    return set.has(item.permission);
  });
}

export function AppShell({
  userEmail,
  userName,
  children,
}: {
  userEmail?: string | null;
  userName?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [nav, setNav] = useState<NavItem[]>(ALL_NAV);
  const [navLoaded, setNavLoaded] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/v1/companies", {
            credentials: "include",
            signal: ac.signal,
          });
          if (ac.signal.aborted || !res.ok) {
            return;
          }
          const data = (await res.json()) as { items: CompanyRow[] };
          setCompanies(data.items ?? []);
        } catch {
          /* aborted */
        }
      })();
    });
    return () => ac.abort();
  }, []);

  // Fetch permissions and filter nav
  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/v1/rbac/my-permissions", {
            credentials: "include",
            signal: ac.signal,
          });
          if (ac.signal.aborted) return;
          if (!res.ok) { setNavLoaded(true); return; }

          const data = (await res.json()) as {
            permissions: string[];
            fallbackRole: string | null;
            hasRbac: boolean;
          };

          if (data.hasRbac) {
            setNav(filterNavByPermissions(ALL_NAV, data.permissions));
          } else if (data.fallbackRole) {
            setNav(filterNavByRole(ALL_NAV, data.fallbackRole));
          }
          setNavLoaded(true);
        } catch {
          setNavLoaded(true);
        }
      })();
    });
    return () => ac.abort();
  }, []);

  // Fetch pending approvals count for badge
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/v1/admin/pending-approvals");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.pending?.length) setPendingApprovals(data.pending.length);
        else setPendingApprovals(0);
      } catch { /* ignore */ }
    };
    void fetchCount();
    const id = setInterval(fetchCount, 15000);
    return () => clearInterval(id);
  }, []);

  const activeId = session?.user?.activeCompanyId ?? null;
  const activeCompany = companies.find((c) => c.company.id === activeId)?.company;

  const switchCompany = async (companyId: string) => {
    await update({ activeCompanyId: companyId });
    router.refresh();
  };

  const isSandbox = session?.user?.isSandbox === true;

  const sandboxRestricted: string[] = [
    "/settings/api-keys",
    "/settings/company",
    "/settings/webhooks",
    "/integrations",
    "/developer",
    "/admin/analytics",
    "/admin/rules",
    "/admin/roles",
    "/admin/approvers",
    "/admin/users",
    "/admin/rates",
    "/admin/fx",
    "/admin/queue",
  ];

  const visibleNav = (navLoaded ? nav : ALL_NAV).filter((item) => {
    if (isSandbox && sandboxRestricted.includes(item.href)) return false;
    return true;
  });

  return (
    <OnboardingProvider>
      <WelcomeModal />
      <GuidedTourOverlay />
      <MissionPanel />
      <div className="flex min-h-screen bg-perionyx-bg-primary text-perionyx-text-primary">
      <Sidebar>
        <div className="flex h-20 items-center border-b border-[rgba(255,255,255,0.08)] px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37] shadow-lg shadow-[#d4af37]/20 overflow-hidden">
              <img src="/logo.PNG" alt="Perionyx" className="h-full w-full object-cover" />
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-white">Perionyx</span>
          </Link>
        </div>

        <SandboxSidebarBadge />

        <ScrollArea className="flex-1 py-5">
          <nav className="space-y-1 px-4">
            {visibleNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200",
                  )}
                >
                  <span className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                    active
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-2 flex-1">
                    {label}
                    {href === "/approvals" && pendingApprovals > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#d4af37] px-1.5 text-[10px] font-bold text-black ml-auto">
                        {pendingApprovals > 99 ? "99+" : pendingApprovals}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/[0.05] px-5 py-4">
          <div className="rounded-xl border border-[#d4af37]/10 bg-white/[0.02] p-3.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Enterprise</p>
            <p className="mt-1 text-xs font-medium text-zinc-300">Treasury Operating System</p>
          </div>
        </div>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar className="px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="hidden items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 md:flex">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                className="w-[260px] bg-transparent px-0 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                placeholder="Search (⌘K)"
                aria-label="Search"
                onFocus={(e) => {
                  e.currentTarget.blur();
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 md:inline-flex">
                  <Building2 className="h-4 w-4 text-zinc-500" />
                  <span>{activeCompany?.name ?? "Select company"}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
                <DropdownMenuLabel className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Companies</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.length === 0 ? (
                  <DropdownMenuItem disabled>No companies yet</DropdownMenuItem>
                ) : (
                  companies.map((row) => (
                    <DropdownMenuItem
                      key={row.company.id}
                      onClick={() => void switchCompany(row.company.id)}
                      className={cn(row.company.id === activeId && "bg-[#d4af37]/10 text-[#d4af37]")}
                    >
                      <span className="truncate">{row.company.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/onboarding">Create company…</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-zinc-400 hover:text-white">
                  <UserCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium max-w-[120px] truncate">{userName ?? userEmail ?? "Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
                <DropdownMenuLabel className="font-normal px-4 py-3">
                  <div className="truncate text-sm text-white">{userName ?? userEmail ?? "Account"}</div>
                  <div className="truncate text-xs text-zinc-500">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    void signOut({
                      callbackUrl: "/sign-in",
                    })
                  }
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Topbar>

        <nav className="flex gap-2 overflow-x-auto border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.96)] px-4 py-3 md:hidden">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-[20px] px-4 py-2 text-xs font-semibold transition duration-200",
                  active ? "bg-[rgba(212,175,55,0.14)] text-perionyx-gold" : "text-perionyx-text-muted hover:bg-[rgba(255,255,255,0.05)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <SandboxBanner />
        <TenantGate>
          <main className="flex-1 overflow-auto px-4 pb-6 pt-6 md:px-8 md:pb-10 md:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </TenantGate>
      </div>
      <CommandPalette />
      <DemoBanner />
      <DemoController />
    </div>
    </OnboardingProvider>
  );
}
