"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UserCircle, Settings, LogOut, Shield, Bell, Building2, ChevronRight } from "lucide-react";

export default function MobileProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const companyName = (session as any)?.user?.activeCompanyId ?? "Acme Corp";

  const menuItems = [
    { icon: Settings, label: "Settings", href: "/settings", color: "text-zinc-400" },
    { icon: Bell, label: "Notification Preferences", href: "/settings/notifications", color: "text-zinc-400" },
    { icon: Shield, label: "Security", href: "/settings", color: "text-zinc-400" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-2">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10">
            <UserCircle className="h-10 w-10 text-[#d4af37]" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">{user?.name ?? "Executive User"}</h1>
            <p className="text-xs text-zinc-500">{user?.email ?? "executive@acme.com"}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/60 px-3 py-1">
            <Building2 className="h-3 w-3 text-zinc-500" />
            <span className="text-[11px] text-zinc-400">{companyName}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left",
                i < menuItems.length - 1 && "border-b border-white/[0.04]",
              )}
            >
              <item.icon className={cn("h-4 w-4", item.color)} />
              <span className="flex-1 text-sm text-zinc-300">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </button>
          ))}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 active:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
