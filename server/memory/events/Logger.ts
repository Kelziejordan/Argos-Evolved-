
import fs from 'fs';
import path from 'path';
import { eventBus } from '../../nervous-system/event-bus/Bus';
import { NexusEventPayload } from '../../nervous-system/event-bus/Registry';
import { replayContext } from '../replay/ReplayContext';

/**
 * PERSISTENT EVENT LOGGER
 * 
 * Writes every event to an append-only JSONL file.
 * This ensures digital continuity and auditability.
 */

const LOG_DIR = path.join(process.cwd(), 'logs');
const EVENT_LOG = path.join(LOG_DIR, 'organism_events.jsonl');

export function initializeEventLogger() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }

  console.log(`[MEMORY] Event Logger active. Target: ${EVENT_LOG}`);

  // Listen to the wildcard event for all activity
  eventBus.on('*', (payload: NexusEventPayload) => {
    // Audit protection: Do NOT log replayed events or we'll get infinite feedback loops or duplicate history.
    if (replayContext.active) return;
    
    appendToLog(payload);
  });
}

function appendToLog(payload: NexusEventPayload) {
  try {
    const line = JSON.stringify(payload) + '\n';
    fs.appendFileSync(EVENT_LOG, line);
  } catch (e) {
    console.error("[MEMORY] Failed to append to event log", e);
  }
}

/**
 * Replay engine skeleton (Phase 2 candidate)
 */
export async function getRecentEvents(limit: number = 100): Promise<NexusEventPayload[]> {
  try {
    if (!fs.existsSync(EVENT_LOG)) return [];
    const data = fs.readFileSync(EVENT_LOG, 'utf-8');
    const lines = data.trim().split('\n');
    return lines.slice(-limit).map(l => JSON.parse(l));
  } catch (e) {
    return [];
  }
}
