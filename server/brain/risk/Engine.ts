
import { eventBus } from '../../nervous-system/event-bus/Bus';
import { NexusEvent } from '../../nervous-system/event-bus/Registry';
import { marketState } from '../../anatomy/state';
import { CONFIG } from '../../genetics/config';

/**
 * RISK ENGINE (Immune System)
 * 
 * Validates signals and system state against safety parameters.
 */

export function initializeRiskEngine() {
  console.log("[RISK] Engine initialized. Safeguards engaged.");

  // Listen for signals to validate
  eventBus.on(NexusEvent.SIGNAL_GENERATED, (payload) => {
    validateSignal(payload);
  });

  // Listen for pulse to check system health
  eventBus.on(NexusEvent.PULSE_TICK, () => {
    checkSystemStability();
  });
}

function validateSignal(payload: any) {
  const signal = payload.data;
  
  // Basic sanity checks
  if (marketState.quantumInstability > 0.8) {
    eventBus.dispatch(NexusEvent.SIGNAL_REJECTED, { 
      reason: 'HIGH_INSTABILITY', 
      signalId: signal.id 
    }, 'RISK_ENGINE', payload.correlationId);
    return;
  }

  // If passed all internal checks
  eventBus.dispatch(NexusEvent.RISK_CHECK_PASSED, signal, 'RISK_ENGINE', payload.correlationId);
}

function checkSystemStability() {
  const now = Date.now();

  // 1. Critical Instability -> HALT
  if (marketState.quantumInstability > 0.9) {
    if (marketState.systemStatus !== 'HALTED') {
      marketState.killSwitchActive = true;
      marketState.systemStatus = 'HALTED';
      eventBus.dispatch(NexusEvent.KILL_SWITCH_TRIGGERED, { reason: 'CRITICAL_INSTABILITY' }, 'RISK_ENGINE');
      eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: 'ANY', to: 'HALTED' }, 'RISK_ENGINE');
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
        message: "CRITICAL_INSTABILITY_DETECTED. EMERGENCY_HALT_ENGAGED.", 
        level: "CRITICAL" 
      });
    }
  } 
  
  // 2. Cooldown Logic
  else if (marketState.systemStatus === 'HALTED' && marketState.quantumInstability < 0.7) {
    marketState.systemStatus = 'CAUTION';
    marketState.killSwitchActive = false;
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: 'HALTED', to: 'CAUTION' }, 'RISK_ENGINE');
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: "INSTABILITY_SUBSIDED. SYSTEM_COOLDOWN_ACTIVE.", 
      level: "WARNING" 
    });
  }

  // 3. Normalization logic
  else if (marketState.systemStatus === 'CAUTION' && marketState.quantumInstability < 0.4) {
    marketState.systemStatus = 'NOMINAL';
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: 'CAUTION', to: 'NOMINAL' }, 'RISK_ENGINE');
  }

  // 4. Elevated Warning
  else if (marketState.quantumInstability > 0.7 && marketState.systemStatus === 'NOMINAL') {
    marketState.systemStatus = 'CAUTION';
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: "ELEVATED_INSTABILITY. SYSTEM_CAUTION.", 
      level: "WARNING" 
    });
  }
}

