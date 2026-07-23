"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Plus, Save } from "lucide-react";
import type { ImportTemplateData } from "./types";

interface ImportTemplateManagerProps {
  templates: ImportTemplateData[];
  onSave: (data: { name: string; entityType: string; fieldMapping: Record<string, string> }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ImportTemplateManager({ templates, onSave, onDelete }: ImportTemplateManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("journal");
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave({ name, entityType, fieldMapping }); setName(""); setFieldMapping({}); setOpen(false); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Import Templates</h3>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-500"><Plus className="h-3 w-3" /> New</button>
      </div>
      {templates.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500">No templates yet</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {templates.map(t => (
            <motion.div key={t.id} layout className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{t.name}</p>
                  <p className="text-[10px] text-zinc-500">{t.sourceType} · {t.mapping.length} fields</p>
                </div>
              </div>
              <button onClick={() => onDelete(t.id)} className="text-[10px] text-zinc-600 hover:text-red-400 shrink-0">Delete</button>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900 p-4">
            <div className="space-y-3">
              <input placeholder="Template name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none" />
              <select value={entityType} onChange={e => setEntityType(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white">
                <option value="journal">Journal Entry</option>
                <option value="ledger">Ledger Entry</option>
                <option value="account">Chart of Accounts</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
              </select>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Field Mapping (target = source column)</label>
                {["date", "description", "amount", "debit_account", "credit_account", "reference"].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="w-28 text-xs text-zinc-400">{f}</span>
                    <input value={fieldMapping[f] ?? ""} onChange={e => setFieldMapping(p => ({ ...p, [f]: e.target.value }))} placeholder="Excel column name" className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} disabled={saving || !name.trim()} className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50"><Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Template"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
