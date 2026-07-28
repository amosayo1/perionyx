'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FAExecutiveInsightsProps } from './fa-types'

export function FAExecutiveInsights({ summary, pack }: FAExecutiveInsightsProps) {
  const highlights = useMemo(() => {
    const result: string[] = []
    if (summary.assetUtilizationRate > 0.85) result.push(`Asset utilization at ${(summary.assetUtilizationRate * 100).toFixed(0)}% — above efficiency threshold`)
    if (summary.capitalizedThisPeriod > 0) result.push(`Capitalized $${summary.capitalizedThisPeriod.toLocaleString()} in new assets this period`)
    if (summary.netChange > 0) result.push(`Portfolio net book value increased by $${summary.netChange.toLocaleString()}`)
    if (summary.capexForPeriod > 0) result.push(`Capital expenditure of $${summary.capexForPeriod.toLocaleString()} for the period`)
    if (summary.insuranceCoverage > 0.9) result.push(`Insurance coverage at ${(summary.insuranceCoverage * 100).toFixed(0)}% of asset value`)
    return result
  }, [summary])

  const risks = useMemo(() => {
    const result: string[] = []
    if (summary.fullyDepreciatedCount > 10) result.push(`${summary.fullyDepreciatedCount} assets fully depreciated but still in use — replacement value $${summary.replacementValue.toLocaleString()}`)
    if (summary.budgetVariance < -0.05) result.push(`Capital budget variance of ${(summary.budgetVariance * 100).toFixed(1)}% — spending exceeds plan`)
    if (summary.pendingMaintenance > 5) result.push(`${summary.pendingMaintenance} maintenance items pending — risk of asset downtime`)
    if (summary.criticalAlerts > 0) result.push(`${summary.criticalAlerts} critical alerts require immediate attention`)
    if (summary.pendingApprovals > 0) result.push(`${summary.pendingApprovals} approvals pending — may delay asset transactions`)
    if (summary.maintenanceCostForPeriod > summary.totalNetBookValue * 0.05) result.push('Maintenance cost exceeds 5% of net book value — consider replacement analysis')
    return result
  }, [summary])

  const actions = useMemo(() => {
    const result: string[] = []
    if (summary.fullyDepreciatedCount > 10) result.push('Review fully depreciated assets for disposal or revaluation')
    if (summary.budgetVariance < -0.1) result.push('Review capital budget vs actual and adjust forecasts')
    if (summary.pendingMaintenance > 5) result.push('Schedule pending maintenance to prevent downtime')
    if (summary.criticalAlerts > 0) result.push('Address all critical alerts before period close')
    if (summary.insuranceCoverage < 0.85) result.push('Update insurance coverage for current asset values')
    if (summary.pendingApprovals > 3) result.push('Clear pending approval queue to avoid transaction delays')
    result.push(`Monitor ${summary.averageAssetAge.toFixed(1)} year average asset age for lifecycle planning`)
    return result
  }, [summary])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
        <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Executive Summary</div>
        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          {pack?.executiveSummary || (
            `Portfolio of ${summary.totalAssets} assets valued at $${summary.totalNetBookValue.toLocaleString()} (cost basis: $${summary.totalCost.toLocaleString()}). ` +
            `Depreciation for period: $${summary.depreciationForPeriod.toLocaleString()}. ` +
            `${summary.capitalizedThisPeriod > 0 ? `New capitalizations: $${summary.capitalizedThisPeriod.toLocaleString()}. ` : ''}` +
            `${summary.disposedThisPeriod > 0 ? `Disposals: $${summary.disposedThisPeriod.toLocaleString()}. ` : ''}` +
            `Utilization rate at ${(summary.assetUtilizationRate * 100).toFixed(0)}%.`
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Assets', value: summary.totalAssets.toLocaleString(), color: '#e0e0e0' },
          { label: 'Total Cost', value: `$${summary.totalCost.toLocaleString()}`, color: '#e0e0e0' },
          { label: 'Net Book Value', value: `$${summary.totalNetBookValue.toLocaleString()}`, color: '#d4af37' },
          { label: 'Depreciation (Period)', value: `$${summary.depreciationForPeriod.toLocaleString()}`, color: '#eab308' },
          { label: 'Maintenance Cost', value: `$${summary.maintenanceCostForPeriod.toLocaleString()}`, color: '#f97316' },
          { label: 'Critical Alerts', value: summary.criticalAlerts.toString(), color: summary.criticalAlerts > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Utilization', value: `${(summary.assetUtilizationRate * 100).toFixed(0)}%`, color: summary.assetUtilizationRate > 0.85 ? '#22c55e' : '#eab308' },
          { label: 'Pending Approvals', value: summary.pendingApprovals.toString(), color: summary.pendingApprovals > 0 ? '#f97316' : '#22c55e' },
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
