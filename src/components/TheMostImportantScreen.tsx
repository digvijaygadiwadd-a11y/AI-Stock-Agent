import React from 'react';
import { StockIntelligenceData } from '../types';
import { CheckCircle2, AlertTriangle, Target, Sparkles, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface TheMostImportantScreenProps {
  data: StockIntelligenceData;
  onViewScoreBreakdown: () => void;
}

export const TheMostImportantScreen: React.FC<TheMostImportantScreenProps> = ({
  data,
  onViewScoreBreakdown,
}) => {
  const { identification, quote, scores, decision, setup } = data;
  const currSymbol = (identification?.currency || '').includes('INR') ? '₹' : '$';

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (score >= 55) return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-rose-400 bg-rose-950/60 border-rose-800';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-400';
    if (score >= 55) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div id="the-most-important-screen" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* 1. Master Verdict & Plain English Takeaway */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-5 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI EXECUTIVE VERDICT & SCORE</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white">
              {identification.ticker}
            </h2>
            <span className={`px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wide border ${
              scores.overallScore >= 75
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : scores.overallScore >= 55
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-rose-500 text-white border-rose-400'
            }`}>
              {decision.overallView} ({decision.technicalBias})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-medium">
            {decision.summaryThesis}
          </p>
        </div>

        {/* Master Score Dial */}
        <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800 self-start lg:self-auto">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">OVERALL RATING</div>
            <div className="flex items-baseline space-x-1 font-mono">
              <span id="overall-score-number" className="text-4xl font-black text-white">
                {scores.overallScore}
              </span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
              Confidence: {decision.confidenceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 Visual Score Progress Bars (Easy to read for anyone) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Fundamental */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 font-mono">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Fundamentals</span>
            <span className="font-bold text-white">{scores.fundamentalScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBarColor(scores.fundamentalScore)}`} style={{ width: `${scores.fundamentalScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Growth & Margins</span>
        </div>

        {/* Technical */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 font-mono">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Technicals</span>
            <span className="font-bold text-white">{scores.technicalScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBarColor(scores.technicalScore)}`} style={{ width: `${scores.technicalScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Trend & Momentum</span>
        </div>

        {/* Valuation */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 font-mono">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Valuation</span>
            <span className="font-bold text-white">{scores.valuationScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBarColor(scores.valuationScore)}`} style={{ width: `${scores.valuationScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">P/E & DCF Safety</span>
        </div>

        {/* News */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 font-mono">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">News Sentiment</span>
            <span className="font-bold text-white">{scores.newsScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBarColor(scores.newsScore)}`} style={{ width: `${scores.newsScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Recent Disclosures</span>
        </div>

        {/* Risk Safety */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/90 font-mono col-span-2 sm:col-span-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Safety / Solvency</span>
            <span className="font-bold text-white">{scores.riskScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBarColor(scores.riskScore)}`} style={{ width: `${scores.riskScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Balance Sheet Risk</span>
        </div>
      </div>

      {/* 3. The Three Core Decision Cards: Why Buy, Risks, and Key Trade Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Why Buy? */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WHY BUY? (KEY STRENGTHS)</span>
            </div>
            <ul className="space-y-2.5">
              {decision.whyBuy.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span className="leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: Risks to Watch */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>WHAT TO WATCH OUT FOR (RISKS)</span>
            </div>
            <ul className="space-y-2.5">
              {decision.whyNotBuy.map((risk, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                  <span className="text-amber-400 mt-0.5 font-bold">⚠</span>
                  <span className="leading-snug">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 3: Key Trade & Investment Levels */}
        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/60 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>KEY TRADE LEVELS</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">Entry Zone:</span>
                <span className="font-bold text-white">
                  {currSymbol}{setup.entryZone[0]} - {currSymbol}{setup.entryZone[1]}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold">Targets:</span>
                <span className="font-bold text-white">
                  T1: {currSymbol}{setup.target1} • T2: {currSymbol}{setup.target2}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-rose-400 font-bold">Stop-Loss / Exit:</span>
                <span className="font-bold text-white">
                  {currSymbol}{setup.invalidationLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Risk / Reward: <strong className="text-emerald-400">{setup.riskRewardRatio}</strong></span>
            <button
              onClick={onViewScoreBreakdown}
              className="text-cyan-400 hover:underline"
            >
              Full Financials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
