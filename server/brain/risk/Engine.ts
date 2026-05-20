
import { eventBus } from '../../nervous-system/event-bus/Bus';
import { NexusEvent } from '../../nervous-system/event-bus/Registry';
import { marketState } from '../../anatomy/state';
import { CONFIG } from '../../genetics/config';
import { triggerGlobalKillSwitch } from './kill-switch';
import { replayContext } from '../../memory/replay/ReplayContext';

/**
 * RISK ENGINE (Immune System)
 * 
 * Validates signals and system state against safety parameters.
 */

export function initializeRiskEngine() {
  console.log("[RISK] Engine initialized. Safeguards engaged.");

  // Listen for signals to validate
  eventBus.on(NexusEvent.SIGNAL_GENERATED, (payload) => {
    if (replayContext.active) return;
    validateSignal(payload);
  });

  // Listen for pulse to check system health
  eventBus.on(NexusEvent.PULSE_TICK, (payload) => {
    if (replayContext.active) return;
    updateWatchdog(payload.correlationId, payload.eventId);
    checkSystemStability(payload.correlationId, payload.eventId);
  });

  startPulseWatchdog();
}

let lastPulseTime = Date.now();
let heartbeatStalled = false;

function updateWatchdog(correlationId?: string, causationId?: string) {
  if (heartbeatStalled) {
    heartbeatStalled = false;
    eventBus.dispatch(NexusEvent.HEARTBEAT_RESUMED, { lastGapMs: Date.now() - lastPulseTime }, 'RISK_ENGINE', correlationId, causationId);
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "HEARTBEAT_RESUMED: ORGANISM_PULSE_RESTORED", level: "INFO" }, 'RISK_ENGINE', correlationId, causationId);
  }
  lastPulseTime = Date.now();
}

function startPulseWatchdog() {
  setInterval(() => {
    if (replayContext.active) return;
    
    const now = Date.now();
    const gap = now - lastPulseTime;
    
    // If pulse interval is 5000ms, missing 3 cycles (15s) is a failure
    if (gap > (CONFIG.PULSE_INTERVAL * 3) && !heartbeatStalled) {
      heartbeatStalled = true;
      console.error(`[RISK_ENGINE] HEARTBEAT_STALLED! Gap: ${gap}ms`);
      eventBus.dispatch(NexusEvent.HEARTBEAT_STALLED, { gapMs: gap }, 'RISK_ENGINE');
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
        message: `HEARTBEAT_STALLED: NO_PULSE_DETECTED_FOR_${Math.floor(gap/1000)}s. CHECKING_CORE_LIFECYCLE.`, 
        level: "CRITICAL" 
      });
    }
  }, 10000); // Check every 10s
}

function validateSignal(payload: any) {
  const signal = payload.data;
  
  // Basic sanity checks
  if (marketState.quantumInstability > 0.8) {
    eventBus.dispatch(NexusEvent.SIGNAL_REJECTED, { 
      reason: 'HIGH_INSTABILITY', 
      signalId: signal.id 
    }, 'RISK_ENGINE', payload.correlationId, payload.eventId);
    return;
  }

  // If passed all internal checks
  eventBus.dispatch(NexusEvent.RISK_CHECK_PASSED, signal, 'RISK_ENGINE', payload.correlationId, payload.eventId);
}

function checkSystemStability(correlationId?: string, causationId?: string) {
  const now = Date.now();

  // 1. Critical Instability -> HALT
  if (marketState.quantumInstability > 0.9) {
    if (marketState.systemStatus !== 'HALTED') {
      triggerGlobalKillSwitch('CRITICAL_INSTABILITY_DETECTED', correlationId, causationId);
    }
  } 
  
  // 2. Transition from HALT to COOLDOWN
  else if (marketState.systemStatus === 'HALTED' && marketState.quantumInstability < 0.7) {
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
      from: 'HALTED', 
      to: 'COOLDOWN', 
      cooldownExpiry: now + 120000 
    }, 'RISK_ENGINE', correlationId, causationId);
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: "INSTABILITY_SUBSIDED. ENTERING_COOLDOWN_PERIOD (120s).", 
      level: "WARNING" 
    }, 'RISK_ENGINE', correlationId, causationId);
  }

  // 3. Cooldown monitoring
  else if (marketState.systemStatus === 'COOLDOWN') {
    if (marketState.cooldownExpiry && now >= marketState.cooldownExpiry) {
      eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
        from: 'COOLDOWN', 
        to: 'CAUTION',
        cooldownExpiry: null
      }, 'RISK_ENGINE', correlationId, causationId);
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
        message: "COOLDOWN_COMPLETE. SYSTEM_RETURNED_TO_CAUTION.", 
        level: "INFO" 
      }, 'RISK_ENGINE', correlationId, causationId);
    } else if (marketState.quantumInstability > 0.8) {
      // Re-trigger halt if instability spikes during cooldown
      eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
        from: 'COOLDOWN', 
        to: 'HALTED',
        cooldownExpiry: null 
      }, 'RISK_ENGINE', correlationId, causationId);
    }
  }

  // 4. Normalization logic
  else if (marketState.systemStatus === 'CAUTION' && marketState.quantumInstability < 0.4) {
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: 'CAUTION', to: 'NOMINAL' }, 'RISK_ENGINE', correlationId, causationId);
  }

  // 5. Elevated Warning
  else if (marketState.quantumInstability > 0.7 && marketState.systemStatus === 'NOMINAL') {
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: 'NOMINAL', to: 'CAUTION' }, 'RISK_ENGINE', correlationId, causationId);
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: "ELEVATED_INSTABILITY. SYSTEM_CAUTION.", 
      level: "WARNING" 
    }, 'RISK_ENGINE', correlationId, causationId);
  }
}

