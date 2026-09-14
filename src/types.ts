export type MarketBias = 'STRONG POSITIVE' | 'POSITIVE' | 'WATCH' | 'NEUTRAL' | 'CAUTION' | 'NEGATIVE' | 'STRONG NEGATIVE';
export type TechnicalBias = 'BUY ZONE' | 'WAIT' | 'SELL/REDUCE' | 'AVOID';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';
export type ImpactLevel = 'Low' | 'Medium' | 'High';

export interface StockIdentification {
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  market: string;
  currency: string;
  sector: string;
  industry: string;
  isin?: string;
  marketCap: number; // in billions
}

export interface LiveMarketQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  week52High: number;
  week52Low: number;
  vwap: number;
  lastUpdated: string;
  dataSource: string;
  freshnessStatus: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
}

export interface HistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'Oversold' | 'Neutral' | 'Overbought';
  macd: {
    line: number;
    signal: number;
    histogram: number;
    trend: 'Bullish' | 'Bearish' | 'Neutral';
  };
  movingAverages: {
    ema20: number;
    ema50: number;
    ema100: number;
    ema200: number;
    sma20: number;
    sma50: number;
    sma200: number;
    trendBias: 'Strong Uptrend' | 'Uptrend' | 'Consolidation' | 'Downtrend';
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    position: 'Near Upper Band' | 'Middle Range' | 'Near Lower Band';
  };
  atr: number;
  adx: number;
  adxStrength: 'Strong Trend' | 'Moderate Trend' | 'Weak / Ranging';
  stochastic: {
    k: number;
    d: number;
    state: 'Oversold' | 'Neutral' | 'Overbought';
  };
  obv: number;
  volumeInterpretation: 'Accumulation' | 'Normal' | 'Distribution';
  supportLevels: number[];
  resistanceLevels: number[];
  candlestickPattern: string;
  structureInterpretation: string;
}

export interface FundamentalMetrics {
  growth: {
    revenueGrowthYoY: number; // %
    profitGrowthYoY: number;
    epsGrowthYoY: number;
    ebitdaGrowthYoY: number;
    fcfGrowthYoY: number;
    growthConsistencyScore: number; // 0-100
  };
  profitability: {
    roe: number;
    roce: number;
    roa: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  financialHealth: {
    debtToEquity: number;
    interestCoverage: number;
    currentRatio: number;
    quickRatio: number;
    freeCashFlow: number; // in Cr or Millions
    operatingCashFlow: number;
  };
  ownership: {
    promoterHolding: number;
    fiiHolding: number;
    diiHolding: number;
    institutionalHolding: number;
    publicHolding: number;
    promoterPledge: number;
  };
  quality: {
    earningsQuality: 'High' | 'Medium' | 'Low';
    cashConversionRatio: number;
    piotroskiFScore: number; // 0-9
    altmanZScore: number;
    auditFlag: 'Clean' | 'Minor Qualified' | 'Adverse';
  };
}

export interface ValuationMetrics {
  pe: number;
  peHistorical5YrAvg: number;
  peSectorAvg: number;
  pb: number;
  pbHistorical5YrAvg: number;
  evToEbitda: number;
  evToEbitdaSectorAvg: number;
  pegRatio: number;
  priceToSales: number;
  dividendYield: number;
  intrinsicValueDCF: number;
  grahamNumber: number;
  valuationStance: 'Undervalued' | 'Fairly Valued' | 'Slightly Expensive' | 'Significantly Overvalued';
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  url?: string;
  sentiment: Sentiment;
  impact: ImpactLevel;
  affectedArea: 'Revenue' | 'Profitability' | 'Debt' | 'Growth' | 'Regulation' | 'Valuation' | 'Governance' | 'Macro';
  whyItMatters: string;
  isVerified: boolean;
}

export interface RiskMetrics {
  overallRisk: RiskLevel;
  marketRisk: number; // 0-100
  volatilityBeta: number;
  debtRisk: 'Low' | 'Medium' | 'High';
  valuationRisk: 'Low' | 'Medium' | 'High';
  regulatoryRisk: 'Low' | 'Medium' | 'High';
  liquidityRisk: 'Low' | 'Medium' | 'High';
  majorRisks: string[];
  downsideScenarioPercentage: number;
}

export interface DeterministicScores {
  fundamentalScore: number; // 0-100
  fundamentalBreakdown: {
    growth: number; // max 20
    profitability: number; // max 20
    financialHealth: number; // max 20
    valuation: number; // max 20
    quality: number; // max 20
  };
  technicalScore: number; // 0-100
  technicalBreakdown: {
    trend: number; // max 20
    momentum: number; // max 20
    volume: number; // max 20
    structure: number; // max 20
    risk: number; // max 20
  };
  valuationScore: number; // 0-100
  newsScore: number; // 0-100
  riskScore: number; // 0-100 (higher = safer, or invertedly displayed)
  overallScore: number; // 0-100
  weightsUsed: {
    fundamental: number;
    technical: number;
    valuation: number;
    news: number;
    risk: number;
  };
}

export interface TechnicalSetup {
  entryZone: [number, number];
  support: number;
  resistance: number;
  invalidationLevel: number;
  target1: number;
  target2: number;
  riskRewardRatio: string;
}

export interface Scenarios {
  bullCase: {
    target: number;
    upsidePercent: number;
    probability: number;
    whatNeedsToHappen: string[];
  };
  baseCase: {
    target: number;
    upsidePercent: number;
    probability: number;
    mostReasonableScenario: string;
  };
  bearCase: {
    target: number;
    downsidePercent: number;
    probability: number;
    whatCouldGoWrong: string[];
  };
  bull?: {
    targetPrice?: number;
    potentialUpsidePercent?: number;
    probability?: number;
    catalyst?: string;
    conditions?: string;
  };
  base?: {
    targetPrice?: number;
    potentialUpsidePercent?: number;
    probability?: number;
    catalyst?: string;
    conditions?: string;
  };
  bear?: {
    targetPrice?: number;
    potentialDownsidePercent?: number;
    probability?: number;
    catalyst?: string;
    conditions?: string;
  };
}

export interface WhatChangedSincePrevious {
  previousAnalysisDate: string;
  previousOverallScore: number;
  scoreChange: number;
  keyChanges: Array<{
    type: 'positive' | 'negative' | 'neutral';
    metric: string;
    description: string;
  }>;
}

export interface DecisionEngineOutput {
  overallView: MarketBias;
  technicalBias: TechnicalBias;
  confidenceScore: number; // 0-100
  whyBuy: string[];
  whyNotBuy: string[];
  whatCouldGoWrong: string[];
  whatWouldChangeView: string[];
  conflictsDetected: string[];
  verificationStatus: 'VERIFIED_CONCORDANT' | 'MIXED_SIGNALS' | 'DIVERGENT';
  summaryThesis: string;
}

export interface AgentFindings {
  fundamentalAgent: { stance: 'Bullish' | 'Neutral' | 'Bearish'; summary: string };
  technicalAgent: { stance: 'Bullish' | 'Neutral' | 'Bearish'; summary: string };
  newsAgent: { stance: 'Bullish' | 'Neutral' | 'Bearish'; summary: string };
  valuationAgent: { stance: 'Attractive' | 'Fair' | 'Expensive'; summary: string };
  riskAgent: { stance: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk'; summary: string };
  verificationAgent: { status: string; notes: string };
}

export interface StockIntelligenceData {
  identification: StockIdentification;
  quote: LiveMarketQuote;
  chartData: HistoricalCandle[];
  technicals: TechnicalIndicators;
  fundamentals: FundamentalMetrics;
  valuation: ValuationMetrics;
  news: NewsItem[];
  risk: RiskMetrics;
  scores: DeterministicScores;
  setup: TechnicalSetup;
  decision: DecisionEngineOutput;
  scenarios: Scenarios;
  whatChanged: WhatChangedSincePrevious;
  agentFindings: AgentFindings;
  peers: PeerComparison[];
  dataFreshness: {
    marketData: { status: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT'; provider: string; updatedAt: string };
    fundamentals: { status: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT'; provider: string; updatedAt: string };
    technicals: { status: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT'; provider: string; updatedAt: string };
    news: { status: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT'; provider: string; updatedAt: string };
    ai: { status: 'SIMULATED' | 'SYNTHETIC' | 'LIVE' | 'RECENT'; provider: string; updatedAt: string };
    coveragePercent: number;
  };
}

export interface PeerComparison {
  ticker: string;
  name: string;
  pe: number;
  pb: number;
  roe: number;
  netMargin: number;
  revenueGrowth: number;
  debtToEquity: number;
  overallScore: number;
  isLeader: boolean;
}

export interface UserThesis {
  id: string;
  ticker: string;
  thesisText: string;
  createdAt: string;
  status: 'VALID' | 'WARNING' | 'INVALIDATED';
  supportingPillars: string[];
  warningFlags: string[];
}

export interface AlertRule {
  id: string;
  ticker: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RSI_OVERBOUGHT' | 'RSI_OVERSOLD' | 'SCORE_CHANGE' | 'THESIS_VIOLATION' | 'NEGATIVE_NEWS';
  threshold?: number;
  note: string;
  createdAt: string;
  isTriggered: boolean;
  lastTriggeredAt?: string;
}

export interface PortfolioPosition {
  ticker: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  allocationPercent: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  aiStatus: MarketBias;
  riskFlag?: string;
}

export interface ScoreWeights {
  fundamental: number;
  technical: number;
  valuation: number;
  news: number;
  risk: number;
}

export type WhatChangedAnalysis = WhatChangedSincePrevious | {
  previousAnalysisDate: string;
  previousOverallScore?: number;
  priceChangeSince?: string;
  scoreChangeSince?: string;
  keyChanges: any[];
};

export type DataFreshness = StockIntelligenceData['dataFreshness'];

export type PortfolioHolding = PortfolioPosition;

export interface ObservabilityMetrics {
  // Latency and throughput figures in the dashboard are illustrative placeholders; cache hits and events are live in-process telemetry
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cacheHitRatePercent: number;
  queueDepth: number;
  workerThroughputPerSec: number;
  aiTokensSavedPercent: number;
  activeSubscribers: number;
  systemCoverage: number;
}
