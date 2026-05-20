
/**
 * REPLAY CONTEXT
 * 
 * Global sentinel for detecting if the organism is currently 
 * reconstructing state from historical events.
 * 
 * Used to suppress side effects (external orders, live alerts, logging).
 */

class ReplayContext {
  private static instance: ReplayContext;
  private _isReplaying: boolean = false;

  private constructor() {}

  public static getInstance(): ReplayContext {
    if (!ReplayContext.instance) {
      ReplayContext.instance = new ReplayContext();
    }
    return ReplayContext.instance;
  }

  public get active(): boolean {
    return this._isReplaying;
  }

  public set active(val: boolean) {
    this._isReplaying = val;
  }
}

export const replayContext = ReplayContext.getInstance();
