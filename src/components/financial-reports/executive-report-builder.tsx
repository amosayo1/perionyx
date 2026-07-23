"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import type { ReportAudience, ReportType, ReportConfig } from "@/modules/financial-reporting/types";
import {
  User, Building2, Landmark, ShieldCheck, BarChart3, Users,
  Search, Eye, PiggyBank, Briefcase, TrendingUp, DollarSign,
  FileText, BookOpen, Banknote, LineChart, ClipboardList, ArrowRight
} from "lucide-react";

interface ExecutiveReportBuilderProps {
  onGenerate: (audience: ReportAudience, reportTypes: ReportType[], config: ReportConfig) => void;
}

interface AudienceCard {
  audience: ReportAudience;
  label: string;
  description: string;
  icon: typeof User;
  recommended: ReportType[];
}

const audienceCards: AudienceCard[] = [
  { audience: "ceo", label: "CEO", description: "Strategic Overview", icon: User, recommended: ["profit-loss", "balance-sheet", "cash-flow", "budget-vs-actual", "consolidated-group"] },
  { audience: "cfo", label: "CFO", description: "Financial Performance", icon: Briefcase, recommended: ["profit-loss", "balance-sheet", "cash-flow", "treasury-report", "budget-vs-actual", "equity-statement"] },
  { audience: "treasurer", label: "Treasurer", description: "Cash & Liquidity", icon: Landmark, recommended: ["cash-flow", "cash-position", "treasury-report", "fx-exposure", "aged-receivables", "aged-payables"] },
  { audience: "controller", label: "Controller", description: "Detailed Ledger", icon: ShieldCheck, recommended: ["general-ledger", "trial-balance", "journal-report", "chart-of-accounts", "fixed-assets", "equity-statement"] },
  { audience: "finance-manager", label: "Finance Manager", description: "Department Analysis", icon: BarChart3, recommended: ["department-pl", "cost-center", "budget-vs-actual", "profit-loss", "balance-sheet"] },
  { audience: "board", label: "Board", description: "Governance Oversight", icon: Users, recommended: ["consolidated-group", "profit-loss", "balance-sheet", "cash-flow", "multi-company", "budget-vs-actual"] },
  { audience: "auditor", label: "Auditor", description: "Compliance Review", icon: Search, recommended: ["trial-balance", "general-ledger", "journal-report", "chart-of-accounts", "fixed-assets", "aged-receivables"] },
  { audience: "investor", label: "Investor", description: "Performance Metrics", icon: TrendingUp, recommended: ["profit-loss", "balance-sheet", "cash-flow", "consolidated-group", "equity-statement"] },
  { audience: "department-manager", label: "Dept Manager", description: "Budget Control", icon: ClipboardList, recommended: ["department-pl", "cost-center", "budget-vs-actual", "profit-loss"] },
];

const allReportTypes: { type: ReportType; icon: typeof FileText; label: string }[] = [
  { type: "balance-sheet", icon: FileText, label: "Balance Sheet" },
  { type: "profit-loss", icon: TrendingUp, label: "Profit & Loss" },
  { type: "cash-flow", icon: DollarSign, label: "Cash Flow" },
  { type: "trial-balance", icon: BookOpen, label: "Trial Balance" },
  { type: "general-ledger", icon: BookOpen, label: "General Ledger" },
  { type: "journal-report", icon: FileText, label: "Journal Report" },
  { type: "chart-of-accounts", icon: FileText, label: "Chart of Accounts" },
  { type: "aged-receivables", icon: Banknote, label: "Aged Receivables" },
  { type: "aged-payables", icon: Banknote, label: "Aged Payables" },
  { type: "fixed-assets", icon: Building2, label: "Fixed Assets" },
  { type: "equity-statement", icon: LineChart, label: "Equity Statement" },
  { type: "budget-vs-actual", icon: BarChart3, label: "Budget vs Actual" },
  { type: "department-pl", icon: Building2, label: "Department P&L" },
  { type: "cost-center", icon: PiggyBank, label: "Cost Center" },
  { type: "consolidated-group", icon: Building2, label: "Consolidated" },
  { type: "multi-company", icon: Building2, label: "Multi-Company" },
  { type: "treasury-report", icon: Landmark, label: "Treasury" },
  { type: "fx-exposure", icon: DollarSign, label: "FX Exposure" },
  { type: "cash-position", icon: Banknote, label: "Cash Position" },
];

export function ExecutiveReportBuilder({ onGenerate }: ExecutiveReportBuilderProps) {
  const [selectedAudience, setSelectedAudience] = useState<ReportAudience | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date().toISOString().split("T")[0]);
  const [currency, setCurrency] = useState("USD");
  const [comparison, setComparison] = useState<string>("none");

  const currentCard = useMemo(() => {
    if (!selectedAudience) return null;
    return audienceCards.find((c) => c.audience === selectedAudience) ?? null;
  }, [selectedAudience]);

  const handleAudienceSelect = (audience: ReportAudience) => {
    setSelectedAudience(audience);
    const card = audienceCards.find((c) => c.audience === audience);
    if (card) {
      setSelectedTypes(card.recommended);
    }
  };

  const toggleType = (type: ReportType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleGenerate = () => {
    if (!selectedAudience) return;
    const config: ReportConfig = {
      dateRange: { start: dateRangeStart, end: dateRangeEnd },
      companyIds: [],
      entityIds: [],
      currency,
      departmentIds: [],
      costCenterIds: [],
      projectIds: [],
      customColumns: [],
      groupBy: [],
      comparison: comparison as ReportConfig["comparison"],
      includeAiCommentary: true,
      includeDrillDown: true,
      showZeroBalances: false,
      rounding: 2,
      compact: false,
    };
    onGenerate(selectedAudience, selectedTypes, config);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-200">Select Audience</h3>
        <div className="grid grid-cols-3 gap-3">
          {audienceCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedAudience === card.audience;
            return (
              <AnimatedCard
                key={card.audience}
                selected={isSelected}
                onClick={() => handleAudienceSelect(card.audience)}
                className="p-4"
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className={cn("h-6 w-6", isSelected ? "text-amber-400" : "text-zinc-500")} />
                  <p className="mt-2 text-sm font-medium text-white">{card.label}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{card.description}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {card.recommended.slice(0, 3).map((rt) => (
                      <span key={rt} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">
                        {rt.replace(/-/g, " ")}
                      </span>
                    ))}
                    {card.recommended.length > 3 && (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">+{card.recommended.length - 3}</span>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedAudience && currentCard && (
            <motion.div
              key="details"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-6 space-y-6"
            >
              <div>
                <h4 className="mb-3 text-sm font-medium text-zinc-200">Recommended Reports for {currentCard.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {currentCard.recommended.map((type) => {
                    const meta = allReportTypes.find((r) => r.type === type);
                    const Icon = meta?.icon || FileText;
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                          isSelected
                            ? "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30"
                            : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300",
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {meta?.label || type}
                      </button>
                    );
                  })}
                </div>
                {selectedTypes.length > 0 && selectedTypes.some((t) => !currentCard.recommended.includes(t)) && (
                  <p className="mt-2 text-[11px] text-zinc-600">
                    {selectedTypes.filter((t) => !currentCard.recommended.includes(t)).length} additional report(s) selected
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <div>
                  <label htmlFor="erb-start" className="mb-1 block text-[11px] text-zinc-500">Start Date</label>
                  <input
                    id="erb-start"
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label htmlFor="erb-end" className="mb-1 block text-[11px] text-zinc-500">End Date</label>
                  <input
                    id="erb-end"
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label htmlFor="erb-currency" className="mb-1 block text-[11px] text-zinc-500">Currency</label>
                  <select
                    id="erb-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
                  >
                    {["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="erb-comp" className="mb-1 block text-[11px] text-zinc-500">Comparison</label>
                  <select
                    id="erb-comp"
                    value={comparison}
                    onChange={(e) => setComparison(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="none">None</option>
                    <option value="prior-period">Prior Period</option>
                    <option value="prior-year">Prior Year</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedAudience && (
        <div className="flex items-center justify-end border-t border-white/[0.06] px-6 py-3">
          <AnimatedButton
            variant="primary"
            onClick={handleGenerate}
            disabled={selectedTypes.length === 0}
          >
            Generate Report
            <ArrowRight className="h-3.5 w-3.5" />
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}
