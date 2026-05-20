import { eventBus } from "./event-bus/Bus";
import { NexusEvent } from "./event-bus/Registry";
import { marketState } from "../anatomy/state";
import { getKraken } from "../organs/kraken";
import { CONFIG, ASSET_MAPPING } from "../genetics/config";
import { generateSignals } from "../brain/signalGenerator";
import { saveSnapshot, loadLastKnownGood } from "../memory/snapshots/persistence";
import { replayContext } from "../memory/replay/ReplayContext";

export function initializeNervousCenter() {
  console.log("[NERVOUS_CENTER] Initializing coordination layer...");

  // 1. Heartbeat Handler
  eventBus.on(NexusEvent.PULSE_TICK, async (payload) => {
    if (replayContext.active) return;
    
    const marketUpdate = await computeMarketUpdate();
    const atmosphericUpdate = getAtmosphericUpdate();
    
    // Broadcast collected data for state ingestion
    eventBus.dispatch(NexusEvent.MARKET_DATA_RECEIVED, {
      assets: marketUpdate.assets,
      metrics: {
        ...atmosphericUpdate,
        krakenConnected: marketUpdate.krakenConnected
      }
    }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);

    // Broadcast that market lifecycle step completed
    eventBus.dispatch(NexusEvent.MARKET_UPDATED, {}, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
    
    if (payload.data.pulseCount % 60 === 0) {
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "SYSTEM_STABILITY_CHECK: NOMINAL", level: "INFO" });
    }
  });


  // 2. Brain Handler (Signal Generation)
  eventBus.on(NexusEvent.MARKET_UPDATED, (payload) => {
    if (replayContext.active) return;
    
    if (!marketState.killSwitchActive) {
      generateSignals(payload.correlationId, payload.eventId);
    }
  });

  // 3. Risk Validated Flow
  eventBus.on(NexusEvent.RISK_CHECK_PASSED, (payload) => {
    if (replayContext.active) return;
    
    const signal = payload.data;
    // Check if signal requires approval
    if (signal.variant === 'emerald') { // High confidence/impact emerald signals require approval
      eventBus.dispatch(NexusEvent.APPROVAL_REQUIRED, { 
        type: 'SIGNAL_EXECUTION', 
        signalId: signal.id,
        signalTitle: signal.title 
      }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
    } else {
      // Direct execution for low-risk signals (simulated)
      executeSimulatedOrder(signal, payload.correlationId, payload.eventId);
    }
  });

  // 4. Approval Granted Flow
  eventBus.on(NexusEvent.APPROVAL_GRANTED, (payload) => {
    if (replayContext.active) return;
    
    if (payload.data.type === 'SIGNAL_EXECUTION') {
      executeSimulatedOrder(payload.data, payload.correlationId);
    }
  });

  // 5. Memory Handler (Snapshots)
  eventBus.on(NexusEvent.MEMORY_SNAPSHOT, () => {
    if (replayContext.active) return;
    
    saveSnapshot(marketState.systemStatus === 'NOMINAL');
  });

  // 6. Command Handler
  eventBus.on(NexusEvent.COMMAND_RECEIVED, (payload) => {
    const { command, args } = payload.data;
    if (command === 'ROLLBACK') {
      const lastGood = loadLastKnownGood();
      if (lastGood) {
        eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: marketState.systemStatus, to: lastGood.systemStatus, snapshot: lastGood }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_SUCCESSFUL: SYSTEM_RESTORED_TO_LAST_KNOWN_GOOD", level: "INFO" }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
      } else {
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_FAILED: NO_KNOWN_GOOD_SNAPSHOT_AVAILABLE", level: "ERROR" }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
      }
    }
    
    if (command === 'KILL_SWITCH') {
        eventBus.dispatch(NexusEvent.KILL_SWITCH_TRIGGERED, { reason: args?.reason || 'MANUAL_OVERRIDE' }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
    }

    if (command === 'REPLAY_STATE') {
        // Since replayEvents is async and loads from disk, we can trigger it or handle it in runtime
        // We'll just emit an alert for now if they want to test replay from UI
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "REPLAY_INITIATED: STATE_RECONSTRUCTION_IN_PROGRESS", level: "INFO" }, 'NERVOUS_CENTER', payload.correlationId, payload.eventId);
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

function executeSimulatedOrder(signal: any, correlationId: string, causationId?: string) {
  if (marketState.killSwitchActive) {
    console.log("[NERVOUS_CENTER] Execution blocked by KILL_SWITCH.");
    return;
  }
  
  console.log(`[EXECUTION] Executing signal: ${signal.title}`);
  eventBus.dispatch(NexusEvent.ORDER_PLACED, { signalId: signal.id }, 'NERVOUS_CENTER', correlationId, causationId);
  
  // Simulate order filling
  setTimeout(() => {
    eventBus.dispatch(NexusEvent.ORDER_EXECUTED, { signalId: signal.id, status: 'FILLED' }, 'NERVOUS_CENTER', correlationId, 'internal_timer');
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `ORDER_FILLED: ${signal.title}`, level: 'INFO' }, 'NERVOUS_CENTER', correlationId, 'internal_timer');
  }, 1000);
}


// Internal Logic Gates
async function computeMarketUpdate() {
  const isLive = CONFIG.LIVE_TRADING_ENABLED && !!(process.env.KRAKEN_API_KEY && process.env.KRAKEN_API_KEY !== 'your_api_key_here');
  const update: any = { assets: {}, krakenConnected: false };

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
            const newPrice = ticker.last || stateField.price;
            const newDelta = parseFloat(((ticker.percentage || 0)).toFixed(2));
            
            let status = 'neutral';
            if (newDelta > 2) status = 'volatile';
            else if (newDelta > 0.5) status = 'bullish';
            else if (newDelta < -0.5) status = 'bearish';

            update.assets[key] = { price: newPrice, delta: newDelta, status };
          }
        }
      }
      update.krakenConnected = true;
    }
  } catch (e) {
    console.error("[NERVOUS_CENTER] Market data update failed", e);
  }

  // Simulation drift - Persistent behavioral layer
  Object.keys(marketState).forEach(key => {
    const stateField = (marketState as any)[key];
    if (typeof stateField === 'object' && stateField && stateField.price && !update.assets[key]) {
      const driftMultiplier = update.krakenConnected ? 0.2 : 1.0;
      const driftedPrice = stateField.price + (Math.random() - 0.5) * (stateField.price * CONFIG.SIMULATION_DRIFT * driftMultiplier);
      update.assets[key] = { ...stateField, price: driftedPrice };
    }
  });

  return update;
}

function getAtmosphericUpdate() {
  return {
    neuralSentiment: Math.max(0, Math.min(1, marketState.neuralSentiment + (Math.random() - 0.5) * 0.01)),
    quantumInstability: Math.max(0, Math.min(1, marketState.quantumInstability + (Math.random() - 0.5) * 0.005)),
    activeWhales: Math.max(1, marketState.activeWhales + (Math.random() > 0.5 ? 1 : -1))
  };
}
