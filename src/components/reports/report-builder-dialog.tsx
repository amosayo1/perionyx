"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database, Filter, Columns, Group, SortAsc, Eye, Download, Check, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import type { ReportTemplate } from "./types";
import { reportTemplates } from "./data";

const steps = [
  { id: "dataset", label: "Choose Dataset", icon: Database },
  { id: "filters", label: "Filters", icon: Filter },
  { id: "columns", label: "Columns", icon: Columns },
  { id: "grouping", label: "Grouping", icon: Group },
  { id: "sorting", label: "Sorting", icon: SortAsc },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "export", label: "Export", icon: Download },
];

const datasets = [
  { id: "transactions", label: "Transactions", description: "All payment and transfer activity" },
  { id: "ledger", label: "Ledger Entries", description: "Double-entry journal records" },
  { id: "approvals", label: "Approvals", description: "Approval workflow and decisions" },
  { id: "policies", label: "Policies", description: "Policy configurations and violations" },
  { id: "risk", label: "Risk Incidents", description: "Risk alerts and incident history" },
  { id: "audit", label: "Audit Log", description: "Complete audit trail" },
];

const columnOptions = [
  { id: "date", label: "Date", group: "Time" },
  { id: "amount", label: "Amount", group: "Financial" },
  { id: "currency", label: "Currency", group: "Financial" },
  { id: "status", label: "Status", group: "Metadata" },
  { id: "category", label: "Category", group: "Metadata" },
  { id: "description", label: "Description", group: "Metadata" },
  { id: "initiator", label: "Initiator", group: "Actors" },
  { id: "approver", label: "Approver", group: "Actors" },
  { id: "source", label: "Source Wallet", group: "Accounts" },
  { id: "destination", label: "Destination Wallet", group: "Accounts" },
];

export function ReportBuilderDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ReportTemplate | null;
}) {
  const [step, setStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState("transactions");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["date", "amount", "status", "description"]);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) setStep((s) => s + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, []);

  const toggleColumn = useCallback((id: string) => {
    setSelectedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: selectedDataset,
          columns: selectedColumns,
          format: "csv",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error?.message ?? "Failed to generate report");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template?.id ?? "report"}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onOpenChange(false);
      setStep(0);
      setSelectedDataset("transactions");
      setSelectedColumns(["date", "amount", "status", "description"]);
      toast.success(`"${template?.title ?? "Report"}" downloaded as CSV`);
    } catch {
      toast.error("Failed to generate report");
    }
  }, [onOpenChange, template, selectedDataset, selectedColumns]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setStep(0);
  }, [onOpenChange]);

  const StepIcon = steps[step].icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#d4af37]" />
            {template?.title ?? "Report"} — {steps[step].label}
          </DialogTitle>
          <DialogDescription>Step {step + 1} of {steps.length}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 py-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  i === step
                    ? "bg-[#d4af37] text-black"
                    : i < step
                      ? "bg-[#d4af37]/20 text-[#d4af37]"
                      : "bg-zinc-800 text-zinc-600"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 ${i < step ? "bg-[#d4af37]/40" : "bg-white/[0.06]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-3">Select the data source for your report.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => setSelectedDataset(ds.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      selectedDataset === ds.id
                        ? "border-[#d4af37]/40 bg-[#d4af37]/5"
                        : "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      selectedDataset === ds.id ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{ds.label}</span>
                      <p className="text-[10px] text-zinc-500">{ds.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-3">Filter data by date range, status, and category.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Date Range</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>All Time</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Quarter</option>
                    <option>This Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Status</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>All Statuses</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Category</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>All Categories</option>
                    <option>Payments</option>
                    <option>Transfers</option>
                    <option>FX</option>
                    <option>Fees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-3">Choose which columns to include in your report.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {columnOptions.map((col) => {
                  const selected = selectedColumns.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleColumn(col.id)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                        selected
                          ? "border-[#d4af37]/40 bg-[#d4af37]/5"
                          : "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        selected ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-zinc-800 text-zinc-600"
                      }`}>
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white">{col.label}</span>
                        <span className="ml-2 text-[10px] text-zinc-600">{col.group}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-3">Group and aggregate data by dimensions.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Group By</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>No Grouping</option>
                    <option>Category</option>
                    <option>Currency</option>
                    <option>Status</option>
                    <option>Date (Day)</option>
                    <option>Date (Month)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Aggregation</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>Sum</option>
                    <option>Count</option>
                    <option>Average</option>
                    <option>Min</option>
                    <option>Max</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-3">Sort results by one or more columns.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Sort By</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>Date</option>
                    <option>Amount</option>
                    <option>Status</option>
                    <option>Category</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Order</label>
                  <select className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs text-white">
                    <option>Descending</option>
                    <option>Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-3">Preview of your report configuration.</p>
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-3 py-2 text-left font-medium text-zinc-400">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-400">Description</th>
                      <th className="px-3 py-2 text-right font-medium text-zinc-400">Amount</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "2024-12-15", desc: "Wire transfer — supplier payment", amount: "$124,500.00", status: "Completed" },
                      { date: "2024-12-14", desc: "ACH — payroll processing", amount: "$87,230.00", status: "Completed" },
                      { date: "2024-12-14", desc: "FX conversion — USD/EUR", amount: "$50,000.00", status: "Pending" },
                      { date: "2024-12-13", desc: "Internal transfer — treasury sweep", amount: "$250,000.00", status: "Completed" },
                      { date: "2024-12-12", desc: "Vendor payment — IT services", amount: "$12,400.00", status: "Failed" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="px-3 py-2 text-zinc-300">{row.date}</td>
                        <td className="px-3 py-2 text-zinc-300">{row.desc}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{row.amount}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] font-medium ${
                            row.status === "Completed" ? "text-emerald-400" : row.status === "Pending" ? "text-amber-400" : "text-red-400"
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-zinc-600">Showing 5 of 847 rows — {selectedColumns.length} columns selected</p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">Choose export format and delivery options.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "pdf", label: "PDF", desc: "Formatted document", icon: FileText },
                  { id: "csv", label: "CSV", desc: "Raw data export", icon: FileText },
                  { id: "excel", label: "Excel", desc: "Spreadsheet format", icon: FileText },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4 text-center transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
                  >
                    <fmt.icon className="h-6 w-6 text-zinc-400" />
                    <span className="text-sm font-medium text-white">{fmt.label}</span>
                    <span className="text-[10px] text-zinc-500">{fmt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>

          {step < steps.length - 1 ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              className="gap-1.5 text-xs bg-[#d4af37] text-black hover:bg-[#c7a961]"
            >
              Next <ArrowRight className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerate}
              className="gap-1.5 text-xs bg-[#d4af37] text-black hover:bg-[#c7a961]"
            >
              <Download className="h-3 w-3" /> Generate Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
