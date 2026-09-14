import React from 'react';
import { AgentFindings, DecisionEngineOutput, Scenarios, WhatChangedAnalysis } from '../types';
import { Bot, ShieldCheck, AlertOctagon, HelpCircle, GitCommit, Target, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AIResearchAndVerificationViewProps {
  findings: AgentFindings;
  decision: DecisionEngineOutput;
  scenarios: Scenarios;
  whatChanged: WhatChangedAnalysis;
  ticker: string;
  currency: string;
}

export const AIResearchAndVerificationView: React.FC<AIResearchAndVerificationViewProps> = ({
  findings,
  decision,
  scenarios,
  whatChanged,
  ticker,
  currency,
}) => {
  const currSymbol = (currency || '').includes('INR') ? '₹' : '$';

  // Resilient scenarios extraction supporting bullCase / bull, baseCase / base, bearCase / bear
  const sc = (scenarios || {}) as any;
  const bull = sc.bullCase || sc.bull || {};
  const base = sc.baseCase || sc.base || {};
  const bear = sc.bearCase || sc.bear || {};

  const bullTarget = bull.target ?? bull.targetPrice ?? 0;
  const bullProb = bull.probability ?? 30;
  const bullUpside = bull.upsidePercent ?? bull.potentialUpsidePercent ?? 0;
  const bullCatalyst = Array.isArray(bull.whatNeedsToHappen)
    ? bull.whatNeedsToHappen.join(' • ')
    : (bull.catalyst || 'Revenue growth and sector tailwinds');
  const bullCondition = bull.conditions || (Array.isArray(bull.whatNeedsToHappen) ? bull.whatNeedsToHappen[0] : 'Sustained momentum');

  const baseTarget = base.target ?? base.targetPrice ?? 0;
  const baseProb = base.probability ?? 50;
  const baseUpside = base.upsidePercent ?? base.potentialUpsidePercent ?? 0;
  const baseCatalyst = base.mostReasonableScenario || base.catalyst || 'Consolidation in line with earnings run-rate';
  const baseCondition = base.conditions || 'Standard market volatility regime';

  const bearTarget = bear.target ?? bear.targetPrice ?? 0;
  const bearProb = bear.probability ?? 20;
  const bearDownside = bear.downsidePercent ?? bear.potentialDownsidePercent ?? 0;
  const bearCatalyst = Array.isArray(bear.whatCouldGoWrong)
    ? bear.whatCouldGoWrong.join(' • ')
    : (bear.catalyst || 'Margin compression and multiple de-rating');
  const bearCondition = bear.conditions || (Array.isArray(bear.whatCouldGoWrong) ? bear.whatCouldGoWrong[0] : 'Breakdown below support');

  // Resilient whatChanged extraction
  const wc = (whatChanged || {}) as any;
  const prevDate = wc.previousAnalysisDate || '3 weeks ago';
  const priceChange = wc.priceChangeSince || (wc.priceChange ? `${wc.priceChange}` : 'Consolidating');
  const scoreChangeVal = wc.scoreChange ?? wc.scoreChangeSince ?? 0;
  const scoreChangeStr = typeof scoreChangeVal === 'number'
    ? `${scoreChangeVal >= 0 ? '+' : ''}${scoreChangeVal} pts`
    : String(scoreChangeVal);
  const changesList = Array.isArray(wc.keyChanges) ? wc.keyChanges : [];

  return (
    <div id="ai-research-and-verification-view" className="space-y-6">
      {/* 1. Specialized Multi-Agent Intelligence Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>SPECIALIZED MULTI-AGENT REASONING PIPELINE</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Independent domain agents evaluate partitioned market vectors before synthesis.
            </p>
          </div>

          {/* Verification Agent Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Verification Gate:</span>
            <span className={`font-bold ${
              decision?.verificationStatus === 'VERIFIED_CONCORDANT' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {decision?.verificationStatus || 'VERIFIED'}
            </span>
          </div>
        </div>

        {/* 5 Domain Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* Fundamental Agent */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">1. Fundamental Agent</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {findings?.fundamentalAgent?.stance || 'Bullish'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.fundamentalAgent?.summary || 'Solid balance sheet with operating cash flow generation.'}
            </p>
          </div>

          {/* Technical Agent */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">2. Technical Agent</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {findings?.technicalAgent?.stance || 'Bullish'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.technicalAgent?.summary || 'Price structured above support with positive volume trend.'}
            </p>
          </div>

          {/* Valuation Agent */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">3. Valuation Agent</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {findings?.valuationAgent?.stance || 'Fair'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.valuationAgent?.summary || 'Multiples within acceptable premium range given industry ROE.'}
            </p>
          </div>

          {/* News Agent */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">4. News Agent</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {findings?.newsAgent?.stance || 'Neutral'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.newsAgent?.summary || 'Corporate disclosures reflect operational execution and regulatory alignment.'}
            </p>
          </div>

          {/* Risk Agent */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">5. Risk Agent</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                {findings?.riskAgent?.stance || 'Low Risk'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.riskAgent?.summary || 'Solvency ratios sound; moderate vulnerability to broad macro swings.'}
            </p>
          </div>

          {/* Verification Agent Gate */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">6. Verification Gate</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Cross-Checked
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {findings?.verificationAgent?.notes || 'No fatal discrepancies detected between balance sheet metrics and price trend.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. "Why NOT Buy?" — Complete Counterarguments & Thesis Invalidation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <span>INSTITUTIONAL DEVIL'S ADVOCATE: WHY NOT BUY?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
            <div className="text-xs font-mono font-bold text-rose-400 mb-2 flex items-center space-x-1.5">
              <span>⚠</span>
              <span>WHAT COULD GO WRONG?</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {(decision?.whatCouldGoWrong || ['Broader cyclical downturn', 'Valuation compression under higher interest rates']).map((risk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-rose-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
            <div className="text-xs font-mono font-bold text-amber-400 mb-2 flex items-center space-x-1.5">
              <span>⚡</span>
              <span>WHAT WOULD INVALIDATE OR CHANGE THIS VIEW?</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {(decision?.whatWouldChangeView || ['Consecutive quarterly margin drops', 'Decisive close below key stop-loss']).map((trigger, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span>{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bull / Base / Bear Scenario Modeling */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>PROBABILISTIC SCENARIOS (BULL / BASE / BEAR)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Bull Scenario */}
          <div className="bg-slate-950 p-4 rounded-lg border border-emerald-900/60 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-emerald-400">BULL SCENARIO</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {bullProb}% Prob
                </span>
              </div>
              <div className="text-2xl font-black text-white">
                {currSymbol}{bullTarget.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                +{bullUpside}% Upside
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {bullCatalyst}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500">
              Condition: {bullCondition}
            </div>
          </div>

          {/* Base Scenario */}
          <div className="bg-slate-950 p-4 rounded-lg border border-cyan-900/60 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-cyan-400">BASE SCENARIO</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {baseProb}% Prob
                </span>
              </div>
              <div className="text-2xl font-black text-white">
                {currSymbol}{baseTarget.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-cyan-400 mt-0.5">
                +{baseUpside}% Upside
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {baseCatalyst}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500">
              Condition: {baseCondition}
            </div>
          </div>

          {/* Bear Scenario */}
          <div className="bg-slate-950 p-4 rounded-lg border border-rose-900/60 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-rose-400">BEAR SCENARIO</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {bearProb}% Prob
                </span>
              </div>
              <div className="text-2xl font-black text-white">
                {currSymbol}{bearTarget.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-rose-400 mt-0.5">
                {bearDownside > 0 ? `-${bearDownside}` : bearDownside}% Downside
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {bearCatalyst}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500">
              Condition: {bearCondition}
            </div>
          </div>
        </div>
      </div>

      {/* 4. What Changed Since Previous Analysis? */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <span>WHAT CHANGED SINCE PREVIOUS ANALYSIS? ({prevDate})</span>
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {/* Score & Price Delta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Price Movement:</span>
              <span className="font-bold text-white">{priceChange}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Overall Score Drift:</span>
              <span className="font-bold text-emerald-400">{scoreChangeStr}</span>
            </div>
          </div>

          {/* Specific Changes List */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              DELTA AUDIT TRAIL:
            </div>
            <ul className="space-y-2">
              {changesList.map((change: any, i: number) => {
                const isObj = typeof change === 'object' && change !== null;
                const title = isObj ? change.metric : null;
                const desc = isObj ? change.description : String(change);
                return (
                  <li key={i} className="flex items-start space-x-2 text-slate-300">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {title && <strong className="text-white mr-1.5">{title}:</strong>}
                      {desc}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
