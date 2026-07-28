'use client'

import { motion } from 'framer-motion'
import type { FPACapitalPlanningProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const statusColors: Record<string, string> = {
  planned: '#eab308',
  approved: '#3b82f6',
  inProgress: '#22c55e',
  completed: '#64748b',
  cancelled: '#ef4444',
}

const priorityColors: Record<string, { bg: string; color: string }> = {
  critical: { bg: '#ef444422', color: '#ef4444' },
  high: { bg: '#f9731622', color: '#f97316' },
  medium: { bg: '#eab30822', color: '#eab308' },
  low: { bg: '#64748b22', color: '#64748b' },
}

const projectTypeLabels: Record<string, string> = {
  it: 'IT',
  equipment: 'Equipment',
  facilities: 'Facilities',
  rAndD: 'R&D',
  other: 'Other',
}

export default function FPACapitalPlanning({ capitals }: FPACapitalPlanningProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Capital Planning</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {capitals.map((c, i) => {
          const spentPct = c.totalBudget > 0 ? (c.spentToDate / c.totalBudget) * 100 : 0
          const pc = priorityColors[c.priority] || priorityColors.medium
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              style={{
                background: '#1a1a24',
                borderRadius: 12,
                border: '1px solid #2a2a3e',
                borderLeft: `4px solid ${statusColors[c.status] || '#64748b'}`,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 600 }}>{c.projectName}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{projectTypeLabels[c.projectType] || c.projectType} &middot; {c.department}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ background: pc.bg, color: pc.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{c.priority}</span>
                  <span style={{ background: `${statusColors[c.status]}22`, color: statusColors[c.status], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{c.status === 'inProgress' ? 'In Progress' : c.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>Budget Progress</span>
                  <span style={{ color: spentPct > 90 ? '#ef4444' : spentPct > 70 ? '#eab308' : '#22c55e', fontWeight: 600 }}>{spentPct.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#2a2a3e', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(spentPct, 100)}%`, height: '100%', background: spentPct > 90 ? '#ef4444' : spentPct > 70 ? '#eab308' : '#22c55e', borderRadius: 4, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#22c55e' }}>{formatCurrency(c.spentToDate)} spent</span>
                  <span style={{ color: '#aaa' }}>{formatCurrency(c.remainingBudget)} remaining</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ color: '#888', fontSize: 11 }}>Total Budget</div>
                  <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 700 }}>{formatCurrency(c.totalBudget)}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 11 }}>ROI</div>
                  <div style={{ color: c.roi >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 700 }}>{c.roi.toFixed(1)}%</div>
                </div>
              </div>
              {c.sponsor && (
                <div style={{ color: '#888', fontSize: 12 }}>
                  Sponsor: <span style={{ color: '#aaa' }}>{c.sponsor}</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
