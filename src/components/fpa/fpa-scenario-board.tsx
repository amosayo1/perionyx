'use client'

import { motion } from 'framer-motion'
import type { FPAScenarioBoardProps } from './fpa-types'
import type { ScenarioAssumption } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const riskColors: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
}

const statusColors: Record<string, string> = {
  draft: '#eab308',
  review: '#f97316',
  approved: '#22c55e',
  locked: '#3b82f6',
  archived: '#64748b',
}

export default function FPAScenarioBoard({ scenarios, comparisons }: FPAScenarioBoardProps) {
  const comparisonMap = new Map(comparisons.map((c) => [c.scenarioId, c]))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Scenario Planning</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {scenarios.map((s, i) => {
          const comp = comparisonMap.get(s.id)
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              style={{
                background: '#1a1a24',
                borderRadius: 12,
                border: '1px solid #2a2a3e',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ color: '#888', fontSize: 12, textTransform: 'capitalize', marginTop: 2 }}>{s.scenarioType} scenario</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ background: `${riskColors[s.riskLevel]}22`, color: riskColors[s.riskLevel], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{s.riskLevel} risk</span>
                  <span style={{ background: `${statusColors[s.status]}22`, color: statusColors[s.status], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{s.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: 12 }}>Probability:</span>
                <div style={{ flex: 1, height: 6, background: '#2a2a3e', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${s.probability}%`, height: '100%', background: '#d4af37', borderRadius: 3 }} />
                </div>
                <span style={{ color: '#d4af37', fontSize: 12, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{s.probability}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ color: '#888', fontSize: 11 }}>Revenue</div>
                  <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>{formatCurrency(s.totalRevenue)}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 11 }}>Expenses</div>
                  <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>{formatCurrency(s.totalExpenses)}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 11 }}>Net Income</div>
                  <div style={{ color: s.netIncome >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 600 }}>{formatCurrency(s.netIncome)}</div>
                </div>
              </div>
              {comp && (
                <div style={{ background: '#2a2a3e', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ color: '#888', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>vs Base</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#aaa', fontSize: 12 }}>
                      Variance: <span style={{ color: comp.varianceFromBase >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {comp.varianceFromBase >= 0 ? '+' : ''}{formatCurrency(comp.varianceFromBase)}
                      </span>
                    </span>
                    <span style={{ color: '#aaa', fontSize: 12 }}>
                      <span style={{ color: comp.variancePercentFromBase >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {comp.variancePercentFromBase >= 0 ? '+' : ''}{comp.variancePercentFromBase.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
              )}
              {s.assumptions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#888', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assumptions</div>
                  {s.assumptions.slice(0, 4).map((a) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#aaa' }}>{a.label}</span>
                      <span style={{ color: a.changePercent >= 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{a.changePercent >= 0 ? '+' : ''}{a.changePercent}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
