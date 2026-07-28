"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/localization/language-provider";
import {
  Sparkles, AlertTriangle, Lightbulb,
  TrendingUp, Mic, Send,
} from "lucide-react";

export function AIBrief({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const { t } = useLocalization();

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => setQuery(event.results[0][0].transcript);
      recognition.start();
    }
  };

  return (
    <div className={cn("mx-auto max-w-lg space-y-4 px-4 pb-32 pt-2", className)}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h1 className="text-xl font-bold text-white">{t("mobile.aiBriefTitle")}</h1>
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500">{t("mobile.aiBriefSubtitle")}</p>
      </motion.div>

      <div className="flex flex-col items-center gap-3 py-8">
        <Sparkles className="h-10 w-10 text-zinc-700" />
        <p className="text-sm text-zinc-600">{t("mobile.noInsightsAvailable")}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-zinc-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t("mobile.topRisks")}</span>
        </div>
        <p className="text-[12px] text-zinc-600">{t("mobile.noRisksIdentified")}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-zinc-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t("mobile.opportunities")}</span>
        </div>
        <p className="text-[12px] text-zinc-600">{t("mobile.noOpportunitiesIdentified")}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-zinc-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t("mobile.recommendations")}</span>
        </div>
        <p className="text-[12px] text-zinc-600">{t("mobile.noRecommendationsYet")}</p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-zinc-900/60 px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("mobile.askAiAnything")}
          className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          aria-label={t("mobile.askAiAnything")}
        />
        <button onClick={handleVoiceInput} className="rounded-xl p-2 text-zinc-500 active:bg-zinc-800" aria-label={t("mobile.voiceInput")}>
          <Mic className="h-4 w-4" />
        </button>
        {query && (
          <button className="rounded-xl bg-gold/10 p-2 text-gold active:bg-gold/20" aria-label={t("mobile.send")}>
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
