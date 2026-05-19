
export const CONFIG = {
  PULSE_INTERVAL: 5000,
  MARKET_SYMBOLS: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOT/USDT', 'LINK/USDT', 'ADA/USDT', 'XRP/USDT'],
  DEFAULT_AGGRESSION: 0.85,
  SIMULATION_DRIFT: 0.0001,
  SIGNAL_PROBABILITY: 0.15,
  LIVE_TRADING_ENABLED: false, // FIREWALL: Default to safe mode
  ALLOWED_EXCHANGES: ["Binance", "Bybit", "OKX"],
  ALLOWED_INSTRUMENTS: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  MAX_LEVERAGE: 3,
  APPROVAL_THRESHOLD: 0.05
};

export const ASSET_MAPPING: Record<string, string> = {
  'BTC/USDT': 'btc',
  'ETH/USDT': 'eth',
  'SOL/USDT': 'sol',
  'DOT/USDT': 'dot',
  'LINK/USDT': 'link',
  'ADA/USDT': 'ada',
  'XRP/USDT': 'xrp'
};
