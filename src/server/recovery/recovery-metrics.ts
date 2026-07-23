export interface RecoveryMetrics {
  totalBackups: number;
  totalRestores: number;
  successfulRestores: number;
  failedRestores: number;
  averageRestoreTimeMs: number;
  lastBackupAt: Date | null;
  lastRestoreAt: Date | null;
  storageUsedBytes: number;
  backupSuccessRate: number;
}

export class RecoveryMetricsCollector {
  private metrics: RecoveryMetrics = {
    totalBackups: 0,
    totalRestores: 0,
    successfulRestores: 0,
    failedRestores: 0,
    averageRestoreTimeMs: 0,
    lastBackupAt: null,
    lastRestoreAt: null,
    storageUsedBytes: 0,
    backupSuccessRate: 100,
  };

  recordBackup(): void {
    this.metrics.totalBackups++;
    this.metrics.lastBackupAt = new Date();
  }

  recordRestore(success: boolean, durationMs: number): void {
    this.metrics.totalRestores++;
    if (success) this.metrics.successfulRestores++;
    else this.metrics.failedRestores++;
    this.metrics.lastRestoreAt = new Date();
    const total = this.metrics.totalRestores * this.metrics.averageRestoreTimeMs + durationMs;
    this.metrics.averageRestoreTimeMs = Math.round(total / this.metrics.totalRestores);
    this.metrics.backupSuccessRate = Math.round(
      (this.metrics.successfulRestores / this.metrics.totalRestores) * 10000,
    ) / 100;
  }

  getMetrics(): RecoveryMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalBackups: 0,
      totalRestores: 0,
      successfulRestores: 0,
      failedRestores: 0,
      averageRestoreTimeMs: 0,
      lastBackupAt: null,
      lastRestoreAt: null,
      storageUsedBytes: 0,
      backupSuccessRate: 100,
    };
  }
}

export const recoveryMetrics = new RecoveryMetricsCollector();
