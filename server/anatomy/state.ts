
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
  krakenConnected: boolean;
  activeSignals: Signal[];
}

export let marketState: MarketState = {
  btc: { price: 68422.50, delta: 0.15, status: 'neutral' },
  eth: { price: 3521.12, delta: -0.42, status: 'neutral' },
  sol: { price: 142.88, delta: 1.25, status: 'bullish' },
  dot: { price: 7.24, delta: 0.05, status: 'neutral' },
  link: { price: 18.12, delta: -2.1, status: 'bearish' },
  ada: { price: 0.45, delta: 0.8, status: 'neutral' },
  xrp: { price: 0.52, delta: -0.1, status: 'neutral' },
  neuralSentiment: 0.84,
  quantumInstability: 0.12,
  activeWhales: 14,
  krakenConnected: false,
  activeSignals: [
    { id: 1, title: 'BTC_BULL_BREAK', desc: 'Heavy whale accumulation detected.', variant: 'emerald', time: 'NOW' },
    { id: 2, title: 'SOL_LIQUIDITY', desc: 'Order flow imbalance on SOL pairs.', variant: 'amber', time: '2m' }
  ]
};

export const updateMarketState = (newState: Partial<MarketState>) => {
  marketState = { ...marketState, ...newState };
};
