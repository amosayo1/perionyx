'use client'
import { motion } from 'framer-motion'
import type { FAAssetAnalyticsProps } from './fa-types'

const statusColors: Record<string, string> = {
  onTrack: '#22c55e',
  atRisk: '#eab308',
  critical: '#ef4444',
  exceeding: '#3b82f6',
}

const trendIcons: Record<string, string> = {
  improving: '↑',
  worsening: '↓',
  stable: '→',
}

const trendColors: Record<string, string> = {
  improving: '#22c55e',
  worsening: '#ef4444',
  stable: '#888',
}

export default function FAAssetAnalytics({ kpis, aggregates, categoryBreakdown }: FAAssetAnalyticsProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700 }}>Key Performance Indicators</div>
          <span style={{ color: '#64748b', fontSize: 11 }}>{kpis.length} metrics</span>
        </div>
        {kpis.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>No KPI data available</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, borderTop: `3px solid ${statusColors[kpi.status] || '#888'}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: 11, fontWeight: 500 }}>{kpi.name}</span>
                  <span style={{ background: `${statusColors[kpi.status]}20`, color: statusColors[kpi.status], padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'capitalize' }}>
                    {kpi.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ color: '#e0e0e0', fontSize: 24, fontWeight: 700 }}>
                    {kpi.value.toLocaleString()}
                    <span style={{ color: '#888', fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{kpi.unit}</span>
                  </span>
                  <span style={{ color: trendColors[kpi.trend], fontSize: 14, fontWeight: 600 }}>{trendIcons[kpi.trend]}</span>
                </div>
                <div style={{ color: '#888', fontSize: 11 }}>Target: {kpi.target.toLocaleString()}{kpi.unit}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Aggregate Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { label: 'Total Assets', value: aggregates.totalAssets.toLocaleString(), unit: '' },
            { label: 'Active Assets', value: aggregates.activeAssets.toLocaleString(), unit: '' },
            { label: 'Total Cost', value: aggregates.totalCost.toLocaleString(), unit: '' },
            { label: 'Net Book Value', value: aggregates.totalNetBookValue.toLocaleString(), unit: '' },
            { label: 'Accum. Depreciation', value: aggregates.totalAccumulatedDepreciation.toLocaleString(), unit: '' },
            { label: 'Utilization Rate', value: (aggregates.assetUtilizationRate * 100).toFixed(1), unit: '%' },
            { label: 'Maintenance Cost', value: aggregates.totalMaintenanceCost.toLocaleString(), unit: '' },
            { label: 'Impairment Loss', value: aggregates.totalImpairmentLoss.toLocaleString(), unit: '' },
            { label: 'Under Maintenance', value: aggregates.underMaintenance.toLocaleString(), unit: '' },
            { label: 'Avg Remaining Life', value: aggregates.averageRemainingLife.toFixed(1), unit: 'yr' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.02 }}
              style={{ background: '#16213e', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#e0e0e0', fontSize: 15, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                {item.unit === '%' ? `${item.value}%` : item.label.includes('Rate') ? `${item.value}%` : `$${item.value}`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {categoryBreakdown && categoryBreakdown.length > 0 && (
        <div>
          <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Category Breakdown</div>
          <div style={{ background: '#1a1a2e', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a4a' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#16213e', borderBottom: '1px solid #2a2a4a' }}>
                  {['Category', 'Count', 'Total Value'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, textAlign: 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat, i) => (
                  <motion.tr key={cat.category} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: i < categoryBreakdown.length - 1 ? '1px solid #2a2a4a' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: '#e0e0e0', fontWeight: 500, textAlign: 'right' }}>{cat.category}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8', textAlign: 'right' }}>{cat.count}</td>
                    <td style={{ padding: '10px 14px', color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>${cat.value.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
