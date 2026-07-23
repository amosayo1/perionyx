"use client";

import { useLocalization } from "@/localization/language-provider";
import { Clock } from "lucide-react";

export default function MobileTimelinePage() {
  const { t } = useLocalization();

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-2">
      <h1 className="mb-3 text-xl font-bold text-white">{t("mobile.executiveTimeline")}</h1>
      <div className="flex flex-col items-center gap-3 py-16">
        <Clock className="h-10 w-10 text-zinc-700" />
        <p className="text-sm text-zinc-600">{t("mobile.noRecentActivity")}</p>
      </div>
    </div>
  );
}
