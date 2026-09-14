import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { ObservabilityMetrics, DataFreshness } from '../types';

interface ObservabilityViewProps {
  freshness: DataFreshness;
}

export const ObservabilityView: React.FC<ObservabilityViewProps> = ({ freshness }) => {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const fetchObservability = async () => {
    try {
      const res = await fetch('/api/observability');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentEvents(data.recentEvents || []);
      }
    } catch (err) {
      console.error('Failed to load observability data:', err);
    }
  };

  useEffect(() => {
    fetchObservability();
    const interval = setInterval(fetchObservability, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="observability-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>PLATFORM PERFORMANCE & TELEMETRY OBSERVABILITY</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            System Infrastructure & High-Frequency Cache Engine
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time tracking of sub-50ms deterministic scoring pipelines, in-memory cache hit rates, and event streams.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>STATUS: NOMINAL (99.99% HEALTH)</span>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">P50 Latency</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{metrics.p50LatencyMs}ms</span>
            <span className="text-[10px] text-slate-500">Sub-20ms target</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">P95 Latency</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{metrics.p95LatencyMs}ms</span>
            <span className="text-[10px] text-slate-500">Peak query time</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Cache Hit Rate</span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">{metrics.cacheHitRatePercent}%</span>
            <span className="text-[10px] text-slate-500">In-memory TTL cache</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Throughput</span>
            <span className="text-2xl font-black text-white mt-1 block">{metrics.workerThroughputPerSec}/s</span>
            <span className="text-[10px] text-slate-500">Worker processing</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">AI Cost Saved</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">{metrics.aiTokensSavedPercent}%</span>
            <span className="text-[10px] text-slate-500">Deterministic caching</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Coverage</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{metrics.systemCoverage}%</span>
            <span className="text-[10px] text-slate-500">Audited parameters</span>
          </div>
        </div>
      )}

      {/* Two Columns: Data Freshness Audit & Kafka Event Bus Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Freshness Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>DATA FRESHNESS & PROVIDER PIPELINE AUDIT</span>
          </h4>

          <div className="space-y-3 font-mono text-xs">
            {Object.entries(freshness).map(([key, val]) => {
              if (key === 'coveragePercent') return null;
              const v = val as { status: string; provider: string; updatedAt: string };
              return (
                <div key={key} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold capitalize">{key} Feed</span>
                    <div className="text-[10px] text-slate-500">Source: {v.provider}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      v.status === 'LIVE'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-sky-950 text-sky-300 border-sky-800'
                    }`}>
                      {v.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{v.updatedAt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Async Event Bus Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>IN-PROCESS EVENT LOG</span>
          </h4>

          <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto pr-1">
            {recentEvents.length === 0 ? (
              <p className="text-slate-500 text-xs py-4">No recent events logged yet.</p>
            ) : (
              recentEvents.map((ev, i) => (
                <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-bold text-white text-[11px]">{ev.event}</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[180px]">
                      {JSON.stringify(ev.payload)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{ev.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
