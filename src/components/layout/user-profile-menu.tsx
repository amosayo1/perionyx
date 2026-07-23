"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle, ChevronDown, LogOut, Settings, Key, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
  userName?: string | null;
  userEmail?: string | null;
  className?: string;
}

export function UserProfileMenu({ userName, userEmail, className }: UserProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-zinc-400 hover:text-white", className)}
        >
          <UserCircle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium max-w-[120px] truncate">{userName ?? userEmail ?? "Account"}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
        <DropdownMenuLabel className="font-normal px-4 py-3">
          <div className="truncate text-sm text-white">{userName ?? userEmail ?? "Account"}</div>
          <div className="truncate text-xs text-zinc-500">{userEmail}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/company" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Company Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/docs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Documentation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            void signOut({ callbackUrl: "/sign-in" })
          }
          className="text-red-400 focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
