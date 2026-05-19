
import { initializeNervousCenter } from '../nervous-system/NervousCenter';
import { startMarketPulse } from '../brain/pulseEngine';
import { initializeEventLogger } from '../memory/events/Logger';
import { initializeRiskEngine } from '../brain/risk/Engine';
import { approvalSystem } from '../nervous-system/ApprovalSystem';
import { loadSnapshot } from '../memory/persistence';
import { marketState } from '../anatomy/state';
import { eventBus } from '../nervous-system/event-bus/Bus';
import { NexusEvent } from '../nervous-system/event-bus/Registry';

/**
 * ORGANISM RUNTIME
 * 
 * The master lifecycle controller. Orchestrates startup and coordination.
 */

export async function bootOrganism() {
  console.log("-----------------------------------------");
  console.log("   HYPERBOT v2.0 - ORGANISM BOOT_SEQ    ");
  console.log("-----------------------------------------");

  // 1. Initialize Sensory Logging (Digital Continuity)
  initializeEventLogger();

  // 2. Load Memory Snapshot
  const savedState = loadSnapshot();
  if (savedState) {
    Object.assign(marketState, savedState);
    console.log("[BOOT] State restored from persistence.");
  }

  // 3. Initialize Nervous Architecture (Spinal Cord & Brain Wiring)
  initializeNervousCenter();
  initializeRiskEngine();

  // 4. Start Heartbeat (Pulse)
  startMarketPulse();

  eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ORGANISM_BOOT_COMPLETE", level: "INFO" });
  console.log("[BOOT] Organism is now ALIVE.");
}
