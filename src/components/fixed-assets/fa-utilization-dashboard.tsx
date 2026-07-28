'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FAUtilizationDashboardProps } from './fa-types'

const getUtilColor = (rate: number) => rate >= 85 ? '#22c55e' : rate >= 70 ? '#eab308' : '#ef4444'

export default function FAUtilizationDashboard({ reports }: FAUtilizationDashboardProps) {
  const sorted = useMemo(() => [...reports].sort((a, b) => b.utilizationRate - a.utilizationRate), [reports])

  const aggregate = useMemo(() => {
    if (!reports.length) return null
    return {
      avgUtilization: reports.reduce((s, r) => s + r.utilizationRate, 0) / reports.length,
      totalDowntime: reports.reduce((s, r) => s + r.downtimeHours, 0),
      avgCostPerHour: reports.reduce((s, r) => s + r.costPerHour, 0) / reports.length,
      avgUptime: reports.reduce((s, r) => s + r.uptimePercent, 0) / reports.length,
      above85: reports.filter(r => r.utilizationRate >= 85).length,
      below70: reports.filter(r => r.utilizationRate < 70).length,
    }
  }, [reports])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {aggregate && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { label: 'Avg Utilization', value: `${aggregate.avgUtilization.toFixed(1)}%`, color: getUtilColor(aggregate.avgUtilization) },
            { label: 'Avg Uptime', value: `${aggregate.avgUptime.toFixed(1)}%`, color: aggregate.avgUptime >= 95 ? '#22c55e' : '#eab308' },
            { label: 'Total Downtime', value: `${aggregate.totalDowntime.toFixed(0)}h`, color: aggregate.totalDowntime > 100 ? '#ef4444' : '#eab308' },
            { label: 'Avg Cost/Hour', value: `$${aggregate.avgCostPerHour.toFixed(2)}`, color: '#e0e0e0' },
            { label: 'Above 85%', value: aggregate.above85.toString(), color: '#22c55e' },
            { label: 'Below 70%', value: aggregate.below70.toString(), color: '#ef4444' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 + i * 0.02 }}
              style={{ background: '#16213e', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: item.color, fontSize: 16, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>No utilization data available</div>
      ) : (
        <div style={{ background: '#1a1a24', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a4a' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#16213e', borderBottom: '1px solid #2a2a4a' }}>
                {['Asset', 'Utilization', 'Target', 'Downtime', 'Cost/Hr', 'Uptime'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, textAlign: 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const utilColor = getUtilColor(r.utilizationRate * 100)
                return (
                  <motion.tr key={r.assetId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: i < sorted.length - 1 ? '1px solid #2a2a4a' : 'none' }}>
                    <td style={{ padding: '12px 14px', color: '#e0e0e0', fontWeight: 500, textAlign: 'right' }}>{r.assetName}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ color: utilColor, fontWeight: 600, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
                          {(r.utilizationRate * 100).toFixed(0)}%
                        </span>
                        <div style={{ width: 60, height: 6, background: '#16213e', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(r.utilizationRate * 100, 100)}%`, height: '100%', background: utilColor, borderRadius: 3, transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 11, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>85%</td>
                    <td style={{ padding: '12px 14px', color: r.downtimeHours > 50 ? '#ef4444' : '#94a3b8', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>{r.downtimeHours.toFixed(0)}h</td>
                    <td style={{ padding: '12px 14px', color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>${r.costPerHour.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', color: r.uptimePercent >= 95 ? '#22c55e' : r.uptimePercent >= 85 ? '#eab308' : '#ef4444', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>
                      {r.uptimePercent.toFixed(1)}%
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
