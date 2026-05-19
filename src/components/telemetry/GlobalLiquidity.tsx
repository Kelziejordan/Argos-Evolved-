import { useNervous } from "../../nervous-system/NervousCore";
import { motion } from "motion/react";

export function GlobalLiquidity() {
  const { marketData } = useNervous();

  return (
    <div className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative p-8">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-nexus-accent mb-2">Global Liquidity Flow</h2>
          <p className="text-xs text-nexus-muted font-mono uppercase">REAL-TIME_NET_EXCHANGE_FLOW</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-white">+$1.42B</p>
          <p className="text-[10px] text-emerald-500 font-mono">NET_INFLOW_24H</p>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col justify-center gap-8">
        <LiquidityStream label="Binance" value={42} flow="in" />
        <LiquidityStream label="Kraken" value={28} flow="in" />
        <LiquidityStream label="Coinbase" value={15} flow="out" />
        <LiquidityStream label="ByBit" value={35} flow="in" />
      </div>

      <div className="mt-8 pt-8 border-t border-nexus-border grid grid-cols-4 gap-4">
        <LiquidityMetric label="Stables" value="680M" />
        <LiquidityMetric label="BTC Volume" value="1.2B" />
        <LiquidityMetric label="ETH Volume" value="450M" />
        <LiquidityMetric label="Whale Count" value={marketData?.activeWhales || 0} />
      </div>
    </div>
  );
}

function LiquidityStream({ label, value, flow }: { label: string, value: number, flow: 'in' | 'out' }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase font-mono text-nexus-log">
        <span>{label}</span>
        <span className={flow === 'in' ? 'text-emerald-500' : 'text-red-500'}>
          {flow === 'in' ? '+' : '-'}{value}% STRENGTH
        </span>
      </div>
      <div className="h-6 bg-nexus-dark rounded group relative overflow-hidden flex items-center px-4">
        <motion.div 
          className={`absolute left-0 top-0 h-full ${flow === 'in' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
        />
        <div className="w-full flex justify-between items-center relative z-10 px-2">
           <div className="flex gap-1">
             {Array.from({ length: 40 }).map((_, i) => (
               <motion.div 
                 key={i}
                 className={`w-1 h-3 rounded-full ${flow === 'in' ? 'bg-emerald-500' : 'bg-red-500'}`}
                 animate={{ 
                   opacity: [0.2, 1, 0.2],
                   x: flow === 'in' ? [0, 10, 0] : [0, -10, 0]
                 }}
                 transition={{ 
                   duration: 1 + Math.random(), 
                   repeat: Infinity,
                   delay: i * 0.05
                 }}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function LiquidityMetric({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="p-3 bg-nexus-dark border border-nexus-border rounded text-center">
      <p className="text-[10px] text-nexus-subtle uppercase mb-1">{label}</p>
      <p className="text-sm font-bold font-mono text-white">{value}</p>
    </div>
  );
}
