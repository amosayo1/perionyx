'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PlanningKPI, AggregatePlanningMetrics } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const categoryLabels: Record<string, string> = {
  budget: 'Budget', forecast: 'Forecast', variance: 'Variance',
  workforce: 'Workforce', capital: 'Capital', cash: 'Cash',
}

export interface FPAnalyticsDashboardProps {
  metrics: PlanningKPI[]
  aggregates: AggregatePlanningMetrics
}

export default function FPAnalyticsDashboard({ metrics, aggregates }: FPAnalyticsDashboardProps) {
  const grouped = useMemo(() => {
    const g: Record<string, PlanningKPI[]> = {}
    for (const m of metrics) {
      if (!g[m.category]) g[m.category] = []
      g[m.category].push(m)
    }
    return g
  }, [metrics])

  const aggregateItems = [
    { label: 'Total Plans', value: aggregates.totalPlans.toString(), color: '#e0e0e0' },
    { label: 'Active Plans', value: aggregates.activePlans.toString(), color: '#22c55e' },
    { label: 'Approved Plans', value: aggregates.approvedPlans.toString(), color: '#3b82f6' },
    { label: 'Revenue Budget', value: formatCurrency(aggregates.totalRevenueBudget), color: '#22c55e' },
    { label: 'Expense Budget', value: formatCurrency(aggregates.totalExpenseBudget), color: '#ef4444' },
    { label: 'Capital Budget', value: formatCurrency(aggregates.totalCapitalBudget), color: '#d4af37' },
    { label: 'Total Forecasts', value: aggregates.totalForecasts.toString(), color: '#e0e0e0' },
    { label: 'Total Scenarios', value: aggregates.totalScenarios.toString(), color: '#a855f7' },
    { label: 'Total What-If', value: aggregates.totalWhatIfAnalyses.toString(), color: '#f97316' },
    { label: 'Workforce Planned', value: aggregates.totalWorkforcePlanned.toLocaleString(), color: '#14b8a6' },
    { label: 'Capital Projects', value: aggregates.totalCapitalProjects.toString(), color: '#eab308' },
    { label: 'Strategic Plans', value: aggregates.totalStrategicPlans.toString(), color: '#e0e0e0' },
    { label: 'Budget Variance', value: `${aggregates.budgetVariancePercent >= 0 ? '+' : ''}${aggregates.budgetVariancePercent.toFixed(1)}%`, color: aggregates.budgetVariancePercent >= 0 ? '#22c55e' : '#ef4444' },
    { label: 'Forecast Accuracy', value: `${aggregates.forecastAccuracyPercent.toFixed(1)}%`, color: aggregates.forecastAccuracyPercent >= 80 ? '#22c55e' : aggregates.forecastAccuracyPercent >= 60 ? '#eab308' : '#ef4444' },
    { label: 'Planning Cycle', value: `${aggregates.planningCycleDays}d`, color: '#3b82f6' },
    { label: 'Scenario Coverage', value: `${aggregates.scenarioCoverage}%`, color: aggregates.scenarioCoverage >= 50 ? '#22c55e' : '#eab308' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {aggregateItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
            style={{ background: '#1a1a24', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No metrics available</div>
      ) : (
        Object.entries(grouped).map(([category, catMetrics]) => (
          <div key={category}>
            <h3 style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 600, margin: '0 0 10px 0' }}>{categoryLabels[category] ?? category}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {catMetrics.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ background: '#1a1a24', borderRadius: 8, padding: 14, border: '1px solid #2a2a4a', borderTop: `3px solid ${m.status === 'exceeding' ? '#22c55e' : m.status === 'onTrack' ? '#3b82f6' : m.status === 'atRisk' ? '#eab308' : '#ef4444'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#888', fontSize: 12 }}>{m.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'capitalize' }}>{m.trend}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ color: '#e0e0e0', fontSize: 20, fontWeight: 700 }}>
                      {m.value}<span style={{ color: '#888', fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Target: {m.target}{m.unit}</div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </motion.div>
  )
}
