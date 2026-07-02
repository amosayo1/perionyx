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
import {
  LayoutDashboard,
  ArrowLeftRight,
  CheckSquare,
  BookOpen,
  Shield,
  Wallet,
  Users,
  Settings,
  Search,
  Clock,
  FileText,
  ExternalLink,
  Key,
  Bell,
  Monitor,
  AlertTriangle,
  BarChart3,
  Activity,
  GitBranch,
  Terminal,
  MessageSquareText,
  Sparkles,
  RefreshCw,
  Cable,
  Globe,
  ScrollText,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface PageItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
  category: string;
}

const pages: PageItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, keywords: ["home", "overview", "main"], category: "Core" },
  { id: "copilot", label: "PERIONYX Intelligence", href: "/copilot", icon: <MessageSquareText className="h-4 w-4" />, keywords: ["copilot", "ai", "assistant", "intelligence"], category: "Core" },
  { id: "wallets", label: "Wallets", href: "/wallets", icon: <Wallet className="h-4 w-4" />, keywords: ["accounts", "balances", "funds"], category: "Treasury" },
  { id: "accounts", label: "Accounts", href: "/accounts", icon: <Globe className="h-4 w-4" />, keywords: ["treasury", "bank"], category: "Treasury" },
  { id: "ledger", label: "Ledger", href: "/ledger", icon: <BookOpen className="h-4 w-4" />, keywords: ["entries", "postings", "journal"], category: "Treasury" },
  { id: "reconciliation", label: "Reconciliation", href: "/reconciliation", icon: <RefreshCw className="h-4 w-4" />, keywords: ["match", "settle", "exception"], category: "Treasury" },
  { id: "transactions", label: "Transactions", href: "/transactions", icon: <ArrowLeftRight className="h-4 w-4" />, keywords: ["payments", "transfers", "tx"], category: "Payments" },
  { id: "approvals", label: "Approvals", href: "/approvals", icon: <CheckSquare className="h-4 w-4" />, keywords: ["pending", "approve", "reject"], category: "Payments" },
  { id: "risk", label: "Risk Alerts", href: "/risk", icon: <Shield className="h-4 w-4" />, keywords: ["security", "threats", "alerts"], category: "Risk" },
  { id: "incidents", label: "Incidents", href: "/operations/incidents", icon: <AlertTriangle className="h-4 w-4" />, keywords: ["incident", "sla", "breach"], category: "Risk" },
  { id: "risk-intelligence", label: "Risk Intelligence", href: "/risk-intelligence", icon: <Shield className="h-4 w-4" />, keywords: ["heatmap", "vendor risk"], category: "Risk" },
  { id: "audit", label: "Audit Log", href: "/audit-logs", icon: <ScrollText className="h-4 w-4" />, keywords: ["history", "trail"], category: "Risk" },
  { id: "operations", label: "Operations Center", href: "/operations", icon: <Monitor className="h-4 w-4" />, keywords: ["ops", "control"], category: "Operations" },
  { id: "platform", label: "Platform Health", href: "/platform", icon: <Activity className="h-4 w-4" />, keywords: ["services", "queues", "sla"], category: "Operations" },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: <Clock className="h-4 w-4" />, keywords: ["events", "schedule"], category: "Operations" },
  { id: "notifications", label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" />, keywords: ["alerts", "bell"], category: "Operations" },
  { id: "connectors", label: "Connectors", href: "/connectors", icon: <Cable className="h-4 w-4" />, keywords: ["integrations", "sync"], category: "Operations" },
  { id: "policies", label: "Policies", href: "/policies", icon: <Shield className="h-4 w-4" />, keywords: ["rules", "controls"], category: "Governance" },
  { id: "users", label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" />, keywords: ["members", "team"], category: "Governance" },
  { id: "insights", label: "Executive Insights", href: "/insights", icon: <BarChart3 className="h-4 w-4" />, keywords: ["executive", "kpi"], category: "Analytics" },
  { id: "reports", label: "Reports", href: "/reports", icon: <FileText className="h-4 w-4" />, keywords: ["export", "templates"], category: "Analytics" },
  { id: "developer", label: "Developer Portal", href: "/developer", icon: <Terminal className="h-4 w-4" />, keywords: ["api", "sdk"], category: "Developer" },
  { id: "api-keys", label: "API Keys", href: "/settings/api-keys", icon: <Key className="h-4 w-4" />, keywords: ["api", "tokens"], category: "Developer" },
  { id: "integrations", label: "Integration Hub", href: "/integrations", icon: <GitBranch className="h-4 w-4" />, keywords: ["banking", "erp"], category: "Developer" },
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, keywords: ["preferences", "config"], category: "Settings" },
  { id: "investigation", label: "Investigation Workspace", href: "/investigation", icon: <Search className="h-4 w-4" />, keywords: ["trace", "lifecycle", "forensics", "investigate", "timeline"], category: "Intelligence" },
  { id: "executive-briefing", label: "Executive Briefing", href: "/copilot", icon: <Sparkles className="h-4 w-4" />, keywords: ["briefing", "board"], category: "Intelligence" },
  { id: "treasury-summary", label: "Treasury Summary", href: "/copilot", icon: <BarChart3 className="h-4 w-4" />, keywords: ["treasury", "daily"], category: "Intelligence" },
  { id: "risk-review", label: "Risk Review", href: "/copilot", icon: <Shield className="h-4 w-4" />, keywords: ["risk", "vendor"], category: "Intelligence" },
];

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

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
  }, [query]);

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
                        globalIdx === selectedIndex ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
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
