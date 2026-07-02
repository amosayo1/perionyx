import Link from "next/link";
import { Zap, Key, BookOpen, Download, FileText, Clock, Shield, ExternalLink } from "lucide-react";
import type { DeveloperResource } from "./types";

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="h-4 w-4" />,
  key: <Key className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  "file-text": <FileText className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
};

export function ResourceCard({ resource }: { resource: DeveloperResource }) {
  return (
    <Link
      href={resource.href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
        {iconMap[resource.icon] ?? <BookOpen className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{resource.title}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">{resource.description}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </Link>
  );
}
