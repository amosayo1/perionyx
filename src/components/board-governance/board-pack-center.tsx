"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, FileText, CheckCircle, Clock, Send, Eye, ChevronRight,
  Shield, BarChart3, Scale, Briefcase, AlertTriangle, Target,
} from "lucide-react";

interface BoardPack {
  id: string;
  title: string;
  type: "full" | "executive" | "financial" | "committee";
  status: "draft" | "review" | "approved" | "distributed";
  meetingDate: string;
  sectionCount: number;
  lastUpdated: string;
}

interface PackSection {
  id: string;
  title: string;
  type: "executive" | "financial" | "treasury" | "audit" | "compliance" | "tax" | "strategic";
  status: "ready" | "pending" | "review";
  pageCount: number;
}

interface PackDetail {
  pack: BoardPack;
  sections: PackSection[];
}

export function BoardPackCenter() {
  const [packs, setPacks] = useState<BoardPack[]>([]);
  const [selected, setSelected] = useState<PackDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/packs").then((r) => (r.ok ? r.json() : null));
        if (res) setPacks(res.packs ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultPacks: BoardPack[] = [
    { id: "1", title: "Q2 2026 Board Pack", type: "full", status: "approved", meetingDate: "2026-07-25", sectionCount: 7, lastUpdated: "2026-07-18" },
    { id: "2", title: "Audit Committee Pack - July", type: "committee", status: "review", meetingDate: "2026-07-22", sectionCount: 4, lastUpdated: "2026-07-17" },
    { id: "3", title: "Risk Committee Pack - July", type: "committee", status: "draft", meetingDate: "2026-07-28", sectionCount: 3, lastUpdated: "2026-07-16" },
    { id: "4", title: "Q1 2026 Board Pack", type: "full", status: "distributed", meetingDate: "2026-04-20", sectionCount: 7, lastUpdated: "2026-04-15" },
  ];

  const defaultSections: PackSection[] = [
    { id: "1", title: "Executive Summary", type: "executive", status: "ready", pageCount: 3 },
    { id: "2", title: "Financial Statements", type: "financial", status: "ready", pageCount: 12 },
    { id: "3", title: "Treasury Report", type: "treasury", status: "ready", pageCount: 5 },
    { id: "4", title: "Audit Report", type: "audit", status: "ready", pageCount: 8 },
    { id: "5", title: "Compliance Update", type: "compliance", status: "ready", pageCount: 4 },
    { id: "6", title: "Tax Overview", type: "tax", status: "pending", pageCount: 3 },
    { id: "7", title: "Strategic Initiatives", type: "strategic", status: "review", pageCount: 6 },
  ];

  const displayPacks = packs.length > 0 ? packs : defaultPacks;

  const sectionIcons: Record<string, typeof FileText> = {
    executive: FileText, financial: BarChart3, treasury: Briefcase,
    audit: Shield, compliance: AlertTriangle, tax: FileText, strategic: Target,
  };

  const statusColors: Record<string, string> = {
    draft: "bg-white/10 text-white/60 border-white/10",
    review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    distributed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ready: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  const handleAction = async (packId: string, action: "approve" | "distribute") => {
    try {
      await fetch(`/api/board/packs/${packId}/${action}`, { method: "POST" });
      setPacks((prev) => prev.map((p) => p.id === packId ? { ...p, status: action === "approve" ? "approved" : "distributed" } : p));
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Board Pack Center</h1>
          <p className="text-sm text-white/60 mt-1">Assemble, review, and distribute board meeting packs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {displayPacks.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(selected?.pack.id === p.id ? null : { pack: p, sections: defaultSections })}
              className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors ${selected?.pack.id === p.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:bg-white/10"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>{p.status.toUpperCase()}</span>
                <span className="text-[10px] text-white/40">{p.type.toUpperCase()}</span>
              </div>
              <div className="text-sm text-white font-medium">{p.title}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.meetingDate}</span>
                <span className="flex items-center gap-1"><Package className="w-3 h-3" />{p.sectionCount} sections</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">{selected.pack.title}</h2>
                  <div className="flex items-center gap-2">
                    {selected.pack.status === "review" && (
                      <button onClick={() => handleAction(selected.pack.id, "approve")} className="flex items-center gap-1 bg-emerald-500 text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-400 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {selected.pack.status === "approved" && (
                      <button onClick={() => handleAction(selected.pack.id, "distribute")} className="flex items-center gap-1 bg-gold-500 text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gold-400 transition-colors">
                        <Send className="w-3.5 h-3.5" /> Distribute
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-xs text-white/50 block">Meeting Date</span><span className="text-sm text-white">{selected.pack.meetingDate}</span></div>
                  <div><span className="text-xs text-white/50 block">Last Updated</span><span className="text-sm text-white">{selected.pack.lastUpdated}</span></div>
                  <div><span className="text-xs text-white/50 block">Sections</span><span className="text-sm text-white">{selected.pack.sectionCount}</span></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Pack Sections</h3>
                <div className="space-y-3">
                  {selected.sections.map((s, i) => {
                    const Icon = sectionIcons[s.type] || FileText;
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><Icon className="w-5 h-5 text-gold-500" /></div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{s.title}</div>
                          <div className="text-xs text-white/50">{s.pageCount} pages</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[s.status]}`}>{s.status.toUpperCase()}</span>
                        <button className="text-white/50 hover:text-white transition-colors" aria-label="View"><Eye className="w-4 h-4" /></button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-white/40 mb-4" />
              <p className="text-white/50">Select a board pack to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
