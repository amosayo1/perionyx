"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Search, ExternalLink, ScrollText, Cable, Globe, ArrowLeftRight, Shield, AlertTriangle, Wallet, BookOpen, Clock, Terminal, Bell, Users } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "next-auth/react";
import { ALL_NAV, NAV_SECTIONS, filterNavByRole } from "@/components/navigation/nav-config";

interface PageItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
  category: string;
}

const SECTION_CATEGORY: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.map((s) => [s.title, s.title]),
);
const HREF_CATEGORY: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items.map((item) => [item.href, s.title])),
);

function buildPages(userRole?: string | null): PageItem[] {
  const filtered = userRole ? filterNavByRole(ALL_NAV, userRole) : ALL_NAV;
  return filtered.map((item) => ({
    id: item.href.replace(/\//g, "-").replace(/^-/, ""),
    label: item.label,
    href: item.href,
    icon: <item.icon className="h-4 w-4" />,
    keywords: item.keywords ? item.keywords.split(" ") : [item.label.toLowerCase()],
    category: HREF_CATEGORY[item.href] ?? "Other",
  }));
}

interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
  category?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  const pages = useMemo(() => buildPages(session?.user?.companyRole), [session?.user?.companyRole]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const ac = new AbortController();
    fetch(`/api/v1/enterprise/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`, {
      signal: ac.signal,
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setSearchResults((data?.items ?? []).map((item: any) => ({
          id: item.id,
          label: item.label,
          subtitle: item.subtitle,
          href: item.href,
          icon: getModuleIcon(item.module),
          category: item.module,
        })));
      })
      .catch(() => {});
    return () => ac.abort();
  }, [debouncedQuery]);

  const pageResults = useMemo(() => {
    if (!query) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => p.label.toLowerCase().includes(q) || p.keywords.some((kw) => kw.includes(q)));
  }, [query, pages]);

  const groupedResults = useMemo(() => {
    const results: { heading: string; items: SearchResult[] }[] = [];
    if (pageResults.length > 0) {
      results.push({
        heading: "Pages & Commands",
        items: pageResults.map((p) => ({ id: p.id, label: p.label, subtitle: p.category, href: p.href, icon: p.icon })),
      });
    }
    if (searchResults.length > 0) {
      results.push({ heading: "Enterprise Search", items: searchResults });
    }
    return results;
  }, [pageResults, searchResults]);

  const flatItems = useMemo(() => groupedResults.flatMap((g) => g.items), [groupedResults]);

  useEffect(() => { setSelectedIndex((prev) => Math.min(prev, flatItems.length - 1)); }, [flatItems.length]);

  const navigateTo = useCallback((href: string) => { setOpen(false); router.push(href); }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && flatItems[selectedIndex]) { e.preventDefault(); navigateTo(flatItems[selectedIndex].href); }
    },
    [flatItems, selectedIndex, navigateTo],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogContent
          className="fixed left-[50%] top-[15%] z-50 w-full max-w-xl translate-x-[-50%] rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out"
          onKeyDown={handleKeyDown}
          aria-describedby={undefined}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, transactions, policies, users..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none" autoFocus />
            <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-600 sm:flex">ESC</kbd>
          </div>

          <div className="max-h-[420px] overflow-y-auto py-2">
            {groupedResults.length === 0 && query && (
              <p className="px-4 py-8 text-center text-sm text-zinc-600">No results for &ldquo;{query}&rdquo;</p>
            )}
            {groupedResults.length === 0 && !query && (
              <div className="px-4 py-6">
                <p className="text-center text-sm text-zinc-600 mb-4">Start typing to search...</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["wallets", "transactions", "approvals", "risk", "policies"].map((s) => (
                    <button key={s} onClick={() => setQuery(s)}
                      className="rounded-full border border-white/[0.06] px-3 py-1 text-[11px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {groupedResults.map((group) => (
              <div key={group.heading}>
                <div className="flex items-center gap-2 px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{group.heading}</span>
                  <div className="h-px flex-1 bg-white/[0.04]" />
                </div>
                {group.items.map((item) => {
                  const globalIdx = flatItems.indexOf(item);
                  return (
                    <button key={`${group.heading}-${item.id}`} onClick={() => navigateTo(item.href)}
                      className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                        globalIdx === selectedIndex ? "bg-gold/10 text-gold" : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                      )}>
                      <span className="shrink-0">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.subtitle && <span className="block truncate text-[11px] text-zinc-600">{item.subtitle}</span>}
                      </div>
                      <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="rounded border border-white/[0.06] px-1 py-0.5">↑↓</kbd><span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="rounded border border-white/[0.06] px-1 py-0.5">↵</kbd><span>Open</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="rounded border border-white/[0.06] px-1 py-0.5">⌘K</kbd><span>Toggle</span>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function getModuleIcon(module: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    Transactions: <ArrowLeftRight className="h-4 w-4" />,
    Policies: <Shield className="h-4 w-4" />,
    Risk: <AlertTriangle className="h-4 w-4" />,
    Wallets: <Wallet className="h-4 w-4" />,
    Treasury: <Globe className="h-4 w-4" />,
    Ledger: <BookOpen className="h-4 w-4" />,
    Calendar: <Clock className="h-4 w-4" />,
    Audit: <ScrollText className="h-4 w-4" />,
    Webhooks: <Cable className="h-4 w-4" />,
    Developer: <Terminal className="h-4 w-4" />,
    Connectors: <Cable className="h-4 w-4" />,
    Notifications: <Bell className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
  };
  return map[module] ?? <Search className="h-4 w-4" />;
}
