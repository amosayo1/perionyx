'use client'

import { motion } from 'framer-motion'
import type { FPARevenuePlanningProps } from './fpa-types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const getGMColor = (pct: number) => {
  if (pct >= 50) return '#22c55e'
  if (pct >= 30) return '#eab308'
  return '#ef4444'
}

const typeLabels: Record<string, string> = {
  product: 'Product',
  service: 'Service',
  subscription: 'Subscription',
  other: 'Other',
}

export default function FPARevenuePlanning({ revenues }: FPARevenuePlanningProps) {
  const totalRevenue = revenues.reduce((s, r) => s + r.revenue, 0)
  const totalCOGS = revenues.reduce((s, r) => s + r.costOfGoodsSold, 0)
  const totalGM = revenues.reduce((s, r) => s + r.grossMargin, 0)
  const overallGMPct = totalRevenue > 0 ? (totalGM / totalRevenue) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h3 style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, margin: 0 }}>Revenue Planning</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
              {['Product Line', 'Type', 'Volume', 'Unit Price', 'Revenue', 'COGS', 'Gross Margin', 'GM %', 'Growth'].map((h) => (
                <th key={h} style={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenues.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                style={{ borderBottom: '1px solid #2a2a3e' }}
              >
                <td style={{ padding: '10px 12px', color: '#e0e0e0', fontWeight: 500 }}>{r.productLine}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: '#2a2a3e', color: '#94a3b8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{typeLabels[r.revenueType] || r.revenueType}</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#aaa' }}>{r.volume.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#d4af37', fontWeight: 600 }}>{formatCurrency(r.unitPrice)}</td>
                <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>{formatCurrency(r.revenue)}</td>
                <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(r.costOfGoodsSold)}</td>
                <td style={{ padding: '10px 12px', color: r.grossMargin >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{formatCurrency(r.grossMargin)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ color: getGMColor(r.grossMarginPercent), fontWeight: 700 }}>{r.grossMarginPercent.toFixed(1)}%</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ color: r.growthRate >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {r.growthRate >= 0 ? '\u2191' : '\u2193'} {Math.abs(r.growthRate).toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #d4af37' }}>
              <td style={{ padding: '10px 12px', color: '#d4af37', fontWeight: 700, fontSize: 12 }}>TOTAL</td>
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px' }} />
              <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(totalRevenue)}</td>
              <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 700 }}>{formatCurrency(totalCOGS)}</td>
              <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(totalGM)}</td>
              <td style={{ padding: '10px 12px', color: getGMColor(overallGMPct), fontWeight: 700 }}>{overallGMPct.toFixed(1)}%</td>
              <td style={{ padding: '10px 12px' }} />
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  )
}
