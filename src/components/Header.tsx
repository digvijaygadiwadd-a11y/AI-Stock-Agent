import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Sparkles, Settings2, CheckCircle2, ChevronDown } from 'lucide-react';
import { StockIdentification } from '../types';

interface HeaderProps {
  currentTicker: string;
  onSelectStock: (ticker: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  isStreamingAI?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTicker,
  onSelectStock,
  activeTab,
  setActiveTab,
  onOpenSettings,
  isStreamingAI = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockIdentification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick ticker presets for 1-click switching
  const quickTickers = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'NVDA', 'TSLA', 'AAPL', 'BEL', 'TATAMOTORS'];

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error('Search fetch error:', e);
      }
    };
    fetchSearch();
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (ticker: string) => {
    const clean = ticker.trim().toUpperCase();
    if (clean) {
      onSelectStock(clean);
      setActiveTab('dashboard');
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query matches any search result
    const exact = searchResults.find(
      (s) => s.ticker.toUpperCase() === query.toUpperCase()
    );
    const target = exact
      ? exact.ticker
      : searchResults.length > 0
      ? searchResults[0].ticker
      : query.toUpperCase().replace(/[^A-Z0-9.-]/g, '');

    handleSelect(target);
  };

  // Simplified, user-friendly primary categories
  const navTabs = [
    { id: 'dashboard', label: '🎯 Decision & Chart' },
    { id: 'financials', label: '📊 Deep Financials' },
    { id: 'ai-news', label: '🤖 AI Scenarios & News' },
    { id: 'tracker', label: '💼 Watchlist & Portfolio' },
    { id: 'macro', label: '🌐 Market & Sectors' },
  ];

  return (
    <header id="platform-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 w-full shadow-lg">
      {/* Top Branding & Search Bar - Full Screen Width */}
      <div className="w-full px-3 md:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clean Brand */}
        <div className="flex items-center space-x-2.5">
          <div id="brand-badge" className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm sm:text-base tracking-tight text-white">
                STOCK INTEL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                AI PRO
              </span>
            </div>
          </div>
        </div>

        {/* Global Stock Search Bar */}
        <div className="relative flex-1 max-w-sm sm:max-w-md" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="stock-search-input"
              type="text"
              placeholder="Search any stock (e.g. INFY, TSLA, HDFCBANK)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm pl-9 pr-20 py-2 rounded-lg border border-slate-700/80 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-500 font-mono"
            />
            <div className="absolute right-1.5 flex items-center space-x-1">
              {searchQuery && (
                <button
                  type="button"
                  id="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-500 hover:text-slate-300 px-1 text-xs"
                  title="Clear"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                id="search-submit-btn"
                className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition-all shadow-sm active:scale-95"
                title="Search Stock"
              >
                GO
              </button>
            </div>
          </form>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div
              id="search-results-dropdown"
              className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 max-h-96 overflow-y-auto"
            >
              {/* Direct Instant Analyze Bar if query typed */}
              {searchQuery.trim() && (
                <div
                  id="search-direct-action"
                  onClick={() => handleSelect(searchQuery)}
                  className="px-3 py-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 border-b border-emerald-800/60 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs text-emerald-300 font-mono font-bold">
                      ⚡ Press Enter or Click to Analyze "{searchQuery.trim().toUpperCase()}"
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold uppercase">
                    Direct AI Scan
                  </span>
                </div>
              )}

              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 bg-slate-950 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Matching Stocks</span>
                    <span className="font-mono text-emerald-400">{searchResults.length} found</span>
                  </div>
                  {searchResults.map((stock) => (
                    <div
                      key={stock.ticker}
                      id={`search-item-${stock.ticker}`}
                      onClick={() => handleSelect(stock.ticker)}
                      className="px-3 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                            {stock.exchange}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {stock.currency}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate">
                          {stock.name}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                          {stock.sector}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-3 text-center">
                  <div className="text-xs text-slate-300 mb-1">
                    No exact match for "<span className="font-mono font-bold text-white">{searchQuery}</span>"
                  </div>
                  <button
                    onClick={() => handleSelect(searchQuery)}
                    className="mt-1 px-3 py-1.5 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono transition-all"
                  >
                    Analyze "{searchQuery.trim().toUpperCase()}" anyway →
                  </button>
                </div>
              )}

              {/* Popular Discovery Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Popular Leaders (1-Click Analysis):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NVDA', 'TSLA', 'AAPL', 'BEL', 'TATAMOTORS'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSelect(t)}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[11px] font-mono font-semibold border border-slate-700 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick 1-Click Tickers */}
        <div className="hidden xl:flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">STOCKS:</span>
          {quickTickers.map((t) => (
            <button
              key={t}
              id={`quick-ticker-${t}`}
              onClick={() => onSelectStock(t)}
              className={`px-2.5 py-1 text-xs font-mono rounded font-bold transition-all ${
                currentTicker === t
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-850 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status Pill & Settings */}
        <div className="flex items-center space-x-2">
          {isStreamingAI && (
            <div id="ai-streaming-pill" className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-xs font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="hidden sm:inline">Analyzing</span>
            </div>
          )}

          <div id="realtime-status-pill" className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>

          <button
            id="open-settings-button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Configure Weights"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simplified, User-Friendly Navigation Bar - Full Width */}
      <div className="border-t border-slate-800/90 bg-slate-950/80 w-full px-3 md:px-5 flex items-center overflow-x-auto py-1.5">
        <div className="flex space-x-1.5 sm:space-x-2">
          {navTabs.map((tab) => {
            const isActive =
              activeTab === tab.id ||
              (tab.id === 'dashboard' && activeTab === 'dashboard') ||
              (tab.id === 'financials' && (activeTab === 'financials' || activeTab === 'technicals' || activeTab === 'fundamentals' || activeTab === 'valuation')) ||
              (tab.id === 'ai-news' && (activeTab === 'ai-news' || activeTab === 'news' || activeTab === 'ai-research')) ||
              (tab.id === 'tracker' && (activeTab === 'tracker' || activeTab === 'watchlist' || activeTab === 'portfolio' || activeTab === 'thesis' || activeTab === 'alerts')) ||
              (tab.id === 'macro' && (activeTab === 'macro' || activeTab === 'market' || activeTab === 'sector' || activeTab === 'observability'));

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
