import { CONFIG } from "../genetics/config";
import { eventBus } from "../nervous-system/event-bus/Bus";
import { NexusEvent } from "../nervous-system/event-bus/Registry";

let pulseCount = 0;

export function startMarketPulse() {
  console.log("[HEART] Organism heartbeat initialized.");
  
  setInterval(async () => {
    pulseCount++;
    
    const correlationId = `tick-${Date.now()}-${pulseCount}`;
    
    // Trigger the tick with a root correlation ID
    eventBus.dispatch(NexusEvent.PULSE_TICK, { pulseCount }, 'PULSE_ENGINE', correlationId);

    // Periodic Memory Snapshot event
    if (pulseCount % 12 === 0) { // Every minute (12 * 5s)
      eventBus.dispatch(NexusEvent.MEMORY_SNAPSHOT, {}, 'PULSE_ENGINE');
    }
  }, CONFIG.PULSE_INTERVAL);
}

