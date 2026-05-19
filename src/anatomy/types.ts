
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface PairState {
  price: number;
  delta: number;
  status: 'bullish' | 'bearish' | 'neutral' | 'volatile';
}

export interface Signal {
  id: number;
  title: string;
  desc: string;
  variant: 'emerald' | 'amber' | 'red';
  time: string;
}

export interface MarketState {
  btc: PairState;
  eth: PairState;
  sol: PairState;
  dot: PairState;
  link: PairState;
  ada: PairState;
  xrp: PairState;
  neuralSentiment: number;
  quantumInstability: number;
  activeWhales: number;
  krakenConnected?: boolean;
  activeSignals?: Signal[];
}

export interface Trade {
  id?: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  price: number;
  quantity: number;
  status: string;
  timestamp: any;
  pnl?: number;
}
