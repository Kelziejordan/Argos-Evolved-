
import { eventBus } from '../../nervous-system/event-bus/Bus';
import { NexusEvent } from '../../nervous-system/event-bus/Registry';
import { marketState } from '../../anatomy/state';

/**
 * GLOBAL KILL SWITCH
 * 
 * Immediate cessation of all autonomous activity.
 */

export function triggerGlobalKillSwitch(reason: string, correlationId?: string) {
  console.log(`[KILL_SWITCH] TRIGGERED: ${reason}`);
  
  eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
    from: marketState.systemStatus, 
    to: 'HALTED', 
    reason,
    cooldownExpiry: null
  }, 'KILL_SWITCH', correlationId);

  eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
    message: `GLOBAL_HALT_ACTIVATED: ${reason}`, 
    level: "CRITICAL" 
  }, 'KILL_SWITCH', correlationId);
}

export function resetKillSwitch() {
  if (marketState.quantumInstability < 0.7) {
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
      from: 'HALTED', 
      to: 'NOMINAL' 
    }, 'KILL_SWITCH');
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "GLOBAL_HALT_LIFTED", level: "INFO" });
  }
}
