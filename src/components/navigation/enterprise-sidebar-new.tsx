"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose, PanelLeft, ChevronDown, Star, History,
  Pin, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "./navigation-state";
import { WorkspaceSwitcher } from "./workspace-switcher";
import type { NavItem, NavSection } from "./nav-config";

interface CompanyRow {
  membershipId: string;
  role: string;
  company: { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
}

interface EnterpriseSidebarNewProps {
  nav: NavItem[];
  sections: NavSection[];
  pendingApprovals: number;
  isSandbox: boolean;
  favorites: string[];
  recentPages: { href: string; label: string; timestamp: number }[];
  companies: CompanyRow[];
  activeCompanyId: string | null;
  onSwitchCompany: (companyId: string) => void;
  onToggleFavorite: (href: string) => void;
  onOpenCommandPalette: () => void;
}

const motionProps = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
};

function NavLink({
  item,
  active,
  collapsed,
  pendingApprovals,
  onToggleFavorite,
  isFavorite,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  pendingApprovals: number;
  onToggleFavorite: (href: string) => void;
  isFavorite: boolean;
}) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <div className="group relative flex items-center justify-center">
        <Link
          href={item.href}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-100",
            active
              ? "bg-gold-500/10 text-[#c9a84c]"
              : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300",
          )}
          aria-label={item.label}
        >
          <Icon className="h-4 w-4" />
        </Link>
        {item.badge === "pending-approvals" && pendingApprovals > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#c9a84c] px-[3px] text-[8px] font-bold text-black">
            {pendingApprovals > 9 ? "9+" : pendingApprovals}
          </span>
        )}
        <div className="absolute left-full ml-2 hidden rounded-md bg-zinc-900 px-2.5 py-1.5 text-[12px] font-medium text-zinc-200 shadow-xl group-hover:block whitespace-nowrap z-50 border border-zinc-800">
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-100",
        active
          ? "bg-zinc-800/60 text-white"
          : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-[#c9a84c]" />
      )}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-100",
          active ? "bg-gold-500/10 text-[#c9a84c]" : "text-zinc-500 group-hover:text-zinc-300",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex flex-1 items-center gap-2 truncate">
        {item.label}
        {item.badge === "pending-approvals" && pendingApprovals > 0 && (
          <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c9a84c] px-1 text-[9px] font-bold text-black">
            {pendingApprovals > 99 ? "99+" : pendingApprovals}
          </span>
        )}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(item.href);
        }}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-opacity",
          isFavorite
            ? "text-[#c9a84c] opacity-100"
            : "opacity-0 group-hover:opacity-100 hover:text-[#c9a84c]",
        )}
        aria-label={isFavorite ? `Remove ${item.label} from favorites` : `Add ${item.label} to favorites`}
      >
        <Star className={cn("h-3 w-3", isFavorite ? "fill-[#c9a84c]" : "")} />
      </button>
    </Link>
  );
}

function SectionGroup({
  section,
  collapsed,
  activeFn,
  pendingApprovals,
  onToggleFavorite,
  favorites,
}: {
  section: NavSection;
  collapsed: boolean;
  activeFn: (href: string) => boolean;
  pendingApprovals: number;
  onToggleFavorite: (href: string) => void;
  favorites: string[];
}) {
  const [expanded, setExpanded] = useState(true);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={activeFn(item.href)}
            collapsed={true}
            pendingApprovals={pendingApprovals}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(item.href)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600 transition-colors hover:text-zinc-400"
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-150",
            !expanded && "-rotate-90",
          )}
        />
        {section.title}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-0.5 overflow-hidden"
          >
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={activeFn(item.href)}
                collapsed={false}
                pendingApprovals={pendingApprovals}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(item.href)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const EnterpriseSidebarNew = memo(function EnterpriseSidebarNew({
  nav,
  sections,
  pendingApprovals,
  favorites,
  recentPages,
  companies,
  activeCompanyId,
  onSwitchCompany,
  onToggleFavorite,
  onOpenCommandPalette,
}: EnterpriseSidebarNewProps) {
  const pathname = usePathname();
  const { sidebarMode, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useNavigation();
  const collapsed = sidebarMode === "collapsed";

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === href;
      return pathname?.startsWith(href);
    },
    [pathname],
  );

  const favoriteNavItems = nav.filter((item) => favorites.includes(item.href));
  const recentNavItems = recentPages
    .filter((r) => nav.some((n) => n.href === r.href) && !favorites.includes(r.href))
    .slice(0, 5);

  const sidebarContent = (
    <div className="flex flex-col overflow-hidden">
      {/* Logo */}
      <div className={cn(
        "flex shrink-0 items-center border-b border-white/[0.08]",
        collapsed ? "justify-center px-2" : "px-6",
        "h-[72px]",
      )}>
        {collapsed ? (
          <Link href="/dashboard" aria-label="Perionyx" className="flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a84c] shadow-lg shadow-gold-500/20">
              <img src="/logo.svg" alt="" className="h-full w-full object-cover" />
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a84c] shadow-lg shadow-gold-500/20">
              <img src="/logo.svg" alt="" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-white">Perionyx</span>
          </Link>
        )}
      </div>

      {/* Workspace switcher */}
      <div className={cn("shrink-0", collapsed ? "px-2 py-3" : "px-3 py-3")}>
        <WorkspaceSwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
          onSwitch={onSwitchCompany}
          collapsed={collapsed}
        />
      </div>

      {/* Collapse toggle */}
      <div className={cn("shrink-0", collapsed ? "px-2 pb-1" : "px-3 pb-1")}>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex w-full items-center rounded-md text-[11px] font-medium transition-colors",
            collapsed
              ? "justify-center py-2 text-zinc-600 hover:bg-zinc-800/30 hover:text-zinc-400"
              : "gap-2 px-3 py-1.5 text-zinc-600 hover:bg-zinc-800/30 hover:text-zinc-400",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Scrollable nav — h-0 + flex-1 forces height from container, not content */}
      <div className="h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <div className={cn("py-1", collapsed ? "px-2" : "px-3")}>
          {/* Favorites */}
          {favoriteNavItems.length > 0 && (
            <div className="space-y-0.5">
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <Star className="h-3 w-3 text-[#c9a84c]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                    Favorites
                  </span>
                </div>
              )}
              {favoriteNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                  pendingApprovals={pendingApprovals}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={true}
                />
              ))}
              {!collapsed && <div className="my-2 h-px bg-zinc-800/40" />}
            </div>
          )}

          {/* Recent */}
          {recentNavItems.length > 0 && !collapsed && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <History className="h-3 w-3 text-zinc-500" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                  Recent
                </span>
              </div>
              {recentNavItems.map((r) => {
                const item = nav.find((n) => n.href === r.href);
                if (!item) return null;
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    collapsed={false}
                    pendingApprovals={pendingApprovals}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favorites.includes(item.href)}
                  />
                );
              })}
              <div className="my-2 h-px bg-zinc-800/40" />
            </div>
          )}

          {/* Nav sections */}
          {sections.map((section) => (
            <SectionGroup
              key={section.title}
              section={section}
              collapsed={collapsed}
              activeFn={isActive}
              pendingApprovals={pendingApprovals}
              onToggleFavorite={onToggleFavorite}
              favorites={favorites}
            />
          ))}

          {/* Un-grouped nav items */}
          {nav
            .filter((item) => !sections.some((s) => s.items.some((si) => si.href === item.href)))
            .map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
                pendingApprovals={pendingApprovals}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(item.href)}
              />
            ))}
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t border-white/[0.05] px-5 py-4">
          {/* Data mode indicator */}
          <div className="mb-3 flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
              "bg-amber-500/10 text-amber-400 border border-amber-500/20",
            )}>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Demo Data
            </span>
            <span className="text-[9px] text-zinc-700">Seeded · not persisted</span>
          </div>
          <div className="rounded-md border border-gold-500/10 bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Enterprise</p>
            <p className="mt-1 text-[12px] font-medium text-zinc-300">Treasury Operating System</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        aria-label="Main sidebar"
        className={cn(
          "relative hidden h-screen shrink-0 overflow-hidden border-r border-white/[0.06] bg-gradient-to-b from-[#0a0a0a] to-[#070707] md:flex md:flex-col",
          "before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-[#d4af37]/20 before:to-transparent before:z-10 before:content-['']",
        )}
        animate={{ width: collapsed ? 64 : 272 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.aside
            aria-label="Mobile navigation"
            className="fixed left-0 top-0 z-50 h-full w-[280px] overflow-hidden border-r border-white/[0.06] bg-gradient-to-b from-[#0a0a0a] to-[#070707] md:hidden"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
});
