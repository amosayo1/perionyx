"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface WorkspaceInfoProps {
  companyName?: string;
  environment?: "production" | "sandbox" | "development";
  role?: string;
  email?: string;
  className?: string;
}

const envConfig = {
  production: { label: "Production", dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  sandbox: { label: "Sandbox", dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  development: { label: "Development", dot: "bg-blue-500", text: "text-blue-400", bg: "bg-blue-500/10" },
};

export const WorkspaceInfo = memo(function WorkspaceInfo({
  companyName,
  environment = "production",
  role,
  email,
  className,
}: WorkspaceInfoProps) {
  const ec = envConfig[environment];

  return (
    <div className={cn("space-y-1.5", className)}>
      {companyName && (
        <p className="truncate text-[12px] font-medium text-zinc-300">
          {companyName}
        </p>
      )}
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <span className={cn("flex items-center gap-1.5 rounded-md border px-1.5 py-0.5", ec.bg, `border-${environment === "production" ? "emerald" : environment === "sandbox" ? "amber" : "blue"}-500/20`, ec.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", ec.dot)} />
          {ec.label}
        </span>
        {role && <span className="capitalize">{role.toLowerCase()}</span>}
      </div>
      {email && (
        <p className="truncate text-[11px] text-zinc-600">{email}</p>
      )}
    </div>
  );
});
