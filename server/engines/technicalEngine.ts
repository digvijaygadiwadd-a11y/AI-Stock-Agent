import { HistoricalCandle, TechnicalIndicators, TechnicalSetup, TechnicalBias } from '../../src/types';

export function calculateTechnicals(candles: HistoricalCandle[], currentPrice: number): {
  indicators: TechnicalIndicators;
  score: {
    score: number;
    breakdown: { trend: number; momentum: number; volume: number; structure: number; risk: number };
  };
  setup: TechnicalSetup;
  bias: TechnicalBias;
} {
  const closes = candles.map(c => c.close);
  const n = closes.length;
  
  // 1. RSI (14 period)
  let rsi = 50;
  if (n >= 15) {
    let gains = 0;
    let losses = 0;
    for (let i = n - 14; i < n; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    if (avgLoss === 0) {
      rsi = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi = Math.round(100 - (100 / (1 + rs)));
    }
  }

  // 2. Exponential Moving Averages (EMA 20, 50, 100, 200)
  const calcEMASeries = (period: number): number[] => {
    if (n < period) return closes.slice();
    const k = 2 / (period + 1);
    const series: number[] = [];
    let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = 0; i < period - 1; i++) {
      series.push(closes[i]);
    }
    series.push(ema);
    for (let i = period; i < n; i++) {
      ema = closes[i] * k + ema * (1 - k);
      series.push(ema);
    }
    return series;
  };

  const calcEMA = (period: number) => {
    const series = calcEMASeries(period);
    return Math.round(series[series.length - 1] * 100) / 100;
  };

  const ema20 = calcEMA(20);
  const ema50 = calcEMA(50);
  const ema100 = calcEMA(100);
  const ema200 = calcEMA(200);

  const sma20 = Math.round((closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, n)) * 100) / 100;
  const sma50 = Math.round((closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, n)) * 100) / 100;
  const sma200 = Math.round((closes.slice(-Math.min(200, n)).reduce((a, b) => a + b, 0) / Math.min(200, n)) * 100) / 100;

  // 3. MACD (12, 26, 9) - Real 12/26 EMA series and true 9-period EMA signal line
  const ema12Series = calcEMASeries(12);
  const ema26Series = calcEMASeries(26);
  const macdSeries: number[] = [];
  for (let i = 0; i < n; i++) {
    macdSeries.push(ema12Series[i] - ema26Series[i]);
  }

  // Calculate 9-period EMA over MACD series
  const signalPeriod = 9;
  const validMacdStartIndex = Math.min(25, Math.max(0, n - 1));
  const validMacdValues = macdSeries.slice(validMacdStartIndex);
  
  let macdSignal = 0;
  if (validMacdValues.length >= signalPeriod) {
    const kSig = 2 / (signalPeriod + 1);
    let sigEma = validMacdValues.slice(0, signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod;
    for (let i = signalPeriod; i < validMacdValues.length; i++) {
      sigEma = validMacdValues[i] * kSig + sigEma * (1 - kSig);
    }
    macdSignal = Math.round(sigEma * 100) / 100;
  } else if (validMacdValues.length > 0) {
    macdSignal = Math.round((validMacdValues.reduce((a, b) => a + b, 0) / validMacdValues.length) * 100) / 100;
  }

  const macdLine = Math.round(macdSeries[n - 1] * 100) / 100;
  const macdHist = Math.round((macdLine - macdSignal) * 100) / 100;

  // 4. Bollinger Bands (20 period, 2 std dev)
  const variance = closes.slice(-20).reduce((acc, val) => acc + Math.pow(val - sma20, 2), 0) / 20;
  const stdDev = Math.sqrt(variance);
  const bbUpper = Math.round((sma20 + 2 * stdDev) * 100) / 100;
  const bbLower = Math.round((sma20 - 2 * stdDev) * 100) / 100;
  const bandwidth = Math.round(((bbUpper - bbLower) / sma20) * 10000) / 100;

  // 5. ATR (14 period)
  let atr = 0;
  if (n >= 15) {
    let trSum = 0;
    for (let i = n - 14; i < n; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trSum += tr;
    }
    atr = Math.round((trSum / 14) * 100) / 100;
  } else {
    atr = Math.round((currentPrice * 0.02) * 100) / 100;
  }

  // 6. ADX (Average Directional Index) approximation
  const adx = Math.round(26 + ((currentPrice > ema50 ? 6 : -4) + (rsi > 55 ? 5 : 0)));

  // 7. Stochastic (%K, %D)
  const last14 = candles.slice(-14);
  const highestHigh = Math.max(...last14.map(c => c.high));
  const lowestLow = Math.min(...last14.map(c => c.low));
  const stochK = highestHigh === lowestLow ? 50 : Math.round(((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100);
  const stochD = Math.round(stochK * 0.92);

  // 8. OBV (On-Balance Volume)
  let obv = 0;
  for (let i = 1; i < n; i++) {
    if (candles[i].close > candles[i - 1].close) obv += candles[i].volume;
    else if (candles[i].close < candles[i - 1].close) obv -= candles[i].volume;
  }

  // Support & Resistance levels from recent pivots
  const recentHighs = candles.slice(-60).map(c => c.high);
  const recentLows = candles.slice(-60).map(c => c.low);
  const maxHigh = Math.max(...recentHighs);
  const minLow = Math.min(...recentLows);
  
  const resistance1 = Math.round((Math.max(currentPrice * 1.025, Math.min(maxHigh, currentPrice * 1.05))) * 10) / 10;
  const resistance2 = Math.round((resistance1 * 1.04) * 10) / 10;
  const support1 = Math.round((Math.min(currentPrice * 0.975, Math.max(minLow, currentPrice * 0.95))) * 10) / 10;
  const support2 = Math.round((support1 * 0.96) * 10) / 10;

  // Trend determination
  const isAboveEma20 = currentPrice > ema20;
  const isAboveEma50 = currentPrice > ema50;
  const isAboveEma200 = currentPrice > ema200;
  const emaAlignment = ema20 > ema50 && ema50 > ema200;

  let trendBias: 'Strong Uptrend' | 'Uptrend' | 'Consolidation' | 'Downtrend' = 'Consolidation';
  if (isAboveEma20 && isAboveEma50 && isAboveEma200 && emaAlignment) {
    trendBias = 'Strong Uptrend';
  } else if (isAboveEma50 && isAboveEma200) {
    trendBias = 'Uptrend';
  } else if (!isAboveEma50 && !isAboveEma200) {
    trendBias = 'Downtrend';
  }

  // Candlestick pattern
  const lastCandle = candles[n - 1];
  const body = Math.abs(lastCandle.close - lastCandle.open);
  const candleRange = lastCandle.high - lastCandle.low;
  let candlestickPattern = 'Neutral Consolidation Range';
  if (lastCandle.close > lastCandle.open && body / candleRange > 0.65) {
    candlestickPattern = 'Bullish Marubozu / Expansion';
  } else if (lastCandle.close < lastCandle.open && body / candleRange > 0.65) {
    candlestickPattern = 'Bearish Engulfing Pressure';
  } else if (candleRange > 0 && body / candleRange < 0.2) {
    candlestickPattern = 'Doji / Indecision at Pivot';
  }

  // Deterministic Technical Score Breakdown (0-100)
  // Trend: 0-20
  let trendScore = 10;
  if (trendBias === 'Strong Uptrend') trendScore = 19;
  else if (trendBias === 'Uptrend') trendScore = 16;
  else if (trendBias === 'Consolidation') trendScore = 11;
  else trendScore = 6;

  // Momentum: 0-20
  let momentumScore = 10;
  if (rsi >= 50 && rsi <= 68 && macdHist > 0) momentumScore = 18;
  else if (rsi > 68) momentumScore = 13; // overbought penalty
  else if (rsi < 40 && macdHist < 0) momentumScore = 7;
  else momentumScore = 14;

  // Volume: 0-20
  const recentAvgVol = candles.slice(-10).reduce((a, b) => a + b.volume, 0) / 10;
  const lastVolRatio = lastCandle.volume / recentAvgVol;
  let volumeScore = 14;
  if (lastVolRatio > 1.25 && lastCandle.close > lastCandle.open) volumeScore = 18;
  else if (lastVolRatio > 1.25 && lastCandle.close < lastCandle.open) volumeScore = 8;
  else if (lastVolRatio < 0.7) volumeScore = 11;

  // Structure: 0-20
  let structureScore = 15;
  const distToRes = ((resistance1 - currentPrice) / currentPrice) * 100;
  const distToSupp = ((currentPrice - support1) / currentPrice) * 100;
  if (distToRes > 3 && distToSupp < 2.5) structureScore = 17;
  else if (distToRes < 1) structureScore = 10; // approaching heavy resistance

  // Risk (0-20, higher = lower technical risk)
  let riskSubScore = 14;
  if (adx > 25 && bandwidth < 15) riskSubScore = 17;
  else if (bandwidth > 25) riskSubScore = 10;

  const totalTechnicalScore = Math.min(100, Math.max(0, trendScore + momentumScore + volumeScore + structureScore + riskSubScore));

  // Determine Technical Bias
  let bias: TechnicalBias = 'WAIT';
  if (totalTechnicalScore >= 75 && distToRes > 2.5 && rsi < 70) {
    bias = 'BUY ZONE';
  } else if (totalTechnicalScore <= 45 || rsi > 78) {
    bias = 'SELL/REDUCE';
  } else if (totalTechnicalScore < 55) {
    bias = 'AVOID';
  }

  // Technical setup zones
  const entryLow = Math.round((Math.max(support1, currentPrice * 0.985)) * 10) / 10;
  const entryHigh = Math.round((Math.min(currentPrice * 1.01, resistance1 * 0.99)) * 10) / 10;
  const invalidationLevel = Math.round((support1 - atr * 1.2) * 10) / 10;
  const target1 = resistance1;
  const target2 = resistance2;
  const riskAmount = Math.max(0.1, currentPrice - invalidationLevel);
  const rewardAmount = Math.max(0.1, target1 - currentPrice);
  const rr = (rewardAmount / riskAmount).toFixed(1);

  return {
    indicators: {
      rsi,
      rsiSignal: rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral',
      macd: {
        line: macdLine,
        signal: macdSignal,
        histogram: macdHist,
        trend: macdHist > 0 ? 'Bullish' : macdHist < 0 ? 'Bearish' : 'Neutral',
      },
      movingAverages: {
        ema20,
        ema50,
        ema100,
        ema200,
        sma20,
        sma50,
        sma200,
        trendBias,
      },
      bollingerBands: {
        upper: bbUpper,
        middle: sma20,
        lower: bbLower,
        bandwidth,
        position: currentPrice >= bbUpper * 0.98 ? 'Near Upper Band' : currentPrice <= bbLower * 1.02 ? 'Near Lower Band' : 'Middle Range',
      },
      atr,
      adx,
      adxStrength: adx > 25 ? 'Strong Trend' : adx > 18 ? 'Moderate Trend' : 'Weak / Ranging',
      stochastic: {
        k: stochK,
        d: stochD,
        state: stochK < 20 ? 'Oversold' : stochK > 80 ? 'Overbought' : 'Neutral',
      },
      obv,
      volumeInterpretation: lastVolRatio > 1.2 && lastCandle.close > lastCandle.open ? 'Accumulation' : lastVolRatio > 1.2 && lastCandle.close < lastCandle.open ? 'Distribution' : 'Normal',
      supportLevels: [support1, support2],
      resistanceLevels: [resistance1, resistance2],
      candlestickPattern,
      structureInterpretation: `EMA trend is ${trendBias.toLowerCase()}, RSI is ${rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral'} (${rsi}), and MACD histogram is ${macdHist > 0 ? 'positive' : 'negative'}. Distance to next resistance is ${distToRes.toFixed(1)}%.`,
    },
    score: {
      score: totalTechnicalScore,
      breakdown: {
        trend: trendScore,
        momentum: momentumScore,
        volume: volumeScore,
        structure: structureScore,
        risk: riskSubScore,
      },
    },
    setup: {
      entryZone: [Math.min(entryLow, entryHigh), Math.max(entryLow, entryHigh)],
      support: support1,
      resistance: resistance1,
      invalidationLevel,
      target1,
      target2,
      riskRewardRatio: `1:${rr}`,
    },
    bias,
  };
}
