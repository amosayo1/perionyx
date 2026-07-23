# Group Structure

## Entity Types
| Type | Description | Consolidation Treatment |
|---|---|---|
| Holding | Top-level entity with controlling interests | Consolidates all controlled entities |
| Parent | Entity with direct or indirect control over subsidiaries | Consolidates subsidiaries |
| Subsidiary | Entity controlled by a parent undertaking | Full consolidation if controlled |
| Joint Venture | Entity under contractual joint control | Proportional or equity method |
| Associate | Entity with significant influence (20-50%) | Equity method |
| Branch | Operational extension without separate legal status | Full consolidation |
| Business Unit | Operational division within a legal entity | Full consolidation |

## Hierarchy Depth
The group structure supports **unlimited hierarchy depth**. Each `GroupNode` tracks:
- `depth` — Distance from root (0-indexed)
- `path` — Slash-delimited entity ID chain from root to node
- `parentId` — Direct parent reference
- `children` — Recursive child array for tree traversal

### Tree Structure Example
```
Holding (depth: 0, path: "HOLDING")
├── Parent NA (depth: 1, path: "HOLDING/PARENT-NA")
│   ├── Subsidiary US (depth: 2, path: "HOLDING/PARENT-NA/SUB-US")
│   ├── Subsidiary CA (depth: 2, path: "HOLDING/PARENT-NA/SUB-CA")
│   └── JV Mexico (depth: 2, path: "HOLDING/PARENT-NA/JV-MX")
├── Parent EU (depth: 1, path: "HOLDING/PARENT-EU")
│   ├── Subsidiary DE (depth: 2, path: "HOLDING/PARENT-EU/SUB-DE")
│   └── Subsidiary FR (depth: 2, path: "HOLDING/PARENT-EU/SUB-FR")
└── Associate Asia (depth: 1, path: "HOLDING/ASSOC-ASIA")
```

## Ownership Chain
Ownership is tracked through `OwnershipRecord` entries linking parent to subsidiary with:
- Direct ownership percentage
- Indirect ownership via intermediate entities
- Effective ownership calculation (recursive)
- Consolidation method determination based on ownership thresholds

## Consolidation Scope
| Scope | Method | Criteria |
|---|---|---|
| Full | Full consolidation | Control (> 50% ownership or de facto control) |
| Proportional | Proportional consolidation | Joint control (JV) |
| Equity | Equity method | Significant influence (20-50%) |
| None | No consolidation | No significant influence (< 20%) |
