import { ObservabilityMetrics, AlertRule, UserThesis } from '../../src/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  set<T>(key: string, data: T, ttlSeconds: number = 300) {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.data as T;
  }

  getMetrics() {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : Math.round((this.hits / total) * 1000) / 10;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      keysCount: this.store.size,
    };
  }

  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const cache = new InMemoryCache();

// In-Process Async Event Bus (Pub/Sub)
type EventCallback = (payload: any) => void;

class EventBus {
  private listeners = new Map<string, EventCallback[]>();
  private eventLog: Array<{ event: string; payload: any; timestamp: string }> = [];

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  publish(event: string, payload: any) {
    this.eventLog.unshift({
      event,
      payload,
      timestamp: new Date().toLocaleTimeString(),
    });
    if (this.eventLog.length > 50) this.eventLog.pop();

    const subs = this.listeners.get(event) || [];
    subs.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in subscriber for ${event}:`, err);
      }
    });
  }

  getRecentEvents() {
    return this.eventLog.slice(0, 15);
  }
}

export const eventBus = new EventBus();

// In-memory persistent alert rules
export const activeAlerts: AlertRule[] = [
  {
    id: 'alt-1',
    ticker: 'RELIANCE',
    type: 'PRICE_ABOVE',
    threshold: 3000,
    note: 'Alert when price breaks above psychological resistance ₹3000',
    createdAt: 'Yesterday',
    isTriggered: false,
  },
  {
    id: 'alt-2',
    ticker: 'NVDA',
    type: 'RSI_OVERBOUGHT',
    threshold: 75,
    note: 'Notify when 14-period RSI crosses 75 for profit booking',
    createdAt: '3 days ago',
    isTriggered: true,
    lastTriggeredAt: '2 hours ago',
  },
  {
    id: 'alt-3',
    ticker: 'TCS',
    type: 'SCORE_CHANGE',
    threshold: 80,
    note: 'Notify if overall score drops below 80',
    createdAt: '5 days ago',
    isTriggered: false,
  },
  {
    id: 'alt-4',
    ticker: 'TATAMOTORS',
    type: 'NEGATIVE_NEWS',
    note: 'Alert on major regulatory or European margin news',
    createdAt: '1 week ago',
    isTriggered: true,
    lastTriggeredAt: '5 hours ago',
  }
];

// In-memory personal theses
export const activeTheses: Record<string, UserThesis> = {
  RELIANCE: {
    id: 'ths-rel',
    ticker: 'RELIANCE',
    thesisText: 'Telecom 5G ARPU expansion and retail grocery network dominance will drive 15%+ EPS compounding over the next 18 months.',
    createdAt: '2 weeks ago',
    status: 'VALID',
    supportingPillars: [
      'Jio reported 18% ARPU growth following 5G monetization ramp-up',
      'Retail floor space expansion accelerating in tier-2/3 cities',
      'Debt-to-equity maintained prudently at 0.42x',
    ],
    warningFlags: [
      'Asian crude benchmark refining cracks have softened slightly',
    ],
  },
  NVDA: {
    id: 'ths-nvda',
    ticker: 'NVDA',
    thesisText: 'Cloud hyperscaler AI capex commitments will sustain 60%+ operating margins through the Blackwell chip generation.',
    createdAt: '1 month ago',
    status: 'VALID',
    supportingPillars: [
      'Blackwell enterprise shipments ramping ahead of schedule',
      'Gross margins sustained at 75.4%',
      'Net cash generation exceeding $50B annually',
    ],
    warningFlags: [
      'High client concentration among top 4 cloud providers',
    ],
  },
  TATAMOTORS: {
    id: 'ths-ttm',
    ticker: 'TATAMOTORS',
    thesisText: 'Commercial vehicle demerger and JLR debt-free milestone will lead to valuation re-rating.',
    createdAt: '1 month ago',
    status: 'WARNING',
    supportingPillars: [
      'CV demerger formally approved by shareholders',
      'Domestic passenger EV sales lead market share at 68%',
    ],
    warningFlags: [
      'European luxury order book has softened in the recent quarter',
    ],
  }
};

// System Observability metrics
// NOTE: Latency and throughput figures in this dashboard are illustrative demonstration metrics,
// whereas cache hit rates and event bus logs reflect live, authentic in-process state.
export function getObservabilityMetrics(): ObservabilityMetrics {
  const cacheMetrics = cache.getMetrics();
  const totalQueries = cacheMetrics.hits + cacheMetrics.misses;
  const tokensSaved = totalQueries > 0 ? Math.round((cacheMetrics.hits / totalQueries) * 900) / 10 : 0;
  return {
    p50LatencyMs: 14,
    p95LatencyMs: 42,
    p99LatencyMs: 88,
    cacheHitRatePercent: cacheMetrics.hitRate,
    queueDepth: 0,
    workerThroughputPerSec: 124,
    aiTokensSavedPercent: tokensSaved,
    activeSubscribers: 12,
    systemCoverage: 98.6,
  };
}
