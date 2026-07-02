import Link from "next/link";
import {
  ArrowLeftRight,
  CheckSquare,
  BookOpen,
  ScrollText,
  FileCheck,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentLink } from "./types";
import { getIncidentLinks } from "./data";
import type { Incident } from "./types";

const linkIcons: Record<string, React.ReactNode> = {
  transaction: <ArrowLeftRight className="h-3.5 w-3.5" />,
  approval: <CheckSquare className="h-3.5 w-3.5" />,
  workflow: <BookOpen className="h-3.5 w-3.5" />,
  ledger: <BookOpen className="h-3.5 w-3.5" />,
  audit: <ScrollText className="h-3.5 w-3.5" />,
  policy: <FileCheck className="h-3.5 w-3.5" />,
  risk: <Shield className="h-3.5 w-3.5" />,
};

const linkColors: Record<string, string> = {
  transaction: "text-blue-400",
  approval: "text-[#d4af37]",
  workflow: "text-purple-400",
  ledger: "text-amber-400",
  audit: "text-zinc-400",
  policy: "text-orange-400",
  risk: "text-red-400",
};

export function IncidentLinkedRecords({ incident }: { incident: Incident }) {
  const links = getIncidentLinks(incident);

  if (links.length === 0) {
    return (
      <p className="text-xs text-zinc-600 py-4 text-center">No linked records.</p>
    );
  }

  return (
    <div className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
        >
          <div className={cn("shrink-0", linkColors[link.type] ?? "text-zinc-500")}>
            {linkIcons[link.type] ?? <ExternalLink className="h-3.5 w-3.5" />}
          </div>
          <span className="flex-1 text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
            {link.label}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
