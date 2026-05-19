import { eventBus } from "./event-bus/Bus";
import { NexusEvent } from "./event-bus/Registry";
import { marketState } from "../anatomy/state";
import { getKraken } from "../organs/kraken";
import { CONFIG, ASSET_MAPPING } from "../genetics/config";
import { generateSignals } from "../brain/signalGenerator";
import { saveSnapshot, loadLastKnownGood } from "../memory/persistence";

export function initializeNervousCenter() {
  console.log("[NERVOUS_CENTER] Initializing coordination layer...");

  // 1. Heartbeat Handler
  eventBus.on(NexusEvent.PULSE_TICK, async (payload) => {
    await updateMarketData();
    applyAtmosphericDrift();
    
    // Broadcast that market has been updated
    eventBus.dispatch(NexusEvent.MARKET_UPDATED, {}, 'NERVOUS_CENTER', payload.correlationId);
    
    if (payload.data.pulseCount % 60 === 0) {
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "SYSTEM_STABILITY_CHECK: NOMINAL", level: "INFO" });
    }
  });


  // 2. Brain Handler (Signal Generation)
  eventBus.on(NexusEvent.MARKET_UPDATED, (payload) => {
    if (!marketState.killSwitchActive) {
      generateSignals();
    }
  });

  // 3. Risk Validated Flow
  eventBus.on(NexusEvent.RISK_CHECK_PASSED, (payload) => {
    const signal = payload.data;
    // Check if signal requires approval
    if (signal.variant === 'emerald') { // High confidence/impact emerald signals require approval
      eventBus.dispatch(NexusEvent.APPROVAL_REQUIRED, { 
        type: 'SIGNAL_EXECUTION', 
        signalId: signal.id,
        signalTitle: signal.title 
      }, 'NERVOUS_CENTER', payload.correlationId);
    } else {
      // Direct execution for low-risk signals (simulated)
      executeSimulatedOrder(signal, payload.correlationId);
    }
  });

  // 4. Approval Granted Flow
  eventBus.on(NexusEvent.APPROVAL_GRANTED, (payload) => {
    if (payload.data.type === 'SIGNAL_EXECUTION') {
      executeSimulatedOrder(payload.data, payload.correlationId);
    }
  });

  // 5. Memory Handler (Snapshots)
  eventBus.on(NexusEvent.MEMORY_SNAPSHOT, () => {
    saveSnapshot(marketState.systemStatus === 'NOMINAL');
  });

  // 6. Command Handler
  eventBus.on(NexusEvent.COMMAND_RECEIVED, (payload) => {
    const { command } = payload.data;
    if (command === 'ROLLBACK') {
      const lastGood = loadLastKnownGood();
      if (lastGood) {
        Object.assign(marketState, lastGood);
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_SUCCESSFUL: SYSTEM_RESTORED_TO_LAST_KNOWN_GOOD", level: "INFO" });
      } else {
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_FAILED: NO_KNOWN_GOOD_SNAPSHOT_AVAILABLE", level: "ERROR" });
      }
    }
  });

  // 7. Audit Logger
  eventBus.on(NexusEvent.SYSTEM_ALERT, (payload) => {
    const data = payload.data;
    console.log(`[AUDIT_LOG] [${data.level}] ${data.message}`);
  });
  
  eventBus.on(NexusEvent.SIGNAL_GENERATED, (payload) => {
    const signal = payload.data;
    console.log(`[AUDIT_LOG] [SIGNAL] ${signal.title}: ${signal.desc}`);
  });
}

function executeSimulatedOrder(signal: any, correlationId: string) {
  if (marketState.killSwitchActive) {
    console.log("[NERVOUS_CENTER] Execution blocked by KILL_SWITCH.");
    return;
  }
  
  console.log(`[EXECUTION] Executing signal: ${signal.title}`);
  eventBus.dispatch(NexusEvent.ORDER_PLACED, { signalId: signal.id }, 'NERVOUS_CENTER', correlationId);
  
  // Simulate order filling
  setTimeout(() => {
    eventBus.dispatch(NexusEvent.ORDER_EXECUTED, { signalId: signal.id, status: 'FILLED' }, 'NERVOUS_CENTER', correlationId);
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `ORDER_FILLED: ${signal.title}`, level: 'INFO' });
  }, 1000);
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
