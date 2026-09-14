import React, { useState, useEffect } from 'react';
import { Briefcase, AlertTriangle, CheckCircle2, TrendingUp, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PortfolioHolding } from '../types';

interface PortfolioViewProps {
  onSelectStock: (ticker: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectStock }) => {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      }
    };
    fetchPortfolio();
  }, []);

  const totalValue = portfolio.reduce((acc, h) => acc + h.currentPrice * h.shares, 0);
  const totalCost = portfolio.reduce((acc, h) => acc + h.avgBuyPrice * h.shares, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div id="portfolio-view" className="space-y-6">
      {/* Portfolio Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>INSTITUTIONAL PORTFOLIO MONITOR</span>
          </div>
          <div className="flex items-baseline space-x-4 mt-1 font-mono">
            <span className="text-3xl font-black text-white">
              ₹{Math.round(totalValue).toLocaleString()}
            </span>
            <div className={`text-sm font-bold flex items-center space-x-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{totalPnL >= 0 ? '+' : ''}₹{Math.round(totalPnL).toLocaleString()}</span>
              <span>({totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(1)}%)</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time allocation weightings, individual risk flags, and thesis tracking.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL POSITIONS</span>
            <span className="text-white font-black text-base">{portfolio.length} Equities</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">CONCENTRATION</span>
            <span className="text-white font-black text-base">Top 3: 82%</span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Active Holdings Breakdown
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Click any position to load intelligence terminal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Security</th>
                <th className="p-3.5">Qty / Weight</th>
                <th className="p-3.5">Avg Buy Price</th>
                <th className="p-3.5">Current Price</th>
                <th className="p-3.5">Unrealized P&L</th>
                <th className="p-3.5">AI Status</th>
                <th className="p-3.5 text-right">Risk Warning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {portfolio.map((h) => {
                const isPnLPos = h.unrealizedPnL >= 0;
                return (
                  <tr
                    key={h.ticker}
                    id={`portfolio-row-${h.ticker}`}
                    onClick={() => onSelectStock(h.ticker)}
                    className="hover:bg-slate-800/70 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {h.ticker}
                      </div>
                      <div className="text-[10px] text-slate-500">Equities</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200">{h.shares} units</div>
                      <div className="text-[10px] text-slate-400">{h.allocationPercent}% Portfolio</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      ₹{h.avgBuyPrice.toFixed(2)}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      ₹{h.currentPrice.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      <div className={`font-bold ${isPnLPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPnLPos ? '+' : ''}₹{h.unrealizedPnL.toLocaleString()}
                      </div>
                      <div className={`text-[10px] ${isPnLPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPnLPos ? '+' : ''}{h.unrealizedPnLPercent}%
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        h.aiStatus === 'POSITIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : h.aiStatus === 'CAUTION'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      }`}>
                        {h.aiStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        h.riskFlag === 'Normal' ? 'text-slate-400' : 'text-amber-400 bg-amber-950 border border-amber-800 font-bold'
                      }`}>
                        {h.riskFlag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
