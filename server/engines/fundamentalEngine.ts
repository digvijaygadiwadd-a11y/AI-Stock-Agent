import { FundamentalMetrics, ValuationMetrics } from '../../src/types';

export function calculateFundamentalScore(fundamentals: FundamentalMetrics, valuation: ValuationMetrics): {
  score: number;
  breakdown: {
    growth: number;
    profitability: number;
    financialHealth: number;
    valuation: number;
    quality: number;
  };
  explanation: string;
} {
  // 1. Growth (0-20)
  // Evaluates revenue growth, profit growth, EBITDA growth, and consistency
  let growth = 10;
  const revGrowth = fundamentals.growth.revenueGrowthYoY;
  const patGrowth = fundamentals.growth.profitGrowthYoY;
  
  if (revGrowth > 25 && patGrowth > 20) growth = 19;
  else if (revGrowth > 15 && patGrowth > 12) growth = 17;
  else if (revGrowth > 8 && patGrowth > 5) growth = 14;
  else if (revGrowth > 0) growth = 10;
  else growth = 5;

  if (fundamentals.growth.growthConsistencyScore > 80) growth = Math.min(20, growth + 1);

  // 2. Profitability (0-20)
  // Evaluates ROE, ROCE, Operating Margin, Net Margin
  let profitability = 10;
  const roe = fundamentals.profitability.roe;
  const roce = fundamentals.profitability.roce;
  const opMargin = fundamentals.profitability.operatingMargin;

  if (roe > 22 && roce > 20 && opMargin > 20) profitability = 19;
  else if (roe > 16 && roce > 15 && opMargin > 14) profitability = 17;
  else if (roe > 12 && roce > 10) profitability = 13;
  else if (roe > 6) profitability = 9;
  else profitability = 5;

  // 3. Financial Health (0-20)
  // Evaluates Debt-to-Equity, Interest Coverage, Current Ratio, Free Cash Flow
  let financialHealth = 10;
  const de = fundamentals.financialHealth.debtToEquity;
  const ic = fundamentals.financialHealth.interestCoverage;
  const cr = fundamentals.financialHealth.currentRatio;
  const fcf = fundamentals.financialHealth.freeCashFlow;

  if (de < 0.3 && ic > 10 && cr > 1.5 && fcf > 0) financialHealth = 20;
  else if (de < 0.7 && ic > 5 && cr > 1.2 && fcf > 0) financialHealth = 17;
  else if (de < 1.2 && ic > 3) financialHealth = 13;
  else if (de < 2.0 && ic > 1.5) financialHealth = 9;
  else financialHealth = 4;

  // 4. Valuation (0-20)
  // Evaluates P/E vs historical, PEG, EV/EBITDA vs sector
  let valScore = 10;
  const pe = valuation.pe;
  const peHist = valuation.peHistorical5YrAvg;
  const peg = valuation.pegRatio;
  
  if (peg > 0 && peg < 1.0 && pe <= peHist * 0.95) valScore = 19;
  else if (peg < 1.5 && pe <= peHist * 1.05) valScore = 15;
  else if (peg < 2.0 && pe <= peHist * 1.2) valScore = 12;
  else if (pe > peHist * 1.4 || peg > 2.8) valScore = 7;
  else valScore = 10;

  // 5. Quality (0-20)
  // Piotroski F-score, Altman Z-Score, Cash Conversion, Audit flag
  let quality = 10;
  const pScore = fundamentals.quality.piotroskiFScore;
  const altmanZ = fundamentals.quality.altmanZScore;
  const audit = fundamentals.quality.auditFlag;

  if (pScore >= 8 && altmanZ > 3.0 && audit === 'Clean') quality = 19;
  else if (pScore >= 6 && altmanZ > 2.2 && audit === 'Clean') quality = 16;
  else if (pScore >= 4 && altmanZ > 1.8) quality = 12;
  else quality = 7;

  const total = Math.min(100, Math.max(0, growth + profitability + financialHealth + valScore + quality));

  const explanation = `Deterministic score ${total}/100 synthesized from Growth (${growth}/20, rev YoY ${revGrowth}%), Profitability (${profitability}/20, ROE ${roe}%), Balance Sheet Health (${financialHealth}/20, D/E ${de}x), Valuation Multiple (${valScore}/20, PEG ${peg}), and Quality Matrix (${quality}/20, F-Score ${pScore}/9).`;

  return {
    score: total,
    breakdown: {
      growth,
      profitability,
      financialHealth,
      valuation: valScore,
      quality,
    },
    explanation,
  };
}
