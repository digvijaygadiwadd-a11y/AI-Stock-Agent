# AI Stock Agent: Case Study

**One line:** one platform that turns scattered stock signals into a single structured brief, and checks the signals against each other before it gives a view.

> **Data note:** the app runs on a synthetic data layer for demonstration and is not connected to live market feeds. Nothing here claims investment returns.

## 1. The problem
An investor evaluating one stock normally juggles charts (technicals), financial statements (fundamentals), valuation models, news and risk, across several sites. The sources often disagree, for example a bullish chart on an overvalued stock, and without a structured check that disagreement is easy to ignore. I traded my own account for four years, so I know this problem first-hand.

## 2. Root causes
| Root cause | Consequence |
|---|---|
| Signals live in separate tools | No single view of the whole case |
| Nothing checks signals against each other | Conflicts get missed, decisions become selective or emotional |
| AI summaries read confidently even when inputs conflict | False sense of certainty |

## 3. Decisions I made, and why
1. **Five specialised engines** (technical, fundamental, valuation, risk, decision), each computing from data rather than opinion.
2. **A rule-based verification layer.** It detects cross-domain conflicts and classifies each brief as `VERIFIED_CONCORDANT`, `MIXED_SIGNALS` or `DIVERGENT`, with lower confidence when signals conflict.
3. **Scenarios, not predictions:** Bull / Base / Bear cases with explicit invalidation levels ("what would prove this view wrong").
4. **AI is optional and subordinate.** Gemini writes the narrative, but the verification status always comes from the rules. If the AI fails or disagrees, the deterministic result wins.
5. **Honesty about data:** the README separates real from synthetic data.

## 4. Measured results (reproducible)
Run `npx tsx benchmarks/brief-benchmark.ts` and `npx vitest run`.

| Evidence | Result |
|---|---|
| Automated tests | **9 passing** (indicators, scoring, valuation, risk, decision engine, cache, orchestrator) |
| Full five-engine brief for 18 stocks (10 Indian, 8 US) | average **1.4 ms** per brief |
| Verification outcomes on the synthetic universe | 12 concordant, **6 with conflicting signals flagged** (33%) |

## 5. Outcome case
On the synthetic universe, 6 of 18 briefs were flagged `MIXED_SIGNALS`. Those are the cases where a single-indicator view would have looked clean. The layer shows the investor *which* signals disagree and lowers confidence, which is the behaviour I wanted: **slow the decision down when the evidence conflicts.**

## 6. Bugs I found in my own work, and fixed
- The AI error fallback hardcoded "Bullish" regardless of the data. It now uses the computed scores.
- Gemini's own verification status was accepted unchecked. The rule-based status now always takes precedence, with a note if the AI disagreed.
- Both are covered by tests.

## 7. Limitations and next steps
- Synthetic data: no market outcomes are claimed.
- Scoring weights are hand-set. Next step: backtest the signal rules on historical prices (win rate, max drawdown) as a separate study.
- Next: connect a real data source and add a data-freshness check.

## 8. Interview Q&A
**What problem does it solve?** Signals scattered across tools and never cross-checked. It puts them in one brief and flags conflicts.
**Why rules for verification instead of AI?** Verification must be explainable and consistent. AI writes the narrative; rules decide the status.
**Does it make money?** I make no such claim. It is a decision-support prototype on synthetic data; the next step is a backtest.
