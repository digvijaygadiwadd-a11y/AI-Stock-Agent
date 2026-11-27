# Stock Intelligence & Decision Platform

> **Interview-ready summary:** see [CASE_STUDY.md](CASE_STUDY.md) for the problem, root causes, decisions, measured results and limitations.


A deterministic, multi-layered financial intelligence engine and interactive research workstation. The platform combines pure mathematical scoring models across technicals, fundamentals, valuations, and risk with an optional Gemini multi-agent synthesis layer.

---

## Architecture

```
[ Synthetic Market & Financial Dataset ]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│             Layered Deterministic Engines              │
├───────────────────┬───────────────────┬────────────────┤
│ Technical Engine  │ Fundamental Engine│Valuation Engine│
│ • RSI-14          │ • Growth YoY      │• P/E vs 5Y Avg │
│ • EMAs (20..200)  │ • ROE / ROCE      │• PEG Ratio     │
│ • MACD (12,26,9)  │ • D/E & Coverage  │• DCF Model     │
│ • Bollinger Bands │ • Quality Flags   │• Margin-Safety │
└─────────┬─────────┴─────────┬─────────┴────────┬───────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌───────────────────┐ ┌──────────────────────────────────┐
│    Risk Engine    │ │         Decision Engine          │
│ • Downside Scen.  │ │ • Concordance Verification       │
│ • Balance Stress  │ │ • Bias & Target Price Range      │
└─────────┬─────────┘ └──────────────────┬───────────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼
      ┌────────────────────────────────────┐
      │     AI Agent Orchestration         │
      │ • Deterministic synthesis fallback │
      │ • Gemini API deep research mode    │
      └──────────────────┬─────────────────┘
                         ▼
      ┌────────────────────────────────────┐
      │   Full-Stack Dashboard & UI        │
      │ • Interactive Candle Charts        │
      │ • Scenario Explorer & Thesis Log   │
      │ • System Telemetry & Observability │
      └────────────────────────────────────┘
```

---

## Core Engines

1. **Technical Engine (`server/engines/technicalEngine.ts`)**
   - Pure mathematical calculations for momentum, trend, and volatility.
   - Computes RSI-14, Exponential Moving Averages (EMA 20, 50, 100, 200), Simple Moving Averages (SMA 20, 50, 200), Average True Range (ATR), and Bollinger Bands (20-period, 2σ).
   - Real MACD (12, 26, 9) implementation: calculates continuous 12- and 26-period EMA series, generates the MACD line, and applies a true 9-period EMA over the MACD series for the signal line and histogram (`macdLine - macdSignal`).

2. **Fundamental Engine (`server/engines/fundamentalEngine.ts`)**
   - Multi-factor evaluation across 5 pillars: Growth (revenue/EBITDA/EPS), Profitability (ROE, ROCE, operating/net margins), Financial Health (Debt/Equity, interest coverage, current ratio, free cash flow), Valuation, and Accounting Quality.

3. **Valuation Engine (`server/engines/valuationEngine.ts`)**
   - Relative and intrinsic valuation analysis benchmarking against 5-year historical medians, sector peers, PEG ratios, and a discounted cash flow (DCF) model to determine intrinsic discount/premium margins.

4. **Risk Engine (`server/engines/riskEngine.ts`)**
   - Multi-vector risk auditing covering balance-sheet leverage, debt-servicing capability, volatility beta, structural technical downside to key support bands, and promoter share pledges.

5. **Decision Engine (`server/engines/decisionEngine.ts`)**
   - Cross-domain concordance verification. Identifies conflicts (e.g. bullish technicals into heavily overvalued fundamentals or high debt stress) and classifies signals into `VERIFIED_CONCORDANT`, `MIXED_SIGNALS`, or `DIVERGENT`.
   - Projects mathematical Bull, Base, and Bear scenarios with explicit catalyst triggers and invalidation conditions.

6. **Agent Orchestrator (`server/ai/agentOrchestrator.ts`)**
   - Produces per-pillar findings (Fundamental, Technical, News, Valuation, Risk) plus a verification note.
   - If a `GEMINI_API_KEY` is provided, Gemini writes the narrative synthesis. Its output is validated field by field: any missing or invalid agent falls back to the value computed from the deterministic engines.
   - **Verification is rule-based, not AI-based.** The `VERIFIED_CONCORDANT` / `MIXED_SIGNALS` / `DIVERGENT` status always comes from the decision engine. If Gemini suggests a different status, the rule-based status wins and the disagreement is noted.
   - If no key is present, or Gemini errors, findings are generated directly from the mathematical outputs (no hardcoded stances).

7. **In-Memory Cache & Event Bus (`server/data/cacheAndEventBus.ts`)**
   - Non-blocking in-process TTL cache with honest telemetry tracking (real hits, misses, and dynamic hit-rate).
   - Lightweight asynchronous publish-subscribe event bus tracking state updates, ticker lookups, and alert triggers.

---

## Data: what's real vs. synthetic

All market quotes, historical OHLCV candle series, fundamental financial filings, and event items are generated from calibrated synthetic models and curated reference records (`server/data/stockDatabase.ts`). 

This architecture allows developers and reviewers to test all quantitative models, scenario projections, and interactive views offline without requiring external market data vendor subscriptions.

---

## Getting started

### Prerequisites
- Node.js 20+ (recommended Node 22+)
- npm

### Installation
```bash
npm install
```

### Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

Variables:
- `GEMINI_API_KEY` *(optional)*: Google Gemini API key for AI synthesis.
- `PORT` *(optional, defaults to `3000`)*: web server port.
- `APP_URL` *(optional, defaults to `http://localhost:3000`)*: Deployment base URL.
- `ALLOWED_ORIGINS` *(optional, defaults to localhost)*: comma-separated CORS allowlist.
- `STOCKAGENT_API_KEY` *(optional)*: if set, required (via `Authorization: Bearer <key>` or `X-API-Key`) on mutating endpoints.

### Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### Running Unit Tests
Execute the pure deterministic scoring engine test suite:
```bash
npm test
```

### Production Build
```bash
npm run build
npm start
```

---

## Test coverage
The project includes unit tests (`test/engines.test.ts`) validating:
- Technical indicator computations and the 9-period MACD signal line EMA.
- Fundamental scoring and balance sheet health stress deductions.
- Valuation stance and DCF discount calibration.
- Risk engine leverage and downside scenario modeling.
- Decision engine concordance verification and scenario target ordering.
- In-memory cache TTL and authentic hit-rate telemetry math.
