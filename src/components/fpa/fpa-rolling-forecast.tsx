'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Forecast, ForecastLineItem } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

function ConfidenceBar({ lower, upper, value }: { lower: number; upper: number; value: number }) {
  const range = upper - lower
  const minPct = range > 0 ? ((value - lower) / range) * 100 : 50
  const width = range > 0 ? (upper - value) / range * 50 + 25 : 50
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#64748b', fontSize: 9, fontFamily: 'ui-monospace, monospace', width: 16 }}>{formatCurrency(lower).charAt(0)}</span>
      <div style={{ flex: 1, height: 4, background: '#16213e', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: `${Math.max(0, minPct - width / 2)}%`, width: `${width}%`, height: '100%', background: '#3b82f6', borderRadius: 2, opacity: 0.6 }} />
        <div style={{ position: 'absolute', left: `${minPct}%`, width: 4, height: 8, background: '#d4a843', borderRadius: 2, transform: 'translateX(-2px)', top: -2 }} />
      </div>
      <span style={{ color: '#64748b', fontSize: 9, fontFamily: 'ui-monospace, monospace', width: 16, textAlign: 'right' }}>{formatCurrency(upper).charAt(0)}</span>
    </div>
  )
}

function TrendBar({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const barHeight = 28
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: barHeight, padding: '4px 0' }}>
      {values.map((v, i) => {
        const h = Math.max(3, ((v - min) / range) * barHeight)
        return (
          <div key={i} style={{ flex: 1, height: h, background: i >= values.length - 1 ? '#d4a843' : '#3b82f6', borderRadius: '2px 2px 0 0', opacity: 0.7 }} />
        )
      })}
    </div>
  )
}

export interface FPARollingForecastProps {
  forecast: Forecast
  lineItems: ForecastLineItem[]
}

export default function FPARollingForecast({ forecast, lineItems }: FPARollingForecastProps) {
  const totalLower = useMemo(() => lineItems.reduce((s, i) => s + (i.confidenceLower ?? 0), 0), [lineItems])
  const totalUpper = useMemo(() => lineItems.reduce((s, i) => s + (i.confidenceUpper ?? 0), 0), [lineItems])

  const summaryItems = [
    { label: 'Type', value: forecast.forecastType, color: '#e0e0e0' },
    { label: 'Label', value: forecast.label, color: '#e0e0e0' },
    { label: 'Revenue', value: formatCurrency(forecast.totalRevenue), color: '#22c55e' },
    { label: 'Expenses', value: formatCurrency(forecast.totalExpenses), color: '#ef4444' },
    { label: 'Net Income', value: formatCurrency(forecast.netIncome), color: forecast.netIncome >= 0 ? '#22c55e' : '#ef4444' },
    { label: 'Confidence', value: `${(forecast.confidenceLevel * 100).toFixed(0)}%`, color: forecast.confidenceLevel >= 0.8 ? '#22c55e' : '#eab308' },
    { label: 'Version', value: `v${forecast.version}`, color: '#94a3b8' },
  ]

  const horizonLabel = forecast.forecastType === 'rolling13Week' ? '13-Week Horizon' : forecast.forecastType === 'rolling24Month' ? '24-Month Horizon' : forecast.forecastType

  const periods = useMemo(() => {
    const unique = new Set(lineItems.map(i => i.period))
    return Array.from(unique).sort()
  }, [lineItems])

  const categoryValues = useMemo(() => {
    const byCat: Record<string, number[]> = {}
    for (const item of lineItems) {
      if (!byCat[item.category]) byCat[item.category] = []
      byCat[item.category].push(item.amount)
    }
    return byCat
  }, [lineItems])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {summaryItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#1a1a2e', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {totalLower > 0 && totalUpper > 0 && (
        <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, border: '1px solid #2a2a4a' }}>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Confidence Range</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#64748b', fontSize: 11 }}>Lower: {formatCurrency(totalLower)}</span>
            <span style={{ color: '#64748b', fontSize: 11 }}>Upper: {formatCurrency(totalUpper)}</span>
          </div>
          <div style={{ height: 6, background: '#16213e', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: `${(totalLower / totalUpper) * 50}%`, width: `${50 - (totalLower / totalUpper) * 50}%`, height: '100%', background: '#3b82f6', borderRadius: 3, opacity: 0.5 }} />
            <div style={{ position: 'absolute', left: '50%', width: 6, height: 12, background: '#d4a843', borderRadius: 2, transform: 'translateX(-3px)', top: -3 }} />
          </div>
          <div style={{ textAlign: 'center', color: '#d4a843', fontSize: 11, marginTop: 4 }}>Forecast: {formatCurrency(forecast.totalRevenue)}</div>
        </div>
      )}

      <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, border: '1px solid #2a2a4a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>Account Breakdown</span>
          <span style={{ color: '#64748b', fontSize: 11 }}>{horizonLabel} | {forecast.fiscalYear} period {forecast.fiscalPeriod}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 8, padding: '8px 12px', color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2a2a4a' }}>
            <span>Account</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Confidence</span>
          </div>
          {lineItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 8, padding: '8px 12px', background: '#16213e', borderRadius: 4, alignItems: 'center' }}>
              <span style={{ color: '#e0e0e0', fontSize: 12 }}>{item.accountName}</span>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>{item.category}</span>
              <span style={{ color: '#e0e0e0', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(item.amount)}</span>
              <ConfidenceBar lower={item.confidenceLower ?? 0} upper={item.confidenceUpper ?? 0} value={item.amount} />
            </motion.div>
          ))}
        </div>
      </div>

      {Object.keys(categoryValues).length > 1 && (
        <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, border: '1px solid #2a2a4a' }}>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Category Trends</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {Object.entries(categoryValues).map(([cat, vals]) => (
              <div key={cat}>
                <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, textTransform: 'capitalize' }}>{cat}</div>
                <TrendBar values={vals} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
