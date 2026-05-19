import { marketState, Signal } from "../anatomy/state";
import { CONFIG } from "../genetics/config";
import { eventBus } from "../nervous-system/event-bus/Bus";
import { NexusEvent } from "../nervous-system/event-bus/Registry";

export const generateSignals = () => {
  if (Math.random() > (1 - CONFIG.SIGNAL_PROBABILITY)) {
    const assets = ['BTC', 'ETH', 'SOL', 'DOT', 'ADA', 'XRP', 'LINK'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const types: Omit<Signal, 'id' | 'time'>[] = [
      { title: `${asset}_VOLATILITY`, desc: 'Unusual volume spike detected.', variant: 'amber' },
      { title: `${asset}_SQUEEZE`, desc: 'Short liquidations imminent.', variant: 'emerald' },
      { title: `${asset}_DUMP_RISK`, desc: 'Sell pressure increasing.', variant: 'red' }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const newSignal: Signal = {
      id: Date.now(),
      ...type,
      time: 'NOW'
    };

    marketState.activeSignals = [
      newSignal,
      ...marketState.activeSignals.slice(0, 4)
    ];
    
    eventBus.dispatch(NexusEvent.SIGNAL_GENERATED, newSignal, 'BRAIN_SIGNAL_GENERATOR');
    return newSignal;
  }
  return null;
};
