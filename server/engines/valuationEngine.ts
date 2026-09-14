import { ValuationMetrics, FundamentalMetrics } from '../../src/types';

export function calculateValuationScore(val: ValuationMetrics, fun: FundamentalMetrics): {
  score: number;
  stance: 'Undervalued' | 'Fairly Valued' | 'Slightly Expensive' | 'Significantly Overvalued';
  detailedComparison: {
    peVsHistoricalDiff: number; // % diff
    peVsSectorDiff: number;
    pegInterpretation: string;
    dcfMarginOfSafety: number; // %
  };
  summary: string;
} {
  const peDiffHist = Math.round(((val.pe - val.peHistorical5YrAvg) / val.peHistorical5YrAvg) * 100);
  const peDiffSector = Math.round(((val.pe - val.peSectorAvg) / val.peSectorAvg) * 100);
  const dcfSafety = Math.round(((val.intrinsicValueDCF - (val.pe * 10)) / (val.pe * 10)) * 100);

  // Valuation score from 0 (very overvalued) to 100 (deep discount)
  let baseScore = 50;

  // P/E vs 5-yr avg
  if (peDiffHist < -20) baseScore += 18;
  else if (peDiffHist < -5) baseScore += 10;
  else if (peDiffHist > 35) baseScore -= 18;
  else if (peDiffHist > 15) baseScore -= 10;

  // PEG ratio
  if (val.pegRatio > 0 && val.pegRatio < 1.0) baseScore += 16;
  else if (val.pegRatio < 1.5) baseScore += 8;
  else if (val.pegRatio > 2.5) baseScore -= 14;

  // EV/EBITDA vs Sector
  const evDiff = ((val.evToEbitda - val.evToEbitdaSectorAvg) / val.evToEbitdaSectorAvg) * 100;
  if (evDiff < -10) baseScore += 10;
  else if (evDiff > 20) baseScore -= 10;

  // Dividend yield bonus
  if (val.dividendYield > 3.0) baseScore += 6;
  else if (val.dividendYield > 1.5) baseScore += 3;

  const score = Math.min(100, Math.max(10, Math.round(baseScore)));

  let stance: 'Undervalued' | 'Fairly Valued' | 'Slightly Expensive' | 'Significantly Overvalued' = 'Fairly Valued';
  if (score >= 75) stance = 'Undervalued';
  else if (score >= 60) stance = 'Fairly Valued';
  else if (score >= 45) stance = 'Slightly Expensive';
  else stance = 'Significantly Overvalued';

  const summary = `Current Valuation: ${stance} (Score: ${score}/100). Trading at ${val.pe}x P/E (${peDiffHist >= 0 ? '+' : ''}${peDiffHist}% vs 5Y avg of ${val.peHistorical5YrAvg}x, ${peDiffSector >= 0 ? '+' : ''}${peDiffSector}% vs sector avg of ${val.peSectorAvg}x). PEG sits at ${val.pegRatio}.`;

  return {
    score,
    stance,
    detailedComparison: {
      peVsHistoricalDiff: peDiffHist,
      peVsSectorDiff: peDiffSector,
      pegInterpretation: val.pegRatio < 1.2 ? 'Attractive PEG relative to growth' : val.pegRatio > 2.2 ? 'Elevated PEG premium' : 'Balanced PEG',
      dcfMarginOfSafety: dcfSafety,
    },
    summary,
  };
}
