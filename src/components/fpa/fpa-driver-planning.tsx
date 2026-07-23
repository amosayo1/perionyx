'use client'

import { motion } from 'framer-motion'
import type { FPADriverPlanningProps } from './fpa-types'

const categoryColors: Record<string, string> = {
  revenue: '#22c55e',
  volume: '#3b82f6',
  pricing: '#d4a843',
  headcount: '#a855f7',
  salary: '#f97316',
  utilization: '#06b6d4',
  inflation: '#ef4444',
  fx: '#eab308',
  capitalSpend: '#64748b',
  opex: '#8b5cf6',
}

const categoryLabels: Record<string, string> = {
  revenue: 'Revenue',
  volume: 'Volume',
  pricing: 'Pricing',
  headcount: 'Headcount',
  salary: 'Salary',
  utilization: 'Utilization',
  inflation: 'Inflation',
  fx: 'FX',
  capitalSpend: 'Capital Spend',
  opex: 'OpEx',
}

export default function FPADriverPlanning({ drivers }: FPADriverPlanningProps) {
  const grouped = drivers.reduce<Record<string, typeof drivers>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = []
    acc[d.category].push(d)
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Driver Planning</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(grouped).map(([category, items]) => {
          const catColor = categoryColors[category] || '#64748b'
          return (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: catColor }} />
                <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>{categoryLabels[category] || category}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {items.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    style={{
                      background: '#1a1a2e',
                      borderRadius: 10,
                      border: `1px solid #2a2a3e`,
                      borderLeft: `3px solid ${catColor}`,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{d.description}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#888', fontSize: 11 }}>Current</span>
                        <div style={{ color: '#e0e0e0', fontWeight: 600 }}>{d.value.toLocaleString()} {d.unit}</div>
                      </div>
                      <div>
                        <span style={{ color: '#888', fontSize: 11 }}>Previous</span>
                        <div style={{ color: '#aaa', fontWeight: 600 }}>{d.previousValue.toLocaleString()} {d.unit}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: d.growthRate >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 700 }}>
                        {d.growthRate >= 0 ? '\u2191' : '\u2193'} {Math.abs(d.growthRate).toFixed(1)}%
                      </span>
                      <span style={{ color: '#888', fontSize: 11 }}>growth rate</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
