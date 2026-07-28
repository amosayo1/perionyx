'use client'

import { motion } from 'framer-motion'
import type { FPAExecutiveHeaderProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

export default function FPAExecutiveHeader({ summary }: FPAExecutiveHeaderProps) {
  const metrics = [
    { label: 'Revenue Budget', value: formatCurrency(summary.totalRevenueBudget), color: '#22c55e', detail: `${formatCurrency(summary.totalExpenseBudget)} expenses` },
    { label: 'Expense Budget', value: formatCurrency(summary.totalExpenseBudget), color: '#ef4444', detail: `${Math.round(summary.budgetVariancePercent)}% variance` },
    { label: 'Net Income', value: formatCurrency(summary.budgetNetIncome), color: summary.budgetNetIncome >= 0 ? '#22c55e' : '#ef4444', detail: `Budget: ${formatCurrency(summary.budgetNetIncome)}` },
    { label: 'Revenue Forecast', value: formatCurrency(summary.revenueForecast), color: '#3b82f6', detail: `vs budget ${summary.budgetVariancePercent >= 0 ? '\u2191' : '\u2193'} ${Math.abs(summary.budgetVariancePercent)}%` },
    { label: 'Forecast Confidence', value: `${Math.round(summary.forecastConfidence)}%`, color: summary.forecastConfidence >= 80 ? '#22c55e' : summary.forecastConfidence >= 50 ? '#eab308' : '#ef4444', detail: `${summary.pendingApprovals} pending approvals` },
    { label: 'Active Plans', value: `${summary.activeScenarios}`, color: '#d4af37', detail: `${summary.capitalsProjectsActive} capital projects` },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          style={{
            background: '#1a1a24',
            borderRadius: 12,
            borderLeft: `4px solid ${m.color}`,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ color: '#888', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {m.label}
          </div>
          <div style={{ color: '#e0e0e0', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
            {m.value}
          </div>
          <div style={{ color: '#aaa', fontSize: 13 }}>
            {m.detail}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
