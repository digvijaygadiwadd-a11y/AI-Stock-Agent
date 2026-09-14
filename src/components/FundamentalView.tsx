import React from 'react';
import { FundamentalMetrics, ValuationMetrics } from '../types';
import { Building2, Percent, HeartPulse, PieChart, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface FundamentalViewProps {
  fundamentals: FundamentalMetrics;
  valuation: ValuationMetrics;
  fundamentalScore: number;
}

export const FundamentalView: React.FC<FundamentalViewProps> = ({
  fundamentals,
  valuation,
  fundamentalScore,
}) => {
  const { growth, profitability, financialHealth, ownership, quality } = fundamentals;

  return (
    <div id="fundamental-analysis-view" className="space-y-6">
      {/* Top Banner: Deterministic Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>FUNDAMENTAL QUALITY & HEALTH ENGINE</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black font-mono text-white">{fundamentalScore}</span>
            <span className="text-sm font-mono text-slate-400">/100 Fundamental Score</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deterministic evaluation based on GAAP/IFRS audited quarterly disclosures, cash conversion, and balance sheet safety.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">PIOTROSKI F-SCORE</span>
            <span className="text-emerald-400 font-black text-lg">{quality.piotroskiFScore}/9</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">ALTMAN Z-SCORE</span>
            <span className="text-emerald-400 font-black text-lg">{quality.altmanZScore.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 ml-1">(Safe Zone)</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">AUDIT STATUS</span>
            <span className="text-white font-bold text-sm flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{quality.auditFlag}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Growth Pillar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>GROWTH METRICS (YOY)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Revenue Growth:</span>
              <span className={`text-base font-bold ${growth.revenueGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {growth.revenueGrowthYoY >= 0 ? '+' : ''}{growth.revenueGrowthYoY}%
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Profit Growth:</span>
              <span className={`text-base font-bold ${growth.profitGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {growth.profitGrowthYoY >= 0 ? '+' : ''}{growth.profitGrowthYoY}%
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">EPS Growth:</span>
              <span className={`text-base font-bold ${growth.epsGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {growth.epsGrowthYoY >= 0 ? '+' : ''}{growth.epsGrowthYoY}%
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">FCF Growth:</span>
              <span className={`text-base font-bold ${growth.fcfGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {growth.fcfGrowthYoY >= 0 ? '+' : ''}{growth.fcfGrowthYoY}%
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Growth Consistency Index:</span>
            <span className="text-emerald-400 font-bold">{growth.growthConsistencyScore}/100</span>
          </div>
        </div>

        {/* 2. Profitability & Returns */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <span>PROFITABILITY & RETURN RATIOS</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Return on Equity:</span>
              <span className="text-base font-bold text-emerald-400">{profitability.roe}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">ROCE:</span>
              <span className="text-base font-bold text-emerald-400">{profitability.roce}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">ROA:</span>
              <span className="text-base font-bold text-white">{profitability.roa}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Gross Margin:</span>
              <span className="text-base font-bold text-white">{profitability.grossMargin}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Operating Margin:</span>
              <span className="text-base font-bold text-white">{profitability.operatingMargin}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Net Margin:</span>
              <span className="text-base font-bold text-emerald-400">{profitability.netMargin}%</span>
            </div>
          </div>
        </div>

        {/* 3. Balance Sheet & Solvency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>SOLVENCY & LIQUIDITY</span>
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Debt to Equity (D/E):</span>
                <div className="text-[10px] text-slate-500">Benchmark: &lt; 1.0x is conservative</div>
              </div>
              <span className={`font-bold text-sm ${financialHealth.debtToEquity < 0.5 ? 'text-emerald-400' : financialHealth.debtToEquity < 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {financialHealth.debtToEquity.toFixed(2)}x
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Interest Coverage:</span>
                <div className="text-[10px] text-slate-500">Operating Profit / Interest expense</div>
              </div>
              <span className="font-bold text-sm text-emerald-400">
                {financialHealth.interestCoverage.toFixed(1)}x
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Current / Quick Ratio:</span>
                <div className="text-[10px] text-slate-500">Short-term liquidity coverage</div>
              </div>
              <span className="font-bold text-sm text-white">
                {financialHealth.currentRatio.toFixed(2)} / {financialHealth.quickRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ownership Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>OWNERSHIP & SHAREHOLDING PATTERN</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Promoters: <strong className="text-white">{ownership.promoterHolding}%</strong></span>
                <span>FII: <strong className="text-white">{ownership.fiiHolding}%</strong></span>
                <span>DII: <strong className="text-white">{ownership.diiHolding}%</strong></span>
                <span>Public: <strong className="text-white">{ownership.publicHolding}%</strong></span>
              </div>
              {/* Stacked percentage bar */}
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
                <div style={{ width: `${ownership.promoterHolding}%` }} className="bg-emerald-500" title="Promoter" />
                <div style={{ width: `${ownership.fiiHolding}%` }} className="bg-cyan-500" title="FII" />
                <div style={{ width: `${ownership.diiHolding}%` }} className="bg-purple-500" title="DII" />
                <div style={{ width: `${ownership.publicHolding}%` }} className="bg-amber-500" title="Public" />
              </div>
            </div>

            {/* Promoter Pledge Check */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Promoter Pledge:</span>
              <span className={`font-bold text-xs ${ownership.promoterPledge === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ownership.promoterPledge === 0 ? '0.00% (Clean - No Encumbrance)' : `${ownership.promoterPledge}% (Warning)`}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Cash Flow Conversion:</span>
              <span className="font-bold text-xs text-emerald-400">
                {quality.cashConversionRatio}% of net income into cash
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
