"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

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

interface ImportWizardProps {
  onImport: (data: { file: File; templateId?: string; mapping: Record<string, string> }) => Promise<{ imported: number; errors: string[] }>;
  onCancel: () => void;
  templates: Template[];
}

export function ImportWizard({ onImport, onCancel, templates }: ImportWizardProps) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const steps = ["Select Source", "Configure", "Import"];
  const entityFields = ["date", "description", "amount", "debit_account", "credit_account", "reference", "name", "code", "balance", "currency"];

  const handleFile = (f: File) => {
    setFile(f);
    const cols = f.name.endsWith(".csv") ? ["date", "amount", "description", "reference"] : ["Date", "Amount", "Description", "Reference"];
    setColumns(cols);
    const auto: Record<string, string> = {};
    cols.forEach(c => { const k = c.toLowerCase().replace(/[^a-z]/g, ""); if (entityFields.some(f => k.includes(f))) auto[k] = "auto"; });
    setMapping(auto);
    setStep(1);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const r = await onImport({ file, templateId: selectedTemplate ?? undefined, mapping });
      setResult(r);
      setStep(3);
    } catch (e) { console.error(e); }
    finally { setImporting(false); }
  };

  const reset = () => { setFile(null); setSelectedTemplate(null); setMapping({}); setResult(null); setStep(0); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium", i <= step ? "bg-amber-400 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>{i + 1}</div>
            <span className={cn("text-xs", i <= step ? "text-zinc-300" : "text-zinc-600")}>{s}</span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-zinc-800" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          {templates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-zinc-500">Use a template</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setStep(1); }} className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition-all", selectedTemplate === t.id ? "border-amber-400/30 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700")}>
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-sm text-white">{t.name}</p>
                      <p className="text-[10px] text-zinc-500">{t.sourceType} template</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
                <div className="relative flex justify-center"><span className="bg-zinc-950 px-2 text-[10px] text-zinc-600">or upload a file</span></div>
              </div>
            </div>
          )}
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onClick={() => inputRef.current?.click()} className={cn("flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all", dragOver ? "border-amber-400/50 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700")}>
            <Upload className="mb-2 h-8 w-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">Drop Excel or CSV file here</p>
            <p className="mt-1 text-xs text-zinc-600">.xlsx, .xls, .csv</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" aria-label="Upload Excel or CSV file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </div>
      )}

      {step === 1 && file && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm text-white">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB · {columns.length} columns detected</p>
            </div>
            <button onClick={reset} aria-label="Close" className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h4 className="mb-3 text-xs font-medium text-zinc-400">Field Mapping</h4>
            <div className="space-y-2">
              {entityFields.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm">
                  <span className="w-32 text-zinc-400 text-xs truncate">{f}</span>
                  <ArrowRightIcon />
                  <input value={mapping[f] ?? ""} onChange={e => setMapping(p => ({ ...p, [f]: e.target.value }))} placeholder="column name" aria-label={`Map ${f} to column`} className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400">Back</button>
            <button onClick={() => setStep(2)} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500">Continue</button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h4 className="text-sm font-medium text-white">Ready to import</h4>
            <p className="mt-1 text-xs text-zinc-500">{file?.name} · {columns.length} mapped fields</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400">Back</button>
            <button onClick={handleImport} disabled={importing} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">{importing ? "Importing..." : "Import"}</button>
          </div>
        </motion.div>
      )}

      {step === 3 && result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className={cn("rounded-xl border p-6 text-center", result.errors.length === 0 ? "border-emerald-400/20 bg-emerald-400/5" : "border-amber-400/20 bg-amber-400/5")}>
            {result.errors.length === 0 ? <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" /> : <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-400" />}
            <p className="text-lg font-semibold text-white">{result.imported} records imported</p>
            {result.errors.length > 0 && (
              <div role="alert" className="mt-3 space-y-1 text-left">
                {result.errors.map((e, i) => <p key={i} className="text-xs text-red-400">• {e}</p>)}
              </div>
            )}
          </div>
          <button onClick={reset} className="w-full rounded-lg border border-zinc-800 py-2 text-sm text-zinc-400 hover:text-white">Import another file</button>
        </motion.div>
      )}
    </div>
  );
}

function ArrowRightIcon() {
  return <svg className="h-3 w-3 shrink-0 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}
