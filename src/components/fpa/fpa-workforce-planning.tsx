'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { WorkforcePlan } from '@/server/fpa/types'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

function HeadcountChange({ current, planned }: { current: number; planned: number }) {
  const diff = planned - current
  if (diff === 0) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  const isUp = diff > 0
  return (
    <span style={{ color: isUp ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
      {isUp ? '+ ' : '- '}{Math.abs(diff)}
    </span>
  )
}

function AttritionBadge({ rate }: { rate: number }) {
  const color = rate > 15 ? '#ef4444' : rate > 10 ? '#eab308' : '#22c55e'
  return (
    <span style={{ color, fontSize: 12, fontWeight: 600 }}>
      {rate.toFixed(1)}%
    </span>
  )
}

export interface FPAWorkforcePlanningProps {
  plans: WorkforcePlan[]
}

export default function FPAWorkforcePlanning({ plans }: FPAWorkforcePlanningProps) {
  const totalHC = useMemo(() => plans.reduce((s, p) => s + p.headcountCurrent, 0), [plans])
  const totalPlanned = useMemo(() => plans.reduce((s, p) => s + p.headcountPlanned, 0), [plans])
  const totalComp = useMemo(() => plans.reduce((s, p) => s + p.totalCompensation, 0), [plans])
  const avgSalary = useMemo(() => totalHC ? Math.round(totalComp / totalHC) : 0, [totalHC, totalComp])

  const summaryItems = [
    { label: 'Total Departments', value: plans.length.toString(), color: '#e0e0e0' },
    { label: 'Current HC', value: totalHC.toString(), color: '#3b82f6' },
    { label: 'Planned HC', value: totalPlanned.toString(), color: '#22c55e' },
    { label: 'Total Compensation', value: formatCurrency(totalComp), color: '#d4af37' },
    { label: 'Avg Salary', value: formatCurrency(avgSalary), color: '#a855f7' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {summaryItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#1a1a24', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #2a2a4a' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 24 }}>No workforce plans available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.5fr', gap: 8, padding: '8px 12px', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2a2a4a' }}>
            <span>Department</span>
            <span>Current HC</span>
            <span>Planned HC</span>
            <span>New Hires</span>
            <span>Attrition</span>
            <span>Avg Salary</span>
            <span>Total Comp</span>
          </div>
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.5fr', gap: 8, padding: '12px 12px', background: '#1a1a24', borderRadius: 6, alignItems: 'center', border: '1px solid #2a2a4a' }}>
              <span style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 500 }}>{p.department}</span>
              <span style={{ color: '#e0e0e0', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>{p.headcountCurrent}</span>
              <span style={{ color: '#e0e0e0', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>{p.headcountPlanned}</span>
              <span style={{ color: '#22c55e', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>{p.headcountNewHires}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#e0e0e0', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>{p.headcountAttrition}</span>
                <AttritionBadge rate={p.attritionRate} />
              </div>
              <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.averageSalary)}</span>
              <span style={{ color: '#d4af37', fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(p.totalCompensation)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
