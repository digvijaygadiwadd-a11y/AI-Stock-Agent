import { useState, useMemo } from 'react';

export type FinancialsSubTab = 'fundamentals' | 'valuation' | 'technicals' | 'peers';
export type AISubTab = 'scenarios' | 'news';
export type TrackerSubTab = 'watchlist' | 'portfolio' | 'thesis' | 'alerts';
export type MacroSubTab = 'market' | 'observability';

export function useTabNavigation(initialTab: string = 'dashboard') {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sub-tab states for cleaner navigation
  const [financialsSubTab, setFinancialsSubTab] = useState<FinancialsSubTab>('fundamentals');
  const [aiSubTab, setAiSubTab] = useState<AISubTab>('scenarios');
  const [trackerSubTab, setTrackerSubTab] = useState<TrackerSubTab>('watchlist');
  const [macroSubTab, setMacroSubTab] = useState<MacroSubTab>('market');

  // Harmonize direct sub-tab requests
  const category = useMemo(() => {
    if (activeTab === 'dashboard') return 'dashboard';
    if (['financials', 'fundamentals', 'valuation', 'technicals', 'sector'].includes(activeTab)) return 'financials';
    if (['ai-news', 'news', 'ai-research'].includes(activeTab)) return 'ai-news';
    if (['tracker', 'watchlist', 'portfolio', 'thesis', 'alerts'].includes(activeTab)) return 'tracker';
    if (['macro', 'market', 'observability'].includes(activeTab)) return 'macro';
    return 'dashboard';
  }, [activeTab]);

  return {
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
  };
}
