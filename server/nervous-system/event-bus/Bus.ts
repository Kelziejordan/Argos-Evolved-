
import EventEmitter from 'eventemitter3';
import { NexusEvent, NexusEventPayload } from './Registry';

/**
 * HARDENED EVENT BUS (The Spinal Cord)
 * 
 * Central routing for all organism communications.
 * Includes correlation IDs for tracking event chains across subsystems.
 */

class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Dispatch a typed event with payload
   */
  public dispatch(type: NexusEvent, data: any, source: string = 'unknown', correlationId?: string, causationId?: string) {
    this.checkEventStorm();

    const payload: NexusEventPayload = {
      eventId: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      type,
      source,
      data,
      correlationId: correlationId || `corr_${Math.random().toString(36).substring(2, 7)}`,
      causationId: causationId,
      version: '1.2.0'
    };

    // Internal routing
    this.emit(type, payload);
    
    // Also emit a generic 'any' event for global listeners like the Logger
    this.emit('*', payload);
  }

  // --- IMMUNE SYSTEM: EVENT STORM PROTECTION ---
  private eventCount = 0;
  private lastReset = Date.now();
  private readonly STORM_THRESHOLD = 200; // max events per second
  private stormAlerted = false;

  private checkEventStorm() {
    const now = Date.now();
    if (now - this.lastReset > 1000) {
      if (this.eventCount > this.STORM_THRESHOLD) {
        console.warn(`[EVENT_BUS] STORM_DETECTED: ${this.eventCount} events/sec`);
      }
      this.eventCount = 0;
      this.lastReset = now;
      this.stormAlerted = false;
    }

    this.eventCount++;

    if (this.eventCount > this.STORM_THRESHOLD && !this.stormAlerted) {
      this.stormAlerted = true;
      // Self-protection: dispatch alert directly if threshold exceeded
      // We use a internal emit to avoid infinite loops if the alert itself triggers more events
      this.emit(NexusEvent.SYSTEM_ALERT, { 
        eventId: 'internal_storm', 
        timestamp: Date.now(), 
        type: NexusEvent.SYSTEM_ALERT, 
        source: 'EVENT_BUS', 
        data: { message: "CRITICAL: EVENT_STORM_DETECTED. RATE_LIMITING_COMMUNICATION.", level: "CRITICAL" },
        version: '1.2.0'
      });
    }
  }
}

export const eventBus = EventBus.getInstance();
