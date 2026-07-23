"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileSpreadsheet, Plus, Save, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  sourceType: string;
  mapping: unknown;
  isActive: boolean;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CsvMappingDesignerProps {
  template: Template | null;
  onSave: (data: { name: string; mapping: Record<string, string> }) => void;
  onPreview: () => void;
}

export function CsvMappingDesigner({ template, onSave, onPreview }: CsvMappingDesignerProps) {
  const [name, setName] = useState(template?.name ?? "");
  const [mappings, setMappings] = useState<Array<{ csvColumn: string; targetField: string; transform?: string }>>(
    template?.mapping && typeof template.mapping === "object"
      ? Object.entries(template.mapping as Record<string, string>).map(([k, v]) => ({ csvColumn: k, targetField: v }))
      : [{ csvColumn: "", targetField: "" }]
  );

  const entityFields = [
    "date", "description", "amount", "debit_account", "credit_account",
    "reference", "name", "code", "balance", "currency", "vendor",
    "customer", "due_date", "status", "notes",
  ];

  const addRow = () => setMappings([...mappings, { csvColumn: "", targetField: "" }]);
  const removeRow = (i: number) => setMappings(mappings.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: "csvColumn" | "targetField" | "transform", value: string) => {
    const next = [...mappings];
    next[i] = { ...next[i], [field]: value };
    setMappings(next);
  };

  const handleSave = () => {
    const mappingObj: Record<string, string> = {};
    mappings.forEach(m => { if (m.csvColumn && m.targetField) mappingObj[m.csvColumn] = m.targetField; });
    onSave({ name, mapping: mappingObj });
  };

  return (
    <div className="space-y-6">
      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Template name" disabled={!!template}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none disabled:opacity-50"
      />
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60 text-left text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">CSV Column</th>
              <th className="px-4 py-3 font-medium">Target Field</th>
              <th className="px-4 py-3 font-medium">Transform</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {mappings.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-2">
                  <input value={row.csvColumn} onChange={e => updateRow(i, "csvColumn", e.target.value)} placeholder="e.g. Transaction Date" className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <select value={row.targetField} onChange={e => updateRow(i, "targetField", e.target.value)} className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-white">
                    <option value="">Select field</option>
                    {entityFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select value={row.transform ?? ""} onChange={e => updateRow(i, "transform", e.target.value)} className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-white">
                    <option value="">None</option>
                    <option value="trim">Trim whitespace</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="parse_date">Parse date</option>
                    <option value="parse_number">Parse number</option>
                    <option value="remove_currency">Remove currency symbol</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {mappings.length > 1 && (
                    <button onClick={() => removeRow(i)} aria-label="Delete" className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"><Plus className="h-3 w-3" /> Add mapping</button>
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={!name.trim() || mappings.every(m => !m.csvColumn)} className="flex items-center gap-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50"><Save className="h-4 w-4" /> Save Template</button>
        <button onClick={onPreview} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white">Preview</button>
      </div>
    </div>
  );
}
