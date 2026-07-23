"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/components/enterprise/motion/tokens";
import { Search, CheckCircle2 } from "lucide-react";

interface ConnectorCard {
  provider: string;
  name: string;
  category: string;
  authTypes: string[];
  capabilities: string[];
  modules: string[];
  status: string;
}

interface MarketplaceProps {
  connectors: ConnectorCard[];
  onSelect: (c: ConnectorCard) => void;
  installedIds: string[];
}

const CATEGORY_LABELS: Record<string, string> = { erp: "ERP Systems", banking: "Banking & Finance", payment: "Payments", crm: "CRM", hr: "Human Resources", payroll: "Payroll", file: "File Transfer", messaging: "Messaging", custom: "Custom" };

export function ConnectorMarketplace({ connectors, onSelect, installedIds }: MarketplaceProps) {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return connectors;
    const s = search.toLowerCase();
    return connectors.filter(c => c.name.toLowerCase().includes(s) || c.provider.toLowerCase().includes(s) || c.category.includes(s));
  }, [connectors, search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const c of filtered) {
      const cat = c.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text" placeholder="Search connectors..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/50 focus:outline-none"
        />
      </div>
      {Object.entries(grouped).map(([category, items]) => (
        <motion.div key={category} variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{CATEGORY_LABELS[category] ?? category}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(c => (
              <motion.button
                key={c.provider} variants={fadeInUp}
                onClick={() => { setSelectedProvider(c.provider); onSelect(c); }}
                className={cn(
                  "relative rounded-xl border p-4 text-left transition-all",
                  selectedProvider === c.provider
                    ? "border-amber-400/50 bg-amber-400/5"
                    : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900",
                )}
              >
                {installedIds.includes(c.provider) && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                )}
                <h4 className="font-medium text-white">{c.name}</h4>
                <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{c.category}</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.authTypes.map(a => <span key={a} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{a}</span>)}
                </div>
                <p className="mt-2 text-xs text-zinc-500">{c.modules.slice(0, 3).join(", ")}{c.modules.length > 3 ? "..." : ""}</p>
                {c.status !== "available" && (
                  <span className="mt-2 inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-400">{c.status}</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No connectors match your search</p>}
    </div>
  );
}
