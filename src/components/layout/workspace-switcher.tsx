"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CompanyRow {
  membershipId: string;
  role: string;
  company: { id: string; name: string; slug: string };
}

interface WorkspaceSwitcherProps {
  companies: CompanyRow[];
  activeCompanyId: string | null;
  onSwitch: (companyId: string) => void;
  className?: string;
}

export function WorkspaceSwitcher({ companies, activeCompanyId, onSwitch, className }: WorkspaceSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const active = companies.find((c) => c.company.id === activeCompanyId);

  if (!mounted) {
    return (
      <div className={cn("flex h-9 w-[180px] animate-pulse items-center gap-2 rounded-xl bg-white/[0.03] px-4", className)} />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300", className)}
        >
          <Building2 className="h-4 w-4 text-zinc-500" />
          <span className="max-w-[120px] truncate">{active?.company.name ?? "Select workspace"}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
        <DropdownMenuLabel className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.length === 0 ? (
          <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
        ) : (
          companies.map((row) => (
            <DropdownMenuItem
              key={row.company.id}
              onClick={() => onSwitch(row.company.id)}
              className={cn(
                "flex items-center justify-between",
                row.company.id === activeCompanyId && "bg-[#d4af37]/10 text-[#d4af37]",
              )}
            >
              <span className="truncate">{row.company.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600 uppercase">{row.role}</span>
                {row.company.id === activeCompanyId && <Check className="h-3.5 w-3.5 text-[#d4af37]" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" />
            Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
