'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FALeaseReadinessProps } from './fa-types'

export default function FALeaseReadiness({ assets }: FALeaseReadinessProps) {
  const leasedAssets = useMemo(() => assets.filter(a => a.leaseInfo?.isLeased), [assets])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>Leased Assets</div>
        <span style={{ background: '#3b82f622', color: '#3b82f6', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>{leasedAssets.length} leased</span>
      </div>
      {leasedAssets.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>No leased assets</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {leasedAssets.map((asset, i) => {
            const lease = asset.leaseInfo!
            const isFinance = lease.leaseType === 'finance'

            return (
              <motion.div key={asset.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: '#1a1a2e', borderRadius: 8, padding: 20, border: '1px solid #2a2a4a', borderLeft: `3px solid ${isFinance ? '#a855f7' : '#3b82f6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{asset.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{asset.assetTag} &middot; {asset.category}</div>
                  </div>
                  <span style={{ background: (isFinance ? '#a855f7' : '#3b82f6') + '22', color: isFinance ? '#a855f7' : '#3b82f6', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 10, textTransform: 'capitalize' }}>
                    {lease.leaseType || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Start Date</div>
                    <div style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>{lease.leaseStartDate ? new Date(lease.leaseStartDate).toLocaleDateString() : '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>End Date</div>
                    <div style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>{lease.leaseEndDate ? new Date(lease.leaseEndDate).toLocaleDateString() : '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Lessor</div>
                    <div style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>{lease.lessorName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Payment</div>
                    <div style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 500 }}>
                      {lease.leasePaymentAmount ? `$${lease.leasePaymentAmount.toLocaleString()}/${lease.leasePaymentFrequency === 'annual' ? 'yr' : lease.leasePaymentFrequency === 'quarterly' ? 'qtr' : 'mo'}` : '—'}
                    </div>
                  </div>
                </div>

                {lease.rightOfUseAsset && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, padding: '10px 12px', background: '#16213e', borderRadius: 6 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Right-of-Use Asset</div>
                      <div style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>${asset.depreciationDetails.netBookValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase' }}>Lease Liability</div>
                      <div style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{lease.leaseLiability ? `$${lease.leaseLiability.toLocaleString()}` : '—'}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: lease.asc842Compliant ? '#22c55e22' : '#ef444422', color: lease.asc842Compliant ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                    {lease.asc842Compliant ? '✓' : '✗'} ASC 842
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: lease.ifrs16Compliant ? '#22c55e22' : '#ef444422', color: lease.ifrs16Compliant ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                    {lease.ifrs16Compliant ? '✓' : '✗'} IFRS 16
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
