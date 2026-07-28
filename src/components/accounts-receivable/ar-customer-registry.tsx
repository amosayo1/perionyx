"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { ARCustomerRegistryProps, Customer } from "./ar-types"

const riskColors: Record<string, string> = { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444" }

export function ARCustomerRegistry({ customers }: ARCustomerRegistryProps) {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<keyof Customer>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = customers.filter(c => c.name.toLowerCase().includes(q) || c.customerNumber.toLowerCase().includes(q))
    result.sort((a, b) => {
      const aVal = a[sortField] ?? ""
      const bVal = b[sortField] ?? ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [customers, search, sortField, sortDir])

  const toggleSort = (field: keyof Customer) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
        style={{ width: "100%", padding: "10px 16px", background: "#16213e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#e0e0e0", fontSize: 14, marginBottom: 16, outline: "none" }} />
      <div style={{ background: "#1a1a24", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 1fr 1fr", gap: 8, padding: "12px 16px", background: "#16213e", borderBottom: "1px solid #2a2a4a", color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
          {["name", "customerNumber", "totalOutstanding", "riskRating", "dso", "creditLimit"].map(f => (
            <div key={f} onClick={() => toggleSort(f as keyof Customer)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {f === "name" ? "Customer" : f === "customerNumber" ? "Number" : f === "totalOutstanding" ? "Outstanding" : f === "riskRating" ? "Risk" : f === "dso" ? "DSO" : "Credit Limit"}
              {sortField === f && <span>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
            </div>
          ))}
        </div>
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 1fr 1fr", gap: 8, padding: "12px 16px", borderBottom: "1px solid #2a2a4a", alignItems: "center", fontSize: 13, color: "#e0e0e0" }}>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{c.customerNumber}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", color: "#d4af37" }}>${c.totalOutstanding.toLocaleString()}</div>
            <div style={{ background: riskColors[c.riskRating] + "22", color: riskColors[c.riskRating], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textAlign: "center", textTransform: "uppercase" }}>
              {c.riskRating}
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace" }}>{c.dso.toFixed(1)}d</div>
            <div style={{ fontFamily: "ui-monospace, monospace", color: "#94a3b8" }}>${c.creditLimit.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
