"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface ExcelImportProps {
  onAnalyze: (file: File) => Promise<{ columns: string[]; detectedPattern: string; rowCount: number }>;
  onConfirm: (columns: string[], mapping: Record<string, string>) => Promise<{ imported: number; errors: string[] }>;
}

export function ExcelImport({ onAnalyze, onConfirm }: ExcelImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ columns: string[]; detectedPattern: string; rowCount: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f); setAnalyzing(true); setResult(null); setImportResult(null);
    try {
      const r = await onAnalyze(f);
      setResult(r);
      const auto: Record<string, string> = {};
      r.columns.forEach(c => { const k = c.toLowerCase().replace(/[^a-z]/g, ""); if (["date", "amount", "description", "reference", "account", "debit", "credit", "name", "code", "balance"].some(p => k.includes(p))) auto[c] = "auto"; });
      setMapping(auto);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  const handleConfirm = async () => {
    if (!result) return;
    setImporting(true);
    try {
      const r = await onConfirm(result.columns, mapping);
      setImportResult(r);
    } finally { setImporting(false); }
  };

  return (
    <div className="space-y-4">
      {!result ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
            dragOver ? "border-amber-400/50 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {analyzing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
              <p className="text-sm text-zinc-400">Analyzing file...</p>
            </div>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-zinc-500" />
              <p className="text-sm text-zinc-400">Drop an Excel/CSV file or click to browse</p>
              <p className="mt-1 text-xs text-zinc-600">.xlsx, .xls, .csv</p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm text-white">{file?.name}</p>
              <p className="text-xs text-zinc-500">Detected: {result.detectedPattern} · {result.rowCount} rows · {result.columns.length} columns</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h4 className="mb-3 text-xs font-medium text-zinc-400">Column Mapping</h4>
            <div className="space-y-2">
              {result.columns.map(col => (
                <div key={col} className="flex items-center gap-3 text-sm">
                  <span className="w-32 text-zinc-400 truncate">{col}</span>
                  <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
                  <input
                    value={mapping[col] ?? ""}
                    onChange={e => setMapping(p => ({ ...p, [col]: e.target.value }))}
                    placeholder="target field"
                    className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleConfirm} disabled={importing} className="w-full rounded-lg bg-amber-400 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">
            {importing ? "Importing..." : `Import ${result.rowCount} Records`}
          </button>
        </motion.div>
      )}
      <AnimatePresence>
        {importResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-xl border p-4", importResult.errors.length === 0 ? "border-emerald-400/20 bg-emerald-400/5" : "border-amber-400/20 bg-amber-400/5")}>
            <p className="text-sm font-medium text-white">{importResult.imported} records imported</p>
            {importResult.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {importResult.errors.map((e, i) => <p key={i} className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" /> {e}</p>)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}
