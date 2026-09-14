import React from 'react';
import { PeerComparison, StockIdentification } from '../types';
import { Network, Crown, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SectorIntelligenceViewProps {
  currentStock: StockIdentification;
  peers: PeerComparison[];
  currentPE: number;
  currentPB: number;
  currentROE: number;
  currentNetMargin: number;
  currentRevGrowth: number;
  currentDE: number;
  currentScore: number;
  onSelectStock: (ticker: string) => void;
}

export const SectorIntelligenceView: React.FC<SectorIntelligenceViewProps> = ({
  currentStock,
  peers,
  currentPE,
  currentPB,
  currentROE,
  currentNetMargin,
  currentRevGrowth,
  currentDE,
  currentScore,
  onSelectStock,
}) => {
  // Combine current stock with peers
  const allPeers: PeerComparison[] = [
    {
      ticker: currentStock.ticker,
      name: currentStock.name,
      pe: currentPE,
      pb: currentPB,
      roe: currentROE,
      netMargin: currentNetMargin,
      revenueGrowth: currentRevGrowth,
      debtToEquity: currentDE,
      overallScore: currentScore,
      isLeader: currentScore >= 80,
    },
    ...peers,
  ];

  // Sort by overall score descending
  const sorted = [...allPeers].sort((a, b) => b.overallScore - a.overallScore);
  const leader = sorted[0];
  const isCurrentLeader = leader.ticker === currentStock.ticker;

  return (
    <div id="sector-intelligence-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>SECTOR COMPETITIVE INTELLIGENCE & PEER BENCHMARK</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            {currentStock.sector} • Industry Comparison
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-xl">
            Answers the institutional question: "Is this company fundamentally superior and cheaper than its direct competitors?"
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs self-start md:self-auto">
          <div className="text-[10px] text-slate-400 uppercase">SECTOR BENCHMARK LEADER</div>
          <div className="flex items-center space-x-2 text-emerald-400 font-black text-lg mt-0.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{leader.ticker} ({leader.overallScore}/100)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isCurrentLeader
              ? '✓ Current stock holds sector leadership score'
              : `Current stock scores ${currentScore} vs leader ${leader.ticker} (${leader.overallScore})`}
          </div>
        </div>
      </div>

      {/* Peer Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Head-to-Head Valuation, Margins & Quality Matrix
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Click any peer to switch terminal analysis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Company / Ticker</th>
                <th className="p-3.5">Overall Score</th>
                <th className="p-3.5">P/E Multiple</th>
                <th className="p-3.5">P/B Ratio</th>
                <th className="p-3.5">ROE %</th>
                <th className="p-3.5">Net Margin</th>
                <th className="p-3.5">Rev Growth (YoY)</th>
                <th className="p-3.5">Debt to Equity</th>
                <th className="p-3.5 text-right">Leadership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sorted.map((p) => {
                const isSelected = p.ticker === currentStock.ticker;
                return (
                  <tr
                    key={p.ticker}
                    id={`peer-row-${p.ticker}`}
                    onClick={() => onSelectStock(p.ticker)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/90 font-bold text-white border-l-4 border-emerald-400'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{p.ticker}</span>
                        {isSelected && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {p.name}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.overallScore >= 80 ? 'text-emerald-400 bg-emerald-950/80' : 'text-slate-300 bg-slate-950'
                      }`}>
                        {p.overallScore}/100
                      </span>
                    </td>
                    <td className="p-3.5">{p.pe.toFixed(1)}x</td>
                    <td className="p-3.5">{p.pb.toFixed(1)}x</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{p.roe.toFixed(1)}%</td>
                    <td className="p-3.5">{p.netMargin.toFixed(1)}%</td>
                    <td className="p-3.5 text-cyan-400">+{p.revenueGrowth.toFixed(1)}%</td>
                    <td className="p-3.5">{p.debtToEquity.toFixed(2)}x</td>
                    <td className="p-3.5 text-right">
                      {p.ticker === leader.ticker ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>Leader</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Challenger</span>
                      )}
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
