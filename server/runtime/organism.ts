
import { initializeNervousCenter } from '../nervous-system/NervousCenter';
import { startMarketPulse } from '../brain/pulseEngine';
import { initializeEventLogger } from '../memory/events/Logger';
import { initializeRiskEngine } from '../brain/risk/Engine';
import { approvalSystem } from '../organs/approval/ApprovalSystem';
import { replayEvents } from '../memory/replay/ReplayEngine';
import { loadSnapshot } from '../memory/snapshots/persistence';
import { marketState } from '../anatomy/state';
import { eventBus } from '../nervous-system/event-bus/Bus';
import { NexusEvent } from '../nervous-system/event-bus/Registry';
import { stateEngine } from './StateEngine';

/**
 * ORGANISM RUNTIME
 * 
 * The master lifecycle controller. Orchestrates startup and coordination.
 */

export async function bootOrganism() {
  console.log("-----------------------------------------");
  console.log("   argOS v1.1 - ORGANISM BOOT_SEQ       ");
  console.log("-----------------------------------------");

  // 1. Initialize State Authority (The Thalamus)
  stateEngine.initialize();

  // 2. Initialize Sensory Logging (Digital Continuity)
  initializeEventLogger();

  // 3. Load Memory Snapshot (State Reconstruction)
  const savedState = loadSnapshot();
  if (savedState) {
    eventBus.dispatch(NexusEvent.SNAPSHOT_RESTORE, savedState, 'BOOT_LOADER');
    console.log("[BOOT] State restoration event dispatched.");
  }

  // 4. Replay Events (Continuity Gap Fill)
  await replayEvents();

  // 5. Initialize Nervous Architecture (Spinal Cord & Brain Wiring)
  initializeNervousCenter();
  initializeRiskEngine();

  // 6. Start Heartbeat (Pulse)
  startMarketPulse();

  eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ORGANISM_BOOT_COMPLETE", level: "INFO" });
  console.log("[BOOT] Organism is now ALIVE and CONTINUOUS.");
}
