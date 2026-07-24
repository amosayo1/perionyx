"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { startTransition, useEffect, useMemo, useState, useCallback } from "react";
import {
  Building2, ChevronDown, LogOut, Search, Settings, UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Topbar } from "@/components/ui/topbar";
import { cn } from "@/lib/utils";
import { TenantGate } from "@/components/tenant-gate";
import { DemoBanner } from "@/components/demo/demo-banner";
import { SandboxBanner } from "@/components/sandbox/sandbox-banner";
import {
  EnterpriseSidebarNew, BreadcrumbBar, NotificationPreview,
  NavigationProvider, ALL_NAV, NAV_SECTIONS, ROLE_HIERARCHY,
  filterNavByRole, filterNavByPermissions, SANDBOX_RESTRICTED,
} from "@/components/navigation";
import {
  useKeyboardShortcuts,
  KeyboardShortcutsDialog,
} from "@/components/layout";
import type { NavItem } from "@/components/navigation";
import { LanguageProvider, RTLProvider, useLocalization } from "@/localization";
import { MobileNavigationBar } from "@/mobile/MobileNavigation/mobile-navigation";
import { AccessibilityProvider } from "@/accessibility";
import { PwaManager } from "@/components/pwa";
import { TenantThemeProvider } from "@/theme";
import { UndoProvider } from "@/components/enterprise/undo-provider";

const CommandPalette = dynamic(() => import("@/components/command-palette").then(m => ({ default: m.CommandPalette })), { ssr: false });
const DemoController = dynamic(() => import("@/components/sandbox/demo-controller").then(m => ({ default: m.DemoController })), { ssr: false });
const OnboardingProvider = dynamic(() => import("@/components/sandbox/onboarding-context").then(m => ({ default: m.OnboardingProvider })), { ssr: false });
const WelcomeModal = dynamic(() => import("@/components/sandbox/welcome-modal").then(m => ({ default: m.WelcomeModal })), { ssr: false });
const GuidedTourOverlay = dynamic(() => import("@/components/sandbox/guided-tour-overlay").then(m => ({ default: m.GuidedTourOverlay })), { ssr: false });
const MissionPanel = dynamic(() => import("@/components/sandbox/mission-panel").then(m => ({ default: m.MissionPanel })), { ssr: false });

type CompanyRow = {
  membershipId: string;
  role: string;
  company: { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
};

const FAVORITES_KEY = "nav-favorites";
const RECENT_KEY = "nav-recent-pages";

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggleFavorite = useCallback((href: string) => {
    setFavorites((prev) => {
      const next = prev.includes(href) ? prev.filter((f) => f !== href) : [...prev, href];
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}

function useRecentPages() {
  const [recentPages, setRecentPages] = useState<{ href: string; label: string; timestamp: number }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const addPage = useCallback((href: string, label: string) => {
    if (href === "/dashboard" || href === "/sign-out") return;
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.href !== href);
      const next = [{ href, label, timestamp: Date.now() }, ...filtered].slice(0, 10);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { recentPages, addPage };
}

function RTLShell({ children }: { children: React.ReactNode }) {
  const { direction } = useLocalization();
  return <RTLProvider direction={direction}>{children}</RTLProvider>;
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
  const { favorites, toggleFavorite } = useFavorites();
  const { recentPages, addPage } = useRecentPages();
  const { shortcutsOpen, setShortcutsOpen, registerShortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    return registerShortcuts([
      { key: "n", label: "New item", description: "Create new item", category: "Actions", handler: () => {}, metaKey: true },
      { key: "f", label: "Find", description: "Find in page", category: "Actions", handler: () => { document.querySelector<HTMLInputElement>('[aria-label="Search"]')?.focus(); }, metaKey: true },
      { key: "s", label: "Save", description: "Save current form", category: "Actions", handler: () => {}, metaKey: true },
    ]);
  }, [registerShortcuts]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setShortcutsOpen]);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/v1/companies", { credentials: "include", signal: ac.signal });
          if (ac.signal.aborted || !res.ok) return;
          const data = (await res.json()) as { items: CompanyRow[] };
          setCompanies(data.items ?? []);
        } catch { /* aborted */ }
      })();
    });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/v1/rbac/my-permissions", { credentials: "include", signal: ac.signal });
          if (ac.signal.aborted) return;
          if (!res.ok) { setNavLoaded(true); return; }
          const data = (await res.json()) as { permissions: string[]; fallbackRole: string | null; hasRbac: boolean };
          if (data.hasRbac) setNav(filterNavByPermissions(ALL_NAV, data.permissions));
          else if (data.fallbackRole) setNav(filterNavByRole(ALL_NAV, data.fallbackRole));
          setNavLoaded(true);
        } catch { setNavLoaded(true); }
      })();
    });
    return () => ac.abort();
  }, []);

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

  useEffect(() => {
    const navItem = nav.find((n) => pathname === n.href || (n.href !== "/dashboard" && pathname?.startsWith(n.href)));
    if (navItem) addPage(navItem.href, navItem.label);
  }, [pathname, nav, addPage]);

  const activeId = session?.user?.activeCompanyId ?? null;
  const activeCompany = companies.find((c) => c.company.id === activeId)?.company;

  const switchCompany = async (companyId: string) => {
    await update({ activeCompanyId: companyId });
    router.refresh();
  };

  const isSandbox = session?.user?.isSandbox === true;

  const visibleNav = (navLoaded ? nav : ALL_NAV).filter((item) => {
    if (isSandbox && SANDBOX_RESTRICTED.includes(item.href)) return false;
    return true;
  });

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }, []);

  return (
    <LanguageProvider>
      <RTLShell>
        <TenantThemeProvider>
        <AccessibilityProvider>
          <PwaManager />
          <NavigationProvider>
      <OnboardingProvider>
        <UndoProvider>
        <WelcomeModal />
        <GuidedTourOverlay />
        <MissionPanel />

        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:bg-zinc-900 focus:p-4 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        >
          Skip to main content
        </a>

        <div className="flex h-screen overflow-hidden bg-perionyx-bg-primary text-perionyx-text-primary">
          <EnterpriseSidebarNew
            nav={visibleNav}
            sections={NAV_SECTIONS}
            pendingApprovals={pendingApprovals}
            isSandbox={isSandbox}
            favorites={favorites}
            recentPages={recentPages}
            companies={companies}
            activeCompanyId={activeId}
            onSwitchCompany={switchCompany}
            onToggleFavorite={toggleFavorite}
            onOpenCommandPalette={openCommandPalette}
          />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar className="px-6" aria-label="Top bar">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <BreadcrumbBar className="hidden md:flex" />

              <div className="hidden items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-2 md:flex">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  className="w-[220px] bg-transparent px-0 text-[13px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                  placeholder="Search (⌘K)"
                  aria-label="Search"
                  onFocus={(e) => {
                    e.currentTarget.blur();
                    openCommandPalette();
                  }}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="hidden items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-zinc-300 md:inline-flex">
                    <Building2 className="h-4 w-4 text-zinc-500" />
                    <span className="max-w-[120px] truncate">{activeCompany?.name ?? "Select company"}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
                  <DropdownMenuLabel className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Companies</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {companies.length === 0 ? (
                    <DropdownMenuItem disabled className="text-[12px]">No companies yet</DropdownMenuItem>
                  ) : (
                    companies.map((row) => (
                      <DropdownMenuItem
                        key={row.company.id}
                        onClick={() => void switchCompany(row.company.id)}
                        className={cn("text-[13px]", row.company.id === activeId && "bg-gold-500/10 text-[#c9a84c]")}
                      >
                        <span className="truncate">{row.company.name}</span>
                        <span className="ml-auto text-[10px] text-zinc-600 capitalize">{row.role.toLowerCase()}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-[13px]">
                    <Link href="/onboarding">Create company...</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <NotificationPreview />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-zinc-400 hover:text-white">
                    <UserCircle className="h-4 w-4 mr-2" />
                    <span className="text-[13px] font-medium max-w-[120px] truncate">{userName ?? userEmail ?? "Account"}</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-1 text-zinc-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="truncate text-[13px] text-white">{userName ?? userEmail ?? "Account"}</div>
                    <div className="truncate text-[11px] text-zinc-500">{userEmail}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-600">
                      {activeCompany && <span>{activeCompany.name}</span>}
                      {session?.user?.companyRole && (
                        <span className="capitalize">{session.user.companyRole.toLowerCase()}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-[13px]">
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void signOut({ callbackUrl: "/sign-in" })}
                    className="text-[13px]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Topbar>

          <nav aria-label="Mobile navigation" className="flex gap-2 overflow-x-auto border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.96)] px-4 py-2.5 md:hidden">
            {visibleNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition duration-200",
                    active ? "bg-gold-500/15 text-[#c9a84c]" : "text-zinc-400 hover:bg-zinc-800/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <SandboxBanner />
          <TenantGate>
            <main id="main-content" className="flex-1 overflow-auto px-4 pb-6 pt-6 md:px-8 md:pb-10 md:pt-8">
              <div className="animate-fade-in">
                {children}
              </div>
            </main>
          </TenantGate>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNavigationBar badgeCounts={{ approvals: pendingApprovals }} />

        <CommandPalette />
        <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        <DemoBanner />
        <DemoController />
      </div>
      </UndoProvider>
      </OnboardingProvider>
    </NavigationProvider>
        </AccessibilityProvider>
        </TenantThemeProvider>
      </RTLShell>
    </LanguageProvider>
  );
}
