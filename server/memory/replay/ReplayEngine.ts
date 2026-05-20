
import fs from 'fs';
import path from 'path';
import { NexusEvent, NexusEventPayload } from '../../nervous-system/event-bus/Registry';
import { stateEngine } from '../../runtime/StateEngine';
import { replayContext } from './ReplayContext';
import { eventBus } from '../../nervous-system/event-bus/Bus';

/**
 * EVENT REPLAY ENGINE (Digital Continuity)
 * 
 * Reconstructs the organism's state by replaying persistent event logs.
 * This ensures the organism has "narrative memory" beyond simple snapshots.
 */

const EVENT_LOG = path.join(process.cwd(), 'logs', 'organism_events.jsonl');

export async function replayEvents() {
  console.log("[MEMORY] Starting Event Replay...");
  
  if (!fs.existsSync(EVENT_LOG)) {
    console.log("[MEMORY] No event log found. Starting fresh.");
    return;
  }

  try {
    replayContext.active = true;
    eventBus.dispatch(NexusEvent.REPLAY_STARTED, {}, 'REPLAY_ENGINE');

    const data = fs.readFileSync(EVENT_LOG, 'utf-8');
    const lines = data.trim().split('\n');
    let replayedCount = 0;

    for (const line of lines) {
      if (!line) continue;
      const event: NexusEventPayload = JSON.parse(line);
      stateEngine.processEvent(event);
      replayedCount++;
    }

    eventBus.dispatch(NexusEvent.REPLAY_COMPLETED, { count: replayedCount }, 'REPLAY_ENGINE');
    console.log(`[MEMORY] Replay complete. ${replayedCount} events integrated.`);
  } catch (e) {
    console.error("[MEMORY] Replay failed", e);
  } finally {
    replayContext.active = false;
  }
}
