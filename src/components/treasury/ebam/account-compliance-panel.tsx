"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  MOCK_COMPLIANCE_ISSUES,
} from "./data"
import type { ComplianceSeverity } from "./types"

const severityConfig: Record<ComplianceSeverity, { label: string; classes: string; icon?: string }> = {
  info: { label: "Info", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  warning: { label: "Warning", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  critical: { label: "Critical", classes: "bg-red-500/10 text-red-400 border-red-500/20" },
  emergency: { label: "Emergency", classes: "bg-red-500/20 text-red-300 border-red-400/30", icon: "⚠" },
}

const categories = [
  "Missing Documentation",
  "Expired Mandates",
  "Expired KYC",
  "Unauthorized Signatory",
  "Policy Violation",
  "Dormant Risk",
  "Country Risk",
  "Sanctions Review",
  "Ownership Issue",
] as const

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n)

export function AccountCompliancePanel() {
  const [severityFilter, setSeverityFilter] = useState<ComplianceSeverity | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return MOCK_COMPLIANCE_ISSUES.filter((i) => {
      if (severityFilter !== "all" && i.severity !== severityFilter) return false
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false
      return true
    })
  }, [severityFilter, categoryFilter])

  const totalOpen = MOCK_COMPLIANCE_ISSUES.filter((i) => !i.resolved).length
  const totalResolved = MOCK_COMPLIANCE_ISSUES.filter((i) => i.resolved).length
  const criticalCount = MOCK_COMPLIANCE_ISSUES.filter((i) => i.severity === "critical" || i.severity === "emergency").length

  const grouped = useMemo(() => {
    const map = new Map<string, typeof MOCK_COMPLIANCE_ISSUES>()
    for (const cat of categories) {
      const issues = filtered.filter((i) => i.category === cat)
      if (issues.length > 0) map.set(cat, issues)
    }
    return map
  }, [filtered])

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Compliance Center">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Compliance Center</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Bank account compliance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-zinc-400">
            <span className="text-white font-medium">{totalOpen}</span> open
          </div>
          <div className="w-px h-4 bg-white/[0.06]" />
          <div className="text-xs text-zinc-400">
            <span className="text-white font-medium">{totalResolved}</span> resolved
          </div>
          <div className="w-px h-4 bg-white/[0.06]" />
          <div className="text-xs text-red-400">
            <span className="text-red-300 font-medium">{criticalCount}</span> critical
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as ComplianceSeverity | "all")}
          className="bg-zinc-800 text-xs text-zinc-300 border border-white/[0.06] rounded px-2 py-1.5 outline-none focus:border-zinc-500"
          aria-label="Filter by severity"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="emergency">Emergency</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-800 text-xs text-zinc-300 border border-white/[0.06] rounded px-2 py-1.5 outline-none focus:border-zinc-500"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {Array.from(grouped.entries()).map(([category, issues]) => {
          const totalImpact = issues.reduce((s, i) => s + (i.severity === "emergency" || i.severity === "critical" ? 1 : 0), 0)
          const worst = issues.reduce<ComplianceSeverity>((w, i) => {
            const order: ComplianceSeverity[] = ["info", "warning", "critical", "emergency"]
            return order.indexOf(i.severity) > order.indexOf(w) ? i.severity : w
          }, "info")
          const cfg = severityConfig[worst]
          return (
            <div key={category} className="rounded-lg border border-white/[0.06] bg-zinc-800/50 p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", cfg.classes)}>
                    {cfg.icon ? `${cfg.icon} ${cfg.label}` : cfg.label}
                  </span>
                  <h4 className="text-xs font-medium text-white">{category}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">{issues.length} issues</span>
                  {totalImpact > 0 && (
                    <span className="text-xs text-red-400">{totalImpact} high impact</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {issues.slice(0, 4).map((issue) => {
                  const scfg = severityConfig[issue.severity]
                  return (
                    <div key={issue.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-zinc-900/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", {
                          "bg-blue-400": issue.severity === "info",
                          "bg-amber-400": issue.severity === "warning",
                          "bg-red-400": issue.severity === "critical",
                          "bg-red-300": issue.severity === "emergency",
                        })} />
                        <span className="text-zinc-300 truncate max-w-[220px]">{issue.title}</span>
                        <span className={cn("text-[10px] px-1 py-0.5 rounded", scfg.classes)}>{issue.severity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {issue.resolved ? (
                          <span className="text-[10px] text-emerald-400 font-medium">Resolved</span>
                        ) : (
                          <>
                            <span className={cn("text-[10px] font-medium", issue.acknowledged ? "text-blue-400" : "text-amber-400")}>
                              {issue.acknowledged ? "Acknowledged" : "Unacknowledged"}
                            </span>
                            <button className="text-[10px] px-2 py-1 rounded bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 transition-colors">
                              Acknowledge
                            </button>
                            <button className="text-[10px] px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors">
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
                {issues.length > 4 && (
                  <div className="text-[10px] text-zinc-500 text-center pt-1">
                    +{issues.length - 4} more {category.toLowerCase()} issues
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {grouped.size === 0 && (
          <div className="text-xs text-zinc-500 text-center py-8">No compliance issues match the current filters</div>
        )}
      </div>
    </div>
  )
}
