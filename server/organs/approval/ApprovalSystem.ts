
import fs from 'fs';
import path from 'path';
import { eventBus } from '../../nervous-system/event-bus/Bus';
import { NexusEvent } from '../../nervous-system/event-bus/Registry';

/**
 * APPROVAL AUTHORIZATION SYSTEM
 * 
 * Manages token-based approvals for sensitive actions.
 * Ensures the organism doesn't act without explicit human consent when required.
 * Persists queue to JSONL for digital continuity.
 */

interface ApprovalRequest {
  token: string;
  type: string;
  data: any;
  timestamp: number;
  correlationId: string;
}

const QUEUE_FILE = path.join(process.cwd(), 'logs', 'approval_queue.jsonl');

class ApprovalSystem {
  private static instance: ApprovalSystem;
  private queue: Map<string, ApprovalRequest> = new Map();

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ApprovalSystem {
    if (!ApprovalSystem.instance) {
      ApprovalSystem.instance = new ApprovalSystem();
    }
    return ApprovalSystem.instance;
  }

  private initialize() {
    console.log("[APPROVAL] System initialized.");
    this.loadQueue();

    // Listen for approval requirements
    eventBus.on(NexusEvent.APPROVAL_REQUIRED, (payload) => {
      this.addRequest(payload);
    });

    // Listen for manual commands to approve/reject
    eventBus.on(NexusEvent.COMMAND_RECEIVED, (payload) => {
      const { command, args } = payload.data;
      if (command === 'APPROVE' && args?.token) {
        this.approve(args.token);
      } else if (command === 'REJECT' && args?.token) {
        this.reject(args.token);
      }
    });

    // Periodic cleanup of expired approvals
    setInterval(() => this.cleanup(), 60000);
  }

  private loadQueue() {
    try {
      if (fs.existsSync(QUEUE_FILE)) {
        const lines = fs.readFileSync(QUEUE_FILE, 'utf-8').trim().split('\n');
        lines.forEach(line => {
          if (!line) return;
          const req: ApprovalRequest = JSON.parse(line);
          if (Date.now() - req.timestamp < 300000) { // Only load non-expired
             this.queue.set(req.token, req);
          }
        });
        console.log(`[APPROVAL] Restored ${this.queue.size} pending requests.`);
      }
    } catch (e) {
      console.error("[APPROVAL] Failed to load queue", e);
    }
  }

  private persistQueue() {
    try {
      const dir = path.dirname(QUEUE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const content = Array.from(this.queue.values())
        .map(req => JSON.stringify(req))
        .join('\n') + '\n';
      
      fs.writeFileSync(QUEUE_FILE, content);
    } catch (e) {
      console.error("[APPROVAL] Failed to persist queue", e);
    }
  }

  private addRequest(payload: any) {
    const token = Math.random().toString(36).substring(2, 15);
    const request: ApprovalRequest = {
      token,
      type: payload.data.type,
      data: payload.data,
      timestamp: Date.now(),
      correlationId: payload.correlationId
    };

    this.queue.set(token, request);
    this.persistQueue();
    console.log(`[APPROVAL] Request queued. Token: ${token} | Type: ${request.type}`);
    
    // Broadcast for UI
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: `ACTION_REQUIRES_APPROVAL: ${request.type}. Token: ${token}`, 
      level: 'WARNING',
      token
    }, 'APPROVAL_SYSTEM', payload.correlationId);
  }

  public approve(token: string) {
    const request = this.queue.get(token);
    if (request) {
      console.log(`[APPROVAL] Authorized: ${token}`);
      eventBus.dispatch(NexusEvent.APPROVAL_GRANTED, request.data, 'APPROVAL_SYSTEM', request.correlationId);
      this.queue.delete(token);
      this.persistQueue();
    }
  }

  public reject(token: string) {
    const request = this.queue.get(token);
    if (request) {
      console.log(`[APPROVAL] Rejected: ${token}`);
      eventBus.dispatch(NexusEvent.APPROVAL_REJECTED, { token, reason: 'USER_REJECTION' }, 'APPROVAL_SYSTEM', request.correlationId);
      this.queue.delete(token);
      this.persistQueue();
    }
  }

  private cleanup() {
    const now = Date.now();
    let changed = false;
    for (const [token, req] of this.queue.entries()) {
      if (now - req.timestamp > 300000) { // 5 minute expiry
        console.log(`[APPROVAL] Expired: ${token}`);
        this.queue.delete(token);
        changed = true;
      }
    }
    if (changed) this.persistQueue();
  }

  public getQueue() {
    return Array.from(this.queue.values());
  }
}

export const approvalSystem = ApprovalSystem.getInstance();
