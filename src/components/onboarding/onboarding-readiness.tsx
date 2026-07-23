"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

interface ReadinessCheck {
  domain: string;
  label: string;
  status: string;
  score: number;
  details: string[];
  suggestions: string[];
}

interface ReadinessProps {
  readiness: {
    checks: ReadinessCheck[];
    overallScore: number;
    summary: { passed: number; warned: number; failed: number };
    suggestions: string[];
  };
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-[#d4af37]" : "text-red-400";
  const bgColor = score >= 80 ? "border-emerald-500/30" : score >= 60 ? "border-[#d4af37]/30" : "border-red-500/30";

  return (
    <div className={cn("flex h-20 w-20 items-center justify-center rounded-full border-4", bgColor)}>
      <span className={cn("text-2xl font-bold", color)}>{score}%</span>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "PASS":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "WARN":
      return <AlertTriangle className="h-4 w-4 text-[#d4af37]" />;
    case "FAIL":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
}

export function OnboardingReadiness({ readiness }: ReadinessProps) {
  const level = readiness.overallScore >= 80 ? "Enterprise Ready"
    : readiness.overallScore >= 60 ? "Needs Attention"
    : "Setup Incomplete";

  const levelColor = readiness.overallScore >= 80 ? "text-emerald-400"
    : readiness.overallScore >= 60 ? "text-[#d4af37]"
    : "text-red-400";

  return (
    <Card className="border-[#d4af37]/12 bg-perionyx-bg-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Enterprise Readiness</CardTitle>
            <CardDescription className="text-zinc-400">
              Verification across all platform domains
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {readiness.summary.passed} passed
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <AlertTriangle className="h-3.5 w-3.5 text-[#d4af37]" />
                {readiness.summary.warned} warned
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                {readiness.summary.failed} failed
              </div>
            </div>
            <ScoreRing score={readiness.overallScore} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn("text-center text-sm font-medium", levelColor)}>
          {level} — {readiness.overallScore}% overall
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {readiness.checks.map((check) => (
            <div
              key={check.domain}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                check.status === "PASS" && "border-emerald-500/20 bg-emerald-500/5",
                check.status === "WARN" && "border-[#d4af37]/20 bg-[#d4af37]/5",
                check.status === "FAIL" && "border-red-500/20 bg-red-500/5",
              )}
            >
              <StatusIcon status={check.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{check.label}</span>
                  <span className={cn(
                    "text-xs font-semibold",
                    check.score >= 80 && "text-emerald-400",
                    check.score >= 60 && check.score < 80 && "text-[#d4af37]",
                    check.score < 60 && "text-red-400",
                  )}>
                    {check.score}%
                  </span>
                </div>
                {check.details.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {check.details[0]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {readiness.suggestions.length > 0 && (
          <div className="rounded-lg border border-[#d4af37]/10 bg-[#d4af37]/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#d4af37]">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </div>
            <ul className="mt-2 space-y-1">
              {readiness.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#d4af37]/50" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
