import { CONFIG } from "../genetics/config";
import { eventBus } from "../nervous-system/event-bus/Bus";
import { NexusEvent } from "../nervous-system/event-bus/Registry";

let pulseCount = 0;

export function startMarketPulse() {
  console.log("[HEART] Organism heartbeat initialized.");
  
  setInterval(async () => {
    pulseCount++;
    
    // Trigger the tick
    eventBus.dispatch(NexusEvent.PULSE_TICK, { pulseCount }, 'PULSE_ENGINE');

    // Periodic Memory Snapshot event
    if (pulseCount % 12 === 0) { // Every minute (12 * 5s)
      eventBus.dispatch(NexusEvent.MEMORY_SNAPSHOT, {}, 'PULSE_ENGINE');
    }
  }, CONFIG.PULSE_INTERVAL);
}

