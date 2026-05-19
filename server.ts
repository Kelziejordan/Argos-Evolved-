import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { marketState } from "./server/anatomy/state";
import { getGemini } from "./server/organs/gemini";
import { startMarketPulse } from "./server/brain/pulseEngine";
import { initializeNervousCenter } from "./server/nervous-system/NervousCenter";
import { loadSnapshot, saveSnapshot } from "./server/memory/persistence";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  
  const ai = getGemini();

  // Load Organism Memory
  const savedState = loadSnapshot();
  if (savedState) {
    Object.assign(marketState, savedState);
  }

  // Spinal Cord Initialization
  initializeNervousCenter();
  
  // Heartbeat Initialization
  startMarketPulse();

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
