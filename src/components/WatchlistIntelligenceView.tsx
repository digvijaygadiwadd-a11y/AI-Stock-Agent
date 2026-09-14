import React, { useState, useEffect } from 'react';
import { Bookmark, TrendingUp, Sparkles, Trash2, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';

interface WatchlistIntelligenceViewProps {
  onSelectStock: (ticker: string) => void;
}

export const WatchlistIntelligenceView: React.FC<WatchlistIntelligenceViewProps> = ({
  onSelectStock,
}) => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/market-overview');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlistIntelligence || []);
      }
    } catch (err) {
      console.error('Failed to load watchlist intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/watchlist/${ticker}`, { method: 'DELETE' });
      setWatchlist(watchlist.filter(item => item.ticker !== ticker));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  return (
    <div id="watchlist-intelligence-view" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>CONTINUOUS WATCHLIST MONITORING MATRIX</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            Active Securities Under Autonomous Surveillance
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            The platform's background agents continuously parse tick data, regulatory disclosures, and news to generate real-time state badges.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          Tracking: <span className="text-white font-bold">{watchlist.length} Securities</span>
        </div>
      </div>

      {/* Grid of Watchlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => {
          const isPositive = item.changePercent >= 0;
          return (
            <div
              key={item.ticker}
              id={`watchlist-card-${item.ticker}`}
              onClick={() => onSelectStock(item.ticker)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black font-mono text-white group-hover:text-emerald-400 transition-colors">
                      {item.ticker}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                      P/E: {item.pe}x
                    </span>
                  </div>

                  <button
                    id={`remove-watchlist-${item.ticker}`}
                    onClick={(e) => handleRemove(item.ticker, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 font-medium truncate mt-1">
                  {item.name}
                </div>

                <div className="flex items-baseline space-x-2 mt-2 font-mono">
                  <span className="text-xl font-bold text-white">
                    {item.price ? item.price.toLocaleString() : '—'}
                  </span>
                  <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{item.changePercent}%
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {item.statusBadge}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
