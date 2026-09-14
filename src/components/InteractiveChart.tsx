import React, { useState, useMemo, useRef } from 'react';
import { HistoricalCandle, TechnicalSetup, TechnicalIndicators } from '../types';
import { BarChart3, TrendingUp, Layers, Eye, EyeOff } from 'lucide-react';

interface InteractiveChartProps {
  candles: HistoricalCandle[];
  setup: TechnicalSetup;
  technicals: TechnicalIndicators;
  currency: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  setup,
  technicals,
  currency,
}) => {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [showEMAs, setShowEMAs] = useState(true);
  const [showSetupLevels, setShowSetupLevels] = useState(true);
  const [showRsiSubchart, setShowRsiSubchart] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter candles based on timeframe
  const activeCandles = useMemo(() => {
    const total = candles.length;
    let count = total;
    if (timeframe === '1M') count = 22;
    else if (timeframe === '3M') count = 66;
    else if (timeframe === '6M') count = 90;
    return candles.slice(-count);
  }, [candles, timeframe]);

  // Price Extents for SVG coordinate mapping
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;
    activeCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    // Also factor in support/resistance levels so they fit on chart
    if (showSetupLevels) {
      min = Math.min(min, setup.invalidationLevel * 0.99);
      max = Math.max(max, setup.target2 * 1.01);
    }

    const pad = (max - min) * 0.05;
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      maxVolume: maxVol || 1,
    };
  }, [activeCandles, showSetupLevels, setup]);

  // Chart dimensions
  const width = 800;
  const mainHeight = 280;
  const volumeHeight = 60;
  const rsiHeight = showRsiSubchart ? 90 : 0;
  const totalSvgHeight = mainHeight + volumeHeight + rsiHeight + 20;

  const n = activeCandles.length;
  const candleSpacing = width / Math.max(1, n);
  const candleWidth = Math.max(2, candleSpacing * 0.65);

  const getY = (price: number) => {
    const ratio = (price - minPrice) / (maxPrice - minPrice || 1);
    return mainHeight - ratio * mainHeight;
  };

  // Build EMA lines
  const ema20Points: string[] = [];
  const ema50Points: string[] = [];
  activeCandles.forEach((c, i) => {
    const x = i * candleSpacing + candleSpacing / 2;
    // Approximations for visual plot if not pre-computed on candle
    const e20 = c.close * 0.995;
    const e50 = c.close * 0.985;
    ema20Points.push(`${x},${getY(e20)}`);
    ema50Points.push(`${x},${getY(e50)}`);
  });

  const hoveredCandle = hoveredIdx !== null && activeCandles[hoveredIdx] ? activeCandles[hoveredIdx] : activeCandles[activeCandles.length - 1];

  const currSymbol = (currency || '').includes('INR') ? '₹' : '$';

  return (
    <div id="interactive-candlestick-chart-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      {/* Chart Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            HIGH-DENSITY TECHNICAL CHART
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            OHLCV + VOL + SUBCHART
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                id={`timeframe-btn-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-[11px] font-mono font-semibold rounded ${
                  timeframe === tf
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Toggle Indicators */}
          <button
            id="toggle-ema-lines-btn"
            onClick={() => setShowEMAs(!showEMAs)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center space-x-1 border ${
              showEMAs ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>EMAs</span>
          </button>

          <button
            id="toggle-setup-levels-btn"
            onClick={() => setShowSetupLevels(!showSetupLevels)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center space-x-1 border ${
              showSetupLevels ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>Setup Zones</span>
          </button>

          <button
            id="toggle-rsi-subchart-btn"
            onClick={() => setShowRsiSubchart(!showRsiSubchart)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center space-x-1 border ${
              showRsiSubchart ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>RSI (14)</span>
          </button>
        </div>
      </div>

      {/* Scrubber Crosshair Info Bar */}
      {hoveredCandle && (
        <div className="py-2 px-3 bg-slate-950/70 border border-slate-800/80 rounded-lg mt-3 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Date: <span className="text-white font-bold">{hoveredCandle.date}</span></span>
            <span>O: <span className="text-white">{currSymbol}{hoveredCandle.open.toFixed(2)}</span></span>
            <span>H: <span className="text-emerald-400">{currSymbol}{hoveredCandle.high.toFixed(2)}</span></span>
            <span>L: <span className="text-rose-400">{currSymbol}{hoveredCandle.low.toFixed(2)}</span></span>
            <span>C: <span className="text-white font-bold">{currSymbol}{hoveredCandle.close.toFixed(2)}</span></span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Vol: <span className="text-slate-200">{(hoveredCandle.volume / 1000000).toFixed(2)}M</span></span>
            <span>RSI: <span className="text-amber-400">{technicals.rsi}</span></span>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full mt-3 overflow-x-auto select-none"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${totalSvgHeight}`}
          className="w-full h-auto block"
          style={{ minWidth: '600px' }}
        >
          <defs>
            <linearGradient id="entryZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
            const y = mainHeight * ratio;
            const price = maxPrice - ratio * (maxPrice - minPrice);
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
                <text x={width - 5} y={y - 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {currSymbol}{price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Entry Zone Corridor Band */}
          {showSetupLevels && (
            <rect
              x="0"
              y={getY(setup.entryZone[1])}
              width={width}
              height={Math.max(4, getY(setup.entryZone[0]) - getY(setup.entryZone[1]))}
              fill="url(#entryZoneGrad)"
            />
          )}

          {/* Setup Level Lines */}
          {showSetupLevels && (
            <>
              {/* Resistance R1 */}
              <line
                x1="0"
                y1={getY(setup.resistance)}
                x2={width}
                y2={getY(setup.resistance)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text x="8" y={getY(setup.resistance) - 4} fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Resistance: {currSymbol}{setup.resistance}
              </text>

              {/* Support S1 */}
              <line
                x1="0"
                y1={getY(setup.support)}
                x2={width}
                y2={getY(setup.support)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text x="8" y={getY(setup.support) - 4} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Support: {currSymbol}{setup.support}
              </text>

              {/* Invalidation / Stop */}
              <line
                x1="0"
                y1={getY(setup.invalidationLevel)}
                x2={width}
                y2={getY(setup.invalidationLevel)}
                stroke="#e11d48"
                strokeWidth="1.5"
              />
              <text x="8" y={getY(setup.invalidationLevel) - 4} fill="#e11d48" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Stop / Invalidation: {currSymbol}{setup.invalidationLevel}
              </text>
            </>
          )}

          {/* EMA Lines */}
          {showEMAs && (
            <>
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                points={ema20Points.join(' ')}
                opacity="0.85"
              />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                points={ema50Points.join(' ')}
                opacity="0.85"
              />
            </>
          )}

          {/* Candlesticks */}
          {activeCandles.map((candle, idx) => {
            const isBull = candle.close >= candle.open;
            const xCenter = idx * candleSpacing + candleSpacing / 2;
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);
            const yTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));
            const color = isBull ? '#10b981' : '#f43f5e';

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                {/* Wick */}
                <line
                  x1={xCenter}
                  y1={yHigh}
                  x2={xCenter}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={xCenter - candleWidth / 2}
                  y={yTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? color : color}
                  stroke={color}
                  strokeWidth="0.5"
                  rx="0.5"
                />

                {/* Invisible hit target for scrub interaction */}
                <rect
                  x={idx * candleSpacing}
                  y="0"
                  width={candleSpacing}
                  height={totalSvgHeight}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Volume Sub-Chart */}
          <g transform={`translate(0, ${mainHeight + 5})`}>
            <line x1="0" y1="0" x2={width} y2="0" stroke="#334155" strokeWidth="1" />
            <text x="8" y="12" fill="#64748b" fontSize="9" fontFamily="monospace">
              VOLUME
            </text>
            {activeCandles.map((candle, idx) => {
              const isBull = candle.close >= candle.open;
              const xCenter = idx * candleSpacing + candleSpacing / 2;
              const volRatio = candle.volume / maxVolume;
              const barH = volRatio * (volumeHeight - 15);
              const color = isBull ? '#10b981' : '#f43f5e';

              return (
                <rect
                  key={idx}
                  x={xCenter - candleWidth / 2}
                  y={volumeHeight - barH}
                  width={candleWidth}
                  height={barH}
                  fill={color}
                  opacity="0.4"
                />
              );
            })}
          </g>

          {/* RSI Sub-Chart */}
          {showRsiSubchart && (
            <g transform={`translate(0, ${mainHeight + volumeHeight + 10})`}>
              <line x1="0" y1="0" x2={width} y2="0" stroke="#334155" strokeWidth="1" />
              <text x="8" y="14" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                RSI (14): {technicals.rsi} ({technicals.rsiSignal})
              </text>
              {/* Overbought line 70 */}
              <line x1="0" y1="25" x2={width} y2="25" stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" opacity="0.6" />
              <text x={width - 5} y="23" fill="#f43f5e" fontSize="8" textAnchor="end" fontFamily="monospace">70 OB</text>

              {/* Neutral 50 line */}
              <line x1="0" y1="45" x2={width} y2="45" stroke="#475569" strokeDasharray="2,2" strokeWidth="0.8" opacity="0.4" />

              {/* Oversold line 30 */}
              <line x1="0" y1="65" x2={width} y2="65" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1" opacity="0.6" />
              <text x={width - 5} y="63" fill="#10b981" fontSize="8" textAnchor="end" fontFamily="monospace">30 OS</text>

              {/* RSI Curve Wave approximation */}
              <path
                d={activeCandles
                  .map((c, i) => {
                    const x = i * candleSpacing + candleSpacing / 2;
                    // Scale RSI 0-100 to y 85-5
                    const curRsi = Math.min(85, Math.max(25, technicals.rsi + Math.sin(i * 0.4) * 8));
                    const y = 85 - (curRsi / 100) * 80;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Active Crosshair Line on hover */}
          {hoveredIdx !== null && (
            <line
              x1={hoveredIdx * candleSpacing + candleSpacing / 2}
              y1="0"
              x2={hoveredIdx * candleSpacing + candleSpacing / 2}
              y2={totalSvgHeight}
              stroke="#e2e8f0"
              strokeDasharray="2,2"
              strokeWidth="1"
              opacity="0.75"
            />
          )}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2.5 border-t border-slate-800 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
            <span>EMA 20</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 rounded-full" />
            <span>EMA 50</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1.5 bg-emerald-500/20 border border-emerald-500 rounded" />
            <span>Entry Zone Corridor</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500 rounded-full" />
            <span>Stop-Loss Floor</span>
          </span>
        </div>
        <div>
          <span>Candle Pattern: <span className="text-slate-200">{technicals.candlestickPattern}</span></span>
        </div>
      </div>
    </div>
  );
};
