"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { FCExecutiveInsightsProps, VarianceAnalysisRecord, ExceptionRecord, ApprovalRecord } from "./fc-types"
import type { CloseTask } from "./fc-types"

const severityColors: Record<string, string> = { critical: "#ef4444", warning: "#f97316", info: "#3b82f6" }
const severityIcons: Record<string, string> = { critical: "\u26A0\uFE0F", warning: "\u24D8\uFE0F", info: "\u2139\uFE0F" }

export function FCExecutiveInsights({ summary, periods, tasks, approvals, exceptions, reconciliations }: FCExecutiveInsightsProps) {
  const insights = useMemo(() => {
    const result: Array<{ title: string; message: string; severity: "critical" | "warning" | "info" }> = []

    if (summary.daysRemaining <= 3 && !summary.onTrack) {
      result.push({ title: "Close at Risk", message: `Only ${summary.daysRemaining} days remaining with ${summary.blockedTasks} blocked tasks and ${summary.overdueTasks} overdue tasks. Immediate intervention recommended.`, severity: "critical" })
    } else if (summary.daysRemaining <= 5) {
      result.push({ title: "Close Deadline Approaching", message: `${summary.daysRemaining} days left to close. ${summary.completedTasks}/${summary.totalTasks} tasks complete.`, severity: "warning" })
    }

    const highVariance = reconciliations.filter(r => Math.abs(r.difference) > 50000)
    if (highVariance.length > 0) {
      result.push({ title: "Significant Reconciliation Variances", message: `${highVariance.length} reconciliation(s) have variances exceeding $50K. The largest is $${Math.max(...highVariance.map(r => Math.abs(r.difference))).toLocaleString()}.`, severity: "critical" })
    }

    const criticalExceptions = exceptions.filter(e => e.severity === "critical" || e.severity === "blocker")
    if (criticalExceptions.length > 0) {
      result.push({ title: "Critical Exceptions Require Attention", message: `${criticalExceptions.length} critical/blocker exception(s) unresolved. These may delay the close process.`, severity: "critical" })
    }

    const pendingApprovals = approvals.filter(a => a.status === "pending")
    if (pendingApprovals.length > 5) {
      result.push({ title: "Approval Backlog", message: `${pendingApprovals.length} approvals pending. Average wait time may delay close completion.`, severity: "warning" })
    }

    const daysTarget = summary.averageDaysToClose
    if (daysTarget > 10) {
      result.push({ title: "Close Duration Above Target", message: `Average close at ${daysTarget} days exceeds recommended threshold. Consider process optimization.`, severity: "warning" })
    }

    if (summary.closeReadinessScore >= 80) {
      result.push({ title: "Strong Close Readiness", message: `Readiness score at ${summary.closeReadinessScore}%. Key metrics are within acceptable ranges.`, severity: "info" })
    } else if (summary.closeReadinessScore < 60) {
      result.push({ title: "Low Readiness Score", message: `Readiness score at ${summary.closeReadinessScore}%. Review open exceptions, pending approvals, and blocked tasks.`, severity: "critical" })
    } else {
      result.push({ title: "Moderate Close Readiness", message: `Readiness score at ${summary.closeReadinessScore}%. Focus on ${summary.blockedTasks} blocked tasks and ${summary.openExceptions} open exceptions.`, severity: "warning" })
    }

    if (summary.unmatchedItems > 10) {
      result.push({ title: "High Unmatched Items", message: `${summary.unmatchedItems} items remain unmatched across reconciliations. Target resolution before final close.`, severity: "warning" })
    }

    if (summary.flaggedJournals > 0) {
      result.push({ title: "Flagged Journal Entries", message: `${summary.flaggedJournals} journal entries flagged for review. Each requires manual verification before posting.`, severity: "critical" })
    }

    return result
  }, [summary, tasks, approvals, exceptions, reconciliations])

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Readiness Score", value: `${summary.closeReadinessScore}%`, color: summary.closeReadinessScore >= 80 ? "#22c55e" : summary.closeReadinessScore >= 60 ? "#eab308" : "#ef4444" },
          { label: "Days Remaining", value: summary.daysRemaining.toString(), color: summary.daysRemaining <= 3 ? "#ef4444" : summary.daysRemaining <= 7 ? "#eab308" : "#22c55e" },
          { label: "Pending Approvals", value: summary.pendingApprovals.toString(), color: summary.pendingApprovals > 0 ? "#f97316" : "#22c55e" },
          { label: "Critical Exceptions", value: summary.criticalExceptions.toString(), color: summary.criticalExceptions > 0 ? "#ef4444" : "#22c55e" },
          { label: "Avg Days to Close", value: summary.averageDaysToClose.toString(), color: summary.averageDaysToClose <= 7 ? "#22c55e" : summary.averageDaysToClose <= 10 ? "#eab308" : "#ef4444" },
          { label: "Progress", value: `${summary.closeProgress}%`, color: summary.onTrack ? "#22c55e" : "#ef4444" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            style={{ background: "#1a1a24", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 24, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{item.value}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>AI Insights</div>
        {insights.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>All metrics within acceptable ranges.</div>
        ) : (
          insights.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < insights.length - 1 ? "1px solid #2a2a4a" : "none" }}>
              <div style={{ width: 3, borderRadius: 2, background: severityColors[insight.severity], flexShrink: 0 }} />
              <div style={{ fontSize: 16, flexShrink: 0 }}>{severityIcons[insight.severity]}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{insight.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{insight.message}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
