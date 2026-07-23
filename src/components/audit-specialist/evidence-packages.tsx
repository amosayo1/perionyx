"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, X, Search, FileText, CheckCircle, Clock, Archive,
  Eye, ChevronRight, User, Calendar,
} from "lucide-react";

interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  addedDate: string;
  addedBy: string;
  status: "verified" | "pending" | "rejected";
}

interface EvidencePackage {
  id: string;
  name: string;
  type: "internal" | "external" | "regulatory" | "board" | "ad-hoc";
  status: "draft" | "assembled" | "approved" | "submitted" | "archived";
  evidenceCount: number;
  assembledBy: string;
  createdDate: string;
  items: EvidenceItem[];
}

const typeColors: Record<string, string> = {
  internal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  external: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  regulatory: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  board: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "ad-hoc": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  assembled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  submitted: "bg-gold-500/20 text-gold-500 border-gold-500/30",
  archived: "bg-white/5 text-white/40 border-white/10",
};

export function EvidencePackages() {
  const [packages, setPackages] = useState<EvidencePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<EvidencePackage | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: "", type: "internal" as EvidencePackage["type"] });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit/evidence-packages");
        if (res.ok) {
          const data = await res.json();
          setPackages(data.packages ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      p.assembledBy.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/audit/evidence-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPkg),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewPkg({ name: "", type: "internal" });
      }
    } catch {
      // silently fail
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/audit/evidence-packages/${id}/approve`, { method: "POST" });
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p)));
    } catch {
      // silently fail
    }
  };

  const handleAssemble = async (id: string) => {
    try {
      await fetch(`/api/audit/evidence-packages/${id}/assemble`, { method: "POST" });
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "assembled" as const } : p)));
    } catch {
      // silently fail
    }
  };

  const itemStatusColors: Record<string, string> = {
    verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Evidence Packages</h1>
          <p className="text-sm text-white/60 mt-1">Organize and manage audit evidence documentation</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Package
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <div className="text-sm text-white/40">{filtered.length} packages</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-2">
          {filtered.length === 0 && !loading ? (
            <div className="text-sm text-white/40 py-8 text-center">No evidence packages found</div>
          ) : (
            filtered.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPkg(pkg)}
                className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-colors hover:bg-white/10 ${
                  selectedPkg?.id === pkg.id ? "border-gold-500/50" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Package className="w-5 h-5 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">{pkg.name}</div>
                      <div className="text-xs text-white/50 mt-0.5">{pkg.evidenceCount} items &middot; {pkg.assembledBy} &middot; {pkg.createdDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[pkg.type]}`}>{pkg.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[pkg.status]}`}>{pkg.status}</span>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-4">
          {selectedPkg ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedPkg.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selectedPkg.status]}`}>{selectedPkg.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/50">Type:</span> <span className="text-white ml-1">{selectedPkg.type}</span></div>
                <div><span className="text-white/50">Assembled:</span> <span className="text-white ml-1">{selectedPkg.assembledBy}</span></div>
                <div><span className="text-white/50">Created:</span> <span className="text-white ml-1">{selectedPkg.createdDate}</span></div>
                <div><span className="text-white/50">Items:</span> <span className="text-white ml-1">{selectedPkg.evidenceCount}</span></div>
              </div>
              <div className="flex gap-2">
                {selectedPkg.status === "draft" && (
                  <button onClick={() => handleAssemble(selectedPkg.id)} className="flex-1 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">Assemble</button>
                )}
                {selectedPkg.status === "assembled" && (
                  <button onClick={() => handleApprove(selectedPkg.id)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">Approve</button>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Evidence Items</h4>
                <div className="space-y-2">
                  {selectedPkg.items.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white">{item.title}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${itemStatusColors[item.status]}`}>{item.status}</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{item.type} &middot; {item.addedBy} &middot; {item.addedDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-sm text-white/40">
              Select a package to view details
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">New Evidence Package</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input value={newPkg.name} onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} placeholder="Package name" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newPkg.type} onChange={(e) => setNewPkg({ ...newPkg, type: e.target.value as EvidencePackage["type"] })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="regulatory">Regulatory</option>
                <option value="board">Board</option>
                <option value="ad-hoc">Ad-hoc</option>
              </select>
              <button onClick={handleCreate} className="w-full py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Create Package</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
