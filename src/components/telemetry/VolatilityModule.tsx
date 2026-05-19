import { useNervous } from "../../nervous-system/NervousCore";
import { motion } from "motion/react";

export function VolatilityModule() {
  const { marketData } = useNervous();

  return (
    <div className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative p-8">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-amber-500 mb-2">Volatility Index</h2>
          <p className="text-xs text-nexus-muted font-mono uppercase">VIX_DATA_CONVERGENCE</p>
        </div>
        <div className="flex gap-4">
          <StatusIndicator label="Network" status="Optimal" />
          <StatusIndicator label="Jitter" status="Low" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase text-nexus-subtle tracking-widest border-b border-nexus-border pb-2">Market Variance</h3>
          <VolatilityCard label="BTC/USD" value={marketData?.btc.delta || 0} />
          <VolatilityCard label="ETH/USD" value={marketData?.eth.delta || 0} />
          <VolatilityCard label="SOL/USD" value={marketData?.sol.delta || 0} />
        </div>

        <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-border flex flex-col">
          <h3 className="text-[10px] font-bold uppercase text-nexus-subtle tracking-widest mb-4">Frequency Spectrum</h3>
          <div className="flex-1 flex items-end gap-1 px-4">
            {Array.from({ length: 48 }).map((_, i) => (
              <motion.div 
                key={i}
                className="flex-1 bg-nexus-accent/40 rounded-t-[1px]"
                animate={{ 
                  height: [`${10 + Math.random() * 40}%`, `${40 + Math.random() * 60}%`, `${10 + Math.random() * 30}%`]
                }}
                transition={{ 
                  duration: 0.5 + Math.random() * 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[8px] font-mono text-nexus-log uppercase">
            <span>20Hz</span>
            <span>Spectral_Analysis</span>
            <span>20kHz</span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-center gap-4">
        <div className="p-2 bg-amber-500/20 rounded text-amber-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">High Volatility Alert</p>
          <p className="text-[10px] text-nexus-muted font-mono">Neural drift detected in altcoin clusters. Risk shield recommended.</p>
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ label, status }: { label: string, status: string }) {
  return (
    <div className="text-right">
      <p className="text-[9px] uppercase text-nexus-muted tracking-wide">{label}</p>
      <p className="text-[10px] font-bold text-emerald-500 uppercase">{status}</p>
    </div>
  );
}

function VolatilityCard({ label, value }: { label: string, value: number }) {
  const intensity = Math.abs(value) * 10;
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-1 h-8 rounded-full ${value >= 0 ? 'bg-emerald-500' : 'bg-red-500'} opacity-40 shadow-[0_0_8px_currentColor]`} />
      <div className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-nexus-border rounded-full overflow-hidden">
             <motion.div 
               className={`h-full ${value >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(100, intensity)}%` }}
             />
          </div>
          <span className="text-[9px] font-mono text-nexus-log">{value.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
