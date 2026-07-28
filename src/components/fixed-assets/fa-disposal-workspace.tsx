'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FADisposalWorkspaceProps } from './fa-types'
import type { DisposalType } from '../../server/fixed-assets/types'

const disposalTypeColors: Record<DisposalType, string> = {
  sale: '#22c55e',
  scrap: '#888',
  donation: '#3b82f6',
  tradeIn: '#a855f7',
  abandonment: '#ef4444',
}

export default function FADisposalWorkspace({ disposals }: FADisposalWorkspaceProps) {
  const sorted = useMemo(() => [...disposals].sort((a, b) => new Date(b.disposalDate).getTime() - new Date(a.disposalDate).getTime()), [disposals])

  const totals = useMemo(() => {
    const result = { proceeds: 0, nbv: 0, gainLoss: 0, gains: 0, losses: 0, count: disposals.length }
    for (const d of disposals) {
      result.proceeds += d.netDisposalProceeds
      result.nbv += d.netBookValueAtDisposal
      result.gainLoss += d.gainLoss
      if (d.gainLoss >= 0) result.gains += d.gainLoss
      else result.losses += Math.abs(d.gainLoss)
    }
    return result
  }, [disposals])

  return (
    <div>
      <div style={{ background: '#1a1a24', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a4a' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#16213e', borderBottom: '1px solid #2a2a4a' }}>
              {['Asset', 'Type', 'Date', 'Proceeds', 'NBV', 'Gain/Loss', 'Counterparty'].map(h => (
                <th key={h} style={{ padding: '10px 12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, textAlign: 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No disposal records</td></tr>
            ) : (
              sorted.map((d, i) => (
                <motion.tr key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: i < sorted.length - 1 ? '1px solid #2a2a4a' : 'none' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{d.assetId}</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <span style={{ background: disposalTypeColors[d.disposalType] + '22', color: disposalTypeColors[d.disposalType], fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 10, textTransform: 'capitalize' }}>
                      {d.disposalType === 'tradeIn' ? 'Trade In' : d.disposalType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>{new Date(d.disposalDate).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px', color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>${d.netDisposalProceeds.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#e0e0e0', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>${d.netBookValueAtDisposal.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontWeight: 600, textAlign: 'right', color: d.gainLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                    {d.gainLoss >= 0 ? '+' : ''}${d.gainLoss.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>{d.counterparty || '—'}</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid #d4af37', background: '#16213e' }}>
                <td style={{ padding: '10px 12px', color: '#d4af37', fontWeight: 700, fontSize: 11 }}>TOTAL ({totals.count})</td>
                <td />
                <td />
                <td style={{ padding: '10px 12px', color: '#d4af37', fontFamily: 'ui-monospace, monospace', fontWeight: 700, textAlign: 'right' }}>${totals.proceeds.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#d4af37', fontFamily: 'ui-monospace, monospace', fontWeight: 700, textAlign: 'right' }}>${totals.nbv.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, textAlign: 'right', color: totals.gainLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                  {totals.gainLoss >= 0 ? '+' : ''}${totals.gainLoss.toLocaleString()}
                </td>
                <td />
              </tr>
              <tr style={{ background: '#16213e' }}>
                <td colSpan={7} style={{ padding: '6px 12px 10px', fontSize: 10, color: '#94a3b8' }}>
                  Gains: <span style={{ color: '#22c55e' }}>${totals.gains.toLocaleString()}</span> &middot; Losses: <span style={{ color: '#ef4444' }}>${totals.losses.toLocaleString()}</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
