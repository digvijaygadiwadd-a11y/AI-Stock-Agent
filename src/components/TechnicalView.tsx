import React from 'react';
import { TechnicalIndicators, TechnicalSetup } from '../types';
import { Activity, Gauge, TrendingUp, Compass, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface TechnicalViewProps {
  technicals: TechnicalIndicators;
  setup: TechnicalSetup;
  currentPrice: number;
  currency: string;
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({
  technicals,
  setup,
  currentPrice,
  currency,
}) => {
  const currSymbol = (currency || '').includes('INR') ? '₹' : '$';

  // Helper flags
  const isMacdBullish = technicals.macd.trend === 'Bullish' || technicals.macd.histogram > 0;
  const isTrendBullish = technicals.movingAverages.trendBias === 'Strong Uptrend' || technicals.movingAverages.trendBias === 'Uptrend';
  const isGoldenCross = technicals.movingAverages.sma50 > technicals.movingAverages.sma200;
  const bbPosition = technicals.bollingerBands.position || 'Middle Range';
  const bbBandwidth = technicals.bollingerBands.bandwidth ?? 0;
  const adxVal = typeof technicals.adx === 'number' ? technicals.adx : (technicals.adx as any)?.value ?? 25;
  const adxStrength = technicals.adxStrength || ((technicals.adx as any)?.trendStrength ?? 'Moderate Trend');
  const stochK = technicals.stochastic.k ?? 50;
  const stochD = technicals.stochastic.d ?? 50;
  const stochState = technicals.stochastic.state || ((technicals.stochastic as any)?.status ?? 'Neutral');
  const volInterpretation = technicals.volumeInterpretation || ((technicals as any)?.obvTrend ?? 'Normal');
  const atrVal = technicals.atr ?? 0;
  const atrPct = currentPrice > 0 ? ((atrVal / currentPrice) * 100).toFixed(1) : '1.5';

  // Multi-indicator consensus summary
  const indicatorsSummary = [
    { name: 'RSI (14)', value: technicals.rsi, status: technicals.rsiSignal, bullish: technicals.rsi < 70 && technicals.rsi > 45 },
    { name: 'MACD Crossover', value: technicals.macd.histogram > 0 ? `+${technicals.macd.histogram.toFixed(2)}` : technicals.macd.histogram.toFixed(2), status: technicals.macd.trend, bullish: isMacdBullish },
    { name: 'EMA Trend', value: technicals.movingAverages.trendBias, status: 'Active', bullish: isTrendBullish },
    { name: 'Golden Cross (50/200)', value: isGoldenCross ? 'Confirmed' : 'None', status: isGoldenCross ? 'BULLISH' : 'NEUTRAL', bullish: isGoldenCross },
    { name: 'Bollinger Bandwidth', value: `${bbBandwidth.toFixed(1)}% BW`, status: bbPosition, bullish: bbPosition !== 'Near Upper Band' },
    { name: 'ADX Trend Strength', value: `${adxVal.toFixed(1)}`, status: adxStrength, bullish: adxVal > 25 },
    { name: 'Stochastic (%K)', value: `${stochK.toFixed(1)}`, status: stochState, bullish: stochState !== 'Overbought' },
    { name: 'OBV Flow', value: 'Flow Stance', status: volInterpretation, bullish: volInterpretation === 'Accumulation' },
  ];

  const bullishCount = indicatorsSummary.filter(i => i.bullish).length;
  const neutralOrBearishCount = indicatorsSummary.length - bullishCount;

  return (
    <div id="technical-analysis-view" className="space-y-6">
      {/* Top Consensus Metric Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>TECHNICAL INDICATOR CONSENSUS</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {technicals.candlestickPattern || 'Technical Consensus'}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
            {technicals.structureInterpretation}
          </p>
        </div>

        {/* Bull vs Bear Gauge Ratio */}
        <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800 self-start md:self-auto">
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-emerald-400">{bullishCount}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Bullish</div>
          </div>
          <div className="text-slate-600 font-mono text-xl">/</div>
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-amber-400">{neutralOrBearishCount}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Neutral/Bear</div>
          </div>
          <div className="pl-3 border-l border-slate-800 text-[11px] font-mono">
            <div className="text-slate-400">ATR (14):</div>
            <div className="text-white font-bold">{currSymbol}{atrVal.toFixed(2)} ({atrPct}%)</div>
          </div>
        </div>
      </div>

      {/* Moving Averages Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>MOVING AVERAGES & TREND ALIGNMENT</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'EMA 20', val: technicals.movingAverages.ema20 },
            { label: 'EMA 50', val: technicals.movingAverages.ema50 },
            { label: 'EMA 100', val: technicals.movingAverages.ema100 },
            { label: 'EMA 200', val: technicals.movingAverages.ema200 },
            { label: 'SMA 50', val: technicals.movingAverages.sma50 },
            { label: 'SMA 200', val: technicals.movingAverages.sma200 },
          ].map((ma, idx) => {
            const isAbove = currentPrice >= ma.val;
            return (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                <div className="text-[11px] text-slate-400">{ma.label}</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {currSymbol}{ma.val.toFixed(2)}
                </div>
                <div className={`text-[10px] font-bold mt-1 flex items-center space-x-1 ${
                  isAbove ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isAbove ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isAbove ? 'Price Above' : 'Price Below'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oscillator and Momentum Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Oscillators */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>MOMENTUM & OSCILLATORS</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {/* RSI */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Relative Strength Index (RSI 14)</span>
                <div className="text-[11px] text-slate-400">Current reading: {technicals.rsi}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                technicals.rsiSignal === 'Overbought'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : technicals.rsiSignal === 'Oversold'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {technicals.rsiSignal}
              </span>
            </div>

            {/* MACD */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">MACD (12, 26, 9)</span>
                <div className="text-[11px] text-slate-400">
                  Line: {technicals.macd.line.toFixed(2)} | Sig: {technicals.macd.signal.toFixed(2)} | Hist: {technicals.macd.histogram.toFixed(2)}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                isMacdBullish
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}>
                {technicals.macd.trend}
              </span>
            </div>

            {/* Stochastic */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Stochastic Oscillator</span>
                <div className="text-[11px] text-slate-400">
                  %K: {stochK.toFixed(1)} | %D: {stochD.toFixed(1)}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {stochState}
              </span>
            </div>

            {/* ADX */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Average Directional Index (ADX)</span>
                <div className="text-[11px] text-slate-400">Value: {adxVal.toFixed(1)}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {adxStrength}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Volatility & Volume Bands */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>VOLATILITY & EXECUTION TARGETS</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {/* Bollinger Bands */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-white">Bollinger Bands (20, 2)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  {bbPosition}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 mt-2">
                <div>Upper: <span className="text-slate-200 font-bold">{currSymbol}{technicals.bollingerBands.upper.toFixed(1)}</span></div>
                <div>Middle: <span className="text-slate-200 font-bold">{currSymbol}{technicals.bollingerBands.middle.toFixed(1)}</span></div>
                <div>Lower: <span className="text-slate-200 font-bold">{currSymbol}{technicals.bollingerBands.lower.toFixed(1)}</span></div>
              </div>
            </div>

            {/* Target 1 & Target 2 */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center text-slate-400">
                <span>Upside Target 1 (T1):</span>
                <span className="font-bold text-emerald-400">{currSymbol}{setup.target1} (+{(((setup.target1 - currentPrice) / currentPrice) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 mt-1.5">
                <span>Upside Target 2 (T2):</span>
                <span className="font-bold text-emerald-400">{currSymbol}{setup.target2} (+{(((setup.target2 - currentPrice) / currentPrice) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-rose-400">Invalidation Level:</span>
                <span className="font-bold text-rose-400">{currSymbol}{setup.invalidationLevel} (-{(((currentPrice - setup.invalidationLevel) / currentPrice) * 100).toFixed(1)}%)</span>
              </div>
            </div>

            {/* Volume Flow */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">On-Balance Volume (OBV)</span>
                <div className="text-[11px] text-slate-400">Volume accumulation trend</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {volInterpretation}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
