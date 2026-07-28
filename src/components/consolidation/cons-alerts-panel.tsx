'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConsAlertsPanelProps } from './cons-types'

const severityColors: Record<string, string> = { info: '#3b82f6', warning: '#eab308', critical: '#f97316', emergency: '#ef4444' }
const severityOrder = ['emergency', 'critical', 'warning', 'info']

export function ConsAlertsPanel({ alerts }: ConsAlertsPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [resolved, setResolved] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = alerts.filter(a => !resolved.has(a.id) && !a.isResolved)
    if (filter !== 'all') result = result.filter(a => a.severity === filter)
    return result.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
  }, [alerts, filter, resolved])

  const handleAcknowledge = (id: string) => setResolved(prev => new Set(prev).add(id))
  const handleResolve = (id: string) => setResolved(prev => new Set(prev).add(id))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', ...severityOrder].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ background: filter === s ? (severityColors[s] ?? '#3b82f6') + '33' : '#16213e', color: filter === s ? (severityColors[s] ?? '#3b82f6') : '#94a3b8', border: `1px solid ${filter === s ? (severityColors[s] ?? '#3b82f6') : '#2a2a4a'}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>No active alerts</motion.div>
        ) : (
          filtered.map((alert, i) => (
            <motion.div key={alert.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }} transition={{ duration: 0.2, delay: i * 0.02 }}
              style={{ background: '#1a1a24', borderRadius: 8, padding: 16, marginBottom: 8, overflow: 'hidden', borderLeft: `3px solid ${severityColors[alert.severity]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {!alert.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }} />}
                    <span style={{ background: severityColors[alert.severity] + '22', color: severityColors[alert.severity], fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>{alert.severity}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{alert.message}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => handleAcknowledge(alert.id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Acknowledge</button>
                <button onClick={() => handleResolve(alert.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Resolve</button>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
