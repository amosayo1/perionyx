'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { VarianceAnalysisRecord } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

function DirectionBadge({ direction }: { direction: string }) {
  const isFavorable = direction === 'favorable'
  const color = isFavorable ? '#22c55e' : '#ef4444'
  return (
    <span style={{ background: color + '22', color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize' }}>
      {direction === 'neutral' ? 'Neutral' : isFavorable ? 'Favorable' : 'Unfavorable'}
    </span>
  )
}

export interface FPAVarianceAnalysisProps {
  records: VarianceAnalysisRecord[]
}

export default function FPAVarianceAnalysis({ records }: FPAVarianceAnalysisProps) {
  const totals = useMemo(() => {
    const totalActual = records.reduce((s, r) => s + r.actualAmount, 0)
    const totalPlan = records.reduce((s, r) => s + r.planAmount, 0)
    const totalVariance = records.reduce((s, r) => s + r.variance, 0)
    const significant = records.filter(r => r.isSignificant).length
    const favorable = records.filter(r => r.direction === 'favorable').length
    const unfavorable = records.filter(r => r.direction === 'unfavorable').length
    return { totalActual, totalPlan, totalVariance, significant, favorable, unfavorable }
  }, [records])

  const summaryItems = [
    { label: 'Total Actual', value: formatCurrency(totals.totalActual), color: '#e0e0e0' },
    { label: 'Total Plan', value: formatCurrency(totals.totalPlan), color: '#3b82f6' },
    { label: 'Total Variance', value: formatCurrency(totals.totalVariance), color: totals.totalVariance >= 0 ? '#22c55e' : '#ef4444' },
    { label: 'Significant', value: totals.significant.toString(), color: totals.significant > 0 ? '#ef4444' : '#22c55e' },
    { label: 'Favorable', value: totals.favorable.toString(), color: '#22c55e' },
    { label: 'Unfavorable', value: totals.unfavorable.toString(), color: '#ef4444' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {summaryItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#1a1a2e', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {records.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No variance records available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.5fr 0.7fr', gap: 8, padding: '8px 12px', color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2a2a4a' }}>
            <span>Account</span>
            <span>Period</span>
            <span>Actual</span>
            <span>Plan</span>
            <span>Variance</span>
            <span>%</span>
            <span>Direction</span>
          </div>
          {records.map((r, i) => {
            const isSig = r.isSignificant
            const varColor = r.direction === 'favorable' ? '#22c55e' : r.direction === 'unfavorable' ? '#ef4444' : '#94a3b8'
            return (
              <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.5fr 0.7fr', gap: 8, padding: '10px 12px', background: '#1a1a2e', borderRadius: 6, alignItems: 'center', border: `1px solid ${isSig ? '#2a2a4a' : '#2a2a4a'}`, borderLeft: isSig ? `3px solid ${r.direction === 'favorable' ? '#eab308' : '#ef4444'}` : '3px solid transparent' }}>
                <span style={{ color: '#e0e0e0', fontSize: 12, fontWeight: isSig ? 700 : 400 }}>{r.accountName}</span>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>{r.fiscalYear}.{r.fiscalPeriod}</span>
                <span style={{ color: '#e0e0e0', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(r.actualAmount)}</span>
                <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(r.planAmount)}</span>
                <span style={{ color: isSig ? (r.direction === 'favorable' ? '#eab308' : '#ef4444') : varColor, fontSize: 12, fontWeight: isSig ? 700 : 500, fontFamily: 'ui-monospace, monospace' }}>
                  {r.variance >= 0 ? '+' : ''}{formatCurrency(r.variance)}
                </span>
                <span style={{ color: isSig ? (r.direction === 'favorable' ? '#eab308' : '#ef4444') : '#94a3b8', fontSize: 12, fontWeight: isSig ? 700 : 400, fontFamily: 'ui-monospace, monospace' }}>
                  {r.variancePercent >= 0 ? '+' : ''}{r.variancePercent.toFixed(1)}%
                </span>
                <DirectionBadge direction={r.direction} />
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
