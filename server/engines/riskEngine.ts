import { RiskMetrics, RiskLevel, FundamentalMetrics, ValuationMetrics, TechnicalIndicators } from '../../src/types';

export function calculateRiskProfile(
  fundamentals: FundamentalMetrics,
  valuation: ValuationMetrics,
  technicals: TechnicalIndicators,
  currentPrice: number
): RiskMetrics {
  const majorRisks: string[] = [];

  // Debt Risk
  let debtRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (fundamentals.financialHealth.debtToEquity > 1.5 || fundamentals.financialHealth.interestCoverage < 2.5) {
    debtRisk = 'High';
    majorRisks.push(`High leverage: Debt-to-Equity ${fundamentals.financialHealth.debtToEquity}x with coverage of ${fundamentals.financialHealth.interestCoverage}x`);
  } else if (fundamentals.financialHealth.debtToEquity > 0.8) {
    debtRisk = 'Medium';
    majorRisks.push(`Moderate debt burden (D/E ${fundamentals.financialHealth.debtToEquity}x)`);
  }

  // Valuation Risk
  let valuationRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (valuation.pe > valuation.peHistorical5YrAvg * 1.35 || valuation.pegRatio > 2.6) {
    valuationRisk = 'High';
    majorRisks.push(`Stretched valuation multiple (${valuation.pe}x P/E vs historical ${valuation.peHistorical5YrAvg}x, PEG ${valuation.pegRatio})`);
  } else if (valuation.pe > valuation.peHistorical5YrAvg * 1.1) {
    valuationRisk = 'Medium';
    majorRisks.push(`Valuation elevated relative to recent historic bands`);
  }

  // Volatility & Technical Downside
  const beta = technicals.atr ? technicals.atr / (currentPrice * 0.015) : 1.0;
  const normalizedBeta = Math.round(Math.min(2.5, Math.max(0.6, beta)) * 100) / 100;
  
  const supportLevel2 = (technicals.supportLevels && technicals.supportLevels[1]) ?? (currentPrice * 0.92);
  const distanceToMajorSupport = ((currentPrice - supportLevel2) / currentPrice) * 100;
  if (distanceToMajorSupport > 8) {
    majorRisks.push(`Technical downside risk: ${distanceToMajorSupport.toFixed(1)}% to secondary structural support`);
  }

  // Promoter / Governance Check
  const pledgedPercent = fundamentals.ownership?.promoterPledge ?? 0;
  if (pledgedPercent > 5) {
    majorRisks.push(`Promoter shares pledged: ${pledgedPercent}%`);
  }

  // If few risks, add standard industry risks
  if (majorRisks.length === 0) {
    majorRisks.push('Macroeconomic interest rate sensitivity');
    majorRisks.push('Sector demand slowdown cycle');
  }

  // Calculate overall risk score (0-100: higher means safer / lower risk, as standard for scoring aggregation)
  let riskScoreDeductions = 0;
  if (debtRisk === 'High') riskScoreDeductions += 25;
  else if (debtRisk === 'Medium') riskScoreDeductions += 12;

  if (valuationRisk === 'High') riskScoreDeductions += 25;
  else if (valuationRisk === 'Medium') riskScoreDeductions += 12;

  if (technicals.rsi > 72) riskScoreDeductions += 10;
  if (normalizedBeta > 1.4) riskScoreDeductions += 15;

  const safetyScore = Math.max(25, 100 - riskScoreDeductions);

  let overallRisk: RiskLevel = 'MEDIUM';
  if (safetyScore >= 80) overallRisk = 'LOW';
  else if (safetyScore >= 55) overallRisk = 'MEDIUM';
  else if (safetyScore >= 35) overallRisk = 'HIGH';
  else overallRisk = 'EXTREME';

  return {
    overallRisk,
    marketRisk: Math.round(100 - safetyScore),
    volatilityBeta: normalizedBeta,
    debtRisk,
    valuationRisk,
    regulatoryRisk: 'Low',
    liquidityRisk: 'Low',
    majorRisks: majorRisks.slice(0, 3),
    downsideScenarioPercentage: Math.round(Math.max(6, distanceToMajorSupport)),
  };
}
