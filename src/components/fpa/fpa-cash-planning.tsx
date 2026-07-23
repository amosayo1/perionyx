'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { CashPlan } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

function CashFlowCell({ value }: { value: number }) {
  return (
    <span style={{ color: value >= 0 ? '#22c55e' : '#ef4444', fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 500 }}>
      {value >= 0 ? '+' : ''}{formatCurrency(value)}
    </span>
  )
}

export interface FPACashPlanningProps {
  plans: CashPlan[]
}

export default function FPACashPlanning({ plans }: FPACashPlanningProps) {
  const totalBeginning = useMemo(() => plans.reduce((s, p) => s + p.beginningCash, 0), [plans])
  const totalEnding = useMemo(() => plans.reduce((s, p) => s + p.endingCash, 0), [plans])
  const totalExcess = useMemo(() => plans.reduce((s, p) => s + p.excessCash, 0), [plans])
  const totalMinTarget = useMemo(() => plans.reduce((s, p) => s + p.minimumCashTarget, 0), [plans])

  const summaryItems = [
    { label: 'Total Periods', value: plans.length.toString(), color: '#e0e0e0' },
    { label: 'Beginning Cash', value: formatCurrency(totalBeginning), color: '#3b82f6' },
    { label: 'Ending Cash', value: formatCurrency(totalEnding), color: totalEnding >= 0 ? '#22c55e' : '#ef4444' },
    { label: 'Min Cash Target', value: formatCurrency(totalMinTarget), color: '#eab308' },
    { label: 'Excess Cash', value: formatCurrency(totalExcess), color: totalExcess > 0 ? '#22c55e' : '#64748b' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {summaryItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#1a1a2e', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No cash plans available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 6, padding: '8px 12px', color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2a2a4a' }}>
            <span>Period</span>
            <span>Begin Cash</span>
            <span>Op (In/Out)</span>
            <span>Inv (In/Out)</span>
            <span>Fin (In/Out)</span>
            <span>Net Chg</span>
            <span>End Cash</span>
            <span>Excess</span>
          </div>
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 6, padding: '10px 12px', background: '#1a1a2e', borderRadius: 6, alignItems: 'center', border: '1px solid #2a2a4a' }}>
              <span style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>{p.period}</span>
              <span style={{ color: '#e0e0e0', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.beginningCash)}</span>
              <CashFlowCell value={p.netOperatingCash} />
              <CashFlowCell value={p.netInvestingCash} />
              <CashFlowCell value={p.netFinancingCash} />
              <CashFlowCell value={p.netCashChange} />
              <span style={{ color: p.endingCash >= p.minimumCashTarget ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.endingCash)}</span>
              <span style={{ color: p.excessCash > 0 ? '#22c55e' : '#64748b', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>{p.excessCash > 0 ? formatCurrency(p.excessCash) : '—'}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
