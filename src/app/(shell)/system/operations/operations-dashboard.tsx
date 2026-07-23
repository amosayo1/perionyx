"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity, Server, Database, Cpu, HardDrive, Clock,
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  BarChart3, Layers, Zap, Gauge, Wifi, WifiOff,
} from "lucide-react";
import { PageContainer } from "@/components/enterprise/page-container";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { staggerContainer, fadeInUp } from "@/components/enterprise/motion/tokens";

interface OperationStats {
  health: {
    overall: string;
    services: Array<{
      service: string;
      status: string;
      checks: Record<string, { status: string; message?: string; latencyMs: number }>;
      metrics: {
        uptimeSeconds: number;
        memoryMB: { heapUsed: number; heapTotal: number; rss: number };
        cpuUsage: number;
        eventLoopLag: number;
      };
    }>;
    totalCount: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
  };
  alerts: {
    total: number;
    firing: number;
    acknowledged: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
  queries: {
    total: number;
    averageMs: number;
    maxMs: number;
    slowCount: number;
    slowPct: number;
  };
  version: string;
  uptime: number;
  timestamp: string;
}

type FetchState = "loading" | "ok" | "error";

export function OperationsDashboard() {
  const [stats, setStats] = useState<OperationStats | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setFetchState("loading");
    try {
      const [healthRes, alertsRes, queriesRes] = await Promise.all([
        fetch("/api/health/report").then((r) => r.json()),
        fetch("/api/v1/alerting/stats").then((r) => r.json()).catch(() => ({
          total: 0, firing: 0, acknowledged: 0, bySeverity: {}, byCategory: {},
        })),
        fetch("/api/v1/observability/queries/stats").then((r) => r.json()).catch(() => ({
          total: 0, averageMs: 0, maxMs: 0, slowCount: 0, slowPct: 0,
        })),
      ]);

      setStats({
        health: healthRes,
        alerts: alertsRes,
        queries: queriesRes,
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
        uptime: healthRes.uptimeSeconds ?? 0,
        timestamp: new Date().toISOString(),
      });
      setFetchState("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch operations data");
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const statusColor = (status: string): string => {
    switch (status) {
      case "healthy": return "#22c55e";
      case "degraded": return "#d4a843";
      case "unhealthy": return "#ef4444";
      default: return "#71717a";
    }
  };

  const serviceIcon = (service: string) => {
    switch (service) {
      case "database": return <Database className="w-4 h-4" />;
      case "cache": return <Zap className="w-4 h-4" />;
      case "queues": return <Layers className="w-4 h-4" />;
      case "system": return <Server className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (fetchState === "loading" && !stats) {
    return (
      <PageContainer size="full">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading operations data...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (fetchState === "error" && !stats) {
    return (
      <PageContainer size="full">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColor(stats!.health.overall) }}
            />
            <div>
              <h2 className="text-lg font-semibold text-white">
                System {stats!.health.overall.charAt(0).toUpperCase() + stats!.health.overall.slice(1)}
              </h2>
              <p className="text-xs text-zinc-500">
                v{stats!.version} &middot; Uptime {formatUptime(stats!.uptime)}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white
                       bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchState === "loading" ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Services</span>
              <Activity className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats!.health.totalCount}</div>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-green-500">{stats!.health.healthyCount} healthy</span>
              {stats!.health.degradedCount > 0 && (
                <span className="text-xs text-[#d4a843]">{stats!.health.degradedCount} degraded</span>
              )}
              {stats!.health.unhealthyCount > 0 && (
                <span className="text-xs text-red-500">{stats!.health.unhealthyCount} down</span>
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Active Alerts</span>
              <AlertTriangle className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats!.alerts.firing}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {stats!.alerts.acknowledged} acknowledged &middot; {stats!.alerts.total} total
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Query Performance</span>
              <BarChart3 className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats!.queries.averageMs}<span className="text-base font-normal text-zinc-500">ms</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {stats!.queries.slowCount} slow &middot; {stats!.queries.total} total query
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Memory (RSS)</span>
              <Cpu className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {(stats!.health.services.find(s => s.service === "system")?.metrics.memoryMB.rss ?? 0)}
              <span className="text-base font-normal text-zinc-500">MB</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Heap: {(stats!.health.services.find(s => s.service === "system")?.metrics.memoryMB.heapUsed ?? 0)}MB
              &middot; CPU: {stats!.health.services.find(s => s.service === "system")?.metrics.cpuUsage ?? 0}%
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Service Health */}
        <motion.div variants={fadeInUp} className="mb-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Service Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats!.health.services.map((svc) => {
              const warnCount = Object.values(svc.checks).filter((c) => c.status !== "healthy").length;
              return (
                <AnimatedCard key={svc.service} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColor(svc.status) }}
                      />
                      <div className="flex items-center gap-1.5">
                        {serviceIcon(svc.service)}
                        <span className="text-sm font-medium text-white capitalize">{svc.service}</span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: statusColor(svc.status) }}
                    >
                      {svc.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(svc.checks).map(([name, check]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 capitalize">{name}</span>
                        <div className="flex items-center gap-2">
                          {check.message && (
                            <span className="text-zinc-500 truncate max-w-[200px]">{check.message}</span>
                          )}
                          {check.latencyMs > 0 && (
                            <span className="text-zinc-600">{check.latencyMs}ms</span>
                          )}
                          {check.status === "healthy" ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : check.status === "degraded" ? (
                            <AlertTriangle className="w-3 h-3 text-[#d4a843]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/50 text-xs text-zinc-600">
                    <span>Uptime: {formatUptime(svc.metrics.uptimeSeconds)}</span>
                    <span>Heap: {svc.metrics.memoryMB.heapUsed}MB</span>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </motion.div>

        {/* Alerts by severity */}
        {Object.keys(stats!.alerts.bySeverity).length > 0 && (
          <motion.div variants={fadeInUp} className="mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Alert Distribution</h3>
            <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
              <div className="flex gap-4">
                {Object.entries(stats!.alerts.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: severity === "critical" ? "#ef4444"
                          : severity === "warning" ? "#d4a843"
                          : "#3b82f6",
                      }}
                    />
                    <span className="text-xs text-zinc-400 capitalize">{severity}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* System Info */}
        <motion.div variants={fadeInUp}>
          <AnimatedCard className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">System Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-zinc-500 block">Version</span>
                <span className="text-white">{stats!.version}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Platform</span>
                <span className="text-white">{typeof navigator !== "undefined" ? navigator.platform : "Server"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Uptime</span>
                <span className="text-white">{formatUptime(stats!.uptime)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Last Checked</span>
                <span className="text-white">
                  {new Date(stats!.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
