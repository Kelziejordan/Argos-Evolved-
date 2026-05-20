
import { marketState, Signal, authorizeMutation } from '../anatomy/state';
import { eventBus } from '../nervous-system/event-bus/Bus';
import { NexusEvent, NexusEventPayload } from '../nervous-system/event-bus/Registry';

/**
 * CENTRAL STATE ENGINE (The Thalamus)
 * 
 * The single source of truth for organism state mutations.
 * All state changes MUST route through this engine via the event bus.
 * This ensures determinism, auditability, and clear lineage.
 */

const MUTATION_EVENTS = [
  NexusEvent.MARKET_DATA_RECEIVED,
  NexusEvent.SIGNAL_GENERATED,
  NexusEvent.STATE_TRANSITION,
  NexusEvent.KILL_SWITCH_TRIGGERED,
  NexusEvent.SNAPSHOT_RESTORE
];

class StateEngine {
  private static instance: StateEngine;

  private constructor() {}

  public static getInstance(): StateEngine {
    if (!StateEngine.instance) {
      StateEngine.instance = new StateEngine();
    }
    return StateEngine.instance;
  }

  public initialize() {
    console.log("[STATE_ENGINE] Initializing centralized authority...");

    // Listen only to mutation-eligible events
    MUTATION_EVENTS.forEach(type => {
      eventBus.on(type, (payload: NexusEventPayload) => {
        this.processEvent(payload);
      });
    });
  }

  public processEvent(payload: NexusEventPayload) {
    const { type, data } = payload;

    // Open mutation gate
    authorizeMutation(true);

    try {
      switch (type) {
        case NexusEvent.MARKET_DATA_RECEIVED:
          this.handleMarketUpdate(data);
          break;
        case NexusEvent.SIGNAL_GENERATED:
          this.handleSignalGenerated(data);
          break;
        case NexusEvent.STATE_TRANSITION:
          this.handleStateTransition(data);
          break;
        case NexusEvent.KILL_SWITCH_TRIGGERED:
          marketState.killSwitchActive = true;
          marketState.systemStatus = 'HALTED';
          break;
        case NexusEvent.SNAPSHOT_RESTORE:
          this.handleFullRestore(data);
          break;
      }
    } finally {
      // Close mutation gate
      authorizeMutation(false);
    }
  }

  private handleFullRestore(data: any) {
    console.log("[STATE_ENGINE] Executing Full State Reconstruction...");
    Object.assign(marketState, data);
  }

  private handleMarketUpdate(data: any) {
    if (data.assets) {
      for (const [key, assetData] of Object.entries(data.assets)) {
        const stateAsset = (marketState as any)[key];
        if (stateAsset && assetData) {
          Object.assign(stateAsset, assetData);
        }
      }
    }
    
    if (data.metrics) {
      if (data.metrics.neuralSentiment !== undefined) marketState.neuralSentiment = data.metrics.neuralSentiment;
      if (data.metrics.quantumInstability !== undefined) marketState.quantumInstability = data.metrics.quantumInstability;
      if (data.metrics.activeWhales !== undefined) marketState.activeWhales = data.metrics.activeWhales;
      if (data.metrics.krakenConnected !== undefined) marketState.krakenConnected = data.metrics.krakenConnected;
    }
  }

  private handleSignalGenerated(signal: Signal) {
    // Immuteable-ish update
    marketState.activeSignals = [
      signal,
      ...marketState.activeSignals.slice(0, 4)
    ];
  }

  private handleStateTransition(data: any) {
    if (data.snapshot) {
      // Full state reconstruction via snapshot in transition
      Object.assign(marketState, data.snapshot);
      return;
    }

    if (data.to) {
      const from = marketState.systemStatus;
      const to = data.to;

      // 1. Validation Logic (Immune System check)
      if (!this.isTransitionLegal(from, to)) {
        console.error(`[STATE_ENGINE] ILLEGAL_TRANSITION_REJECTED: ${from} -> ${to}`);
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
          message: `ILLEGAL_TRANSITION_REJECTED: ${from} -> ${to}. REVERTING_TO_STABLE_STATE.`, 
          level: "CRITICAL" 
        }, 'STATE_ENGINE');
        return;
      }

      marketState.systemStatus = to;
      if (to === 'HALTED') marketState.killSwitchActive = true;
      if (to === 'NOMINAL') marketState.killSwitchActive = false;
      
      if (data.cooldownExpiry !== undefined) {
        marketState.cooldownExpiry = data.cooldownExpiry;
      }
    }
  }

  private isTransitionLegal(from: string, to: string): boolean {
    if (from === to) return true;
    
    // Global HALT is always legal from any state
    if (to === 'HALTED') return true;

    // Transition Matrix
    switch (from) {
      case 'NOMINAL':
        return to === 'CAUTION'; // Must go to CAUTION if stability drops
      case 'CAUTION':
        return to === 'NOMINAL' || to === 'HALTED';
      case 'HALTED':
        return to === 'COOLDOWN'; // MUST go to cooldown before normalization
      case 'COOLDOWN':
        return to === 'CAUTION' || to === 'HALTED'; // Can normalization or re-halt
      default:
        return false;
    }
  }
}

export const stateEngine = StateEngine.getInstance();
