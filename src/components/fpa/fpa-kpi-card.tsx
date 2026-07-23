'use client'
import type { ReactNode } from 'react'

interface FPAMPKpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: string
  icon?: ReactNode
  status?: "good" | "warning" | "critical"
}

function FPAMPKpiCard({ title, value, subtitle, trend, trendValue, color, icon: Icon, status }: FPAMPKpiCardProps) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→"
  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#94a3b8"
  const statusColor = status === "good" ? "#22c55e" : status === "warning" ? "#eab308" : status === "critical" ? "#ef4444" : undefined

  return (
    <div style={{
      background: "#1a1a2e",
      borderRadius: 8,
      padding: "16px 20px",
      border: "1px solid #2a2a4a",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>{title}</div>
        {Icon && <div style={{ color: statusColor ?? "#64748b" }}>{Icon}</div>}
      </div>
      <div style={{ color: color ?? statusColor ?? "#e0e0e0", fontSize: 20, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
        {typeof value === "number" ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) : value}
      </div>
      {status && (
        <div style={{ color: statusColor, fontSize: 11, fontWeight: 500 }}>
          {status === "good" ? "✓ Healthy" : status === "warning" ? "⚠ Review" : "✗ Critical"}
        </div>
      )}
      {subtitle && <div style={{ color: "#64748b", fontSize: 11 }}>{subtitle}</div>}
      {trend && (
        <div style={{ color: trendColor, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
          <span>{trendIcon}</span>
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  )
}

export { FPAMPKpiCard, FPAMPKpiCard as FPAKPICard }
