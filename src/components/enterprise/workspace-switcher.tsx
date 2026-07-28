"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug?: string;
}

interface WorkspaceSwitcherProps {
  companies: Company[];
  activeId: string | null;
  onSwitch: (companyId: string) => void;
  className?: string;
}

export function WorkspaceSwitcher({ companies, activeId, onSwitch, className }: WorkspaceSwitcherProps) {
  const active = companies.find((c) => c.id === activeId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300", className)}>
          <Building2 className="h-4 w-4 text-zinc-500" />
          <span className="max-w-[160px] truncate">{active?.name ?? "Select workspace"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
        <DropdownMenuLabel className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.length === 0 ? (
          <DropdownMenuItem disabled className="text-zinc-500">No workspaces yet</DropdownMenuItem>
        ) : (
          companies.map((company) => {
            const isActive = company.id === activeId;
            return (
              <DropdownMenuItem
                key={company.id}
                onClick={() => onSwitch(company.id)}
                className={cn(
                  "flex items-center justify-between",
                  isActive && "bg-gold/10",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isActive ? "bg-gold text-black" : "bg-zinc-800 text-zinc-400",
                  )}>
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      isActive ? "text-gold" : "text-white",
                    )}>
                      {company.name}
                    </p>
                    {company.slug && (
                      <p className="text-[11px] text-zinc-500 truncate">{company.slug}</p>
                    )}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-gold shrink-0" />}
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="flex items-center gap-2 text-zinc-400">
            <Plus className="h-4 w-4" />
            Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
