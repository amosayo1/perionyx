"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet, Plus, Lock, Unlock, ChevronRight, Search, Filter, DollarSign,
  TrendingUp, TrendingDown, BarChart3, FileText, CheckCircle, Clock,
} from "lucide-react";
import { EnterpriseForm, EnterpriseField, EnterpriseSection } from "@/components/enterprise/forms";

interface Budget {
  id: string;
  name: string;
  type: "operating" | "capital" | "project" | "department";
  status: "draft" | "active" | "locked" | "archived";
  fiscalYear: string;
  totalAmount: number;
  utilizedAmount: number;
  locked: boolean;
  lastUpdated: string;
}

interface BudgetLineItem {
  id: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface CreateBudgetForm {
  name: string;
  type: string;
  fiscalYear: string;
  totalAmount: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  locked: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  archived: "bg-white/5 text-white/40 border-white/10",
};

const typeColors: Record<string, string> = {
  operating: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  capital: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  project: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  department: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export function BudgetWorkspace() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selected, setSelected] = useState<Budget | null>(null);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateBudgetForm>({ name: "", type: "operating", fiscalYear: "2026", totalAmount: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/budgets");
        if (res.ok) {
          const data = await res.json();
          setBudgets(data.budgets ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const id = selected?.id;
    if (!id) return;
    async function loadLines() {
      try {
        const res = await fetch(`/api/fpa/budgets/${id}/line-items`);
        if (res.ok) {
          const data = await res.json();
          setLineItems(data.lineItems ?? []);
        }
      } catch { /* defaults */ }
    }
    loadLines();
  }, [selected]);

  const filtered = budgets.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) => `$${(n / 1000000).toFixed(2)}M`;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalAmount: parseFloat(form.totalAmount) }),
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets((prev) => [...prev, data.budget]);
        setShowCreate(false);
        setForm({ name: "", type: "operating", fiscalYear: "2026", totalAmount: "" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Budget Center</h1>
          <p className="text-sm text-white/60 mt-1">Create, manage and track organizational budgets</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search budgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-sm text-white/40 py-8 text-center">No budgets found</div>
          ) : (
            filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(b)}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === b.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{b.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[b.type]}`}>{b.type.toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>{b.status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-2">{b.fiscalYear} &middot; {formatCurrency(b.totalAmount)}</div>
                  </div>
                  {b.locked ? <Lock className="w-4 h-4 text-amber-400 shrink-0" /> : <Unlock className="w-4 h-4 text-white/50 shrink-0" />}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                    <p className="text-xs text-white/50 mt-1">{selected.fiscalYear} &middot; {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)} Budget</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selected.status]}`}>{selected.status.toUpperCase()}</span>
                    {selected.locked && <Lock className="w-4 h-4 text-amber-400" />}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-white/50">Total Budget</div>
                    <div className="text-xl font-bold text-white mt-1">{formatCurrency(selected.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Utilized</div>
                    <div className="text-xl font-bold text-gold-500 mt-1">{formatCurrency(selected.utilizedAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Utilization</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{((selected.utilizedAmount / selected.totalAmount) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all"
                    style={{ width: `${Math.min((selected.utilizedAmount / selected.totalAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Line Items</h3>
                {lineItems.length === 0 ? (
                  <div className="text-sm text-white/40 py-4 text-center">No line items</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-xs text-white/50 font-medium py-2">Category</th>
                          <th className="text-right text-xs text-white/50 font-medium py-2">Budgeted</th>
                          <th className="text-right text-xs text-white/50 font-medium py-2">Actual</th>
                          <th className="text-right text-xs text-white/50 font-medium py-2">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((li) => (
                          <tr key={li.id} className="border-b border-white/5">
                            <td className="py-2 text-white">{li.category}</td>
                            <td className="py-2 text-right text-white/70">{formatCurrency(li.budgeted)}</td>
                            <td className="py-2 text-right text-white/70">{formatCurrency(li.actual)}</td>
                            <td className={`py-2 text-right font-medium ${li.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {li.variance >= 0 ? "+" : ""}{li.variancePercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Wallet className="w-12 h-12 text-white/40 mb-3" />
              <div className="text-sm text-white/40">Select a budget to view details</div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="button" tabIndex={0} onClick={() => setShowCreate(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCreate(false); } }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <EnterpriseForm
              onSubmit={handleCreate}
              autoSave
              submitLabel="Create"
              cancelLabel="Cancel"
              onCancel={() => setShowCreate(false)}
              validate={() => {
                const errors: { field: string; message: string }[] = [];
                if (!form.name.trim()) errors.push({ field: "budget-name", message: "Budget name is required" });
                if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) errors.push({ field: "budget-amount", message: "Total amount must be greater than zero" });
                return errors;
              }}
            >
              <EnterpriseSection config={{ id: "budget-info", title: "Budget Details", description: "Core budget configuration" }}>
                <EnterpriseField label="Budget Name" htmlFor="budget-name" required>
                  <input
                    id="budget-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="budget-name"
                  />
                </EnterpriseField>
                <EnterpriseField label="Type" htmlFor="budget-type">
                  <select
                    id="budget-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="budget-type"
                  >
                    <option value="operating">Operating</option>
                    <option value="capital">Capital</option>
                    <option value="project">Project</option>
                    <option value="department">Department</option>
                  </select>
                </EnterpriseField>
                <EnterpriseField label="Fiscal Year" htmlFor="budget-fiscal-year">
                  <input
                    id="budget-fiscal-year"
                    type="text"
                    value={form.fiscalYear}
                    onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="budget-fiscal-year"
                    placeholder="e.g. 2026"
                  />
                </EnterpriseField>
                <EnterpriseField label="Total Amount" htmlFor="budget-amount" required>
                  <input
                    id="budget-amount"
                    type="number"
                    value={form.totalAmount}
                    onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="budget-amount"
                    placeholder="0.00"
                  />
                </EnterpriseField>
              </EnterpriseSection>
            </EnterpriseForm>
          </motion.div>
        </div>
      )}
    </div>
  );
}
