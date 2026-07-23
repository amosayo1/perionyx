"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { UserAdoptionData } from "@/modules/enterprise-experience/types";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "userName" | "email" | "lastActive" | "totalEvents" | "score";
type SortDir = "asc" | "desc";

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-xs text-zinc-400">{score}</span>
    </div>
  );
}

function SortHeader({ label, sortKey, currentKey, direction, onToggle }: {
  label: string; sortKey: SortKey; currentKey: SortKey; direction: SortDir; onToggle: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <button
      onClick={() => onToggle(sortKey)}
      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
    >
      {label}
      {active ? (
        direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </button>
  );
}

interface UserAdoptionTableProps {
  users: UserAdoptionData[];
}

export function UserAdoptionTable({ users }: UserAdoptionTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    let filtered = users;
    if (search) {
      const q = search.toLowerCase();
      filtered = users.filter((u) =>
        u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const mod = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "userName": return a.userName.localeCompare(b.userName) * mod;
        case "email": return a.email.localeCompare(b.email) * mod;
        case "lastActive": return new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime() * mod;
        case "totalEvents": return (a.totalEvents - b.totalEvents) * mod;
        case "score": return (a.score - b.score) * mod;
        default: return 0;
      }
    });
  }, [users, search, sortKey, sortDir]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">User Adoption</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-white/[0.06] bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="pb-3 pr-4 text-left"><SortHeader label="Name" sortKey="userName" currentKey={sortKey} direction={sortDir} onToggle={toggleSort} /></th>
              <th className="pb-3 pr-4 text-left"><SortHeader label="Email" sortKey="email" currentKey={sortKey} direction={sortDir} onToggle={toggleSort} /></th>
              <th className="pb-3 pr-4 text-left"><SortHeader label="Last Active" sortKey="lastActive" currentKey={sortKey} direction={sortDir} onToggle={toggleSort} /></th>
              <th className="pb-3 pr-4 text-right"><SortHeader label="Events" sortKey="totalEvents" currentKey={sortKey} direction={sortDir} onToggle={toggleSort} /></th>
              <th className="pb-3 pr-4 text-left"><span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Workspaces</span></th>
              <th className="pb-3 text-left"><SortHeader label="Score" sortKey="score" currentKey={sortKey} direction={sortDir} onToggle={toggleSort} /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user, i) => (
              <motion.tr
                key={user.userId}
                variants={fadeInUp}
                className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
              >
                <td className="py-3 pr-4">
                  <p className="text-sm font-medium text-white">{user.userName}</p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-sm text-zinc-400">
                    {new Date(user.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </td>
                <td className="py-3 pr-4 text-right">
                  <p className="text-sm font-medium text-white">{user.totalEvents}</p>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {user.workspacesUsed.slice(0, 3).map((ws) => (
                      <span key={ws} className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{ws}</span>
                    ))}
                    {user.workspacesUsed.length > 3 && (
                      <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">+{user.workspacesUsed.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <ScoreBar score={user.score} />
                </td>
              </motion.tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                  No users match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
