import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { calculateTechnicals } from '../server/engines/technicalEngine';
import { calculateFundamentalScore } from '../server/engines/fundamentalEngine';
import { calculateValuationScore } from '../server/engines/valuationEngine';
import { calculateRiskProfile } from '../server/engines/riskEngine';
import { calculateDecisionEngine } from '../server/engines/decisionEngine';
import { cache } from '../server/data/cacheAndEventBus';
import { buildDeterministicFindings, reconcileWithDeterministic } from '../server/ai/agentOrchestrator';
import { HistoricalCandle, FundamentalMetrics, ValuationMetrics } from '../src/types';

describe('Deterministic Financial Engines & In-Memory Cache', () => {
  it('Technical Engine: Indicator Calculations & MACD 9-Period EMA Signal Line', () => {
    const testCandles: HistoricalCandle[] = [];
    const basePrice = 100;
    // Generate 60 days of synthetic trending candle data
    for (let i = 0; i < 60; i++) {
      const price = basePrice + i * 1.5;
      testCandles.push({
        date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
        open: price - 0.5,
        high: price + 1.2,
        low: price - 1.0,
        close: price,
        volume: 1000000 + i * 10000,
      });
    }

    const technicalResult = calculateTechnicals(testCandles, testCandles[testCandles.length - 1].close);
    const technicals = technicalResult.indicators;

    assert.ok(technicals.rsi >= 0 && technicals.rsi <= 100, `RSI should be between 0 and 100, got ${technicals.rsi}`);
    assert.ok(technicals.movingAverages.ema20 > 0, 'EMA20 should be greater than 0');
    assert.ok(technicals.movingAverages.ema50 > 0, 'EMA50 should be greater than 0');
    assert.ok(technicals.bollingerBands.upper >= technicals.bollingerBands.middle, 'Bollinger upper band >= middle');
    assert.ok(technicals.bollingerBands.middle >= technicals.bollingerBands.lower, 'Bollinger middle band >= lower');

    // Verify MACD calculations
    assert.equal(
      Math.round((technicals.macd.line - technicals.macd.signal) * 100) / 100,
      technicals.macd.histogram,
      'MACD histogram must equal line - signal'
    );
    assert.ok(
      Number.isFinite(technicals.macd.signal),
      'MACD signal line must be a finite number computed from 9-period EMA'
    );
  });

  it('Fundamental Engine: Scoring & Quality Metrics', () => {
    const strongFundamentals: FundamentalMetrics = {
      growth: {
        revenueGrowthYoY: 28.5,
        profitGrowthYoY: 34.0,
        epsGrowthYoY: 30.2,
        ebitdaGrowthYoY: 29.0,
        fcfGrowthYoY: 32.5,
        growthConsistencyScore: 90,
      },
      profitability: {
        roe: 26.5,
        roce: 28.0,
        roa: 16.0,
        operatingMargin: 32.0,
        netMargin: 25.5,
        grossMargin: 55.0,
      },
      financialHealth: {
        debtToEquity: 0.1,
        interestCoverage: 25.0,
        currentRatio: 2.5,
        quickRatio: 2.1,
        freeCashFlow: 12500,
        operatingCashFlow: 16000,
      },
      ownership: {
        promoterHolding: 52.0,
        promoterPledge: 0.0,
        fiiHolding: 24.0,
        diiHolding: 14.0,
        institutionalHolding: 38.0,
        publicHolding: 10.0,
      },
      quality: {
        earningsQuality: 'High',
        cashConversionRatio: 1.05,
        piotroskiFScore: 8,
        altmanZScore: 5.2,
        auditFlag: 'Clean',
      },
    };

    const sampleValuation: ValuationMetrics = {
      pe: 25.0,
      peHistorical5YrAvg: 28.0,
      peSectorAvg: 30.0,
      pb: 6.0,
      pbHistorical5YrAvg: 5.8,
      priceToSales: 4.5,
      evToEbitda: 18.0,
      evToEbitdaSectorAvg: 19.5,
      pegRatio: 0.9,
      dividendYield: 1.5,
      intrinsicValueDCF: 120.0,
      grahamNumber: 95.0,
      valuationStance: 'Fairly Valued',
    };

    const result = calculateFundamentalScore(strongFundamentals, sampleValuation);
    assert.ok(result.score >= 70, `High quality company score should be >= 70, got ${result.score}`);
    assert.ok(result.breakdown.financialHealth >= 15, 'Health score should be high for pristine balance sheet');
  });

  it('Valuation Engine: Stance & Discount-to-DCF Calculation', () => {
    const cheapValuation: ValuationMetrics = {
      pe: 14.0,
      peHistorical5YrAvg: 24.0,
      peSectorAvg: 22.0,
      pb: 2.1,
      pbHistorical5YrAvg: 3.0,
      priceToSales: 1.8,
      evToEbitda: 9.5,
      evToEbitdaSectorAvg: 14.0,
      pegRatio: 0.7,
      dividendYield: 2.8,
      intrinsicValueDCF: 220.0,
      grahamNumber: 180.0,
      valuationStance: 'Undervalued',
    };

    const sampleFundamentals: FundamentalMetrics = {
      growth: {
        revenueGrowthYoY: 15.0,
        profitGrowthYoY: 18.0,
        epsGrowthYoY: 16.0,
        ebitdaGrowthYoY: 15.5,
        fcfGrowthYoY: 17.0,
        growthConsistencyScore: 80,
      },
      profitability: {
        roe: 20.0,
        roce: 22.0,
        roa: 12.0,
        operatingMargin: 20.0,
        netMargin: 15.0,
        grossMargin: 40.0,
      },
      financialHealth: {
        debtToEquity: 0.3,
        interestCoverage: 12.0,
        currentRatio: 1.8,
        quickRatio: 1.5,
        freeCashFlow: 8000,
        operatingCashFlow: 10500,
      },
      ownership: {
        promoterHolding: 50.0,
        promoterPledge: 0.0,
        fiiHolding: 22.0,
        diiHolding: 13.0,
        institutionalHolding: 35.0,
        publicHolding: 15.0,
      },
      quality: {
        earningsQuality: 'High',
        cashConversionRatio: 0.98,
        piotroskiFScore: 7,
        altmanZScore: 4.1,
        auditFlag: 'Clean',
      },
    };

    const valResult = calculateValuationScore(cheapValuation, sampleFundamentals);
    assert.ok(valResult.score >= 60, `Undervalued stock score should be >= 60, got ${valResult.score}`);
    assert.equal(valResult.stance, 'Undervalued');
  });

  it('Risk Engine: Debt & Volatility Risk Detection', () => {
    const highDebtFundamentals: FundamentalMetrics = {
      growth: {
        revenueGrowthYoY: 2.0,
        profitGrowthYoY: -4.0,
        epsGrowthYoY: -6.0,
        ebitdaGrowthYoY: -1.0,
        fcfGrowthYoY: -10.0,
        growthConsistencyScore: 40,
      },
      profitability: {
        roe: 4.0,
        roce: 5.0,
        roa: 2.0,
        operatingMargin: 6.0,
        netMargin: 2.5,
        grossMargin: 22.0,
      },
      financialHealth: {
        debtToEquity: 2.4,
        interestCoverage: 1.4,
        currentRatio: 0.9,
        quickRatio: 0.6,
        freeCashFlow: -1500,
        operatingCashFlow: 500,
      },
      ownership: {
        promoterHolding: 30.0,
        promoterPledge: 25.0,
        fiiHolding: 8.0,
        diiHolding: 7.0,
        institutionalHolding: 15.0,
        publicHolding: 55.0,
      },
      quality: {
        earningsQuality: 'Low',
        cashConversionRatio: 0.4,
        piotroskiFScore: 3,
        altmanZScore: 1.2,
        auditFlag: 'Minor Qualified',
      },
    };

    const sampleValuation: ValuationMetrics = {
      pe: 45.0,
      peHistorical5YrAvg: 20.0,
      peSectorAvg: 18.0,
      pb: 3.5,
      pbHistorical5YrAvg: 2.2,
      priceToSales: 2.0,
      evToEbitda: 22.0,
      evToEbitdaSectorAvg: 15.0,
      pegRatio: 3.2,
      dividendYield: 0.0,
      intrinsicValueDCF: 40.0,
      grahamNumber: 35.0,
      valuationStance: 'Significantly Overvalued',
    };

    const mockTechnicals = {
      rsi: 78,
      atr: 5.5,
      volatilityAnnualized: 38.5,
      supportLevels: [97, 88],
    } as any;

    const riskResult = calculateRiskProfile(highDebtFundamentals, sampleValuation, mockTechnicals, 100);
    assert.equal(riskResult.debtRisk, 'High', 'Should flag High debt risk');
    assert.equal(riskResult.valuationRisk, 'High', 'Should flag High valuation risk');
    assert.ok(riskResult.majorRisks.length >= 2, 'Should enumerate major detected risks');
  });

  it('Decision Engine: Synthesis & Target Pricing', () => {
    const mockFun = {
      growth: { revenueGrowthYoY: 20, profitGrowthYoY: 22, epsGrowthYoY: 21, ebitdaGrowthYoY: 20, fcfGrowthYoY: 25, growthConsistencyScore: 85 },
      profitability: { roe: 22, roce: 24, operatingMargin: 25, netMargin: 20, grossMargin: 50, fcfYield: 3.5 },
      financialHealth: { debtToEquity: 0.2, interestCoverage: 18, currentRatio: 2.2, freeCashFlow: 8000, altmanZScore: 4.8, piotroskiScore: 8, debtTrend: 'Decreasing' as const },
      quality: { earningsQuality: 'High Quality', promoterHolding: 52, pledgedShares: 0, institutionalHolding: 35, accountingFlags: [] },
      ownership: { promoterHolding: 52, promoterPledge: 0, fiiHolding: 25, diiHolding: 15, publicHolding: 8 },
    };
    const mockTech = {
      rsi: 58,
      rsiSignal: 'Neutral',
      atr: 2.5,
      movingAverages: { ema20: 98, ema50: 95, ema100: 90, ema200: 85, sma20: 97, sma50: 94, sma200: 84, trendBias: 'Strong Uptrend' as const },
      supportLevels: [95, 90],
      resistanceLevels: [110, 120],
      bollingerBands: { upper: 106, middle: 97, lower: 88, bandwidth: 18.5 },
    } as any;
    const mockVal = {
      pe: 22,
      peHistorical5YrAvg: 25,
      peSectorAvg: 26,
      pegRatio: 1.1,
      intrinsicValueDCF: 125,
    } as any;
    const mockRisk = {
      overallRisk: 'LOW' as const,
      majorRisks: ['Macroeconomic interest rate sensitivity'],
    } as any;

    const decisionOutput = calculateDecisionEngine({
      ticker: 'TEST_STOCK',
      currentPrice: 100,
      scores: {
        fundamental: 82,
        technical: 75,
        valuation: 78,
        news: 65,
        risk: 80,
      },
      fundamentals: mockFun as any,
      technicals: mockTech,
      valuation: mockVal,
      news: [],
      risk: mockRisk,
    });

    assert.ok(decisionOutput.decision.confidenceScore >= 70, 'Confidence score should be >= 70 for strong composite scores');
    assert.ok(decisionOutput.decision.overallView.includes('POSITIVE'), 'Overall view should be POSITIVE');
    assert.ok(decisionOutput.scenarios.bull.targetPrice > decisionOutput.scenarios.base.targetPrice, 'Bull target > Base target');
    assert.ok(decisionOutput.scenarios.base.targetPrice > decisionOutput.scenarios.bear.targetPrice, 'Base target > Bear target');
  });

  it('In-Memory Cache: TTL & Accurate Non-Rigged Hit Rates', () => {
    cache.clear();
    let metrics = cache.getMetrics();
    assert.equal(metrics.hitRate, 0, 'Initial hit rate on empty cache must be 0%');
    assert.equal(metrics.hits, 0, 'Initial hits must be 0');
    assert.equal(metrics.misses, 0, 'Initial misses must be 0');

    // Test miss
    const missResult = cache.get('non_existent_key');
    assert.equal(missResult, null);
    metrics = cache.getMetrics();
    assert.equal(metrics.misses, 1);
    assert.equal(metrics.hitRate, 0);

    // Test set and hit
    cache.set('sample_ticker', { name: 'Acme Corp' }, 10);
    const hitResult = cache.get('sample_ticker');
    assert.deepEqual(hitResult, { name: 'Acme Corp' });
    metrics = cache.getMetrics();
    assert.equal(metrics.hits, 1);
    assert.equal(metrics.misses, 1);
    assert.equal(metrics.hitRate, 50, '1 hit out of 2 total requests = 50.0% hit rate');
  });
});

describe('AI orchestrator: deterministic findings and verification precedence', () => {
  // Minimal bearish data fixture: only the fields the deterministic builder reads.
  const bearishData: any = {
    scores: { fundamentalScore: 30, technicalScore: 25, newsScore: 20 },
    fundamentals: {
      growth: { revenueGrowthYoY: -4 },
      profitability: { roe: 6 },
      financialHealth: { debtToEquity: 2.4 },
      quality: { piotroskiFScore: 3 },
    },
    technicals: {
      movingAverages: { trendBias: 'Bearish' },
      rsi: 31,
      rsiSignal: 'Oversold',
      macd: { histogram: -1.2 },
    },
    news: [],
    valuation: { valuationStance: 'Overvalued', pe: 40, peHistorical5YrAvg: 22, pegRatio: 3, intrinsicValueDCF: 100 },
    risk: { overallRisk: 'HIGH', majorRisks: ['Leverage', 'Margin pressure'], volatilityBeta: 1.6 },
    decision: { verificationStatus: 'DIVERGENT', conflictsDetected: ['Weak fundamentals vs. stretched valuation.'] },
  };

  it('Deterministic findings follow the computed scores (no hardcoded Bullish)', () => {
    const f = buildDeterministicFindings(bearishData);
    assert.equal(f.fundamentalAgent.stance, 'Bearish');
    assert.equal(f.technicalAgent.stance, 'Bearish');
    assert.equal(f.valuationAgent.stance, 'Expensive');
    assert.equal(f.riskAgent.stance, 'Elevated Risk');
    assert.equal(f.verificationAgent.status, 'DIVERGENT');
  });

  it('Rule-based verification status overrides a contradicting Gemini status', () => {
    const det = buildDeterministicFindings(bearishData);
    const merged = reconcileWithDeterministic(
      { verificationAgent: { status: 'VERIFIED_CONCORDANT', notes: 'All good.' } },
      det,
    );
    assert.equal(merged.verificationAgent.status, 'DIVERGENT');
    assert.match(merged.verificationAgent.notes, /rule-based verification takes precedence/);
  });

  it('Missing or invalid Gemini agents fall back to deterministic values, not invented opinions', () => {
    const det = buildDeterministicFindings(bearishData);
    const merged = reconcileWithDeterministic(
      { fundamentalAgent: { stance: 'Moonshot', summary: 'x' }, technicalAgent: undefined },
      det,
    );
    assert.equal(merged.fundamentalAgent.stance, 'Bearish');
    assert.equal(merged.technicalAgent.stance, 'Bearish');
    assert.equal(merged.riskAgent.stance, 'Elevated Risk');
  });
});

