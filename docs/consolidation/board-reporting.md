# Board Reporting

## Board Report Structure
Each board report contains structured sections with metrics and optional chart data.

### Report Fields
| Field | Description |
|---|---|
| title | Report title (e.g., "Board Report - Period 2026-06") |
| preparedDate | Date report was generated |
| currency | Reporting currency |
| executiveSummary | High-level narrative summary |
| keyHighlights | Array of positive highlights |
| keyRisks | Array of identified risks |
| recommendations | Array of actionable recommendations |
| sections | Structured content sections with metrics and charts |

## Section Structure
Each `BoardReportSection` contains:
- `title` — Section heading
- `content` — Section narrative content
- `metrics` — Array of metric entries with trend indicators
- `charts` — Optional chart data for visualization

### Section Metrics
```typescript
{
  label: string;    // Metric name (e.g., "Revenue", "Net Income")
  value: string;    // Formatted value (e.g., "$1.2B")
  trend?: "up" | "down" | "stable";
}
```

### Chart Data
```typescript
{
  type: string;                    // Chart type (e.g., "bar", "line", "donut")
  labels: string[];                // X-axis labels
  datasets: { label: string; data: number[] }[];  // Data series
}
```

## Approval Workflow
Board reports follow an approval workflow:
1. Report generated via `generateBoardReport()`
2. Sections added via `addSection()`
3. Report approved via `approveReport(reportId, userId)`
4. Approval tracked with `approvedById` and `approvedAt`
