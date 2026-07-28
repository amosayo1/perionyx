"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompanyRow {
  membershipId: string;
  role: string;
  company: { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
}

interface WorkspaceSwitcherProps {
  companies: CompanyRow[];
  activeCompanyId: string | null;
  onSwitch: (companyId: string) => void;
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ companies, activeCompanyId, onSwitch, collapsed }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = companies.find((c) => c.company.id === activeCompanyId);

  const handleSelect = useCallback(
    (id: string) => {
      onSwitch(id);
      setOpen(false);
    },
    [onSwitch],
  );

  if (collapsed) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex w-full items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800/40 hover:text-white"
            aria-label={active?.company.name ?? "Switch workspace"}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold">
              <span className="text-xs font-bold">
                {active ? active.company.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <WorkspaceContent companies={companies} activeCompanyId={activeCompanyId} onSelect={handleSelect} />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/40">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold">
            <span className="text-xs font-bold">
              {active ? active.company.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium text-zinc-200">
              {active?.company.name ?? "No workspace"}
            </span>
            <span className="text-[10px] text-zinc-500 capitalize">
              {active?.role.toLowerCase() ?? "—"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
        </button>
      </DropdownMenuTrigger>
      <WorkspaceContent companies={companies} activeCompanyId={activeCompanyId} onSelect={handleSelect} />
    </DropdownMenu>
  );
}

function WorkspaceContent({
  companies,
  activeCompanyId,
  onSelect,
}: {
  companies: CompanyRow[];
  activeCompanyId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <DropdownMenuContent
      align="start"
      side="right"
      className="w-64 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl backdrop-blur-2xl"
    >
      <DropdownMenuLabel className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Workspaces
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {companies.length === 0 ? (
        <DropdownMenuItem disabled className="text-[12px] text-zinc-600">
          No workspaces yet
        </DropdownMenuItem>
      ) : (
        companies.map((row) => (
          <DropdownMenuItem
            key={row.company.id}
            onClick={() => onSelect(row.company.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-[13px]",
              row.company.id === activeCompanyId && "bg-gold-500/10 text-gold",
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400">
              {row.company.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{row.company.name}</span>
              <span className="text-[10px] text-zinc-600 capitalize">{row.role.toLowerCase()}</span>
            </div>
            {row.company.id === activeCompanyId && (
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
            )}
          </DropdownMenuItem>
        ))
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="text-[13px]">
        <Link href="/onboarding" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create workspace
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
