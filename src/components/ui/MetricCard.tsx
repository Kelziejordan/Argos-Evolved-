
import { motion } from "motion/react";

export function MetricCard({ label, value, sub, progress }: { label: string, value: string, sub: string, progress: number }) {
  return (
    <div id={`metric-${label.toLowerCase().replace(' ', '-')}`} className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-nexus-muted uppercase tracking-tight">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <p className="text-[10px] text-nexus-muted font-mono">{sub}</p>
      </div>
      <div className="h-1 bg-nexus-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-nexus-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
        />
      </div>
    </div>
  );
}
