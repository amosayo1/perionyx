"use client";

import { useReducer, useCallback, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/components/enterprise/motion/tokens";
import { EnterpriseForm, EnterpriseSection, EnterpriseField } from "@/components/enterprise/forms";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";

import type { ReportDefinition, ReportType, ReportConfig, ReportAudience } from "@/modules/financial-reporting/types";
import {
  FileText, DollarSign, BarChart3, TrendingUp, Banknote, BookOpen,
  Receipt, PiggyBank, Building2, ChevronLeft, ChevronRight
} from "lucide-react";

const reportTypeMeta: Record<ReportType, { icon: typeof FileText; description: string }> = {
  "balance-sheet": { icon: FileText, description: "Assets, liabilities, and equity snapshot" },
  "profit-loss": { icon: TrendingUp, description: "Revenue, expenses, and net income" },
  "cash-flow": { icon: DollarSign, description: "Operating, investing, and financing cash flows" },
  "trial-balance": { icon: BookOpen, description: "All account balances before adjustments" },
  "general-ledger": { icon: BookOpen, description: "Detailed ledger account activity" },
  "journal-report": { icon: Receipt, description: "Journal entry transactions" },
  "chart-of-accounts": { icon: FileText, description: "Full chart of accounts listing" },
  "aged-receivables": { icon: Banknote, description: "Aging analysis of receivables" },
  "aged-payables": { icon: Banknote, description: "Aging analysis of payables" },
  "fixed-assets": { icon: Building2, description: "Fixed asset register and depreciation" },
  "equity-statement": { icon: BarChart3, description: "Changes in equity over period" },
  "budget-vs-actual": { icon: BarChart3, description: "Budget to actual comparison" },
  "department-pl": { icon: Building2, description: "Profit and loss by department" },
  "cost-center": { icon: PiggyBank, description: "Cost center analysis" },
  "consolidated-group": { icon: Building2, description: "Consolidated group financials" },
  "multi-company": { icon: Building2, description: "Multi-company comparison" },
  "treasury-report": { icon: DollarSign, description: "Treasury position and activity" },
  "fx-exposure": { icon: DollarSign, description: "Foreign currency exposure" },
  "cash-position": { icon: Banknote, description: "Consolidated cash position" },
};

interface ReportBuilderProps {
  onSave?: (def: ReportDefinition) => void;
  initialType?: ReportType;
}

interface BuilderState {
  step: number;
  reportType: ReportType;
  audience: ReportAudience | "";
  dateRangeStart: string;
  dateRangeEnd: string;
  currency: string;
  companyIds: string[];
  departmentIds: string[];
  costCenterIds: string[];
  comparison: string;
  showZeroBalances: boolean;
  compact: boolean;
  rounding: number;
  customColumns: string[];
  groupBy: string[];
}

type Action =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_TYPE"; reportType: ReportType }
  | { type: "SET_AUDIENCE"; audience: ReportAudience }
  | { type: "SET_FIELD"; field: keyof BuilderState; value: unknown }
  | { type: "TOGGLE_ARRAY"; field: "companyIds" | "departmentIds" | "costCenterIds" | "customColumns" | "groupBy"; value: string };

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_TYPE":
      return { ...state, reportType: action.reportType };
    case "SET_AUDIENCE":
      return { ...state, audience: action.audience };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_ARRAY": {
      const arr = state[action.field] as string[];
      return {
        ...state,
        [action.field]: arr.includes(action.value)
          ? arr.filter((v) => v !== action.value)
          : [...arr, action.value],
      };
    }
    default:
      return state;
  }
}

const initial: BuilderState = {
  step: 0,
  reportType: "profit-loss",
  audience: "",
  dateRangeStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  dateRangeEnd: new Date().toISOString().split("T")[0],
  currency: "USD",
  companyIds: [],
  departmentIds: [],
  costCenterIds: [],
  comparison: "none",
  showZeroBalances: false,
  compact: false,
  rounding: 2,
  customColumns: [],
  groupBy: [],
};

const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "BRL", "INR"];

const reportTypesList = Object.keys(reportTypeMeta) as ReportType[];

export function ReportBuilder({ onSave, initialType }: ReportBuilderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initial,
    reportType: initialType ?? "profit-loss",
  });

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const config: ReportConfig = {
      dateRange: { start: state.dateRangeStart, end: state.dateRangeEnd },
      companyIds: state.companyIds,
      entityIds: [],
      currency: state.currency,
      departmentIds: state.departmentIds,
      costCenterIds: state.costCenterIds,
      projectIds: [],
      customColumns: state.customColumns,
      groupBy: state.groupBy,
      comparison: state.comparison as ReportConfig["comparison"],
      includeAiCommentary: true,
      includeDrillDown: true,
      showZeroBalances: state.showZeroBalances,
      rounding: state.rounding,
      compact: state.compact,
    };
    const def: ReportDefinition = {
      id: crypto.randomUUID(),
      companyId: "current",
      name: `${state.reportType.replace(/-/g, " ")} Report`,
      description: `${reportTypeMeta[state.reportType].description} — ${state.audience || "General"}`,
      reportType: state.reportType,
      audience: state.audience ? (state.audience as ReportAudience) : undefined,
      config,
      isActive: true,
      isTemplate: false,
      version: 1,
      createdBy: "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave?.(def);
  }, [state, onSave]);

  const canNext = state.step === 0 ? !!state.reportType : state.step === 3;

  return (
    <EnterpriseForm onSubmit={handleSubmit} title="Report Builder" className="min-h-0">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  s < state.step ? "bg-amber-400 text-black" : s === state.step ? "border border-amber-400 text-amber-400" : "border border-zinc-700 text-zinc-600",
                )}
              >
                {s + 1}
              </span>
              <span className={cn(s === state.step ? "text-zinc-300" : "text-zinc-600")}>
                {["Select Type", "Configure Filters", "Customize Columns", "Preview"][s]}
              </span>
              {s < 3 && <span className="text-zinc-700">→</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton type="submit" variant="primary" disabled={!canNext}>
            Save Report
          </AnimatedButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {state.step === 0 && (
            <motion.div key="step0" variants={fadeInUp} initial="hidden" animate="visible" exit="exit">
              <h3 className="mb-4 text-sm font-medium text-zinc-200">Select Report Type</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {reportTypesList.map((type) => {
                  const meta = reportTypeMeta[type];
                  const Icon = meta.icon;
                  const isSelected = state.reportType === type;
                  return (
                    <AnimatedCard
                      key={type}
                      selected={isSelected}
                      onClick={() => dispatch({ type: "SET_TYPE", reportType: type })}
                      className="p-3"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", isSelected ? "text-amber-400" : "text-zinc-500")} />
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{type.replace(/-/g, " ")}</p>
                          <p className="mt-0.5 text-[10px] text-zinc-500">{meta.description}</p>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {state.step === 1 && (
            <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit="exit">
              <EnterpriseSection config={{ id: "date-range", title: "Date Range", collapsible: false }}>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <EnterpriseField label="Start Date" htmlFor="date-start">
                    <input
                      id="date-start"
                      type="date"
                      value={state.dateRangeStart}
                      onChange={(e) => dispatch({ type: "SET_FIELD", field: "dateRangeStart", value: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                    />
                  </EnterpriseField>
                  <EnterpriseField label="End Date" htmlFor="date-end">
                    <input
                      id="date-end"
                      type="date"
                      value={state.dateRangeEnd}
                      onChange={(e) => dispatch({ type: "SET_FIELD", field: "dateRangeEnd", value: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                    />
                  </EnterpriseField>
                </div>
              </EnterpriseSection>

              <EnterpriseSection config={{ id: "filters", title: "Filters", collapsible: false }} className="mt-4">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <EnterpriseField label="Currency" htmlFor="currency">
                    <select
                      id="currency"
                      value={state.currency}
                      onChange={(e) => dispatch({ type: "SET_FIELD", field: "currency", value: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                    >
                      {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </EnterpriseField>

                  <EnterpriseField label="Comparison" htmlFor="comparison">
                    <select
                      id="comparison"
                      value={state.comparison}
                      onChange={(e) => dispatch({ type: "SET_FIELD", field: "comparison", value: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                    >
                      <option value="none">None</option>
                      <option value="prior-period">Prior Period</option>
                      <option value="prior-year">Prior Year</option>
                      <option value="budget">Budget</option>
                    </select>
                  </EnterpriseField>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={state.showZeroBalances}
                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "showZeroBalances", value: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-amber-400"
                      />
                      Show Zero Balances
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={state.compact}
                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "compact", value: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-amber-400"
                      />
                      Compact View
                    </label>
                  </div>

                  <EnterpriseField label="Rounding" htmlFor="rounding">
                    <select
                      id="rounding"
                      value={state.rounding}
                      onChange={(e) => dispatch({ type: "SET_FIELD", field: "rounding", value: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                    >
                      <option value={0}>Whole Numbers</option>
                      <option value={1}>1 Decimal</option>
                      <option value={2}>2 Decimals</option>
                      <option value={4}>4 Decimals</option>
                    </select>
                  </EnterpriseField>
                </div>
              </EnterpriseSection>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div key="step2" variants={fadeInUp} initial="hidden" animate="visible" exit="exit">
              <EnterpriseSection config={{ id: "columns", title: "Custom Columns & Grouping", collapsible: false }}>
                <div className="space-y-4 p-4">
                  <p className="text-xs text-zinc-500">Column and grouping options will be available in the full version.</p>
                  <p className="text-xs text-zinc-600">Default columns will be used based on the selected report type.</p>
                </div>
              </EnterpriseSection>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div key="step3" variants={fadeInUp} initial="hidden" animate="visible" exit="exit">
              <h3 className="mb-4 text-sm font-medium text-zinc-200">Preview</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-3">
        <AnimatedButton
          variant="ghost"
          onClick={() => dispatch({ type: "SET_STEP", step: Math.max(0, state.step - 1) })}
          disabled={state.step === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </AnimatedButton>
        <AnimatedButton
          variant="primary"
          onClick={() => dispatch({ type: "SET_STEP", step: Math.min(3, state.step + 1) })}
          disabled={!canNext || state.step === 3}
        >
          {state.step === 3 ? "Complete" : "Next"}
          <ChevronRight className="h-3.5 w-3.5" />
        </AnimatedButton>
      </div>
    </EnterpriseForm>
  );
}
