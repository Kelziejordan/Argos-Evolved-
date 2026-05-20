
export function SignalItem({ title, desc, variant, time, onClick }: { title: string, desc: string, variant: 'emerald' | 'amber' | 'red', time: string, onClick?: () => void, key?: any }) {
  const colors = {
    emerald: 'border-emerald-500/50 text-emerald-500',
    amber: 'border-amber-500/50 text-amber-500',
    red: 'border-red-500/50 text-red-500'
  };
  
  return (
    <div 
      id={`signal-${title.toLowerCase()}`}
      onClick={onClick}
      className={`p-3 bg-nexus-surface border-l-2 ${colors[variant]} rounded relative group hover:bg-nexus-border/20 transition-all cursor-crosshair active:scale-95`}
    >
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-bold uppercase tracking-wider">{title}</div>
        <div className="text-[9px] font-mono text-nexus-log">{time}</div>
      </div>
      <p className="text-[11px] mt-1.5 leading-relaxed text-nexus-muted font-mono">{desc}</p>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-white bg-white/10 px-1 rounded">EXEC_TRADE</div>
    </div>
  );
}
