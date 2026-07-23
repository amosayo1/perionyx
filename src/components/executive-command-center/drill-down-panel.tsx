"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, FileText, Receipt, ClipboardList, ScrollText, Users,
  ChevronRight, Clock, CheckCircle, AlertTriangle, Lightbulb, ExternalLink,
} from "lucide-react";

interface Evidence {
  id: string;
  type: "document" | "transaction" | "report" | "audit-log";
  title: string;
  description: string;
  date: string;
  url?: string;
}

interface RelatedEntity {
  id: string;
  type: string;
  name: string;
  relationship: string;
}

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  specialist: string;
  priority: "high" | "medium" | "low";
}

interface DrillDownData {
  domain: string;
  specialist: string;
  entityName: string;
  entityValue: string;
  entityTrend: string;
  evidence: Evidence[];
  relatedEntities: RelatedEntity[];
  auditTrail: AuditEntry[];
  recommendations: Recommendation[];
}

const evidenceTypeIcons: Record<string, typeof FileText> = {
  document: FileText,
  transaction: Receipt,
  report: ClipboardList,
  "audit-log": ScrollText,
};

const evidenceTypeColors: Record<string, string> = {
  document: "bg-blue-500/20 text-blue-400",
  transaction: "bg-emerald-500/20 text-emerald-400",
  report: "bg-purple-500/20 text-purple-400",
  "audit-log": "bg-amber-500/20 text-amber-400",
};

const specialistColors: Record<string, string> = {
  Treasury: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Controller: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Audit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Compliance: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Tax: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  FPandA: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Governance: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const priorityColors: Record<string, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-blue-400",
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-lg ${className}`} />;
}

interface DrillDownPanelProps {
  domain?: string;
  entityId?: string;
}

export function DrillDownPanel({ domain, entityId }: DrillDownPanelProps) {
  const [data, setData] = useState<DrillDownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (domain) params.set("domain", domain);
        if (entityId) params.set("entityId", entityId);
        const res = await fetch(`/api/executive/drill-down?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(getDefaultData(domain ?? "treasury"));
        }
      } catch {
        setData(getDefaultData(domain ?? "treasury"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [domain, entityId]);

  const d = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/executive/kpis" className="p-2 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {loading ? "Loading..." : d?.entityName ?? "KPI Detail"}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {loading ? "" : `Deep dive into ${d?.domain} domain`}
          </p>
        </div>
      </div>

      {/* Domain Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5"
      >
        {loading ? (
          <div className="flex gap-6"><SkeletonBlock className="w-32 h-16" /><SkeletonBlock className="flex-1 h-16" /></div>
        ) : d && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-gold-500">{d.entityValue}</div>
                <div className="text-sm text-white/50 mt-1">{d.entityTrend}</div>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${specialistColors[d.specialist] ?? "bg-white/10 text-white/50 border-white/20"}`}>
              Source: {d.specialist}
            </span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-400" />
            Evidence
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d?.evidence.map((ev) => {
                const Icon = evidenceTypeIcons[ev.type] ?? FileText;
                const color = evidenceTypeColors[ev.type] ?? "bg-white/10 text-white/50";
                return (
                  <div key={ev.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{ev.title}</div>
                      <p className="text-xs text-white/50 mt-0.5">{ev.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/40">{ev.date}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 uppercase">{ev.type}</span>
                      </div>
                    </div>
                    {ev.url && (
                      <a href={ev.url} className="text-white/50 hover:text-gold-500 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Related Entities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-400" />
            Related Entities
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonBlock key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {d?.relatedEntities.map((entity) => (
                <div key={entity.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">{entity.name}</div>
                    <div className="text-xs text-white/50">{entity.relationship}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{entity.type}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Audit Trail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <ScrollText className="w-5 h-5 text-amber-400" />
          Audit Trail
        </h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-12 rounded-lg" />)}</div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-3">
              {d?.auditTrail.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 relative z-10">
                    <Clock className="w-3.5 h-3.5 text-white/50" />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{entry.action}</span>
                      <span className="text-[10px] text-white/50">{entry.timestamp}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">by {entry.actor}</div>
                    <p className="text-xs text-white/40 mt-1">{entry.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-gold-500" />
          Specialist Recommendations
        </h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonBlock key={i} className="h-16 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {d?.recommendations.map((rec) => (
              <div key={rec.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{rec.title}</span>
                  <span className={`text-[10px] font-medium ${priorityColors[rec.priority]}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-white/50">{rec.description}</p>
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full border mt-2 ${specialistColors[rec.specialist] ?? "bg-white/10 text-white/50 border-white/20"}`}>
                  {rec.specialist}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function getDefaultData(domain: string): DrillDownData {
  const defaults: Record<string, DrillDownData> = {
    treasury: {
      domain: "Treasury",
      specialist: "Treasury",
      entityName: "Cash Position",
      entityValue: "$47.2M",
      entityTrend: "+3.2% from last week",
      evidence: [
        { id: "e1", type: "report", title: "Daily Cash Report", description: "Consolidated cash position across 12 bank accounts.", date: "2026-07-19", url: "#" },
        { id: "e2", type: "transaction", title: "Wire Transfer #WT-4892", description: "EUR 2.4M transfer to Deutsche Bank operating account.", date: "2026-07-18" },
        { id: "e3", type: "document", title: "Bank Statement - Chase", description: "July 2026 statement, balance $18.7M.", date: "2026-07-17", url: "#" },
      ],
      relatedEntities: [
        { id: "re1", type: "Account", name: "Chase Operating Account", relationship: "Primary operating account" },
        { id: "re2", type: "Policy", name: "Cash Policy CP-001", relationship: "Minimum balance policy" },
        { id: "re3", type: "Forecast", name: "13-Week Cash Forecast", relationship: "Cash flow projection" },
      ],
      auditTrail: [
        { id: "at1", action: "Cash report generated", actor: "Treasury System", timestamp: "2026-07-19 08:00", details: "Automated daily cash position report generated." },
        { id: "at2", action: "Transfer executed", actor: "J. Morrison", timestamp: "2026-07-18 14:30", details: "EUR 2.4M wire transfer to Deutsche Bank initiated and confirmed." },
        { id: "at3", action: "Forecast updated", actor: "Treasury System", timestamp: "2026-07-18 06:00", details: "13-week forecast refreshed with actuals through July 17." },
      ],
      recommendations: [
        { id: "rr1", title: "Consolidate underutilized accounts", description: "3 accounts have balances below $500K. Merging saves $120K/yr in fees.", specialist: "Treasury", priority: "medium" },
        { id: "rr2", title: "Extend maturity on surplus cash", description: "$8M in operating account could earn 4.2% in 90-day T-bills.", specialist: "Treasury", priority: "low" },
      ],
    },
  };
  return defaults[domain] ?? defaults.treasury;
}
