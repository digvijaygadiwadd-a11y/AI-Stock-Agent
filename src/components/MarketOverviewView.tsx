import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface MarketOverviewViewProps {
  onSelectStock: (ticker: string) => void;
}

export const MarketOverviewView: React.FC<MarketOverviewViewProps> = ({ onSelectStock }) => {
  const [indices, setIndices] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const [resMarket, resSector] = await Promise.all([
          fetch('/api/market-overview'),
          fetch('/api/sector-intelligence'),
        ]);
        if (resMarket.ok) {
          const data = await resMarket.json();
          setIndices(data.indices || []);
        }
        if (resSector.ok) {
          const sData = await resSector.json();
          setSectors(sData || []);
        }
      } catch (err) {
        console.error('Failed to load market overview:', err);
      }
    };
    fetchMarket();
  }, []);

  return (
    <div id="market-overview-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>GLOBAL & DOMESTIC MACRO INTELLIGENCE</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            Institutional Benchmark Overview
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time tracking of broader index movements, sector rotation, and volatility regime.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          VIX Regime: <span className="text-emerald-400 font-bold">13.42 (Low Volatility)</span>
        </div>
      </div>

      {/* Indices Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        {indices.map((idx) => {
          const isPos = idx.change.startsWith('+');
          return (
            <div key={idx.name} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">{idx.name}</span>
                <span className="text-lg font-black text-white mt-1 block">{idx.value}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {idx.changePercent}
                </span>
                <span className="text-[10px] text-slate-500">{idx.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector Rotation Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>SECTOR ROTATION & CAPITAL FLOWS</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {sectors.map((sec) => {
            const isPos = sec.momentum.startsWith('+');
            return (
              <div
                key={sec.name}
                onClick={() => onSelectStock(sec.leader)}
                className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {sec.name}
                  </span>
                  <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sec.momentum}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                  <span>Sector Avg P/E: <strong className="text-slate-200">{sec.peAvg}x</strong></span>
                  <span>Leader: <strong className="text-emerald-400">{sec.leader}</strong></span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                  <span>Flow: {sec.sentiment}</span>
                  <span className="text-emerald-400 group-hover:underline">Open Leader →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
