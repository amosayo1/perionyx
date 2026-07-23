import { consService } from "@/server/consolidation"
import type { GroupNode } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

function RenderTreeNode({ node, level = 0 }: { node: GroupNode; level?: number }) {
  const indent = level * 24
  const methodColors: Record<string, string> = { full: "#22c55e", proportional: "#eab308", equity: "#3b82f6" }
  const typeLabels: Record<string, string> = { holding: "Holding", parent: "Parent", subsidiary: "Subsidiary", jointVenture: "JV", associate: "Associate", branch: "Branch", businessUnit: "BU", profitCenter: "PC", costCenter: "CC" }

  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", marginLeft: indent,
          background: level === 0 ? "#1a1a2e" : "#22223a", borderRadius: 8, borderLeft: `3px solid ${methodColors[node.consolidationMethod] ?? "#888"}`,
        }}
      >
        <span style={{ color: "#eab308", fontSize: 13, fontWeight: 600, minWidth: 80 }}>{node.entityCode}</span>
        <span style={{ color: "#e0e0e0", fontSize: 14 }}>{node.legalName}</span>
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 4, color: "#aaa",
          background: "#2a2a3e", minWidth: 60, textAlign: "center",
        }}>
          {typeLabels[node.entityType] ?? node.entityType}
        </span>
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 4,
          color: methodColors[node.consolidationMethod] ?? "#888",
          background: "#2a2a3e",
        }}>
          {node.consolidationMethod}
        </span>
        <span style={{ color: "#888", fontSize: 12 }}>{node.ownershipPercentage}% owned</span>
      </div>
      {node.children.map((child) => (
        <RenderTreeNode key={child.entityId} node={child} level={level + 1} />
      ))}
    </div>
  )
}

export default function GroupStructurePage() {
  const nodes = consService.groupStructure.getAll()
  const entities = consService.entityManagement.getAll()
  const tree = consService.groupStructure.buildTree()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Group Structure" description="Entity hierarchy, ownership percentages, and consolidation methods" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#888", fontSize: 13 }}>Total Entities</div>
              <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{entities.length}</div>
            </div>
            <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#888", fontSize: 13 }}>Group Nodes</div>
              <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{nodes.length}</div>
            </div>
            <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#888", fontSize: 13 }}>Root Entities</div>
              <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{nodes.filter((n) => !n.parentId).length}</div>
            </div>
            <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#888", fontSize: 13 }}>Max Depth</div>
              <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{Math.max(...nodes.map((n) => n.depth), 0)}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tree.length === 0 ? (
              <div style={{ color: "#666", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No group structure data available</div>
            ) : (
              tree.map((root) => <RenderTreeNode key={root.entityId} node={root} />)
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
