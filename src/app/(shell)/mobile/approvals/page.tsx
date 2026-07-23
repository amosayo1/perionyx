"use client";

import { useLocalization } from "@/localization/language-provider";
import { Briefcase } from "lucide-react";

export default function MobileApprovalsPage() {
  const { t } = useLocalization();

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-2">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-white">{t("mobile.approvalsTitle")}</h1>
        <p className="text-[11px] text-zinc-500">{t("mobile.noItemsPendingReview")}</p>
      </div>
      <div className="flex flex-col items-center gap-3 py-16">
        <Briefcase className="h-10 w-10 text-zinc-700" />
        <p className="text-sm text-zinc-600">{t("mobile.noPendingApprovals")}</p>
      </div>
    </div>
  );
}
