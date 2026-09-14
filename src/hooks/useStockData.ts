import { useState, useEffect, useCallback } from 'react';
import { StockIntelligenceData } from '../types';

export function useStockData(initialTicker: string = 'RELIANCE') {
  const [currentTicker, setCurrentTicker] = useState<string>(initialTicker);
  const [stockData, setStockData] = useState<StockIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeepAILoading, setIsDeepAILoading] = useState<boolean>(false);
  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadStockData = useCallback(async (ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) return;

    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(cleanTicker)}`);
      if (res.ok) {
        const data = await res.json();
        setStockData(data);
        setFetchError(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to load stock data:', errData);
        setFetchError(errData.error || `Could not load intelligence for ${cleanTicker}`);
      }
    } catch (err: any) {
      console.error('Error fetching stock:', err);
      setFetchError(err.message || `Network error fetching ${cleanTicker}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockData(currentTicker);
  }, [currentTicker, loadStockData]);

  const handleTriggerDeepAI = useCallback(async () => {
    if (!stockData) return;
    setIsDeepAILoading(true);
    try {
      const res = await fetch(`/api/stocks/${currentTicker}/deep-analysis`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setStockData(updated);
      }
    } catch (err) {
      console.error('Deep AI error:', err);
    } finally {
      setIsDeepAILoading(false);
    }
  }, [stockData, currentTicker]);

  const handleToggleWatchlist = useCallback(async () => {
    try {
      if (isWatchlisted) {
        await fetch(`/api/watchlist/${currentTicker}`, { method: 'DELETE' });
        setIsWatchlisted(false);
      } else {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: currentTicker }),
        });
        setIsWatchlisted(true);
      }
    } catch (e) {
      console.error('Watchlist toggle error:', e);
    }
  }, [isWatchlisted, currentTicker]);

  const selectStock = useCallback((ticker: string) => {
    const clean = ticker.trim().toUpperCase();
    if (!clean) return;
    setCurrentTicker(clean);
  }, []);

  return {
    currentTicker,
    setCurrentTicker,
    stockData,
    setStockData,
    isLoading,
    isDeepAILoading,
    isWatchlisted,
    fetchError,
    loadStockData,
    handleTriggerDeepAI,
    handleToggleWatchlist,
    selectStock,
  };
}
