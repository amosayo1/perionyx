"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

interface EnterpriseSidebarProps {
  nav: NavItem[];
  pendingApprovals: number;
  isSandbox: boolean;
  favorites: string[];
  recentPages: { href: string; label: string; timestamp: number }[];
  onToggleFavorite: (href: string) => void;
}

function NavLink({ item, active, pendingApprovals, onToggleFavorite }: {
  item: NavItem;
  active: boolean;
  pendingApprovals: number;
  onToggleFavorite: (href: string) => void;
}) {
  const Icon = item.icon;
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
      <span className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-100",
        active ? "bg-gold-500/10 text-[#c9a84c]" : "text-zinc-500 group-hover:text-zinc-300",
      )}>
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
        onClick={(e) => { e.preventDefault(); onToggleFavorite(item.href); }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#c9a84c]"
        aria-label={`Toggle ${item.label} as favorite`}
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 1l1.545 3.13L11 4.635l-2.5 2.435.59 3.44L6 8.63 2.91 10.51l.59-3.44L1 4.635l3.455-.505L6 1z" />
        </svg>
      </button>
    </Link>
  );
}

function FavoriteItem({ item, active, onToggleFavorite }: {
  item: NavItem;
  active: boolean;
  onToggleFavorite: (href: string) => void;
}) {
  const Icon = item.icon;
  return (
    <div className="group relative flex items-center">
      <Link
        href={item.href}
        className={cn(
          "flex flex-1 items-center gap-2 rounded-md px-3 py-1.5 text-[12px] transition-colors duration-100",
          active ? "bg-zinc-800/60 text-white" : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200",
        )}
      >
        <Icon className="h-3 w-3 shrink-0 text-[#c9a84c]" />
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        onClick={() => onToggleFavorite(item.href)}
        className="absolute right-1 flex h-4 w-4 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        aria-label="Remove from favorites"
      >
        <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M6 1l1.545 3.13L11 4.635l-2.5 2.435.59 3.44L6 8.63 2.91 10.51l.59-3.44L1 4.635l3.455-.505L6 1z" />
        </svg>
      </button>
    </div>
  );
}

export const EnterpriseSidebar = memo(function EnterpriseSidebar({
  nav,
  pendingApprovals,
  favorites,
  onToggleFavorite,
}: EnterpriseSidebarProps) {
  const pathname = usePathname();

  const isActive = useCallback((href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname?.startsWith(href);
  }, [pathname]);

  const favoriteNavItems = nav.filter((item) => favorites.includes(item.href));

  return (
    <nav className="flex flex-col gap-4 px-3">
      {favoriteNavItems.length > 0 && (
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">Favorites</p>
          {favoriteNavItems.map((item) => (
            <FavoriteItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
          <div className="my-2 h-px bg-zinc-800/40" />
        </div>
      )}
      {nav.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActive(item.href)}
          pendingApprovals={pendingApprovals}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </nav>
  );
});
