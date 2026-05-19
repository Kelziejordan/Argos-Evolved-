
import { eventBus } from './event-bus/Bus';
import { NexusEvent } from './event-bus/Registry';

/**
 * APPROVAL AUTHORIZATION SYSTEM
 * 
 * Manages token-based approvals for sensitive actions.
 * Ensures the organism doesn't act without explicit human consent when required.
 */

interface ApprovalRequest {
  token: string;
  type: string;
  data: any;
  timestamp: number;
  correlationId: string;
}

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
    }
  }

  public reject(token: string) {
    const request = this.queue.get(token);
    if (request) {
      console.log(`[APPROVAL] Rejected: ${token}`);
      eventBus.dispatch(NexusEvent.APPROVAL_REJECTED, { token, reason: 'USER_REJECTION' }, 'APPROVAL_SYSTEM', request.correlationId);
      this.queue.delete(token);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [token, req] of this.queue.entries()) {
      if (now - req.timestamp > 300000) { // 5 minute expiry
        console.log(`[APPROVAL] Expired: ${token}`);
        this.reject(token);
      }
    }
  }

  public getQueue() {
    return Array.from(this.queue.values());
  }
}

export const approvalSystem = ApprovalSystem.getInstance();
