'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FARevaluationDashboardProps } from './fa-types'

export default function FARevaluationDashboard({ revaluations }: FARevaluationDashboardProps) {
  const sorted = useMemo(() => [...revaluations].sort((a, b) => new Date(b.revaluationDate).getTime() - new Date(a.revaluationDate).getTime()), [revaluations])

  const maxCarrying = useMemo(() => Math.max(...revaluations.map(r => r.previousCarryingAmount), 1), [revaluations])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {sorted.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>No revaluation records</div>
        ) : (
          sorted.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a', borderTop: `3px solid ${r.revaluationType === 'upward' ? '#22c55e' : '#ef4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>Revaluation {r.revaluationType === 'upward' ? 'Upward' : 'Downward'}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(r.revaluationDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
                <span style={{ background: (r.revaluationType === 'upward' ? '#22c55e' : '#ef4444') + '22', color: r.revaluationType === 'upward' ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>
                  {r.revaluationType === 'upward' ? '↑' : '↓'} {r.revaluationType}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>Fair Value</span>
                  <span style={{ color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600 }}>${r.fairValue.toLocaleString()}</span>
                </div>
                <div style={{ position: 'relative', height: 8, background: '#16213e', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(r.fairValue / Math.max(r.previousCarryingAmount, r.fairValue)) * 100}%`, height: '100%', background: r.revaluationType === 'upward' ? '#22c55e' : '#ef4444', borderRadius: 4, transition: 'width 0.3s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>Carrying Amount</span>
                  <span style={{ color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600 }}>${r.previousCarryingAmount.toLocaleString()}</span>
                </div>
                <div style={{ position: 'relative', height: 8, background: '#16213e', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(r.previousCarryingAmount / Math.max(r.previousCarryingAmount, r.fairValue)) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: 4, transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Surplus</div>
                  <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>+${r.revaluationSurplus.toLocaleString()}</div>
                </div>
                {r.revaluationLoss > 0 && (
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Loss</div>
                    <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>-${r.revaluationLoss.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {(r.appraisedBy || r.appraisalMethod) && (
                <div style={{ padding: '8px 0', borderTop: '1px solid #2a2a4a', fontSize: 11, color: '#94a3b8' }}>
                  {r.appraisalMethod && <span>Method: {r.appraisalMethod} &middot; </span>}
                  {r.appraisedBy && <span>Appraiser: {r.appraisedBy}</span>}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
