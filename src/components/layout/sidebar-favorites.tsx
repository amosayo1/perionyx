"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nav-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback((href: string) => {
    setFavorites((prev) => {
      const next = prev.includes(href) ? prev.filter((f) => f !== href) : [...prev, href];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isFavorite = useCallback((href: string) => favorites.includes(href), [favorites]);

  return { favorites, toggle, isFavorite };
}

interface SidebarFavoritesProps {
  favorites: string[];
  navItems: { href: string; label: string; icon: any }[];
  onToggle: (href: string) => void;
}

export function SidebarFavorites({ favorites, navItems, onToggle }: SidebarFavoritesProps) {
  const pathname = usePathname();
  const favItems = navItems.filter((item) => favorites.includes(item.href));

  if (favItems.length === 0) return null;

  return (
    <div className="space-y-1 px-4 py-3">
      <div className="flex items-center gap-1.5 px-4 py-1.5">
        <Star className="h-3 w-3 text-gold" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Favorites</span>
      </div>
      {favItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
        return (
          <div key={href} className="group flex items-center">
            <Link
              href={href}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200",
              )}
            >
              <span className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
                active ? "bg-gold/10 text-gold" : "text-zinc-500",
              )}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </Link>
            <button
              onClick={() => onToggle(href)}
              className="mr-2 rounded p-1 text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-300 transition-all"
              aria-label={`Remove ${label} from favorites`}
            >
              <StarOff className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
