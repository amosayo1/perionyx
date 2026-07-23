import type { AssetAlert, AlertCategory, AlertSeverity, FixedAsset } from "../../types";

export class AlertsService {
  private alerts = new Map<string, AssetAlert>();

  add(alert: AssetAlert): AssetAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  get(id: string): AssetAlert | undefined {
    return this.alerts.get(id);
  }

  getAll(): AssetAlert[] {
    return Array.from(this.alerts.values());
  }

  getByType(type: AlertCategory): AssetAlert[] {
    return this.getAll().filter((a) => a.type === type);
  }

  getBySeverity(severity: AlertSeverity): AssetAlert[] {
    return this.getAll().filter((a) => a.severity === severity);
  }

  getUnread(): AssetAlert[] {
    return this.getAll().filter((a) => !a.isRead);
  }

  getUnresolved(): AssetAlert[] {
    return this.getAll().filter((a) => !a.isResolved);
  }

  getByAsset(assetId: string): AssetAlert[] {
    return this.getAll().filter((a) => a.assetId === assetId);
  }

  count(): number {
    return this.alerts.size;
  }

  update(id: string, updates: Partial<AssetAlert>): AssetAlert {
    const existing = this.alerts.get(id);
    if (!existing) throw new Error(`Alert ${id} not found`);
    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.alerts.delete(id);
  }

  acknowledge(id: string): void {
    this.update(id, { isRead: true, acknowledgedAt: new Date() });
  }

  resolve(id: string): void {
    this.update(id, { isResolved: true, resolvedAt: new Date() });
  }

  generateLifecycleAlerts(assets: FixedAsset[]): AssetAlert[] {
    const alerts: AssetAlert[] = [];
    const now = new Date();

    for (const asset of assets) {
      if (asset.isFullyDepreciated && asset.isActive) {
        alerts.push({
          id: `alert-fd-${asset.id}-${Date.now()}`,
          type: "lifecycle",
          severity: "warning",
          title: `Fully depreciated asset still active: ${asset.name}`,
          message: `Asset ${asset.assetTag} (${asset.name}) is fully depreciated but still marked as active. Consider revaluation, disposal, or status update. NBV: ${asset.depreciationDetails.netBookValue}.`,
          assetId: asset.id,
          isRead: false,
          isResolved: false,
          companyId: asset.companyId,
          createdAt: now,
        });
      }

      const overdueMaint = asset.maintenance.filter(
        (m) => m.status === "scheduled" && m.scheduledDate < now,
      );
      if (overdueMaint.length > 0) {
        const criticalMaint = overdueMaint.filter((m) => m.priority === "critical" || m.priority === "high");
        alerts.push({
          id: `alert-maint-${asset.id}-${Date.now()}`,
          type: "maintenance",
          severity: criticalMaint.length > 0 ? "critical" : "warning",
          title: `Maintenance overdue: ${asset.name}`,
          message: `${overdueMaint.length} maintenance tasks overdue for asset ${asset.assetTag}. ${criticalMaint.length} are high/critical priority.`,
          assetId: asset.id,
          isRead: false,
          isResolved: false,
          companyId: asset.companyId,
          createdAt: now,
        });
      }

      const hasImpairmentIndicator = asset.impairments.some((i) => !i.reversed && i.impairmentLoss > 0);
      const needsImpairmentReview = asset.status === "inService" && asset.depreciationDetails.netBookValue > asset.depreciationDetails.originalCost * 1.5;
      if (hasImpairmentIndicator || needsImpairmentReview) {
        alerts.push({
          id: `alert-impair-${asset.id}-${Date.now()}`,
          type: "impairment",
          severity: "warning",
          title: `Impairment review needed: ${asset.name}`,
          message: `Asset ${asset.assetTag} may require impairment assessment. NBV: ${asset.depreciationDetails.netBookValue}, Cost: ${asset.acquisition.totalCost}.`,
          assetId: asset.id,
          isRead: false,
          isResolved: false,
          companyId: asset.companyId,
          createdAt: now,
        });
      }

      const pendingDisposal = asset.disposals && asset.disposals.length > 0 && !asset.disposals[0].approvedBy;
      if (pendingDisposal) {
        alerts.push({
          id: `alert-disp-${asset.id}-${Date.now()}`,
          type: "disposal",
          severity: "info",
          title: `Disposal pending approval: ${asset.name}`,
          message: `Disposal of asset ${asset.assetTag} (${asset.name}) is pending approval. Type: ${asset.disposals[0].disposalType}, Proceeds: ${asset.disposals[0].netDisposalProceeds}.`,
          assetId: asset.id,
          isRead: false,
          isResolved: false,
          companyId: asset.companyId,
          createdAt: now,
        });
      }
    }

    return alerts;
  }
}
