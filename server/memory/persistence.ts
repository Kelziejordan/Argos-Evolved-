import { marketState } from "../anatomy/state";
import { db } from "../../src/nervous-system/NervousCore"; // We'll move common firebase init later
// For now, internal server-side snapshotting
import fs from 'fs';
import path from 'path';

const SNAPSHOT_PATH = path.join(process.cwd(), 'organism_memory.json');

export const saveSnapshot = () => {
  try {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify({
      timestamp: Date.now(),
      state: marketState
    }));
  } catch (e) {
    console.error("Memory Snapshot Failed", e);
  }
};

export const loadSnapshot = () => {
  try {
    if (fs.existsSync(SNAPSHOT_PATH)) {
      const data = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
      console.log(`[MEMORY] Restoring system from snapshot: ${new Date(data.timestamp).toISOString()}`);
      return data.state;
    }
  } catch (e) {
    console.error("Memory Restoration Failed", e);
  }
  return null;
};
