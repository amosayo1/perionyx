'use client'
import { motion } from 'framer-motion'
import type { FATrendWidgetProps } from './fa-types'

const trendArrows: Record<string, string> = { improving: '\u2191', worsening: '\u2193', stable: '\u2192' }
const trendColors: Record<string, string> = { improving: '#22c55e', worsening: '#ef4444', stable: '#888' }

export default function FATrendWidget({ label, value, target, unit, trend }: FATrendWidgetProps) {
  const percentOfTarget = target > 0 ? Math.min((value / target) * 100, 100) : 0
  const isAboveTarget = value >= target

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#1a1a24', borderRadius: 8, padding: 16, border: '1px solid #2a2a4a', minWidth: 180 }}>
      <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{ color: '#e0e0e0', fontSize: 24, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
          {value.toLocaleString()}<span style={{ color: '#888', fontSize: 12, fontWeight: 400, marginLeft: 2 }}>{unit}</span>
        </span>
        <span style={{ color: trendColors[trend], fontSize: 16, fontWeight: 600 }}>{trendArrows[trend]}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b', fontSize: 10 }}>Target: {target.toLocaleString()}{unit}</span>
          <span style={{ color: isAboveTarget ? '#22c55e' : '#eab308', fontSize: 10, fontWeight: 600 }}>
            {percentOfTarget.toFixed(0)}%
          </span>
        </div>
        <div style={{ position: 'relative', height: 4, background: '#16213e', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${percentOfTarget}%`, height: '100%', background: isAboveTarget ? '#22c55e' : '#eab308', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </motion.div>
  )
}
