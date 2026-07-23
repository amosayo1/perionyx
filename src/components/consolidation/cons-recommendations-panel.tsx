'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConsRecommendationsPanelProps } from './cons-types'

const priorityColors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#64748b' }
const effortColors: Record<string, string> = { low: '#22c55e', medium: '#eab308', high: '#ef4444' }
const typeIcons: Record<string, string> = {
  elimination: '\u2699',
  translation: '\ud83d\udcc8',
  ownership: '\ud83d\udd12',
  consolidation: '\ud83d\udcca',
  reporting: '\ud83d\udcc4',
  governance: '\u2696\ufe0f',
  process: '\ud83d\udd04',
  compliance: '\u2714\ufe0f',
}
const priorityOrder = ['critical', 'high', 'medium', 'low']

export function ConsRecommendationsPanel({ recommendations }: ConsRecommendationsPanelProps) {
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = recommendations.filter(r => !dismissed.has(r.id) && r.status === 'active')
    if (filterPriority !== 'all') result = result.filter(r => r.priority === filterPriority)
    if (filterType !== 'all') result = result.filter(r => r.type === filterType)
    return result.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority))
  }, [recommendations, filterPriority, filterType, dismissed])

  const groups = useMemo(() => {
    const g: Record<string, typeof recommendations> = {}
    for (const p of priorityOrder) { const items = filtered.filter(r => r.priority === p); if (items.length) g[p] = items }
    return g
  }, [filtered])

  const handleDismiss = (id: string) => setDismissed(prev => new Set(prev).add(id))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ background: '#16213e', color: '#e0e0e0', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          <option value='all'>All Priorities</option>
          {priorityOrder.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ background: '#16213e', color: '#e0e0e0', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          <option value='all'>All Types</option>
          {Object.keys(typeIcons).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <AnimatePresence>
        {Object.keys(groups).length === 0 ? (
          <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>No active recommendations</motion.div>
        ) : (
          Object.entries(groups).map(([priority, items]) => (
            <div key={priority} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors[priority] }} />
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{priority}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>({items.length})</span>
              </div>
              {items.map((r, i) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                  style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, marginBottom: 8, border: '1px solid #2a2a4a', borderLeft: `3px solid ${priorityColors[r.priority]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: priorityColors[r.priority] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: priorityColors[r.priority], fontSize: 16 }}>{typeIcons[r.type] ?? '?'}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{r.description}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ background: priorityColors[r.priority] + '22', color: priorityColors[r.priority], fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>{r.priority}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#d4a843' }}>{r.impact}</span>
                      <span style={{ background: effortColors[r.effort] + '22', color: effortColors[r.effort], fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize' }}>{r.effort} effort</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleDismiss(r.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Implement</button>
                    <button onClick={() => handleDismiss(r.id)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #2a2a4a', borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>Dismiss</button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
