"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Search, Filter, ChevronRight, Clock, User, Tag,
  CheckCircle, XCircle, AlertTriangle, FileText,
} from "lucide-react";

interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "draft" | "under_review" | "archived";
  version: string;
  owner: string;
  effectiveDate: string;
  reviewDate: string;
  applicableFrameworks: string[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  draft: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  archived: "bg-white/10 text-white/40 border-white/20",
};

const categoryColors: Record<string, string> = {
  data_protection: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  financial: "bg-gold-500/20 text-gold-500 border-gold-500/30",
  operational: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  security: "bg-red-500/20 text-red-400 border-red-500/30",
  hr: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  general: "bg-white/10 text-white/40 border-white/20",
};

export function PolicyCenter() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/policies");
        if (res.ok) {
          const data = await res.json();
          setPolicies(data.policies ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = policies.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Policy Center</h1>
          <p className="text-sm text-white/60 mt-1">Manage compliance policies and framework mappings</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Policy name" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Category</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="data_protection">Data Protection</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="security">Security</option>
                <option value="hr">HR</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Policy description" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Owner</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Policy owner" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Version</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="1.0" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Effective Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Review Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
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
            placeholder="Search policies..."
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
          <div className="text-center py-12 text-white/40">No policies found</div>
        ) : (
          filtered.map((policy, i) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedPolicy(selectedPolicy?.id === policy.id ? null : policy)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{policy.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">{policy.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[policy.category] ?? categoryColors.general}`}>
                    {policy.category.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[policy.status]}`}>
                    {policy.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-white/40">v{policy.version}</span>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {policy.owner}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Effective: {policy.effectiveDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Review: {policy.reviewDate}</span>
                {policy.applicableFrameworks?.length > 0 && (
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {policy.applicableFrameworks.join(", ")}</span>
                )}
              </div>
              {selectedPolicy?.id === policy.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-white/40 text-xs">Version History</div>
                      <div className="text-white mt-1">v{policy.version} (current)</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Frameworks</div>
                      <div className="text-white mt-1">{policy.applicableFrameworks?.join(", ") || "None"}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Last Review</div>
                      <div className="text-white mt-1">{policy.reviewDate}</div>
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
