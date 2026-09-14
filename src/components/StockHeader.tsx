import React from 'react';
import { StockIntelligenceData } from '../types';
import { Star, Bell, Sparkles, FileEdit, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StockHeaderProps {
  data: StockIntelligenceData;
  onTriggerDeepAI: () => void;
  onAddToWatchlist: () => void;
  onOpenAlertModal: () => void;
  onOpenThesisModal: () => void;
  isWatchlisted: boolean;
  isDeepAILoading: boolean;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  data,
  onTriggerDeepAI,
  onAddToWatchlist,
  onOpenAlertModal,
  onOpenThesisModal,
  isWatchlisted,
  isDeepAILoading,
}) => {
  const { identification, quote, scores, decision } = data;
  const isPositive = quote.change >= 0;
  const currSymbol = (identification?.currency || '').includes('INR') ? '₹' : '$';

  // 52-week position
  const range52 = quote.week52High - quote.week52Low;
  const current52Pos = range52 > 0 ? Math.min(100, Math.max(0, ((quote.price - quote.week52Low) / range52) * 100)) : 50;

  return (
    <div id="stock-header-card" className="w-full bg-slate-900/90 border-b border-slate-800 px-3 md:px-5 py-3.5 shadow-sm">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Stock Details & Price */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <h1 id="stock-ticker-title" className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {identification.ticker}
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                {identification.exchange}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {identification.sector}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              {identification.name}
            </div>
          </div>

          {/* Current Live Price Block */}
          <div className="flex items-baseline space-x-2.5 font-mono">
            <span id="stock-live-price" className="text-2xl sm:text-3xl font-black text-white">
              {currSymbol}{quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`text-sm font-bold flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{isPositive ? '+' : ''}{currSymbol}{quote.change.toFixed(2)}</span>
              <span className="ml-1">({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
            </div>
          </div>

          {/* 52-Week Range Mini Bar */}
          <div className="hidden lg:flex flex-col text-[11px] font-mono text-slate-400 w-36">
            <div className="flex justify-between text-[10px] mb-1">
              <span>Low: {currSymbol}{quote.week52Low}</span>
              <span>High: {currSymbol}{quote.week52High}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${current52Pos}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Watchlist Toggle */}
          <button
            id="stock-header-watchlist-btn"
            onClick={onAddToWatchlist}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold font-mono text-xs transition-colors border ${
              isWatchlisted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>

          {/* Price Alert */}
          <button
            id="stock-header-alert-btn"
            onClick={onOpenAlertModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold font-mono text-xs border border-slate-700 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Set Alert</span>
          </button>

          {/* Personal Thesis */}
          <button
            id="stock-header-thesis-btn"
            onClick={onOpenThesisModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold font-mono text-xs border border-slate-700 transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>My Thesis</span>
          </button>

          {/* Deep AI Trigger Button */}
          <button
            id="stock-header-ai-btn"
            onClick={onTriggerDeepAI}
            disabled={isDeepAILoading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDeepAILoading ? 'animate-spin' : ''}`} />
            <span>{isDeepAILoading ? 'AI Analyzing...' : 'Run Deep AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
