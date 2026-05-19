
import { TrendingUp, TrendingDown } from "lucide-react";

export function AssetRow({ label, value, delta, status, onClick }: { label: string, value: string, delta: number, status?: string, onClick?: () => void }) {
  const statusColors: any = {
    bullish: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    bearish: 'bg-red-500/20 text-red-500 border-red-500/30',
    volatile: 'bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    neutral: 'bg-zinc-500/10 text-nexus-muted border-transparent'
  };

  return (
    <div 
      id={`asset-${label.toLowerCase()}`} 
      onClick={onClick}
      className={`flex justify-between items-center group cursor-pointer hover:bg-white/5 py-1.5 px-2 rounded-md transition-all border ${status ? statusColors[status] : 'text-nexus-muted'}`}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-mono font-bold tracking-tighter">{label}</span>
        <span className="text-[8px] uppercase opacity-60 font-mono">{status || 'SYNCING'}</span>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-mono font-bold">${value}</p>
        <p className={`text-[9px] font-mono flex items-center justify-end gap-1 ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {delta >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
          {delta}%
        </p>
      </div>
    </div>
  );
}
