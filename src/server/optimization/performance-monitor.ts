interface PerfMetric {
  name: string
  duration: number
  timestamp: Date
  memory?: number
}

class PerformanceMonitor {
  private metrics: PerfMetric[] = []
  private marks = new Map<string, number>()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark)
    if (!start) return 0
    const duration = performance.now() - start
    this.metrics.push({ name, duration, timestamp: new Date() })
    return duration
  }

  getMetrics(): PerfMetric[] {
    return [...this.metrics]
  }

  getAverageDuration(name: string): number {
    const relevant = this.metrics.filter(m => m.name === name)
    if (relevant.length === 0) return 0
    return relevant.reduce((s, m) => s + m.duration, 0) / relevant.length
  }

  clear(): void {
    this.metrics = []
    this.marks.clear()
  }
}

export const perfMonitor = new PerformanceMonitor()
