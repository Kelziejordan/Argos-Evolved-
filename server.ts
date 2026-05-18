import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as ccxt from 'ccxt';

dotenv.config();

// Kraken client lazy initializer
let krakenClient: any = null;
const getKraken = () => {
  if (!krakenClient) {
    const apiKey = process.env.KRAKEN_API_KEY;
    const secret = process.env.KRAKEN_SECRET_KEY;
    
    try {
      // Use standard constructor
      krakenClient = new ccxt.kraken({
        apiKey: apiKey && apiKey !== 'your_api_key_here' ? apiKey : undefined,
        secret: secret && secret !== 'your_secret_key_here' ? secret : undefined,
      });
    } catch (e) {
      console.error("Kraken init failed", e);
      return null;
    }
  }
  return krakenClient;
};

// Simulated Market Data State
let marketState: any = {
  btc: { price: 68422.50, delta: 0.15, status: 'neutral' },
  eth: { price: 3521.12, delta: -0.42, status: 'neutral' },
  sol: { price: 142.88, delta: 1.25, status: 'bullish' },
  dot: { price: 7.24, delta: 0.05, status: 'neutral' },
  link: { price: 18.12, delta: -2.1, status: 'bearish' },
  ada: { price: 0.45, delta: 0.8, status: 'neutral' },
  xrp: { price: 0.52, delta: -0.1, status: 'neutral' },
  neuralSentiment: 0.84,
  quantumInstability: 0.12,
  activeWhales: 14,
  krakenConnected: false,
  activeSignals: [
    { id: 1, title: 'BTC_BULL_BREAK', desc: 'Heavy whale accumulation detected.', variant: 'emerald', time: 'NOW' },
    { id: 2, title: 'SOL_LIQUIDITY', desc: 'Order flow imbalance on SOL pairs.', variant: 'amber', time: '2m' }
  ]
};

// Background update for simulation + Optional Kraken Sync
function startMarketPulse() {
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOT/USDT', 'LINK/USDT', 'ADA/USDT', 'XRP/USDT'];
  const mapping: any = {
    'BTC/USDT': 'btc',
    'ETH/USDT': 'eth',
    'SOL/USDT': 'sol',
    'DOT/USDT': 'dot',
    'LINK/USDT': 'link',
    'ADA/USDT': 'ada',
    'XRP/USDT': 'xrp'
  };

  setInterval(async () => {
    try {
      const kraken = getKraken();
      if (kraken) {
        const tickers = await kraken.fetchTickers(symbols).catch((err: any) => {
          console.error("Kraken ticker fetch failed", err.message);
          return null;
        });
        
        if (tickers) {
          for (const symbol of symbols) {
            const ticker = tickers[symbol];
            const key = mapping[symbol];
            if (ticker && marketState[key]) {
              marketState[key].price = ticker.last || marketState[key].price;
              marketState[key].delta = parseFloat(((ticker.percentage || 0)).toFixed(2));
              
              // Dynamic status
              if (marketState[key].delta > 2) marketState[key].status = 'volatile';
              else if (marketState[key].delta > 0.5) marketState[key].status = 'bullish';
              else if (marketState[key].delta < -0.5) marketState[key].status = 'bearish';
              else marketState[key].status = 'neutral';
            }
          }
        }
      }
      marketState.krakenConnected = !!(process.env.KRAKEN_API_KEY && process.env.KRAKEN_API_KEY !== 'your_api_key_here');
    } catch (e) {
      console.error("Market pulse interval error", e);
    }
    
    // Simulation drift
    Object.keys(marketState).forEach(key => {
      if (typeof marketState[key] === 'object' && marketState[key].price) {
        marketState[key].price += (Math.random() - 0.5) * (marketState[key].price * 0.0001);
      }
    });

    // Random Signal Generation
    if (Math.random() > 0.85) {
      const assets = ['BTC', 'ETH', 'SOL', 'DOT', 'ADA', 'XRP', 'LINK'];
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const types = [
        { title: `${asset}_VOLATILITY`, desc: 'Unusual volume spike detected.', variant: 'amber' },
        { title: `${asset}_SQUEEZE`, desc: 'Short liquidations imminent.', variant: 'emerald' },
        { title: `${asset}_DUMP_RISK`, desc: 'Sell pressure increasing.', variant: 'red' }
      ];
      const signal = types[Math.floor(Math.random() * types.length)];
      marketState.activeSignals = [
        { id: Date.now(), ...signal, time: 'NOW' },
        ...marketState.activeSignals.slice(0, 4)
      ];
    }
    
    marketState.neuralSentiment = Math.max(0, Math.min(1, marketState.neuralSentiment + (Math.random() - 0.5) * 0.01));
    marketState.quantumInstability = Math.max(0, Math.min(1, marketState.quantumInstability + (Math.random() - 0.5) * 0.005));
    marketState.activeWhales = Math.max(1, marketState.activeWhales + (Math.random() > 0.5 ? 1 : -1));
  }, 5000);
}

const app = express();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  
  startMarketPulse();

  // Debug Log Middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
  });

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/market-pulse", (req, res) => {
    res.json(marketState);
  });

  app.post("/api/kraken/simulate", async (req, res) => {
    const { symbol, side, amount, aggression } = req.body;
    // Simulated paper trade execution with a 'delay' or 'slippage' based on aggression
    const delay = 500 + (1 - aggression) * 2000;
    
    setTimeout(() => {
      res.json({
        success: true,
        orderId: `KRAKEN-P-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'executed',
        symbol,
        side,
        price: side === 'buy' ? marketState.btc.price * 1.001 : marketState.btc.price * 0.999,
        timestamp: Date.now()
      });
    }, delay);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as Hyperbot, a next-level trading intelligence. Market state: ${JSON.stringify(marketState)}. User: ${message}`,
        config: {
          systemInstruction: "You are Hyperbot v2.0, the world's most advanced trading AI. Your responses are hyper-technical, focusing on quantum probability, order flow, and liquidations. Use markdown. Be aggressive but professional about profit. If asked to trade, explain the strategy you are 'executing' in simulation.",
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer();
