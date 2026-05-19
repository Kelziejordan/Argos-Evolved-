import EventEmitter from 'eventemitter3';

export enum NexusEvent {
  PULSE_TICK = 'PULSE_TICK',
  MARKET_UPDATED = 'MARKET_UPDATED',
  SIGNAL_GENERATED = 'SIGNAL_GENERATED',
  MEMORY_SNAPSHOT = 'MEMORY_SNAPSHOT',
  COMMAND_RECEIVED = 'COMMAND_RECEIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

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

  // Helper for logging and emitting
  public dispatch(event: NexusEvent, payload?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NERVOUS_SYSTEM] Event: ${event}`, payload ? '(payload included)' : '');
    }
    this.emit(event, payload);
  }
}

export const eventBus = EventBus.getInstance();
