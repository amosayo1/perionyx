'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FALifecycleTimelineProps } from './fa-types'

const STAGES = [
  'requested', 'approved', 'acquired', 'capitalized', 'inService',
  'underMaintenance', 'impaired', 'revalued', 'disposed', 'retired', 'archived',
] as const

const stageLabels: Record<string, string> = {
  requested: 'Requested', approved: 'Approved', acquired: 'Acquired',
  capitalized: 'Capitalized', inService: 'In Service',
  underMaintenance: 'Maintenance', impaired: 'Impairment', revalued: 'Revaluation',
  disposed: 'Disposed', retired: 'Retired', archived: 'Archived',
}

export default function FALifecycleTimeline({ currentStatus }: FALifecycleTimelineProps) {
  const currentIdx = useMemo(() => STAGES.indexOf(currentStatus as typeof STAGES[number]), [currentStatus])

  return (
    <div style={{ background: '#1a1a2e', borderRadius: 8, padding: '28px 20px', border: '1px solid #2a2a4a', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative', minWidth: 'max-content' }}>
        <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 2, background: '#2a2a4a', transform: 'translateY(-50%)', zIndex: 0 }} />
        {STAGES.map((stage, i) => {
          const isCompleted = currentIdx > i
          const isActive = currentIdx === i
          const isFuture = currentIdx < i
          const circleColor = isActive ? '#d4a843' : isCompleted ? '#22c55e' : '#2a2a4a'
          const lineColor = isCompleted ? '#22c55e' : '#2a2a4a'

          return (
            <motion.div key={stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, flex: 1, minWidth: 70, padding: '0 4px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: circleColor, border: `2px solid ${circleColor}`, boxShadow: isActive ? '0 0 8px rgba(212, 168, 67, 0.5)' : 'none', position: 'relative', zIndex: 2, transition: 'all 0.3s ease' }} />
              {isActive && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #d4a843', position: 'absolute', top: -5, zIndex: 1, opacity: 0.5 }} />
              )}
              <div style={{
                fontSize: 9, marginTop: 8, textAlign: 'center', fontWeight: isActive ? 700 : 500,
                color: isActive ? '#d4a843' : isCompleted ? '#22c55e' : '#555',
                transition: 'color 0.3s ease', whiteSpace: 'nowrap',
              }}>
                {stageLabels[stage]}
              </div>
              {isActive && currentIdx >= 0 && (
                <div style={{ fontSize: 8, marginTop: 2, color: '#d4a843', fontWeight: 600, textTransform: 'uppercase' }}>Current</div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
