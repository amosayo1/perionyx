'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ConsExecutiveInsightsProps } from './cons-types'

export function ConsExecutiveInsights({ summary, insights }: ConsExecutiveInsightsProps) {
  const highlights = useMemo(() => {
    const result: string[] = []
    if (summary.totalNetIncome > 0) result.push(`Net income of $${(summary.totalNetIncome / 1000000).toFixed(1)}M — positive period performance`)
    if (summary.totalRevenue > 0) result.push(`Total revenue $${(summary.totalRevenue / 1000000).toFixed(1)}M across the group`)
    if (summary.consolidationProgress > 0.8) result.push(`Consolidation at ${(summary.consolidationProgress * 100).toFixed(0)}% — near completion`)
    if (summary.totalAssets > summary.totalEquity * 2) result.push(`Asset base ${(summary.totalAssets / summary.totalEquity).toFixed(1)}x equity — healthy leverage`)
    if (summary.readinesScore > 85) result.push(`Readiness score ${summary.readinesScore}% — consolidation process is well-prepared`)
    return result
  }, [summary])

  const risks = useMemo(() => {
    const result: string[] = []
    if (summary.unmatchedICTransactions > 0) result.push(`${summary.unmatchedICTransactions} unmatched intercompany transactions — reconciliation needed`)
    if (summary.pendingAdjustments > 0) result.push(`${summary.pendingAdjustments} pending adjustments require review and approval`)
    if (summary.criticalAlerts > 0) result.push(`${summary.criticalAlerts} critical consolidation alerts require immediate attention`)
    if (summary.pendingApprovals > 0) result.push(`${summary.pendingApprovals} approvals pending — may delay consolidation close`)
    if (summary.openAlerts > 10) result.push(`${summary.openAlerts} open alerts — consolidation reliability at risk`)
    return result
  }, [summary])

  const actions = useMemo(() => {
    const result: string[] = []
    if (summary.unmatchedICTransactions > 0) result.push('Resolve unmatched intercompany transactions before close')
    if (summary.pendingAdjustments > 0) result.push('Review and approve pending consolidation adjustments')
    if (summary.criticalAlerts > 0) result.push('Address all critical consolidation alerts immediately')
    if (summary.pendingApprovals > 3) result.push('Clear pending approval queue to accelerate close')
    if (summary.openAlerts > 5) result.push('Investigate and close open alerts to improve readiness score')
    result.push(`Target close duration: ${Math.max(1, summary.lastCloseDuration - 1)}d (current: ${summary.lastCloseDuration.toFixed(1)}d)`)
    return result
  }, [summary])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
        <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Executive Summary</div>
        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          {insights.summary || (
            `${summary.groupName} — consolidation period ${summary.activeRunLabel}. ` +
            `${summary.totalEntities} entities, ${summary.consolidatedEntities} consolidated. ` +
            `Revenue $${(summary.totalRevenue / 1000000).toFixed(1)}M, net income $${(summary.totalNetIncome / 1000000).toFixed(1)}M. ` +
            `Progress at ${(summary.consolidationProgress * 100).toFixed(0)}%. Readiness score: ${summary.readinesScore}%.`
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Entities', value: summary.totalEntities.toString(), color: '#e0e0e0' },
          { label: 'Net Income', value: `$${(summary.totalNetIncome / 1000000).toFixed(1)}M`, color: summary.totalNetIncome >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Total Assets', value: `$${(summary.totalAssets / 1000000).toFixed(1)}M`, color: '#d4af37' },
          { label: 'Total Equity', value: `$${(summary.totalEquity / 1000000).toFixed(1)}M`, color: '#22c55e' },
          { label: 'Minority Interest', value: `$${(summary.totalMinorityInterest / 1000000).toFixed(1)}M`, color: '#a855f7' },
          { label: 'CTA Reserve', value: `$${(summary.totalCTA / 1000000).toFixed(1)}M`, color: summary.totalCTA >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Progress', value: `${(summary.consolidationProgress * 100).toFixed(0)}%`, color: summary.consolidationProgress > 0.8 ? '#22c55e' : '#eab308' },
          { label: 'Critical Alerts', value: summary.criticalAlerts.toString(), color: summary.criticalAlerts > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Readiness', value: `${summary.readinesScore}%`, color: summary.readinesScore >= 80 ? '#22c55e' : '#eab308' },
          { label: 'Close Duration', value: `${summary.lastCloseDuration.toFixed(1)}d`, color: summary.lastCloseDuration <= 10 ? '#22c55e' : '#eab308' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            style={{ background: '#1a1a24', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Highlights</span>
          </div>
          {highlights.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No highlights available</div>
          ) : (
            highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#22c55e', flexShrink: 0 }}>●</span>
                <span>{h}</span>
              </div>
            ))
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Risks</span>
          </div>
          {risks.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No risks identified</div>
          ) : (
            risks.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>●</span>
                <span>{r}</span>
              </div>
            ))
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Actions</span>
          </div>
          {actions.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No actions recommended</div>
          ) : (
            actions.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#d4af37', flexShrink: 0 }}>●</span>
                <span>{a}</span>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
