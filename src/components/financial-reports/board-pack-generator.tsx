"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/components/enterprise/motion/tokens";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";
import type { ReportAudience } from "@/modules/financial-reporting/types";
import {
  BarChart3, FileText, Landmark, Shield, MessageSquare,
  Lightbulb, Calendar, Building2, Timer, Loader2, CheckCircle2
} from "lucide-react";

interface BoardPackOptions {
  period: string;
  fiscalYear: string;
  title: string;
  description: string;
  audience: ReportAudience;
  companyIds: string[];
  slides: string[];
}

interface BoardPackGeneratorProps {
  onGenerate: (options: BoardPackOptions) => void;
}

const slideTypes = [
  { id: "kpi", label: "KPI Dashboard", icon: BarChart3, description: "Key performance indicators" },
  { id: "financial-statements", label: "Financial Statements", icon: FileText, description: "P&L, Balance Sheet, Cash Flow" },
  { id: "treasury", label: "Treasury", icon: Landmark, description: "Cash position, FX, liquidity" },
  { id: "risk", label: "Risk", icon: Shield, description: "Risk metrics and exposures" },
  { id: "commentary", label: "Commentary", icon: MessageSquare, description: "AI executive commentary" },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb, description: "Strategic recommendations" },
];

const audiences: { value: ReportAudience; label: string }[] = [
  { value: "board", label: "Board of Directors" },
  { value: "ceo", label: "CEO" },
  { value: "cfo", label: "CFO" },
  { value: "investor", label: "Investors" },
];

export function BoardPackGenerator({ onGenerate }: BoardPackGeneratorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().split("T")[0].slice(0, 7));
  const [fiscalYear, setFiscalYear] = useState(String(new Date().getFullYear()));
  const [audience, setAudience] = useState<ReportAudience>("board");
  const [selectedSlides, setSelectedSlides] = useState<string[]>(["kpi", "financial-statements", "treasury", "commentary", "recommendations"]);
  const [generating, setGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleSlide = (id: string) => {
    setSelectedSlides((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    onGenerate({
      period,
      fiscalYear,
      title: title || `Board Pack — ${period}`,
      description,
      audience,
      companyIds: [],
      slides: selectedSlides,
    });
    setGenerating(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [period, fiscalYear, title, description, audience, selectedSlides, onGenerate]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="bpg-title" className="mb-1 block text-xs text-zinc-500">Title</label>
              <input
                id="bpg-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 2026 Board Pack"
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label htmlFor="bpg-desc" className="mb-1 block text-xs text-zinc-500">Description</label>
              <textarea
                id="bpg-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bpg-period" className="mb-1 block text-xs text-zinc-500">Period</label>
                <input
                  id="bpg-period"
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label htmlFor="bpg-year" className="mb-1 block text-xs text-zinc-500">Fiscal Year</label>
                <select
                  id="bpg-year"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  {[2026, 2025, 2024, 2023, 2022].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bpg-audience" className="mb-1 block text-xs text-zinc-500">Audience</label>
              <select
                id="bpg-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as ReportAudience)}
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                {audiences.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium text-zinc-500">Slides</p>
            <div className="space-y-2">
              {slideTypes.map((slide) => {
                const Icon = slide.icon;
                const isSelected = selectedSlides.includes(slide.id);
                return (
                  <AnimatedCard
                    key={slide.id}
                    selected={isSelected}
                    onClick={() => toggleSlide(slide.id)}
                    className="p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", isSelected ? "text-amber-400" : "text-zinc-500")} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{slide.label}</p>
                        <p className="text-[11px] text-zinc-500">{slide.description}</p>
                      </div>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          isSelected ? "border-amber-400 bg-amber-400" : "border-zinc-700",
                        )}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-black" />}
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-3">
        <p className="text-xs text-zinc-500">
          {selectedSlides.length} slide{selectedSlides.length !== 1 ? "s" : ""} selected
        </p>
        <AnimatedButton
          variant="primary"
          onClick={handleGenerate}
          disabled={generating || selectedSlides.length === 0}
          status={generating ? "loading" : "idle"}
        >
          {generating ? "Generating..." : "Generate Board Pack"}
        </AnimatedButton>
      </div>

      <AnimatedDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Board Pack Generated"
        size="sm"
      >
        <div className="px-6 py-4 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
          <p className="mt-3 text-sm text-zinc-400">Your board pack has been generated successfully.</p>
          <div className="mt-4">
            <AnimatedButton variant="primary" onClick={() => setShowSuccess(false)}>Done</AnimatedButton>
          </div>
        </div>
      </AnimatedDialog>
    </div>
  );
}
