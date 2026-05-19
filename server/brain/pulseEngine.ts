import { CONFIG } from "../genetics/config";
import { eventBus, NexusEvent } from "../nervous-system/EventBus";

let pulseCount = 0;

export function startMarketPulse() {
  console.log("[HEART] Organism heartbeat initialized.");
  
  setInterval(async () => {
    pulseCount++;
    
    // Trigger the tick
    eventBus.dispatch(NexusEvent.PULSE_TICK, { pulseCount });

    // Periodic Memory Snapshot event
    if (pulseCount % 12 === 0) { // Every minute (12 * 5s)
      eventBus.dispatch(NexusEvent.MEMORY_SNAPSHOT);
    }
  }, CONFIG.PULSE_INTERVAL);
}
