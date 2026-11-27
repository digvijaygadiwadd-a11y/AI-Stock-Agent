import { GoogleGenAI } from '@google/genai';
import {
  StockIntelligenceData,
  AgentFindings,
  DecisionEngineOutput
} from '../../src/types';
import { cache } from '../data/cacheAndEventBus';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return geminiClient;
}

const STANCES = {
  fundamentalAgent: ['Bullish', 'Neutral', 'Bearish'],
  technicalAgent: ['Bullish', 'Neutral', 'Bearish'],
  newsAgent: ['Bullish', 'Neutral', 'Bearish'],
  valuationAgent: ['Attractive', 'Fair', 'Expensive'],
  riskAgent: ['Low Risk', 'Moderate Risk', 'Elevated Risk'],
} as const;

/**
 * Findings computed purely from the deterministic engines (NO DATA -> NO CLAIM).
 * Used when no Gemini key is configured, when Gemini errors, and as the
 * per-field fallback when Gemini returns an incomplete or invalid response.
 */
export function buildDeterministicFindings(data: StockIntelligenceData): AgentFindings {
  const findings: AgentFindings = {
    fundamentalAgent: {
      stance: data.scores.fundamentalScore >= 72 ? 'Bullish' : data.scores.fundamentalScore >= 50 ? 'Neutral' : 'Bearish',
      summary: `Revenue expanded +${data.fundamentals.growth.revenueGrowthYoY}% YoY with ${data.fundamentals.profitability.roe}% ROE. D/E stands at ${data.fundamentals.financialHealth.debtToEquity}x with F-Score of ${data.fundamentals.quality.piotroskiFScore}/9.`,
    },
    technicalAgent: {
      stance: data.scores.technicalScore >= 70 ? 'Bullish' : data.scores.technicalScore >= 50 ? 'Neutral' : 'Bearish',
      summary: `${data.technicals.movingAverages.trendBias} across daily EMAs. RSI at ${data.technicals.rsi} (${data.technicals.rsiSignal}) and MACD histogram is ${data.technicals.macd.histogram > 0 ? 'positive' : 'negative'}.`,
    },
    newsAgent: {
      stance: data.scores.newsScore >= 70 ? 'Bullish' : 'Neutral',
      summary: data.news.length > 0
        ? `${data.news[0].headline} (${data.news[0].sentiment} impact on ${data.news[0].affectedArea}).`
        : 'No major disruptive news developments detected in verified channels.',
    },
    valuationAgent: {
      stance: data.valuation.valuationStance === 'Undervalued' ? 'Attractive' : data.valuation.valuationStance === 'Fairly Valued' ? 'Fair' : 'Expensive',
      summary: `Trading at ${data.valuation.pe}x P/E vs 5Y avg of ${data.valuation.peHistorical5YrAvg}x (PEG: ${data.valuation.pegRatio}). DCF intrinsic target ₹${data.valuation.intrinsicValueDCF}.`,
    },
    riskAgent: {
      stance: data.risk.overallRisk === 'LOW' ? 'Low Risk' : data.risk.overallRisk === 'MEDIUM' ? 'Moderate Risk' : 'Elevated Risk',
      summary: `Major identified risks: ${data.risk.majorRisks.slice(0, 2).join('; ')}. Volatility Beta is ${data.risk.volatilityBeta}.`,
    },
    verificationAgent: {
      status: data.decision.verificationStatus,
      notes: data.decision.conflictsDetected.length > 0
        ? `Conflicts checked: ${data.decision.conflictsDetected.join(' ')}`
        : 'Verified concordant: Fundamental and technical vectors aligned without major contradictions.',
    },
  };
  return findings;
}

/**
 * Merge a Gemini response with the deterministic findings.
 * - Any agent that is missing or has an invalid stance falls back to its deterministic value
 *   (never to a hardcoded opinion).
 * - The verification status ALWAYS comes from the rule-based decision engine. Gemini's own
 *   status is treated as commentary, and a disagreement is noted rather than trusted.
 */
export function reconcileWithDeterministic(parsed: any, det: AgentFindings): AgentFindings {
  const pick = (key: keyof typeof STANCES) => {
    const candidate = parsed?.[key];
    const valid =
      candidate &&
      typeof candidate.summary === 'string' &&
      (STANCES[key] as readonly string[]).includes(candidate.stance);
    return valid ? candidate : det[key];
  };

  const aiStatus = parsed?.verificationAgent?.status;
  const aiNotes = typeof parsed?.verificationAgent?.notes === 'string' ? parsed.verificationAgent.notes : '';
  const disagreed = aiStatus !== undefined && aiStatus !== det.verificationAgent.status;

  return {
    fundamentalAgent: pick('fundamentalAgent'),
    technicalAgent: pick('technicalAgent'),
    newsAgent: pick('newsAgent'),
    valuationAgent: pick('valuationAgent'),
    riskAgent: pick('riskAgent'),
    verificationAgent: {
      status: det.verificationAgent.status,
      notes: disagreed
        ? `${det.verificationAgent.notes} (AI synthesis suggested ${aiStatus}; rule-based verification takes precedence.)`
        : aiNotes || det.verificationAgent.notes,
    },
  };
}

export async function orchestrateAIAgents(data: StockIntelligenceData): Promise<{
  agentFindings: AgentFindings;
  decisionSynthesis?: Partial<DecisionEngineOutput>;
  source: 'GEMINI_ORCHESTRATOR' | 'DETERMINISTIC_CACHE';
}> {
  const cacheKey = `ai_agents_${data.identification.ticker}_${Math.round(data.quote.price)}`;
  const cached = cache.get<AgentFindings>(cacheKey);
  if (cached) {
    return {
      agentFindings: cached,
      source: 'DETERMINISTIC_CACHE',
    };
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Grounded synthesis fallback adhering to NO DATA -> NO CLAIM
    const findings = buildDeterministicFindings(data);

    cache.set(cacheKey, findings, 600); // 10 min cache
    return { agentFindings: findings, source: 'DETERMINISTIC_CACHE' };
  }

  try {
    const prompt = `You are the AI Verification Engine for an institutional stock platform.
Evaluate ${data.identification.ticker} (${data.identification.name}).
DATA GROUNDING (Strictly NO DATA -> NO CLAIM):
- Price: ${data.quote.price} ${data.identification.currency}
- Fundamental Score: ${data.scores.fundamentalScore}/100 (Rev YoY: +${data.fundamentals.growth.revenueGrowthYoY}%, ROE: ${data.fundamentals.profitability.roe}%, D/E: ${data.fundamentals.financialHealth.debtToEquity}x)
- Technical Score: ${data.scores.technicalScore}/100 (Trend: ${data.technicals.movingAverages.trendBias}, RSI: ${data.technicals.rsi}, MACD: ${data.technicals.macd.histogram})
- Valuation Score: ${data.scores.valuationScore}/100 (P/E: ${data.valuation.pe}x vs 5Y ${data.valuation.peHistorical5YrAvg}x, PEG: ${data.valuation.pegRatio})
- Risk: ${data.risk.overallRisk} (Beta: ${data.risk.volatilityBeta})
- Recent News: ${data.news.map(n => n.headline).join(' | ')}

Return a JSON object with this exact structure:
{
  "fundamentalAgent": { "stance": "Bullish"|"Neutral"|"Bearish", "summary": "1 concise sentence" },
  "technicalAgent": { "stance": "Bullish"|"Neutral"|"Bearish", "summary": "1 concise sentence" },
  "newsAgent": { "stance": "Bullish"|"Neutral"|"Bearish", "summary": "1 concise sentence" },
  "valuationAgent": { "stance": "Attractive"|"Fair"|"Expensive", "summary": "1 concise sentence" },
  "riskAgent": { "stance": "Low Risk"|"Moderate Risk"|"Elevated Risk", "summary": "1 concise sentence" },
  "verificationAgent": { "status": "VERIFIED_CONCORDANT"|"MIXED_SIGNALS", "notes": "explain if signals conflict or harmonize" }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const findings = reconcileWithDeterministic(parsed, buildDeterministicFindings(data));

    cache.set(cacheKey, findings, 600);
    return { agentFindings: findings, source: 'GEMINI_ORCHESTRATOR' };
  } catch (err) {
    console.warn('Gemini orchestrator fallback:', err);
    // Fall back to findings computed from the deterministic engines (never hardcoded stances).
    return {
      agentFindings: buildDeterministicFindings(data),
      source: 'DETERMINISTIC_CACHE',
    };
  }
}
