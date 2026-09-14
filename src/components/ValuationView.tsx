import React from 'react';
import { ValuationMetrics, FundamentalMetrics } from '../types';
import { Scale, Calculator, ArrowUpRight, ArrowDownRight, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ValuationViewProps {
  valuation: ValuationMetrics;
  fundamentals: FundamentalMetrics;
  currentPrice: number;
  valuationScore: number;
  currency: string;
}

export const ValuationView: React.FC<ValuationViewProps> = ({
  valuation,
  fundamentals,
  currentPrice,
  valuationScore,
  currency,
}) => {
  const currSymbol = (currency || '').includes('INR') ? '₹' : '$';

  const dcfDiffPercent = valuation.intrinsicValueDCF
    ? ((valuation.intrinsicValueDCF - currentPrice) / currentPrice) * 100
    : 0;

  return (
    <div id="valuation-analysis-view" className="space-y-6">
      {/* Top Banner: Valuation Stance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>VALUATION MULTIPLES & INTRINSIC VALUE MODEL</span>
          </div>
          <div className="flex items-baseline space-x-3 mt-1">
            <span className="text-3xl font-black font-mono text-white">{valuationScore}</span>
            <span className="text-sm font-mono text-slate-400">/100 Valuation Score</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
              valuation.valuationStance === 'Undervalued'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : valuation.valuationStance === 'Fairly Valued'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}>
              {valuation.valuationStance}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
            Valuation is grounded in earnings yield vs risk-free government yields, peer sector benchmarks, and cash generation discount modeling.
          </p>
        </div>

        {/* DCF Margin of Safety Card */}
        {valuation.intrinsicValueDCF && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-right self-start md:self-auto">
            <div className="text-[10px] text-slate-400 uppercase">DCF INTRINSIC FAIR VALUE</div>
            <div className="text-2xl font-black text-white">
              {currSymbol}{valuation.intrinsicValueDCF.toLocaleString()}
            </div>
            <div className={`text-xs font-bold mt-0.5 ${dcfDiffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dcfDiffPercent >= 0 ? `+${dcfDiffPercent.toFixed(1)}% Discount (Safety Margin)` : `${dcfDiffPercent.toFixed(1)}% Premium to DCF`}
            </div>
          </div>
        )}
      </div>

      {/* Multiples Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* P/E vs 5Y vs Sector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-bold mb-1">PRICE TO EARNINGS (P/E)</div>
          <div className="text-2xl font-black text-white">{valuation.pe.toFixed(1)}x</div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>5-Year Historical:</span>
              <span className="text-slate-200 font-bold">{valuation.peHistorical5YrAvg.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span>Sector Benchmark:</span>
              <span className="text-slate-200 font-bold">{valuation.peSectorAvg.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        {/* PEG Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-bold mb-1">PEG RATIO (GROWTH ADJ)</div>
          <div className={`text-2xl font-black ${valuation.pegRatio < 1.0 ? 'text-emerald-400' : valuation.pegRatio < 2.0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {valuation.pegRatio.toFixed(2)}x
          </div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Peter Lynch Rule:</span>
              <span className="text-slate-200 font-bold">&lt; 1.0 = Bargain</span>
            </div>
            <div className="flex justify-between">
              <span>Earnings Growth:</span>
              <span className="text-emerald-400 font-bold">+{fundamentals.growth.epsGrowthYoY}%</span>
            </div>
          </div>
        </div>

        {/* EV/EBITDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-bold mb-1">ENTERPRISE VAL / EBITDA</div>
          <div className="text-2xl font-black text-white">{valuation.evToEbitda.toFixed(1)}x</div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Sector EV/EBITDA:</span>
              <span className="text-slate-200 font-bold">{valuation.evToEbitdaSectorAvg.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span>Multiple Premium:</span>
              <span className={valuation.evToEbitda <= valuation.evToEbitdaSectorAvg ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {(((valuation.evToEbitda - valuation.evToEbitdaSectorAvg) / valuation.evToEbitdaSectorAvg) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Price to Book & Dividend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-bold mb-1">P/B & DIVIDEND YIELD</div>
          <div className="text-2xl font-black text-white">{valuation.pb.toFixed(1)}x <span className="text-sm font-normal text-slate-400">P/B</span></div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Dividend Yield:</span>
              <span className="text-emerald-400 font-bold">{valuation.dividendYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Price-to-Sales:</span>
              <span className="text-slate-200 font-bold">{valuation.priceToSales.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intrinsic Modeling Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>INTRINSIC VALUE MODELING & SENSITIVITY</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">DCF Conservative Model</span>
            <div className="text-lg font-bold text-white mt-1">{currSymbol}{valuation.intrinsicValueDCF}</div>
            <p className="text-[10px] text-slate-500 mt-1">Based on 11.5% WACC discount rate, 5.0% terminal growth, and 3-year trailing free cash flow baseline.</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Graham Number Fair Price</span>
            <div className="text-lg font-bold text-white mt-1">{currSymbol}{valuation.grahamNumber}</div>
            <p className="text-[10px] text-slate-500 mt-1">Classic defensive benchmark: sqrt(22.5 × EPS × Book Value per Share).</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Multiple Mean Reversion Price</span>
            <div className="text-lg font-bold text-white mt-1">
              {currSymbol}{(currentPrice * (valuation.peHistorical5YrAvg / valuation.pe)).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Target price if multiple reverts exactly to the company's 5-year historical median.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
