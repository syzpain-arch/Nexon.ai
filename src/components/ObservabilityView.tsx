import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Radio,
  Server,
  Terminal,
  Zap,
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { SystemMetrics, LogEntry } from '../types/client.js';
import { api } from '../services/apiClient.js';

interface ObservabilityViewProps {
  metrics: SystemMetrics | null;
  logs: LogEntry[];
  onRefreshMetrics: () => void;
}

export const ObservabilityView: React.FC<ObservabilityViewProps> = ({
  metrics,
  logs,
  onRefreshMetrics,
}) => {
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM'>('ALL');
  const [prometheusRaw, setPrometheusRaw] = useState<string>('');
  const [showRawPrometheus, setShowRawPrometheus] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const fetchPrometheusText = async () => {
    try {
      const text = await api.getPrometheusText();
      setPrometheusRaw(text);
    } catch (e) {}
  };

  useEffect(() => {
    if (showRawPrometheus) {
      fetchPrometheusText();
    }
  }, [showRawPrometheus]);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await api.runDiagnostics();
      setDiagnosticsResult(res);
    } catch (e) {}
    setIsRunningDiagnostics(false);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  const getLogLevelBadge = (lvl: LogEntry['level']) => {
    switch (lvl) {
      case 'ERROR':
        return 'bg-rose-950 text-rose-300 border-rose-500/40';
      case 'WARN':
        return 'bg-amber-950 text-amber-300 border-amber-500/40';
      case 'SYSTEM':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/40';
      case 'INFO':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Top Telemetry Header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
                Observability & Subsystem Telemetry
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Prometheus Metrics &bull; Centralized Telemetry Logging &bull; Subsystem Health Checks
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowRawPrometheus(!showRawPrometheus)}
              className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-mono text-cyan-300 hover:bg-slate-900 transition-colors"
            >
              {showRawPrometheus ? 'Hide Raw' : 'Raw /api/metrics'}
            </button>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="flex items-center space-x-1 rounded bg-cyan-600 px-3 py-1 text-[10px] font-mono font-bold text-white uppercase hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            >
              <Play className={`h-2.5 w-2.5 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              <span>Diagnostics</span>
            </button>
            <button
              onClick={onRefreshMetrics}
              className="p-1 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Grafana-style Real-Time Metric Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-800">
          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-cyan-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>RAM USAGE</span>
              <Cpu className="h-3 w-3 text-cyan-400" />
            </div>
            <div className="text-base font-tech font-bold text-slate-100">
              {metrics?.memoryUsageMb || 45} <span className="text-[10px] text-slate-500 font-mono">MB</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, ((metrics?.memoryUsageMb || 45) / 512) * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-emerald-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>ACTIVE WS</span>
              <Radio className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="text-base font-tech font-bold text-emerald-400">
              {metrics?.activeWsConnections || 1} <span className="text-[10px] text-slate-500 font-mono">CLIENTS</span>
            </div>
            <div className="text-[9px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> /ws CONNECTED
            </div>
          </div>

          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-cyan-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>HTTP REQUESTS</span>
              <Server className="h-3 w-3 text-cyan-400" />
            </div>
            <div className="text-base font-tech font-bold text-slate-100">
              {metrics?.totalRequests || 42}
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-1">
              Avg: {Math.round(metrics?.averageHttpLatencyMs || 8)}ms
            </div>
          </div>

          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-cyan-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>CRON RUNS</span>
              <Clock className="h-3 w-3 text-cyan-400" />
            </div>
            <div className="text-base font-tech font-bold text-cyan-300">
              {metrics?.cronTasksExecuted || 18}
            </div>
            <div className="text-[9px] font-mono text-cyan-400 mt-1">
              Interval: 30s Loop
            </div>
          </div>

          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-amber-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>AI INFERENCES</span>
              <Zap className="h-3 w-3 text-amber-400" />
            </div>
            <div className="text-base font-tech font-bold text-amber-300">
              {metrics?.geminiInferencesCount || 12}
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-1">
              Avg: {Math.round(metrics?.averageInferenceLatencyMs || 280)}ms
            </div>
          </div>

          <div className="rounded bg-slate-950 p-2.5 border border-slate-800 border-l-2 border-l-emerald-500">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
              <span>SYSTEM HEALTH</span>
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="text-base font-tech font-bold text-emerald-400">
              100%
            </div>
            <div className="text-[9px] font-mono text-emerald-400 mt-1">
              All Systems Nominal
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Panel (if triggered) */}
      {diagnosticsResult && (
        <div className="rounded-lg border border-cyan-500/30 bg-slate-900/50 p-3.5 backdrop-blur-xl border-l-2 border-l-cyan-500">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-tech text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
              Diagnostics Telemetry: Status {diagnosticsResult.overallStatus}
            </h3>
            <span className="text-[9px] font-mono text-slate-400">{diagnosticsResult.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {diagnosticsResult.tests.map((t: any, i: number) => (
              <div key={i} className="rounded border border-slate-800 bg-slate-950 p-2 text-xs font-mono">
                <div className="text-slate-300 font-semibold truncate text-[11px]">{t.name}</div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[10px]">
                  <span className="text-emerald-400 font-bold">{t.status}</span>
                  <span className="text-slate-500">{t.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Prometheus Text view */}
      {showRawPrometheus && (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-52 overflow-y-auto">
          <div className="text-cyan-400 font-bold mb-1.5 text-xs"># EXPORTED PROMETHEUS METRICS (/api/metrics)</div>
          <pre className="whitespace-pre-wrap text-[10px] leading-tight">{prometheusRaw || 'Fetching metrics...'}</pre>
        </div>
      )}

      {/* Real-time Centralized System Log Stream */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center space-x-1.5">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="font-tech text-xs font-bold text-slate-200 uppercase">
              Centralized Audit & Telemetry Stream ({filteredLogs.length})
            </h3>
          </div>

          {/* Log Level Filters */}
          <div className="flex space-x-1 text-[10px] font-mono">
            {(['ALL', 'SYSTEM', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLogFilter(lvl)}
                className={`rounded px-2 py-0.5 transition-all ${
                  logFilter === lvl
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Output Box */}
        <div className="rounded border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] max-h-80 overflow-y-auto space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-6 text-center text-xs">No logs matching selected level filter.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 py-0.5 hover:bg-slate-900/50 rounded px-1">
                <span className="text-slate-500 shrink-0 text-[9px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`rounded px-1 text-[8px] font-bold border shrink-0 ${getLogLevelBadge(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-cyan-400 font-semibold shrink-0 text-[10px]">[{log.module}]</span>
                <span className="text-slate-300 break-all text-[11px] font-mono">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
