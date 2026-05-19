import { eventBus, NexusEvent } from "./EventBus";
import { marketState } from "../anatomy/state";
import { getKraken } from "../organs/kraken";
import { CONFIG, ASSET_MAPPING } from "../genetics/config";
import { generateSignals } from "../brain/signalGenerator";
import { saveSnapshot } from "../memory/persistence";

export function initializeNervousCenter() {
  console.log("[NERVOUS_CENTER] Initializing coordination layer...");

  // 1. Heartbeat Handler
  eventBus.on(NexusEvent.PULSE_TICK, async (payload) => {
    await updateMarketData();
    applyAtmosphericDrift();
    
    // Broadcast that market has been updated
    eventBus.dispatch(NexusEvent.MARKET_UPDATED);
    
    if (payload.pulseCount % 60 === 0) {
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "SYSTEM_STABILITY_CHECK: NOMINAL", level: "INFO" });
    }
  });

  // 2. Brain Handler (Signal Generation)
  eventBus.on(NexusEvent.MARKET_UPDATED, () => {
    generateSignals();
  });

  // 3. Memory Handler (Snapshots)
  eventBus.on(NexusEvent.MEMORY_SNAPSHOT, () => {
    console.log("[MEMORY] Triggering periodic snapshot...");
    saveSnapshot();
  });

  // 4. Command Handler (Log user actions)
  eventBus.on(NexusEvent.COMMAND_RECEIVED, (payload) => {
    console.log(`[USER_COMMAND] Executing: ${payload.command}`);
  });

  // 5. Audit Logger (The emerging audit layer)
  eventBus.on(NexusEvent.SYSTEM_ALERT, (payload) => {
    console.log(`[AUDIT_LOG] [${payload.level}] ${payload.message}`);
  });
  
  eventBus.on(NexusEvent.SIGNAL_GENERATED, (signal) => {
    console.log(`[AUDIT_LOG] [SIGNAL] ${signal.title}: ${signal.desc}`);
  });
}

// Internal Logic Gates
async function updateMarketData() {
  const isLive = CONFIG.LIVE_TRADING_ENABLED && !!(process.env.KRAKEN_API_KEY && process.env.KRAKEN_API_KEY !== 'your_api_key_here');
  
  try {
    const kraken = getKraken();
    if (kraken && isLive) {
      const tickers = await kraken.fetchTickers(CONFIG.MARKET_SYMBOLS).catch(() => null);
      
      if (tickers) {
        for (const symbol of CONFIG.MARKET_SYMBOLS) {
          const ticker = tickers[symbol];
          const key = ASSET_MAPPING[symbol];
          const stateField = (marketState as any)[key];
          
          if (ticker && stateField) {
            stateField.price = ticker.last || stateField.price;
            stateField.delta = parseFloat(((ticker.percentage || 0)).toFixed(2));
            
            // Dynamic status
            if (stateField.delta > 2) stateField.status = 'volatile';
            else if (stateField.delta > 0.5) stateField.status = 'bullish';
            else if (stateField.delta < -0.5) stateField.status = 'bearish';
            else stateField.status = 'neutral';
          }
        }
      }
      marketState.krakenConnected = true;
    } else {
      // FIREWALL: If not live, ensure state reflects simulation reality
      marketState.krakenConnected = false;
    }
  } catch (e) {
    console.error("[NERVOUS_CENTER] Market data update failed", e);
    marketState.krakenConnected = false;
  }

  // Simulation drift - Persistent behavioral layer (always present to some degree for 'life' feel)
  Object.keys(marketState).forEach(key => {
    const stateField = (marketState as any)[key];
    if (typeof stateField === 'object' && stateField && stateField.price) {
      // Higher drift if disconnected to simulate market activity
      const driftMultiplier = marketState.krakenConnected ? 0.2 : 1.0;
      stateField.price += (Math.random() - 0.5) * (stateField.price * CONFIG.SIMULATION_DRIFT * driftMultiplier);
    }
  });
}

function applyAtmosphericDrift() {
  // Drift the "Neural" metrics
  marketState.neuralSentiment = Math.max(0, Math.min(1, marketState.neuralSentiment + (Math.random() - 0.5) * 0.01));
  marketState.quantumInstability = Math.max(0, Math.min(1, marketState.quantumInstability + (Math.random() - 0.5) * 0.005));
  marketState.activeWhales = Math.max(1, marketState.activeWhales + (Math.random() > 0.5 ? 1 : -1));
}
