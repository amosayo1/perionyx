'use client'
import { motion } from 'framer-motion'
import type { WhatIfAnalysis } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const statusColors: Record<string, string> = { draft: '#eab308', completed: '#22c55e', reviewed: '#3b82f6' }

function ImpactBadge({ value }: { value: number }) {
  const color = value >= 0 ? '#22c55e' : '#ef4444'
  return (
    <span style={{ color, fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>
      {value >= 0 ? '+' : ''}{formatCurrency(value)}
    </span>
  )
}

export interface FPAWhatIfAnalysisProps {
  analyses: WhatIfAnalysis[]
}

export default function FPAWhatIfAnalysis({ analyses }: FPAWhatIfAnalysisProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {analyses.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No what-if analyses available</div>
      ) : (
        analyses.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e0e0e0' }}>{a.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{a.description}</div>
              </div>
              <span style={{ background: (statusColors[a.status] ?? '#64748b') + '22', color: statusColors[a.status] ?? '#64748b', fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 10, textTransform: 'capitalize' }}>
                {a.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Revenue Impact</div>
                <ImpactBadge value={a.totalRevenueImpact} />
              </div>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Expense Impact</div>
                <ImpactBadge value={a.totalExpenseImpact} />
              </div>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Net Income Impact</div>
                <ImpactBadge value={a.netIncomeImpact} />
              </div>
            </div>

            {a.assumptions.length > 0 && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Assumptions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {a.assumptions.map(ass => (
                    <div key={ass.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#16213e', borderRadius: 4, fontSize: 12 }}>
                      <span style={{ color: '#e0e0e0' }}>{ass.label}</span>
                      <span style={{ color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>
                        {formatCurrency(ass.baseValue)} → {formatCurrency(ass.adjustedValue)} ({ass.changePercent >= 0 ? '+' : ''}{ass.changePercent.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))
      )}
    </motion.div>
  )
}
