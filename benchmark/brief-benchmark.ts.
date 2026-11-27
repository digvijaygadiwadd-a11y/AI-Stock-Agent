/**
 * Reproducible benchmark: builds the full five-engine intelligence brief for every
 * stock in the (synthetic) universe and reports timing and how often the rule-based
 * verification layer finds conflicting signals.
 * Run with:  npx tsx benchmarks/brief-benchmark.ts
 */
import { performance } from 'node:perf_hooks';
import { getStockSummaryList, getStockIntelligence } from '../server/services/stockService';

const list = getStockSummaryList();
const rows: any[] = [];
for (const s of list) {
  const t0 = performance.now();
  const d: any = await getStockIntelligence(s.ticker, false);
  const ms = performance.now() - t0;
  rows.push({
    ticker: s.ticker,
    ms: +ms.toFixed(1),
    verification: d?.decision?.verificationStatus,
    conflicts: d?.decision?.conflictsDetected?.length ?? 0,
  });
}
console.table(rows);
const by: Record<string, number> = {};
rows.forEach(r => (by[r.verification] = (by[r.verification] || 0) + 1));
console.log('Stocks:', rows.length, '| avg ms/brief:', (rows.reduce((a, r) => a + r.ms, 0) / rows.length).toFixed(1),
  '| verification mix:', JSON.stringify(by),
  '| briefs with >=1 conflict:', rows.filter(r => r.conflicts > 0).length);
