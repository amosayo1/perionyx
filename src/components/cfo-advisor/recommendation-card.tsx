"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, expandCollapse } from "@/components/enterprise/motion/tokens";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Shield,
  TrendingUp,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface Recommendation {
  id?: string;
  title: string;
  category: string;
  summary?: string;
  businessReason?: string;
  financialImpact?: { amount?: string; direction?: "positive" | "negative" | "neutral" };
  confidence?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  requiredApprovals?: string[];
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: (action: string) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  treasury: { bg: "bg-[#d4af37]/10", text: "text-[#d4af37]", border: "border-[#d4af37]/20" },
  risk: { bg: "bg-red-400/10", text: "text-red-400", border: "border-red-400/20" },
  compliance: { bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/20" },
  investment: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
  operations: { bg: "bg-zinc-400/10", text: "text-zinc-400", border: "border-zinc-400/20" },
  default: { bg: "bg-white/5", text: "text-zinc-400", border: "border-white/10" },
};

const RISK_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  low: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  medium: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
  high: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
  critical: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

export function RecommendationCard({ recommendation, onAction, className }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cat = CATEGORY_COLORS[recommendation.category] ?? CATEGORY_COLORS.default;
  const risk = RISK_CONFIG[recommendation.riskLevel ?? "low"];
  const RiskIcon = risk.icon;
  const confidence = recommendation.confidence ?? 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-2xl border border-white/[0.09] bg-[#101010] p-5 transition-colors",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
            cat.bg,
            cat.text,
            cat.border,
          )}
        >
          {recommendation.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
            risk.bg,
            risk.color,
          )}
        >
          <RiskIcon className="h-3 w-3" />
          {recommendation.riskLevel ?? "low"}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white">{recommendation.title}</h3>
      {recommendation.summary && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-400">{recommendation.summary}</p>
      )}

      {recommendation.businessReason && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-500 italic">
          &quot;{recommendation.businessReason}&quot;
        </p>
      )}

      {recommendation.financialImpact && (
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp
            className={cn(
              "h-4 w-4",
              recommendation.financialImpact.direction === "positive"
                ? "text-emerald-400"
                : recommendation.financialImpact.direction === "negative"
                  ? "text-red-400"
                  : "text-zinc-500",
            )}
          />
          <span
            className={cn(
              "text-sm font-bold",
              recommendation.financialImpact.direction === "positive"
                ? "text-emerald-400"
                : recommendation.financialImpact.direction === "negative"
                  ? "text-red-400"
                  : "text-white",
            )}
          >
            {recommendation.financialImpact.amount ?? "—"}
          </span>
        </div>
      )}

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Confidence</span>
          <span className="text-xs font-medium text-zinc-300">{confidence}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              confidence >= 80
                ? "bg-emerald-400"
                : confidence >= 50
                  ? "bg-[#d4af37]"
                  : "bg-red-400",
            )}
          />
        </div>
      </div>

      {recommendation.requiredApprovals && recommendation.requiredApprovals.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Shield className="h-3 w-3" />
            Required approvals
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {recommendation.requiredApprovals.map((approval) => (
              <span
                key={approval}
                className="inline-flex items-center rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-300"
              >
                {approval}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex w-full items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
        />
        {expanded ? "Hide details" : "Show full rationale"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={expandCollapse}
            className="mb-4 space-y-2 border-t border-white/[0.06] pt-3"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              Generated by AI analysis of current market conditions and company position
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {onAction && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction("acknowledge")}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
          >
            Acknowledge
          </button>
          <button
            onClick={() => onAction("accept")}
            className="flex-1 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
          >
            <ThumbsUp className="mr-1 inline h-3 w-3" />
            Accept
          </button>
          <button
            onClick={() => onAction("reject")}
            className="flex-1 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/20 transition-colors"
          >
            <ThumbsDown className="mr-1 inline h-3 w-3" />
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}
