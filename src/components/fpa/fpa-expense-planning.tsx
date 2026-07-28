'use client'

import { motion } from 'framer-motion'
import type { FPAExpensePlanningProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const expenseTypeColors: Record<string, { bg: string; color: string }> = {
  fixed: { bg: '#3b82f622', color: '#3b82f6' },
  variable: { bg: '#f9731622', color: '#f97316' },
  semiVariable: { bg: '#a855f722', color: '#a855f7' },
}

export default function FPAExpensePlanning({ expenses }: FPAExpensePlanningProps) {
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Expense Planning</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
              {['Department', 'Category', 'Type', 'Amount', 'Cost Driver', 'Discretionary'].map((h) => (
                <th key={h} style={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => {
              const etc = expenseTypeColors[e.expenseType] || { bg: '#64748b22', color: '#64748b' }
              return (
                <motion.tr
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  style={{ borderBottom: '1px solid #2a2a3e' }}
                >
                  <td style={{ padding: '10px 12px', color: '#e0e0e0', fontWeight: 500 }}>{e.department}</td>
                  <td style={{ padding: '10px 12px', color: '#aaa' }}>{e.category}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: etc.bg, color: etc.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{e.expenseType}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(e.amount)}</td>
                  <td style={{ padding: '10px 12px', color: '#aaa' }}>{e.costDriver || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {e.isDiscretionary ? (
                      <span style={{ background: '#eab30822', color: '#eab308', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Discretionary</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: 11 }}>Required</span>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #d4af37' }}>
              <td style={{ padding: '10px 12px', color: '#d4af37', fontWeight: 700, fontSize: 12 }}>TOTAL</td>
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 700 }}>{formatCurrency(totalAmount)}</td>
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  )
}
