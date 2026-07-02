"use client";

import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  Landmark,
  Monitor,
  Building2,
  ScrollText,
  BookOpen,
  Activity,
} from "lucide-react";
import type { RecommendedAction } from "./types";

const iconMap: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-4 w-4" />,
  "alert-triangle": <AlertTriangle className="h-4 w-4" />,
  landmark: <Landmark className="h-4 w-4" />,
  monitor: <Monitor className="h-4 w-4" />,
  "building-2": <Building2 className="h-4 w-4" />,
  "scroll-text": <ScrollText className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
};

export function ActionCard({ action }: { action: RecommendedAction }) {
  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
        {iconMap[action.icon] ?? <FileText className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{action.title}</p>
        <p className="text-[10px] text-zinc-600">{action.description}</p>
      </div>
    </Link>
  );
}
