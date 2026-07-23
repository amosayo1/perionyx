'use client'

import { motion } from 'framer-motion'
import type { FPABudgetBoardProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const statusColors: Record<string, string> = {
  draft: '#eab308',
  review: '#f97316',
  approved: '#22c55e',
  locked: '#3b82f6',
  archived: '#64748b',
}

const planTypeColors: Record<string, { bg: string; color: string }> = {
  annual: { bg: '#d4a84322', color: '#d4a843' },
  quarterly: { bg: '#94a3b822', color: '#94a3b8' },
  rolling: { bg: '#3b82f622', color: '#3b82f6' },
  monthly: { bg: '#a855f722', color: '#a855f7' },
  strategic: { bg: '#f9731622', color: '#f97316' },
}

export default function FPABudgetBoard({ plans }: FPABudgetBoardProps) {
  const totalRevenue = plans.reduce((s, p) => s + p.totalRevenue, 0)
  const totalExpenses = plans.reduce((s, p) => s + p.totalExpenses, 0)
  const totalNetIncome = plans.reduce((s, p) => s + p.netIncome, 0)
  const totalHeadcount = plans.reduce((s, p) => s + p.headcount, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Budget Plans</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
              {['Plan Name', 'Type', 'Year', 'Status', 'Revenue', 'Expenses', 'Net Income', 'Headcount'].map((h) => (
                <th key={h} style={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((p, i) => {
              const ptc = planTypeColors[p.planType] || { bg: '#64748b22', color: '#64748b' }
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  style={{ borderBottom: '1px solid #2a2a3e' }}
                >
                  <td style={{ padding: '10px 12px', color: '#e0e0e0', fontWeight: 500 }}>{p.label}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: ptc.bg, color: ptc.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{p.planType}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#aaa' }}>{p.fiscalYear}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: `${statusColors[p.status]}22`, color: statusColors[p.status], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>{formatCurrency(p.totalRevenue)}</td>
                  <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(p.totalExpenses)}</td>
                  <td style={{ padding: '10px 12px', color: p.netIncome >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{formatCurrency(p.netIncome)}</td>
                  <td style={{ padding: '10px 12px', color: '#aaa' }}>{p.headcount}</td>
                </motion.tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #d4a843' }}>
              <td style={{ padding: '10px 12px', color: '#d4a843', fontWeight: 700, fontSize: 12 }}>TOTAL</td>
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(totalRevenue)}</td>
              <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 700 }}>{formatCurrency(totalExpenses)}</td>
              <td style={{ padding: '10px 12px', color: totalNetIncome >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{formatCurrency(totalNetIncome)}</td>
              <td style={{ padding: '10px 12px', color: '#d4a843', fontWeight: 700 }}>{totalHeadcount}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  )
}
