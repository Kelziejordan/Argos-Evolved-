
import { Zap } from "lucide-react";
import { useNervous } from "../../nervous-system/NervousCore";

export function Header({ onShare }: { onShare: () => void }) {
  const { user, marketData, login, logout, runDiagnostics, isRunningDiagnostics } = useNervous();

  return (
    <header id="app-header" className="h-16 border-b border-nexus-border flex items-center justify-between px-8 bg-nexus-surface z-10">
      <div className="flex items-center gap-6">
        <span className="text-nexus-muted font-mono text-sm tracking-tighter">#BUILD_ID_84221</span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] border border-emerald-500/20 uppercase font-bold tracking-wider">Stability Passed</span>
        <span id="kraken-status-badge" className={`px-2 py-0.5 rounded ${marketData?.krakenConnected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]'} text-[10px] border uppercase font-bold tracking-wider flex items-center gap-1.5`}>
          <Zap className={`w-3 h-3 ${marketData?.krakenConnected ? 'fill-blue-400' : 'fill-amber-500 animate-pulse'}`} />
          {marketData?.krakenConnected ? 'Kraken Live' : 'Kraken Paper Sim'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {!user ? (
          <button 
            onClick={login}
            className="px-4 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-xs font-semibold rounded text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)] active:scale-95"
          >
            CONNECT NEURAL LINK
          </button>
        ) : (
          <button 
            onClick={logout}
            className="px-4 py-1.5 bg-nexus-border hover:bg-white/10 text-xs font-semibold rounded text-nexus-muted transition-all active:scale-95"
          >
            TERMINATE LINK
          </button>
        )}
        <button 
          onClick={onShare}
          className="px-4 py-1.5 bg-[#334155] hover:bg-[#475569] text-xs font-semibold rounded text-white transition-colors active:scale-95 text-nowrap"
        >
          Share Analysis
        </button>
        <button 
          onClick={runDiagnostics}
          disabled={isRunningDiagnostics}
          className="px-4 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-xs font-semibold rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-nowrap"
        >
          {isRunningDiagnostics ? 'Scanning...' : 'Re-Run Diagnostics'}
        </button>
      </div>
    </header>
  );
}
