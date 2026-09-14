import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { searchStocks, STOCK_DATABASE } from './server/data/stockDatabase';
import { getStockIntelligence } from './server/services/stockService';
import { activeAlerts, activeTheses, getObservabilityMetrics, eventBus } from './server/data/cacheAndEventBus';

// User watchlist and portfolio in-memory state
let userWatchlist: string[] = ['RELIANCE', 'TCS', 'BEL', 'TATAMOTORS', 'NVDA', 'AAPL'];
const userPortfolio = [
  { ticker: 'RELIANCE', shares: 50, avgBuyPrice: 2820.00, allocationPercent: 32 },
  { ticker: 'NVDA', shares: 120, avgBuyPrice: 112.50, allocationPercent: 28 },
  { ticker: 'TCS', shares: 25, avgBuyPrice: 4050.00, allocationPercent: 22 },
  { ticker: 'BEL', shares: 250, avgBuyPrice: 280.00, allocationPercent: 18 },
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());

  // Optional API key authentication middleware for mutating routes
  const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const configuredKey = process.env.STOCKAGENT_API_KEY;
    if (!configuredKey) {
      return next(); // Unset implies local dev / open mode
    }

    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.slice(7)
      : apiKeyHeader;

    if (token !== configuredKey) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid API key' });
    }
    next();
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stock Search
  app.get('/api/stocks/search', (req, res) => {
    const q = (req.query.q as string) || '';
    const results = searchStocks(q);
    res.json(results);
  });

  // Stock Full Intelligence
  app.get('/api/stocks/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const data = await getStockIntelligence(ticker, false);
      if (!data) {
        return res.status(404).json({ error: `Stock ${ticker} not found in intelligence registry.` });
      }
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching stock intel:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Deep AI Orchestrated Analysis Trigger (Mutating)
  app.post('/api/stocks/:ticker/deep-analysis', requireApiKey, async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const data = await getStockIntelligence(ticker, true);
      if (!data) {
        return res.status(404).json({ error: `Stock ${ticker} not found.` });
      }
      res.json(data);
    } catch (err: any) {
      console.error('Error running deep AI analysis:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Personal Thesis
  app.get('/api/stocks/:ticker/thesis', (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const thesis = activeTheses[ticker] || null;
    res.json({ thesis });
  });

  // Personal Thesis Save (Mutating)
  app.post('/api/stocks/:ticker/thesis', requireApiKey, (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const { thesisText } = req.body;
    if (!thesisText) return res.status(400).json({ error: 'Thesis text is required' });

    const newThesis = {
      id: `ths-${ticker.toLowerCase()}-${Date.now()}`,
      ticker,
      thesisText,
      createdAt: 'Just now',
      status: 'VALID' as const,
      supportingPillars: [
        'Revenue compounding aligns with initial growth expectation',
        'Balance sheet leverage remains within safe boundaries',
      ],
      warningFlags: [
        'Monitor next quarterly gross margin print for cost absorption',
      ],
    };

    activeTheses[ticker] = newThesis;
    eventBus.publish('THESIS_UPDATED', { ticker, thesisText });
    res.json({ success: true, thesis: newThesis });
  });

  // Market Overview
  app.get('/api/market-overview', (req, res) => {
    const indices = [
      { name: 'NIFTY 50', value: '25,182.40', change: '+142.10', changePercent: '+0.57%', status: 'Bullish' },
      { name: 'SENSEX', value: '82,410.15', change: '+418.50', changePercent: '+0.51%', status: 'Bullish' },
      { name: 'NASDAQ 100', value: '19,842.10', change: '+198.20', changePercent: '+1.01%', status: 'Strong Bullish' },
      { name: 'S&P 500', value: '5,648.30', change: '+38.40', changePercent: '+0.68%', status: 'Bullish' },
      { name: 'INDIA VIX', value: '13.42', change: '-0.38', changePercent: '-2.75%', status: 'Low Volatility' },
    ];

    const watchlistIntelligence = userWatchlist.map(t => {
      const stock = STOCK_DATABASE[t];
      if (!stock) return null;
      let badge = '🟡 Stable Consolidation';
      if (t === 'RELIANCE') badge = '🟢 Fundamental improvement';
      else if (t === 'BEL') badge = '🟢 Technical breakout';
      else if (t === 'TATAMOTORS') badge = '🔴 Negative sector news';
      else if (t === 'NVDA') badge = '🟢 High compute backlog';
      else if (t === 'TCS') badge = '🟡 Large deal signing';

      return {
        ticker: t,
        name: stock.identification.name,
        price: stock.quote.price,
        changePercent: stock.quote.changePercent,
        statusBadge: badge,
        pe: stock.valuation.pe,
      };
    }).filter(Boolean);

    res.json({ indices, watchlistIntelligence });
  });

  // Sector Intelligence
  app.get('/api/sector-intelligence', (req, res) => {
    const sectors = [
      { name: 'Defense & Aerospace', momentum: '+3.4%', peAvg: 42.0, leader: 'BEL', sentiment: 'Strong Outperformer' },
      { name: 'Accelerated Tech & Cloud', momentum: '+2.8%', peAvg: 34.5, leader: 'NVDA', sentiment: 'Structural Growth' },
      { name: 'Energy & Telecom Retail', momentum: '+1.1%', peAvg: 24.5, leader: 'RELIANCE', sentiment: 'Defensive Compounder' },
      { name: 'Information Technology', momentum: '-0.4%', peAvg: 27.8, leader: 'TCS', sentiment: 'Value Accumulation' },
      { name: 'Automotive & EV', momentum: '-1.5%', peAvg: 21.0, leader: 'MARUTI', sentiment: 'Cyclical Consolidation' },
    ];
    res.json(sectors);
  });

  // Watchlist
  app.get('/api/watchlist', (req, res) => {
    const list = userWatchlist.map(t => {
      const stock = STOCK_DATABASE[t];
      return stock ? {
        ticker: t,
        name: stock.identification.name,
        sector: stock.identification.sector,
        price: stock.quote.price,
        change: stock.quote.change,
        changePercent: stock.quote.changePercent,
      } : null;
    }).filter(Boolean);
    res.json(list);
  });

  // Watchlist Add (Mutating)
  app.post('/api/watchlist', requireApiKey, (req, res) => {
    const { ticker } = req.body;
    if (ticker && !userWatchlist.includes(ticker.toUpperCase())) {
      userWatchlist.push(ticker.toUpperCase());
    }
    res.json({ success: true, watchlist: userWatchlist });
  });

  // Watchlist Delete (Mutating)
  app.delete('/api/watchlist/:ticker', requireApiKey, (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    userWatchlist = userWatchlist.filter(t => t !== ticker);
    res.json({ success: true, watchlist: userWatchlist });
  });

  // Portfolio
  app.get('/api/portfolio', (req, res) => {
    const portfolio = userPortfolio.map(p => {
      const stock = STOCK_DATABASE[p.ticker];
      const curPrice = stock ? stock.quote.price : p.avgBuyPrice;
      const curVal = curPrice * p.shares;
      const costVal = p.avgBuyPrice * p.shares;
      const pnl = curVal - costVal;
      const pnlPercent = Math.round((pnl / costVal) * 1000) / 10;

      return {
        ...p,
        currentPrice: curPrice,
        unrealizedPnL: Math.round(pnl),
        unrealizedPnLPercent: pnlPercent,
        aiStatus: (pnlPercent > 10 ? 'POSITIVE' : pnlPercent < -5 ? 'CAUTION' : 'WATCH') as any,
        riskFlag: stock?.fundamentals.financialHealth.debtToEquity && stock.fundamentals.financialHealth.debtToEquity > 1 ? 'Elevated Debt' : 'Normal',
      };
    });
    res.json(portfolio);
  });

  // Alerts
  app.get('/api/alerts', (req, res) => {
    res.json(activeAlerts);
  });

  // Alerts Add (Mutating)
  app.post('/api/alerts', requireApiKey, (req, res) => {
    const { ticker, type, threshold, note } = req.body;
    const newAlert = {
      id: `alt-${Date.now()}`,
      ticker: (ticker || 'RELIANCE').toUpperCase(),
      type: type || 'PRICE_ABOVE',
      threshold: Number(threshold) || 3000,
      note: note || 'Custom user alert rule',
      createdAt: 'Just now',
      isTriggered: false,
    };
    activeAlerts.unshift(newAlert);
    eventBus.publish('ALERT_TRIGGERED', newAlert);
    res.json({ success: true, alert: newAlert });
  });

  // Observability
  app.get('/api/observability', (req, res) => {
    res.json({
      metrics: getObservabilityMetrics(),
      recentEvents: eventBus.getRecentEvents(),
    });
  });

  // --- VITE MIDDLEWARE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Stock Intelligence Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

