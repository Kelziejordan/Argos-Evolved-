import { motion } from "motion/react";

export function LiquidationMap() {
  return (
    <div className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-red-500 mb-2">Liquidation Map</h2>
          <p className="text-xs text-nexus-muted font-mono uppercase">LEVERAGE_CASUALTY_HEATMAP</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-white">$142.5M</p>
          <p className="text-[10px] text-red-500 font-mono">RECKONING_TOTAL_1H</p>
        </div>
      </div>

      <div className="flex-1 bg-nexus-dark rounded-lg border border-nexus-border relative overflow-hidden p-4 grid grid-cols-12 gap-2">
        {Array.from({ length: 144 }).map((_, i) => {
          const val = Math.random();
          return (
            <motion.div 
              key={i}
              className={`aspect-square rounded-[2px] ${val > 0.8 ? 'bg-red-500' : val > 0.5 ? 'bg-red-500/40' : 'bg-red-500/10'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 1, 0.1] }}
              transition={{ 
                duration: 2 + Math.random() * 4, 
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-nexus-surface/80 backdrop-blur-md border border-red-500/30 px-6 py-3 rounded uppercase text-[10px] font-mono tracking-[0.3em] text-red-500 font-bold animate-pulse">
            High Density Liquidation Detected
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <WarningCard label="Long Liquidations" value="$82.1M" color="text-red-400" />
        <WarningCard label="Short Liquidations" value="$60.4M" color="text-emerald-400" />
        <WarningCard label="Avg Leverage" value="52x" color="text-amber-400" />
      </div>
    </div>
  );
}

function WarningCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-4 bg-nexus-dark/50 border border-nexus-border rounded flex flex-col items-center">
      <span className="text-[9px] uppercase text-nexus-muted font-bold tracking-widest mb-1">{label}</span>
      <span className={`text-lg font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}
