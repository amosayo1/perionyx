"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ListOrdered, Plus, X, GripVertical, Clock, Users, Scale, FileText,
  ChevronUp, ChevronDown, CheckCircle,
} from "lucide-react";

interface AgendaItem {
  id: string;
  order: number;
  title: string;
  category: "procedural" | "presentation" | "discussion" | "vote" | "review" | "report";
  presenter: string;
  duration: string;
  requiresVote: boolean;
  notes: string;
}

export function AgendaBuilder() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", category: "presentation" as AgendaItem["category"], presenter: "", duration: "15 min", requiresVote: false, notes: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/agenda").then((r) => (r.ok ? r.json() : null));
        if (res) {
          setItems(res.items ?? []);
          setMeetingTitle(res.meetingTitle ?? "");
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultItems: AgendaItem[] = [
    { id: "1", order: 1, title: "Call to Order & Quorum Verification", category: "procedural", presenter: "Chairperson", duration: "5 min", requiresVote: false, notes: "" },
    { id: "2", order: 2, title: "Approval of Previous Minutes", category: "procedural", presenter: "Secretary", duration: "10 min", requiresVote: true, notes: "Minutes from June 2026 meeting" },
    { id: "3", order: 3, title: "CEO Strategic Update", category: "presentation", presenter: "CEO", duration: "25 min", requiresVote: false, notes: "FY26 strategy review and market positioning" },
    { id: "4", order: 4, title: "FY26 Budget Presentation & Approval", category: "vote", presenter: "CFO", duration: "30 min", requiresVote: true, notes: "Board approval required" },
    { id: "5", order: 5, title: "Audit Findings Review", category: "review", presenter: "Audit Committee Chair", duration: "20 min", requiresVote: false, notes: "Internal audit Q2 findings" },
    { id: "6", order: 6, title: "Risk Framework Update", category: "report", presenter: "CRO", duration: "15 min", requiresVote: false, notes: "" },
    { id: "7", order: 7, title: "Compensation Committee Report", category: "report", presenter: "Compensation Chair", duration: "15 min", requiresVote: true, notes: "Executive compensation review" },
    { id: "8", order: 8, title: "Any Other Business", category: "procedural", presenter: "Chairperson", duration: "10 min", requiresVote: false, notes: "" },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  const moveItem = (id: string, direction: "up" | "down") => {
    const idx = displayItems.findIndex((i) => i.id === id);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === displayItems.length - 1) return;
    const newItems = [...displayItems];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    newItems.forEach((item, i) => { item.order = i + 1; });
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addItem = () => {
    const item: AgendaItem = {
      id: `new-${Date.now()}`,
      order: displayItems.length + 1,
      ...newItem,
    };
    setItems((prev) => [...prev, item]);
    setShowAdd(false);
    setNewItem({ title: "", category: "presentation", presenter: "", duration: "15 min", requiresVote: false, notes: "" });
  };

  const finalizeAgenda = async () => {
    try {
      await fetch("/api/board/agenda/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: displayItems }),
      });
    } catch {
      // handle error
    }
  };

  const totalMinutes = displayItems.reduce((sum, item) => sum + parseInt(item.duration) || 0, 0);

  const categoryColors: Record<string, string> = {
    procedural: "bg-white/10 text-white/60 border-white/10",
    presentation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    discussion: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    vote: "bg-gold-500/20 text-gold-500 border-gold-500/30",
    review: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    report: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Agenda Builder</h1>
          <p className="text-sm text-white/60 mt-1">Build and manage board meeting agendas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/50">{displayItems.length} items &middot; {totalMinutes} min total</div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
          <button onClick={finalizeAgenda} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
            <CheckCircle className="w-4 h-4" /> Finalize Agenda
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <label className="text-xs text-white/50 block mb-1">Meeting Title</label>
        <input
          value={meetingTitle || "Q2 2026 Board Meeting"}
          onChange={(e) => setMeetingTitle(e.target.value)}
          aria-label="Meeting title"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
        />
      </div>

      <div className="space-y-2">
        {displayItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => moveItem(item.id, "up")} aria-label="Move up" className="text-white/50 hover:text-white transition-colors"><ChevronUp className="w-4 h-4" /></button>
              <GripVertical className="w-4 h-4 text-white/40" />
              <button onClick={() => moveItem(item.id, "down")} aria-label="Move down" className="text-white/50 hover:text-white transition-colors"><ChevronDown className="w-4 h-4" /></button>
            </div>

            <span className="text-lg font-bold text-gold-500 w-8 text-center">{item.order}</span>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white font-medium">{item.title}</span>
                {item.requiresVote && <Scale className="w-3.5 h-3.5 text-gold-500" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.presenter}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
              </div>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
              {item.category.toUpperCase()}
            </span>

            <button onClick={() => removeItem(item.id)} aria-label="Close" className="text-white/50 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Agenda Item</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Title</label>
                <input value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} aria-label="Agenda item title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Category</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as AgendaItem["category"] })} aria-label="Agenda item category" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500">
                    <option value="procedural">Procedural</option>
                    <option value="presentation">Presentation</option>
                    <option value="discussion">Discussion</option>
                    <option value="vote">Vote</option>
                    <option value="review">Review</option>
                    <option value="report">Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Duration</label>
                  <input value={newItem.duration} onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })} aria-label="Agenda item duration" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Presenter</label>
                <input value={newItem.presenter} onChange={(e) => setNewItem({ ...newItem, presenter: e.target.value })} aria-label="Agenda item presenter" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newItem.requiresVote} onChange={(e) => setNewItem({ ...newItem, requiresVote: e.target.checked })} aria-label="Requires vote" className="rounded" />
                <label className="text-sm text-white/70">Requires Vote</label>
              </div>
              <button onClick={addItem} className="w-full bg-gold-500 text-black py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Add Item</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
