import * as ccxt from 'ccxt';

let krakenClient: any = null;

export const getKraken = () => {
  if (!krakenClient) {
    const apiKey = process.env.KRAKEN_API_KEY;
    const secret = process.env.KRAKEN_SECRET_KEY;
    
    try {
      krakenClient = new (ccxt as any).kraken({
        apiKey: apiKey && apiKey !== 'your_api_key_here' ? apiKey : undefined,
        secret: secret && secret !== 'your_secret_key_here' ? secret : undefined,
      });
    } catch (e) {
      console.error("Kraken init failed", e);
      return null;
    }
  }
  return krakenClient;
};
