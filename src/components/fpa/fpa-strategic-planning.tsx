'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { StrategicPlan } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const statusColors: Record<string, string> = { draft: '#64748b', review: '#eab308', approved: '#22c55e', locked: '#3b82f6', archived: '#ef4444' }

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0
  return (
    <div style={{ width: '100%', height: 6, background: '#16213e', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444', borderRadius: 3, transition: 'width 0.3s ease' }} />
    </div>
  )
}

export interface FPAStrategicPlanningProps {
  plans: StrategicPlan[]
}

export default function FPAStrategicPlanning({ plans }: FPAStrategicPlanningProps) {
  const totalInvestment = useMemo(() => plans.reduce((s, p) => s + p.totalInvestment, 0), [plans])
  const totalRevenue = useMemo(() => plans.reduce((s, p) => s + p.totalRevenue, 0), [plans])
  const avgROI = useMemo(() => plans.length ? plans.reduce((s, p) => s + p.projectedROI, 0) / plans.length : 0, [plans])

  const summaryItems = [
    { label: 'Total Plans', value: plans.length.toString(), color: '#e0e0e0' },
    { label: 'Total Investment', value: formatCurrency(totalInvestment), color: '#d4af37' },
    { label: 'Projected Revenue', value: formatCurrency(totalRevenue), color: '#22c55e' },
    { label: 'Avg ROI', value: `${avgROI.toFixed(1)}%`, color: avgROI >= 0 ? '#22c55e' : '#ef4444' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {summaryItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#1a1a24', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No strategic plans available</div>
      ) : (
        plans.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: '#1a1a24', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e0e0e0' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{p.description}</div>
              </div>
              <span style={{ background: (statusColors[p.status] ?? '#64748b') + '22', color: statusColors[p.status] ?? '#64748b', fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 10, textTransform: 'capitalize' }}>
                {p.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#64748b', fontSize: 11 }}>Year Range:</span>
              <span style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 500 }}>{p.fiscalYearStart} – {p.fiscalYearEnd}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Revenue</div>
                <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.totalRevenue)}</span>
              </div>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Investment</div>
                <span style={{ color: '#d4af37', fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.totalInvestment)}</span>
              </div>
              <div style={{ background: '#16213e', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Projected ROI</div>
                <span style={{ color: p.projectedROI >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 600 }}>{p.projectedROI.toFixed(1)}%</span>
              </div>
            </div>

            {p.objectives.length > 0 && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Objectives & Key Results</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.objectives.map(obj => {
                    const avgProgress = obj.keyResults.length > 0
                      ? obj.keyResults.reduce((s, kr) => s + (kr.target > 0 ? kr.current / kr.target : 0), 0) / obj.keyResults.length * 100
                      : 0
                    return (
                      <div key={obj.id} style={{ background: '#16213e', borderRadius: 6, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>{obj.objective}</span>
                          <span style={{ color: '#94a3b8', fontSize: 11 }}>{Math.round(avgProgress)}%</span>
                        </div>
                        <ProgressBar value={avgProgress} max={100} />
                        {obj.keyResults.length > 0 && (
                          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                            {obj.keyResults.map(kr => (
                              <div key={kr.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                <span style={{ color: '#94a3b8' }}>{kr.metric}:</span>
                                <span style={{ color: '#e0e0e0', fontFamily: 'ui-monospace, monospace' }}>{kr.current}/{kr.target}</span>
                                <span style={{ color: '#64748b' }}>{kr.unit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ))
      )}
    </motion.div>
  )
}
