"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Plus, Search, Filter, ChevronRight, Clock, Globe, ExternalLink,
  AlertTriangle, CheckCircle, FileText, Tag,
} from "lucide-react";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  type: "new_regulation" | "amendment" | "guidance" | "enforcement" | "repeal";
  source: string;
  jurisdiction: string;
  framework: string;
  effectiveDate: string;
  assessmentStatus: "pending" | "under_review" | "impact_assessed" | "implemented" | "not_applicable";
  impactLevel: "high" | "medium" | "low";
}

const typeColors: Record<string, string> = {
  new_regulation: "bg-red-500/20 text-red-400 border-red-500/30",
  amendment: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  guidance: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  enforcement: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  repeal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const assessmentColors: Record<string, string> = {
  pending: "bg-white/10 text-white/40 border-white/20",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  impact_assessed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  implemented: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  not_applicable: "bg-white/10 text-white/40 border-white/20",
};

const impactColors: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-emerald-400",
};

export function RegulatoryIntelligence() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/regulatory-intelligence");
        if (res.ok) {
          const data = await res.json();
          setUpdates(data.updates ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = updates.filter((u) =>
    u.title.toLowerCase().includes(search.toLowerCase()) ||
    u.source.toLowerCase().includes(search.toLowerCase()) ||
    u.jurisdiction.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Regulatory Intelligence</h1>
          <p className="text-sm text-white/60 mt-1">Monitor regulatory changes and assess impact</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Add Regulatory Update</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Title</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Update title" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="new_regulation">New Regulation</option>
                <option value="amendment">Amendment</option>
                <option value="guidance">Guidance</option>
                <option value="enforcement">Enforcement</option>
                <option value="repeal">Repeal</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Source</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Regulatory source" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Jurisdiction</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Jurisdiction" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Framework</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Applicable framework" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Effective Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Impact Level</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Description" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400">Save</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm hover:bg-white/10">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30"
            placeholder="Search regulatory updates..."
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-20" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">No regulatory updates found</div>
        ) : (
          filtered.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedUpdate(selectedUpdate?.id === update.id ? null : update)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{update.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{update.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[update.type]}`}>
                    {update.type.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${assessmentColors[update.assessmentStatus]}`}>
                    {update.assessmentStatus.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className={`text-xs font-medium ${impactColors[update.impactLevel]}`}>
                    {update.impactLevel.toUpperCase()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {update.jurisdiction}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {update.source}</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {update.framework}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Effective: {update.effectiveDate}</span>
              </div>
              {selectedUpdate?.id === update.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-white/40 text-xs">Full Description</div>
                      <div className="text-white text-xs mt-1">{update.description}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Assessment Status</div>
                      <div className="text-white text-xs mt-1">{update.assessmentStatus.replace(/_/g, " ")}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Source</div>
                      <div className="text-white text-xs mt-1 flex items-center gap-1">{update.source} <ExternalLink className="w-3 h-3" /></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
