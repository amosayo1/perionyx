import { metrics } from "./metrics";

export class MetricsExporter {
  async exportPrometheus(): Promise<string> {
    const snapshot = metrics.snapshot();
    const lines: string[] = [];

    for (const [name, value] of Object.entries(snapshot.counters)) {
      lines.push(`# HELP ${name} Counter metric`);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name} ${value}`);
    }
    for (const [name, value] of Object.entries(snapshot.gauges)) {
      lines.push(`# HELP ${name} Gauge metric`);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${value}`);
    }
    for (const [name, hist] of Object.entries(snapshot.histograms)) {
      lines.push(`# HELP ${name} Histogram metric`);
      lines.push(`# TYPE ${name} histogram`);
      lines.push(`${name}_count ${hist.count}`);
      lines.push(`${name}_sum ${hist.sum}`);
      lines.push(`${name}_bucket{le="0.01"} ${hist.p50}`);
      lines.push(`${name}_bucket{le="0.05"} ${hist.p95}`);
      lines.push(`${name}_bucket{le="0.1"} ${hist.p99}`);
      lines.push(`${name}_bucket{le="+Inf"} ${hist.count}`);
    }

    return lines.join("\n");
  }

  async snapshotJSON(): Promise<string> {
    return JSON.stringify(metrics.snapshot(), null, 2);
  }
}

export const metricsExporter = new MetricsExporter();
