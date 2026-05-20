import { marketState } from "../../anatomy/state";
import { db } from "../../../src/nervous-system/NervousCore"; 
// For now, internal server-side snapshotting
import fs from 'fs';
import path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots');
const SNAPSHOT_LOG = path.join(SNAPSHOT_DIR, 'organism_snapshots.jsonl');

export const saveSnapshot = (knownGood: boolean = false) => {
  try {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      fs.mkdirSync(SNAPSHOT_DIR);
    }

    const payload = {
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(marketState)), // Deep copy
      knownGood
    };

    const line = JSON.stringify(payload) + '\n';
    fs.appendFileSync(SNAPSHOT_LOG, line);

    // Also keep a "latest" for quick boot
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'latest.json'), JSON.stringify(payload));
    
    if (knownGood) {
      console.log(`[MEMORY] Known-good snapshot saved.`);
    }
  } catch (e) {
    console.error("Memory Snapshot Failed", e);
  }
};

export const loadSnapshot = () => {
  try {
    const latestPath = path.join(SNAPSHOT_DIR, 'latest.json');
    if (fs.existsSync(latestPath)) {
      const data = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));
      console.log(`[MEMORY] Restoring system from latest snapshot: ${new Date(data.timestamp).toISOString()}`);
      return data.state;
    }
  } catch (e) {
    console.warn("Memory Restoration from latest failed, attempting fallback...", e);
  }
  return null;
};

export const loadLastKnownGood = () => {
  try {
    if (!fs.existsSync(SNAPSHOT_LOG)) return null;
    const data = fs.readFileSync(SNAPSHOT_LOG, 'utf-8');
    const lines = data.trim().split('\n').reverse();
    for (const line of lines) {
      const snap = JSON.parse(line);
      if (snap.knownGood) {
        console.log(`[MEMORY] Found last known-good: ${new Date(snap.timestamp).toISOString()}`);
        return snap.state;
      }
    }
  } catch (e) {
    console.error("Failed to load last known-good", e);
  }
  return null;
};
