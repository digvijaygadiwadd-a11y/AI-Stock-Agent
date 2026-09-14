import React, { useState } from 'react';
import { ScoreWeights } from './types';
import { useStockData } from './hooks/useStockData';
import { useTabNavigation } from './hooks/useTabNavigation';
import { Header } from './components/Header';
import { StockHeader } from './components/StockHeader';
import { TheMostImportantScreen } from './components/TheMostImportantScreen';
import { InteractiveChart } from './components/InteractiveChart';
import { TechnicalView } from './components/TechnicalView';
import { FundamentalView } from './components/FundamentalView';
import { ValuationView } from './components/ValuationView';
import { NewsIntelligenceView } from './components/NewsIntelligenceView';
import { AIResearchAndVerificationView } from './components/AIResearchAndVerificationView';
import { PersonalThesisView } from './components/PersonalThesisView';
import { WatchlistIntelligenceView } from './components/WatchlistIntelligenceView';
import { PortfolioView } from './components/PortfolioView';
import { SectorIntelligenceView } from './components/SectorIntelligenceView';
import { AlertsView } from './components/AlertsView';
import { MarketOverviewView } from './components/MarketOverviewView';
import { ObservabilityView } from './components/ObservabilityView';
import { SettingsModal } from './components/SettingsModal';
import { AlertCircle, FileSpreadsheet, BarChart2, ShieldCheck, Newspaper, Sparkles, FolderLock, Globe } from 'lucide-react';

export default function App() {
  const {
    currentTicker,
    stockData,
    isLoading,
    isDeepAILoading,
    isWatchlisted,
    fetchError,
    loadStockData,
    handleTriggerDeepAI,
    handleToggleWatchlist,
    selectStock,
  } = useStockData('RELIANCE');

  const {
    activeTab,
    setActiveTab,
    category,
    financialsSubTab,
    setFinancialsSubTab,
    aiSubTab,
    setAiSubTab,
    trackerSubTab,
    setTrackerSubTab,
    macroSubTab,
    setMacroSubTab,
  } = useTabNavigation('dashboard');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [weights, setWeights] = useState<ScoreWeights>({
    fundamental: 30,
    technical: 25,
    valuation: 20,
    news: 15,
    risk: 10,
  });

  const handleSelectStock = (ticker: string) => {
    selectStock(ticker);
    setActiveTab('dashboard');
  };

  return (
    <div id="app-root" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Edge-to-Edge Full Width Header */}
      <Header
        currentTicker={currentTicker}
        onSelectStock={handleSelectStock}
        activeTab={category}
        setActiveTab={(tab) => setActiveTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isStreamingAI={isDeepAILoading}
      />

      {/* Edge-to-Edge Stock Details Subheader */}
      {stockData && (
        <StockHeader
          data={stockData}
          onTriggerDeepAI={handleTriggerDeepAI}
          onAddToWatchlist={handleToggleWatchlist}
          onOpenAlertModal={() => {
            setActiveTab('tracker');
            setTrackerSubTab('alerts');
          }}
          onOpenThesisModal={() => {
            setActiveTab('tracker');
            setTrackerSubTab('thesis');
          }}
          isWatchlisted={isWatchlisted}
          isDeepAILoading={isDeepAILoading}
        />
      )}

      {/* Main Container - 100% Full Width, No Constraining Side Margins */}
      <main className="flex-1 w-full px-3 md:px-5 py-4 space-y-5">
        {isLoading ? (
          <div id="loading-terminal-state" className="flex flex-col items-center justify-center py-24 space-y-4 font-mono">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-slate-300">
              Loading intelligence for <span className="text-emerald-400 font-bold">{currentTicker}</span>...
            </div>
            <div className="text-xs text-slate-500">
              Calculating deterministic scores, support/resistance levels, and multi-agent synthesis.
            </div>
          </div>
        ) : !stockData ? (
          <div className="text-center py-16 font-mono max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <div className="text-lg font-bold text-white">
              {fetchError || `Unable to load data for ${currentTicker}`}
            </div>
            <p className="text-xs text-slate-400 mt-2 mb-4">
              Try picking from one of the actively monitored market leaders below:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'NVDA', 'TSLA', 'AAPL', 'BEL', 'TATAMOTORS'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectStock(t)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold font-mono transition-colors border border-slate-700"
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => loadStockData(currentTicker)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono rounded-lg transition-all shadow-md active:scale-95"
            >
              Retry Loading {currentTicker}
            </button>
          </div>
        ) : (
          <div>
            {/* VIEW 1: 🎯 DECISION & CHART (The core user-friendly screen) */}
            {category === 'dashboard' && (
              <div className="space-y-5">
                {/* 1. Clear Human-Friendly Decision Summary */}
                <TheMostImportantScreen
                  data={stockData}
                  onViewScoreBreakdown={() => {
                    setActiveTab('financials');
                    setFinancialsSubTab('fundamentals');
                  }}
                />

                {/* 2. Full-Width Interactive Chart */}
                <InteractiveChart
                  candles={stockData.chartData}
                  setup={stockData.setup}
                  technicals={stockData.technicals}
                  currency={stockData.identification.currency}
                />

                {/* 3. Quick High-Impact Cards: Scenarios + Latest News */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <AIResearchAndVerificationView
                      findings={stockData.agentFindings}
                      decision={stockData.decision}
                      scenarios={stockData.scenarios}
                      whatChanged={stockData.whatChanged}
                      ticker={stockData.identification.ticker}
                      currency={stockData.identification.currency}
                    />
                  </div>
                  <div>
                    <NewsIntelligenceView
                      news={stockData.news}
                      newsScore={stockData.scores.newsScore}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: 📊 DEEP FINANCIALS (Simple sub-switcher) */}
            {category === 'financials' && (
              <div className="space-y-4">
                {/* Clean Sub-Navigator */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFinancialsSubTab('fundamentals')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      financialsSubTab === 'fundamentals'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    1. Fundamental Health & Growth
                  </button>
                  <button
                    onClick={() => setFinancialsSubTab('valuation')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      financialsSubTab === 'valuation'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    2. Valuation Multiples & DCF
                  </button>
                  <button
                    onClick={() => setFinancialsSubTab('technicals')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      financialsSubTab === 'technicals'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    3. Technical Indicators Matrix
                  </button>
                  <button
                    onClick={() => setFinancialsSubTab('peers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      financialsSubTab === 'peers'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    4. Sector & Peer Benchmark
                  </button>
                </div>

                {financialsSubTab === 'fundamentals' && (
                  <FundamentalView
                    fundamentals={stockData.fundamentals}
                    valuation={stockData.valuation}
                    fundamentalScore={stockData.scores.fundamentalScore}
                  />
                )}
                {financialsSubTab === 'valuation' && (
                  <ValuationView
                    valuation={stockData.valuation}
                    fundamentals={stockData.fundamentals}
                    currentPrice={stockData.quote.price}
                    valuationScore={stockData.scores.valuationScore}
                    currency={stockData.identification.currency}
                  />
                )}
                {financialsSubTab === 'technicals' && (
                  <div className="space-y-4">
                    <InteractiveChart
                      candles={stockData.chartData}
                      setup={stockData.setup}
                      technicals={stockData.technicals}
                      currency={stockData.identification.currency}
                    />
                    <TechnicalView
                      technicals={stockData.technicals}
                      setup={stockData.setup}
                      currentPrice={stockData.quote.price}
                      currency={stockData.identification.currency}
                    />
                  </div>
                )}
                {financialsSubTab === 'peers' && (
                  <SectorIntelligenceView
                    currentStock={stockData.identification}
                    peers={stockData.peers}
                    currentPE={stockData.valuation.pe}
                    currentPB={stockData.valuation.pb}
                    currentROE={stockData.fundamentals.profitability.roe}
                    currentNetMargin={stockData.fundamentals.profitability.netMargin}
                    currentRevGrowth={stockData.fundamentals.growth.revenueGrowthYoY}
                    currentDE={stockData.fundamentals.financialHealth.debtToEquity}
                    currentScore={stockData.scores.overallScore}
                    onSelectStock={handleSelectStock}
                  />
                )}
              </div>
            )}

            {/* VIEW 3: 🤖 AI SCENARIOS & NEWS */}
            {category === 'ai-news' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setAiSubTab('scenarios')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      aiSubTab === 'scenarios'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Multi-Agent Scenarios & Why NOT Buy
                  </button>
                  <button
                    onClick={() => setAiSubTab('news')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      aiSubTab === 'news'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Verified News & Impact Analysis
                  </button>
                </div>

                {aiSubTab === 'scenarios' && (
                  <AIResearchAndVerificationView
                    findings={stockData.agentFindings}
                    decision={stockData.decision}
                    scenarios={stockData.scenarios}
                    whatChanged={stockData.whatChanged}
                    ticker={stockData.identification.ticker}
                    currency={stockData.identification.currency}
                  />
                )}
                {aiSubTab === 'news' && (
                  <NewsIntelligenceView
                    news={stockData.news}
                    newsScore={stockData.scores.newsScore}
                  />
                )}
              </div>
            )}

            {/* VIEW 4: 💼 WATCHLIST & PORTFOLIO */}
            {category === 'tracker' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTrackerSubTab('watchlist')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trackerSubTab === 'watchlist'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Watchlist AI Surveillance
                  </button>
                  <button
                    onClick={() => setTrackerSubTab('portfolio')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trackerSubTab === 'portfolio'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Portfolio Holdings & P&L
                  </button>
                  <button
                    onClick={() => setTrackerSubTab('thesis')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trackerSubTab === 'thesis'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    My Investment Thesis
                  </button>
                  <button
                    onClick={() => setTrackerSubTab('alerts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trackerSubTab === 'alerts'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Active Price & Indicator Alerts
                  </button>
                </div>

                {trackerSubTab === 'watchlist' && (
                  <WatchlistIntelligenceView onSelectStock={handleSelectStock} />
                )}
                {trackerSubTab === 'portfolio' && (
                  <PortfolioView onSelectStock={handleSelectStock} />
                )}
                {trackerSubTab === 'thesis' && (
                  <PersonalThesisView ticker={stockData.identification.ticker} />
                )}
                {trackerSubTab === 'alerts' && (
                  <AlertsView currentTicker={stockData.identification.ticker} />
                )}
              </div>
            )}

            {/* VIEW 5: 🌐 MACRO & SECTOR */}
            {category === 'macro' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setMacroSubTab('market')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      macroSubTab === 'market'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Macro Market Indices & Rotation
                  </button>
                  <button
                    onClick={() => setMacroSubTab('observability')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      macroSubTab === 'observability'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    System Latency & Cache Observability
                  </button>
                </div>

                {macroSubTab === 'market' && (
                  <MarketOverviewView onSelectStock={handleSelectStock} />
                )}
                {macroSubTab === 'observability' && (
                  <ObservabilityView freshness={stockData.dataFreshness} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        weights={weights}
        onSaveWeights={(newWeights) => setWeights(newWeights)}
      />

      {/* Full Width Edge-to-Edge Footer */}
      <footer id="platform-footer" className="w-full border-t border-slate-800/90 bg-slate-950 py-3 text-xs font-mono text-slate-400">
        <div className="w-full px-3 md:px-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-slate-300">
            STOCK INTEL • SIMPLE, FAST & USER-FRIENDLY AI STOCK RESEARCH
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400">Live Formula Calculation</span>
            <span>•</span>
            <span className="text-slate-400">In-Memory Hot Cache Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
