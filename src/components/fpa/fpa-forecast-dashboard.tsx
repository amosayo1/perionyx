'use client'

import { motion } from 'framer-motion'
import type { FPAForecastDashboardProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const statusColors: Record<string, string> = {
  draft: '#eab308',
  review: '#f97316',
  approved: '#22c55e',
  locked: '#3b82f6',
  archived: '#64748b',
}

const forecastTypeLabels: Record<string, string> = {
  rolling13Week: '13-Week Rolling',
  rolling24Month: '24-Month Rolling',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

const getConfidenceColor = (level: number) => {
  if (level >= 80) return '#22c55e'
  if (level >= 50) return '#eab308'
  return '#ef4444'
}

export default function FPAForecastDashboard({ forecasts }: FPAForecastDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Forecasts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {forecasts.map((f, i) => {
          const confidenceColor = getConfidenceColor(f.confidenceLevel)
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              style={{
                background: '#1a1a24',
                borderRadius: 12,
                border: '1px solid #2a2a3e',
                borderLeft: `4px solid ${confidenceColor}`,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 600 }}>{f.label}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{forecastTypeLabels[f.forecastType] || f.forecastType} &middot; v{f.version}</div>
                </div>
                <span style={{ background: `${statusColors[f.status]}22`, color: statusColors[f.status], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{f.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#888', fontSize: 12 }}>Confidence</span>
                  <span style={{ color: confidenceColor, fontSize: 13, fontWeight: 600 }}>{f.confidenceLevel}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#2a2a3e', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${f.confidenceLevel}%`, height: '100%', background: confidenceColor, borderRadius: 3, transition: 'width 0.3s ease' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#888', fontSize: 11 }}>Revenue</span>
                  <span style={{ color: '#22c55e', fontSize: 15, fontWeight: 700 }}>{formatCurrency(f.totalRevenue)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#888', fontSize: 11 }}>Expenses</span>
                  <span style={{ color: '#ef4444', fontSize: 15, fontWeight: 700 }}>{formatCurrency(f.totalExpenses)}</span>
                </div>
              </div>
              <div style={{ color: '#aaa', fontSize: 12 }}>
                Net Income: <span style={{ color: f.netIncome >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{formatCurrency(f.netIncome)}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
