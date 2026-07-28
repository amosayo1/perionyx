"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/localization/language-provider";
import { FileText } from "lucide-react";

export function MobileReports({ className }: { className?: string }) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const types = ["all", "treasury", "income", "compliance", "balance"];
  const { t } = useLocalization();

  const typeLabel = (type: string): string => {
    if (type === "all") return t("mobile.allReports");
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className={cn("mx-auto max-w-lg space-y-3 px-4 pb-32 pt-2", className)}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white">{t("mobile.reportsTitle")}</h1>
        <p className="text-[11px] text-zinc-500">{t("mobile.reportsSubtitle")}</p>
      </motion.div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-h-[28px]",
              selectedType === type ? "bg-gold/10 text-gold" : "text-zinc-500 active:bg-zinc-800",
            )}
          >
            {typeLabel(type)}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 py-16">
        <FileText className="h-10 w-10 text-zinc-700" />
        <p className="text-sm text-zinc-600">{t("mobile.noReportsAvailable")}</p>
      </div>
    </div>
  );
}
