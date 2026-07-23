'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExecutivePlanningSummary } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

export interface FPAExecutiveInsightsProps {
  summary: ExecutivePlanningSummary
  insights: { summary: string; highlights: string[]; risks: string[]; actions: string[] }
}

export function FPAExecutiveInsights({ summary, insights }: FPAExecutiveInsightsProps) {
  const highlights = useMemo(() => {
    const result: string[] = []
    if (summary.budgetNetIncome > 0) result.push(`Budget net income of ${formatCurrency(summary.budgetNetIncome)} — positive plan`)
    if (summary.totalRevenueBudget > 0) result.push(`Total revenue budget ${formatCurrency(summary.totalRevenueBudget)} across all plans`)
    if (summary.forecastConfidence > 0.8) result.push(`Forecast confidence at ${(summary.forecastConfidence * 100).toFixed(0)}% — strong visibility`)
    if (summary.activeScenarios > 2) result.push(`${summary.activeScenarios} active scenarios — robust planning coverage`)
    if (summary.strategicPlansActive > 0) result.push(`${summary.strategicPlansActive} active strategic plans aligned with budget`)
    return result
  }, [summary])

  const risks = useMemo(() => {
    const result: string[] = []
    if (summary.pendingApprovals > 0) result.push(`${summary.pendingApprovals} pending approvals may delay planning cycle`)
    if (summary.varianceSignificant > 0) result.push(`${summary.varianceSignificant} significant variances require investigation`)
    if (summary.openAlerts > 0) result.push(`${summary.openAlerts} open planning alerts need attention`)
    if (summary.forecastConfidence < 0.6) result.push(`Low forecast confidence (${(summary.forecastConfidence * 100).toFixed(0)}%) — consider scenario planning`)
    if (summary.budgetVariancePercent > 10) result.push(`Budget variance of ${summary.budgetVariancePercent.toFixed(1)}% exceeds threshold`)
    return result
  }, [summary])

  const actions = useMemo(() => {
    const result: string[] = []
    if (summary.pendingApprovals > 0) result.push('Approve pending plans to unblock planning cycle')
    if (summary.varianceSignificant > 0) result.push('Review and address significant budget variances')
    if (summary.openAlerts > 3) result.push('Resolve open alerts to improve planning accuracy')
    if (summary.forecastConfidence < 0.7) result.push('Run additional scenario analyses to improve forecast confidence')
    if (summary.activeScenarios === 0) result.push('Create scenarios to stress-test current budget assumptions')
    if (summary.activePlanLabel) result.push(`Active plan: ${summary.activePlanLabel}`)
    return result
  }, [summary])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
        <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Executive Summary</div>
        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          {insights.summary || (
            `${summary.activePlanLabel} — revenue budget ${formatCurrency(summary.totalRevenueBudget)}, ` +
            `expense budget ${formatCurrency(summary.totalExpenseBudget)}. ` +
            `Net income ${formatCurrency(summary.budgetNetIncome)}. ` +
            `Forecast confidence: ${(summary.forecastConfidence * 100).toFixed(0)}%. ` +
            `${summary.activeScenarios} active scenarios. ${summary.strategicPlansActive} strategic plans.`
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Revenue Budget', value: formatCurrency(summary.totalRevenueBudget), color: '#22c55e' },
          { label: 'Expense Budget', value: formatCurrency(summary.totalExpenseBudget), color: '#ef4444' },
          { label: 'Net Income', value: formatCurrency(summary.budgetNetIncome), color: summary.budgetNetIncome >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Revenue Forecast', value: formatCurrency(summary.revenueForecast), color: '#3b82f6' },
          { label: 'Expense Forecast', value: formatCurrency(summary.expenseForecast), color: '#eab308' },
          { label: 'Forecast Net Income', value: formatCurrency(summary.forecastNetIncome), color: summary.forecastNetIncome >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Capital Budget', value: formatCurrency(summary.totalCapitalBudget), color: '#d4a843' },
          { label: 'Cash Forecast', value: formatCurrency(summary.totalCashForecast), color: '#14b8a6' },
          { label: 'Headcount Planned', value: summary.totalHeadcountPlanned.toLocaleString(), color: '#a855f7' },
          { label: 'Budget Variance', value: `${summary.budgetVariancePercent >= 0 ? '+' : ''}${summary.budgetVariancePercent.toFixed(1)}%`, color: summary.budgetVariancePercent >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Forecast Confidence', value: `${(summary.forecastConfidence * 100).toFixed(0)}%`, color: summary.forecastConfidence >= 0.8 ? '#22c55e' : '#eab308' },
          { label: 'Open Alerts', value: summary.openAlerts.toString(), color: summary.openAlerts > 0 ? '#ef4444' : '#22c55e' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            style={{ background: '#1a1a2e', borderRadius: 8, padding: 14, textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Highlights</span>
          </div>
          {highlights.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No highlights available</div>
          ) : (
            highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#22c55e', flexShrink: 0 }}>●</span>
                <span>{h}</span>
              </div>
            ))
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Risks</span>
          </div>
          {risks.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No risks identified</div>
          ) : (
            risks.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>●</span>
                <span>{r}</span>
              </div>
            ))
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4a843' }} />
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Actions</span>
          </div>
          {actions.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No actions recommended</div>
          ) : (
            actions.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ color: '#d4a843', flexShrink: 0 }}>●</span>
                <span>{a}</span>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
