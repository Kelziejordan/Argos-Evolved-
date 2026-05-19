
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
  public dispatch(type: NexusEvent, data: any, source: string = 'unknown', correlationId?: string) {
    const payload: NexusEventPayload = {
      eventId: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      type,
      source,
      data,
      correlationId: correlationId || `corr_${Math.random().toString(36).substring(2, 7)}`,
      version: '1.1.0'
    };

    // Internal routing
    this.emit(type, payload);
    
    // Also emit a generic 'any' event for global listeners like the Logger
    this.emit('*', payload);
  }
}

export const eventBus = EventBus.getInstance();
